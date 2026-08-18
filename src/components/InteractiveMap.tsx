/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Info, Car, Map, Sparkles, Milestone, Compass } from 'lucide-react';

interface RouteInfo {
  name: string;
  distance: string;
  time: string;
  highway: string;
  instructions: string[];
  points: { x: number; y: number }[];
}

export default function InteractiveMap() {
  const [activeRoute, setActiveRoute] = useState<'jodhpur' | 'barmer' | 'siwana'>('jodhpur');
  const [selectedLandmark, setSelectedLandmark] = useState<string | null>('majisa');
  const [showSatellite, setShowSatellite] = useState<boolean>(false);

  // Highway routes plotted on a grid from 0-100 to draw beautiful responsive SVG paths
  const routes: Record<'jodhpur' | 'barmer' | 'siwana', RouteInfo> = {
    jodhpur: {
      name: "Jodhpur City",
      distance: "105 km",
      time: "1.5 - 2 Hours",
      highway: "NH-25 (Westbound)",
      instructions: [
        "Depart from Jodhpur city via Jhalamand Circle onto NH-25 towards Pachpadra / Balotra.",
        "Proceed straight west past Pachpadra Refinery corridor (85 km).",
        "Enter Balotra city and proceed onto Siwana Road near Housing Board circle.",
        "Majisa Cafe & Restaurant is located at Housing Board, Siwana Road, opposite Bhansali Petrol Pump!"
      ],
      // Points on the SVG canvas
      points: [
        { x: 15, y: 15 }, // Jodhpur Entry
        { x: 32, y: 28 }, 
        { x: 48, y: 45 },
        { x: 58, y: 58 }, // Bhansali Petrol Pump
        { x: 65, y: 65 }  // Majisa Cafe
      ]
    },
    barmer: {
      name: "Barmer Town",
      distance: "100 km",
      time: "1.5 Hours",
      highway: "NH-25 (Eastbound)",
      instructions: [
        "Head East out of Barmer town on National Highway 25.",
        "Drive past Baytu and Jasol Dham Tirtha junction (80 km).",
        "Enter Balotra Housing Board ring road.",
        "Majisa Cafe & Restaurant is located directly on Siwana Road, opposite Bhansali Petrol Pump!"
      ],
      points: [
        { x: 90, y: 90 }, // Barmer Entry
        { x: 80, y: 80 },
        { x: 72, y: 72 },
        { x: 65, y: 65 }  // Majisa Cafe
      ]
    },
    siwana: {
      name: "Siwana / Jalore",
      distance: "35 km",
      time: "35-40 mins",
      highway: "Siwana Road (MDR-38)",
      instructions: [
        "Take Siwana Road northbound straight into Balotra town.",
        "Drive past Housing Board Colony entrance.",
        "Approach Bhansali Petrol Pump crossing.",
        "Majisa Cafe & Restaurant is located right on your left hand side!"
      ],
      points: [
        { x: 10, y: 85 }, // Siwana Road Entry
        { x: 35, y: 65 },
        { x: 52, y: 58 }, // Bhansali Petrol Pump
        { x: 65, y: 65 }  // Majisa Cafe
      ]
    }
  };

  const landmarks = [
    {
      id: "jodhpur",
      name: "Jodhpur Highway Entrance",
      hindi: "जोधपुर मार्ग (NH-25)",
      desc: "Connecting Jodhpur (105 km) via Pachpadra to Balotra.",
      x: 15,
      y: 15,
      type: "city"
    },
    {
      id: "barmer",
      name: "Barmer Road Junction",
      hindi: "बाड़मेर मार्ग (NH-25)",
      desc: "Connecting Barmer (100 km) & Jasol Dham Tirtha to Balotra.",
      x: 90,
      y: 90,
      type: "city"
    },
    {
      id: "bhansali",
      name: "Bhansali Petrol Pump Crossing",
      hindi: "भंसाली पेट्रोल पंप - बालोतरा",
      desc: "Famous landmark right opposite to Majisa Cafe & Restaurant on Siwana Road.",
      x: 58,
      y: 58,
      type: "landmark"
    },
    {
      id: "majisa",
      name: "Majisa Cafe & Restaurant",
      hindi: "माजीसा कैफे & रेस्टोरेंट (बालोतरा)",
      desc: "Housing Board, Siwana Road, Opp. Bhansali Petrol Pump, Balotra, Rajasthan 344022. Traditional pure veg Rajasthani dhaba.",
      x: 65,
      y: 65,
      type: "cafe"
    },
    {
      id: "dunes",
      name: "Thar Sand Dunes Pitstop",
      hindi: "थार मरुस्थल",
      desc: "Scenic Thar desert highway surrounding Balotra and Pachpadra.",
      x: 40,
      y: 75,
      type: "scenic"
    }
  ];

  // Render SVG Path of active route
  const getSvgPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Create a slightly curved organic road path instead of plain straight lines
      const prev = points[i - 1];
      const curr = points[i];
      const cpX1 = prev.x + (curr.x - prev.x) * 0.3;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) * 0.7;
      const cpY2 = curr.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  const activeRouteData = routes[activeRoute];

  return (
    <div className="w-full bg-[#0c0806] border border-gold-400/20 rounded-3xl overflow-hidden shadow-2xl relative" id="highway-map-section">
      {/* Traditional Rajasthani visual corners */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-gold-400/30 rounded-tl-lg pointer-events-none z-10" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-gold-400/30 rounded-tr-lg pointer-events-none z-10" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-gold-400/30 rounded-bl-lg pointer-events-none z-10" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-gold-400/30 rounded-br-lg pointer-events-none z-10" />

      {/* Header Bar */}
      <div className="p-6 border-b border-gold-400/10 bg-[#120d0a] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-amber-500 animate-spin-slow" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#f59e0b]">Highway Interactive Compass</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-gold-100">
            NH-25 / बालोतरा हाईवे नेविगेशन • <span className="text-amber-500">Live Dhaba Locator</span>
          </h3>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Interactive highway map guiding you straight to Majisa Cafe & Restaurant at Siwana Road, Balotra.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-[#1b1410] p-1 rounded-lg border border-gold-400/10 shrink-0">
          <button
            onClick={() => setShowSatellite(false)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${!showSatellite ? 'bg-gold-500 text-heritage-dark shadow-md' : 'text-gold-200/70 hover:text-gold-100'}`}
          >
            <div className="flex items-center gap-1.5">
              <Map className="w-3.5 h-3.5" />
              <span>Royal Map</span>
            </div>
          </button>
          <button
            onClick={() => setShowSatellite(true)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${showSatellite ? 'bg-gold-500 text-heritage-dark shadow-md' : 'text-gold-200/70 hover:text-gold-100'}`}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Satellite Sand View</span>
            </div>
          </button>
        </div>
      </div>

      {/* Map Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Interactive Map Canvas (Col span 7) */}
        <div className="lg:col-span-7 relative bg-[#0e0a08] aspect-video sm:aspect-square lg:aspect-auto lg:h-[520px] overflow-hidden border-b lg:border-b-0 lg:border-r border-gold-400/10">
          
          {/* Satellite View Background Texture */}
          {showSatellite ? (
            <div className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1605152276897-4f618f831968?auto=format&fit=crop&w=1200&q=80')" }}>
              <div className="absolute inset-0 bg-[#0e0a08]/80" />
            </div>
          ) : null}

          {/* Sand Dune Contours & Organic Desert lines in the background */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Dunes lines */}
              <path d="M 0 40 Q 30 20, 60 45 T 100 30" fill="none" stroke="#d97706" strokeWidth="0.25" />
              <path d="M 0 70 Q 25 55, 50 80 T 100 65" fill="none" stroke="#d97706" strokeWidth="0.25" />
              <path d="M -20 90 Q 40 70, 100 95" fill="none" stroke="#d97706" strokeWidth="0.25" />
            </svg>
          </div>

          {/* SVG Map Overlay */}
          <svg className="absolute inset-0 w-full h-full p-4 select-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d97706" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Main National Highway 25 Road Base */}
            <path
              d="M 15 15 C 30 25, 45 40, 58 58 C 70 70, 80 80, 90 90"
              fill="none"
              stroke="#2e1a0c"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Inner Paved Road Core */}
            <path
              d="M 15 15 C 30 25, 45 40, 58 58 C 70 70, 80 80, 90 90"
              fill="none"
              stroke="#1b1109"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Dashed Center Lane Markings */}
            <path
              d="M 15 15 C 30 25, 45 40, 58 58 C 70 70, 80 80, 90 90"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="0.3"
              strokeDasharray="1.5, 2.5"
              strokeLinecap="round"
            />

            {/* Siwana Road Branch merging onto NH-25 */}
            <path
              d="M 10 85 C 25 70, 40 55, 58 58"
              fill="none"
              stroke="#2e1a0c"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.75"
            />
            <path
              d="M 10 85 C 25 70, 40 55, 58 58"
              fill="none"
              stroke="#1b1109"
              strokeWidth="2.8"
              strokeLinecap="round"
              opacity="0.75"
            />
            <path
              d="M 10 85 C 25 70, 40 55, 58 58"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="0.2"
              strokeDasharray="1, 2"
              strokeLinecap="round"
              opacity="0.75"
            />

            {/* Animated Active Driving Route Overlay */}
            <motion.path
              d={getSvgPath(activeRouteData.points)}
              fill="none"
              stroke="url(#roadGrad)"
              strokeWidth="1.8"
              strokeLinecap="round"
              initial={{ strokeDasharray: "100", strokeDashoffset: "100" }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              filter="url(#glow)"
            />
          </svg>

          {/* Interactive Landmark Pins */}
          {landmarks.map((mark) => {
            const isSelected = selectedLandmark === mark.id;
            const isMajisa = mark.id === "majisa";
            
            return (
              <button
                key={mark.id}
                onClick={() => setSelectedLandmark(mark.id)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                style={{ left: `${mark.x}%`, top: `${mark.y}%` }}
              >
                {/* Visual marker element */}
                <div className="relative flex items-center justify-center">
                  
                  {/* Glowing pulses for main destinations */}
                  {isMajisa ? (
                    <>
                      <div className="absolute w-8 h-8 rounded-full bg-heritage-red/30 animate-ping" />
                      <div className="absolute w-12 h-12 rounded-full bg-gold-400/10 animate-pulse" />
                    </>
                  ) : isSelected ? (
                    <div className="absolute w-6 h-6 rounded-full bg-amber-500/20 animate-ping" />
                  ) : null}

                  {/* Marker Pin Container */}
                  <motion.div
                    animate={isMajisa ? { y: [0, -4, 0] } : {}}
                    transition={isMajisa ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" } : {}}
                    className={`flex items-center justify-center rounded-full border transition-all duration-300 ${
                      isMajisa 
                        ? 'w-9 h-9 bg-heritage-red border-gold-400 text-gold-200 shadow-[0_0_15px_rgba(185,28,28,0.8)] scale-110' 
                        : isSelected
                          ? 'w-7.5 h-7.5 bg-[#f59e0b] border-white text-heritage-dark shadow-md scale-105'
                          : 'w-6 h-6 bg-[#1b1410] border-gold-400/30 text-gold-300 hover:border-gold-400 hover:scale-105'
                    }`}
                  >
                    {isMajisa ? (
                      <MapPin className="w-5 h-5 fill-current text-gold-300" />
                    ) : mark.type === 'city' ? (
                      <Compass className="w-3.5 h-3.5" />
                    ) : (
                      <Milestone className="w-3 h-3 text-gold-400" />
                    )}
                  </motion.div>

                  {/* Desktop Label popovers on hover or selection */}
                  <div className={`absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-2.5 py-1 rounded bg-[#100b09] border border-gold-400/20 text-[10px] whitespace-nowrap shadow-xl font-sans tracking-wide transition-all duration-300 ${
                    isSelected ? 'opacity-100 scale-100 z-30' : 'opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100'
                  }`}>
                    <span className="font-semibold text-gold-100 block text-center leading-none mb-0.5">{mark.name}</span>
                    <span className="text-amber-500 text-[9px] block text-center leading-none font-medium">{mark.hindi}</span>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Compass Rose Decoration */}
          <div className="absolute bottom-4 left-4 bg-heritage-dark/80 backdrop-blur-md p-2 rounded-xl border border-gold-400/15 flex items-center gap-2 pointer-events-none">
            <Compass className="w-5 h-5 text-gold-400 animate-spin-slow shrink-0" />
            <div className="font-mono text-[9px] text-gold-300 flex flex-col">
              <span className="font-bold tracking-widest text-[#f59e0b]">N ▲</span>
              <span>NH-25 BALOTRA</span>
            </div>
          </div>

          {/* Quick interactive directions selector inside the map */}
          <div className="absolute top-4 left-4 bg-heritage-dark/95 backdrop-blur-md px-3 py-2 rounded-xl border border-gold-400/15 flex flex-col gap-1.5 z-20 shadow-2xl">
            <span className="text-[9px] uppercase font-bold tracking-widest text-gold-400 leading-none">Simulate Route</span>
            <div className="flex gap-1">
              {(['jodhpur', 'barmer', 'siwana'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setActiveRoute(r);
                    // Automatically highlight starting landmark on selector click
                    setSelectedLandmark(r);
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                    activeRoute === r 
                      ? 'bg-gold-500 text-heritage-dark' 
                      : 'bg-[#18110c] text-gold-300 hover:bg-[#251b14]'
                  }`}
                >
                  {r === 'jodhpur' ? 'From Jodhpur' : r === 'barmer' ? 'From Barmer' : 'From Siwana'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Informative Drawer & Route Planner (Col span 5) */}
        <div className="lg:col-span-5 p-6 bg-[#0f0b08] flex flex-col justify-between">
          
          {/* Top Panel: Route and Landmark breakdown */}
          <div className="space-y-6">
            
            {/* Highway distance breakdown */}
            <div className="bg-[#150f0c] rounded-2xl p-4.5 border border-gold-400/10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-gold-500/10 to-transparent pointer-events-none" />
              
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-gold-400/15 text-gold-300 border border-gold-400/25">
                  <Car className="w-3 h-3" />
                  <span>Highway Milestone</span>
                </span>
                <span className="text-[10px] font-mono text-amber-500 font-semibold">{activeRouteData.highway}</span>
              </div>

              <h4 className="font-display text-lg font-bold text-gold-100 flex items-center gap-1.5">
                Starting from <span className="text-amber-500">{activeRouteData.name}</span>
              </h4>

              {/* Grid details */}
              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gold-400/5">
                <div>
                  <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Estimated Distance</span>
                  <span className="font-mono text-base font-bold text-gold-200">{activeRouteData.distance}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Driving Duration</span>
                  <span className="font-mono text-base font-bold text-gold-200">{activeRouteData.time}</span>
                </div>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-2.5">
              <h5 className="text-[10px] uppercase font-bold tracking-widest text-[#f59e0b] border-b border-gold-400/5 pb-1 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5" />
                <span>Driving Directions • मार्ग दर्शन</span>
              </h5>
              
              <div className="space-y-3 font-sans text-xs text-gray-300">
                {activeRouteData.instructions.map((step, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start">
                    <span className="w-4.5 h-4.5 rounded-full bg-heritage-dark border border-gold-400/15 flex items-center justify-center font-mono text-[9px] text-gold-300 shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed text-gray-300">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Landmark Details Section (Changes dynamically based on map interaction) */}
            <AnimatePresence mode="wait">
              {selectedLandmark && (
                <motion.div
                  key={selectedLandmark}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#18110c]/80 rounded-2xl p-4 border border-gold-400/10"
                >
                  {(() => {
                    const mark = landmarks.find(l => l.id === selectedLandmark);
                    if (!mark) return null;
                    return (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-bold tracking-widest text-amber-500 font-mono">
                            {mark.type === 'cafe' ? '★ Featured Pitstop' : mark.type === 'city' ? '▲ City Hub' : '◆ Landmark Point'}
                          </span>
                          <span className="text-[9px] font-semibold text-gold-400">{mark.hindi}</span>
                        </div>
                        <h6 className="font-display text-sm font-bold text-gold-200">{mark.name}</h6>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-sans">{mark.desc}</p>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Action Navigation Buttons */}
          <div className="mt-8 pt-4 border-t border-gold-400/10 space-y-3">
            <a
              href="https://share.google/QZtr669L0wNr1c95K"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-gradient-to-r from-heritage-orange to-heritage-red hover:from-amber-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/10 transition-all uppercase tracking-widest text-xxs flex items-center justify-center gap-2 border border-orange-500/20"
            >
              <Navigation className="w-3.5 h-3.5 fill-current" />
              <span>Launch Live Google Maps Navigation (Balotra)</span>
            </a>
            
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 text-center font-sans">
              <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Dhaba has dedicated secure parking with washrooms, charging docks & kids area.</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
