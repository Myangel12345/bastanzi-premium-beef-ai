import React, { useState, useEffect, useRef } from 'react';
import SeoHead from '../components/SeoHead';
import {
  ShieldCheck,
  Headphones,
  Bot,
  User,
  Send,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  LogOut,
  Sparkles,
  ArrowRight,
  Info,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { ChatConversation, ChatMessage, ConversationStatus } from '../types';

export default function AdminChatPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // 5-minute Inactivity Auto-Logout state
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  // Conversations state
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [activeConv, setActiveConv] = useState<ChatConversation | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Reply input state
  const [replyInput, setReplyInput] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check auth session on mount
  useEffect(() => {
    const session = localStorage.getItem('bastanzi_admin_chat_auth');
    if (session === 'true' || session === 'bastanzi2026') {
      setIsAuthenticated(true);
    }
  }, []);

  // 5-Minute Inactivity Auto-Logout Effect
  useEffect(() => {
    if (!isAuthenticated) return;

    const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
    const WARNING_TIMEOUT_MS = 4 * 60 * 1000;    // 4 minutes

    const resetActivityTimer = () => {
      setLastActivity(Date.now());
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetActivityTimer));

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivity;

      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        setIsAuthenticated(false);
        localStorage.removeItem('bastanzi_admin_chat_auth');
        setShowInactivityWarning(false);
        setAuthError('Session expired after 5 minutes of inactivity for security.');
      } else if (elapsed >= WARNING_TIMEOUT_MS) {
        setShowInactivityWarning(true);
        const remaining = Math.max(0, Math.ceil((INACTIVITY_TIMEOUT_MS - elapsed) / 1000));
        setSecondsRemaining(remaining);
      } else {
        setShowInactivityWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetActivityTimer));
      clearInterval(interval);
    };
  }, [isAuthenticated, lastActivity]);

  const extendSession = () => {
    setLastActivity(Date.now());
    setShowInactivityWarning(false);
  };

  // Poll conversations every 3 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    loadConversations();
    const interval = setInterval(() => {
      loadConversations();
    }, 3000);

    return () => clearInterval(interval);
  }, [isAuthenticated, statusFilter]);

  // Keep active conversation synced
  useEffect(() => {
    if (!selectedConvId || !conversations.length) return;
    const found = conversations.find((c) => c.id === selectedConvId);
    if (found) {
      setActiveConv(found);
    }
  }, [conversations, selectedConvId]);

  // Scroll active chat to bottom on message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const loadConversations = async () => {
    try {
      const res = await fetch(`/api/chat-admin?status=${statusFilter}&token=bastanzi2026`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (
      (loginEmail.toLowerCase() === 'admin@bastanzibeef.com' && loginPassword === 'bastanzi2026') ||
      loginPassword === 'bastanzi2026'
    ) {
      setIsAuthenticated(true);
      localStorage.setItem('bastanzi_admin_chat_auth', 'true');
      setLastActivity(Date.now());
    } else {
      setAuthError('Invalid admin email or password.');
    }
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('bastanzi_admin_chat_auth');
  };

  const handleAdminAction = async (action: 'take_over' | 'send_message' | 'return_to_ai' | 'resolve', text?: string) => {
    if (!selectedConvId) return;
    setSending(true);

    try {
      const res = await fetch('/api/chat-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer bastanzi2026',
        },
        body: JSON.stringify({
          conversationId: selectedConvId,
          action,
          messageText: text,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          setActiveConv(data.conversation);
          loadConversations();
        }
        if (action === 'send_message') {
          setReplyInput('');
        }
      }
    } catch (err) {
      console.error('Admin action error:', err);
    } finally {
      setSending(false);
    }
  };

  // Filtered list based on search query
  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = (c.customerName || '').toLowerCase().includes(q);
    const emailMatch = (c.customerEmail || '').toLowerCase().includes(q);
    const idMatch = c.id.toLowerCase().includes(q);
    const msgMatch = c.lastMessage.toLowerCase().includes(q);
    return nameMatch || emailMatch || idMatch || msgMatch;
  });

  const escalatedCount = conversations.filter((c) => c.status === 'escalated').length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] bg-black text-white flex items-center justify-center p-4">
        <SeoHead
          title="Admin Live Chat Portal | Bastanzi Premium Beef Co."
          description="Secure live chat management console for Bastanzi Premium Beef Co. customer support."
        />
        <div className="w-full max-w-md bg-[#0d1f14] border border-amber-500/40 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-950 border border-amber-400 rounded-full flex items-center justify-center text-amber-400 mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-amber-200">
              Admin Live Chat Console
            </h1>
            <p className="text-xs text-stone-400">
              Bastanzi Premium Beef Co. Customer Support
            </p>
          </div>

          {authError && (
            <div className="bg-red-950/80 border border-red-500/50 text-red-200 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@bastanzibeef.com"
                className="w-full bg-[#08140c] border border-emerald-800 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#08140c] border border-emerald-800 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Authenticate Session</span>
            </button>
          </form>

          <div className="text-[11px] text-center text-stone-500 border-t border-emerald-900/60 pt-4 font-mono">
            Protected area. Session automatically logs out after 5 mins of inactivity.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-stone-100 font-sans flex flex-col">
      <SeoHead
        title="Live Customer Chat | Admin Console | Bastanzi Premium Beef Co."
        description="Live chat support handoff dashboard for Bastanzi Premium Beef Co."
      />

      {/* Inactivity Warning Modal */}
      {showInactivityWarning && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1f14] border border-amber-500/60 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="font-serif text-lg font-bold text-amber-200">
              Inactivity Timeout Warning
            </h3>
            <p className="text-xs text-stone-300">
              Your admin chat session will automatically log out in{' '}
              <span className="font-bold text-amber-400 font-mono text-sm">
                {secondsRemaining}s
              </span>{' '}
              due to security policy.
            </p>
            <button
              onClick={extendSession}
              className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-2.5 rounded-xl transition-all text-xs"
            >
              Extend Session
            </button>
          </div>
        </div>
      )}

      {/* Top Console Header */}
      <header className="bg-[#0b1a10] border-b border-emerald-800/80 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-950 border border-amber-400 rounded-full flex items-center justify-center text-amber-400 font-serif font-bold text-xs">
            B
          </div>
          <div>
            <h1 className="font-serif font-bold text-sm text-amber-200 flex items-center gap-2">
              Bastanzi Admin Live Chat Console
            </h1>
            <span className="text-[10px] text-stone-400 font-mono">
              Real-time Customer Support & AI Handoff
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {escalatedCount > 0 && (
            <div className="bg-amber-500/20 border border-amber-500/50 text-amber-300 px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{escalatedCount} Needs Human</span>
            </div>
          )}

          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 bg-emerald-950/80 border border-emerald-800/60 px-3 py-1.5 rounded-xl transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-mono">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Conversation List */}
        <div className="w-full sm:w-80 lg:w-96 bg-[#08140c] border-r border-emerald-900/80 flex flex-col shrink-0">
          {/* Search & Filter */}
          <div className="p-3 border-b border-emerald-900/60 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search visitor, email, message..."
                className="w-full bg-[#0c1a12] border border-emerald-800/60 focus:border-amber-400 rounded-xl pl-8 pr-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar text-[10px] font-mono pt-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'escalated', label: `🚨 Needs Human (${escalatedCount})` },
                { id: 'human_handled', label: 'Active Agent' },
                { id: 'ai_handled', label: 'AI Handled' },
                { id: 'resolved', label: 'Resolved' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap transition-colors ${
                    statusFilter === f.id
                      ? 'bg-amber-500 text-emerald-950 font-bold'
                      : 'bg-[#102218] text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-emerald-950">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-2 text-stone-500 text-xs font-light">
                <MessageSquare className="w-8 h-8 mx-auto opacity-30 text-amber-400" />
                <p>No active conversations match filter.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConvId === conv.id;
                const isEscalated = conv.status === 'escalated';
                const isHuman = conv.status === 'human_handled';

                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      setActiveConv(conv);
                    }}
                    className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-[#142d1f] border-l-4 border-amber-400'
                        : 'hover:bg-[#0c1c11]'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-0.5 text-xs font-bold ${
                        isEscalated
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : isHuman
                          ? 'bg-emerald-900 border-emerald-400 text-emerald-300'
                          : 'bg-emerald-950 border-emerald-800 text-stone-400'
                      }`}
                    >
                      {isHuman ? <Headphones className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-serif font-bold text-xs text-stone-200 truncate">
                          {conv.customerName || 'Guest Visitor'}
                        </span>
                        <span className="text-[9px] text-stone-500 font-mono shrink-0">
                          {new Date(conv.updatedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-400 truncate mt-0.5 font-light">
                        {conv.lastMessage}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        {isEscalated && (
                          <span className="text-[9px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 animate-pulse">
                            🚨 Needs Human
                          </span>
                        )}
                        {isHuman && (
                          <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                            Live Agent
                          </span>
                        )}
                        {conv.status === 'ai_handled' && (
                          <span className="text-[9px] font-mono text-stone-500 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">
                            AI
                          </span>
                        )}
                        {conv.status === 'resolved' && (
                          <span className="text-[9px] font-mono text-stone-500 bg-stone-900 px-1.5 py-0.5 rounded">
                            Resolved
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel - Chat Detail */}
        <div className="flex-1 bg-[#0a180f] flex flex-col overflow-hidden">
          {activeConv ? (
            <>
              {/* Active Conversation Control Header */}
              <div className="p-4 bg-[#102218] border-b border-emerald-800/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif font-bold text-base text-amber-200">
                      {activeConv.customerName || 'Guest Visitor'}
                    </h2>
                    <span className="text-xs font-mono text-stone-400">
                      ({activeConv.customerEmail || 'No email provided'})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-400 font-mono">
                    <span>ID: {activeConv.id}</span>
                    <span>•</span>
                    <span>
                      Status:{' '}
                      <strong className="text-amber-400 uppercase">{activeConv.status}</strong>
                    </span>
                  </div>
                </div>

                {/* Handoff & Resolution Buttons */}
                <div className="flex items-center gap-2">
                  {activeConv.status !== 'human_handled' && (
                    <button
                      onClick={() => handleAdminAction('take_over')}
                      disabled={sending}
                      className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>Take Over Chat</span>
                    </button>
                  )}

                  {activeConv.status === 'human_handled' && (
                    <button
                      onClick={() => handleAdminAction('return_to_ai')}
                      disabled={sending}
                      className="bg-emerald-900 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all font-mono"
                    >
                      <Bot className="w-3.5 h-3.5 text-amber-400" />
                      <span>Hand Back to AI</span>
                    </button>
                  )}

                  {activeConv.status !== 'resolved' && (
                    <button
                      onClick={() => handleAdminAction('resolve')}
                      disabled={sending}
                      className="bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Resolve</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Messages History Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#08140c]">
                {activeConv.messages.map((m) => {
                  const isUser = m.sender === 'user';
                  const isSystem = m.sender === 'system';
                  const isHumanAgent = m.sender === 'human_agent';

                  if (isSystem) {
                    return (
                      <div
                        key={m.id}
                        className="my-3 mx-auto max-w-md text-center text-xs font-mono bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 px-4 py-2 rounded-full flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{m.text}</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m.id}
                      className={`flex gap-3 max-w-[80%] ${
                        isHumanAgent
                          ? 'ml-auto flex-row-reverse'
                          : isUser
                          ? 'mr-auto'
                          : 'mr-auto'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 border text-xs font-bold ${
                          isHumanAgent
                            ? 'bg-amber-500 text-emerald-950 border-amber-300'
                            : isUser
                            ? 'bg-stone-800 border-stone-600 text-stone-200'
                            : 'bg-emerald-950 border-amber-500/40 text-amber-400'
                        }`}
                      >
                        {isHumanAgent ? (
                          <Headphones className="w-4 h-4" />
                        ) : isUser ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>

                      <div
                        className={`rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                          isHumanAgent
                            ? 'bg-amber-500 text-emerald-950 font-medium rounded-tr-none'
                            : isUser
                            ? 'bg-[#12241a] border border-emerald-800/80 text-stone-100 rounded-tl-none font-normal'
                            : 'bg-[#0f1f15] border border-emerald-900/60 text-stone-300 rounded-tl-none font-light'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1 border-b border-black/10 pb-1">
                          <span className="font-serif font-bold text-[10px] uppercase tracking-wider">
                            {isHumanAgent
                              ? 'Support Agent (You)'
                              : isUser
                              ? activeConv.customerName || 'Customer'
                              : 'AI Concierge'}
                          </span>
                          <span className="text-[9px] font-mono opacity-60">{m.timestamp}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Admin Reply Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (replyInput.trim()) {
                    handleAdminAction('send_message', replyInput);
                  }
                }}
                className="p-4 bg-[#102218] border-t border-emerald-800/60 flex items-center gap-3 shrink-0"
              >
                <input
                  type="text"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder={
                    activeConv.status === 'human_handled'
                      ? 'Type message to send directly to customer...'
                      : 'Click "Take Over Chat" above to respond as live agent...'
                  }
                  className="flex-1 bg-[#08140c] border border-emerald-800/60 focus:border-amber-400 rounded-xl px-4 py-3 text-xs text-stone-100 placeholder-stone-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!replyInput.trim() || sending}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-emerald-950 font-bold px-5 py-3 rounded-xl transition-all text-xs flex items-center gap-2 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-500 space-y-3">
              <div className="w-16 h-16 bg-emerald-950/60 border border-emerald-800/60 rounded-full flex items-center justify-center text-amber-400">
                <MessageSquare className="w-8 h-8 opacity-40" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-300">
                Select a Customer Conversation
              </h3>
              <p className="text-xs max-w-sm text-stone-400">
                Choose a conversation from the left sidebar to inspect chat history, take over as live agent, or manage AI handoff.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
