/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Star, Award, Search, Info, ChevronDown, Sparkles } from 'lucide-react';
import { MenuItem } from '../types';
import { ClayPotMatka } from './Decorations';

interface MenuSectionProps {
  menuItems: MenuItem[];
  isAdmin: boolean;
  onDeleteMenuItem: (id: string) => void;
  onToggleAvailability: (id: string, current: boolean) => void;
}

type CategoryFilter = string;

export default function MenuSection({ menuItems, isAdmin, onDeleteMenuItem, onToggleAvailability }: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegetarianOnly, setVegetarianOnly] = useState(false); // All Rajasthani dhabas are mostly 100% veg, but we can filter by spicy / chef special!
  const [filterSpicy, setFilterSpicy] = useState(false);
  const [filterPopular, setFilterPopular] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(9);

  // Reset pagination to 9 when any filter or category changes
  useEffect(() => {
    setVisibleCount(9);
  }, [selectedCategory, searchQuery, filterSpicy, filterPopular]);

  // Filter Categories list
  const defaultCategories: { key: CategoryFilter; label: string; hindi: string }[] = [
    { key: 'all', label: 'All Dishes', hindi: 'सभी व्यंजन' },
    { key: 'paneer', label: 'Paneer Dishes', hindi: 'पनीर स्पेशल' },
    { key: 'kaju', label: 'Kaju Specials', hindi: 'काजू स्पेशल' },
    { key: 'cheese', label: 'Cheese Specials', hindi: 'चीज़ स्पेशल' },
    { key: 'breads', label: 'Rotis & Breads', hindi: 'सोगरा / रोटी' },
    { key: 'rice', label: 'Rice & Biryani', hindi: 'चावल व बिरयानी' },
    { key: 'mains', label: 'Vegetable Sabji', hindi: 'सब्जी रसोई' },
    { key: 'hari_sabji', label: 'Hari Sabji', hindi: 'हरी सब्जी' },
    { key: 'dal', label: 'Dal & Khichdi', hindi: 'दाल व खिचड़ी' },
    { key: 'palak', label: 'Palak Specials', hindi: 'पालक रसोई' },
    { key: 'kofta', label: 'Kofta Special', hindi: 'कोफ़्ता रसोई' },
    { key: 'thali', label: 'Fix Thali', hindi: 'शाही थाली' },
    { key: 'raj_special', label: 'Rajasthani Special', hindi: 'राजस्थानी स्पेशल' },
    { key: 'churma', label: 'Majisa Churma', hindi: 'चूरमा स्पेशल' },
    { key: 'raita', label: 'Raita & Curd', hindi: 'रायता व छाछ' },
    { key: 'salad', label: 'Salad & Papad', hindi: 'सलाद व पापड़' },
  ];

  // Extract dynamic custom categories from menuItems
  const knownKeys = defaultCategories.map(c => c.key);
  const customKeys = Array.from(
    new Set(menuItems.map(m => m.category).filter(c => !knownKeys.includes(c)))
  );

  const categories = [
    ...defaultCategories,
    ...customKeys.map(k => ({ key: k, label: k, hindi: k }))
  ];

  // Filtering Logic
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.hindiName.includes(searchQuery) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpicy = !filterSpicy || item.isSpicy;
    const matchesPopular = !filterPopular || item.isPopular || item.isChefSpecial;

    return matchesCategory && matchesSearch && matchesSpicy && matchesPopular;
  });

  const displayedItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  return (
    <section className="py-24 px-4 md:px-6 bg-heritage-dark relative clay-texture" id="menu">
      {/* Background Motifs */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-gold-400/20 to-transparent" />
      
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mb-3 text-gold-400"
          >
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
            </div>
          </motion.div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-3">
            <ClayPotMatka className="scale-75 hidden sm:block" />
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-gold-100 tracking-wide">
              शाही भोजन मीनू • The Royal Menu
            </h2>
            <ClayPotMatka className="scale-75 hidden sm:block" />
          </div>
          <p className="font-serif italic text-gold-300 text-lg max-w-xl mx-auto mb-8">
            "Savor the rich, pure ghee cooked authentic Rajasthani heritage dishes prepared over clay ovens."
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto" />
        </div>

        {/* Filter Controls (Search and Quick Tags) */}
        <div className="mb-12 flex flex-col gap-6 p-6 rounded-2xl bg-heritage-clay/60 border border-gold-400/15 backdrop-blur-sm shadow-xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-400/60" />
              <input
                type="text"
                placeholder="Search Dal Baati, Lassi, Ghevar... (खोजें)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-heritage-dark border border-gold-400/20 rounded-xl text-gold-100 placeholder-gold-400/40 font-sans text-sm focus:outline-none focus:border-gold-400/60 transition-colors"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
              {/* Spicy Filter */}
              <button
                onClick={() => setFilterSpicy(!filterSpicy)}
                id="btn-filter-spicy"
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                  filterSpicy
                    ? 'bg-heritage-red/30 border-heritage-red text-orange-400'
                    : 'bg-heritage-dark border-gold-400/10 text-gold-300 hover:border-gold-400/30'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>तीखा • Spicy Dishes</span>
              </button>

              {/* Popular / Best Seller Filter */}
              <button
                onClick={() => setFilterPopular(!filterPopular)}
                id="btn-filter-popular"
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                  filterPopular
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-heritage-dark border-gold-400/10 text-gold-300 hover:border-gold-400/30'
                }`}
              >
                <Star className="w-4 h-4" />
                <span>लोकप्रिय • Best Sellers</span>
              </button>
            </div>
          </div>

          {/* Categorized Filter Tabs */}
          <div className="flex items-center overflow-x-auto gap-2 py-2 no-scrollbar border-t border-gold-400/10 pt-5">
            {categories.map((cat) => (
              <button
                key={cat.key}
                id={`cat-tab-${cat.key}`}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium shrink-0 transition-all cursor-pointer flex flex-col items-center ${
                  selectedCategory === cat.key
                    ? 'bg-gold-500 text-heritage-dark font-semibold shadow-lg shadow-gold-500/10 transform scale-105'
                    : 'bg-heritage-dark text-gold-300 border border-gold-400/10 hover:border-gold-400/30'
                }`}
              >
                <span className="text-xxs sm:text-xs opacity-90 font-serif uppercase tracking-wider flex items-center gap-1.5">
                  {selectedCategory === cat.key && (
                    <svg className="w-3.5 h-3.5 fill-current animate-pulse text-heritage-dark shrink-0" viewBox="0 0 24 24">
                      <path d="M22,12C21.4,12 20.2,12.5 19.5,12C18.8,11.5 18.2,10 18,9C17.5,6.5 16,5 15,4C14.5,3.5 13.5,3.2 13,3C12,2.6 11.5,1 11,1C10.5,1 10.2,1.8 10,2.5C9.8,3.2 9,4.5 9,5.5C9,6.5 9.5,7 10,7.5C10.5,8 10.8,9 10,9C8.5,9 7.5,7.5 6,7.5C4.5,7.5 3.5,8.5 2,9.5C1.5,9.8 1,11 1,12C1,13 1.5,13.5 2.5,13.5C3.5,13.5 4,13 5,13.5C6,14 6.5,15.5 7,17C7.5,18.5 7.8,21 8,23C8.2,23 8.5,23 9,23C9.2,21.5 9.1,19 8.5,17C8,15 8,14.5 8.5,14C9.2,13.5 10.2,14 11,14.5C11.5,15.5 11.8,17.5 12,20C12.2,22 12.5,23 13,23C13.2,23 13.5,23 13.5,22C13.5,19.5 13,17.5 12.5,15.5C13.5,15 14.5,14.5 15.5,14.5C16.5,14.5 17,16 17.5,18C18,20 18.2,22 18.5,23C19,23 19.5,23 19.5,22.5C19.5,21 19,19 18.5,16.5C18.2,15 18,14 18.5,13.5C19.2,13 20.5,13 21,13C21.5,13 22,12.5 22,12Z" />
                    </svg>
                  )}
                  {cat.hindi}
                </span>
                <span className="font-sans mt-0.5">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16 bg-heritage-clay/30 rounded-2xl border border-dashed border-gold-400/10">
            <p className="text-gold-300/60 font-serif italic text-lg">
              कोई व्यंजन नहीं मिला! No matching dishes found.
            </p>
            <p className="text-sm text-gray-500 mt-2">Try resetting your search query or filters.</p>
          </div>
        )}

        {/* 3D-Animated Menu Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {displayedItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -8 }}
                className="group relative flex flex-col rounded-2xl bg-heritage-clay border border-gold-400/10 overflow-hidden shadow-2xl transition-all duration-300 hover:border-gold-400/30 flex-grow"
              >
                {/* Image & Badges Container */}
                <div className="relative h-56 w-full overflow-hidden bg-heritage-dark shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-heritage-dark/80 via-transparent to-transparent z-10" />
                  
                  {/* Item Image */}
                  <img
                    src={item.image}
                    alt={`${item.name} (${item.hindiName}) - Majisa Restaurant Balotra`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Availability Overlay */}
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-heritage-dark/80 backdrop-blur-xs flex items-center justify-center z-20">
                      <div className="px-4 py-2 border-2 border-heritage-red rounded-lg text-heritage-red font-bold text-xs uppercase tracking-widest bg-heritage-dark">
                        Sold Out / खत्म
                      </div>
                    </div>
                  )}

                  {/* Special Badges (Popular, Spicy, Chef Special) */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {item.isChefSpecial && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xxs font-bold uppercase tracking-wider bg-gold-400 text-heritage-dark shadow-md">
                        <Award className="w-3.5 h-3.5 fill-current" />
                        <span>CHEF'S SPECIAL</span>
                      </span>
                    )}
                    {item.isPopular && !item.isChefSpecial && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xxs font-bold uppercase tracking-wider bg-amber-500 text-heritage-dark shadow-md">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>BEST SELLER</span>
                      </span>
                    )}
                    {item.isSpicy && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xxs font-bold uppercase tracking-wider bg-heritage-red text-gold-100 shadow-md">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span>तीखा • SPICY</span>
                      </span>
                    )}
                  </div>

                  {/* Price Tag (Stamped/Hand-made plate style) */}
                  <div className="absolute bottom-4 right-4 z-10 px-4 py-1.5 bg-gradient-to-r from-heritage-orange to-amber-600 rounded-lg text-gold-50 border border-gold-400/20 font-bold font-sans text-lg shadow-lg">
                    ₹{item.price}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 flex flex-col flex-grow justify-between">
                  <div>
                    {/* Hindi Devnagari Name */}
                    <p className="text-xs font-serif italic text-gold-400/80 mb-0.5 font-semibold tracking-wider">
                      {item.hindiName}
                    </p>
                    
                    {/* English Name */}
                    <h3 className="text-lg sm:text-xl font-display font-bold text-gold-100 group-hover:text-gold-300 transition-colors">
                      {item.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-gray-400 mt-2.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Pagination / Load More Button Controls */}
        {filteredItems.length > 0 && (
          <div className="mt-14 flex flex-col items-center justify-center gap-4">
            <p className="text-xs text-gold-300/80 font-sans tracking-wide">
              दिखाए जा रहे हैं: <span className="text-gold-400 font-bold">{displayedItems.length}</span> / <span className="text-gold-400 font-bold">{filteredItems.length}</span> व्यंजन
            </p>

            {hasMore ? (
              <button
                id="btn-load-more-dishes"
                onClick={() => setVisibleCount((prev) => prev + 9)}
                className="group px-8 py-3.5 bg-gradient-to-r from-gold-500 via-amber-500 to-heritage-orange hover:from-gold-400 hover:to-amber-400 text-heritage-dark font-extrabold rounded-2xl shadow-xl shadow-gold-500/10 hover:shadow-gold-500/25 transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-1 border border-gold-300/40"
              >
                <span>और व्यंजन देखें • Load More ({filteredItems.length - displayedItems.length} More)</span>
                <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
              </button>
            ) : filteredItems.length > 9 ? (
              <div className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-heritage-clay/80 border border-gold-400/20 text-gold-300 text-xs font-sans shadow-md">
                <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />
                <span>आपने इस श्रेणी के सभी {filteredItems.length} शाही व्यंजन देख लिए हैं!</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
