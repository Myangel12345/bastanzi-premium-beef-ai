import { useState } from 'react';
import { Menu, X, Phone, ShieldCheck, Share2, FileCode2, Code, User } from 'lucide-react';
import { BRAND_IMAGES, BUSINESS_INFO } from '../data/content';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenOgModal: () => void;
  onOpenSitemapModal: () => void;
  onOpenVercelModal: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  onOpenOgModal,
  onOpenSitemapModal,
  onOpenVercelModal,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Our Ranch' },
    { id: 'shares', label: 'Beef Shares' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'track', label: 'Track Order' },
    { id: 'portal', label: 'Customer Portal' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: 'Contact' },
    { id: 'admin', label: 'Admin Portal' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0c1a12]/95 backdrop-blur-md border-b border-emerald-800/50 text-white transition-all">
      {/* Top Banner Announcement */}
      <div className="bg-gradient-to-r from-[#07110a] via-[#0f2418] to-[#07110a] text-amber-200 text-xs py-1.5 px-4 text-center tracking-wider uppercase font-serif border-b border-emerald-800/30 flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-amber-400/90">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>USDA Inspected & 21-Day Dry Aged</span>
        </div>
        <div className="mx-auto sm:mx-0 font-medium tracking-widest text-[11px] sm:text-xs text-amber-100">
          ✨ ACCEPTING FALL HERD RESERVATIONS • LIMITED QUANTITIES
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs font-sans">
          <a
            href={`tel:${BUSINESS_INFO.phone}`}
            className="flex items-center gap-1 hover:text-amber-300 transition-colors text-amber-200"
          >
            <Phone className="w-3 h-3 text-amber-400" />
            <span>{BUSINESS_INFO.phoneFormatted}</span>
          </a>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Emblem */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 group text-left focus:outline-none"
        >
          <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-amber-200 to-amber-600 shadow-lg shadow-emerald-950/60 group-hover:scale-105 transition-transform">
            <img
              src={BRAND_IMAGES.logo}
              alt={BUSINESS_INFO.name}
              className="w-full h-full object-cover rounded-full bg-[#0c1a12]"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="font-serif text-lg sm:text-xl font-bold tracking-wider text-amber-100 block uppercase">
              BASTANZI
            </span>
            <span className="text-[10px] sm:text-[11px] tracking-[0.2em] text-amber-400/90 uppercase font-sans font-light block -mt-1">
              PREMIUM BEEF CO.
            </span>
          </div>
        </button>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-xs font-medium tracking-wide transition-all relative py-1 focus:outline-none ${
                  isActive
                    ? 'text-amber-300 font-semibold'
                    : 'text-stone-300 hover:text-amber-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons & Modal Tools */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => handleNavClick('reservation')}
            className={`px-5 py-2.5 rounded-full font-serif text-xs font-semibold uppercase tracking-widest transition-all shadow-md ${
              activeTab === 'reservation'
                ? 'bg-amber-400 text-black shadow-amber-400/30 ring-2 ring-amber-300'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black hover:brightness-110 hover:shadow-amber-500/20'
            }`}
          >
            Reserve Share
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => handleNavClick('reservation')}
            className="px-3 py-1.5 rounded-full bg-amber-400 text-black text-[11px] font-bold uppercase tracking-wider"
          >
            Reserve
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-300 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-amber-400" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0c1a12] border-b border-emerald-800/60 px-4 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-3">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left px-4 py-2.5 rounded-lg text-base font-serif tracking-wide transition-colors ${
                    isActive
                      ? 'bg-emerald-900/60 text-amber-300 font-semibold border-l-2 border-amber-400'
                      : 'text-stone-300 hover:bg-emerald-950 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={() => handleNavClick('reservation')}
              className="w-full text-center py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-emerald-950 font-serif font-bold uppercase tracking-widest rounded-lg shadow-lg"
            >
              Reserve Beef Share
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
