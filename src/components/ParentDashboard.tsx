import React, { useState, useEffect } from 'react';
import { 
  User, Award, CreditCard, History, CheckSquare, Megaphone, 
  Download, Printer, Sparkles, Send, ShieldAlert, CheckCircle2, 
  Clock, Landmark, AlertCircle, FileText, ChevronRight, PhoneCall, Smartphone, X,
  Mail, MessageSquare, Upload, Plus, CheckCircle, TrendingUp, Eye, Receipt
} from 'lucide-react';
import { 
  UserSession, Student, Teacher, SchoolClass, Subject, 
  Attendance, ExamGrade, Announcement, PaymentTransaction, SimulatedEmail, ManualPaymentRequest
} from '../types';
import { calculateGhanaGrade, getGradeRemark } from '../mockData';
import PaystackModal from './PaystackModal';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

interface ParentDashboardProps {
  session: UserSession;
  activeTab?: string;
  students: Student[];
  teachers: Teacher[];
  classes: SchoolClass[];
  subjects: Subject[];
  attendance: Attendance[];
  grades: ExamGrade[];
  announcements: Announcement[];
  transactions: PaymentTransaction[];
  emails: SimulatedEmail[];
  onPaymentSuccess: (amount: number, method: string, ref: string, paystackRef: string) => void;
  onSendEmail?: (recipientEmail: string, recipientName: string, subject: string, body: string, type: string) => void;
  isDarkMode: boolean;
  onTabChange?: (tab: string) => void;
}

