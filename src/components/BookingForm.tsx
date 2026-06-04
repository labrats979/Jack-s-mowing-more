import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Mail, Phone, MapPin, User, ChevronRight, Check, CheckCircle2, ShieldCheck, TreePine, ChevronDown, X } from 'lucide-react';
import { Service } from '../types';

interface BookingFormProps {
  initialServiceType?: string;
  initialNotes?: string;
  services?: Service[];
  onClose?: () => void;
  selectedServiceIds?: string[];
  onToggleServiceId?: (serviceId: string) => void;
}

export default function BookingForm({
  initialServiceType = 'Landscape Design & Installation',
  initialNotes = '',
  services = [],
  selectedServiceIds = [],
  onToggleServiceId = () => {},
}: BookingFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    timeframe: 'Next 1-2 Months',
    notes: initialNotes,
  });

  const [submitted, setSubmitted] = useState(false);
  const [dropboxOpen, setDropboxOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-dismiss Toast notification after 5 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Sync state if estimator passes new parameters
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      notes: initialNotes || prev.notes,
    }));
  }, [initialNotes]);

  // Auto-sync initialServiceType (e.g., set single selection from other cards) into the multi-select array
  useEffect(() => {
    if (initialServiceType) {
      const match = services.find(
        (s) => s.title.toLowerCase() === initialServiceType.toLowerCase()
      );
      if (match && !selectedServiceIds.includes(match.id)) {
        onToggleServiceId(match.id);
      }
    }
  }, [initialServiceType, services]);

  // Click outside listener to collapse dropbox
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropboxOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone) return;

    // Save lead to localStorage
    try {
      const selectedServicesList = services
        .filter((s) => selectedServiceIds.includes(s.id))
        .map((s) => s.title);

      const newLead = {
        id: 'lead-' + Date.now(),
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || 'Not Provided',
        timeframe: formData.timeframe,
        notes: formData.notes || '',
        services: selectedServicesList,
        createdAt: new Date().toISOString(),
        status: 'new' // 'new' | 'contacted' | 'completed' | 'archived'
      };

      const existingLeadsStr = localStorage.getItem('jacks_booking_leads');
      const existingLeads = existingLeadsStr ? JSON.parse(existingLeadsStr) : [];
      const updatedLeads = [newLead, ...existingLeads];
      localStorage.setItem('jacks_booking_leads', JSON.stringify(updatedLeads));
      
      // Also emit a storage event to alert open Admin components in the same window
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Failed to log booking lead locally', err);
    }

    // Simulate real local submit
    setSubmitted(true);
    setShowToast(true);
    
    // Clear elements but keep some defaults
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      timeframe: 'Next 1-2 Months',
      notes: '',
    });
  };

  return (
    <section id="booking-form" className="py-24 bg-white text-stone-850 relative grid-dots border-b border-stone-100">
      <div className="absolute inset-0 bg-stone-50/20 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 animate-fade-in">
        
        {/* Module Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-emerald-700 tracking-tight leading-none uppercase">
            Get On Our Schedule
          </h2>
        </div>

        {/* Core Request Card */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-3xl p-6 sm:p-12 shadow-sm relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-12 text-center max-w-md mx-auto space-y-6"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-250 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <div>
                  <h3 className="font-display font-semibold text-2xl text-stone-900 tracking-tight mb-2">
                    Consultation Requested
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed font-light">
                    Thank you. Our lead designer will call you within two business days to arrange an onsite briefing. We look forward to analyzing your soil.
                  </p>
                </div>

                {selectedServiceIds.length > 0 && (
                  <div className="p-4 rounded-xl bg-white border border-stone-200 text-left space-y-2.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-750 block font-bold">
                      Requested Service Package ({selectedServiceIds.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {services
                        .filter((s) => selectedServiceIds.includes(s.id))
                        .map((s) => (
                          <span
                            key={s.id}
                            className="text-xs text-stone-700 font-light bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200 inline-flex items-center gap-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                            {s.title}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-left text-xs text-stone-605 flex gap-3.5 items-start">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <p>
                    <strong>Secure & Protected:</strong> Your email and phone contact details are strictly kept offline. We never list, sell, or disclose residential properties public contact profiles.
                  </p>
                </div>

                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-xs font-mono cursor-pointer"
                >
                  Schedule Another Area
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form-container"
                onSubmit={handleFormSubmit}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Left block - Contact */}
                  <div className="space-y-5">
                    <h4 className="font-display font-medium text-[13px] uppercase tracking-widest text-stone-500 border-b border-stone-205 pb-2 font-bold">
                      Client Contact Info
                    </h4>

                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-stone-600 font-medium" htmlFor="booking-fullName">Your Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                        <input
                          id="booking-fullName"
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Arthur Dent"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-stone-900 border border-stone-250 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 focus:outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-stone-600 font-medium" htmlFor="booking-email">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                        <input
                          id="booking-email"
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="arthur@galaxy.org"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-stone-900 border border-stone-250 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 focus:outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Telephone */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-stone-600 font-medium" htmlFor="booking-phone">Telephone number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                        <input
                          id="booking-phone"
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (732) 790-9789"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-stone-900 border border-stone-250 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 focus:outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Site Location Address */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-stone-600 font-medium" htmlFor="booking-address">Project Site Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                        <input
                          id="booking-address"
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Lake Oswego, Oregon"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-stone-900 border border-stone-250 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 focus:outline-none text-sm"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Right block - Scope Parameters */}
                  <div className="space-y-5">
                    <h4 className="font-display font-medium text-[13px] uppercase tracking-widest text-stone-500 border-b border-stone-205 pb-2 font-bold">
                      Landscape parameters
                    </h4>

                    {/* Multi-Select Custom Dropbox Dropdown */}
                    <div className="space-y-1.5 relative select-none" ref={dropdownRef}>
                      <label className="text-xs text-stone-600 font-medium block">
                        Landscape Services Chosen in Quote
                      </label>
                      
                      <button
                        type="button"
                        onClick={() => setDropboxOpen(!dropboxOpen)}
                        className="w-full px-4 py-3 rounded-xl scale-100 active:scale-[0.99] transition-all bg-white text-stone-900 border border-stone-250 hover:border-emerald-600 focus:outline-none text-sm text-left flex items-center justify-between cursor-pointer"
                      >
                        <span className="truncate pr-4 text-stone-700 font-medium">
                          {selectedServiceIds.length === 0 ? (
                            <span className="text-stone-400 font-light">Choose services...</span>
                          ) : (
                            services
                              .filter((s) => selectedServiceIds.includes(s.id))
                              .map((s) => s.title)
                              .join(', ')
                          )}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-250 ${
                            dropboxOpen ? 'rotate-180 text-emerald-700' : ''
                          }`}
                        />
                      </button>

                      {/* Dropdown Options List */}
                      {dropboxOpen && (
                        <div className="absolute left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-xl bg-white border border-stone-200 shadow-2xl z-50 p-1.5 space-y-1 animate-fade-in scrollbar-thin scrollbar-thumb-stone-200">
                          <div className="text-[10px] uppercase tracking-wider text-stone-500 font-mono font-bold px-3 py-1 border-b border-stone-100 mb-1">
                            Click to Add / Remove Services
                          </div>
                          {services.map((svc) => {
                            const isChecked = selectedServiceIds.includes(svc.id);
                            return (
                              <button
                                key={svc.id}
                                type="button"
                                onClick={() => onToggleServiceId(svc.id)}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-between group/opt ${
                                  isChecked
                                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                                    : 'text-stone-700 hover:bg-stone-50 hover:text-stone-950 border border-transparent'
                                }`}
                              >
                                <div className="flex flex-col">
                                  <span className="text-xs leading-tight">{svc.title}</span>
                                  <span className="text-[10px] text-stone-400 font-mono mt-0.5 font-semibold">{svc.category}</span>
                                </div>
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                                    isChecked
                                      ? 'bg-emerald-700 border-emerald-600 text-white'
                                      : 'border-stone-300 bg-white group-hover/opt:border-stone-400'
                                  }`}
                                >
                                  {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Quick Dismiss Badges Underneath (Interactive pill cards) */}
                      {selectedServiceIds.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {services
                            .filter((s) => selectedServiceIds.includes(s.id))
                            .map((s) => (
                              <div
                                key={s.id}
                                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 pl-2.5 pr-1.5 py-1 rounded-full animate-fade-in group animate-scale-up"
                              >
                                <span>{s.title}</span>
                                <button
                                  type="button"
                                  onClick={() => onToggleServiceId(s.id)}
                                  className="w-4 h-4 rounded-full bg-emerald-700/10 hover:bg-emerald-700 hover:text-white text-emerald-750 flex items-center justify-center cursor-pointer focus:outline-none transition-colors"
                                  title={`Remove ${s.title}`}
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>




                    {/* Context/Notes */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-stone-600 font-medium" htmlFor="booking-notes">Draft details or Calculated estimates block</label>
                      <textarea
                        id="booking-notes"
                        name="notes"
                        rows={4}
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="My soil gets extremely morning sun, currently covered with shallow ivy beds. I'd love a stone terrace matching the cedar porch lines..."
                        className="w-full px-4 py-3 rounded-xl bg-white text-stone-900 border border-stone-250 focus:border-emerald-600 focus:outline-none text-sm"
                      />
                    </div>

                  </div>

                </div>

                {/* Submit row */}
                <div className="flex justify-end pt-6 border-t border-stone-200">
                  
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-black hover:bg-stone-900 text-white font-display font-semibold text-sm transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    Confirm & Submit Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </motion.form>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* Toast Notification Container */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-6 left-6 z-50 bg-stone-900 border border-stone-800 text-white p-4.5 rounded-2xl shadow-2xl max-w-sm flex items-start gap-3.5 pr-10"
            role="alert"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left space-y-1">
              <h5 className="font-display font-bold text-xs uppercase tracking-wider text-emerald-400">
                Request Submitted!
              </h5>
              <p className="text-stone-305 text-[11px] leading-relaxed font-light">
                Your consultation request has been successfully received. We will reach out to schedule an onsite layout briefing.
              </p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="absolute top-3 right-3 text-stone-400 hover:text-white p-1 hover:bg-stone-800 rounded-full transition-all cursor-pointer"
              title="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
