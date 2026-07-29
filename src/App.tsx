import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import OpenGraphModal from './components/OpenGraphModal';
import SitemapModal from './components/SitemapModal';
import VercelConfigModal from './components/VercelConfigModal';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import BeefSharesPage from './pages/BeefSharesPage';
import GalleryPage from './pages/GalleryPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import ReservationPage from './pages/ReservationPage';

import { ShareSize } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedShare, setSelectedShare] = useState<ShareSize | undefined>(undefined);

  // Modals state
  const [ogModalOpen, setOgModalOpen] = useState(false);
  const [sitemapModalOpen, setSitemapModalOpen] = useState(false);
  const [vercelModalOpen, setVercelModalOpen] = useState(false);

  // Sync hash with active tab for clean client navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'about', 'shares', 'gallery', 'faq', 'contact', 'reservation'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  const handleSelectShare = (shareSize: ShareSize) => {
    setSelectedShare(shareSize);
    changeTab('reservation');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black flex flex-col justify-between">
      {/* Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={changeTab}
        onOpenOgModal={() => setOgModalOpen(true)}
        onOpenSitemapModal={() => setSitemapModalOpen(true)}
        onOpenVercelModal={() => setVercelModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {activeTab === 'home' && (
          <HomePage setActiveTab={changeTab} onSelectShare={handleSelectShare} />
        )}
        {activeTab === 'about' && <AboutPage setActiveTab={changeTab} />}
        {activeTab === 'shares' && <BeefSharesPage onSelectShare={handleSelectShare} />}
        {activeTab === 'gallery' && <GalleryPage />}
        {activeTab === 'faq' && <FaqPage setActiveTab={changeTab} />}
        {activeTab === 'contact' && <ContactPage />}
        {activeTab === 'reservation' && (
          <ReservationPage initialShareSize={selectedShare} />
        )}
      </main>

      {/* Footer */}
      <Footer
        setActiveTab={changeTab}
        onOpenOgModal={() => setOgModalOpen(true)}
        onOpenSitemapModal={() => setSitemapModalOpen(true)}
        onOpenVercelModal={() => setVercelModalOpen(true)}
      />

      {/* Interactive Modals */}
      <OpenGraphModal isOpen={ogModalOpen} onClose={() => setOgModalOpen(false)} />
      <SitemapModal isOpen={sitemapModalOpen} onClose={() => setSitemapModalOpen(false)} />
      <VercelConfigModal isOpen={vercelModalOpen} onClose={() => setVercelModalOpen(false)} />
    </div>
  );
}
