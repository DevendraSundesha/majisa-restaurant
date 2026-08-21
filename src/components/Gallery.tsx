/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Play, Eye, Calendar, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Highlight } from '../types';

interface GalleryProps {
  highlights: Highlight[];
}

// Helper to optimize Cloudinary video URLs for 100% smooth, buffer-free 60fps playback
const getOptimizedVideoUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('cloudinary.com') && url.includes('/video/upload/')) {
    if (!url.includes('vc_h264')) {
      return url.replace('/video/upload/', '/video/upload/vc_h264,w_720,q_auto:eco/');
    }
  }
  return url;
};

// Helper to detect if a highlight item is a video
const isMediaVideo = (item: Highlight) => {
  if (item.type === 'video') return true;
  if (!item.url) return false;
  const urlLower = item.url.toLowerCase();
  return (
    urlLower.includes('.mp4') ||
    urlLower.includes('.webm') ||
    urlLower.includes('.mov') ||
    urlLower.includes('/video/upload/') ||
    urlLower.includes('youtube.com') ||
    urlLower.includes('youtu.be')
  );
};

export default function Gallery({ highlights }: GalleryProps) {
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');

  const videoCount = highlights.filter(item => isMediaVideo(item)).length;
  const photoCount = highlights.length - videoCount;

  // Filter highlights cleanly based on detected media type
  const displayedItems = highlights.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'video') return isMediaVideo(item);
    return !isMediaVideo(item);
  });

  return (
    <section className="py-24 px-4 md:px-6 bg-heritage-dark relative" id="gallery">
      {/* Decorative top pattern */}
      <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-heritage-clay to-transparent" />

      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16 relative">
          <div className="flex justify-center mb-3 text-heritage-yellow">
            <Camera className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-gold-100 tracking-wide mb-3">
            सजीव गैलरी • Digital Dhaba Highlights
          </h2>
          <p className="font-serif italic text-gold-300 text-lg max-w-xl mx-auto mb-6">
            "Sights from our kitchen, guest smiles, and royal cultural moments updated directly by our team."
          </p>
          <div className="flex justify-center items-center gap-3 sm:gap-4 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              id="btn-filter-all-gallery"
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'all'
                  ? 'bg-gold-500 text-heritage-dark font-bold shadow-lg scale-105'
                  : 'bg-heritage-clay/60 text-gold-300 hover:text-gold-100 border border-gold-400/20'
              }`}
            >
              <span>All Library</span>
              <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]">{highlights.length}</span>
            </button>
            <button
              onClick={() => setFilterType('image')}
              id="btn-filter-images-gallery"
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'image'
                  ? 'bg-gold-500 text-heritage-dark font-bold shadow-lg scale-105'
                  : 'bg-heritage-clay/60 text-gold-300 hover:text-gold-100 border border-gold-400/20'
              }`}
            >
              <span>Photos (फोटोज)</span>
              <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]">{photoCount}</span>
            </button>
            <button
              onClick={() => setFilterType('video')}
              id="btn-filter-videos-gallery"
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'video'
                  ? 'bg-gold-500 text-heritage-dark font-bold shadow-lg scale-105'
                  : 'bg-heritage-clay/60 text-gold-300 hover:text-gold-100 border border-gold-400/20'
              }`}
            >
              <span>Short Videos (वीडियो)</span>
              <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]">{videoCount}</span>
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {displayedItems.map((item) => {
              const isVid = isMediaVideo(item);
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -6 }}
                  onClick={() => setSelectedHighlight(item)}
                  className="group relative h-72 rounded-2xl overflow-hidden bg-heritage-clay border border-gold-400/15 shadow-xl cursor-pointer"
                >
                  {/* Media overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-heritage-dark/90 via-heritage-dark/30 to-transparent z-10 transition-opacity duration-300 group-hover:from-heritage-dark" />
                  
                  {/* Media Content */}
                  {isVid ? (
                    // Live video thumbnail preview in grid
                    <div className="w-full h-full relative bg-black">
                      {!selectedHighlight && (
                        <video
                          src={getOptimizedVideoUrl(item.url)}
                          muted
                          loop
                          autoPlay
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover opacity-90"
                        />
                      )}
                      {/* Play Button Indicator */}
                      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="w-12 h-12 bg-heritage-red/90 text-gold-200 border border-gold-400/30 rounded-full flex items-center justify-center shadow-2xl"
                        >
                          <Play className="w-5 h-5 fill-current translate-x-0.5" />
                        </motion.div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title ? `${item.title} - Majisa Restaurant Balotra` : "Majisa Restaurant Dining & Culture in Balotra"}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}

                  {/* Info Text Overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-5 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-heritage-red/60 text-gold-300 border border-gold-400/20 uppercase tracking-widest mb-2.5">
                      {isVid ? 'VIDEO CLIP' : 'PHOTO'}
                    </span>
                    <h3 className="font-display text-base font-bold text-gold-100 group-hover:text-gold-200 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xxs sm:text-xs text-gray-300 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                {/* Hover Eye Icon indicator */}
                <div className="absolute top-4 right-4 z-20 p-2 bg-heritage-clay/80 rounded-full border border-gold-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Eye className="w-4 h-4 text-gold-300" />
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {displayedItems.length === 0 && (
          <div className="text-center py-16 bg-heritage-clay/30 rounded-2xl border border-dashed border-gold-400/15">
            <p className="text-gold-300/50 font-serif italic">No items posted in this category yet.</p>
          </div>
        )}

        {/* ================== LIGHTBOX POPUP MODAL ================== */}
        <AnimatePresence>
          {selectedHighlight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-heritage-dark/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setSelectedHighlight(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-heritage-clay rounded-2xl border border-gold-400/30 overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Media Container */}
                <div className="relative bg-black flex-grow flex items-center justify-center overflow-hidden min-h-[250px] sm:min-h-[400px]">
                  
                  {selectedHighlight.type === 'video' || (selectedHighlight.url && (selectedHighlight.url.includes('.mp4') || selectedHighlight.url.includes('.webm') || selectedHighlight.url.includes('.mov') || selectedHighlight.url.includes('video'))) ? (
                    <video
                      key={selectedHighlight.id}
                      src={getOptimizedVideoUrl(selectedHighlight.url)}
                      controls
                      autoPlay
                      playsInline
                      preload="auto"
                      onCanPlay={(e) => {
                        const v = e.currentTarget;
                        if (v.paused) v.play().catch(() => {});
                      }}
                      className="max-h-[70vh] max-w-full object-contain rounded-xl"
                    />
                  ) : (
                    <img
                      src={selectedHighlight.url}
                      alt={selectedHighlight.title}
                      referrerPolicy="no-referrer"
                      className="max-h-[60vh] max-w-full object-contain"
                    />
                  )}

                  {/* Close Lightbox */}
                  <button
                    onClick={() => setSelectedHighlight(null)}
                    id="btn-close-lightbox"
                    className="absolute top-4 right-4 p-2 bg-heritage-clay/90 text-gold-300 rounded-full border border-gold-400/20 hover:text-gold-100 hover:border-gold-400/40 cursor-pointer transition-colors z-20"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Highlight text description info bar */}
                <div className="p-6 bg-heritage-clay border-t border-gold-400/20 shrink-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                    <h3 className="font-display text-lg sm:text-xl font-bold text-gold-100">
                      {selectedHighlight.title}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xxs text-gray-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-heritage-yellow" />
                      <span>{selectedHighlight.date}</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                    {selectedHighlight.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
