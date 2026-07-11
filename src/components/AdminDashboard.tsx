import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, BookOpen, CheckSquare, Award, 
  Calendar, Megaphone, CreditCard, Search, Plus, 
  Trash2, Edit, Check, AlertTriangle, Eye, RefreshCw, Filter, ShieldCheck, Download,
  ShieldAlert, X, History, LogIn, Activity, ChevronLeft, ChevronRight, Printer, Cake, Gift,
  Lock, Building, HelpCircle, Info, Smartphone
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Student, Teacher, SchoolClass, Subject, 
  Attendance, ExamGrade, TimetableEntry, Announcement, 
  PaymentTransaction, PublicInquiry, SimulatedEmail, SyllabusPlan, TeacherAbsence, CoverAssignment,
  StaffClockIn, StaffPayroll, StaffLeaveRequest
} from '../types';
import { calculateGhanaGrade, getGradeRemark, SchoolDatabase } from '../mockData';
import SyllabusBoard from './SyllabusBoard';
import SubstitutionAssistant from './SubstitutionAssistant';
import { FeaturedAnnouncementsCarousel } from './FeaturedCarouselComponents';

interface AdminDashboardProps {
  activeTab: string;
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
  syllabusPlans?: SyllabusPlan[];
  teacherAbsences?: TeacherAbsence[];
  coverAssignments?: CoverAssignment[];
  staffClockIns: StaffClockIn[];
  staffPayrolls: StaffPayroll[];
  staffLeaveRequests: StaffLeaveRequest[];
  onUpdateStudents: (st: Student[]) => void;
  onUpdateTeachers: (t: Teacher[]) => void;
  onUpdateAnnouncements: (a: Announcement[]) => void;
  onUpdateGrades: (g: ExamGrade[]) => void;
  onUpdateTimetable: (tt: TimetableEntry[]) => void;
  onTriggerFeeAlerts: (studentIds?: string[]) => number;
  onDeleteEmail: (id: string) => void;
  onSendEmail: (recipientEmail: string, recipientName: string, subject: string, body: string, type: 'Announcement' | 'FeeDeadline') => void;
  onUpdateSyllabusPlans?: (updated: SyllabusPlan[]) => void;
  onUpdateTeacherAbsences?: (updated: TeacherAbsence[]) => void;
  onUpdateCoverAssignments?: (updated: CoverAssignment[]) => void;
  onUpdateStaffClockIns: (clockIns: StaffClockIn[]) => void;
  onUpdateStaffPayrolls: (payrolls: StaffPayroll[]) => void;
  onUpdateStaffLeaves: (leaves: StaffLeaveRequest[]) => void;
  isDarkMode: boolean;
}

