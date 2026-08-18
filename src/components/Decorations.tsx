/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import Logo from './Logo';

// Hanging Marigold (Genda Phool) Garland
export function MarigoldGarland() {
  return (
    <div className="absolute top-0 left-0 right-0 h-8 flex justify-around overflow-hidden pointer-events-none z-20">
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center" style={{ transform: `translateY(${i % 2 === 0 ? '-2px' : '-6px'})` }}>
          {/* Thread */}
          <div className="w-[1px] h-3 bg-amber-600/60" />
          {/* Flower */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`w-4 h-4 rounded-full shadow-md ${
              i % 3 === 0
                ? 'bg-amber-500 border border-amber-600'
                : i % 3 === 1
                ? 'bg-orange-600 border border-orange-700'
                : 'bg-yellow-400 border border-yellow-500'
            }`}
          />
          {/* Green leaf spacer occasionally */}
          {i % 4 === 0 && (
            <div className="w-2 h-2 bg-emerald-700 rounded-bl-full rounded-tr-full rotate-45 -mt-1" />
          )}
        </div>
      ))}
    </div>
  );
}

// Swinging Clay Lantern (Diya / Lantern)
export function SwingingLantern({ className = "" }: { className?: string }) {
  const hasPosition = className.includes('absolute') || className.includes('fixed') || className.includes('relative');
  return (
    <motion.div
      animate={{ rotate: [-8, 8, -8] }}
      transition={{
        duration: 4.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ transformOrigin: "top center" }}
      className={`${hasPosition ? '' : 'relative'} flex flex-col items-center pointer-events-none ${className}`}
    >
      {/* Hanging rope */}
      <div className="w-[2px] h-16 bg-gradient-to-b from-amber-800 to-amber-600" />
      
      {/* Brass Cap */}
      <div className="w-6 h-3 bg-amber-500 rounded-t-full border border-amber-600 shadow-lg" />
      
      {/* Glass/Glow Lantern Body */}
      <div className="w-10 h-14 bg-amber-600/25 rounded-b-xl border border-amber-500/40 relative flex items-center justify-center shadow-lg">
        {/* Frame details */}
        <div className="absolute inset-x-2 inset-y-0 border-x border-amber-500/30" />
        
        {/* Flame Glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 0.9, 1.1, 1],
            opacity: [0.8, 1, 0.7, 0.9, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-4.5 h-4.5 rounded-full bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 shadow-[0_0_15px_rgba(251,191,36,0.8)]"
        />
      </div>
      
      {/* Bottom Ring or Tassel */}
      <div className="w-2 h-2 rounded-full bg-amber-600 border border-amber-700" />
      <div className="w-[1px] h-4 bg-orange-600/70" />
      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
    </motion.div>
  );
}

