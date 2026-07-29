import { X, Code, CheckCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface VercelConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VercelConfigModal({ isOpen, onClose }: VercelConfigModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const vercelJson = `{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/sitemap.xml", "destination": "/sitemap.xml" },
    { "source": "/robots.txt", "destination": "/robots.txt" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}`;

  const copyConfig = () => {
    navigator.clipboard.writeText(vercelJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-amber-500/30 rounded-xl max-w-2xl w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 border-b border-zinc-800 pb-3">
          <Code className="w-6 h-6 text-amber-400" />
          <div>
            <h3 className="font-serif text-lg text-amber-200 font-bold">Vercel & GitHub Deployment Setup</h3>
            <p className="text-xs text-zinc-400">Production-ready configurations for Vercel, Supabase, and Resend.</p>
          </div>
        </div>

        {/* Readiness checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2 text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>GitHub Repository Structure Ready</span>
          </div>
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2 text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>vercel.json Config Created</span>
          </div>
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2 text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Supabase Database Table Schema Ready</span>
          </div>
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2 text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Resend Email API Webhook Integration</span>
          </div>
        </div>

        {/* Vercel JSON display */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono text-zinc-400">vercel.json Config File</span>
            <button
              onClick={copyConfig}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied json!' : 'Copy vercel.json'}</span>
            </button>
          </div>
          <pre className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-xs font-mono text-amber-300/90 overflow-x-auto">
            {vercelJson}
          </pre>
        </div>

        <div className="mt-6 flex justify-between items-center text-xs text-zinc-500">
          <span>Environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, RESEND_API_KEY</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg text-white"
          >
            Close Setup
          </button>
        </div>
      </div>
    </div>
  );
}
