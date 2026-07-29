import { X, FileCode2, Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface SitemapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SitemapModal({ isOpen, onClose }: SitemapModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const baseUrl = window.location.origin;
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/#about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#shares</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/#gallery</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/#faq</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/#reservation</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>${baseUrl}/#contact</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

  const copyXml = () => {
    navigator.clipboard.writeText(xmlContent);
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
          <FileCode2 className="w-6 h-6 text-amber-400" />
          <div>
            <h3 className="font-serif text-lg text-amber-200 font-bold">SEO Sitemap Generator</h3>
            <p className="text-xs text-zinc-400">Live generated sitemap.xml for Google Search Console indexing.</p>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-mono"
          >
            <span>Open /sitemap.xml endpoint</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={copyXml}
            className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-xs hover:bg-amber-500/30 flex items-center gap-1 font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied XML!' : 'Copy sitemap.xml'}</span>
          </button>
        </div>

        <pre className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 text-xs font-mono text-zinc-300 max-h-72 overflow-y-auto">
          {xmlContent}
        </pre>

        <div className="mt-6 flex justify-between items-center text-xs text-zinc-500">
          <span>7 URLs indexed with priority weightings.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
