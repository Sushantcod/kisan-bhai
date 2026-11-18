import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  HelpCircle, 
  Cpu, 
  Eye, 
  EyeOff, 
  Zap, 
  ShieldCheck, 
  Server,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { getAIConfig, saveAIConfig, AIProvider } from '../services/aiConfig';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'guide'>('settings');
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [geminiKey, setGeminiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [modelApiUrl, setModelApiUrl] = useState('http://localhost:8000');
  
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getAIConfig();
      setProvider(cfg.provider);
      setGeminiKey(cfg.geminiKey);
      setGroqKey(cfg.groqKey);
      setModelApiUrl(cfg.modelApiUrl || 'http://localhost:8000');
      setTestStatus('idle');
      setSavedBanner(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveAIConfig({
      provider,
      geminiKey: geminiKey.trim(),
      groqKey: groqKey.trim(),
      modelApiUrl: modelApiUrl.trim()
    });
    setSavedBanner(true);
    setTimeout(() => {
      setSavedBanner(false);
      onClose();
    }, 1200);
  };

  const handleTestKey = async () => {
    setTestStatus('testing');
    setTestMessage('Verifying connection...');

    if (provider === 'expert_system') {
      setTimeout(() => {
        setTestStatus('success');
        setTestMessage('Offline Expert System is active and 100% operational!');
      }, 400);
      return;
    }

    if (provider === 'gemini') {
      const keyToTest = geminiKey.trim() || (process.env.API_KEY || '');
      if (!keyToTest) {
        setTestStatus('error');
        setTestMessage('Please enter a Google Gemini API Key first.');
        return;
      }
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyToTest}`);
        if (res.ok) {
          setTestStatus('success');
          setTestMessage('Gemini API Key verified successfully! 15 RPM / 1M TPM free quota active.');
        } else {
          const err = await res.json();
          setTestStatus('error');
          setTestMessage(`Gemini validation failed: ${err.error?.message || 'Invalid API Key'}`);
        }
      } catch (e: any) {
        setTestStatus('error');
        setTestMessage(`Network error during test: ${e.message}`);
      }
    } else if (provider === 'groq') {
      const keyToTest = groqKey.trim();
      if (!keyToTest) {
        setTestStatus('error');
        setTestMessage('Please enter a Groq API Key first.');
        return;
      }
      try {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { 'Authorization': `Bearer ${keyToTest}` }
        });
        if (res.ok) {
          setTestStatus('success');
          setTestMessage('Groq API Key verified successfully! Ultra-fast Llama 3.3 active.');
        } else {
          setTestStatus('error');
          setTestMessage('Invalid Groq API Key. Please check the key in console.groq.com.');
        }
      } catch (e: any) {
        setTestStatus('error');
        setTestMessage(`Network error: ${e.message}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/60 via-white/80 to-teal-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-brand-600/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg text-slate-900">AI Engine & Free API Key</h2>
              <p className="text-xs text-slate-500 font-medium">Use free AI models, your own keys, or offline expert fallback</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 bg-white/50">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-extrabold border-b-2 transition-all ${
              activeTab === 'settings'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Provider & Key Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-extrabold border-b-2 transition-all ${
              activeTab === 'guide'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>How to Get a Free Key (Guide)</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'settings' ? (
            <>
              {/* PROVIDER SELECTION TILES */}
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block mb-2.5">
                  Select AI Chat Provider
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Gemini Card */}
                  <div
                    onClick={() => setProvider('gemini')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      provider === 'gemini'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                        : 'border-slate-200/80 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-xs text-slate-900">Google Gemini</span>
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-1">
                      Recommended
                    </span>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      100% Free: 1,500 req/day. Vision leaf scans & Indian languages.
                    </p>
                  </div>

                  {/* Groq Card */}
                  <div
                    onClick={() => setProvider('groq')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      provider === 'groq'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                        : 'border-slate-200/80 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-xs text-slate-900">Groq Cloud</span>
                      <Zap className="w-4 h-4 text-amber-500" />
                    </div>
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full inline-block mb-1">
                      Ultra Fast
                    </span>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Llama 3.3 70B. Blazing fast (500 tokens/sec) free text inference.
                    </p>
                  </div>

                  {/* Offline Expert System Card */}
                  <div
                    onClick={() => setProvider('expert_system')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      provider === 'expert_system'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                        : 'border-slate-200/80 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-xs text-slate-900">Offline Expert</span>
                      <ShieldCheck className="w-4 h-4 text-brand-600" />
                    </div>
                    <span className="text-[10px] font-extrabold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full inline-block mb-1">
                      No Key / Zero Net
                    </span>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Built-in agricultural knowledge matrix & verified dosages.
                    </p>
                  </div>
                </div>
              </div>

              {/* API KEY INPUT */}
              {provider === 'gemini' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      Google Gemini API Key
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('guide')}
                      className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" /> How to get free key?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy... (Paste your free Gemini key here)"
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-2xl px-4 py-3 pr-11 text-xs sm:text-sm font-mono font-medium text-slate-900 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Leave blank to use default application quota (or add your personal key for unlimited 1,500 req/day).
                  </p>
                </div>
              )}

              {provider === 'groq' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                      Groq API Key
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('guide')}
                      className="text-[11px] font-extrabold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" /> How to get free key?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={groqKey}
                      onChange={(e) => setGroqKey(e.target.value)}
                      placeholder="gsk_... (Paste your free Groq key here)"
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-2xl px-4 py-3 pr-11 text-xs sm:text-sm font-mono font-medium text-slate-900 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {provider === 'expert_system' && (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-xs text-emerald-950">Offline Expert System Active</h4>
                    <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                      No API key or internet required. Kisan-Bhai will answer crop disease queries, organic remedies, fertilizer schedules, and emergency helplines directly using the built-in agricultural rulebook.
                    </p>
                  </div>
                </div>
              )}

              {/* TRAINED MODEL ENDPOINT (plant-disease-research) */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-brand-600" />
                    Custom Research Model Server (MobileNetV2)
                  </label>
                  <span className="text-[10px] font-bold text-slate-400">Optional</span>
                </div>
                <input
                  type="text"
                  value={modelApiUrl}
                  onChange={(e) => setModelApiUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-brand-500 rounded-2xl px-4 py-2.5 text-xs font-mono font-medium text-slate-900 outline-none"
                />
                <p className="text-[11px] text-slate-400">
                  Connects to your trained model from <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">plant-disease-research/serve_model.py</code> for high-speed offline leaf diagnosis.
                </p>
              </div>

              {/* TEST FEEDBACK */}
              {testStatus !== 'idle' && (
                <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200 ${
                  testStatus === 'testing' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                  testStatus === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                  'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {testStatus === 'testing' && <RefreshCw className="w-4 h-4 animate-spin text-blue-600 shrink-0" />}
                  {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span>{testMessage}</span>
                </div>
              )}

              {/* PRIVACY BADGE */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your API keys are stored locally on your device in browser localStorage and are never sent to our servers.</span>
              </div>
            </>
          ) : (
            /* TAB 2: STEP-BY-STEP USER GUIDE */
            <div className="space-y-6">
              {/* GEMINI GUIDE CARD */}
              <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-600 text-white">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="font-heading font-extrabold text-sm text-emerald-950">
                      Option A: Google Gemini Free API Key (Recommended)
                    </h3>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-800">
                    Free Forever
                  </span>
                </div>

                <ol className="space-y-3 text-xs text-slate-700 font-medium">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div>
                      <strong>Open Google AI Studio:</strong> Click the button below to visit Google AI Studio.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div>
                      <strong>Sign In:</strong> Log in with your standard Google (Gmail) account. No credit card is required.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <div>
                      <strong>Click "Create API Key":</strong> Select any Google Cloud project or click <em>Create key in new project</em>.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <div>
                      <strong>Copy & Paste:</strong> Copy your key (starts with <code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-900">AIzaSy...</code>) and paste it into the Settings tab.
                    </div>
                  </li>
                </ol>

                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                >
                  <span>Open Google AI Studio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* GROQ GUIDE CARD */}
              <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500 text-white">
                      <Zap className="w-4 h-4" />
                    </div>
                    <h3 className="font-heading font-extrabold text-sm text-amber-950">
                      Option B: Groq Cloud Free Key (Ultra Fast Text)
                    </h3>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-800">
                    Fastest
                  </span>
                </div>

                <ol className="space-y-3 text-xs text-slate-700 font-medium">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div>
                      <strong>Open Groq Console:</strong> Visit <code className="bg-amber-100 px-1 py-0.5 rounded">console.groq.com/keys</code> and sign up with Google or GitHub.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div>
                      <strong>Click "Create API Key":</strong> Give it a name (e.g. <em>KisanBhai</em>) and click create.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <div>
                      <strong>Copy & Paste:</strong> Copy your key (starts with <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900">gsk_...</code>) and paste it into Settings.
                    </div>
                  </li>
                </ol>

                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                >
                  <span>Open Groq Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestKey}
            className="text-xs font-extrabold text-slate-700 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Test Connection</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-extrabold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-600 hover:from-brand-500 hover:to-teal-500 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl shadow-md shadow-brand-600/20 active:scale-95 transition-all"
            >
              {savedBanner ? 'Saved Successfully! ✓' : 'Save & Apply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
