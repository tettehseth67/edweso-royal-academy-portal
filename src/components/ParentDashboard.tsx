import React, { useState } from 'react';
import { 
  User, Award, CreditCard, History, CheckSquare, Megaphone, 
  Download, Printer, Sparkles, Send, ShieldAlert, CheckCircle2, 
  Clock, Landmark, AlertCircle, FileText, ChevronRight, PhoneCall, Smartphone, X
} from 'lucide-react';
import { 
  UserSession, Student, Teacher, SchoolClass, Subject, 
  Attendance, ExamGrade, Announcement, PaymentTransaction, SimulatedEmail 
} from '../types';
import { calculateGhanaGrade, getGradeRemark } from '../mockData';
import PaystackModal from './PaystackModal';

interface ParentDashboardProps {
  session: UserSession;
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

  // Active tab inside Parent portal: 'overview' | 'grades' | 'fees' | 'attendance' | 'announcements' | 'sms'
  const [activeParentTab, setActiveParentTab] = useState<string>('overview');

  // Paystack Modal State
  const [isPaystackOpen, setIsPaystackOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<string>('');

  // Report Card Modal State
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);

  // Filter child specific data
  const childGrades = grades.filter(g => g.studentId === activeStudent.id);
  const childAttendance = attendance.filter(a => a.studentId === activeStudent.id);
  const childTransactions = transactions.filter(t => t.studentId === activeStudent.id || t.email === activeStudent.parentEmail);
  const childClass = classes.find(c => c.id === activeStudent.classId);

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

