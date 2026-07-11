import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface Slide {
  id: number;
  image: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

interface HeroCarouselProps {
  onNavigateToAdmissions: () => void;
  onNavigateToAbout: () => void;
  onNavigateToLogin: () => void;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2000&auto=format&fit=crop',
    badge: 'Sterling International School',
    title: 'Every child yearns to learn',
    subtitle: 'Nurturing Future Leaders with Knowledge, Discipline & Excellence',
    description: 'Developing critical and independent thinkers allows us to discover and nurture the diverse talents, passions, and strengths that make each student exceptional.',
    ctaPrimary: 'Enroll Now',
    ctaSecondary: 'Read More'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=2000&auto=format&fit=crop',
    badge: 'Unlocking Creative Brilliance',
    title: 'Advanced Computing & STEM Labs',
    subtitle: 'Equipping Students For A Tech-Driven Tomorrow',
    description: 'Our world-class interactive technology laboratories empower students to master software engineering, data analytics, and hands-on scientific projects early.',
    ctaPrimary: 'Explore Programs',
    ctaSecondary: 'Read More'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2000&auto=format&fit=crop',
    badge: 'Academic & Moral Foundation',
    title: 'Raised to Lead with Integrity',
    subtitle: 'Where High Discipline Meets Intellectual Rigor',
    description: 'We blend standard, internationally acclaimed curriculums with rigorous moral leadership courses and active visual art pursuits, ensuring children rise to lead.',
    ctaPrimary: 'Apply For Admission',
    ctaSecondary: 'Read More'
  }
];

export default function HeroCarousel({
  onNavigateToAdmissions,
  onNavigateToAbout,
  onNavigateToLogin
}: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  return (
    <div 
      className="relative w-full h-[550px] sm:h-[600px] lg:h-[650px] overflow-hidden bg-slate-950 select-none group"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
      id="hero-carousel"
    >
      {/* Background Image Layer with Zoom & Cross-Fade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0.2, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.2, scale: 0.95 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full"
        >
          <img 
            src={SLIDES[currentSlide].image} 
            alt={SLIDES[currentSlide].title} 
            className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.05]"
            referrerPolicy="no-referrer"
          />
          {/* Dark scrim with modern rich gradient for ultra contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-slate-950/50" />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content Container */}
      <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col justify-center z-10">
        <div className="max-w-3xl space-y-6 text-left">
          {/* Badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`badge-${currentSlide}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-600/30 backdrop-blur-xs border border-emerald-500/20 rounded-full text-xs font-black text-emerald-300 uppercase tracking-widest"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{SLIDES[currentSlide].badge}</span>
            </motion.div>
          </AnimatePresence>

          {/* Main Title Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`title-container-${currentSlide}`}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="space-y-2 sm:space-y-3"
            >
              <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-sans leading-tight">
                {SLIDES[currentSlide].title}
              </h1>
              <h2 className="text-sm sm:text-xl font-bold text-amber-400 font-sans tracking-wide">
                {SLIDES[currentSlide].subtitle}
              </h2>
            </motion.div>
          </AnimatePresence>
 
          {/* Slide Description Paragraph */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-slate-200/90 text-xs sm:text-base leading-relaxed max-w-2xl font-medium"
            >
              {SLIDES[currentSlide].description}
            </motion.p>
          </AnimatePresence>
 
          {/* Action Call to Buttons */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`buttons-${currentSlide}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex flex-wrap items-center gap-3 pt-6 sm:pt-4"
            >
              <button
                onClick={onNavigateToAdmissions}
                className="px-5 sm:px-8 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all text-[10px] sm:text-xs uppercase tracking-widest cursor-pointer flex items-center space-x-2"
              >
                <span>{SLIDES[currentSlide].ctaPrimary}</span>
                <ArrowRight size={14} />
              </button>
              
              <button
                onClick={onNavigateToAbout}
                className="px-5 sm:px-8 py-3 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-bold rounded-xl border border-white/20 hover:border-white/30 backdrop-blur-xs transition-all text-[10px] sm:text-xs uppercase tracking-widest cursor-pointer"
              >
                {SLIDES[currentSlide].ctaSecondary}
              </button>
 
              <button
                onClick={onNavigateToLogin}
                className="px-3.5 sm:px-4 py-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
              >
                Portal Login
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
 
      {/* Left/Right Directional Controls (Hidden on mobile to prevent overlap with content) */}
      <button
        onClick={handlePrev}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md hidden md:flex items-center justify-center border border-white/15 hover:border-white/25 transition-all shadow-lg active:scale-95 cursor-pointer z-20 group-hover:opacity-100 opacity-80"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={24} />
      </button>
 
      <button
        onClick={handleNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 hidden md:flex items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer z-20 group-hover:opacity-100 opacity-90"
        aria-label="Next Slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators / Progress bars */}
      <div className="absolute bottom-8 left-6 sm:left-12 flex items-center space-x-3 z-20">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrentSlide(index)}
            className="flex flex-col items-start text-left focus:outline-none group/ind cursor-pointer"
          >
            <div className="flex items-center space-x-1">
              <div 
                className={`h-1 rounded-full transition-all duration-500 ${
                  currentSlide === index 
                    ? 'w-10 bg-amber-400' 
                    : 'w-4 bg-white/30 group-hover/ind:bg-white/60'
                }`} 
              />
              <span className={`text-[10px] font-mono transition-all ${
                currentSlide === index ? 'text-amber-400 font-extrabold' : 'text-slate-400/80'
              }`}>
                0{slide.id}
              </span>
            </div>
          </button>
        ))}

        <div className="h-4 w-px bg-white/20 mx-2" />

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center border border-white/10 hover:bg-white/20 transition-colors cursor-pointer text-[10px]"
          title={isPlaying ? "Pause Autoplay" : "Play Autoplay"}
        >
          {isPlaying ? <Pause size={10} /> : <Play size={10} />}
        </button>
      </div>
    </div>
  );
}
