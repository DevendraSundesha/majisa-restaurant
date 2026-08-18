/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

export default function DesertMargins() {
  return (
    <>
      {/* LEFT MARGIN DECORATIONS: Pure Thar Desert Theme (Sand Dunes, Blazing Sun, Thar Cacti, Standing Camel) */}
      <div 
        id="desktop-left-margin-desert"
        className="fixed left-0 top-24 bottom-12 w-16 xl:w-56 pointer-events-none hidden lg:flex flex-col justify-between items-start pl-2 xl:pl-6 z-0 select-none overflow-hidden"
      >
        {/* Top: Blazing Thar Desert Sun & Soaring Desert Falcons */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 0.2, x: 0 }}
          transition={{ duration: 1.8, delay: 0.1 }}
          className="w-full flex flex-col items-start space-y-3"
        >
          {/* Detailed Blazing Desert Sun */}
          <svg className="w-16 h-16 xl:w-28 xl:h-28 text-amber-500/50 fill-current filter blur-[0.3px]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="18" className="animate-pulse" />
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x1 = 50 + Math.cos(angle) * 22;
              const y1 = 50 + Math.sin(angle) * 22;
              const x2 = 50 + Math.cos(angle) * 38;
              const y2 = 50 + Math.sin(angle) * 38;
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} L ${x2} ${y2}`}
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="opacity-80"
                />
              );
            })}
          </svg>

          {/* Soaring Desert Falcons */}
          <div className="pl-4 space-y-4 flex flex-col items-start">
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -5, 0],
                  x: [0, 6, 0],
                }}
                transition={{
                  duration: 6 + i * 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1.5,
                }}
                className="opacity-30"
                style={{ marginLeft: `${i * 14}px` }}
              >
                <svg className="w-6 h-3 xl:w-10 xl:h-5 text-amber-600/70 fill-none stroke-current" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 12">
                  <path d="M2,9 C6,2 10,6 12,8 C14,6 18,2 22,9" />
                </svg>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Center: Thar Desert Vegetation (Saguaro-style Thar Cacti and Desert Grass) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          className="w-full pl-2 xl:pl-6 flex flex-col items-start space-y-2 mt-4"
        >
          {/* Desert Cactus Silhouette */}
          <svg className="w-12 h-20 xl:w-20 xl:h-32 text-amber-600/60 fill-current" viewBox="0 0 60 100">
            {/* Main trunk */}
            <path d="M 27 95 L 27 15 C 27 10, 33 10, 33 15 L 33 95 Z" />
            {/* Left Arm */}
            <path d="M 27 50 L 15 50 C 10 50, 10 35, 10 35 L 15 35 C 15 35, 15 44, 20 44 L 27 44 Z" />
            <path d="M 10 35 L 10 25 C 10 21, 16 21, 16 25 L 16 35 Z" />
            {/* Right Arm */}
            <path d="M 33 65 L 45 65 C 50 65, 50 50, 50 50 L 45 50 C 45 50, 45 59, 40 59 L 33 59 Z" />
            <path d="M 50 50 L 50 40 C 50 36, 56 36, 56 40 L 56 50 Z" />
            {/* Ground rocks/grass */}
            <ellipse cx="30" cy="95" rx="15" ry="3" />
          </svg>
          <span className="text-[8px] xl:text-[10px] font-mono tracking-widest text-amber-600/50 uppercase">
            Thar Vegetation
          </span>
        </motion.div>

        {/* Bottom: Standing Royal Camel & Multi-layer Sand Dunes */}
        <motion.div 
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-full relative bottom-0 left-0 min-h-[180px] xl:min-h-[250px] flex items-end"
        >
          {/* Desert Dunes Shape */}
          <div className="absolute bottom-0 left-0 w-36 xl:w-64 h-28 xl:h-40 bg-gradient-to-tr from-[#110905]/95 via-[#23130c]/30 to-transparent rounded-tr-[120px] border-t border-amber-800/10 filter blur-[0.5px] z-10" />
          
          {/* Wavy Dune Line */}
          <svg className="absolute bottom-0 left-0 w-36 xl:w-64 h-28 xl:h-40 text-amber-700/20 fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,75 Q45,55 100,100" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M0,85 Q65,70 100,100" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          </svg>

          {/* Standing Rajasthani Camel Silhouette (Large, beautifully rendered) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 0.25, scale: 1 }}
            transition={{ duration: 1.8, delay: 0.3 }}
            className="relative z-20 mb-3 ml-3 xl:ml-8"
          >
            <svg 
              className="w-16 h-22 xl:w-28 xl:h-38 text-amber-500/80 fill-current drop-shadow-[0_4px_12px_rgba(217,119,6,0.2)] filter blur-[0.2px]" 
              viewBox="0 0 100 120"
            >
              {/* Ground shadow under camel legs */}
              <ellipse cx="48" cy="112" rx="28" ry="4" fill="#000" opacity="0.3" />
              
              {/* Detailed Rajasthani Royal Camel Path */}
              <path d="
                M 90 28 
                C 88 23, 85 18, 80 15 
                C 76 12, 70 12, 68 18 
                C 67 21, 68 25, 65 28 
                C 62 31, 57 32, 54 35 
                C 50 38, 48 42, 45 46 
                C 42 50, 36 52, 30 50 
                C 24 48, 16 52, 12 58 
                C 8 64, 6 72, 10 78 
                C 12 81, 16 83, 19 81 
                C 22 79, 23 74, 26 74 
                C 29 74, 32 77, 35 77 
                C 40 77, 44 73, 48 73 
                C 52 73, 56 78, 62 78 
                C 68 78, 74 74, 78 68 
                C 82 62, 85 54, 84 46 
                C 83 38, 92 34, 90 28 
                Z
              " />
              {/* Legs details */}
              <path d="M 22 74 L 18 92 L 15 110 L 12 112 L 15 112 L 20 95 L 24 74 Z" />
              <path d="M 30 75 L 28 90 L 29 108 L 27 111 L 30 111 L 33 93 L 34 76 Z" />
              <path d="M 64 76 L 66 93 L 69 110 L 67 112 L 70 112 L 71 95 L 68 76 Z" />
              <path d="M 54 75 L 53 90 L 51 107 L 49 111 L 52 111 L 55 93 L 57 75 Z" />
              {/* Neck & ears */}
              <path d="M 72 20 Q 75 14 74 12 Q 72 13 70 16 Z" />
              {/* Hanging Tassel */}
              <path d="M 72 26 Q 64 34 58 32 Q 54 30 52 35" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              {/* Back Humps */}
              <path d="M 32 46 C 36 34, 46 34, 50 42 C 54 36, 62 38, 65 48" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* RIGHT MARGIN DECORATIONS: Pure Thar Desert Theme (Sand Dunes, Crescent Moon, Khejri Tree, Camel Caravan) */}
      <div 
        id="desktop-right-margin-desert"
        className="fixed right-0 top-24 bottom-12 w-16 xl:w-56 pointer-events-none hidden lg:flex flex-col justify-between items-end pr-2 xl:pr-6 z-0 select-none overflow-hidden"
      >
        {/* Top: Desert Crescent Moon & Twinkling Stars */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 0.18, y: 0 }}
          transition={{ duration: 1.6, delay: 0.2 }}
          className="w-full flex flex-col items-end space-y-4"
        >
          {/* Desert Crescent Moon */}
          <div className="mr-4 xl:mr-10 relative">
            <svg className="w-12 h-12 xl:w-20 xl:h-20 text-amber-400/55 fill-current" viewBox="0 0 100 100">
              <path d="M 80 20 C 50 20, 25 45, 25 75 C 25 82, 27 88, 30 94 C 18 85, 10 70, 10 55 C 10 25, 35 10, 65 10 C 72 10, 77 12, 80 20 Z" />
            </svg>
            {/* Small floating star right inside the moon's curve */}
            <motion.svg 
              animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-4.5 h-4.5 text-amber-300 absolute -bottom-1 -left-2 fill-current" 
              viewBox="0 0 24 24"
            >
              <path d="M12,2 L14.5,9.5 L22,12 L14.5,14.5 L12,22 L9.5,14.5 L2,12 L9.5,9.5 Z" />
            </motion.svg>
          </div>

          {/* Twinkling Stars Group */}
          <div className="w-full pr-4 flex flex-col items-end space-y-6">
            {[1, 2].map((delayIdx) => (
              <motion.div
                key={delayIdx}
                animate={{
                  scale: [0.8, 1.3, 0.8],
                  opacity: [0.15, 0.5, 0.15],
                }}
                transition={{
                  duration: 4 + delayIdx,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: delayIdx * 0.7
                }}
                className="mr-2 xl:mr-8 text-amber-400/70"
              >
                <svg className="w-3.5 h-3.5 xl:w-5 xl:h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12,2 L14.5,9.5 L22,12 L14.5,14.5 L12,22 L9.5,14.5 L2,12 L9.5,9.5 Z" />
                </svg>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Center: Famous Rajasthani Khejri Desert Tree & Sitting Camel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.16 }}
          transition={{ duration: 2 }}
          className="w-full pr-4 flex flex-col items-end space-y-2 mt-4"
        >
          {/* Khejri Tree Silhouette */}
          <svg className="w-14 h-22 xl:w-24 xl:h-36 text-amber-600/55 fill-current mr-2" viewBox="0 0 80 120">
            {/* Tree Canopy */}
            <path d="M 40 15 C 20 15, 12 30, 15 48 C 10 55, 12 68, 25 72 C 30 80, 50 80, 55 72 C 68 68, 70 55, 65 48 C 68 30, 60 15, 40 15 Z" />
            {/* Trunk */}
            <path d="M 37 72 L 34 110 L 46 110 L 43 72 Z" />
            {/* Branches details inside canopy */}
            <path d="M 37 72 L 30 55 M 43 72 L 50 58 M 40 75 L 40 45" stroke="#000" strokeWidth="1.5" opacity="0.3" />
            {/* Ground */}
            <ellipse cx="40" cy="110" rx="25" ry="3.5" />
          </svg>
          <span className="text-[8px] xl:text-[10px] font-mono tracking-widest text-amber-600/50 uppercase mr-2">
            Khejri Desert Tree
          </span>
        </motion.div>

        {/* Bottom: Camel Caravan Silhouette & Sand Dunes */}
        <motion.div 
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="w-full relative bottom-0 right-0 min-h-[180px] xl:min-h-[250px] flex items-end justify-end"
        >
          {/* Desert Dunes Right Side Shape */}
          <div className="absolute bottom-0 right-0 w-36 xl:w-64 h-28 xl:h-40 bg-gradient-to-tl from-[#110905]/95 via-[#23130c]/30 to-transparent rounded-tl-[120px] border-t border-amber-800/10 filter blur-[0.5px] z-10" />

          {/* Wavy Dune Line */}
          <svg className="absolute bottom-0 right-0 w-36 xl:w-64 h-28 xl:h-40 text-amber-700/20 fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M100,75 Q55,55 0,100" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M100,85 Q35,70 0,100" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          </svg>

          {/* Caravan of multiple tiny camels silhouette walking over dunes */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 0.22, x: 0 }}
            transition={{ duration: 1.8, delay: 0.4 }}
            className="relative z-20 mb-3.5 mr-3 xl:mr-8 flex items-end space-x-1"
          >
            {/* Camel 1 (Front Caravan) */}
            <svg className="w-10 h-12 xl:w-16 xl:h-20 text-amber-500/85 fill-current" viewBox="0 0 24 24">
              <path d="M22,12C21.4,12 20.2,12.5 19.5,12C18.8,11.5 18.2,10 18,9C17.5,6.5 16,5 15,4C14.5,3.5 13.5,3.2 13,3C12,2.6 11.5,1 11,1C10.5,1 10.2,1.8 10,2.5C9.8,3.2 9,4.5 9,5.5C9,6.5 9.5,7 10,7.5C10.5,8 10.8,9 10,9C8.5,9 7.5,7.5 6,7.5C4.5,7.5 3.5,8.5 2,9.5C1.5,9.8 1,11 1,12C1,13 1.5,13.5 2.5,13.5C3.5,13.5 4,13 5,13.5C6,14 6.5,15.5 7,17C7.5,18.5 7.8,21 8,23C8.2,23 8.5,23 9,23C9.2,21.5 9.1,19 8.5,17C8,15 8,14.5 8.5,14C9.2,13.5 10.2,14 11,14.5C11.5,15.5 11.8,17.5 12,20C12.2,22 12.5,23 13,23C13.2,23 13.5,23 13.5,22C13.5,19.5 13,17.5 12.5,15.5C13.5,15 14.5,14.5 15.5,14.5C16.5,14.5 17,16 17.5,18C18,20 18.2,22 18.5,23C19,23 19.5,23 19.5,22.5C19.5,21 19,19 18.5,16.5C18.2,15 18,14 18.5,13.5C19.2,13 20.5,13 21,13C21.5,13 22,12.5 22,12Z" />
            </svg>

            {/* Rope line connector */}
            <div className="w-3 h-[1px] border-b border-dashed border-amber-500/35 mb-2.5" />

            {/* Camel 2 (Caravan Follower) */}
            <svg className="w-8 h-10 xl:w-12 xl:h-16 text-amber-500/80 fill-current opacity-85" viewBox="0 0 24 24">
              <path d="M22,12C21.4,12 20.2,12.5 19.5,12C18.8,11.5 18.2,10 18,9C17.5,6.5 16,5 15,4C14.5,3.5 13.5,3.2 13,3C12,2.6 11.5,1 11,1C10.5,1 10.2,1.8 10,2.5C9.8,3.2 9,4.5 9,5.5C9,6.5 9.5,7 10,7.5C10.5,8 10.8,9 10,9C8.5,9 7.5,7.5 6,7.5C4.5,7.5 3.5,8.5 2,9.5C1.5,9.8 1,11 1,12C1,13 1.5,13.5 2.5,13.5C3.5,13.5 4,13 5,13.5C6,14 6.5,15.5 7,17C7.5,18.5 7.8,21 8,23C8.2,23 8.5,23 9,23C9.2,21.5 9.1,19 8.5,17C8,15 8,14.5 8.5,14C9.2,13.5 10.2,14 11,14.5C11.5,15.5 11.8,17.5 12,20C12.2,22 12.5,23 13,23C13.2,23 13.5,23 13.5,22C13.5,19.5 13,17.5 12.5,15.5C13.5,15 14.5,14.5 15.5,14.5C16.5,14.5 17,16 17.5,18C18,20 18.2,22 18.5,23C19,23 19.5,23 19.5,22.5C19.5,21 19,19 18.5,16.5C18.2,15 18,14 18.5,13.5C19.2,13 20.5,13 21,13C21.5,13 22,12.5 22,12Z" />
            </svg>

            {/* Rope line connector */}
            <div className="w-2.5 h-[1px] border-b border-dashed border-amber-500/25 mb-2" />

            {/* Camel 3 (Baby Caravan Follower) */}
            <svg className="w-6 h-8 xl:w-9 xl:h-12 text-amber-500/70 fill-current opacity-70" viewBox="0 0 24 24">
              <path d="M22,12C21.4,12 20.2,12.5 19.5,12C18.8,11.5 18.2,10 18,9C17.5,6.5 16,5 15,4C14.5,3.5 13.5,3.2 13,3C12,2.6 11.5,1 11,1C10.5,1 10.2,1.8 10,2.5C9.8,3.2 9,4.5 9,5.5C9,6.5 9.5,7 10,7.5C10.5,8 10.8,9 10,9C8.5,9 7.5,7.5 6,7.5C4.5,7.5 3.5,8.5 2,9.5C1.5,9.8 1,11 1,12C1,13 1.5,13.5 2.5,13.5C3.5,13.5 4,13 5,13.5C6,14 6.5,15.5 7,17C7.5,18.5 7.8,21 8,23C8.2,23 8.5,23 9,23C9.2,21.5 9.1,19 8.5,17C8,15 8,14.5 8.5,14C9.2,13.5 10.2,14 11,14.5C11.5,15.5 11.8,17.5 12,20C12.2,22 12.5,23 13,23C13.2,23 13.5,23 13.5,22C13.5,19.5 13,17.5 12.5,15.5C13.5,15 14.5,14.5 15.5,14.5C16.5,14.5 17,16 17.5,18C18,20 18.2,22 18.5,23C19,23 19.5,23 19.5,22.5C19.5,21 19,19 18.5,16.5C18.2,15 18,14 18.5,13.5C19.2,13 20.5,13 21,13C21.5,13 22,12.5 22,12Z" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
