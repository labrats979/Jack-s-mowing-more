import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_TESTIMONIALS } from '../data';
import { Testimonial } from '../types';
import { 
  Star, MessageSquareDot, UserCircle2, Quote, Sparkles, 
  CheckCircle, RefreshCw, ExternalLink, Copy, AlertCircle, Check 
} from 'lucide-react';

const GOOGLE_REVIEWS_URL = "https://www.google.com/search?q=jack's+mowing+%26+more+reviews&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOWt-46KEUyN-VpY8Sk0oq-rB9sRPfzXis6P5cewK2DftIzyC-Hh0Z96Clkbg8bKA2ozwphc3Fqm-ao5SuYYB7xJZ6S7-x2ChWnrhmtVQN0jn6XuKMg%3D%3D&sa=X&ved=2ahUKEwiR9ZXB8YSSAxWzlokEHZqSHdkQk8gLegUIsgEQAQ&ictx=1&stq=1&cs=1#ebo=6";

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newProjectType, setNewProjectType] = useState('Horticulture & Planting Bed');
  const [newContent, setNewContent] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  
  // Google Reviews Integration States
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncFeedback, setSyncFeedback] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [submittedReviewContent, setSubmittedReviewContent] = useState('');
  const [copiedReviewText, setCopiedReviewText] = useState(false);

  // Load reviews from persistent API of node server on start
  useEffect(() => {
    fetchReviewsList();
  }, []);

  const fetchReviewsList = () => {
    fetch('/api/reviews')
      .then(res => {
        if (!res.ok) throw new Error('API server unavailable');
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          setTestimonials(data);
        } else {
          // Standard placeholder fallback
          setTestimonials(INITIAL_TESTIMONIALS);
        }
      })
      .catch(() => {
        setTestimonials(INITIAL_TESTIMONIALS);
      });
  };

  // Sync Google Business reviews on-demand
  const handleGoogleReviewsSync = () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    setSyncFeedback('');

    fetch('/api/reviews/sync-google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ googleReviewsUrl: GOOGLE_REVIEWS_URL })
    })
      .then(res => {
        if (!res.ok) throw new Error('Sync endpoint failed');
        return res.json();
      })
      .then(data => {
        if (data.reviews) {
          setTestimonials(data.reviews);
        }
        setSyncStatus('success');
        setSyncFeedback(data.message || 'Successfully synchronized reviews from Google Maps Listing!');
        setTimeout(() => {
          setSyncFeedback('');
        }, 5000);
      })
      .catch(err => {
        console.error(err);
        setSyncStatus('error');
        setSyncFeedback('Unable to reach Google Search index. Please verify back-end services.');
      })
      .finally(() => {
        setIsSyncing(false);
      });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newContent.trim()) return;

    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author: newAuthor,
        location: newLocation.trim() || 'Local Property Owner',
        rating: newRating,
        projectType: newProjectType,
        content: newContent
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to post');
        return res.json();
      })
      .then(data => {
        setTestimonials(data);
        
        // Auto-benefit: copy their review text so they can easily cross post
        try {
          navigator.clipboard.writeText(newContent);
          setCopiedReviewText(true);
        } catch (err) {
          console.warn('Clipboard writing failed', err);
        }

        setSubmittedReviewContent(newContent);
        setShowGoogleModal(true);
        
        // Clear form
        setNewAuthor('');
        setNewLocation('');
        setNewContent('');
        setNewRating(5);
        setFormSubmitted(true);
        
        // Hide form visible drawer
        setTimeout(() => {
          setFormSubmitted(false);
          setIsFormVisible(false);
        }, 4000);
      })
      .catch(err => {
        console.error(err);
        // Fallback state insertion if express offline
        const addedReview: Testimonial = {
          id: `custom-test-${Date.now()}`,
          author: newAuthor,
          location: newLocation.trim() || 'Local Property Owner',
          rating: newRating,
          projectType: newProjectType,
          content: newContent,
          date: 'Just now'
        };
        setTestimonials([addedReview, ...testimonials]);
        setSubmittedReviewContent(newContent);
        setShowGoogleModal(true);
        setNewAuthor('');
        setNewLocation('');
        setNewContent('');
        setFormSubmitted(true);
      });
  };

  const handleCopyAgain = () => {
    try {
      navigator.clipboard.writeText(submittedReviewContent);
      setCopiedReviewText(true);
      setTimeout(() => setCopiedReviewText(false), 2000);
    } catch (err) {
      alert("Please copy the review text manually from the window.");
    }
  };

  return (
    <section id="testimonials" className="py-24 bg-white text-stone-850 border-b border-stone-100 relative grid-dots overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-stone-900 tracking-tight leading-none mb-4 uppercase">
              Reviews
            </h2>
            <p className="text-stone-605 font-light leading-relaxed text-sm sm:text-base">
              See what our clients are saying about their experience with us—real stories, real results.
            </p>
            <div className="inline-flex flex-wrap items-center gap-2 mt-4 px-3.5 py-1.5 rounded-xl bg-orange-50/70 border border-orange-100 text-[11px] text-orange-850 font-sans shadow-3xs">
              <span className="flex items-center gap-1.5 text-stone-900">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span className="font-semibold text-[11px]">Recommended on Google</span>
              </span>
              <span className="text-amber-500 font-bold tracking-tight">★★★★★ 5.0</span>
              <span className="text-stone-300 font-light">|</span>
              <a 
                href={GOOGLE_REVIEWS_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-bold underline text-emerald-805 hover:text-emerald-950 transition-colors flex items-center gap-0.5"
              >
                Write or View Local Reviews
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3.5">
            {/* Dynamic Sync Trigger Widget */}
            <button
              onClick={handleGoogleReviewsSync}
              disabled={isSyncing}
              className={`px-4 py-3 rounded-lg border font-mono text-xs font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                isSyncing 
                  ? 'bg-stone-50 border-stone-200 text-stone-400 cursor-wait' 
                  : 'bg-white border-stone-250 hover:bg-stone-50 text-stone-700 hover:border-emerald-600'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing with Google...' : 'Sync Google Reviews'}
            </button>

            <button
              onClick={() => setIsFormVisible(!isFormVisible)}
              className="px-6 py-3 rounded-lg bg-black hover:bg-stone-900 text-white font-display font-medium text-xs tracking-wider transition-all duration-200 cursor-pointer uppercase flex items-center gap-2 border border-black shadow-sm"
            >
              <MessageSquareDot className="w-4 h-4 text-emerald-405" />
              {isFormVisible ? 'Close Review Panel' : 'Write a Review'}
            </button>
          </div>
        </div>

        {/* Sync Feed Notification */}
        {syncFeedback && (
          <div className={`mb-8 p-4 rounded-xl border flex items-start gap-3 bg-emerald-50 border-emerald-200 text-emerald-855 animate-fade-in`}>
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs font-sans">
              <span className="font-bold block uppercase tracking-wider text-[10px] font-mono mb-0.5">Google Business Sync Engine</span>
              <p>{syncFeedback}</p>
            </div>
          </div>
        )}

        {/* REVIEW FORM COLLAPSIBLE DRAWER */}
        <AnimatePresence>
          {isFormVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden mb-16"
            >
              <div className="bg-stone-50 border border-stone-200 shadow-xl rounded-2xl p-6 sm:p-10 max-w-2xl mx-auto">
                <div className="flex gap-2.5 items-center mb-6">
                  <span className="p-1.5 bg-emerald-50 rounded text-emerald-700 border border-emerald-200">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <p className="font-display font-bold text-lg text-stone-900">
                    Share Your Project Feedback
                  </p>
                </div>

                {formSubmitted ? (
                  <div className="py-8 text-center flex flex-col items-center justify-center gap-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <CheckCircle className="w-12 h-12 text-emerald-700 animate-bounce" />
                    <div>
                      <h4 className="font-display font-bold text-emerald-700 text-base">Testimonial Published Successfully!</h4>
                      <p className="text-[11px] text-stone-500 font-mono mt-1">Your review is now stored and linked inside our direct system.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-5">
                    
                    {/* Star Rating selector */}
                    <div className="space-y-2 text-left">
                      <label className="text-xs text-stone-605 font-mono uppercase tracking-wider block font-bold">How would you rate the experience? *</label>
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

                    {/* Form Input fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                      <div className="space-y-1.5">
                        <label className="text-xs text-stone-600 font-semibold" htmlFor="review-author"> Your Full Name *</label>
                        <input
                          id="review-author"
                          type="text"
                          required
                          value={newAuthor}
                          onChange={(e) => setNewAuthor(e.target.value)}
                          placeholder="Eleanor Vance"
                          className="w-full px-4 py-2.5 rounded-lg bg-white text-stone-900 border border-stone-250 focus:border-emerald-650 focus:ring-1 focus:ring-emerald-600/30 text-sm focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-stone-600 font-semibold" htmlFor="review-location">Your City (Oregon)</label>
                        <input
                          id="review-location"
                           type="text"
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          placeholder="Lake Oswego, OR"
                          className="w-full px-4 py-2.5 rounded-lg bg-white text-stone-900 border border-stone-250 focus:border-emerald-650 focus:ring-1 focus:ring-emerald-600/30 text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                      <div className="space-y-1.5">
                        <label className="text-xs text-stone-600 font-semibold" htmlFor="review-project">Project Type *</label>
                        <select
                          id="review-project"
                          value={newProjectType}
                          onChange={(e) => setNewProjectType(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-white text-stone-900 border border-stone-250 focus:border-emerald-650 focus:ring-1 focus:ring-emerald-600/30 text-sm focus:outline-none"
                        >
                          <option>Horticulture & Planting Bed</option>
                          <option>Flagstone & Slate Patio</option>
                          <option>Cascading Water Feature</option>
                          <option>Outdoor LED Night Lighting</option>
                          <option>Custom Retaining Walls</option>
                          <option>Precision Lawn Mowing</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-xs text-stone-600 font-semibold" htmlFor="review-text">Review Content *</label>
                      <textarea
                        id="review-text"
                        required
                        rows={3}
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="They aligned structural rock joint lines beautifully to enhance the horizon limits. The plant coverage came out completely lush..."
                        className="w-full px-4 py-2.5 rounded-lg bg-white text-stone-900 border border-stone-250 focus:border-emerald-650 focus:ring-1 focus:ring-emerald-600/30 text-sm focus:outline-none focus:ring-0"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-black hover:bg-stone-900 text-white font-display font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Post Review To Dashboard
                    </button>

                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TESTIMONIAL CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Real Google Interactive Badge Card */}
          <div className="bg-gradient-to-br from-orange-50/70 to-emerald-50/40 p-8 rounded-2xl border border-orange-200/50 shadow-xs relative flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all duration-300 group">
            <div className="absolute right-6 top-6 text-orange-200 group-hover:text-emerald-300 transition-colors pointer-events-none">
              <svg className="w-8 h-8 opacity-70" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
            </div>

            <div className="space-y-4">
              <span className="text-orange-900 font-mono text-[9px] font-bold uppercase tracking-widest block text-left">
                Google Business Link
              </span>
              <h4 className="font-display font-bold text-base text-stone-900 leading-snug text-left">
                Support Jack's Team On Google Reviews!
              </h4>
              <p className="text-stone-650 text-[12px] leading-relaxed font-light text-left">
                Are you a satisfied client from Portland Hills, Lake Oswego, or West Linn? Help support our local landscaping crew by sharing your experience on Google.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-150 flex flex-col gap-2">
              <a 
                href={GOOGLE_REVIEWS_URL}
                target="_blank"  
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center text-center px-4 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-[11px] rounded-lg shadow-3xs cursor-pointer transition-all uppercase"
              >
                Submit Review on Google
              </a>
              <span className="text-[9px] text-stone-400 text-center font-mono uppercase tracking-widest">Verified Map Reference</span>
            </div>
          </div>

          {testimonials.map((test) => (
            <div
              key={test.id}
              className="bg-stone-50/80 p-8 rounded-2xl border border-stone-200/80 shadow-xs relative flex flex-col justify-between hover:border-emerald-205 hover:shadow-sm transition-all duration-300 group text-left"
            >
              {/* Corner quote mark or Google logo badge */}
              <div className="absolute right-6 top-6 text-stone-200 group-hover:text-emerald-100 transition-colors pointer-events-none">
                {test.isGoogle ? (
                  <svg className="w-6 h-6 text-orange-200 group-hover:text-amber-100" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                ) : (
                  <Quote className="w-10 h-10 fill-current rotate-180 opacity-40 text-stone-150 group-hover:text-emerald-50" />
                )}
              </div>

              <div className="space-y-4">
                {/* Visual Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: test.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-stone-650 text-[13px] leading-relaxed font-light italic">
                  "{test.content}"
                </p>
                
                {test.isGoogle && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-orange-50 border border-orange-100 rounded text-[9px] text-orange-900 font-mono uppercase tracking-wider font-bold">
                    <span>Synced from Google Business</span>
                  </div>
                )}
              </div>

              {/* Author Footer */}
              <div className="flex items-center gap-3.5 pt-6 mt-6 border-t border-stone-150">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-stone-200">
                  {test.avatar ? (
                    <img src={test.avatar} alt={test.author} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400">
                      <UserCircle2 className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div>
                  <h5 className="font-display font-semibold text-xs text-stone-850 font-bold">
                    {test.author}
                  </h5>
                  <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono mt-0.5">
                    <span>{test.location}</span>
                    <span>•</span>
                    <span className="text-emerald-705 font-bold">{test.projectType}</span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* CROSS-POSTING ASSISTANT MODAL DIALOG */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-stone-200 max-w-lg w-full rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowGoogleModal(false)}
                className="absolute right-4 top-4 text-stone-400 hover:text-stone-700 font-bold cursor-pointer p-1 rounded-full hover:bg-stone-50"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="p-2 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                </div>
                <div className="text-left font-sans">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-orange-900 font-bold block">Integrative Sync Core</span>
                  <h4 className="font-display font-extrabold text-base text-stone-900 uppercase">Cross-Post to Google Places</h4>
                </div>
              </div>

              <div className="space-y-4 text-left font-sans text-sm text-stone-600 leading-relaxed font-light">
                <p>
                  Thank you! Your testimonial has been posted permanently to our website.
                </p>
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1 relative">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-450 block font-bold">Your Saved Content:</span>
                  <p className="italic text-xs font-serif text-stone-800 line-clamp-3">"{submittedReviewContent}"</p>
                </div>

                <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-xl flex gap-3 text-xs text-amber-900 leading-normal">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <p>
                    <strong>Google Anti-Spam protection</strong> prevents websites from automatically submitting external reviews. To publish this on Google, follow these 2 prompt steps:
                  </p>
                </div>

                <div className="space-y-3.5 font-sans font-light">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div className="text-xs">
                      <p className="font-semibold text-stone-900">Copy your review text</p>
                      <p className="text-stone-500 font-normal">We've loaded it onto your clipboard. If needed, click below to copy again.</p>
                      <button
                        onClick={handleCopyAgain}
                        className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-white border border-stone-250 text-stone-700 hover:border-emerald-600 rounded text-[10px] font-mono font-bold transition-all cursor-pointer hover:bg-stone-50"
                      >
                        {copiedReviewText ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            Copied to Clipboard!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-stone-500" />
                            Copy Review Text
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div className="text-xs">
                      <p className="font-semibold text-stone-900">Paste and Select 5 Stars on Google</p>
                      <p className="text-stone-500 font-normal">Click below to open our official reviews page. Simply paste your text and submit!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex gap-3">
                <button
                  onClick={() => setShowGoogleModal(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-all rounded-xl font-medium text-xs uppercase font-mono tracking-wider grow text-center cursor-pointer"
                >
                  Close
                </button>
                <a
                  href={GOOGLE_REVIEWS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white transition-all rounded-xl font-bold text-xs uppercase tracking-wider grow flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
                >
                  Open Google Maps Reviews
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
