import { getAIProvider } from './ai.provider';
import { ragService } from '../rag/rag.service';
import { validateAIPlan } from './ai.validator';
import { AIPlan } from './ai.schemas';
import { taskRepository } from '../tasks/task.repository';
import { projectRepository } from '../projects/project.repository';
import prisma from '../../database/client';
import { AppError } from '../../middleware/errorHandler';
import { config } from '../../config';

const MAX_RETRIES = 3;
const PROMPT_VERSION = '2.0';

export interface GeneratePlanInput {
  projectId: string;
  goal: string;
  deadline?: Date;
  teamSize?: number;
  experienceLevel?: string;
  technologyStack?: string[];
}

export interface GeneratePlanResult {
  plan: AIPlan;
  executionId: string;
  retrievedDocs: Array<{ title: string; category: string; score: number }>;
  modelUsed: string;
  executionTimeMs: number;
  retryCount: number;
  repaired: boolean;
}

export const aiService = {
  async generatePlan(input: GeneratePlanInput): Promise<GeneratePlanResult> {
    const provider = getAIProvider();
    const startTime = Date.now();

    // Step 1: Retrieve relevant knowledge via RAG
    const ragContext = await ragService.buildContext(input.goal);

    // Step 2: Build structured prompt
    const prompt = buildPlanPrompt(input, ragContext.contextText);

    // Step 3: Generate with retry loop
    let lastError = '';
    let retryCount = 0;
    let plan: AIPlan | null = null;
    let repaired = false;
    let rawResponse = '';

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      retryCount = attempt;
      try {
        rawResponse = await provider.generate(prompt, {
          temperature: attempt === 0 ? 0.3 : 0.5,
          maxTokens: 4096,
          systemPrompt: SYSTEM_PROMPT,
        });

        const validation = validateAIPlan(rawResponse);

        if (validation.valid && validation.data) {
          plan = applyBusinessRules(validation.data, input);
          repaired = validation.repaired ?? false;
          break;
        }

        lastError = validation.errors?.join(', ') ?? 'Unknown validation error';
        console.warn(`[AI] Attempt ${attempt + 1} validation failed:`, lastError);

        if (attempt < MAX_RETRIES - 1) {
          await delay(1000 * (attempt + 1));
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Generation failed';
        console.error(`[AI] Attempt ${attempt + 1} failed:`, err);
      }
    }

    const executionTimeMs = Date.now() - startTime;

    // Step 4: Store execution record
    const execution = await prisma.aIExecution.create({
      data: {
        projectId: input.projectId,
        input: input.goal,
        retrievedDocs: JSON.stringify(ragContext.retrievedDocuments),
        model: provider.getModelName(),
        promptVersion: PROMPT_VERSION,
        prompt: prompt.slice(0, 5000),
        response: rawResponse.slice(0, 5000),
        // This value is displayed again on the project detail page. Truncating it
        // produces invalid JSON and causes the frontend to crash when reopening a
        // project with a larger AI plan.
        parsedJson: plan ? JSON.stringify(plan) : null,
        validationStatus: plan ? 'success' : 'failed',
        validationErrors: JSON.stringify(plan ? [] : [lastError]),
        retryCount,
        executionTimeMs,
      },
    });

    if (!plan) {
      if (config.ai.provider === 'ollama') {
        throw new AppError(503, 'AI provider is unavailable. Start Ollama or set AI_PROVIDER=mock, then try again.');
      }
      throw new AppError(422, `AI failed to generate a valid plan after ${MAX_RETRIES} attempts. Last error: ${lastError}`);
    }

    // Step 5: Persist tasks to database
    await persistPlan(input.projectId, plan);

    // Step 6: Update project summary
    await projectRepository.update(input.projectId, {
      summary: plan.project.summary,
      estimatedDurationDays: plan.project.estimatedDurationDays,
    });

    return {
      plan,
      executionId: execution.id,
      retrievedDocs: ragContext.retrievedDocuments.map(d => ({
        title: d.title,
        category: d.category,
        score: d.score,
      })),
      modelUsed: provider.getModelName(),
      executionTimeMs,
      retryCount,
      repaired,
    };
  },

  async getExecutionHistory(projectId: string) {
    return prisma.aIExecution.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getExecution(id: string) {
    const exec = await prisma.aIExecution.findUnique({ where: { id } });
    if (!exec) throw new AppError(404, `AI execution ${id} not found`);
    return exec;
  },

  async checkProviderStatus() {
    const provider = getAIProvider();
    const [available, ragAvailable] = await Promise.all([
      provider.isAvailable(),
      ragService.isAvailable(),
    ]);
    return {
      provider: config.ai.provider,
      model: provider.getModelName(),
      llmAvailable: available,
      vectorDbAvailable: ragAvailable,
    };
  },

  async ragSearch(query: string, topK?: number) {
    return ragService.search(query, topK);
  },
};

function buildPlanPrompt(input: GeneratePlanInput, ragContext: string): string {
  const deadline = input.deadline ? input.deadline.toISOString().split('T')[0] : 'Not specified';
  const techStack = (input.technologyStack ?? []).join(', ') || 'Not specified';

  return `You are an expert software project manager. Based on the following project goal and retrieved domain knowledge, generate a comprehensive project plan as a JSON object.

PROJECT GOAL:
${input.goal}

PROJECT DETAILS:
- Deadline: ${deadline}
- Team Size: ${input.teamSize ?? 1} developer(s)
- Experience Level: ${input.experienceLevel ?? 'intermediate'}
- Technology Stack: ${techStack}

RETRIEVED DOMAIN KNOWLEDGE:
${ragContext}

INSTRUCTIONS:
1. Analyze the project goal carefully
2. Use the retrieved knowledge to inform your task breakdown
3. Generate realistic tasks with proper estimates
4. Consider dependencies between tasks
5. Assign appropriate priorities based on project needs
6. Suggest reasonable deadlines respecting the project deadline

REQUIRED JSON FORMAT:
{
  "project": {
    "name": "string (short project name)",
    "summary": "string (2-3 sentence project description)",
    "estimatedDurationDays": number
  },
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "priority": "LOW|MEDIUM|HIGH|CRITICAL",
      "status": "TODO",
      "estimatedHours": number,
      "suggestedDeadline": "YYYY-MM-DD",
      "category": "string",
      "tags": ["string"],
      "dependencies": ["task title strings"],
      "executionOrder": number,
      "subtasks": [
        { "title": "string", "estimatedHours": number }
      ]
    }
  ]
}

Return ONLY valid JSON. No markdown, no explanations, no code blocks.`;
}

function applyBusinessRules(plan: AIPlan, input: GeneratePlanInput): AIPlan {
  const today = new Date();
  const projectDeadline = input.deadline ?? new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Validate and clamp deadlines
  const tasks = plan.tasks.map((task, index) => {
    let deadline = task.suggestedDeadline;

    if (deadline) {
      const deadlineDate = new Date(deadline);
      // Clamp to project deadline
      if (deadlineDate > projectDeadline) {
        deadline = projectDeadline.toISOString().split('T')[0];
      }
      // Don't allow deadlines in the past
      if (deadlineDate < today) {
        const daysFromNow = Math.max(1, index + 1);
        const newDeadline = new Date(today);
        newDeadline.setDate(newDeadline.getDate() + daysFromNow);
        deadline = newDeadline.toISOString().split('T')[0];
      }
    }

    return { ...task, suggestedDeadline: deadline, executionOrder: task.executionOrder ?? index + 1 };
  });

  // Detect circular dependencies (simple check)
  validateDependencies(tasks);

  return { ...plan, tasks };
}

function validateDependencies(tasks: AIPlan['tasks']): void {
  const taskTitles = new Set(tasks.map(t => t.title));
  const visited = new Set<string>();
  const stack = new Set<string>();

  function hasCycle(title: string): boolean {
    if (stack.has(title)) return true;
    if (visited.has(title)) return false;

    visited.add(title);
    stack.add(title);

    const task = tasks.find(t => t.title === title);
    if (task) {
      for (const dep of task.dependencies) {
        if (taskTitles.has(dep) && hasCycle(dep)) return true;
      }
    }

    stack.delete(title);
    return false;
  }

  // Remove circular dependencies
  tasks.forEach(task => {
    if (hasCycle(task.title)) {
      console.warn(`[AI] Circular dependency detected in task: ${task.title}. Removing dependencies.`);
      task.dependencies = [];
    }
    visited.clear();
    stack.clear();
  });
}

async function persistPlan(projectId: string, plan: AIPlan): Promise<void> {
  // Remove existing AI-generated tasks first? No — we append. Users may have manual tasks.
  // Actually, for a "generate plan" flow, we replace with the new AI plan.
  // Delete existing tasks from this project that were AI-generated (all tasks in this case)
  await prisma.task.deleteMany({ where: { projectId } });

  await taskRepository.bulkCreate(
    plan.tasks.map((task, index) => ({
      projectId,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: 'TODO',
      estimatedHours: task.estimatedHours,
      suggestedDeadline: task.suggestedDeadline ? new Date(task.suggestedDeadline) : undefined,
      category: task.category,
      tags: task.tags,
      dependencies: task.dependencies,
      executionOrder: task.executionOrder ?? index + 1,
      position: index,
      subtasks: task.subtasks,
    }))
  );
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const SYSTEM_PROMPT = `You are an expert software project manager and technical lead with 15+ years of experience.
You break down complex software projects into clear, actionable tasks.
You always respond with valid JSON only — no prose, no markdown, no explanations.
Your task estimates are realistic and based on industry standards.
You consider team size, experience level, and technology stack when creating plans.`;
