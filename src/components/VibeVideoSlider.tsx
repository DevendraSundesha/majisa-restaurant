/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';

interface VideoItem {
  id: string;
  url: string;
  poster: string;
  alt: string;
  hindiSubtitle: string;
  hindiTitle: string;
  englishTitle: string;
  description: string;
}

interface VibeVideoSliderProps {
  vibeVideos: VideoItem[];
}

export default function VibeVideoSlider({ vibeVideos }: VibeVideoSliderProps) {
  const videoData = vibeVideos.length > 0 ? vibeVideos : [];
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Ensure all videos play continuously and handle browser autoplay permissions gracefully
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = true;
        video.loop = true;
        // Force play
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Autoplay was prevented, retrying on interaction/scroll", err);
          });
        }
      }
    });
  }, [videoData]);

  return (
    <div className="w-full mb-16" id="vibe-video-collage">
      {/* 4-column responsive grid matching the exact style of the mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {videoData.map((video, idx) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="group relative aspect-[3/4.5] rounded-2xl overflow-hidden shadow-2xl border border-gold-400/10 bg-[#0c0806] transition-all duration-300 hover:border-gold-400/35 hover:shadow-[0_20px_40px_rgba(202,152,65,0.18)] cursor-pointer"
          >
            {/* Corner traditional sparkles/decorations inside cards for elegance */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-gold-500/20 rounded-tl pointer-events-none z-30 transition-colors group-hover:border-gold-400/40" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-gold-500/20 rounded-tr pointer-events-none z-30 transition-colors group-hover:border-gold-400/40" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-gold-500/20 rounded-bl pointer-events-none z-30 transition-colors group-hover:border-gold-400/40" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-gold-500/20 rounded-br pointer-events-none z-30 transition-colors group-hover:border-gold-400/40" />

            {/* Continuous Silent Autoplay Video with native HTML5 loop */}
            <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#100b09]">
              <video
                key={video.url}
                ref={(el) => { videoRefs.current[idx] = el; }}
                src={video.url}
                poster={video.poster}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108 pointer-events-none"
                aria-label={video.alt}
              />
            </div>

            {/* Strong elegant dark-to-transparent text background gradient to ensure deep contrast and accessibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0705] via-[#0a0705]/50 to-transparent z-10 transition-opacity duration-300 group-hover:via-[#0a0705]/60" />

            {/* Premium Bilingual Text Overlay positioned at the bottom of the video card */}
            <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 z-20 flex flex-col justify-end">
              {/* Hindi Subtitle */}
              <span className="text-[10px] sm:text-xs font-semibold text-amber-500 tracking-wider font-sans mb-1 uppercase">
                {video.hindiSubtitle}
              </span>
              
              {/* Hindi Bold Title */}
              <h3 className="font-display text-lg sm:text-2xl font-bold text-gold-100 tracking-wide leading-tight">
                {video.hindiTitle}
              </h3>
              
              {/* English Monospaced/Clean Subtitle */}
              <span className="font-mono text-[10px] sm:text-xs text-gold-300/80 mb-2.5 block tracking-wider">
                {video.englishTitle}
              </span>
              
              {/* Description Paragraph with spring-up reveal effect */}
              <p className="text-[11px] sm:text-xs text-gray-300 leading-relaxed font-sans line-clamp-3 transition-opacity duration-300 group-hover:text-gray-200">
                {video.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
