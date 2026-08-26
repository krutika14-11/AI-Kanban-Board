export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface EmbeddingResult {
  embedding: number[];
  model: string;
}

export interface AIProvider {
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
  generateEmbedding(text: string): Promise<EmbeddingResult>;
  isAvailable(): Promise<boolean>;
  getModelName(): string;
}
