import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, Sparkles, Clock, User, 
  BookOpen, FileText, CheckCircle2, ShieldAlert, Image, Camera, Upload, Trash2,
  Eye, X
} from 'lucide-react';
import { Announcement, SyllabusPlan, ClassNote } from '../types';

// ==========================================
// 1. FEATURED ANNOUNCEMENTS CAROUSEL
// ==========================================
interface FeaturedAnnouncementsCarouselProps {
  announcements: Announcement[];
  onDeleteNotice?: (id: string) => void;
  isAdmin?: boolean;
}

export function FeaturedAnnouncementsCarousel({
  announcements,
  onDeleteNotice,
  isAdmin = false
}: FeaturedAnnouncementsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Autoplay effect - synchronized to exactly 5 seconds
  useEffect(() => {
    if (!isPlaying || announcements.length <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [isPlaying, announcements.length]);

  if (!announcements || announcements.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-400 italic font-mono">No bulletins broadcasted yet.</p>
      </div>
    );
  }

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0
    })
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  // Touch handlers for mobile/tablet swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // Minimum 50px threshold for swipe detection
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  const activeNotice = announcements[currentIndex];

  return (
    <div 
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-slate-900/5 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-slate-950/60 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-inner overflow-hidden select-none"
    >
      {/* Upper header line */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
          <Sparkles size={14} className="animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest font-mono">Featured School Bulletin</span>
        </div>
        <div className="flex items-center space-x-1.5 bg-white/60 dark:bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-150 dark:border-slate-800 text-[10px] font-mono font-bold text-slate-500">
          <span>{currentIndex + 1}</span>
          <span className="opacity-40">/</span>
          <span>{announcements.length}</span>
        </div>
      </div>

      {/* Main Slide Window */}
      <div className="min-h-[140px] relative flex flex-col justify-between">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeNotice.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="space-y-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                To: {activeNotice.targetAudience}
              </span>
              <div className="flex items-center space-x-1 text-slate-400 text-[10px] font-semibold">
                <Clock size={11} />
                <span>{activeNotice.date}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white leading-snug">
                {activeNotice.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {activeNotice.content}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-250/20 dark:border-slate-800/40 text-[10px] text-slate-400">
              <span className="flex items-center gap-1 font-bold">
                <User size={11} className="text-emerald-600" />
                Authored by: <span className="text-slate-600 dark:text-slate-300 font-extrabold">{activeNotice.authorName}</span> ({activeNotice.authorRole})
              </span>

              {isAdmin && onDeleteNotice && (
                <button
                  onClick={() => onDeleteNotice(activeNotice.id)}
                  className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer p-1 rounded hover:bg-rose-500/10"
                  title="Remove Bulletin"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation Arrow Controls overlay */}
        <div className="flex items-center justify-end space-x-1.5 mt-4">
          <button
            onClick={handlePrev}
            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-slate-600 dark:text-slate-400 transition-colors shadow-xs cursor-pointer active:scale-95"
            title="Previous Notice"
          >
            <ChevronLeft size={13} />
          </button>
          
          {/* Bullet Indicators */}
          <div className="flex space-x-1 px-2">
            {announcements.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex 
                    ? 'bg-emerald-600 dark:bg-emerald-500 w-3' 
                    : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-slate-600 dark:text-slate-400 transition-colors shadow-xs cursor-pointer active:scale-95"
            title="Next Notice"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. TEACHING RESOURCES CAROUSEL (SYLLABUS & NOTES)
// ==========================================
interface TeachingResourcesCarouselProps {
  syllabusPlans: SyllabusPlan[];
  classNotes: ClassNote[];
}

export function TeachingResourcesCarousel({
  syllabusPlans = [],
  classNotes = []
}: TeachingResourcesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  
  // Quick View Modal States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<{
    type: 'Syllabus' | 'ClassNote';
    title: string;
    subtitle: string;
    details: string;
    date: string;
    tag: string;
    objectives?: string;
    studyMaterials?: string;
  } | null>(null);

  // Combine items to slide through
  const resourceItems: Array<{
    type: 'Syllabus' | 'ClassNote';
    id: string;
    title: string;
    subtitle: string;
    details: string;
    date: string;
    tag: string;
    objectives?: string;
    studyMaterials?: string;
  }> = [];

  syllabusPlans.forEach(sp => {
    resourceItems.push({
      type: 'Syllabus',
      id: sp.id,
      title: sp.topic || sp.topicTitle || 'No Topic Specified',
      subtitle: `${sp.subjectName} (${sp.className || 'All Classes'})`,
      details: sp.objectives || (sp.learningObjectives ? sp.learningObjectives.join(', ') : 'Objectives pending review.'),
      date: `Week ${sp.weekNumber}`,
      tag: sp.status || 'Active',
      objectives: sp.objectives,
      studyMaterials: sp.studyMaterials
    });
  });

  classNotes.forEach(cn => {
    resourceItems.push({
      type: 'ClassNote',
      id: cn.id,
      title: 'Observation Note Log',
      subtitle: `Pupil Assessment Observation`,
      details: cn.note,
      date: cn.date,
      tag: 'Observation'
    });
  });

  // Autoplay effect - synchronized to exactly 5 seconds
  useEffect(() => {
    if (!isPlaying || resourceItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % resourceItems.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [isPlaying, resourceItems.length]);

  if (resourceItems.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-400 italic">No resources or notes uploaded yet.</p>
      </div>
    );
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % resourceItems.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + resourceItems.length) % resourceItems.length);
  };

  // Touch handlers for mobile/tablet swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // Minimum 50px threshold for swipe detection
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  const activeItem = resourceItems[currentIndex];

  const triggerQuickView = () => {
    setPreviewItem(activeItem);
    setIsPreviewOpen(true);
  };

  return (
    <div 
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4 select-none relative"
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400">
            <BookOpen size={14} />
            <h3 className="text-xs font-black uppercase tracking-wider font-mono">Academic Resource Deck</h3>
          </div>
          <h4 className="text-xs text-slate-400 mt-0.5 font-bold uppercase tracking-wide">Recently Uploaded Files & Syllabus Plans</h4>
        </div>

        {/* Next/Prev buttons */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={handlePrev}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded cursor-pointer transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[10px] font-mono font-bold px-1.5 text-slate-400">
            {currentIndex + 1}/{resourceItems.length}
          </span>
          <button
            onClick={handleNext}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded cursor-pointer transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Slide Container */}
      <div className="relative overflow-hidden min-h-[145px] flex flex-col justify-between p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800/80">
        <div className="space-y-2">
          {/* Top category row */}
          <div className="flex justify-between items-center">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
              activeItem.type === 'Syllabus' 
                ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' 
                : 'bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
            }`}>
              {activeItem.type === 'Syllabus' ? <FileText size={10} /> : <User size={10} />}
              {activeItem.type} Plan
            </span>

            <span className="text-[9px] font-mono bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-1.5 py-0.5 rounded">
              {activeItem.tag}
            </span>
          </div>

          {/* Title & info */}
          <div className="flex justify-between items-start gap-2">
            <div>
              <h5 className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                {activeItem.title}
              </h5>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide">
                {activeItem.subtitle}
              </p>
            </div>
            
            {/* Quick View Button */}
            <button
              onClick={triggerQuickView}
              className="px-2 py-1 rounded bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-1 text-[9px] font-black uppercase tracking-wider cursor-pointer"
              title="Quickly preview details in a modal"
            >
              <Eye size={10} />
              <span>Quick View</span>
            </button>
          </div>

          {/* Body Content */}
          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
            {activeItem.details}
          </p>
        </div>

        {/* Footer date tracker */}
        <div className="mt-3 pt-2.5 border-t border-slate-200/40 dark:border-slate-800/40 flex justify-between items-center text-[9px] font-mono text-slate-400 font-bold">
          <span>Official Learning Asset</span>
          <span className="text-emerald-600 dark:text-emerald-400">{activeItem.date}</span>
        </div>
      </div>

      {/* Progress slider bar */}
      <div className="w-full h-1 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
        <div 
          className="h-full bg-emerald-600 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / resourceItems.length) * 100}%` }}
        />
      </div>

      {/* --- QUICK VIEW PORTAL MODAL --- */}
      <AnimatePresence>
        {isPreviewOpen && previewItem && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop Blur Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Modal Card content wrapper */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden shadow-2xl relative z-10 p-6 flex flex-col space-y-4 text-left"
            >
              {/* Header */}
              <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                    previewItem.type === 'Syllabus' 
                      ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' 
                      : 'bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                  }`}>
                    {previewItem.type === 'Syllabus' ? <FileText size={11} /> : <User size={11} />}
                    {previewItem.type} Resource Preview
                  </span>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">
                    {previewItem.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    {previewItem.subtitle}
                  </p>
                </div>

                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Main Content Info */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                <div className="space-y-1.5">
                  <h6 className="text-[10px] uppercase font-black tracking-widest text-emerald-600 dark:text-emerald-400 font-mono">
                    Content & Details
                  </h6>
                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800/40 whitespace-pre-wrap">
                    {previewItem.details}
                  </p>
                </div>

                {previewItem.studyMaterials && (
                  <div className="space-y-1.5">
                    <h6 className="text-[10px] uppercase font-black tracking-widest text-emerald-600 dark:text-emerald-400 font-mono">
                      Associated Study Materials
                    </h6>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      {previewItem.studyMaterials}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/40">
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">Chronology Reference</span>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{previewItem.date}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/40">
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">Academic Status Tag</span>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{previewItem.tag}</span>
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-855 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// 3. STUDENT PHOTO GALLERY & PROFILE HISTORY CAROUSEL
// ==========================================
interface StudentPhotoGalleryCarouselProps {
  currentProfilePhoto?: string;
  onSelectProfilePhoto: (url: string) => void;
  isDarkMode?: boolean;
}

export function StudentPhotoGalleryCarousel({
  currentProfilePhoto,
  onSelectProfilePhoto,
  isDarkMode = false
}: StudentPhotoGalleryCarouselProps) {
  // Hardcoded gorgeous, pre-approved royal event photos for the school gallery
  const campusEvents = [
    {
      id: 'event-1',
      title: 'Academy Science & STEM Fair 2026',
      description: 'Reviewing interactive robotics modules and chemical reaction layouts in the school laboratory.',
      url: 'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'event-2',
      title: 'Royal Culture & Heritage Festival',
      description: 'Students wearing rich, authentic Kente weaving and showcasing royal drums and dances.',
      url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'event-3',
      title: 'Annual Inter-House Sports Gala',
      description: 'Competing on the tracks for the principal gold cups and athletic certificates.',
      url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'event-4',
      title: 'High-Performance Computing Lab Block',
      description: 'Junior secondary classes designing custom websites and training interactive coding plans.',
      url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'event-5',
      title: 'Interactive Math Olympiad Finals',
      description: 'Winning first place awards across general geometry and speed arithmetic.',
      url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop'
    }
  ];

  // Initialize gallery photo list. It should contain active profile picture (if uploaded),
  // plus the pre-approved school event photos.
  const [photoGallery, setPhotoGallery] = useState<Array<{ id: string; title: string; description: string; url: string; isProfile?: boolean }>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    const list = [];
    if (currentProfilePhoto) {
      list.push({
        id: 'current-profile',
        title: 'Active Profile Capture Photo',
        description: 'Your currently displayed profile avatar captured from the camera or custom files.',
        url: currentProfilePhoto,
        isProfile: true
      });
    }
    
    campusEvents.forEach(e => {
      list.push({
        id: e.id,
        title: e.title,
        description: e.description,
        url: e.url,
        isProfile: false
      });
    });

    setPhotoGallery(list);
  }, [currentProfilePhoto]);

  // Autoplay effect - synchronized to exactly 5 seconds
  useEffect(() => {
    if (!isPlaying || photoGallery.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photoGallery.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [isPlaying, photoGallery.length]);

  if (photoGallery.length === 0) {
    return null;
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photoGallery.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photoGallery.length) % photoGallery.length);
  };

  // Touch handlers for mobile/tablet swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // Minimum 50px threshold for swipe detection
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  const activePhoto = photoGallery[currentIndex];
  const isCurrentlyActiveProfile = currentProfilePhoto === activePhoto.url;

  return (
    <div 
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`p-5 rounded-2xl border ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'
      } space-y-4 select-none`} 
      id="student-gallery-carousel-widget"
    >
      
      <div>
        <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400">
          <Image size={15} />
          <h3 className="text-xs font-black uppercase tracking-wider font-mono">Royal Campus Gallery</h3>
        </div>
        <h4 className="text-xs text-slate-400 mt-0.5 font-bold uppercase tracking-wide">History of Captures & School Event Spotlights</h4>
      </div>

      {/* Main Image View Panel */}
      <div className="relative group rounded-xl overflow-hidden aspect-video bg-slate-950 border border-slate-200/10 shadow-md">
        <img 
          src={activePhoto.url} 
          alt={activePhoto.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Text overlay backplate */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-4 text-left space-y-1">
          <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-600 text-white px-2 py-0.5 rounded self-start leading-none mb-1 shadow-xs">
            {activePhoto.isProfile ? 'My Profile Photo' : 'School Event Spotlight'}
          </span>
          <h5 className="font-extrabold text-xs text-white tracking-wide">
            {activePhoto.title}
          </h5>
          <p className="text-[10px] text-slate-300 leading-normal line-clamp-2 font-medium">
            {activePhoto.description}
          </p>
        </div>

        {/* Left / Right overlays */}
        <button
          onClick={handlePrev}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 bg-slate-950/70 hover:bg-slate-900/90 text-white rounded-full border border-white/10 shadow hover:scale-110 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft size={14} />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 bg-slate-950/70 hover:bg-slate-900/90 text-white rounded-full border border-white/10 shadow hover:scale-110 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Action buttons (e.g. set as profile photo) */}
      <div className="flex justify-between items-center pt-1 text-xs">
        {/* Thumbnails indicator */}
        <div className="flex space-x-1.5 overflow-x-auto py-1">
          {photoGallery.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-7 h-7 rounded overflow-hidden border-2 shrink-0 transition-all ${
                idx === currentIndex 
                  ? 'border-emerald-500 scale-110 shadow-sm' 
                  : 'border-transparent opacity-65 hover:opacity-100'
              }`}
            >
              <img src={p.url} alt="thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Set Active Profile button */}
        {!activePhoto.isProfile && !isCurrentlyActiveProfile && (
          <button
            onClick={() => onSelectProfilePhoto(activePhoto.url)}
            className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-extrabold text-[9px] uppercase tracking-wider rounded-lg border border-emerald-500/15 flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-xs"
            title="Set this gorgeous image as your profile photo"
          >
            <CheckCircle2 size={11} />
            <span>Apply as Profile Photo</span>
          </button>
        )}

        {isCurrentlyActiveProfile && (
          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wide flex items-center gap-1 py-1">
            <CheckCircle2 size={11} />
            Active Profile Avatar
          </span>
        )}
      </div>

    </div>
  );
}
