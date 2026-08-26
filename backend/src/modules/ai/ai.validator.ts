import { AIPlanSchema, AIPlan } from './ai.schemas';
import { ZodError } from 'zod';

export interface ValidationResult {
  valid: boolean;
  data?: AIPlan;
  errors?: string[];
  repaired?: boolean;
}

export function validateAIPlan(raw: string): ValidationResult {
  // Step 1: Extract JSON from response (LLMs often wrap it in markdown)
  let jsonStr = extractJson(raw);

  // Step 2: Try direct parse
  try {
    const parsed = JSON.parse(jsonStr);
    const result = AIPlanSchema.safeParse(parsed);

    if (result.success) {
      return { valid: true, data: result.data };
    }

    // Step 3: Try to repair common issues
    const repaired = repairJson(parsed, result.error);
    const repairedResult = AIPlanSchema.safeParse(repaired);

    if (repairedResult.success) {
      return { valid: true, data: repairedResult.data, repaired: true };
    }

    return {
      valid: false,
      errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
    };
  } catch (e) {
    return {
      valid: false,
      errors: [`JSON parse error: ${e instanceof Error ? e.message : 'Unknown error'}`],
    };
  }
}

function extractJson(text: string): string {
  // Remove markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Try to find the start of a JSON object
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');

  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    return text.slice(jsonStart, jsonEnd + 1);
  }

  return text.trim();
}

function repairJson(parsed: unknown, _error: ZodError): unknown {
  if (!parsed || typeof parsed !== 'object') return parsed;

  const obj = parsed as Record<string, unknown>;

  // Repair: normalize priority values
  if (obj.tasks && Array.isArray(obj.tasks)) {
    obj.tasks = obj.tasks.map((task: unknown) => {
      if (!task || typeof task !== 'object') return task;
      const t = task as Record<string, unknown>;

      // Normalize priority
      if (typeof t.priority === 'string') {
        t.priority = normalizePriority(t.priority);
      }

      // Normalize status
      if (typeof t.status === 'string') {
        t.status = normalizeStatus(t.status);
      }

      // Ensure arrays
      if (!Array.isArray(t.tags)) t.tags = [];
      if (!Array.isArray(t.dependencies)) t.dependencies = [];
      if (!Array.isArray(t.subtasks)) t.subtasks = [];

      // Ensure estimatedHours is a number
      if (typeof t.estimatedHours === 'string') {
        const parsed = parseFloat(t.estimatedHours);
        t.estimatedHours = isNaN(parsed) ? undefined : parsed;
      }

      return t;
    });
  }

  // Repair: ensure project object exists
  if (!obj.project || typeof obj.project !== 'object') {
    obj.project = {
      name: 'Software Project',
      summary: 'AI-generated project plan',
      estimatedDurationDays: 30,
    };
  }

  return obj;
}

function normalizePriority(value: string): string {
  const normalized = value.toUpperCase().trim();
  const map: Record<string, string> = {
    'CRITICAL': 'CRITICAL',
    'HIGH': 'HIGH',
    'MEDIUM': 'MEDIUM',
    'NORMAL': 'MEDIUM',
    'LOW': 'LOW',
    'MINIMAL': 'LOW',
  };
  return map[normalized] ?? 'MEDIUM';
}

function normalizeStatus(value: string): string {
  const normalized = value.toUpperCase().replace(/[_\s-]+/g, '_').trim();
  const map: Record<string, string> = {
    'BACKLOG': 'BACKLOG',
    'TODO': 'TODO',
    'TO_DO': 'TODO',
    'IN_PROGRESS': 'IN_PROGRESS',
    'IN-PROGRESS': 'IN_PROGRESS',
    'INPROGRESS': 'IN_PROGRESS',
    'IN_REVIEW': 'IN_REVIEW',
    'IN-REVIEW': 'IN_REVIEW',
    'REVIEW': 'IN_REVIEW',
    'DONE': 'DONE',
    'COMPLETE': 'DONE',
    'COMPLETED': 'DONE',
  };
  return map[normalized] ?? 'TODO';
}
