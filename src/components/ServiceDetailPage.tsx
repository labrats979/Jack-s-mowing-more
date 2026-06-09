import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, Check, Sparkles, Sliders, Play, Move, BadgePercent, Image as ImageIcon } from 'lucide-react';
import { Service } from '../types';

interface ServiceDetailPageProps {
  serviceId: string;
  services: Service[];
  onBack: () => void;
  onAddServiceToQuote: (serviceId: string) => void;
  isAlreadyInQuote: boolean;
}

// Map service IDs to detailed before and after photos and content
const SERVICE_VISUALS: Record<string, {
  beforeImg: string;
  afterImg: string;
  beforeDesc: string;
  afterDesc: string;
  timeline: string;
  guarantee: string;
  faqs: { q: string; a: string }[];
}> = {
  'service-l-mowing': {
    beforeImg: '/src/assets/images/lawn_mowing_before_1779586168566.png',
    afterImg: '/src/assets/images/lawn_mowing_after_1779586183040.png',
    beforeDesc: 'Overgrown, un-mowed residential grass lawn needing precision deck cut and formal line trimming around the garden borders.',
    afterDesc: 'Lawn manicured precisely with professional diagonal striping geometry, clear line-trimming, and fully blown clean perimeter paths.',
    timeline: '1 - 2 Hours per visit',
    guarantee: '100% Stripe Guarantee: If the cut geometry isn\'t clean, we will cut it again for free within 24 hours.',
    faqs: [
      { q: 'How often do you mow?', a: 'We offer weekly or bi-weekly mowing service options. Weekly cuts keep grass thick and help suppress weeds naturally.' },
      { q: 'Is string trimming and cleanup included?', a: 'Yes! Every single mowing visit includes line-trimming around all perimeters, concrete edge-shaping, and grass blowing from walkways, stairs, and parking patios.' }
    ]
  },
  'service-l-cleanup': {
    beforeImg: 'https://images.unsplash.com/photo-1508781197106-d8c535dcf276?auto=format&fit=crop&q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1534710951274-1851d3061271?auto=format&fit=crop&q=80&w=800',
    beforeDesc: 'Dense leaf pile-up blocking soil sunlight, inviting root dampness, and clogging residential entrance channels.',
    afterDesc: 'Perfect, debris-free turf and cleared garden beds. All leaves vacuum-collected and processed into high-grade compost.',
    timeline: '3 - 6 Hours depending on volume',
    guarantee: 'Completely leaf-free turf guarantee upon completion.',
    faqs: [
      { q: 'What do you do with the collected leaves?', a: 'We collect and process them using eco-safe vacuum shredded techniques to convert them to organic soil nutrients off-site.' },
      { q: 'Can you blow out roof gutters during cleanup?', a: 'Yes, we are fully equipped to perform gutter leaf extraction as part of our seasonal packages.' }
    ]
  },
  'service-l-landscape': {
    beforeImg: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1558904541-efa8c1a68fa6?auto=format&fit=crop&q=80&w=800',
    beforeDesc: 'Amorphous clay slope with dry soil weeds, old rotten wood borders, and zero ornamental definition.',
    afterDesc: 'Premium curated garden bed structured by custom curved cedar boundaries, lush evergreens, organic weed barrier compost, and localized irrigation.',
    timeline: '3 - 5 Days turnkey design & install',
    guarantee: '1-Year specimen plant survival guarantee: We replace failed installations at zero price.',
    faqs: [
      { q: 'Do you create a visual drawing first?', a: 'Yes! We map out full custom scale graphics of bed boundaries, shrub heights, and seasonal bloom calendars for your review before digging.' },
      { q: 'Can we request specific specimen plant kinds?', a: 'Absolutely. We select plants based on your light preferences, light levels, and local ecological suitability to maximize survival.' }
    ]
  },
  'service-l-hedge': {
    beforeImg: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800',
    beforeDesc: 'Shaggy, uneven evergreen boxwoods protruding onto walkways and obstructing natural light.',
    afterDesc: 'Laser-sharp geometric hedging with clean corners, encouraging thick inner branch networks and crisp border symmetry.',
    timeline: '2 - 4 Hours precision pruning',
    guarantee: 'Perfect architectural geometry, shaped with professional laser guide-trimming.',
    faqs: [
      { q: 'When is the best season to shape hedges?', a: 'Late spring and mid-autumn represent optimal times when growth cycles are balanced to avoid cold-shock damage.' },
      { q: 'Do you dispose of all shrub shearings?', a: 'Yes, we fully rake layout margins and collect all organic branches and leaf shearings, leaving your walkways tidy.' }
    ]
  },
  'service-l-mulch': {
    beforeImg: 'https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?auto=format&fit=crop&q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&q=80&w=800',
    beforeDesc: 'Dry, cracking topsoil base with fading legacy wood fragments and persistent dandelion growth.',
    afterDesc: 'Immaculate 3-inch top coat of dark organic triple-shred cedar bark, insulating root systems and blocking weed seeds.',
    timeline: '4 - 8 Hours of hand-delivery',
    guarantee: 'Uniform 3-inch depth and hand-beveled edges on all garden-boundary margins.',
    faqs: [
      { q: 'Which mulch type is best for dog-friendly yards?', a: 'Organic hemlock or pine mulch is soft and totally free of industrial dyes, making it 100% pet-safe.' },
      { q: 'Does mulch really prevent weed growth?', a: 'Yes, a dense 3-inch application prevents solar rays from reaching weed seeds in the topsoil, suppressing up to 90% of wild growth naturally!' }
    ]
  },
  'service-l-weed': {
    beforeImg: 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?auto=format&fit=crop&q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1507036066871-b708937449ab?auto=format&fit=crop&q=80&w=800',
    beforeDesc: 'Aggressive root clover, dandelion, and crabgrass weeds dominating garden borders and paver joints.',
    afterDesc: 'Pristine, 100% root-pulled neat stone joint lines and bed bottoms treated with our pet-friendly pre-emergent root barrier.',
    timeline: '1 - 3 Hours of manual alignment',
    guarantee: 'Complete root extraction guarantee: If a weed sprouts back within 14 days, we pluck it for free.',
    faqs: [
      { q: 'Do you use noxious chemical sprays?', a: 'Never. We specialize in physical manual root extraction coupled with organic acid barriers that are safe for pets, children, and localized ecosystems.' },
      { q: 'How long does a weeding session remain effective?', a: 'By digging down to the taproot and spreading organic preventative layers, beds usually stay spotless for 6-8 weeks.' }
    ]
  },
  'service-l-fertilizer': {
    beforeImg: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&q=80&w=800',
    beforeDesc: 'Nutrient-starved, yellowish grass suffering from shallow roots and structural drought stress.',
    afterDesc: 'Vivid, thick forest-green lawn holding dense deep chlorophyll layers and strong, drought-resilient subterranean root blocks.',
    timeline: 'Seasonally timed program visits',
    guarantee: 'Deep, rich emerald color enhancement within 10 days of the slow-release feeding.',
    faqs: [
      { q: 'Will this make my grass grow uncontrollably fast?', a: 'We use slow-release nitrogen minerals that encourage strong roots first, meaning healthy grass and deep color without excessive blade length spikes.' },
      { q: 'Is the fertilizer safe for flower beds?', a: 'We apply custom-tailored mineral mixtures specifically designed for turf grasses, carefully avoiding ornamental flowers.' }
    ]
  },
  'service-l-restoration': {
    beforeImg: 'https://images.unsplash.com/photo-1533460004989-cef01064af7e?auto=format&fit=crop&q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&q=80&w=800',
    beforeDesc: 'Dry, highly compacted hard dirt patches with dead thatch layers and zero grass seed germination.',
    afterDesc: 'Aerated soil plugs with premium hybrid fescue turf seed, rich compost topseal, and flawless healthy recovery.',
    timeline: 'Complete multi-visit biological process',
    guarantee: 'Guaranteed seed germination coverage across bare clay and thatch patches.',
    faqs: [
      { q: 'How long does lawn recovery take?', a: 'Sprouts will rise within 10-14 days. Full lawn density and seamless integration with existing grass is reached within 5-6 weeks of regular watering.' },
      { q: 'What is soil aeration?', a: 'We use a core aerator to open tiny 2-3 inch deep plugs across the lawn. This relieves clay compaction and allows air, water, and seeds to reach the root zone instantly.' }
    ]
  }
};

