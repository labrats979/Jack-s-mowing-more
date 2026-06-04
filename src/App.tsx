import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServicesSection from './components/ServicesSection';
import ProjectPortfolio from './components/ProjectPortfolio';
import CostEstimator from './components/CostEstimator';
import TestimonialsSection from './components/TestimonialsSection';
import BookingForm from './components/BookingForm';
import JacksLogo from './components/JacksLogo';
import ServiceDetailPage from './components/ServiceDetailPage';
import AdminDashboard from './components/AdminDashboard';
import GoogleChatWidget from './components/GoogleChatWidget';
import { INITIAL_SERVICES } from './data';
import { Service } from './types';
import { Compass, Hammer, Flower, Sun, Droplets, ArrowRight, ShieldCheck, TreePine, Mail, Phone, MapPin } from 'lucide-react';

export default function App() {
  // Cover Photo customizable background state
  const [coverPhoto, setCoverPhoto] = useState<string>(() => {
    return localStorage.getItem('jacks_cover_photo') || '/src/assets/images/landscape_hero_1779327295782.png';
  });

  // Load initial services from local storage or defaults
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('jacks_mowing_services_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse saved services, falling back to defaults', err);
      }
    }
    return INITIAL_SERVICES;
  });

  // Track page routing: 'home' or a specific service view (e.g., 'leaf-cleanup')
  const [currentActiveView, setCurrentActiveView] = useState<string>('home');

  // Track service IDs included in the quote
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  // Sync state between CostEstimator and BookingForm
  const [selectedService, setSelectedService] = useState('Landscape Design & Installation');
  const [appliedNotes, setAppliedNotes] = useState('');

  const handleToggleServiceId = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleApplyEstimate = (data: { serviceType: string; notes: string }) => {
    setSelectedService(data.serviceType);
    setAppliedNotes(data.notes);
    handleOpenBooking();
  };

  const handleOpenBooking = () => {
    const bookingElement = document.getElementById('booking-form');
    if (bookingElement) {
      bookingElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavigateTo = (id: string) => {
    setCurrentActiveView('home');
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 80; // height of fixed navbar
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 150);
  };

  const handleSelectServicePage = (serviceId: string) => {
    setCurrentActiveView(serviceId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentActiveView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveServices = (updated: Service[]) => {
    setServices(updated);
    localStorage.setItem('jacks_mowing_services_v2', JSON.stringify(updated));
  };

  const handleRestoreDefaults = () => {
    setServices(INITIAL_SERVICES);
    localStorage.setItem('jacks_mowing_services_v2', JSON.stringify(INITIAL_SERVICES));
  };

  return (
    <div className="min-h-screen bg-white font-sans text-stone-800 flex flex-col justify-between selection:bg-emerald-700 selection:text-white">
      
      {/* 1. BRAND MATCHING HEADER WITH DROPDOWN SERVICES */}
      <Navbar
        onNavigateTo={handleNavigateTo}
        services={services}
        onSelectServicePage={handleSelectServicePage}
        onBackToHome={handleBackToHome}
        currentActiveView={currentActiveView}
      />

      {/* Conditionally Render Content based on Routing State */}
      {currentActiveView === 'home' ? (
        <>
          {/* 2. ATMOSPHERIC HERO SECTION (Match branding mockup) */}
          <Hero
            onGoToEstimator={() => handleNavigateTo('estimator')}
            onExploreServices={() => handleNavigateTo('services')}
            coverPhoto={coverPhoto}
          />

          {/* 3. DYNAMICALLY MODIFIABLE SERVICES SECTION */}
          <ServicesSection
            services={services}
            onSelectServicePage={handleSelectServicePage}
          />

          {/* 4. CASE STUDIES & VISUAL SLIDING REVEAL PORTFOLIO */}
          <ProjectPortfolio />

          {/* 6. INTERACTIVE COST ESTIMATOR CALCULATOR */}
          <section id="estimator">
            <CostEstimator
              onApplyEstimate={handleApplyEstimate}
              services={services}
              selectedServiceIds={selectedServiceIds}
              onToggleServiceId={handleToggleServiceId}
            />
          </section>

          {/* 7. TESTIMONIALS OF CUSTOM WORK & ONLINE REVIEW LOGGER */}
          <TestimonialsSection />

          {/* 8. CONTACT & ESTIMATES BOOKING REQUEST PANEL */}
          <BookingForm
            initialServiceType={selectedService}
            initialNotes={appliedNotes}
            services={services}
            selectedServiceIds={selectedServiceIds}
            onToggleServiceId={handleToggleServiceId}
          />

          {/* 9. AI BOTANICAL CHATBOT */}
          <GoogleChatWidget />
        </>
      ) : (
        /* Render individual detail page */
        <div className="pt-20">
          <ServiceDetailPage
            serviceId={currentActiveView}
            services={services}
            onBack={handleBackToHome}
            onAddServiceToQuote={handleToggleServiceId}
            isAlreadyInQuote={selectedServiceIds.includes(currentActiveView)}
          />
        </div>
      )}

      {/* 9. FINE CRAFTED DESIGNER FOOTER */}
      <footer className="bg-stone-50 text-stone-500 border-t border-stone-200 pt-16 pb-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Branding Column */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <JacksLogo size={52} />
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1.5 text-stone-850">
                    <span className="font-serif font-black text-xl tracking-tight">Jack's</span>
                  </div>
                  <span className="font-display font-bold text-emerald-700 text-[10px] tracking-widest uppercase pb-1">
                    Mowing & More
                  </span>
                </div>
              </div>
              <p className="text-stone-605 text-xs font-light leading-relaxed max-w-sm">
                Architectural landscape design, precision lawn mowing, lawn recovery, and custom stonemasonry. Serving Milltown with pride and premium cleanup.
              </p>
            </div>

            {/* Quick links block */}
            <div className="space-y-4">
              <h5 className="font-display font-semibold text-stone-800 text-xs uppercase tracking-wider">Quick Links</h5>
              <div className="flex flex-col gap-2.5 text-xs text-stone-600">
                <a href="#services" onClick={(e) => { e.preventDefault(); handleNavigateTo('services'); }} className="hover:text-emerald-700 transition-colors">Services Offered</a>
                <a href="#portfolio" onClick={(e) => { e.preventDefault(); handleNavigateTo('portfolio'); }} className="hover:text-emerald-700 transition-colors">Portfolio</a>
                <a href="#estimator" onClick={(e) => { e.preventDefault(); handleNavigateTo('estimator'); }} className="hover:text-emerald-700 transition-colors">Cost Estimator</a>
                <a href="#testimonials" onClick={(e) => { e.preventDefault(); handleNavigateTo('testimonials'); }} className="hover:text-emerald-700 transition-colors font-semibold">Client Testimonials</a>
              </div>
            </div>

            {/* Contact Details info */}
            <div className="space-y-4 text-xs">
              <h5 className="font-display font-semibold text-stone-800 text-xs uppercase tracking-wider">Jack's Headquarters</h5>
              <div className="space-y-3 text-stone-600">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-stone-600 shrink-0" />
                  <span>+1 (732) 790-9789</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-stone-600 shrink-0" />
                  <span>estimates@jacksmowing.com</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-stone-600 shrink-0" />
                  <span>Milltown</span>
                </div>
              </div>
            </div>

          </div>

          {/* Sub-footer metadata copyright */}
          <div className="border-t border-stone-300/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p className="font-light">
              © {new Date().getFullYear()} Jack's Mowing & More. All rights reserved.
            </p>
          </div>

        </div>
      </footer>

      {/* Admin Dashboard Control Panel at the bottom of everything */}
      <AdminDashboard
        services={services}
        onSaveServices={handleSaveServices}
        onRestoreDefaults={handleRestoreDefaults}
        coverPhoto={coverPhoto}
        onSaveCoverPhoto={(url: string) => {
          setCoverPhoto(url);
          localStorage.setItem('jacks_cover_photo', url);
        }}
      />

    </div>
  );
}
