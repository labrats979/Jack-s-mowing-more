import React from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Sparkles, MessageSquare, Flame } from 'lucide-react';

interface HeroProps {
  onGoToEstimator: () => void;
  onExploreServices: () => void;
  coverPhoto?: string;
}

export default function Hero({ onGoToEstimator, onExploreServices, coverPhoto }: HeroProps) {
  const bgImg = coverPhoto || "/src/assets/images/landscape_hero_1779327295782.png";
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-950 mt-20 pt-10">
      {/* Background Image: High-end custom landscaping Golden Hour */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgImg}
          alt="Jack's Mowing & More premium landscape design"
          className="w-full h-full object-cover scale-102 filter brightness-[0.4] contrast-[1.05]"
          referrerPolicy="no-referrer"
        />
        {/* Deep, rich overlays to match high-end cinematic site cleanups */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/80" />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* Grid Overlay decoration */}
      <div className="absolute inset-0 z-0 grid-dots opacity-20 pointer-events-none" />

      {/* Main Content Container (Fully Centered as seen in the custom layout mockup) */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white flex flex-col justify-center items-center py-20 min-h-[calc(100vh-80px)]">
        
        {/* Big Bold Elegant Heading - Serif & Slab Aesthetic */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-wide uppercase leading-[1.1] max-w-4xl mb-12 sm:mb-14"
        >
          At Jack’s Mowing and More, we provide dependable lawn care and landscaping services that make your property stand out
        </motion.h1>

         {/* Centered Buttons Side-by-Side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none"
        >
          <button
            onClick={onGoToEstimator}
            className="w-full sm:w-auto min-w-[200px] px-8 py-4 rounded-md bg-black hover:bg-zinc-900 text-white border border-black font-display font-extrabold text-xs tracking-wider uppercase transition-all duration-200 active:scale-95 shadow-lg cursor-pointer"
          >
            Calculate Your Rate
          </button>
          
          <button
            onClick={onExploreServices}
            className="w-full sm:w-auto min-w-[200px] px-8 py-4 rounded-md bg-white hover:bg-stone-100 text-stone-900 border border-stone-200 font-display font-bold text-xs tracking-wider uppercase transition-all duration-200 active:scale-95 shadow-lg cursor-pointer"
          >
            Our Services
          </button>
        </motion.div>

        {/* Quick scroll chevron */}
        <button
          onClick={onExploreServices}
          className="absolute bottom-6 flex flex-col items-center gap-1 text-stone-500 hover:text-emerald-400 transition"
          aria-label="Scroll to services"
        >
          <span className="text-[9px] font-mono tracking-widest uppercase">Explore Services</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </button>

      </div>
    </section>
  );
}
