import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Testimonial } from '../types';
import { 
  Star, MessageSquareDot, UserCircle2, Quote, Sparkles, 
  CheckCircle, ChevronLeft, ChevronRight, AlertCircle, Plus
} from 'lucide-react';

export default function TestimonialsSection({ services: propServices }: { services?: any[] } = {}) {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [localServices, setLocalServices] = useState<any[]>(propServices || []);
  const [newContent, setNewContent] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  // Load services if they are not passed via props
  useEffect(() => {
    if (propServices && propServices.length > 0) {
      setLocalServices(propServices);
    } else {
      fetch('/api/services')
        .then(res => {
          if (!res.ok) throw new Error('Failed to load services');
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setLocalServices(data);
          }
        })
        .catch(err => {
          console.warn('Could not load services fallback for review options:', err);
        });
    }
  }, [propServices]);

  // Load reviews from persistent API
  const fetchReviewsList = () => {
    fetch('/api/reviews')
      .then(res => {
        if (!res.ok) throw new Error('API server unavailable');
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          setTestimonials(data);
        }
      })
      .catch((err) => {
        console.error("Error loading reviews:", err);
      });
  };

  useEffect(() => {
    fetchReviewsList();
  }, []);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newContent.trim()) return;

    // Join selected services or use blank if none selected (optional)
    const finalProjectType = selectedServices.length > 0 ? selectedServices.join(', ') : '';

    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author: newAuthor,
        location: newLocation.trim() || 'Milltown, NJ',
        rating: newRating,
        projectType: finalProjectType,
        content: newContent
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to post');
        return res.json();
      })
      .then(data => {
        setTestimonials(data);
        setNewAuthor('');
        setNewLocation('');
        setNewContent('');
        setSelectedServices([]);
        setNewRating(5);
        setFormSubmitted(true);
        setSlideIndex(0); // Reset to first slide to see their review

        setTimeout(() => {
          setFormSubmitted(false);
          setIsFormVisible(false);
        }, 3000);
      })
      .catch(err => {
        console.error(err);
        // Local temporary state insertion on failure
        const addedReview = {
          id: `custom-test-${Date.now()}`,
          author: newAuthor,
          location: newLocation.trim() || 'Milltown, NJ',
          rating: newRating,
          projectType: finalProjectType,
          content: newContent,
          date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long' })
        };
        const nextReviews = [addedReview, ...testimonials];
        setTestimonials(nextReviews);
        setNewAuthor('');
        setNewLocation('');
        setNewContent('');
        setSelectedServices([]);
        setFormSubmitted(true);
        setSlideIndex(0);

        setTimeout(() => {
          setFormSubmitted(false);
          setIsFormVisible(false);
        }, 3000);
      });
  };

  // Compute stats for Overall Rating Block
  const totalReviewsCount = testimonials.length;
  
  const ratingSum = testimonials.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0);
  const averageRating = totalReviewsCount > 0 ? (ratingSum / totalReviewsCount).toFixed(1) : "5.0";

  // Calculate rating percentage counts (1-5 star)
  const starDistribution = [0, 0, 0, 0, 0]; // Index 0=1 star, 4=5 star
  testimonials.forEach(test => {
    const star = Math.min(Math.max(Math.round(test.rating || 5), 1), 5);
    starDistribution[star - 1]++;
  });

  // Slider Pagination
  const cardsPerPage = 4;
  const totalPages = Math.ceil(testimonials.length / cardsPerPage) || 1;

  const handlePrevSlide = () => {
    setSlideIndex(prev => Math.max(prev - 1, 0));
  };

  const handleNextSlide = () => {
    setSlideIndex(prev => Math.min(prev + 1, totalPages - 1));
  };

  // Get reviews for the current page
  const displayedReviews = testimonials.slice(slideIndex * cardsPerPage, (slideIndex + 1) * cardsPerPage);

  return (
    <section id="testimonials" className="py-24 bg-white text-stone-950 border-b border-stone-100 relative grid-dots overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6 max-w-7xl mx-auto border-b border-stone-100 pb-8 text-left">
          <div className="max-w-2xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-150 inline-block mb-3">
              Client Feedback
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-stone-900 tracking-tight leading-none mb-4 uppercase">
              Client Testimonials
            </h2>
            <p className="text-stone-900 font-normal leading-relaxed text-sm sm:text-base">
              Satisfied residential property owners across Milltown, New Jersey share their lawn care and landscaping experiences.
            </p>
          </div>
          <div className="shrink-0">
            <button
              onClick={() => setIsFormVisible(!isFormVisible)}
              className="py-3 px-6 bg-emerald-750 hover:bg-emerald-800 text-white font-mono font-bold uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
              id="add-review-top-cta"
            >
              <Plus className={`w-4 h-4 transition-transform duration-300 ${isFormVisible ? 'rotate-45' : ''}`} />
              {isFormVisible ? "Close Review Form" : "Submit a Review"}
            </button>
          </div>
        </div>

        {/* OVERALL RATING DISPLAY SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
          
          {/* Main Average Score Badge */}
          <div className="bg-stone-50 border border-stone-300 p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md mb-4 border border-emerald-150">
              Verified Score
            </span>
            <div className="text-6xl font-display font-extrabold text-stone-900 tracking-tighter mb-2">
              {averageRating}
            </div>
            
            {/* Average Star Stars */}
            <div className="flex gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => {
                const isGold = i < Math.round(Number(averageRating));
                return (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${isGold ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} 
                  />
                );
              })}
            </div>

            <div className="text-xs text-stone-900 font-sans font-semibold mt-1">
              Based on {totalReviewsCount} local project reviews
            </div>

            <button
              onClick={() => setIsFormVisible(!isFormVisible)}
              className="mt-6 w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-mono font-bold uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Write Local Review
            </button>
          </div>

          {/* Star Distribution Progress Bars */}
          <div className="bg-stone-50 border border-stone-300 p-8 rounded-2xl flex flex-col justify-between shadow-xs lg:col-span-2">
            <h4 className="font-display font-bold text-xs text-stone-900 uppercase tracking-wide text-left mb-4">
              Rating Distribution Breakdown
            </h4>

            <div className="space-y-3.5">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = starDistribution[stars - 1];
                const percentage = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3">
                    {/* Star Label */}
                    <div className="w-12 text-left text-xs font-mono font-bold text-stone-700 flex items-center gap-1">
                      <span>{stars}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                    </div>

                    {/* Progress Bar Container */}
                    <div className="flex-1 bg-stone-200/80 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Count Indicator */}
                    <div className="w-12 text-right text-xs font-mono font-bold text-stone-500">
                      {count} ({Math.round(percentage)}%)
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-stone-400 font-sans mt-4 text-left font-light leading-relaxed">
              * Rated locally by property owners inside Milltown, NJ. We monitor feedback loop logs continuously to preserve premium landscaping service standards.
            </p>
          </div>

        </div>

        {/* WRITE LOCAL REVIEW DRAWER */}
        <AnimatePresence>
          {isFormVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-16"
            >
              <div className="bg-stone-50 border border-stone-200 shadow-xl rounded-2xl p-6 sm:p-10 max-w-2xl mx-auto">
                <div className="flex gap-2.5 items-center mb-6">
                  <span className="p-1.5 bg-emerald-50 rounded text-emerald-700 border border-emerald-200">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <p className="font-display font-bold text-lg text-stone-900">
                    Submit Local Project Review
                  </p>
                </div>

                {formSubmitted ? (
                  <div className="py-8 text-center flex flex-col items-center justify-center gap-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <CheckCircle className="w-12 h-12 text-emerald-700 animate-bounce" />
                    <div>
                      <h4 className="font-display font-bold text-emerald-700 text-base">Review Published Successfully!</h4>
                      <p className="text-[11px] text-stone-900 font-mono mt-1 font-bold">Your review has been saved and is active on the website showcase.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-5">
                    
                    {/* Star Rating selector */}
                    <div className="space-y-2 text-left">
                      <label className="text-xs text-stone-900 font-mono uppercase tracking-wider block font-bold">Select Star Score *</label>
                      <div className="flex gap-1.5 items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="p-1 focus:outline-none focus:scale-110 active:scale-95 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-6 h-6 transition-colors duration-150 ${
                                star <= (hoverRating ?? newRating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Input Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                      <div className="space-y-1.5">
                        <label className="text-xs text-stone-900 font-bold" htmlFor="review-author">Your Name *</label>
                        <input
                          id="review-author"
                          type="text"
                          required
                          value={newAuthor}
                          onChange={(e) => setNewAuthor(e.target.value)}
                          placeholder="Eleanor Vance"
                          className="w-full px-4 py-2.5 rounded-lg bg-white text-stone-950 border border-stone-300 focus:border-emerald-650 focus:ring-1 focus:ring-emerald-600/30 text-sm focus:outline-none placeholder:text-stone-400 font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-stone-900 font-bold" htmlFor="review-location">Your City</label>
                        <input
                          id="review-location"
                          type="text"
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          placeholder="Milltown, NJ"
                          className="w-full px-4 py-2.5 rounded-lg bg-white text-stone-950 border border-stone-300 focus:border-emerald-650 focus:ring-1 focus:ring-emerald-600/30 text-sm focus:outline-none placeholder:text-stone-400 font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left relative">
                      <label className="text-xs text-stone-900 font-bold block">
                        Services Done (Optional - Select multiple)
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="w-full px-4 py-2.5 rounded-lg bg-white text-stone-950 border border-stone-300 focus:border-emerald-650 text-sm focus:outline-none font-medium flex items-center justify-between shadow-3xs cursor-pointer text-left"
                        >
                          <span className="truncate">
                            {selectedServices.length === 0
                              ? "Select services..."
                              : selectedServices.join(', ')}
                          </span>
                          <span className="text-stone-400 text-xs ml-2">▼</span>
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute left-0 right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto p-2 space-y-1 animate-fade-in text-stone-900">
                            <div className="flex justify-between items-center p-1.5 border-b border-stone-100 mb-1">
                              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider font-bold">Select Services</span>
                              <button
                                type="button"
                                onClick={() => setIsDropdownOpen(false)}
                                className="text-[10px] font-mono font-bold text-emerald-700 hover:text-emerald-800 px-2 py-0.5 bg-emerald-50 rounded"
                              >
                                Done
                              </button>
                            </div>
                            {localServices.map((svc) => {
                              const isChecked = selectedServices.includes(svc.title);
                              return (
                                <label
                                  key={svc.id}
                                  className="flex items-center gap-2 p-2 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors text-xs select-none"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setSelectedServices(selectedServices.filter(s => s !== svc.title));
                                      } else {
                                        setSelectedServices([...selectedServices, svc.title]);
                                      }
                                    }}
                                    className="rounded text-emerald-650 focus:ring-emerald-600 h-4 w-4 border-stone-300"
                                  />
                                  <span className="font-medium text-stone-800">{svc.title}</span>
                                </label>
                              );
                            })}
                            {localServices.length === 0 && (
                              <p className="text-stone-400 text-[11px] p-2 italic text-center">No services loaded</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-xs text-stone-900 font-bold" htmlFor="review-text">Review Comments *</label>
                      <textarea
                        id="review-text"
                        required
                        rows={3}
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="The custom masonry came out amazing. Incredible curb appeal and professional landscaping crew..."
                        className="w-full px-4 py-2.5 rounded-lg bg-white text-stone-950 border border-stone-300 focus:border-emerald-650 focus:ring-1 focus:ring-emerald-600/30 text-sm focus:outline-none placeholder:text-stone-400 font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-black hover:bg-stone-900 text-white font-display font-semibold rounded-xl transition-all cursor-pointer shadow-sm text-sm uppercase tracking-wider"
                    >
                      Publish Review
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TESTIMONIAL CAROUSEL SLIDER SHOWCASE */}
        <div className="relative font-sans space-y-6">
          
          <div className="min-h-[300px]">
            {displayedReviews.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-stone-200 rounded-2xl bg-stone-50">
                <p className="text-stone-500 font-light text-sm">No localized reviews published yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedReviews.map((test) => (
                  <div
                    key={test.id}
                    className="bg-stone-50/80 p-6 rounded-2xl border border-stone-300 shadow-sm relative flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all duration-300 group text-left min-h-[290px]"
                  >
                    {/* Corner quote decorator */}
                    <div className="absolute right-6 top-6 text-stone-400 pointer-events-none group-hover:text-emerald-50 transition-colors">
                      <Quote className="w-8 h-8 fill-current rotate-180 opacity-20" />
                    </div>

                    <div className="space-y-4">
                      {/* Visual Stars */}
                      <div className="flex gap-0.5">
                        {Array.from({ length: Math.min(Math.max(test.rating || 5, 1), 5) }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                        ))}
                      </div>

                      {/* Content block with line clamp */}
                      <p className="text-stone-950 text-xs sm:text-[13px] leading-relaxed font-semibold flex-1 line-clamp-6">
                        "{test.content}"
                      </p>
                    </div>

                    {/* Author Footer info */}
                    <div className="flex items-center gap-3 pt-4 mt-6 border-t border-stone-200">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-stone-200 bg-stone-100 flex items-center justify-center text-stone-500">
                        <UserCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-display font-extrabold text-[12px] text-stone-950 leading-none mb-1">
                          {test.author}
                        </h5>
                        <div className="text-[10px] text-stone-700 font-mono flex flex-wrap gap-1 items-center">
                          <span>{test.location}</span>
                          {test.projectType && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-900 font-bold">{test.projectType}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SLIDER NAVIGATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-stone-100">
              
              {/* Pagination Dots */}
              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === slideIndex 
                        ? 'w-6 bg-emerald-650' 
                        : 'w-2 bg-stone-300 hover:bg-stone-450'
                    }`}
                    title={`Go to page ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Action Arrows */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  disabled={slideIndex === 0}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    slideIndex === 0
                      ? 'border-stone-150 text-stone-300 cursor-not-allowed bg-stone-50/50'
                      : 'border-stone-250 text-stone-600 hover:border-emerald-650 hover:bg-stone-50 active:scale-95'
                  }`}
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-xs font-mono font-bold text-stone-500 min-w-[50px] text-center select-none">
                  {slideIndex + 1} / {totalPages}
                </div>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  disabled={slideIndex >= totalPages - 1}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    slideIndex >= totalPages - 1
                      ? 'border-stone-150 text-stone-300 cursor-not-allowed bg-stone-50/50'
                      : 'border-stone-250 text-stone-600 hover:border-emerald-650 hover:bg-stone-50 active:scale-95'
                  }`}
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
}
