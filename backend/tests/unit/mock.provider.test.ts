import { MockProvider } from '../../src/modules/ai/providers/mock.provider';

describe('MockProvider', () => {
  const provider = new MockProvider();

  test('isAvailable returns true', async () => {
    const available = await provider.isAvailable();
    expect(available).toBe(true);
  });

  test('generate returns valid JSON string', async () => {
    const result = await provider.generate('Build a React app');
    expect(typeof result).toBe('string');
    const parsed = JSON.parse(result);
    expect(parsed).toHaveProperty('project');
    expect(parsed).toHaveProperty('tasks');
    expect(Array.isArray(parsed.tasks)).toBe(true);
  });

  test('generateEmbedding returns numeric array', async () => {
    const result = await provider.generateEmbedding('test text');
    expect(result.embedding).toBeDefined();
    expect(Array.isArray(result.embedding)).toBe(true);
    expect(result.embedding.length).toBe(384);
    expect(result.embedding.every(v => typeof v === 'number')).toBe(true);
  });

  test('embeddings are normalized (magnitude ≈ 1)', async () => {
    const result = await provider.generateEmbedding('hello world');
    const magnitude = Math.sqrt(result.embedding.reduce((sum, v) => sum + v * v, 0));
    expect(magnitude).toBeCloseTo(1, 3);
  });

  test('different texts produce different embeddings', async () => {
    const r1 = await provider.generateEmbedding('React authentication');
    const r2 = await provider.generateEmbedding('Database design patterns');
    expect(r1.embedding).not.toEqual(r2.embedding);
  });

  test('getModelName returns string', () => {
    expect(typeof provider.getModelName()).toBe('string');
  });
});
