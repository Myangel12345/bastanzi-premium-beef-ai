import { useState } from 'react';
import { Package, Check, ArrowRight, Info, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { BEEF_SHARE_TIERS } from '../data/content';
import { ShareSize } from '../types';
import SeoHead from '../components/SeoHead';

interface BeefSharesPageProps {
  onSelectShare: (shareSize: ShareSize) => void;
}

export default function BeefSharesPage({ onSelectShare }: BeefSharesPageProps) {
  const [selectedShareModal, setSelectedShareModal] = useState<ShareSize | null>(null);
  const [expandedTier, setExpandedTier] = useState<ShareSize>('Half');

  const selectedTier = BEEF_SHARE_TIERS.find((t) => t.id === selectedShareModal);

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen pb-20">
      <SeoHead
        title="Beef Share Tiers & Pricing | Full, Half, Quarter & Eighth Shares"
        description="Explore Bastanzi Beef Share pricing: Full Share ($3,300–$4,200), Half Share ($1,650–$2,085), Quarter Share ($850–$1,050), Eighth Share ($450–$550). 21-day dry aged."
      />

      {/* Header */}
      <section className="py-16 bg-[#111111] border-b border-[#C5A028]/20 text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-3">
          <span className="text-[10px] font-mono text-[#C5A028] uppercase tracking-[0.3em] bg-[#C5A028]/10 px-3 py-1 border border-[#C5A028]/30 inline-block">
            TRANSPARENT MONTANA PRICING
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
            Pasture-Raised Beef Shares & Pricing
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Choose the share size that fits your household and freezer space. All shares are 21-day cedar dry-aged, vacuum sealed, and shipped insulated directly from our Bozeman ranch.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {BEEF_SHARE_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`bg-[#111111] p-6 border transition-all flex flex-col justify-between relative ${
                tier.featured
                  ? 'border-[#C5A028] shadow-2xl shadow-[#C5A028]/10 bg-[#151515]'
                  : 'border-[#C5A028]/20 hover:border-[#C5A028]/50 hover:bg-[#151515]'
              }`}
            >
              {tier.featured && (
                <div className="absolute top-0 right-0 bg-[#C5A028] text-black font-bold uppercase text-[9px] tracking-widest px-3 py-1">
                  Popular Choice
                </div>
              )}
              <div>
                <div className="text-center border-b border-[#C5A028]/20 pb-5 mb-5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A028] block mb-1">
                    {tier.id === 'Full' ? 'Whole Animal' : `${tier.id} Share`}
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-amber-100">{tier.title}</h2>
                  <p className="text-[#C5A028] font-serif font-bold text-xl mt-3">{tier.priceRange}</p>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block mt-1">
                    Deposit: ${tier.depositAmount}
                  </span>
                </div>

                <div className="space-y-3 text-xs mb-6">
                  <div className="flex justify-between border-b border-[#C5A028]/10 pb-1.5">
                    <span className="text-zinc-400">Packaged Weight:</span>
                    <span className="text-white font-mono font-medium">{tier.weightLbs}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#C5A028]/10 pb-1.5">
                    <span className="text-zinc-400">Freezer Required:</span>
                    <span className="text-[#C5A028] font-mono">{tier.cubicFeet} cu. ft.</span>
                  </div>
                  <div className="flex justify-between border-b border-[#C5A028]/10 pb-1.5">
                    <span className="text-zinc-400">Portion Yield:</span>
                    <span className="text-emerald-400 font-mono">~{tier.approxMeals} meals</span>
                  </div>

                  <p className="text-[11px] text-zinc-400 italic pt-2 leading-relaxed">
                    {tier.bestFor}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-[#C5A028]/20">
                <button
                  onClick={() => setSelectedShareModal(tier.id)}
                  className="w-full py-2 bg-[#0a0a0a] hover:bg-[#151515] text-[#C5A028] text-[10px] uppercase tracking-widest border border-[#C5A028]/30 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Info className="w-3.5 h-3.5 text-[#C5A028]" />
                  <span>View Cut Checklist</span>
                </button>

                <button
                  onClick={() => onSelectShare(tier.id)}
                  className="w-full py-3 bg-[#C5A028] hover:bg-[#d6af30] text-black font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  Reserve {tier.id} Share
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Cut Breakdown Accordions */}
        <div className="bg-[#111111] border border-[#C5A028]/30 p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#C5A028]/20 pb-4">
            <h3 className="font-serif text-2xl font-bold text-amber-100">
              Detailed Cut Distribution By Share Size
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Select any share tier below to view steak, roast, and ground beef breakdowns.
            </p>
          </div>

          <div className="space-y-4">
            {BEEF_SHARE_TIERS.map((tier) => {
              const isOpen = expandedTier === tier.id;
              return (
                <div
                  key={tier.id}
                  className="bg-[#0a0a0a] border border-[#C5A028]/20 transition-colors"
                >
                  <button
                    onClick={() => setExpandedTier(isOpen ? ('Half' as ShareSize) : tier.id)}
                    className="w-full p-4 flex items-center justify-between text-left font-serif hover:bg-[#151515] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-[#C5A028]/10 border border-[#C5A028]/40 text-[#C5A028] text-xs font-mono font-bold flex items-center justify-center">
                        {tier.id[0]}
                      </span>
                      <div>
                        <span className="font-bold text-amber-100 text-base">{tier.title}</span>
                        <span className="text-xs text-[#C5A028] font-mono ml-3">{tier.priceRange}</span>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#C5A028]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-zinc-400" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-5 border-t border-[#C5A028]/20 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#111111] text-xs">
                      <div>
                        <h4 className="font-serif font-bold text-[#C5A028] mb-2 uppercase tracking-wider text-[10px]">
                          🥩 Prime Steaks
                        </h4>
                        <ul className="space-y-1.5 text-zinc-300">
                          {tier.cutSummary.steaks.map((s, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-[#C5A028] shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-serif font-bold text-[#C5A028] mb-2 uppercase tracking-wider text-[10px]">
                          🍖 Roasts & Slow Cooking Cuts
                        </h4>
                        <ul className="space-y-1.5 text-zinc-300">
                          {tier.cutSummary.roastsAndSlow.map((r, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-[#C5A028] shrink-0" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-serif font-bold text-[#C5A028] mb-2 uppercase tracking-wider text-[10px]">
                          🍔 Ground Beef & Specialty
                        </h4>
                        <ul className="space-y-1.5 text-zinc-300">
                          {tier.cutSummary.groundAndSpecialty.map((g, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-[#C5A028] shrink-0" />
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
          <div className="bg-[#111111] border border-[#C5A028]/40 max-w-lg w-full p-6 text-white relative shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedShareModal(null)}
              className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white"
            >
              ✕
            </button>

            <div className="border-b border-[#C5A028]/20 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A028]">CUT CHECKLIST</span>
              <h3 className="font-serif text-2xl font-bold text-amber-100">{selectedTier.title}</h3>
              <p className="text-[#C5A028] font-mono text-sm mt-1">{selectedTier.priceRange}</p>
            </div>

            <div className="space-y-3 text-xs max-h-80 overflow-y-auto pr-1">
              <div className="bg-[#0a0a0a] p-3 border border-[#C5A028]/20">
                <span className="font-serif font-bold text-[#C5A028] block mb-1">Steaks Included:</span>
                <ul className="space-y-1 text-zinc-300">
                  {selectedTier.cutSummary.steaks.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#C5A028] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0a0a0a] p-3 border border-[#C5A028]/20">
                <span className="font-serif font-bold text-[#C5A028] block mb-1">Roasts & Slow Cooking:</span>
                <ul className="space-y-1 text-zinc-300">
                  {selectedTier.cutSummary.roastsAndSlow.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#C5A028] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0a0a0a] p-3 border border-[#C5A028]/20">
                <span className="font-serif font-bold text-[#C5A028] block mb-1">Ground & Specialty:</span>
                <ul className="space-y-1 text-zinc-300">
                  {selectedTier.cutSummary.groundAndSpecialty.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#C5A028] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setSelectedShareModal(null)}
                className="w-1/2 py-2.5 border border-[#C5A028]/30 text-zinc-300 text-xs uppercase tracking-widest font-serif hover:bg-[#151515]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const size = selectedTier.id;
                  setSelectedShareModal(null);
                  onSelectShare(size);
                }}
                className="w-1/2 py-2.5 bg-[#C5A028] hover:bg-[#d6af30] text-black font-bold text-xs uppercase tracking-widest"
              >
                Reserve Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
