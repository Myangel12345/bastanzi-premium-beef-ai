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
    <footer className="bg-[#07110a] text-stone-300 border-t border-emerald-900/80 pt-16 pb-12 relative overflow-hidden">
      {/* Background Subtle Gold Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent blur-xs" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-emerald-900/60">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 to-amber-200 shadow-md shrink-0">
                <img
                  src={BRAND_IMAGES.logo}
                  alt={BUSINESS_INFO.name}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-serif text-xl font-bold tracking-wider text-amber-200 block uppercase">
                  BASTANZI
                </span>
                <span className="text-[10px] tracking-[0.25em] text-amber-400/80 uppercase font-sans font-light block">
                  PREMIUM BEEF CO.
                </span>
              </div>
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
              Artisan ranch-raised, dry-aged beef harvested directly from our pastures. Delivering unmatched tenderness and marbling from pasture to table.
            </p>

            <div className="pt-2 flex flex-col gap-1.5 text-xs text-amber-400/90 font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Pasture Raised • USDA Inspected • 21-Day Dry Aged</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans mt-1">
                <strong className="text-amber-300 font-serif">Proudly Serving:</strong> {BUSINESS_INFO.serviceAreas.join(' • ')}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-amber-300 text-sm font-semibold tracking-wider uppercase">
              Ranch Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-amber-300 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-amber-300 transition-colors">
                  About Our Ranch
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('shares')} className="hover:text-amber-300 transition-colors">
                  Beef Shares & Pricing
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('track-order')} className="text-amber-300 font-semibold hover:underline">
                  Track My Order
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('admin')} className="text-amber-400/80 hover:text-amber-300 transition-colors text-xs uppercase tracking-widest font-mono">
                  🔒 Admin Portal
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('gallery')} className="hover:text-amber-300 transition-colors">
                  Photo Gallery
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('faq')} className="hover:text-amber-300 transition-colors">
                  FAQ & Storage Guide
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('reservation')} className="text-amber-400 font-semibold hover:underline">
                  Reserve Your Share
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-serif text-amber-300 text-sm font-semibold tracking-wider uppercase">
              Direct Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-zinc-500 block uppercase tracking-wider">General Inquiries</span>
                  <a href={`mailto:${BUSINESS_INFO.email}`} className="hover:text-amber-300">
                    {BUSINESS_INFO.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-zinc-500 block uppercase tracking-wider">Beef Orders Desk</span>
                  <a href={`mailto:${BUSINESS_INFO.ordersEmail}`} className="hover:text-amber-300 text-amber-200">
                    {BUSINESS_INFO.ordersEmail}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-zinc-500 block uppercase tracking-wider">Ranch Address</span>
                  <span className="text-zinc-300">{BUSINESS_INFO.address}, {BUSINESS_INFO.cityStateZip}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter & Reserve CTA */}
          <div className="space-y-3">
            <h4 className="font-serif text-amber-300 text-sm font-semibold tracking-wider uppercase">
              Reserve First Choice
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sign up for herd release alerts and exclusive private butchering reserve dates.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to Bastanzi Ranch alerts.'); }} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email address"
                required
                className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-400 rounded px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-serif font-bold text-xs uppercase py-2 rounded transition-colors flex items-center justify-center gap-1"
              >
                <span>Join Ranch List</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar & Dev Artifact Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© 2015 Bastanzi Premium Beef Co. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-4 text-zinc-400">
            <button onClick={onOpenSitemapModal} className="hover:text-amber-300 transition-colors flex items-center gap-1">
              <span>sitemap.xml</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span>•</span>
            <button onClick={onOpenOgModal} className="hover:text-amber-300 transition-colors flex items-center gap-1">
              <span>OpenGraph Cards</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span>•</span>
            <button onClick={onOpenVercelModal} className="hover:text-amber-300 transition-colors flex items-center gap-1">
              <span>Vercel Config</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span>•</span>
            <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">
              robots.txt
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