// Rotating Decorative Mandala / Sunflower Folk Art Motif
export function MandalaSpinner({ size = "w-24 h-24", className = "", speed = 40 }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${size} ${className}`}>
      <Logo className="w-full h-full object-contain" />
    </div>
  );
}

// Camel Caravan moving silhouettes
export function CamelCaravan() {
  return (
    <div className="w-full overflow-hidden h-16 relative bg-gradient-to-t from-heritage-dark to-transparent opacity-40 pointer-events-none">
      {/* Caravan container moving left-to-right */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-0 flex items-end space-x-6"
      >
        {/* Camel 1 with Rider */}
        <div className="flex flex-col items-center">
          <svg className="w-12 h-14 text-gold-600/60 fill-current" viewBox="0 0 24 24">
            <path d="M22,12C21.4,12 20.2,12.5 19.5,12C18.8,11.5 18.2,10 18,9C17.5,6.5 16,5 15,4C14.5,3.5 13.5,3.2 13,3C12,2.6 11.5,1 11,1C10.5,1 10.2,1.8 10,2.5C9.8,3.2 9,4.5 9,5.5C9,6.5 9.5,7 10,7.5C10.5,8 10.8,9 10,9C8.5,9 7.5,7.5 6,7.5C4.5,7.5 3.5,8.5 2,9.5C1.5,9.8 1,11 1,12C1,13 1.5,13.5 2.5,13.5C3.5,13.5 4,13 5,13.5C6,14 6.5,15.5 7,17C7.5,18.5 7.8,21 8,23C8.2,23 8.5,23 9,23C9.2,21.5 9.1,19 8.5,17C8,15 8,14.5 8.5,14C9.2,13.5 10.2,14 11,14.5C11.5,15.5 11.8,17.5 12,20C12.2,22 12.5,23 13,23C13.2,23 13.5,23 13.5,22C13.5,19.5 13,17.5 12.5,15.5C13.5,15 14.5,14.5 15.5,14.5C16.5,14.5 17,16 17.5,18C18,20 18.2,22 18.5,23C19,23 19.5,23 19.5,22.5C19.5,21 19,19 18.5,16.5C18.2,15 18,14 18.5,13.5C19.2,13 20.5,13 21,13C21.5,13 22,12.5 22,12Z" />
          </svg>
        </div>
        {/* Lead Caravan Rope Line */}
        <div className="w-8 h-[2px] bg-gold-600/30 border-dashed border-b self-center -mb-4" />
        
        {/* Camel 2 */}
        <div className="flex flex-col items-center">
          <svg className="w-10 h-12 text-gold-600/60 fill-current" viewBox="0 0 24 24">
            <path d="M22,12C21.4,12 20.2,12.5 19.5,12C18.8,11.5 18.2,10 18,9C17.5,6.5 16,5 15,4C14.5,3.5 13.5,3.2 13,3C12,2.6 11.5,1 11,1C10.5,1 10.2,1.8 10,2.5C9.8,3.2 9,4.5 9,5.5C9,6.5 9.5,7 10,7.5C10.5,8 10.8,9 10,9C8.5,9 7.5,7.5 6,7.5C4.5,7.5 3.5,8.5 2,9.5C1.5,9.8 1,11 1,12C1,13 1.5,13.5 2.5,13.5C3.5,13.5 4,13 5,13.5C6,14 6.5,15.5 7,17C7.5,18.5 7.8,21 8,23C8.2,23 8.5,23 9,23C9.2,21.5 9.1,19 8.5,17C8,15 8,14.5 8.5,14C9.2,13.5 10.2,14 11,14.5C11.5,15.5 11.8,17.5 12,20C12.2,22 12.5,23 13,23C13.2,23 13.5,23 13.5,22C13.5,19.5 13,17.5 12.5,15.5C13.5,15 14.5,14.5 15.5,14.5C16.5,14.5 17,16 17.5,18C18,20 18.2,22 18.5,23C19,23 19.5,23 19.5,22.5C19.5,21 19,19 18.5,16.5C18.2,15 18,14 18.5,13.5C19.2,13 20.5,13 21,13C21.5,13 22,12.5 22,12Z" />
          </svg>
        </div>
        
        {/* Lead Caravan Rope Line */}
        <div className="w-8 h-[2px] bg-gold-600/30 border-dashed border-b self-center -mb-4" />
        
        {/* Camel 3 */}
        <div className="flex flex-col items-center">
          <svg className="w-10 h-12 text-gold-600/60 fill-current" viewBox="0 0 24 24">
            <path d="M22,12C21.4,12 20.2,12.5 19.5,12C18.8,11.5 18.2,10 18,9C17.5,6.5 16,5 15,4C14.5,3.5 13.5,3.2 13,3C12,2.6 11.5,1 11,1C10.5,1 10.2,1.8 10,2.5C9.8,3.2 9,4.5 9,5.5C9,6.5 9.5,7 10,7.5C10.5,8 10.8,9 10,9C8.5,9 7.5,7.5 6,7.5C4.5,7.5 3.5,8.5 2,9.5C1.5,9.8 1,11 1,12C1,13 1.5,13.5 2.5,13.5C3.5,13.5 4,13 5,13.5C6,14 6.5,15.5 7,17C7.5,18.5 7.8,21 8,23C8.2,23 8.5,23 9,23C9.2,21.5 9.1,19 8.5,17C8,15 8,14.5 8.5,14C9.2,13.5 10.2,14 11,14.5C11.5,15.5 11.8,17.5 12,20C12.2,22 12.5,23 13,23C13.2,23 13.5,23 13.5,22C13.5,19.5 13,17.5 12.5,15.5C13.5,15 14.5,14.5 15.5,14.5C16.5,14.5 17,16 17.5,18C18,20 18.2,22 18.5,23C19,23 19.5,23 19.5,22.5C19.5,21 19,19 18.5,16.5C18.2,15 18,14 18.5,13.5C19.2,13 20.5,13 21,13C21.5,13 22,12.5 22,12Z" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}

// Beautiful Traditional Royal Rajput Arch overlay for headers and sections
export function RoyalArch({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`relative p-8 rounded-3xl ${className}`}>
      {/* Arch Vector Outline SVG overlay */}
      <div className="absolute inset-0 border-2 border-gold-500/25 rounded-3xl pointer-events-none traditional-pattern" />
      
      {/* Traditional Indian Corner Accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold-400 rounded-tl-xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold-400 rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold-400 rounded-bl-xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold-400 rounded-br-xl pointer-events-none" />
      
      {/* Top Center Dome Crest */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[1px] px-4 bg-heritage-dark border-x border-b border-gold-400 rounded-b-xl z-10 flex flex-col items-center">
        <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// 1. Traditional Highway Milestone (मील का पत्थर)
export function DhabaMilestone({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center bg-transparent pointer-events-auto transition-transform hover:scale-105 ${className}`}>
      {/* Milestone Dome Head */}
      <div className="w-20 h-11 rounded-t-full bg-[#fbbf24] border-x-4 border-t-4 border-[#2d1b10] flex items-center justify-center shadow-lg relative">
        <div className="text-[11px] font-sans font-black text-[#2d1b10] uppercase tracking-wider">
          NH-25
        </div>
      </div>
      {/* Milestone Body */}
      <div className="w-20 h-24 bg-[#fef3c7] border-x-4 border-b-4 border-[#2d1b10] flex flex-col justify-between items-center py-2 px-1 text-[#2d1b10] font-sans font-extrabold text-center shadow-lg rounded-b-md">
        <div className="border-b border-dashed border-[#2d1b10]/25 pb-1 w-full">
          <p className="font-hindi text-[11px] leading-tight font-black text-[#9a3412]">बालोतरा</p>
          <p className="uppercase text-[9px] leading-none tracking-wider text-[#9a3412] font-black">BALOTRA</p>
        </div>
        <div className="w-full pt-1">
          <p className="font-hindi text-[9.5px] leading-tight text-emerald-900 font-bold">माजीसा कैफ़े</p>
          <p className="uppercase text-[8px] leading-none text-emerald-800 font-extrabold">MAJISA</p>
          <p className="text-[10px] text-[#065f46] font-black mt-1 bg-emerald-100/80 rounded py-0.5 border border-emerald-300">0 KM</p>
        </div>
      </div>
      {/* Little base dust mound */}
      <div className="w-24 h-2 bg-[#d97706]/40 rounded-full mt-1" />
    </div>
  );
}

