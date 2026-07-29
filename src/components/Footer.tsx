import { Phone, Mail, MapPin, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { BRAND_IMAGES, BUSINESS_INFO } from '../data/content';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenOgModal: () => void;
  onOpenSitemapModal: () => void;
  onOpenVercelModal: () => void;
}

export default function Footer({
  setActiveTab,
  onOpenOgModal,
  onOpenSitemapModal,
  onOpenVercelModal,
}: FooterProps) {
  const handleNav = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0a0a0a] text-zinc-300 border-t border-[#C5A028]/30 pt-16 pb-12 relative overflow-hidden">
      {/* Background Subtle Gold Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C5A028]/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#C5A028]/20">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full p-0.5 bg-[#C5A028]/30 border border-[#C5A028]">
                <img
                  src={BRAND_IMAGES.logo}
                  alt={BUSINESS_INFO.name}
                  className="w-full h-full object-cover rounded-full bg-[#0a0a0a]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-widest text-[#C5A028] block uppercase">
                  BASTANZI
                </span>
                <span className="text-[10px] tracking-[0.3em] text-zinc-400 uppercase font-sans block">
                  PREMIUM BEEF CO.
                </span>
              </div>
            </div>

            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Artisan ranch-raised, 21-day dry-aged beef harvested directly from our pastures in Bozeman, Montana. Delivering unmatched tenderness and marbling from pasture to table.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-[#C5A028] font-mono uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#C5A028]" />
              <span>100% Montana Raised • USDA Inspected • 21-Day Dry Aged</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-[#C5A028] text-xs font-bold tracking-[0.2em] uppercase">
              Ranch Navigation
            </h4>
            <ul className="space-y-2 text-xs uppercase tracking-wider">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-[#C5A028] transition-colors">
                  Heritage
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-[#C5A028] transition-colors">
                  About Our Ranch
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('shares')} className="hover:text-[#C5A028] transition-colors">
                  Beef Shares & Pricing
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('gallery')} className="hover:text-[#C5A028] transition-colors">
                  Photo Gallery
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('faq')} className="hover:text-[#C5A028] transition-colors">
                  FAQ & Storage Guide
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('reservation')} className="text-[#C5A028] font-bold hover:underline">
                  Reserve Your Share
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-serif text-[#C5A028] text-xs font-bold tracking-[0.2em] uppercase">
              Direct Inquiries
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#C5A028] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase tracking-widest">Phone</span>
                  <a href={`tel:${BUSINESS_INFO.phone}`} className="hover:text-[#C5A028] font-serif italic">
                    {BUSINESS_INFO.phoneFormatted}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#C5A028] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase tracking-widest">General Inquiries</span>
                  <a href={`mailto:${BUSINESS_INFO.email}`} className="hover:text-[#C5A028]">
                    {BUSINESS_INFO.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#C5A028] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase tracking-widest">Beef Orders Desk</span>
                  <a href={`mailto:${BUSINESS_INFO.ordersEmail}`} className="hover:text-[#C5A028] text-[#C5A028]">
                    {BUSINESS_INFO.ordersEmail}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C5A028] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase tracking-widest">Ranch Address</span>
                  <span className="text-zinc-300">{BUSINESS_INFO.address}, {BUSINESS_INFO.cityStateZip}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter & Reserve CTA */}
          <div className="space-y-3">
            <h4 className="font-serif text-[#C5A028] text-xs font-bold tracking-[0.2em] uppercase">
              Herd Allocations
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sign up for private butchering reserve dates and seasonal release announcements.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to Bastanzi Ranch alerts.'); }} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="w-full bg-[#111111] border border-[#C5A028]/30 focus:border-[#C5A028] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full bg-[#C5A028] hover:bg-[#d6af30] text-black font-bold text-xs uppercase tracking-widest py-2.5 transition-colors flex items-center justify-center gap-1"
              >
                <span>Join Ranch List</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar & Dev Artifact Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} Bastanzi Premium Beef Co. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-4 text-zinc-400">
            <button onClick={onOpenSitemapModal} className="hover:text-[#C5A028] transition-colors flex items-center gap-1">
              <span>sitemap.xml</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span>•</span>
            <button onClick={onOpenOgModal} className="hover:text-[#C5A028] transition-colors flex items-center gap-1">
              <span>OpenGraph Cards</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span>•</span>
            <button onClick={onOpenVercelModal} className="hover:text-[#C5A028] transition-colors flex items-center gap-1">
              <span>Vercel Config</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span>•</span>
            <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="hover:text-[#C5A028] transition-colors">
              robots.txt
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
