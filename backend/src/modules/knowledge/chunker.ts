import { config } from '../../config';

export interface TextChunk {
  text: string;
  index: number;
}

export function chunkText(text: string, chunkSize?: number, overlap?: number): TextChunk[] {
  const size = chunkSize ?? config.rag.chunkSize;
  const overlapSize = overlap ?? config.rag.chunkOverlap;

  // Split on paragraph boundaries first
  const paragraphs = text.split(/\n\n+/);
  const chunks: TextChunk[] = [];
  let current = '';
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    if ((current + '\n\n' + trimmed).length <= size) {
      current = current ? current + '\n\n' + trimmed : trimmed;
    } else {
      if (current) {
        chunks.push({ text: current.trim(), index: chunkIndex++ });
        // Add overlap from end of current chunk
        const words = current.split(' ');
        const overlapWords = words.slice(-Math.floor(overlapSize / 5));
        current = overlapWords.join(' ') + '\n\n' + trimmed;
      } else {
        // Paragraph is too long, split by sentences
        const sentences = trimmed.split(/(?<=[.!?])\s+/);
        for (const sentence of sentences) {
          if ((current + ' ' + sentence).length <= size) {
            current = current ? current + ' ' + sentence : sentence;
          } else {
            if (current) {
              chunks.push({ text: current.trim(), index: chunkIndex++ });
              current = sentence;
            } else {
              chunks.push({ text: sentence.slice(0, size), index: chunkIndex++ });
              current = '';
            }
          }
        }
      }
    }
  }

  if (current.trim()) {
    chunks.push({ text: current.trim(), index: chunkIndex });
  }

  return chunks;
}
