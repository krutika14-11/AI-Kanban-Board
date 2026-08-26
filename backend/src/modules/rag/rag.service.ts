import { vectorDb, SearchResult } from './vector-db';
import { getAIProvider } from '../ai/ai.provider';
import { config } from '../../config';

export interface RAGContext {
  query: string;
  retrievedDocuments: Array<{
    title: string;
    text: string;
    source: string;
    category: string;
    score: number;
  }>;
  contextText: string;
}

export const ragService = {
  async search(query: string, topK?: number): Promise<SearchResult[]> {
    const k = topK ?? config.rag.topK;
    const provider = getAIProvider();

    try {
      const { embedding } = await provider.generateEmbedding(query);
      const results = await vectorDb.search(embedding, k, config.rag.similarityThreshold);
      return results;
    } catch (err) {
      console.error('[RAG] Search failed:', err);
      return [];
    }
  },

  async buildContext(query: string): Promise<RAGContext> {
    const results = await this.search(query);

    const retrievedDocuments = results.map(r => ({
      title: r.payload.title,
      text: r.payload.text,
      source: r.payload.source,
      category: r.payload.category,
      score: Math.round(r.score * 1000) / 1000,
    }));

    const contextText = retrievedDocuments.length > 0
      ? retrievedDocuments
          .map(doc => `[${doc.category}] ${doc.title}:\n${doc.text}`)
          .join('\n\n---\n\n')
      : 'No specific domain knowledge retrieved. Use general software engineering best practices.';

    return { query, retrievedDocuments, contextText };
  },

  async isAvailable(): Promise<boolean> {
    return vectorDb.isAvailable();
  },

  async getStats() {
    const [available, count] = await Promise.all([
      vectorDb.isAvailable(),
      vectorDb.getPointCount().catch(() => 0),
    ]);
    return { available, pointCount: count };
  },
};
