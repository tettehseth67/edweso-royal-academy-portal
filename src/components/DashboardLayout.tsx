import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Sun, Moon, Bell, Search, LogOut, 
  LayoutDashboard, Users, UserCheck, BookOpen, 
  CheckSquare, Award, Calendar, Megaphone, CreditCard, User, Mail,
  AlertCircle, Check, CheckCircle, History, Send, FileText, Sunrise,
  ShieldAlert, HelpCircle, ChevronUp, UserX, FileSpreadsheet
} from 'lucide-react';
import { UserSession, Announcement } from '../types';
import { SchoolDatabase } from '../mockData';
import ActivityFeedWidget from './ActivityFeedWidget';

interface DashboardLayoutProps {
  session: UserSession;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onStartTour?: () => void;
}

export default function DashboardLayout({
  session,
  activeTab,
  onTabChange,
  onLogout,
  children,
  isDarkMode,
  onToggleTheme,
  onStartTour
}: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Scroll to Top States & Refs
  const [showScrollTop, setShowScrollTop] = useState(false);
  const mainRef = React.useRef<HTMLDivElement | null>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 200) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  const scrollToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to top on active tab changes
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  // Define sidebar navigation options based on User Role
  const adminNav = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'diagnostics', label: 'System Diagnostics', icon: <ShieldAlert size={18} /> },
    { id: 'activities', label: 'Activity Logs', icon: <History size={18} /> },
    { id: 'students', label: 'Students List', icon: <Users size={18} /> },
    { id: 'teachers', label: 'Teachers List', icon: <UserCheck size={18} /> },
    { id: 'classes', label: 'Classes & Subjects', icon: <BookOpen size={18} /> },
    { id: 'attendance', label: 'Attendance Roll', icon: <CheckSquare size={18} /> },
    { id: 'grades', label: 'Exams & Grades', icon: <Award size={18} /> },
    { id: 'timetable', label: 'Timetable Blocks', icon: <Calendar size={18} /> },
    { id: 'substitution', label: 'Cover Assistant', icon: <UserX size={18} /> },
    { id: 'syllabus', label: 'Syllabus Boards', icon: <FileSpreadsheet size={18} /> },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone size={18} /> },
    { id: 'payments', label: 'Paystack Ledger', icon: <CreditCard size={18} /> },
    { id: 'inquiries', label: 'Web Inquiries', icon: <Mail size={18} /> },
    { id: 'emails', label: 'Email Dispatch', icon: <Send size={18} /> }
  ];

  const teacherNav = [
    { id: 'profile', label: 'My Profile', icon: <User size={18} /> },
    { id: 'classes', label: 'Assigned Classes', icon: <BookOpen size={18} /> },
    { id: 'assignments', label: 'Homework Center', icon: <FileText size={18} /> },
    { id: 'attendance', label: 'Mark Attendance', icon: <CheckSquare size={18} /> },
    { id: 'grades', label: 'Upload Grades', icon: <Award size={18} /> },
    { id: 'syllabus', label: 'Syllabus Planner', icon: <FileSpreadsheet size={18} /> },
    { id: 'notes', label: 'Class Notes', icon: <FileText size={18} /> },
    { id: 'morning-report', label: 'Morning Report', icon: <Sunrise size={18} /> },
    { id: 'staff', label: 'Staff Directory', icon: <Users size={18} /> },
    { id: 'announcements', label: 'Post Notice', icon: <Megaphone size={18} /> }
  ];

  const studentNav = [
    { id: 'profile', label: 'Student Profile', icon: <User size={18} /> },
    { id: 'subjects', label: 'My Subjects', icon: <BookOpen size={18} /> },
    { id: 'assignments', label: 'My Homework', icon: <FileText size={18} /> },
    { id: 'grades', label: 'Grades Overview', icon: <Award size={18} /> },
    { id: 'syllabus', label: 'Syllabus Boards', icon: <FileSpreadsheet size={18} /> },
    { id: 'attendance', label: 'My Attendance', icon: <CheckSquare size={18} /> },
    { id: 'timetable', label: 'Timetable View', icon: <Calendar size={18} /> },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone size={18} /> },
    { id: 'payments', label: 'Pay Fees (Paystack)', icon: <CreditCard size={18} /> },
    { id: 'payment-history', label: 'Payment History', icon: <History size={18} /> },
    { id: 'emails', label: 'Email Inbox', icon: <Send size={18} /> }
  ];

  const currentNav = session.role === 'admin' 
    ? adminNav 
    : session.role === 'teacher' 
      ? teacherNav 
      : studentNav;

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  // Dynamic alerts & announcement notification calculations
  const allAnnouncements = SchoolDatabase.getAnnouncements();
  const allTransactions = SchoolDatabase.getTransactions();
  const allStudents = SchoolDatabase.getStudents();

  let currentUserPhoto: string | undefined = undefined;
  if (session.role === 'student') {
    const studentUser = allStudents.find(s => s.id === session.id);
    if (studentUser) {
      currentUserPhoto = studentUser.profilePhoto;
    }
  } else if (session.role === 'teacher') {
    const allTeachers = SchoolDatabase.getTeachers();
    const teacherUser = allTeachers.find(t => t.id === session.id);
    if (teacherUser) {
      currentUserPhoto = teacherUser.profilePhoto;
    }
  }

  const [readAnnouncements, setReadAnnouncements] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`ERA_READ_ANNOUNCEMENTS_${session.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const markAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!readAnnouncements.includes(id)) {
      const updated = [...readAnnouncements, id];
      setReadAnnouncements(updated);
      localStorage.setItem(`ERA_READ_ANNOUNCEMENTS_${session.id}`, JSON.stringify(updated));
    }
  };

  const markAllAsRead = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const visibleUnreadIds = unreadAnnouncements.map(a => a.id);
    const updated = Array.from(new Set([...readAnnouncements, ...visibleUnreadIds]));
    setReadAnnouncements(updated);
    localStorage.setItem(`ERA_READ_ANNOUNCEMENTS_${session.id}`, JSON.stringify(updated));
  };

  const audienceFilter = (a: Announcement) => {
    if (session.role === 'admin') return true;
    if (session.role === 'teacher') return a.targetAudience === 'All' || a.targetAudience === 'Teachers';
    if (session.role === 'student') return a.targetAudience === 'All' || a.targetAudience === 'Students';
    return false;
  };

  const filteredAnnouncements = allAnnouncements.filter(audienceFilter);
  const unreadAnnouncements = filteredAnnouncements.filter(a => !readAnnouncements.includes(a.id));

  // Payment Alerts
  const paymentAlerts: { id: string; type: 'payment'; title: string; message: string; date: string; severity: 'high' | 'info' }[] = [];

  if (session.role === 'student') {
    const currentStudent = allStudents.find(s => s.id === session.id);
    if (currentStudent && currentStudent.balanceGHS > 0) {
      paymentAlerts.push({
        id: 'alert-fees-' + session.id,
        type: 'payment',
        title: 'Outstanding Fees Alert',
        message: `Urgent: You have an outstanding fees balance of GHS ${currentStudent.balanceGHS.toFixed(2)}. Please make a payment to avoid academic restriction.`,
        date: new Date().toISOString().substring(0, 10),
        severity: 'high'
      });
    }
  } else if (session.role === 'admin') {
    const failedTxs = allTransactions.filter(t => t.status === 'Failed');
    if (failedTxs.length > 0) {
      paymentAlerts.push({
        id: 'alert-failed-txs',
        type: 'payment',
        title: 'Failed Payments Ledger Notice',
        message: `System Alert: ${failedTxs.length} failed fees transactions detected. Click to review in the Paystack Ledger.`,
        date: new Date().toISOString().substring(0, 10),
        severity: 'high'
      });
    }
  }

  const unreadCount = unreadAnnouncements.length + paymentAlerts.length;

  return (
    <div className={`min-h-screen font-sans flex ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* 1. Sidebar - Desktop */}
      <aside className={`hidden md:flex flex-col w-64 shrink-0 border-r ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* School Logo Area */}
        <div className={`p-5 flex items-center space-x-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="w-10 h-10 rounded-lg bg-emerald-700 flex items-center justify-center text-amber-400 font-extrabold text-xl shadow-xs border border-amber-400/20">
            E
          </div>
          <div>
            <span className="font-display font-black text-sm tracking-tight text-emerald-600 block leading-tight">Edweso Royal</span>
            <span className={`text-[10px] uppercase font-display font-black tracking-widest block leading-none ${
              isDarkMode ? 'text-amber-400' : 'text-amber-600'
            }`}>Academy</span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {session.role} portal
          </div>
          
          {currentNav.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : isDarkMode
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-500/10 flex items-center justify-center font-extrabold text-emerald-800 text-xs shrink-0 overflow-hidden">
                {currentUserPhoto ? (
                  <img src={currentUserPhoto} alt={session.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  session.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold truncate leading-tight">{session.name}</p>
                <p className="text-[10px] text-slate-400 truncate leading-none mt-0.5">{session.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              id="sidebar-logout-btn"
              title="Logout"
              className="p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Sidebar - Mobile Overlay Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          
          {/* Drawer container */}
          <div className={`relative flex flex-col w-64 max-w-xs h-full p-4 border-r animate-slide-in-left ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-amber-400 font-extrabold text-sm">
                  E
                </div>
                <span className="font-display font-black text-xs tracking-tight text-emerald-700">Edweso Academy</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {currentNav.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-sidebar-link-${item.id}`}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left ${
                      isActive
                        ? 'bg-emerald-700 text-white'
                        : isDarkMode
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                          : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={onLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold text-left transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out of Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Dashboard Body Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Navigation */}
        <header className={`h-16 px-4 sm:px-6 flex items-center justify-between border-b ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
        } relative z-30`}>
          
          {/* Left side search or mobile hamburger */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              id="mobile-hamburger-btn"
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
            >
              <Menu size={20} />
            </button>
            
            {/* Elegant Search bar - visible on desktop */}
            <div className="hidden sm:flex items-center space-x-2 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200/40 dark:border-slate-800 max-w-xs">
              <Search size={14} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search index ledger..." 
                className="bg-transparent border-0 outline-hidden text-xs text-slate-600 dark:text-slate-300 placeholder-slate-400 w-44"
              />
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-3 relative">
            
            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                id="notifications-btn"
                className={`p-2 rounded-lg transition-colors border ${
                  isDarkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                } text-slate-500 relative`}
                title="Open Alert Center"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-rose-500 border border-white dark:border-slate-900 text-white font-extrabold text-[8px] flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                  <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-2xl p-4 border z-50 max-h-[480px] overflow-y-auto ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                  }`}>
                    
                    {/* Dropdown Header */}
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-800 mb-3">
                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">Alert Center</span>
                        <span className="text-[10px] text-slate-400 block font-semibold">Real-time school status</span>
                      </div>
                      {unreadAnnouncements.length > 0 && (
                        <button 
                          onClick={markAllAsRead} 
                          className="text-[10px] text-emerald-600 hover:text-emerald-500 font-extrabold transition-colors cursor-pointer bg-emerald-500/10 px-2.5 py-1 rounded"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      
                      {/* 1. URGENT PAYMENT ALERTS SECTION */}
                      {paymentAlerts.map(alert => (
                        <div 
                          key={alert.id} 
                          onClick={() => {
                            handleTabClick('payments');
                            setIsNotificationsOpen(false);
                          }}
                          className="p-3 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 rounded-lg text-xs cursor-pointer transition-colors space-y-1 relative"
                        >
                          <div className="flex items-center space-x-1.5 text-rose-600 dark:text-rose-400 font-extrabold">
                            <AlertCircle size={14} className="shrink-0 animate-bounce" />
                            <span>{alert.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">{alert.message}</p>
                          <span className="text-[9px] text-slate-400 block mt-1 font-mono">{alert.date}</span>
                        </div>
                      ))}

                      {/* 2. UNREAD ANNOUNCEMENTS SECTION */}
                      {unreadAnnouncements.map(ann => (
                        <div 
                          key={ann.id} 
                          onClick={() => {
                            handleTabClick('announcements');
                            setIsNotificationsOpen(false);
                          }}
                          className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-lg text-xs cursor-pointer transition-colors space-y-1 relative"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-extrabold text-slate-800 dark:text-slate-100 truncate pr-4">{ann.title}</span>
                            <button 
                              onClick={(e) => markAsRead(ann.id, e)}
                              className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded shrink-0"
                              title="Mark as read"
                            >
                              <Check size={12} />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">{ann.content}</p>
                          <div className="flex justify-between items-center text-[9px] text-slate-400 pt-1 font-semibold border-t border-slate-100 dark:border-slate-800/50 mt-1.5">
                            <span>By: {ann.authorName} ({ann.authorRole})</span>
                            <span className="font-mono">{ann.date.split(' ')[0]}</span>
                          </div>
                        </div>
                      ))}

                      {/* 3. ALL CAUGHT UP STATE */}
                      {unreadCount === 0 && (
                        <div className="py-8 text-center space-y-2.5">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                            <CheckCircle size={20} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white">All Caught Up!</h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed max-w-[200px] mx-auto mt-1 font-semibold">
                              You have read all school bulletins and cleared all urgent billing accounts.
                            </p>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* View Bulletin link */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
                      <button
                        onClick={() => {
                          handleTabClick('announcements');
                          setIsNotificationsOpen(false);
                        }}
                        className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-emerald-600 font-extrabold uppercase tracking-wider"
                      >
                        View Bulletin Board →
                      </button>
                    </div>

                  </div>
                </>
              )}
            </div>

            {/* Guided Tour Trigger Button */}
            {onStartTour && (
              <button
                onClick={onStartTour}
                id="tour-start-btn"
                className={`p-2 rounded-lg transition-all border shrink-0 flex items-center justify-center cursor-pointer ${
                  isDarkMode 
                    ? 'border-slate-800 hover:bg-slate-800 hover:text-emerald-400' 
                    : 'border-slate-200 hover:bg-slate-100 hover:text-emerald-700'
                } text-slate-500`}
                title="Start Interactive Guided Tour"
              >
                <HelpCircle size={16} className="text-emerald-600 dark:text-emerald-400 animate-pulse shrink-0" />
              </button>
            )}

            {/* Small Profile Dropdown trigger */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                id="profile-trigger-btn"
                className="flex items-center space-x-2 cursor-pointer focus:outline-hidden"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-amber-300 border border-amber-400/10 flex items-center justify-center font-extrabold text-[11px] overflow-hidden">
                  {currentUserPhoto ? (
                    <img src={currentUserPhoto} alt={session.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    session.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                  )}
                </div>
              </button>

              {isProfileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)} />
                  <div className={`absolute right-0 mt-2 w-52 rounded-xl shadow-xl p-2 border z-50 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                  }`}>
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-xs font-bold">{session.name}</p>
                      <p className="text-[10px] text-slate-400">{session.role.toUpperCase()}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleTabClick((session.role === 'student' || session.role === 'teacher') ? 'profile' : 'classes');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-bold"
                    >
                      My Dashboard
                    </button>
                    {onStartTour && (
                      <button
                        onClick={() => {
                          onStartTour();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1.5 border border-dashed border-emerald-300/40 mt-1"
                      >
                        <HelpCircle size={14} className="shrink-0" />
                        <span>Interactive Tour</span>
                      </button>
                    )}
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-rose-50 text-rose-600 font-bold mt-1"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* 4. Active Dashboard Tab Content - Scrollable container */}
        <div className="flex-1 flex overflow-hidden">
          <main 
            ref={mainRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
          >
            {children}
          </main>
          {(session.role === 'admin' || session.role === 'teacher') && (
            <ActivityFeedWidget isDarkMode={isDarkMode} />
          )}

          {/* Scroll to Top Button */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 p-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform scale-100 hover:scale-110 flex items-center justify-center cursor-pointer z-40 border border-white/10 hover:rotate-3"
              title="Scroll to Top"
            >
              <ChevronUp size={20} className="stroke-[3px]" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
