import { X, Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { BRAND_IMAGES, BUSINESS_INFO } from '../data/content';

interface OpenGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OpenGraphModal({ isOpen, onClose }: OpenGraphModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.origin;
  const ogTags = `<meta property="og:title" content="${BUSINESS_INFO.name} | Luxury Ranch Beef Shares" />
<meta property="og:description" content="Reserve premium pasture-raised dry-aged beef shares from Bastanzi Beef Co. Direct from Montana pastures." />
<meta property="og:image" content="${currentUrl}${BRAND_IMAGES.heroRanch}" />
<meta property="og:url" content="${currentUrl}" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />`;

  const copyTags = () => {
    navigator.clipboard.writeText(ogTags);
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
          <Share2 className="w-6 h-6 text-amber-400" />
          <div>
            <h3 className="font-serif text-lg text-amber-200 font-bold">Open Graph & Social Cards</h3>
            <p className="text-xs text-zinc-400">Live preview of social media share previews for iMessage, Twitter & Facebook.</p>
          </div>
        </div>

        {/* Social Card Preview */}
        <div className="mb-6">
          <span className="text-xs text-amber-400/80 uppercase font-mono tracking-wider block mb-2">Social Card Preview</span>
          <div className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shadow-xl">
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <img
                src={BRAND_IMAGES.heroRanch}
                alt="OG Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/30 text-[10px] text-amber-300 font-mono">
                BASTANZI BEEF CO.
              </div>
            </div>
            <div className="p-4 bg-zinc-900">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono block">BASTANZIBEEF.COM</span>
              <h4 className="font-serif text-base text-amber-100 font-bold mt-1">
                Bastanzi Premium Beef Co. | Luxury Ranch Beef Shares
              </h4>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                Reserve premium ranch-raised dry-aged beef shares from Bastanzi Beef Co. 100% pasture-raised Full, Half, Quarter & Eighth shares delivered nationwide.
              </p>
            </div>
          </div>
        </div>

        {/* Generated HTML Code */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-400 font-mono">HTML &lt;head&gt; Open Graph Snippet</span>
            <button
              onClick={copyTags}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Snippet!' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-[11px] font-mono text-amber-200/80 overflow-x-auto">
            {ogTags}
          </pre>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg text-white"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
