import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from '../../config';

export interface VectorPoint {
  id: string;
  vector: number[];
  payload: {
    text: string;
    source: string;
    category: string;
    title: string;
    chunkIndex: number;
    metadata?: Record<string, unknown>;
  };
}

export interface SearchResult {
  id: string;
  score: number;
  payload: VectorPoint['payload'];
}

let _client: QdrantClient | null = null;

function getClient(): QdrantClient {
  if (!_client) {
    _client = new QdrantClient({ url: config.vectorDb.url, checkCompatibility: false });
  }
  return _client;
}

export const vectorDb = {
  async ensureCollection(vectorSize: number = 384): Promise<void> {
    const client = getClient();
    const collection = config.vectorDb.collection;

    try {
      const collections = await client.getCollections();
      const exists = collections.collections.some(c => c.name === collection);

      if (!exists) {
        await client.createCollection(collection, {
          vectors: {
            size: vectorSize,
            distance: 'Cosine',
          },
        });
        console.log(`[VectorDB] Created collection: ${collection}`);
      }
    } catch (err) {
      console.error('[VectorDB] Failed to ensure collection:', err);
      throw err;
    }
  },

  async upsertPoints(points: VectorPoint[]): Promise<void> {
    const client = getClient();
    await client.upsert(config.vectorDb.collection, {
      wait: true,
      points: points.map(p => ({
        id: p.id,
        vector: p.vector,
        payload: p.payload as Record<string, unknown>,
      })),
    });
  },

  async search(vector: number[], topK: number = 5, scoreThreshold: number = 0.5): Promise<SearchResult[]> {
    const client = getClient();
    const results = await client.query(config.vectorDb.collection, {
      query: vector,
      limit: topK,
      score_threshold: scoreThreshold,
      with_payload: true,
    });

    return results.points.map(r => ({
      id: String(r.id),
      score: r.score,
      payload: r.payload as VectorPoint['payload'],
    }));
  },

  async getCollectionInfo() {
    const client = getClient();
    try {
      return await client.getCollection(config.vectorDb.collection);
    } catch {
      return null;
    }
  },

  async isAvailable(): Promise<boolean> {
    try {
      const client = getClient();
      await client.getCollections();
      return true;
    } catch {
      return false;
    }
  },

  async deleteCollection(): Promise<void> {
    const client = getClient();
    await client.deleteCollection(config.vectorDb.collection);
  },

  async getPointCount(): Promise<number> {
    const client = getClient();
    try {
      const result = await client.count(config.vectorDb.collection);
      return result.count ?? 0;
    } catch {
      return 0;
    }
  },
};
