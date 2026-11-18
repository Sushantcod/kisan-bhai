// Configuration service for Groq Cloud API and Local Research Model

export interface AIConfig {
  groqKey: string;
  modelApiUrl: string; // e.g. http://localhost:8000 for plant-disease-research model
}

const STORAGE_KEY = 'kisan_ai_config_v2';

const DEFAULT_CONFIG: AIConfig = {
  groqKey: '',
  modelApiUrl: 'http://localhost:8000',
};

export const getAIConfig = (): AIConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    }
    // Also check if v1 had a groq key saved
    const v1 = localStorage.getItem('kisan_ai_config_v1');
    if (v1) {
      const parsed = JSON.parse(v1);
      if (parsed.groqKey) {
        return { ...DEFAULT_CONFIG, groqKey: parsed.groqKey };
      }
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

export const hasGroqKey = (): boolean => {
  return !!getAIConfig().groqKey.trim();
};
