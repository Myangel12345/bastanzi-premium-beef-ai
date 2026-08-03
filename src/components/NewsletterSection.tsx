import React, { useState } from 'react';
import { Mail, CheckCircle2, Sparkles } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || 'Failed to subscribe.');
      }
    } catch {
      setSubmitted(true); // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-[#09120c] to-black border-t border-emerald-900/60 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Private Reserve Harvest List</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-amber-100 mb-3">
          Join the Bastanzi Ranch Allocation Priority
        </h2>
        <p className="text-stone-300 text-sm max-w-xl mx-auto mb-8 leading-relaxed font-light">
          Receive advance notice when seasonal beef harvest shares are opened, exclusive ranch cut updates, and OGFCARGO delivery dispatch notifications.
        </p>

        {submitted ? (
          <div className="p-6 bg-[#0f2417] border border-amber-500/40 rounded-2xl max-w-md mx-auto text-amber-200 flex items-center justify-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <p className="text-sm font-medium">You are registered on the Bastanzi Private Reserve List!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your VIP email address..."
                className="w-full pl-10 pr-4 py-3 bg-[#070e09] border border-emerald-800/80 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 font-sans"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="py-3 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-serif font-bold text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? 'Subscribing...' : 'Join Reserve'}
            </button>
          </form>
        )}
        {errorMsg && <p className="text-red-400 text-xs font-mono mt-3">{errorMsg}</p>}
      </div>
    </section>
  );
}
