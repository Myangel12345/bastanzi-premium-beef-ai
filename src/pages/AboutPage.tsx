import { ShieldCheck, Award, HeartHandshake, CheckCircle2, ArrowRight } from 'lucide-react';
import { BRAND_IMAGES, BUSINESS_INFO } from '../data/content';
import SeoHead from '../components/SeoHead';

interface AboutPageProps {
  setActiveTab: (tab: string) => void;
}

export default function AboutPage({ setActiveTab }: AboutPageProps) {
  return (
    <div className="bg-[#0a180f] text-[#f7f2e8] min-h-screen pb-20">
      <SeoHead
        title="About Bastanzi Premium Beef Co. | Ranch Heritage & Stewardship"
        description="Learn about Bastanzi Beef Co. Certified pasture-raised Angus, low-stress handling, regenerative grazing, and 21-day dry aging. Proudly serving Phoenix, Scottsdale, Paradise Valley, Gilbert, Chandler, Mesa, Cave Creek, Carefree, and nationwide."
      />

      {/* Page Header */}
      <section className="relative py-20 bg-[#0c1a12] border-b border-emerald-900/60 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src={BRAND_IMAGES.ranchSunset}
            alt="Ranch Sunset"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 text-center space-y-4">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest bg-emerald-900/60 px-3 py-1 rounded-full border border-amber-500/30">
            HERITAGE & STEWARDSHIP
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-amber-100">
            The Bastanzi Ranch Heritage
          </h1>
          <p className="text-stone-300 text-sm sm:text-lg max-w-2xl mx-auto font-light">
            Located at {BUSINESS_INFO.fullAddress} — raising world-class beef with passion, integrity, and deep respect for the land.
          </p>
          <div className="pt-2 text-xs text-amber-300 font-serif">
            <strong>Proudly Serving:</strong> {BUSINESS_INFO.serviceAreas.join(' • ')}
          </div>
        </div>
      </section>

      {/* Main Story & Values Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* Story Block 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-serif text-3xl font-bold text-amber-200">
              Pristine Pastures & Regenerative Stewardship
            </h2>
            <p className="text-stone-300 text-sm leading-relaxed font-light">
              Founded on principles of holistic land management, our cattle graze across wide open mountain pastures irrigated by clear snowmelt runoff. We rotate our herds regularly across pastures, allowing native grasses to flourish naturally.
            </p>
            <p className="text-stone-300 text-sm leading-relaxed font-light">
              This natural pasture rotation builds rich, fertile topsoil, traps carbon, and produces beef with exceptionally dense nutrient profiles — rich in natural Omega-3 fatty acids, conjugated linoleic acid (CLA), and vitamin E.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-serif">
              <div className="p-3 bg-[#102218] border border-emerald-800/50 rounded-lg">
                <span className="text-amber-400 font-bold block text-sm">100% PASTURE RAISED</span>
                <span className="text-stone-300 font-sans font-light">Grazing freely in mountain air</span>
              </div>
              <div className="p-3 bg-[#102218] border border-emerald-800/50 rounded-lg">
                <span className="text-amber-400 font-bold block text-sm">HUMANE HANDLING</span>
                <span className="text-stone-300 font-sans font-light">Quiet, low-stress herd care</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-emerald-800/60 shadow-2xl aspect-4/3 relative bg-[#12241a]">
              <img
                src={BRAND_IMAGES.pastureCattle}
                alt="Angus Cattle Grazing"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* Finishing Matrix: Grass-Fed vs Grain-Finished */}
        <div className="bg-[#102218] border border-emerald-800/60 rounded-2xl p-8 space-y-8 shadow-xl">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-amber-200">
              Grass-Fed vs. Grain-Finished vs. Mixed
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm font-light">
              We offer customizable finishing options to tailor your Beef Share precisely to your palate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0c1a12] p-6 rounded-xl border border-emerald-800/40 space-y-3">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block">Option 01</span>
              <h4 className="font-serif text-lg font-bold text-amber-100">100% Grass-Fed & Finished</h4>
              <p className="text-xs text-stone-300 leading-relaxed font-light">
                Raised on pasture grass for its entire life. Delivers a clean, mineral-rich, herbal flavor with lean muscle texture and elevated Omega-3 levels.
              </p>
            </div>

            <div className="bg-[#0c1a12] p-6 rounded-xl border border-amber-500/40 ring-1 ring-amber-500/20 space-y-3 relative">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block">Option 02 (Signature)</span>
              <h4 className="font-serif text-lg font-bold text-amber-100">Barley & Alfalfa Grain-Finished</h4>
              <p className="text-xs text-stone-300 leading-relaxed font-light">
                Grazes on pasture for 85% of its life, then finished for 90 days on non-GMO local barley & alfalfa for buttery, intense intramuscular marbling.
              </p>
            </div>

            <div className="bg-[#0c1a12] p-6 rounded-xl border border-emerald-800/40 space-y-3">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block">Option 03</span>
              <h4 className="font-serif text-lg font-bold text-amber-100">Mixed Share Split</h4>
              <p className="text-xs text-stone-300 leading-relaxed font-light">
                Ideal for Full & Half Share owners. Receive half of your steaks grass-finished and half grain-finished to experience both flavor spectrums.
              </p>
            </div>
          </div>
        </div>

        {/* The 21-Day Dry Aging Process */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="rounded-2xl overflow-hidden border border-emerald-800/60 shadow-2xl aspect-4/3 relative bg-[#12241a]">
              <img
                src={BRAND_IMAGES.butcherBoard}
                alt="Master Butchering"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <h2 className="font-serif text-3xl font-bold text-amber-200">
              The Art of 21-Day Cedar Chamber Dry Aging
            </h2>
            <p className="text-stone-300 text-sm leading-relaxed font-light">
              Most grocery store beef is wet-aged in plastic bags for quick turnover, resulting in metallic moisture. At Bastanzi, every side of beef is hung in our state-of-the-art dry-aging chambers for 21 full days.
            </p>
            <p className="text-stone-300 text-sm leading-relaxed font-light">
              During this dry-aging period, natural enzymes tenderize the muscle fibers while excess moisture evaporates. The result is a concentrated, complex beef flavor with undertones of toasted hazelnut and earthy truffle.
            </p>

            <ul className="space-y-2 text-xs text-stone-300 font-light">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Custom cut thickness (1.25" to 2" ribeyes & strips)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Heavy 5mil vacuum seal flash freezing for 18-month freshness</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>USDA inspected facilities with full lot traceability</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Quality Guarantee Box */}
        <div className="bg-gradient-to-r from-[#07110a] via-[#102218] to-[#07110a] p-8 rounded-2xl border border-amber-500/40 text-center space-y-4 shadow-xl">
          <Award className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-amber-100">The Bastanzi Guarantee</h3>
          <p className="text-stone-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-light">
            If any cut in your Beef Share does not meet your high standards for tenderness, flavor, and marbling, contact our concierge team at <a href={`mailto:${BUSINESS_INFO.ordersEmail}`} className="text-amber-300 underline">{BUSINESS_INFO.ordersEmail}</a> and we will replace it or credit your next share immediately.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('reservation')}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-serif font-bold text-xs uppercase tracking-widest rounded-full transition-colors inline-flex items-center gap-2 shadow-lg"
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
