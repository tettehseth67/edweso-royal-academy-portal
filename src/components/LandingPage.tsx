import React, { useState, useEffect } from 'react';
import {
  BookOpen, Award, CheckCircle2, Star, Phone, Mail, MapPin, ArrowRight,
  UserCheck, Calendar, ShieldAlert, GraduationCap, ChevronRight, Send,
  Sparkles, Building2, Map, ShieldCheck, Heart, UserSquare2, Info, Users, Clock,
  Briefcase, Download, ChevronDown, Check, FileText, HelpCircle, HeartHandshake, X,
  ChevronUp
} from 'lucide-react';
import { SchoolDatabase } from '../mockData';
import { PublicInquiry } from '../types';
import HeroCarousel from './HeroCarousel';

interface LandingPageProps {
  onNavigateToLogin: (role?: 'admin' | 'teacher' | 'student') => void;
}

type ActivePage = 'home' | 'about' | 'academics' | 'admissions' | 'contact' | 'careers' | 'parent-resources';

export default function LandingPage({ onNavigateToLogin }: LandingPageProps) {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Monitor window scroll coordinates to display/hide the floating scroll-to-top component
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Automatically scroll to the top of the page when the active sub-page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activePage]);

  // Form States
  const [admissionForm, setAdmissionForm] = useState({
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    studentName: '',
    gradeLevel: 'JHS 1',
    message: ''
  });
  const [isAdmissionSubmitted, setIsAdmissionSubmitted] = useState(false);
  const [submittedInquiryId, setSubmittedInquiryId] = useState('');

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'General' as 'General' | 'Feedback',
    message: ''
  });
  const [isContactSubmitted, setIsContactSubmitted] = useState(false);

  // Careers state
  const [careerForm, setCareerForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'JHS ICT & Computing Specialist',
    experience: '',
    portfolioUrl: ''
  });
  const [isCareerSubmitted, setIsCareerSubmitted] = useState(false);
  const [submittedCareerId, setSubmittedCareerId] = useState('');

  // Selected FAQ Category for Parent Resources page
  const [activeParentFaq, setActiveParentFaq] = useState<number | null>(null);

  // Parent Resources category tab state
  const [selectedResourceTab, setSelectedResourceTab] = useState<'academic' | 'administrative' | 'extracurricular'>('academic');

  // Careers modal state
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);

  // Active Academics Tab
  const [academicDept, setAcademicDept] = useState<'primary' | 'jhs' | 'shs'>('jhs');

  const features = [
    {
      icon: <GraduationCap className="text-amber-500" size={24} />,
      title: "Student Management",
      desc: "Robust profile tracking, class assignments, and active continuous assessment records under the Ghana curriculum."
    },
    {
      icon: <UserCheck className="text-emerald-500" size={24} />,
      title: "Teacher Dashboard",
      desc: "Advanced terminal entry systems, attendance books, lesson schedules, and class performance insights."
    },
    {
      icon: <CheckCircle2 className="text-teal-500" size={24} />,
      title: "Attendance Tracking",
      desc: "Real-time daily roll call for students with localized excuses, sick leave approvals, and SMS parent notifications."
    },
    {
      icon: <Award className="text-amber-600" size={24} />,
      title: "Grades & Terminal Reports",
      desc: "Automated continuous class score (30%) and exam score (70%) collation following GES standards."
    },
    {
      icon: <Calendar className="text-indigo-500" size={24} />,
      title: "Timetable & Scheduling",
      desc: "Optimized daily subject blocks preventing teacher overlaps, ensuring complete syllabus coverage."
    },
    {
      icon: <ShieldAlert className="text-sky-500" size={24} />,
      title: "Secure Fees with Paystack",
      desc: "Direct online tuition payment processing in GHS currency via cards or Mobile Money (MTN, Telecel, AirtelTigo)."
    }
  ];

  const testimonials = [
    {
      quote: "Edweso Royal Academy has brought out the best in our children. The discipline and teachers' dedication are exceptional. Paying school fees via Mobile Money makes our lives so much easier!",
      author: "Mrs. Faustina Mensah",
      role: "Parent of Kofi Mensah Jnr",
      location: "Edweso Junction, Ghana",
      rating: 5
    },
    {
      quote: "As a student here, I love the supportive teachers and our science and computer lab experiments. The student portal lets me track my terminal grades easily.",
      author: "Emmanuel Tetteh",
      role: "JHS 2 Student",
      location: "Edweso, Ashanti Region",
      rating: 5
    },
    {
      quote: "The academic standards at Edweso Royal Academy are comparable to top-tier schools in Accra. Their modern approach to ICT and programming is preparing students for the future.",
      author: "Dr. Kojo Boateng",
      role: "PTA Chairman & Tech Consultant",
      location: "Kumasi / Edweso",
      rating: 5
    }
  ];

  const handleAdmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inqId = 'ERA-INQ-' + Math.floor(1000 + Math.random() * 9000);
    const newInquiry: PublicInquiry = {
      id: inqId,
      name: admissionForm.parentName,
      email: admissionForm.parentEmail,
      phone: admissionForm.parentPhone,
      type: 'Admission',
      message: `Student Name: ${admissionForm.studentName}\nGrade Interest: ${admissionForm.gradeLevel}\n\nParent Notes:\n${admissionForm.message}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Pending',
      studentGradeLevel: admissionForm.gradeLevel
    };

    // Save to LocalStorage Database
    try {
      const current = SchoolDatabase.getInquiries();
      SchoolDatabase.saveInquiries([newInquiry, ...current]);
    } catch (err) {
      console.error(err);
    }

    setSubmittedInquiryId(inqId);
    setIsAdmissionSubmitted(true);
    setAdmissionForm({
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      studentName: '',
      gradeLevel: 'JHS 1',
      message: ''
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inqId = 'ERA-GEN-' + Math.floor(1000 + Math.random() * 9000);
    const newInquiry: PublicInquiry = {
      id: inqId,
      name: contactForm.name,
      email: contactForm.email,
      phone: contactForm.phone,
      type: contactForm.type,
      message: contactForm.message,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Pending'
    };

    // Save to Database
    try {
      const current = SchoolDatabase.getInquiries();
      SchoolDatabase.saveInquiries([newInquiry, ...current]);
    } catch (err) {
      console.error(err);
    }

    setIsContactSubmitted(true);
    setContactForm({
      name: '',
      email: '',
      phone: '',
      type: 'General',
      message: ''
    });
  };

  const handleCareerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const appId = 'ERA-APP-' + Math.floor(1000 + Math.random() * 9000);
    const newInquiry: PublicInquiry = {
      id: appId,
      name: careerForm.name,
      email: careerForm.email,
      phone: careerForm.phone,
      type: 'General',
      message: `[FACULTY APPLICATION]\nPosition: ${careerForm.position}\nPrior Experience:\n${careerForm.experience}\nPortfolio/Resume URL: ${careerForm.portfolioUrl}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Pending'
    };

    try {
      const current = SchoolDatabase.getInquiries();
      SchoolDatabase.saveInquiries([newInquiry, ...current]);
    } catch (err) {
      console.error(err);
    }

    setSubmittedCareerId(appId);
    setIsCareerSubmitted(true);
    setCareerForm({
      name: '',
      email: '',
      phone: '',
      position: 'JHS ICT & Computing Specialist',
      experience: '',
      portfolioUrl: ''
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-between">

      {/* ==================== STICKY PUBLIC NAVBAR ==================== */}
      <nav id="landing-navbar" className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 px-4 py-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            onClick={() => setActivePage('home')}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <img
              src="/src/assets/images/school_logo.jpg"
              alt="Edweso Royal Academy Logo"
              className="w-14 h-14 rounded-xl object-contain border border-amber-400/15 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="font-extrabold text-lg tracking-tight text-emerald-800 block leading-tight">Edweso Royal</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 block leading-none">Academy</span>
            </div>
          </div>

          {/* Desktop Public Navigation Links */}
          <div className="hidden md:flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
            <button
              onClick={() => setActivePage('home')}
              className={`px-3.5 py-2 rounded-xl transition-all duration-300 cursor-pointer border ${activePage === 'home'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100/80 shadow-xs'
                  : 'text-slate-500 hover:bg-slate-50/80 hover:text-emerald-800 border-transparent hover:border-slate-100'
                }`}
            >
              Home
            </button>
            <button
              onClick={() => setActivePage('about')}
              className={`px-3.5 py-2 rounded-xl transition-all duration-300 cursor-pointer border ${activePage === 'about'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100/80 shadow-xs'
                  : 'text-slate-500 hover:bg-slate-50/80 hover:text-emerald-800 border-transparent hover:border-slate-100'
                }`}
            >
              About Us
            </button>
            <button
              onClick={() => setActivePage('academics')}
              className={`px-3.5 py-2 rounded-xl transition-all duration-300 cursor-pointer border ${activePage === 'academics'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100/80 shadow-xs'
                  : 'text-slate-500 hover:bg-slate-50/80 hover:text-emerald-800 border-transparent hover:border-slate-100'
                }`}
            >
              Academics
            </button>
            <button
              onClick={() => setActivePage('admissions')}
              className={`px-3.5 py-2 rounded-xl transition-all duration-300 cursor-pointer border ${activePage === 'admissions'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100/80 shadow-xs'
                  : 'text-slate-500 hover:bg-slate-50/80 hover:text-emerald-800 border-transparent hover:border-slate-100'
                }`}
            >
              Admissions
            </button>
            <button
              onClick={() => setActivePage('contact')}
              className={`px-3.5 py-2 rounded-xl transition-all duration-300 cursor-pointer border ${activePage === 'contact'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100/80 shadow-xs'
                  : 'text-slate-500 hover:bg-slate-50/80 hover:text-emerald-800 border-transparent hover:border-slate-100'
                }`}
            >
              Contact Us
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigateToLogin()}
              id="landing-login-btn"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center space-x-2 uppercase tracking-wide"
            >
              <span>Portal Login</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs Quick Strip */}
        <div className="flex md:hidden items-center justify-around mt-2 pt-2 border-t border-slate-100 overflow-x-auto text-[10px] uppercase font-bold tracking-wider text-slate-400 gap-2 shrink-0">
          <button
            onClick={() => setActivePage('home')}
            className={`px-2 py-1 rounded ${activePage === 'home' ? 'bg-emerald-50 text-emerald-800 font-extrabold' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => setActivePage('about')}
            className={`px-2 py-1 rounded ${activePage === 'about' ? 'bg-emerald-50 text-emerald-800 font-extrabold' : ''}`}
          >
            About
          </button>
          <button
            onClick={() => setActivePage('academics')}
            className={`px-2 py-1 rounded ${activePage === 'academics' ? 'bg-emerald-50 text-emerald-800 font-extrabold' : ''}`}
          >
            Academics
          </button>
          <button
            onClick={() => setActivePage('admissions')}
            className={`px-2 py-1 rounded ${activePage === 'admissions' ? 'bg-emerald-50 text-emerald-800 font-extrabold' : ''}`}
          >
            Admissions
          </button>
          <button
            onClick={() => setActivePage('contact')}
            className={`px-2 py-1 rounded ${activePage === 'contact' ? 'bg-emerald-50 text-emerald-800 font-extrabold' : ''}`}
          >
            Contact
          </button>
        </div>
      </nav>

      <div className="flex-1">

        {/* ==================== PAGE 1: HOME ==================== */}
        {activePage === 'home' && (
          <div className="animate-fade-in">
            {/* Dynamic Interactive Hero Carousel */}
            <HeroCarousel
              onNavigateToAdmissions={() => setActivePage('admissions')}
              onNavigateToAbout={() => setActivePage('about')}
              onNavigateToLogin={onNavigateToLogin}
            />

            {/* Bento Information Grid: Stats, Trust Markers & Live Campus Broadcast */}
            <section className="bg-slate-50 py-16 px-4 border-b border-slate-100">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Side: Performance Metrics & Trust Badges (7 columns) */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[11px] font-black uppercase tracking-wider">
                      <Sparkles size={12} className="text-emerald-600" />
                      <span>Ecosystem Performance</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                      Raised to Lead: Outstanding Achievements at Edweso Royal Academy
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-2xl">
                      Edweso Royal Academy couples international standard facilities and curriculum models with stellar local performance standards. From our 100% BECE completion rates to our direct cashless Paystack platform, we lead.
                    </p>
                  </div>

                  {/* High-Impact Stat Blocks */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    <div className="bg-white p-4 rounded-xl border border-slate-200/50 shadow-xs hover:shadow-md transition-all">
                      <span className="text-2xl sm:text-3xl font-black text-emerald-700 block">450+</span>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Active Pupils</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200/50 shadow-xs hover:shadow-md transition-all">
                      <span className="text-2xl sm:text-3xl font-black text-emerald-700 block">25+</span>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Top Teachers</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200/50 shadow-xs hover:shadow-md transition-all">
                      <span className="text-2xl sm:text-3xl font-black text-emerald-700 block">100%</span>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">BECE Success</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200/50 shadow-xs hover:shadow-md transition-all">
                      <span className="text-2xl sm:text-3xl font-black text-emerald-700 block">GHS 0</span>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Hidden Fees</span>
                    </div>
                  </div>

                  {/* Additional Trust Badges */}
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl grid grid-cols-3 gap-2 text-center text-emerald-800">
                    <div>
                      <span className="text-xs sm:text-sm font-black text-emerald-950 block">★ 4.9/5</span>
                      <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">Parent Rating</span>
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-black text-emerald-950 block">NaCCA</span>
                      <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">GES Approved</span>
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-black text-emerald-950 block">Fully Digital</span>
                      <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">Paystack Synced</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Campus Notice Board & Broadcasts (5 columns) */}
                <div className="lg:col-span-5">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Campus Broadcast</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">Term III Active</span>
                    </div>

                    <div className="space-y-3.5">
                      {/* Notice 1 */}
                      <div className="p-3 bg-emerald-950/40 border border-emerald-900/40 rounded-xl space-y-1">
                        <div className="flex justify-between text-[9px] font-mono text-emerald-400 font-bold uppercase">
                          <span>Academic Notice</span>
                          <span>Today</span>
                        </div>
                        <h4 className="font-extrabold text-xs text-white">Continuous Assessment (SBA) Review</h4>
                        <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                          Teachers are uploading Term III assessment records. Parents can check active class grade metrics.
                        </p>
                      </div>

                      {/* Notice 2 */}
                      <div className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-xl space-y-1">
                        <div className="flex justify-between text-[9px] font-mono text-amber-400 font-bold uppercase">
                          <span>Financial Update</span>
                          <span>Yesterday</span>
                        </div>
                        <h4 className="font-extrabold text-xs text-white">Paystack MoMo Portal Online</h4>
                        <p className="text-[11px] text-slate-300/80 leading-relaxed">
                          Pay tuition fees instantly with MTN, Telecel, or AirtelTigo. Instant digitized receipting active.
                        </p>
                      </div>

                      {/* Notice 3 */}
                      <div className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-xl space-y-1">
                        <div className="flex justify-between text-[9px] font-mono text-emerald-400 font-bold uppercase">
                          <span>School Calendar</span>
                          <span>July 18, 2026</span>
                        </div>
                        <h4 className="font-extrabold text-xs text-white">Upcoming PTA General Meeting</h4>
                        <p className="text-[11px] text-slate-300/80 leading-relaxed">
                          Join us at the Main Assembly Hall to review academic targets and infrastructure updates.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActivePage('contact')}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Mail size={12} />
                      <span>Inquire About Enrollment</span>
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-16 sm:py-20 px-4 max-w-7xl mx-auto space-y-12">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Our Custom Management Ecosystem
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Everything our administrative, teaching, and student bodies need, unified under one highly performant digital SaaS portal.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-100 p-6 rounded-xl shadow-xs hover:shadow-md transition-all group duration-300 hover:border-emerald-500/20"
                  >
                    <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-emerald-50 transition-colors">
                      {feat.icon}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-2">{feat.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Ghana Educational Standards Callout */}
            <section className="bg-emerald-950 text-white py-16 px-4">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="text-amber-400 font-bold text-xs uppercase tracking-widest">National Standards Approved</div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-sans leading-tight">Ghana Curriculum Built For 21st Century Brilliance</h2>
                  <p className="text-emerald-200 text-xs sm:text-sm leading-relaxed">
                    At Edweso Royal Academy, we strictly implement the National Council for Curriculum and Assessment (NaCCA) guidelines. We combine core academic competencies with practical computing, moral character learning (RME), and physical culture development.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="text-amber-400 shrink-0 mt-1" size={16} />
                      <p className="text-xs text-emerald-100 font-medium">Highly certified teachers from top-tier pedagogical universities (UEW & UCC).</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="text-amber-400 shrink-0 mt-1" size={16} />
                      <p className="text-xs text-emerald-100 font-medium">Fully equipped ICT Laboratory with personal computers and high-speed internet.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="text-amber-400 shrink-0 mt-1" size={16} />
                      <p className="text-xs text-emerald-100 font-medium">Continuous evaluations coupled with direct online fees settlement via Paystack.</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setActivePage('academics')}
                      className="inline-flex items-center space-x-2 text-amber-400 hover:text-amber-300 font-bold text-sm"
                    >
                      <span>Explore Our Curriculum Details</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="bg-emerald-900 border border-emerald-800 p-6 rounded-2xl shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                        <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      </div>
                      <span className="font-mono text-xs text-emerald-400">edweso-academy-live-terminal</span>
                    </div>

                    <div className="space-y-3 font-mono text-xs text-emerald-200">
                      <p className="text-emerald-400">// Collation of JHS 2 Terminal Results</p>
                      <div className="p-3 bg-emerald-950/80 rounded border border-emerald-800/50 space-y-1 text-[11px]">
                        <p>Student: <strong className="text-white">Kofi Mensah Jnr</strong></p>
                        <p>Class Score (30%): 24 / 30</p>
                        <p>Exam Score (70%): 58 / 70</p>
                        <p>Total Aggregate: 82% (Grade A - Excellent)</p>
                      </div>
                      <p className="text-amber-400">// Transaction logged via Paystack MTN MoMo</p>
                      <div className="p-3 bg-emerald-950/80 rounded border border-emerald-800/50 space-y-1 text-[11px]">
                        <p>Ref: <strong className="text-white">PSTK-734891240</strong></p>
                        <p>Amount: GHS 1,250.00 | Status: SUCCESS</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-16 sm:py-20 px-4 bg-slate-100">
              <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">What Our Royal Parents Say</h2>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    We partner closely with parents to ensure continuous developmental tracking, moral values, and academic excellence.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {testimonials.map((test, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl shadow-xs border border-slate-200/50 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex space-x-1 text-amber-500">
                          {[...Array(test.rating)].map((_, i) => (
                            <Star key={i} size={14} fill="currentColor" />
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 italic leading-relaxed">"{test.quote}"</p>
                      </div>
                      <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                        <div>
                          <h5 className="font-extrabold text-xs text-slate-900">{test.author}</h5>
                          <p className="text-[10px] text-slate-500">{test.role}</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {test.location}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ==================== PAGE 2: ABOUT US ==================== */}
        {activePage === 'about' && (
          <div className="animate-fade-in space-y-12 py-12 px-4 max-w-7xl mx-auto">

            {/* Header Section */}
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <span className="text-xs font-extrabold uppercase bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-500/15">Who We Are</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">Our History, Vision & Values</h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Edweso Royal Academy stands as a beacon of standard K-12 learning in the Edweso Municipality, raising character-driven, highly proficient leaders since 2012.
              </p>
            </div>

            {/* Grid Story */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="font-mono text-emerald-700 text-xs font-bold uppercase tracking-widest block">// A Humble Genesis</span>
                  <h2 className="text-2xl font-bold text-slate-900 leading-snug">From 15 Pupils to Ashanti's Educational Pillar</h2>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Established in September 2012 with a pioneer cohort of only 15 primary children, our goal was simple yet profound: to build an educational hub that does not force rote learning, but rather inspires holistic comprehension, high discipline, and technological mastery.
                </p>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Today, Edweso Royal Academy houses over 450 active students spanning primary levels up to Senior High School. Equipped with modern computing, scientific labs, and a fully accredited National Council for Curriculum and Assessment (NaCCA) syllabus, our graduates consistently excel in BECE and regional STEM competitions.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
                    <span className="text-2xl font-black text-emerald-800 block">2012</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Year Founded</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-center">
                    <span className="text-2xl font-black text-amber-600 block">Grade A</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">GES Classification</span>
                  </div>
                </div>
              </div>

              {/* Mission Vision Bento */}
              <div className="space-y-6">
                <div className="p-6 bg-emerald-900 text-white rounded-2xl shadow-md border-r-4 border-amber-400">
                  <div className="flex items-center space-x-3 mb-3">
                    <Sparkles className="text-amber-400" size={20} />
                    <h3 className="font-extrabold text-base uppercase tracking-wider">Our Sacred Mission</h3>
                  </div>
                  <p className="text-xs text-emerald-100 leading-relaxed">
                    To deliver premium, values-based, technology-integrated education that empowers students with core problem-solving capability, strong moral integrity, and the confidence to lead within Ghana and the global landscape.
                  </p>
                </div>

                <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-md border-r-4 border-emerald-600">
                  <div className="flex items-center space-x-3 mb-3">
                    <Building2 className="text-emerald-400" size={20} />
                    <h3 className="font-extrabold text-base uppercase tracking-wider">Our vision</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    To be acknowledged as the most prestigious model institution in the Ashanti Region for comprehensive academic rigor, STEM competence, character grooming, and practical digital literacy by 2030.
                  </p>
                </div>
              </div>
            </div>

            {/* Core Values */}
            <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-xs space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-extrabold text-slate-900">Values We Cultivate Daily</h3>
                <p className="text-xs text-slate-400">The cultural DNA governing students, parents, and faculty alike.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold mx-auto">K</div>
                  <h4 className="font-bold text-xs text-slate-950">Knowledge</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">Striving for deep cognitive understanding, critical research, and analytical problem-solving.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold mx-auto">D</div>
                  <h4 className="font-bold text-xs text-slate-950">Discipline</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">Instilling self-control, prompt attendance, respect for elders, and community responsibility.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold mx-auto">E</div>
                  <h4 className="font-bold text-xs text-slate-950">Excellence</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">Refusing average scores. Working hard to record straight 'A's in the continuous terminal ledgers.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold mx-auto">I</div>
                  <h4 className="font-bold text-xs text-slate-950">Innovation</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">Embracing computers, typing, core programming, and modern sciences to remain future-ready.</p>
                </div>
              </div>
            </div>

            {/* Leadership Faculty */}
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 block">Royal Leadership</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">Our Senior School Administrators</h3>
                <p className="text-xs text-slate-400">Guiding the academic and physical progress of the student body.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center space-x-4">
                  <div className="w-14 h-14 bg-emerald-50 rounded-full text-emerald-800 flex items-center justify-center font-extrabold text-lg shrink-0 border border-emerald-100">
                    JA
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-900">Principal J. K. Appiah</h5>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Head of Administration</p>
                    <p className="text-[9px] text-emerald-700 mt-1">M.Ed. (Winneba University)</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center space-x-4">
                  <div className="w-14 h-14 bg-emerald-50 rounded-full text-emerald-800 flex items-center justify-center font-extrabold text-lg shrink-0 border border-emerald-100">
                    MM
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-900">Madam Margaret Mensah</h5>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">VP Academic Affairs</p>
                    <p className="text-[9px] text-emerald-700 mt-1">B.Sc Science (UCC Cape Coast)</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center space-x-4">
                  <div className="w-14 h-14 bg-emerald-50 rounded-full text-emerald-800 flex items-center justify-center font-extrabold text-lg shrink-0 border border-emerald-100">
                    KB
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-900">Mr. Kwame Boateng</h5>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Senior Master & JHS Head</p>
                    <p className="text-[9px] text-emerald-700 mt-1">Syllabus Coordinator</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==================== PAGE 3: ACADEMICS ==================== */}
        {activePage === 'academics' && (
          <div className="animate-fade-in space-y-12 py-12 px-4 max-w-7xl mx-auto">

            {/* Header Section */}
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <span className="text-xs font-extrabold uppercase bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-500/15">Syllabus & Curriculum</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Our Academic Department Divisions</h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Adhering tightly to the Ghana Education Service (GES) and NaCCA directives to foster holistic development.
              </p>
            </div>

            {/* Department Selection Selector */}
            <div className="flex justify-center space-x-2 border-b border-slate-200/50 pb-2 max-w-md mx-auto">
              <button
                onClick={() => setAcademicDept('primary')}
                className={`px-4 py-2 text-xs font-extrabold rounded-lg uppercase tracking-wider transition-all ${academicDept === 'primary'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-500 hover:bg-slate-100'
                  }`}
              >
                Primary School
              </button>
              <button
                onClick={() => setAcademicDept('jhs')}
                className={`px-4 py-2 text-xs font-extrabold rounded-lg uppercase tracking-wider transition-all ${academicDept === 'jhs'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-500 hover:bg-slate-100'
                  }`}
              >
                Junior High (JHS)
              </button>
              <button
                onClick={() => setAcademicDept('shs')}
                className={`px-4 py-2 text-xs font-extrabold rounded-lg uppercase tracking-wider transition-all ${academicDept === 'shs'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-500 hover:bg-slate-100'
                  }`}
              >
                Senior High (SHS)
              </button>
            </div>

            {/* Dept details content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left description */}
              <div className="lg:col-span-1 space-y-4">
                {academicDept === 'primary' && (
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-emerald-700 uppercase block tracking-wider">Foundation Division</span>
                    <h3 className="text-xl font-bold text-slate-900">Preschool & Lower/Upper Primary</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      At the primary level, we establish robust foundational literacy and computational mathematics. Children explore fundamental physical science, Twi, English grammar, and Creative Arts.
                    </p>
                    <div className="bg-slate-100 p-4 rounded-xl space-y-1.5 border border-slate-200/40 text-[11px] text-slate-600 font-semibold">
                      <p className="text-slate-800 font-bold">Key Focus Areas:</p>
                      <p>• Phonics & Reading Comprehension</p>
                      <p>• Intuitive Numeracy & Arithmetic blocks</p>
                      <p>• Introduction to Computers (Computer lab visits)</p>
                      <p>• Character & Cultural Grooming</p>
                    </div>
                  </div>
                )}

                {academicDept === 'jhs' && (
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-emerald-700 uppercase block tracking-wider">Continuous Assessment Division</span>
                    <h3 className="text-xl font-bold text-slate-900">Junior High School (JHS 1 - JHS 3)</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Rigorous grooming prepared for the Basic Education Certificate Examination (BECE). We implement the strict continuous assessment system (30% internal class work, 70% written examinations).
                    </p>
                    <div className="bg-slate-100 p-4 rounded-xl space-y-1.5 border border-slate-200/40 text-[11px] text-slate-600 font-semibold">
                      <p className="text-slate-800 font-bold">Key Focus Areas:</p>
                      <p>• Integrated Science & Lab Practicals</p>
                      <p>• Core Mathematics & Algebra</p>
                      <p>• Practical ICT (Computer typing & programming theory)</p>
                      <p>• Religious & Moral Education (RME)</p>
                    </div>
                  </div>
                )}

                {academicDept === 'shs' && (
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-emerald-700 uppercase block tracking-wider">Pre-University Division</span>
                    <h3 className="text-xl font-bold text-slate-900">Senior High School (SHS 1)</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Pre-tertiary academic division focus on high-tier science, business, and general arts pathways to ensure a 100% pass rate in the WASSCE.
                    </p>
                    <div className="bg-slate-100 p-4 rounded-xl space-y-1.5 border border-slate-200/40 text-[11px] text-slate-600 font-semibold">
                      <p className="text-slate-800 font-bold">Key Focus Areas:</p>
                      <p>• Advanced Physics, Chemistry & Biology Labs</p>
                      <p>• Elective Mathematics & Core English</p>
                      <p>• Business Accounting & Commerce</p>
                      <p>• SAT & Tertiary Entrance Grooming</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right standard timetable schedule */}
              <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-emerald-700" size={18} />
                    <h4 className="font-extrabold text-xs uppercase tracking-wide">Sample Department Hour blocks</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">Weekdays 8:00 AM - 2:00 PM</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b uppercase font-bold tracking-wider text-[10px] text-slate-400 bg-slate-50">
                        <th className="p-2.5">Hour Block</th>
                        <th className="p-2.5">Monday</th>
                        <th className="p-2.5">Tuesday</th>
                        <th className="p-2.5">Wednesday</th>
                        <th className="p-2.5">Thursday</th>
                        <th className="p-2.5">Friday</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="p-2.5 font-bold font-mono text-emerald-800">08:00 - 09:30</td>
                        <td className="p-2.5">{academicDept === 'primary' ? 'English Grammar' : academicDept === 'jhs' ? 'Core Math' : 'Elective Math'}</td>
                        <td className="p-2.5">{academicDept === 'primary' ? 'Maths Basics' : academicDept === 'jhs' ? 'Integrated Science' : 'Physics Lab'}</td>
                        <td className="p-2.5">{academicDept === 'primary' ? 'Twi Reading' : academicDept === 'jhs' ? 'ICT Lab Block' : 'English Lit'}</td>
                        <td className="p-2.5">{academicDept === 'primary' ? 'Basic Science' : academicDept === 'jhs' ? 'Core Math' : 'Elective Math'}</td>
                        <td className="p-2.5">{academicDept === 'primary' ? 'Phonics Reading' : academicDept === 'jhs' ? 'Twi/Ghanaian Lang' : 'Core Science'}</td>
                      </tr>
                      <tr className="bg-slate-50 text-[10px] text-center font-bold text-slate-400 italic">
                        <td colSpan={6} className="p-1">Short Break (30 Mins)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold font-mono text-emerald-800">10:00 - 11:30</td>
                        <td className="p-2.5">{academicDept === 'primary' ? 'Creative Arts' : academicDept === 'jhs' ? 'Integrated Science' : 'Chemistry Lab'}</td>
                        <td className="p-2.5">{academicDept === 'primary' ? 'Moral RME' : academicDept === 'jhs' ? 'Social Studies' : 'Accounting Basics'}</td>
                        <td className="p-2.5">{academicDept === 'primary' ? 'Math Arithmetic' : academicDept === 'jhs' ? 'Religious/RME' : 'Economics Block'}</td>
                        <td className="p-2.5">{academicDept === 'primary' ? 'English Spell' : academicDept === 'jhs' ? 'Social Studies' : 'General Paper'}</td>
                        <td className="p-2.5">{academicDept === 'primary' ? 'Outdoor Sports' : academicDept === 'jhs' ? 'Weekly Quiz' : 'ICT Innovation'}</td>
                      </tr>
                      <tr className="bg-slate-50 text-[10px] text-center font-bold text-slate-400 italic">
                        <td colSpan={6} className="p-1">Lunch Break / Assembly Hour</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold font-mono text-emerald-800">12:30 - 14:00</td>
                        <td className="p-2.5">Library Reading</td>
                        <td className="p-2.5">Creative Drawing</td>
                        <td className="p-2.5">Syllabus Review</td>
                        <td className="p-2.5">Practical Computers</td>
                        <td className="p-2.5">Character counseling</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center space-x-2 text-[10px] text-emerald-800 font-semibold bg-emerald-50 p-2.5 rounded">
                  <Info size={14} className="shrink-0" />
                  <span>Interactive timetables prevent scheduling overlaps for teachers and classes automatically inside the school database.</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== PAGE 4: ADMISSIONS ==================== */}
        {activePage === 'admissions' && (
          <div className="animate-fade-in py-12 px-4 max-w-7xl mx-auto space-y-12">

            {/* Header */}
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <span className="text-xs font-extrabold uppercase bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-500/15">Enrollment 2026/2027</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">School Admissions & Tuition Fee Structure</h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Clear, transparent, and direct pricing with zero hidden charges. Submit an online enrollment inquiry below to reserve a seat.
              </p>
            </div>

            {/* Fee Schedule Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col justify-between text-center relative overflow-hidden group hover:border-emerald-500/25 transition-colors">
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Preschool</span>
                  <h4 className="font-extrabold text-base text-slate-950">Lower Primary</h4>
                  <p className="text-3xl font-black text-emerald-800 mt-2">GHS 1,000</p>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-widest mt-1">Per Term Tuition</span>
                </div>
                <div className="border-t border-slate-50 mt-4 pt-3 text-[10px] text-slate-500 space-y-1.5 text-left font-medium">
                  <p className="flex justify-between"><span>Computer Lab:</span><strong>GHS 150</strong></p>
                  <p className="flex justify-between"><span>Dev Levy:</span><strong>GHS 200</strong></p>
                  <p className="flex justify-between"><span>Sports & Health:</span><strong>GHS 50</strong></p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col justify-between text-center relative overflow-hidden group hover:border-emerald-500/25 transition-colors">
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Primary 5 - 6</span>
                  <h4 className="font-extrabold text-base text-slate-950">Upper Primary</h4>
                  <p className="text-3xl font-black text-emerald-800 mt-2">GHS 1,200</p>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-widest mt-1">Per Term Tuition</span>
                </div>
                <div className="border-t border-slate-50 mt-4 pt-3 text-[10px] text-slate-500 space-y-1.5 text-left font-medium">
                  <p className="flex justify-between"><span>Computer Lab:</span><strong>GHS 150</strong></p>
                  <p className="flex justify-between"><span>Dev Levy:</span><strong>GHS 200</strong></p>
                  <p className="flex justify-between"><span>Sports & Health:</span><strong>GHS 50</strong></p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-emerald-500/20 bg-emerald-50/10 flex flex-col justify-between text-center relative overflow-hidden group hover:border-emerald-500/25 transition-colors">
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[8px] font-bold uppercase px-2 py-0.5 rounded-bl">Popular</div>
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">JHS 1 - JHS 3</span>
                  <h4 className="font-extrabold text-base text-slate-950">Junior High (JHS)</h4>
                  <p className="text-3xl font-black text-emerald-800 mt-2">GHS 1,800</p>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-widest mt-1">Per Term Tuition</span>
                </div>
                <div className="border-t border-emerald-500/10 mt-4 pt-3 text-[10px] text-slate-500 space-y-1.5 text-left font-medium">
                  <p className="flex justify-between"><span>Computer Lab:</span><strong>GHS 150</strong></p>
                  <p className="flex justify-between"><span>Dev Levy:</span><strong>GHS 200</strong></p>
                  <p className="flex justify-between"><span>Sports & Health:</span><strong>GHS 50</strong></p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col justify-between text-center relative overflow-hidden group hover:border-emerald-500/25 transition-colors">
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pre-University</span>
                  <h4 className="font-extrabold text-base text-slate-950">Senior High (SHS)</h4>
                  <p className="text-3xl font-black text-emerald-800 mt-2">GHS 2,500</p>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-widest mt-1">Per Term Tuition</span>
                </div>
                <div className="border-t border-slate-50 mt-4 pt-3 text-[10px] text-slate-500 space-y-1.5 text-left font-medium">
                  <p className="flex justify-between"><span>Computer Lab:</span><strong>GHS 200</strong></p>
                  <p className="flex justify-between"><span>Dev Levy:</span><strong>GHS 250</strong></p>
                  <p className="flex justify-between"><span>Sports & Health:</span><strong>GHS 100</strong></p>
                </div>
              </div>

            </div>

            {/* Admission Inquiry interactive Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start bg-white border border-slate-200/50 p-6 sm:p-8 rounded-2xl shadow-xs">

              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase block tracking-wider">// Enrollment Pipeline</span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">3 Simple Steps to Enroll Your Child</h3>
                </div>

                <div className="space-y-5">
                  <div className="flex items-start space-x-4">
                    <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">1</span>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">Submit Inquiry Form</h5>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1">Fill out the parent details and student grade level on this portal. It directly records the inquiry under the administrator console.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">2</span>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">Entrance Assessment Interview</h5>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1">Admissions staff will phone you to schedule a primary reading or mathematics aptitude assessment to evaluate appropriate class placement.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">3</span>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">Filing & Fees Clearance</h5>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1">Clear termly tuition and computer fees directly via the Paystack student portal (Mobile Money MTN/Telecel) to trigger automated admission card generation.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form container */}
              <div className="lg:col-span-7">
                {isAdmissionSubmitted ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-xl space-y-4 text-center animate-fade-in">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 mx-auto font-black">
                      <ShieldCheck size={28} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-emerald-800 text-sm uppercase">Inquiry Lodged Successfully!</h4>
                      <p className="text-[10px] font-mono text-emerald-600 font-bold uppercase">Reference: {submittedInquiryId}</p>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed max-w-md mx-auto">
                      Thank you for applying to Edweso Royal Academy! We have recorded your admissions interest inside our admin database dashboard. Our Registrar will call your phone coordinate shortly.
                    </p>
                    <button
                      onClick={() => setIsAdmissionSubmitted(false)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded transition-colors"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAdmissionSubmit} className="space-y-4 text-xs font-semibold">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Parent/Guardian Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Seth Tetteh"
                          value={admissionForm.parentName}
                          onChange={(e) => setAdmissionForm({ ...admissionForm, parentName: e.target.value })}
                          className="w-full bg-slate-100 border border-slate-200/50 p-2.5 rounded font-bold focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Parent Mobile Coordinates</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. +233 24 777 6666"
                          value={admissionForm.parentPhone}
                          onChange={(e) => setAdmissionForm({ ...admissionForm, parentPhone: e.target.value })}
                          className="w-full bg-slate-100 border border-slate-200/50 p-2.5 rounded font-bold focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Parent Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. parent@yahoo.com"
                          value={admissionForm.parentEmail}
                          onChange={(e) => setAdmissionForm({ ...admissionForm, parentEmail: e.target.value })}
                          className="w-full bg-slate-100 border border-slate-200/50 p-2.5 rounded font-bold focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Student Grade Interest</label>
                        <select
                          value={admissionForm.gradeLevel}
                          onChange={(e) => setAdmissionForm({ ...admissionForm, gradeLevel: e.target.value })}
                          className="w-full bg-slate-100 border border-slate-200/50 p-2.5 rounded font-bold focus:outline-hidden text-xs"
                        >
                          <option value="Primary 5">Primary 5</option>
                          <option value="Primary 6">Primary 6</option>
                          <option value="JHS 1">JHS 1</option>
                          <option value="JHS 2">JHS 2</option>
                          <option value="JHS 3">JHS 3</option>
                          <option value="SHS 1">SHS 1</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Student Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Samuel Kofi Mensah"
                        value={admissionForm.studentName}
                        onChange={(e) => setAdmissionForm({ ...admissionForm, studentName: e.target.value })}
                        className="w-full bg-slate-100 border border-slate-200/50 p-2.5 rounded font-bold focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Special instructions or requests</label>
                      <textarea
                        rows={3}
                        placeholder="State diagnostic remarks, previous schools, or query notes..."
                        value={admissionForm.message}
                        onChange={(e) => setAdmissionForm({ ...admissionForm, message: e.target.value })}
                        className="w-full bg-slate-100 border border-slate-200/50 p-2.5 rounded focus:outline-hidden text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold uppercase tracking-wider rounded text-xs transition-colors flex items-center justify-center space-x-2"
                    >
                      <Send size={14} />
                      <span>Submit Enrollment Application</span>
                    </button>
                  </form>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ==================== PAGE 5: CONTACT US ==================== */}
        {activePage === 'contact' && (
          <div className="animate-fade-in py-12 px-4 max-w-7xl mx-auto space-y-12">

            {/* Header */}
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <span className="text-xs font-extrabold uppercase bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-500/15">Locate & Message</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Reach the Edweso Administration</h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Have a general query, PTA feedback, or partnership suggestion? Contact us directly.
              </p>
            </div>

            {/* Quick Cards Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-start space-x-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-950 uppercase tracking-wide">Telephone Coordinates</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Main Admin: +233 24 412 3456 <br />
                    PTA Liaison: +233 20 123 4567 <br />
                    Registrar: +233 54 876 5432
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-start space-x-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-950 uppercase tracking-wide">Electronic Mails</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Admissions: admissions@edweso.edu.gh <br />
                    Principal Desk: principal@edweso.edu.gh <br />
                    General Info: info@edweso.edu.gh
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-start space-x-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-950 uppercase tracking-wide">Physical Campus location</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    P.O. Box 24, Municipal Assembly Road, <br />
                    Edweso, Ashanti Region, <br />
                    Ghana
                  </p>
                </div>
              </div>
            </div>

            {/* Simulated Google Map Map & Contact form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

              {/* Google Map Mockup */}
              <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b pb-3 border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Visual Campus Map</span>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-bold uppercase">Pulsing Active Location</span>
                </div>

                {/* Elegant Simulated Vector Map UI */}
                <div className="h-64 bg-slate-100 rounded-lg relative overflow-hidden border border-slate-200/50 flex flex-col justify-between p-3 select-none">
                  <div className="absolute inset-0 opacity-25">
                    {/* Simulated street lines */}
                    <div className="absolute top-1/4 left-0 w-full h-1 bg-slate-400"></div>
                    <div className="absolute top-2/3 left-0 w-full h-2 bg-slate-400"></div>
                    <div className="absolute top-0 left-1/3 w-2 h-full bg-slate-400"></div>
                    <div className="absolute top-0 left-2/3 w-1 h-full bg-slate-400"></div>
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-300 transform rotate-12"></div>
                  </div>

                  <div className="relative flex justify-between">
                    <span className="text-[8px] font-bold text-slate-400 uppercase bg-white/70 px-1 py-0.5 rounded">To Kumasi (Main Rd)</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase bg-white/70 px-1 py-0.5 rounded">Edweso Junction</span>
                  </div>

                  {/* Pulsing Active Pin marker */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <span className="absolute inline-flex h-8 w-8 rounded-full bg-emerald-500 opacity-40 animate-ping"></span>
                    <div className="w-4 h-4 bg-emerald-700 text-amber-400 border border-amber-300 rounded-full flex items-center justify-center font-bold text-[9px] shadow-md z-10">E</div>
                    <span className="bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded mt-1 shadow-sm whitespace-nowrap z-10">EDWESO ROYAL ACADEMY</span>
                  </div>

                  <div className="relative flex justify-between">
                    <span className="text-[8px] font-bold text-slate-400 uppercase bg-white/70 px-1 py-0.5 rounded">Municipal Assembly</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase bg-white/70 px-1 py-0.5 rounded">To Ejisu Rd</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  * Located directly behind the Edweso Municipal Assembly office. Parents can take standard transport to Edweso Junction, and take the school link spur for 2 minutes.
                </p>
              </div>

              {/* General Contact Form */}
              <div className="lg:col-span-7 bg-white border border-slate-200/40 rounded-2xl p-6 sm:p-8">
                {isContactSubmitted ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-xl space-y-4 text-center animate-fade-in font-sans">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 mx-auto font-black">
                      <CheckCircle2 size={24} />
                    </div>
                    <h4 className="font-extrabold text-emerald-800 text-xs uppercase">Message Dispatched!</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed max-w-sm mx-auto">
                      Thank you for contacting Edweso Royal Academy. Your general feedback/query message has been successfully logged into our live ledger. A representative will get in touch with you.
                    </p>
                    <button
                      onClick={() => setIsContactSubmitted(false)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded transition-colors"
                    >
                      Write Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4 text-xs font-semibold">
                    <h4 className="font-extrabold text-sm text-slate-900 border-b pb-2 mb-2">Write General Feedback Desk</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Your Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Seth Tetteh"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="w-full bg-slate-100 border border-slate-200/50 p-2.5 rounded font-bold focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Email Coordinates</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. seth@gmail.com"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full bg-slate-100 border border-slate-200/50 p-2.5 rounded font-bold focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Telephone Contact</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. +233 24 777 6666"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          className="w-full bg-slate-100 border border-slate-200/50 p-2.5 rounded font-bold focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Query Category</label>
                        <select
                          value={contactForm.type}
                          onChange={(e) => setContactForm({ ...contactForm, type: e.target.value as any })}
                          className="w-full bg-slate-100 border border-slate-200/50 p-2.5 rounded font-bold focus:outline-hidden text-xs"
                        >
                          <option value="General">General Inquiry</option>
                          <option value="Feedback">Feedback / Suggestion</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Detailed Message Content</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="State your feedback or administrative questions in detail..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full bg-slate-100 border border-slate-200/50 p-2.5 rounded focus:outline-hidden text-xs leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold uppercase tracking-wider rounded text-xs transition-colors flex items-center justify-center space-x-2"
                    >
                      <Send size={14} />
                      <span>Transmit Message</span>
                    </button>
                  </form>
                )}
              </div>

            </div>

          </div>
        )}

        {activePage === 'parent-resources' && (
          <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in font-sans">
            {/* Header banner */}
            <div className="bg-emerald-800 text-white p-8 sm:p-12 rounded-3xl relative overflow-hidden mb-12 shadow-md">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-12 translate-x-12">
                <HeartHandshake size={320} />
              </div>
              <div className="relative z-10 max-w-2xl space-y-4">
                <span className="bg-emerald-600 text-amber-300 font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                  Parent Collaboration Hub
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
                  Co-Navigating Academic Excellence & Moral Integrity
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
                  We believe that education is a sacred partnership between families and the academy. Access handbook policies, syllabus guides, MoMo tutorials, and active terminal resources here.
                </p>
              </div>
            </div>

            {/* Essential Downloads section */}
            <div className="space-y-6 mb-16">
              <div className="border-b pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Essential Institutional Downloads</h3>
                  <p className="text-xs text-slate-500 font-medium">Verify official regulatory handbooks, fee codes, and GES guidelines.</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Verified Term III Documents</span>
                </div>
              </div>

              {/* Categorization Tabs */}
              <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl max-w-md">
                {[
                  { id: 'academic', label: 'Academic' },
                  { id: 'administrative', label: 'Administrative' },
                  { id: 'extracurricular', label: 'Extracurricular' }
                ].map((tab) => {
                  const isActive = selectedResourceTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedResourceTab(tab.id as any)}
                      className={`flex-1 py-2 text-center text-[11px] font-black rounded-lg transition-all duration-300 cursor-pointer ${isActive
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: "GES Curriculum Standard Syllabus",
                    desc: "Overview of Ghana Education Service learning indicators for JHS and Primary levels.",
                    size: "4.8 MB",
                    format: "PDF",
                    date: "Regulatory Standard",
                    category: "academic"
                  },
                  {
                    title: "Term III Scheme of Learning",
                    desc: "Detailed weekly subject breakdown, lesson objectives, and textbook references for all JHS grades.",
                    size: "1.8 MB",
                    format: "PDF",
                    date: "Term III Standard",
                    category: "academic"
                  },
                  {
                    title: "Continuous Assessment Guidelines",
                    desc: "Detailed rubric explaining class tests, project work, and grading weights for continuous evaluation.",
                    size: "1.2 MB",
                    format: "PDF",
                    date: "GES Compliant",
                    category: "academic"
                  },
                  {
                    title: "ERA Parent Handbook 2026",
                    desc: "Official school rules, uniform dress code, discipline guidelines, and terminal policies.",
                    size: "2.4 MB",
                    format: "PDF",
                    date: "Updated June 2026",
                    category: "administrative"
                  },
                  {
                    title: "Term III Comprehensive Calendar",
                    desc: "Key dates for continuous assessments, midterm holidays, exams, and PTA meetings.",
                    size: "1.1 MB",
                    format: "PDF",
                    date: "Released May 2026",
                    category: "administrative"
                  },
                  {
                    title: "MoMo Paystack Tuition Setup Manual",
                    desc: "Step-by-step pictorial guide on authorizing secure payments via Mobile Money networks.",
                    size: "820 KB",
                    format: "PDF",
                    date: "Aesthetic Billing Setup",
                    category: "administrative"
                  },
                  {
                    title: "Sports & Athletic Club Sign-up",
                    desc: "Consent sheets, schedules, and gear requirements for football, athletics, and basketball teams.",
                    size: "950 KB",
                    format: "PDF",
                    date: "Term III Activities",
                    category: "extracurricular"
                  },
                  {
                    title: "Robotics & Coding Club Guide",
                    desc: "Curriculum outline and hardware kits checklist for the Edweso Royal STEM tech initiative.",
                    size: "1.5 MB",
                    format: "PDF",
                    date: "Innovative STEM",
                    category: "extracurricular"
                  },
                  {
                    title: "Creative Arts & Music Roster",
                    desc: "Details of our cultural drumming, theater workshops, and brass band rehearsals.",
                    size: "1.3 MB",
                    format: "PDF",
                    date: "Cultural Arts Block",
                    category: "extracurricular"
                  }
                ]
                  .filter(doc => doc.category === selectedResourceTab)
                  .map((doc, idx) => (
                    <div key={idx} className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:border-emerald-500/25 group animate-fade-in">
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-800 transition-colors">{doc.title}</h4>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">{doc.desc}</p>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between text-[10px] font-bold text-slate-400">
                        <div className="flex flex-col">
                          <span>{doc.size} • {doc.format}</span>
                          <span className="text-[9px] text-slate-300 font-semibold">{doc.date}</span>
                        </div>
                        <button
                          onClick={() => alert(`Document "${doc.title}" download triggered. The PDF helper has dispatched the local ledger payload.`)}
                          className="p-2 bg-slate-50 hover:bg-emerald-600 hover:text-white rounded-lg transition-all duration-300 text-slate-500 cursor-pointer"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Parent FAQs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t pt-12">
              <div className="lg:col-span-4 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                  <HelpCircle size={20} />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Parent Concern Desk (PTA FAQs)</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Have urgent questions about academic progress, transportation networks, feeding programs, or computer labs? Read our active regulatory answers.
                </p>
                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200/50 space-y-2">
                  <p className="text-[11px] text-slate-600 leading-relaxed font-bold">Need direct administrative feedback?</p>
                  <button
                    onClick={() => { setActivePage('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <span>Write General Query Desk</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-3">
                {[
                  {
                    q: "How do I track my child's terminal attendance & behavior logs?",
                    a: "Every morning at 8:00 AM, teachers complete the daily digitized roll-call ledger. This tracks physical presence, excused absences, and lateness. Behavioral milestones or uniform infractions are documented in the continuous evaluation log. Parents can login with their ward's unique index to view immediate reports, or request an official terminal overview sheet at our admin block."
                  },
                  {
                    q: "When is the academy shuttle bus active, and what routes are supported?",
                    a: "Our yellow shuttle service runs daily. Morning pickup begins at 6:30 AM covering Edweso main junction, the Municipal Assembly spur, and the housing estates. Afternoon return buses depart the school yard at 3:35 PM and complete drop-offs by 4:50 PM. Only registered students with active term boarding passes are authorized."
                  },
                  {
                    q: "How are student continuous evaluation assessment marks calculated?",
                    a: "In strict compliance with Ghana Education Service (GES) standards, terminal transcripts are split: Class exercises and weekly diagnostic tasks account for 30%, home assignments and specialized group projects account for 20%, and the comprehensive End-of-Term Assessment counts for 50%. Mid-term grades are published on week 6 to give families a clear progress signal."
                  },
                  {
                    q: "What is the academy's policy on personal smart devices and phones?",
                    a: "To preserve a focused, tech-safe environment, students are strictly forbidden from bringing personal smartphones, tablets, or gaming devices onto the campus. If an interactive computing workshop requires student devices, written permission slip cards are dispatched to parents in advance, and devices are locked safely with the headmistress upon entry."
                  },
                  {
                    q: "How can parents join the PTA (Parents Teachers Association) ledger?",
                    a: "Every guardian of an enrolled Edweso Royal Academy pupil is automatically added to the PTA roll. We gather for plenary consultations on the second Saturday of each academic term. In addition, we run localized WhatsApp information streams where class teachers push notifications. Ensure your telephone coordinates are verified with the Registrar."
                  }
                ].map((item, idx) => {
                  const isOpen = activeParentFaq === idx;
                  return (
                    <div key={idx} className="bg-white border border-slate-200/50 rounded-xl overflow-hidden transition-all duration-200">
                      <button
                        type="button"
                        onClick={() => setActiveParentFaq(isOpen ? null : idx)}
                        className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <span className="font-extrabold text-xs text-slate-800">{item.q}</span>
                        <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'transform rotate-180 text-emerald-700' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-600 leading-relaxed font-semibold">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activePage === 'careers' && (
          <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in font-sans">
            {/* Header banner */}
            <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl relative overflow-hidden mb-12 shadow-md border border-slate-800">
              <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform -translate-y-6 translate-x-6">
                <Briefcase size={340} />
              </div>
              <div className="relative z-10 max-w-2xl space-y-4">
                <span className="bg-amber-400 text-emerald-950 font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                  Join The Faculty
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-amber-300">
                  Shape The Next Generation Of West African Leaders
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  At Edweso Royal Academy, we employ facilitators of high moral character, academic rigor, and creative pedagogical vision. Discover competitive benefits, professional coaching workshops, and supportive tech facilities.
                </p>
              </div>
            </div>

            {/* Why Join US - 4 columns card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {[
                {
                  icon: <Award className="text-amber-500" size={20} />,
                  title: "Competitive Salary Structure",
                  desc: "Remuneration above GES benchmarks with regular performance-based bonuses."
                },
                {
                  icon: <Sparkles className="text-emerald-500" size={20} />,
                  title: "Continuous Training",
                  desc: "Fully paid workshops on digital pedagogy, modern ICT integration, and child psychology."
                },
                {
                  icon: <GraduationCap className="text-blue-500" size={20} />,
                  title: "Holistic Faculty Wellness",
                  desc: "Subsidized healthcare scheme, secure staff quarters, and free balanced hot daily lunch."
                },
                {
                  icon: <Users className="text-purple-500" size={20} />,
                  title: "Vibrant Local Culture",
                  desc: "Collaborate with high-integrity educators in the heart of Edweso, Ashanti Region."
                }
              ].map((benefit, idx) => (
                <div key={idx} className="bg-white border border-slate-200/50 p-5 rounded-2xl space-y-3 shadow-xs">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
                    {benefit.icon}
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900">{benefit.title}</h4>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>

            {/* Job Openings and Application Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t pt-12">
              {/* Job Listings Column (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Active Faculty Vacancies</h3>
                  <p className="text-xs text-slate-500 font-medium">Select a role to populate the digital application dispatch ledger below.</p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      position: "JHS ICT & Computing Specialist",
                      dept: "Junior High (Form 1 - 3)",
                      type: "Full Time (GES Compatible)",
                      salary: "Negotiable / Above Benchmark",
                      reqs: [
                        "Diploma or Degree in Computer Science / IT Education",
                        "Sound knowledge teaching Python, Scratch, and HTML to JHS pupils",
                        "Familiarity with the Ghana Basic Education ICT syllabus guidelines"
                      ]
                    },
                    {
                      position: "Primary School Class Facilitator (Class 5)",
                      dept: "Lower Primary Block",
                      type: "Full Time",
                      salary: "Negotiable",
                      reqs: [
                        "GES Certificate in Basic Education (CBE) or Montessori equivalent",
                        "Demonstrated skills in interactive arithmetic and reading games",
                        "High moral commitment and dedication to student discipline"
                      ]
                    },
                    {
                      position: "French Language Instructor",
                      dept: "Languages Block",
                      type: "Part Time / Contract",
                      salary: "Competitive Hourly Rate",
                      reqs: [
                        "Fluent oral and written French proficiency",
                        "Experience building engaging theatrical french sketches for children",
                        "Ability to conduct basic foreign culture appreciation classes"
                      ]
                    }
                  ].map((job, idx) => (
                    <div key={idx} className="bg-white border border-slate-200/50 p-6 rounded-2xl shadow-xs space-y-4 hover:border-emerald-500/30 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900">{job.position}</h4>
                          <span className="text-[10px] text-emerald-700 font-extrabold uppercase bg-emerald-50 px-2 py-0.5 rounded mr-2">
                            {job.dept}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">
                            {job.type}
                          </span>
                        </div>
                        <span className="text-xs font-black text-emerald-800">{job.salary}</span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Candidate Prerequisites:</p>
                        <ul className="space-y-1.5 text-[11px] text-slate-600 font-semibold leading-relaxed">
                          {job.reqs.map((req, ridx) => (
                            <li key={ridx} className="flex items-start gap-2">
                              <CheckCircle2 size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCareerForm({
                              ...careerForm,
                              position: job.position
                            });
                            setIsCareerModalOpen(true);
                          }}
                          className="px-4 py-2 bg-slate-900 hover:bg-emerald-700 hover:text-white text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer transform hover:-translate-y-0.5"
                        >
                          Apply For This Role
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promotional Callout Box with 'Apply Now' CTA */}
              <div className="lg:col-span-5 bg-white border border-slate-200/50 rounded-2xl p-6 sm:p-8 self-start space-y-6">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                  <Sparkles size={24} />
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-sm text-slate-900 uppercase">Faculty Application Portal</h4>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Edweso Royal Academy values dedication, pedagogical innovation, and exceptional moral character. Ready to make a real impact?
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-700" />
                    <span className="text-[11px] text-slate-700 font-bold">Paperless digital submission</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-700" />
                    <span className="text-[11px] text-slate-700 font-bold">PTA & GES compliant standards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-700" />
                    <span className="text-[11px] text-slate-700 font-bold">Immediate board feedback</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCareerForm({
                      ...careerForm,
                      position: 'JHS ICT & Computing Specialist'
                    });
                    setIsCareerModalOpen(true);
                  }}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold uppercase tracking-wider rounded-xl text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                >
                  <Send size={14} />
                  <span>Apply Now</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ==================== FOOTER AND DIRECT COORDINATES ==================== */}
      <div className="mt-auto">
        {/* Contact Strip Banner */}
        <section id="contact-banner" className="py-12 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img
                  src="/assets/images/logo.png"
                  alt="Edweso Royal Academy Logo"
                  className="w-12 h-12 rounded-xl object-contain border border-amber-400/15 shadow-xs"
                  referrerPolicy="no-referrer"
                />
                <span className="font-extrabold text-base tracking-tight text-emerald-800">Edweso Royal Academy</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Providing holistic, moral-based, and academic excellence in Edweso, Ashanti Region, Ghana since 2012. Our mandate is simple: Knowledge, Discipline, Excellence.
              </p>
              <div className="flex space-x-2 font-bold text-xs text-emerald-700 uppercase">
                <span className="bg-emerald-50 px-2 py-1 rounded">integrity</span>
                <span className="bg-emerald-50 px-2 py-1 rounded">leadership</span>
                <span className="bg-emerald-50 px-2 py-1 rounded">excellence</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-widest">Speak To Us</h4>
              <div className="space-y-2 text-xs text-slate-600 font-medium">
                <div className="flex items-center space-x-3">
                  <MapPin className="text-emerald-700 shrink-0" size={16} />
                  <span>Assembly Rd, Edweso, Ashanti Region, Ghana</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="text-emerald-700 shrink-0" size={16} />
                  <span>+233 24 412 3456 / +233 20 123 4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="text-emerald-700 shrink-0" size={16} />
                  <span>admissions@edweso.edu.gh</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-widest">Portal Entry Quick Links</h4>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => onNavigateToLogin('student')}
                  className="p-3 bg-slate-50 hover:bg-emerald-500 hover:text-white text-emerald-900 border border-slate-200/50 hover:border-transparent rounded-xl text-[11px] font-black text-left transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md flex items-center justify-between group cursor-pointer"
                >
                  <span>Student Fees Pay</span>
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300" />
                </button>
                <button
                  onClick={() => onNavigateToLogin('teacher')}
                  className="p-3 bg-slate-50 hover:bg-emerald-500 hover:text-white text-emerald-900 border border-slate-200/50 hover:border-transparent rounded-xl text-[11px] font-black text-left transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md flex items-center justify-between group cursor-pointer"
                >
                  <span>Teacher Grades Tab</span>
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300" />
                </button>
                <button
                  onClick={() => onNavigateToLogin('admin')}
                  className="p-3 bg-slate-50 hover:bg-emerald-500 hover:text-white text-emerald-900 border border-slate-200/50 hover:border-transparent rounded-xl text-[11px] font-black text-left transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md flex items-center justify-between group cursor-pointer"
                >
                  <span>Admin Center</span>
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-widest">Public Resources</h4>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => { setActivePage('parent-resources'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="p-3 bg-slate-50 hover:bg-amber-450 hover:text-emerald-950 text-emerald-900 border border-slate-200/50 hover:border-transparent rounded-xl text-[11px] font-black text-left transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md flex items-center justify-between group cursor-pointer animate-fade-in"
                >
                  <span className="flex items-center gap-2">
                    <HeartHandshake size={14} className="text-emerald-700" />
                    <span>Parent Resources</span>
                  </span>
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300" />
                </button>
                <button
                  onClick={() => { setActivePage('careers'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="p-3 bg-slate-50 hover:bg-emerald-500 hover:text-white text-emerald-900 border border-slate-200/50 hover:border-transparent rounded-xl text-[11px] font-black text-left transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md flex items-center justify-between group cursor-pointer animate-fade-in"
                >
                  <span className="flex items-center gap-2">
                    <Briefcase size={14} className="text-emerald-700 group-hover:text-white" />
                    <span>Careers at ERA</span>
                  </span>
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300" />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Footer Bottom */}
        <footer className="bg-slate-900 text-slate-400 py-6 text-center text-[11px] px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 Edweso Royal Academy. All Rights Reserved. Approved by the Ministry of Education, Ghana.</p>
            <p className="font-mono text-[10px] text-amber-400 font-bold">Motto: Knowledge, Discipline, Excellence</p>
          </div>
        </footer>
      </div>

      {/* Career Application Modal Overlay */}
      {isCareerModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-emerald-500/20 text-slate-800 flex flex-col">
            {/* Header */}
            <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-sans font-bold text-xs uppercase tracking-wider text-emerald-400">Faculty Recruitment Portal</span>
              </div>
              <button
                onClick={() => {
                  setIsCareerModalOpen(false);
                  setIsCareerSubmitted(false);
                }}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* School branding bar */}
            <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-100/50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Edweso Royal Academy</h4>
                <p className="text-[10px] text-slate-500 font-medium">Ashanti Region, Ghana • Institutional Registration</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                Active Term III
              </span>
            </div>

            {/* Content Form / Success Body */}
            <div className="p-6">
              {isCareerSubmitted ? (
                <div className="py-6 space-y-4 text-center animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 mx-auto font-black mb-2">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="font-extrabold text-emerald-800 text-sm uppercase">Application Successfully Logged!</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold max-w-md mx-auto">
                    Your candidate ledger details have been transmitted. Your registration code is <strong className="font-mono text-emerald-950 font-black">{submittedCareerId}</strong>. The Academic Board and Registrar will inspect your references within 7-10 business days.
                  </p>
                  <div className="pt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCareerModalOpen(false);
                        setIsCareerSubmitted(false);
                      }}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-emerald-700 text-white font-extrabold uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Close Portal Panel
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCareerSubmit} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Target Position</label>
                    <select
                      value={careerForm.position}
                      onChange={(e) => setCareerForm({ ...careerForm, position: e.target.value })}
                      className="w-full bg-slate-100 border border-slate-200/50 p-3 rounded-lg font-black focus:outline-hidden text-xs text-emerald-800 bg-white"
                    >
                      <option value="JHS ICT & Computing Specialist">JHS ICT & Computing Specialist</option>
                      <option value="Primary School Class Facilitator (Class 5)">Primary School Class Facilitator (Class 5)</option>
                      <option value="French Language Instructor">French Language Instructor</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Seth Tetteh"
                        value={careerForm.name}
                        onChange={(e) => setCareerForm({ ...careerForm, name: e.target.value })}
                        className="w-full bg-slate-100 border border-slate-200/50 p-3 rounded-lg font-bold focus:outline-hidden text-xs focus:ring-1 focus:ring-emerald-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. seth@gmail.com"
                        value={careerForm.email}
                        onChange={(e) => setCareerForm({ ...careerForm, email: e.target.value })}
                        className="w-full bg-slate-100 border border-slate-200/50 p-3 rounded-lg font-bold focus:outline-hidden text-xs focus:ring-1 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Telephone Contact</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. +233 24 777 6666"
                        value={careerForm.phone}
                        onChange={(e) => setCareerForm({ ...careerForm, phone: e.target.value })}
                        className="w-full bg-slate-100 border border-slate-200/50 p-3 rounded-lg font-bold focus:outline-hidden text-xs focus:ring-1 focus:ring-emerald-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Resume/Portfolio URL</label>
                      <input
                        type="url"
                        required
                        placeholder="e.g. https://drive.google.com/resume.pdf"
                        value={careerForm.portfolioUrl}
                        onChange={(e) => setCareerForm({ ...careerForm, portfolioUrl: e.target.value })}
                        className="w-full bg-slate-100 border border-slate-200/50 p-3 rounded-lg font-bold focus:outline-hidden text-xs text-emerald-800 focus:ring-1 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Prior Pedagogical Experience Summary</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Briefly describe your academic background, past schools, subjects taught, and total years of service..."
                      value={careerForm.experience}
                      onChange={(e) => setCareerForm({ ...careerForm, experience: e.target.value })}
                      className="w-full bg-slate-100 border border-slate-200/50 p-3 rounded-lg focus:outline-hidden text-xs leading-relaxed focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold uppercase tracking-wider rounded-xl text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                  >
                    <Send size={14} />
                    <span>Transmit Application Details</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ACTION UTILITIES (WhatsApp & Scroll to Top) */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50 items-end">
        {/* WhatsApp Float */}
        <a
          href="https://wa.me/233247776666?text=Hello%20Edweso%20Royal%20Academy%2C%20I%20would%20like%20to%20inquire%20about%20admissions%20or%20the%20digital%20syllabus."
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 focus:outline-hidden cursor-pointer"
          id="btn-floating-whatsapp"
          aria-label="Contact us on WhatsApp"
        >
          {/* Tooltip */}
          <span className="absolute right-16 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-slate-800">
            Chat on WhatsApp
          </span>
          <svg
            className="w-7 h-7 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>

        {/* Scroll To Top button */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group relative flex items-center justify-center w-12 h-12 bg-emerald-800 hover:bg-emerald-700 text-white rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 focus:outline-hidden cursor-pointer border border-emerald-600/30 animate-fade-in"
            id="btn-floating-scroll-to-top"
            aria-label="Scroll to top"
          >
            {/* Tooltip */}
            <span className="absolute right-14 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-slate-800">
              Back to Top
            </span>
            <ChevronUp size={20} className="stroke-[3px]" />
          </button>
        )}
      </div>

    </div>
  );
}
