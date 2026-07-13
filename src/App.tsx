import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckSquare, Trash2, X, Eye, Accessibility, Type, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { UserRole, UserSession, Student, Teacher, SchoolClass, Subject, Attendance, ExamGrade, TimetableEntry, Announcement, PaymentTransaction, SimulatedEmail, SimulatedSMS, ClassNote, SyllabusPlan, TeacherAbsence, CoverAssignment, HomeworkAssignment, HomeworkSubmission, StaffClockIn, StaffPayroll, StaffLeaveRequest, PaymentSchedulerPlan, PaymentSchedulerRunLog } from './types';
import { SchoolDatabase } from './mockData';

// Component Imports
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import DashboardLayout from './components/DashboardLayout';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import ParentDashboard from './components/ParentDashboard';
import OnboardingTour from './components/OnboardingTour';

export default function App() {
  // Page Routing State: 'landing' | 'auth' | 'dashboard'
  const [page, setPage] = useState<'landing' | 'auth' | 'dashboard'>('landing');

  // ==================== EYE CARE & ACCESSIBILITY CONTROLLER ====================
  const [fontSizeScale, setFontSizeScale] = useState<string>(() => {
    return localStorage.getItem('accessibility_font_scale') || 'large'; // Default to 'large' (115% / 18.5px) so the website is instantly larger!
  });
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('accessibility_high_contrast') === 'true';
  });
  const [dyslexicFont, setDyslexicFont] = useState<boolean>(() => {
    return localStorage.getItem('accessibility_dyslexic_font') === 'true';
  });
  const [speakOnClick, setSpeakOnClick] = useState<boolean>(() => {
    return localStorage.getItem('accessibility_speak_on_click') === 'true';
  });
  const [giantCursor, setGiantCursor] = useState<boolean>(() => {
    return localStorage.getItem('accessibility_giant_cursor') === 'true';
  });
  const [readingRuler, setReadingRuler] = useState<boolean>(() => {
    return localStorage.getItem('accessibility_reading_ruler') === 'true';
  });
  const [visionFilter, setVisionFilter] = useState<string>(() => {
    return localStorage.getItem('accessibility_vision_filter') || 'none';
  });
  const [rulerY, setRulerY] = useState<number>(0);
  const [isAccessMenuOpen, setIsAccessMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const html = document.documentElement;
    if (fontSizeScale === 'normal') {
      html.style.fontSize = '16px';
    } else if (fontSizeScale === 'large') {
      html.style.fontSize = '18.5px'; // default increased size (115%)
    } else if (fontSizeScale === 'xl') {
      html.style.fontSize = '21px'; // extra large size (130%)
    } else if (fontSizeScale === 'xxl') {
      html.style.fontSize = '24px'; // double extra large size (150%)
    }
    localStorage.setItem('accessibility_font_scale', fontSizeScale);
  }, [fontSizeScale]);

  useEffect(() => {
    const html = document.documentElement;
    if (highContrast) {
      html.classList.add('accessibility-high-contrast');
    } else {
      html.classList.remove('accessibility-high-contrast');
    }
    localStorage.setItem('accessibility_high_contrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    const html = document.documentElement;
    if (dyslexicFont) {
      html.classList.add('accessibility-dyslexic');
    } else {
      html.classList.remove('accessibility-dyslexic');
    }
    localStorage.setItem('accessibility_dyslexic_font', String(dyslexicFont));
  }, [dyslexicFont]);

  useEffect(() => {
    const html = document.documentElement;
    if (giantCursor) {
      html.classList.add('accessibility-giant-cursor');
    } else {
      html.classList.remove('accessibility-giant-cursor');
    }
    localStorage.setItem('accessibility_giant_cursor', String(giantCursor));
  }, [giantCursor]);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove(
      'accessibility-filter-monochrome',
      'accessibility-filter-contrast-boost',
      'accessibility-filter-deuteranopia'
    );
    if (visionFilter !== 'none') {
      html.classList.add(`accessibility-filter-${visionFilter}`);
    }
    localStorage.setItem('accessibility_vision_filter', visionFilter);
  }, [visionFilter]);

  // Click to Speak Narration Engine
  useEffect(() => {
    if (!speakOnClick) {
      document.body.classList.remove('accessibility-click-to-speak-active');
      return;
    }
    document.body.classList.add('accessibility-click-to-speak-active');

    const handleTextClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Do not narrate clicks inside the accessibility menu elements
      const isControlPanel = target.closest('#global-accessibility-panel') || target.closest('#global-accessibility-trigger-btn');
      if (isControlPanel) return;

      const textToSpeak = target.innerText || target.textContent;
      if (textToSpeak && textToSpeak.trim().length > 0) {
        e.preventDefault();
        e.stopPropagation();
        
        // Cancel existing readouts
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(textToSpeak.trim().substring(0, 350));
        utterance.rate = 0.95; // Slightly slower, highly clear rate for easy hearing
        window.speechSynthesis.speak(utterance);
      }
    };

    window.addEventListener('click', handleTextClick, true); // Capture phase
    return () => {
      window.removeEventListener('click', handleTextClick, true);
    };
  }, [speakOnClick]);

  // Reading Ruler Mouse Tracker
  useEffect(() => {
    if (!readingRuler) return;
    const handleMouseMove = (e: MouseEvent) => {
      setRulerY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [readingRuler]);

  localStorage.setItem('accessibility_reading_ruler', String(readingRuler));
  localStorage.setItem('accessibility_speak_on_click', String(speakOnClick));
  // =============================================================================

  
  // User Session State
  const [session, setSession] = useState<UserSession | null>(null);
  
  // Selected tab in the active dashboard
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Interactive Onboarding Tour State
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    if (session) {
      const hasCompleted = localStorage.getItem(`onboarding_completed_${session.role}_${session.id}`);
      if (!hasCompleted) {
        // Automatically start the tour after a 1.2 second delay to let the dashboard render nicely!
        const timer = setTimeout(() => {
          setIsTourOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } else {
      setIsTourOpen(false);
    }
  }, [session]);

  // Selected role for pre-configuring Auth Page
  const [authPageInitialRole, setAuthPageInitialRole] = useState<UserRole>('student');

  // Light/Dark Mode State - Locked to professional light mode
  const isDarkMode = false;
  const setIsDarkMode = (val: boolean) => {};

  // Global Confirmation Modal State
  const [globalConfirm, setGlobalConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    type: 'info',
    onConfirm: () => {}
  });

  // Master Database States loaded from LocalStorage (with robust defaults)
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [grades, setGrades] = useState<ExamGrade[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);
  const [sms, setSms] = useState<SimulatedSMS[]>([]);
  const [classNotes, setClassNotes] = useState<ClassNote[]>([]);
  const [syllabusPlans, setSyllabusPlans] = useState<SyllabusPlan[]>([]);
  const [teacherAbsences, setTeacherAbsences] = useState<TeacherAbsence[]>([]);
  const [coverAssignments, setCoverAssignments] = useState<CoverAssignment[]>([]);
  const [homeworkAssignments, setHomeworkAssignments] = useState<HomeworkAssignment[]>([]);
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<HomeworkSubmission[]>([]);
  const [staffClockIns, setStaffClockIns] = useState<StaffClockIn[]>([]);
  const [staffPayrolls, setStaffPayrolls] = useState<StaffPayroll[]>([]);
  const [staffLeaveRequests, setStaffLeaveRequests] = useState<StaffLeaveRequest[]>([]);
  const [schedulerPlans, setSchedulerPlans] = useState<PaymentSchedulerPlan[]>([]);
  const [schedulerLogs, setSchedulerLogs] = useState<PaymentSchedulerRunLog[]>([]);

  // Helper to save database state to Node.js backend
  const syncAndSave = async (updatedFields: Partial<{
    students: Student[];
    teachers: Teacher[];
    classes: SchoolClass[];
    subjects: Subject[];
    attendance: Attendance[];
    grades: ExamGrade[];
    timetable: TimetableEntry[];
    announcements: Announcement[];
    transactions: PaymentTransaction[];
    emails: SimulatedEmail[];
    sms: SimulatedSMS[];
    classNotes: ClassNote[];
    syllabusPlans: SyllabusPlan[];
    teacherAbsences: TeacherAbsence[];
    coverAssignments: CoverAssignment[];
    homeworkAssignments: HomeworkAssignment[];
    homeworkSubmissions: HomeworkSubmission[];
    staffClockIns: StaffClockIn[];
    staffPayrolls: StaffPayroll[];
    staffLeaveRequests: StaffLeaveRequest[];
    schedulerPlans: PaymentSchedulerPlan[];
    schedulerLogs: PaymentSchedulerRunLog[];
  }>) => {
    const payload = {
      students: updatedFields.students ?? students,
      teachers: updatedFields.teachers ?? teachers,
      classes: updatedFields.classes ?? classes,
      subjects: updatedFields.subjects ?? subjects,
      attendance: updatedFields.attendance ?? attendance,
      grades: updatedFields.grades ?? grades,
      timetable: updatedFields.timetable ?? timetable,
      announcements: updatedFields.announcements ?? announcements,
      transactions: updatedFields.transactions ?? transactions,
      emails: updatedFields.emails ?? emails,
      sms: updatedFields.sms ?? sms,
      classNotes: updatedFields.classNotes ?? classNotes,
      syllabusPlans: updatedFields.syllabusPlans ?? syllabusPlans,
      teacherAbsences: updatedFields.teacherAbsences ?? teacherAbsences,
      coverAssignments: updatedFields.coverAssignments ?? coverAssignments,
      homeworkAssignments: updatedFields.homeworkAssignments ?? homeworkAssignments,
      homeworkSubmissions: updatedFields.homeworkSubmissions ?? homeworkSubmissions,
      staffClockIns: updatedFields.staffClockIns ?? staffClockIns,
      staffPayrolls: updatedFields.staffPayrolls ?? staffPayrolls,
      staffLeaveRequests: updatedFields.staffLeaveRequests ?? staffLeaveRequests,
      schedulerPlans: updatedFields.schedulerPlans ?? schedulerPlans,
      schedulerLogs: updatedFields.schedulerLogs ?? schedulerLogs,
    };
    try {
      await fetch('/api/school-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error('Failed to sync to server database:', e);
    }
  };

  // Initialize Database on load
  useEffect(() => {
    const initData = async () => {
      let loadedFromBackend = false;
      try {
        const res = await fetch('/api/school-data');
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          const db = json.data;
          setStudents(db.students || []);
          setTeachers(db.teachers || []);
          setClasses(db.classes || []);
          setSubjects(db.subjects || []);
          setAttendance(db.attendance || []);
          setGrades(db.grades || []);
          setTimetable(db.timetable || []);
          setAnnouncements(db.announcements || []);
          setTransactions(db.transactions || []);
          setEmails(db.emails || []);
          setSms(db.sms || []);
          setClassNotes(db.classNotes || []);
          setSyllabusPlans(db.syllabusPlans || []);
          setTeacherAbsences(db.teacherAbsences || []);
          setCoverAssignments(db.coverAssignments || []);
          setHomeworkAssignments(db.homeworkAssignments || []);
          setHomeworkSubmissions(db.homeworkSubmissions || []);
          setStaffClockIns(db.staffClockIns || []);
          setStaffPayrolls(db.staffPayrolls || []);
          setStaffLeaveRequests(db.staffLeaveRequests || []);
          setSchedulerPlans(db.schedulerPlans || SchoolDatabase.getSchedulerPlans());
          setSchedulerLogs(db.schedulerLogs || SchoolDatabase.getSchedulerLogs());
          loadedFromBackend = true;
          
          // Keep LocalStorage fallback updated
          SchoolDatabase.saveStudents(db.students || []);
          SchoolDatabase.saveTeachers(db.teachers || []);
          SchoolDatabase.saveClasses(db.classes || []);
          SchoolDatabase.saveSubjects(db.subjects || []);
          SchoolDatabase.saveAttendance(db.attendance || []);
          SchoolDatabase.saveGrades(db.grades || []);
          SchoolDatabase.saveTimetable(db.timetable || []);
          SchoolDatabase.saveAnnouncements(db.announcements || []);
          SchoolDatabase.saveTransactions(db.transactions || []);
          SchoolDatabase.saveEmails(db.emails || []);
          SchoolDatabase.saveSMS(db.sms || []);
          SchoolDatabase.saveClassNotes(db.classNotes || []);
          SchoolDatabase.saveSyllabusPlans(db.syllabusPlans || []);
          SchoolDatabase.saveTeacherAbsences(db.teacherAbsences || []);
          SchoolDatabase.saveCoverAssignments(db.coverAssignments || []);
          SchoolDatabase.saveHomeworkAssignments(db.homeworkAssignments || []);
          SchoolDatabase.saveHomeworkSubmissions(db.homeworkSubmissions || []);
          SchoolDatabase.saveStaffClockIns(db.staffClockIns || []);
          SchoolDatabase.saveStaffPayroll(db.staffPayrolls || []);
          SchoolDatabase.saveStaffLeaves(db.staffLeaveRequests || []);
          SchoolDatabase.saveSchedulerPlans(db.schedulerPlans || SchoolDatabase.getSchedulerPlans());
          SchoolDatabase.saveSchedulerLogs(db.schedulerLogs || SchoolDatabase.getSchedulerLogs());
        }
      } catch (e) {
        console.warn('Failed to fetch from backend, utilizing local storage fallback:', e);
      }

      if (!loadedFromBackend) {
        const localStudents = SchoolDatabase.getStudents();
        const localTeachers = SchoolDatabase.getTeachers();
        const localClasses = SchoolDatabase.getClasses();
        const localSubjects = SchoolDatabase.getSubjects();
        const localAttendance = SchoolDatabase.getAttendance();
        const localGrades = SchoolDatabase.getGrades();
        const localTimetable = SchoolDatabase.getTimetable();
        const localAnnouncements = SchoolDatabase.getAnnouncements();
        const localTransactions = SchoolDatabase.getTransactions();
        const localEmails = SchoolDatabase.getEmails();
        const localSMS = SchoolDatabase.getSMS();
        const localClassNotes = SchoolDatabase.getClassNotes();
        const localSyllabus = SchoolDatabase.getSyllabusPlans();
        const localAbsences = SchoolDatabase.getTeacherAbsences();
        const localCovers = SchoolDatabase.getCoverAssignments();
        const localHomeworkAssignments = SchoolDatabase.getHomeworkAssignments();
        const localHomeworkSubmissions = SchoolDatabase.getHomeworkSubmissions();
        const localClockIns = SchoolDatabase.getStaffClockIns();
        const localPayroll = SchoolDatabase.getStaffPayroll();
        const localLeaves = SchoolDatabase.getStaffLeaves();
        const localPlans = SchoolDatabase.getSchedulerPlans();
        const localLogs = SchoolDatabase.getSchedulerLogs();

        setStudents(localStudents);
        setTeachers(localTeachers);
        setClasses(localClasses);
        setSubjects(localSubjects);
        setAttendance(localAttendance);
        setGrades(localGrades);
        setTimetable(localTimetable);
        setAnnouncements(localAnnouncements);
        setTransactions(localTransactions);
        setEmails(localEmails);
        setSms(localSMS);
        setClassNotes(localClassNotes);
        setSyllabusPlans(localSyllabus);
        setTeacherAbsences(localAbsences);
        setCoverAssignments(localCovers);
        setHomeworkAssignments(localHomeworkAssignments);
        setHomeworkSubmissions(localHomeworkSubmissions);
        setStaffClockIns(localClockIns);
        setStaffPayrolls(localPayroll);
        setStaffLeaveRequests(localLeaves);
        setSchedulerPlans(localPlans);
        setSchedulerLogs(localLogs);

        // Bootstrap backend with initial mock data
        try {
          await fetch('/api/school-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              students: localStudents,
              teachers: localTeachers,
              classes: localClasses,
              subjects: localSubjects,
              attendance: localAttendance,
              grades: localGrades,
              timetable: localTimetable,
              announcements: localAnnouncements,
              transactions: localTransactions,
              emails: localEmails,
              sms: localSMS,
              classNotes: localClassNotes,
              syllabusPlans: localSyllabus,
              teacherAbsences: localAbsences,
              coverAssignments: localCovers,
              homeworkAssignments: localHomeworkAssignments,
              homeworkSubmissions: localHomeworkSubmissions,
              staffClockIns: localClockIns,
              staffPayrolls: localPayroll,
              staffLeaveRequests: localLeaves,
              schedulerPlans: localPlans,
              schedulerLogs: localLogs
            })
          });
        } catch (err) {
          console.warn('Could not bootstrap server database:', err);
        }
      }
    };

    initData();
  }, []);

  // Theme effect toggler
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Automatic inactivity logout timer (15 minutes)
  useEffect(() => {
    if (!session) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
        alert('You have been logged out automatically due to 15 minutes of inactivity for enhanced security.');
      }, 15 * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'click', 'scroll', 'touchstart'];

    resetTimer();

    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [session]);

  // Auth Handlers
  const handleLoginSuccess = (userSession: UserSession) => {
    setSession(userSession);
    setPage('dashboard');
    
    // Log system activity
    const roleLabel = userSession.role.charAt(0).toUpperCase() + userSession.role.slice(1);
    SchoolDatabase.addSystemActivity(
      'login', 
      userSession.name, 
      `Authenticated successfully into ${roleLabel} Portal`
    );
    
    // Set default tab based on logged-in role
    if (userSession.role === 'admin') {
      setActiveTab('overview');
    } else if (userSession.role === 'teacher') {
      setActiveTab('profile');
    } else {
      setActiveTab('profile');
    }
  };

  const handleLogout = () => {
    setSession(null);
    setPage('landing');
  };

  const handleNavigateToLogin = (role?: UserRole) => {
    if (role) setAuthPageInitialRole(role);
    setPage('auth');
  };

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // State sync wrapper functions (automatically updates React state + LocalStorage + Backend REST DB)
  const handleUpdateStudents = (updatedStudents: Student[]) => {
    setStudents(updatedStudents);
    SchoolDatabase.saveStudents(updatedStudents);
    syncAndSave({ students: updatedStudents });
  };

  const handleUpdateTeachers = (updatedTeachers: Teacher[]) => {
    setTeachers(updatedTeachers);
    SchoolDatabase.saveTeachers(updatedTeachers);
    syncAndSave({ teachers: updatedTeachers });
  };

  const handleUpdateStaffClockIns = (updatedClockIns: StaffClockIn[]) => {
    setStaffClockIns(updatedClockIns);
    SchoolDatabase.saveStaffClockIns(updatedClockIns);
    syncAndSave({ staffClockIns: updatedClockIns });
  };

  const handleUpdateStaffPayroll = (updatedPayroll: StaffPayroll[]) => {
    setStaffPayrolls(updatedPayroll);
    SchoolDatabase.saveStaffPayroll(updatedPayroll);
    syncAndSave({ staffPayrolls: updatedPayroll });
  };

  const handleUpdateStaffLeaves = (updatedLeaves: StaffLeaveRequest[]) => {
    setStaffLeaveRequests(updatedLeaves);
    SchoolDatabase.saveStaffLeaves(updatedLeaves);
    syncAndSave({ staffLeaveRequests: updatedLeaves });
  };

  const handleUpdateAnnouncements = (updatedAnnouncements: Announcement[]) => {
    setAnnouncements(updatedAnnouncements);
    SchoolDatabase.saveAnnouncements(updatedAnnouncements);

    // Auto-trigger simulated emails and SMS if a new announcement is posted
    if (updatedAnnouncements.length > announcements.length) {
      const newAnn = updatedAnnouncements[0];
      let targetStudents: Student[] = [];
      if (newAnn.targetAudience === 'All' || newAnn.targetAudience === 'Students') {
        targetStudents = students;
      }

      const newSimulatedEmails: SimulatedEmail[] = [];
      const newSimulatedSMS: SimulatedSMS[] = [];
      
      targetStudents.forEach(st => {
        const emailId = 'em-auto-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
        const smsId = 'sms-auto-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
        const emailSubject = `Edweso Royal Academy Notice: ${newAnn.title}`;
        const emailBody = `Dear ${st.parentName},

This is an automated simulated email notification from Edweso Royal Academy for pupil ${st.name}.

A new bulletin has been broadcasted:
"${newAnn.title}"
------------------------------------------------------------
${newAnn.content}

------------------------------------------------------------
Date Posted: ${newAnn.date}
Author: ${newAnn.authorName} (${newAnn.authorRole})

Please visit your online portal to view full student details.

Motto: KNOWLEDGE • DISCIPLINE • EXCELLENCE
Best regards,
Administration Desk
Edweso Royal Academy`;

        newSimulatedEmails.push({
          id: emailId,
          recipientEmail: st.parentEmail,
          recipientName: st.parentName,
          subject: emailSubject,
          body: emailBody,
          sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          type: 'Announcement',
          status: 'Sent'
        });

        newSimulatedSMS.push({
          id: smsId,
          recipientPhone: st.parentPhone,
          recipientName: st.parentName,
          message: `[ALERT] Edweso Royal Academy: Urgent Notice - "${newAnn.title}". Msg: ${newAnn.content.substring(0, 100)}${newAnn.content.length > 100 ? '...' : ''} Check portal for full bulletin.`,
          sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          type: 'Announcement',
          status: 'Sent'
        });
      });

      const updatedEmailsList = [...newSimulatedEmails, ...emails];
      const updatedSMSList = [...newSimulatedSMS, ...sms];
      
      setEmails(updatedEmailsList);
      SchoolDatabase.saveEmails(updatedEmailsList);
      setSms(updatedSMSList);
      SchoolDatabase.saveSMS(updatedSMSList);
      
      syncAndSave({ 
        announcements: updatedAnnouncements, 
        emails: updatedEmailsList,
        sms: updatedSMSList 
      });
    } else {
      syncAndSave({ announcements: updatedAnnouncements });
    }
  };

  const handleTriggerFeeAlerts = (studentIds?: string[]) => {
    const recipients = students.filter(s => {
      if (studentIds) {
        return studentIds.includes(s.id) && s.balanceGHS > 0;
      }
      return s.balanceGHS > 0;
    });

    if (recipients.length === 0) return 0;

    const newSimulatedEmails: SimulatedEmail[] = [];
    const newSimulatedSMS: SimulatedSMS[] = [];
    
    recipients.forEach(st => {
      const emailId = 'em-fee-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
      const smsId = 'sms-fee-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
      const emailSubject = `URGENT Fee Reminder: Outstanding Balance for ${st.name}`;
      const emailBody = `Dear ${st.parentName},

This is an official fee reminder notice from the Bursar's Office at Edweso Royal Academy.

Our student records show that your ward, ${st.name}, has an outstanding fee balance of GHS ${st.balanceGHS.toFixed(2)} for the current academic term.

The final deadline for clearing all outstanding terminal school fees is approaching rapidly. Please note that payments must be completed to prevent administrative hold or classroom restrictions.

You can securely pay this balance online instantly with Mobile Money or Credit Card using the Paystack portal on our Student Dashboard:
- Student Name: ${st.name}
- Admission No: ${st.admissionNumber}
- Outstanding Balance: GHS ${st.balanceGHS.toFixed(2)}

If you have already processed this transaction, kindly upload your receipt in the portal or email our finance desk.

Motto: KNOWLEDGE • DISCIPLINE • EXCELLENCE
Bursar Department,
Edweso Royal Academy`;

      newSimulatedEmails.push({
        id: emailId,
        recipientEmail: st.parentEmail,
        recipientName: st.parentName,
        subject: emailSubject,
        body: emailBody,
        sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'FeeDeadline',
        status: 'Sent'
      });

      newSimulatedSMS.push({
        id: smsId,
        recipientPhone: st.parentPhone,
        recipientName: st.parentName,
        message: `[ALERT] Edweso Royal Finance: School fee billing reminder. Ward ${st.name} has an outstanding balance of GHS ${st.balanceGHS.toFixed(2)}. Pay online via portal instantly or contact Bursar.`,
        sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'FeeDeadline',
        status: 'Sent'
      });
    });

    const updatedEmailsList = [...newSimulatedEmails, ...emails];
    const updatedSMSList = [...newSimulatedSMS, ...sms];
    
    setEmails(updatedEmailsList);
    SchoolDatabase.saveEmails(updatedEmailsList);
    setSms(updatedSMSList);
    SchoolDatabase.saveSMS(updatedSMSList);
    
    syncAndSave({ emails: updatedEmailsList, sms: updatedSMSList });
    return recipients.length;
  };

  const handleDeleteEmail = (id: string) => {
    setGlobalConfirm({
      isOpen: true,
      title: 'Delete Simulated Email Log',
      message: 'Are you sure you want to permanently delete this simulated email dispatch record? This action cannot be undone and will erase the transmission audit log.',
      confirmText: 'Confirm Deletion',
      type: 'danger',
      onConfirm: () => {
        const updated = emails.filter(em => em.id !== id);
        setEmails(updated);
        SchoolDatabase.saveEmails(updated);
        syncAndSave({ emails: updated });
        setGlobalConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleSendSimulatedEmail = (recipientEmail: string, recipientName: string, subject: string, body: string, type: 'Announcement' | 'FeeDeadline' | 'MorningReport') => {
    const newEmail: SimulatedEmail = {
      id: 'em-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      recipientEmail,
      recipientName,
      subject,
      body,
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type,
      status: 'Sent'
    };
    const updatedEmails = [newEmail, ...emails];
    setEmails(updatedEmails);
    SchoolDatabase.saveEmails(updatedEmails);
    syncAndSave({ emails: updatedEmails });
  };

  const handleSendSimulatedSMS = (recipientPhone: string, recipientName: string, message: string, type: 'Announcement' | 'FeeDeadline' | 'Attendance' | 'MorningReport') => {
    const newSMS: SimulatedSMS = {
      id: 'sms-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      recipientPhone,
      recipientName,
      message,
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type,
      status: 'Sent'
    };
    const updatedSMS = [newSMS, ...sms];
    setSms(updatedSMS);
    SchoolDatabase.saveSMS(updatedSMS);
    syncAndSave({ sms: updatedSMS });
  };

  const handleDeleteSMS = (id: string) => {
    setGlobalConfirm({
      isOpen: true,
      title: 'Delete Simulated SMS Log',
      message: 'Are you sure you want to permanently delete this simulated SMS dispatch record? This action cannot be undone.',
      confirmText: 'Confirm Deletion',
      type: 'danger',
      onConfirm: () => {
        const updated = sms.filter(s => s.id !== id);
        setSms(updated);
        SchoolDatabase.saveSMS(updated);
        syncAndSave({ sms: updated });
        setGlobalConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleUpdateSchedulerPlans = (updatedPlans: PaymentSchedulerPlan[]) => {
    setSchedulerPlans(updatedPlans);
    SchoolDatabase.saveSchedulerPlans(updatedPlans);
    syncAndSave({ schedulerPlans: updatedPlans });
  };

  const handleUpdateSchedulerLogs = (updatedLogs: PaymentSchedulerRunLog[]) => {
    setSchedulerLogs(updatedLogs);
    SchoolDatabase.saveSchedulerLogs(updatedLogs);
    syncAndSave({ schedulerLogs: updatedLogs });
  };

  const handleUpdateAttendance = (updatedAttendance: Attendance[]) => {
    setAttendance(updatedAttendance);
    SchoolDatabase.saveAttendance(updatedAttendance);
    syncAndSave({ attendance: updatedAttendance });
    
    // Log system activity
    if (session) {
      SchoolDatabase.addSystemActivity(
        'attendance', 
        session.name, 
        `Submitted daily roll-call attendance record update`
      );
    }
  };

  const handleUpdateGrades = (updatedGrades: ExamGrade[]) => {
    setGlobalConfirm({
      isOpen: true,
      title: 'Update Student Grades',
      message: 'You are about to modify or submit terminal continuous assessment and exam scores. Are you sure you want to override and write these grades to the master database records?',
      confirmText: 'Confirm Grade Update',
      type: 'warning',
      onConfirm: () => {
        setGrades(updatedGrades);
        SchoolDatabase.saveGrades(updatedGrades);
        syncAndSave({ grades: updatedGrades });
        
        // Log system activity
        if (session) {
          SchoolDatabase.addSystemActivity(
            'grade', 
            session.name, 
            `Updated student evaluation terminal grade book`
          );
        }
        setGlobalConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleUpdateTimetable = (updatedTimetable: TimetableEntry[]) => {
    setTimetable(updatedTimetable);
    SchoolDatabase.saveTimetable(updatedTimetable);
    syncAndSave({ timetable: updatedTimetable });
  };

  const handleUpdateClassNotes = (updatedClassNotes: ClassNote[]) => {
    setClassNotes(updatedClassNotes);
    SchoolDatabase.saveClassNotes(updatedClassNotes);
    syncAndSave({ classNotes: updatedClassNotes });
  };

  const handleUpdateSyllabusPlans = (updatedPlans: SyllabusPlan[]) => {
    setSyllabusPlans(updatedPlans);
    SchoolDatabase.saveSyllabusPlans(updatedPlans);
    syncAndSave({ syllabusPlans: updatedPlans });
  };

  const handleUpdateTeacherAbsences = (updatedAbsences: TeacherAbsence[]) => {
    setTeacherAbsences(updatedAbsences);
    SchoolDatabase.saveTeacherAbsences(updatedAbsences);
    syncAndSave({ teacherAbsences: updatedAbsences });
  };

  const handleUpdateCoverAssignments = (updatedCovers: CoverAssignment[]) => {
    setCoverAssignments(updatedCovers);
    SchoolDatabase.saveCoverAssignments(updatedCovers);
    syncAndSave({ coverAssignments: updatedCovers });
  };

  const handleUpdateHomeworkAssignments = (updatedAssignments: HomeworkAssignment[]) => {
    setHomeworkAssignments(updatedAssignments);
    SchoolDatabase.saveHomeworkAssignments(updatedAssignments);
    syncAndSave({ homeworkAssignments: updatedAssignments });
  };

  const handleUpdateHomeworkSubmissions = (updatedSubmissions: HomeworkSubmission[]) => {
    setHomeworkSubmissions(updatedSubmissions);
    SchoolDatabase.saveHomeworkSubmissions(updatedSubmissions);
    syncAndSave({ homeworkSubmissions: updatedSubmissions });
  };

  const triggerEmailReceipt = (tx: PaymentTransaction, currentStudentsList?: Student[]) => {
    const list = currentStudentsList || SchoolDatabase.getStudents() || students;
    const student = list.find(s => s.id === tx.studentId);
    const recipientEmail = student?.parentEmail || tx.email || 'parent@school.edu';
    const recipientName = student?.parentName || tx.studentName || 'Parent / Guardian';

    const pdfStyleReceiptBody = `
========================================================================
             EDWESO ROYAL ACADEMY — OFFICIAL PAYMENT RECEIPT
========================================================================
Receipt Reference: ${tx.reference}
Date & Time:       ${tx.date}
Payment Method:    ${tx.paymentMethod}
Gateway Reference: ${tx.paystackRef}
Status:            SUCCESSFUL
------------------------------------------------------------------------
STUDENT & CUSTOMER ACCOUNT INFORMATION:
Student Name:      ${tx.studentName}
Admission Number:  ${tx.studentId}
Enrolled Term:     ${tx.term}
Parent/Guardian:   ${recipientName}
Contact Email:     ${recipientEmail}
------------------------------------------------------------------------
TRANSACTION FINANCIAL ANALYSIS:
Total Amount Paid:          GHS ${tx.amountGHS.toFixed(2)}
------------------------------------------------------------------------
LEDGER CLEARANCE RECORD:
Outstanding Tuition Balance: GHS ${(student ? Math.max(0, student.balanceGHS) : 0).toFixed(2)}
------------------------------------------------------------------------
This document is a formal verification of school fees payment. 
It has been electronically generated and signed by the Accounts and 
Bursary Department of Edweso Royal Academy. Please keep this copy 
for your auditing records.

Motto: KNOWLEDGE • DISCIPLINE • EXCELLENCE
Bursar: Seth Tetteh
Principal Signoff: Approved
========================================================================
`.trim();

    const newEmail: SimulatedEmail = {
      id: 'em-receipt-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      recipientEmail,
      recipientName,
      subject: `OFFICIAL RECEIPT: GHS ${tx.amountGHS.toFixed(2)} Tuition Payment Verified for ${tx.studentName}`,
      body: pdfStyleReceiptBody,
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'FeeDeadline',
      status: 'Sent'
    };

    setEmails(prevEmails => {
      const updated = [newEmail, ...prevEmails];
      SchoolDatabase.saveEmails(updated);
      syncAndSave({ emails: updated });
      return updated;
    });
  };

  const handleUpdateTransactions = (updatedTx: PaymentTransaction[]) => {
    // Detect if a new successful transaction was added
    if (updatedTx.length > transactions.length) {
      const newTx = updatedTx.find(tx => !transactions.some(old => old.id === tx.id));
      if (newTx && newTx.status === 'Successful') {
        triggerEmailReceipt(newTx);
      }
    } else {
      // Also detect if an existing transaction went from 'Pending' to 'Successful'
      updatedTx.forEach(tx => {
        const oldTx = transactions.find(t => t.id === tx.id);
        if (oldTx && oldTx.status === 'Pending' && tx.status === 'Successful') {
          triggerEmailReceipt(tx);
        }
      });
    }
    setTransactions(updatedTx);
    SchoolDatabase.saveTransactions(updatedTx);
    syncAndSave({ transactions: updatedTx });
  };

  // Payment Callback (When Paystack checkout is successful)
  const handlePaymentSuccess = (amount: number, method: string, ref: string, paystackRef: string) => {
    if (!session || session.role !== 'student') return;

    // 1. Deduct paid amount from matching student's balance
    const updatedStudents = students.map(s => {
      if (s.id === session.id) {
        const newBal = Math.max(0, s.balanceGHS - amount);
        return {
          ...s,
          balanceGHS: newBal
        };
      }
      return s;
    });
    setStudents(updatedStudents);
    SchoolDatabase.saveStudents(updatedStudents);

    // 2. Add Successful transaction record to the ledger
    const newTx: PaymentTransaction = {
      id: 'tx-new-' + Date.now(),
      studentId: session.id,
      studentName: session.name,
      amountGHS: amount,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Successful',
      reference: ref,
      paystackRef: paystackRef,
      paymentMethod: method as any,
      email: session.email,
      term: 'Term 1'
    };

    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    SchoolDatabase.saveTransactions(updatedTx);

    // 3. Automatically trigger email receipt
    triggerEmailReceipt(newTx, updatedStudents);

    // Sync whole set to server
    syncAndSave({ students: updatedStudents, transactions: updatedTx });
  };

  // Render Page Route Router
  return (
    <div className={isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}>
      {page === 'landing' && (
        <LandingPage onNavigateToLogin={handleNavigateToLogin} />
      )}

      {page === 'auth' && (
        <AuthPage 
          onLoginSuccess={handleLoginSuccess} 
          onBackToLanding={() => setPage('landing')} 
          initialRole={authPageInitialRole}
        />
      )}

      {page === 'dashboard' && session && (
        <DashboardLayout
          session={session}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          onStartTour={() => setIsTourOpen(true)}
        >
          {session.role === 'admin' && (
            <AdminDashboard
              activeTab={activeTab}
              students={students}
              teachers={teachers}
              classes={classes}
              subjects={subjects}
              attendance={attendance}
              grades={grades}
              timetable={timetable}
              announcements={announcements}
              transactions={transactions}
              emails={emails}
              sms={sms}
              syllabusPlans={syllabusPlans}
              teacherAbsences={teacherAbsences}
              coverAssignments={coverAssignments}
              staffClockIns={staffClockIns}
              staffPayrolls={staffPayrolls}
              staffLeaveRequests={staffLeaveRequests}
              onUpdateStudents={handleUpdateStudents}
              onUpdateTeachers={handleUpdateTeachers}
              onUpdateAnnouncements={handleUpdateAnnouncements}
              onUpdateGrades={handleUpdateGrades}
              onUpdateTimetable={handleUpdateTimetable}
              onTriggerFeeAlerts={handleTriggerFeeAlerts}
              onDeleteEmail={handleDeleteEmail}
              onSendEmail={handleSendSimulatedEmail}
              onSendSMS={handleSendSimulatedSMS}
              onDeleteSMS={handleDeleteSMS}
              onUpdateSyllabusPlans={handleUpdateSyllabusPlans}
              onUpdateTeacherAbsences={handleUpdateTeacherAbsences}
              onUpdateCoverAssignments={handleUpdateCoverAssignments}
              onUpdateStaffClockIns={handleUpdateStaffClockIns}
               onUpdateStaffPayrolls={handleUpdateStaffPayroll}
              onUpdateStaffLeaves={handleUpdateStaffLeaves}
              onUpdateTransactions={handleUpdateTransactions}
              session={session}
              homeworkAssignments={homeworkAssignments}
              isDarkMode={isDarkMode}
              schedulerPlans={schedulerPlans}
              schedulerLogs={schedulerLogs}
              onUpdateSchedulerPlans={handleUpdateSchedulerPlans}
              onUpdateSchedulerLogs={handleUpdateSchedulerLogs}
            />
          )}

          {session.role === 'student' && (
            <StudentDashboard
              session={session}
              activeTab={activeTab}
              students={students}
              teachers={teachers}
              classes={classes}
              subjects={subjects}
              attendance={attendance}
              grades={grades}
              timetable={timetable}
              announcements={announcements}
              transactions={transactions}
              emails={emails}
              syllabusPlans={syllabusPlans}
              homeworkAssignments={homeworkAssignments}
              homeworkSubmissions={homeworkSubmissions}
              onPaymentSuccess={handlePaymentSuccess}
              onDeleteEmail={handleDeleteEmail}
              onSendEmail={handleSendSimulatedEmail}
              onUpdateStudents={handleUpdateStudents}
              onUpdateSyllabusPlans={handleUpdateSyllabusPlans}
              onUpdateHomeworkSubmissions={handleUpdateHomeworkSubmissions}
              isDarkMode={isDarkMode}
              onTabChange={setActiveTab}
            />
          )}

          {session.role === 'teacher' && (
            <TeacherDashboard
              session={session}
              activeTab={activeTab}
              students={students}
              teachers={teachers}
              classes={classes}
              subjects={subjects}
              attendance={attendance}
              grades={grades}
              announcements={announcements}
              classNotes={classNotes}
              timetable={timetable}
              syllabusPlans={syllabusPlans}
              homeworkAssignments={homeworkAssignments}
              homeworkSubmissions={homeworkSubmissions}
              staffClockIns={staffClockIns}
              staffLeaveRequests={staffLeaveRequests}
              onUpdateAttendance={handleUpdateAttendance}
              onUpdateGrades={handleUpdateGrades}
              onUpdateAnnouncements={handleUpdateAnnouncements}
              onUpdateClassNotes={handleUpdateClassNotes}
              onUpdateTeachers={handleUpdateTeachers}
              onUpdateSyllabusPlans={handleUpdateSyllabusPlans}
              onUpdateHomeworkAssignments={handleUpdateHomeworkAssignments}
              onUpdateHomeworkSubmissions={handleUpdateHomeworkSubmissions}
              onUpdateStaffClockIns={handleUpdateStaffClockIns}
              onUpdateStaffLeaves={handleUpdateStaffLeaves}
              emails={emails}
              onSendEmail={handleSendSimulatedEmail}
              isDarkMode={isDarkMode}
            />
          )}

          {session.role === 'parent' && (
            <ParentDashboard
              session={session}
              activeTab={activeTab}
              students={students}
              teachers={teachers}
              classes={classes}
              subjects={subjects}
              attendance={attendance}
              grades={grades}
              announcements={announcements}
              transactions={transactions}
              emails={emails}
              sms={sms}
              timetable={timetable}
              syllabusPlans={syllabusPlans}
              homeworkAssignments={homeworkAssignments}
              onPaymentSuccess={handlePaymentSuccess}
              onSendEmail={handleSendSimulatedEmail}
              onSendSMS={handleSendSimulatedSMS}
              isDarkMode={isDarkMode}
              onTabChange={setActiveTab}
            />
          )}
        </DashboardLayout>
      )}

      {/* ==================== GLOBAL CONFIRMATION MODAL ==================== */}
      {globalConfirm.isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fade-in"
          id="global-destructive-confirm-modal"
        >
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl max-w-md w-full text-slate-850">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-2xl shrink-0 ${
                globalConfirm.type === 'danger' 
                  ? 'bg-rose-500/15 text-rose-600' 
                  : globalConfirm.type === 'warning'
                  ? 'bg-amber-500/15 text-amber-600'
                  : 'bg-emerald-500/15 text-emerald-600'
              }`}>
                {globalConfirm.type === 'danger' ? (
                  <ShieldAlert size={28} />
                ) : (
                  <AlertTriangle size={28} />
                )}
              </div>
              
              <div className="space-y-1.5 flex-1 text-left">
                <h3 className="text-base font-black tracking-tight leading-snug text-slate-900 uppercase">
                  {globalConfirm.title || 'Are you sure?'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  {globalConfirm.message}
                </p>
              </div>

              <button 
                onClick={() => setGlobalConfirm(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex space-x-2.5 mt-6 justify-end">
              <button
                type="button"
                onClick={() => setGlobalConfirm(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border bg-slate-100 hover:bg-slate-200 border-slate-200/60 text-slate-750 cursor-pointer"
              >
                {globalConfirm.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={globalConfirm.onConfirm}
                className={`px-5 py-2.5 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all flex items-center space-x-1.5 cursor-pointer ${
                  globalConfirm.type === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500 animate-pulse'
                    : globalConfirm.type === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {globalConfirm.type === 'danger' ? (
                  <Trash2 size={14} />
                ) : (
                  <CheckSquare size={14} />
                )}
                <span>{globalConfirm.confirmText}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== INTERACTIVE ONBOARDING TOUR ==================== */}
      {session && (
        <OnboardingTour
          session={session}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={isTourOpen}
          onClose={() => setIsTourOpen(false)}
        />
      )}

      {/* ==================== READING RULER HIGH-CONTRAST OVERLAY ==================== */}
      {readingRuler && (
        <div 
          className="fixed left-0 right-0 h-8 bg-amber-400/15 border-y-2 border-amber-500/70 pointer-events-none z-[99999] mix-blend-multiply dark:mix-blend-screen transition-all duration-75"
          style={{ 
            top: `${rulerY - 16}px`,
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.25)'
          }}
        />
      )}

      {/* ==================== GLOBAL ACCESSIBILITY & EYE CARE PANEL ==================== */}
      <div className="fixed bottom-6 left-6 z-[9999] flex flex-col items-start font-sans" id="global-accessibility-panel">
        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsAccessMenuOpen(!isAccessMenuOpen)}
          className={`flex items-center space-x-2.5 px-4 py-3 rounded-full shadow-2xl transition-all border transform hover:scale-105 active:scale-95 cursor-pointer ${
            isAccessMenuOpen 
              ? 'bg-emerald-800 border-emerald-600 text-white' 
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
          style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15)' }}
          title="Accessibility & Eye Care Adjustments"
          id="global-accessibility-trigger-btn"
        >
          <Accessibility size={18} className={isAccessMenuOpen ? 'animate-spin' : 'animate-pulse text-emerald-600'} />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">Eye Care Suite</span>
          {(fontSizeScale !== 'normal' || highContrast || dyslexicFont || speakOnClick || giantCursor || readingRuler || visionFilter !== 'none') && (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white animate-bounce" />
          )}
        </button>

        {/* Adjustments Popup Card */}
        {isAccessMenuOpen && (
          <>
            {/* Backdrop click closer */}
            <div className="fixed inset-0 z-40" onClick={() => setIsAccessMenuOpen(false)} />
            
            <div 
              className="absolute bottom-16 left-0 w-85 bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 z-50 text-slate-800 animate-slide-in-bottom text-left"
              style={{ boxShadow: '0 20px 35px -5px rgba(0, 0, 0, 0.2), 0 10px 15px -10px rgba(0, 0, 0, 0.2)' }}
            >
              {/* Header */}
              <div className="flex justify-between items-start pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center space-x-1.5">
                    <Eye size={14} className="text-emerald-600 animate-pulse" />
                    <span>Eye Care & Accessibility Suite</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">Comprehensive support for low-vision & fatigue</p>
                </div>
                <button 
                  onClick={() => setIsAccessMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Settings Body */}
              <div className="space-y-3.5 text-xs font-semibold max-h-[380px] overflow-y-auto pr-1">
                
                {/* 1. Font Size Adjustments */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Website Text Scale</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-black">
                      {fontSizeScale === 'normal' && '100% (Regular)'}
                      {fontSizeScale === 'large' && '115% (Large)'}
                      {fontSizeScale === 'xl' && '130% (Extra Large)'}
                      {fontSizeScale === 'xxl' && '145% (Huge)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      onClick={() => setFontSizeScale('normal')}
                      className={`py-2 rounded-xl text-[10px] font-extrabold border transition-all cursor-pointer ${
                        fontSizeScale === 'normal'
                          ? 'bg-emerald-700 border-emerald-700 text-white shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      A- (100%)
                    </button>
                    <button
                      onClick={() => setFontSizeScale('large')}
                      className={`py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        fontSizeScale === 'large'
                          ? 'bg-emerald-700 border-emerald-700 text-white shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                      title="Recommended Default Scale"
                    >
                      A (115%)
                    </button>
                    <button
                      onClick={() => setFontSizeScale('xl')}
                      className={`py-2 rounded-xl text-sm font-extrabold border transition-all cursor-pointer ${
                        fontSizeScale === 'xl'
                          ? 'bg-emerald-700 border-emerald-700 text-white shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      A+ (130%)
                    </button>
                    <button
                      onClick={() => setFontSizeScale('xxl')}
                      className={`py-2 rounded-xl text-base font-extrabold border transition-all cursor-pointer ${
                        fontSizeScale === 'xxl'
                          ? 'bg-emerald-700 border-emerald-700 text-white shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      A++ (145%)
                    </button>
                  </div>
                </div>

                {/* 2. Text to Speech (Audio Narrator) */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">Click-to-Speak Narrator</span>
                      <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">Click any text to hear it spoken aloud</span>
                    </div>
                    <button
                      onClick={() => {
                        setSpeakOnClick(!speakOnClick);
                        if (!speakOnClick) {
                          // Play a greeting voice
                          window.speechSynthesis.cancel();
                          const u = new SpeechSynthesisUtterance("Click to speak mode is now activated. Simply click any text layout on the screen.");
                          u.rate = 1.0;
                          window.speechSynthesis.speak(u);
                        } else {
                          window.speechSynthesis.cancel();
                        }
                      }}
                      className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer ${
                        speakOnClick ? 'bg-emerald-600 animate-pulse' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${
                        speakOnClick ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* 3. Horizontal Reading Ruler Line Toggle */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">Horizontal Reading Ruler</span>
                      <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">Sliding horizontal highlighter guide</span>
                    </div>
                    <button
                      onClick={() => setReadingRuler(!readingRuler)}
                      className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer ${
                        readingRuler ? 'bg-emerald-600' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${
                        readingRuler ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* 4. Color Spectrum Filters */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">Color-Blindness & Vision Filters</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setVisionFilter('none')}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        visionFilter === 'none'
                          ? 'bg-slate-800 border-slate-800 text-white'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      None
                    </button>
                    <button
                      onClick={() => setVisionFilter('monochrome')}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        visionFilter === 'monochrome'
                          ? 'bg-slate-800 border-slate-800 text-white'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                      title="Grayscale high contrast"
                    >
                      Monochrome
                    </button>
                    <button
                      onClick={() => setVisionFilter('contrast-boost')}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        visionFilter === 'contrast-boost'
                          ? 'bg-slate-800 border-slate-800 text-white'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                      title="Intense saturation and contrast trigger"
                    >
                      Contrast Boost
                    </button>
                  </div>
                </div>

                {/* 5. Custom High Contrast Toggle */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">Ultra-Black & Bold Text</span>
                      <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">Forces extra high contrast weight</span>
                    </div>
                    <button
                      onClick={() => setHighContrast(!highContrast)}
                      className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer ${
                        highContrast ? 'bg-emerald-600' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${
                        highContrast ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* 6. Giant Accessible Cursor */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">Giant Pointer Halo</span>
                      <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">Increases mouse size with bright cursor target</span>
                    </div>
                    <button
                      onClick={() => setGiantCursor(!giantCursor)}
                      className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer ${
                        giantCursor ? 'bg-emerald-600' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${
                        giantCursor ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* 7. Spaced Dyslexic & Eye Care Layout Toggle */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">Comfort-Spaced Reading</span>
                      <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">Increases row, word, & letter gap spacing</span>
                    </div>
                    <button
                      onClick={() => setDyslexicFont(!dyslexicFont)}
                      className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer ${
                        dyslexicFont ? 'bg-emerald-600' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${
                        dyslexicFont ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Reset to defaults button */}
                <div className="pt-2.5 border-t border-slate-100 flex space-x-2">
                  <button
                    onClick={() => {
                      setFontSizeScale('large');
                      setHighContrast(false);
                      setDyslexicFont(false);
                      setSpeakOnClick(false);
                      setGiantCursor(false);
                      setReadingRuler(false);
                      setVisionFilter('none');
                      window.speechSynthesis.cancel();
                    }}
                    className="w-full text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] uppercase tracking-wider font-extrabold transition-colors cursor-pointer"
                  >
                    Reset Defaults
                  </button>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
