import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Zap, 
  ShieldCheck, 
  Server,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { getAIConfig, saveAIConfig } from '../services/aiConfig';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [groqKey, setGroqKey] = useState('');
  const [modelApiUrl, setModelApiUrl] = useState('http://localhost:8000');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [savedBanner, setSavedBanner] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  useEffect(() => {
    if (isOpen) {
      const cfg = getAIConfig();
      setGroqKey(cfg.groqKey);
      setModelApiUrl(cfg.modelApiUrl || 'http://localhost:8000');
      setTestStatus('idle');
      setSavedBanner(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveAIConfig({
      groqKey: groqKey.trim(),
      modelApiUrl: modelApiUrl.trim()
    });
    setSavedBanner(true);
    setTimeout(() => {
      setSavedBanner(false);
      onClose();
    }, 1000);
  };

  const handleTestKey = async () => {
    const keyToTest = groqKey.trim();
    if (!keyToTest) {
      setTestStatus('error');
      setTestMessage('Please paste your Groq API Key first.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Testing Groq connection...');

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keyToTest}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 5
        })
      });

      if (res.ok) {
        setTestStatus('success');
        setTestMessage('Groq API Key verified! High-speed AI is ready.');
      } else {
        // Fallback test with second model
        const res2 = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${keyToTest}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-20b',
            messages: [{ role: 'user', content: 'hi' }],
            max_tokens: 5
          })
        });

        if (res2.ok) {
          setTestStatus('success');
          setTestMessage('Groq API Key verified! High-speed AI is ready.');
        } else {
          const err = await res2.json().catch(() => ({}));
          setTestStatus('error');
          setTestMessage(`Groq validation failed: ${err.error?.message || 'Invalid API Key'}`);
        }
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage(`Network error: ${e.message}`);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl border border-white/80 shadow-2xl overflow-hidden my-auto relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50/80 via-white to-emerald-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base sm:text-lg text-slate-900">Groq AI Settings</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isOnline ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    <Wifi className="w-3 h-3 text-emerald-600" /> Online Mode
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                    <WifiOff className="w-3 h-3 text-amber-600" /> Offline Expert Active
                  </span>
                )}
                <span className="text-[10px] text-slate-400 font-semibold">• Auto-fallback</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[calc(85vh-140px)] overflow-y-auto custom-scrollbar">
          {/* GROQ API KEY INPUT */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                Groq Cloud API Key
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-extrabold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_... (Paste your Groq API key)"
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

          {/* STEP BY STEP QUICK HELPER */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-2">
            <p className="font-extrabold text-amber-950 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" /> How to get your free key in 30 seconds:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] font-medium leading-relaxed">
              <li>Visit <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="font-bold text-amber-700 underline">console.groq.com/keys</a> and sign in with Google.</li>
              <li>Click <strong>"Create API Key"</strong> and copy it.</li>
              <li>Paste the key above and click <strong>"Save & Apply"</strong>.</li>
            </ol>
          </div>

          {/* AUTO-FALLBACK EXPERT SYSTEM INFO */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-emerald-950 text-[11px]">
                Automatic Offline Expert System
              </p>
              <p className="text-[11px] text-emerald-800 leading-snug mt-0.5">
                Whenever you have no internet in the fields or if your key is empty, Kisan-Bhai automatically switches to the offline agricultural rulebook for instant remedies.
              </p>
            </div>
          </div>

          {/* ADVANCED: LOCAL RESEARCH MODEL TOGGLE */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] font-extrabold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <Server className="w-3.5 h-3.5 text-brand-600" />
              <span>{showAdvanced ? 'Hide Custom Model Settings' : 'Advanced: Custom Research Model Server'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-2 space-y-1.5 animate-in fade-in duration-150">
                <input
                  type="text"
                  value={modelApiUrl}
                  onChange={(e) => setModelApiUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 outline-none"
                />
                <p className="text-[10px] text-slate-400">
                  Connects to your trained <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">plant-disease-research/serve_model.py</code> for local leaf diagnosis.
                </p>
              </div>
            )}
          </div>

          {/* TEST CONNECTION FEEDBACK */}
          {testStatus !== 'idle' && (
            <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150 ${
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
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestKey}
            className="text-xs font-extrabold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Test Key</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-extrabold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-gradient-to-r from-amber-500 via-brand-600 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white text-xs font-extrabold px-5 py-2 rounded-xl shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              {savedBanner ? 'Saved! ✓' : 'Save & Apply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
