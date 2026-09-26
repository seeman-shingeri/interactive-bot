import { AIProvider } from './types.js';
import { GeminiProvider } from './geminiProvider.js';
import { LocalSemanticProvider } from './localProvider.js';
import dotenv from 'dotenv';

dotenv.config();

class ProviderFactory {
  private gemini: GeminiProvider;
  private local: LocalSemanticProvider;
  private currentApiKey: string = process.env.GEMINI_API_KEY || '';
  private userSelectedProvider: 'auto' | 'gemini' | 'local' = 'auto';

  constructor() {
    this.gemini = new GeminiProvider(this.currentApiKey);
    this.local = new LocalSemanticProvider();
  }

  setApiKey(key: string) {
    this.currentApiKey = key;
    process.env.GEMINI_API_KEY = key;
    this.gemini.setApiKey(key);
  }

  getApiKey(): string {
    // Return masked key for security (never expose full key)
    if (!this.currentApiKey) return '';
    return this.currentApiKey.slice(0, 4) + '...' + this.currentApiKey.slice(-4);
  }

  hasApiKey(): boolean {
    return Boolean(this.currentApiKey && this.currentApiKey.trim().length > 10);
  }

  getProvider(): AIProvider {
    if (this.userSelectedProvider === 'local') {
      return this.local;
    }
    if (this.gemini.isReady()) {
      return this.gemini;
    }
    return this.local;
  }

  getStatus() {
    const isGeminiReady = this.gemini.isReady();
    return {
      activeProvider: isGeminiReady ? 'gemini' : 'local_semantic',
      providerName: isGeminiReady ? 'Google Gemini 1.5 Flash' : 'VISTA Local Semantic Engine',
      hasApiKey: this.hasApiKey(),
      maskedKey: this.getApiKey(),
      isOnline: true,
      supportedFeatures: {
        visualAnalysis: true,
        realtimeReactions: true,
        dialogue: true,
        tasteLearning: true,
        memoryControl: true,
      },
    };
  }
}

export const providerFactory = new ProviderFactory();
