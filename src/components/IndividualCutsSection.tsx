import { useState } from 'react';
import { Sparkles, Flame, Mail, ArrowRight, X, CheckCircle, Info } from 'lucide-react';
import { INDIVIDUAL_BEEF_CUTS } from '../data/content';
import { IndividualCutItem } from '../types';

interface IndividualCutsSectionProps {
  onNavigateToContact?: () => void;
  title?: string;
  subtitle?: string;
}

export default function IndividualCutsSection({
  onNavigateToContact,
  title = 'Individual Premium Beef Cuts',
  subtitle = 'Available in individual vacuum-sealed portions. Contact us directly for pricing and custom cut availability.',
}: IndividualCutsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'steaks' | 'roasts' | 'ground' | 'specialty'>('all');
  const [selectedCutForInquiry, setSelectedCutForInquiry] = useState<IndividualCutItem | null>(null);

  const filteredCuts = activeCategory === 'all'
    ? INDIVIDUAL_BEEF_CUTS
    : INDIVIDUAL_BEEF_CUTS.filter((c) => c.category === activeCategory);

  const handleContactClick = (cut?: IndividualCutItem) => {
    if (cut) {
      setSelectedCutForInquiry(cut);
    } else if (onNavigateToContact) {
      onNavigateToContact();
    } else {
      window.location.hash = 'contact';
    }
  };

  const handleModalNavigate = () => {
    setSelectedCutForInquiry(null);
    if (onNavigateToContact) {
      onNavigateToContact();
    } else {
      window.location.hash = 'contact';
    }
  };

  return (
    <section className="py-16 bg-[#0c1a12] text-[#f7f2e8] relative overflow-hidden border-t border-b border-emerald-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>ARTISAN BUTCHER SELECTION</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-amber-100">
            {title}
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
            {subtitle}
          </p>

          {/* Contact Banner */}
          <div className="bg-[#102218] border border-amber-500/30 rounded-xl p-4 mt-6 max-w-2xl mx-auto text-left sm:text-center space-y-2 shadow-lg">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-semibold">
              PRICING & ORDER INQUIRIES
            </span>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs sm:text-sm text-stone-200">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href="mailto:orders@bastanzibeef.com"
                  className="text-amber-300 hover:underline font-mono font-medium"
                >
                  orders@bastanzibeef.com
                </a>
                <span className="text-stone-400 text-[11px]">(Order reservations & pricing)</span>
              </div>
              <span className="hidden sm:inline text-stone-600">•</span>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href="mailto:info@bastanzibeef.com"
                  className="text-amber-300 hover:underline font-mono font-medium"
                >
                  info@bastanzibeef.com
                </a>
                <span className="text-stone-400 text-[11px]">(General inquiries)</span>
              </div>
            </div>
          </div>

          {/* Filter Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 pt-6">
            {[
              { id: 'all', label: 'All Premium Cuts (10)' },
              { id: 'steaks', label: 'Prime Steaks' },
              { id: 'roasts', label: 'Roasts & Brisket' },
              { id: 'ground', label: 'Ground Beef' },
              { id: 'specialty', label: 'Stew & Soup Bones' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-serif transition-all duration-200 ${
                  activeCategory === tab.id
                    ? 'bg-amber-500 text-emerald-950 font-bold shadow-md'
                    : 'bg-[#14281d] text-stone-300 border border-emerald-800/40 hover:border-amber-500/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cuts Grid - 10 Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {filteredCuts.map((cut) => (
            <div
              key={cut.id}
              className="bg-[#12241a] border border-emerald-800/50 hover:border-amber-500/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl group relative"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-4/3 overflow-hidden bg-emerald-950 border-b border-emerald-900/60">
                  <img
                    src={cut.imageUrl}
                    alt={`Bastanzi Pasture-Raised ${cut.fullName} - Premium Beef Cut`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-emerald-950/90 backdrop-blur-md border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 font-semibold uppercase tracking-wider">
                    {cut.name}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2.5">
                  <div>
                    <h3 className="font-serif text-base font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
                      {cut.name}
                    </h3>
                    <p className="text-[11px] text-amber-400/90 font-mono italic">
                      {cut.fullName}
                    </p>
                  </div>

                  <p className="text-stone-300 text-xs leading-relaxed font-light line-clamp-3">
                    {cut.description}
                  </p>

                  <div className="pt-2 space-y-1 border-t border-emerald-900/60 text-[11px]">
                    <div className="flex items-center gap-1.5 text-stone-300">
                      <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-stone-400">Preparation:</span>
                      <span className="text-amber-200/90 truncate">{cut.cooking}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Contact CTA */}
              <div className="p-4 pt-0 space-y-2">
                <div className="bg-[#0c1a12] border border-amber-500/30 rounded-lg p-2 text-center">
                  <span className="text-xs font-serif font-bold text-amber-300 block">
                    Contact for Pricing
                  </span>
                </div>

                <button
                  onClick={() => handleContactClick(cut)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-serif font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Contact for Pricing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Global Bottom Contact Footer Card */}
        <div className="mt-12 bg-[#14281d] border border-amber-500/30 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-emerald-950 px-3 py-1 rounded-full border border-amber-500/30">
              CUSTOM ORDERS & BULK CUT PRICING
            </span>
            <h3 className="font-serif text-2xl font-bold text-amber-100">
              Need Specific Beef Cut Quantities or Custom Packaging?
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm max-w-2xl font-light">
              We supply custom individual cut orders, restaurant portioning, and freezer sampler boxes. Reach out directly to our ranch team for current availability and market pricing.
            </p>
            <div className="space-y-1 pt-2 font-mono text-xs text-amber-200">
              <p className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span className="text-stone-300">Order Reservations & Pricing:</span>
                <a href="mailto:orders@bastanzibeef.com" className="text-amber-400 underline font-semibold">
                  orders@bastanzibeef.com
                </a>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span className="text-stone-300">General Inquiries:</span>
                <a href="mailto:info@bastanzibeef.com" className="text-amber-400 underline font-semibold">
                  info@bastanzibeef.com
                </a>
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto text-center space-y-2">
            <button
              onClick={() => handleContactClick()}
              className="w-full md:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-serif font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Contact Us For Pricing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {selectedCutForInquiry && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#102218] border border-amber-500/40 rounded-2xl max-w-md w-full p-6 text-white relative shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedCutForInquiry(null)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-white rounded-lg bg-[#182e21]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-emerald-900/60 pb-3">
              <span className="text-[10px] font-mono uppercase text-amber-400 tracking-widest block">
                PRICING INQUIRY
              </span>
              <h3 className="font-serif text-2xl font-bold text-amber-200">
                {selectedCutForInquiry.name}
              </h3>
              <p className="text-stone-300 text-xs mt-0.5">{selectedCutForInquiry.fullName}</p>
            </div>

            <div className="space-y-3 text-xs font-light">
              <div className="relative aspect-16/9 rounded-lg overflow-hidden border border-emerald-800/60">
                <img
                  src={selectedCutForInquiry.imageUrl}
                  alt={selectedCutForInquiry.fullName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="bg-[#0c1a12] p-3 rounded-xl border border-amber-500/30 text-center space-y-1">
                <span className="text-amber-400 font-serif font-bold text-base block">
                  Contact for Pricing
                </span>
                <p className="text-[11px] text-stone-300">
                  Individual cuts are subject to current harvest batch availability.
                </p>
              </div>

              <div className="space-y-2 bg-[#0c1a12] p-3 rounded-xl border border-emerald-900/60">
                <span className="font-serif font-bold text-amber-300 text-xs block mb-1">
                  Contact Information:
                </span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-start gap-2">
                    <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <a href="mailto:orders@bastanzibeef.com" className="text-amber-300 underline font-semibold block">
                        orders@bastanzibeef.com
                      </a>
                      <span className="text-stone-400 text-[10px]">Order reservations and pricing inquiries</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-emerald-900/40">
                    <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <a href="mailto:info@bastanzibeef.com" className="text-amber-300 underline font-semibold block">
                        info@bastanzibeef.com
                      </a>
                      <span className="text-stone-400 text-[10px]">General inquiries</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setSelectedCutForInquiry(null)}
                className="w-1/3 py-2.5 bg-[#12241a] text-stone-300 rounded-lg text-xs font-serif hover:bg-[#182e21]"
              >
                Close
              </button>
              <button
                onClick={handleModalNavigate}
                className="w-2/3 py-2.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-serif font-bold text-xs uppercase rounded-lg flex items-center justify-center gap-1.5"
              >
                <span>Go To Contact Form</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
