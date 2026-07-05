import React, { useState } from 'react';
import { 
  BookOpen, CheckSquare, Award, Megaphone, Plus, 
  Trash2, Search, Check, X, Clock, HelpCircle, ShieldAlert,
  Edit, Save, FileText, Sunrise, Send, Calendar, Mail, Phone, Users, User,
  Camera, Upload
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, Cell 
} from 'recharts';
import { 
  UserSession, Student, Teacher, SchoolClass, Subject, 
  Attendance, ExamGrade, Announcement, ClassNote, TimetableEntry, SimulatedEmail, SyllabusPlan
} from '../types';
import { calculateGhanaGrade, getGradeRemark } from '../mockData';
import CameraCapture from './CameraCapture';
import SyllabusBoard from './SyllabusBoard';
import { FeaturedAnnouncementsCarousel, TeachingResourcesCarousel } from './FeaturedCarouselComponents';

interface TeacherDashboardProps {
  session: UserSession;
  activeTab: string;
  students: Student[];
  teachers: Teacher[];
  classes: SchoolClass[];
  subjects: Subject[];
  attendance: Attendance[];
  grades: ExamGrade[];
  announcements: Announcement[];
  classNotes?: ClassNote[];
  timetable?: TimetableEntry[];
  syllabusPlans?: SyllabusPlan[];
  emails?: SimulatedEmail[];
  onSendEmail?: (recipientEmail: string, recipientName: string, subject: string, body: string, type: 'Announcement' | 'FeeDeadline' | 'MorningReport') => void;
  onUpdateAttendance: (att: Attendance[]) => void;
  onUpdateGrades: (g: ExamGrade[]) => void;
  onUpdateAnnouncements: (a: Announcement[]) => void;
  onUpdateClassNotes?: (notes: ClassNote[]) => void;
  onUpdateTeachers?: (teachers: Teacher[]) => void;
  onUpdateSyllabusPlans?: (updated: SyllabusPlan[]) => void;
  isDarkMode: boolean;
}

