import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronRight, ChevronLeft, X, Sparkles, Star, Camera, CreditCard, Award } from 'lucide-react';
import { UserSession } from '../types';

interface OnboardingTourProps {
  session: UserSession;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  selector: string;
  tab?: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon?: React.ReactNode;
}

export default function OnboardingTour({
  session,
  activeTab,
  onTabChange,
  isOpen,
  onClose
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Define steps dynamically based on role
  const steps: TourStep[] = React.useMemo(() => {
    if (session.role === 'student') {
      return [
        {
          selector: 'none',
          tab: 'profile',
          title: "Welcome, Scholar! 👋",
          description: "Welcome to Edweso Royal Academy! Let's take a quick 1-minute interactive tour of your student workspace to help you get started.",
          position: 'center',
          icon: <Sparkles className="text-amber-500 animate-spin" size={24} />
        },
        {
          selector: '#profile-camera-btn',
          tab: 'profile',
          title: "Snap Photo with Live Camera 📸",
          description: "Keep your student files updated! Click here to upload a photo file or trigger your webcam to snap a secure live profile photo. This is directly linked to your student ID.",
          position: 'bottom',
          icon: <Camera className="text-emerald-500" size={24} />
        },
        {
          selector: '#sidebar-link-grades',
          tab: 'profile',
          title: "Terminal Report Cards 🏆",
          description: "This side navigation link leads to your terminal report sheet. Let's move there next to see your continuous assessment and exam grades.",
          position: 'right',
          icon: <Award className="text-purple-500 animate-bounce" size={24} />
        },
        {
          selector: '#student-grades-container',
          tab: 'grades',
          title: "Continuous Assessments & Exams 📊",
          description: "Examine detailed progress sheets for all registered subjects, class continuous assessment scores (30%), terminal written exam marks (70%), and live GPA calculations.",
          position: 'bottom',
          icon: <Star className="text-blue-500" size={24} />
        },
        {
          selector: '#sidebar-link-payments',
          tab: 'grades',
          title: "Fees Settlement Ledger 💳",
          description: "Manage your outstanding school tuition balance. Click next to automatically navigate to the instant, secure Paystack billing portal.",
          position: 'right',
          icon: <CreditCard className="text-amber-600" size={24} />
        },
        {
          selector: '#student-payments-container',
          tab: 'payments',
          title: "Secure Paystack Checkout 🇬🇭",
          description: "Review outstanding fee balances, specify your payment amount, and trigger a secure, fully simulated Paystack payment checkout directly in Ghanaian Cedis (GHS).",
          position: 'bottom',
          icon: <Sparkles className="text-emerald-600" size={24} />
        }
      ];
    } else if (session.role === 'teacher') {
      return [
        {
          selector: 'none',
          tab: 'classes',
          title: "Welcome, Faculty! 🎓",
          description: "Welcome to your Academic Faculty Portal. Let's do a quick walkthrough of your tools.",
          position: 'center',
          icon: <Sparkles className="text-amber-500 animate-pulse" size={24} />
        },
        {
          selector: '#profile-camera-btn',
          tab: 'profile',
          title: "Profile Photo Capture 📸",
          description: "Update your teacher directory photo with your webcam or by uploading a file.",
          position: 'bottom',
          icon: <Camera className="text-emerald-500" size={24} />
        },
        {
          selector: '#sidebar-link-grades',
          tab: 'profile',
          title: "Grades Entry Book 🏆",
          description: "Navigate here to easily enter, edit, and record terminal marks and exam scores for your class rosters.",
          position: 'right',
          icon: <Award className="text-purple-500" size={24} />
        }
      ];
    } else {
      // Admin steps
      return [
        {
          selector: 'none',
          tab: 'overview',
          title: "Welcome, Administrator! 🛡️",
          description: "Welcome to the school ERP master command terminal. Let's inspect critical system controls.",
          position: 'center',
          icon: <Sparkles className="text-emerald-500 animate-spin" size={24} />
        },
        {
          selector: '#sidebar-link-diagnostics',
          tab: 'overview',
          title: "Real-time System Diagnostics ⚙️",
          description: "Review server response loads, client sync states, memory allocations, and network latency logs.",
          position: 'right',
          icon: <Star className="text-blue-500" size={24} />
        },
        {
          selector: '#sidebar-link-activities',
          tab: 'overview',
          title: "School Activity Event Audit 📜",
          description: "Inspect continuous logs of system changes, continuous assessment updates, audit histories, and authentication activity.",
          position: 'right',
          icon: <Award className="text-amber-500" size={24} />
        }
      ];
    }
  }, [session.role]);

  const step = steps[currentStep];

  // Auto-navigate tabs when moving to a step that specifies a tab
  useEffect(() => {
    if (!isOpen || !step) return;
    if (step.tab && activeTab !== step.tab) {
      onTabChange(step.tab);
    }
  }, [currentStep, isOpen, step, activeTab, onTabChange]);

  // Track the target element's bounding rectangle dynamically
  useEffect(() => {
    if (!isOpen || !step || step.selector === 'none') {
      setRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.querySelector(step.selector);
      if (el) {
        setRect(el.getBoundingClientRect());
      } else {
        setRect(null);
      }
    };

    // Calculate immediately
    updateRect();

    // Re-track on scroll, resize, or interval for animated transitions
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, { passive: true });
    const interval = setInterval(updateRect, 100);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
      clearInterval(interval);
    };
  }, [step, activeTab, isOpen, currentStep]);

  if (!isOpen || !step) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      localStorage.setItem(`onboarding_completed_${session.role}_${session.id}`, 'true');
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(`onboarding_completed_${session.role}_${session.id}`, 'true');
    onClose();
  };

  // Tooltip positioning logic with off-screen safety
  const getTooltipStyle = (): React.CSSProperties => {
    const defaultStyle: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      pointerEvents: 'auto'
    };

    if (rect) {
      const pad = 14;
      const tooltipWidth = 320;
      const tooltipHeight = 190;

      let left = rect.left + rect.width / 2 - tooltipWidth / 2;
      // Clamp horizontally
      left = Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, left));

      let top = rect.bottom + pad;
      const pos = step.position;

      if (pos === 'top') {
        top = rect.top - tooltipHeight - pad;
        if (top < 16) top = rect.bottom + pad;
      } else if (pos === 'bottom') {
        top = rect.bottom + pad;
        if (top + tooltipHeight > window.innerHeight - 16) {
          top = rect.top - tooltipHeight - pad;
        }
      } else if (pos === 'left') {
        left = rect.left - tooltipWidth - pad;
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        if (left < 16) {
          left = rect.right + pad;
          top = rect.bottom + pad;
        }
      } else if (pos === 'right') {
        left = rect.right + pad;
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        if (left + tooltipWidth > window.innerWidth - 16) {
          left = rect.left - tooltipWidth - pad;
          if (left < 16) {
            left = 16;
            top = rect.bottom + pad;
          }
        }
      }

      // Clamp vertically
      top = Math.max(16, Math.min(window.innerHeight - tooltipHeight - 16, top));

      return {
        ...defaultStyle,
        top: `${top}px`,
        left: `${left}px`,
        width: `${tooltipWidth}px`
      };
    }

    // Default centered position
    return {
      ...defaultStyle,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '350px'
    };
  };

  const tooltipStyle = getTooltipStyle();

  return (
    <div className="fixed inset-0 z-[9997] overflow-hidden pointer-events-none" id="interactive-onboarding-tour-mask">
      {/* 1. Spotlight Overlay Mask */}
      {rect ? (
        <svg className="fixed inset-0 pointer-events-none z-[9998] w-full h-full">
          <defs>
            <mask id="spotlight-hole-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect 
                x={rect.x - 8} 
                y={rect.y - 8} 
                width={rect.width + 16} 
                height={rect.height + 16} 
                rx="12" 
                ry="12" 
                fill="black" 
              />
            </mask>
          </defs>
          <rect 
            x="0" 
            y="0" 
            width="100%" 
            height="100%" 
            fill="rgba(15, 23, 42, 0.72)" 
            mask="url(#spotlight-hole-mask)" 
            className="pointer-events-auto cursor-pointer" 
            onClick={handleSkip}
          />
        </svg>
      ) : (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs pointer-events-auto z-[9998]" onClick={handleSkip} />
      )}

      {/* 2. Tooltip Card */}
      <div 
        style={tooltipStyle}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-2xl flex flex-col pointer-events-auto animate-fade-in relative transition-all duration-300"
      >
        {/* Glow Element */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 rounded-t-2xl" />

        <div className="flex items-start justify-between mt-2 mb-3">
          <div className="flex items-center space-x-2.5">
            {step.icon && <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">{step.icon}</div>}
            <h4 className="text-xs font-black tracking-tight text-slate-950 dark:text-white uppercase leading-none">
              {step.title}
            </h4>
          </div>
          <button 
            onClick={handleSkip}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-lg cursor-pointer shrink-0"
            title="Skip Tour"
          >
            <X size={14} />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold mb-5 flex-1 text-left">
          {step.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-1.5">
            {steps.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep 
                    ? 'w-5 bg-emerald-600' 
                    : 'w-1.5 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex space-x-1.5">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg shadow-sm hover:shadow-md transition-all flex items-center space-x-1 cursor-pointer"
            >
              <span>{currentStep === steps.length - 1 ? 'Finish' : 'Next'}</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
