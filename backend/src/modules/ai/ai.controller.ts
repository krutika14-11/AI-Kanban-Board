import { Request, Response } from 'express';
import { aiService } from './ai.service';
import { z } from 'zod';

const generatePlanSchema = z.object({
  projectId: z.string().min(1),
  goal: z.string().min(10).max(2000),
  deadline: z.string().datetime().optional(),
  teamSize: z.number().int().min(1).max(100).optional(),
  experienceLevel: z.enum(['junior', 'intermediate', 'senior', 'mixed']).optional(),
  technologyStack: z.array(z.string()).optional(),
});

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  projectId: z.string().optional(),
  context: z.string().optional(),
});

export const aiController = {
  async generatePlan(req: Request, res: Response) {
    const input = generatePlanSchema.parse(req.body);
    const result = await aiService.generatePlan({
      ...input,
      deadline: input.deadline ? new Date(input.deadline) : undefined,
    });
    res.json({ success: true, data: result });
  },

  async getStatus(req: Request, res: Response) {
    const status = await aiService.checkProviderStatus();
    res.json({ success: true, data: status });
  },

  async getExecutionHistory(req: Request, res: Response) {
    const history = await aiService.getExecutionHistory(req.params.projectId);
    res.json({ success: true, data: history });
  },

  async getExecution(req: Request, res: Response) {
    const exec = await aiService.getExecution(req.params.id);
    res.json({ success: true, data: exec });
  },

  async ragSearch(req: Request, res: Response) {
    const { query, topK } = z.object({
      query: z.string().min(1).max(500),
      topK: z.number().int().min(1).max(20).optional(),
    }).parse(req.body);

    const results = await aiService.ragSearch(query, topK);
    res.json({ success: true, data: results });
  },

  async chat(req: Request, res: Response) {
    const { message, context } = chatSchema.parse(req.body);

    // Simple AI chat using RAG context
    const { ragService } = await import('../rag/rag.service');
    const { getAIProvider } = await import('./ai.provider');

    const ragCtx = await ragService.buildContext(message);
    const provider = getAIProvider();

    const prompt = `You are a helpful project management assistant.

RELEVANT KNOWLEDGE:
${ragCtx.contextText}

USER QUESTION:
${message}

${context ? `PROJECT CONTEXT:\n${context}\n` : ''}

Provide a helpful, concise response about project management, task planning, or software development.`;

    const response = await provider.generate(prompt, {
      temperature: 0.7,
      maxTokens: 1024,
      systemPrompt: 'You are a helpful project management assistant. Keep responses concise and actionable.',
    });

    res.json({
      success: true,
      data: {
        response,
        retrievedDocs: ragCtx.retrievedDocuments.map(d => ({
          title: d.title,
          category: d.category,
          score: d.score,
        })),
      },
    });
  },
};
