import React, { useState } from 'react';
import { 
  UserX, Plus, Calendar, ShieldCheck, Sparkles, UserCheck, 
  Trash2, X, AlertCircle, RefreshCw, Send, CheckCircle 
} from 'lucide-react';
import { TeacherAbsence, CoverAssignment, Teacher, Subject } from '../types';

interface SubstitutionAssistantProps {
  teachers: Teacher[];
  subjects: Subject[];
  teacherAbsences: TeacherAbsence[];
  coverAssignments: CoverAssignment[];
  onUpdateTeacherAbsences: (updated: TeacherAbsence[]) => void;
  onUpdateCoverAssignments: (updated: CoverAssignment[]) => void;
  isDarkMode: boolean;
  adminName: string;
  setDeleteConfirm?: React.Dispatch<React.SetStateAction<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>>;
}

export default function SubstitutionAssistant({
  teachers,
  subjects,
  teacherAbsences,
  coverAssignments,
  onUpdateTeacherAbsences,
  onUpdateCoverAssignments,
  isDarkMode,
  adminName,
  setDeleteConfirm
}: SubstitutionAssistantProps) {
  // Absence Form modal state
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [selectedAbsentTeacherId, setSelectedAbsentTeacherId] = useState<string>(teachers[0]?.id || '');
  const [absenceDate, setAbsenceDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [absenceReason, setAbsenceReason] = useState<string>('Academic conference travel');

  // Interactive Match Selection State (Which absence are we matching covers for?)
  const [activeMatchingAbsenceId, setActiveMatchingAbsenceId] = useState<string | null>(
    teacherAbsences.length > 0 ? teacherAbsences[0].id : null
  );

  // Subtab navigation state inside substitution assistant
  const [activeSubTab, setActiveSubTab] = useState<'registry' | 'ledger'>('registry');

  // Record a new absence
  const handleRecordAbsence = (e: React.FormEvent) => {
    e.preventDefault();
    const absentTeacher = teachers.find(t => t.id === selectedAbsentTeacherId);
    if (!absentTeacher) return;

    const newAbsence: TeacherAbsence = {
      id: 'absence-' + Date.now(),
      teacherId: absentTeacher.id,
      teacherName: absentTeacher.name,
      date: absenceDate,
      reason: absenceReason,
      status: 'Unassigned'
    };

    const updatedAbsences = [newAbsence, ...teacherAbsences];
    onUpdateTeacherAbsences(updatedAbsences);
    setActiveMatchingAbsenceId(newAbsence.id);
    setIsAbsenceModalOpen(false);
  };

  // Delete/Cancel an absence log
  const handleDeleteAbsence = (id: string) => {
    const performDelete = () => {
      const updatedAbsences = teacherAbsences.filter(a => a.id !== id);
      const updatedCovers = coverAssignments.filter(c => c.absenceId !== id);
      onUpdateTeacherAbsences(updatedAbsences);
      onUpdateCoverAssignments(updatedCovers);
      
      if (activeMatchingAbsenceId === id) {
        setActiveMatchingAbsenceId(updatedAbsences.length > 0 ? updatedAbsences[0].id : null);
      }

      if (setDeleteConfirm) {
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
      }
    };

    if (setDeleteConfirm) {
      setDeleteConfirm({
        isOpen: true,
        title: 'Cancel Absence & Cover',
        message: 'Are you sure you want to remove this absence record? Any associated cover assignment will be permanently cancelled.',
        onConfirm: performDelete
      });
    } else {
      if (window.confirm('Remove this absence record? Any associated cover assignment will be cancelled.')) {
        performDelete();
      }
    }
  };

  // Find recommendations for cover teachers based on the active selected absence
  const getSubstitutesForAbsence = (absence: TeacherAbsence) => {
    const absentTeacher = teachers.find(t => t.id === absence.teacherId);
    if (!absentTeacher) return [];

    // Find subjects taught by the absent teacher
    const absentTeacherSubjects = subjects.filter(sub => sub.teacherId === absentTeacher.id);
    const absentSubjectIds = absentTeacherSubjects.map(s => s.id);

    // Calculate score for each OTHER teacher
    return teachers
      .filter(t => t.id !== absentTeacher.id) // Cannot substitute for self
      .map(t => {
        let score = 50; // Base score
        const reasons: string[] = ['Baseline credentials match'];

        // 1. Same specialization?
        const isSameSpecialization = (t.subjectSpecialization && absentTeacher.subjectSpecialization)
          ? t.subjectSpecialization.toLowerCase() === absentTeacher.subjectSpecialization.toLowerCase()
          : false;
        if (isSameSpecialization) {
          score += 30;
          reasons.push(`Teaches matching specialization (${t.subjectSpecialization})`);
        }

        // 2. Teaches the same actual subject?
        const teachesSameSubject = subjects.some(sub => sub.teacherId === t.id && absentSubjectIds.includes(sub.id));
        if (teachesSameSubject) {
          score += 15;
          reasons.push('Actively teaches identical curriculum blocks');
        }

        // 3. Status is active?
        if (t.status === 'Active') {
          score += 5;
        }

        // Make sure score is capped at 100
        score = Math.min(100, score);

        return {
          teacher: t,
          score,
          reasons
        };
      })
      .sort((a, b) => b.score - a.score); // Sort by highest recommendation score
  };

  // Perform Cover Assignment
  const handleAssignCover = (absence: TeacherAbsence, substitute: Teacher, score: number) => {
    // 1. Create Cover Assignment
    const newCover: CoverAssignment = {
      id: 'cover-' + Date.now(),
      absenceId: absence.id,
      absentTeacherId: absence.teacherId,
      absentTeacherName: absence.teacherName,
      coverTeacherId: substitute.id,
      coverTeacherName: substitute.name,
      date: absence.date,
      assignedBy: adminName,
      status: 'Confirmed'
    };

    // 2. Update the absence record cover status
    const updatedAbsences = teacherAbsences.map(a => {
      if (a.id === absence.id) {
        return { ...a, status: 'Covered' as const };
      }
      return a;
    });

    onUpdateTeacherAbsences(updatedAbsences);
    onUpdateCoverAssignments([newCover, ...coverAssignments]);
    alert(`Success! Faculty cover assigned: ${substitute.name} will cover for ${absence.teacherName} on ${absence.date}.`);
  };

  // Remove a cover assignment (revert absence to Unassigned)
  const handleRemoveCover = (coverId: string, absenceId: string) => {
    const performRemove = () => {
      const updatedCovers = coverAssignments.filter(c => c.id !== coverId);
      const updatedAbsences = teacherAbsences.map(a => {
        if (a.id === absenceId) {
          return { ...a, status: 'Unassigned' as const };
        }
        return a;
      });

      onUpdateTeacherAbsences(updatedAbsences);
      onUpdateCoverAssignments(updatedCovers);

      if (setDeleteConfirm) {
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
      }
    };

    if (setDeleteConfirm) {
      setDeleteConfirm({
        isOpen: true,
        title: 'Release Substitute Cover',
        message: 'Are you sure you want to release this cover teacher and restore the alert? This substitution record will be removed.',
        onConfirm: performRemove
      });
    } else {
      if (window.confirm('Are you sure you want to release this cover teacher and restore the alert?')) {
        performRemove();
      }
    }
  };

  const selectedAbsence = teacherAbsences.find(a => a.id === activeMatchingAbsenceId);
  const potentialSubstitutes = selectedAbsence ? getSubstitutesForAbsence(selectedAbsence) : [];

  return (
    <div className="space-y-6 animate-fade-in" id="faculty-substitution-assistant">
      
      {/* SECTION HEADER */}
      <div className="pb-2 border-b border-slate-200/40 flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center space-x-1.5">
            <UserX className="text-emerald-700" size={20} />
            <span>Smart Faculty Cover & Substitution Assistant</span>
          </h2>
          <p className="text-xs text-slate-400">Manage daily teacher absences and access algorithmic substitution match logs.</p>
        </div>

        <button
          onClick={() => setIsAbsenceModalOpen(true)}
          className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs rounded transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
          id="btn-report-teacher-absence"
        >
          <Plus size={14} />
          <span>Record Absent Log</span>
        </button>
      </div>

      {/* SUB-TABS FOR COVER ASSISTANT */}
      <div className="flex space-x-1 border-b border-slate-200/40 pb-px">
        <button
          onClick={() => setActiveSubTab('registry')}
          className={`pb-3 text-xs font-bold px-4 transition-all border-b-2 -mb-px cursor-pointer ${
            activeSubTab === 'registry'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-500'
          }`}
        >
          Absence Registry & Matcher
        </button>
        <button
          onClick={() => setActiveSubTab('ledger')}
          className={`pb-3 text-xs font-bold px-4 transition-all border-b-2 -mb-px cursor-pointer relative flex items-center space-x-2 ${
            activeSubTab === 'ledger'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-500'
          }`}
        >
          <span>Cover Assignments Ledger</span>
          {coverAssignments.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-600 text-white font-mono leading-none">
              {coverAssignments.length}
            </span>
          )}
        </button>
      </div>

      {activeSubTab === 'registry' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* LEFT COLUMN: ACTIVE ABSENCES (3 cols) */}
          <div className={`lg:col-span-3 p-5 rounded-2xl border space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Current Absence Registry</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Select an active absence record to query recommendation cover lists.</p>
            </div>

          {teacherAbsences.length === 0 ? (
            <div className="py-12 text-center text-slate-400 italic text-xs font-semibold">
              All faculty records are currently logged as active. No absences found.
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
              {teacherAbsences.map((abs) => {
                const isActive = abs.id === activeMatchingAbsenceId;
                const isCovered = abs.status === 'Covered';
                const associatedCover = coverAssignments.find(c => c.absenceId === abs.id);

                return (
                  <div 
                    key={abs.id}
                    onClick={() => setActiveMatchingAbsenceId(abs.id)}
                    className={`p-4 rounded-xl border text-xs transition-all cursor-pointer ${
                      isActive 
                        ? 'border-emerald-600 bg-emerald-50/5 dark:bg-emerald-950/10' 
                        : isDarkMode ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200/50 hover:bg-slate-50/80 hover:border-slate-250'
                    }`}
                  >
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-slate-800 dark:text-white text-sm">{abs.teacherName}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wider border ${
                            isCovered 
                              ? 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20' 
                              : 'text-rose-700 bg-rose-500/10 border-rose-500/20'
                          }`}>
                            {abs.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-bold">
                          <Calendar size={11} />
                          <span>Absence Date: {abs.date}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAbsence(abs.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete Absence Log"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="mt-2.5 p-2 bg-white/40 dark:bg-slate-950/40 rounded-lg border border-slate-200/30 text-[11px] leading-relaxed font-semibold text-slate-500 dark:text-slate-300">
                      Reason: <strong className="text-slate-700 dark:text-slate-200">{abs.reason}</strong>
                    </div>

                    {/* Display covered teacher details if covers exist */}
                    {isCovered && associatedCover && (
                      <div className="mt-2.5 flex items-center justify-between border-t border-dashed pt-2.5 border-slate-200/40">
                        <div className="flex items-center space-x-1.5 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                          <UserCheck size={12} />
                          <span>Cover Teacher: {associatedCover.coverTeacherName}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCover(associatedCover.id, abs.id);
                          }}
                          className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/20 hover:border-transparent rounded font-extrabold text-[9px] uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1"
                        >
                          <Trash2 size={10} />
                          <span>Delete Cover</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: RECO COVER RECOMMENDATION MATCH ENGINE (2 cols) */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div>
            <div className="flex items-center space-x-1 text-emerald-700 dark:text-emerald-400">
              <Sparkles size={14} className="animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-wider">AI Cover Match Engine</h3>
            </div>
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-1">Smart Substitution Suggestions</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Automated matches generated via subject compatibility and department alignment heuristics.</p>
          </div>

          {!selectedAbsence ? (
            <div className="py-24 text-center text-slate-400 italic text-xs font-semibold flex flex-col items-center justify-center space-y-2">
              <AlertCircle size={22} className="text-slate-300" />
              <span>Select an unassigned absence record from the left registry to run suggestions.</span>
            </div>
          ) : selectedAbsence.status === 'Covered' ? (
            <div className="py-24 text-center text-slate-400 italic text-xs font-semibold flex flex-col items-center justify-center space-y-2">
              <CheckCircle size={22} className="text-emerald-500" />
              <p className="font-extrabold text-emerald-700 dark:text-emerald-400">Syllabus block covered successfully!</p>
              <span>This teacher absence has already been assigned a certified cover teacher.</span>
            </div>
          ) : potentialSubstitutes.length === 0 ? (
            <div className="py-24 text-center text-slate-400 italic text-xs font-semibold">
              No recommended cover teachers are currently logged in the active database.
            </div>
          ) : (
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {potentialSubstitutes.map(({ teacher, score, reasons }) => {
                const isHighMatch = score >= 80;

                return (
                  <div 
                    key={teacher.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-2.5 transition-colors ${
                      isDarkMode ? 'bg-slate-950 border-slate-800/80 hover:border-slate-800' : 'bg-slate-50 border-slate-200/50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-slate-800 dark:text-white leading-tight">{teacher.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold">{teacher.subjectSpecialization} Specialist</p>
                      </div>

                      <div className="text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-black ${
                          isHighMatch 
                            ? 'text-emerald-700 bg-emerald-500/10' 
                            : 'text-teal-700 bg-teal-500/10'
                        }`}>
                          {score}% Match
                        </span>
                      </div>
                    </div>

                    {/* Match Reasons bullets */}
                    <div className="space-y-1">
                      {reasons.map((r, idx) => (
                        <div key={idx} className="flex items-center space-x-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          <span className="h-1 w-1 rounded-full bg-emerald-500 shrink-0"></span>
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>

                    {/* Assign Action */}
                    <button
                      onClick={() => handleAssignCover(selectedAbsence, teacher, score)}
                      className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wide rounded cursor-pointer transition-all shadow-xs"
                    >
                      Approve & Assign Cover
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick status summary */}
          <div className="mt-3.5 pt-3.5 border-t border-slate-200/40 text-[10px] text-slate-400 font-semibold flex items-center space-x-1">
            <ShieldCheck size={12} className="text-emerald-600" />
            <span>Substitution assignments log securely using current admin token.</span>
          </div>

        </div>

      </div>
      )}

      {/* COVER ASSIGNMENTS LEDGER SUB-TAB VIEW */}
      {activeSubTab === 'ledger' && (
        <div className={`p-6 rounded-2xl border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div className="pb-4 border-b border-slate-200/40 flex justify-between items-center flex-wrap gap-2 mb-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Active Substitutions Ledger</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">List of all active class cover duties currently assigned to substitute faculty.</p>
            </div>
          </div>

          {coverAssignments.length === 0 ? (
            <div className="py-16 text-center text-slate-400 italic text-xs font-semibold flex flex-col items-center justify-center space-y-2">
              <CheckCircle size={24} className="text-emerald-500/80 animate-pulse" />
              <span>No cover duties are currently assigned. All active absences are unassigned or resolved.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/30 text-slate-400 font-extrabold uppercase tracking-wider text-[9px]">
                    <th className="py-3 px-4">Absent Faculty</th>
                    <th className="py-3 px-4">Cover Substitute</th>
                    <th className="py-3 px-4">Date of Duty</th>
                    <th className="py-3 px-4">Assigned By</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/10">
                  {coverAssignments.map((cover) => {
                    return (
                      <tr key={cover.id} className="hover:bg-slate-500/5 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">
                          {cover.absentTeacherName || '—'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                          <div className="flex items-center space-x-1.5">
                            <UserCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
                            <span>{cover.coverTeacherName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-500 dark:text-slate-400">
                          {cover.date}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">
                          {cover.assignedBy || 'Admin Office'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {cover.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleRemoveCover(cover.id, cover.absenceId)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/20 hover:border-transparent rounded font-bold text-[10px] uppercase tracking-wide transition-all cursor-pointer"
                            title="Cancel Assignment & Release Cover"
                          >
                            <Trash2 size={11} />
                            <span>Delete Cover</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ABSENCE MODAL FORM */}
      {isAbsenceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <form 
            onSubmit={handleRecordAbsence}
            className={`p-6 rounded-2xl shadow-2xl max-w-sm w-full border space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex justify-between items-center border-b pb-2.5">
              <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">
                Log Faculty Absence Record
              </h3>
              <button 
                type="button"
                onClick={() => setIsAbsenceModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white font-extrabold text-sm cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Select Absent Teacher */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-black text-slate-400">Absent Faculty Member</label>
              <select
                value={selectedAbsentTeacherId}
                onChange={(e) => setSelectedAbsentTeacherId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-2 rounded-lg text-xs font-bold"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.subjectSpecialization})</option>
                ))}
              </select>
            </div>

            {/* Absence Date */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-black text-slate-400">Date of Absence</label>
              <input 
                type="date"
                value={absenceDate}
                onChange={(e) => setAbsenceDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-2 rounded-lg text-xs font-bold"
              />
            </div>

            {/* Absence Reason */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-black text-slate-400">Reason for Absence</label>
              <input 
                type="text"
                placeholder="e.g. Attending STEM professional panel"
                value={absenceReason}
                onChange={(e) => setAbsenceReason(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-2 rounded-lg text-xs font-semibold focus:outline-hidden"
              />
            </div>

            {/* Form actions */}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAbsenceModalOpen(false)}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-150 rounded text-xs font-bold transition-all dark:border-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs rounded transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
              >
                <Plus size={12} />
                <span>Submit Absense Log</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
