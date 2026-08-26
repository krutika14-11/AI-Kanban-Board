import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  ai: {
    provider: (process.env.AI_PROVIDER || 'mock') as 'ollama' | 'mock',
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'llama3.2',
      embeddingModel: process.env.EMBEDDING_MODEL || 'nomic-embed-text',
    },
  },

  vectorDb: {
    url: process.env.VECTOR_DB_URL || 'http://localhost:6333',
    collection: process.env.VECTOR_COLLECTION || 'kanban_knowledge',
  },

  rag: {
    topK: parseInt(process.env.RAG_TOP_K || '5', 10),
    similarityThreshold: parseFloat(process.env.RAG_SIMILARITY_THRESHOLD || '0.6'),
    chunkSize: parseInt(process.env.CHUNK_SIZE || '500', 10),
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '50', 10),
  },

  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
};

export type Config = typeof config;