export default function ServiceDetailPage({
  serviceId,
  services,
  onBack,
  onAddServiceToQuote,
  isAlreadyInQuote
}: ServiceDetailPageProps) {
  const currentService = services.find(s => s.id === serviceId);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);
  const [customVisuals, setCustomVisuals] = useState<Record<string, { beforeImg: string; afterImg: string; beforeDesc?: string; afterDesc?: string }>>({});

  useEffect(() => {
    const loadVisuals = () => {
      fetch('/api/visuals')
        .then(res => res.json())
        .then(data => {
          if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            setCustomVisuals(data);
          } else {
            setCustomVisuals({});
          }
        })
        .catch(err => {
          console.error("API failed to load visuals:", err);
          setCustomVisuals({});
        });
    };
    loadVisuals();
    window.addEventListener('storage', loadVisuals);
    return () => {
      window.removeEventListener('storage', loadVisuals);
    };
  }, []);

  useEffect(() => {
    // Reset positions and scrolls when swapping service pages
    window.scrollTo({ top: 0, behavior: 'instant' });
    setAddedAnimation(false);
  }, [serviceId]);

  if (!currentService) {
    return (
      <div className="py-24 text-center max-w-md mx-auto">
        <p className="text-zinc-500 font-mono">Service not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-stone-900 border text-xs text-stone-200 rounded-lg">
          Back to Home
        </button>
      </div>
    );
  }

  const baseVisual = SERVICE_VISUALS[serviceId] || {
    beforeImg: '',
    afterImg: '',
    beforeDesc: 'Standard overgrown landscape pre-treatment state.',
    afterDesc: 'Dramatically cleaned, trimmed, and landscaped after treatment.',
    timeline: '1-3 Hours',
    guarantee: 'Assured customer satisfaction with premium cleaning.',
    faqs: [
      { q: 'Do you charge extra for custom requests?', a: 'All listed property care items are offered and customized directly at no additional cost relative to online estimates.' }
    ]
  };

  const customVisual = customVisuals[serviceId] || {};
  const visualData = {
    ...baseVisual,
    beforeImg: customVisual.beforeImg || baseVisual.beforeImg,
    afterImg: customVisual.afterImg || baseVisual.afterImg,
    beforeDesc: customVisual.beforeDesc || baseVisual.beforeDesc,
    afterDesc: customVisual.afterDesc || baseVisual.afterDesc,
  };

  const handleAddClick = () => {
    onAddServiceToQuote(serviceId);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2500);
  };

  // Scroll to cost estimator on home page
  const handleScrollToEstimator = () => {
    onBack();
    setTimeout(() => {
      const estimatorElement = document.getElementById('estimator');
      if (estimatorElement) {
        estimatorElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-white text-stone-850 py-12 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-605 hover:text-emerald-700 hover:border-emerald-250 transition-all text-xs font-mono tracking-tight cursor-pointer font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home Page
          </button>
        </div>

        {/* Success Addition Toast */}
        <AnimatePresence>
          {isAlreadyInQuote && (
            <motion.div
              initial={{ opacity: 0, y: -25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -25, scale: 0.95 }}
              className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium shadow-sm"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <p>
                  <strong>Added to Quote Checklist:</strong> This service has been added to your package! Go to the estimator to configure details.
                </p>
              </div>
              <button
                onClick={handleScrollToEstimator}
                className="px-4 py-2 bg-black hover:bg-stone-900 text-white font-mono font-bold uppercase rounded-lg tracking-wider whitespace-nowrap active:scale-95 transition-all text-[10px] cursor-pointer"
              >
                Go To Estimator
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Service Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: Before & After Visual Slider comparison */}
          <div className="lg:col-span-7 space-y-6">
            <div className="max-w-xl">
              <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-bold bg-emerald-50 px-3 py-1 border border-emerald-200 rounded-full">
                Interactive Transformation Simulator
              </span>
              <h3 className="font-display font-bold text-2xl text-stone-900 tracking-tight mt-4 mb-2 uppercase">
                Before & After Comparison
              </h3>
              <p className="text-stone-600 text-xs font-light leading-relaxed">
                Drag the slider handle sideways to watch the transformation from untouched state to Jackman precision cleanup.
              </p>
            </div>

            {/* Visual comparison container */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 select-none shadow-md">
              
              {/* Before state (Base image under After) */}
              {visualData.beforeImg ? (
                <img
                  src={visualData.beforeImg}
                  alt={`${currentService.title} Before State`}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="absolute inset-x-0 inset-y-0 bg-stone-100 flex flex-col items-center justify-center p-6 text-center">
                  <div className="bg-white/85 p-5 rounded-2xl border border-stone-250 backdrop-blur-xs flex flex-col items-center justify-center shadow-3xs">
                    <ImageIcon className="w-8 h-8 text-stone-400 mb-1.5" />
                    <span className="text-xs font-mono text-stone-700 font-bold uppercase tracking-wider">Before Photo Pending</span>
                    <p className="text-[10px] text-stone-550 font-light mt-1">Upload custom lawn care Before pictures in the Admin panel</p>
                  </div>
                </div>
              )}
              <div 
                className="absolute left-4 top-4 bg-stone-900/95 border border-stone-700 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono font-bold text-stone-300 tracking-wider z-10 whitespace-nowrap transition-opacity duration-150"
                style={{ opacity: sliderPos < 10 ? 0 : 1 }}
              >
                Untreated State
              </div>

              {/* After state (Overlaid image with soft webkit-mask/mask linear gradient) */}
              {visualData.afterImg ? (
                <img
                  src={visualData.afterImg}
                  alt={`${currentService.title} After State`}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{
                    maskImage: `linear-gradient(to right, transparent calc(${sliderPos}% - 40px), black calc(${sliderPos}% + 40px))`,
                    WebkitMaskImage: `linear-gradient(to right, transparent calc(${sliderPos}% - 40px), black calc(${sliderPos}% + 40px))`,
                  }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div 
                  className="absolute inset-x-0 inset-y-0 bg-emerald-50/15 flex flex-col items-center justify-center p-6 text-center"
                  style={{
                    maskImage: `linear-gradient(to right, transparent calc(${sliderPos}% - 40px), black calc(${sliderPos}% + 40px))`,
                    WebkitMaskImage: `linear-gradient(to right, transparent calc(${sliderPos}% - 40px), black calc(${sliderPos}% + 40px))`,
                  }}
                >
                  <div className="bg-white/90 p-5 rounded-2xl border border-emerald-100 backdrop-blur-xs flex flex-col items-center justify-center shadow-3xs">
                    <ImageIcon className="w-8 h-8 text-emerald-600/75 mb-1.5" />
                    <span className="text-xs font-mono text-emerald-800 font-bold uppercase tracking-wider">After Photo Pending</span>
                    <p className="text-[10px] text-stone-605 font-light mt-1">Upload custom after landscaping pictures in the Admin panel</p>
                  </div>
                </div>
              )}
              <div 
                className="absolute right-4 top-4 bg-emerald-700 border border-emerald-600 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono font-bold text-white tracking-wider whitespace-nowrap z-10 transition-opacity duration-150"
                style={{ opacity: sliderPos > 90 ? 0 : 1 }}
              >
                Jack's Finished Quality
              </div>

              {/* Range Input Overlay */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              />

              {/* Vertical Slider Bar Indicator */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-emerald-600 pointer-events-none shadow-sm z-10"
                style={{ left: `${sliderPos}%` }}
              >
                {/* Visual drag grip ball */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-2 border-emerald-600 text-emerald-600 flex items-center justify-center shadow-md pointer-events-none">
                  <Move className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>

            {/* Slider Text Explanations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-xs space-y-1 bg-white p-3.5 rounded-xl border border-stone-150">
                <span className="font-mono text-[9px] uppercase tracking-widest text-stone-500 font-bold block mb-1">Untreated Base (Left)</span>
                <p className="text-stone-600 leading-relaxed font-light">{visualData.beforeDesc}</p>
              </div>
              <div className="text-xs space-y-1 bg-emerald-50 p-3.5 rounded-xl border border-emerald-250">
                <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-700 font-bold block mb-1">After Alignment (Right)</span>
                <p className="text-emerald-850 leading-relaxed font-light">{visualData.afterDesc}</p>
              </div>
            </div>

          </div>

          {/* RIGHT: High-End Service Profile Description & Quote triggers */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3.5 border-b border-stone-200 pb-6">
              <span className="text-emerald-700 font-mono text-[11px] font-bold uppercase tracking-wider block">
                {currentService.category}
              </span>
              <h1 className="font-display font-black text-3xl sm:text-4xl text-stone-900 tracking-tight leading-none uppercase">
                {currentService.title}
              </h1>
              
              <div className="flex flex-wrap gap-2.5 pt-2">
                <span className="px-3 py-1 bg-stone-50 border border-stone-200 text-stone-705 text-[10px] font-mono tracking-wider rounded-lg font-bold">
                  Timeline: {visualData.timeline}
                </span>
              </div>
            </div>

            {/* Core copy */}
            <div className="space-y-4">
              <h4 className="font-display font-bold text-stone-800 text-sm uppercase tracking-wider">Project Profile Description</h4>
              <p className="text-stone-605 text-xs sm:text-sm font-light leading-relaxed">
                {currentService.description}
              </p>
            </div>

            {/* Highlights bullets */}
            <div className="space-y-4 rounded-2xl bg-stone-50 p-6 border border-stone-200">
              <h5 className="font-display font-bold text-stone-800 text-xs uppercase tracking-wider">Features & Delivery Integrity</h5>
              <div className="space-y-3">
                {currentService.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-3.5 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
                    <div>
                      <span className="text-stone-700 font-medium leading-relaxed">{feat}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Action Panel: Add to quote */}
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 space-y-5">
              <div className="space-y-1">
                <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-800 block font-bold">Estimate Builder</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-display font-black text-stone-900">Included Service Option</span>
                </div>
                <p className="text-stone-600 text-[10px] leading-relaxed font-light">
                  This companion service is bundled directly into your estimate proposal. Add it below to include it in the package calculation.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAddClick}
                  className={`w-full py-4 rounded-xl font-display font-semibold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                    isAlreadyInQuote 
                      ? 'bg-stone-100 text-stone-500 border border-stone-250'
                      : 'bg-black hover:bg-stone-900 text-white border border-black'
                  }`}
                >
                  {isAlreadyInQuote ? (
                    <>
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-700" />
                      Added to Estimator
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4.5 h-4.5 text-emerald-305" />
                      Add to Estimator Package
                    </>
                  )}
                </button>

                {isAlreadyInQuote && (
                  <button
                    onClick={handleScrollToEstimator}
                    className="w-full py-3.5 rounded-xl border border-stone-250 hover:bg-stone-50 text-stone-705 font-mono text-[10px] uppercase tracking-widest text-center transition-all cursor-pointer font-bold"
                  >
                    Configure Custom Estimate Dashboard
                  </button>
                )}
              </div>
            </div>

            {/* Guarantee Highlight */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-[10px] text-stone-600 flex items-start gap-3">
              <Sparkles className="w-4.5 h-4.5 text-emerald-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Jack\'s Guarantee:</strong> {visualData.guarantee}
              </p>
            </div>

          </div>

        </div>

        {/* FAQs Section */}
        <div className="mt-20 border-t border-stone-150 pt-16 max-w-3xl">
          <h4 className="font-display font-black text-xl text-stone-950 uppercase tracking-tight mb-8">
            Frequently Asked Questions regarding {currentService.title}
          </h4>
          <div className="space-y-8">
            {visualData.faqs.map((faq, i) => (
              <div key={i} className="space-y-2 bg-stone-50 p-5 rounded-xl border border-stone-200">
                <h5 className="font-display font-bold text-sm text-stone-900">
                  {faq.q}
                </h5>
                <p className="text-stone-605 text-xs font-light leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
