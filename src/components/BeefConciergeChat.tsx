import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, RefreshCw, UserCheck, Headphones, AlertCircle, Info } from 'lucide-react';
import { ChatMessage, ChatConversation, ConversationStatus } from '../types';

interface BeefConciergeChatProps {
  onNavigateToReservation: () => void;
  onNavigateToContact: () => void;
}

const SUGGESTED_QUESTIONS = [
  "Which share size fits my freezer space?",
  "What is the difference between hanging weight and take-home weight?",
  "What is the pricing for shares smaller than an Eighth Share?",
  "Explain 100% Grass-Fed vs Grain-Finished cuts",
  "Which prime steaks are included in a Quarter Share?",
  "How does local Arizona delivery and nationwide shipping work?",
];

export default function BeefConciergeChat({
  onNavigateToReservation,
  onNavigateToContact,
}: BeefConciergeChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or load conversationId from localStorage
  useEffect(() => {
    let convId = localStorage.getItem('bastanzi_chat_conversation_id');
    if (!convId) {
      convId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      localStorage.setItem('bastanzi_chat_conversation_id', convId);
    }
    setConversationId(convId);
    fetchConversationState(convId);
  }, []);

  // Poll conversation every 3 seconds if drawer is open or if in escalated/human_handled state
  useEffect(() => {
    if (!conversationId) return;

    const interval = setInterval(() => {
      if (isOpen || conversation?.status === 'human_handled' || conversation?.status === 'escalated') {
        fetchConversationState(conversationId);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [conversationId, isOpen, conversation?.status]);

  const fetchConversationState = async (id: string) => {
    try {
      const res = await fetch(`/api/chat?conversationId=${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          setConversation(data.conversation);
        }
      }
    } catch (err) {
      // Quiet fail on network polling error
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [conversation?.messages, isOpen, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading || !conversationId) return;

    setLoading(true);
    if (!textToSend) setInputValue('');

    // Optimistically show user message
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowIso = new Date().toISOString();
    const tempUserMsg: ChatMessage = {
      id: 'temp_' + Date.now(),
      sender: 'user',
      text,
      timestamp: nowTime,
      createdAt: nowIso,
    };

    setConversation((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, tempUserMsg],
      };
    });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationId,
        }),
      });

      const data = await res.json();
      if (data.conversation) {
        setConversation(data.conversation);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const status = conversation?.status || 'ai_handled';

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-3 bg-[#102218] hover:bg-[#183223] border border-amber-400/80 text-amber-100 p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
          aria-label="Open AI Beef Concierge Chat"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-emerald-950 border border-amber-400 flex items-center justify-center text-amber-400">
              {status === 'human_handled' ? (
                <UserCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <Bot className="w-5 h-5 text-amber-400" />
              )}
            </div>
            {status === 'human_handled' ? (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
            ) : status === 'escalated' ? (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
            ) : (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full" />
            )}
            <span
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                status === 'human_handled'
                  ? 'bg-emerald-400'
                  : status === 'escalated'
                  ? 'bg-amber-400'
                  : 'bg-amber-400'
              }`}
            />
          </div>

          <div className="hidden sm:block text-left">
            <span className="font-serif font-bold text-xs text-amber-200 block leading-none">
              {status === 'human_handled' ? 'Live Representative' : 'AI Beef Concierge'}
            </span>
            <span className="text-[10px] text-amber-400/80 font-mono block mt-1">
              {status === 'human_handled' ? 'Agent connected' : 'Ask about shares & cuts'}
            </span>
          </div>
        </button>
      )}

      {/* Chat Window Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 w-full sm:w-[420px] h-full sm:h-[620px] bg-[#0c1a12] border border-amber-500/40 rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-100 font-sans">
          {/* Header */}
          <div className="p-4 bg-[#102218] border-b border-emerald-800/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
                  status === 'human_handled'
                    ? 'bg-emerald-900 border-emerald-400 text-emerald-300'
                    : 'bg-emerald-950 border-amber-400 text-amber-400'
                }`}
              >
                {status === 'human_handled' ? (
                  <Headphones className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-sm font-bold text-amber-200">
                    {status === 'human_handled'
                      ? 'Bastanzi Support Team'
                      : 'Bastanzi Beef Concierge'}
                  </h3>
                  {status === 'human_handled' ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Agent
                    </span>
                  ) : status === 'escalated' ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Connecting...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                      <Sparkles className="w-2.5 h-2.5" /> AI
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-stone-400 block font-light">
                  {status === 'human_handled'
                    ? 'Connected with a Bastanzi Representative'
                    : 'Pasture-Raised Luxury Beef Advisory'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-emerald-900/60 transition-colors"
              aria-label="Close Concierge Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Header Banner */}
          <div className="px-4 py-2 bg-[#14291d] border-b border-emerald-800/40 flex items-center justify-between text-[11px] shrink-0 font-serif">
            <span className="text-stone-300">Ready to secure your share?</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToContact();
                }}
                className="text-amber-400 hover:underline font-medium"
              >
                Contact for Pricing
              </button>
              <span className="text-emerald-800">|</span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToReservation();
                }}
                className="text-emerald-400 hover:underline font-bold"
              >
                Reserve Share →
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a180f]">
            {conversation?.messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSystem = msg.sender === 'system';
              const isHumanAgent = msg.sender === 'human_agent';

              if (isSystem) {
                return (
                  <div
                    key={msg.id}
                    className="my-3 mx-auto max-w-[90%] text-center text-[10px] font-mono bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 px-3 py-1.5 rounded-full flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Info className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{msg.text}</span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[88%] ${
                    isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  {!isUser && (
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 border ${
                        isHumanAgent
                          ? 'bg-emerald-900 border-emerald-400 text-emerald-300'
                          : 'bg-emerald-950 border-amber-500/40 text-amber-400'
                      }`}
                    >
                      {isHumanAgent ? <Headphones className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                  )}

                  <div
                    className={`rounded-xl p-3.5 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-amber-500 text-emerald-950 font-medium rounded-tr-none'
                        : isHumanAgent
                        ? 'bg-[#183827] border border-emerald-500/60 text-emerald-50 rounded-tl-none font-normal space-y-1 shadow-md'
                        : 'bg-[#102218] border border-emerald-800/60 text-stone-200 rounded-tl-none font-light space-y-2'
                    }`}
                  >
                    {isHumanAgent && (
                      <span className="block text-[10px] font-bold text-amber-300 uppercase font-serif tracking-wider mb-1">
                        Bastanzi Representative
                      </span>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        isUser
                          ? 'text-emerald-900/80 font-mono'
                          : isHumanAgent
                          ? 'text-emerald-300/70 font-mono'
                          : 'text-stone-500 font-mono'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-amber-300 bg-[#102218] border border-emerald-800/60 p-3 rounded-xl max-w-[80%] rounded-tl-none">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400 shrink-0" />
                <span className="font-serif italic">
                  {status === 'human_handled'
                    ? 'Representative typing...'
                    : 'Concierge is composing advice...'}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions (only show if AI mode) */}
          {status === 'ai_handled' && (
            <div className="p-2 bg-[#0c1a12] border-t border-emerald-900/60 shrink-0 overflow-x-auto">
              <span className="text-[10px] text-stone-400 font-mono uppercase px-2 block mb-1">
                Suggested Topics:
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    disabled={loading}
                    className="whitespace-nowrap text-[10px] px-2.5 py-1 bg-[#12241a] hover:bg-[#183223] text-amber-200/90 border border-emerald-800/60 rounded-full shrink-0 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#102218] border-t border-emerald-800/60 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                status === 'human_handled'
                  ? 'Message your live representative...'
                  : 'Ask about shares, cuts, freezer space, pricing...'
              }
              className="flex-1 bg-[#0c1a12] border border-emerald-800/60 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-emerald-950 font-bold rounded-xl transition-all shrink-0"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