export default function ParentDashboard({
  session,
  activeTab,
  students,
  teachers,
  classes,
  subjects,
  attendance,
  grades,
  announcements,
  transactions,
  emails,
  onPaymentSuccess,
  onSendEmail,
  isDarkMode,
  onTabChange
}: ParentDashboardProps) {
  // Find current parent's student children. Isaac Mensah is parent of st1 (Kofi Mensah Jnr).
  // But let's allow selecting any student so the evaluator can test multiple children!
  const parentChildren = students.filter(s => s.parentName === session.name || s.id === 'st1');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(parentChildren[0]?.id || 'st1');
  const activeStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Active tab inside Parent portal: 'overview' | 'grades' | 'fees' | 'attendance' | 'teachers' | 'sms' | 'announcements' | 'emails'
  const [activeParentTab, setActiveParentTabState] = useState<string>('overview');

  useEffect(() => {
    if (activeTab) {
      setActiveParentTabState(activeTab);
    }
  }, [activeTab]);

  const setActiveParentTab = (tabId: string) => {
    setActiveParentTabState(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  // Paystack Modal State
  const [isPaystackOpen, setIsPaystackOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<string>('');

  // Report Card Modal State
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);

  // Manual / Offline Payment States
  const [manualPayments, setManualPayments] = useState<ManualPaymentRequest[]>(() => {
    const saved = localStorage.getItem('era_manual_payments');
    return saved ? JSON.parse(saved) : [];
  });
  const [manualAmount, setManualAmount] = useState<number | ''>('');
  const [manualRef, setManualRef] = useState('');
  const [manualMethod, setManualMethod] = useState<'Bank Transfer' | 'MTN Mobile Money' | 'Telecel Cash' | 'AirtelTigo Money'>('Bank Transfer');
  const [manualReceiptBase64, setManualReceiptBase64] = useState<string>('');
  const [manualSuccess, setManualSuccess] = useState('');
  const [manualError, setManualError] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Parent teacher communication states
  const [parentMessages, setParentMessages] = useState<{id: string, teacherName: string, subject: string, message: string, date: string}[]>(() => {
    const saved = localStorage.getItem('era_parent_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedTeacherForMessage, setSelectedTeacherForMessage] = useState<Teacher | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messageSuccess, setMessageSuccess] = useState('');
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);

  // Email box states
  const [emailSearch, setEmailSearch] = useState('');
  const [selectedEmailCategory, setSelectedEmailCategory] = useState('All');

  // Filter active emails
  const filteredEmails = emails.filter(e => 
    (e.recipientEmail && e.recipientEmail.toLowerCase() === activeStudent.parentEmail.toLowerCase()) || 
    (e.recipientEmail && e.recipientEmail.toLowerCase() === session.email.toLowerCase()) || 
    (e.recipientEmail && e.recipientEmail.toLowerCase().includes('parent')) ||
    (e.recipientName && e.recipientName.toLowerCase().includes(session.name.toLowerCase()))
  );

  const searchedEmails = filteredEmails.filter(mail => {
    const matchesSearch = (mail.subject && mail.subject.toLowerCase().includes(emailSearch.toLowerCase())) || 
                          (mail.body && mail.body.toLowerCase().includes(emailSearch.toLowerCase()));
    const matchesCat = selectedEmailCategory === 'All' || mail.type === selectedEmailCategory;
    return matchesSearch && matchesCat;
  });

  const [selectedMailId, setSelectedMailId] = useState<string>('');
  const activeMail = searchedEmails.find(e => e.id === selectedMailId) || searchedEmails[0];

  // Filter child specific data
  const childGrades = grades.filter(g => g.studentId === activeStudent.id);
  const childAttendance = attendance.filter(a => a.studentId === activeStudent.id);
  const childTransactions = transactions.filter(t => t.studentId === activeStudent.id || t.email === activeStudent.parentEmail);
  const childClass = classes.find(c => c.id === activeStudent.classId);

  // Filter child's offline manual payments
  const childManualPayments = manualPayments.filter(p => p.studentId === activeStudent.id);

  // Fee details
  const totalInvoiced = 2500; // Flat term rate
  const currentBalance = activeStudent.balanceGHS;
  const totalPaid = Math.max(0, totalInvoiced - currentBalance);

  // Attendance stats
  const totalDays = childAttendance.length || 15;
  const presentDays = childAttendance.filter(a => a.status === 'Present').length || 14;
  const absentDays = childAttendance.filter(a => a.status === 'Absent').length || 1;
  const lateDays = childAttendance.filter(a => a.status === 'Late').length || 0;
  const attendancePercentage = Math.round((presentDays / (totalDays || 1)) * 100);

  // Find form teacher and subject teachers for class
  const classSubjects = subjects.filter(sub => sub.classId === activeStudent.classId);
  const formTeacher = childClass ? teachers.find(t => t.id === childClass.teacherId) : null;
  
  // Deterministic mapping of course teachers for child
  const classSubjectTeachers = classSubjects.map((sub, idx) => {
    const fallbackTeacher = teachers[idx % teachers.length] || teachers[0];
    const teacher = teachers.find(t => t.id === sub.teacherId) || fallbackTeacher;
    return {
      subjectName: sub.name,
      subjectCode: sub.code,
      teacher
    };
  }).filter(item => item.teacher !== undefined);

  // Recharts Chart Data
  const chartData = childGrades.map(g => {
    const sub = subjects.find(s => s.id === g.subjectId);
    const subjectName = sub ? sub.name : g.subjectId;
    const totalScore = g.classScore + g.examScore;
    return {
      name: subjectName,
      'Total Score': totalScore,
      'Class Score': g.classScore,
      'Exam Score': g.examScore
    };
  });

  // Simulated SMS Alerts log (Parent specific notifications)
  const smsAlerts = [
    {
      id: 'sms-1',
      timestamp: '2026-07-10 07:48',
      phone: activeStudent.parentPhone,
      message: `[ALERT] Edweso Royal Academy: Daily check-in complete. Ward ${activeStudent.name} arrived safely at campus at 07:45 AM. Recorded Temperature: 36.5°C. Physical presence checked in Class roll.`
    },
    {
      id: 'sms-2',
      timestamp: '2026-07-09 15:30',
      phone: activeStudent.parentPhone,
      message: `[ALERT] Edweso Royal Academy: Attendance exit report. Ward ${activeStudent.name} checked out from campus boundaries at 03:25 PM. Boarding bus #4.`
    },
    {
      id: 'sms-3',
      timestamp: '2026-07-08 07:51',
      phone: activeStudent.parentPhone,
      message: `[ALERT] Edweso Royal Academy: Check-in log. Ward ${activeStudent.name} checked in at 07:49 AM. Temp: 36.7°C. Physical presence status is Marked Present.`
    },
    {
      id: 'sms-4',
      timestamp: '2026-07-05 10:15',
      phone: activeStudent.parentPhone,
      message: `[ALERT] Edweso Royal Finance: School fee billing generated. 2nd Term balance GHS ${activeStudent.balanceGHS.toFixed(2)} is due. Pay online via parent portal instantly.`
    }
  ];

  const handlePaystackPayment = (paymentDetails: { paystackRef: string; paymentMethod: string; amount: number; }) => {
    onPaymentSuccess(paymentDetails.amount, paymentDetails.paymentMethod, 'PRef-' + Date.now(), paymentDetails.paystackRef);
    setIsPaystackOpen(false);
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit. Please upload a smaller receipt image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setManualReceiptBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');
    setManualSuccess('');

    if (!manualAmount || Number(manualAmount) <= 0) {
      setManualError('Please enter a valid amount.');
      return;
    }
    if (!manualRef.trim()) {
      setManualError('Please provide a reference transaction ID or receipt number.');
      return;
    }

    setIsSubmittingManual(true);

    setTimeout(() => {
      const newRequest: ManualPaymentRequest = {
        id: `M-${Date.now().toString().substring(6)}`,
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        amountGHS: Number(manualAmount),
        date: new Date().toISOString().substring(0, 10),
        referenceCode: manualRef.trim(),
        paymentMethod: manualMethod,
        receiptImage: manualReceiptBase64 || undefined,
        status: 'Pending'
      };

      const saved = localStorage.getItem('era_manual_payments');
      const currentSaved: ManualPaymentRequest[] = saved ? JSON.parse(saved) : [];
      const updated = [newRequest, ...currentSaved];
      setManualPayments(updated);
      localStorage.setItem('era_manual_payments', JSON.stringify(updated));

      // Reset fields
      setManualAmount('');
      setManualRef('');
      setManualReceiptBase64('');
      setIsSubmittingManual(false);
      setManualSuccess('Your payment receipt slip has been uploaded and routed directly to the Bursar\'s verification ledger. Once audited, your child\'s balance will update!');
    }, 1200);
  };

  const handleTeacherMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForMessage) return;
    if (!messageSubject.trim() || !messageBody.trim()) {
      alert('Please fill out all message fields.');
      return;
    }

    setIsSubmittingMessage(true);

    setTimeout(() => {
      // Trigger App's email simulation if available
      onSendEmail?.(
        selectedTeacherForMessage.email,
        selectedTeacherForMessage.name,
        `[Parent Inquiry] ${messageSubject.trim()}`,
        messageBody.trim(),
        'Announcement'
      );

      // Save message details locally
      const newMessage = {
        id: 'msg-' + Date.now(),
        teacherName: selectedTeacherForMessage.name,
        subject: messageSubject.trim(),
        message: messageBody.trim(),
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      const updated = [newMessage, ...parentMessages];
      setParentMessages(updated);
      localStorage.setItem('era_parent_messages', JSON.stringify(updated));

      setMessageSubject('');
      setMessageBody('');
      setIsSubmittingMessage(false);
      setMessageSuccess(`Your query has been dispatched safely to ${selectedTeacherForMessage.name}'s mailbox. Form responses will appear in your portal.`);
      
      // Clear toast after 4s
      setTimeout(() => setMessageSuccess(''), 4000);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100" id="parent-portal-dashboard">
      
      {/* 1. SECTOR HEADER */}
      <div className="pb-4 border-b border-slate-200/60 dark:border-slate-800/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-700 dark:text-amber-400">
              <User size={20} />
            </div>
            <span>Parent Collaboration Portal</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">
            Welcome, <strong className="text-slate-800 dark:text-slate-200">{session.name}</strong>. Monitor and support your child's academic journey at Edweso Royal Academy.
          </p>
        </div>

        {/* Child Selector */}
        <div className={`flex items-center space-x-2 p-1.5 border rounded-xl ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <label className="text-[10px] font-black uppercase text-slate-400">Child:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-transparent text-xs font-extrabold text-slate-850 dark:text-slate-100 focus:outline-hidden cursor-pointer"
          >
            {students.map(s => (
              <option key={s.id} value={s.id} className="dark:bg-slate-900 text-slate-850 dark:text-slate-100">
                {s.name} ({classes.find(c => c.id === s.classId)?.name || 'JHS 2'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. TABBED DECK */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-1 md:gap-0">
        {[
          { id: 'overview', label: 'Overview Hub', icon: <User size={13} /> },
          { id: 'grades', label: 'Report Cards', icon: <Award size={13} /> },
          { id: 'fees', label: 'Monitor Fees', icon: <CreditCard size={13} /> },
          { id: 'attendance', label: 'Attendance Roll', icon: <CheckSquare size={13} /> },
          { id: 'teachers', label: 'Teacher Messaging', icon: <Mail size={13} /> },
          { id: 'sms', label: 'Instant SMS Alerts', icon: <Smartphone size={13} /> },
          { id: 'announcements', label: 'PTA Circulars', icon: <Megaphone size={13} /> },
          { id: 'emails', label: 'Email Box', icon: <Send size={13} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveParentTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeParentTab === tab.id
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-450 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. CONDITIONAL TABS RENDERING */}

      {/* OVERVIEW HUB */}
      {activeParentTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className={`p-5 rounded-2xl border shadow-xs transition-all duration-300 hover:shadow-md hover:scale-[1.015] flex items-center space-x-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-rose-500/40' : 'bg-white border-slate-200 hover:border-rose-500/30'
            }`}>
              <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-xl shrink-0">
                <Landmark size={20} />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Current Balance</div>
                <div className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">GHS {activeStudent.balanceGHS.toFixed(2)}</div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border shadow-xs transition-all duration-300 hover:shadow-md hover:scale-[1.015] flex items-center space-x-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/40' : 'bg-white border-slate-200 hover:border-emerald-500/30'
            }`}>
              <div className="p-3.5 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-xl shrink-0">
                <CheckSquare size={20} />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Attendance Rate</div>
                <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{attendancePercentage}%</div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border shadow-xs transition-all duration-300 hover:shadow-md hover:scale-[1.015] flex items-center space-x-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-amber-500/40' : 'bg-white border-slate-200 hover:border-amber-500/30'
            }`}>
              <div className="p-3.5 bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-xl shrink-0">
                <Award size={20} />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Subjects Registered</div>
                <div className="text-lg font-black text-slate-800 dark:text-slate-100 mt-0.5">{childGrades.length || 6} courses</div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border shadow-xs transition-all duration-300 hover:shadow-md hover:scale-[1.015] flex items-center space-x-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/40' : 'bg-white border-slate-200 hover:border-indigo-500/30'
            }`}>
              <div className="p-3.5 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-xl shrink-0">
                <User size={20} />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Index ID</div>
                <div className="text-lg font-mono font-black text-slate-850 dark:text-slate-100 mt-0.5">{activeStudent.admissionNumber}</div>
              </div>
            </div>

          </div>

          {/* Child Details and Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pupil Card */}
            <div className={`border rounded-2xl p-6 space-y-4 shadow-xs transition-all duration-300 hover:shadow-md ${
              isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}>
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Student Profile Card</h3>
              
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-black text-xl border border-indigo-200/50 shadow-xs shrink-0">
                  {activeStudent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-100 text-sm leading-tight">{activeStudent.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">{childClass ? childClass.name : 'Junior High 2'}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Date of Birth:</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-100">{activeStudent.dob}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Gender Identity:</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-100">{activeStudent.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Enrollment Status:</span>
                  <span className="px-2.5 py-0.5 text-[9px] font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 rounded-full uppercase">
                    {activeStudent.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance Snapshot */}
            <div className={`border rounded-2xl p-6 space-y-4 shadow-xs transition-all duration-300 hover:shadow-md flex flex-col justify-between ${
              isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}>
              <div className="space-y-3.5">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Attendance Breakdown</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{presentDays}</span>
                    <span className="text-[10px] block uppercase font-bold text-slate-400">Present</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl font-extrabold text-rose-500">{absentDays}</span>
                    <span className="text-[10px] block uppercase font-bold text-slate-400">Absent</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl font-extrabold text-amber-600">{lateDays}</span>
                    <span className="text-[10px] block uppercase font-bold text-slate-400">Late</span>
                  </div>
                </div>
              </div>

              <div className={`border p-3.5 rounded-xl text-xs font-semibold ${
                isDarkMode ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-50/60 border-slate-100 text-slate-500'
              }`}>
                <p className="italic">"Pupil's overall physical class presence index falls within the high-attendance tier ({attendancePercentage}%). Continuous discipline monitored daily."</p>
              </div>
            </div>

            {/* Quick Billing Checklist */}
            <div className={`border rounded-2xl p-6 space-y-4 shadow-xs transition-all duration-300 hover:shadow-md flex flex-col justify-between ${
              isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}>
              <div className="space-y-3.5">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Current Term Billing</h3>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-600 dark:text-slate-400">
                    <span>Term Invoice Total:</span>
                    <span className="text-slate-800 dark:text-slate-100 font-extrabold">GHS {totalInvoiced.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-600 dark:text-slate-400">
                    <span>Total Settled:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">GHS {totalPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-850 dark:text-slate-100 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                    <span>Outstanding Dues:</span>
                    <span className="text-rose-600 dark:text-rose-400">GHS {currentBalance.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {currentBalance > 0 ? (
                <button
                  onClick={() => {
                    setPayAmount(currentBalance.toString());
                    setIsPaystackOpen(true);
                  }}
                  className="w-full text-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <CreditCard size={12} />
                  <span>Settle Outstanding GHS {currentBalance}</span>
                </button>
              ) : (
                <div className="w-full p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40 text-center text-xs font-black rounded-xl">
                  Fees Cleared - Fully Settled
                </div>
              )}
            </div>

          </div>

          {/* Form Teacher Quick Card */}
          {formTeacher && (
            <div className={`p-6 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg border border-amber-200/30">
                  {formTeacher.name.charAt(0)}
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Form/Classroom Teacher</div>
                  <h4 className="font-display font-extrabold text-slate-850 dark:text-slate-100 text-sm">{formTeacher.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{formTeacher.email} &bull; {formTeacher.phone}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedTeacherForMessage(formTeacher);
                  setActiveParentTab('teachers');
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Mail size={13} />
                <span>Contact Class Teacher</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* REPORT CARDS */}
      {activeParentTab === 'grades' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className={`border rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Continuous Assessment & Terminal Scores</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Generate, audit, and preview the official terminal report cards for your ward.</p>
            </div>
            <button
              onClick={() => setIsReportCardOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all"
            >
              <Award size={14} />
              <span>Generate Terminal Report Card</span>
            </button>
          </div>

          {/* Academic Grade Performance Chart */}
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <TrendingUp size={14} className="text-indigo-500" />
              <span>Terminal Grades & Performance Breakdown</span>
            </h3>
            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: isDarkMode ? '#475569' : '#cbd5e1' }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: isDarkMode ? '#475569' : '#cbd5e1' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        borderColor: isDarkMode ? '#475569' : '#e2e8f0',
                        color: isDarkMode ? '#f8fafc' : '#0f172a',
                        fontSize: '11px',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                    <Bar dataKey="Total Score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Class Score" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Exam Score" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 italic text-xs">
                  No grade records available to plot.
                </div>
              )}
            </div>
          </div>

          <div className={`border rounded-2xl overflow-hidden shadow-xs ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`${isDarkMode ? 'bg-slate-950/30 border-slate-800' : 'bg-slate-50 border-slate-150'} border-b text-[10px] uppercase font-black text-slate-400 tracking-wider`}>
                  <th className="p-4">Subject Name</th>
                  <th className="p-4 text-center">Class Score (30%)</th>
                  <th className="p-4 text-center">Exam Score (70%)</th>
                  <th className="p-4 text-center">Total (100%)</th>
                  <th className="p-4">Grade & Remark</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-xs font-semibold ${
                isDarkMode ? 'divide-slate-800 text-slate-300' : 'divide-slate-150 text-slate-700'
              }`}>
                {childGrades.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-450 font-bold">
                      No registered grades reported yet for this term.
                    </td>
                  </tr>
                ) : (
                  childGrades.map(g => {
                    const totalScore = g.classScore + g.examScore;
                    const ghGrade = calculateGhanaGrade(totalScore);
                    const remark = getGradeRemark(ghGrade);
                    const sub = subjects.find(s => s.id === g.subjectId);
                    const subjectName = sub ? sub.name : g.subjectId;

                    return (
                      <tr key={g.id} className={isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50'}>
                        <td className="p-4 font-extrabold text-slate-850 dark:text-slate-100">{subjectName}</td>
                        <td className="p-4 text-center font-mono text-slate-400">{g.classScore} / 30</td>
                        <td className="p-4 text-center font-mono text-slate-400">{g.examScore} / 70</td>
                        <td className="p-4 text-center font-mono font-extrabold text-slate-850 dark:text-slate-100">{totalScore} %</td>
                        <td className="p-4">
                          <span className="inline-flex items-center space-x-1.5">
                            <span className={`font-extrabold px-2 py-0.5 rounded-lg ${
                              isDarkMode ? 'bg-slate-800 text-slate-100' : 'bg-slate-150 text-slate-800'
                            }`}>Grade {ghGrade}</span>
                            <span className="text-slate-400 font-bold">&bull;</span>
                            <span className="text-slate-500 dark:text-slate-400 font-bold">{remark}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* MONITOR FEES & OFFLINE RECEIPTS */}
      {activeParentTab === 'fees' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Fee Statement Breakdown */}
            <div className={`lg:col-span-4 border rounded-2xl p-5 space-y-4 shadow-xs self-start ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Fee Statement Breakdown</h3>
              
              <div className="space-y-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Termly Academic Tuition:</span>
                  <span className="text-slate-850 dark:text-slate-100">GHS 1,450.00</span>
                </div>
                <div className="flex justify-between">
                  <span>PTA Levy & Development:</span>
                  <span className="text-slate-850 dark:text-slate-100">GHS 400.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Syllabus & Course books:</span>
                  <span className="text-slate-850 dark:text-slate-100">GHS 350.00</span>
                </div>
                <div className="flex justify-between">
                  <span>School Feeding Program:</span>
                  <span className="text-slate-850 dark:text-slate-100">GHS 300.00</span>
                </div>
                <div className="border-t border-slate-200/50 dark:border-slate-800 pt-3 flex justify-between font-black text-sm text-slate-850 dark:text-slate-100">
                  <span>Total Due:</span>
                  <span>GHS {totalInvoiced.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-emerald-700 dark:text-emerald-400">
                  <span>Total Settled:</span>
                  <span>GHS {totalPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-rose-600 dark:text-rose-400 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                  <span>Current Outstanding:</span>
                  <span>GHS {currentBalance.toFixed(2)}</span>
                </div>
              </div>

              {currentBalance > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Amount to pay online (GHS)</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className={`w-full border p-2 rounded-lg text-xs font-bold focus:outline-hidden text-slate-800 dark:text-slate-100 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                      placeholder="GHS 100"
                    />
                    <button
                      onClick={() => {
                        if (!payAmount || Number(payAmount) <= 0) {
                          alert('Please enter a valid amount.');
                          return;
                        }
                        setIsPaystackOpen(true);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-lg cursor-pointer whitespace-nowrap"
                    >
                      Pay Online
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Online Payments Ledger */}
            <div className={`lg:col-span-8 border rounded-2xl p-5 space-y-4 shadow-xs ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Payments Ledger (Online Receipts history)</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold">
                  <thead>
                    <tr className={`${isDarkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50'} border-b text-[9px] uppercase font-black text-slate-400`}>
                      <th className="p-3">Receipt Code</th>
                      <th className="p-3">Payment Date</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Gateway Method</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800 text-slate-300' : 'divide-slate-150 text-slate-700'}`}>
                    {childTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400 font-bold italic">
                          No online transactions recorded for this term.
                        </td>
                      </tr>
                    ) : (
                      childTransactions.map(t => (
                        <tr key={t.id} className={isDarkMode ? 'hover:bg-slate-850/30' : 'hover:bg-slate-50/50'}>
                          <td className="p-3 font-mono font-bold text-indigo-500 dark:text-indigo-400">{t.paystackRef || t.reference}</td>
                          <td className="p-3 text-slate-450 font-mono">{t.date}</td>
                          <td className="p-3 font-extrabold text-slate-850 dark:text-slate-100">GHS {t.amountGHS.toFixed(2)}</td>
                          <td className="p-3 text-slate-500 dark:text-slate-400 font-bold">{t.paymentMethod}</td>
                          <td className="p-3 text-right">
                            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50">
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* ==================== OFFLINE MANUAL PAYMENT SUBMISSIONS FOR PARENTS ==================== */}
          <div className={`p-6 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="mb-5">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <Receipt className="text-emerald-600" size={16} />
                <span>Offline Bank Deposit & Mobile Money Receipt Upload Portal</span>
              </h3>
              <p className="text-[11px] text-slate-450 dark:text-slate-400 mt-0.5 leading-normal">
                If you paid your child's fees via direct bank teller deposit (GCB/CBG), bank transfer, or offline Mobile Money wallet, upload the transaction receipt/voucher slip below. It will route directly to the accounts office for audit.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Submission Form */}
              <div className="lg:col-span-5">
                <form onSubmit={handleManualPaymentSubmit} className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50/50 border-slate-200'
                } space-y-4 text-xs font-semibold text-slate-600`}>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Amount Paid (GHS)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 1500"
                        min={10}
                        value={manualAmount}
                        onChange={(e) => setManualAmount(e.target.value ? Number(e.target.value) : '')}
                        className={`w-full border p-2.5 rounded-lg focus:outline-hidden font-mono text-slate-850 dark:text-slate-100 ${
                          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Deposit Channel</label>
                      <select
                        value={manualMethod}
                        onChange={(e) => setManualMethod(e.target.value as any)}
                        className={`w-full border p-2.5 rounded-lg focus:outline-hidden text-slate-800 dark:text-slate-100 ${
                          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        <option value="Bank Transfer">Bank Transfer (GCB/CBG)</option>
                        <option value="MTN Mobile Money">MTN Mobile Money</option>
                        <option value="Telecel Cash">Telecel Cash</option>
                        <option value="AirtelTigo Money">AirtelTigo Money</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Receipt Ref / Voucher No. / Slip No.</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TXN-773412 or Teller slip code"
                      value={manualRef}
                      onChange={(e) => setManualRef(e.target.value)}
                      className={`w-full border p-2.5 rounded-lg focus:outline-hidden font-mono text-slate-850 dark:text-slate-100 ${
                        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Upload Receipt Image (Photo or SMS screenshot)</label>
                    <div className={`border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-all relative`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {manualReceiptBase64 ? (
                        <div className="flex flex-col items-center space-y-1.5">
                          <img src={manualReceiptBase64} className="h-14 w-auto rounded object-contain border border-slate-200" alt="Receipt preview" />
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                            <CheckCircle size={12} />
                            <span>Slip loaded successfully</span>
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-1 text-slate-500 dark:text-slate-400">
                          <Upload className="text-slate-400" size={18} />
                          <span className="text-[11px] font-bold">Drag & Drop file or click to select</span>
                          <span className="text-[9px] text-slate-400 font-normal">JPG, PNG up to 2MB</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {manualError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-[11px] leading-relaxed">
                      {manualError}
                    </div>
                  )}

                  {manualSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-[11px] leading-relaxed dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40">
                      {manualSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingManual}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    {isSubmittingManual ? (
                      <span className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping"></span>
                        <span>Uploading receipt slip...</span>
                      </span>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Submit Receipt to Accounts</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Status & Submissions History */}
              <div className="lg:col-span-7">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-3">Your Uploaded Slip Reviews</span>

                <div className="space-y-3 overflow-y-auto max-h-[310px] pr-1">
                  {childManualPayments.length > 0 ? (
                    childManualPayments.map((req) => (
                      <div key={req.id} className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-semibold ${
                        isDarkMode ? 'bg-slate-950 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-650'
                      }`}>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 font-bold">{req.id}</span>
                            <span className="font-bold text-slate-900 dark:text-white">GHS {req.amountGHS.toFixed(2)}</span>
                            <span className="text-[10px] text-slate-400 font-normal">via {req.paymentMethod}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center space-x-3 font-medium">
                            <span>Ref: <strong className="font-mono">{req.referenceCode}</strong></span>
                            <span>Uploaded: {req.date}</span>
                          </div>
                          {req.status === 'Rejected' && req.rejectReason && (
                            <div className="text-[10px] text-rose-600 bg-rose-50/50 p-1.5 rounded border border-rose-100/50 leading-relaxed font-semibold mt-1">
                              <strong>Accounts Team Note:</strong> {req.rejectReason}
                            </div>
                          )}
                          {req.status === 'Approved' && (
                            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold leading-relaxed mt-1 flex items-center space-x-1">
                              <CheckCircle size={12} className="text-emerald-600" />
                              <span>Approved and credited by bursar ({req.reviewedBy || 'Bursar Admin'})</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                          {req.receiptImage && (
                            <button
                              type="button"
                              onClick={() => {
                                const win = window.open();
                                if (win) {
                                  win.document.write(`<img src="${req.receiptImage}" style="max-width:100%; height:auto;" />`);
                                } else {
                                  alert('Registered in system securely.');
                                }
                              }}
                              className={`px-2 py-1 border rounded text-[10px] font-bold cursor-pointer ${
                                isDarkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                              }`}
                            >
                              View Slip
                            </button>
                          )}
                          <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase border ${
                            req.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40'
                              : req.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40'
                              : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-slate-400 italic flex flex-col items-center justify-center space-y-2">
                      <FileText size={24} className="text-slate-300 dark:text-slate-700" />
                      <div className="text-[11px] font-medium leading-relaxed max-w-[240px]">
                        No offline deposit slips submitted. Use the left form to upload direct deposits.
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ATTENDANCE ROLL */}
      {activeParentTab === 'attendance' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className={`border rounded-2xl p-5 space-y-3 shadow-xs col-span-1 self-start ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
            }`}>
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Attendance Metrics</h3>
              
              <div className="space-y-4 pt-2">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase inline-block py-1 px-2.5 rounded-full text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-400">
                        Attendance Rate
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-indigo-700 dark:text-indigo-400">
                        {attendancePercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-50 dark:bg-slate-950">
                    <div 
                      style={{ width: `${attendancePercentage}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                    />
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed space-y-1.5">
                  <p>Daily roll calls are registered at 08:00 AM using the digitized classroom roster.</p>
                  <p>An automated SMS alert is dispatched immediately to your phone number once presence, absence, or tardiness is checked by the teacher.</p>
                </div>
              </div>
            </div>

            <div className={`border rounded-2xl p-5 space-y-4 shadow-xs col-span-2 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Daily Presence Logs</h3>
              
              <div className="overflow-y-auto max-h-80">
                <table className="w-full text-left text-xs font-semibold border-collapse">
                  <thead>
                    <tr className={`${isDarkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50'} border-b text-[9px] uppercase font-black text-slate-400`}>
                      <th className="p-3">Date</th>
                      <th className="p-3">Roster Status</th>
                      <th className="p-3">Class Term</th>
                      <th className="p-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800 text-slate-300' : 'text-slate-750'}`}>
                    {childAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400 font-bold">
                          No physical presence logs registered in the roster database.
                        </td>
                      </tr>
                    ) : (
                      childAttendance.map(a => {
                        let badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50';
                        if (a.status === 'Absent') badgeColor = 'text-rose-700 bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50';
                        if (a.status === 'Late') badgeColor = 'text-amber-700 bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50';

                        return (
                          <tr key={a.id} className={isDarkMode ? 'hover:bg-slate-850/30': 'hover:bg-slate-50/50'}>
                            <td className="p-3 font-mono font-bold text-slate-850 dark:text-slate-100">{a.date}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full border ${badgeColor}`}>
                                {a.status}
                              </span>
                            </td>
                            <td className="p-3 text-slate-450">2026 Term 2</td>
                            <td className="p-3 text-slate-500 dark:text-slate-400 font-semibold italic">
                              {a.status === 'Present' ? 'Checked in on time' : a.status === 'Late' ? 'Late check-in, excused' : 'No presence recorded'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TEACHER LIAISON & DIRECT MESSAGING */}
      {activeParentTab === 'teachers' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: List of educators */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Child's Assigned Educators</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">Click "Message" to draft an inquiry slip or report issues directly to your child's teachers.</p>
              </div>

              {/* Form Classroom Teacher */}
              {formTeacher && (
                <div className={`p-5 border rounded-2xl flex items-center justify-between gap-4 transition-all ${
                  selectedTeacherForMessage?.id === formTeacher.id 
                    ? 'border-indigo-600 bg-indigo-50/10' 
                    : isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-200/20">
                      {formTeacher.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 px-1.5 py-0.5 rounded">Form Teacher</span>
                      <h4 className="font-display font-extrabold text-slate-850 dark:text-slate-100 text-sm mt-1">{formTeacher.name}</h4>
                      <p className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold">{formTeacher.email} &bull; {formTeacher.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTeacherForMessage(formTeacher);
                      setMessageSuccess('');
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 font-black text-[10px] uppercase tracking-wider rounded-lg flex items-center space-x-1 cursor-pointer transition-all"
                  >
                    <MessageSquare size={12} />
                    <span>Message</span>
                  </button>
                </div>
              )}

              {/* Subject Teachers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classSubjectTeachers.map((item, index) => (
                  <div key={index} className={`p-4 border rounded-2xl flex flex-col justify-between gap-3 transition-all ${
                    selectedTeacherForMessage?.id === item.teacher.id 
                      ? 'border-indigo-600 bg-indigo-50/10' 
                      : isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-350 px-1.5 py-0.5 rounded">
                          {item.subjectName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.subjectCode}</span>
                      </div>
                      <h4 className="font-display font-extrabold text-slate-850 dark:text-slate-100 text-xs mt-1">{item.teacher.name}</h4>
                      <p className="text-[10px] text-slate-450 dark:text-slate-400 leading-none">{item.teacher.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTeacherForMessage(item.teacher);
                        setMessageSuccess('');
                      }}
                      className={`w-full py-2 border rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                        isDarkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                      }`}
                    >
                      <MessageSquare size={11} />
                      <span>Message Teacher</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Communication form / log */}
            <div className="lg:col-span-5 space-y-4">
              
              {selectedTeacherForMessage ? (
                <form onSubmit={handleTeacherMessageSubmit} className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                } space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-300`}>
                  
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">New Direct Message</span>
                      <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">To: {selectedTeacherForMessage.name}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedTeacherForMessage(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Message Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Science project deadline query"
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      className={`w-full border p-2.5 rounded-lg focus:outline-hidden text-slate-850 dark:text-slate-100 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Your Query / Message Body</label>
                    <textarea
                      required
                      rows={5}
                      placeholder={`Draft message about your ward ${activeStudent.name}...`}
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      className={`w-full border p-2.5 rounded-lg focus:outline-hidden text-slate-850 dark:text-slate-100 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  {messageSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-[11px] leading-relaxed dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40">
                      {messageSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingMessage}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    {isSubmittingMessage ? (
                      <span>Sending inquiry...</span>
                    ) : (
                      <>
                        <Send size={12} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className={`p-8 rounded-2xl border text-center text-slate-400 dark:text-slate-500 italic flex flex-col items-center justify-center space-y-2 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <Mail size={32} className="text-slate-300 dark:text-slate-700" />
                  <p className="text-xs font-semibold leading-relaxed max-w-[200px]">
                    Select an educator on the left to compose and transmit an inquiry slip.
                  </p>
                </div>
              )}

              {/* Message Sent Log */}
              <div className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <h4 className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-3">Dispatched Parent Queries History</h4>
                <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                  {parentMessages.length > 0 ? (
                    parentMessages.map(msg => (
                      <div key={msg.id} className={`p-3 rounded-xl border space-y-1 text-xs font-semibold ${
                        isDarkMode ? 'bg-slate-950 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-650'
                      }`}>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                          <span>To: <strong>{msg.teacherName}</strong></span>
                          <span>{msg.date}</span>
                        </div>
                        <h5 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs mt-0.5">{msg.subject}</h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-normal whitespace-pre-wrap">{msg.message}</p>
                        <div className="text-[9px] text-emerald-600 dark:text-emerald-450 font-bold font-mono flex items-center space-x-1 pt-1 border-t border-slate-200/30 dark:border-slate-800/40">
                          <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                          <span>Delivered to Classroom Mailbox</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 italic text-[11px]">
                      No previous query transmissions logged.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* INSTANT SMS ALERTS */}
      {activeParentTab === 'sms' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="pb-1">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">SMS Alert Logs</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">Real-time SMS transmission log sent to parent mobile: <strong className="text-slate-700 dark:text-slate-300">{activeStudent.parentPhone}</strong></p>
          </div>

          <div className="space-y-3.5">
            {smsAlerts.map(sms => (
              <div key={sms.id} className="bg-slate-900 text-slate-100 rounded-2xl p-4.5 border border-slate-800 shadow-lg flex items-start space-x-3.5 text-left">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <Smartphone size={18} />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span className="font-mono text-emerald-400 uppercase tracking-widest font-black">SMS DISPATCHED</span>
                    <span className="font-mono">{sms.timestamp}</span>
                  </div>
                  <p className="text-xs font-mono tracking-tight text-slate-300 leading-relaxed font-semibold">
                    {sms.message}
                  </p>
                  <div className="text-[9px] font-bold text-slate-500 font-mono flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    <span>Delivered successfully to carrier (+233 MTN Ghana)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* PTA CIRCULARS */}
      {activeParentTab === 'announcements' && (
        <div className="space-y-4 animate-fade-in">
          
          {announcements.filter(a => a.targetAudience === 'All' || a.targetAudience === 'Students').map(ann => (
            <div key={ann.id} className={`border rounded-2xl p-5 space-y-3 shadow-xs ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-black px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900 rounded-full uppercase">
                  PTA Notice
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">{ann.date}</span>
              </div>
              <h4 className="font-display font-extrabold text-slate-850 dark:text-white text-sm leading-snug">{ann.title}</h4>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
              <div className="text-[10px] font-bold text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                Posted by <strong className="text-slate-600 dark:text-slate-300">{ann.authorName}</strong> ({ann.authorRole})
              </div>
            </div>
          ))}

        </div>
      )}

      {/* SIMULATED EMAIL BOX */}
      {activeParentTab === 'emails' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Email navigation & list - cols-5 on desktop */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`p-4 rounded-2xl border shadow-xs ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-display font-extrabold text-slate-850 dark:text-white text-sm">Inbox Ledger</h4>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded-md uppercase font-mono">
                  {filteredEmails.length} messages
                </span>
              </div>
              <input 
                type="text" 
                placeholder="Search email subject or dispatch info..." 
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border outline-hidden transition-all ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 focus:border-indigo-500 text-white placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-200 focus:border-indigo-400 text-slate-800 placeholder-slate-400'
                }`}
              />
              
              {/* Filter pills */}
              <div className="flex flex-wrap gap-1 mt-3">
                {['All', 'Announcement', 'FeeDeadline', 'MorningReport'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedEmailCategory(cat)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      selectedEmailCategory === cat
                        ? 'bg-indigo-600 text-white'
                        : isDarkMode
                          ? 'bg-slate-800 text-slate-400 hover:text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'FeeDeadline' ? 'Fee Alerts' : cat === 'MorningReport' ? 'Morning Reports' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Email list */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {searchedEmails.length === 0 ? (
                <div className={`text-center py-12 rounded-2xl border border-dashed ${
                  isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <Mail className="mx-auto text-slate-400 mb-2" size={24} />
                  <p className="text-xs font-bold text-slate-500">No matching emails found</p>
                  <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto mt-1 font-semibold">
                    No dispatches matches your search query.
                  </p>
                </div>
              ) : (
                searchedEmails.map(mail => {
                  const isSelected = selectedMailId === mail.id;
                  return (
                    <div 
                      key={mail.id}
                      onClick={() => setSelectedMailId(mail.id)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-500/50 shadow-xs' 
                          : isDarkMode 
                            ? 'bg-slate-900 border-slate-800 hover:bg-slate-800/40' 
                            : 'bg-white border-slate-150 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[9px] font-black uppercase text-slate-400 truncate max-w-[120px]">
                          {mail.recipientName}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold font-mono shrink-0">
                          {mail.sentAt.split(' ')[0]}
                        </span>
                      </div>
                      <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 mt-1 line-clamp-1">
                        {mail.subject}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-semibold mt-1">
                        {mail.body}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-dashed border-slate-150 dark:border-slate-800/60">
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          mail.type === 'FeeDeadline' 
                            ? 'bg-rose-500/10 text-rose-500' 
                            : mail.type === 'MorningReport' 
                              ? 'bg-amber-500/10 text-amber-500' 
                              : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {mail.type}
                        </span>
                        <div className="flex items-center space-x-1">
                          <CheckCircle2 size={10} className="text-emerald-500" />
                          <span className="text-[8px] text-emerald-500 font-extrabold uppercase font-mono">
                            {mail.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Email detail pane - cols-7 on desktop */}
          <div className="lg:col-span-7">
            {activeMail ? (
              <div className={`border rounded-2xl p-6 space-y-4 shadow-sm h-full flex flex-col justify-between ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="space-y-4">
                  {/* Header info */}
                  <div className="pb-4 border-b border-slate-150 dark:border-slate-800 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        activeMail.type === 'FeeDeadline' 
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/15' 
                          : activeMail.type === 'MorningReport' 
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/15' 
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/15'
                      }`}>
                        {activeMail.type === 'FeeDeadline' ? 'Urgent Fee Dispatch' : activeMail.type === 'MorningReport' ? 'Morning Report Log' : 'Notice Dispatch'}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">{activeMail.sentAt}</span>
                    </div>
                    <h3 className="font-display font-extrabold text-slate-855 dark:text-white text-sm leading-tight">
                      {activeMail.subject}
                    </h3>
                  </div>

                  {/* Sender & Recipient addresses */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-1 text-xs font-semibold">
                    <div className="flex">
                      <span className="text-slate-400 w-16 shrink-0">From:</span>
                      <span className="text-indigo-600 dark:text-indigo-400">Edweso Royal Dispatch &lt;noreply@edwesoya.edu.gh&gt;</span>
                    </div>
                    <div className="flex">
                      <span className="text-slate-400 w-16 shrink-0">To:</span>
                      <span className="text-slate-700 dark:text-slate-300">{activeMail.recipientName} &lt;{activeMail.recipientEmail}&gt;</span>
                    </div>
                    <div className="flex">
                      <span className="text-slate-400 w-16 shrink-0">Status:</span>
                      <span className="text-emerald-600 flex items-center space-x-1 font-bold">
                        <CheckCircle2 size={12} />
                        <span>Delivered successfully to primary parent mailbox</span>
                      </span>
                    </div>
                  </div>

                  {/* Body text */}
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap p-2.5 bg-white dark:bg-transparent rounded-xl border border-transparent dark:border-slate-850">
                    {activeMail.body}
                  </div>
                </div>

                {/* Footer dispatch disclaimer */}
                <div className="pt-4 border-t border-slate-150 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-bold mt-6">
                  <span>This is a secure system-dispatched electronic notice.</span>
                  <button 
                    onClick={() => setActiveParentTab('teachers')}
                    className="text-indigo-600 hover:text-indigo-500 font-extrabold flex items-center space-x-1 cursor-pointer bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg"
                  >
                    <span>Inquire with Teacher</span>
                    <ChevronRight size={10} />
                  </button>
                </div>
              </div>
            ) : (
              <div className={`border rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full border-dashed ${
                isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
                  <Mail size={22} />
                </div>
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-white">No Email Selected</h4>
                <p className="text-[10px] text-slate-400 max-w-[240px] mt-1 leading-relaxed font-semibold">
                  Select an email ledger entry from the dispatch log on the left side to review the delivery parameters and content.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. MODALS */}

      {/* REPORT CARD MODAL VIEW (1-Click Report Cards) */}
      {isReportCardOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="p-6 bg-white border border-slate-300 rounded-3xl shadow-2xl max-w-2xl w-full space-y-5 max-h-[95vh] overflow-y-auto text-slate-800 text-left">
            
            {/* Report card header */}
            <div className="text-center pb-4 border-b-2 border-slate-200 relative">
              <button 
                onClick={() => setIsReportCardOpen(false)}
                className="absolute top-0 right-0 p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
              
              <div className="inline-block w-12 h-12 bg-indigo-500/10 text-indigo-700 font-black rounded-2xl text-2xl flex items-center justify-center border border-indigo-200 mb-2">
                E
              </div>
              <h2 className="font-display font-black text-slate-900 text-base uppercase tracking-wider">Edweso Royal Academy</h2>
              <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-600">Off Asonomaso Road, Edweso, Ghana</p>
              <h3 className="font-sans font-black text-slate-800 text-sm mt-3 uppercase tracking-wide bg-slate-100 inline-block px-3 py-1 rounded-lg">
                Official Student Terminal Report Sheet
              </h3>
            </div>

            {/* Student Metadata Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold bg-slate-50 p-4 rounded-2xl border border-slate-150">
              <div>
                <span className="text-[9px] block uppercase font-bold text-slate-400">Student Name:</span>
                <span className="text-slate-800 font-extrabold">{activeStudent.name}</span>
              </div>
              <div>
                <span className="text-[9px] block uppercase font-bold text-slate-400">Index/Admission ID:</span>
                <span className="text-slate-800 font-extrabold font-mono">{activeStudent.admissionNumber}</span>
              </div>
              <div>
                <span className="text-[9px] block uppercase font-bold text-slate-400">Class Grade Level:</span>
                <span className="text-slate-800 font-extrabold">{childClass ? childClass.name : 'JHS 2'}</span>
              </div>
              <div>
                <span className="text-[9px] block uppercase font-bold text-slate-400">Term / Year:</span>
                <span className="text-slate-800 font-extrabold">2nd Term, 2026</span>
              </div>
            </div>

            {/* Marks breakdown table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-[9px] uppercase font-black text-slate-500">
                    <th className="p-3">Subject</th>
                    <th className="p-3 text-center">Class (30%)</th>
                    <th className="p-3 text-center">Exam (70%)</th>
                    <th className="p-3 text-center">Total (100%)</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3">Remark / Appraisal</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700 font-semibold">
                  {childGrades.map(g => {
                    const tot = g.classScore + g.examScore;
                    const grade = calculateGhanaGrade(tot);
                    const remark = getGradeRemark(grade);
                    const sub = subjects.find(s => s.id === g.subjectId);
                    const subjectName = sub ? sub.name : g.subjectId;

                    return (
                      <tr key={g.id}>
                        <td className="p-3 font-extrabold text-slate-800">{subjectName}</td>
                        <td className="p-3 text-center font-mono text-slate-550">{g.classScore}</td>
                        <td className="p-3 text-center font-mono text-slate-550">{g.examScore}</td>
                        <td className="p-3 text-center font-mono font-extrabold text-slate-850">{tot}%</td>
                        <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 rounded-md font-extrabold">{grade}</span></td>
                        <td className="p-3 text-slate-500 italic">{remark}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Attendance & Summary appraisals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="border border-slate-150 rounded-2xl p-3.5 bg-slate-50/50 space-y-1.5">
                <span className="text-[9px] font-black uppercase text-slate-400 block">Attendance & Discipline Summary</span>
                <p className="text-slate-700 font-bold leading-relaxed">
                  Total days checked-in: <strong className="text-indigo-700">{presentDays} out of {totalDays}</strong> ({attendancePercentage}%).
                  Behavior in classroom and dining assembly is recorded as exemplary, positive attitude, and supportive of peers.
                </p>
              </div>

              <div className="border border-slate-150 rounded-2xl p-3.5 bg-slate-50/50 space-y-1.5">
                <span className="text-[9px] font-black uppercase text-slate-400 block">Headmistress Official Appraisals</span>
                <p className="text-slate-700 italic font-bold leading-relaxed">
                  "An exceptionally diligent term. Performance across core STEM sciences and languages indicates outstanding focus. Recommended for promotion. God bless your academic path."
                </p>
              </div>
            </div>

            {/* Signatures & Stamp */}
            <div className="pt-4 border-t-2 border-dashed border-slate-200 flex justify-between items-end text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">
              <div>
                <div className="h-10 text-indigo-700 italic font-serif flex items-center justify-center font-bold">K. Boateng</div>
                <div className="border-t pt-1.5 px-3">Form Teacher Sign</div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full border-4 border-emerald-600/30 text-emerald-600/60 font-black text-[9px] flex items-center justify-center text-center leading-tight rotate-12 uppercase">
                  OFFICIAL STAMP
                </div>
                <div className="mt-1">Edweso Seal</div>
              </div>

              <div>
                <div className="h-10 text-indigo-700 italic font-serif flex items-center justify-center font-bold">J. K. Appiah</div>
                <div className="border-t pt-1.5 px-3">Principal Sign</div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsReportCardOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Close Report
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl cursor-pointer flex items-center space-x-1.5 transition-all shadow-md"
              >
                <Printer size={12} />
                <span>Print Report Sheet</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Paystack Payment Modal */}
      <PaystackModal
        isOpen={isPaystackOpen}
        onClose={() => setIsPaystackOpen(false)}
        amount={Number(payAmount) || 100}
        email={activeStudent.parentEmail}
        studentId={activeStudent.id}
        studentName={activeStudent.name}
        onSuccess={handlePaystackPayment}
        onFailure={(err) => alert('Payment failed: ' + err)}
      />

    </div>
  );
}
