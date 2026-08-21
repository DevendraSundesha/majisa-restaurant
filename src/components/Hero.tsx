/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Play, VolumeX, Menu, Clock, Phone, MapPin, Sparkles } from 'lucide-react';
import { Highlight } from '../types';
import { MandalaSpinner, SwingingLantern, DhabaMilestone, ClayPotMatka } from './Decorations';
import Logo from './Logo';

interface HeroProps {
  highlights: Highlight[];
  onScrollToMenu: () => void;
  onScrollToVibe: () => void;
  onOpenBooking?: () => void;
  onLogoClick?: () => void;
}

export default function Hero({ highlights, onScrollToMenu, onScrollToVibe, onOpenBooking, onLogoClick }: HeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Top Hero section uses user uploaded highlights and respects Top Banner ON selections
  const slides = React.useMemo(() => {
    if (!highlights || highlights.length === 0) return [];
    // If user has explicitly enabled Top Banner: ON for specific items, use those!
    const heroTagged = highlights.filter(h => h.showInHero);
    return heroTagged.length > 0 ? heroTagged : highlights;
  }, [highlights]);

  // Auto-rotate through all uploaded slides every 6 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const activeSlide = slides.length > 0 ? (slides[activeIndex] || slides[0]) : null;

  // Helper to detect video item
  const isSlideVideo = (slide: any) => {
    if (!slide) return false;
    if (slide.type === 'video') return true;
    if (!slide.url) return false;
    const urlLower = slide.url.toLowerCase();
    return (
      urlLower.includes('.mp4') ||
      urlLower.includes('.webm') ||
      urlLower.includes('.mov') ||
      urlLower.includes('/video/upload/')
    );
  };

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-heritage-dark" id="home">
      {/* Background Media Slider with Crossfade & Ken Burns Zoom */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Ambient Dark Overlay Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-heritage-dark via-heritage-dark/60 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-heritage-dark/80 via-transparent to-heritage-dark/40 z-10" />
            <div className="absolute inset-0 bg-heritage-maroon/15 z-10 mix-blend-overlay" />

            {/* Render Video or Image based on uploaded type */}
            {isSlideVideo(activeSlide) ? (
              <video
                src={activeSlide.url}
                autoPlay
                muted
                loop
                playsInline
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover scale-105"
              />
            ) : (
              <img
                src={activeSlide.url || "https://images.unsplash.com/photo-1585938338990-d2242b512995?auto=format&fit=crop&w=1600&q=80"}
                alt={activeSlide.title ? `${activeSlide.title} - Majisa Restaurant Balotra` : "Majisa Restaurant (Desi Dhaba) Balotra"}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover animate-[zoom_20s_infinite_alternate]"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Decorative Traditional Lanterns swaying from top */}
      <SwingingLantern className="absolute top-0 left-10 md:left-24 z-20 scale-75 md:scale-100 hidden sm:flex" />
      <SwingingLantern className="absolute top-0 right-10 md:right-24 z-20 scale-75 md:scale-100 hidden sm:flex" />

      {/* Center Hero Card Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 pt-12 text-center">
        {/* Rajasthani Restaurant Logo Emblem on top of the title */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            onClick={onLogoClick}
            className="cursor-pointer"
          >
            <Logo className="w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64 hover:scale-105 transition-all duration-300 drop-shadow-[0_15px_35px_rgba(251,191,36,0.35)]" />
          </motion.div>
        </div>

        {/* Small Traditional Greeting Ribbon */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-heritage-red/40 border border-gold-400/40 text-gold-200 text-xs sm:text-sm font-medium tracking-wide uppercase mb-6 backdrop-blur-sm"
        >
          <Sparkles className="w-4 h-4 text-heritage-yellow" />
          <span>पधारो म्हारे देस • Welcome to Rajasthan</span>
        </motion.div>

        {/* Dynamic Royal Main Heading */}
        <div className="max-w-4xl mx-auto mb-6">
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gold-100 leading-tight drop-shadow-xl"
          >
            माजीसा कैफे <span className="text-heritage-orange">&amp;</span> रेस्टोरेंट
            <span className="block text-xl sm:text-3xl md:text-4xl text-gold-300 font-serif font-normal mt-2">
              Majisa Restaurant (Desi Dhaba) – Balotra
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-serif italic text-lg sm:text-xl text-gold-200 mt-3 tracking-wide drop-shadow"
          >
            Authentic Rajasthani Pure Veg Food &amp; Royal Marwari Hospitality
          </motion.p>
        </div>

        {/* Slide Specific Dynamic Title & Description (Only shown if user uploaded description) */}
        {activeSlide && activeSlide.description ? (
          <div className="max-w-2xl mx-auto min-h-[50px] mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                {activeSlide.title && !activeSlide.title.startsWith('THUMB') && isNaN(Number(activeSlide.title)) ? (
                  <h2 className="text-lg sm:text-xl font-medium text-heritage-yellow mb-1 drop-shadow-md uppercase tracking-widest">
                    {activeSlide.title}
                  </h2>
                ) : null}
                <p className="text-sm sm:text-base text-gold-200 leading-relaxed drop-shadow-sm font-sans px-4">
                  {activeSlide.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : null}

        {/* Call to Actions (Interactive 3D Hover Buttons) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-5"
        >
          {/* Bandola & Event Booking Button */}
          {onOpenBooking && (
            <button
              onClick={onOpenBooking}
              id="btn-hero-booking"
              className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-amber-950 font-bold rounded-xl shadow-[0_4px_25px_rgba(245,158,11,0.5)] overflow-hidden transition-all duration-300 hover:shadow-[0_6px_30px_rgba(245,158,11,0.7)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-amber-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <div className="flex items-center space-x-2 relative z-10 font-serif tracking-wide text-base">
                <Sparkles className="w-5 h-5 text-amber-950 fill-current animate-bounce" />
                <span>शाही बंडोला व शादी बुकिंग (Book Event)</span>
              </div>
            </button>
          )}

          {/* Main Action Button */}
          <button
            onClick={onScrollToMenu}
            id="btn-hero-menu"
            className="group relative px-8 py-4 bg-gradient-to-r from-heritage-red to-heritage-maroon text-gold-100 font-medium rounded-xl shadow-[0_4px_20px_rgba(139,34,34,0.4)] overflow-hidden transition-all duration-300 hover:shadow-[0_6px_25px_rgba(139,34,34,0.6)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            {/* Shiny hover slide effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            <div className="absolute inset-0 border border-gold-400/40 rounded-xl" />
            <div className="flex items-center space-x-2 relative z-10 font-sans tracking-wide">
              <span>शाही व्यंजन सूची • Explore Menu</span>
              <ChevronRight className="w-5 h-5 text-gold-300 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Secondary Action Button */}
          <button
            onClick={onScrollToVibe}
            id="btn-hero-vibe"
            className="group px-8 py-4 bg-heritage-clay/60 text-gold-300 font-medium rounded-xl border border-gold-400/30 backdrop-blur-md transition-all duration-300 hover:bg-heritage-clay/90 hover:border-gold-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <div className="flex items-center space-x-2 font-sans tracking-wide">
              <span>देशी ढाबा वाइब • Cultural Experience</span>
              <Sparkles className="w-5 h-5 text-heritage-yellow group-hover:rotate-12 transition-transform" />
            </div>
          </button>
        </motion.div>

        {/* Carousel Slide Indicators */}
        <div className="flex items-center justify-center space-x-2.5 mt-16 z-20 relative">
          {slides.map((_, idx) => (
            <button
              key={idx}
              id={`slide-indicator-${idx}`}
              onClick={() => setActiveIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === idx ? 'w-8 bg-heritage-yellow' : 'w-2.5 bg-gray-500/50 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Authentic Roadside Dhaba Highway Milestone Graphic */}
      <div className="absolute bottom-24 left-6 lg:left-16 z-20 hidden md:block">
        <DhabaMilestone />
      </div>

      {/* Traditional Boiling Earthen Clay Handi/Matka Cooking */}
      <div className="absolute bottom-24 right-6 lg:right-16 z-20 hidden md:block">
        <ClayPotMatka />
      </div>

      {/* Ground Info Strip (Address, Contact, Hours) */}
      <div className="absolute bottom-0 inset-x-0 bg-heritage-clay/95 border-t border-gold-400/20 py-3.5 px-6 text-xs sm:text-sm text-gold-200 z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 text-center">
          <div className="flex items-center space-x-2 font-sans">
            <MapPin className="w-4 h-4 text-heritage-orange shrink-0" />
            <a
              href="https://share.google/QZtr669L0wNr1c95K"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-gold-300 transition-colors"
            >
              Housing Board, Siwana Road, Opp. Bhansali Petrol Pump, Balotra, Rajasthan 344022
            </a>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            <div className="flex items-center space-x-2 font-sans">
              <Phone className="w-4 h-4 text-heritage-yellow shrink-0" />
              <a href="tel:+917073011597" className="hover:underline hover:text-gold-300 transition-colors">+91 70730 11597</a>
              <span>/</span>
              <a href="tel:+919725845974" className="hover:underline hover:text-gold-300 transition-colors">+91 97258 45974</a>
            </div>
            <div className="flex items-center space-x-2 font-sans">
              <Clock className="w-4 h-4 text-heritage-yellow shrink-0" />
              <span>Open Daily: 11 AM - 11 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Styled Keyframes for background zoom in CSS */}
      <style>{`
        @keyframes kenburns {
          0% { transform: scale(1) translate(0px, 0px); }
          100% { transform: scale(1.12) translate(-20px, -10px); }
        }
      `}</style>
    </div>
  );
}