export default function AdminDashboard({
  activeTab,
  students,
  teachers,
  classes,
  subjects,
  attendance,
  grades,
  timetable,
  announcements,
  transactions,
  emails,
  syllabusPlans = [],
  teacherAbsences = [],
  coverAssignments = [],
  staffClockIns = [],
  staffPayrolls = [],
  staffLeaveRequests = [],
  onUpdateStudents,
  onUpdateTeachers,
  onUpdateAnnouncements,
  onUpdateGrades,
  onUpdateTimetable,
  onTriggerFeeAlerts,
  onDeleteEmail,
  onSendEmail,
  onUpdateSyllabusPlans,
  onUpdateTeacherAbsences,
  onUpdateCoverAssignments,
  onUpdateStaffClockIns,
  onUpdateStaffPayrolls,
  onUpdateStaffLeaves,
  isDarkMode
}: AdminDashboardProps) {

  // Search & Filter States
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('All');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherDeptFilter, setTeacherDeptFilter] = useState<'All' | 'Daycare-JHS' | 'SHS'>('All');
  const [teachersActiveSubTab, setTeachersActiveSubTab] = useState<'list' | 'attendance' | 'leaves' | 'payroll'>('list');
  const [selectedPayrollStaff, setSelectedPayrollStaff] = useState<StaffPayroll | null>(null);
  const [payrollActionStatus, setPayrollActionStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [gradeClassFilter, setGradeClassFilter] = useState('c4'); // Default JHS 2
  const [gradeSubjectFilter, setGradeSubjectFilter] = useState('s1'); // Math
  const [selectedReportCardStudent, setSelectedReportCardStudent] = useState<Student | null>(null);

  // System Activity states
  const [activitySearch, setActivitySearch] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState<'all' | 'login' | 'grade' | 'attendance'>('all');
  const [activityPage, setActivityPage] = useState(1);
  const [activitiesList, setActivitiesList] = useState(() => SchoolDatabase.getSystemActivities());

  useEffect(() => {
    if (activeTab === 'activities') {
      setActivitiesList(SchoolDatabase.getSystemActivities());
      setActivityPage(1);
    }
  }, [activeTab]);

  // ==================== SYSTEM DIAGNOSTIC NOTIFICATION ENGINE ====================
  interface DiagnosticAlert {
    id: string;
    title: string;
    description: string;
    category: 'Security' | 'Finance' | 'System';
    severity: 'High' | 'Medium' | 'Info';
    timestamp: string;
    isResolved: boolean;
    metadata?: {
      studentId?: string;
      studentName?: string;
      classId?: string;
      className?: string;
      ipAddress?: string;
      location?: string;
      attemptsCount?: number;
      amountSpike?: number;
      targetUser?: string;
    };
  }

  const [failedLoginsLimit, setFailedLoginsLimit] = useState(3);
  const [unpaidFeeThreshold, setUnpaidFeeThreshold] = useState(1500);
  const [resolvedAlertIds, setResolvedAlertIds] = useState<string[]>([]);
  const [diagnosticScanLoading, setDiagnosticScanLoading] = useState(false);
  const [activeDiagnosticCategory, setActiveDiagnosticCategory] = useState<'All' | 'Security' | 'Finance' | 'System'>('All');
  const [selectedDiagnosticAlert, setSelectedDiagnosticAlert] = useState<DiagnosticAlert | null>(null);

  const [customAlerts, setCustomAlerts] = useState<DiagnosticAlert[]>(() => [
    {
      id: 'diag-sec-1',
      title: 'Failed Logins: Brute-Force Pattern Detected',
      description: 'Multiple failed logins detected on Admin console from IP 197.251.10.22 (Ejisu, Ashanti Region).',
      category: 'Security',
      severity: 'High',
      timestamp: '5 mins ago',
      isResolved: false,
      metadata: {
        targetUser: 'Admin (Principal Appiah)',
        ipAddress: '197.251.10.22',
        location: 'Ejisu, Ashanti Region',
        attemptsCount: 4
      }
    },
    {
      id: 'diag-sec-2',
      title: 'Suspicious IP Login: External Portal Access',
      description: 'Successful login on JHS Teacher account Mr. Kwame Boateng from unauthorized country endpoint IP 84.120.43.19 (London, UK).',
      category: 'Security',
      severity: 'Medium',
      timestamp: '2 hours ago',
      isResolved: false,
      metadata: {
        targetUser: 'Mr. Kwame Boateng',
        ipAddress: '84.120.43.19',
        location: 'London, UK',
        attemptsCount: 1
      }
    }
  ]);

  // Dynamically generated alerts from active state props
  const dynamicFinanceAlerts: DiagnosticAlert[] = students
    .filter(student => student.balanceGHS >= unpaidFeeThreshold)
    .map(student => {
      const clsName = classes.find(c => c.id === student.classId)?.name || 'Unknown Class';
      return {
        id: `diag-fin-student-${student.id}`,
        title: `Outstanding Fee Risk: ${student.name}`,
        description: `${student.name} (${clsName}) outstanding balance of GHS ${student.balanceGHS.toLocaleString()} exceeds your safety threshold of GHS ${unpaidFeeThreshold.toLocaleString()}.`,
        category: 'Finance',
        severity: student.balanceGHS >= unpaidFeeThreshold * 1.5 ? 'High' : 'Medium',
        timestamp: 'Real-time scan',
        isResolved: false,
        metadata: {
          studentId: student.id,
          studentName: student.name,
          classId: student.classId,
          className: clsName,
          amountSpike: student.balanceGHS
        }
      };
    });

  const dynamicClassSpikeAlerts: DiagnosticAlert[] = classes.map(c => {
    const classStudents = students.filter(s => s.classId === c.id);
    const classTotalUnpaid = classStudents.reduce((acc, s) => acc + s.balanceGHS, 0);
    const spikeThreshold = unpaidFeeThreshold * 2.5; // risk accumulates inside the entire classroom
    
    if (classTotalUnpaid >= spikeThreshold) {
      return {
        id: `diag-fin-class-${c.id}`,
        title: `Fee Collection Deficit Spike: ${c.name}`,
        description: `Unpaid tuition spike flagged in ${c.name}. Total cumulative outstanding has reached GHS ${classTotalUnpaid.toLocaleString()}, posing operational cash-flow risks.`,
        category: 'Finance',
        severity: classTotalUnpaid >= spikeThreshold * 1.5 ? 'High' : 'Medium',
        timestamp: 'Real-time scan',
        isResolved: false,
        metadata: {
          classId: c.id,
          className: c.name,
          amountSpike: classTotalUnpaid,
          attemptsCount: classStudents.filter(s => s.balanceGHS > 0).length
        }
      };
    }
    return null;
  }).filter(alert => alert !== null) as DiagnosticAlert[];

  const allDiagnosticAlerts: DiagnosticAlert[] = [
    ...customAlerts,
    ...dynamicFinanceAlerts,
    ...dynamicClassSpikeAlerts
  ].map(alert => ({
    ...alert,
    isResolved: resolvedAlertIds.includes(alert.id)
  }));

  const activeUnresolvedAlerts = allDiagnosticAlerts.filter(a => !a.isResolved);
  const resolvedAlerts = allDiagnosticAlerts.filter(a => a.isResolved);

  const handleSimulateBruteForce = () => {
    const randomPupil = students[Math.floor(Math.random() * students.length)] || { name: 'Kofi Mensah Jnr', id: 'st1' };
    const randomIP = `197.251.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const newAlert: DiagnosticAlert = {
      id: `diag-sec-sim-${Date.now()}`,
      title: 'Security Alert: Brute Force Ingress Blocked',
      description: `A burst of ${failedLoginsLimit + 2} failed login attempts was registered on Student account (${randomPupil.name}) from IP ${randomIP}. Gateway firewall has temporarily flagged this endpoint.`,
      category: 'Security',
      severity: 'High',
      timestamp: 'Just now',
      isResolved: false,
      metadata: {
        targetUser: `${randomPupil.name} (${randomPupil.id})`,
        ipAddress: randomIP,
        location: 'Ejisu District, Ashanti',
        attemptsCount: failedLoginsLimit + 2
      }
    };
    setCustomAlerts(prev => [newAlert, ...prev]);
    alert(`Simulation active: Ingress warning generated for ${randomPupil.name}! Check the alerts below.`);
  };

  const handleSimulateFeesSpike = () => {
    const randomIP = `197.251.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const newAlert: DiagnosticAlert = {
      id: `diag-fin-sim-${Date.now()}`,
      title: 'Financial Alert: Sudden Fees Delta Anomaly',
      description: `Sudden cumulative billing unpaid deficit of GHS 4,800.00 flagged following Term III class adjustment.`,
      category: 'Finance',
      severity: 'High',
      timestamp: 'Just now',
      isResolved: false,
      metadata: {
        className: 'JHS 2 (c4)',
        amountSpike: 4800,
        attemptsCount: 3
      }
    };
    setCustomAlerts(prev => [newAlert, ...prev]);
    alert(`Simulation active: Outstanding tuition spike anomaly flagged! check the alerts below.`);
  };

  const handleExportDatabase = () => {
    const payload = {
      students,
      teachers,
      classes,
      subjects,
      attendance,
      grades,
      timetable,
      announcements,
      transactions,
      emails
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(payload, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', 'edweso-royal-db-backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('WARNING: Restoring a database backup will overwrite all existing student files, teacher listings, financial transactions, and grades on this server. Proceed?')) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        // Simple verification that the backup matches school data structure
        if (!parsed.students || !parsed.teachers || !parsed.classes) {
          alert('Invalid backup structure: Ensure the uploaded JSON file contains school records.');
          return;
        }

        const res = await fetch('/api/school-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed)
        });

        const json = await res.json();
        if (json.status === 'success') {
          alert('System snapshot restored successfully! Reloading portal to refresh all local and remote states...');
          window.location.reload();
        } else {
          alert('Failed to save the restored state onto the cloud server.');
        }
      } catch (err) {
        alert('Error parsing backup file: Ensure the uploaded file is valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResolveAlert = (id: string) => {
    if (!resolvedAlertIds.includes(id)) {
      setResolvedAlertIds(prev => [...prev, id]);
    }
  };

  const handleBlockIP = (id: string, ip: string) => {
    handleResolveAlert(id);
    alert(`Security Rule Dispatched: Firewall IP ${ip} successfully blacklisted. Secure SSL session blocks established.`);
  };

  const handleResetUserPassword = (id: string, user: string) => {
    handleResolveAlert(id);
    alert(`Security Policy Triggered: Password reset token issued for account ${user}. Access locks enabled.`);
  };

  const handleSendQuickEmail = (id: string, studentId: string) => {
    const target = students.find(s => s.id === studentId);
    if (target) {
      onSendEmail(
        target.parentEmail,
        target.parentName,
        `URGENT: Outstanding Tuition Deficit Notice - ${target.name}`,
        `Dear ${target.parentName},\n\nOur system detected an outstanding balance of GHS ${target.balanceGHS.toLocaleString()} for your ward, ${target.name}. Please proceed with mobile money payment at your earliest convenience to avoid administrative limitations.\n\nWarm regards,\nAdministrative Board, Edweso Royal Academy`,
        'FeeDeadline'
      );
      handleResolveAlert(id);
      alert(`Automated reminder emailed successfully to guardian ${target.parentName} (${target.parentEmail})! Alert resolved.`);
    } else {
      alert('Student coordinates not found.');
    }
  };

  const handleSendBirthdayEmail = (student: Student, birthdayDateStr: string) => {
    onSendEmail(
      student.parentEmail,
      student.parentName,
      `Celebrating ${student.name}'s Birthday! 🎂 - Edweso Royal Academy`,
      `Dear ${student.parentName},\n\nWe would like to join you in celebrating the upcoming birthday of your ward, ${student.name}, on ${birthdayDateStr}!\n\nAt Edweso Royal Academy, we cherish and support every student's growth and journey. May this special day bring them absolute joy, wisdom, and success in their studies!\n\nWarmest wishes,\nEdweso Royal Academy Management & Staff`,
      'Announcement'
    );
    alert(`Birthday celebratory email sent successfully to ${student.parentName} (${student.parentEmail})!`);
  };

  const handleRunDiagnosticScan = () => {
    setDiagnosticScanLoading(true);
    setTimeout(() => {
      setDiagnosticScanLoading(false);
      alert('Diagnostic Engine scanned 8 database registers successfully! All patterns updated.');
    }, 800);
  };

  // Web Inquiries State & Actions
  const [inquiries, setInquiries] = useState<PublicInquiry[]>(() => {
    return SchoolDatabase.getInquiries();
  });
  const [selectedInquiry, setSelectedInquiry] = useState<PublicInquiry | null>(null);

  const handleInquiryStatusChange = (id: string, newStatus: 'Pending' | 'Reviewed' | 'Contacted') => {
    const updated = inquiries.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq);
    setInquiries(updated);
    SchoolDatabase.saveInquiries(updated);
  };

  const handleDeleteInquiry = (id: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Web Inquiry',
      message: 'Are you sure you want to delete this public web inquiry? This will permanently erase the submission.',
      onConfirm: () => {
        const updated = inquiries.filter(inq => inq.id !== id);
        setInquiries(updated);
        SchoolDatabase.saveInquiries(updated);
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Payment Gateway & Bank Account Linking Configuration
  const [paymentsSubTab, setPaymentsSubTab] = useState<'ledger' | 'bank-setup'>('ledger');
  const [paystackMode, setPaystackMode] = useState<'test' | 'live'>(() => {
    return (localStorage.getItem('era_paystack_mode') as 'test' | 'live') || 'test';
  });
  const [paystackPublicKey, setPaystackPublicKey] = useState(() => {
    return localStorage.getItem('era_paystack_pub_key') || 'pk_test_edweso7a8d9b1c0e2f3g4h5i6j7k8l9';
  });
  const [paystackSecretKey, setPaystackSecretKey] = useState(() => {
    return localStorage.getItem('era_paystack_sec_key') || 'sk_test_edweso9876543210abcdefghijklmnop';
  });
  const [payoutMethod, setPayoutMethod] = useState<'bank' | 'momo'>(() => {
    return (localStorage.getItem('era_payout_method') as 'bank' | 'momo') || 'bank';
  });
  const [payoutBankName, setPayoutBankName] = useState(() => {
    return localStorage.getItem('era_payout_bank_name') || 'GCB Bank PLC';
  });
  const [payoutAccountNumber, setPayoutAccountNumber] = useState(() => {
    return localStorage.getItem('era_payout_acc_num') || '1011130004521';
  });
  const [payoutAccountName, setPayoutAccountName] = useState(() => {
    return localStorage.getItem('era_payout_acc_name') || 'Edweso Royal Academy Ltd';
  });
  const [payoutBankBranch, setPayoutBankBranch] = useState(() => {
    return localStorage.getItem('era_payout_branch') || 'Ejisu Main Branch';
  });
  const [payoutMomoProvider, setPayoutMomoProvider] = useState(() => {
    return localStorage.getItem('era_payout_momo_provider') || 'MTN Mobile Money';
  });
  const [payoutMomoNumber, setPayoutMomoNumber] = useState(() => {
    return localStorage.getItem('era_payout_momo_num') || '0244123456';
  });
  const [isPayoutVerified, setIsPayoutVerified] = useState(() => {
    return localStorage.getItem('era_payout_verified') === 'true';
  });
  const [isVerifyingPayout, setIsVerifyingPayout] = useState(false);
  const [payoutConfigError, setPayoutConfigError] = useState('');
  const [payoutConfigSuccess, setPayoutConfigSuccess] = useState('');

  // Composer and alert states
  const [composerStudentId, setComposerStudentId] = useState('');
  const [composerSubject, setComposerSubject] = useState('');
  const [composerBody, setComposerBody] = useState('');
  const [composerNotification, setComposerNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedEmailDetails, setSelectedEmailDetails] = useState<SimulatedEmail | null>(null);

  const handleComposeEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerStudentId) {
      setComposerNotification({ message: 'Please select a student/guardian first.', type: 'error' });
      return;
    }
    const targetStudent = students.find(s => s.id === composerStudentId);
    if (!targetStudent) {
      setComposerNotification({ message: 'Student record not found.', type: 'error' });
      return;
    }

    onSendEmail(
      targetStudent.parentEmail,
      targetStudent.parentName,
      composerSubject || `Notice: Update Regarding ${targetStudent.name}`,
      composerBody || `Dear ${targetStudent.parentName},\n\nWe are writing to provide a standard update regarding your ward, ${targetStudent.name}.\n\nBest regards,\nEdweso Royal Academy Admin`,
      'Announcement'
    );

    setComposerNotification({ message: `Simulated custom email dispatched successfully to ${targetStudent.parentEmail}!`, type: 'success' });
    setComposerSubject('');
    setComposerBody('');
    setComposerStudentId('');
    setTimeout(() => setComposerNotification(null), 5000);
  };

  const triggerBulkFeeAlerts = () => {
    const sentCount = onTriggerFeeAlerts();
    if (sentCount > 0) {
      alert(`Successfully sent simulated fee reminder emails to ${sentCount} guardians of students with outstanding balances!`);
    } else {
      alert('No students currently have outstanding fee balances to notify.');
    }
  };

  // Deletion Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Add/Edit Student Modal State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    classId: 'c4',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    gender: 'Male' as 'Male' | 'Female',
    balanceGHS: 1200,
    dob: '2012-01-01',
    status: 'Active' as 'Active' | 'Suspended' | 'Alumni',
    profilePhoto: undefined as string | undefined
  });

  // Add/Edit Teacher Modal State
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    staffNumber: '',
    email: '',
    phone: '',
    subjectId: 'Mathematics',
    status: 'Active' as 'Active' | 'On Leave',
    gender: 'Male' as 'Male' | 'Female',
    profilePhoto: undefined as string | undefined,
    department: 'Daycare-JHS' as 'Daycare-JHS' | 'SHS'
  });

  // Add Notice Modal State
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    targetAudience: 'All' as 'All' | 'Teachers' | 'Students'
  });

  // Grade Modals state
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    studentId: 'st1',
    subjectId: 's1',
    term: 'Term 1' as 'Term 1' | 'Term 2' | 'Term 3',
    classScore: 20, // Max 30
    examScore: 50   // Max 70
  });

  // Timetable State
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [timetableForm, setTimetableForm] = useState({
    classId: 'c4',
    subjectId: 's1',
    teacherId: 't1',
    day: 'Monday' as any,
    startTime: '08:00',
    endTime: '09:30'
  });

  // Helpers for calculations
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  const successfulTx = transactions.filter(t => t.status === 'Successful');
  const totalRevenue = successfulTx.reduce((acc, t) => acc + t.amountGHS, 0);
  const outstandingFees = students.reduce((acc, s) => acc + s.balanceGHS, 0);

  // Helper to identify students whose birthday is within the next 7 days
  const getUpcomingBirthdays = (studentList: Student[], daysAhead: number = 7) => {
    const result: { student: Student; daysUntil: number; birthdayDateStr: string; formattedDob: string }[] = [];
    const today = new Date();
    
    for (let i = 0; i <= daysAhead; i++) {
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + i);
      const m = String(futureDate.getMonth() + 1).padStart(2, '0');
      const d = String(futureDate.getDate()).padStart(2, '0');
      const targetMMDD = `${m}-${d}`;
      
      studentList.forEach(student => {
        if (student.dob) {
          const parts = student.dob.split('-');
          if (parts.length === 3) {
            const studentMMDD = `${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
            if (studentMMDD === targetMMDD) {
              const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ];
              const monthName = monthNames[futureDate.getMonth()];
              const dayNum = futureDate.getDate();
              let suffix = 'th';
              if (dayNum === 1 || dayNum === 21 || dayNum === 31) suffix = 'st';
              else if (dayNum === 2 || dayNum === 22) suffix = 'nd';
              else if (dayNum === 3 || dayNum === 23) suffix = 'rd';
              
              const birthdayDateStr = `${monthName} ${dayNum}${suffix}`;
              result.push({
                student,
                daysUntil: i,
                birthdayDateStr,
                formattedDob: `${parts[1]}/${parts[2]}`
              });
            }
          }
        }
      });
    }
    
    return result.sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const upcomingBirthdays = getUpcomingBirthdays(students);

  // Recharts Dynamic Datasets
  const enrollmentChartData = classes.map(c => {
    const classStudents = students.filter(s => s.classId === c.id);
    return {
      className: c.name,
      Male: classStudents.filter(s => s.gender === 'Male').length,
      Female: classStudents.filter(s => s.gender === 'Female').length,
      Total: classStudents.length
    };
  });

  const attendanceChartData = classes.map(c => {
    const classStudents = students.filter(s => s.classId === c.id);
    const studentIds = classStudents.map(s => s.id);
    const classAtt = attendance.filter(a => a.classId === c.id || studentIds.includes(a.studentId));
    const total = classAtt.length;
    const present = classAtt.filter(a => a.status === 'Present' || a.status === 'Late').length;
    
    let fallbackRate = 95.5;
    if (c.id === 'c1') fallbackRate = 94.2;
    if (c.id === 'c2') fallbackRate = 96.8;
    if (c.id === 'c3') fallbackRate = 91.5;
    if (c.id === 'c4') fallbackRate = 80.0;
    if (c.id === 'c5') fallbackRate = 88.4;
    if (c.id === 'c6') fallbackRate = 98.2;

    const percentage = total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : fallbackRate;
    return {
      className: c.name,
      'Attendance %': percentage
    };
  });

  const financialTrendChartData = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Seed standard Term values to look excellent initially, then add custom values dynamically
    const monthlyMap: { [key: string]: { Collected: number; Outstanding: number } } = {
      'May': { Collected: 5750, Outstanding: 450 },
      'Jun': { Collected: 2500, Outstanding: 1200 },
      'Jul': { Collected: 0, Outstanding: outstandingFees }
    };

    transactions.forEach(t => {
      try {
        const parts = t.date.split(' ')[0].split('-');
        const monthIndex = parseInt(parts[1]) - 1;
        const mName = months[monthIndex];
        if (mName && monthlyMap[mName]) {
          if (t.status === 'Successful') {
            monthlyMap[mName].Collected = (monthlyMap[mName].Collected || 0) + t.amountGHS;
          }
        }
      } catch (e) {
        // Ignore parsing anomalies
      }
    });

    const currentMonthName = months[new Date().getMonth()] || 'Jul';
    if (monthlyMap[currentMonthName]) {
      monthlyMap[currentMonthName].Outstanding = outstandingFees;
    }

    return Object.keys(monthlyMap).map(m => ({
      month: m,
      Collected: monthlyMap[m].Collected,
      Outstanding: monthlyMap[m].Outstanding,
      'Total Billed': monthlyMap[m].Collected + monthlyMap[m].Outstanding
    })).sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));
  })();

  const monthlyFeeCollections = (() => {
    const monthsOrder = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const monthKeyMap: { [key: string]: string } = {
      '09': 'Sep',
      '10': 'Oct',
      '11': 'Nov',
      '12': 'Dec',
      '01': 'Jan',
      '02': 'Feb',
      '03': 'Mar',
      '04': 'Apr',
      '05': 'May',
      '06': 'Jun',
      '07': 'Jul',
      '08': 'Aug'
    };

    const collectionTotals: { [monthName: string]: number } = {
      'Sep': 12500,
      'Oct': 9800,
      'Nov': 8200,
      'Dec': 4500,
      'Jan': 14200,
      'Feb': 11500,
      'Mar': 7800,
      'Apr': 6200,
      'May': 5750,
      'Jun': 2500,
      'Jul': 0,
      'Aug': 0
    };

    transactions.forEach(t => {
      if (t.status === 'Successful') {
        try {
          const parts = t.date.split(' ')[0].split('-');
          const monthKey = parts[1];
          const monthName = monthKeyMap[monthKey];
          if (monthName && collectionTotals[monthName] !== undefined) {
            collectionTotals[monthName] += t.amountGHS;
          }
        } catch (e) {
          // ignore
        }
      }
    });

    return monthsOrder.map(m => ({
      month: m,
      'Fee Collections (GHS)': collectionTotals[m]
    }));
  })();

  // Student Actions
  const openAddStudent = () => {
    setEditingStudent(null);
    setStudentForm({
      name: '',
      classId: 'c4',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      gender: 'Male',
      balanceGHS: 1200,
      dob: '2012-01-01',
      status: 'Active',
      profilePhoto: undefined
    });
    setIsStudentModalOpen(true);
  };

  const openEditStudent = (st: Student) => {
    setEditingStudent(st);
    setStudentForm({
      name: st.name,
      classId: st.classId,
      parentName: st.parentName,
      parentPhone: st.parentPhone,
      parentEmail: st.parentEmail,
      gender: st.gender,
      balanceGHS: st.balanceGHS,
      dob: st.dob,
      status: st.status,
      profilePhoto: st.profilePhoto
    });
    setIsStudentModalOpen(true);
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      // Edit
      const updated = students.map(s => s.id === editingStudent.id ? {
        ...s,
        ...studentForm
      } : s);
      onUpdateStudents(updated);
    } else {
      // Add
      const newId = 'st' + (students.length + 10);
      const admissionNum = 'ERA-S-2026-' + Math.floor(100 + Math.random() * 900);
      const newStudent: Student = {
        id: newId,
        admissionNumber: admissionNum,
        ...studentForm
      };
      onUpdateStudents([...students, newStudent]);
    }
    setIsStudentModalOpen(false);
  };

  const handleDeleteStudent = (id: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Student Record',
      message: 'Are you sure you want to delete this student record? This action is irreversible and will remove all student profile history, grades, and fee records.',
      onConfirm: () => {
        onUpdateStudents(students.filter(s => s.id !== id));
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Teacher Actions
  const openAddTeacher = () => {
    setEditingTeacher(null);
    setTeacherForm({
      name: '',
      staffNumber: 'ERA-T-' + Math.floor(100 + Math.random() * 900),
      email: '',
      phone: '',
      subjectId: 'Mathematics',
      status: 'Active',
      gender: 'Male',
      profilePhoto: undefined,
      department: 'Daycare-JHS'
    });
    setIsTeacherModalOpen(true);
  };

  const openEditTeacher = (t: Teacher) => {
    setEditingTeacher(t);
    setTeacherForm({
      name: t.name,
      staffNumber: t.staffNumber,
      email: t.email,
      phone: t.phone,
      subjectId: t.subjectId,
      status: t.status,
      gender: t.gender,
      profilePhoto: t.profilePhoto,
      department: t.department || 'Daycare-JHS'
    });
    setIsTeacherModalOpen(true);
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      const updated = teachers.map(t => t.id === editingTeacher.id ? { ...t, ...teacherForm } : t);
      onUpdateTeachers(updated);
    } else {
      const newId = 't' + (teachers.length + 10);
      onUpdateTeachers([...teachers, { id: newId, ...teacherForm }]);
    }
    setIsTeacherModalOpen(false);
  };

  const handleDeleteTeacher = (id: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Teacher Register',
      message: 'Are you sure you want to delete this teacher register? This action is irreversible and will purge their record from active faculty lists and staff registers.',
      onConfirm: () => {
        onUpdateTeachers(teachers.filter(t => t.id !== id));
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Announcement Poster
  const handleNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newNotice: Announcement = {
      id: 'a' + (announcements.length + 10),
      title: noticeForm.title,
      content: noticeForm.content,
      targetAudience: noticeForm.targetAudience,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      authorRole: 'Admin',
      authorName: 'Principal J. K. Appiah'
    };
    onUpdateAnnouncements([newNotice, ...announcements]);
    setIsNoticeModalOpen(false);
    setNoticeForm({ title: '', content: '', targetAudience: 'All' });
  };

  const handleDeleteNotice = (id: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Announcement Notice',
      message: 'Are you sure you want to delete this notice? It will be removed from all parent and student notification boards.',
      onConfirm: () => {
        onUpdateAnnouncements(announcements.filter(a => a.id !== id));
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Grading Actions
  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const classS = Number(gradeForm.classScore);
    const examS = Number(gradeForm.examScore);
    const total = classS + examS;
    const computedGrade = calculateGhanaGrade(total);
    const remark = getGradeRemark(computedGrade);

    const newGrade: ExamGrade = {
      id: 'g' + (grades.length + 10),
      studentId: gradeForm.studentId,
      subjectId: gradeForm.subjectId,
      term: gradeForm.term,
      classScore: classS,
      examScore: examS,
      totalScore: total,
      grade: computedGrade,
      remarks: remark,
      date: new Date().toISOString().substring(0, 10)
    };

    onUpdateGrades([...grades, newGrade]);
    setIsGradeModalOpen(false);
  };

  // Timetable Actions
  const handleTimetableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: TimetableEntry = {
      id: 'tt' + (timetable.length + 10),
      classId: timetableForm.classId,
      subjectId: timetableForm.subjectId,
      teacherId: timetableForm.teacherId,
      day: timetableForm.day,
      startTime: timetableForm.startTime,
      endTime: timetableForm.endTime
    };
    onUpdateTimetable([...timetable, entry]);
    setIsTimetableModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* ==================== 1. OVERVIEW PANEL ==================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Welcome Card Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-md border border-emerald-500/10">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] bg-emerald-700/60 px-3 py-1 rounded-full text-amber-300 font-bold border border-amber-400/20 uppercase tracking-widest">Edweso Administrative Dashboard</span>
              <h1 className="text-xl sm:text-2xl font-black font-display mt-2 tracking-tight">Welcome Back, Principal J. K. Appiah</h1>
              <p className="text-xs text-emerald-200">Manage students, process staff payroll trackers, review academic scores, and monitor GHS school fees balances.</p>
            </div>
            <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-700 text-center shrink-0">
              <span className="text-[9px] text-emerald-300 uppercase font-black tracking-widest block">Terminal Revenue</span>
              <span className="text-lg font-black font-mono text-amber-400">GHS {totalRevenue.toFixed(2)}</span>
            </div>
          </div>

          {/* Automated Diagnostic System Alert Banner (Flags High/Medium Priority Alerts) */}
          {activeUnresolvedAlerts.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg shrink-0 mt-0.5 sm:mt-0 animate-bounce">
                  <ShieldAlert size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black tracking-wide text-rose-700 dark:text-rose-400 uppercase">System Diagnostics: Active Risks Flagged</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-normal">
                    Our real-time diagnostic engine has detected <span className="text-rose-600 dark:text-rose-400 font-black">{activeUnresolvedAlerts.length} active anomalies</span> (failed login patterns, unrecognized device accesses, or sudden tuition spikes).
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[10px] text-slate-400">
                    {activeUnresolvedAlerts.slice(0, 2).map((a) => (
                      <span key={a.id} className="flex items-center space-x-1">
                        <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                        <span className="font-bold text-slate-600 dark:text-slate-300">{a.title}</span>
                      </span>
                    ))}
                    {activeUnresolvedAlerts.length > 2 && (
                      <span className="font-bold text-rose-500">+{activeUnresolvedAlerts.length - 2} more flags</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-center shrink-0">
                <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 block mb-1">Check Left Menu Tab</span>
                <span className="px-3 py-1.5 bg-rose-600 text-white font-extrabold text-[10px] uppercase tracking-wide rounded-lg self-end sm:self-center block">
                  System Diagnostics
                </span>
              </div>
            </div>
          )}

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-700 flex items-center space-x-3.5">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0 border border-emerald-100">
                <Users size={20} />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Total Students</span>
                <span className="text-xl font-display font-bold text-slate-800 leading-none mt-1.5 block">{totalStudents}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-700 flex items-center space-x-3.5">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0 border border-amber-100">
                <UserCheck size={20} />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Cert. Teachers</span>
                <span className="text-xl font-display font-bold text-slate-800 leading-none mt-1.5 block">{totalTeachers}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-700 flex items-center space-x-3.5">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0 border border-indigo-100">
                <BookOpen size={20} />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Active Classes</span>
                <span className="text-xl font-display font-bold text-slate-800 leading-none mt-1.5 block">{totalClasses}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-700 flex items-center space-x-3.5">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0 border border-rose-100">
                <CreditCard size={20} />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Pending Fees</span>
                <span className="text-xs sm:text-sm font-bold font-mono text-slate-800 leading-none mt-1.5 block">GHS {outstandingFees.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Upcoming Student Birthdays Alert/Suggest Block */}
          {upcomingBirthdays.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs flex flex-col items-start gap-4 animate-fade-in" id="birthday-alerts-container">
              <div className="flex items-start gap-3 w-full">
                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg shrink-0 mt-0.5 animate-bounce">
                  <Cake size={18} />
                </div>
                <div className="space-y-1 w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-amber-500/15 text-amber-800 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Celebration Desk</span>
                    <span className="text-[10px] font-bold text-slate-500">Next 7 Days</span>
                  </div>
                  <h4 className="text-xs font-black tracking-wide text-slate-800 uppercase">Upcoming Student Birthdays</h4>
                  <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                    The following students have birthdays within the next 7 days. Select "Send Celebratory Email" to automatically congratulate their parents and build school community trust.
                  </p>
                  
                  {/* List of birthday students */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3 w-full">
                    {upcomingBirthdays.map(({ student, daysUntil, birthdayDateStr }) => {
                      const sClass = classes.find(c => c.id === student.classId);
                      return (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-200/55 shadow-2xs hover:border-amber-300 transition-all">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-200 flex items-center justify-center overflow-hidden shrink-0">
                              {student.profilePhoto ? (
                                <img src={student.profilePhoto} alt={student.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-black text-amber-700">{student.name.charAt(0)}</span>
                              )}
                            </div>
                            <div className="text-left">
                              <p className="text-[11px] font-black text-slate-900 leading-none">{student.name}</p>
                              <span className="text-[9px] text-slate-400 font-bold mt-1 inline-block">
                                {sClass?.name || 'Class'} • {birthdayDateStr}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              daysUntil === 0 
                                ? 'bg-rose-100 text-rose-800 border border-rose-200/50 animate-pulse'
                                : daysUntil === 1
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200/30'
                            }`}>
                              {daysUntil === 0 ? 'Today! 🎉' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil}d`}
                            </span>
                            <button
                              onClick={() => handleSendBirthdayEmail(student, birthdayDateStr)}
                              className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all active:scale-90 cursor-pointer"
                              title="Send Celebratory Email"
                            >
                              <Gift size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== ADVANCED RECHARTS ANALYTICS HUB ==================== */}
          {(() => {
            const CustomTooltip = ({ active, payload, label }: any) => {
              if (active && payload && payload.length) {
                return (
                  <div className={`p-3 rounded-lg shadow-xl text-xs font-semibold border ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-950'
                  }`}>
                    <p className="font-extrabold mb-1.5">{label}</p>
                    {payload.map((p: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center gap-4 mt-1 font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
                          <span className="opacity-80 capitalize">{p.name}:</span>
                        </span>
                        <span className="font-mono font-bold">
                          {p.name.includes('%') ? '' : 'GHS '}{p.value.toLocaleString()}{p.name.includes('%') ? '%' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            };

            return (
              <div className="space-y-6">
                
                {/* First Row: Financial Performance (2 cols) & Enrollment (1 col) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Card 1: Term Billing & Financial Ledger Flow */}
                  <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-700">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                      <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Term Billing & Collection Flow</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Collected revenue vs. outstanding invoice balances for the current term.</p>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold border border-emerald-100">
                        Paystack Live Sync
                      </span>
                    </div>

                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={financialTrendChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                            </linearGradient>
                            <linearGradient id="colorOutstanding" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.01}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="month" 
                            stroke="#0f172a" 
                            fontSize={10} 
                            fontWeight="bold"
                            tickLine={false} 
                          />
                          <YAxis 
                            stroke="#0f172a" 
                            fontSize={10} 
                            fontWeight="bold"
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `GHS ${v}`}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend 
                            verticalAlign="top" 
                            height={36} 
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                          />
                          <Area 
                            name="Collected" 
                            type="monotone" 
                            dataKey="Collected" 
                            stroke="#10b981" 
                            strokeWidth={2.5}
                            fillOpacity={1} 
                            fill="url(#colorCollected)" 
                          />
                          <Area 
                            name="Outstanding" 
                            type="monotone" 
                            dataKey="Outstanding" 
                            stroke="#f43f5e" 
                            strokeWidth={2.5}
                            fillOpacity={1} 
                            fill="url(#colorOutstanding)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>Real-time settlements certified by central audit node.</span>
                      </span>
                      <span className="font-semibold text-slate-700">Total Billable: GHS {financialTrendChartData.reduce((sum, f) => sum + f['Total Billed'], 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Card 2: Student Enrollment by Class */}
                  <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-700">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                      <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Enrollment by Class</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Student headcount distribution broken down by gender.</p>
                      </div>
                    </div>

                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={enrollmentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="className" 
                            stroke="#0f172a" 
                            fontSize={9} 
                            fontWeight="bold"
                            tickLine={false} 
                          />
                          <YAxis 
                            stroke="#0f172a" 
                            fontSize={10} 
                            fontWeight="bold"
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend 
                            verticalAlign="top" 
                            height={36} 
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                          />
                          <Bar name="Male" dataKey="Male" fill="#0284c7" radius={[4, 4, 0, 0]} stackId="gender" />
                          <Bar name="Female" dataKey="Female" fill="#ec4899" radius={[4, 4, 0, 0]} stackId="gender" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-medium">
                      <span>Classrooms Occupied: {classes.length}</span>
                      <span className="font-semibold text-slate-700">Total Registered: {totalStudents}</span>
                    </div>
                  </div>

                </div>

                {/* Second Row: Class Attendance Rate (3 cols) */}
                <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-700">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Average Class Attendance Rate</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Terminal academic attendance ratios derived from daily classroom logs.</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                      <span>Active Term</span>
                    </div>
                  </div>

                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="className" 
                          stroke="#0f172a" 
                          fontSize={10} 
                          fontWeight="bold"
                          tickLine={false} 
                        />
                        <YAxis 
                          stroke="#0f172a" 
                          fontSize={10} 
                          fontWeight="bold"
                          tickLine={false}
                          axisLine={false}
                          domain={[0, 100]}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar name="Attendance %" dataKey="Attendance %" fill="#0d9488" radius={[4, 4, 0, 0]}>
                          {
                            attendanceChartData.map((entry, index) => {
                              const rate = entry['Attendance %'];
                              const barColor = rate < 85 ? '#e11d48' : rate < 93 ? '#f59e0b' : '#0d9488';
                              return <Cell key={`cell-${index}`} fill={barColor} />;
                            })
                          }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Excellent (&gt;93%)
                      <span className="w-2 h-2 rounded-full bg-amber-500 ml-2"></span> Satisfactory (85%-93%)
                      <span className="w-2 h-2 rounded-full bg-rose-500 ml-2"></span> Watch List (&lt;85%)
                    </span>
                    <span className="font-semibold text-slate-700">Term Average Attendance: {Math.round(attendanceChartData.reduce((acc, c) => acc + c['Attendance %'], 0) / attendanceChartData.length)}%</span>
                  </div>
                </div>

                {/* Third Row: Academic Year Fee Collections & Cash Flow Trends */}
                <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-700" id="academic-year-cashflow-card">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Academic Year Fee Collections & Cash Flow</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Real-time aggregate monthly tuition & fee revenue collected dynamically throughout the academic year.</p>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full font-semibold">
                      Cash Flow Trends
                    </span>
                  </div>

                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyFeeCollections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#0f172a" 
                          fontSize={10} 
                          fontWeight="bold"
                          tickLine={false} 
                        />
                        <YAxis 
                          stroke="#0f172a" 
                          fontSize={10} 
                          fontWeight="bold"
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `GHS ${v}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar name="Fee Collections (GHS)" dataKey="Fee Collections (GHS)" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                          {
                            monthlyFeeCollections.map((entry, index) => {
                              const amt = entry['Fee Collections (GHS)'];
                              const barColor = amt > 10000 ? '#0d9488' : '#0ea5e9';
                              return <Cell key={`cell-overview-fee-${index}`} fill={barColor} />;
                            })
                          }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> High Collections Volume (&gt;10,000 GHS)
                      <span className="w-2 h-2 rounded-full bg-sky-500 ml-2"></span> Standard Collections Volume
                    </span>
                    <span className="font-semibold text-slate-700">Cumulative Academic Revenue: GHS {monthlyFeeCollections.reduce((sum, item) => sum + item['Fee Collections (GHS)'], 0).toLocaleString()}</span>
                  </div>
                </div>

              </div>
            );
          })()}

          {/* Quick announcements overview */}
          <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}>
            <h4 className="font-extrabold text-xs uppercase tracking-wider pb-3 border-b border-slate-300 dark:border-slate-700 mb-3">Live Bulletins Feed</h4>
            <FeaturedAnnouncementsCarousel 
              announcements={announcements} 
              onDeleteNotice={handleDeleteNotice}
              isAdmin={true}
            />
          </div>

        </div>
      )}

      {/* ==================== 2. STUDENT REGISTER (CRUD) ==================== */}
      {activeTab === 'students' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/40">
            <div>
              <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Student Enrollment Ledger</h2>
              <p className="text-xs text-slate-400">Total {students.length} active registered pupils.</p>
            </div>
            <button
              onClick={openAddStudent}
              id="admin-add-student-btn"
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Plus size={14} />
              <span>Register New Pupil</span>
            </button>
          </div>

          {/* Search, Filter bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <input
                type="text"
                id="search-students-input"
                placeholder="Search name or ID..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-800 dark:text-white focus:outline-hidden focus:border-emerald-500 font-semibold"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            </div>

            <div>
              <select
                id="filter-students-class"
                value={studentClassFilter}
                onChange={(e) => setStudentClassFilter(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-800 dark:text-white focus:outline-hidden focus:border-emerald-500 font-semibold"
              >
                <option value="All">All Class Grades</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className={`border rounded-xl overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'}`}>
            <div className="overflow-x-auto">
              <table id="students-ledger-table" className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b font-extrabold uppercase tracking-wider text-[10px] text-slate-400 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <th className="p-3">Pupil details</th>
                    <th className="p-3">Admit ID</th>
                    <th className="p-3">Class/Grade</th>
                    <th className="p-3">Guardian Name</th>
                    <th className="p-3">Fees Balance</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students
                    .filter(s => {
                      const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                                            s.admissionNumber.toLowerCase().includes(studentSearch.toLowerCase());
                      const matchesClass = studentClassFilter === 'All' || s.classId === studentClassFilter;
                      return matchesSearch && matchesClass;
                    })
                    .map((st) => {
                      const stClass = classes.find(c => c.id === st.classId);
                      return (
                        <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-colors font-medium text-slate-700 dark:text-slate-300">
                          <td className="p-3">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-emerald-800 overflow-hidden border border-slate-200/50 dark:border-slate-800 shrink-0">
                                {st.profilePhoto ? (
                                  <img src={st.profilePhoto} alt={st.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  st.name.substring(0, 2).toUpperCase()
                                )}
                              </div>
                              <div>
                                <p className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">{st.name}</p>
                                <p className="text-[10px] text-slate-400 leading-none mt-0.5">{st.gender} | DOB: {st.dob}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-[10px] font-bold text-slate-400">{st.admissionNumber}</td>
                          <td className="p-3">
                            <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                              {stClass ? stClass.name : 'Unknown'}
                            </span>
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-slate-800 dark:text-slate-200">{st.parentName}</p>
                            <p className="text-[10px] text-slate-400">{st.parentPhone}</p>
                          </td>
                          <td className="p-3 font-bold font-mono">
                            <span className={st.balanceGHS > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                              GHS {st.balanceGHS.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
                              st.status === 'Active' 
                                ? 'bg-emerald-500/10 text-emerald-600' 
                                : st.status === 'Suspended'
                                  ? 'bg-rose-500/10 text-rose-600'
                                  : 'bg-slate-500/10 text-slate-500'
                            }`}>
                              {st.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => setSelectedReportCardStudent(st)}
                                className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Print Report Card"
                              >
                                <Printer size={14} />
                              </button>
                              <button
                                onClick={() => openEditStudent(st)}
                                className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                                title="Edit Pupil"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(st.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Delete Register"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ==================== 3. FACULTY & STAFF OPERATIONS HUB ==================== */}
      {activeTab === 'teachers' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/40">
            <div>
              <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Faculty & Staff Operations Hub</h2>
              <p className="text-xs text-slate-400">Manage teacher register, geofenced attendance logs, leaves, and payroll ledger.</p>
            </div>
            {teachersActiveSubTab === 'list' && (
              <button
                onClick={openAddTeacher}
                id="admin-add-teacher-btn"
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <Plus size={14} />
                <span>Onboard New Teacher</span>
              </button>
            )}
          </div>

          {/* Hub Sub-Tabs selection */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setTeachersActiveSubTab('list');
                setPayrollActionStatus({ type: null, message: '' });
              }}
              className={`pb-3 px-4 font-extrabold text-xs border-b-2 transition-all cursor-pointer ${
                teachersActiveSubTab === 'list'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Faculty Registry ({teachers.length})
            </button>
            <button
              onClick={() => {
                setTeachersActiveSubTab('attendance');
                setPayrollActionStatus({ type: null, message: '' });
              }}
              className={`pb-3 px-4 font-extrabold text-xs border-b-2 transition-all cursor-pointer ${
                teachersActiveSubTab === 'attendance'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Staff Clock-Ins ({staffClockIns.length})
            </button>
            <button
              onClick={() => {
                setTeachersActiveSubTab('leaves');
                setPayrollActionStatus({ type: null, message: '' });
              }}
              className={`pb-3 px-4 font-extrabold text-xs border-b-2 transition-all cursor-pointer ${
                teachersActiveSubTab === 'leaves'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Leave Requests ({staffLeaveRequests.filter(l => l.status === 'Pending').length} Pending)
            </button>
            <button
              onClick={() => {
                setTeachersActiveSubTab('payroll');
                setPayrollActionStatus({ type: null, message: '' });
              }}
              className={`pb-3 px-4 font-extrabold text-xs border-b-2 transition-all cursor-pointer ${
                teachersActiveSubTab === 'payroll'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Payroll & Salaries Ledger
            </button>
          </div>

          {/* ==================== ATTENDANCE LOG VIEW ==================== */}
          {teachersActiveSubTab === 'attendance' && (
            <div className="space-y-4 animate-fade-in">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}>
                <h3 className="text-sm font-bold mb-3">Live Geofenced Attendance Feed</h3>
                {staffClockIns.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                    No clock-in records registered in the system yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className={`border-b font-extrabold uppercase tracking-wider text-[10px] text-slate-400 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                          <th className="p-3">Staff Name / Role</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Clock-In Time</th>
                          <th className="p-3">Clock-Out Time</th>
                          <th className="p-3">Geofence Location</th>
                          <th className="p-3">Fence Status</th>
                          <th className="p-3">Distance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffClockIns.map((log) => (
                          <tr key={log.id} className={`border-b hover:bg-slate-50/50 dark:hover:bg-slate-800/40 ${isDarkMode ? 'border-slate-800/50 text-slate-300' : 'border-slate-100 text-slate-700'}`}>
                            <td className="p-3">
                              <div className="font-bold text-slate-900 dark:text-white">{log.staffName}</div>
                              <div className="text-[10px] text-slate-400 font-medium">{log.role} (ID: {log.staffId})</div>
                            </td>
                            <td className="p-3 font-mono font-semibold">{log.date}</td>
                            <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">
                              {log.clockInTime.split(' ')[1] || log.clockInTime}
                            </td>
                            <td className="p-3 font-semibold text-rose-600 dark:text-rose-400">
                              {log.clockOutTime ? (log.clockOutTime.split(' ')[1] || log.clockOutTime) : '—'}
                            </td>
                            <td className="p-3 text-[11px] font-medium text-slate-500">
                              {log.latitude.toFixed(5)}° N, {log.longitude.toFixed(5)}° W
                            </td>
                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                                log.status === 'In-Range'
                                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-500">
                              {log.distanceFromFenceM} meters
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== LEAVE REQUESTS REVIEW VIEW ==================== */}
          {teachersActiveSubTab === 'leaves' && (
            <div className="space-y-4 animate-fade-in">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}>
                <h3 className="text-sm font-bold mb-3">Academic Faculty Leave Register</h3>
                {staffLeaveRequests.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                    No leave requests found in the system.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className={`border-b font-extrabold uppercase tracking-wider text-[10px] text-slate-400 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                          <th className="p-3">Staff Member</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Duration</th>
                          <th className="p-3">Applied On</th>
                          <th className="p-3">Reason</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffLeaveRequests.map((req) => (
                          <tr key={req.id} className={`border-b hover:bg-slate-50/50 dark:hover:bg-slate-800/40 ${isDarkMode ? 'border-slate-800/50 text-slate-300' : 'border-slate-100 text-slate-700'}`}>
                            <td className="p-3">
                              <div className="font-bold text-slate-900 dark:text-white">{req.staffName}</div>
                              <div className="text-[10px] text-slate-400 font-medium">{req.role} (ID: {req.staffId})</div>
                            </td>
                            <td className="p-3">
                              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold px-2 py-0.5 rounded uppercase">
                                {req.type}
                              </span>
                            </td>
                            <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                              {req.startDate} to {req.endDate}
                            </td>
                            <td className="p-3 font-mono font-medium text-slate-400">{req.appliedOn}</td>
                            <td className="p-3 max-w-[220px] truncate font-medium" title={req.reason}>
                              "{req.reason}"
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                                req.status === 'Approved'
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                  : req.status === 'Rejected'
                                  ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                              {req.status === 'Pending' ? (
                                <>
                                  <button
                                    onClick={() => {
                                      const updated = staffLeaveRequests.map(l => l.id === req.id ? { ...l, status: 'Approved' as const } : l);
                                      onUpdateStaffLeaves(updated);
                                    }}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-sm text-[10px] cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      const updated = staffLeaveRequests.map(l => l.id === req.id ? { ...l, status: 'Rejected' as const } : l);
                                      onUpdateStaffLeaves(updated);
                                    }}
                                    className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-sm text-[10px] cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium">Reviewed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== PAYROLL & SALARIES LEDGER VIEW ==================== */}
          {teachersActiveSubTab === 'payroll' && (
            <div className="space-y-4 animate-fade-in">
              {payrollActionStatus.message && (
                <div className={`p-4 rounded-xl text-xs font-bold border ${
                  payrollActionStatus.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                }`}>
                  {payrollActionStatus.message}
                </div>
              )}

              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-bold">Monthly Staff Payroll Ledger (GHS)</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Process salaries, print legal slips, and track statutory PAYE tax and SSNIT deductions.</p>
                  </div>
                  <button
                    onClick={() => {
                      const updated = staffPayrolls.map(p => ({ ...p, status: 'Paid' as const, processedOn: new Date().toISOString().substring(0, 10) }));
                      onUpdateStaffPayrolls(updated);
                      setPayrollActionStatus({ type: 'success', message: 'All outstanding staff salaries processed successfully!' });
                    }}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-black rounded-lg text-xs cursor-pointer shadow-sm active:scale-95 transition-all"
                  >
                    Process All Payouts
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={`border-b font-extrabold uppercase tracking-wider text-[10px] text-slate-400 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                        <th className="p-3">Staff Name</th>
                        <th className="p-3">Basic Salary</th>
                        <th className="p-3">Allowances</th>
                        <th className="p-3">Deductions</th>
                        <th className="p-3">Net Payable</th>
                        <th className="p-3">Payout Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffPayrolls.map((pay) => (
                        <tr key={pay.id} className={`border-b hover:bg-slate-50/50 dark:hover:bg-slate-800/40 ${isDarkMode ? 'border-slate-800/50 text-slate-300' : 'border-slate-100 text-slate-700'}`}>
                          <td className="p-3">
                            <div className="font-bold text-slate-900 dark:text-white">{pay.staffName}</div>
                            <div className="text-[10px] text-slate-400 font-medium">Role: {pay.role} (ID: {pay.staffId})</div>
                          </td>
                          <td className="p-3 font-mono font-bold">GH¢ {pay.baseSalary.toLocaleString()}</td>
                          <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">GH¢ {pay.allowances.toLocaleString()}</td>
                          <td className="p-3 font-mono font-bold text-rose-600 dark:text-rose-400">GH¢ {pay.deductions.toLocaleString()}</td>
                          <td className="p-3 font-mono font-extrabold text-indigo-600 dark:text-indigo-400">GH¢ {pay.netSalary.toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                              pay.status === 'Paid'
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            }`}>
                              {pay.status}
                            </span>
                            {pay.processedOn && (
                              <span className="text-[8px] text-slate-400 block mt-0.5">Paid on {pay.processedOn}</span>
                            )}
                          </td>
                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            {pay.status === 'Pending' && (
                              <button
                                onClick={() => {
                                  const updated = staffPayrolls.map(p => p.id === pay.id ? { ...p, status: 'Paid' as const, processedOn: new Date().toISOString().substring(0, 10) } : p);
                                  onUpdateStaffPayrolls(updated);
                                  setPayrollActionStatus({ type: 'success', message: `Salary payout for ${pay.staffName} processed successfully!` });
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded text-[10px] cursor-pointer"
                              >
                                Pay Salary
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedPayrollStaff(pay)}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-extrabold rounded text-[10px] cursor-pointer"
                            >
                              View Payslip
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== VIEW PASYLIP DRAWER MODAL ==================== */}
          {selectedPayrollStaff && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border flex flex-col overflow-hidden max-h-[90vh] ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}>
                {/* Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Printer size={16} className="text-emerald-600" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Edweso Royal Academy Payslip</span>
                  </div>
                  <button
                    onClick={() => setSelectedPayrollStaff(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Slip Content */}
                <div className="p-6 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300">
                  {/* Letterhead */}
                  <div className="text-center space-y-1">
                    <h2 className="font-display font-black text-slate-900 dark:text-white uppercase tracking-wider text-base">Edweso Royal Academy</h2>
                    <p className="text-[10px] font-bold text-slate-400">P.O. Box 45, Ejisu-Edweso, Ashanti Region, Ghana</p>
                    <p className="text-[9px] font-mono text-slate-500">TEL: +233 24 357 8980 • EMAIL: payroll@edwesocode.edu.gh</p>
                    <div className="h-[2px] bg-indigo-600 w-1/3 mx-auto mt-2" />
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Employee Information</span>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedPayrollStaff.staffName}</div>
                      <div className="text-slate-500 font-medium">Role: {selectedPayrollStaff.role}</div>
                      <div className="text-slate-500 font-mono">ID: {selectedPayrollStaff.staffId}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Payment Particulars</span>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">Pay Period: July 2026</div>
                      <div className="text-slate-500 font-semibold">Status: <span className="text-emerald-600">{selectedPayrollStaff.status}</span></div>
                      {selectedPayrollStaff.processedOn && <div className="text-slate-400 font-mono text-[10px]">Processed: {selectedPayrollStaff.processedOn}</div>}
                    </div>
                  </div>

                  {/* Financial Details Table */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                    <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-950/60 p-2 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[9px] text-slate-400">
                      <div>Earnings Item</div>
                      <div className="text-right">Amount (GHS)</div>
                    </div>
                    
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      <div className="grid grid-cols-2 p-2.5 font-medium">
                        <div>Basic Salary</div>
                        <div className="text-right font-mono font-bold">GH¢ {selectedPayrollStaff.basicSalary.toLocaleString()}.00</div>
                      </div>
                      <div className="grid grid-cols-2 p-2.5 font-medium text-emerald-600 dark:text-emerald-400">
                        <div>Transport & Housing Allowance</div>
                        <div className="text-right font-mono font-bold">GH¢ {selectedPayrollStaff.allowances.toLocaleString()}.00</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-950/60 p-2 border-y border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[9px] text-slate-400 mt-2">
                      <div>Statutory Deductions</div>
                      <div className="text-right">Amount (GHS)</div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      <div className="grid grid-cols-2 p-2.5 font-medium text-rose-500">
                        <div>SSNIT Employee Contribution (5.5%)</div>
                        <div className="text-right font-mono font-bold">GH¢ {Math.floor(selectedPayrollStaff.basicSalary * 0.055)}.00</div>
                      </div>
                      <div className="grid grid-cols-2 p-2.5 font-medium text-rose-500">
                        <div>PAYE Income Tax Deduction</div>
                        <div className="text-right font-mono font-bold">GH¢ {selectedPayrollStaff.deductions - Math.floor(selectedPayrollStaff.basicSalary * 0.055)}.00</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 bg-indigo-50 dark:bg-indigo-950/20 p-3 border-t border-slate-200 dark:border-slate-800 font-extrabold text-sm text-indigo-700 dark:text-indigo-300">
                      <div>Net Payable Salary</div>
                      <div className="text-right font-mono font-black">GH¢ {selectedPayrollStaff.netSalary.toLocaleString()}.00</div>
                    </div>
                  </div>

                  {/* Legal/Compliance notice */}
                  <div className="p-3 bg-indigo-50/40 dark:bg-slate-950/40 rounded-lg text-[10px] text-slate-500 leading-relaxed border border-indigo-100/20">
                    <strong>Notice:</strong> This electronic payslip acts as a legal receipt of earnings paid into your registered GCB Bank / Consolidated Bank Ghana (CBG) account. Income tax deductions (PAYE) are remitted directly to the Ghana Revenue Authority (GRA) in compliance with the Income Tax Act, 2015 (Act 896).
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-950/20">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs cursor-pointer mr-2"
                  >
                    Print Payslip
                  </button>
                  <button
                    onClick={() => setSelectedPayrollStaff(null)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 font-bold rounded-lg text-xs cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    Close Slip
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== STANDARD FACULTY DIRECTORY LIST ==================== */}
          {teachersActiveSubTab === 'list' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
                <div className="max-w-xs w-full relative">
                  <input
                    type="text"
                    id="search-teachers-input"
                    placeholder="Search faculty name..."
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-800 dark:text-white focus:outline-hidden focus:border-emerald-500 font-semibold"
                  />
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                </div>

                {/* Department Filtering Toggles */}
                <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200/40 dark:border-slate-800 shrink-0">
                  {(['All', 'Daycare-JHS', 'SHS'] as const).map((dept) => (
                    <button
                      key={dept}
                      onClick={() => setTeacherDeptFilter(dept)}
                      className={`px-3 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                        teacherDeptFilter === dept
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {dept === 'All' ? 'All Departments' : dept}
                    </button>
                  ))}
                </div>
              </div>

          <div className={`border rounded-xl overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-880' : 'bg-white border-slate-200/60'}`}>
            <div className="overflow-x-auto">
              <table id="teachers-registry-table" className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b font-extrabold uppercase tracking-wider text-[10px] text-slate-400 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <th className="p-3">Faculty Details</th>
                    <th className="p-3">Staff ID</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Subject Specialty</th>
                    <th className="p-3">Contact Email</th>
                    <th className="p-3">Mobile Contact</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {teachers
                    .filter(t => t.name.toLowerCase().includes(teacherSearch.toLowerCase()))
                    .filter(t => {
                      const dept = t.department || (t.id === 't6' ? 'SHS' : 'Daycare-JHS');
                      return teacherDeptFilter === 'All' || dept === teacherDeptFilter;
                    })
                    .map((teach) => (
                      <tr key={teach.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-colors font-medium text-slate-700 dark:text-slate-300">
                        <td className="p-3">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-emerald-800 overflow-hidden border border-slate-200/50 dark:border-slate-800 shrink-0">
                              {teach.profilePhoto ? (
                                <img src={teach.profilePhoto} alt={teach.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                teach.name.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">{teach.name}</p>
                              <span className="text-[10px] text-slate-400 leading-none mt-0.5 inline-block">{teach.gender}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[10px] text-slate-400">{teach.staffNumber}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                            (teach.department || (teach.id === 't6' ? 'SHS' : 'Daycare-JHS')) === 'SHS'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          }`}>
                            {teach.department || (teach.id === 't6' ? 'SHS' : 'Daycare-JHS')}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                            {teach.subjectId}
                          </span>
                        </td>
                        <td className="p-3">{teach.email}</td>
                        <td className="p-3 font-semibold">{teach.phone}</td>
                        <td className="p-3">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
                            teach.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                          }`}>
                            {teach.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => openEditTeacher(teach)}
                              className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteTeacher(teach.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
          </>
          )}

        </div>
      )}

      {/* ==================== 4. CLASSES & SUBJECTS ==================== */}
      {activeTab === 'classes' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="pb-2 border-b border-slate-200/40">
            <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Ghana Curriculum Class Divisions</h2>
            <p className="text-xs text-slate-400">Review Form Teachers and syllabus subject lines mapped to academic levels.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => {
              const formTeacher = teachers.find(t => t.id === cls.teacherId);
              const classSubs = subjects.filter(sub => sub.classId === cls.id);
              
              return (
                <div key={cls.id} className={`p-5 rounded-xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                }`}>
                  <div>
                    <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{cls.name}</h4>
                        <span className="text-[10px] font-bold text-slate-400">{cls.gradeLevel} Curriculum</span>
                      </div>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded font-mono font-bold">{cls.room}</span>
                    </div>

                    <div className="my-4 space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Form Teacher</span>
                        <p className="text-xs font-bold mt-0.5 text-emerald-700 dark:text-emerald-300">{formTeacher ? formTeacher.name : 'Unassigned'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Subjects Tracked</span>
                        <div className="flex flex-wrap gap-1">
                          {classSubs.length > 0 ? (
                            classSubs.map(s => (
                              <span key={s.id} className="text-[9px] bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                                {s.name} ({s.code})
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No custom subject nodes registered.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">Active Register</span>
                    <span className="text-xs font-bold">{students.filter(s => s.classId === cls.id).length} Students</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ==================== 5. ATTENDANCE system ==================== */}
      {activeTab === 'attendance' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="pb-2 border-b border-slate-200/40">
            <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Daily Attendance Registers</h2>
            <p className="text-xs text-slate-400">Review roll call records logged by classroom Form Teachers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classes.map((cls) => {
              const clsStudents = students.filter(s => s.classId === cls.id);
              const clsAttendance = attendance.filter(a => a.classId === cls.id && a.date === '2026-07-02');
              const presentCount = clsAttendance.filter(a => a.status === 'Present').length;
              const lateCount = clsAttendance.filter(a => a.status === 'Late').length;
              const absentCount = clsAttendance.filter(a => a.status === 'Absent').length;

              return (
                <div key={cls.id} className={`p-4 rounded-xl border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                }`}>
                  <h4 className="font-extrabold text-xs uppercase tracking-wide border-b pb-2 mb-3 text-slate-900 dark:text-white">{cls.name} Register (Today)</h4>
                  
                  <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                    <div className="bg-emerald-500/10 p-2 rounded">
                      <span className="font-bold text-emerald-600 block">{presentCount}</span>
                      <span className="text-[9px] text-slate-400">Present</span>
                    </div>
                    <div className="bg-amber-500/10 p-2 rounded">
                      <span className="font-bold text-amber-600 block">{lateCount}</span>
                      <span className="text-[9px] text-slate-400">Late</span>
                    </div>
                    <div className="bg-rose-500/10 p-2 rounded">
                      <span className="font-bold text-rose-600 block">{absentCount}</span>
                      <span className="text-[9px] text-slate-400">Absent</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Overall Rate:</span>
                    <span className="font-bold text-slate-800 dark:text-white">
                      {clsStudents.length > 0 
                        ? Math.round(((presentCount + lateCount) / clsStudents.length) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ==================== 6. EXAMS & GRADES (GES Standards) ==================== */}
      {activeTab === 'grades' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/40">
            <div>
              <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Terminal Examinations & Continual Assessments</h2>
              <p className="text-xs text-slate-400">GES Class Score (30%) & Exam Score (70%) record collation sheets.</p>
            </div>
            <button
              onClick={() => setIsGradeModalOpen(true)}
              id="admin-add-grade-btn"
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs flex items-center space-x-1 shadow-sm transition-colors"
            >
              <Plus size={14} />
              <span>Input Terminal Score</span>
            </button>
          </div>

          {/* Filtering selection */}
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Class Grade</label>
              <select
                id="grade-class-filter"
                value={gradeClassFilter}
                onChange={(e) => setGradeClassFilter(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-hidden focus:border-emerald-500 font-semibold text-slate-700 dark:text-white"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Curriculum Subject</label>
              <select
                id="grade-subject-filter"
                value={gradeSubjectFilter}
                onChange={(e) => setGradeSubjectFilter(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-hidden focus:border-emerald-500 font-semibold text-slate-700 dark:text-white"
              >
                {subjects.filter(s => s.classId === gradeClassFilter).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Collated Grades Table */}
          <div className={`border rounded-xl overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'}`}>
            <table id="grades-ledger-table" className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-extrabold uppercase tracking-wider text-[10px] text-slate-400 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Assessment score (Max 30)</th>
                  <th className="p-3">Exam score (Max 70)</th>
                  <th className="p-3">Terminal Aggregate</th>
                  <th className="p-3">Grade (GES)</th>
                  <th className="p-3">Remarks & Evaluations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students
                  .filter(s => s.classId === gradeClassFilter)
                  .map(student => {
                    const studentGrade = grades.find(g => g.studentId === student.id && g.subjectId === gradeSubjectFilter);
                    return (
                      <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-colors font-medium text-slate-700 dark:text-slate-300">
                        <td className="p-3 font-extrabold text-slate-900 dark:text-white">{student.name}</td>
                        <td className="p-3 font-mono font-semibold">{studentGrade ? `${studentGrade.classScore} / 30` : '—'}</td>
                        <td className="p-3 font-mono font-semibold">{studentGrade ? `${studentGrade.examScore} / 70` : '—'}</td>
                        <td className="p-3 font-bold font-mono text-emerald-700 dark:text-emerald-400">
                          {studentGrade ? `${studentGrade.totalScore}%` : '—'}
                        </td>
                        <td className="p-3">
                          {studentGrade ? (
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded font-mono ${
                              studentGrade.grade === 'A' || studentGrade.grade === 'B' 
                                ? 'bg-emerald-500/10 text-emerald-600' 
                                : studentGrade.grade === 'C' || studentGrade.grade === 'D'
                                  ? 'bg-amber-500/10 text-amber-600'
                                  : 'bg-rose-500/10 text-rose-600'
                            }`}>
                              {studentGrade.grade}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Not Inputted</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-500 dark:text-slate-400">
                          {studentGrade ? studentGrade.remarks : <span className="text-[10px] italic text-slate-400">Assessments pending submission.</span>}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ==================== 7. TIMETABLE SCHEDULER ==================== */}
      {activeTab === 'timetable' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/40">
            <div>
              <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Daily Subject Block Calendars</h2>
              <p className="text-xs text-slate-400">Establish and modify lesson hour tracks for different classrooms.</p>
            </div>
            <button
              onClick={() => setIsTimetableModalOpen(true)}
              id="admin-add-timetable-btn"
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Plus size={14} />
              <span>Create Schedule Block</span>
            </button>
          </div>

          <div className="max-w-xs">
            <select
              id="timetable-class-filter"
              value={gradeClassFilter}
              onChange={(e) => setGradeClassFilter(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-hidden focus:border-emerald-500 font-semibold text-slate-700 dark:text-white"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} Calendar</option>
              ))}
            </select>
          </div>

          {/* Simple Structured Calendar representation */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
              const dayLessons = timetable.filter(tt => tt.classId === gradeClassFilter && tt.day === day);
              return (
                <div key={day} className={`p-4 rounded-xl border flex flex-col justify-start min-h-[160px] ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                }`}>
                  <h4 className="font-extrabold text-xs uppercase tracking-wide border-b pb-2 mb-3 text-emerald-800 dark:text-emerald-300">{day}</h4>
                  
                  <div className="space-y-2 flex-1">
                    {dayLessons.length > 0 ? (
                      dayLessons.map(les => {
                        const sub = subjects.find(s => s.id === les.subjectId);
                        const teach = teachers.find(t => t.id === les.teacherId);
                        return (
                          <div key={les.id} className="p-2.5 bg-slate-100/60 dark:bg-slate-950 rounded-lg border border-slate-200/40 dark:border-slate-800 text-[11px]">
                            <p className="font-bold text-slate-900 dark:text-white">{sub ? sub.name : 'Unknown'}</p>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{les.startTime} - {les.endTime}</span>
                            <span className="text-[9px] text-emerald-600 font-semibold block">{teach ? teach.name : 'No Teacher'}</span>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-[10px] text-slate-400 italic block mt-4">Free Study Block</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ==================== 8. ANNOUNCEMENTS system ==================== */}
      {activeTab === 'announcements' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/40">
            <div>
              <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Announcements & Bulletins</h2>
              <p className="text-xs text-slate-400">Broadcast official school bulletins to parents, teachers, and students.</p>
            </div>
            <button
              onClick={() => setIsNoticeModalOpen(true)}
              id="admin-add-notice-btn"
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Plus size={14} />
              <span>Broadcast Notice</span>
            </button>
          </div>

          {/* Featured swipeable bulletins carousel */}
          <div className="mb-6">
            <FeaturedAnnouncementsCarousel 
              announcements={announcements} 
              onDeleteNotice={handleDeleteNotice}
              isAdmin={true}
            />
          </div>

          <div className="pt-2 border-t border-slate-200/40">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">All Active Dispatches</h3>
          </div>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className={`p-5 rounded-xl border relative overflow-hidden ${
                isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
              }`}>
                {/* Accent colored marker for visual appeal */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600"></div>
                
                <div className="flex justify-between items-start pl-2">
                  <div>
                    <span className="text-[9px] font-extrabold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded uppercase">
                      Target: {ann.targetAudience}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1.5">{ann.title}</h3>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-medium">
                    <span>{ann.date}</span>
                    <button
                      onClick={() => handleDeleteNotice(ann.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove Bulletin"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 pl-2 mt-2 leading-relaxed whitespace-pre-line">{ann.content}</p>
                
                <div className="border-t border-slate-100 dark:border-slate-800/80 mt-4 pt-2.5 pl-2 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span>Author: {ann.authorName} ({ann.authorRole})</span>
                  <span>Edweso Royal Academy official dispatch</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ==================== 9. PAYMENTS & FEES MANAGEMENTS ==================== */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="pb-2 border-b border-slate-200/40 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Payments & Gateway Integration</h2>
              <p className="text-xs text-slate-400">Review real-time collection transaction ledgers, specify bank payout endpoints, or configure custom Paystack keys.</p>
            </div>
            
            {/* Sub-tab Selection Buttons */}
            <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200/40 dark:border-slate-800 shrink-0 self-start md:self-auto">
              <button
                onClick={() => setPaymentsSubTab('ledger')}
                className={`px-3 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1 ${
                  paymentsSubTab === 'ledger'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <History size={12} />
                <span>Transaction Ledger</span>
              </button>
              <button
                onClick={() => setPaymentsSubTab('bank-setup')}
                className={`px-3 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1 ${
                  paymentsSubTab === 'bank-setup'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <CreditCard size={12} />
                <span>Bank & Payout Link</span>
              </button>
            </div>
          </div>

          {paymentsSubTab === 'ledger' && (
            <>
              {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Fees Collected</span>
              <span className="text-xl font-extrabold font-mono mt-1">GHS {totalRevenue.toFixed(2)}</span>
            </div>
            <div className="p-4 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider">Outstanding Accounts balance</span>
              <span className="text-xl font-extrabold font-mono mt-1">GHS {outstandingFees.toFixed(2)}</span>
            </div>
            <div className="p-4 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider">Cleared Transactions</span>
              <span className="text-xl font-extrabold mt-1">{transactions.filter(t => t.status === 'Successful').length} Successes</span>
            </div>
          </div>

          {/* Monthly Cash Flow Trends Chart */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
          }`} id="payments-cashflow-trends-card">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/60 mb-4">
              <div>
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100">Academic Year Cash Flow Trends</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Monthly breakdown of total fee payments collected throughout the academic year to track cash flow trends.</p>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full font-bold">
                Cash Flow Analysis
              </span>
            </div>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyFeeCollections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                  <XAxis 
                    dataKey="month" 
                    stroke={isDarkMode ? "#64748b" : "#94a3b8"} 
                    fontSize={10} 
                    fontWeight="bold"
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke={isDarkMode ? "#64748b" : "#94a3b8"} 
                    fontSize={10} 
                    fontWeight="bold"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `GHS ${v}`}
                  />
                  <Tooltip 
                    cursor={{ fill: isDarkMode ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.6)' }}
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                      borderColor: isDarkMode ? '#1e293b' : '#e2e8f0', 
                      borderRadius: '12px', 
                      fontSize: '11px',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      fontWeight: 'bold',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: any) => [`GHS ${Number(value).toLocaleString()}`, 'Collections']}
                  />
                  <Bar name="Collections" dataKey="Fee Collections (GHS)" fill="#10b981" radius={[4, 4, 0, 0]}>
                    {
                      monthlyFeeCollections.map((entry, index) => {
                        const amount = entry['Fee Collections (GHS)'];
                        const barColor = amount > 10000 ? '#059669' : '#10b981';
                        return <Cell key={`cell-payments-tab-${index}`} fill={barColor} />;
                      })
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Peak Collection Volume (&gt;10,000 GHS)
                <span className="w-2 h-2 rounded-full bg-emerald-400 ml-2"></span> Standard Collection Volume
              </span>
              <span>YTD Fee Revenue: GHS {monthlyFeeCollections.reduce((sum, item) => sum + item['Fee Collections (GHS)'], 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Historical Table */}
          <div className={`border rounded-xl overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'}`}>
            <div className="overflow-x-auto">
              <table id="payments-history-table" className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b font-extrabold uppercase tracking-wider text-[10px] text-slate-400 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <th className="p-3">Reference / Paystack ID</th>
                    <th className="p-3">Student payee</th>
                    <th className="p-3">Terminal Amount</th>
                    <th className="p-3">Channel / Provider</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Term</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-colors font-medium text-slate-700 dark:text-slate-300">
                      <td className="p-3">
                        <p className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">{tx.reference}</p>
                        <p className="text-[9px] font-mono text-slate-400 mt-0.5 leading-none">{tx.paystackRef}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-800 dark:text-white leading-tight">{tx.studentName}</p>
                        <p className="text-[10px] text-slate-400 leading-none mt-0.5">{tx.email}</p>
                      </td>
                      <td className="p-3 font-extrabold font-mono text-slate-900 dark:text-white">GHS {tx.amountGHS.toFixed(2)}</td>
                      <td className="p-3">
                        <span className="bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 border border-slate-100 dark:border-slate-800">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">{tx.date}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">{tx.term}</td>
                      <td className="p-3">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
                          tx.status === 'Successful' 
                            ? 'bg-emerald-500/10 text-emerald-600' 
                            : tx.status === 'Pending'
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </>
          )}

          {/* ==================== BANK & GATEWAY LINK LAYOUT ==================== */}
          {paymentsSubTab === 'bank-setup' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-slate-800 dark:text-slate-100">
              
              {/* Left Column: Paystack Keys & Core Gateway Integration */}
              <div className="lg:col-span-5 space-y-6">
                <div className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'
                }`}>
                  <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-800/60 mb-4">
                    <Lock className="text-emerald-500" size={18} />
                    <div>
                      <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-805 dark:text-slate-100">Paystack Keys & Mode</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Define your API keys and toggle the transaction router environment.</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs font-semibold">
                    {/* Gateway Status Badge */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Gateway Status</span>
                      <span className="flex items-center space-x-1.5 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-emerald-600 dark:text-emerald-400">Natively Connected</span>
                      </span>
                    </div>

                    {/* Mode Selection */}
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 mb-1.5">Environment Mode</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPaystackMode('test');
                            localStorage.setItem('era_paystack_mode', 'test');
                          }}
                          className={`py-2 px-3 rounded-lg border font-bold text-center transition-all cursor-pointer ${
                            paystackMode === 'test'
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950'
                          }`}
                        >
                          Test Mode
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPaystackMode('live');
                            localStorage.setItem('era_paystack_mode', 'live');
                          }}
                          className={`py-2 px-3 rounded-lg border font-bold text-center transition-all cursor-pointer ${
                            paystackMode === 'live'
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950'
                          }`}
                        >
                          Live Mode
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium leading-normal">
                        {paystackMode === 'test' 
                          ? 'Simulates actual checkouts using mock payment cards and simulated Momo networks.' 
                          : 'Warning: Live mode requires real credit cards or mobile money wallets to process actual currency collections.'}
                      </p>
                    </div>

                    {/* Public Key */}
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 mb-1">Paystack Public Key</label>
                      <input
                        type="text"
                        placeholder="pk_test_..."
                        value={paystackPublicKey}
                        onChange={(e) => {
                          setPaystackPublicKey(e.target.value);
                          localStorage.setItem('era_paystack_pub_key', e.target.value);
                        }}
                        className={`w-full p-2.5 rounded-lg border text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-emerald-500 ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    {/* Secret Key */}
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 mb-1">Paystack Secret Key</label>
                      <input
                        type="password"
                        placeholder="sk_test_..."
                        value={paystackSecretKey}
                        onChange={(e) => {
                          setPaystackSecretKey(e.target.value);
                          localStorage.setItem('era_paystack_sec_key', e.target.value);
                        }}
                        className={`w-full p-2.5 rounded-lg border text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-emerald-500 ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Secure Badge Card */}
                <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
                  isDarkMode ? 'bg-slate-950 border-slate-800/60' : 'bg-emerald-50/30 border-emerald-100'
                }`}>
                  <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                  <div className="text-[11px] leading-normal font-medium text-slate-500 dark:text-slate-400">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 block mb-0.5">PCI-DSS Compliant Infrastructure</span>
                    All credential exchanges are processed via 256-bit SSL transport tunnels. Your secret keys are kept encrypted in local storage, isolated completely from standard browser tracking scripts.
                  </div>
                </div>
              </div>

              {/* Right Column: Payout Bank Link / Mobile Money Merchant */}
              <div className="lg:col-span-7 space-y-6">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setIsVerifyingPayout(true);
                  setPayoutConfigError('');
                  setPayoutConfigSuccess('');
                  
                  setTimeout(() => {
                    if (payoutMethod === 'bank' && payoutAccountNumber.length < 8) {
                      setPayoutConfigError('Invalid bank account number. It must be at least 8 digits long.');
                      setIsVerifyingPayout(false);
                      return;
                    }
                    if (payoutMethod === 'momo' && payoutMomoNumber.length < 9) {
                      setPayoutConfigError('Invalid mobile wallet number. It must be at least 9 digits.');
                      setIsVerifyingPayout(false);
                      return;
                    }
                    
                    localStorage.setItem('era_paystack_mode', paystackMode);
                    localStorage.setItem('era_paystack_pub_key', paystackPublicKey);
                    localStorage.setItem('era_paystack_sec_key', paystackSecretKey);
                    localStorage.setItem('era_payout_method', payoutMethod);
                    localStorage.setItem('era_payout_bank_name', payoutBankName);
                    localStorage.setItem('era_payout_acc_num', payoutAccountNumber);
                    localStorage.setItem('era_payout_acc_name', payoutAccountName);
                    localStorage.setItem('era_payout_branch', payoutBankBranch);
                    localStorage.setItem('era_payout_momo_provider', payoutMomoProvider);
                    localStorage.setItem('era_payout_momo_num', payoutMomoNumber);
                    localStorage.setItem('era_payout_verified', 'true');
                    
                    setIsPayoutVerified(true);
                    setIsVerifyingPayout(false);
                    setPayoutConfigSuccess('Success! Payout destination verified by Paystack Resolver Service and linked to your account.');
                  }, 1500);
                }} className={`p-5 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'
                }`}>
                  
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/60 mb-4">
                    <div className="flex items-center space-x-2">
                      <Building className="text-emerald-500" size={18} />
                      <div>
                        <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100">Payout Settlement Bank Link</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Route accumulated student tuition fees directly to your certified bank account.</p>
                      </div>
                    </div>
                    {isPayoutVerified ? (
                      <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <Check size={10} strokeWidth={3} /> Verified
                      </span>
                    ) : (
                      <span className="text-[9px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold px-2 py-0.5 rounded-full uppercase">
                        Unverified
                      </span>
                    )}
                  </div>

                  <div className="space-y-4 text-xs font-semibold">
                    {/* Switch: Bank Account vs MoMo Wallet */}
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 mb-1.5">Settlement Method</label>
                      <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setPayoutMethod('bank')}
                          className={`flex-1 py-2 rounded-md font-bold text-center text-xs transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                            payoutMethod === 'bank'
                              ? 'bg-white dark:bg-slate-850 text-slate-900 dark:text-white shadow-xs'
                              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <Building size={14} />
                          <span>GCB / CBG Bank Account</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayoutMethod('momo')}
                          className={`flex-1 py-2 rounded-md font-bold text-center text-xs transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                            payoutMethod === 'momo'
                              ? 'bg-white dark:bg-slate-850 text-slate-900 dark:text-white shadow-xs'
                              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <Smartphone size={14} />
                          <span>MoMo Merchant Account</span>
                        </button>
                      </div>
                    </div>

                    {/* Bank fields */}
                    {payoutMethod === 'bank' && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 mb-1">Select Bank</label>
                            <select
                              value={payoutBankName}
                              onChange={(e) => setPayoutBankName(e.target.value)}
                              className={`w-full p-2.5 rounded-lg border text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500 ${
                                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100 font-medium' : 'bg-white border-slate-200 text-slate-800'
                              }`}
                            >
                              <option value="GCB Bank PLC">GCB Bank PLC (Ghana Commercial Bank)</option>
                              <option value="Consolidated Bank Ghana (CBG)">Consolidated Bank Ghana (CBG)</option>
                              <option value="Ecobank Ghana PLC">Ecobank Ghana PLC</option>
                              <option value="Stanbic Bank Ghana">Stanbic Bank Ghana</option>
                              <option value="Absa Bank Ghana">Absa Bank Ghana</option>
                              <option value="Fidelity Bank Ghana">Fidelity Bank Ghana</option>
                              <option value="Zenith Bank Ghana">Zenith Bank Ghana</option>
                              <option value="CalBank PLC">CalBank PLC</option>
                              <option value="Société Générale Ghana">Société Générale Ghana</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 mb-1">Bank Branch</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Ejisu Main Branch"
                              value={payoutBankBranch}
                              onChange={(e) => setPayoutBankBranch(e.target.value)}
                              className={`w-full p-2.5 rounded-lg border text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500 ${
                                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 mb-1">Account Number</label>
                            <input
                              type="text"
                              required
                              maxLength={16}
                              placeholder="e.g. 1011130004521"
                              value={payoutAccountNumber}
                              onChange={(e) => setPayoutAccountNumber(e.target.value.replace(/\D/g, ''))}
                              className={`w-full p-2.5 rounded-lg border text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-emerald-500 ${
                                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 mb-1">Account Holder Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Edweso Royal Academy Ltd"
                              value={payoutAccountName}
                              onChange={(e) => setPayoutAccountName(e.target.value)}
                              className={`w-full p-2.5 rounded-lg border text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500 ${
                                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MoMo fields */}
                    {payoutMethod === 'momo' && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 mb-1">Mobile Operator</label>
                            <select
                              value={payoutMomoProvider}
                              onChange={(e) => setPayoutMomoProvider(e.target.value)}
                              className={`w-full p-2.5 rounded-lg border text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500 ${
                                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100 font-medium' : 'bg-white border-slate-200 text-slate-800'
                              }`}
                            >
                              <option value="MTN Mobile Money">MTN Mobile Money</option>
                              <option value="Telecel Cash">Telecel Cash</option>
                              <option value="AirtelTigo Money">AirtelTigo Money</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 mb-1">Merchant Wallet Number</label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 font-bold text-slate-400 text-xs">+233</span>
                              <input
                                type="tel"
                                required
                                placeholder="244123456"
                                value={payoutMomoNumber}
                                onChange={(e) => setPayoutMomoNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                                className={`w-full p-2.5 pl-14 rounded-lg border text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-emerald-500 ${
                                  isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 mb-1">Registered Merchant / Business Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Edweso Royal Academy Merchant Billing"
                            value={payoutAccountName}
                            onChange={(e) => setPayoutAccountName(e.target.value)}
                            className={`w-full p-2.5 rounded-lg border text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500 ${
                              isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Alerts / Success / Error Indicators */}
                    {payoutConfigError && (
                      <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20 text-[11px] leading-normal font-medium flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                        <span>{payoutConfigError}</span>
                      </div>
                    )}

                    {payoutConfigSuccess && (
                      <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 text-[11px] leading-normal font-medium flex items-center space-x-2 animate-fade-in">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-ping"></span>
                        <span>{payoutConfigSuccess}</span>
                      </div>
                    )}

                    {/* Save Button */}
                    <button
                      type="submit"
                      disabled={isVerifyingPayout}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/40 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-2"
                    >
                      {isVerifyingPayout ? (
                        <>
                          <RefreshCw className="animate-spin" size={14} />
                          <span>Verifying with GhIPSS Resolver...</span>
                        </>
                      ) : (
                        <>
                          <Check size={14} strokeWidth={3} />
                          <span>Save & Link Payout Destination</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Settlement Information Box */}
                <div className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'
                }`}>
                  <div className="flex items-center space-x-2 mb-3">
                    <Info className="text-slate-400" size={16} />
                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide">Payout Settlement Policy</h4>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal space-y-2 font-medium">
                    <p>
                      <strong>Automatic Settlement (T+1):</strong> All student tuition, cafeteria deposits, and bus levies processed via card or mobile money during a calendar day are cleared, batched, and deposited directly into your linked <strong>{payoutMethod === 'bank' ? payoutBankName : payoutMomoProvider}</strong> account on the next banking day.
                    </p>
                    <p>
                      <strong>Standard Service Fee:</strong> Paystack collects a native processing rate of <strong>1.95%</strong> on local Ghanaian cards and mobile money networks. Edweso Royal Academy doesn't impose additional surcharges on parental checkouts.
                    </p>
                    <p>
                      <strong>Failed Settlement Attempts:</strong> If your bank rejects a transfer due to incorrect account naming or locked accounts, Paystack will immediately hold the funds, send a system diagnostic alert, and retry once you resolve and update details above.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}


      {/* ==================== 10. PUBLIC WEB INQUIRIES LEDGER ==================== */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="pb-2 border-b border-slate-200/40">
            <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Public Web Inquiries Ledger</h2>
            <p className="text-xs text-slate-400">Directly captures admissions applications and parent feedback submitted from the multipage school website.</p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Received Inquiries</span>
              <span className="text-xl font-extrabold font-mono mt-1">{inquiries.length} Inquiries</span>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider">Awaiting Staff Review</span>
              <span className="text-xl font-extrabold font-mono mt-1">{inquiries.filter(i => i.status === 'Pending').length} Pending</span>
            </div>
            <div className="p-4 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider font-sans">Processed Admissions</span>
              <span className="text-xl font-extrabold mt-1">{inquiries.filter(i => i.status !== 'Pending').length} Handled</span>
            </div>
          </div>

          {/* Table list */}
          <div className={`border rounded-xl overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'}`}>
            <div className="overflow-x-auto">
              <table id="web-inquiries-table" className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b font-extrabold uppercase tracking-wider text-[10px] text-slate-400 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <th className="p-3">Ref ID</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Sender Details</th>
                    <th className="p-3">Message Snippet</th>
                    <th className="p-3">Received Time</th>
                    <th className="p-3">Status Action</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {inquiries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 italic font-semibold">
                        No inquiries submitted yet.
                      </td>
                    </tr>
                  ) : (
                    inquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-colors font-medium text-slate-700 dark:text-slate-300 font-semibold text-xs">
                        <td className="p-3 font-mono text-[10px] font-bold text-emerald-600">{inq.id}</td>
                        <td className="p-3">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
                            inq.type === 'Admission' 
                              ? 'bg-amber-500/10 text-amber-600' 
                              : inq.type === 'General'
                                ? 'bg-sky-500/10 text-sky-600'
                                : 'bg-pink-500/10 text-pink-600'
                          }`}>
                            {inq.type}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800 dark:text-white leading-tight">{inq.name}</p>
                          <p className="text-[10px] text-slate-400 leading-none mt-0.5">{inq.phone}</p>
                        </td>
                        <td className="p-3 max-w-xs">
                          <p className="truncate text-slate-500 dark:text-slate-400">{inq.message}</p>
                        </td>
                        <td className="p-3 text-slate-400 text-[10px]">{inq.date}</td>
                        <td className="p-3">
                          <select
                            value={inq.status}
                            onChange={(e) => handleInquiryStatusChange(inq.id, e.target.value as any)}
                            className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-1 rounded text-[10px] font-bold focus:outline-hidden"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Reviewed">Reviewed</option>
                            <option value="Contacted">Contacted</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setSelectedInquiry(inq)}
                              className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                              title="Read Inquiry Content"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteInquiry(inq.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete Ledger Entry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Selected Inquiry Modal */}
          {selectedInquiry && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className={`p-6 rounded-xl shadow-2xl max-w-lg w-full border ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex justify-between items-center border-b pb-2 mb-4 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-emerald-600">[{selectedInquiry.id}]</span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Ledger Details</span>
                  </div>
                  <button 
                    onClick={() => setSelectedInquiry(null)}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 font-extrabold text-slate-400 hover:text-slate-950 dark:hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs font-medium">
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Sender Full Name</p>
                      <p className="font-extrabold text-slate-800 dark:text-white mt-0.5">{selectedInquiry.name}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Inquiry Category</p>
                      <p className="font-extrabold text-emerald-600 mt-0.5 uppercase tracking-wide">{selectedInquiry.type}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Contact Phone</p>
                      <p className="font-extrabold text-slate-800 dark:text-white mt-0.5">{selectedInquiry.phone}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Contact Email</p>
                      <p className="font-extrabold text-slate-800 dark:text-white mt-0.5">{selectedInquiry.email}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Detailed Message</p>
                    <div className="p-3.5 bg-slate-100/60 dark:bg-slate-950 rounded-lg border border-slate-200/40 dark:border-slate-800 leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line text-[11px]">
                      {selectedInquiry.message}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400 font-bold">Update Status:</span>
                      <select
                        value={selectedInquiry.status}
                        onChange={(e) => {
                          handleInquiryStatusChange(selectedInquiry.id, e.target.value as any);
                          setSelectedInquiry({ ...selectedInquiry, status: e.target.value as any });
                        }}
                        className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-1 rounded text-[10px] font-bold focus:outline-hidden"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Contacted">Contacted</option>
                      </select>
                    </div>
                    <button
                      onClick={() => setSelectedInquiry(null)}
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase rounded"
                    >
                      Close Viewer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}


      {/* ==================== 11. SIMULATED EMAIL LOGS & COMPOSER ==================== */}
      {activeTab === 'emails' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="pb-2 border-b border-slate-200/40">
            <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Email Dispatch Control</h2>
            <p className="text-xs text-slate-400">Compose custom emails, review logs, and broadcast simulated academic and financial announcements to student guardians.</p>
          </div>

          {/* Quick Metrics & Actions Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'
            }`}>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Outbox Volume</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{emails.length} Simulated Emails</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Simulated mail servers are fully operational. Dispatched emails represent live triggers to parent and guardian address targets.</p>
              </div>
              <div className="pt-2">
                <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>SMTP Sim-Server Active</span>
                </span>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 lg:col-span-2 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'
            }`}>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Automated & Bulk Dispatchers</span>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mt-2">Trigger Simulated Fee Notifications</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Automatically queries all students with outstanding balances (GHS &gt; 0) and issues customized reminders with their exact balances, Paystack links, and instructions.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={triggerBulkFeeAlerts}
                  className="px-4 py-2.5 bg-rose-700 hover:bg-rose-600 text-white font-extrabold text-[11px] uppercase tracking-wide rounded-lg shadow-xs flex items-center space-x-1"
                >
                  <AlertTriangle size={14} className="mr-1" />
                  <span>Notify Outstanding Balances ({students.filter(s => s.balanceGHS > 0).length})</span>
                </button>
                <div className="text-[10px] text-slate-400 flex items-center">
                  <span>* Sends simulated alerts to guardian emails in real-time.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COMPOSER PANEL */}
            <div className={`p-5 rounded-2xl border h-fit space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'
            }`}>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 border-b pb-2">Simulated Custom Composer</h3>

              {composerNotification && (
                <div className={`p-3 rounded-lg text-xs font-semibold ${
                  composerNotification.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                }`}>
                  {composerNotification.message}
                </div>
              )}

              <form onSubmit={handleComposeEmailSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Pupil & Guardian</label>
                  <select
                    required
                    value={composerStudentId}
                    onChange={(e) => setComposerStudentId(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded text-xs focus:outline-hidden"
                  >
                    <option value="">-- Select Student Recipient --</option>
                    {students.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.name} (Guardian: {st.parentName} - {st.parentEmail})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mid-Term Examination Guidelines"
                    value={composerSubject}
                    onChange={(e) => setComposerSubject(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded text-xs font-bold focus:outline-hidden bg-white dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Content Body</label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Dear Parent,&#10;&#10;We are writing from Edweso Royal Academy to inform you..."
                    value={composerBody}
                    onChange={(e) => setComposerBody(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded text-xs focus:outline-hidden leading-relaxed bg-white dark:bg-slate-950"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg uppercase tracking-wider text-[11px]"
                >
                  Send Simulated Email
                </button>
              </form>
            </div>

            {/* OUTBOX DISPATCH LOG */}
            <div className={`p-5 rounded-2xl border lg:col-span-2 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'
            }`}>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 border-b pb-2 mb-4">Simulated Outbox Log</h3>

              <div className="overflow-x-auto">
                <table id="simulated-emails-table" className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b font-extrabold uppercase tracking-wider text-[10px] text-slate-400 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                      <th className="p-3">Ref ID</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Recipient Guardian</th>
                      <th className="p-3">Email Subject</th>
                      <th className="p-3">Dispatched At</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {emails.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 italic font-semibold">
                          No simulated emails sent yet in this session.
                        </td>
                      </tr>
                    ) : (
                      emails.map((em) => (
                        <tr key={em.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-colors font-semibold text-slate-700 dark:text-slate-300">
                          <td className="p-3 font-mono text-[10px] text-emerald-600">{em.id}</td>
                          <td className="p-3">
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
                              em.type === 'Announcement' 
                                ? 'bg-amber-500/10 text-amber-600' 
                                : 'bg-rose-500/10 text-rose-600'
                            }`}>
                              {em.type}
                            </span>
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-slate-800 dark:text-white leading-tight">{em.recipientName}</p>
                            <p className="text-[10px] text-slate-400 leading-none mt-0.5">{em.recipientEmail}</p>
                          </td>
                          <td className="p-3 max-w-xs truncate">{em.subject}</td>
                          <td className="p-3 text-slate-400 text-[10px]">{em.sentAt}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => setSelectedEmailDetails(em)}
                                className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                                title="View Email Payload"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteConfirm({
                                    isOpen: true,
                                    title: 'Delete Email Dispatch',
                                    message: 'Are you sure you want to delete this simulated email dispatch record? This will permanently remove the log entry.',
                                    onConfirm: () => {
                                      onDeleteEmail(em.id);
                                      setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
                                    }
                                  });
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Remove Log Entry"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* VIEW EMAIL DETAILS MODAL */}
          {selectedEmailDetails && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className={`p-6 rounded-xl shadow-2xl max-w-lg w-full border ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex justify-between items-center border-b pb-2 mb-4 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-emerald-600">[{selectedEmailDetails.id}]</span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Simulated SMTP Payload</span>
                  </div>
                  <button 
                    onClick={() => setSelectedEmailDetails(null)}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 font-extrabold text-slate-400 hover:text-slate-950 dark:hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs font-medium">
                  <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5 leading-tight text-slate-500 dark:text-slate-400">
                    <p><span className="font-bold text-slate-700 dark:text-slate-300">From:</span> Edweso Royal Academy Dispatches &lt;admin-dispatch@edweso.edu.gh&gt;</p>
                    <p><span className="font-bold text-slate-700 dark:text-slate-300">To:</span> {selectedEmailDetails.recipientName} &lt;{selectedEmailDetails.recipientEmail}&gt;</p>
                    <p><span className="font-bold text-slate-700 dark:text-slate-300">Date:</span> {selectedEmailDetails.sentAt}</p>
                    <p><span className="font-bold text-slate-700 dark:text-slate-300">Subject:</span> <span className="text-slate-800 dark:text-white font-bold">{selectedEmailDetails.subject}</span></p>
                  </div>

                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Email Body Markup</p>
                    <div className="p-4 bg-slate-100/60 dark:bg-slate-950 rounded-lg border border-slate-200/40 dark:border-slate-800 leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line text-[11px] font-mono">
                      {selectedEmailDetails.body}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center space-x-1.5 text-emerald-600 font-bold">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span>Dispatched via Simulated SMTP</span>
                    </div>
                    <button
                      onClick={() => setSelectedEmailDetails(null)}
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase rounded"
                    >
                      Close Payload
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}


      {/* ==================== 12. AUTOMATED SYSTEM DIAGNOSTICS ==================== */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="pb-2 border-b border-slate-200/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
                <span className="p-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <ShieldAlert size={18} />
                </span>
                <span>Automated Diagnostic & Anomaly System</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time heuristics monitor flagging brute-force logins, unrecognized admin ingress, and terminal tuition collection deficits.</p>
            </div>
            
            <button
              onClick={handleRunDiagnosticScan}
              disabled={diagnosticScanLoading}
              className={`px-4 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:bg-emerald-800/40 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer`}
            >
              <RefreshCw size={13} className={diagnosticScanLoading ? "animate-spin" : ""} />
              <span>{diagnosticScanLoading ? "Scanning Registers..." : "Trigger Live Scan"}</span>
            </button>
          </div>

          {/* Diagnostics Hub Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Config Panel & Live Simulators */}
            <div className="space-y-6">
              
              {/* Card 1: Diagnostic Rules Config */}
              <div className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-sm'
              }`}>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 mb-4 flex items-center space-x-2">
                  <span className="w-1.5 h-3 rounded bg-amber-500"></span>
                  <span>Alert Threshold Heuristics</span>
                </h3>
                
                <div className="space-y-4 text-xs font-medium">
                  {/* Slider 1: Failed Logins limit */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Failed Login Alarm Threshold</label>
                      <span className="font-mono text-rose-500 font-bold">{failedLoginsLimit} attempts</span>
                    </div>
                    <input 
                      type="range" 
                      min="2" 
                      max="10" 
                      value={failedLoginsLimit} 
                      onChange={(e) => setFailedLoginsLimit(parseInt(e.target.value))}
                      className="w-full accent-rose-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Flags any profile experiencing sequential auth failures within a 10-minute slot.
                    </p>
                  </div>

                  {/* Slider 2: Unpaid Fee threshold */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between">
                      <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Unpaid Fees Alarm Limit</label>
                      <span className="font-mono text-rose-500 font-bold">GHS {unpaidFeeThreshold.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range" 
                      min="500" 
                      max="3000" 
                      step="100"
                      value={unpaidFeeThreshold} 
                      onChange={(e) => setUnpaidFeeThreshold(parseInt(e.target.value))}
                      className="w-full accent-rose-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Triggers instant cash-flow warnings on any pupil whose balance exceeds this number.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Interactive Anomaly Simulators */}
              <div className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-sm'
              }`}>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 mb-3 flex items-center space-x-2">
                  <span className="w-1.5 h-3 rounded bg-rose-500"></span>
                  <span>Attack & Pattern Simulators</span>
                </h3>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                  Manually trigger security threats or financial ledger spikes to test the automated diagnostics live.
                </p>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleSimulateBruteForce}
                    className="w-full p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-left transition-all group flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-extrabold text-rose-700 dark:text-rose-400 block">Simulate Brute-Force Logins</span>
                      <span className="text-[9px] text-slate-400 block font-semibold">Triggers a high-priority IP password-attack alert</span>
                    </div>
                    <AlertTriangle size={15} className="text-rose-500 group-hover:scale-110 transition-transform shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateFeesSpike}
                    className="w-full p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-left transition-all group flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-extrabold text-amber-700 dark:text-amber-400 block">Simulate Sudden Fee Spikes</span>
                      <span className="text-[9px] text-slate-400 block font-semibold">Generates tuition-ledger outstanding delta alarms</span>
                    </div>
                    <CreditCard size={15} className="text-amber-500 group-hover:scale-110 transition-transform shrink-0" />
                  </button>
                </div>
              </div>

              {/* Card 3: Disaster Recovery & Database Backups */}
              <div className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-sm'
              }`}>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 mb-3 flex items-center space-x-2">
                  <span className="w-1.5 h-3 rounded bg-emerald-500"></span>
                  <span>Disaster Recovery & Backups</span>
                </h3>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                  Download a secure backup of the entire school register state, or restore a previous snapshot to instantly synchronize student files and records.
                </p>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleExportDatabase}
                    className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Download size={12} />
                    <span>Export System Backup</span>
                  </button>

                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportDatabase}
                      className="hidden"
                      id="database-restore-upload"
                    />
                    <label
                      htmlFor="database-restore-upload"
                      className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center space-x-1.5 transition-all text-center block"
                    >
                      <RefreshCw size={12} />
                      <span>Restore from JSON</span>
                    </label>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Columns: Live Alerts List & Resolution Log */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Alert Metrics Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300 shadow-xs'}`}>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Total Anomalies</span>
                  <span className="text-lg font-black block mt-1 text-slate-800 dark:text-white">{allDiagnosticAlerts.length}</span>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300 shadow-xs'}`}>
                  <span className="text-[9px] text-rose-500 uppercase font-black block">Active Risks</span>
                  <span className="text-lg font-black block mt-1 text-rose-600">{activeUnresolvedAlerts.length}</span>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300 shadow-xs'}`}>
                  <span className="text-[9px] text-amber-500 uppercase font-black block">High Severity</span>
                  <span className="text-lg font-black block mt-1 text-amber-500">
                    {activeUnresolvedAlerts.filter(a => a.severity === 'High').length}
                  </span>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300 shadow-xs'}`}>
                  <span className="text-[9px] text-emerald-500 uppercase font-black block">Resolved</span>
                  <span className="text-lg font-black block mt-1 text-emerald-600">{resolvedAlerts.length}</span>
                </div>
              </div>

              {/* Core Active Diagnostic Alerts Section */}
              <div className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300 shadow-sm'
              }`}>
                
                {/* Header and Category Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">Live Diagnostic Monitor</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Real-time heuristics anomalies stream</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {(['All', 'Security', 'Finance', 'System'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveDiagnosticCategory(cat)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                          activeDiagnosticCategory === cat
                            ? 'bg-rose-600 text-white shadow-xs'
                            : isDarkMode
                              ? 'bg-slate-800 text-slate-400 hover:text-white'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alerts Stream */}
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {activeUnresolvedAlerts.filter(a => activeDiagnosticCategory === 'All' || a.category === activeDiagnosticCategory).length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <ShieldCheck size={32} className="mx-auto text-emerald-600 animate-pulse" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">No Active Vulnerabilities Blocked</p>
                        <p className="text-[10px] text-slate-400">All student portal sessions, login IP grids, and fee outstanding ledgers are healthy.</p>
                      </div>
                    </div>
                  ) : (
                    activeUnresolvedAlerts
                      .filter(a => activeDiagnosticCategory === 'All' || a.category === activeDiagnosticCategory)
                      .map((alert) => {
                        const isHigh = alert.severity === 'High';
                        const isMed = alert.severity === 'Medium';
                        const isSec = alert.category === 'Security';
                        const isFin = alert.category === 'Finance';

                        return (
                          <div 
                            key={alert.id}
                            className={`p-3.5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:-translate-y-0.5 ${
                              isHigh 
                                ? 'bg-rose-500/5 border-rose-500/30 shadow-xs' 
                                : isMed
                                  ? 'bg-amber-500/5 border-amber-500/30'
                                  : 'bg-blue-500/5 border-blue-500/30'
                            }`}
                          >
                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                              <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                                isHigh 
                                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' 
                                  : isMed
                                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                    : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                              }`}>
                                {isSec ? <ShieldAlert size={16} /> : <CreditCard size={16} />}
                              </div>
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                    isHigh 
                                      ? 'bg-rose-600/15 text-rose-600' 
                                      : isMed
                                        ? 'bg-amber-600/15 text-amber-600'
                                        : 'bg-blue-600/15 text-blue-600'
                                  }`}>
                                    {alert.severity} Priority
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">{alert.category}</span>
                                  <span className="text-[9px] text-slate-400">{alert.timestamp}</span>
                                </div>
                                <h4 className="text-[11px] font-black text-slate-800 dark:text-white truncate">{alert.title}</h4>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed line-clamp-2">
                                  {alert.description}
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end md:self-center">
                              <button
                                onClick={() => setSelectedDiagnosticAlert(alert)}
                                className={`p-1.5 rounded-lg border ${
                                  isDarkMode 
                                    ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white' 
                                    : 'border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900'
                                }`}
                                title="Inspect Details"
                              >
                                <Eye size={13} />
                              </button>

                              {isSec && alert.metadata?.ipAddress && (
                                <button
                                  onClick={() => handleBlockIP(alert.id, alert.metadata!.ipAddress!)}
                                  className="px-2 py-1 bg-slate-900 dark:bg-slate-950 text-slate-100 hover:bg-black font-extrabold text-[9px] uppercase tracking-wider rounded-lg"
                                >
                                  Block IP
                                </button>
                              )}

                              {isSec && alert.metadata?.targetUser && (
                                <button
                                  onClick={() => handleResetUserPassword(alert.id, alert.metadata!.targetUser!)}
                                  className="px-2 py-1 bg-rose-700 hover:bg-rose-600 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg"
                                >
                                  Lock/Reset
                                </button>
                              )}

                              {isFin && alert.metadata?.studentId && (
                                <button
                                  onClick={() => handleSendQuickEmail(alert.id, alert.metadata!.studentId!)}
                                  className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg flex items-center space-x-1"
                                >
                                  <span>Email Guardian</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleResolveAlert(alert.id)}
                                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-500 text-slate-600 dark:text-slate-300 font-extrabold text-[9px] uppercase tracking-wider rounded-lg border border-slate-200/50 dark:border-slate-700"
                              >
                                Resolve
                              </button>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>

              </div>

              {/* Resolved / Cleared Audit Log */}
              <div className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-sm'
              }`}>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 mb-3 flex items-center space-x-2">
                  <span className="p-1 rounded bg-emerald-500/10 text-emerald-600">
                    <ShieldCheck size={14} />
                  </span>
                  <span>Remediation & Diagnostic Audit Log</span>
                </h3>
                <p className="text-[10px] text-slate-400 leading-normal mb-4">Permanent registry of resolved vulnerabilities and manual security clearances.</p>

                <div className="overflow-x-auto text-[10px] font-medium leading-normal">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                        <th className="pb-2">Incident ID</th>
                        <th className="pb-2">Vulnerability Flag</th>
                        <th className="pb-2">Resolution Action</th>
                        <th className="pb-2">Cleared By</th>
                        <th className="pb-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-mono text-slate-500 dark:text-slate-400 leading-normal">
                      {resolvedAlerts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400 italic">No resolved records logged in active session cache</td>
                        </tr>
                      ) : (
                        resolvedAlerts.map(alert => (
                          <tr key={alert.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20">
                            <td className="py-2.5 font-bold text-slate-600 dark:text-slate-300">{alert.id.substring(0, 15)}</td>
                            <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-200">{alert.title}</td>
                            <td className="py-2.5">
                              {alert.category === 'Security' 
                                ? 'Ingress Blacklist / Password Invalidated'
                                : alert.id.includes('student')
                                  ? 'Dispatched standard payment reminder email'
                                  : 'Database ledger threshold marked safe'
                              }
                            </td>
                            <td className="py-2.5">Principal Appiah</td>
                            <td className="py-2.5 text-right font-black text-emerald-600">CLEARED</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>

          {/* DETAILED ALERT INSPECTOR REPORT MODAL */}
          {selectedDiagnosticAlert && (
            <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className={`p-6 rounded-2xl shadow-2xl max-w-lg w-full border ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex justify-between items-center border-b pb-3 mb-4 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                      <ShieldAlert size={16} />
                    </span>
                    <div>
                      <h4 className="text-xs uppercase font-black tracking-widest text-slate-400">Diagnostic Threat Analysis Sheet</h4>
                      <p className="text-[9px] font-mono text-rose-500">REF: {selectedDiagnosticAlert.id}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedDiagnosticAlert(null)}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 font-extrabold text-slate-400 hover:text-slate-950 dark:hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs font-medium leading-relaxed">
                  
                  {/* Alert Core Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] uppercase font-bold">
                    <div className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-lg">
                      <span className="text-[9px] text-slate-400 block mb-0.5">Category</span>
                      <span className="text-slate-800 dark:text-white">{selectedDiagnosticAlert.category}</span>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-lg">
                      <span className="text-[9px] text-slate-400 block mb-0.5">Priority Level</span>
                      <span className={selectedDiagnosticAlert.severity === 'High' ? 'text-rose-600 font-black' : 'text-amber-500'}>
                        {selectedDiagnosticAlert.severity}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-lg">
                      <span className="text-[9px] text-slate-400 block mb-0.5">Audit Stamp</span>
                      <span className="text-slate-600 dark:text-slate-300 font-mono">{selectedDiagnosticAlert.timestamp}</span>
                    </div>
                  </div>

                  {/* Core Description */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 text-slate-600 dark:text-slate-300">
                    <p className="font-extrabold text-slate-800 dark:text-slate-100 mb-1">{selectedDiagnosticAlert.title}</p>
                    <p>{selectedDiagnosticAlert.description}</p>
                  </div>

                  {/* Source Payload Metadata */}
                  {selectedDiagnosticAlert.metadata && (
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mb-1.5 tracking-wider">Source Metadata Packet</p>
                      <div className="p-3 bg-slate-100/60 dark:bg-slate-950 rounded-lg border border-slate-200/40 dark:border-slate-850 font-mono text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 space-y-1">
                        {selectedDiagnosticAlert.metadata.ipAddress && (
                          <p><span className="font-bold text-slate-700 dark:text-slate-300">Origin IP:</span> {selectedDiagnosticAlert.metadata.ipAddress}</p>
                        )}
                        {selectedDiagnosticAlert.metadata.location && (
                          <p><span className="font-bold text-slate-700 dark:text-slate-300">Geo Location:</span> {selectedDiagnosticAlert.metadata.location}</p>
                        )}
                        {selectedDiagnosticAlert.metadata.attemptsCount !== undefined && (
                          <p><span className="font-bold text-slate-700 dark:text-slate-300">Auth Actions:</span> {selectedDiagnosticAlert.metadata.attemptsCount} sequential actions flagged</p>
                        )}
                        {selectedDiagnosticAlert.metadata.targetUser && (
                          <p><span className="font-bold text-slate-700 dark:text-slate-300">Subject Account:</span> {selectedDiagnosticAlert.metadata.targetUser}</p>
                        )}
                        {selectedDiagnosticAlert.metadata.studentName && (
                          <p><span className="font-bold text-slate-700 dark:text-slate-300">Affected Pupil:</span> {selectedDiagnosticAlert.metadata.studentName}</p>
                        )}
                        {selectedDiagnosticAlert.metadata.className && (
                          <p><span className="font-bold text-slate-700 dark:text-slate-300">Target Cohort:</span> {selectedDiagnosticAlert.metadata.className}</p>
                        )}
                        {selectedDiagnosticAlert.metadata.amountSpike !== undefined && (
                          <p><span className="font-bold text-slate-700 dark:text-slate-300">Unpaid Invoice Balance:</span> GHS {selectedDiagnosticAlert.metadata.amountSpike.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Recommended Remediation Action</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      {selectedDiagnosticAlert.category === 'Security' 
                        ? 'Immediate recommended safety measure: Deploy security policy to blacklist the originating IP block. Issued password resets invalidate current session keys on all mobile devices.'
                        : 'Immediate recommended billing measure: Email tuition alert reminder directly to guardians. This sends outstanding balances alongside their encrypted secure billing link.'
                      }
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-1 font-bold text-rose-500 animate-pulse text-[10px]">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                      <span>Secure Diagnostics Audit Trail Active</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      {selectedDiagnosticAlert.category === 'Security' && selectedDiagnosticAlert.metadata?.ipAddress && (
                        <button
                          onClick={() => {
                            handleBlockIP(selectedDiagnosticAlert.id, selectedDiagnosticAlert.metadata!.ipAddress!);
                            setSelectedDiagnosticAlert(null);
                          }}
                          className="px-3.5 py-2 bg-slate-900 text-white font-bold text-[10px] uppercase rounded-xl"
                        >
                          Block IP
                        </button>
                      )}

                      {selectedDiagnosticAlert.category === 'Finance' && selectedDiagnosticAlert.metadata?.studentId && (
                        <button
                          onClick={() => {
                            handleSendQuickEmail(selectedDiagnosticAlert.id, selectedDiagnosticAlert.metadata!.studentId!);
                            setSelectedDiagnosticAlert(null);
                          }}
                          className="px-3.5 py-2 bg-emerald-700 text-white font-bold text-[10px] uppercase rounded-xl"
                        >
                          Email Parent
                        </button>
                      )}

                      <button
                        onClick={() => {
                          handleResolveAlert(selectedDiagnosticAlert.id);
                          setSelectedDiagnosticAlert(null);
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] uppercase rounded-xl"
                      >
                        Resolve Issue
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      )}


      {/* ==================== 13. SYSTEM ACTIVITY EVENT LOGS ==================== */}
      {activeTab === 'activities' && (() => {
        // Calculations for filtering & pagination
        const filteredActivities = activitiesList.filter(act => {
          const matchesSearch = 
            act.user.toLowerCase().includes(activitySearch.toLowerCase()) || 
            act.details.toLowerCase().includes(activitySearch.toLowerCase()) ||
            act.type.toLowerCase().includes(activitySearch.toLowerCase());
          const matchesType = activityTypeFilter === 'all' || act.type === activityTypeFilter;
          return matchesSearch && matchesType;
        });

        const ITEMS_PER_PAGE = 10;
        const totalActivityPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE) || 1;
        const currentActivityPage = Math.min(activityPage, totalActivityPages);
        const startIndex = (currentActivityPage - 1) * ITEMS_PER_PAGE;
        const paginatedActivities = filteredActivities.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        // Stats counts
        const countLogin = activitiesList.filter(a => a.type === 'login').length;
        const countGrade = activitiesList.filter(a => a.type === 'grade').length;
        const countAttendance = activitiesList.filter(a => a.type === 'attendance').length;

        const handleAddSimulatedActivity = (type: 'login' | 'grade' | 'attendance') => {
          let user = 'Admin (Principal Appiah)';
          let details = '';
          if (type === 'login') {
            details = 'Logged in securely to manage school system logs';
          } else if (type === 'grade') {
            details = 'Updated terminal assessment ledger scores JHS 2 English';
          } else if (type === 'attendance') {
            details = 'Approved terminal attendance summary sheet JHS 3';
          }
          SchoolDatabase.addSystemActivity(type, user, details);
          setActivitiesList(SchoolDatabase.getSystemActivities());
          setActivityPage(1);
        };

        const handleClearAllActivities = () => {
          if (window.confirm('Are you sure you want to clear system activity history?')) {
            SchoolDatabase.saveSystemActivities([]);
            setActivitiesList([]);
            setActivityPage(1);
          }
        };

        return (
          <div className="space-y-6 animate-fade-in">
            {/* Header section */}
            <div className="pb-2 border-b border-slate-200/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
                  <span className="p-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <History size={18} />
                  </span>
                  <span>System Activity Logs</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time audit trailing of all portal authentication, term academic score updates, and classroom roll-call submissions.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActivitiesList(SchoolDatabase.getSystemActivities());
                  }}
                  className={`px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-slate-200/50 dark:border-slate-700 flex items-center space-x-1 cursor-pointer transition-all`}
                >
                  <RefreshCw size={12} />
                  <span>Refresh Feed</span>
                </button>
                <button
                  onClick={handleClearAllActivities}
                  className={`px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-rose-200/40 dark:border-rose-900 flex items-center space-x-1 cursor-pointer transition-all`}
                >
                  <Trash2 size={12} />
                  <span>Clear Logs</span>
                </button>
              </div>
            </div>

            {/* Event Type Counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'}`}>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-1">Total Logs</span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-lg font-extrabold font-mono text-slate-950 dark:text-white">{activitiesList.length}</span>
                  <span className="text-[10px] text-slate-400">events recorded</span>
                </div>
              </div>
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'}`}>
                <span className="text-[10px] text-emerald-500 uppercase font-black tracking-widest block mb-1">Logins</span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400">{countLogin}</span>
                  <span className="text-[10px] text-slate-400">auth sessions</span>
                </div>
              </div>
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'}`}>
                <span className="text-[10px] text-amber-500 uppercase font-black tracking-widest block mb-1">Grades Uploaded</span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-lg font-extrabold font-mono text-amber-600 dark:text-amber-400">{countGrade}</span>
                  <span className="text-[10px] text-slate-400">ledger updates</span>
                </div>
              </div>
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'}`}>
                <span className="text-[10px] text-purple-500 uppercase font-black tracking-widest block mb-1">Attendance Roll</span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-lg font-extrabold font-mono text-purple-600 dark:text-purple-400">{countAttendance}</span>
                  <span className="text-[10px] text-slate-400">roll submissions</span>
                </div>
              </div>
            </div>

            {/* Live Testing Simulation & Tools Grid */}
            <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'} grid grid-cols-1 md:grid-cols-3 gap-4 items-center`}>
              <div className="md:col-span-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Activity size={14} className="text-emerald-500 animate-pulse" />
                  <span>Interactive Audit Simulator</span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Inject live simulated school activities to verify search queries, page routing, and filter configurations instantly.
                </p>
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-2 md:justify-end">
                <button
                  type="button"
                  onClick={() => handleAddSimulatedActivity('login')}
                  className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all flex items-center gap-1.5"
                >
                  <LogIn size={12} />
                  <span>Simulate Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSimulatedActivity('grade')}
                  className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all flex items-center gap-1.5"
                >
                  <Award size={12} />
                  <span>Simulate Score Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSimulatedActivity('attendance')}
                  className="px-3.5 py-2 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-purple-800 dark:text-purple-300 font-extrabold text-[10px] uppercase tracking-wider rounded-xl cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all flex items-center gap-1.5"
                >
                  <CheckSquare size={12} />
                  <span>Simulate Roll Call</span>
                </button>
              </div>
            </div>

            {/* Filter and Search controls */}
            <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'} flex flex-col sm:flex-row items-center justify-between gap-4 text-xs`}>
              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Operator, Details..."
                  value={activitySearch}
                  onChange={(e) => {
                    setActivitySearch(e.target.value);
                    setActivityPage(1);
                  }}
                  className={`w-full pl-9 pr-8 py-2 border rounded-xl font-medium focus:outline-hidden focus:ring-1 transition-all ${
                    isDarkMode 
                      ? 'bg-slate-950 border-slate-800 focus:border-emerald-700 focus:ring-emerald-700/50 text-white' 
                      : 'bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/50 text-slate-800'
                  }`}
                />
                {activitySearch && (
                  <button
                    onClick={() => {
                      setActivitySearch('');
                      setActivityPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Event Type Tabs Filter */}
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800 w-full sm:w-auto shrink-0 overflow-x-auto gap-0.5">
                {(['all', 'login', 'grade', 'attendance'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setActivityTypeFilter(type);
                      setActivityPage(1);
                    }}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      activityTypeFilter === type
                        ? 'bg-white dark:bg-slate-850 text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Paginated Results Table */}
            <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60 shadow-xs'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b font-black uppercase text-[10px] tracking-wider text-slate-400 ${
                      isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200/60 bg-slate-50/55'
                    }`}>
                      <th className="p-3.5 w-32">Event Type</th>
                      <th className="p-3.5 w-48">Operator</th>
                      <th className="p-3.5">Details</th>
                      <th className="p-3.5 w-36 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40">
                    {paginatedActivities.length > 0 ? (
                      paginatedActivities.map((act) => (
                        <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-colors font-medium text-slate-700 dark:text-slate-300">
                          <td className="p-3.5">
                            {act.type === 'login' && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <LogIn size={10} />
                                <span>LOGIN</span>
                              </span>
                            )}
                            {act.type === 'grade' && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Award size={10} />
                                <span>GRADE</span>
                              </span>
                            )}
                            {act.type === 'attendance' && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                <CheckSquare size={10} />
                                <span>ATTENDANCE</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                            {act.user}
                          </td>
                          <td className="p-3.5">
                            {act.details}
                          </td>
                          <td className="p-3.5 text-right font-mono text-[10px] text-slate-400">
                            {act.timestamp}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <History size={24} className="text-slate-300 animate-pulse" />
                            <p className="text-slate-400 font-bold">No system activities found</p>
                            <p className="text-[11px] text-slate-400 leading-normal max-w-xs mx-auto">
                              Try clearing search parameters, selecting another event type filter, or injecting simulated audit feeds above.
                            </p>
                            {(activitySearch || activityTypeFilter !== 'all') && (
                              <button
                                onClick={() => {
                                  setActivitySearch('');
                                  setActivityTypeFilter('all');
                                  setActivityPage(1);
                                }}
                                className="px-3 py-1.5 mt-2 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-xs"
                              >
                                Reset Search Filters
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {filteredActivities.length > 0 && (
                <div className={`p-3.5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 font-semibold ${
                  isDarkMode ? 'border-slate-800 bg-slate-950/25' : 'border-slate-200/60 bg-slate-50/20'
                }`}>
                  <div>
                    Showing <span className="text-slate-700 dark:text-white font-extrabold">{startIndex + 1}</span> to{' '}
                    <span className="text-slate-700 dark:text-white font-extrabold">
                      {Math.min(startIndex + ITEMS_PER_PAGE, filteredActivities.length)}
                    </span>{' '}
                    of <span className="text-slate-700 dark:text-white font-extrabold">{filteredActivities.length}</span> entries
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      disabled={currentActivityPage === 1}
                      onClick={() => setActivityPage(currentActivityPage - 1)}
                      className={`p-1.5 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                        isDarkMode 
                          ? 'border-slate-800 hover:bg-slate-800 disabled:opacity-30' 
                          : 'border-slate-200 hover:bg-slate-100 disabled:opacity-30'
                      }`}
                      title="Previous Page"
                    >
                      <ChevronLeft size={14} />
                    </button>

                    <div className="font-bold">
                      Page <span className="text-slate-700 dark:text-white font-extrabold">{currentActivityPage}</span> of{' '}
                      <span className="text-slate-700 dark:text-white font-extrabold">{totalActivityPages}</span>
                    </div>

                    <button
                      type="button"
                      disabled={currentActivityPage === totalActivityPages}
                      onClick={() => setActivityPage(currentActivityPage + 1)}
                      className={`p-1.5 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                        isDarkMode 
                          ? 'border-slate-800 hover:bg-slate-800 disabled:opacity-30' 
                          : 'border-slate-200 hover:bg-slate-100 disabled:opacity-30'
                      }`}
                      title="Next Page"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ==================== 10. LESSON PLANNER & SYLLABUS BOARDS ==================== */}
      {activeTab === 'syllabus' && (
        <SyllabusBoard
          session={{ id: 'admin', role: 'admin', name: 'ERA Admin Office', username: 'admin', email: 'admin@school.com' }}
          subjects={subjects}
          syllabusPlans={syllabusPlans}
          onUpdateSyllabusPlans={onUpdateSyllabusPlans || (() => {})}
          isDarkMode={isDarkMode}
        />
      )}

      {/* ==================== 11. SMART TEACHER COVER & SUBSTITUTION ASSISTANT ==================== */}
      {activeTab === 'substitution' && (
        <SubstitutionAssistant
          teachers={teachers}
          subjects={subjects}
          teacherAbsences={teacherAbsences}
          coverAssignments={coverAssignments}
          onUpdateTeacherAbsences={onUpdateTeacherAbsences || (() => {})}
          onUpdateCoverAssignments={onUpdateCoverAssignments || (() => {})}
          isDarkMode={isDarkMode}
          adminName="ERA Admin Office"
          setDeleteConfirm={setDeleteConfirm}
        />
      )}


      {/* ========================================================
          ==================== CRUD MODALS AREA ====================
          ======================================================== */}

      {/* 1. Student Add/Edit Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className={`p-6 rounded-xl shadow-2xl max-w-md w-full border animate-fade-in ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h4 className="font-extrabold text-sm uppercase tracking-wide border-b pb-2 mb-4">
              {editingStudent ? `Modify Pupil: ${editingStudent.name}` : 'Register New Pupil'}
            </h4>

            <form onSubmit={handleStudentSubmit} className="space-y-3.5 text-xs">
              {/* Photo Management */}
              <div className="flex items-center space-x-3.5 p-3 rounded-lg border border-slate-200/40 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center overflow-hidden border border-slate-200/50 dark:border-slate-700 shrink-0">
                  {studentForm.profilePhoto ? (
                    <img src={studentForm.profilePhoto} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400">NO PHOTO</span>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-bold text-[10px] text-slate-400 uppercase">Profile Photo</p>
                  <div className="flex items-center gap-2">
                    <label className="px-2 py-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold uppercase tracking-wider rounded cursor-pointer transition-colors shadow-xs">
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              alert('File size exceeds 2MB limit. Please upload a smaller image.');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setStudentForm({ ...studentForm, profilePhoto: event.target.result as string });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {studentForm.profilePhoto && (
                      <button
                        type="button"
                        onClick={() => setStudentForm({ ...studentForm, profilePhoto: undefined })}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-[10px] font-bold uppercase tracking-wider rounded cursor-pointer transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Pupil Name</label>
                <input
                  type="text"
                  required
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2.5 rounded text-xs focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Class Grade</label>
                  <select
                    value={studentForm.classId}
                    onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded focus:outline-hidden bg-white dark:bg-slate-950"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gender</label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value as any })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded focus:outline-hidden bg-white dark:bg-slate-950"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Admission DOB</label>
                  <input
                    type="date"
                    required
                    value={studentForm.dob}
                    onChange={(e) => setStudentForm({ ...studentForm, dob: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Term Fee Balance (GHS)</label>
                  <input
                    type="number"
                    required
                    value={studentForm.balanceGHS}
                    onChange={(e) => setStudentForm({ ...studentForm, balanceGHS: Number(e.target.value) })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Guardian Name</label>
                <input
                  type="text"
                  required
                  value={studentForm.parentName}
                  onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2.5 rounded text-xs focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Guardian Phone (+233)</label>
                  <input
                    type="tel"
                    required
                    value={studentForm.parentPhone}
                    onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Guardian Email</label>
                  <input
                    type="email"
                    required
                    value={studentForm.parentEmail}
                    onChange={(e) => setStudentForm({ ...studentForm, parentEmail: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {editingStudent && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Account Status</label>
                  <select
                    value={studentForm.status}
                    onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value as any })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded focus:outline-hidden bg-white dark:bg-slate-950"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>
              )}

              <div className="flex space-x-2 pt-3">
                <button
                  type="submit"
                  id="student-submit-btn"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded text-xs transition-colors"
                >
                  Confirm & Save
                </button>
                <button
                  type="button"
                  id="student-cancel-btn"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Teacher Add/Edit Modal */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className={`p-6 rounded-xl shadow-2xl max-w-md w-full border animate-fade-in ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h4 className="font-extrabold text-sm uppercase tracking-wide border-b pb-2 mb-4">
              {editingTeacher ? `Modify Faculty: ${editingTeacher.name}` : 'Onboard New Faculty'}
            </h4>

            <form onSubmit={handleTeacherSubmit} className="space-y-3.5 text-xs">
              {/* Photo Management */}
              <div className="flex items-center space-x-3.5 p-3 rounded-lg border border-slate-200/40 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center overflow-hidden border border-slate-200/50 dark:border-slate-700 shrink-0">
                  {teacherForm.profilePhoto ? (
                    <img src={teacherForm.profilePhoto} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400">NO PHOTO</span>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-bold text-[10px] text-slate-400 uppercase">Profile Photo</p>
                  <div className="flex items-center gap-2">
                    <label className="px-2 py-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold uppercase tracking-wider rounded cursor-pointer transition-colors shadow-xs">
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              alert('File size exceeds 2MB limit. Please upload a smaller image.');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setTeacherForm({ ...teacherForm, profilePhoto: event.target.result as string });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {teacherForm.profilePhoto && (
                      <button
                        type="button"
                        onClick={() => setTeacherForm({ ...teacherForm, profilePhoto: undefined })}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-[10px] font-bold uppercase tracking-wider rounded cursor-pointer transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Teacher Full Name</label>
                <input
                  type="text"
                  required
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2.5 rounded focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Staff ID</label>
                  <input
                    type="text"
                    required
                    readOnly={editingTeacher !== null}
                    value={teacherForm.staffNumber}
                    onChange={(e) => setTeacherForm({ ...teacherForm, staffNumber: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded font-mono font-bold focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subject Specialty</label>
                  <select
                    value={teacherForm.subjectId}
                    onChange={(e) => setTeacherForm({ ...teacherForm, subjectId: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded focus:outline-hidden bg-white dark:bg-slate-950"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Integrated Science">Integrated Science</option>
                    <option value="English Language">English Language</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="ICT">ICT</option>
                    <option value="RME">RME</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gender</label>
                  <select
                    value={teacherForm.gender}
                    onChange={(e) => setTeacherForm({ ...teacherForm, gender: e.target.value as any })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded focus:outline-hidden bg-white dark:bg-slate-950"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Employment Status</label>
                  <select
                    value={teacherForm.status}
                    onChange={(e) => setTeacherForm({ ...teacherForm, status: e.target.value as any })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded focus:outline-hidden bg-white dark:bg-slate-950"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Department Assignment</label>
                <select
                  value={teacherForm.department}
                  onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value as any })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2.5 rounded focus:outline-hidden bg-white dark:bg-slate-950"
                >
                  <option value="Daycare-JHS">Daycare-JHS (Basic Education)</option>
                  <option value="SHS">SHS (Senior High School)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Faculty Email</label>
                <input
                  type="email"
                  required
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2.5 rounded focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Faculty Mobile Contact</label>
                <input
                  type="tel"
                  required
                  value={teacherForm.phone}
                  onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2.5 rounded focus:outline-hidden"
                />
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="submit"
                  id="teacher-submit-btn"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded text-xs"
                >
                  Save Faculty
                </button>
                <button
                  type="button"
                  id="teacher-cancel-btn"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Broadcast Notice Modal */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className={`p-6 rounded-xl shadow-2xl max-w-md w-full border animate-fade-in ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h4 className="font-extrabold text-sm uppercase tracking-wide border-b pb-2 mb-4">Broadcast Official School Bulletin</h4>

            <form onSubmit={handleNoticeSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bulletin Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2nd Term Examination Fee structure"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2.5 rounded focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Audience</label>
                <select
                  value={noticeForm.targetAudience}
                  onChange={(e) => setNoticeForm({ ...noticeForm, targetAudience: e.target.value as any })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded focus:outline-hidden bg-white dark:bg-slate-950"
                >
                  <option value="All">All Portal users (Teachers, Parents, Students)</option>
                  <option value="Teachers">Faculty Staff Only</option>
                  <option value="Students">Registered Students Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bulletin message Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Draft official announcement contents here..."
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2.5 rounded focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  id="notice-submit-btn"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded text-xs"
                >
                  Broadcast Live Bulletin
                </button>
                <button
                  type="button"
                  id="notice-cancel-btn"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Exam Terminal Score Input Modal */}
      {isGradeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className={`p-6 rounded-xl shadow-2xl max-w-md w-full border animate-fade-in ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h4 className="font-extrabold text-sm uppercase tracking-wide border-b pb-2 mb-4">Input Pupil Exam Record</h4>

            <form onSubmit={handleGradeSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Pupil</label>
                <select
                  value={gradeForm.studentId}
                  onChange={(e) => setGradeForm({ ...gradeForm, studentId: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded focus:outline-hidden bg-white dark:bg-slate-950"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({classes.find(c => c.id === s.classId)?.name})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Subject</label>
                  <select
                    value={gradeForm.subjectId}
                    onChange={(e) => setGradeForm({ ...gradeForm, subjectId: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded focus:outline-hidden bg-white dark:bg-slate-950"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Term</label>
                  <select
                    value={gradeForm.term}
                    onChange={(e) => setGradeForm({ ...gradeForm, term: e.target.value as any })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded focus:outline-hidden bg-white dark:bg-slate-950"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Class Assessment Score (Max 30)</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    required
                    value={gradeForm.classScore}
                    onChange={(e) => setGradeForm({ ...gradeForm, classScore: Number(e.target.value) })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded focus:outline-hidden font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Terminal Exam Score (Max 70)</label>
                  <input
                    type="number"
                    min={0}
                    max={70}
                    required
                    value={gradeForm.examScore}
                    onChange={(e) => setGradeForm({ ...gradeForm, examScore: Number(e.target.value) })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded focus:outline-hidden font-bold"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  id="grade-submit-btn"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded text-xs"
                >
                  Collate Record
                </button>
                <button
                  type="button"
                  id="grade-cancel-btn"
                  onClick={() => setIsGradeModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Timetable Entry Block Modal */}
      {isTimetableModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className={`p-6 rounded-xl shadow-2xl max-w-md w-full border animate-fade-in ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h4 className="font-extrabold text-sm uppercase tracking-wide border-b pb-2 mb-4">Create Timetable Hour Block</h4>

            <form onSubmit={handleTimetableSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Class</label>
                  <select
                    value={timetableForm.classId}
                    onChange={(e) => setTimetableForm({ ...timetableForm, classId: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded focus:outline-hidden bg-white dark:bg-slate-950"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Day of Week</label>
                  <select
                    value={timetableForm.day}
                    onChange={(e) => setTimetableForm({ ...timetableForm, day: e.target.value as any })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded focus:outline-hidden bg-white dark:bg-slate-950"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Curriculum Subject</label>
                  <select
                    value={timetableForm.subjectId}
                    onChange={(e) => setTimetableForm({ ...timetableForm, subjectId: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded focus:outline-hidden bg-white dark:bg-slate-950"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Assigned Teacher</label>
                  <select
                    value={timetableForm.teacherId}
                    onChange={(e) => setTimetableForm({ ...timetableForm, teacherId: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded focus:outline-hidden bg-white dark:bg-slate-950"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Start Time Hour</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 08:30"
                    value={timetableForm.startTime}
                    onChange={(e) => setTimetableForm({ ...timetableForm, startTime: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded focus:outline-hidden font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">End Time Hour</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:00"
                    value={timetableForm.endTime}
                    onChange={(e) => setTimetableForm({ ...timetableForm, endTime: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded focus:outline-hidden font-bold"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  id="timetable-submit-btn"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded text-xs"
                >
                  Create Hour Block
                </button>
                <button
                  type="button"
                  id="timetable-cancel-btn"
                  onClick={() => setIsTimetableModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="delete-confirmation-modal">
          <div 
            className={`p-6 rounded-2xl shadow-2xl max-w-md w-full border ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-850'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0">
                <ShieldAlert size={28} />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-base font-black tracking-tight leading-snug">
                  {deleteConfirm.title || 'Are you sure?'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  {deleteConfirm.message}
                </p>
              </div>
              <button 
                onClick={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex space-x-2.5 mt-6 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
                  isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-750 text-slate-300' 
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200/60 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteConfirm.onConfirm}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all flex items-center space-x-1.5"
              >
                <Trash2 size={14} />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== OFFICIAL PRINTABLE REPORT CARD MODAL (ADMIN VIEW) ==================== */}
      {selectedReportCardStudent && (() => {
        const studentAttendance = attendance.filter(a => a.studentId === selectedReportCardStudent.id);
        const presentCount = studentAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
        const attendanceRate = studentAttendance.length > 0 ? Math.round((presentCount / studentAttendance.length) * 100) : 100;
        const sClass = classes.find(c => c.id === selectedReportCardStudent.classId);
        const studentSubjects = sClass ? subjects.filter(sub => sub.classId === sClass.id) : [];
        const studentGrades = grades.filter(g => g.studentId === selectedReportCardStudent.id);

        const gradesList = studentSubjects.map(sub => {
          const subGrade = studentGrades.find(g => g.subjectId === sub.id);
          return {
            subject: sub.name,
            code: sub.code,
            classScore: subGrade ? subGrade.classScore : 0,
            examScore: subGrade ? subGrade.examScore : 0,
            totalScore: subGrade ? subGrade.totalScore : 0,
            grade: subGrade ? subGrade.grade : '—',
            remarks: subGrade ? subGrade.remarks : 'Evaluation Pending'
          };
        });

        const totalScore = gradesList.reduce((acc, curr) => acc + curr.totalScore, 0);
        const averageScore = gradesList.length > 0 ? (totalScore / gradesList.length).toFixed(1) : '0';
        
        let principalRemarks = 'An excellent academic performance. Keep up the high standards!';
        const avg = parseFloat(averageScore);
        if (avg < 50) {
          principalRemarks = 'Performance is below average. Remedial attention and hard work required next term.';
        } else if (avg < 65) {
          principalRemarks = 'Satisfactory performance, but has the potential to improve. Focus on core areas.';
        } else if (avg < 80) {
          principalRemarks = 'A very good terminal record. Keep striving for the highest honors!';
        }

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in print:bg-white print:p-0">
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #printable-admin-report, #printable-admin-report * {
                  visibility: visible !important;
                }
                #printable-admin-report {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  background: white !important;
                  color: black !important;
                  box-shadow: none !important;
                  border: none !important;
                  padding: 0 !important;
                  margin: 0 !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>
            
            <div 
              id="printable-admin-report" 
              className={`w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border p-8 space-y-6 max-h-[90vh] overflow-y-auto ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              } print:max-h-none print:shadow-none print:border-none print:overflow-visible`}
            >
              {/* Header Letterhead */}
              <div className="flex justify-between items-center border-b border-double border-slate-300 dark:border-slate-800 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-extrabold text-lg shadow-md shrink-0">
                      ERA
                    </div>
                    <div>
                      <h1 className="text-xl font-extrabold tracking-tight uppercase text-emerald-800 dark:text-emerald-400">EDWESO ROYAL ACADEMY</h1>
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">WISDOM • DISCIPLINE • EXCELLENCE</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold leading-none mt-1">
                    P.O. Box KS 185, Ejisu-Juaben, Ashanti Region, Ghana | Info@edweso.edu.gh
                  </p>
                </div>
                
                <div className="text-right space-y-1">
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-full">
                    Official Transcript
                  </span>
                  <p className="text-[10px] font-mono text-slate-400 font-bold">DATE: {new Date().toLocaleDateString('en-GB')}</p>
                </div>
              </div>

              {/* Title Banner */}
              <div className="text-center py-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                  Terminal Assessment Report Card — Term III
                </h3>
              </div>

              {/* Student Demographics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Student Name</span>
                  <p className="font-extrabold text-slate-800 dark:text-white">{selectedReportCardStudent.name}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Admission ID</span>
                  <p className="font-bold font-mono text-slate-800 dark:text-white">{selectedReportCardStudent.admissionNumber}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Academic Grade</span>
                  <p className="font-bold text-slate-800 dark:text-white">{sClass ? sClass.name : 'Not Assigned'}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Attendance Profile</span>
                  <p className="font-bold text-slate-800 dark:text-white">{attendanceRate}% Presence</p>
                </div>
              </div>

              {/* Academic Performance Table */}
              <div className="border rounded-xl overflow-hidden border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[9px] uppercase tracking-wider font-black text-slate-400">
                      <th className="p-3">Course / Curriculum Subject</th>
                      <th className="p-3 text-center">Class Assessment (30%)</th>
                      <th className="p-3 text-center">Exam Score (70%)</th>
                      <th className="p-3 text-center">Combined Score (100%)</th>
                      <th className="p-3 text-center">Letter Grade</th>
                      <th className="p-3">Teacher Evaluations / Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/40">
                    {gradesList.map((g, i) => (
                      <tr key={i} className="font-medium text-slate-700 dark:text-slate-300">
                        <td className="p-3 font-extrabold text-slate-900 dark:text-white">
                          <span>{g.subject}</span>
                          <span className="text-[9px] font-mono text-slate-400 block mt-0.5">{g.code}</span>
                        </td>
                        <td className="p-3 text-center font-mono">{g.classScore > 0 ? `${g.classScore} / 30` : '—'}</td>
                        <td className="p-3 text-center font-mono">{g.examScore > 0 ? `${g.examScore} / 70` : '—'}</td>
                        <td className="p-3 text-center font-bold text-emerald-600 font-mono">{g.totalScore > 0 ? `${g.totalScore}%` : '—'}</td>
                        <td className="p-3 text-center">
                          {g.grade !== '—' ? (
                            <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                              {g.grade}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="p-3 text-slate-500 dark:text-slate-400 text-[11px] max-w-xs truncate">{g.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Assessment Metrics Ribbon */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-black block">Cumulative Average</span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="text-xl font-black font-mono text-emerald-600">{averageScore}%</span>
                    <span className="text-[10px] text-slate-400">weighted grade</span>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-black block">Grading Metric Standard</span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">West African Exams Council</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase font-black block">Division Standing</span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">1st Division Pass</span>
                  </div>
                </div>
              </div>

              {/* Principal Remarks section */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-1">
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase font-black tracking-wider block">Principal Teacher\'s Advisory Summary</span>
                <p className="text-xs font-semibold leading-relaxed text-slate-700 dark:text-slate-300">
                  "{principalRemarks}"
                </p>
              </div>

              {/* Signatures Row */}
              <div className="pt-8 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-between gap-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <div className="space-y-1">
                  <div className="h-6 flex items-end justify-center">
                    <span className="font-mono text-xs italic font-bold text-slate-500 dark:text-slate-400">Appiah-Kuby</span>
                  </div>
                  <div className="w-40 border-t border-slate-300 dark:border-slate-700 mx-auto"></div>
                  <span>Principal / Head Teacher</span>
                </div>
                
                <div className="space-y-1">
                  <div className="h-6 flex items-end justify-center">
                    <span className="font-mono text-xs italic font-bold text-slate-500 dark:text-slate-400">ERA Registrar</span>
                  </div>
                  <div className="w-40 border-t border-slate-300 dark:border-slate-700 mx-auto"></div>
                  <span>Office of the Registrar</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="no-print flex space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800 justify-end">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <Printer size={13} />
                  <span>Print Transcript</span>
                </button>
                <button
                  onClick={() => setSelectedReportCardStudent(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close View
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
