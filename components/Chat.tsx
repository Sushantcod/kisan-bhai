import { 
  Bot, 
  Cloud, 
  Image as ImageIcon, 
  Landmark, 
  Loader2, 
  Mic, 
  MicOff, 
  MousePointer2, 
  Send, 
  Sparkles, 
  Sprout, 
  Square, 
  Thermometer, 
  User, 
  Volume2, 
  VolumeX,
  Waves, 
  Wheat, 
  X,
  MessageCircle,
  Volume1,
  Key,
  Cpu,
  ShieldCheck,
  Zap,
  Server,
  FlaskConical,
  Film
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { geminiService } from '../services/geminiService';
import { getAIConfig, AIConfig } from '../services/aiConfig';
import { ApiKeyModal } from './ApiKeyModal';
import { FormattedMessage } from './FormattedMessage';
import { getTranslation } from '../translations';
import { useUser } from '../App';
import { ChatMessage, FarmProfile } from '../types';

interface TestSample {
  name: string;
  crop: string;
  file: string;
  icon: string;
  badge: string;
}

const TEST_SAMPLES: TestSample[] = [
  { name: 'Tomato Early Blight', crop: 'Tomato', file: 'tomato_early_blight.png', icon: '🍅', badge: '99.5% Conf' },
  { name: 'Potato Early Blight', crop: 'Potato', file: 'potato_early_blight.png', icon: '🥔', badge: '90.7% Conf' },
  { name: 'Apple Scab', crop: 'Apple', file: 'apple_scab.png', icon: '🍎', badge: '99.9% Conf' },
  { name: 'Corn Blight / Rust', crop: 'Corn', file: 'corn_common_rust.png', icon: '🌽', badge: '97.8% Conf' },
  { name: 'Tomato Late Blight', crop: 'Tomato', file: 'tomato_late_blight.png', icon: '🍅', badge: '100% Conf' },
  { name: 'Healthy Tomato', crop: 'Tomato', file: 'tomato_healthy.png', icon: '🌿', badge: 'Healthy' }
];

export const Chat: React.FC = () => {
  const { user } = useUser();
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => getAIConfig());

  // Voice State
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveVoiceStatus, setLiveVoiceStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [isDictating, setIsDictating] = useState(false);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechRecognitionRef = useRef<any>(null);
  const dictationRecognitionRef = useRef<any>(null);
  const isLiveModeActiveRef = useRef(false);

  const getRecognitionLang = () => {
    switch (user?.language) {
      case 'hi': return 'hi-IN';
      case 'pa': return 'pa-IN';
      case 'mr': return 'mr-IN';
      default: return 'en-IN';
    }
  };

  const getLanguageDisplayName = () => {
    switch (user?.language) {
      case 'hi': return 'Hindi (हिन्दी)';
      case 'pa': return 'Punjabi (ਪੰਜਾਬੀ)';
      case 'mr': return 'Marathi (मराठी)';
      default: return 'English';
    }
  };

  // Check if routed with initial state from Scan Crop Health
  useEffect(() => {
    if (location.state?.initialPrompt || location.state?.initialImage) {
      handleSend(location.state.initialPrompt, location.state.initialImage);
    }
  }, [location.state]);

  useEffect(() => {
    if (!user) return;
    const welcomes: Record<string, string> = {
      'en': "Namaste! I am Kisan-Bhai, your Digital Farmer Advisor. How can I help your fields flourish today?",
      'hi': "नमस्ते! मैं किसान-भाई हूँ, आपका डिजिटल किसान सलाहकार। आज मैं आपकी खेती में कैसे मदद कर सकता हूँ?",
      'pa': "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਕਿਸਾਨ-ਭਾਈ ਹਾਂ, ਤੁਹਾਡਾ ਡਿਜੀਟਲ ਕਿਸਾਨ ਸਲਾਹਕਾਰ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਖੇਤੀ ਵਿੱਚ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
      'mr': "नमस्कार! मी किसान-भाई आहे, तुमचा डिजिटल शेतकरी सल्लागार. आज मी तुमच्या शेतीमध्ये कशी मदत करू शकतो?"
    };
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: welcomes[user.language] || welcomes.en }]);
    }
  }, [user?.language]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, isLiveMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isLiveModeActiveRef.current = false;
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.abort(); } catch (_) {}
      }
      if (dictationRecognitionRef.current) {
        try { dictationRecognitionRef.current.abort(); } catch (_) {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = async (text: string) => {
    if (!text || text.trim().length === 0) return;

    if (isSpeaking) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      await geminiService.generateSpeech(text, user?.language);
    } catch (e) {
      console.error('Speech synthesis error:', e);
    } finally {
      setIsSpeaking(false);
    }
  };

  const speakSelection = () => {
    const selection = window.getSelection()?.toString();
    if (selection && selection.trim().length > 0) {
      speakText(selection);
    }
  };

  // FULL-DUPLEX LIVE CONVERSATIONAL VOICE MODE
  const startListeningForLive = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported on this browser. Please use Google Chrome, Safari, or Edge.");
      stopLiveChat();
      return;
    }

    try {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.abort(); } catch (_) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = getRecognitionLang();
      recognition.interimResults = true;
      recognition.continuous = false;

      let recognizedSpeech = '';

      recognition.onstart = () => {
        setLiveVoiceStatus('listening');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        recognizedSpeech = transcript;
        setLiveTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Live Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone permission was denied. Please allow microphone access in your browser settings.');
          stopLiveChat();
        } else if (isLiveModeActiveRef.current && event.error !== 'aborted') {
          // Restart after short delay
          setTimeout(() => {
            if (isLiveModeActiveRef.current) startListeningForLive();
          }, 800);
        }
      };

      recognition.onend = async () => {
        if (!isLiveModeActiveRef.current) return;
        const finalQuery = recognizedSpeech.trim();
        if (finalQuery.length > 1) {
          setLiveVoiceStatus('thinking');
          const response = await handleSend(finalQuery);
          if (response && isLiveModeActiveRef.current) {
            setLiveVoiceStatus('speaking');
            setIsSpeaking(true);
            await geminiService.generateSpeech(response, user?.language);
            setIsSpeaking(false);
            if (isLiveModeActiveRef.current) {
              setLiveTranscript('');
              startListeningForLive();
            }
          } else if (isLiveModeActiveRef.current) {
            setLiveTranscript('');
            startListeningForLive();
          }
        } else {
          // No speech detected; restart listening
          if (isLiveModeActiveRef.current) {
            startListeningForLive();
          }
        }
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting live speech recognition:', err);
      stopLiveChat();
    }
  };

  const startLiveChat = () => {
    setIsLiveMode(true);
    isLiveModeActiveRef.current = true;
    setLiveTranscript('');
    startListeningForLive();
  };

  const stopLiveChat = () => {
    isLiveModeActiveRef.current = false;
    setIsLiveMode(false);
    setLiveVoiceStatus('idle');
    setLiveTranscript('');
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.abort(); } catch (_) {}
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // CHAT INPUT DICTATION (SINGLE QUERY)
  const toggleDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported on this browser. Please use Chrome or Safari.");
      return;
    }

    if (isDictating) {
      if (dictationRecognitionRef.current) {
        try { dictationRecognitionRef.current.stop(); } catch (_) {}
      }
      setIsDictating(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = getRecognitionLang();
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => setIsDictating(true);
      recognition.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setInput(text);
      };
      recognition.onerror = () => setIsDictating(false);
      recognition.onend = () => setIsDictating(false);

      dictationRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsDictating(false);
    }
  };

  // EXTRACT FRAME FROM VIDEO FILES
  const extractFrameFromVideo = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.playsInline = true;
      video.onloadeddata = () => {
        video.currentTime = Math.min(1.0, (video.duration || 2) / 2);
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(video.videoWidth || 512, 640);
        canvas.height = Math.min(video.videoHeight || 512, 640);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frameDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          URL.revokeObjectURL(video.src);
          resolve(frameDataUrl);
        } else {
          URL.revokeObjectURL(video.src);
          reject(new Error('Canvas context unavailable'));
        }
      };
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video file'));
      };
    });
  };

  // HANDLE PHOTO OR VIDEO UPLOAD
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      setIsProcessingVideo(true);
      try {
        const frameDataUrl = await extractFrameFromVideo(file);
        setSelectedImage(frameDataUrl);
      } catch (err) {
        alert('Could not extract frame from video. Please try uploading a photo instead.');
      } finally {
        setIsProcessingVideo(false);
      }
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // LOAD SAMPLE LEAF FOR 1-CLICK TESTING
  const handleTestSample = async (sample: TestSample) => {
    try {
      setIsLoading(true);
      const resp = await fetch(`/sample-leaves/${sample.file}`);
      const blob = await resp.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setSelectedImage(dataUrl);
        handleSend(`Please diagnose this ${sample.name} test crop leaf.`, dataUrl);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Failed to load test sample leaf:', err);
      setIsLoading(false);
    }
  };

  const handleSend = async (overrideText?: string, overrideImage?: string): Promise<string> => {
    const messageText = overrideText || input;
    if ((!messageText.trim() && !selectedImage && !overrideImage) || isLoading) return '';

    const defaultPrompt = (overrideImage || selectedImage) 
      ? "Please inspect and diagnose this crop photo or video frame." 
      : "Analyze this.";

    const textToSend = messageText.trim() ? messageText : defaultPrompt;
    const currentImage = overrideImage || selectedImage;

    const userMsg: ChatMessage = { 
      role: 'user', 
      content: textToSend, 
      image: currentImage || undefined 
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    let assistantResponse = "";
    try {
      assistantResponse = await geminiService.chat(messages, textToSend, currentImage || undefined, user?.language);
      setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
    } catch (error) {
      assistantResponse = "I encountered a minor issue. Please try asking again!";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
    } finally {
      setIsLoading(false);
    }
    return assistantResponse;
  };

  const t = getTranslation(user?.language || 'en');
  const suggestions = [
    { text: t.sugCrop, icon: Sprout, color: 'text-brand-600', bg: 'bg-brand-50 border-brand-200/60' },
    { text: t.sugTomato, icon: Wheat, color: 'text-harvest-600', bg: 'bg-harvest-50 border-harvest-200/60' },
    { text: t.sugWater, icon: Thermometer, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200/60' },
    { text: t.sugSchemes, icon: Landmark, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200/60' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-160px)] bg-white/35 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden relative font-sans">
      
      {/* LIVE VOICE MODE FULLSCREEN OVERLAY */}
      {isLiveMode && (
        <div className="absolute inset-0 z-50 bg-gradient-to-b from-brand-950 via-slate-950 to-brand-900 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
          <button 
            onClick={stopLiveChat} 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-3 rounded-full hover:bg-white/10"
            title="Close Voice Session"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center mb-8 shadow-glow-green">
            <div className={`absolute inset-0 rounded-full border-4 border-brand-400/40 ${liveVoiceStatus === 'listening' ? 'animate-ping' : ''}`} />
            <Bot className={`w-16 h-16 text-white ${liveVoiceStatus === 'speaking' ? 'animate-bounce' : 'animate-pulse'}`} />
          </div>

          <h2 className="font-heading font-extrabold text-2xl text-white mb-2">Talking with Kisan-Bhai</h2>
          <p className="text-brand-200 text-xs sm:text-sm font-medium mb-4 text-center max-w-sm">
            {liveVoiceStatus === 'listening' && `Listening in ${getLanguageDisplayName()}... Speak naturally!`}
            {liveVoiceStatus === 'thinking' && "Analyzing your farming question..."}
            {liveVoiceStatus === 'speaking' && "Speaking advisory aloud..."}
            {liveVoiceStatus === 'idle' && "Ready for your question."}
          </p>

          {/* REALTIME RECOGNIZED TRANSCRIPT */}
          <div className="min-h-16 max-w-md w-full px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-6 text-center">
            <p className="text-white font-medium text-sm sm:text-base italic">
              {liveTranscript || (liveVoiceStatus === 'listening' ? "Listening for your voice..." : "...")}
            </p>
          </div>

          <div className="flex items-center gap-1.5 h-10 mb-8">
            {[...Array(5)].map((_, idx) => (
              <span 
                key={idx} 
                className={`wave-bar w-2 bg-brand-400 rounded-full h-full ${liveVoiceStatus === 'listening' ? 'animate-wave-bar' : 'opacity-40'}`} 
              />
            ))}
          </div>

          <button 
            onClick={stopLiveChat} 
            className="bg-rose-600 text-white px-8 py-3.5 rounded-2xl font-extrabold text-sm shadow-xl flex items-center gap-2 hover:bg-rose-700 transition-all active:scale-95"
          >
            <Square className="w-4 h-4 fill-current" /> End Voice Session
          </button>
        </div>
      )}

      {/* CHAT HEADER BAR */}
      <div className="p-4 sm:p-5 border-b border-white/50 flex items-center justify-between bg-white/40 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-brand-600/20 ${isSpeaking ? 'animate-pulse' : ''}`}>
              <Bot className="w-7 h-7" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 leading-none">Kisan-Bhai</h2>
              <Sparkles className="w-3.5 h-3.5 text-harvest-500 fill-harvest-400" />
            </div>
            <p className="text-[10px] sm:text-xs text-brand-700 font-bold tracking-wider mt-1 uppercase flex items-center gap-1.5">
              {isSpeaking ? (
                <>
                  <Volume1 className="w-3 h-3 text-brand-600 animate-pulse" />
                  <span>Speaking Advisory...</span>
                </>
              ) : (
                <span>AI Farmer Advisor</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Groq AI Settings & Auto-Offline Button */}
          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className="flex items-center gap-1.5 bg-white/70 hover:bg-white text-slate-800 px-3 py-2 rounded-xl text-xs font-extrabold border border-white/80 shadow-xs hover:shadow transition-all active:scale-95"
            title="Configure Groq API Key & Settings"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span className="hidden sm:inline">Groq AI</span>
            <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded-full ${
              aiConfig.groqKey.trim() 
                ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}>
              {aiConfig.groqKey.trim() ? 'Active' : 'Offline Auto'}
            </span>
          </button>

          <button 
            onClick={startLiveChat} 
            className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-md shadow-brand-600/20 active:scale-95"
            title="Start Full Hands-Free Voice Chat"
          >
            <Waves className="w-4 h-4" /> 
            <span className="hidden sm:inline">Start Live Voice</span>
            <span className="sm:hidden">Live Voice</span>
          </button>
        </div>
      </div>

      {/* MESSAGES SCROLL AREA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex gap-3 max-w-[90%] sm:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0 flex items-center justify-center shadow-xs ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-brand-600 text-white'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className={`group relative p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                  : 'bg-white/25 backdrop-blur-md text-slate-900 rounded-tl-none border border-white/50 shadow-sm'
              }`}>
                {msg.image && (
                  <img 
                    src={msg.image} 
                    alt="Uploaded Crop" 
                    className="max-w-xs rounded-xl mb-3 border border-slate-200 shadow-sm object-cover" 
                  />
                )}
                <FormattedMessage content={msg.content} isUser={msg.role === 'user'} />
                
                {msg.role === 'assistant' && (
                  <div className="mt-3 pt-2.5 border-t border-white/40 flex items-center gap-3">
                    <button 
                      onClick={() => speakText(msg.content)} 
                      className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-brand-700 hover:text-brand-800 px-2 py-1 rounded-md hover:bg-white/40 transition-colors"
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{isSpeaking ? t.stop : t.listen}</span>
                    </button>
                    <button 
                      onClick={speakSelection} 
                      className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 border-l border-white/40 pl-3 px-2 py-1 rounded-md hover:bg-white/40 transition-colors"
                    >
                      <MousePointer2 className="w-3.5 h-3.5" />
                      <span>{t.readSelection}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* PROMPT SUGGESTIONS CHIPS (WHEN FRESH CHAT) */}
        {messages.length === 1 && !isLoading && (
          <div className="animate-fade-in-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards] space-y-4 pt-4 pb-2">
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest text-center">
              {t.tryAsking}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {suggestions.map((sug, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(sug.text)} 
                  className="flex items-center gap-3.5 p-4 bg-white/20 backdrop-blur-md border border-white/50 rounded-2xl text-left hover:bg-white/40 hover:border-brand-400/60 hover:shadow-md hover:scale-[1.02] transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-white/40 border border-white/60 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <sug.icon className={`w-4 h-4 ${sug.color}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-900 leading-snug">{sug.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* LOADING INDICATOR */}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-200">
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white/60 backdrop-blur-md border border-white/80 p-3.5 rounded-2xl flex gap-1.5 shadow-xs">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUICK TEST SAMPLES BAR (TRAINED PLANT DISEASE DATASET) */}
      <div className="px-4 py-2 border-t border-white/40 bg-white/30 backdrop-blur-md">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <FlaskConical className="w-3.5 h-3.5 text-brand-600" />
            <span>Test Trained Model with Dataset Leaves:</span>
          </span>
          <span className="text-[9px] text-emerald-800 font-extrabold bg-emerald-100/90 border border-emerald-200/80 px-2 py-0.5 rounded-full">
            MobileNetV2 (38 Classes)
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TEST_SAMPLES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleTestSample(sample)}
              disabled={isLoading}
              className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 bg-white/70 hover:bg-white border border-white/90 rounded-xl text-left hover:border-brand-400 hover:shadow-xs transition-all active:scale-95 group disabled:opacity-50"
              title={`Test ${sample.name} from trained dataset`}
            >
              <span className="text-sm">{sample.icon}</span>
              <div>
                <div className="text-[11px] font-extrabold text-slate-800 leading-none group-hover:text-brand-700">{sample.name}</div>
                <div className="text-[9px] font-bold text-emerald-700 mt-0.5">{sample.badge}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CHAT INPUT AREA */}
      <div className="p-3 sm:p-4 border-t border-white/50 bg-white/45 backdrop-blur-xl">
        {selectedImage && (
          <div className="relative inline-block mb-2.5 animate-in zoom-in duration-200">
            <img src={selectedImage} alt="Crop Preview" className="h-16 w-16 object-cover rounded-xl border-2 border-brand-500 shadow-md" />
            <button 
              onClick={() => setSelectedImage(null)} 
              className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {isProcessingVideo && (
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-brand-700 bg-brand-50 p-2 rounded-xl">
            <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
            <span>Extracting clear frame from crop video...</span>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-2.5">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleMediaUpload} 
            accept="image/*,video/*" 
            className="hidden" 
          />
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()} 
            className="p-3 text-slate-600 hover:text-brand-600 bg-white/70 hover:bg-white backdrop-blur-md rounded-xl transition-all border border-white/80 shadow-xs"
            title="Upload Crop Photo or Video"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <button 
            type="button"
            onClick={toggleDictation}
            className={`p-3 rounded-xl transition-all border shadow-xs ${
              isDictating 
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                : 'text-slate-600 hover:text-brand-600 bg-white/70 hover:bg-white backdrop-blur-md border-white/80'
            }`}
            title={isDictating ? "Listening... Click to stop" : "Voice dictation (Speak in your language)"}
          >
            {isDictating ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5" />}
          </button>

          <div className="flex-1">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              placeholder={isDictating ? "Listening to your voice..." : t.askAnything} 
              className="w-full bg-white/70 backdrop-blur-md border border-white/80 focus:border-brand-500 focus:bg-white/95 focus:ring-2 focus:ring-brand-500/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-500 font-medium outline-none transition-all shadow-xs" 
            />
          </div>

          <button 
            type="button"
            onClick={() => handleSend()} 
            disabled={isLoading || (!input.trim() && !selectedImage)} 
            className="p-3 bg-gradient-to-r from-brand-600 to-emerald-600 text-white rounded-xl shadow-md shadow-brand-600/20 hover:from-brand-500 hover:to-emerald-500 disabled:opacity-40 transition-all active:scale-95"
            title="Send Message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* AI ENGINE & FREE API KEY MODAL */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => {
          setIsApiKeyModalOpen(false);
          setAiConfig(getAIConfig());
        }}
      />
    </div>
  );
};
