import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckSquare, Trash2, X } from 'lucide-react';
import { UserRole, UserSession, Student, Teacher, SchoolClass, Subject, Attendance, ExamGrade, TimetableEntry, Announcement, PaymentTransaction, SimulatedEmail, ClassNote, SyllabusPlan, TeacherAbsence, CoverAssignment } from './types';
import { SchoolDatabase } from './mockData';

// Component Imports
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import DashboardLayout from './components/DashboardLayout';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import OnboardingTour from './components/OnboardingTour';

export default function App() {
  // Page Routing State: 'landing' | 'auth' | 'dashboard'
  const [page, setPage] = useState<'landing' | 'auth' | 'dashboard'>('landing');
  
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
  const [classNotes, setClassNotes] = useState<ClassNote[]>([]);
  const [syllabusPlans, setSyllabusPlans] = useState<SyllabusPlan[]>([]);
  const [teacherAbsences, setTeacherAbsences] = useState<TeacherAbsence[]>([]);
  const [coverAssignments, setCoverAssignments] = useState<CoverAssignment[]>([]);

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
    classNotes: ClassNote[];
    syllabusPlans: SyllabusPlan[];
    teacherAbsences: TeacherAbsence[];
    coverAssignments: CoverAssignment[];
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
      classNotes: updatedFields.classNotes ?? classNotes,
      syllabusPlans: updatedFields.syllabusPlans ?? syllabusPlans,
      teacherAbsences: updatedFields.teacherAbsences ?? teacherAbsences,
      coverAssignments: updatedFields.coverAssignments ?? coverAssignments,
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
          setClassNotes(db.classNotes || []);
          setSyllabusPlans(db.syllabusPlans || []);
          setTeacherAbsences(db.teacherAbsences || []);
          setCoverAssignments(db.coverAssignments || []);
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
          SchoolDatabase.saveClassNotes(db.classNotes || []);
          SchoolDatabase.saveSyllabusPlans(db.syllabusPlans || []);
          SchoolDatabase.saveTeacherAbsences(db.teacherAbsences || []);
          SchoolDatabase.saveCoverAssignments(db.coverAssignments || []);
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
        const localClassNotes = SchoolDatabase.getClassNotes();
        const localSyllabus = SchoolDatabase.getSyllabusPlans();
        const localAbsences = SchoolDatabase.getTeacherAbsences();
        const localCovers = SchoolDatabase.getCoverAssignments();

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
        setClassNotes(localClassNotes);
        setSyllabusPlans(localSyllabus);
        setTeacherAbsences(localAbsences);
        setCoverAssignments(localCovers);

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
              classNotes: localClassNotes,
              syllabusPlans: localSyllabus,
              teacherAbsences: localAbsences,
              coverAssignments: localCovers
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
      setActiveTab('classes');
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

  const handleUpdateAnnouncements = (updatedAnnouncements: Announcement[]) => {
    setAnnouncements(updatedAnnouncements);
    SchoolDatabase.saveAnnouncements(updatedAnnouncements);

    // Auto-trigger simulated emails if a new announcement is posted
    if (updatedAnnouncements.length > announcements.length) {
      const newAnn = updatedAnnouncements[0];
      let targetStudents: Student[] = [];
      if (newAnn.targetAudience === 'All' || newAnn.targetAudience === 'Students') {
        targetStudents = students;
      }

      const newSimulatedEmails: SimulatedEmail[] = [];
      targetStudents.forEach(st => {
        const emailId = 'em-auto-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
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
      });

      const updatedEmailsList = [...newSimulatedEmails, ...emails];
      setEmails(updatedEmailsList);
      SchoolDatabase.saveEmails(updatedEmailsList);
      syncAndSave({ announcements: updatedAnnouncements, emails: updatedEmailsList });
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
    recipients.forEach(st => {
      const emailId = 'em-fee-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
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
    });

    const updatedEmailsList = [...newSimulatedEmails, ...emails];
    setEmails(updatedEmailsList);
    SchoolDatabase.saveEmails(updatedEmailsList);
    syncAndSave({ emails: updatedEmailsList });
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
              syllabusPlans={syllabusPlans}
              teacherAbsences={teacherAbsences}
              coverAssignments={coverAssignments}
              onUpdateStudents={handleUpdateStudents}
              onUpdateTeachers={handleUpdateTeachers}
              onUpdateAnnouncements={handleUpdateAnnouncements}
              onUpdateGrades={handleUpdateGrades}
              onUpdateTimetable={handleUpdateTimetable}
              onTriggerFeeAlerts={handleTriggerFeeAlerts}
              onDeleteEmail={handleDeleteEmail}
              onSendEmail={handleSendSimulatedEmail}
              onUpdateSyllabusPlans={handleUpdateSyllabusPlans}
              onUpdateTeacherAbsences={handleUpdateTeacherAbsences}
              onUpdateCoverAssignments={handleUpdateCoverAssignments}
              isDarkMode={isDarkMode}
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
              onPaymentSuccess={handlePaymentSuccess}
              onDeleteEmail={handleDeleteEmail}
              onSendEmail={handleSendSimulatedEmail}
              onUpdateStudents={handleUpdateStudents}
              onUpdateSyllabusPlans={handleUpdateSyllabusPlans}
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
              onUpdateAttendance={handleUpdateAttendance}
              onUpdateGrades={handleUpdateGrades}
              onUpdateAnnouncements={handleUpdateAnnouncements}
              onUpdateClassNotes={handleUpdateClassNotes}
              onUpdateTeachers={handleUpdateTeachers}
              onUpdateSyllabusPlans={handleUpdateSyllabusPlans}
              emails={emails}
              onSendEmail={handleSendSimulatedEmail}
              isDarkMode={isDarkMode}
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
    </div>
  );
}
