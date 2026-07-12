import React, { useState, useEffect } from 'react';
import { 
  X, Clock, User, BookOpen, AlertCircle, Sparkles, CheckCircle, 
  Mail, Calendar, MessageSquare, Printer, CheckSquare, ListTodo, FileText
} from 'lucide-react';
import { 
  TimetableEntry, Subject, Teacher, SchoolClass, SyllabusPlan, 
  HomeworkAssignment, CoverAssignment, UserSession 
} from '../types';
import { SchoolDatabase } from '../mockData';

interface TimetableDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  entry: TimetableEntry;
  subjects: Subject[];
  teachers: Teacher[];
  classes: SchoolClass[];
  homeworkAssignments?: HomeworkAssignment[];
  syllabusPlans?: SyllabusPlan[];
  session: UserSession;
  isDarkMode: boolean;
  onSendMessage?: (teacher: Teacher, subject: string) => void;
  onUpdateSyllabusPlans?: (updated: SyllabusPlan[]) => void;
}

export default function TimetableDetailView({
  isOpen,
  onClose,
  entry,
  subjects,
  teachers,
  classes,
  homeworkAssignments = [],
  syllabusPlans = [],
  session,
  isDarkMode,
  onSendMessage,
  onUpdateSyllabusPlans
}: TimetableDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'teacher' | 'homework' | 'substitute'>('syllabus');
  const [coverAssignments, setCoverAssignments] = useState<CoverAssignment[]>([]);

  // Local checklist state for students/parents
  const [completedObjectives, setCompletedObjectives] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`timetable_detail_chk_${session.id}_${entry.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    // Load cover assignments to detect substitutions
    try {
      const covers = SchoolDatabase.getCoverAssignments();
      setCoverAssignments(covers);
    } catch (e) {
      console.error(e);
    }
  }, [entry]);

  if (!isOpen) return null;

  // Resolve references
  const subjectObj = subjects.find(s => s.id === entry.subjectId);
  const teacherObj = teachers.find(t => t.id === entry.teacherId);
  const classObj = classes.find(c => c.id === entry.classId);

  // Mapped Cover Assignment for today/this timetable slot if any
  const matchedCover = coverAssignments.find(c => 
    c.timetableEntryId === entry.id || 
    (c.classId === entry.classId && c.originalTeacherId === entry.teacherId)
  );

  // Mapped Syllabus/Curriculum plans
  const matchedSyllabus = syllabusPlans.filter(p => 
    p.subjectId === entry.subjectId || 
    (subjectObj && p.subjectName?.toLowerCase() === subjectObj.name.toLowerCase())
  );

  // Mapped Homework assignments due
  const matchedHomework = homeworkAssignments.filter(h => 
    h.classId === entry.classId && h.subjectId === entry.subjectId
  );

  // Toggle objective checkbox
  const handleToggleObjective = (index: number) => {
    const key = `${entry.id}_obj_${index}`;
    const updated = { ...completedObjectives, [key]: !completedObjectives[key] };
    setCompletedObjectives(updated);
    try {
      localStorage.setItem(`timetable_detail_chk_${session.id}_${entry.id}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const handlePrintOutline = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in no-print">
      <div 
        className={`w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border flex flex-col max-h-[90vh] transition-all transform duration-300 scale-100 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Calendar size={20} className="text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] bg-emerald-600/60 text-amber-300 border border-amber-400/25 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest block w-fit">
                {entry.day} Period
              </span>
              <h3 className="font-display font-extrabold text-base tracking-tight mt-1">
                {subjectObj ? subjectObj.name : 'Unknown Subject'} ({subjectObj?.code || 'SUB'})
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Timetable slot time meta bar */}
        <div className="bg-slate-100 dark:bg-slate-950 px-6 py-3 border-b border-slate-250/20 dark:border-slate-800 flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center space-x-1.5">
            <Clock size={13} className="text-emerald-500" />
            <span>Time Block:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200 font-mono bg-slate-200 dark:bg-slate-900 px-2 py-0.5 rounded">
              {entry.startTime} - {entry.endTime}
            </span>
          </div>
          <div>
            <span>Classroom: </span>
            <span className="font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-900 px-2 py-0.5 rounded">
              {classObj ? classObj.name : 'Unassigned Class'} {classObj?.room ? `(Room ${classObj.room})` : ''}
            </span>
          </div>
        </div>

        {/* Coverage alert banner if covered */}
        {matchedCover && (
          <div className="bg-amber-500/15 border-b border-amber-500/25 px-6 py-2.5 text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center space-x-2">
            <AlertCircle size={14} className="text-amber-500 shrink-0 animate-bounce" />
            <span>
              <strong>Substitution Cover Alert:</strong> This lesson is covered by{' '}
              <span className="underline font-bold">{matchedCover.coverTeacherName}</span>.
            </span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 shrink-0 overflow-x-auto">
          {[
            { id: 'syllabus', label: 'Topics & Materials', icon: <BookOpen size={13} /> },
            { id: 'teacher', label: 'Teacher Details', icon: <User size={13} /> },
            { id: 'homework', label: `Homework (${matchedHomework.length})`, icon: <CheckSquare size={13} /> },
            { id: 'substitute', label: 'Substitution Log', icon: <AlertCircle size={13} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-450 hover:text-slate-750 dark:text-slate-400 dark:hover:text-slate-250'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Body content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: SYLLABUS, STUDY TOPICS & MATERIALS */}
          {activeTab === 'syllabus' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <ListTodo size={13} className="text-indigo-500" />
                  <span>Curriculum / Syllabus Progress for {subjectObj?.name}</span>
                </h4>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-black uppercase">
                  Ghana Standard GES
                </span>
              </div>

              {matchedSyllabus.length > 0 ? (
                <div className="space-y-4">
                  {matchedSyllabus.map((plan) => (
                    <div 
                      key={plan.id}
                      className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-3"
                    >
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md">
                            Week {plan.weekNumber}
                          </span>
                          <h5 className="font-extrabold text-sm text-slate-800 dark:text-white mt-1.5">
                            {plan.topic || plan.topicTitle || 'No Topic Title Logged'}
                          </h5>
                        </div>
                        {plan.status && (
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${
                            plan.status === 'Completed' || plan.status === 'Complete'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400'
                          }`}>
                            {plan.status}
                          </span>
                        )}
                      </div>

                      {/* Topic Objectives or Subtopics */}
                      {plan.objectives && (
                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-400 uppercase font-black block">Weekly Lessons Objectives Checklist</span>
                          <div className="space-y-1.5">
                            {plan.objectives.split('\n').filter(o => o.trim()).map((obj, idx) => {
                              const checkedKey = `${entry.id}_obj_${idx}`;
                              const isCompleted = completedObjectives[checkedKey];
                              return (
                                <div 
                                  key={idx}
                                  onClick={() => handleToggleObjective(idx)}
                                  className="flex items-start space-x-2 p-1.5 rounded-lg hover:bg-slate-200/40 dark:hover:bg-slate-800/40 transition-colors cursor-pointer text-xs"
                                >
                                  <div className={`mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center ${
                                    isCompleted 
                                      ? 'bg-emerald-600 border-emerald-600 text-white' 
                                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                                  }`}>
                                    {isCompleted && <CheckCircle size={12} className="stroke-[3]" />}
                                  </div>
                                  <span className={`font-semibold ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {obj.replace(/^•\s*/, '')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Study Materials */}
                      {plan.studyMaterials && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
                          <span className="text-[10px] text-slate-400 uppercase font-black block mb-1">Assigned Study Materials</span>
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-emerald-50/50 dark:bg-emerald-950/10 p-2.5 rounded-lg border border-emerald-100/30">
                            📚 {plan.studyMaterials}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400">
                  <BookOpen className="mx-auto mb-2 text-slate-300 dark:text-slate-700" size={28} />
                  <p className="text-xs italic">No current syllabus plans registered for this subject block in the current term.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TEACHER DETAILS */}
          {activeTab === 'teacher' && (
            <div className="space-y-4 animate-fade-in text-slate-800 dark:text-slate-100">
              {teacherObj ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/40 dark:bg-slate-950/20">
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 bg-slate-100 flex items-center justify-center font-bold text-lg">
                      {teacherObj.profilePhoto ? (
                        <img 
                          src={teacherObj.profilePhoto} 
                          alt={teacherObj.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        teacherObj.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="text-center sm:text-left flex-1 space-y-1">
                      <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{teacherObj.name}</h4>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                          teacherObj.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {teacherObj.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-bold">
                        Specialization: {teacherObj.subjectSpecialization || teacherObj.subjectId || 'GES Educator'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold font-mono">Staff ID: {teacherObj.staffNumber}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
                    <div className="p-3 rounded-lg border border-slate-100 bg-white dark:bg-slate-900">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Email Address</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{teacherObj.email}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-100 bg-white dark:bg-slate-900">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Mobile Contact</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{teacherObj.phone}</span>
                    </div>
                  </div>

                  {/* Actions mapping */}
                  {onSendMessage && (
                    <button
                      type="button"
                      id="contact-teacher-timetable-btn"
                      onClick={() => onSendMessage(teacherObj, subjectObj?.name || 'Academic Consultation')}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <MessageSquare size={14} />
                      <span>Message {teacherObj.name.split(' ')[0]}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 italic text-xs">
                  No teacher assigned to this timetable lesson block currently.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HOMEWORK ASSIGNMENTS */}
          {activeTab === 'homework' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <FileText size={13} className="text-emerald-500" />
                  <span>Homework Assignments Due</span>
                </h4>
              </div>

              {matchedHomework.length > 0 ? (
                <div className="space-y-3">
                  {matchedHomework.map((hw) => (
                    <div 
                      key={hw.id}
                      className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 font-semibold text-xs space-y-2"
                    >
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <h5 className="font-extrabold text-slate-900 dark:text-white text-xs">{hw.title}</h5>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-black uppercase">
                          Max: {hw.maxScore} Pts
                        </span>
                      </div>
                      <p className="text-slate-550 dark:text-slate-350 text-[11px] leading-relaxed">
                        {hw.description}
                      </p>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-800 text-[10px] text-slate-400">
                        <span>Due Date: <strong className="text-rose-600 dark:text-rose-400 font-mono">{hw.dueDate}</strong></span>
                        <span>Published: {hw.dateCreated}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400">
                  <CheckCircle className="mx-auto mb-2 text-slate-300 dark:text-slate-700" size={28} />
                  <p className="text-xs italic">No homework assignments active for this period currently. Enjoy your evening study block!</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SUBSTITUTION / COVER LOG */}
          {activeTab === 'substitute' && (
            <div className="space-y-4 animate-fade-in text-xs font-semibold text-slate-600 dark:text-slate-400">
              <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">
                Staff Coverage Log & Absence Check
              </h4>

              {matchedCover ? (
                <div className="p-4 rounded-xl border border-amber-200/50 dark:border-amber-900/50 bg-amber-500/5 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-400">
                    <AlertCircle size={16} />
                    <span className="font-extrabold">Active Cover Assignment Logged</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Due to planned absence or schedule overlap, the regular form or subject educator has authorized cover coverage.
                  </p>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Regular Instructor:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{teacherObj?.name || 'Form Instructor'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Assigned Cover Educator:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{matchedCover.coverTeacherName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Verification Status:</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                        {matchedCover.status}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 italic">
                  <CheckCircle className="mx-auto mb-2 text-emerald-500/20" size={28} />
                  <p className="text-xs">Your primary instructor {teacherObj?.name || 'is schedule-active'} and fully rostered. No substitution needed.</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0 no-print">
          <button
            type="button"
            onClick={handlePrintOutline}
            className="px-4 py-2 border border-slate-200 hover:border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 hover:bg-slate-100/50"
          >
            <Printer size={13} />
            <span>Print Details</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close View
          </button>
        </div>

      </div>
    </div>
  );
}
