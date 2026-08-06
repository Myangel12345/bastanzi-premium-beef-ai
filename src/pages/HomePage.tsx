import { ArrowRight, ShieldCheck, Award, Star, CheckCircle2, ChevronRight, Sparkles, Truck, Clock, Check } from 'lucide-react';
import { BRAND_IMAGES, BEEF_SHARE_TIERS, REVIEWS, BUSINESS_INFO } from '../data/content';
import { ShareSize } from '../types';
import FreezerCalculator from '../components/FreezerCalculator';
import SeoHead from '../components/SeoHead';
import WhyChooseUsSection from '../components/WhyChooseUsSection';
import RanchToFreezerSection from '../components/RanchToFreezerSection';
import PremiumCutsSection from '../components/PremiumCutsSection';
import FreezerPackagingSection from '../components/FreezerPackagingSection';

interface HomePageProps {
  setActiveTab: (tab: string) => void;
  onSelectShare: (shareSize: ShareSize) => void;
}

export default function HomePage({ setActiveTab, onSelectShare }: HomePageProps) {
  return (
    <div className="bg-[#0a180f] text-[#f7f2e8] min-h-screen">
      <SeoHead
        title="Bastanzi Premium Beef Co. | Pasture-Raised Dry-Aged Beef Shares"
        description="Pasture-raised, 21-day dry aged luxury beef shares. Proudly serving Phoenix, Scottsdale, Paradise Valley, Gilbert, Chandler, Mesa, Cave Creek, Carefree, and nationwide."
      />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-emerald-900/60 bg-[#08130c]">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={BRAND_IMAGES.heroRanch}
            alt="Bastanzi Cattle Ranch"
            className="w-full h-full object-cover opacity-35 scale-105 transform animate-pulse duration-10000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a180f] via-[#0a180f]/70 to-transparent" />
          <div className="absolute inset-0 bg-radial-vignette opacity-80" />
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 pb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/80 border border-amber-500/40 text-amber-300 text-xs font-mono uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Pasture to Table • 21-Day Cedar Dry Aged</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-amber-100 leading-[1.1] max-w-4xl mx-auto">
            Ranch Luxury. Unrivaled Marbling.
          </h1>

          <p className="text-stone-300 text-base sm:text-xl font-light leading-relaxed max-w-2xl mx-auto">
            Reserve your share of certified pasture-raised, small-batch dry-aged beef. Hand-raised with zero added hormones and delivered directly to your doorstep.
          </p>

          {/* Service Areas Highlight Banner */}
          <div className="bg-[#102218]/90 border border-amber-500/30 rounded-xl p-3 max-w-3xl mx-auto backdrop-blur-md">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block mb-1">
              PROUDLY SERVING LOCAL ARIZONA COMMUNITIES & NATIONWIDE
            </span>
            <p className="text-xs text-amber-100 font-serif">
              Phoenix • Scottsdale • Paradise Valley • Gilbert • Chandler • Mesa • Cave Creek • Carefree
            </p>
          </div>

          {/* Pricing Highlight Badge */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-amber-200 font-serif">
            <span className="px-3 py-1 bg-[#12241a] border border-emerald-800/60 rounded-lg">
              Eighth Share: <strong className="text-amber-400">$450–$550</strong>
            </span>
            <span className="px-3 py-1 bg-[#12241a] border border-emerald-800/60 rounded-lg">
              Quarter Share: <strong className="text-amber-400">$850–$1,050</strong>
            </span>
            <span className="px-3 py-1 bg-[#12241a] border border-emerald-800/60 rounded-lg">
              Half Share: <strong className="text-amber-400">$1,650–$2,085</strong>
            </span>
            <span className="px-3 py-1 bg-[#12241a] border border-emerald-800/60 rounded-lg">
              Full Share: <strong className="text-amber-400">$3,300–$4,200</strong>
            </span>
          </div>

          {/* CTA Group */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('reservation')}
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-serif font-bold text-sm uppercase tracking-widest rounded-full shadow-2xl shadow-amber-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <span>Reserve Your Beef Share</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('shares')}
              className="w-full sm:w-auto px-8 py-4 bg-[#12241a]/90 hover:bg-[#182e21] text-amber-200 border border-emerald-800/60 font-serif font-semibold text-sm uppercase tracking-widest rounded-full backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Share Sizes</span>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 border-t border-emerald-900/60 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-stone-300 font-light">
            <div className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>100% Pasture Raised</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>21-Day Cedar Dry Aged</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Zero Added Hormones</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Insulated Nationwide</span>
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION 1: Why Choose Us */}
      <WhyChooseUsSection />

      {/* NEW SECTION 2: Ranch to Freezer Journey */}
      <RanchToFreezerSection onReserveClick={() => setActiveTab('reservation')} />

      {/* Brand Heritage Preview */}
      <section className="py-20 bg-[#0c1a12] border-b border-emerald-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Image Stack */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden border border-emerald-800/60 shadow-2xl aspect-4/3 group bg-[#12241a]">
                <img
                  src={BRAND_IMAGES.primeRibeye}
                  alt="Bastanzi Dry Aged Prime Ribeye"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 p-4 bg-emerald-950/90 backdrop-blur-md border border-amber-500/30 rounded-xl">
                  <span className="text-[10px] uppercase font-mono text-amber-400 tracking-widest block">MASTER BUTCHER SELECTION</span>
                  <p className="font-serif text-sm text-amber-100 font-bold">21-Day Dry Aged Prime Ribeye</p>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-[#102218] border border-amber-500/40 p-4 rounded-xl shadow-2xl hidden sm:block">
                <div className="flex items-center gap-3">
                  <img
                    src={BRAND_IMAGES.logo}
                    alt="Logo"
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="text-xs font-serif font-bold text-amber-200 block">PHOENIX, ARIZONA</span>
                    <span className="text-[10px] text-stone-300">1154 E Fillmore St</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Story Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-900/60 border border-amber-500/30 rounded-full text-xs font-mono text-amber-300">
                <span>OUR RANCH PHILOSOPHY</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-amber-100 leading-tight">
                Raised slowly on wide open pasture. Prepared with master craftsmanship.
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
                At Bastanzi Premium Beef Co., we believe extraordinary beef is born from unyielding stewardship. Our cattle graze freely on organic pastures with natural spring water, producing beef with dense marbling and tender steakhouse flavor.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-serif text-sm font-bold text-amber-200">21-Day Cedar Chamber Dry-Aging</h4>
                    <p className="text-xs text-stone-300 font-light">Concentrates natural beef flavor while breaking down fibers for melt-in-your-mouth steakhouse tenderness.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-serif text-sm font-bold text-amber-200">Zero Added Hormones or Antibiotics</h4>
                    <p className="text-xs text-stone-300 font-light">100% natural development without growth promoters, antibiotics, or unnatural synthetic additives.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-serif text-sm font-bold text-amber-200">Custom Butcher Consultation for Full & Half Shares</h4>
                    <p className="text-xs text-stone-300 font-light">Specify steak thickness, roast sizes, bone-in preferences, and lean burger ratios with our master butcher.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setActiveTab('about')}
                  className="px-6 py-3 bg-[#12241a] border border-amber-500/30 hover:border-amber-400 rounded-lg text-xs font-serif font-bold text-amber-200 uppercase tracking-widest transition-colors inline-flex items-center gap-2"
                >
                  <span>Learn About Our Ranch Heritage</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION 3: Premium Beef Cuts */}
      <PremiumCutsSection />

      {/* NEW SECTION 4: Freezer-Ready Packaging */}
      <FreezerPackagingSection />

      {/* Beef Shares Pricing Grid */}
      <section className="py-20 bg-[#08130c] relative border-b border-emerald-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest bg-emerald-900/60 px-3 py-1 rounded-full border border-amber-500/30">
              RESERVE YOUR BEEF SHARE
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">
              Select Your Beef Share Size
            </h2>
            <p className="text-stone-300 text-sm sm:text-base font-light">
              Secure your animal deposit today. Flash-frozen, vacuum-sealed, and shipped insulated directly from our ranch to your door.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BEEF_SHARE_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`bg-[#102218] rounded-2xl p-6 border transition-all flex flex-col justify-between relative group ${
                  tier.featured
                    ? 'border-amber-400 shadow-2xl shadow-amber-500/10 ring-1 ring-amber-400/50 bg-[#14281d]'
                    : 'border-emerald-800/50 hover:border-amber-500/40 hover:bg-[#14281d]'
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-emerald-950 font-serif font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    MOST POPULAR VALUE
                  </div>
                )}

                <div>
                  {tier.image && (
                    <div className="w-full h-40 overflow-hidden rounded-xl mb-4 border border-emerald-800/60 shadow-inner">
                      <img
                        src={tier.image}
                        alt={`${tier.title} package`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="text-center border-b border-emerald-900/60 pb-5 mb-5">
                    <h3 className="font-serif text-xl font-bold text-amber-200">{tier.title}</h3>
                    <p className="text-stone-300 text-xs mt-1 min-h-[32px] font-light">{tier.subtitle}</p>
                    <div className="mt-4">
                      <span className="font-serif text-2xl font-bold text-amber-400 block">{tier.priceRange}</span>
                      <span className="text-[11px] text-stone-400 font-mono block mt-0.5">
                        ${tier.depositAmount} refundable deposit required
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs mb-6 font-light">
                    <div className="flex justify-between border-b border-emerald-900/60 pb-1.5">
                      <span className="text-stone-300">Packaged Beef Weight:</span>
                      <span className="text-white font-mono font-medium">{tier.weightLbs}</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-900/60 pb-1.5">
                      <span className="text-stone-300">Approx. Meals:</span>
                      <span className="text-amber-300 font-mono font-medium">~{tier.approxMeals} meals</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-900/60 pb-1.5">
                      <span className="text-stone-300">Freezer Required:</span>
                      <span className="text-stone-200 font-mono">{tier.cubicFeet} cu. ft.</span>
                    </div>

                    <div className="pt-2">
                      <span className="text-[11px] uppercase tracking-wider text-amber-400 font-mono block mb-2">
                        Includes Signature Cuts:
                      </span>
                      <ul className="space-y-1.5 text-stone-300">
                        {tier.cutSummary.steaks.slice(0, 2).map((cut, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{cut}</span>
                          </li>
                        ))}
                        {tier.cutSummary.groundAndSpecialty.slice(0, 1).map((cut, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{cut}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-emerald-900/60">
                  <button
                    onClick={() => onSelectShare(tier.id)}
                    className={`w-full py-3 rounded-xl font-serif font-bold text-xs uppercase tracking-widest transition-all ${
                      tier.featured
                        ? 'bg-amber-500 hover:bg-amber-400 text-emerald-950 shadow-lg shadow-amber-500/20'
                        : 'bg-[#0c1a12] hover:bg-amber-500 hover:text-emerald-950 text-amber-200 border border-emerald-800/60'
                    }`}
                  >
                    Reserve {tier.id} Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews & Testimonials */}
      <section className="py-20 bg-[#0c1a12] border-b border-emerald-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest bg-emerald-900/60 px-3 py-1 rounded-full border border-amber-500/30">
              VERIFIED RANCH SHAREHOLDERS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-amber-100">
              Trusted by Beef Enthusiasts & Chefs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="bg-[#102218] p-6 rounded-2xl border border-emerald-800/40 hover:border-amber-500/30 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-stone-300 text-sm leading-relaxed italic font-serif font-light">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-emerald-900/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-amber-200 block">{rev.author}</span>
                    <span className="text-stone-400">{rev.location}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-amber-400 font-mono block">{rev.shareType}</span>
                    <span className="text-[10px] text-stone-400">{rev.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reservation CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#07110a] via-[#0e2216] to-[#07110a] text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <img
            src={BRAND_IMAGES.logo}
            alt="Bastanzi Crest"
            className="w-16 h-16 rounded-full mx-auto p-0.5 bg-amber-400 shadow-xl object-cover shrink-0"
            referrerPolicy="no-referrer"
          />

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">
            Taste the Difference of True Ranch-Raised Beef
          </h2>

          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-light">
            Fall herd allocations fill quickly. Secure your reservation now to guarantee your delivery window and enjoy farm-direct beef all year long.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('reservation')}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-serif font-bold text-sm uppercase tracking-widest rounded-full shadow-2xl shadow-amber-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <span>Begin Your Reservation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={`mailto:${BUSINESS_INFO.ordersEmail}`}
              className="px-8 py-4 bg-[#12241a] text-amber-200 border border-amber-500/30 font-serif font-semibold text-sm uppercase tracking-widest rounded-full hover:bg-[#182e21] transition-colors"
            >
              Email Ranch Concierge: {BUSINESS_INFO.ordersEmail}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