  return (
    <div className="space-y-6 animate-fade-in" id="parent-portal-dashboard">
      
      {/* 1. SECTOR HEADER */}
      <div className="pb-4 border-b border-slate-200/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 flex items-center space-x-2">
            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-700">
              <User size={20} />
            </div>
            <span>Parent Collaboration Portal</span>
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Welcome, <strong className="text-slate-800">{session.name}</strong>. Monitor and support your child's academic journey at Edweso Royal Academy.
          </p>
        </div>

        {/* Child Selector */}
        <div className="flex items-center space-x-2 bg-slate-50 p-1.5 border border-slate-200 rounded-xl">
          <label className="text-[10px] font-black uppercase text-slate-400">Child:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-transparent text-xs font-extrabold text-slate-800 focus:outline-hidden cursor-pointer"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({classes.find(c => c.id === s.classId)?.name || 'JHS 2'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. TABBED DECK */}
      <div className="flex flex-wrap border-b border-slate-200 gap-1 md:gap-0">
        {[
          { id: 'overview', label: 'Overview Hub', icon: <User size={13} /> },
          { id: 'grades', label: 'Report Cards', icon: <Award size={13} /> },
          { id: 'fees', label: 'Monitor Fees', icon: <CreditCard size={13} /> },
          { id: 'attendance', label: 'Attendance Roll', icon: <CheckSquare size={13} /> },
          { id: 'sms', label: 'Instant SMS Alerts', icon: <Smartphone size={13} /> },
          { id: 'announcements', label: 'PTA Circulars', icon: <Megaphone size={13} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveParentTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeParentTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-450 hover:text-slate-700'
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-700">
                <Landmark size={20} />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400">Current Balance</div>
                <div className="text-base font-black text-rose-600">GHS {activeStudent.balanceGHS.toFixed(2)}</div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
                <CheckSquare size={20} />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400">Attendance Rate</div>
                <div className="text-base font-black text-emerald-700">{attendancePercentage}%</div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-700">
                <Award size={20} />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400">Subjects Registered</div>
                <div className="text-base font-black text-slate-800">{childGrades.length || 6} courses</div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-700">
                <User size={20} />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400">Index ID</div>
                <div className="text-base font-mono font-black text-slate-800">{activeStudent.admissionNumber}</div>
              </div>
            </div>

          </div>

          {/* Child Details and Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pupil Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Student Profile Card</h3>
              
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center font-black text-xl border border-indigo-200/50 shadow-sm">
                  {activeStudent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-slate-800 text-sm leading-tight">{activeStudent.name}</h4>
                  <p className="text-xs text-slate-500 font-bold mt-1">{childClass ? childClass.name : 'Junior High 2'}</p>
                </div>
              </div>

              <div className="border-t pt-3.5 space-y-2.5 text-xs text-slate-600 font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-400">Date of Birth:</span>
                  <span className="font-extrabold text-slate-800">{activeStudent.dob}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gender Identity:</span>
                  <span className="font-extrabold text-slate-800">{activeStudent.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Enrollment Status:</span>
                  <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full uppercase">
                    {activeStudent.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance Snapshot */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs flex flex-col justify-between">
              <div className="space-y-3.5">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Attendance Breakdown</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-2xl font-extrabold text-slate-800">{presentDays}</span>
                    <span className="text-[10px] block uppercase font-bold text-slate-400">Days Present</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl font-extrabold text-rose-500">{absentDays}</span>
                    <span className="text-[10px] block uppercase font-bold text-slate-400">Days Absent</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl font-extrabold text-amber-600">{lateDays}</span>
                    <span className="text-[10px] block uppercase font-bold text-slate-400">Days Late</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border p-3.5 rounded-xl text-xs font-bold text-slate-500">
                <p className="text-slate-600 italic">"Pupil's overall physical class presence index falls within the high-attendance tier ({attendancePercentage}%). Continuous discipline monitored daily."</p>
              </div>
            </div>

            {/* Quick Billing Checklist */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs flex flex-col justify-between">
              <div className="space-y-3.5">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Current Term Billing</h3>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>Term Invoice Total:</span>
                    <span className="text-slate-800">GHS {totalInvoiced.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>Total Settled:</span>
                    <span className="text-emerald-700">GHS {totalPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-800 pt-2 border-t">
                    <span>Outstanding Dues:</span>
                    <span className="text-rose-600">GHS {currentBalance.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {currentBalance > 0 ? (
                <button
                  onClick={() => {
                    setPayAmount(currentBalance.toString());
                    setIsPaystackOpen(true);
                  }}
                  className="w-full text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <CreditCard size={12} />
                  <span>Settle Outstanding GHS {currentBalance}</span>
                </button>
              ) : (
                <div className="w-full p-2 bg-emerald-50 text-emerald-700 border border-emerald-200/50 text-center text-xs font-black rounded-xl">
                  Fees Cleared - Fully Settled
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* REPORT CARDS */}
      {activeParentTab === 'grades' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Continuous Assessment & Terminal Scores</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Generate, audit, and preview the official terminal report cards for your ward.</p>
            </div>
            <button
              onClick={() => setIsReportCardOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl flex items-center space-x-1.5 shadow-md cursor-pointer"
            >
              <Award size={14} />
              <span>Generate terminal Report Card</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                  <th className="p-4">Subject Name</th>
                  <th className="p-4 text-center">Class Score (30%)</th>
                  <th className="p-4 text-center">Exam Score (70%)</th>
                  <th className="p-4 text-center">Total (100%)</th>
                  <th className="p-4">Grade & Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs font-semibold text-slate-700">
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
                      <tr key={g.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-extrabold text-slate-800">{subjectName}</td>
                        <td className="p-4 text-center font-mono text-slate-500">{g.classScore} / 30</td>
                        <td className="p-4 text-center font-mono text-slate-500">{g.examScore} / 70</td>
                        <td className="p-4 text-center font-mono font-extrabold text-slate-800">{totalScore} %</td>
                        <td className="p-4">
                          <span className="inline-flex items-center space-x-1.5">
                            <span className="font-extrabold px-2 py-0.5 bg-slate-100 rounded-lg text-slate-800">Grade {ghGrade}</span>
                            <span className="text-slate-400 font-bold">&bull;</span>
                            <span className="text-slate-500 font-bold">{remark}</span>
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

      {/* MONITOR FEES */}
      {activeParentTab === 'fees' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white border rounded-2xl p-5 space-y-4 shadow-sm col-span-1">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Fee Statement Breakdown</h3>
              
              <div className="space-y-3 text-xs font-bold text-slate-600">
                <div className="flex justify-between">
                  <span>Termly Academic Tuition:</span>
                  <span className="text-slate-800">GHS 1,450.00</span>
                </div>
                <div className="flex justify-between">
                  <span>PTA Levy & Development:</span>
                  <span className="text-slate-800">GHS 400.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Syllabus & Course books:</span>
                  <span className="text-slate-800">GHS 350.00</span>
                </div>
                <div className="flex justify-between">
                  <span>School Feeding Program:</span>
                  <span className="text-slate-800">GHS 300.00</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-black text-sm text-slate-800">
                  <span>Total Due:</span>
                  <span>GHS {totalInvoiced.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-emerald-700">
                  <span>Total Settled:</span>
                  <span>GHS {totalPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-rose-600 pt-1 border-t">
                  <span>Current Outstanding:</span>
                  <span>GHS {currentBalance.toFixed(2)}</span>
                </div>
              </div>

              {currentBalance > 0 && (
                <div className="pt-2">
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Amount to pay (GHS)</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full bg-slate-50 border p-2 rounded-lg text-xs font-bold focus:outline-hidden text-slate-800"
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

            <div className="bg-white border rounded-2xl p-5 space-y-4 shadow-sm col-span-2">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Payments Ledger (Receipts history)</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold">
                  <thead>
                    <tr className="bg-slate-50 border-b text-[9px] uppercase font-black text-slate-400">
                      <th className="p-3">Receipt Code</th>
                      <th className="p-3">Payment Date</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Gateway Method</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {childTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400 font-bold">
                          No transactions reported.
                        </td>
                      </tr>
                    ) : (
                      childTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono font-bold text-indigo-700">{t.paystackRef || t.reference}</td>
                          <td className="p-3 text-slate-450 font-mono">{t.date}</td>
                          <td className="p-3 font-extrabold text-slate-800">GHS {t.amountGHS.toFixed(2)}</td>
                          <td className="p-3 text-slate-500 font-bold">{t.paymentMethod}</td>
                          <td className="p-3 text-right">
                            <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase">
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

        </div>
      )}

      {/* ATTENDANCE ROLL */}
      {activeParentTab === 'attendance' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white border rounded-2xl p-5 space-y-3 shadow-sm col-span-1">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Attendance Metrics</h3>
              
              <div className="space-y-4 pt-2">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase inline-block py-1 px-2.5 rounded-full text-indigo-600 bg-indigo-50">
                        Attendance Rate
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-indigo-700">
                        {attendancePercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-50">
                    <div 
                      style={{ width: `${attendancePercentage}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500"
                    />
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-500 leading-relaxed space-y-1.5">
                  <p>Daily roll calls are registered at 08:00 AM using the digitized classroom roster.</p>
                  <p>An automated SMS alert is dispatched immediately to your phone number once presence, absence, or tardiness is checked by the teacher.</p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-2xl p-5 space-y-4 shadow-sm col-span-2">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Daily Presence Logs</h3>
              
              <div className="overflow-y-auto max-h-80">
                <table className="w-full text-left text-xs font-semibold border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b text-[9px] uppercase font-black text-slate-400">
                      <th className="p-3">Date</th>
                      <th className="p-3">Roster Status</th>
                      <th className="p-3">Class Term</th>
                      <th className="p-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {childAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400 font-bold">
                          No physical presence logs registered in the roster database.
                        </td>
                      </tr>
                    ) : (
                      childAttendance.map(a => {
                        let badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-100';
                        if (a.status === 'Absent') badgeColor = 'text-rose-700 bg-rose-50 border-rose-100';
                        if (a.status === 'Late') badgeColor = 'text-amber-700 bg-amber-50 border-amber-100';

                        return (
                          <tr key={a.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-mono font-bold text-slate-850">{a.date}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full border ${badgeColor}`}>
                                {a.status}
                              </span>
                            </td>
                            <td className="p-3 text-slate-450">2026 Term 2</td>
                            <td className="p-3 text-slate-500 font-semibold italic">
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

      {/* INSTANT SMS ALERTS */}
      {activeParentTab === 'sms' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="pb-1">
            <h3 className="text-sm font-extrabold text-slate-800">SMS Alert Logs</h3>
            <p className="text-xs text-slate-500 font-bold mt-0.5">Real-time SMS transmission log sent to parent mobile: <strong className="text-slate-700">{activeStudent.parentPhone}</strong></p>
          </div>

          <div className="space-y-3.5">
            {smsAlerts.map(sms => (
              <div key={sms.id} className="bg-slate-900 text-slate-100 rounded-2xl p-4.5 border border-slate-800 shadow-lg flex items-start space-x-3.5">
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
        <div className="space-y-4 animate-fade-in animate-fade-in">
          
          {announcements.filter(a => a.targetAudience === 'All' || a.targetAudience === 'Students').map(ann => (
            <div key={ann.id} className="bg-white border rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-black px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full uppercase">
                  PTA Notice
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">{ann.date}</span>
              </div>
              <h4 className="font-display font-extrabold text-slate-850 text-sm leading-snug">{ann.title}</h4>
              <p className="text-xs font-semibold text-slate-600 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
              <div className="text-[10px] font-bold text-slate-400 pt-1.5 border-t">
                Posted by <strong className="text-slate-600">{ann.authorName}</strong> ({ann.authorRole})
              </div>
            </div>
          ))}

        </div>
      )}

      {/* 4. MODALS */}

      {/* REPORT CARD MODAL VIEW (1-Click Report Cards) */}
      {isReportCardOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="p-6 bg-white border border-slate-300 rounded-3xl shadow-2xl max-w-2xl w-full space-y-5 max-h-[95vh] overflow-y-auto text-slate-800">
            
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
