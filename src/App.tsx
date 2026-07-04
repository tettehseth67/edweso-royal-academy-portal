import React, { useState, useEffect } from 'react';
import { UserRole, UserSession, Student, Teacher, SchoolClass, Subject, Attendance, ExamGrade, TimetableEntry, Announcement, PaymentTransaction, SimulatedEmail, ClassNote } from './types';
import { SchoolDatabase } from './mockData';

// Component Imports
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import DashboardLayout from './components/DashboardLayout';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';

export default function App() {
  // Page Routing State: 'landing' | 'auth' | 'dashboard'
  const [page, setPage] = useState<'landing' | 'auth' | 'dashboard'>('landing');
  
  // User Session State
  const [session, setSession] = useState<UserSession | null>(null);
  
  // Selected tab in the active dashboard
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Selected role for pre-configuring Auth Page
  const [authPageInitialRole, setAuthPageInitialRole] = useState<UserRole>('student');

  // Light/Dark Mode State - Defaults to professional light mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

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
              classNotes: localClassNotes
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
    const updated = emails.filter(em => em.id !== id);
    setEmails(updated);
    SchoolDatabase.saveEmails(updated);
    syncAndSave({ emails: updated });
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
              onUpdateStudents={handleUpdateStudents}
              onUpdateTeachers={handleUpdateTeachers}
              onUpdateAnnouncements={handleUpdateAnnouncements}
              onUpdateGrades={handleUpdateGrades}
              onUpdateTimetable={handleUpdateTimetable}
              onTriggerFeeAlerts={handleTriggerFeeAlerts}
              onDeleteEmail={handleDeleteEmail}
              onSendEmail={handleSendSimulatedEmail}
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
              onPaymentSuccess={handlePaymentSuccess}
              onDeleteEmail={handleDeleteEmail}
              onSendEmail={handleSendSimulatedEmail}
              onUpdateStudents={handleUpdateStudents}
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
              onUpdateAttendance={handleUpdateAttendance}
              onUpdateGrades={handleUpdateGrades}
              onUpdateAnnouncements={handleUpdateAnnouncements}
              onUpdateClassNotes={handleUpdateClassNotes}
              onUpdateTeachers={handleUpdateTeachers}
              emails={emails}
              onSendEmail={handleSendSimulatedEmail}
              isDarkMode={isDarkMode}
            />
          )}
        </DashboardLayout>
      )}
    </div>
  );
}
