import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

export default function ProjectPortfolio() {
  // Before / After Slider state
  const [sliderPos, setSliderPos] = useState<number>(45); // percentage (0 - 100)
  const sliderContainer = useRef<HTMLDivElement>(null);
  const [isSliding, setIsSliding] = useState(false);

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

  return (
    <section id="portfolio" className="py-16 bg-white border-b border-stone-100 text-stone-800 relative grid-dots overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-stone-900 tracking-tight uppercase mb-2">
            Interactive Before And After!
          </h2>
          <span className="text-stone-500 font-mono text-[11px] uppercase tracking-wider font-bold">
            (Interaction cost estimated)
          </span>
        </div>

        {/* Visual Slider Showcase container */}
        <div className="bg-stone-50 rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm flex flex-col items-center gap-6">
          
          <div className="w-full">
            <div
              ref={sliderContainer}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onMouseDown={() => setIsSliding(true)}
              onMouseUp={() => setIsSliding(false)}
              onMouseLeave={() => setIsSliding(false)}
              className="relative h-[300px] sm:h-[450px] w-full rounded-2xl overflow-hidden shadow-xl select-none touch-none cursor-ew-resize border border-stone-200"
            >
              {/* BEFORE IMAGE (Grayscale, dusty filter / Left background) */}
              <img
                src="/src/assets/images/garden_beds_1779327341663.png"
                alt="Before landscaping treatment simulation"
                className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 sepia brightness-[0.70] blur-[1px] pointer-events-none"
                referrerPolicy="no-referrer"
              />
              <div 
                className="absolute left-4 bottom-4 bg-black/75 backdrop-blur-sm text-[10px] font-mono tracking-widest text-stone-300 px-3 py-1 rounded-md uppercase font-semibold whitespace-nowrap z-10 transition-opacity duration-150"
                style={{ opacity: sliderPos < 10 ? 0 : 1 }}
              >
                Dry Weedy Clay Lot (Before)
              </div>

              {/* AFTER IMAGE (glorious finished lawn / Right overlay) */}
              <img
                src="/src/assets/images/garden_beds_1779327341663.png"
                alt="Finished architectural perennial garden bed"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                style={{
                  maskImage: `linear-gradient(to right, transparent calc(${sliderPos}% - 46px), black calc(${sliderPos}% + 46px))`,
                  WebkitMaskImage: `linear-gradient(to right, transparent calc(${sliderPos}% - 46px), black calc(${sliderPos}% + 46px))`,
                }}
                referrerPolicy="no-referrer"
              />
              <div 
                className="absolute right-4 bottom-4 bg-black/60 backdrop-blur-sm text-[10px] font-mono tracking-widest text-emerald-400 px-3 py-1 rounded-md uppercase font-semibold z-10 transition-opacity duration-150"
                style={{ opacity: sliderPos > 90 ? 0 : 1 }}
              >
                Lined Botanical Walkway (After)
              </div>

              {/* Slider Control Line Divider */}
              <div
                className="absolute inset-y-0 w-1 bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xl flex items-center justify-center cursor-pointer z-10"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="w-8 h-8 rounded-full bg-white text-emerald-700 shadow-xl border border-emerald-300 flex items-center justify-center font-bold text-xs select-none">
                  ↔
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
