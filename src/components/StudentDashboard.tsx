import React, { useState, useRef, useEffect } from 'react';
import { 
  User, BookOpen, Award, CheckSquare, Calendar, 
  Megaphone, CreditCard, ShieldCheck, Printer, CheckCircle, Smartphone, AlertCircle,
  History, TrendingUp, Clock, ArrowUpRight, Receipt, FileText, Sparkles,
  Camera, Upload, Trash2
} from 'lucide-react';
import { 
  UserSession, Student, Teacher, SchoolClass, Subject, 
  Attendance, ExamGrade, TimetableEntry, Announcement, 
  PaymentTransaction, SimulatedEmail, SyllabusPlan,
  HomeworkAssignment, HomeworkSubmission
} from '../types';
import PaystackModal from './PaystackModal';
import CameraCapture from './CameraCapture';
import GradeProjectionTool from './GradeProjectionTool';
import SyllabusBoard from './SyllabusBoard';
import { StudentPhotoGalleryCarousel } from './FeaturedCarouselComponents';
import StudentAssignmentsView from './StudentAssignmentsView';

interface StudentDashboardProps {
  session: UserSession;
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
  homeworkAssignments: HomeworkAssignment[];
  homeworkSubmissions: HomeworkSubmission[];
  onPaymentSuccess: (amount: number, method: string, ref: string, paystackRef: string) => void;
  onDeleteEmail?: (id: string) => void;
  onSendEmail?: (recipientEmail: string, recipientName: string, subject: string, body: string, type: 'Announcement' | 'FeeDeadline') => void;
  onUpdateStudents?: (updated: Student[]) => void;
  onUpdateSyllabusPlans?: (updated: SyllabusPlan[]) => void;
  onUpdateHomeworkSubmissions: (subs: HomeworkSubmission[]) => void;
  isDarkMode: boolean;
  onTabChange?: (tab: string) => void;
}

