import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, X, Sparkles, Image as ImageIcon, MapPin } from 'lucide-react';

interface FullPortfolioPageProps {
  portfolioPhotos: any[];
  onBack: () => void;
}

export default function FullPortfolioPage({ portfolioPhotos = [], onBack }: FullPortfolioPageProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  // Fallback defaults if the admin hasn't fully set all 15 frames
  const defaultImages = [
    "/src/assets/images/garden_beds_1779327341663.png",
    "/src/assets/images/hardscape_patio_1779327358083.png",
    "/src/assets/images/water_feature_1779327375070.png"
  ];

  const photos = Array.from({ length: 15 }).map((_, index) => {
    const photoId = `frame-${index + 1}`;
    const saved = portfolioPhotos.find(p => p.id === photoId);
    return {
      id: photoId,
      title: saved?.title || `Premium Project Treatment #${index + 1}`,
      description: saved?.description || "Architectural yard cleanup and custom lawn restoration service.",
      image: saved?.image || defaultImages[index % defaultImages.length]
    };
  });

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null) {
      setActivePhotoIndex((activePhotoIndex - 1 + 15) % 15);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null) {
      setActivePhotoIndex((activePhotoIndex + 1) % 15);
    }
  };

  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const opacity = Math.max(0, 1 - scrollY / 250);
  const translateY = -Math.min(40, scrollY / 6);
  const pointerEvents = opacity < 0.1 ? 'none' : 'auto';

  return (
    <div className="min-h-screen bg-stone-50 pb-20 animate-fade-in text-stone-850">
      
      {/* Top Gallery Header Banner */}
      <div 
        className="bg-white border-b border-stone-200/80 py-8 px-6 sticky top-20 z-40 transition-all duration-75 ease-out"
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          pointerEvents: pointerEvents as any
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-left">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-stone-500 hover:text-emerald-700 font-mono text-[10px] uppercase font-bold tracking-wider mb-2 transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </button>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-900 uppercase tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-650" />
              Our Custom Portfolio
            </h1>
            <p className="text-stone-500 text-xs font-light mt-1 max-w-xl leading-relaxed">
              Browse through our recent professional lawn care, architectural landscaping, and custom masonry transformations. Each frame is dynamic and customizable in the administration control panel.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
              15 Completed Showcases
            </span>
            <span className="text-[10px] font-mono bg-stone-100 text-stone-600 border border-stone-200 px-3 py-1.5 rounded-full uppercase tracking-wider">
              Milltown, NJ
            </span>
          </div>
        </div>
      </div>

      {/* Gallery Frame Grid */}
      <div className="max-w-6xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => setActivePhotoIndex(index)}
              className="group bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:border-emerald-500/20 transition-all duration-300 cursor-pointer flex flex-col text-left"
            >
              {/* Image Frame Wrapper */}
              <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                <img
                  src={photo.image}
                  alt={photo.title}
                  className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Frame Badge Overlay */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-[9px] font-mono font-bold text-white px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Frame {index + 1}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4">
                  <span className="text-white text-[10px] font-mono uppercase font-bold tracking-widest bg-emerald-700 px-2.5 py-1 rounded-md shadow-sm">
                    View Close-Up
                  </span>
                </div>
              </div>

              {/* Text Frame Wrapper */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-stone-900 text-sm tracking-tight uppercase leading-snug group-hover:text-emerald-700 transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-stone-500 text-xs font-light leading-relaxed line-clamp-2">
                    {photo.description}
                  </p>
                </div>
                
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-mono">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-300" />
                    <span>Milltown Treatment Area</span>
                  </div>
                  <span className="text-emerald-700 font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                    GALLERY ➔
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STUNNING INTERACTIVE LIGHTBOX MODAL */}
      {activePhotoIndex !== null && (
        <div
          className="fixed inset-0 z-100 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in text-white select-none"
          onClick={() => setActivePhotoIndex(null)}
        >
          {/* Close trigger button */}
          <button
            onClick={() => setActivePhotoIndex(null)}
            className="absolute top-6 right-6 p-2 bg-stone-900/80 hover:bg-red-950/80 hover:text-red-400 border border-stone-800 rounded-full text-stone-300 transition-colors cursor-pointer"
            title="Close Gallery"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Previous Slider trigger */}
          <button
            onClick={handlePrev}
            className="absolute left-4 p-3 bg-stone-900/60 hover:bg-emerald-800 border border-stone-800 rounded-full text-white transition-colors cursor-pointer z-10"
            title="Previous Frame"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Slider trigger */}
          <button
            onClick={handleNext}
            className="absolute right-4 p-3 bg-stone-900/60 hover:bg-emerald-800 border border-stone-800 rounded-full text-white transition-colors cursor-pointer z-10"
            title="Next Frame"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Main Showcase block */}
          <div
            className="max-w-4xl w-full flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Visual Frame display */}
            <div className="relative bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl max-h-[70vh] flex items-center justify-center">
              <img
                src={photos[activePhotoIndex].image}
                alt={photos[activePhotoIndex].title}
                className="max-w-full max-h-[70vh] object-contain"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay banner */}
              <div className="absolute top-4 left-4 bg-black/75 border border-stone-800 text-stone-200 px-3 py-1 rounded text-[10px] font-mono uppercase font-bold tracking-widest">
                Slot {activePhotoIndex + 1} of 15
              </div>
            </div>

            {/* Sub text banner */}
            <div className="text-center space-y-1.5 max-w-2xl px-4">
              <h2 className="font-display font-black text-lg sm:text-xl text-emerald-400 uppercase tracking-tight">
                {photos[activePhotoIndex].title}
              </h2>
              <p className="text-stone-300 text-xs font-light leading-relaxed">
                {photos[activePhotoIndex].description}
              </p>
              <div className="pt-2 text-[9px] font-mono text-stone-500 uppercase tracking-widest">
                JACK’S PREMIUM GARDENING &amp; LANDSCAPE RESTORATION
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
