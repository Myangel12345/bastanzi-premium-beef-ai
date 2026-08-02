import { ShieldCheck, Award, HeartHandshake, Sparkles, Scale, Thermometer } from 'lucide-react';
import { BUSINESS_INFO } from '../data/content';

export default function WhyChooseUsSection() {
  const features = [
    {
      icon: Award,
      title: '100% Pasture-Raised & Pasture Foraged',
      description: 'Our Black Angus cattle graze freely on pristine, pesticide-free open pastures. Raised humanely with zero added hormones, prophylactic antibiotics, or artificial growth stimulants.',
    },
    {
      icon: Thermometer,
      title: '21-Day Custom Dry Aging',
      description: 'Every side of beef undergoes a slow 21-day dry aging process in humidity-controlled rooms. Natural enzymes tenderize the muscle fibers and concentrate deep steakhouse umami flavor.',
    },
    {
      icon: Scale,
      title: 'Direct Ranch-to-Freezer Savings',
      description: 'By purchasing a Full, Half, Quarter, or Eighth Beef Share directly from Bastanzi, you bypass grocery store markups and secure premium dry-aged steaks at a single transparent price per pound.',
    },
    {
      icon: ShieldCheck,
      title: 'Certified USDA Precision Butchery',
      description: 'Processed in USDA-inspected artisanal facilities. Our third-generation master butchers hand-trim every ribeye, strip steak, brisket, and roast to exacting culinary specifications.',
    },
    {
      icon: Sparkles,
      title: '5-Mil Flash Frozen Protection',
      description: 'Flash-frozen at peak dry-aging tenderness and vacuum-sealed in heavy 5mil barrier sleeves. Guaranteed to maintain ranch-fresh taste with zero freezer burn for up to 18 months.',
    },
    {
      icon: HeartHandshake,
      title: 'Arizona Doorstep & Nationwide Delivery',
      description: `Proudly serving ${BUSINESS_INFO.serviceAreas.join(', ')} with white-glove doorstep delivery in insulated eco-chests packed with dry ice.`,
    },
  ];

  return (
    <section className="py-20 bg-[#0c1a12] text-[#f7f2e8] relative overflow-hidden border-t border-b border-emerald-900/60">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-800/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>The Bastanzi Advantage</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-amber-100">
            Why Choose Bastanzi Premium Beef?
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
            We hold ourselves to an unyielding standard of ranch stewardship, dry-aging craftsmanship, and direct-to-consumer transparency so your family enjoys unmatched steakhouse quality.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={idx}
                className="bg-[#13251a] hover:bg-[#182c20] transition-all duration-300 p-7 rounded-2xl border border-emerald-800/40 hover:border-amber-500/40 group flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-emerald-950 transition-all duration-300">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-amber-100 group-hover:text-amber-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-stone-300 text-sm leading-relaxed font-light">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Service Areas Banner */}
        <div className="mt-14 bg-[#14281d] border border-amber-500/30 rounded-2xl p-6 text-center shadow-xl">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-2">
            PROUDLY SERVING LOCAL ARIZONA COMMUNITIES & NATIONWIDE
          </span>
          <p className="text-sm sm:text-base text-stone-200 font-serif font-medium">
            {BUSINESS_INFO.serviceAreas.join('  •  ')}
          </p>
          <p className="text-xs text-stone-400 mt-2">
            Delivering direct from our facility at {BUSINESS_INFO.fullAddress}
          </p>
        </div>
      </div>
    </section>
  );
}
