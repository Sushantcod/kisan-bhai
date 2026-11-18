// Configuration service for AI Providers and Bring-Your-Own-Key (BYOK)

export type AIProvider = 'gemini' | 'groq' | 'expert_system';

export interface AIConfig {
  provider: AIProvider;
  geminiKey: string;
  groqKey: string;
  modelApiUrl: string; // URL for local/hosted plant-disease-research model (e.g. http://localhost:8000)
}

const STORAGE_KEY = 'kisan_ai_config_v1';

const DEFAULT_CONFIG: AIConfig = {
  provider: 'gemini',
  geminiKey: '',
  groqKey: '',
  modelApiUrl: 'http://localhost:8000',
};

export const getAIConfig = (): AIConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to parse AI config from localStorage:', e);
  }
  return DEFAULT_CONFIG;
};

export const saveAIConfig = (config: Partial<AIConfig>): AIConfig => {
  const current = getAIConfig();
  const updated: AIConfig = { ...current, ...config };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const getActiveApiKey = (config?: AIConfig): string => {
  const cfg = config || getAIConfig();
  if (cfg.provider === 'gemini') {
    return cfg.geminiKey.trim() || (process.env.API_KEY || '');
  }
  if (cfg.provider === 'groq') {
    return cfg.groqKey.trim();
  }
  return '';
};
