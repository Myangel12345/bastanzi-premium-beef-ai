import { ArrowRight, Sprout, Timer, Utensils, Box, Truck } from 'lucide-react';
import { BRAND_IMAGES } from '../data/content';

interface RanchToFreezerSectionProps {
  onReserveClick?: () => void;
}

export default function RanchToFreezerSection({ onReserveClick }: RanchToFreezerSectionProps) {
  const steps = [
    {
      stepNumber: '01',
      title: 'Pasture Grazing & Herd Stewardship',
      subtitle: 'Ethical Pasture Management',
      icon: Sprout,
      description: 'Our Black Angus cattle graze freely on pristine, pesticide-free open pasture forage with natural spring water, ensuring healthy development without hormones or antibiotics.',
    },
    {
      stepNumber: '02',
      title: '21-Day Artisanal Dry Aging',
      subtitle: 'Unrivaled Flavor Concentration',
      icon: Timer,
      description: 'Side beef hangs for 21 days in humidity and temperature controlled cedar rooms. Natural enzymes tenderize muscle fibers, creating intense steakhouse umami flavor.',
    },
    {
      stepNumber: '03',
      title: 'Certified Master Butcher Processing',
      subtitle: 'Hand-Trimmed Precision',
      icon: Utensils,
      description: 'Third-generation artisan butchers hand-cut ribeyes, strip steaks, filet mignon, packer briskets, and roasts according to rigorous USDA quality standards.',
    },
    {
      stepNumber: '04',
      title: '5-Mil Flash-Frozen Vacuum Sealing',
      subtitle: 'Zero Freezer Burn Guarantee',
      icon: Box,
      description: 'Cut portions are immediately vacuum sealed in heavy commercial-grade 5mil barrier sleeves and flash-frozen at -20°F to lock in peak tenderness for up to 18 months.',
    },
    {
      stepNumber: '05',
      title: 'Insulated Doorstep Delivery',
      subtitle: 'Arrival Rock-Solid Frozen',
      icon: Truck,
      description: 'Packed into eco-insulated shipping chests with dry ice and delivered straight to your home freezer across Phoenix, Scottsdale, Paradise Valley, and nationwide.',
    },
  ];

  return (
    <section className="py-20 bg-[#09140e] text-[#f7f2e8] relative overflow-hidden border-b border-emerald-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-widest uppercase">
            <span>Transparent Farm-To-Table</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-amber-100">
            The Ranch-to-Freezer Journey
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
            From open pastures to your kitchen table, every step of our process is engineered for quality, sustainability, and complete peace of mind.
          </p>
        </div>

        {/* Steps Grid / Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6 relative">
          {steps.map((step, idx) => {
            const IconComp = step.icon;
            return (
              <div
                key={idx}
                className="bg-[#102218] hover:bg-[#152a1e] border border-emerald-800/40 hover:border-amber-500/40 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 group shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-bold text-amber-400/80 group-hover:text-amber-300 transition-colors">
                      {step.stepNumber}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-amber-300 group-hover:bg-amber-500 group-hover:text-emerald-950 transition-all duration-300">
                      <IconComp className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-amber-100 leading-snug mb-1">
                    {step.title}
                  </h3>
                  <span className="text-[11px] font-mono text-amber-400/80 uppercase block mb-3">
                    {step.subtitle}
                  </span>
                  <p className="text-stone-300 text-xs leading-relaxed font-light">
                    {step.description}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden md:flex justify-end pt-4 text-emerald-700/60 group-hover:text-amber-400/80 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Call to Action Bar */}
        <div className="mt-14 bg-gradient-to-r from-[#14291d] via-[#1a3325] to-[#14291d] border border-amber-500/30 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-serif text-2xl font-bold text-amber-100">
              Ready to Stock Your Freezer with Ranch-Direct Beef?
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm font-light">
              Reserve your Full, Half, Quarter, or Eighth Beef Share with a small refundable deposit today.
            </p>
          </div>
          {onReserveClick && (
            <button
              onClick={onReserveClick}
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-serif font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 whitespace-nowrap shrink-0"
            >
              Reserve Your Beef Share
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
