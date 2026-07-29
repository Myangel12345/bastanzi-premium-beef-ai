import { ArrowRight, ShieldCheck, Award, Star, CheckCircle2, ChevronRight, Sparkles, Truck, Clock, Check } from 'lucide-react';
import { BRAND_IMAGES, BEEF_SHARE_TIERS, REVIEWS, BUSINESS_INFO } from '../data/content';
import { ShareSize } from '../types';
import FreezerCalculator from '../components/FreezerCalculator';
import SeoHead from '../components/SeoHead';

interface HomePageProps {
  setActiveTab: (tab: string) => void;
  onSelectShare: (shareSize: ShareSize) => void;
}

export default function HomePage({ setActiveTab, onSelectShare }: HomePageProps) {
  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen">
      <SeoHead
        title="Bastanzi Premium Beef Co. | Montana Ranch Dry-Aged Beef Shares"
        description="Pasture-raised, 21-day dry aged luxury beef shares from Bozeman, Montana. Full, Half, Quarter & Eighth shares delivered nationwide."
      />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 sm:px-12 py-20 border-b border-[#C5A028]/20 overflow-hidden">
        {/* Hero Background Image with dark monochrome filter */}
        <div className="absolute inset-0 z-0">
          <img
            src={BRAND_IMAGES.heroRanch}
            alt="Bastanzi Montana Ranch"
            className="w-full h-full object-cover opacity-20 filter grayscale contrast-125"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 max-w-5xl mx-auto space-y-6">
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-[#C5A028] bg-[#C5A028]/10 px-4 py-1.5 rounded-full border border-[#C5A028]/30 inline-block">
            Sustainably Raised • Locally Sourced • Exceptionally Cut
          </span>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
            The Gold Standard of Beef
          </h1>

          <p className="text-[#C5A028] font-serif italic text-lg sm:text-2xl opacity-90 tracking-wide max-w-3xl mx-auto">
            Montana pasture-raised, 21-day dry-aged Black Angus beef from Gallatin Valley to your table.
          </p>

          <p className="text-zinc-400 text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto">
            Reserve your share of certified pasture-raised, small-batch dry-aged beef. Hand-raised with zero added hormones or artificial additives and delivered nationwide.
          </p>

          {/* Pricing Highlight Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-300 font-serif">
            <span className="px-3 py-1.5 bg-[#111111] border border-[#C5A028]/30 text-xs">
              Eighth Share: <strong className="text-[#C5A028]">$450 – $550</strong>
            </span>
            <span className="px-3 py-1.5 bg-[#111111] border border-[#C5A028]/30 text-xs">
              Quarter Share: <strong className="text-[#C5A028]">$850 – $1,050</strong>
            </span>
            <span className="px-3 py-1.5 bg-[#111111] border border-[#C5A028]/30 text-xs">
              Half Share: <strong className="text-[#C5A028]">$1,650 – $2,085</strong>
            </span>
            <span className="px-3 py-1.5 bg-[#111111] border border-[#C5A028]/30 text-xs">
              Full Share: <strong className="text-[#C5A028]">$3,300 – $4,200</strong>
            </span>
          </div>

          {/* CTA Group */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('reservation')}
              className="w-full sm:w-auto px-8 py-4 bg-[#C5A028] text-black font-bold uppercase text-[10px] sm:text-xs tracking-widest hover:bg-[#d6af30] transition-colors shadow-lg shadow-[#C5A028]/20 flex items-center justify-center gap-2"
            >
              <span>Reserve Allocation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('shares')}
              className="w-full sm:w-auto px-8 py-4 border border-[#C5A028] text-[#C5A028] uppercase text-[10px] sm:text-xs tracking-widest hover:bg-[#C5A028] hover:text-black transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Share Tiers</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 border-t border-[#C5A028]/20 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px] text-zinc-400 uppercase tracking-wider">
            <div className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C5A028]" />
              <span>100% Montana Born</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Clock className="w-4 h-4 text-[#C5A028]" />
              <span>21-Day Cedar Dry Aged</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Award className="w-4 h-4 text-[#C5A028]" />
              <span>No Added Hormones</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Truck className="w-4 h-4 text-[#C5A028]" />
              <span>Insulated Nationwide</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Column Sophisticated Beef Shares Grid */}
      <section className="bg-[#0a0a0a] border-b border-[#C5A028]/20">
        <div className="border-b border-[#C5A028]/20 px-8 py-8 text-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A028] font-mono block mb-2">
            HERD RESERVATION SELECTION
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            Choose Your Seasonal Beef Share
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#C5A028]/20">
          {/* Full Share */}
          <div className="p-8 flex flex-col justify-between hover:bg-[#151515] transition-colors bg-[#0a0a0a]">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C5A028] block">01 — Full Share</span>
              <h3 className="font-serif text-2xl mt-2 font-bold text-amber-100">The Heritage Reserve</h3>
              <p className="text-xs mt-3 text-zinc-400 leading-relaxed">
                The complete ranch-to-table experience. 400-500 lbs of dry-aged prime steaks, roasts, and artisan burger.
              </p>
              <div className="mt-4 pt-4 border-t border-[#C5A028]/10 text-xs space-y-1.5 text-zinc-400">
                <p>• Custom butcher cut sheet consultation</p>
                <p>• Requires 16–20 cu. ft. freezer capacity</p>
                <p>• Free nationwide insulated shipping</p>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-[#C5A028]/20">
              <p className="font-serif text-2xl font-bold text-white">$3,300 – $4,200</p>
              <p className="text-[10px] text-[#C5A028] uppercase tracking-widest mt-0.5">$600 refundable deposit</p>
              <button
                onClick={() => onSelectShare('Full')}
                className="mt-4 w-full py-3 border border-[#C5A028] text-[#C5A028] uppercase text-[10px] tracking-widest font-bold hover:bg-[#C5A028] hover:text-black transition-colors"
              >
                Select Full Share
              </button>
            </div>
          </div>

          {/* Half Share - Popular */}
          <div className="p-8 flex flex-col justify-between bg-[#111111] hover:bg-[#151515] transition-colors relative">
            <div className="absolute top-0 right-0 bg-[#C5A028] text-black font-bold uppercase text-[9px] tracking-widest px-3 py-1">
              Popular Choice
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C5A028] block">02 — Half Share</span>
              <h3 className="font-serif text-2xl mt-2 font-bold text-amber-100">The Family Provisions</h3>
              <p className="text-xs mt-3 text-zinc-400 leading-relaxed">
                Ideal for families. 200-250 lbs of diverse grass-fed or grain-finished prime steaks and provisions.
              </p>
              <div className="mt-4 pt-4 border-t border-[#C5A028]/10 text-xs space-y-1.5 text-zinc-400">
                <p>• Choice of Grass-Fed or Grain-Finished</p>
                <p>• Requires 8–10 cu. ft. freezer space</p>
                <p>• 21-Day cedar dry aging included</p>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-[#C5A028]/20">
              <p className="font-serif text-2xl font-bold text-white">$1,650 – $2,085</p>
              <p className="text-[10px] text-[#C5A028] uppercase tracking-widest mt-0.5">$300 refundable deposit</p>
              <button
                onClick={() => onSelectShare('Half')}
                className="mt-4 w-full py-3 bg-[#C5A028] text-black uppercase text-[10px] tracking-widest font-bold hover:bg-[#d6af30] transition-colors"
              >
                Select Half Share
              </button>
            </div>
          </div>

          {/* Quarter Share */}
          <div className="p-8 flex flex-col justify-between hover:bg-[#151515] transition-colors bg-[#0a0a0a]">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C5A028] block">03 — Quarter Share</span>
              <h3 className="font-serif text-2xl mt-2 font-bold text-amber-100">The Curated Box</h3>
              <p className="text-xs mt-3 text-zinc-400 leading-relaxed">
                Perfect for culinary enthusiasts. 100-125 lbs of balanced steaks, slow-cook roasts, and ground chuck.
              </p>
              <div className="mt-4 pt-4 border-t border-[#C5A028]/10 text-xs space-y-1.5 text-zinc-400">
                <p>• Fits in standard chest freezer (4-5 cu. ft.)</p>
                <p>• Vacuum sealed in 1-2 lb portions</p>
                <p>• Includes ribeyes, NY strips & tenderloin</p>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-[#C5A028]/20">
              <p className="font-serif text-2xl font-bold text-white">$850 – $1,050</p>
              <p className="text-[10px] text-[#C5A028] uppercase tracking-widest mt-0.5">$150 refundable deposit</p>
              <button
                onClick={() => onSelectShare('Quarter')}
                className="mt-4 w-full py-3 border border-[#C5A028] text-[#C5A028] uppercase text-[10px] tracking-widest font-bold hover:bg-[#C5A028] hover:text-black transition-colors"
              >
                Select Quarter Share
              </button>
            </div>
          </div>

          {/* Eighth Share */}
          <div className="p-8 flex flex-col justify-between hover:bg-[#151515] transition-colors bg-[#0a0a0a]">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C5A028] block">04 — Eighth Share</span>
              <h3 className="font-serif text-2xl mt-2 font-bold text-amber-100">The Tasting Entry</h3>
              <p className="text-xs mt-3 text-zinc-400 leading-relaxed">
                Explore the Bastanzi difference. 50-60 lbs of essential dry-aged cuts fitting standard kitchen freezers.
              </p>
              <div className="mt-4 pt-4 border-t border-[#C5A028]/10 text-xs space-y-1.5 text-zinc-400">
                <p>• Requires ~2.5 cu. ft. freezer space</p>
                <p>• Great intro to dry-aged beef</p>
                <p>• Flash frozen for peak freshness</p>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-[#C5A028]/20">
              <p className="font-serif text-2xl font-bold text-white">$450 – $550</p>
              <p className="text-[10px] text-[#C5A028] uppercase tracking-widest mt-0.5">$100 refundable deposit</p>
              <button
                onClick={() => onSelectShare('Eighth')}
                className="mt-4 w-full py-3 border border-[#C5A028] text-[#C5A028] uppercase text-[10px] tracking-widest font-bold hover:bg-[#C5A028] hover:text-black transition-colors"
              >
                Select Eighth Share
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Heritage Section */}
      <section className="py-20 bg-[#111111] border-b border-[#C5A028]/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Image Stack */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#C5A028]/30 shadow-2xl aspect-4/3 group bg-[#0a0a0a]">
                <img
                  src={BRAND_IMAGES.primeRibeye}
                  alt="Bastanzi Dry Aged Prime Ribeye"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#0a0a0a]/90 backdrop-blur-md border border-[#C5A028]/30 rounded-xl">
                  <span className="text-[10px] uppercase font-mono text-[#C5A028] tracking-widest block">MASTER BUTCHER SELECTION</span>
                  <p className="font-serif text-sm text-amber-100 font-bold">21-Day Cedar Dry Aged Prime Ribeye</p>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-[#0a0a0a] border border-[#C5A028]/40 p-4 rounded-xl shadow-2xl hidden sm:block">
                <div className="flex items-center gap-3">
                  <img
                    src={BRAND_IMAGES.logo}
                    alt="Logo"
                    className="w-10 h-10 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="text-xs font-serif font-bold text-[#C5A028] block">BOZEMAN, MONTANA</span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest">Gallatin Valley Pastures</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Story Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C5A028]/10 border border-[#C5A028]/30 text-[10px] font-mono text-[#C5A028] uppercase tracking-widest">
                <span>OUR RANCH PHILOSOPHY</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
                Raised slowly on wide open pasture. Prepared with master craftsmanship.
              </h2>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                At Bastanzi Premium Beef Co., we believe extraordinary steak is born from pristine stewardship. Our Black Angus cattle graze freely on organic mountain pasture grasses watered by clear Gallatin snowmelt streams.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#C5A028] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-serif text-sm font-bold text-amber-100">21-Day Cedar Chamber Dry-Aging</h4>
                    <p className="text-xs text-zinc-400">Concentrates natural beef flavor while breaking down fibers for melt-in-your-mouth steakhouse tenderness.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#C5A028] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-serif text-sm font-bold text-amber-100">Zero Added Hormones or mRNA Vaccines</h4>
                    <p className="text-xs text-zinc-400">100% natural development without growth promoters, antibiotics, or unnatural synthetic additives.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#C5A028] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-serif text-sm font-bold text-amber-100">Custom Butcher Instructions for Full & Half Shares</h4>
                    <p className="text-xs text-zinc-400">Specify steak thickness, roast sizes, bone-in preferences, and lean burger ratios with our master butcher.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setActiveTab('about')}
                  className="px-6 py-3 border border-[#C5A028] text-[#C5A028] uppercase text-[10px] sm:text-xs tracking-widest font-bold hover:bg-[#C5A028] hover:text-black transition-colors inline-flex items-center gap-2"
                >
                  <span>Learn About Our Ranch Heritage</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Freezer Space Calculator */}
      <section className="py-20 bg-[#0a0a0a] border-b border-[#C5A028]/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <FreezerCalculator onSelectShare={onSelectShare} />
        </div>
      </section>

      {/* Customer Reviews & Testimonials */}
      <section className="py-20 bg-[#111111] border-b border-[#C5A028]/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-[10px] font-mono text-[#C5A028] uppercase tracking-[0.3em] bg-[#C5A028]/10 px-3 py-1 rounded-full border border-[#C5A028]/30">
              VERIFIED RANCH SHAREHOLDERS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Trusted by Beef Enthusiasts & Chefs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="bg-[#0a0a0a] p-6 border border-[#C5A028]/20 hover:border-[#C5A028]/50 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-[#C5A028]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C5A028]" />
                    ))}
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed italic font-serif">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-[#C5A028]/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-amber-100 block">{rev.author}</span>
                    <span className="text-zinc-500">{rev.location}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#C5A028] font-mono block uppercase tracking-wider">{rev.shareType}</span>
                    <span className="text-[10px] text-zinc-600">{rev.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reservation Bottom Callout */}
      <section className="bg-[#0a0a0a] border-b border-[#C5A028]/20 p-8 sm:p-12 flex flex-col lg:flex-row gap-8 items-center justify-between">
        <div className="lg:w-1/2 space-y-3">
          <span className="text-[10px] uppercase tracking-widest text-[#C5A028] font-mono block">HERD ALLOCATION RESERVATION</span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">Secure Your Fall 2026 Reservation</h3>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
            Complete our digital reservation form to hold your seasonal harvest allocation. Our ranch concierge will follow up within 24 hours to finalize butcher specs and delivery dates.
          </p>
          <div className="flex gap-4 items-center text-zinc-400 text-[11px] uppercase tracking-widest pt-2">
            <span className="text-[#C5A028] font-serif">{BUSINESS_INFO.email}</span>
            <div className="h-px w-8 bg-[#C5A028]" />
            <span>{BUSINESS_INFO.address}, {BUSINESS_INFO.cityStateZip}</span>
          </div>
        </div>

        <div className="lg:w-1/2 w-full flex flex-col sm:flex-row gap-4 justify-end">
          <button
            onClick={() => setActiveTab('reservation')}
            className="px-8 py-4 bg-[#C5A028] text-black font-bold uppercase text-[10px] sm:text-xs tracking-widest hover:bg-[#d6af30] transition-colors"
          >
            Request Allocation
          </button>
          <a
            href={`tel:${BUSINESS_INFO.phone}`}
            className="px-8 py-4 border border-[#C5A028] text-[#C5A028] uppercase text-[10px] sm:text-xs tracking-widest font-bold hover:bg-[#C5A028] hover:text-black transition-colors text-center"
          >
            Call {BUSINESS_INFO.phoneFormatted}
          </a>
        </div>
      </section>
    </div>
  );
}
