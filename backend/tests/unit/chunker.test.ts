import { chunkText } from '../../src/modules/knowledge/chunker';

describe('chunkText', () => {
  test('splits long text into chunks', () => {
    const longText = Array(10).fill('This is a paragraph with some content. ').join('\n\n');
    const chunks = chunkText(longText, 100, 20);
    expect(chunks.length).toBeGreaterThan(1);
  });

  test('preserves short text in single chunk', () => {
    const shortText = 'Short paragraph.';
    const chunks = chunkText(shortText, 500, 50);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].text).toBe(shortText);
  });

  test('assigns sequential indices', () => {
    const text = Array(5).fill('Paragraph content here.').join('\n\n');
    const chunks = chunkText(text, 50, 10);
    chunks.forEach((chunk, i) => {
      expect(chunk.index).toBe(i);
    });
  });

  test('handles empty text', () => {
    const chunks = chunkText('', 500, 50);
    expect(chunks).toHaveLength(0);
  });

  test('handles text with only whitespace', () => {
    const chunks = chunkText('   \n\n   ', 500, 50);
    expect(chunks).toHaveLength(0);
  });
});
