import { AIProvider } from './providers/base.provider';
import { OllamaProvider } from './providers/ollama.provider';
import { MockProvider } from './providers/mock.provider';
import { config } from '../../config';

let _provider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!_provider) {
    if (config.ai.provider === 'ollama') {
      _provider = new OllamaProvider();
    } else {
      _provider = new MockProvider();
    }
  }
  return _provider;
}

export function resetProvider(): void {
  _provider = null;
}

export type { AIProvider };