// 2. Earthen Clay Cooking Pot (हांडी / मटका)
export function ClayPotMatka({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <motion.div
        animate={{
          y: [0, -3, 0],
          rotate: [0, 1.5, -1.5, 0]
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        {/* Clay Pot (Matka) SVG */}
        <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-2xl">
          {/* Rim */}
          <path d="M30,25 C30,22 70,22 70,25 C70,28 30,28 30,25 Z" fill="#b45309" stroke="#4d2c19" strokeWidth="3" />
          {/* Neck */}
          <path d="M35,25 L38,35 C38,35 62,35 62,35 L65,25 Z" fill="#92400e" stroke="#4d2c19" strokeWidth="2" />
          {/* Body */}
          <path d="M38,35 C20,42 15,75 50,85 C85,75 80,42 62,35 Z" fill="#78350f" stroke="#4d2c19" strokeWidth="3" />
          
          {/* Traditional tribal band artwork painted in white on clay */}
          <path d="M22,50 Q50,60 78,50" fill="none" stroke="#fef3c7" strokeWidth="2" strokeDasharray="4 2" />
          <path d="M20,58 Q50,68 80,58" fill="none" stroke="#fef3c7" strokeWidth="1" />
          {/* Small decorative red bindi dot */}
          <circle cx="50" cy="50" r="3.5" fill="#dc2626" />
        </svg>

        {/* Shadow */}
        <div className="w-12 h-2.5 bg-black/40 rounded-full mx-auto -mt-1.5" />
      </motion.div>
    </div>
  );
}

// 3. Swaying Kathputli Puppet (कठपुतली)
export function KathputliPuppet({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{
        rotate: [-6, 6, -6],
        y: [0, 4, 0]
      }}
      transition={{
        duration: 5.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{ transformOrigin: "top center" }}
      className={`flex flex-col items-center pointer-events-none ${className}`}
    >
      {/* Hanging string */}
      <div className="w-[1.5px] h-20 bg-amber-600/50" />
      
      {/* Puppet Body */}
      <div className="relative w-12 h-24 flex flex-col items-center">
        {/* Kathputli Head (traditional turban & face) */}
        <div className="w-7 h-7 rounded-full bg-orange-200 border-2 border-amber-800 flex items-center justify-center relative shadow-md z-10">
          {/* Rajasthani Mustache & Eyes */}
          <div className="absolute inset-x-1 bottom-1 flex flex-col items-center">
            {/* Eyes */}
            <div className="flex space-x-2">
              <div className="w-1 h-1 bg-black rounded-full" />
              <div className="w-1 h-1 bg-black rounded-full" />
            </div>
            {/* Big Rajasthani Mustache */}
            <div className="w-4 h-1 bg-black rounded-full mt-1 relative">
              <div className="absolute -left-1 -top-0.5 w-1.5 h-1.5 border-t border-l border-black rounded-tl-full" />
              <div className="absolute -right-1 -top-0.5 w-1.5 h-1.5 border-t border-r border-black rounded-tr-full" />
            </div>
          </div>

          {/* Saffron Rajasthani Pagri (Turban) */}
          <div className="absolute -top-3 inset-x-[-4px] h-4 bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600 rounded-t-full border border-amber-800 shadow flex items-center justify-center">
            <div className="w-1 h-4 bg-red-600 absolute rotate-45 transform origin-center" />
            {/* Feathery Kalgi */}
            <div className="w-1 h-2 bg-[#fbbf24] absolute -top-1.5 rounded-full" />
          </div>
        </div>

        {/* Royal Rajputana Bandhgalas / Traditional Costume */}
        <div className="w-10 h-14 bg-[#dc2626] border-2 border-amber-900 rounded-b-3xl relative overflow-hidden -mt-1 shadow-md">
          {/* Traditional golden embroidery design */}
          <div className="absolute inset-x-2 top-0 h-4 border-b border-dashed border-[#fbbf24]" />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-[#fbbf24]" />
          
          {/* Mini mirror-work sparkling sparkles */}
          <div className="absolute top-4 left-2 w-1.5 h-1.5 rounded-full bg-white animate-ping opacity-80" />
          <div className="absolute top-6 right-2 w-1.5 h-1.5 rounded-full bg-white animate-ping opacity-60" />
        </div>

        {/* Flaired Lehenga/Pajama Skirt */}
        <div className="w-12 h-10 bg-gradient-to-b from-[#fbbf24] to-[#d97706] border-x-2 border-b-2 border-amber-900 rounded-b-xl -mt-1 shadow-md">
          <div className="h-full w-full bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(255,255,255,0.1)_3px,rgba(255,255,255,0.1)_6px)]" />
        </div>
      </div>
    </motion.div>
  );
}

// 4. Cot Seating Badge (चारपाई / खाट)
export function CharpaiBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`p-3 bg-[#2d1b10] border border-heritage-orange/30 rounded-lg shadow-xl relative overflow-hidden flex items-center space-x-3 royal-glass transition-all hover:border-heritage-yellow cursor-pointer group ${className}`}>
      {/* Traditional wood post cot legs (tiny representation) */}
      <div className="w-10 h-8 border border-dashed border-heritage-orange/40 rounded flex items-center justify-center relative bg-heritage-dark shrink-0">
        <div className="absolute -bottom-1 -left-1 w-1.5 h-3 bg-amber-800 rounded-sm" />
        <div className="absolute -bottom-1 -right-1 w-1.5 h-3 bg-amber-800 rounded-sm" />
        <div className="absolute -top-1 -left-1 w-1.5 h-2.5 bg-amber-800 rounded-sm" />
        <div className="absolute -top-1 -right-1 w-1.5 h-2.5 bg-amber-800 rounded-sm" />
        {/* Weaving thread pattern */}
        <div className="w-8 h-6 bg-[repeating-linear-gradient(45deg,#d97706_0px,#d97706_1px,transparent_1px,transparent_4px)]" />
      </div>
      <div>
        <h4 className="text-xs font-serif font-black text-[#fbbf24] leading-tight group-hover:text-white transition-colors">पारंपरिक खाट बैठक</h4>
        <p className="text-[10px] text-gold-100/60 font-sans leading-none mt-0.5">Traditional Roadside Charpai sitting</p>
      </div>
    </div>
  );
}
