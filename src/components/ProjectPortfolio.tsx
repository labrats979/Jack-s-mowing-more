import React, { useState, useRef, useEffect } from 'react';
import { Info, Sparkles, Image as ImageIcon, ArrowRight, MapPin } from 'lucide-react';

interface ProjectPortfolioProps {
  portfolioPhotos?: any[];
  onSeeMore?: () => void;
  siteTexts?: any;
}

export default function ProjectPortfolio({ portfolioPhotos = [], onSeeMore, siteTexts }: ProjectPortfolioProps) {
  // Before / After Slider state
  const [sliderPos, setSliderPos] = useState<number>(45); // percentage (0 - 100)
  const sliderContainer = useRef<HTMLDivElement>(null);
  const [isSliding, setIsSliding] = useState(false);

  // Dynamic slider config
  const [sliderConfig, setSliderConfig] = useState({
    beforeImg: "/src/assets/images/garden_beds_1779327341663.png",
    beforeLabel: "Dry Weedy Clay Lot (Before)",
    afterImg: "/src/assets/images/garden_beds_1779327341663.png",
    afterLabel: "Lined Botanical Walkway (After)"
  });

  // Fetch updated slider values on mount
  useEffect(() => {
    fetch('/api/portfolio-slider')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load portfolio slider');
        return res.json();
      })
      .then(data => {
        if (data.beforeImg || data.afterImg) {
          setSliderConfig({
            beforeImg: data.beforeImg || "/src/assets/images/garden_beds_1779327341663.png",
            beforeLabel: data.beforeLabel || "Dry Weedy Clay Lot (Before)",
            afterImg: data.afterImg || "/src/assets/images/garden_beds_1779327341663.png",
            afterLabel: data.afterLabel || "Lined Botanical Walkway (After)"
          });
        }
      })
      .catch(err => {
        console.warn('Could not retrieve custom portfolio slider config, using default:', err);
      });
  }, []);

  const handleSlideMove = (clientX: number) => {
    if (!sliderContainer.current) return;
    const rect = sliderContainer.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleSlideMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1 || isSliding) {
      handleSlideMove(e.clientX);
    }
  };

  // Auto-slide a bit on load to show interactivity
  useEffect(() => {
    const interval = setTimeout(() => {
      if (!isSliding) {
        setSliderPos(50);
      }
    }, 1500);
    return () => clearTimeout(interval);
  }, [isSliding]);

  // Fallback defaults for home showcase
  const defaultImages = [
    "/src/assets/images/garden_beds_1779327341663.png",
    "/src/assets/images/hardscape_patio_1779327358083.png",
    "/src/assets/images/water_feature_1779327375070.png",
    "/src/assets/images/landscape_hero_1779327295782.png"
  ];

  const firstFourPhotos = Array.from({ length: 4 }).map((_, index) => {
    const photoId = `frame-${index + 1}`;
    const saved = portfolioPhotos.find(p => p.id === photoId);
    return {
      id: photoId,
      title: saved?.title || `Premium Project Treatment #${index + 1}`,
      description: saved?.description || "Yard cleanup and custom lawn restoration service.",
      image: saved?.image || defaultImages[index % defaultImages.length]
    };
  });

  return (
    <section id="portfolio" className="py-20 bg-stone-50 border-b border-stone-200 text-stone-800 relative grid-dots overflow-hidden scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-emerald-700 font-mono text-[10px] uppercase tracking-widest font-black bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
            {siteTexts?.portfolioBadge || "Completed Yard Masterpieces"}
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-stone-900 tracking-tight uppercase mt-3 mb-2">
            {siteTexts?.portfolioTitle || "Our Project Portfolio"}
          </h2>
          <p className="text-stone-500 text-xs font-light leading-relaxed">
            {siteTexts?.portfolioDescription || "Take a look at some of our recent professional designs. Each of these represents meticulous pruning, precise edging, and premium turf grooming."}
          </p>
        </div>

        {/* 4 Image Home Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 text-left">
          {firstFourPhotos.map((photo, index) => (
            <div 
              key={photo.id}
              onClick={onSeeMore}
              className="group bg-white border border-stone-200 rounded-xl overflow-hidden shadow-3xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                <img
                  src={photo.image}
                  alt={photo.title}
                  className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-[8px] font-mono font-bold text-white px-2 py-0.5 rounded uppercase tracking-wider">
                  Frame {index + 1}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-bold text-xs text-stone-900 uppercase tracking-tight line-clamp-1 group-hover:text-emerald-700 transition-colors">
                    {photo.title}
                  </h4>
                  <p className="text-stone-500 text-[11px] font-light mt-1 line-clamp-2 leading-normal">
                    {photo.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-100 text-[9px] font-mono text-emerald-750 font-bold uppercase tracking-wider">
                  Details ➔
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* See More Button */}
        <div className="flex justify-center mb-20">
          <button
            onClick={onSeeMore}
            className="group px-6 py-3 bg-black hover:bg-stone-900 border border-black text-white text-xs font-mono rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-xs"
          >
            See More Portfolio Items
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Separate interactive before/after block */}
        <div className="border-t border-stone-200/80 pt-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h3 className="font-display font-black text-xl sm:text-2xl text-stone-900 tracking-tight uppercase mb-1">
              {siteTexts?.beforeAfterTitle || "Interactive Before & After!"}
            </h3>
            <span className="text-stone-400 font-mono text-[10px] uppercase tracking-wider font-bold">
              {siteTexts?.beforeAfterSubtitle || "↔ Slide to reveal finished treatment precision ↔"}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-3xs flex flex-col items-center gap-6 max-w-4xl mx-auto">
            <div className="w-full">
              <div
                ref={sliderContainer}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                onMouseDown={() => setIsSliding(true)}
                onMouseUp={() => setIsSliding(false)}
                onMouseLeave={() => setIsSliding(false)}
                className="relative h-[280px] sm:h-[400px] w-full rounded-xl overflow-hidden shadow-lg select-none touch-none cursor-ew-resize border border-stone-200"
              >
                {/* BEFORE IMAGE (Grayscale, no sepia filter / Left background) */}
                <img
                  src={sliderConfig.beforeImg}
                  alt={sliderConfig.beforeLabel}
                  className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 brightness-[0.70] blur-[0.5px] pointer-events-none"
                  referrerPolicy="no-referrer"
                />
                <div 
                  className="absolute left-3 bottom-3 bg-black/75 backdrop-blur-sm text-[9px] font-mono tracking-widest text-stone-300 px-2.5 py-1 rounded uppercase font-semibold whitespace-nowrap z-10 transition-opacity duration-150"
                  style={{ opacity: sliderPos < 10 ? 0 : 1 }}
                >
                  {sliderConfig.beforeLabel}
                </div>

                {/* AFTER IMAGE (finished lawn / Right overlay) */}
                <img
                  src={sliderConfig.afterImg}
                  alt={sliderConfig.afterLabel}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{
                    maskImage: `linear-gradient(to right, transparent calc(${sliderPos}% - 46px), black calc(${sliderPos}% + 46px))`,
                    WebkitMaskImage: `linear-gradient(to right, transparent calc(${sliderPos}% - 46px), black calc(${sliderPos}% + 46px))`,
                  }}
                  referrerPolicy="no-referrer"
                />
                <div 
                  className="absolute right-3 bottom-3 bg-black/60 backdrop-blur-sm text-[9px] font-mono tracking-widest text-emerald-400 px-2.5 py-1 rounded uppercase font-semibold z-10 transition-opacity duration-150"
                  style={{ opacity: sliderPos > 90 ? 0 : 1 }}
                >
                  {sliderConfig.afterLabel}
                </div>

                {/* Slider Control Line Divider */}
                <div
                  className="absolute inset-y-0 w-1 bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xl flex items-center justify-center cursor-pointer z-10"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="w-7 h-7 rounded-full bg-white text-emerald-700 shadow-xl border border-emerald-300 flex items-center justify-center font-bold text-xs select-none">
                    ↔
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
