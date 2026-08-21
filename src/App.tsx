/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Settings, 
  MapPin, 
  Phone, 
  Clock, 
  Award, 
  Menu as MenuIcon, 
  X, 
  Sparkles, 
  Info, 
  Heart, 
  ChevronDown,
  Lock
} from 'lucide-react';

import { MenuItem, Highlight, Announcement, SeasonalSpecial, VibeVideo, BulkBooking, RegularCustomer } from './types';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import Logo from './components/Logo';
import CulturalVibe from './components/CulturalVibe';
import Gallery from './components/Gallery';
import AdminPanel from './components/AdminPanel';
import InteractiveMap from './components/InteractiveMap';
import SeasonalSpecialCard from './components/SeasonalSpecialCard';
import { MarigoldGarland, CamelCaravan, MandalaSpinner } from './components/Decorations';
import DesertMargins from './components/DesertMargins';
import BookingModal from './components/BookingModal';
import ErrorBoundary from './components/ErrorBoundary';
import SecurityHardening from './components/SecurityHardening';

export default function App() {
  // Database States loaded from Backend
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [seasonalSpecial, setSeasonalSpecial] = useState<SeasonalSpecial | null>(null);
  const [vibeVideos, setVibeVideos] = useState<VibeVideo[]>([]);
  const [bookings, setBookings] = useState<BulkBooking[]>([]);
  const [regularCustomers, setRegularCustomers] = useState<RegularCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Layout UI States
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeAnnouncementIdx, setActiveAnnouncementIdx] = useState(0);

  // Fetch full state on mount
  const fetchState = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/state');
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      if (data) {
        setMenuItems(data.menu || []);
        setHighlights(data.highlights || []);
        setAnnouncements(data.announcements || []);
        setSeasonalSpecial(data.seasonalSpecial || null);
        setVibeVideos(data.vibeVideos || []);
        setBookings(data.bookings || []);
        setRegularCustomers(data.regularCustomers || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch state from server:', err);
      setFetchError(err.message || 'Failed to fetch');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    if (window.location.pathname.toLowerCase().includes('admin')) {
      setIsAdminOpen(true);
    }
  }, []);

  // Filter active announcements
  const activeAnnouncements = announcements.filter(ann => ann.isActive);

  // Rotate announcements ticker
  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;
    const interval = setInterval(() => {
      setActiveAnnouncementIdx(prev => (prev + 1) % activeAnnouncements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeAnnouncements]);

  // Sync logo to server public folder
  useEffect(() => {
    fetch('/api/get-logo-b64').catch(() => {});
  }, []);

  // Smooth Scrolling with Mobile Menu Auto-Close & Header Offset
  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const headerOffset = 85;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
      }
    }, 150);
  };

  // Secret Triple-Click on Logo Emblem to open Admin Console for Owner
  const logoClickCountRef = React.useRef(0);
  const logoTimerRef = React.useRef<any>(null);

  const handleLogoClick = () => {
    logoClickCountRef.current += 1;
    if (logoClickCountRef.current >= 3) {
      setIsAdminOpen(true);
      logoClickCountRef.current = 0;
      if (logoTimerRef.current) clearTimeout(logoTimerRef.current);
      return;
    }
    if (logoTimerRef.current) clearTimeout(logoTimerRef.current);
    logoTimerRef.current = setTimeout(() => {
      logoClickCountRef.current = 0;
    }, 1200);
  };

  // Secret Keyboard Shortcut (Ctrl + Shift + A) to toggle Admin Console
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper for Authorization Headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('majisa_admin_token') || '';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // ----------------- CRUD API HANDLERS -----------------

  const handleAddMenuItem = async (newItem: Omit<MenuItem, 'id'>) => {
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newItem)
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error('Failed to add dish:', err);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error('Failed to delete dish:', err);
    }
  };

  const handleUpdateMenuItem = async (updatedItem: MenuItem) => {
    try {
      const res = await fetch(`/api/menu/${updatedItem.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedItem)
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error('Failed to update dish:', err);
    }
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isAvailable: !currentStatus })
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleAddHighlight = async (newHighlight: Omit<Highlight, 'id' | 'date'>) => {
    try {
      const res = await fetch('/api/highlights', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newHighlight)
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error('Failed to add slide:', err);
    }
  };

  const handleDeleteHighlight = async (id: string) => {
    try {
      const res = await fetch(`/api/highlights/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error('Failed to delete slide:', err);
    }
  };

  const handleToggleHighlightHero = async (id: string, showInHero: boolean) => {
    try {
      const res = await fetch(`/api/highlights/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ showInHero })
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error('Failed to toggle highlight hero:', err);
    }
  };

  const handleAddAnnouncement = async (newAnn: Omit<Announcement, 'id' | 'isActive' | 'date'>) => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newAnn)
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error('Failed to post announcement:', err);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  const handleToggleAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements/${id}/toggle`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error('Failed to toggle announcement:', err);
    }
  };

  const handleUpdateSeasonalSpecial = async (updatedSpecial: SeasonalSpecial) => {
    try {
      const res = await fetch('/api/seasonal-special', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedSpecial)
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error('Failed to update seasonal special:', err);
    }
  };

  const handleUpdateVibeVideos = async (updatedVideos: VibeVideo[]) => {
    try {
      const res = await fetch('/api/vibe-videos', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedVideos)
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error('Failed to update vibe videos:', err);
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      }
    } catch (err) {
      console.error('Failed to update booking status:', err);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setBookings(prev => prev.filter(b => b.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete booking:', err);
    }
  };

  const handleAddCustomer = async (cust: { name: string; phone: string }) => {
    try {
      const res = await fetch('/api/regular-customers', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(cust)
      });
      if (res.ok) {
        const addedCustomer = await res.json();
        setRegularCustomers(prev => [addedCustomer, ...prev]);
        await fetchState();
      }
    } catch (err) {
      console.error('Failed to add regular customer:', err);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      setRegularCustomers(prev => prev.filter(c => c.id !== id));
      const res = await fetch(`/api/regular-customers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error('Failed to delete regular customer:', err);
    }
  };

  // Simple token check to show direct quick edit borders/buttons
  const isCurrentlyAdmin = !!localStorage.getItem('majisa_admin_token');

  return (
    <div className="min-h-screen bg-heritage-dark text-[#fef3c7] flex flex-col relative antialiased selection:bg-heritage-red selection:text-gold-100 font-sans">
      <SecurityHardening />
      
      {/* Vibrant Palette Decorative Top Border */}
      <div className="h-1.5 w-full bg-gradient-to-r from-heritage-orange via-heritage-red to-heritage-teal opacity-90 relative z-50 shadow-sm" />

      {/* Decorative Traditional Marigold Garlands Hanging from Top */}
      <MarigoldGarland />

      {/* Decorative Camel, Dunes, & Desert silhouettes on left/right screen borders */}
      <DesertMargins />

      {/* ================== ACTIVE ANNOUNCEMENTS BANNER TICKER ================== */}
      {activeAnnouncements.length > 0 && (
        <div className="bg-gradient-to-r from-heritage-red via-heritage-maroon to-heritage-red text-gold-100 text-center py-2.5 px-4 text-xs sm:text-sm font-semibold relative z-30 border-b border-heritage-rust flex justify-center items-center overflow-hidden min-h-[2.5rem]">
          <div className="absolute inset-x-0.5 border-y border-dashed border-gold-400/20 pointer-events-none h-full" />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeAnnouncementIdx}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center space-x-2 relative z-10 font-sans leading-normal py-0.5"
            >
              <Sparkles className="w-4 h-4 text-heritage-yellow shrink-0 animate-pulse" />
              <span className="text-xs sm:text-sm tracking-wider uppercase font-bold text-heritage-yellow shrink-0">
                [{activeAnnouncements[activeAnnouncementIdx].type}]
              </span>
              <span className="text-xs sm:text-sm font-medium tracking-wide">
                {activeAnnouncements[activeAnnouncementIdx].title} — {activeAnnouncements[activeAnnouncementIdx].content}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ================== STICKY STYLED HEADER ================== */}
      <header className="sticky top-0 z-40 bg-[#2d1b10]/95 backdrop-blur-md border-b border-heritage-rust shadow-xl">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-2 min-h-[5.5rem] flex items-center justify-between">
          
          {/* Brand/Logo Name - Secret 3-Click Trigger for Owner */}
          <button
            onClick={() => {
              handleLogoClick();
              scrollToSection('home');
            }}
            id="btn-nav-brand"
            className="flex items-center space-x-4 text-left cursor-pointer group py-1"
          >
            <Logo className="w-16 h-16 sm:w-20 sm:h-20 group-hover:scale-110 transition-all duration-300 drop-shadow-2xl shrink-0" />
            <div>
              <p className="font-display text-lg sm:text-xl font-bold text-[#fbbf24] tracking-wide uppercase">
                माजीसा <span className="text-heritage-red">रेस्टोरेंट</span>
              </p>
              <p className="text-xs text-gold-100/70 tracking-[0.2em] uppercase font-sans font-semibold">
                AUTHENTIC RAJASTHANI DHABA
              </p>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-sans uppercase tracking-widest font-medium">
            <button onClick={() => scrollToSection('home')} id="btn-nav-home" className="text-[#fbbf24] hover:text-white transition-colors cursor-pointer border-b-2 border-transparent hover:border-[#fbbf24] pb-1">मुख्य पृष्ठ • Home</button>
            <button onClick={() => scrollToSection('cultural-vibe')} id="btn-nav-vibe" className="text-gold-100 hover:text-[#fbbf24] transition-colors cursor-pointer border-b-2 border-transparent hover:border-[#fbbf24] pb-1">संस्कृति • Culture</button>
            <button onClick={() => scrollToSection('menu')} id="btn-nav-menu" className="text-gold-100 hover:text-[#fbbf24] transition-colors cursor-pointer border-b-2 border-transparent hover:border-[#fbbf24] pb-1">मीनू • Menu</button>
            <button onClick={() => scrollToSection('gallery')} id="btn-nav-gallery" className="text-gold-100 hover:text-[#fbbf24] transition-colors cursor-pointer border-b-2 border-transparent hover:border-[#fbbf24] pb-1">गैलरी • Gallery</button>
            <button onClick={() => scrollToSection('contact')} id="btn-nav-contact" className="text-gold-100 hover:text-[#fbbf24] transition-colors cursor-pointer border-b-2 border-transparent hover:border-[#fbbf24] pb-1">संपर्क • Contact</button>
          </nav>

          {/* Actions & Mobile Menu trigger */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Bandola & Event Booking CTA Button */}
            <button
              onClick={() => setIsBookingOpen(true)}
              id="btn-trigger-booking-modal"
              className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 rounded-lg shadow-md transition-all text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer border border-amber-400/80 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-950 shrink-0 animate-pulse" />
              <span className="font-serif">शाही बंडोला व शादी बुकिंग</span>
            </button>

            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              id="btn-mobile-menu-toggle"
              className="p-2 md:hidden text-gold-300 hover:text-gold-100 transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drop-down drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-heritage-clay border-b border-gold-400/10 overflow-hidden text-sm"
            >
              <div className="px-6 py-6 flex flex-col space-y-4 font-medium text-gold-200">
                <button onClick={() => scrollToSection('home')} className="text-left py-1 cursor-pointer">Home</button>
                <button onClick={() => scrollToSection('cultural-vibe')} className="text-left py-1 cursor-pointer">Our Culture</button>
                <button onClick={() => scrollToSection('menu')} className="text-left py-1 cursor-pointer">The Menu</button>
                <button onClick={() => scrollToSection('gallery')} className="text-left py-1 cursor-pointer">Gallery Highlights</button>
                <button onClick={() => scrollToSection('contact')} className="text-left py-1 cursor-pointer">Contact Us</button>
                
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsBookingOpen(true);
                  }}
                  className="w-full py-2.5 bg-amber-500 text-amber-950 font-bold rounded-lg text-center flex items-center justify-center gap-2 cursor-pointer font-serif"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>शाही बंडोला व शादी बुकिंग (Book Bandola)</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ================== MAIN CONTENT LANDING PAGES ================== */}
      <main className="flex-grow">
        
        {/* Loding skeleton */}
        {isLoading ? (
          <div className="min-h-[80vh] flex flex-col items-center justify-center bg-heritage-dark">
            <MandalaSpinner size="w-24 h-24" speed={30} />
            <p className="font-serif italic text-gold-300 mt-6 text-lg animate-pulse">रसोई चालू हो रही है... Setting up Majisa's royal courtyard...</p>
          </div>
        ) : fetchError ? (
          <div className="min-h-[85vh] flex flex-col items-center justify-center bg-heritage-dark px-4 text-center">
            <div className="max-w-md p-8 rounded-lg bg-heritage-clay border border-heritage-orange/30 shadow-2xl relative overflow-hidden royal-glass">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-heritage-orange to-heritage-red" />
              <div className="w-16 h-16 rounded-full bg-heritage-red/10 border border-heritage-red flex items-center justify-center mx-auto mb-6 text-heritage-red">
                <Info className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-2">माजीसा की रसोई से संपर्क नहीं हो सका</h2>
              <h3 className="text-sm font-sans text-[#fbbf24] tracking-wide mb-4">Unable to connect to Majisa's royal kitchen</h3>
              <p className="text-xs text-gold-100/70 mb-6 leading-relaxed">
                We're currently setting up or warming up the ovens. Please check your internet connection or reload the kitchen state.
              </p>
              <button
                onClick={fetchState}
                className="w-full py-3 bg-heritage-red text-white font-bold rounded-sm shadow-md hover:bg-red-700 transition-colors uppercase tracking-widest text-xs cursor-pointer border border-heritage-red"
              >
                पुनः प्रयास करें • Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 1. Hero Landing Page */}
            <Hero 
              highlights={highlights} 
              onScrollToMenu={() => scrollToSection('menu')}
              onScrollToVibe={() => scrollToSection('cultural-vibe')}
              onOpenBooking={() => setIsBookingOpen(true)}
              onLogoClick={handleLogoClick}
            />

            {/* Seasonal Specials Highlight Card */}
            <SeasonalSpecialCard
              special={seasonalSpecial}
              isAdmin={isCurrentlyAdmin}
              onOpenAdmin={() => setIsAdminOpen(true)}
            />

            {/* 2. Cultural Vibe Section */}
            <CulturalVibe vibeVideos={vibeVideos} />

            {/* 3. Menu Section */}
            <MenuSection 
              menuItems={menuItems} 
              isAdmin={isCurrentlyAdmin}
              onDeleteMenuItem={handleDeleteMenuItem}
              onToggleAvailability={handleToggleAvailability}
            />

            {/* 4. Gallery Section */}
            <Gallery highlights={highlights} />
          </>
        )}

      </main>

      {/* ================== CONTACT & FOOTER SECTION ================== */}
      <footer className="bg-heritage-dark border-t border-gold-400/25 relative overflow-hidden" id="contact">
        {/* Moving Camel caravan on top of footer dunes */}
        <CamelCaravan />

        {/* Info Grid */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-16 pb-12 relative z-10">
          
          {/* Interactive Highway Roadmap Navigation */}
          <div className="mb-16">
            <InteractiveMap />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
            
            {/* Brief info */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center space-x-4">
                <Logo className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-2xl shrink-0" />
                <div>
                  <h3 className="font-display text-xl font-bold text-gold-100 uppercase tracking-wider">माजीसा कैफे एंड रेस्टोरेंट</h3>
                  <p className="text-xs text-gold-300/70 tracking-widest uppercase font-sans font-semibold">Authentic Marwari Dhaba Culture</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-sans">
                Experience Balotra's authentic rustic highway dhabas, prepared in earthenware, wooden clay ovens, and dipped in pure organic cow ghee. Pure Marwari hospitality on your plate.
              </p>
              <div className="flex items-center space-x-2 text-gold-300 pt-2">
                <Clock className="w-4 h-4 shrink-0 text-heritage-yellow" />
                <span className="text-xs font-mono font-semibold">11:00 AM - 11:00 PM (All Days Open)</span>
              </div>
            </div>

            {/* Important Links */}
            <div className="md:col-span-3 md:col-start-6 space-y-4">
              <h4 className="font-display text-sm font-bold text-gold-400 uppercase tracking-widest pb-1 border-b border-gold-400/10">Quick Navigation</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400 font-sans">
                <li><button onClick={() => scrollToSection('home')} className="hover:text-gold-200 cursor-pointer">Home Landing Page</button></li>
                <li><button onClick={() => scrollToSection('cultural-vibe')} className="hover:text-gold-200 cursor-pointer">Heritage & Culture</button></li>
                <li><button onClick={() => scrollToSection('menu')} className="hover:text-gold-200 cursor-pointer">Food Menu Cards</button></li>
                <li><button onClick={() => scrollToSection('gallery')} className="hover:text-gold-200 cursor-pointer">Gallery Highlights</button></li>
              </ul>
            </div>

            {/* Live Address & Phone */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="font-display text-sm font-bold text-gold-400 uppercase tracking-widest pb-1 border-b border-gold-400/10">Dhaba Address & Contact</h4>
              <ul className="space-y-3 text-xs sm:text-sm text-gray-400 font-sans">
                <li className="flex items-start space-x-2">
                  <MapPin className="w-5 h-5 text-heritage-orange shrink-0 mt-0.5" />
                  <a
                    href="https://share.google/QZtr669L0wNr1c95K"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold-200 underline transition-colors"
                  >
                    Housing Board, Siwana Road, Opp. Bhansali Petrol Pump, Balotra, Rajasthan 344022
                  </a>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-heritage-yellow shrink-0" />
                  <div className="flex flex-wrap gap-2">
                    <a href="tel:+917073011597" className="hover:text-gold-200 underline">+91 70730 11597</a>
                    <span>/</span>
                    <a href="tel:+919725845974" className="hover:text-gold-200 underline">+91 97258 45974</a>
                  </div>
                </li>
              </ul>
            </div>

          </div>

          {/* Copyright signature */}
          <div className="border-t border-gold-400/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-xxs sm:text-xs text-gray-500 font-sans gap-4">
            <p>© {new Date().getFullYear()} <span className="text-gray-400 font-medium">NexSecureTech</span>. All Rights Reserved.</p>
            <p className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-heritage-red fill-current" /> by <span className="text-gray-400 font-medium">NexSecureTech</span> for Majisa Cafe & Restaurant.
            </p>
          </div>
        </div>
      </footer>

      {/* ================== BANDOLA & EVENT BOOKING MODAL ================== */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        menuItems={menuItems}
        onBookingSubmitted={(newBk) => setBookings(prev => [newBk, ...prev])}
      />

      {/* ================== OWNER ADMIN CONSOLE MODAL ================== */}
      <AnimatePresence>
        {isAdminOpen && (
          <ErrorBoundary>
            <AdminPanel 
              menuItems={menuItems}
              highlights={highlights}
              announcements={announcements}
              seasonalSpecial={seasonalSpecial}
              vibeVideos={vibeVideos}
              bookings={bookings}
              regularCustomers={regularCustomers}
              onAddMenuItem={handleAddMenuItem}
              onUpdateMenuItem={handleUpdateMenuItem}
              onDeleteMenuItem={handleDeleteMenuItem}
              onAddHighlight={handleAddHighlight}
              onDeleteHighlight={handleDeleteHighlight}
              onToggleHighlightHero={handleToggleHighlightHero}
              onAddAnnouncement={handleAddAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
              onToggleAnnouncement={handleToggleAnnouncement}
              onUpdateSeasonalSpecial={handleUpdateSeasonalSpecial}
              onUpdateVibeVideos={handleUpdateVibeVideos}
              onUpdateBookingStatus={handleUpdateBookingStatus}
              onDeleteBooking={handleDeleteBooking}
              onAddCustomer={handleAddCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onClose={() => {
                setIsAdminOpen(false);
                if (window.location.pathname.toLowerCase().includes('admin')) {
                  window.history.pushState(null, '', '/');
                }
              }}
            />
          </ErrorBoundary>
        )}
      </AnimatePresence>

    </div>
  );
}
