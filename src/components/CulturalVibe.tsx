/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Flame, Coffee, Home, Users } from 'lucide-react';
import { VibeVideo } from '../types';
import { RoyalArch, ClayPotMatka, CharpaiBadge, KathputliPuppet } from './Decorations';
import VibeVideoSlider from './VibeVideoSlider';

interface CulturalVibeProps {
  vibeVideos: VibeVideo[];
}

export default function CulturalVibe({ vibeVideos }: CulturalVibeProps) {
  const experiences = [
    {
      icon: <Home className="w-6 h-6 text-heritage-yellow" />,
      title: "खाट / चारपाई बैठक • Charpai Dining",
      description: "Relish your meals sitting comfortably on woven jute beds (Khaats/Charpais) beneath a canopy of marigolds, reflecting true village dhabas.",
      video: "https://player.vimeo.com/external/454559281.sd.mp4?s=31b402804b4cda9847fe73c1c8f85f1c8fdf1220&profile_id=139&oauth2_token_id=57447761",
      poster: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=800&q=80",
      badge: <CharpaiBadge className="mt-3" />
    },
    {
      icon: <Flame className="w-6 h-6 text-heritage-yellow" />,
      title: "देशी चूल्हा व शुद्ध घी रसोई • Desi Chulha Cooking",
      description: "All our Marwari gravies, Baatis, Churma and seasonal sweets are cooked on authentic firewood Chulhas (लकड़ी री आंच) using 100% pure organic cow ghee.",
      video: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c022f2cba110190cf6285b3f75e640b6&profile_id=139&oauth2_token_id=57447761",
      poster: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
      badge: (
        <div className="flex items-center space-x-2 mt-3 p-2 bg-amber-950/60 rounded-lg border border-amber-500/30">
          <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">🔥 100% Pure Cow Ghee & Firewood</span>
        </div>
      )
    },
    {
      icon: <Coffee className="w-6 h-6 text-heritage-yellow" />,
      title: "मिट्टी के बर्तन • Earthen Cookery",
      description: "Dishes simmer slowly in clay handis, and drinks are served in clay cups (Kulhads) to capture the natural earthy aroma (Mitti di Khushboo).",
      video: "https://player.vimeo.com/external/434045526.sd.mp4?s=c27d2abde534001bb99b4bca6c0cf4766aafebbc&profile_id=139&oauth2_token_id=57447761",
      poster: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
      badge: (
        <div className="flex items-center space-x-2 mt-3 p-2 bg-amber-950/60 rounded-lg border border-amber-500/30">
          <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">🏺 Clay Handi & Kulhad Chai</span>
        </div>
      )
    },
    {
      icon: <Users className="w-6 h-6 text-heritage-yellow" />,
      title: "मनुहार आदर-सत्कार • Marwari Manuhaar",
      description: "Experience our signature 'Manuhaar'—an affectionate traditional custom where we insist on serving you fresh hot ghee and extra helpings with deep love.",
      video: "https://player.vimeo.com/external/430049740.sd.mp4?s=213bf9f4f469efb925b4df279b9bf8b532726359&profile_id=139&oauth2_token_id=57447761",
      poster: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
      badge: (
        <div className="flex items-center space-x-2 mt-3 p-2 bg-heritage-red/20 rounded-lg border border-heritage-red/30">
          <span className="text-[10px] text-gold-200 font-bold">❤️ Pure Ghee Hospitality</span>
        </div>
      )
    }
  ];

  return (
    <section className="py-24 px-4 md:px-6 bg-heritage-clay relative overflow-hidden" id="cultural-vibe">
      {/* Decorative Golden sand dunes bottom curve using absolute elements */}
      <div className="absolute bottom-0 inset-x-0 h-2 bg-gradient-to-r from-heritage-orange via-heritage-yellow to-heritage-orange opacity-40" />

      {/* Decorative Swaying Kathputli Puppets on section sides */}
      <KathputliPuppet className="absolute top-8 left-4 lg:left-8 z-20 scale-75 sm:scale-95 hidden md:flex" />
      <KathputliPuppet className="absolute top-8 right-4 lg:right-8 z-20 scale-75 sm:scale-95 hidden md:flex" />



      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Interactive Loop Video Slider */}
        <VibeVideoSlider vibeVideos={vibeVideos} />
        
        {/* Royal Arch Wrapper for Title */}
        <RoyalArch className="bg-heritage-dark/60 mb-16 text-center">
          <div className="flex justify-center mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <Sparkles className="w-8 h-8 text-heritage-yellow" />
            </motion.div>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-gold-100 mb-4 tracking-wide leading-tight">
            म्हारा राजस्थान री महक • Cultural Heritage
          </h2>
          <p className="font-serif italic text-gold-200 text-base sm:text-lg max-w-2xl mx-auto">
            "At Majisa Restaurant, we don't just serve food; we serve Rajasthan's rich royal history, warm music, and rustic village heritage."
          </p>
        </RoyalArch>

        {/* 3D Bento Layout for Cultural Elements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {experiences.map((exp, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ scale: 1.01, y: -4 }}
              className="group relative rounded-2xl overflow-hidden bg-heritage-dark border border-gold-400/10 flex flex-col sm:flex-row h-full min-h-[220px] shadow-2xl transition-all duration-300 hover:border-gold-400/30"
            >
              {/* Media video container on the side with continuous autoplay */}
              <div className="relative w-full sm:w-2/5 h-48 sm:h-auto overflow-hidden shrink-0 bg-heritage-clay">
                <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-heritage-dark via-transparent to-transparent z-10" />
                <video
                  src={exp.video}
                  poster={exp.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-115 pointer-events-none"
                />
              </div>

              {/* Text content details */}
              <div className="p-6 sm:p-8 flex flex-col justify-center flex-grow">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-heritage-red/30 border border-gold-400/20 shadow-md">
                    {exp.icon}
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-gold-100 group-hover:text-gold-200 transition-colors">
                    {exp.title}
                  </h3>
                </div>
                
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans mb-1">
                  {exp.description}
                </p>

                {/* Optional Custom badge or illustration */}
                {exp.badge}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Traditional Verse Block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-20 p-8 rounded-2xl bg-gradient-to-r from-heritage-red/40 via-heritage-maroon/50 to-heritage-clay/60 border border-gold-400/25 text-center relative overflow-hidden backdrop-blur-sm"
        >
          {/* Inner decorative design */}
          <div className="absolute inset-0.5 border border-dashed border-gold-400/20 rounded-xl pointer-events-none" />
          
          <h4 className="font-serif italic text-xl sm:text-2xl text-heritage-yellow mb-2 font-bold tracking-wide">
            "केसरिया बालम आओ नी, पधारो म्हारे देस।"
          </h4>
          <p className="text-gold-100 text-xs sm:text-sm font-sans uppercase tracking-widest max-w-xl mx-auto">
            "O saffron-colored beloved, welcome to our motherland. May you be blessed with happiness and royal flavors."
          </p>
        </motion.div>

      </div>
    </section>
  );
}
