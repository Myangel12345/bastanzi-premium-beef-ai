import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare } from 'lucide-react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Greetings! I am the AI Ranch Concierge. How can I assist you with beef shares, cut selections, freezer space, or tracking today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [...prev, { sender: 'user', text: userMsg, time: nowStr }]);
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg, history: messages.map((m) => `${m.sender}: ${m.text}`) }),
      });
      const data = await res.json();
      const botText = data.reply || 'Thank you for your inquiry. Our ranch concierge team is standing by to help.';

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Thank you for reaching out. Please check your tracking number on our track page or contact concierge@bastanzibeef.com for direct support.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Widget Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-bold rounded-full shadow-2xl shadow-amber-500/30 hover:scale-105 transition-all flex items-center gap-2 group border border-amber-300 ${
          isOpen ? 'hidden' : 'flex'
        }`}
        aria-label="Open AI Concierge"
      >
        <Sparkles className="w-5 h-5 text-black animate-pulse" />
        <span className="text-xs uppercase tracking-wider font-mono font-bold hidden sm:inline">AI Concierge</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md bg-[#0c130e] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px] max-h-[85vh] animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#12241a] to-[#0c1a12] p-4 border-b border-emerald-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-amber-200 text-sm">Ranch & Logistics Concierge</h3>
                <p className="text-[10px] text-stone-400 font-mono">Gemini AI • OGFCARGO Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#080d09]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-black font-medium rounded-tr-none'
                      : 'bg-[#14261b] text-stone-200 border border-emerald-800/50 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] font-mono text-stone-500 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-amber-400/80 text-xs font-mono p-2 bg-[#12241a]/60 rounded-xl w-fit">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Ranch Assistant is thinking...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-[#0a110c] border-t border-emerald-900/40 flex gap-1.5 overflow-x-auto text-[10px] font-mono">
            <button
              onClick={() => setInput('How much freezer space for a Quarter Share?')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-emerald-950 text-amber-300 border border-emerald-800/60 hover:border-amber-400"
            >
              Freezer space?
            </button>
            <button
              onClick={() => setInput('Grass-fed vs grain-finished difference?')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-emerald-950 text-amber-300 border border-emerald-800/60 hover:border-amber-400"
            >
              Grass vs Grain?
            </button>
            <button
              onClick={() => setInput('How do I track my OGFCARGO shipment?')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-emerald-950 text-amber-300 border border-emerald-800/60 hover:border-amber-400"
            >
              Tracking help?
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="p-3 bg-[#0f1b13] border-t border-emerald-800/60 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about beef shares, cuts, or tracking..."
              className="flex-1 bg-[#080e0a] border border-emerald-800/80 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 font-sans"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-amber-500 text-black rounded-xl hover:bg-amber-400 disabled:opacity-40 transition-colors shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
