import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, ArrowRight, CornerDownLeft, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'concierge';
  text: string;
  timestamp: string;
}

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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'concierge',
      text: "Welcome to Bastanzi Premium Beef Co. I am your AI Beef Concierge. How may I assist you today? Ask me anything about our pasture-raised 21-day dry-aged shares, pricing, freezer requirements, cut checklists, or custom butcher specs.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setLoading(true);

    // Build history for backend
    const history = messages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      content: m.text,
    }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();
      const replyText = data.reply || data.error || "Our concierge desk is temporarily busy. Please feel free to call us at (582) 288-9348 or explore our Beef Shares page!";

      const conciergeMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'concierge',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, conciergeMsg]);
    } catch (err) {
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'concierge',
        text: "I apologize for the brief delay. Bastanzi Premium Beef offers Full ($3,300–$4,200), Half ($1,650–$2,085), Quarter ($850–$1,050), and Eighth ($450–$550) Beef Shares. For custom smaller quantities, please click 'Contact for Pricing'!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

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
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full" />
          </div>

          <div className="hidden sm:block text-left">
            <span className="font-serif font-bold text-xs text-amber-200 block leading-none">
              AI Beef Concierge
            </span>
            <span className="text-[10px] text-amber-400/80 font-mono block mt-1">
              Ask about shares & cuts
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
              <div className="w-9 h-9 rounded-full bg-emerald-950 border border-amber-400 flex items-center justify-center text-amber-400 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-sm font-bold text-amber-200">Bastanzi Beef Concierge</h3>
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 block font-light">Pasture-Raised Luxury Beef Advisory</span>
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
                onClick={() => { setIsOpen(false); onNavigateToContact(); }}
                className="text-amber-400 hover:underline font-medium"
              >
                Contact for Pricing
              </button>
              <span className="text-emerald-800">|</span>
              <button
                onClick={() => { setIsOpen(false); onNavigateToReservation(); }}
                className="text-emerald-400 hover:underline font-bold"
              >
                Reserve Share →
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a180f]">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[88%] ${
                    isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-emerald-950 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`rounded-xl p-3.5 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-amber-500 text-emerald-950 font-medium rounded-tr-none'
                        : 'bg-[#102218] border border-emerald-800/60 text-stone-200 rounded-tl-none font-light space-y-2'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        isUser ? 'text-emerald-900/80 font-mono' : 'text-stone-500 font-mono'
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
                <span className="font-serif italic">Concierge is composing advice...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
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
              placeholder="Ask about shares, cuts, freezer space, pricing..."
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
