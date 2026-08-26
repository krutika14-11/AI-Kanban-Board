import 'express-async-errors';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../../.env') });

import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { chunkText } from './chunker';
import { vectorDb, VectorPoint } from '../rag/vector-db';
import { getAIProvider } from '../ai/ai.provider';

interface KnowledgeDocument {
  filename: string;
  title: string;
  category: string;
  content: string;
}

async function loadDocuments(knowledgeBasePath: string): Promise<KnowledgeDocument[]> {
  const files = fs.readdirSync(knowledgeBasePath).filter(f => f.endsWith('.md'));
  const documents: KnowledgeDocument[] = [];

  for (const filename of files) {
    const content = fs.readFileSync(path.join(knowledgeBasePath, filename), 'utf-8');
    const titleMatch = content.match(/^# (.+)$/m);
    const categoryMatch = content.match(/## Category: (.+)$/m);

    documents.push({
      filename,
      title: titleMatch ? titleMatch[1].trim() : filename.replace('.md', ''),
      category: categoryMatch ? categoryMatch[1].trim() : 'General',
      content,
    });
  }

  return documents;
}

async function ingestDocuments(): Promise<void> {
  console.log('[Ingest] Starting knowledge base ingestion...');

  const provider = getAIProvider();
  const knowledgeBasePath = path.join(__dirname, '../../../knowledge-base');

  // Check if knowledge base exists
  if (!fs.existsSync(knowledgeBasePath)) {
    console.error('[Ingest] Knowledge base directory not found:', knowledgeBasePath);
    process.exit(1);
  }

  // Load documents
  const documents = await loadDocuments(knowledgeBasePath);
  console.log(`[Ingest] Found ${documents.length} documents`);

  // Generate a test embedding to determine vector size
  console.log('[Ingest] Generating test embedding to determine vector dimensions...');
  const testEmbedding = await provider.generateEmbedding('test');
  const vectorSize = testEmbedding.embedding.length;
  console.log(`[Ingest] Vector dimensions: ${vectorSize}`);

  // Ensure vector DB collection exists
  await vectorDb.ensureCollection(vectorSize);

  let totalChunks = 0;
  let processedChunks = 0;

  // Process each document
  for (const doc of documents) {
    console.log(`[Ingest] Processing: ${doc.filename} (${doc.category})`);

    // Chunk the document
    const chunks = chunkText(doc.content);
    totalChunks += chunks.length;

    // Generate embeddings and create vector points
    const points: VectorPoint[] = [];

    for (const chunk of chunks) {
      try {
        const { embedding } = await provider.generateEmbedding(chunk.text);

        points.push({
          id: uuidv4(),
          vector: embedding,
          payload: {
            text: chunk.text,
            source: doc.filename,
            category: doc.category,
            title: doc.title,
            chunkIndex: chunk.index,
          },
        });

        processedChunks++;
        process.stdout.write(`\r[Ingest] Progress: ${processedChunks}/${totalChunks} chunks`);
      } catch (err) {
        console.error(`\n[Ingest] Failed to embed chunk ${chunk.index} of ${doc.filename}:`, err);
      }
    }

    // Upsert to vector DB in batches
    if (points.length > 0) {
      await vectorDb.upsertPoints(points);
    }
  }

  const count = await vectorDb.getPointCount();
  console.log(`\n[Ingest] ✓ Ingestion complete. Total vectors in collection: ${count}`);
}

ingestDocuments().catch(err => {
  console.error('[Ingest] Fatal error:', err);
  process.exit(1);
});
