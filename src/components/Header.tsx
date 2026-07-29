import { useState } from 'react';
import { Menu, X, Phone, ShieldCheck, Share2, FileCode2, Code } from 'lucide-react';
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
    { id: 'home', label: 'Heritage' },
    { id: 'about', label: 'About' },
    { id: 'shares', label: 'Beef Shares' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#C5A028]/30 text-white transition-all">
      {/* Top Banner Announcement */}
      <div className="bg-[#111111] text-[#C5A028] text-[10px] sm:text-xs py-2 px-6 text-center tracking-widest uppercase font-serif border-b border-[#C5A028]/20 flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-[#C5A028]/80">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C5A028]" />
          <span>Montana USDA Inspected & 21-Day Dry Aged</span>
        </div>
        <div className="mx-auto sm:mx-0 font-semibold tracking-widest">
          ✨ ACCEPTING FALL 2026 HERD RESERVATIONS • LIMITED QUANTITIES
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs font-sans text-zinc-300">
          <a
            href={`tel:${BUSINESS_INFO.phone}`}
            className="flex items-center gap-1.5 hover:text-[#C5A028] transition-colors"
          >
            <Phone className="w-3 h-3 text-[#C5A028]" />
            <span className="font-serif italic">{BUSINESS_INFO.phoneFormatted}</span>
          </a>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
        {/* Brand Logo & Emblem */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3.5 group text-left focus:outline-none"
        >
          <div className="relative w-11 h-11 rounded-full p-0.5 bg-[#C5A028]/30 border border-[#C5A028]/60 group-hover:border-[#C5A028] transition-all">
            <img
              src={BRAND_IMAGES.logo}
              alt={BUSINESS_INFO.name}
              className="w-full h-full object-cover rounded-full bg-[#0a0a0a]"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-widest text-[#C5A028] block uppercase leading-none">
              BASTANZI
            </span>
            <span className="text-[10px] tracking-[0.3em] uppercase opacity-70 text-zinc-300 block mt-1">
              Premium Beef Co.
            </span>
          </div>
        </button>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-widest font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`transition-colors py-1 focus:outline-none relative ${
                  isActive ? 'text-[#C5A028] font-bold' : 'text-zinc-300 hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C5A028]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons & Inquiries Desk */}
        <div className="hidden sm:flex items-center gap-5">
          {/* SEO & Dev Tools */}
          <div className="flex items-center gap-1.5 border-r border-[#C5A028]/20 pr-4 text-zinc-400">
            <button
              onClick={onOpenOgModal}
              title="Open Graph Preview"
              className="p-1.5 rounded hover:bg-[#151515] hover:text-[#C5A028] transition-colors text-xs flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider hidden xl:inline">OG Cards</span>
            </button>
            <button
              onClick={onOpenSitemapModal}
              title="Sitemap.xml Preview"
              className="p-1.5 rounded hover:bg-[#151515] hover:text-[#C5A028] transition-colors text-xs flex items-center gap-1"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider hidden xl:inline">Sitemap</span>
            </button>
            <button
              onClick={onOpenVercelModal}
              title="Deployment Setup"
              className="p-1.5 rounded hover:bg-[#151515] hover:text-[#C5A028] transition-colors text-xs flex items-center gap-1"
            >
              <Code className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider hidden xl:inline">Deploy</span>
            </button>
          </div>

          <button
            onClick={() => handleNavClick('reservation')}
            className={`px-5 py-2.5 uppercase text-[10px] sm:text-xs tracking-widest font-bold transition-colors ${
              activeTab === 'reservation'
                ? 'bg-[#C5A028] text-black shadow-lg shadow-[#C5A028]/20'
                : 'border border-[#C5A028] text-[#C5A028] hover:bg-[#C5A028] hover:text-black'
            }`}
          >
            Reservation
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={() => handleNavClick('reservation')}
            className="px-3 py-1.5 bg-[#C5A028] text-black text-[10px] font-bold uppercase tracking-widest"
          >
            Reserve
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-300 hover:text-white focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#C5A028]" /> : <Menu className="w-6 h-6 text-zinc-300" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#111111] border-b border-[#C5A028]/30 px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-3">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left px-4 py-2.5 text-xs font-medium uppercase tracking-widest transition-colors ${
                    isActive
                      ? 'bg-[#C5A028]/15 text-[#C5A028] font-bold border-l-2 border-[#C5A028]'
                      : 'text-zinc-300 hover:bg-[#151515] hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={() => handleNavClick('reservation')}
              className="w-full text-center py-3 bg-[#C5A028] text-black font-bold uppercase text-xs tracking-widest mt-2"
            >
              Reserve Beef Share
            </button>
          </div>

          <div className="pt-4 border-t border-[#C5A028]/20 flex items-center justify-around text-[10px] text-zinc-400 uppercase tracking-widest">
            <button onClick={onOpenOgModal} className="flex items-center gap-1 hover:text-[#C5A028]">
              <Share2 className="w-3.5 h-3.5" /> OG Cards
            </button>
            <button onClick={onOpenSitemapModal} className="flex items-center gap-1 hover:text-[#C5A028]">
              <FileCode2 className="w-3.5 h-3.5" /> Sitemap
            </button>
            <button onClick={onOpenVercelModal} className="flex items-center gap-1 hover:text-[#C5A028]">
              <Code className="w-3.5 h-3.5" /> Deploy Info
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