export default function StudentDashboard({
  session,
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
  syllabusPlans,
  homeworkAssignments,
  homeworkSubmissions,
  onPaymentSuccess,
  onDeleteEmail,
  onSendEmail,
  onUpdateStudents,
  onUpdateSyllabusPlans,
  onUpdateHomeworkSubmissions,
  isDarkMode,
  onTabChange
}: StudentDashboardProps) {

  const [isPaystackOpen, setIsPaystackOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<PaymentTransaction | null>(null);
  const [viewingEmail, setViewingEmail] = useState<SimulatedEmail | null>(null);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);

  // Profile Photo Upload & Capture States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpdatePhoto = (newPhotoUrl: string | undefined) => {
    if (onUpdateStudents) {
      const updatedStudents = students.map(s => {
        if (s.id === student.id) {
          return { ...s, profilePhoto: newPhotoUrl };
        }
        return s;
      });
      onUpdateStudents(updatedStudents);
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

  // AI Counselling States
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');

  const handleGenerateAiCounsel = async () => {
    setIsLoadingAi(true);
    setAiError('');
    setAiFeedback('');
    
    const gradesList = studentSubjects.map(sub => {
      const subGrade = studentGrades.find(g => g.subjectId === sub.id);
      return {
        subject: sub.name,
        classScore: subGrade ? subGrade.classScore : '—',
        examScore: subGrade ? subGrade.examScore : '—',
        totalScore: subGrade ? subGrade.totalScore : '—',
        grade: subGrade ? subGrade.grade : '—',
        remarks: subGrade ? subGrade.remarks : '—'
      };
    });

    try {
      const res = await fetch('/api/ai/analyze-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentName: student.name,
          gradeLevel: sClass ? sClass.name : 'Primary Grade',
          gradesList
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setAiFeedback(data.feedback);
      } else {
        setAiError(data.error || 'The system could not retrieve the AI counseling insights at this moment.');
      }
    } catch (e) {
      console.error(e);
      setAiError('Connection error: could not connect to Edweso Royal AI Counselor hub.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const renderFormattedFeedback = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-extrabold text-xs text-slate-800 dark:text-white uppercase tracking-wider mt-4 mb-2">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400 mt-5 mb-2.5">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="font-extrabold text-base text-emerald-800 dark:text-emerald-300 mt-6 mb-3">{line.replace('# ', '')}</h2>;
      }
      
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      let lastIndex = 0;
      const parts = [];
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-extrabold text-slate-900 dark:text-white">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-600 dark:text-slate-300 mb-1 leading-relaxed">
            {parts.length > 0 ? parts : line.replace(/^[-*]\s+/, '')}
          </li>
        );
      }
      return line.trim() === '' ? <div key={idx} className="h-2" /> : (
        <p key={idx} className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  // Find active student record
  const student = students.find(s => s.id === session.id) || students[0];
  const sClass = classes.find(c => c.id === student.classId);
  
  // Student Stats
  const studentGrades = grades.filter(g => g.studentId === student.id);
  const studentAttendance = attendance.filter(a => a.studentId === student.id);
  const totalDays = studentAttendance.length || 10;
  const presentDays = studentAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
  const attendanceRate = Math.round((presentDays / totalDays) * 100);

  const studentSubjects = subjects.filter(s => s.classId === student.classId);
  const studentTimetable = timetable.filter(tt => tt.classId === student.classId);
  const studentTx = transactions.filter(tx => tx.studentId === student.id);

  const handlePayClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      alert('Please enter a valid amount greater than GHS 0.00');
      return;
    }
    if (payAmount > student.balanceGHS) {
      alert(`The amount entered (GHS ${payAmount}) is greater than your current outstanding fees balance (GHS ${student.balanceGHS}).`);
      return;
    }
    setIsPaystackOpen(true);
  };

  const handlePaystackSuccess = (payDetails: { paystackRef: string; paymentMethod: string; amount: number }) => {
    setIsPaystackOpen(false);
    // Trigger parent callback to deduct balance and log transaction
    const mockRef = 'ERA-TX-' + Math.floor(Math.random() * 9000 + 1000);
    onPaymentSuccess(payDetails.amount, payDetails.paymentMethod, mockRef, payDetails.paystackRef);
    setPayAmount(0);
    alert('Payment authorized successfully! Your invoice has been generated under the history section.');
  };

  const handlePaystackFailure = (err: string) => {
    setIsPaystackOpen(false);
    alert('Payment declined: ' + err);
  };

  return (
    <div className="space-y-6">
      
      {/* ==================== 1. PROFILE SECTION ==================== */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Main profile layout */}
          <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-center md:items-start gap-6 text-slate-700">
            
            {/* Student Profile Photo component with upload and capture capability */}
            <div className="flex flex-col items-center gap-3 shrink-0" id="student-avatar-interactive-container">
              <div className="relative group w-24 h-24">
                {student.profilePhoto ? (
                  <img 
                    src={student.profilePhoto} 
                    alt={student.name} 
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 rounded-full object-cover border border-slate-200/80 shadow-sm" 
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-50 text-slate-700 border border-slate-200/80 flex items-center justify-center font-bold text-3xl shadow-xs">
                    {student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
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
                  {student.profilePhoto && (
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

              {/* Action Text Buttons beneath photo */}
              <div className="flex flex-col gap-1 items-center">
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-600 px-2 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs hover:bg-slate-50 hover:border-slate-300"
                  >
                    <Upload size={10} />
                    Upload
                  </button>
                  <button 
                    onClick={() => setIsCameraActive(true)}
                    id="profile-camera-btn"
                    className="text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-600 px-2 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs hover:bg-slate-50 hover:border-slate-300"
                  >
                    <Camera size={10} />
                    Camera
                  </button>
                </div>
                {student.profilePhoto && (
                  <button 
                    onClick={handleRemovePhoto}
                    className="text-[9px] font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-0.5 cursor-pointer"
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

            {/* Active Camera Preview Panel Overlay */}
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

            <div className="flex-1 text-center md:text-left space-y-4 text-slate-700">
              <div>
                <h2 className="text-xl font-display font-extrabold text-slate-800 leading-tight">{student.name}</h2>
                <span className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full font-bold mt-2 inline-block">
                  {sClass ? sClass.name : 'Not Enrolled'} Division
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <p className="text-slate-950 font-bold uppercase text-[10px]">Admission ID</p>
                  <p className="font-extrabold font-mono text-slate-950">{student.admissionNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-950 font-bold uppercase text-[10px]">Gender & DOB</p>
                  <p className="font-extrabold text-slate-950">{student.gender} | {student.dob}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-950 font-bold uppercase text-[10px]">Primary Guardian</p>
                  <p className="font-extrabold text-slate-950">{student.parentName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Guardian coordinates</p>
                  <p className="font-semibold text-slate-700">{student.parentPhone} | {student.parentEmail}</p>
                </div>
              </div>
            </div>

            {/* Quick Balance Status card */}
            <div className="w-full md:w-64 p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-center space-y-3 shrink-0 text-slate-600">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Fees Outstanding</span>
              <span className={`text-2xl font-bold font-mono block ${student.balanceGHS > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                GHS {student.balanceGHS.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 block font-medium leading-relaxed">
                {student.balanceGHS > 0 ? 'Please settle fees before exam week.' : 'Academic accounts fully cleared!'}
              </span>
            </div>
          </div>

          {/* Quick links summary box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-600">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Enrolled Subjects</span>
              <span className="text-lg font-bold block mt-1 text-slate-800">{studentSubjects.length} Courses</span>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-600">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Attendance Rate</span>
              <span className="text-lg font-bold block mt-1 text-slate-800">{attendanceRate}% Presence</span>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-600">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Term Grades Recorded</span>
              <span className="text-lg font-bold block mt-1 text-slate-800">{studentGrades.length} Records</span>
            </div>
          </div>

          {/* Student Photo Gallery & Profile Capture History Carousel */}
          <StudentPhotoGalleryCarousel
            currentProfilePhoto={student.profilePhoto}
            onSelectProfilePhoto={handleUpdatePhoto}
            isDarkMode={isDarkMode}
          />

        </div>
      )}

      {/* ==================== 2. MY SUBJECTS ==================== */}
      {activeTab === 'subjects' && (
        <div className="space-y-4 animate-fade-in">
          <div className="pb-2 border-b border-slate-200/40">
            <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Active Curriculum Courses</h2>
            <p className="text-xs text-slate-400">Class subjects assigned for {sClass ? sClass.name : 'Unknown'} syllabus.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentSubjects.map(sub => {
              const subTeacher = teachers.find(t => t.subjectId === sub.name);
              return (
                <div key={sub.id} className="p-4 rounded-xl border border-slate-200 bg-white flex justify-between items-center text-slate-600 shadow-sm hover:shadow-md transition-all duration-300">
                  <div>
                    <span className="text-[10px] font-semibold font-mono text-slate-400 block">{sub.code}</span>
                    <h4 className="font-bold text-sm text-slate-800 mt-1">{sub.name}</h4>
                    <p className="text-xs text-slate-500 mt-2">Specialist: <strong className="text-slate-600 font-semibold">{subTeacher ? subTeacher.name : 'Assistant Instructor'}</strong></p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <BookOpen size={20} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== MY HOMEWORK / ASSIGNMENTS ==================== */}
      {activeTab === 'assignments' && (
        <StudentAssignmentsView
          session={session}
          students={students}
          subjects={subjects}
          homeworkAssignments={homeworkAssignments}
          homeworkSubmissions={homeworkSubmissions}
          onUpdateHomeworkSubmissions={onUpdateHomeworkSubmissions}
        />
      )}

      {/* ==================== 3. GRADES OVERVIEW ==================== */}
      {activeTab === 'grades' && (
        <div className="space-y-4 animate-fade-in" id="student-grades-container">
          <div className="pb-2 border-b border-slate-200/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Terminal Grade sheet</h2>
              <p className="text-xs text-slate-400">Continuous assessments class scores (30%) & written exam scores (70%) report.</p>
            </div>
            <button
              onClick={() => setIsReportCardOpen(true)}
              className="px-3.5 py-2 bg-emerald-750 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl border border-emerald-600/30 flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs transition-all shrink-0 self-start sm:self-center"
            >
              <Printer size={13} />
              <span>Official Report Card</span>
            </button>
          </div>

          <div className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 text-slate-600">
            <table id="student-grades-table" className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 font-bold uppercase tracking-wider text-[10px] text-slate-400 bg-slate-50">
                  <th className="p-3">Subject Name</th>
                  <th className="p-3">Asses score (30%)</th>
                  <th className="p-3">Exam score (70%)</th>
                  <th className="p-3">Aggregate total</th>
                  <th className="p-3">GES Grade</th>
                  <th className="p-3">Teacher Evaluations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentSubjects.map(sub => {
                  const subGrade = studentGrades.find(g => g.subjectId === sub.id);
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/55 transition-colors text-slate-600">
                      <td className="p-3 font-bold text-slate-800">{sub.name}</td>
                      <td className="p-3 font-mono text-slate-500">{subGrade ? `${subGrade.classScore} / 30` : '—'}</td>
                      <td className="p-3 font-mono text-slate-500">{subGrade ? `${subGrade.examScore} / 70` : '—'}</td>
                      <td className="p-3 font-bold text-slate-700 font-mono">
                        {subGrade ? `${subGrade.totalScore}%` : '—'}
                      </td>
                      <td className="p-3">
                        {subGrade ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded font-mono bg-slate-100 text-slate-600 border border-slate-200">
                            {subGrade.grade}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Not Inputted</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-500">
                        {subGrade ? subGrade.remarks : <span className="text-[10px] italic text-slate-400">Evaluation pending terminal audit.</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* AI Report Card counseling component */}
          <div className="mt-6 p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-600">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Sparkles size={16} className="animate-pulse text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Edweso Royal AI Dean Hub</span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 mt-1">AI-Powered Terminal Report Evaluation</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Generate customized recommendations, study roadmaps, and counselor guidance based on your grades.</p>
              </div>
              <button 
                id="btn-generate-ai-report"
                onClick={handleGenerateAiCounsel}
                disabled={isLoadingAi}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isLoadingAi ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Generating Advice...
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    Analyze Grade Sheet
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-600 font-semibold flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
            )}

            {isLoadingAi && (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin"></div>
                  <Sparkles size={16} className="text-emerald-600 animate-bounce absolute" />
                </div>
                <p className="text-xs font-bold text-slate-500 animate-pulse">Consulting academic dean records & designing your custom study syllabus...</p>
              </div>
            )}

            {aiFeedback && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300 font-bold mb-3 border-b border-emerald-500/10 pb-1.5">
                  <Award size={14} />
                  <span>COUNSELOR EVALUATION COMPLETED</span>
                </div>
                <div className="prose prose-sm dark:prose-invert">
                  {renderFormattedFeedback(aiFeedback)}
                </div>
              </div>
            )}

            {!aiFeedback && !isLoadingAi && !aiError && (
              <div className="text-center py-6 text-slate-400 text-xs font-medium">
                Click "Analyze Grade Sheet" above to receive your personalized holiday coaching strategy.
              </div>
            )}
          </div>

          {/* 2. Interactive Academic Performance & Grade Projection Tool */}
          <GradeProjectionTool 
            student={student} 
            studentGrades={studentGrades} 
            studentSubjects={studentSubjects} 
          />

        </div>
      )}

      {/* ==================== 4. MY ATTENDANCE ==================== */}
      {activeTab === 'attendance' && (
        <div className="space-y-4 animate-fade-in">
          <div className="pb-2 border-b border-slate-200/40">
            <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Roll Call Ledger</h2>
            <p className="text-xs text-slate-400">Daily presence audit for {student.name}.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-center text-slate-600">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Days Tracked</span>
              <span className="text-xl font-bold mt-1 block text-slate-800">{totalDays} Days</span>
            </div>
            <div className="p-5 rounded-2xl text-center border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-600">
              <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">Present Marks</span>
              <span className="text-xl font-bold mt-1 block text-slate-800">{studentAttendance.filter(a => a.status === 'Present').length}</span>
            </div>
            <div className="p-5 rounded-2xl text-center border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-600">
              <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">Late Arrivals</span>
              <span className="text-xl font-bold mt-1 block text-slate-800">{studentAttendance.filter(a => a.status === 'Late').length}</span>
            </div>
            <div className="p-5 rounded-2xl text-center border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-600">
              <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">Absences Registered</span>
              <span className="text-xl font-bold mt-1 block text-slate-800">{studentAttendance.filter(a => a.status === 'Absent').length}</span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-600">
            <table id="student-attendance-table" className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 font-bold uppercase tracking-wider text-[10px] text-slate-400 bg-slate-50">
                  <th className="p-3 text-slate-400">Attendance Date</th>
                  <th className="p-3 text-slate-400">Status</th>
                  <th className="p-3 text-slate-400">Syllabus Remarks / Excuses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentAttendance.map(att => (
                  <tr key={att.id} className="hover:bg-slate-50/55 transition-colors text-slate-600">
                    <td className="p-3 font-mono">{att.date}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        att.status === 'Present' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : att.status === 'Late' 
                            ? 'bg-amber-50 text-amber-700 border-amber-100' 
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {att.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{att.remarks || 'Standard presence logged.'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== 5. TIMETABLE VIEW ==================== */}
      {activeTab === 'timetable' && (
        <div className="space-y-4 animate-fade-in">
          <div className="pb-2 border-b border-slate-200/40">
            <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">My Lesson Calendar</h2>
            <p className="text-xs text-slate-400">Your class division weekly hour blocks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
              const dayLessons = studentTimetable.filter(tt => tt.day === day);
              return (
                <div key={day} className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-600 flex flex-col justify-start min-h-[160px]">
                  <h4 className="font-bold text-xs uppercase tracking-wide border-b border-slate-100 pb-2 mb-3 text-slate-800">{day}</h4>
                  
                  <div className="space-y-2 flex-1">
                    {dayLessons.length > 0 ? (
                      dayLessons.map(les => {
                        const sub = studentSubjects.find(s => s.id === les.subjectId);
                        const teach = teachers.find(t => t.id === les.teacherId);
                        return (
                          <div key={les.id} className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px] text-slate-500">
                            <p className="font-bold text-slate-800">{sub ? sub.name : 'Unknown'}</p>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{les.startTime} - {les.endTime}</span>
                            <span className="text-[9px] text-slate-400 font-semibold block">{teach ? teach.name : 'No Teacher'}</span>
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

      {/* ==================== 6. ANNOUNCEMENTS ==================== */}
      {activeTab === 'announcements' && (
        <div className="space-y-4 animate-fade-in">
          <div className="pb-2 border-b border-slate-200/40">
            <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">General Bulletins Feed</h2>
            <p className="text-xs text-slate-400">Official directives compiled for student body review.</p>
          </div>

          <div className="space-y-4">
            {announcements
              .filter(a => a.targetAudience === 'All' || a.targetAudience === 'Students')
              .map((ann) => (
                <div key={ann.id} className="p-5 rounded-xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden text-slate-600">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  
                  <div className="flex justify-between items-start pl-2">
                    <h3 className="font-bold text-sm text-slate-800 leading-tight">{ann.title}</h3>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-4">{ann.date}</span>
                  </div>

                  <p className="text-xs text-slate-600 pl-2 mt-2 leading-relaxed whitespace-pre-line">{ann.content}</p>
                  
                  <div className="border-t border-slate-100 mt-4 pt-2.5 pl-2 flex justify-between items-center text-[10px] text-slate-400 font-medium">
                    <span>Author: {ann.authorName} ({ann.authorRole})</span>
                    <span>Edweso Royal Dispatch</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ==================== 7. FEES PAYMENTS (PAYSTACK) ==================== */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-fade-in" id="student-payments-container">
          <div className="pb-2 border-b border-slate-200/40">
            <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Fees Settlement & Receipts</h2>
            <p className="text-xs text-slate-400">Authorize secure, instant payments via Paystack in Ghanaian Cedis (GHS).</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Payment Widget Form */}
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-700 flex flex-col justify-between">
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-3">Tuition Pay Gateway</h4>
                
                <div className="bg-slate-50/55 p-4 rounded-xl border border-slate-100 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Outstanding Balance</span>
                  <span className="text-2xl font-bold text-rose-600 block">GHS {student.balanceGHS.toFixed(2)}</span>
                </div>
 
                <form onSubmit={handlePayClick} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Amount (GHS)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1250"
                      min={10}
                      max={student.balanceGHS || 5000}
                      value={payAmount || ''}
                      onChange={(e) => setPayAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-sm text-slate-700 focus:outline-hidden focus:border-slate-300"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    id="trigger-paystack-btn"
                    disabled={student.balanceGHS <= 0}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <CreditCard size={14} />
                    <span>Pay with paystack</span>
                  </button>
                </form>
              </div>
 
              <div className="mt-6 flex items-start space-x-2 p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-500 font-medium leading-relaxed">
                <ShieldCheck size={16} className="shrink-0 mt-0.5 text-slate-400" />
                <span>Supports Visa/Mastercard credit cards and MTN MoMo, Telecel Cash, and AirtelTigo Money mobile wallets.</span>
              </div>
            </div>
 
            {/* Paystack Transaction history list with Print Receipt option */}
            <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-700">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 mb-3">Your Fees Receipts</h4>
              
              <div className="overflow-x-auto">
                <table id="student-receipts-table" className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 font-bold uppercase tracking-wider text-[10px] text-slate-400 bg-slate-50">
                      <th className="p-2">Reference ID</th>
                      <th className="p-2">Amount Paid</th>
                      <th className="p-2">Payment Mode</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Status</th>
                      <th className="p-2 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentTx.length > 0 ? (
                      studentTx.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/55 transition-colors text-slate-600">
                          <td className="p-2 font-mono text-[10px]">{tx.reference}</td>
                          <td className="p-2 font-bold font-mono text-slate-700">GHS {tx.amountGHS.toFixed(2)}</td>
                          <td className="p-2">{tx.paymentMethod}</td>
                          <td className="p-2">{tx.date.substring(0, 10)}</td>
                          <td className="p-2">
                            <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold border ${
                              tx.status === 'Successful' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-2 text-right">
                            <button
                              onClick={() => setSelectedTxForReceipt(tx)}
                              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                              title="Invoice details"
                            >
                              <Printer size={13} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center p-4 text-slate-400 italic">No historical transactions logged yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ==================== 8. PAYMENT HISTORY & TIMELINE ==================== */}
      {activeTab === 'payment-history' && (
        <div className="space-y-6 animate-fade-in">
          <div className="pb-2 border-b border-slate-200/40 flex justify-between items-center flex-wrap gap-2">
            <div>
              <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Financial Statement & Ledger Timeline</h2>
              <p className="text-xs text-slate-400">Chronological history of all processed school fee payments and invoices.</p>
            </div>
            {onTabChange && (
              <button
                onClick={() => onTabChange('payments')}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded transition-all shadow-sm flex items-center space-x-1 cursor-pointer"
              >
                <CreditCard size={12} />
                <span>Make New Payment</span>
              </button>
            )}
            {/* Metrics summary cards */}
          {(() => {
            const totalPaid = studentTx.filter(t => t.status === 'Successful').reduce((sum, t) => sum + t.amountGHS, 0);
            const totalInvoiced = totalPaid + student.balanceGHS;
            const completionRate = Math.round((totalPaid / (totalInvoiced || 1)) * 100);

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-600">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total School Fees Bill</span>
                  <div className="mt-2 text-left">
                    <span className="text-xl font-bold font-mono text-slate-800">GHS {totalInvoiced.toFixed(2)}</span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">Tuition, STEM Labs, and development assets combined.</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-600">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fees Cleared & Received</span>
                  <div className="mt-2 text-left text-slate-600">
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-xl font-bold font-mono text-slate-800">GHS {totalPaid.toFixed(2)}</span>
                      <span className="text-xs font-semibold font-mono text-slate-400">({completionRate}% completed)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-100">
                      <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-600">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Outstanding Balance</span>
                  <div className="mt-2 text-left">
                    <span className="text-xl font-bold font-mono text-rose-600">GHS {student.balanceGHS.toFixed(2)}</span>
                    <p className="text-[10px] mt-1 text-slate-400 leading-normal">
                      {student.balanceGHS > 0 ? 'Billing outstanding. Click to settle balance.' : 'Perfect! Your financial accounts are in good standing.'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Visual Timeline and Detailed List layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Left side: Timeline Visualizer (3 cols) */}
            <div className="lg:col-span-3 p-5 rounded-xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-600 space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center space-x-1.5 text-slate-800">
                <Clock size={14} className="text-slate-500" />
                <span>Chronological Payment Timeline</span>
              </h3>

              {studentTx.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic text-xs">
                  No payment events logged in this account's timeline.
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-slate-100 space-y-6 mt-4 pb-2">
                  {studentTx.map((tx) => {
                    const isSuccess = tx.status === 'Successful';
                    const isPending = tx.status === 'Pending';
                    const isFailed = tx.status === 'Failed';

                    return (
                      <div key={tx.id} className="relative group animate-fade-in">
                        
                        {/* Timeline visual marker node */}
                        <div className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
                          isSuccess 
                            ? 'bg-emerald-500' 
                            : isFailed 
                              ? 'bg-rose-500' 
                              : 'bg-amber-500'
                        }`}>
                        </div>

                        {/* Timeline Node Content Card */}
                        <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-xs hover:shadow-sm transition-all text-slate-600">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold font-mono text-xs text-slate-800">
                                  GHS {tx.amountGHS.toFixed(2)}
                                </span>
                                <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded tracking-wide border ${
                                  isSuccess 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                  {tx.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1">
                                Invoice {tx.reference} • cleared with {tx.paymentMethod}
                              </p>
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono font-medium shrink-0">{tx.date}</span>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-[9px] text-slate-400 font-mono">
                              Paystack Ref: <strong className="font-semibold text-slate-600">{tx.paystackRef}</strong>
                            </span>
                            
                            {isSuccess && (
                              <button
                                onClick={() => setSelectedTxForReceipt(tx)}
                                className="text-[10px] text-slate-500 hover:text-slate-800 hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
                              >
                                <Printer size={11} />
                                <span>Receipt Invoice</span>
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right side: Detailed Invoice Records list (2 cols) */}
            <div className="lg:col-span-2 p-5 rounded-xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-600 space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center space-x-1.5 text-slate-800">
                <Receipt size={14} className="text-slate-500" />
                <span>Invoice Records Ledger</span>
              </h3>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {studentTx.length === 0 ? (
                  <p className="text-center text-slate-400 italic text-xs py-8">No records available.</p>
                ) : (
                  studentTx.map((tx) => (
                    <div 
                      key={tx.id}
                      className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200/60 transition-all flex flex-col justify-between space-y-2 text-slate-600"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-xs text-slate-800">GHS {tx.amountGHS.toFixed(2)}</p>
                          <span className="text-[9px] text-slate-400 block font-mono">Invoice No: {tx.reference}</span>
                        </div>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold border ${
                          tx.status === 'Successful' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {tx.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-100">
                        <span className="text-slate-500 font-medium">{tx.paymentMethod}</span>
                        {tx.status === 'Successful' && (
                          <button
                            onClick={() => setSelectedTxForReceipt(tx)}
                            className="text-slate-500 hover:text-slate-800 hover:underline font-semibold cursor-pointer"
                          >
                            Print Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================== 9. GUARDIAN SIMULATED EMAIL INBOX ==================== */}
      {activeTab === 'emails' && (
        <div className="space-y-6 animate-fade-in">
          <div className="pb-2 border-b border-slate-200/40">
            <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Guardian Simulated Email Inbox</h2>
            <p className="text-xs text-slate-400">View official school letters, circulars, and outstanding balance alerts dispatched directly to your guardian email address.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Box: Inbox Information */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-600 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wide border-b border-slate-100 pb-2 text-slate-800">Inbox configuration</h4>
              <div className="space-y-3.5 text-xs text-slate-500">
                <div className="p-3.5 bg-slate-50/60 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Registered Guardian Email</p>
                  <p className="font-semibold text-slate-700 font-mono">{student.parentEmail}</p>
                </div>
                <div className="p-3.5 bg-slate-50/60 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Guardian Contact</p>
                  <p className="font-semibold text-slate-700 font-mono">{student.parentName} ({student.parentPhone})</p>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  This simulated inbox routes messages dynamically sent by school administration or automated bots to your exact parent email address context.
                </p>
              </div>
            </div>

            {/* Right Box: Inbox Message Stream */}
            <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-slate-600">
              <h4 className="font-bold text-xs uppercase tracking-wide border-b border-slate-100 pb-2 mb-4 text-slate-800">Dispatched Messages</h4>

              {(() => {
                const myMessages = emails.filter(em => (em.recipientEmail || '').toLowerCase() === (student.parentEmail || '').toLowerCase());
                if (myMessages.length === 0) {
                  return (
                    <div className="text-center py-16 text-slate-400 italic text-xs">
                      No official notices or alert logs found for {student.parentEmail}.
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {myMessages.map(em => (
                      <div 
                        key={em.id}
                        className="p-4 rounded-xl border border-slate-100 flex flex-col justify-between space-y-3 bg-white text-slate-600 shadow-xs hover:shadow-sm transition-all"
                      >
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div className="flex items-start space-x-3">
                            <span className="p-2 rounded-lg shrink-0 bg-slate-50 text-slate-400 border border-slate-100">
                              {em.type === 'Announcement' ? <Megaphone size={16} /> : <AlertCircle size={16} />}
                            </span>
                            <div>
                              <p className="font-bold text-slate-800 leading-tight">{em.subject}</p>
                              <p className="text-[10px] text-slate-400 leading-none mt-1">
                                Ref: {em.id} • Sent: {em.sentAt}
                              </p>
                            </div>
                          </div>
                          
                          <span className="text-[8px] font-bold uppercase px-2 py-0.5 rounded tracking-wide bg-slate-50 text-slate-500 border border-slate-100">
                            {em.type === 'Announcement' ? 'Announcement' : 'Fee Reminder'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {em.body}
                        </p>

                        <div className="flex justify-between items-center pt-2.5 border-t border-slate-100">
                          <span className="text-[9px] text-slate-400 font-medium flex items-center space-x-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            <span>Simulated Verified Email Client Delivery</span>
                          </span>
                          <button
                            onClick={() => setViewingEmail(em)}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wide rounded cursor-pointer transition-all shadow-sm hover:shadow"
                          >
                            Open Message
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

          </div>

          {/* VIEW EMAIL PAYLOAD DETAILED MODAL */}
          {viewingEmail && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className={`p-6 rounded-xl shadow-2xl max-w-lg w-full border ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex justify-between items-center border-b pb-2 mb-4 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-emerald-600">[{viewingEmail.id}]</span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Simulated Email Client</span>
                  </div>
                  <button 
                    onClick={() => setViewingEmail(null)}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 font-extrabold text-slate-400 hover:text-slate-950 dark:hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs font-medium">
                  <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5 leading-tight text-slate-500 dark:text-slate-400">
                    <p><span className="font-bold text-slate-700 dark:text-slate-300">From:</span> Edweso Royal Academy &lt;admin-dispatch@edweso.edu.gh&gt;</p>
                    <p><span className="font-bold text-slate-700 dark:text-slate-300">To:</span> {viewingEmail.recipientName} &lt;{viewingEmail.recipientEmail}&gt;</p>
                    <p><span className="font-bold text-slate-700 dark:text-slate-300">Sent Date:</span> {viewingEmail.sentAt}</p>
                    <p><span className="font-bold text-slate-700 dark:text-slate-300">Subject:</span> <span className="text-slate-800 dark:text-white font-bold">{viewingEmail.subject}</span></p>
                  </div>

                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Dispatched Message Content</p>
                    <div className="p-4 bg-slate-100/60 dark:bg-slate-950 rounded-lg border border-slate-200/40 dark:border-slate-800 leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line text-[11px] font-mono">
                      {viewingEmail.body}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center space-x-1.5 text-emerald-600 font-bold">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Verified Sandbox Mail</span>
                    </div>
                    <button
                      onClick={() => setViewingEmail(null)}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] uppercase rounded animate-fade-in"
                    >
                      Close Inbox
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== 10. LESSON PLANNER & SYLLABUS BOARDS ==================== */}
      {activeTab === 'syllabus' && (
        <SyllabusBoard
          session={session}
          subjects={studentSubjects}
          syllabusPlans={syllabusPlans || []}
          onUpdateSyllabusPlans={onUpdateSyllabusPlans || (() => {})}
          isDarkMode={isDarkMode}
        />
      )}

      {/* GLOBAL PRINTABLE RECEIPT POPUP MODAL (Accessible by both payments & payment-history tabs) */}
      {selectedTxForReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div id="printable-receipt-card" className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-slate-800 border-t-8 border-emerald-700 animate-fade-in font-sans space-y-4">
            
            {/* School emblem / branding */}
            <div className="text-center pb-2 border-b border-dashed border-slate-200">
              <span className="font-extrabold text-sm tracking-wide block text-emerald-800">EDWESO ROYAL ACADEMY</span>
              <span className="text-[9px] text-slate-400 block font-bold mt-0.5">KNOWLEDGE • DISCIPLINE • EXCELLENCE</span>
              <span className="text-[10px] text-slate-500 block">P.O. Box 24, Edweso, Ashanti, Ghana</span>
            </div>

            <div className="text-center my-3 bg-emerald-50 py-2 rounded">
              <span className="text-[10px] text-emerald-800 block uppercase font-bold">Receipt of school fees</span>
              <span className="text-xl font-extrabold font-mono text-emerald-800">GHS {selectedTxForReceipt.amountGHS.toFixed(2)}</span>
            </div>

            {/* Ledger info */}
            <div className="space-y-2 text-xs font-medium text-slate-600">
              <div className="flex justify-between">
                <span>Receipt No:</span>
                <strong className="text-slate-800">{selectedTxForReceipt.reference}</strong>
              </div>
              <div className="flex justify-between">
                <span>Paystack ID:</span>
                <strong className="text-slate-800 font-mono text-[10px]">{selectedTxForReceipt.paystackRef}</strong>
              </div>
              <div className="flex justify-between">
                <span>Student Payee:</span>
                <strong className="text-slate-800">{student.name}</strong>
              </div>
              <div className="flex justify-between">
                <span>Admit Number:</span>
                <strong className="text-slate-800 font-mono">{student.admissionNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span>Class Grade:</span>
                <strong className="text-slate-800">{sClass ? sClass.name : 'Unknown'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <strong className="text-slate-800">{selectedTxForReceipt.date}</strong>
              </div>
              <div className="flex justify-between">
                <span>Payment wallet:</span>
                <strong className="text-slate-800">{selectedTxForReceipt.paymentMethod}</strong>
              </div>
              <div className="flex justify-between">
                <span>Account status:</span>
                <strong className="text-emerald-700 font-bold uppercase">CLEARED / PAID</strong>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 italic pt-3 border-t border-dashed border-slate-200">
              <p>Thank you for your prompt payment.</p>
              <p className="font-bold text-[9px] uppercase tracking-wider text-emerald-600 mt-1">paystack secured checkout</p>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-xs transition-colors cursor-pointer"
              >
                Print PDF Invoice
              </button>
              <button
                onClick={() => setSelectedTxForReceipt(null)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Main Paystack Modal trigger */}
      <PaystackModal
        isOpen={isPaystackOpen}
        onClose={() => setIsPaystackOpen(false)}
        amount={payAmount}
        email={student.parentEmail}
        studentId={student.admissionNumber}
        studentName={student.name}
        onSuccess={handlePaystackSuccess}
        onFailure={handlePaystackFailure}
      />

      {/* ==================== OFFICIAL PRINTABLE REPORT CARD MODAL ==================== */}
      {isReportCardOpen && (() => {
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
        
        const classStudents = students.filter(s => s.classId === student.classId);
        const studentAvgScores = classStudents.map(s => {
          const sGrades = grades.filter(g => g.studentId === s.id);
          const avgSc = sGrades.length > 0 
            ? sGrades.reduce((acc, curr) => acc + curr.totalScore, 0) / sGrades.length 
            : 0;
          return { studentId: s.id, avgSc };
        }).sort((a, b) => b.avgSc - a.avgSc);
        const positionIndex = studentAvgScores.findIndex(s => s.studentId === student.id);
        const classPositionString = positionIndex !== -1 ? `${positionIndex + 1} of ${classStudents.length}` : '—';
        
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
                #printable-report-card, #printable-report-card * {
                  visibility: visible !important;
                }
                #printable-report-card {
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
              id="printable-report-card" 
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
                  <p className="font-extrabold text-slate-800 dark:text-white">{student.name}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Admission ID</span>
                  <p className="font-bold font-mono text-slate-800 dark:text-white">{student.admissionNumber}</p>
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
                  <span className="text-[9px] text-slate-400 uppercase font-black block">Academic Class Standing</span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="text-xs font-mono font-black text-emerald-600">{classPositionString} Position</span>
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
                  onClick={() => setIsReportCardOpen(false)}
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
