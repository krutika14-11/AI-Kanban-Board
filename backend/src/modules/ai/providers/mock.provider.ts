import { AIProvider, GenerateOptions, EmbeddingResult } from './base.provider';
import { mockPlanGenerator } from '../mock-data';

export class MockProvider implements AIProvider {
  getModelName(): string {
    return 'mock-llm-v1';
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async generate(prompt: string, _options: GenerateOptions = {}): Promise<string> {
    await delay(800 + Math.random() * 400);
    return mockPlanGenerator(prompt);
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    await delay(50);
    // Deterministic pseudo-embedding based on text content
    const embedding = generateDeterministicEmbedding(text, 384);
    return { embedding, model: 'mock-embeddings-v1' };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateDeterministicEmbedding(text: string, dimensions: number): number[] {
  const embedding: number[] = new Array(dimensions).fill(0);
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    for (let d = 0; d < dimensions; d++) {
      embedding[d] += Math.sin((charCode * (d + 1) * 0.1)) * 0.1;
    }
  }
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  return magnitude > 0 ? embedding.map(v => v / magnitude) : embedding;
}