export default function TeacherDashboard({
  session,
  activeTab,
  students,
  teachers,
  classes,
  subjects,
  attendance,
  grades,
  announcements,
  classNotes = [],
  timetable = [],
  syllabusPlans = [],
  emails = [],
  onSendEmail,
  onUpdateAttendance,
  onUpdateGrades,
  onUpdateAnnouncements,
  onUpdateClassNotes,
  onUpdateTeachers,
  onUpdateSyllabusPlans,
  isDarkMode
}: TeacherDashboardProps) {

  const teacher = teachers.find(t => t.id === session.id) || teachers[0];

  // Profile Photo Upload & Capture States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleUpdatePhoto = (newPhotoUrl: string | undefined) => {
    if (onUpdateTeachers) {
      const updatedTeachers = teachers.map(t => {
        if (t.id === teacher.id) {
          return { ...t, profilePhoto: newPhotoUrl };
        }
        return t;
      });
      onUpdateTeachers(updatedTeachers);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit. Please upload a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleUpdatePhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    handleUpdatePhoto(undefined);
  };

  // Assigned classes: Mr Kwame Boateng teaches JHS 2 (c4) Mathematics
  const assignedClassId = 'c4'; // JHS 2
  const assignedClass = classes.find(c => c.id === assignedClassId);
  const classStudents = students.filter(s => s.classId === assignedClassId);
  const teacherSubjects = subjects.filter(sub => sub.classId === assignedClassId && sub.name === teacher.subjectId);

  // Compute average grades per subject dynamically for JHS 2 (c4)
  const classSubjectsList = subjects.filter(sub => sub.classId === assignedClassId);
  const subjectAverages = classSubjectsList.map(sub => {
    const subGrades = grades.filter(g => g.subjectId === sub.id);
    const count = subGrades.length;

    let avgExam = 0;
    let avgTotal = 0;
    let avgClass = 0;

    if (count > 0) {
      const sumExam = subGrades.reduce((acc, curr) => acc + curr.examScore, 0);
      const sumTotal = subGrades.reduce((acc, curr) => acc + curr.totalScore, 0);
      const sumClass = subGrades.reduce((acc, curr) => acc + curr.classScore, 0);
      avgExam = Math.round((sumExam / count) * 10) / 10;
      avgTotal = Math.round((sumTotal / count) * 10) / 10;
      avgClass = Math.round((sumClass / count) * 10) / 10;
    } else {
      // Elegant fallback baseline
      const fallbacks: { [key: string]: { exam: number, total: number, class: number } } = {
        s1: { exam: 58.2, total: 82.5, class: 24.3 }, // Maths
        s2: { exam: 51.3, total: 71.7, class: 20.4 }, // Science
        s3: { exam: 61.0, total: 86.0, class: 25.0 }, // English
        s4: { exam: 48.5, total: 68.5, class: 20.0 }, // Social Studies
        s5: { exam: 60.2, total: 85.2, class: 25.0 }, // ICT
        s6: { exam: 52.4, total: 74.4, class: 22.0 }, // RME
        s7: { exam: 50.0, total: 70.0, class: 20.0 }  // Twi/Fante
      };
      const def = fallbacks[sub.id] || { exam: 45, total: 65, class: 20 };
      avgExam = def.exam;
      avgTotal = def.total;
      avgClass = def.class;
    }

    return {
      subjectId: sub.id,
      name: sub.name,
      code: sub.code,
      'Class Assessment (Max 30)': avgClass,
      'Terminal Exam (Max 70)': avgExam,
      'Total Grade (Max 100)': avgTotal,
    };
  });

  // 1. Attendance marking states
  const [attendanceDate, setAttendanceDate] = useState('2026-07-02');
  const [localAttendance, setLocalAttendance] = useState<{ [studentId: string]: { status: 'Present' | 'Absent' | 'Late'; remarks: string } }>(() => {
    // Pre-initialize with existing attendance of today or 'Present'
    const initial: { [studentId: string]: { status: 'Present' | 'Absent' | 'Late'; remarks: string } } = {};
    students.filter(s => s.classId === assignedClassId).forEach(s => {
      const match = attendance.find(a => a.studentId === s.id && a.date === '2026-07-02');
      initial[s.id] = {
        status: match ? match.status : 'Present',
        remarks: match?.remarks || ''
      };
    });
    return initial;
  });

  // 2. Grade entry states
  const [selectedSubjectId, setSelectedSubjectId] = useState(teacherSubjects[0]?.id || 's1');
  const [localGrades, setLocalGrades] = useState<{ [studentId: string]: { classScore: number; examScore: number } }>(() => {
    const initial: { [studentId: string]: { classScore: number; examScore: number } } = {};
    students.filter(s => s.classId === assignedClassId).forEach(s => {
      const match = grades.find(g => g.studentId === s.id && g.subjectId === (teacherSubjects[0]?.id || 's1'));
      initial[s.id] = {
        classScore: match ? match.classScore : 0,
        examScore: match ? match.examScore : 0
      };
    });
    return initial;
  });

  // 3. Post Notice state
  const [isNoticeFormOpen, setIsNoticeFormOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');

  // 4. Class Notes states
  const [selectedStudentIdForNotes, setSelectedStudentIdForNotes] = useState(classStudents[0]?.id || '');
  const [noteText, setNoteText] = useState('');
  const [searchStudentNotesQuery, setSearchStudentNotesQuery] = useState('');

  const handleAddClassNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !selectedStudentIdForNotes) return;

    const newNote: ClassNote = {
      id: 'note-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      studentId: selectedStudentIdForNotes,
      teacherId: teacher.id,
      note: noteText.trim(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16) // YYYY-MM-DD HH:MM
    };

    if (onUpdateClassNotes) {
      onUpdateClassNotes([...classNotes, newNote]);
    }
    setNoteText('');
  };

  const handleDeleteClassNote = (noteId: string) => {
    if (onUpdateClassNotes) {
      onUpdateClassNotes(classNotes.filter(n => n.id !== noteId));
    }
  };

  // 5. Morning Report State
  const [selectedReportDay, setSelectedReportDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Friday');
  const [selectedReportDetail, setSelectedReportDetail] = useState<SimulatedEmail | null>(null);

  // 6. Staff Directory State
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [staffStatusFilter, setStaffStatusFilter] = useState<'All' | 'Active' | 'On Leave'>('All');
  const [staffGenderFilter, setStaffGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');
  const [selectedStaffDetail, setSelectedStaffDetail] = useState<Teacher | null>(null);

  // Calculate historical attendance rate for JHS 2 (c4)
  const classAttendanceRecords = attendance.filter(a => a.classId === assignedClassId);
  const totalClassRecords = classAttendanceRecords.length;
  const presentClassRecords = classAttendanceRecords.filter(a => a.status === 'Present' || a.status === 'Late').length;
  const historicalAttendanceRate = totalClassRecords > 0 
    ? Number(((presentClassRecords / totalClassRecords) * 100).toFixed(1)) 
    : 95.0;

  // Expected headcount for today
  const expectedHeadcount = Math.round(classStudents.length * (historicalAttendanceRate / 100));

  // Determine students who had absences or lates yesterday (using '2026-07-02' from mock data as reference)
  const yesterdayRecords = attendance.filter(a => a.classId === assignedClassId && a.date === '2026-07-02');
  const criticalStudents = classStudents.filter(student => {
    const record = yesterdayRecords.find(r => r.studentId === student.id);
    return record && (record.status === 'Absent' || record.status === 'Late');
  });

  const getDayTimetable = (dayName: string) => {
    return timetable.filter(t => t.classId === assignedClassId && t.day === dayName);
  };

  const handleDispatchMorningReport = () => {
    if (!onSendEmail) return;

    const dayTimetable = getDayTimetable(selectedReportDay);
    
    let timetableText = '';
    if (dayTimetable.length > 0) {
      dayTimetable.forEach(t => {
        const sub = subjects.find(s => s.id === t.subjectId)?.name || 'Subject';
        const teach = teachers.find(tr => tr.id === t.teacherId)?.name || 'Specialist';
        timetableText += `• ${t.startTime} - ${t.endTime}: ${sub} (Taught by ${teach})\n`;
      });
    } else {
      timetableText = 'No academic lessons scheduled for today.\n';
    }

    let attentionListText = '';
    if (criticalStudents.length > 0) {
      criticalStudents.forEach(student => {
        const record = yesterdayRecords.find(r => r.studentId === student.id)!;
        attentionListText += `• ${student.name} (${student.admissionNumber}): was ${record.status} yesterday. Reason/Remark: "${record.remarks || 'No remarks logged'}"\n  👉 Contact Parent: ${student.parentName} (${student.parentPhone})\n`;
      });
    } else {
      attentionListText = 'All students were Present in the last session. No high priority alerts.\n';
    }

    const emailBody = `Dear ${teacher.name},

Here is your automated Morning Report for Class ${assignedClass?.name || 'JHS 2'} prepared on Friday, July 3, 2026.

=== DAILY BRIEFING OVERVIEW ===
• Class: ${assignedClass?.name || 'JHS 2'} (Enrollment: ${classStudents.length} Students)
• Historical Attendance Rate: ${historicalAttendanceRate}%
• Today's Expected Headcount: ${expectedHeadcount} of ${classStudents.length} Students

=== ATTENDANCE EXPECTATIONS & WATCHLIST ===
Below are student alerts based on recent logs:
${attentionListText}
=== TODAY'S ACADEMIC TIMETABLE (${selectedReportDay.toUpperCase()}) ===
${timetableText}
=== FORM HEAD DIRECTIVES ===
1. Mark the Attendance Register: Please complete JHS 2 physical roll call before 09:30 AM in the 'Mark Attendance' portal.
2. Monitor At-Risk Pupils: Reach out to parents of pupils listed in the Watchlist if they fail to arrive.
3. Record Private Observations: Use the 'Class Notes' journal to log any behavior or academic concerns confidentially.

KNOWLEDGE • DISCIPLINE • EXCELLENCE
Edweso Royal Academy Administration Portal Dispatch`;

    onSendEmail(
      teacher.email,
      teacher.name,
      `[Morning Report] Daily Attendance Expectations & Class Insights - ${assignedClass?.name || 'JHS 2'}`,
      emailBody,
      'MorningReport'
    );

    alert(`Morning Report dispatched successfully to ${teacher.email}! You can review the dispatch log on this screen.`);
  };

  const morningReportsHistory = emails.filter(
    e => e.type === 'MorningReport' && e.recipientEmail === teacher.email
  );

  // Attendance Handlers
  const handleSetStatus = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setLocalAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleSetRemarks = (studentId: string, remarks: string) => {
    setLocalAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const submitAttendanceRegister = () => {
    // Generate new attendance list, replacing matching classId/date records
    const cleanList = attendance.filter(a => !(a.classId === assignedClassId && a.date === attendanceDate));
    
    const newRecords = (Object.entries(localAttendance) as [string, { status: 'Present' | 'Absent' | 'Late'; remarks: string }][]).map(([studentId, data], idx) => ({
      id: `at-teach-${Date.now()}-${idx}`,
      studentId,
      classId: assignedClassId,
      date: attendanceDate,
      status: data.status,
      remarks: data.remarks
    }));

    onUpdateAttendance([...cleanList, ...newRecords]);
    alert(`Roll Call ledger for ${assignedClass?.name} on ${attendanceDate} synchronized successfully!`);
  };

  // Grade Handlers
  const handleClassScoreChange = (studentId: string, value: string) => {
    const score = Math.min(30, Math.max(0, Number(value) || 0));
    setLocalGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        classScore: score
      }
    }));
  };

  const handleExamScoreChange = (studentId: string, value: string) => {
    const score = Math.min(70, Math.max(0, Number(value) || 0));
    setLocalGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        examScore: score
      }
    }));
  };

  const submitGradesRegister = () => {
    // Remove existing grades matching studentId/subjectId
    const cleanGrades = grades.filter(g => !(g.subjectId === selectedSubjectId && classStudents.some(s => s.id === g.studentId)));

    const newRecords = (Object.entries(localGrades) as [string, { classScore: number; examScore: number }][]).map(([studentId, scores], idx) => {
      const total = scores.classScore + scores.examScore;
      const gLetter = calculateGhanaGrade(total);
      return {
        id: `g-teach-${Date.now()}-${idx}`,
        studentId,
        subjectId: selectedSubjectId,
        term: 'Term 1' as const,
        classScore: scores.classScore,
        examScore: scores.examScore,
        totalScore: total,
        grade: gLetter,
        remarks: getGradeRemark(gLetter),
        date: new Date().toISOString().substring(0, 10)
      };
    });

    onUpdateGrades([...cleanGrades, ...newRecords]);
    alert('Terminal continuous assessments and exam scores dispatched successfully!');
  };

  // Post Notice Handler
  const handleNoticePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;

    const notice: Announcement = {
      id: `ann-teach-${Date.now()}`,
      title: noticeTitle,
      content: noticeContent,
      targetAudience: 'Students',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      authorRole: 'Teacher',
      authorName: teacher.name
    };

    onUpdateAnnouncements([notice, ...announcements]);
    setIsNoticeFormOpen(false);
    setNoticeTitle('');
    setNoticeContent('');
    alert('Notice broadcasted to all students in your class division!');
  };

  return (
    <div className="space-y-6">
      
      {/* ==================== 0. TEACHER PROFILE SECTION ==================== */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-fade-in" id="teacher-profile-section">
          
          {/* Main profile layout */}
          <div className={`p-6 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'
          } flex flex-col md:flex-row items-center md:items-start gap-6`}>
            
            {/* Profile Photo with upload and capture capability */}
            <div className="flex flex-col items-center gap-3 shrink-0" id="teacher-avatar-interactive-container">
              <div className="relative group w-24 h-24">
                {teacher.profilePhoto ? (
                  <img 
                    src={teacher.profilePhoto} 
                    alt={teacher.name} 
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500 shadow-md" 
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-2 border-emerald-500/20 flex items-center justify-center font-extrabold text-3xl shadow-sm">
                    {teacher.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                )}
                
                {/* Camera/Upload hover overlay */}
                <div className="absolute inset-0 bg-slate-950/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2 duration-200">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload Photo"
                    className="p-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-full shadow hover:scale-110 transition-all cursor-pointer"
                  >
                    <Upload size={12} />
                  </button>
                  <button 
                    onClick={() => setIsCameraActive(true)}
                    id="profile-camera-btn-icon"
                    title="Capture from Camera"
                    className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow hover:scale-110 transition-all cursor-pointer"
                  >
                    <Camera size={12} />
                  </button>
                  {teacher.profilePhoto && (
                    <button 
                      onClick={handleRemovePhoto}
                      title="Remove Photo"
                      className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow hover:scale-110 transition-all cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons beneath photo */}
              <div className="flex flex-col gap-1 items-center">
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-black uppercase tracking-wider bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Upload size={10} />
                    Upload
                  </button>
                  <button 
                    onClick={() => setIsCameraActive(true)}
                    id="profile-camera-btn"
                    className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Camera size={10} />
                    Camera
                  </button>
                </div>
                {teacher.profilePhoto && (
                  <button 
                    onClick={handleRemovePhoto}
                    className="text-[9px] font-bold text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Trash2 size={9} />
                    Remove photo
                  </button>
                )}
              </div>

              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {/* Active Camera Capture component */}
            {isCameraActive && (
              <CameraCapture
                onCapture={(dataUrl) => {
                  handleUpdatePhoto(dataUrl);
                  setIsCameraActive(false);
                }}
                onClose={() => setIsCameraActive(false)}
                isDarkMode={isDarkMode}
              />
            )}

            <div className="flex-1 text-center md:text-left space-y-4 w-full">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">{teacher.name}</h2>
                <span className="text-xs bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-1 rounded font-bold mt-2 inline-block">
                  Academic Faculty Member
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Staff Registration ID</p>
                  <p className="font-mono text-slate-700 dark:text-slate-300 font-bold">{teacher.staffNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Primary Discipline</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300">{teacher.subjectId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Assigned Form Division</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300">{assignedClass ? assignedClass.name : 'None'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Staff Account Status</p>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    teacher.status === 'Active' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' 
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                  }`}>
                    ● {teacher.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Official Email</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{teacher.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Telephone Contact</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{teacher.phone || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Gender Identity</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{teacher.gender}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Deck / Teaching Resources Carousel */}
          <div className="pt-2">
            <TeachingResourcesCarousel
              syllabusPlans={syllabusPlans || []}
              classNotes={classNotes || []}
            />
          </div>
        </div>
      )}

      {/* ==================== 1. ASSIGNED CLASSES ==================== */}
      {activeTab === 'classes' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex flex-col md:flex-row justify-between items-center gap-4 shadow-md">
            <div>
              <span className="text-xs bg-emerald-700/60 border border-amber-400/20 px-3 py-1 rounded-full text-amber-300 font-bold uppercase">Edweso Teacher Portal</span>
              <h2 className="text-xl sm:text-2xl font-extrabold font-sans mt-2">Shalom, {teacher.name}</h2>
              <p className="text-xs text-emerald-200">You are registered as the head Form Teacher for <strong className="text-white">{assignedClass ? assignedClass.name : 'Unknown Class'}</strong>.</p>
            </div>
            <div className="bg-emerald-900/40 border border-emerald-700 px-4 py-2.5 rounded-xl text-center shrink-0">
              <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider block">Assigned Pupils</span>
              <span className="text-lg font-extrabold text-amber-400">{classStudents.length} Students</span>
            </div>
          </div>

          {/* Simple Performance Insights Box */}
          <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <h4 className="font-extrabold text-xs uppercase tracking-wide border-b pb-3 mb-4 text-slate-900 dark:text-white">Class Academic Performance Analytics</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Overall Class Average</span>
                <span className="text-xl font-extrabold mt-1 block">81.5%</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Highest Assessment Score</span>
                <span className="text-xl font-extrabold text-emerald-600 mt-1 block">93%</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">PTA Engagement score</span>
                <span className="text-xl font-extrabold text-amber-500 mt-1 block">95% Contacted</span>
              </div>
            </div>
          </div>

          {/* Recharts Bar Chart: Subject average exam grades */}
          <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`} id="class-performance-chart-card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 mb-4 border-slate-200/40 dark:border-slate-800">
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-900 dark:text-white">Subject Performance Trends</h4>
                <p className="text-[11px] text-slate-400 font-medium">Dynamic averages computed from Class Continuous Assessments (30%) & Terminal Exams (70%).</p>
              </div>
              <div className="flex items-center space-x-3.5 mt-2 sm:mt-0 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <span className="flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>Class (30)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                  <span>Exam (70)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <span>Total (100)</span>
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={subjectAverages}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                  <XAxis 
                    dataKey="code" 
                    tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 'bold' }} 
                    stroke={isDarkMode ? '#1e293b' : '#e2e8f0'}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 'bold' }}
                    stroke={isDarkMode ? '#1e293b' : '#e2e8f0'}
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
                  />
                  <Bar 
                    dataKey="Class Assessment (Max 30)" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={16}
                  />
                  <Bar 
                    dataKey="Terminal Exam (Max 70)" 
                    fill="#6366f1" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={16}
                  />
                  <Bar 
                    dataKey="Total Grade (Max 100)" 
                    fill="#f59e0b" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap gap-y-2 justify-between items-center text-[10px] text-slate-400 font-semibold">
              <p>📍 Core Class Division: JHS 2 (West Wing)</p>
              <p className="italic text-emerald-650 dark:text-emerald-400">Values update instantly when grades are posted</p>
            </div>
          </div>

        </div>
      )}

      {/* ==================== 2. MARK ATTENDANCE ==================== */}
      {activeTab === 'attendance' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/40">
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">Form Attendance Register Book</h2>
              <p className="text-xs text-slate-400">Class: {assignedClass?.name} | Room: {assignedClass?.room}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-slate-400">Select Date:</label>
              <input
                type="date"
                id="attendance-date-select"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded text-xs focus:outline-hidden font-bold"
              />
            </div>
          </div>

          {/* List of pupils */}
          <div className={`border rounded-xl overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'}`}>
            <table id="teacher-attendance-sheet" className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b font-extrabold uppercase tracking-wider text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-950/50">
                  <th className="p-3">Student Full Name</th>
                  <th className="p-3">Admission Code</th>
                  <th className="p-3 text-center">Status Marks</th>
                  <th className="p-3">Syllabus excuse / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {classStudents.map((stud) => {
                  const state = localAttendance[stud.id] || { status: 'Present', remarks: '' };
                  return (
                    <tr key={stud.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-colors font-medium">
                      <td className="p-3 font-extrabold text-slate-900 dark:text-white">{stud.name}</td>
                      <td className="p-3 font-mono text-[10px] text-slate-400">{stud.admissionNumber}</td>
                      <td className="p-3">
                        <div className="flex justify-center items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleSetStatus(stud.id, 'Present')}
                            className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all ${
                              state.status === 'Present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(stud.id, 'Late')}
                            className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all ${
                              state.status === 'Late'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(stud.id, 'Absent')}
                            className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all ${
                              state.status === 'Absent'
                                ? 'bg-rose-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          placeholder="e.g. sick leave (Malaria)"
                          value={state.remarks}
                          onChange={(e) => handleSetRemarks(stud.id, e.target.value)}
                          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 px-2 py-1 rounded text-xs focus:outline-hidden text-slate-700 dark:text-white"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={submitAttendanceRegister}
              id="submit-attendance-btn"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs shadow-sm transition-colors"
            >
              Sync & Submit Attendance Register
            </button>
          </div>

        </div>
      )}

      {/* ==================== 3. UPLOAD GRADES ==================== */}
      {activeTab === 'grades' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/40">
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">Continuous Assessments Grade Book</h2>
              <p className="text-xs text-slate-400">Class: {assignedClass?.name} | Term 1 Collation</p>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-slate-400">Subject Specialty:</label>
              <select
                id="teacher-sub-select"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded text-xs focus:outline-hidden font-bold"
              >
                {teacherSubjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Class Grade Inputs */}
          <div className={`border rounded-xl overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/60'}`}>
            <table id="teacher-grading-sheet" className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b font-extrabold uppercase tracking-wider text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-950/50">
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Class Assessment (Max 30)</th>
                  <th className="p-3">Terminal Exam (Max 70)</th>
                  <th className="p-3">Computed Total Score</th>
                  <th className="p-3">GES Letter Grade</th>
                  <th className="p-3">Auto Remark / Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {classStudents.map((stud) => {
                  const state = localGrades[stud.id] || { classScore: 0, examScore: 0 };
                  const total = state.classScore + state.examScore;
                  const gLetter = calculateGhanaGrade(total);
                  return (
                    <tr key={stud.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-colors font-medium">
                      <td className="p-3 font-extrabold text-slate-900 dark:text-white">{stud.name}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={state.classScore || ''}
                          onChange={(e) => handleClassScoreChange(stud.id, e.target.value)}
                          className="w-20 bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 px-2.5 py-1.5 rounded text-xs focus:outline-hidden text-center font-bold font-mono"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min={0}
                          max={70}
                          value={state.examScore || ''}
                          onChange={(e) => handleExamScoreChange(stud.id, e.target.value)}
                          className="w-20 bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 px-2.5 py-1.5 rounded text-xs focus:outline-hidden text-center font-bold font-mono"
                        />
                      </td>
                      <td className="p-3 font-extrabold text-emerald-700 dark:text-emerald-400 font-mono text-center sm:text-left">
                        {total}%
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded font-mono ${
                          gLetter === 'A' || gLetter === 'B' 
                            ? 'bg-emerald-500/10 text-emerald-600' 
                            : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {gLetter}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 italic">
                        {getGradeRemark(gLetter)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={submitGradesRegister}
              id="submit-grades-btn"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs shadow-sm transition-colors"
            >
              Upload Class Grade Book
            </button>
          </div>

        </div>
      )}

      {/* ==================== CLASS NOTES ==================== */}
      {activeTab === 'notes' && (
        <div className="space-y-4 animate-fade-in" id="class-notes-section">
          <div className="pb-2 border-b border-slate-200/40">
            <h2 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">Student Private Journal</h2>
            <p className="text-xs text-slate-400">Save and manage private, secure textual observations for individual students within your assigned class ({assignedClass?.name}). These observations are kept confidential for teachers' reference.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Student Selection List */}
            <div className="lg:col-span-4 space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={searchStudentNotesQuery}
                  onChange={(e) => setSearchStudentNotesQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-hidden"
                />
              </div>

              {/* Student List */}
              <div className={`rounded-xl border divide-y overflow-y-auto max-h-[450px] ${
                isDarkMode ? 'bg-slate-900 border-slate-800 divide-slate-800' : 'bg-white border-slate-100 divide-slate-100'
              }`}>
                {classStudents
                  .filter(s => s.name.toLowerCase().includes(searchStudentNotesQuery.toLowerCase()))
                  .map((student) => {
                    const count = classNotes.filter(n => n.studentId === student.id).length;
                    const isSelected = selectedStudentIdForNotes === student.id;
                    return (
                      <button
                        key={student.id}
                        onClick={() => setSelectedStudentIdForNotes(student.id)}
                        className={`w-full text-left p-3.5 flex items-center justify-between transition-colors text-xs ${
                          isSelected 
                            ? 'bg-emerald-500/10 text-emerald-600 font-bold' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-950/40'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 font-extrabold text-slate-500 dark:text-slate-400 overflow-hidden">
                            {student.profilePhoto ? (
                              <img src={student.profilePhoto} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              student.name.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-bold">{student.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{student.admissionNumber}</p>
                          </div>
                        </div>
                        {count > 0 && (
                          <span className="bg-emerald-500/10 text-emerald-600 font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                            {count} {count === 1 ? 'note' : 'notes'}
                          </span>
                        )}
                      </button>
                    );
                  })}

                {classStudents.filter(s => s.name.toLowerCase().includes(searchStudentNotesQuery.toLowerCase())).length === 0 && (
                  <div className="p-8 text-center text-slate-400">
                    <p className="font-medium">No students match your search</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Private Journal Details & Record Form */}
            <div className="lg:col-span-8 space-y-4">
              {(() => {
                const selectedStudent = classStudents.find(s => s.id === selectedStudentIdForNotes);
                if (!selectedStudent) {
                  return (
                    <div className={`p-8 text-center rounded-xl border text-slate-400 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                    }`}>
                      <p className="font-medium">Please select a student from the list to view and manage private journals.</p>
                    </div>
                  );
                }

                const studentSpecificNotes = classNotes
                  .filter(n => n.studentId === selectedStudent.id)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                return (
                  <>
                    {/* Selected Student Information Header */}
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${
                      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                    }`}>
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 font-extrabold text-slate-500 dark:text-slate-400 overflow-hidden">
                          {selectedStudent.profilePhoto ? (
                            <img src={selectedStudent.profilePhoto} alt={selectedStudent.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            selectedStudent.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-950 dark:text-white leading-tight">{selectedStudent.name}</h3>
                          <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">
                            Roll: <span className="font-mono">{selectedStudent.admissionNumber}</span> &bull; Gender: {selectedStudent.gender}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase tracking-wide font-extrabold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded text-slate-500">
                        {assignedClass?.name} Pupil
                      </span>
                    </div>

                    {/* Compose New Observation Form */}
                    <div className={`p-5 rounded-xl border ${
                      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                    }`}>
                      <h4 className="font-bold text-xs uppercase tracking-wider mb-3 flex items-center space-x-2 text-emerald-600">
                        <FileText size={14} />
                        <span>Log New Private Observation</span>
                      </h4>
                      <form onSubmit={handleAddClassNote} className="space-y-3">
                        <textarea
                          required
                          rows={3}
                          placeholder={`Record a private observation for ${selectedStudent.name} (e.g., academic progress, behavior notes, or specific attention areas)...`}
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-3 rounded-lg text-xs leading-relaxed focus:outline-hidden text-slate-800 dark:text-slate-100"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs flex items-center space-x-2 shadow-sm transition-colors cursor-pointer"
                          >
                            <Save size={13} />
                            <span>Save Entry</span>
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Observation History */}
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-[10px] uppercase tracking-widest text-slate-400">Observation Ledger History ({studentSpecificNotes.length})</h4>
                      
                      {studentSpecificNotes.length > 0 ? (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                          {studentSpecificNotes.map((note) => (
                            <div
                              key={note.id}
                              className={`p-4 rounded-xl border flex justify-between items-start space-x-4 transition-all relative overflow-hidden ${
                                isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-100 hover:border-slate-200'
                              }`}
                            >
                              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                              <div className="space-y-2 text-xs flex-1 pl-2">
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                                  {note.note}
                                </p>
                                <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                                  <Clock size={11} />
                                  <span>Recorded at: {note.date}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteClassNote(note.id)}
                                className="p-1.5 hover:bg-red-500/10 hover:text-red-600 text-slate-400 rounded-lg transition-colors shrink-0 cursor-pointer"
                                title="Delete note"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`p-8 text-center rounded-xl border text-slate-400 ${
                          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                        }`}>
                          <p className="font-semibold text-xs">No private notes logged yet.</p>
                          <p className="text-[10px] text-slate-400 mt-1">Use the form above to record your first observational note for this student.</p>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MORNING REPORT ==================== */}
      {activeTab === 'morning-report' && (
        <div className="space-y-6 animate-fade-in" id="morning-report-section">
          {/* Header Dashboard Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg border border-emerald-700/30">
            <div className="space-y-1">
              <span className="text-[10px] bg-amber-500/10 border border-amber-400/30 px-3 py-1 rounded-full text-amber-300 font-extrabold tracking-wider uppercase inline-flex items-center space-x-1">
                <Sunrise size={11} className="animate-pulse" />
                <span>Sunrise Intelligence</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-sans leading-tight mt-1.5">JHS 2 Daily Morning Report</h2>
              <p className="text-xs text-slate-300 font-medium max-w-xl">
                Synthesize today's attendance expectations, scan critical student watchlist alerts, and automatically dispatch official briefs to your inbox.
              </p>
            </div>
            <div className="bg-emerald-950/50 border border-emerald-700/50 px-4 py-3 rounded-xl text-center shrink-0 w-full md:w-auto">
              <span className="text-[10px] text-emerald-300 uppercase font-black tracking-widest block mb-0.5">Report Date Reference</span>
              <span className="text-xs font-mono font-bold text-amber-400">Friday, July 3, 2026</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Live Briefing Preview Paper (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Day Selector and Refresh Controls */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}>
                <div>
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Select Timetable Reference Day</label>
                  <select
                    value={selectedReportDay}
                    onChange={(e) => setSelectedReportDay(e.target.value as any)}
                    className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-hidden"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday (Today)</option>
                  </select>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Form Head Headcount</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Expected: <span className="text-emerald-500 font-extrabold">{expectedHeadcount}</span> / {classStudents.length} Students
                  </p>
                </div>
              </div>

              {/* Briefing Paper Representation */}
              <div className={`rounded-xl border shadow-sm relative overflow-hidden ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}>
                {/* Paper Header Ribbon */}
                <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500"></div>
                
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Letterhead */}
                  <div className="text-center pb-5 border-b border-dashed border-slate-200/50 dark:border-slate-800">
                    <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-400">Edweso Royal Academy</h3>
                    <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-1">Daily Administrative Briefing Paper</h2>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">Prepared at: Friday 07:30 AM &bull; Status: Auto-Generated</p>
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">Form Division</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{assignedClass?.name || 'JHS 2'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">Class Head</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{teacher.name}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">Expected Attendance</span>
                      <span className="font-extrabold text-emerald-600">{historicalAttendanceRate}% Baseline</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">Scheduled Lessons</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {getDayTimetable(selectedReportDay).length} Periods
                      </span>
                    </div>
                  </div>

                  {/* Attendance Watchlist */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-600 border-b pb-1.5 flex items-center space-x-2">
                      <CheckSquare size={14} />
                      <span>Attendance Alerts & Watchlist</span>
                    </h4>
                    
                    {criticalStudents.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-bold leading-relaxed flex items-center space-x-1.5">
                          <ShieldAlert size={14} className="shrink-0" />
                          <span>The following pupils require high physical check-ins during morning assemblies:</span>
                        </p>
                        <div className="grid grid-cols-1 gap-3">
                          {criticalStudents.map((student) => {
                            const lastRecord = yesterdayRecords.find(r => r.studentId === student.id)!;
                            return (
                              <div
                                key={student.id}
                                className={`p-3.5 rounded-lg border text-xs leading-relaxed flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                                  isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200/50'
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-black text-slate-900 dark:text-white">{student.name}</span>
                                    <span className="text-[9px] font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-bold">
                                      {student.admissionNumber}
                                    </span>
                                  </div>
                                  <p className="text-slate-400 font-medium">
                                    Parent: <strong className="text-slate-600 dark:text-slate-300">{student.parentName}</strong> ({student.parentPhone})
                                  </p>
                                </div>
                                <div className="text-left sm:text-right">
                                  <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-extrabold uppercase ${
                                    lastRecord.status === 'Absent' 
                                      ? 'bg-red-500/10 text-red-600' 
                                      : 'bg-amber-500/10 text-amber-600'
                                  }`}>
                                    {lastRecord.status} Yesterday
                                  </span>
                                  {lastRecord.remarks && (
                                    <p className="text-[10px] text-slate-400 italic mt-1 font-medium max-w-[200px] line-clamp-1">
                                      "{lastRecord.remarks}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-center text-emerald-600 text-xs font-bold">
                        🎉 All class students were Present in the previous session. No high priority absences anticipated.
                      </div>
                    )}
                  </div>

                  {/* Today's Timetable Schedule */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-600 border-b pb-1.5 flex items-center space-x-2">
                      <Calendar size={14} />
                      <span>Academic Milestones for {selectedReportDay}</span>
                    </h4>
                    
                    {getDayTimetable(selectedReportDay).length > 0 ? (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {getDayTimetable(selectedReportDay).map((entry) => {
                          const subjectObj = subjects.find(s => s.id === entry.subjectId);
                          const teacherObj = teachers.find(t => t.id === entry.teacherId);
                          return (
                            <div key={entry.id} className="py-3 flex justify-between items-center text-xs">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
                                  {subjectObj?.code || 'SUB'}
                                </div>
                                <div>
                                  <p className="font-extrabold text-slate-900 dark:text-white">{subjectObj?.name || 'Subject'}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">Instructor: {teacherObj?.name || 'Specialist Staff'}</p>
                                </div>
                              </div>
                              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-bold text-slate-600 dark:text-slate-300">
                                {entry.startTime} - {entry.endTime}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 text-center text-slate-400 text-xs">
                        No academic lessons scheduled for {selectedReportDay}.
                      </div>
                    )}
                  </div>

                  {/* Operational Form Directives */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-600 border-b pb-1.5 flex items-center space-x-2">
                      <Clock size={14} />
                      <span>Form Head Operational Directives</span>
                    </h4>
                    <ul className="list-decimal list-inside space-y-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      <li>
                        <strong className="text-slate-700 dark:text-slate-300">Mark Active Roll:</strong> Sync the daily attendance register on the <strong className="text-emerald-500">Mark Attendance</strong> portal before 09:30 AM.
                      </li>
                      <li>
                        <strong className="text-slate-700 dark:text-slate-300">Parental Escalations:</strong> If any watchlist pupil is absent by second period, dispatch an inquiry or call the registered phone.
                      </li>
                      <li>
                        <strong className="text-slate-700 dark:text-slate-300">Confidential Logs:</strong> Keep track of behavioural highlights using your secure <strong className="text-emerald-500">Student Private Journal</strong> tab.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Action center and Dispatch Ledger History (4 Cols) */}
            <div className="lg:col-span-4 space-y-5">
              {/* Action Board */}
              <div className={`p-5 rounded-xl border space-y-4 ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}>
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">Dispatch Hub</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Pushing this briefing compiles the current expectations and transmits an official automated report directly to your school email (<span className="text-slate-600 dark:text-slate-300 font-bold">{teacher.email}</span>).
                </p>

                <button
                  onClick={handleDispatchMorningReport}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center justify-center space-x-2 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Send size={15} />
                  <span>Dispatch Report to Email</span>
                </button>

                <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800 space-y-1.5 text-[10px] text-slate-400 font-medium">
                  <p>&bull; Target: {teacher.name} ({teacher.email})</p>
                  <p>&bull; Channel: Simulated SMTP Client</p>
                  <p>&bull; Classification: confidential_staff_brief</p>
                </div>
              </div>

              {/* History Dispatch Logs list */}
              <div className={`p-5 rounded-xl border space-y-4 ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}>
                <div className="flex justify-between items-center border-b pb-2.5">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">Dispatch Ledger ({morningReportsHistory.length})</h4>
                  <span className="text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-extrabold">Logs</span>
                </div>

                {morningReportsHistory.length > 0 ? (
                  <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                    {morningReportsHistory.map((report) => (
                      <div
                        key={report.id}
                        onClick={() => setSelectedReportDetail(report)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all hover:border-emerald-500/40 ${
                          selectedReportDetail?.id === report.id
                            ? 'bg-emerald-500/5 border-emerald-500'
                            : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200/50 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate pr-2 max-w-[130px]">
                            Morning Report Brief
                          </span>
                          <span className="text-[8px] font-mono text-slate-400 shrink-0 font-bold">
                            {report.sentAt.split(' ')[1] || report.sentAt}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 font-medium">{report.subject}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <p className="font-medium">No reports dispatched today yet.</p>
                    <p className="text-[10px] mt-1 text-slate-400">Click "Dispatch Report to Email" above to transmit your first briefing.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Report Detail Modal / View Panel */}
          {selectedReportDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
              <div className={`w-full max-w-2xl rounded-2xl border shadow-xl flex flex-col max-h-[85vh] overflow-hidden ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'
              }`}>
                {/* Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-sm text-slate-950 dark:text-white">Simulated Email Brief Archive</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Sent on: {selectedReportDetail.sentAt} to {selectedReportDetail.recipientEmail}</p>
                  </div>
                  <button
                    onClick={() => setSelectedReportDetail(null)}
                    className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                    <p className="font-medium text-slate-400">Recipient Name: <strong className="text-slate-800 dark:text-slate-200">{selectedReportDetail.recipientName}</strong></p>
                    <p className="font-medium text-slate-400">Subject: <strong className="text-slate-800 dark:text-slate-200">{selectedReportDetail.subject}</strong></p>
                    <p className="font-medium text-slate-400">Mail System ID: <span className="font-mono text-emerald-500">{selectedReportDetail.id}</span></p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">Email Transmission Body:</h4>
                    <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl font-mono text-[11px] whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300 overflow-x-auto max-h-[300px]">
                      {selectedReportDetail.body}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => setSelectedReportDetail(null)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 font-bold rounded-lg text-xs cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    Close Log
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== STAFF DIRECTORY ==================== */}
      {activeTab === 'staff' && (
        <div className="space-y-6 animate-fade-in" id="staff-directory-section">
          {/* Header Dashboard Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg border border-emerald-700/30">
            <div className="space-y-1">
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-400/30 px-3 py-1 rounded-full text-emerald-300 font-extrabold tracking-wider uppercase inline-flex items-center space-x-1">
                <Users size={11} className="animate-pulse" />
                <span>Faculty Information System</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-sans leading-tight mt-1.5">Registered Staff Directory</h2>
              <p className="text-xs text-slate-300 font-medium max-w-xl">
                Explore, search, and connect with other educators and faculty members at Edweso Royal Academy.
              </p>
            </div>
            <div className="bg-emerald-950/50 border border-emerald-700/50 px-4 py-3 rounded-xl text-center shrink-0 w-full md:w-auto">
              <span className="text-[10px] text-emerald-300 uppercase font-black tracking-widest block mb-0.5">Total Registered Faculty</span>
              <span className="text-lg font-mono font-bold text-amber-400">{teachers.length} Active Staff</span>
            </div>
          </div>

          {/* Search and Filters panel */}
          <div className={`p-5 rounded-xl border space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search input */}
              <div className="md:col-span-6 relative">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1.5">Search Faculty</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    placeholder="Search by name, staff ID, or primary subject..."
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs font-medium focus:outline-hidden focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Status filter */}
              <div className="md:col-span-3">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1.5">Duty Status</label>
                <select
                  value={staffStatusFilter}
                  onChange={(e) => setStaffStatusFilter(e.target.value as any)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:outline-hidden"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Duty</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              {/* Gender filter */}
              <div className="md:col-span-3">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1.5">Gender</label>
                <select
                  value={staffGenderFilter}
                  onChange={(e) => setStaffGenderFilter(e.target.value as any)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold focus:outline-hidden"
                >
                  <option value="All">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* Directory Cards Grid */}
          {(() => {
            const filteredTeachers = teachers.filter(t => {
              const matchesSearch = t.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                t.staffNumber.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                (t.subjectId || '').toLowerCase().includes(staffSearchQuery.toLowerCase());
              
              const matchesStatus = staffStatusFilter === 'All' || t.status === staffStatusFilter;
              const matchesGender = staffGenderFilter === 'All' || t.gender === staffGenderFilter;

              return matchesSearch && matchesStatus && matchesGender;
            });

            if (filteredTeachers.length === 0) {
              return (
                <div className={`p-12 text-center rounded-xl border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                }`}>
                  <Users size={36} className="mx-auto text-slate-400 mb-3" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No staff members match your criteria</p>
                  <p className="text-xs text-slate-400 mt-1">Try clearing filters or adjusting your search query.</p>
                  {(staffSearchQuery || staffStatusFilter !== 'All' || staffGenderFilter !== 'All') && (
                    <button
                      onClick={() => {
                        setStaffSearchQuery('');
                        setStaffStatusFilter('All');
                        setStaffGenderFilter('All');
                      }}
                      className="mt-4 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeachers.map((t) => {
                  const managedClasses = classes.filter(c => c.teacherId === t.id);
                  const isCurrentUser = t.email === session.email;

                  return (
                    <div
                      key={t.id}
                      className={`rounded-xl border shadow-xs overflow-hidden flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-md ${
                        isDarkMode 
                          ? 'bg-slate-900 border-slate-800' 
                          : 'bg-white border-slate-100'
                      } ${isCurrentUser ? 'ring-2 ring-emerald-500/40' : ''}`}
                    >
                      <div className="p-5 space-y-4">
                        {/* Title Row */}
                        <div className="flex items-start gap-3">
                          {/* Avatar or custom photo */}
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden border border-slate-200/50 dark:border-slate-800 flex items-center justify-center">
                            {t.profilePhoto ? (
                              <img src={t.profilePhoto} alt={t.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-center font-extrabold text-sm">
                                {t.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-1 flex-1 min-w-0">
                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                              {t.name}
                              {isCurrentUser && (
                                <span className="text-[8px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-extrabold uppercase shrink-0">
                                  You
                                </span>
                              )}
                            </h3>
                            <p className="text-[10px] font-mono text-slate-400 font-bold tracking-wider">{t.staffNumber}</p>
                          </div>
                          
                          <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase shrink-0 ${
                            t.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}>
                            {t.status}
                          </span>
                        </div>

                        {/* Details Block */}
                        <div className="space-y-2 text-xs">
                          {/* Subject Spec */}
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-black text-slate-400">Primary Discipline</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {t.subjectId || 'Specialist'}
                            </span>
                          </div>

                          {/* Managed Classes */}
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-black text-slate-400">Assigned Form</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {managedClasses.length > 0 
                                ? managedClasses.map(c => c.name).join(', ') 
                                : 'None'
                              }
                            </span>
                          </div>
                        </div>

                        {/* Contact Information (Quick view) */}
                        <div className="pt-3 border-t border-slate-200/40 dark:border-slate-800 space-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <div className="flex items-center space-x-2">
                            <Mail size={13} className="text-slate-400" />
                            <span className="truncate">{t.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone size={13} className="text-slate-400" />
                            <span>{t.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className={`px-5 py-3 border-t border-slate-200/30 dark:border-slate-800/50 flex justify-between items-center ${
                        isDarkMode ? 'bg-slate-950/20' : 'bg-slate-50/50'
                      }`}>
                        <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase font-mono">
                          {t.gender} Faculty
                        </span>
                        <button
                          onClick={() => setSelectedStaffDetail(t)}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                        >
                          View Schedule & Profile
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Selected Staff Profile and Timetable Schedule Modal */}
          {selectedStaffDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
              <div className={`w-full max-w-2xl rounded-2xl border shadow-xl flex flex-col max-h-[85vh] overflow-hidden ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'
              }`}>
                {/* Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-emerald-850/5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-700/10 text-emerald-600 flex items-center justify-center font-bold text-sm">
                      {selectedStaffDetail.name.split(' ').pop()?.charAt(0) || 'F'}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-950 dark:text-white flex items-center gap-2">
                        {selectedStaffDetail.name}
                        <span className={`text-[8px] px-2 py-0.5 rounded font-extrabold uppercase ${
                          selectedStaffDetail.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-600' 
                            : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {selectedStaffDetail.status}
                        </span>
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold font-mono tracking-wider">
                        Staff ID: {selectedStaffDetail.staffNumber} &bull; Gender: {selectedStaffDetail.gender}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStaffDetail(null)}
                    className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                  {/* Grid Contact Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">Work Email Address</span>
                      <a 
                        href={`mailto:${selectedStaffDetail.email}`}
                        className="text-xs font-bold text-emerald-600 hover:underline flex items-center space-x-1.5"
                      >
                        <Mail size={12} />
                        <span>{selectedStaffDetail.email}</span>
                      </a>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">Mobile Telephone</span>
                      <a 
                        href={`tel:${selectedStaffDetail.phone}`}
                        className="text-xs font-bold text-emerald-600 hover:underline flex items-center space-x-1.5"
                      >
                        <Phone size={12} />
                        <span>{selectedStaffDetail.phone}</span>
                      </a>
                    </div>
                  </div>

                  {/* Curriculums and Taught classes */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-600 border-b pb-1.5 flex items-center space-x-2">
                      <BookOpen size={14} />
                      <span>Form Master Leadership</span>
                    </h4>
                    {(() => {
                      const managed = classes.filter(c => c.teacherId === selectedStaffDetail.id);
                      if (managed.length === 0) {
                        return <p className="text-xs text-slate-400 font-medium italic">This faculty member is not currently assigned as Form Head to any specific class group.</p>;
                      }
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {managed.map(c => (
                            <div key={c.id} className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-xs">
                              <p className="font-black text-slate-800 dark:text-slate-200">Class: {c.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Assigned Room: {c.room || 'Main Hall'}</p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Timetable Schedule from reference state */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-600 border-b pb-1.5 flex items-center space-x-2">
                      <Calendar size={14} />
                      <span>Weekly Academic Lecture Schedule</span>
                    </h4>
                    {(() => {
                      const lessons = timetable.filter(t => t.teacherId === selectedStaffDetail.id);
                      if (lessons.length === 0) {
                        return <p className="text-xs text-slate-400 font-medium italic">No classroom periods or timetabled lessons found in the database for this educator.</p>;
                      }

                      const daysOfWeek: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                      
                      return (
                        <div className="space-y-3">
                          {daysOfWeek.map(day => {
                            const dayLessons = lessons.filter(l => l.day === day);
                            if (dayLessons.length === 0) return null;

                            return (
                              <div key={day} className="space-y-2">
                                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">{day}</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {dayLessons.map(l => {
                                    const c = classes.find(cls => cls.id === l.classId);
                                    const sub = subjects.find(s => s.id === l.subjectId);
                                    return (
                                      <div 
                                        key={l.id} 
                                        className="p-3 rounded-lg border border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-between items-center text-xs"
                                      >
                                        <div>
                                          <p className="font-extrabold text-slate-800 dark:text-slate-200">{sub?.name || 'Class Subject'}</p>
                                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Grade: {c?.name || 'Assigned Division'}</p>
                                        </div>
                                        <span className="font-mono text-[9px] font-extrabold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                                          {l.startTime} - {l.endTime}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-950/20">
                  <button
                    onClick={() => setSelectedStaffDetail(null)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 font-bold rounded-lg text-xs cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    Dismiss Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== 4. ANNOUNCEMENTS ==================== */}
      {activeTab === 'announcements' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/40">
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">Broadcast Bulletin</h2>
              <p className="text-xs text-slate-400">Post an official class bulletin to parents and students.</p>
            </div>
            
            {!isNoticeFormOpen && (
              <button
                onClick={() => setIsNoticeFormOpen(true)}
                id="open-notice-form-btn"
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <Plus size={14} />
                <span>Compose Bulletin</span>
              </button>
            )}
          </div>

          {/* Featured school-wide bulletins carousel */}
          <div className="mb-6">
            <FeaturedAnnouncementsCarousel 
              announcements={announcements} 
              onDeleteNotice={onUpdateAnnouncements ? (id) => onUpdateAnnouncements(announcements.filter(a => a.id !== id)) : undefined}
              isAdmin={false}
            />
          </div>

          {/* Compose Form */}
          {isNoticeFormOpen && (
            <div className={`p-5 rounded-xl border ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <h4 className="font-extrabold text-xs uppercase tracking-wide border-b pb-2 mb-3">Compose Class Bulletin</h4>
              
              <form onSubmit={handleNoticePost} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Notice Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science projects review notice"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2.5 rounded font-bold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Notice Content Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide detailed instructions to students..."
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2.5 rounded leading-relaxed focus:outline-hidden"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    id="submit-notice-btn"
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded"
                  >
                    Broadcast Bulletin
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNoticeFormOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of Notices posted by this teacher */}
          <div className="space-y-4">
            {announcements
              .filter(a => a.authorName === teacher.name)
              .map((ann) => (
                <div key={ann.id} className={`p-4 rounded-xl border relative overflow-hidden ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                }`}>
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600"></div>
                  
                  <div className="flex justify-between items-start pl-2">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{ann.title}</h3>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-4">{ann.date}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 pl-2 mt-2 leading-relaxed whitespace-pre-line">{ann.content}</p>
                </div>
              ))}
          </div>

        </div>
      )}

      {/* ==================== DIGITAL SYLLABUS PLANNER ==================== */}
      {activeTab === 'syllabus' && (
        <div className="space-y-6 animate-fade-in">
          <TeachingResourcesCarousel
            syllabusPlans={syllabusPlans || []}
            classNotes={classNotes || []}
          />
          <SyllabusBoard
            session={session}
            subjects={subjects}
            syllabusPlans={syllabusPlans}
            onUpdateSyllabusPlans={onUpdateSyllabusPlans || (() => {})}
            isDarkMode={isDarkMode}
          />
        </div>
      )}

    </div>
  );
}
