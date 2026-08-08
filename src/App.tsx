import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import OpenGraphModal from './components/OpenGraphModal';
import SitemapModal from './components/SitemapModal';
import VercelConfigModal from './components/VercelConfigModal';
import BeefConciergeChat from './components/BeefConciergeChat';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import BeefSharesPage from './pages/BeefSharesPage';
import GalleryPage from './pages/GalleryPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import ReservationPage from './pages/ReservationPage';
import TrackOrderPage from './pages/TrackOrderPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminChatPage from './pages/AdminChatPage';

import { ShareSize } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedShare, setSelectedShare] = useState<ShareSize | undefined>(undefined);

  // Modals state
  const [ogModalOpen, setOgModalOpen] = useState(false);
  const [sitemapModalOpen, setSitemapModalOpen] = useState(false);
  const [vercelModalOpen, setVercelModalOpen] = useState(false);

  // Sync pathname & hash with active tab for clean client navigation
  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname.replace(/^\//, '');
      if (pathname === 'admin/chat' || pathname === 'admin-chat') {
        setActiveTab('admin-chat');
        return;
      }
      if (pathname === 'admin') {
        setActiveTab('admin');
        return;
      }
      const rawHash = window.location.hash.replace('#', '');
      const cleanHash = rawHash.split('?')[0];
      if (cleanHash === 'admin/chat' || cleanHash === 'admin-chat') {
        setActiveTab('admin-chat');
        return;
      }
      if (
        [
          'home',
          'about',
          'shares',
          'gallery',
          'faq',
          'contact',
          'reservation',
          'track-order',
          'admin',
          'admin-chat',
        ].includes(cleanHash)
      ) {
        setActiveTab(cleanHash);
      }
    };

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
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
        {activeTab === 'shares' && (
          <BeefSharesPage
            onSelectShare={handleSelectShare}
            onNavigateToContact={() => changeTab('contact')}
          />
        )}
        {activeTab === 'gallery' && <GalleryPage />}
        {activeTab === 'faq' && <FaqPage setActiveTab={changeTab} />}
        {activeTab === 'contact' && <ContactPage />}
        {activeTab === 'reservation' && (
          <ReservationPage initialShareSize={selectedShare} />
        )}
        {activeTab === 'track-order' && (
          <TrackOrderPage onNavigateToReservation={() => changeTab('reservation')} />
        )}
        {activeTab === 'admin' && <AdminDashboardPage />}
        {(activeTab === 'admin-chat' || activeTab === 'admin/chat') && <AdminChatPage />}
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

      {/* AI Beef Concierge Chat Widget - Public customer pages only */}
      {!(
        activeTab === 'admin' ||
        activeTab === 'admin-chat' ||
        activeTab === 'admin/chat' ||
        activeTab.startsWith('admin') ||
        (typeof window !== 'undefined' &&
          (window.location.pathname.startsWith('/admin') ||
            window.location.hash.startsWith('#admin') ||
            window.location.hash.startsWith('#/admin')))
      ) && (
        <BeefConciergeChat
          onNavigateToReservation={() => changeTab('reservation')}
          onNavigateToContact={() => changeTab('contact')}
        />
      )}
    </div>
  );
}
