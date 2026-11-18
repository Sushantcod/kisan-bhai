import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ChatMessage, FarmProfile, FertilizerAdvice } from "../types";
import { getAIConfig } from "./aiConfig";
import { queryExpertSystem, PLANT_DISEASE_KNOWLEDGE } from "./expertSystem";

const CACHE_PREFIX = 'ruralassist_cache_v2_';
const WEATHER_CACHE_TIME = 15 * 60 * 1000; // 15 mins
const ALERTS_CACHE_TIME = 30 * 60 * 1000; // 30 mins

export class GeminiService {
  private getAI() {
    const config = getAIConfig();
    const apiKey = config.geminiKey.trim() || (process.env.API_KEY || '');
    return new GoogleGenAI({ apiKey });
  }

  private getCached<T>(key: string): T | null {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;
    const { data, timestamp, expiry } = JSON.parse(cached);
    if (Date.now() - timestamp > expiry) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data;
  }

  private setCache(key: string, data: any, expiry: number) {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
      data,
      timestamp: Date.now(),
      expiry
    }));
  }

  private getLanguageContext(lang: string) {
    const maps: Record<string, string> = {
      'hi': "Hindi (हिन्दी)",
      'pa': "Punjabi (ਪੰਜਾਬੀ)",
      'mr': "Marathi (मराठी)",
      'en': "English"
    };
    return `The user's preferred language is ${maps[lang] || 'English'}. Please respond in that language.`;
  }

  private extractJSON(text: string | undefined): any {
    const str = text || '{}';
    
    // Try to extract from markdown code blocks first
    const match = str.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch (e) {
        console.error("Failed to parse extracted JSON from markdown:", match[1]);
      }
    }

    // Try to find the first { and last } if it's an object
    const firstBrace = str.indexOf('{');
    const lastBrace = str.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(str.substring(firstBrace, lastBrace + 1));
      } catch (e) {}
    }
    
    // Try to find the first [ and last ] if it's an array
    const firstBracket = str.indexOf('[');
    const lastBracket = str.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(str.substring(firstBracket, lastBracket + 1));
      } catch (e) {}
    }

    try {
      return JSON.parse(str.trim());
    } catch (e) {
      console.error("Failed to parse JSON completely:", str);
      return {};
    }
  }

  // Check if local plant-disease-research model server is running (http://localhost:8000)
  async queryLocalModel(imageBase64: string): Promise<any | null> {
    const config = getAIConfig();
    const endpoint = (config.modelApiUrl || 'http://localhost:8000').replace(/\/$/, '') + '/predict';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s quick timeout

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.success) return data;
      }
    } catch (err) {
      // Local model server is offline or unreachable; fall back gracefully
    }
    return null;
  }

  // Groq Cloud API Chat Fallback
  async chatGroq(history: ChatMessage[], message: string, lang: string = 'en'): Promise<string> {
    const config = getAIConfig();
    const key = config.groqKey.trim();
    if (!key) throw new Error("No Groq API Key provided");

    const messages = [
      {
        role: "system",
        content: `You are Kisan-Bhai, the friendly expert AI Farmer advisor for rural farmers in India. ${this.getLanguageContext(lang)} 
Provide actionable agronomic solutions, pest and disease remedies, fertilizer dosages, and seasonal planting advice.`
      },
      ...history.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      })),
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No response received from Groq.";
  }

  async generateSpeech(text: string, lang: string = 'en') {
    try {
      const ai = this.getAI();
      const voiceName = lang === 'hi' || lang === 'pa' || lang === 'mr' ? 'Kore' : 'Puck';

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (err) {
      console.warn("TTS generation unavailable:", err);
      return null;
    }
  }

  async chat(history: ChatMessage[], message: string, imageBase64?: string, lang: 'en' | 'hi' | 'pa' | 'mr' = 'en'): Promise<string> {
    const config = getAIConfig();

    // 1. If an image is provided, first test if the local plant-disease-research model is running!
    let localModelDiagnosis: string | null = null;
    if (imageBase64) {
      const localResult = await this.queryLocalModel(imageBase64);
      if (localResult && localResult.disease) {
        const rawClass = localResult.raw_class;
        const expertInfo = PLANT_DISEASE_KNOWLEDGE[rawClass];
        
        localModelDiagnosis = `🌿 **Custom Research Model Diagnosis (MobileNetV2):**\n` +
          `• **Crop:** ${localResult.crop}\n` +
          `• **Detected Condition:** ${localResult.disease}\n` +
          `• **Model Confidence:** ${localResult.confidence}%\n\n`;

        if (expertInfo) {
          localModelDiagnosis += `🔍 **Identified Symptoms:** ${expertInfo.symptoms}\n\n` +
            `🌱 **Recommended Organic Remedy:**\n${expertInfo.organicSteps}\n\n` +
            `🧪 **Chemical Treatment & Dosage:**\n${expertInfo.chemicalSteps}\n\n` +
            `🛡️ **Prevention:** ${expertInfo.prevention}\n\n` +
            `📞 *Kisan Call Center Toll-Free: 1800-180-1551*`;
        }
      }
    }

    // If local model diagnosed the image and user requested Offline/Expert or has no key, return diagnosis directly!
    if (localModelDiagnosis && (config.provider === 'expert_system' || !config.geminiKey.trim() && !config.groqKey.trim() && !process.env.API_KEY)) {
      return localModelDiagnosis;
    }

    // 2. Offline Expert System Provider
    if (config.provider === 'expert_system') {
      const expertResult = queryExpertSystem(message, undefined, lang);
      return (localModelDiagnosis ? localModelDiagnosis + "\n\n---\n\n" : "") + expertResult.content;
    }

    // 3. Groq Provider
    if (config.provider === 'groq' && config.groqKey.trim()) {
      try {
        const groqMsg = localModelDiagnosis 
          ? `[Image analysis from local research model: ${localModelDiagnosis}]\n\nUser Question: ${message}`
          : message;
        return await this.chatGroq(history, groqMsg, lang);
      } catch (err) {
        console.warn("Groq request failed, falling back to Expert System:", err);
        const expertResult = queryExpertSystem(message, undefined, lang);
        return `⚠️ *Groq API quota/network issue. Sourced from Offline Expert System:*\n\n` + 
          (localModelDiagnosis ? localModelDiagnosis + "\n\n" : "") + expertResult.content;
      }
    }

    // 4. Default: Google Gemini Provider
    try {
      const ai = this.getAI();
      const contents: any[] = history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const currentParts: any[] = [];
      const promptText = localModelDiagnosis
        ? `[Trained MobileNetV2 Model diagnosis: ${localModelDiagnosis}]\n\nUser Question: ${message || "Provide treatment plan for this plant."}`
        : message;

      if (promptText.trim()) currentParts.push({ text: promptText });
      if (imageBase64) {
        currentParts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64.split(',')[1] || imageBase64
          }
        });
      }

      contents.push({ role: 'user', parts: currentParts });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: `You are Kisan-Bhai, the friendly AI Farmer advisor. ${this.getLanguageContext(lang)} 
Help with crop diseases, irrigation, pest control, and regional farming schedules. Provide practical dosages and organic alternatives.`,
        }
      });
      return response.text || "I'm sorry, I'm resting my voice right now.";
    } catch (error) {
      console.warn("Gemini API call failed, activating Offline Expert System fallback:", error);
      const expertResult = queryExpertSystem(message, undefined, lang);
      return `🛡️ **Offline Expert System (Backup Mode Active):**\n\n` +
        (localModelDiagnosis ? localModelDiagnosis + "\n\n---\n\n" : "") +
        expertResult.content;
    }
  }

  async analyzeDisease(imageBase64: string, lang: string = 'en') {
    // 1. Try local trained model first
    const localResult = await this.queryLocalModel(imageBase64);
    if (localResult && localResult.disease) {
      const rawClass = localResult.raw_class;
      const expert = PLANT_DISEASE_KNOWLEDGE[rawClass];
      return {
        diseaseName: `${localResult.crop} - ${localResult.disease} (Confidence: ${localResult.confidence}%)`,
        severity: expert?.severity || "Medium",
        organicSteps: expert?.organicSteps || "Apply neem oil (1500 ppm) @ 3-5 ml/L water and remove diseased foliage.",
        chemicalSteps: expert?.chemicalSteps || "Consult your local Krishi Vigyan Kendra for approved fungicides.",
        source: "plant-disease-research (MobileNetV2)"
      };
    }

    // 2. Try Gemini Vision
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] || imageBase64 } },
            { text: `Analyze crop disease in ${lang}.` }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diseaseName: { type: Type.STRING },
              severity: { type: Type.STRING },
              organicSteps: { type: Type.STRING },
              chemicalSteps: { type: Type.STRING }
            },
            required: ["diseaseName", "severity"]
          }
        }
      });
      return this.extractJSON(response.text);
    } catch (e) {
      // 3. Fallback to Expert System general recommendation
      return {
        diseaseName: "Foliar Plant Leaf Condition",
        severity: "Medium",
        organicSteps: "Spray 5 ml Neem Oil (1500 ppm) + 1 ml detergent per liter of water. Remove and bury severely infected lower leaves.",
        chemicalSteps: "Apply broad-spectrum Mancozeb 75% WP @ 2.5 g/L or Copper Oxychloride 50% WP @ 2.5 g/L water.",
        source: "Kisan-Bhai Expert System (Fallback)"
      };
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `What is the city and state/province for the coordinates ${lat}, ${lng}? Respond ONLY with the location name in the format "City, State, Country". Do not include any other text.`,
      });
      return response.text?.trim() || 'Punjab, India';
    } catch (e) {
      return 'Punjab, India';
    }
  }

  async getRealTimeWeather(location: string, lang: string = 'en') {
    const cacheKey = `weather_${location}_${lang}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Get the current weather and 5-day forecast for ${location} in ${lang}. Respond strictly in JSON format with this structure: { "current": { "temp": number, "humidity": number, "condition": string, "wind": number, "uv": string }, "forecast": [ { "day": string, "high": number, "low": number, "condition": string } ] }`,
      });
      const data = this.extractJSON(response.text);
      this.setCache(cacheKey, data, WEATHER_CACHE_TIME);
      return data;
    } catch (e) {
      return {
        current: { temp: 28, humidity: 65, condition: "Partly Cloudy", wind: 12, uv: "Moderate" },
        forecast: [
          { day: "Today", high: 30, low: 22, condition: "Partly Cloudy" },
          { day: "Tomorrow", high: 29, low: 21, condition: "Light Rain" },
          { day: "Day 3", high: 31, low: 22, condition: "Clear Skies" },
          { day: "Day 4", high: 32, low: 23, condition: "Sunny" },
          { day: "Day 5", high: 29, low: 20, condition: "Scattered Clouds" }
        ]
      };
    }
  }

  async getProactiveAlerts(profile: FarmProfile) {
    const cacheKey = `alerts_${profile.location}_${profile.language}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate 2 proactive agricultural alerts for ${profile.location} in ${profile.language}. Respond strictly in JSON format with this structure: { "alerts": [ { "title": string, "type": string, "description": string, "urgency": string } ] }`,
      });
      const parsed = this.extractJSON(response.text);
      const data = parsed.alerts ? parsed.alerts : (Array.isArray(parsed) ? parsed : []);
      this.setCache(cacheKey, data, ALERTS_CACHE_TIME);
      return data;
    } catch (e) {
      return [
        {
          title: "Irrigation Advisory",
          type: "Water",
          description: "Moderate humidity expected. Water fields early in morning to minimize fungal risk.",
          urgency: "Normal"
        },
        {
          title: "Pest Vigilance Window",
          type: "Pest",
          description: "Monitor lower leaves for early aphids or whitefly colonies. Install yellow sticky traps.",
          urgency: "Medium"
        }
      ];
    }
  }

  async getFertilizerAdvice(crop: string, soil: string, stage: string, lang: string = 'en'): Promise<FertilizerAdvice> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Fertilizer advice for ${crop} at ${stage} in ${soil} soil in ${lang}.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              quantity: { type: Type.STRING },
              timing: { type: Type.STRING },
              applicationMethod: { type: Type.STRING },
              precautions: { type: Type.STRING }
            }
          }
        }
      });
      return this.extractJSON(response.text);
    } catch (e) {
      return {
        type: "NPK 12:32:16 + Organic Vermicompost",
        quantity: "50 kg/acre basal + 20 kg Urea top-dress",
        timing: "Apply basal dose at sowing, top dress at first irrigation",
        applicationMethod: "Broadcasting followed by light irrigation",
        precautions: "Do not apply dry urea directly on wet leaves under scorching midday sun."
      };
    }
  }

  async getIrrigationAdvice(crop: string, moisture: number, rain: number, lang: string = 'en') {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Irrigation for ${crop}, ${moisture}% moisture, ${rain}mm rain in ${lang}.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              waterAmount: { type: Type.STRING },
              duration: { type: Type.STRING },
              urgency: { type: Type.STRING },
              tips: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });
      return this.extractJSON(response.text);
    } catch (e) {
      return {
        waterAmount: "25-30 mm",
        duration: "2 hours via drip",
        urgency: moisture < 40 ? "High" : "Normal",
        tips: ["Irrigate during twilight hours", "Check soil depth with trowel before irrigating"]
      };
    }
  }

  async checkUpcomingRain(location: string, lang: string = 'en') {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Check if heavy rain is predicted in ${location} next 24h. Respond strictly in JSON format with this structure: { "isRainExpected": boolean, "intensity": string, "timing": string, "recommendation": string }`,
      });
      const data = this.extractJSON(response.text);
      return data.isRainExpected !== undefined ? data : { isRainExpected: false };
    } catch (e) {
      return { isRainExpected: false, recommendation: "Normal field operations can proceed." };
    }
  }

  async getWeatherAlerts(location: string, lang: string = 'en') {
    const cacheKey = `weather_alerts_${location}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find critical weather alerts for farmers in ${location} in ${lang}. Respond strictly in JSON format with this structure: { "alerts": [ { "title": string, "severity": string, "description": string, "action": string } ] }`,
      });
      const parsed = this.extractJSON(response.text);
      const data = parsed.alerts ? parsed.alerts : (Array.isArray(parsed) ? parsed : []);
      this.setCache(cacheKey, data, WEATHER_CACHE_TIME);
      return data;
    } catch (e) {
      return [];
    }
  }

  async analyzeGrowth(imageBase64: string, cropType: string, lang: string = 'en') {
    // Check local model first
    const localResult = await this.queryLocalModel(imageBase64);
    if (localResult && localResult.disease) {
      const isHealthy = localResult.disease.toLowerCase().includes('healthy');
      return {
        stage: "Vegetative / Foliar",
        health: isHealthy ? "Optimal Health (98%)" : `Detected: ${localResult.disease} (${localResult.confidence}%)`,
        analysis: isHealthy 
          ? `Lush green foliage detected by trained MobileNetV2 research model. No active fungal or bacterial lesions.`
          : `Trained research model detected symptoms consistent with ${localResult.disease}.`,
        nextSteps: isHealthy
          ? "Maintain regular balanced fertigation and periodic leaf monitoring."
          : "Refer to recommended organic bio-fungicide or consultation."
      };
    }

    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] || imageBase64 } },
            { text: `Growth analysis for ${cropType} in ${lang}.` }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              stage: { type: Type.STRING },
              health: { type: Type.STRING },
              analysis: { type: Type.STRING },
              nextSteps: { type: Type.STRING }
            }
          }
        }
      });
      return this.extractJSON(response.text);
    } catch (e) {
      return {
        stage: "Vegetative",
        health: "Healthy Growth",
        analysis: "Leaf structures appear developed with normal chlorophyll pigment.",
        nextSteps: "Maintain consistent soil moisture."
      };
    }
  }

  async getSchemes(location: string, lang: string = 'en') {
    const cacheKey = `schemes_${location}_${lang}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find active, currently ongoing Indian agricultural schemes specifically for farmers in ${location} in ${lang}. Exclude any schemes that have ended or are no longer active. Respond strictly in JSON format with this structure: { "schemes": [ { "name": string, "category": string, "description": string, "eligibility": string, "benefits": string } ] }`,
      });
      const parsed = this.extractJSON(response.text);
      const data = parsed.schemes ? parsed.schemes : (Array.isArray(parsed) ? parsed : []);
      this.setCache(cacheKey, data, 24 * 60 * 60 * 1000); // 1 day
      return data;
    } catch (e) {
      return [
        {
          name: "PM-Kisan Samman Nidhi",
          category: "Direct Income Support",
          description: "Provides financial assistance of ₹6,000 per year in three equal installments to farmer families.",
          eligibility: "All landholding farmer families across India.",
          benefits: "₹2,000 every 4 months directly transferred to bank account."
        },
        {
          name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
          category: "Crop Insurance",
          description: "Comprehensive risk insurance covering yield losses due to non-preventable natural risks.",
          eligibility: "All farmers growing notified crops in notified areas.",
          benefits: "Very low premium (1.5% Rabi, 2% Kharif) with full sum insured coverage."
        },
        {
          name: "Sub-Mission on Agricultural Mechanization (SMAM)",
          category: "Equipment Subsidy",
          description: "Subsidies for purchasing modern farm implements, tractors, and laser land levelers.",
          eligibility: "Small, marginal, and SC/ST farmers get up to 50% subsidy.",
          benefits: "40% to 50% financial subsidy on certified agricultural machinery."
        }
      ];
    }
  }

  async getCropRecommendations(location: string, season: string, soil: string, lang: string = 'en') {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Recommend crops for ${location}, ${season}, ${soil} in ${lang}. Respond strictly in JSON format with this structure: { "crops": [ { "name": string, "risk": string, "profitPotential": string, "waterNeed": string } ] }`,
      });
      const data = this.extractJSON(response.text);
      return data.crops ? data : { crops: Array.isArray(data) ? data : [] };
    } catch (e) {
      return {
        crops: [
          { name: "Wheat (HD-3086)", risk: "Low", profitPotential: "High", waterNeed: "Moderate" },
          { name: "Mustard (Pusa Bold)", risk: "Low", profitPotential: "Very High", waterNeed: "Low" },
          { name: "Chickpea (Gram)", risk: "Medium", profitPotential: "High", waterNeed: "Low" }
        ]
      };
    }
  }

  async getWeatherAdvice(temp: number, humidity: number, condition: string, lang: string = 'en') {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Tips for ${temp}C, ${humidity}%, ${condition} in ${lang}.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: { tips: { type: Type.ARRAY, items: { type: Type.STRING } } }
          }
        }
      });
      const parsed = this.extractJSON(response.text);
      return parsed.tips ? parsed.tips : (Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      return [
        "Optimal conditions for foliar spray in early morning before 10 AM",
        "Keep field drainage channels open to avoid water-logging"
      ];
    }
  }

  async getFinancialEstimates(landSize: number, cropType: string, location: string, lang: string = 'en'): Promise<{ seedsCost: number, laborCost: number, fertilizerCost: number, expectedYield: number, marketPrice: number }> {
    const cacheKey = `financials_${landSize}_${cropType}_${location}_${lang}`;
    const cached = this.getCached<{ seedsCost: number, laborCost: number, fertilizerCost: number, expectedYield: number, marketPrice: number }>(cacheKey);
    if (cached) return cached;

    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Estimate the farming costs and revenue for ${landSize} acres of ${cropType} in ${location} in ${lang}. Respond strictly in JSON format with this structure: { "seedsCost": number, "laborCost": number, "fertilizerCost": number, "expectedYield": number, "marketPrice": number }`,
      });
      const parsed = this.extractJSON(response.text);
      const data = {
        seedsCost: parsed.seedsCost || (landSize * 1500),
        laborCost: parsed.laborCost || (landSize * 4500),
        fertilizerCost: parsed.fertilizerCost || (landSize * 3000),
        expectedYield: parsed.expectedYield || (landSize * 18),
        marketPrice: parsed.marketPrice || 2450,
      };
      this.setCache(cacheKey, data, 24 * 60 * 60 * 1000);
      return data;
    } catch (e) {
      return {
        seedsCost: landSize * 1500,
        laborCost: landSize * 4500,
        fertilizerCost: landSize * 3000,
        expectedYield: landSize * 18,
        marketPrice: 2450,
      };
    }
  }
}

export const geminiService = new GeminiService();
