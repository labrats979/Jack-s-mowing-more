import React from 'react';
import { Shovel, Hammer, Droplets, Sun, Sparkles, TreePine, Check } from 'lucide-react';
import { Service } from '../types';

interface ServicesSectionProps {
  services: Service[];
  onSelectServicePage: (serviceId: string) => void;
}

export default function ServicesSection({ services, onSelectServicePage }: ServicesSectionProps) {
  
  // Icon selector map
  const getIcon = (name: string) => {
    switch (name) {
      case 'shovel':
        return <Shovel className="w-5 h-5 text-emerald-700" />;
      case 'hammer':
        return <Hammer className="w-5 h-5 text-emerald-700" />;
      case 'droplet':
        return <Droplets className="w-5 h-5 text-emerald-700" />;
      case 'sun':
        return <Sun className="w-5 h-5 text-emerald-700" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-emerald-700" />;
      case 'tree':
      default:
        return <TreePine className="w-5 h-5 text-emerald-700" />;
    }
  };

  return (
    <section id="services" className="py-24 bg-white text-stone-800 border-b border-stone-100 relative">
      <div className="absolute inset-0 bg-stone-50 pointer-events-none opacity-20 grid-dots" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-emerald-700 font-mono text-xs font-bold uppercase tracking-[0.2em] block mb-3">
            Expert Craftsmanship
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-stone-900 tracking-tight leading-none uppercase mb-4">
            Professional Services Offered
          </h2>
          <div className="w-16 h-1.5 bg-emerald-600 mx-auto rounded mb-5" />
          <p className="text-stone-600 font-light text-sm sm:text-base leading-relaxed">
            From specialized site grading and stone masonry to clean lawn cutting, lawn recovery, and custom landscaping, we care for Jack's premium residential systems.
          </p>
        </div>

        {/* Dynamic Services Grid */}
        {services.length === 0 ? (
          <div className="text-center py-12 bg-stone-50 border border-stone-200 border-dashed rounded-2xl max-w-md mx-auto">
            <p className="text-stone-500 font-mono text-sm">No services configured at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="bg-stone-50 border border-stone-200/60 rounded-xl p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-emerald-200/80 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Icon & Category Header */}
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="p-3 bg-white border border-stone-200 rounded-lg group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors duration-150">
                      {getIcon(svc.iconName)}
                    </div>
                  </div>

                  {/* Service Title */}
                  <h3 className="font-display font-bold text-lg text-stone-900 tracking-tight group-hover:text-emerald-750 transition-colors mb-2">
                    {svc.title}
                  </h3>

                  {/* Category description tag */}
                  <p className="text-[10px] font-mono uppercase text-emerald-700 tracking-widest font-bold mb-3">
                    {svc.category}
                  </p>

                  {/* Core description text */}
                  <p className="text-stone-605 text-xs font-light leading-relaxed mb-6">
                    {svc.description}
                  </p>

                  {/* Features Bullet List */}
                  {svc.features && svc.features.length > 0 && (
                    <div className="space-y-2 mb-6 border-t border-stone-200 pt-4">
                      {svc.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                          <span className="text-stone-600 font-light leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* View details page */}
                <button
                  onClick={() => onSelectServicePage(svc.id)}
                  className="w-full mt-2 py-2.5 rounded-lg bg-black text-white hover:bg-stone-900 font-display font-bold text-[10px] uppercase tracking-wider transition-all duration-150 text-center active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Explore Before & After
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
