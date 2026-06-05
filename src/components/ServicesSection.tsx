import React from 'react';
import { Service } from '../types';

interface ServicesSectionProps {
  services: Service[];
  onSelectServicePage: (serviceId: string) => void;
}

const DEFAULT_SERVICE_IMAGES: Record<string, string> = {
  'service-l-mowing': '/src/assets/images/lawn_mowing_after_1779586183040.png',
  'service-l-cleanup': 'https://images.unsplash.com/photo-1534710951274-1851d3061271?auto=format&fit=crop&q=80&w=800',
  'service-l-landscape': 'https://images.unsplash.com/photo-1558904541-efa8c1a68fa6?auto=format&fit=crop&q=80&w=800',
  'service-l-hedge': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800',
  'service-l-mulch': 'https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&q=80&w=800',
  'service-l-weed': 'https://images.unsplash.com/photo-1507036066871-b708937449ab?auto=format&fit=crop&q=80&w=800',
  'service-l-fertilizer': 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&q=80&w=800',
  'service-l-restoration': 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&q=80&w=800'
};

export default function ServicesSection({ services, onSelectServicePage }: ServicesSectionProps) {
  const [serviceImages, setServiceImages] = React.useState<Record<string, string>>(DEFAULT_SERVICE_IMAGES);

  React.useEffect(() => {
    fetch('/api/service-card-images')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load card images');
        return res.json();
      })
      .then(data => {
        if (data && typeof data === 'object') {
          setServiceImages(prev => ({
            ...prev,
            ...data
          }));
        }
      })
      .catch(err => {
        console.warn('Could not retrieve custom service card images, using defaults:', err);
      });
  }, []);

  return (
    <section id="services" className="py-24 bg-white text-stone-800 border-b border-stone-100 relative">
      <div className="absolute inset-0 bg-stone-50 pointer-events-none opacity-20 grid-dots" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-stone-500 font-mono text-xs font-bold uppercase tracking-[0.2em] block mb-3">
            Expert Craftsmanship
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-stone-900 tracking-tight leading-none uppercase mb-4">
            Professional Services Offered
          </h2>
          <div className="w-16 h-1.5 bg-stone-900 mx-auto rounded mb-5" />
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
                className="bg-stone-50 border border-stone-200/60 rounded-xl p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-stone-300 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Category description tag */}
                  <p className="text-[10px] font-mono uppercase text-stone-500 tracking-widest font-bold mb-2">
                    {svc.category}
                  </p>

                  {/* Service Title */}
                  <h3 className="font-display font-bold text-lg text-stone-900 tracking-tight group-hover:text-stone-950 transition-colors mb-3">
                    {svc.title}
                  </h3>

                  {/* Dynamic Pictures added under the title of the service */}
                  {serviceImages[svc.id] && (
                    <div className="mb-4 rounded-lg overflow-hidden border border-stone-200 aspect-video w-full shadow-3xs">
                      <img 
                        src={serviceImages[svc.id]} 
                        alt={svc.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Core description text */}
                  <p className="text-stone-605 text-xs font-light leading-relaxed mb-4">
                    {svc.description}
                  </p>
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
