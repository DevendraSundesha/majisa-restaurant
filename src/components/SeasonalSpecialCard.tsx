/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Sparkles, Flame, Tag, Calendar, Bell, ShieldCheck } from 'lucide-react';
import { SeasonalSpecial } from '../types';

interface SeasonalSpecialCardProps {
  special: SeasonalSpecial | null;
  isAdmin: boolean;
  onOpenAdmin: () => void;
}

export default function SeasonalSpecialCard({ special, isAdmin, onOpenAdmin }: SeasonalSpecialCardProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!special || !special.isActive || !special.endDate) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(special.endDate) - +new Date();
      
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setIsExpired(false);
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [special]);

  if (!special || !special.isActive) {
    return null;
  }

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 mb-16 relative" id="seasonal-highlight">
      {/* Background Decorative glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-heritage-orange/20 via-[#d97706]/10 to-heritage-red/25 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 pointer-events-none" />
      
      {/* Outer border & Card container */}
      <div className="relative bg-[#0d0907] border-2 border-[#b45309]/40 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(217,119,6,0.15)] grid grid-cols-1 md:grid-cols-12 gap-0">
        
        {/* Traditional Border Accents */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-gold-400/40 rounded-tl-lg pointer-events-none z-20" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-gold-400/40 rounded-tr-lg pointer-events-none z-20" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-gold-400/40 rounded-bl-lg pointer-events-none z-20" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-gold-400/40 rounded-br-lg pointer-events-none z-20" />

        {/* Diagonal Ribbon for Limited Offer */}
        <div className="absolute top-6 left-0 transform -rotate-45 -translate-x-12 translate-y-2 bg-gradient-to-r from-heritage-orange to-heritage-red text-white py-1.5 px-12 text-[9px] uppercase font-bold tracking-widest shadow-md z-30 border-y border-gold-400/20 text-center">
          Limited Season
        </div>

        {/* 1. DELICACY DISPLAY IMAGE (Col span 5) */}
        <div className="md:col-span-5 relative aspect-[4/3] md:aspect-auto md:min-h-[380px] overflow-hidden bg-[#150f0c]">
          <img
            src={special.image || "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80"}
            alt={special.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
          />
          {/* Saturated visual filter overlay */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0d0907] via-transparent to-transparent opacity-95 md:opacity-100" />
          
          {/* Price Tag badge on top of image */}
          <div className="absolute top-4 right-4 bg-[#1e1510]/95 backdrop-blur-md border border-gold-400/30 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xl z-20">
            <Tag className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-mono text-base font-black text-gold-100">₹{special.price}</span>
          </div>

          {/* Quick info chip */}
          <div className="absolute bottom-4 left-4 bg-heritage-red/90 text-gold-100 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-gold-400/30 flex items-center gap-1">
            <Flame className="w-3 h-3 text-heritage-yellow animate-pulse" />
            <span>Exclusive Recipe</span>
          </div>
        </div>

        {/* 2. DELICACY MAIN DETAILS & COUNTDOWN (Col span 7) */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6 relative z-10">
          
          {/* Header Row */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/25">
                <Sparkles className="w-3 h-3 animate-spin-slow" />
                <span>Rajasthani Heritage Specials</span>
              </span>
              {isAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-heritage-clay text-gold-300 border border-gold-400/20 hover:border-gold-400/50"
                >
                  Edit Special
                </button>
              )}
            </div>

            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500/80 block mt-1 font-mono">
              ★ Limited-Time Feast • मॉनसून विशेष ★
            </span>

            <h3 className="font-display text-2xl sm:text-3xl font-bold text-gold-100 tracking-wide leading-tight">
              {special.title}
            </h3>

            <p className="font-display text-lg font-semibold text-amber-500 italic">
              {special.hindiTitle}
            </p>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans mt-2">
              {special.description}
            </p>
          </div>

          {/* TIMER CONTAINER PANEL */}
          <div className="bg-[#150f0b] rounded-2xl p-4 sm:p-5 border border-gold-400/15 shadow-inner">
            <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-gold-400/10">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#f59e0b] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                <span>Countdown until offer melts away:</span>
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                {isExpired ? "OFFER EXPIRED" : "LIMITED FRESH STOCK ONLY"}
              </span>
            </div>

            {/* Countdown Grid */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
              
              {/* Days */}
              <div className="bg-[#221610] rounded-xl p-2.5 sm:p-3 border border-[#b45309]/20 shadow">
                <span className="font-mono text-xl sm:text-3xl font-black text-gold-100 block tracking-tight">
                  {timeLeft ? String(timeLeft.days).padStart(2, '0') : '00'}
                </span>
                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-gray-400 block font-medium mt-1">Days</span>
              </div>

              {/* Hours */}
              <div className="bg-[#221610] rounded-xl p-2.5 sm:p-3 border border-[#b45309]/20 shadow">
                <span className="font-mono text-xl sm:text-3xl font-black text-gold-100 block tracking-tight">
                  {timeLeft ? String(timeLeft.hours).padStart(2, '0') : '00'}
                </span>
                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-gray-400 block font-medium mt-1">Hours</span>
              </div>

              {/* Minutes */}
              <div className="bg-[#221610] rounded-xl p-2.5 sm:p-3 border border-[#b45309]/20 shadow">
                <span className="font-mono text-xl sm:text-3xl font-black text-gold-100 block tracking-tight">
                  {timeLeft ? String(timeLeft.minutes).padStart(2, '0') : '00'}
                </span>
                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-gray-400 block font-medium mt-1">Mins</span>
              </div>

              {/* Seconds */}
              <div className="bg-[#221610] rounded-xl p-2.5 sm:p-3 border border-[#b45309]/20 shadow relative overflow-hidden">
                <span className="font-mono text-xl sm:text-3xl font-black text-amber-500 block tracking-tight animate-pulse">
                  {timeLeft ? String(timeLeft.seconds).padStart(2, '0') : '00'}
                </span>
                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-gray-400 block font-medium mt-1">Secs</span>
              </div>

            </div>

            {isExpired && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-xs text-red-400 font-semibold mt-3"
              >
                ⚠️ Saffron melted! This exclusive special has concluded. Speak with the dhabalord for next batch scheduling.
              </motion.div>
            )}
          </div>

          {/* Order/Dhaba details */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-gold-400/10">
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Prepared fresh every sunrise in copper vats.</span>
            </div>
            
            <a
              href="#menu"
              className="px-6 py-2.5 bg-gradient-to-r from-heritage-orange to-heritage-red hover:from-amber-600 hover:to-red-700 text-white font-bold rounded-lg text-xs tracking-widest uppercase transition-all shadow-md hover:shadow-orange-500/10"
            >
              Order At Counter
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
