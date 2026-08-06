import { useState } from 'react';
import { Package, Check, ArrowRight, Info, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { BEEF_SHARE_TIERS } from '../data/content';
import { ShareSize } from '../types';
import SeoHead from '../components/SeoHead';

interface BeefSharesPageProps {
  onSelectShare: (shareSize: ShareSize) => void;
  onNavigateToContact?: () => void;
}

export default function BeefSharesPage({ onSelectShare, onNavigateToContact }: BeefSharesPageProps) {
  const [selectedShareModal, setSelectedShareModal] = useState<ShareSize | null>(null);
  const [expandedTier, setExpandedTier] = useState<ShareSize>('Half');

  const selectedTier = BEEF_SHARE_TIERS.find((t) => t.id === selectedShareModal);

  return (
    <div className="bg-[#0a180f] text-[#f7f2e8] min-h-screen pb-20">
      <SeoHead
        title="Beef Share Tiers & Pricing | Full, Half, Quarter & Eighth Shares"
        description="Explore Bastanzi Beef Share pricing: Full Share ($3,300–$4,200), Half Share ($1,650–$2,085), Quarter Share ($850–$1,050), Eighth Share ($450–$550). 21-day dry aged."
      />

      {/* Header */}
      <section className="py-16 bg-[#0c1a12] border-b border-emerald-900/60 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest bg-emerald-900/60 px-3 py-1 rounded-full border border-amber-500/30">
            TRANSPARENT BEEF SHARE PRICING
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">
            Pasture-Raised Beef Shares & Cuts
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto font-light">
            Choose the share size that fits your household and freezer space. All shares are 21-day dry aged, flash frozen, and delivered with custom butcher options.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {BEEF_SHARE_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`bg-[#102218] rounded-2xl p-6 border transition-all flex flex-col justify-between relative ${
                tier.featured
                  ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-2xl shadow-amber-500/10 bg-[#14281d]'
                  : 'border-emerald-800/50 hover:border-amber-500/40'
              }`}
            >
              <div>
                {tier.image && (
                  <div className="w-full h-44 overflow-hidden rounded-xl mb-4 border border-emerald-800/60 shadow-inner">
                    <img
                      src={tier.image}
                      alt={`${tier.title} package`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="text-center border-b border-emerald-900/60 pb-5 mb-5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block mb-1">
                    {tier.id === 'Full' ? 'Whole Animal' : `${tier.id} Share`}
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-amber-200">{tier.title}</h2>
                  <p className="text-amber-400 font-serif font-bold text-xl mt-3">{tier.priceRange}</p>
                  <span className="text-[11px] text-stone-400 font-mono block mt-1">
                    Deposit: ${tier.depositAmount}
                  </span>
                </div>

                <div className="space-y-3 text-xs mb-6 font-light">
                  <div className="flex justify-between border-b border-emerald-900/60 pb-1.5">
                    <span className="text-stone-300">Packaged Weight:</span>
                    <span className="text-white font-mono font-medium">{tier.weightLbs}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-900/60 pb-1.5">
                    <span className="text-stone-300">Freezer Required:</span>
                    <span className="text-amber-300 font-mono">{tier.cubicFeet} cu. ft.</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-900/60 pb-1.5">
                    <span className="text-stone-300">Portion Yield:</span>
                    <span className="text-emerald-400 font-mono">~{tier.approxMeals} meals</span>
                  </div>

                  <p className="text-[11px] text-stone-300 italic pt-2">
                    {tier.bestFor}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-emerald-900/60">
                <button
                  onClick={() => setSelectedShareModal(tier.id)}
                  className="w-full py-2 bg-[#12241a] hover:bg-[#182e21] text-amber-200 text-xs font-serif rounded-lg border border-emerald-800/60 flex items-center justify-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>View Cut Checklist</span>
                </button>

                <button
                  onClick={() => onSelectShare(tier.id)}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-serif font-bold text-xs uppercase tracking-widest rounded-lg shadow-md transition-all"
                >
                  Reserve {tier.id} Share
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Smaller Shares & Custom Bundles (< 1/8th Beef Share) Callout */}
        <div className="bg-[#14281d] border border-amber-500/40 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-emerald-950 px-3 py-1 rounded-full border border-amber-500/30">
              SMALLER PORTIONS & CUSTOM BUNDLES
            </span>
            <h3 className="font-serif text-2xl font-bold text-amber-100">
              Shares Smaller Than an Eighth Beef Share (&lt; 50 lbs)
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm max-w-2xl font-light leading-relaxed">
              Looking for custom individual cut boxes, small family sampler packs, or trial orders smaller than our 1/8th Beef Share? We offer tailored custom bundles to fit your exact freezer space and culinary preferences.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-mono text-amber-300 pt-1">
              <span>• Custom Packaged Weight (&lt; 50 lbs)</span>
              <span>• Fits Standard Fridge Freezer</span>
              <span>• 21-Day Dry Aged</span>
            </div>
          </div>

          <div className="shrink-0 text-center space-y-2 w-full md:w-auto">
            <span className="text-xs text-stone-400 block font-mono">Custom Pricing:</span>
            <span className="font-serif font-bold text-xl sm:text-2xl text-amber-300 block bg-[#0c1a12] px-4 py-2 rounded-xl border border-amber-500/30">
              Contact for Pricing
            </span>
            <button
              onClick={() => onNavigateToContact ? onNavigateToContact() : (window.location.hash = 'contact')}
              className="w-full md:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-serif font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Inquire for Custom Pricing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Detailed Cut Breakdown Accordions */}
        <div className="bg-[#102218] border border-emerald-800/60 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-emerald-900/60 pb-4">
            <h3 className="font-serif text-2xl font-bold text-amber-200">
              Detailed Cut Distribution By Share Size
            </h3>
            <p className="text-xs text-stone-300 mt-1 font-light">
              Click on any share tier below to view exact steak, roast, and ground beef counts.
            </p>
          </div>

          <div className="space-y-4">
            {BEEF_SHARE_TIERS.map((tier) => {
              const isOpen = expandedTier === tier.id;
              return (
                <div
                  key={tier.id}
                  className="bg-[#12241a] border border-emerald-800/40 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setExpandedTier(isOpen ? ('Half' as ShareSize) : tier.id)}
                    className="w-full p-4 flex items-center justify-between text-left font-serif hover:bg-[#182e21] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-emerald-950 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold flex items-center justify-center">
                        {tier.id[0]}
                      </span>
                      <div>
                        <span className="font-bold text-amber-100 text-base">{tier.title}</span>
                        <span className="text-xs text-amber-400/80 font-mono ml-3">{tier.priceRange}</span>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-amber-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-stone-400" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-5 border-t border-emerald-900/60 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#0c1a12] text-xs font-light">
                      <div>
                        <h4 className="font-serif font-bold text-amber-300 mb-2 uppercase tracking-wider text-[11px]">
                          🥩 Prime Steaks
                        </h4>
                        <ul className="space-y-1 text-stone-300">
                          {tier.cutSummary.steaks.map((s, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-serif font-bold text-amber-300 mb-2 uppercase tracking-wider text-[11px]">
                          🍖 Roasts & Slow Cooking Cuts
                        </h4>
                        <ul className="space-y-1 text-stone-300">
                          {tier.cutSummary.roastsAndSlow.map((r, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-serif font-bold text-amber-300 mb-2 uppercase tracking-wider text-[11px]">
                          🍔 Ground Beef & Specialty
                        </h4>
                        <ul className="space-y-1 text-stone-300">
                          {tier.cutSummary.groundAndSpecialty.map((g, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>{g}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal Checklist View */}
      {selectedTier && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#102218] border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 text-white relative shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedShareModal(null)}
              className="absolute top-4 right-4 p-1 text-stone-400 hover:text-white"
            >
              ✕
            </button>

            <div className="border-b border-emerald-900/60 pb-3">
              <span className="text-[10px] font-mono uppercase text-amber-400">CUT CHECKLIST</span>
              <h3 className="font-serif text-2xl font-bold text-amber-200">{selectedTier.title}</h3>
              <p className="text-amber-400 font-mono text-sm mt-1">{selectedTier.priceRange}</p>
            </div>

            <div className="space-y-3 text-xs max-h-80 overflow-y-auto pr-1 font-light">
              <div className="bg-[#0c1a12] p-3 rounded-lg border border-emerald-900/60">
                <span className="font-serif font-bold text-amber-300 block mb-1">Steaks Included:</span>
                <ul className="space-y-1 text-stone-300">
                  {selectedTier.cutSummary.steaks.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0c1a12] p-3 rounded-lg border border-emerald-900/60">
                <span className="font-serif font-bold text-amber-300 block mb-1">Roasts & Slow Cooking:</span>
                <ul className="space-y-1 text-stone-300">
                  {selectedTier.cutSummary.roastsAndSlow.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0c1a12] p-3 rounded-lg border border-emerald-900/60">
                <span className="font-serif font-bold text-amber-300 block mb-1">Ground & Specialty:</span>
                <ul className="space-y-1 text-stone-300">
                  {selectedTier.cutSummary.groundAndSpecialty.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setSelectedShareModal(null)}
                className="w-1/2 py-2.5 bg-[#12241a] text-stone-300 rounded-lg text-xs font-serif"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const size = selectedTier.id;
                  setSelectedShareModal(null);
                  onSelectShare(size);
                }}
                className="w-1/2 py-2.5 bg-amber-500 text-emerald-950 font-serif font-bold text-xs uppercase rounded-lg"
              >
                Reserve This Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
