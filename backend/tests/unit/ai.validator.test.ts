import { validateAIPlan } from '../../src/modules/ai/ai.validator';

describe('validateAIPlan', () => {
  const validPlan = {
    project: {
      name: 'Test Project',
      summary: 'A test project',
      estimatedDurationDays: 30,
    },
    tasks: [
      {
        title: 'Setup project',
        description: 'Initialize the project',
        priority: 'HIGH',
        status: 'TODO',
        estimatedHours: 4,
        suggestedDeadline: '2026-09-01',
        category: 'Setup',
        tags: ['setup'],
        dependencies: [],
        executionOrder: 1,
        subtasks: [
          { title: 'Initialize repo', estimatedHours: 1 },
        ],
      },
    ],
  };

  test('validates correct JSON structure', () => {
    const result = validateAIPlan(JSON.stringify(validPlan));
    expect(result.valid).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.tasks).toHaveLength(1);
  });

  test('extracts JSON from markdown code block', () => {
    const wrapped = '```json\n' + JSON.stringify(validPlan) + '\n```';
    const result = validateAIPlan(wrapped);
    expect(result.valid).toBe(true);
  });

  test('extracts JSON embedded in text', () => {
    const withText = 'Here is the plan:\n' + JSON.stringify(validPlan) + '\nThat is all.';
    const result = validateAIPlan(withText);
    expect(result.valid).toBe(true);
  });

  test('repairs invalid priority values', () => {
    const badPriority = {
      ...validPlan,
      tasks: [{ ...validPlan.tasks[0], priority: 'NORMAL' }],
    };
    const result = validateAIPlan(JSON.stringify(badPriority));
    expect(result.valid).toBe(true);
    expect(result.repaired).toBe(true);
    expect(result.data!.tasks[0].priority).toBe('MEDIUM');
  });

  test('repairs invalid status values', () => {
    const badStatus = {
      ...validPlan,
      tasks: [{ ...validPlan.tasks[0], status: 'IN-PROGRESS' }],
    };
    const result = validateAIPlan(JSON.stringify(badStatus));
    expect(result.valid).toBe(true);
    expect(result.data!.tasks[0].status).toBe('IN_PROGRESS');
  });

  test('returns error for completely invalid JSON', () => {
    const result = validateAIPlan('not json at all');
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });

  test('returns error for missing required fields', () => {
    const missing = { tasks: [] };
    const result = validateAIPlan(JSON.stringify(missing));
    expect(result.valid).toBe(false);
  });

  test('returns error for empty tasks array', () => {
    const emptyTasks = { ...validPlan, tasks: [] };
    const result = validateAIPlan(JSON.stringify(emptyTasks));
    expect(result.valid).toBe(false);
  });

  test('accepts valid priority values', () => {
    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    for (const priority of priorities) {
      const plan = { ...validPlan, tasks: [{ ...validPlan.tasks[0], priority }] };
      const result = validateAIPlan(JSON.stringify(plan));
      expect(result.valid).toBe(true);
    }
  });
});
