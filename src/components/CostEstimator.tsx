import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, Sliders, ArrowRight, HeartHandshake, Check, 
  Sparkles, Gift, Receipt, Info, Tag, TrendingDown, RefreshCw 
} from 'lucide-react';
import { Service } from '../types';

interface CostEstimatorProps {
  onApplyEstimate: (data: { serviceType: string; notes: string }) => void;
  services: Service[];
  selectedServiceIds: string[];
  onToggleServiceId: (serviceId: string) => void;
}

export default function CostEstimator({
  onApplyEstimate,
  services = [],
  selectedServiceIds = [],
  onToggleServiceId
}: CostEstimatorProps) {
  // Input parameters - 1500: Small, 3200: Medium, 5000: Large. Initialized to null to require selections.
  const [lawnSqFt, setLawnSqFt] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | null>(null);

  // Editable pricing model states
  const [showRateSettings, setShowRateSettings] = useState(false);
  const [rates, setRates] = useState(() => {
    const defaultRates = {
      smallMin: 25,
      smallMax: 35,
      smallBiweeklyMin: 32,
      smallBiweeklyMax: 44,
      mediumMin: 35,
      mediumMax: 45,
      mediumBiweeklyMin: 44,
      mediumBiweeklyMax: 56,
      largeMin: 45,
      largeBiweeklyMin: 56,
    };
    try {
      const saved = localStorage.getItem('jacks_calculator_rates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.smallMin === 20 || parsed.smallMin === 30 || !parsed.smallBiweeklyMin) {
          localStorage.removeItem('jacks_calculator_rates');
          return defaultRates;
        }
        return {
          ...defaultRates,
          ...parsed
        };
      }
    } catch (e) {
      console.error(e);
    }
    return defaultRates;
  });

  const handleUpdateRate = (key: string, value: number) => {
    setRates((prev: any) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem('jacks_calculator_rates', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Computed results state
  const [minEstimate, setMinEstimate] = useState<number>(rates.smallMin);
  const [maxEstimate, setMaxEstimate] = useState<number>(rates.smallMax);

  // Mapped category labels for the grey text area
  const getGreyLabel = (id: string, defaultCategory: string): string => {
    switch (id) {
      case 'service-l-cleanup':
        return 'Fall/Spring service';
      case 'service-l-landscape':
        return 'Flower Bed';
      case 'service-l-hedge':
        return 'Shrub & Hedge';
      case 'service-l-mulch':
        return 'Flower Bed Topping';
      case 'service-l-weed':
        return 'Weed control';
      case 'service-l-fertilizer':
        return 'Lawn Fertilizer';
      case 'service-l-restoration':
        return 'Lawn Rejuvenation';
      default:
        return defaultCategory;
    }
  };

  // Pricing math triggers on state changes
  useEffect(() => {
    if (lawnSqFt === null || frequency === null) {
      return;
    }

    // Base Mowing Rates depending on selected yard size and frequency:
    let baseMinMowing = rates.smallMin;
    let baseMaxMowing = rates.smallMax;

    if (lawnSqFt <= 2500) {
      if (frequency === 'weekly') {
        baseMinMowing = rates.smallMin;
        baseMaxMowing = rates.smallMax;
      } else {
        baseMinMowing = rates.smallBiweeklyMin;
        baseMaxMowing = rates.smallBiweeklyMax;
      }
    } else if (lawnSqFt <= 4000) {
      if (frequency === 'weekly') {
        baseMinMowing = rates.mediumMin;
        baseMaxMowing = rates.mediumMax;
      } else {
        baseMinMowing = rates.mediumBiweeklyMin;
        baseMaxMowing = rates.mediumBiweeklyMax;
      }
    } else {
      if (frequency === 'weekly') {
        baseMinMowing = rates.largeMin;
        baseMaxMowing = rates.largeMin;
      } else {
        baseMinMowing = rates.largeBiweeklyMin;
        baseMaxMowing = rates.largeBiweeklyMin;
      }
    }

    setMinEstimate(baseMinMowing);
    setMaxEstimate(baseMaxMowing);
  }, [lawnSqFt, frequency, rates]);

  // Filter out the base service 'Lawn Mowing' from optional companion add-ons in the selectable list
  const companionServicesList = services.filter((s) => s.id !== 'service-l-mowing');
  
  // Filter currently selected ones
  const selectedCompanions = companionServicesList.filter((s) => selectedServiceIds.includes(s.id));

  // Math totals for the receipt
  const baseMowingAvg = lawnSqFt 
    ? (frequency === 'weekly'
        ? (lawnSqFt <= 2500 ? (rates.smallMin + rates.smallMax) / 2 : lawnSqFt <= 4000 ? (rates.mediumMin + rates.mediumMax) / 2 : rates.largeMin)
        : (lawnSqFt <= 2500 ? (rates.smallBiweeklyMin + rates.smallBiweeklyMax) / 2 : lawnSqFt <= 4000 ? (rates.mediumBiweeklyMin + rates.mediumBiweeklyMax) / 2 : rates.largeBiweeklyMin)
      )
    : 0;

  const handleApplyToBooking = () => {
    if (lawnSqFt === null || frequency === null) return;
    const serviceType = 'Precision Lawn Mowing';
    const frequencyLabelText = frequency === 'weekly' ? 'cut per week' : 'cut every other week';
    const finalRateText = lawnSqFt === 5000 
      ? `$${minEstimate}+ / cut` 
      : `$${minEstimate} - $${maxEstimate} / cut`;
      
    const selectedServiceNames = selectedCompanions.map(s => s.title);

    const notesSummary = `Estimated online project parameters:
- Size Category: ${lawnSqFt === 1500 ? 'Small (2,500 sq. ft. & under)' : lawnSqFt === 3200 ? 'Medium (2,500 - 4,000 sq. ft.)' : 'Large (4,000+ sq. ft. & over)'}
- Selected Service Frequency: ${frequencyLabelText}
- Estimated Rate per Cut: ${finalRateText}
- Selected Custom Companion Services: ${selectedServiceNames.join(', ') || 'None'}`;

    onApplyEstimate({ serviceType, notes: notesSummary });

    // Scroll smoothly to contact form
    const bookingFormElement = document.getElementById('booking-form');
    if (bookingFormElement) {
      bookingFormElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const isReadyToCalculate = lawnSqFt !== null && frequency !== null;

  return (
    <section id="estimator" className="py-24 bg-white text-stone-850 border-b border-stone-100 relative overflow-hidden">
      {/* Visual ambient accents */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-50/70 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-10 bottom-0 w-80 h-80 bg-stone-50 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Module Title */}
        <div className="max-w-xl mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-stone-900 tracking-tight leading-tight mb-4 uppercase">
            Interactive Cost Estimator
          </h2>
          <p className="text-stone-605 font-light text-sm sm:text-base leading-relaxed">
            Get a free online estimate instantly with our free interactive cost estimator! Simply choose your lawn size and select your desired frequency and specifications below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Input Selection Slider Panel */}
          <div className="lg:col-span-7 bg-stone-50 p-6 sm:p-10 rounded-3xl border border-stone-200/85 space-y-8 shadow-xs">
            
            {/* Control Head */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-5 gap-2">
              <div className="flex items-center gap-3">
                <Sliders className="w-5 h-5 text-emerald-700 font-bold" />
                <h3 className="font-display font-bold text-sm sm:text-base text-stone-900 uppercase">Configure Your Estimate</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRateSettings(!showRateSettings)}
                className="text-[10px] sm:text-[11px] font-mono text-emerald-800 hover:text-emerald-950 border border-emerald-250 bg-emerald-50 hover:bg-emerald-100/60 px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider shadow-3xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${showRateSettings ? 'animate-spin' : ''}`} />
                {showRateSettings ? 'Close Rates setting' : 'Set Rates Model'}
              </button>
            </div>

            {/* Rate Settings Drawer */}
            <AnimatePresence>
              {showRateSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden border border-emerald-200/60 bg-emerald-50/20 p-5 rounded-2xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold text-emerald-900 uppercase tracking-wider">
                      Adjust Calculator Pricing Rates ($)
                    </h4>
                    <span className="text-[9px] font-mono text-stone-500 uppercase">Auto-Saves to Device</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Small Yard */}
                    <div className="space-y-1">
                      <span className="text-[9px] tracking-tight text-stone-600 block uppercase font-mono font-semibold">Small Wk Min</span>
                      <input
                        type="number"
                        value={rates.smallMin}
                        onChange={(e) => handleUpdateRate('smallMin', Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 bg-white border border-stone-250 rounded-lg text-stone-900 font-mono text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] tracking-tight text-stone-600 block uppercase font-mono font-semibold">Small Wk Max</span>
                      <input
                        type="number"
                        value={rates.smallMax}
                        onChange={(e) => handleUpdateRate('smallMax', Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 bg-white border border-stone-250 rounded-lg text-stone-900 font-mono text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] tracking-tight text-stone-600 block uppercase font-mono font-semibold">Small BiWk Min</span>
                      <input
                        type="number"
                        value={rates.smallBiweeklyMin}
                        onChange={(e) => handleUpdateRate('smallBiweeklyMin', Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 bg-white border border-stone-250 rounded-lg text-stone-900 font-mono text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] tracking-tight text-stone-600 block uppercase font-mono font-semibold">Small BiWk Max</span>
                      <input
                        type="number"
                        value={rates.smallBiweeklyMax}
                        onChange={(e) => handleUpdateRate('smallBiweeklyMax', Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 bg-white border border-stone-250 rounded-lg text-stone-900 font-mono text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                      />
                    </div>

                    {/* Medium Yard */}
                    <div className="space-y-1">
                      <span className="text-[9px] tracking-tight text-stone-600 block uppercase font-mono font-semibold">Medium Wk Min</span>
                      <input
                        type="number"
                        value={rates.mediumMin}
                        onChange={(e) => handleUpdateRate('mediumMin', Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 bg-white border border-stone-250 rounded-lg text-stone-900 font-mono text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] tracking-tight text-stone-600 block uppercase font-mono font-semibold">Medium Wk Max</span>
                      <input
                        type="number"
                        value={rates.mediumMax}
                        onChange={(e) => handleUpdateRate('mediumMax', Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 bg-white border border-stone-250 rounded-lg text-stone-900 font-mono text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] tracking-tight text-stone-600 block uppercase font-mono font-semibold">Med BiWk Min</span>
                      <input
                        type="number"
                        value={rates.mediumBiweeklyMin}
                        onChange={(e) => handleUpdateRate('mediumBiweeklyMin', Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 bg-white border border-stone-250 rounded-lg text-stone-900 font-mono text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] tracking-tight text-stone-600 block uppercase font-mono font-semibold">Med BiWk Max</span>
                      <input
                        type="number"
                        value={rates.mediumBiweeklyMax}
                        onChange={(e) => handleUpdateRate('mediumBiweeklyMax', Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 bg-white border border-stone-250 rounded-lg text-stone-900 font-mono text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                      />
                    </div>

                    {/* Large Yard */}
                    <div className="space-y-1">
                      <span className="text-[9px] tracking-tight text-stone-600 block uppercase font-mono font-semibold">Large Wk Min</span>
                      <input
                        type="number"
                        value={rates.largeMin}
                        onChange={(e) => handleUpdateRate('largeMin', Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 bg-white border border-stone-250 rounded-lg text-stone-900 font-mono text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] tracking-tight text-stone-600 block uppercase font-mono font-semibold">Large BiWk Min</span>
                      <input
                        type="number"
                        value={rates.largeBiweeklyMin}
                        onChange={(e) => handleUpdateRate('largeBiweeklyMin', Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 bg-white border border-stone-250 rounded-lg text-stone-900 font-mono text-xs focus:outline-none focus:border-emerald-650 shadow-3xs"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Area Covered Selection Boxes */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <label className="text-stone-605 font-bold text-xs font-mono uppercase tracking-wider">Estimated Project Area Covered</label>
                {lawnSqFt !== null && (
                  <span className="font-mono text-emerald-800 bg-emerald-50 border border-emerald-250 px-3 py-1 rounded text-xs font-bold uppercase tracking-wide">
                    {lawnSqFt === 1500 ? '2,500 sq. ft. & under' : lawnSqFt === 3200 ? '2,500 - 4,000 sq. ft.' : '4,000+ sq. ft. & over'}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'small', label: 'Small Yard', bottomLabel: '2,500 sq. ft. & under', sqFt: 1500 },
                  { id: 'medium', label: 'Medium Yard', bottomLabel: '2,500 - 4,000 sq. ft.', sqFt: 3200 },
                  { id: 'large', label: 'Large Yard', bottomLabel: '4,000+ sq. ft. & over', sqFt: 5000 }
                ].map((yard) => {
                  const isSelected = lawnSqFt === yard.sqFt;
                  return (
                    <button
                      key={yard.id}
                      type="button"
                      onClick={() => setLawnSqFt(yard.sqFt)}
                      className={`text-left p-4 rounded-xl border transition-all duration-255 cursor-pointer flex flex-col justify-between h-24 ${
                        isSelected
                          ? 'bg-white border-emerald-600 text-stone-950 ring-2 ring-emerald-600/10 shadow-sm'
                          : 'bg-white border-stone-200 hover:border-emerald-500/40 text-stone-500 hover:bg-stone-55 hover:text-stone-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-black tracking-tight ${isSelected ? 'text-emerald-750' : 'text-stone-700'}`}>
                            {yard.label}
                          </span>
                          {isSelected && (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-pulse" />
                          )}
                        </div>
                      </div>
                      <span className={`text-[11px] font-mono mt-2 block font-bold ${isSelected ? 'text-emerald-750' : 'text-stone-505'}`}>
                        {yard.bottomLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selection of Frequency of Cuts */}
            <div className="space-y-3 pt-6 border-t border-stone-200">
              <div className="flex justify-between items-center text-sm">
                <label className="text-stone-605 font-bold text-xs font-mono uppercase tracking-wider">
                  Selection of frequency of cuts
                </label>
                {frequency !== null && (
                  <span className="font-mono text-emerald-800 bg-emerald-50 border border-emerald-250 px-3 py-1 rounded text-xs font-bold uppercase tracking-wide">
                    {frequency === 'weekly' ? 'cut per week' : 'cut every other week'}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'weekly', label: 'Weekly', bottomLabel: 'cut per week' },
                  { id: 'biweekly', label: 'Bi-Weekly', bottomLabel: 'cut every other week' }
                ].map((item) => {
                  const isSelected = frequency === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFrequency(item.id as 'weekly' | 'biweekly')}
                      className={`text-left p-4 rounded-xl border transition-all duration-255 cursor-pointer flex flex-col justify-between h-24 ${
                        isSelected
                          ? 'bg-white border-emerald-600 text-stone-950 ring-2 ring-emerald-600/10 shadow-sm'
                          : 'bg-white border-stone-200 hover:border-emerald-500/40 text-stone-500 hover:bg-stone-55 hover:text-stone-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-black tracking-tight ${isSelected ? 'text-emerald-750' : 'text-stone-700'}`}>
                            {item.label}
                          </span>
                          {isSelected && (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-pulse" />
                          )}
                        </div>
                      </div>
                      <span className={`text-[11px] font-mono mt-2 block font-bold ${isSelected ? 'text-emerald-750' : 'text-stone-505'}`}>
                        {item.bottomLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Added Services Selection */}
            <div className="space-y-4 pt-6 border-t border-stone-200">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-stone-650 font-bold text-xs font-mono uppercase tracking-wider block">
                  Our service we offer:
                </label>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {companionServicesList.map((svc) => {
                  const isChecked = selectedServiceIds.includes(svc.id);
                  const greyLabel = getGreyLabel(svc.id, svc.category);
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => onToggleServiceId(svc.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[92px] relative overflow-hidden group/item ${
                        isChecked
                          ? 'bg-emerald-50/50 border-emerald-600 text-emerald-955 shadow-xs'
                          : 'bg-white border-stone-200 hover:border-emerald-550/30 text-stone-500 hover:bg-stone-55 hover:text-stone-800'
                      }`}
                    >
                      <div className="w-full">
                        <div className="flex items-start justify-between gap-2 w-full mb-1">
                          <span className={`text-xs font-black leading-tight ${isChecked ? 'text-emerald-850' : 'text-stone-800 group-hover/item:text-emerald-750'}`}>
                            {svc.title}
                          </span>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                            isChecked
                              ? 'bg-emerald-700 border-emerald-600 text-white'
                              : 'border-stone-300 bg-white group-hover/item:border-stone-400'
                          }`}>
                            {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>
                        <p className="text-[10px] leading-relaxed text-stone-600 font-light line-clamp-2">
                          {svc.description}
                        </p>
                      </div>
                      
                      {greyLabel && (
                        <div className="flex items-center justify-between w-full mt-2 pt-2 border-t border-stone-150 text-[9px] font-mono uppercase tracking-wider">
                          <span className="text-stone-400 font-medium">{greyLabel}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right: Dynamic Calculation Output Receipt Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
            
            {!isReadyToCalculate ? (
              /* Gated State Notification: Only render pricing after selecting Yard and Frequency */
              <div id="estimate-pending-card" className="bg-stone-55 border border-stone-200/80 rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden backdrop-blur-sm min-h-[380px] flex flex-col justify-center items-center text-center">
                <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-[0.02] pointer-events-none">
                  <Calculator className="w-56 h-56" />
                </div>
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-250/60 flex items-center justify-center mb-5 shadow-3xs">
                  <Calculator className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="font-display font-bold text-base text-stone-900 mb-3 uppercase tracking-wide">
                  Estimate Pending
                </h3>
                <p className="text-stone-600 text-xs leading-relaxed max-w-xs font-light">
                  Please select both your <strong className="text-stone-900 font-semibold">Yard Size</strong> and <strong className="text-stone-900 font-semibold">Frequency of Cuts</strong> on the left to reveal your live price estimate and itemized breakdown.
                </p>
              </div>
            ) : (
              /* Main Interactive Estimate Display Card */
              <div id="live-pricing-card" className="bg-stone-55 border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden backdrop-blur-sm">
                <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-[0.03] pointer-events-none">
                  <Calculator className="w-56 h-56" />
                </div>

                {/* Card Header */}
                <div className="flex items-center justify-between gap-2 border-b border-stone-200/60 pb-5 mb-6">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-800 font-mono text-[9px] uppercase tracking-wider rounded-md border border-emerald-250 font-bold">
                      Live Pricing Model
                    </span>
                  </div>
                </div>

                {/* Dynamic Rates Banner */}
                <div className="space-y-1 mb-6">
                  <span className="text-stone-400 text-[10px] font-mono uppercase tracking-widest font-bold block">
                    Estimated Rate per Service Cut
                  </span>
                  <div className="flex items-baseline lg:flex-wrap xl:flex-nowrap gap-2 mb-3">
                    {lawnSqFt === 5000 ? (
                      <span className="font-display font-bold text-4xl sm:text-5xl text-stone-950 tracking-tight">
                        ${minEstimate}+
                      </span>
                    ) : (
                      <>
                        <span className="font-display font-bold text-4xl sm:text-5xl text-stone-950 tracking-tight">
                          ${minEstimate.toLocaleString()}
                        </span>
                        <span className="text-emerald-700 font-semibold text-xl font-display">-</span>
                        <span className="font-display font-bold text-4xl sm:text-5xl text-emerald-800 tracking-tight">
                          ${maxEstimate.toLocaleString()}
                        </span>
                      </>
                    )}
                    <span className="text-stone-500 text-xs font-mono ml-1">/ cut visit</span>
                  </div>
                  
                  {/* Walkthrough site parameter notice */}
                  <p className="text-xs text-stone-605 font-medium italic leading-relaxed border-t border-stone-200/60 pt-3">
                    * During your on-site walkthrough, we try our best to keep the price within the online-estimated range. But site parameters like extreme land slopes, narrow fence gates, and high plant densities could affect the price.*
                  </p>
                </div>

                {/* Content Panel: Direct Receipt */}
                <div className="mb-6 relative overflow-hidden animate-fade-in">
                  <div className="space-y-4">
                    {/* Interactive Receipt Roll container */}
                    <div className="border border-stone-250/70 rounded-2xl bg-stone-50 p-4.5 font-mono text-[11px] text-stone-750 shadow-3xs relative border-dashed">
                      {/* Cut lines top/bottom */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 opacity-20" />
                      
                      {/* Receipt Header summary */}
                      <div className="text-center pb-3 border-b border-stone-250/80 border-dashed">
                        <p className="font-black text-stone-900 tracking-wide">JACK'S MOWING & MORE</p>
                        <p className="text-[9px] text-emerald-800 font-bold mt-0.5 tracking-tight uppercase flex items-center justify-center gap-1">
                          <Tag className="w-2.5 h-2.5" /> Budget Estimate Itemization
                        </p>
                        <p className="text-[8px] text-stone-400 mt-1 font-light">
                          GENERATED: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>

                      {/* List items scrollable block */}
                      <div className="py-3 border-b border-stone-250/80 border-dashed space-y-3.5 max-h-72 overflow-y-auto pr-0.5 custom-scrollbar">
                        
                        {/* Item 1: Base Yard Size Cut */}
                        <div className="space-y-1 font-mono">
                          <div className="flex justify-between font-bold text-stone-900">
                            <span>1. BASE MOWING ({lawnSqFt <= 2500 ? 'SMALL' : lawnSqFt <= 4000 ? 'MEDIUM' : 'LARGE'} YARD)</span>
                            <span className="text-stone-950 font-bold">
                              {frequency === 'weekly' 
                                ? (lawnSqFt <= 2500 ? `$${rates.smallMin} - $${rates.smallMax}` : lawnSqFt <= 4000 ? `$${rates.mediumMin} - $${rates.mediumMax}` : `$${rates.largeMin}+`)
                                : (lawnSqFt <= 2500 ? `$${rates.smallBiweeklyMin} - $${rates.smallBiweeklyMax}` : lawnSqFt <= 4000 ? `$${rates.mediumBiweeklyMin} - $${rates.mediumBiweeklyMax}` : `$${rates.largeBiweeklyMin}+`)
                              }
                            </span>
                          </div>
                          <div className="text-[9px] text-stone-500 pl-2 leading-normal">
                            • Precision landscape trimming & geometric mower lines<br/>
                            • Sub-canopy grading evaluation
                          </div>
                        </div>

                        {/* Item 2: Selected Frequency Choice */}
                        <div className="space-y-1 pt-2 border-t border-stone-200/40 font-mono">
                          <div className="flex justify-between font-bold text-stone-900">
                            <span>2. FREQUENCY ({frequency === 'weekly' ? 'WEEKLY' : 'BI-WEEKLY'})</span>
                            <span className="text-stone-950 font-bold">
                              {frequency === 'weekly' ? 'Standard Frequency' : 'Bi-Weekly Frequency'}
                            </span>
                          </div>
                          <div className="text-[9px] text-stone-500 pl-2 leading-normal">
                            • {frequency === 'weekly' ? 'Weekly precision service frequency' : 'Bi-weekly extended service frequency'}
                          </div>
                        </div>

                      </div>

                      {/* Calculations Summary block */}
                      <div className="pt-3">
                        <div className="flex justify-between text-xs text-stone-900 font-black tracking-tight">
                          <span>ESTIMATED VISIT RATE</span>
                          <span className="text-emerald-850 font-mono font-extrabold text-[13px]">
                            {lawnSqFt === 5000 ? `$${minEstimate}+` : `$${minEstimate} - $${maxEstimate}`}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Selected Additional Services bottom display block */}
                {selectedCompanions.length > 0 && (
                  <div className="mb-6 p-4 rounded-xl bg-white border border-stone-200/70 text-left space-y-2 animate-fade-in shadow-3xs">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-850 block font-bold">
                      Companion Services Requested ({selectedCompanions.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCompanions.map((s) => (
                        <span
                          key={s.id}
                          className="text-[11px] text-stone-700 font-medium bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200 inline-flex items-center gap-1 animate-scale-up"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                          {s.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Action Trigger to Apply Specs to Scheduler Booking form */}
                <button
                  onClick={handleApplyToBooking}
                  className="w-full py-4 rounded-xl bg-stone-950 hover:bg-stone-900 active:scale-98 transition-all font-display font-bold text-white text-sm tracking-wide gap-2.5 flex items-center justify-center shadow-lg cursor-pointer animate-fade-in"
                >
                  Apply These Specs & Book Consultation
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
