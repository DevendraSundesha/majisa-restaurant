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

  // Fallback default slides in case highlights database is loading or empty
  const defaultSlides = [
    {
      id: "def-1",
      title: "Majisa Cafe & Restaurant",
      description: "Bringing you the authentic, rustic flavors of Rajasthani highway dhabas with royal Rajputana hospitality.",
      url: "https://images.unsplash.com/photo-1585938338990-d2242b512995?auto=format&fit=crop&w=1600&q=80",
      type: "image"
    },
    {
      id: "def-2",
      title: "Royal Marwari Thali",
      description: "A rich feast of Dal Baati Churma, Ker Sangri, and Gatte ki Sabji crafted by ancestral masterchefs.",
      url: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1600&q=80",
      type: "image"
    },
    {
      id: "def-3",
      title: "Rustic Earthen Sitting & Pure Ghee Delicacies",
      description: "Sit on traditional Charpais and relish piping-hot Bajra Roti & Dal Baati cooked on authentic firewood Chulhas with 100% pure cow ghee.",
      url: "https://images.unsplash.com/photo-1605152276897-4f618f831968?auto=format&fit=crop&w=1600&q=80",
      type: "image"
    }
  ];

  // Limit top hero slider to max 5 slides from user uploads ("upper me 5 se jadda nhi challni chaiye")
  const userUploadSlides = highlights.length > 0 ? [...highlights].reverse().slice(0, 5) : [];
  const slides = userUploadSlides.length > 0 ? userUploadSlides : defaultSlides;

  // Auto-rotate slides every 6 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides]);

  const activeSlide = slides[activeIndex] || defaultSlides[0];

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
            {/* Ambient Dark Overlay Gradients to keep text highly legible and punchy */}
            <div className="absolute inset-0 bg-gradient-to-t from-heritage-dark via-heritage-dark/60 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-heritage-dark/80 via-transparent to-heritage-dark/40 z-10" />
            <div className="absolute inset-0 bg-heritage-maroon/15 z-10 mix-blend-overlay" />

            {/* Check if video or image */}
            {activeSlide.type === 'video' ? (
              // HTML5 Direct Video playing or fallback Unsplash
              activeSlide.url.endsWith('.mp4') || activeSlide.url.includes('video') ? (
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
                // If it is a youtube or other link, we can embed it, but often an Unsplash visual background works best with a mock play button on top
                <div className="w-full h-full relative">
                  <img
                    src={activeSlide.url || "https://images.unsplash.com/photo-1585938338990-d2242b512995?auto=format&fit=crop&w=1600&q=80"}
                    alt={activeSlide.title ? `${activeSlide.title} - Majisa Restaurant Balotra` : "Majisa Restaurant (Desi Dhaba) Balotra"}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover animate-[zoom_20s_infinite_alternate]"
                  />
                  {/* YouTube background iframe layer as enhancement if it has youtube ID */}
                  {activeSlide.url.includes('youtube.com') || activeSlide.url.includes('youtu.be') ? (
                    <div className="absolute inset-0 pointer-events-none opacity-40">
                      {/* Standard youtube embed with background loop params */}
                      <iframe
                        src={`${activeSlide.url.replace('watch?v=', 'embed/')}?autoplay=1&mute=1&controls=0&loop=1&playlist=${activeSlide.url.split('v=')[1] || ''}&showinfo=0&rel=0`}
                        title="Background Video"
                        className="w-full h-full object-cover scale-110 pointer-events-none"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  ) : null}
                </div>
              )
            ) : (
              <img
                src={activeSlide.url}
                alt={activeSlide.title ? `${activeSlide.title} - Majisa Restaurant Balotra` : "Majisa Restaurant (Desi Dhaba) Balotra"}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                style={{
                  animation: "kenburns 25s ease-out infinite alternate"
                }}
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

        {/* Slide Specific Dynamic Title & Description */}
        <div className="max-w-2xl mx-auto min-h-[90px] mb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <h2 className="text-lg sm:text-xl font-medium text-heritage-yellow mb-2 drop-shadow-md uppercase tracking-widest">
                {(!activeSlide.title || activeSlide.title.startsWith('THUMB') || !isNaN(Number(activeSlide.title))) ? "माजीसा स्पेशल हिलाइट्स • Majisa Highlight" : activeSlide.title}
              </h2>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed drop-shadow-sm font-sans px-4">
                {activeSlide.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

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
