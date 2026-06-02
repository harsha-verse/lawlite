import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import {
  MessageCircle, Send, Minimize2, Maximize2, X, Bot, User, Mic, MicOff, Volume2, VolumeX, Copy, Check, Pause, Square, Stethoscope,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import ChatActionCards from './ChatActionCards';
import DiagnosisFlow from './DiagnosisFlow';
import { SPEECH_LANG_MAP } from '@/i18n';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nyaya-chat`;

const SUGGESTION_KEYS = [
  'suggestTenantDeposit',
  'suggestSalaryNotPaid',
  'suggestConsumerComplaint',
  'suggestTrafficFine',
  'suggestPropertyDispute',
  'suggestDomesticViolence',
];

const ChatBot: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { profile, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const userState = profile?.state;
  const currentLang = i18n.language;

  const buildWelcome = () =>
    userState
      ? `${t('chatbotGreeting')}\n\n${t('chatbotGreetingState', { state: userState })}\n\n${t('chatbotAskAnything')}\n- ${t('chatbotExample1')}\n- ${t('chatbotExample2')}\n- ${t('chatbotExample3')}\n\n${t('chatbotDisclaimer')}`
      : `${t('chatbotGreeting')}\n\n${t('chatbotAskAnything')}\n- ${t('chatbotExample1')}\n- ${t('chatbotExample2')}\n- ${t('chatbotExample3')}\n\n${t('chatbotDisclaimer')}`;

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: buildWelcome() },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [autoReadEnabled, setAutoReadEnabled] = useState(() => {
    try { return localStorage.getItem('lawlite-auto-read') === 'true'; } catch { return false; }
  });
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const listenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Update welcome message when language changes
  useEffect(() => {
    setMessages(prev => {
      const rest = prev.filter(m => m.id !== '1');
      return [{ id: '1', role: 'assistant', content: buildWelcome() }, ...rest];
    });
  }, [currentLang, userState, t]);

  // Load persisted chat history when user logs in
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('chat_history')
        .select('id, role, content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (cancelled || error || !data || data.length === 0) return;
      const restored: Message[] = data.map((r: any) => ({
        id: r.id,
        role: r.role as 'user' | 'assistant',
        content: r.content,
      }));
      setMessages([{ id: '1', role: 'assistant', content: buildWelcome() }, ...restored]);
      setShowSuggestions(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Persist a single message to chat_history (skip welcome and streaming placeholder)
  const persistMessage = async (msg: Message) => {
    if (!user?.id) return;
    if (msg.id === '1' || msg.id === 'streaming') return;
    await supabase.from('chat_history').insert({
      user_id: user.id,
      role: msg.role,
      content: msg.content,
    });
  };

  // Copy text
  const copyText = async (text: string, msgId: string) => {
    const clean = text.replace(/[#*_\[\]()>`~|]/g, '');
    await navigator.clipboard.writeText(clean);
    setCopiedMsgId(msgId);
    toast.success(t('copiedToClipboard'));
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Sync auto-read setting from localStorage (cross-component)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'lawlite-auto-read') {
        setAutoReadEnabled(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (listenTimeoutRef.current) clearTimeout(listenTimeoutRef.current);
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Voice Input (Speech-to-Text) using Web Speech API
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(t('voiceNotSupported'));
      return;
    }

    // Request microphone permission explicitly
    navigator.mediaDevices?.getUserMedia({ audio: true }).then(() => {
      const recognition = new SpeechRecognition();
      recognition.lang = SPEECH_LANG_MAP[currentLang] || 'en-IN';
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 1;

      let finalTranscript = '';

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
        setInputMessage(finalTranscript + interim);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (listenTimeoutRef.current) clearTimeout(listenTimeoutRef.current);
        if (event.error === 'not-allowed') {
          toast.error(t('micPermissionDenied'));
        } else if (event.error === 'no-speech') {
          toast.warning(t('noSpeechDetected'));
        } else {
          toast.error(t('voiceError'));
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (listenTimeoutRef.current) clearTimeout(listenTimeoutRef.current);
        if (finalTranscript) {
          setIsProcessingVoice(true);
          setTimeout(() => setIsProcessingVoice(false), 600);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);

      // Auto-stop after 30 seconds
      listenTimeoutRef.current = setTimeout(() => {
        recognition.stop();
        toast.info(t('voiceAutoStopped'));
      }, 30000);
    }).catch(() => {
      toast.error(t('micPermissionDenied'));
    });
  };

  const stopListening = () => {
    if (listenTimeoutRef.current) clearTimeout(listenTimeoutRef.current);
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // Find best matching voice for a language
  const findBestVoice = (langCode: string): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    // Prefer exact match (e.g. hi-IN)
    let match = voices.find(v => v.lang === langCode);
    if (match) return match;
    // Try prefix match (e.g. hi)
    const prefix = langCode.split('-')[0];
    match = voices.find(v => v.lang.startsWith(prefix));
    if (match) return match;
    // Fallback to any Indian English
    match = voices.find(v => v.lang === 'en-IN');
    return match || null;
  };

  // Clean text for speech: strip markdown, convert newlines to pauses, shorten
  const cleanForSpeech = (text: string): string => {
    return text
      .replace(/[#*_\[\]()>`~|]/g, '')
      .replace(/^\s*[-•]\s*/gm, '') // remove bullet markers
      .replace(/\n{2,}/g, '. ') // double newlines become sentence breaks
      .replace(/\n/g, ', ') // single newlines become short pauses
      .replace(/\s{2,}/g, ' ')
      .trim();
  };

  // Voice Output (Text-to-Speech) using Web Speech Synthesis
  const speakText = useCallback((text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) {
      toast.error(t('ttsNotSupported'));
      return;
    }

    // If same message is speaking, toggle pause/resume
    if (speakingMsgId === msgId) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
      return;
    }

    // Stop any current playback
    window.speechSynthesis.cancel();
    setIsPaused(false);

    const cleanText = cleanForSpeech(text);
    const langCode = SPEECH_LANG_MAP[currentLang] || 'en-IN';
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langCode;

    const bestVoice = findBestVoice(langCode);
    if (bestVoice) {
      utterance.voice = bestVoice;
    } else {
      // Fallback: if no voice for language, use English and notify
      const fallback = findBestVoice('en-IN');
      if (fallback) utterance.voice = fallback;
      toast.info(t('voiceFallbackEnglish'));
    }

    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => { setSpeakingMsgId(null); setIsPaused(false); };
    utterance.onerror = () => { setSpeakingMsgId(null); setIsPaused(false); };
    window.speechSynthesis.speak(utterance);
    setSpeakingMsgId(msgId);
  }, [speakingMsgId, isPaused, currentLang, t]);

  // Stop speech completely
  const stopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeakingMsgId(null);
    setIsPaused(false);
  }, []);

  const streamChat = async (allMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
        userState: userState || undefined,
        language: currentLang,
      }),
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to get response');
    }
    if (!resp.body) throw new Error('No response body');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let assistantSoFar = '';
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') { streamDone = true; break; }
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantSoFar += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant' && last.id === 'streaming') {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
              }
              return [...prev, { id: 'streaming', role: 'assistant', content: assistantSoFar }];
            });
          }
        } catch { textBuffer = line + '\n' + textBuffer; break; }
      }
    }

    // Flush remaining
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split('\n')) {
        if (!raw) continue;
        if (raw.endsWith('\r')) raw = raw.slice(0, -1);
        if (raw.startsWith(':') || raw.trim() === '') continue;
        if (!raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantSoFar += content;
            setMessages((prev) => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
        } catch { /* ignore */ }
      }
    }

    setMessages((prev) => {
      const updated = prev.map((m) => m.id === 'streaming' ? { ...m, id: Date.now().toString() } : m);
      const lastMsg = updated[updated.length - 1];
      if (lastMsg?.role === 'assistant') {
        // Persist assistant reply
        persistMessage(lastMsg);
        // Auto-read the last assistant message if enabled
        if (autoReadEnabled) {
          setTimeout(() => speakText(lastMsg.content, lastMsg.id), 300);
        }
      }
      return updated;
    });
  };

  const handleSendMessage = async (text?: string) => {
    const msgText = text || inputMessage;
    if (!msgText.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msgText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    persistMessage(userMsg);
    setInputMessage('');
    setShowSuggestions(false);
    setIsTyping(true);
    try {
      const historyForAI = updatedMessages.filter((m) => m.id !== '1').map((m) => ({ role: m.role, content: m.content }));
      await streamChat(historyForAI as Message[]);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant', content: `❌ ${errorMsg}` }]);
    } finally { setIsTyping(false); }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const handleDiagnosisComplete = (summary: string, category: string) => {
    setShowDiagnosis(false);
    // Add a user message showing the diagnosis summary context
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `🩺 ${t('diagCompletedLabel')}\n\n${summary}`,
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    persistMessage(userMsg);
    setShowSuggestions(false);
    setIsTyping(true);

    const historyForAI = updatedMessages.filter((m) => m.id !== '1').map((m) => ({ role: m.role, content: m.content }));
    streamChat(historyForAI as Message[])
      .catch((e) => {
        const errorMsg = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
        setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant', content: `❌ ${errorMsg}` }]);
      })
      .finally(() => setIsTyping(false));
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="fixed bottom-6 right-6 z-50">
            <Button onClick={() => setIsOpen(true)} className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg" size="icon">
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            className={`fixed z-50 ${isFullScreen ? 'inset-4' : 'bottom-6 right-6 w-96 h-[500px]'} bg-card rounded-lg shadow-2xl border flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">NyayaBot</h3>
                  <p className="text-xs text-muted-foreground">
                    {userState ? `📍 ${userState} • ${t('aiLegalAssistantLabel')}` : t('aiLegalAwarenessAssistant')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" onClick={() => setIsFullScreen(!isFullScreen)}>
                  {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id}>
                    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-lg p-3 relative ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} ${speakingMsgId === message.id ? 'ring-2 ring-primary/40' : ''}`}>
                        <div className="flex items-start space-x-2">
                          {message.role === 'assistant' && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                          {message.role === 'user' && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                          <div className="text-sm prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Action buttons for assistant messages */}
                    {message.role === 'assistant' && message.id !== '1' && message.id !== 'streaming' && (
                      <>
                        <div className="mt-1 ml-6 flex items-center gap-1">
                          {/* Play / Pause button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 gap-1 text-muted-foreground hover:text-foreground"
                            onClick={() => speakText(message.content, message.id)}
                          >
                            {speakingMsgId === message.id ? (
                              isPaused ? (
                                <><Volume2 className="h-3 w-3" /> {t('resumeAudio')}</>
                              ) : (
                                <><Pause className="h-3 w-3" /> {t('pauseAudio')}</>
                              )
                            ) : (
                              <><Volume2 className="h-3 w-3" /> {t('playAudio')}</>
                            )}
                          </Button>
                          {/* Stop button (only when speaking) */}
                          {speakingMsgId === message.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-6 gap-1 text-muted-foreground hover:text-foreground"
                              onClick={stopSpeech}
                            >
                              <Square className="h-3 w-3" /> {t('stopAudio')}
                            </Button>
                          )}
                          {/* Sound wave animation */}
                          {speakingMsgId === message.id && !isPaused && (
                            <div className="flex items-end gap-0.5 h-3 ml-1">
                              {[1, 2, 3, 4].map(i => (
                                <motion.div
                                  key={i}
                                  className="w-0.5 bg-primary rounded-full"
                                  animate={{ height: ['3px', '12px', '3px'] }}
                                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }}
                                />
                              ))}
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 gap-1 text-muted-foreground hover:text-foreground"
                            onClick={() => copyText(message.content, message.id)}
                          >
                            {copiedMsgId === message.id ? (
                              <><Check className="h-3 w-3" /> {t('copied')}</>
                            ) : (
                              <><Copy className="h-3 w-3" /> {t('copyText')}</>
                            )}
                          </Button>
                        </div>
                        <div className="mt-2 max-w-[90%]">
                          <ChatActionCards messageContent={message.content} />
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Diagnosis Flow */}
                {showDiagnosis && (
                  <DiagnosisFlow
                    onComplete={handleDiagnosisComplete}
                    onCancel={() => setShowDiagnosis(false)}
                  />
                )}

                {/* Quick Suggestion Chips */}
                {showSuggestions && messages.length <= 1 && !isTyping && !showDiagnosis && (
                  <div className="space-y-3">
                    {/* Diagnose button */}
                    <button
                      onClick={() => setShowDiagnosis(true)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all text-left group"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Stethoscope className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t('diagStartButton')}</p>
                        <p className="text-[10px] text-muted-foreground">{t('diagStartDesc')}</p>
                      </div>
                    </button>

                    <p className="text-xs font-medium text-muted-foreground">{t('trySuggestions')}</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTION_KEYS.map((key) => (
                        <button
                          key={key}
                          onClick={() => handleSendMessage(t(key))}
                          className="text-xs px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                        >
                          {t(key)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isTyping && messages[messages.length - 1]?.id !== 'streaming' && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Recording indicator */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-2 border-t bg-destructive/5 flex items-center justify-center gap-3"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
                    </span>
                    <span className="text-xs font-medium text-destructive">{t('voiceListening')}</span>
                  </div>
                  {/* Waveform bars */}
                  <div className="flex items-end gap-0.5 h-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <motion.div
                        key={i}
                        className="w-1 bg-destructive/60 rounded-full"
                        animate={{ height: ['4px', '16px', '4px'] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs h-6 text-destructive" onClick={stopListening}>
                    {t('stopRecording')}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Processing indicator */}
            <AnimatePresence>
              {isProcessingVoice && !isListening && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-2 border-t bg-primary/5 flex items-center justify-center gap-2"
                >
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-primary font-medium">{t('processingVoice')}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="p-4 border-t bg-muted/30">
              <div className="flex space-x-2">
                {/* Voice Input Button */}
                <Button
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  className={`shrink-0 ${isListening ? 'animate-pulse' : ''}`}
                  onClick={isListening ? stopListening : startListening}
                  title={t('voiceInputTooltip')}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? t('voiceListening') : isProcessingVoice ? t('processingVoice') : t('chatbotInputPlaceholder')}
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button onClick={() => handleSendMessage()} size="icon" className="bg-primary hover:bg-primary/90" disabled={isTyping || !inputMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-2 text-center">
                {t('chatbotDisclaimerShort')}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
