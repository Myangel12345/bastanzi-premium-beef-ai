import { ShieldCheck, Award, HeartHandshake, CheckCircle2, ArrowRight } from 'lucide-react';
import { BRAND_IMAGES, BUSINESS_INFO } from '../data/content';
import SeoHead from '../components/SeoHead';

interface AboutPageProps {
  setActiveTab: (tab: string) => void;
}

export default function AboutPage({ setActiveTab }: AboutPageProps) {
  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen pb-20">
      <SeoHead
        title="About Bastanzi Premium Beef Co. | Montana Ranch Heritage & Practices"
        description="Learn about Bastanzi Beef Co. in Bozeman, Montana. Certified pasture-raised Angus, low-stress handling, regenerative grazing, and 21-day dry aging."
      />

      {/* Page Header */}
      <section className="relative py-20 bg-[#111111] border-b border-[#C5A028]/20 overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img
            src={BRAND_IMAGES.ranchSunset}
            alt="Montana Sunset"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 text-center space-y-4">
          <span className="text-[10px] font-mono text-[#C5A028] uppercase tracking-[0.3em] bg-[#C5A028]/10 px-3 py-1 border border-[#C5A028]/30 inline-block">
            HERITAGE & STEWARDSHIP
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white">
            The Bastanzi Ranch Heritage
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mx-auto font-light leading-relaxed">
            Rooted in the pristine Gallatin Valley of Bozeman, Montana — raising world-class beef with passion, integrity, and deep respect for the land.
          </p>
        </div>
      </section>

      {/* Main Story & Values Grid */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 space-y-20">
        {/* Story Block 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-serif text-3xl font-bold text-amber-100">
              Pristine Montana Pastures & Regenerative Stewardship
            </h2>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
              Founded on principles of holistic land management, our cattle graze across wide open mountain pastures irrigated by clear snowmelt runoff. We rotate our herds regularly across pastures, allowing native grasses like Bluebunch Wheatgrass and Idaho Fescue to flourish naturally.
            </p>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
              This natural pasture rotation builds rich, fertile topsoil, traps carbon, and produces beef with exceptionally dense nutrient profiles — rich in natural Omega-3 fatty acids, conjugated linoleic acid (CLA), and vitamin E.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-serif">
              <div className="p-4 bg-[#111111] border border-[#C5A028]/20">
                <span className="text-[#C5A028] font-bold block text-xs uppercase tracking-wider">100% PASTURE RAISED</span>
                <span className="text-zinc-400 text-[11px]">Grazing freely in mountain air</span>
              </div>
              <div className="p-4 bg-[#111111] border border-[#C5A028]/20">
                <span className="text-[#C5A028] font-bold block text-xs uppercase tracking-wider">HUMANE HANDLING</span>
                <span className="text-zinc-400 text-[11px]">Quiet, low-stress herd care</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="overflow-hidden border border-[#C5A028]/30 shadow-2xl aspect-4/3 relative bg-[#111111]">
              <img
                src={BRAND_IMAGES.pastureCattle}
                alt="Montana Angus Cattle Grazing"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* Finishing Matrix: Grass-Fed vs Grain-Finished */}
        <div className="bg-[#111111] border border-[#C5A028]/30 p-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-mono text-[#C5A028] uppercase tracking-widest block">CUSTOM FINISHING</span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
              Grass-Fed vs. Grain-Finished vs. Mixed
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm">
              We offer customizable finishing options to tailor your Beef Share precisely to your palate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0a0a0a] p-6 border border-[#C5A028]/20 space-y-3">
              <span className="text-[10px] font-mono text-[#C5A028] uppercase tracking-widest block">Option 01</span>
              <h4 className="font-serif text-lg font-bold text-amber-100">100% Grass-Fed & Finished</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Raised on pasture grass for its entire life. Delivers a clean, mineral-rich, herbal flavor with lean muscle texture and elevated Omega-3 levels.
              </p>
            </div>

            <div className="bg-[#151515] p-6 border border-[#C5A028] space-y-3 relative">
              <div className="absolute top-0 right-0 bg-[#C5A028] text-black font-bold uppercase text-[9px] tracking-widest px-2.5 py-1">
                Signature
              </div>
              <span className="text-[10px] font-mono text-[#C5A028] uppercase tracking-widest block">Option 02</span>
              <h4 className="font-serif text-lg font-bold text-amber-100">Barley & Alfalfa Finished</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Grazes on pasture for 85% of its life, then finished for 90 days on non-GMO local Montana barley & alfalfa for buttery, intense intramuscular marbling.
              </p>
            </div>

            <div className="bg-[#0a0a0a] p-6 border border-[#C5A028]/20 space-y-3">
              <span className="text-[10px] font-mono text-[#C5A028] uppercase tracking-widest block">Option 03</span>
              <h4 className="font-serif text-lg font-bold text-amber-100">Mixed Share Split</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ideal for Full & Half Share owners. Receive half of your steaks grass-finished and half grain-finished to experience both flavor spectrums.
              </p>
            </div>
          </div>
        </div>

        {/* The 21-Day Dry Aging Process */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="overflow-hidden border border-[#C5A028]/30 shadow-2xl aspect-4/3 relative bg-[#111111]">
              <img
                src={BRAND_IMAGES.butcherBoard}
                alt="Master Butchering"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <h2 className="font-serif text-3xl font-bold text-amber-100">
              The Art of 21-Day Cedar Chamber Dry Aging
            </h2>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
              Most grocery store beef is wet-aged in plastic bags for quick turnover, resulting in metallic moisture. At Bastanzi, every whole carcass is hung in our state-of-the-art cedar dry-aging chambers at 34°F and 80% relative humidity for 21 full days.
            </p>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
              During this dry-aging period, natural enzymes tenderize the muscle fibers while excess moisture evaporates. The result is a concentrated, complex beef flavor with undertones of toasted hazelnut and earthy truffle.
            </p>

            <ul className="space-y-2 text-xs text-zinc-300 font-sans">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C5A028]" />
                <span>Custom cut thickness (1.25" to 2" ribeyes & strips)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C5A028]" />
                <span>Heavy 5mil vacuum seal flash freezing for 18-month freshness</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C5A028]" />
                <span>USDA inspected facilities with full lot traceability</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Quality Guarantee Box */}
        <div className="bg-[#111111] p-8 border border-[#C5A028]/40 text-center space-y-4 relative">
          <Award className="w-10 h-10 text-[#C5A028] mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-amber-100">The Bastanzi Ranch Guarantee</h3>
          <p className="text-zinc-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            If any cut in your Beef Share does not meet your high standards for tenderness, flavor, and marbling, contact our ranch concierge team at <a href={`mailto:${BUSINESS_INFO.ordersEmail}`} className="text-[#C5A028] underline">{BUSINESS_INFO.ordersEmail}</a> and we will replace it or credit your next share immediately.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('reservation')}
              className="px-8 py-3 bg-[#C5A028] hover:bg-[#d6af30] text-black font-bold text-xs uppercase tracking-widest transition-colors inline-flex items-center gap-2"
            >
              <span>Reserve Your Beef Share Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
