import axios from 'axios';
import { AIProvider, GenerateOptions, EmbeddingResult } from './base.provider';
import { config } from '../../../config';

export class OllamaProvider implements AIProvider {
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly embeddingModel: string;

  constructor() {
    this.baseUrl = config.ai.ollama.baseUrl;
    this.model = config.ai.ollama.model;
    this.embeddingModel = config.ai.ollama.embeddingModel;
  }

  getModelName(): string {
    return this.model;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 3000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async generate(prompt: string, options: GenerateOptions = {}): Promise<string> {
    const systemPrompt = options.systemPrompt ||
      'You are an expert software project manager and technical lead. You generate structured JSON responses.';

    const response = await axios.post(
      `${this.baseUrl}/api/chat`,
      {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        stream: false,
        options: {
          temperature: options.temperature ?? 0.3,
          num_predict: options.maxTokens ?? 4096,
        },
      },
      { timeout: 120000 }
    );

    return response.data.message?.content ?? '';
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const response = await axios.post(
      `${this.baseUrl}/api/embed`,
      {
        model: this.embeddingModel,
        input: text,
      },
      { timeout: 30000 }
    );

    const embedding = response.data.embeddings?.[0] ?? response.data.embedding ?? [];
    return { embedding, model: this.embeddingModel };
  }
}
