import React, { useState } from 'react';
import { Menu, X, Phone, Facebook, Youtube, ChevronDown, CheckCircle2 } from 'lucide-react';
import JacksLogo from './JacksLogo';
import { Service } from '../types';

interface NavbarProps {
  onNavigateTo: (elementId: string) => void;
  services: Service[];
  onSelectServicePage: (serviceId: string) => void;
  onBackToHome: () => void;
  currentActiveView: string;
}

export default function Navbar({
  onNavigateTo,
  services = [],
  onSelectServicePage,
  onBackToHome,
  currentActiveView
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [desktopServicesOpen, setDesktopServicesOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, id: string) => {
    e.preventDefault();
    onBackToHome();
    setMobileMenuOpen(false);
    
    // allow view state transition to home first, then scroll
    setTimeout(() => {
      onNavigateTo(id);
    }, 100);
  };

  const handleServiceClick = (serviceId: string) => {
    onSelectServicePage(serviceId);
    setMobileMenuOpen(false);
    setDesktopServicesOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-200 py-3 relative h-20 text-stone-800 shadow-sm animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* Left Side: Brand Logo & Text */}
        <button
          onClick={onBackToHome}
          className="flex items-center gap-3 select-none group focus:outline-none text-left cursor-pointer bg-transparent border-none p-0"
        >
          <JacksLogo size={48} className="transform group-hover:scale-105 transition-transform duration-350" />
          <div className="flex flex-col">
            <span className="font-serif font-black text-xl tracking-tight text-stone-900 leading-none">
              Jack's
            </span>
            <span className="text-[9px] font-mono font-bold tracking-widest text-emerald-700 uppercase pt-0.5 leading-none">
              Mowing & More
            </span>
          </div>
        </button>

        {/* Center: Desktop Section Links */}
        <nav className="hidden md:flex items-center gap-7">
          <button
            onClick={onBackToHome}
            className={`text-stone-600 hover:text-emerald-700 font-display font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer ${
              currentActiveView === 'home' ? 'text-emerald-700 font-extrabold' : ''
            }`}
          >
            Home
          </button>

          {/* New Interactive Dropdown for Services */}
          <div
            className="relative"
            onMouseEnter={() => setDesktopServicesOpen(true)}
            onMouseLeave={() => setDesktopServicesOpen(false)}
          >
            <button
              onClick={() => setDesktopServicesOpen(!desktopServicesOpen)}
              className={`text-stone-600 hover:text-emerald-700 font-display font-bold text-xs tracking-wider uppercase transition-colors py-2 flex items-center gap-1 cursor-pointer ${
                currentActiveView !== 'home' ? 'text-emerald-700 border-b-2 border-emerald-500/30' : ''
              }`}
            >
              Services
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${desktopServicesOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu block */}
            {desktopServicesOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 rounded-xl bg-white border border-stone-200 shadow-xl p-2 animate-fade-in z-50 animate-fade-in">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-550 px-3 py-1.5 border-b border-stone-200 mb-1">
                  Our Specialties
                </div>
                {services.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => handleServiceClick(svc.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-light text-stone-600 hover:text-emerald-805 hover:bg-stone-50 transition-all cursor-pointer flex items-center justify-between ${
                      currentActiveView === svc.id ? 'bg-stone-105 text-emerald-700 font-semibold' : ''
                    }`}
                  >
                    <span>{svc.title}</span>
                    <span className="text-[9px] font-mono text-stone-400 uppercase">
                      View
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <a
            href="#portfolio"
            onClick={(e) => handleNavClick(e, 'portfolio')}
            className="text-stone-600 hover:text-emerald-700 font-display font-bold text-xs tracking-wider uppercase transition-colors"
          >
            Portfolio
          </a>
          <a
            href="#estimator"
            onClick={(e) => handleNavClick(e, 'estimator')}
            className="text-stone-600 hover:text-emerald-700 font-display font-bold text-xs tracking-wider uppercase transition-colors"
          >
            Cost Estimator
          </a>
          <a
            href="#testimonials"
            onClick={(e) => handleNavClick(e, 'testimonials')}
            className="text-stone-600 hover:text-emerald-700 font-display font-bold text-xs tracking-wider uppercase transition-colors"
          >
            Testimonials
          </a>
        </nav>

        {/* Right Side: Quick Action & Icon Buttons */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Phone call trigger */}
          <a
            href="tel:1-732-790-9789"
            className="p-2 rounded-full hover:bg-stone-100 text-stone-600 hover:text-emerald-700 transition"
            title="Call Jack's Mowing & More"
          >
            <Phone className="w-4.5 h-4.5" />
          </a>

          {/* Facebook link */}
          <a
            href="https://www.facebook.com/share/17pGRei4A2/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-stone-100 text-stone-600 hover:text-emerald-700 transition"
            title="Facebook profile"
          >
            <Facebook className="w-4.5 h-4.5 fill-current" />
          </a>

          {/* YouTube link */}
          <a
            href="https://youtube.com/@jackmowing?si=G4-dTzRzbI7ys-1v"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-stone-100 text-stone-600 hover:text-emerald-700 transition"
            title="YouTube channel"
          >
            <Youtube className="w-4.5 h-4.5" />
          </a>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-600 hover:text-emerald-700 transition-colors cursor-pointer md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-20 bg-white border-b border-stone-200 shadow-2xl flex flex-col p-6 gap-4 animate-fade-in text-stone-800 z-50 max-h-[calc(100vh-80px)] overflow-y-auto">
          <button
            onClick={() => {
              onBackToHome();
              setMobileMenuOpen(false);
            }}
            className="text-left text-stone-700 hover:text-emerald-700 text-sm font-bold uppercase tracking-wider py-1.5 border-b border-stone-100"
          >
            Home
          </button>

          {/* Mobile services list accordion */}
          <div className="border-b border-stone-100">
            <button
              onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
              className="w-full flex items-center justify-between text-stone-700 hover:text-emerald-700 text-sm font-bold uppercase tracking-wider py-2.5"
            >
              <span>Our Services Offered</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileServicesOpen ? 'rotate-180': ''}`} />
            </button>
            {mobileServicesOpen && (
              <div className="pl-3 py-1.5 space-y-2.5 pb-3">
                {services.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => handleServiceClick(svc.id)}
                    className="w-full text-left text-stone-500 hover:text-emerald-700 text-xs py-1 flex items-center justify-between cursor-pointer"
                  >
                    <span>• {svc.title}</span>
                    <span className="text-[9px] font-mono text-stone-400 uppercase">
                      Explore
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <a
            href="#portfolio"
            onClick={(e) => handleNavClick(e, 'portfolio')}
            className="text-stone-700 hover:text-emerald-700 text-sm font-bold uppercase tracking-wider py-1.5 border-b border-stone-100"
          >
            Portfolio Showcase
          </a>
          <a
            href="#estimator"
            onClick={(e) => handleNavClick(e, 'estimator')}
            className="text-stone-700 hover:text-emerald-700 text-sm font-bold uppercase tracking-wider py-1.5 border-b border-stone-100"
          >
            Cost Estimator
          </a>
          <a
            href="#testimonials"
            onClick={(e) => handleNavClick(e, 'testimonials')}
            className="text-stone-700 hover:text-emerald-700 text-sm font-bold uppercase tracking-wider py-1.5 border-b border-stone-100"
          >
            Testimonials
          </a>
          
          <div className="flex gap-4 pt-4">
            <a 
              href="https://www.facebook.com/share/17pGRei4A2/?mibextid=wwXIfr" 
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-stone-200 rounded-lg text-stone-500 hover:text-emerald-700"
            >
              <Facebook className="w-5 h-5 fill-current" />
            </a>
            <a 
              href="https://youtube.com/@jackmowing?si=G4-dTzRzbI7ys-1v" 
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-stone-250 rounded-lg text-stone-500 hover:text-emerald-700"
            >
              <Youtube className="w-5 h-5" />
            </a>
            <a href="tel:1-732-790-9789" className="flex items-center gap-2 p-2 px-4 border border-stone-200 rounded-lg text-emerald-700 font-bold text-xs hover:border-emerald-600">
              <Phone className="w-4 h-4" /> Call Us
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
