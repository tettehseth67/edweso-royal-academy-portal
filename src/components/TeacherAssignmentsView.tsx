import React, { useState } from 'react';
import { 
  FileText, Clipboard, Plus, Check, Clock, ShieldAlert, 
  Sparkles, Send, Eye, PenTool, Calendar, Award, Trash2, CheckCircle2, X
} from 'lucide-react';
import { 
  HomeworkAssignment, HomeworkSubmission, UserSession, 
  SchoolClass, Subject, Student 
} from '../types';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface TeacherAssignmentsViewProps {
  session: UserSession;
  classes: SchoolClass[];
  subjects: Subject[];
  students: Student[];
  homeworkAssignments: HomeworkAssignment[];
  homeworkSubmissions: HomeworkSubmission[];
  onUpdateHomeworkAssignments: (assignments: HomeworkAssignment[]) => void;
  onUpdateHomeworkSubmissions: (submissions: HomeworkSubmission[]) => void;
}

export default function TeacherAssignmentsView({
  session,
  classes,
  subjects,
  students,
  homeworkAssignments,
  homeworkSubmissions,
  onUpdateHomeworkAssignments,
  onUpdateHomeworkSubmissions
}: TeacherAssignmentsViewProps) {
  // Navigation tabs: 'assignments' | 'submissions'
  const [activeSubTab, setActiveSubTab] = useState<'assignments' | 'submissions'>('assignments');

  // Creation form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newClassId, setNewClassId] = useState(classes[0]?.id || '');
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || '');
  const [newDueDate, setNewDueDate] = useState('2026-07-20');
  const [newMaxScore, setNewMaxScore] = useState(20);

  // Review & Grading state
  const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(10);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [isGradingAi, setIsGradingAi] = useState(false);
  const [aiGradeError, setAiGradeError] = useState('');

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    id: string;
  }>({
    isOpen: false,
    id: ''
  });

  // Handle Publish Assignment
  const handlePublishAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      alert('Please fill out the homework title and description.');
      return;
    }

    const matchedSubject = subjects.find(s => s.id === newSubjectId);
    const subjectName = matchedSubject ? matchedSubject.name : 'General Course';

    const newHw: HomeworkAssignment = {
      id: 'hw-' + Date.now(),
      classId: newClassId,
      subjectId: newSubjectId,
      subjectName,
      title: newTitle,
      description: newDescription,
      dueDate: newDueDate,
      maxScore: Number(newMaxScore),
      dateCreated: new Date().toISOString().substring(0, 10)
    };

    onUpdateHomeworkAssignments([newHw, ...homeworkAssignments]);
    setIsCreateOpen(false);
    
    // Reset Form
    setNewTitle('');
    setNewDescription('');
    setNewClassId(classes[0]?.id || '');
    setNewSubjectId(subjects[0]?.id || '');
  };

  // Delete an assignment
  const handleDeleteAssignment = (id: string) => {
    setDeleteConfirm({
      isOpen: true,
      id
    });
  };

  const confirmDeleteAssignment = () => {
    const id = deleteConfirm.id;
    const filteredAssignments = homeworkAssignments.filter(hw => hw.id !== id);
    const filteredSubmissions = homeworkSubmissions.filter(sub => sub.assignmentId !== id);
    onUpdateHomeworkAssignments(filteredAssignments);
    onUpdateHomeworkSubmissions(filteredSubmissions);
    setDeleteConfirm({ isOpen: false, id: '' });
  };

  // Trigger AI Grading Assistant
  const handleAiGradeEvaluation = async (submission: HomeworkSubmission, assignment: HomeworkAssignment) => {
    setIsGradingAi(true);
    setAiGradeError('');
    try {
      const res = await fetch('/api/ai/evaluate-homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentTitle: assignment.title,
          assignmentDescription: assignment.description,
          studentName: submission.studentName,
          submissionText: submission.submissionText,
          maxScore: assignment.maxScore
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data) {
        const { suggestedScore, feedbackDraft } = data.data;
        setGradeScore(Math.min(suggestedScore, assignment.maxScore));
        setGradeFeedback(feedbackDraft);
      } else {
        setAiGradeError(data.error || 'Failed to auto-evaluate submission.');
      }
    } catch (err) {
      console.error(err);
      setAiGradeError('Network error connecting to Edweso AI evaluation hub.');
    } finally {
      setIsGradingAi(false);
    }
  };

  // Open grading modal
  const handleOpenGradeModal = (sub: HomeworkSubmission) => {
    setSelectedSubmission(sub);
    const assignment = homeworkAssignments.find(hw => hw.id === sub.assignmentId);
    setGradeScore(sub.score || (assignment ? Math.round(assignment.maxScore * 0.8) : 10));
    setGradeFeedback(sub.feedback || '');
    setAiGradeError('');
  };

  // Submit Grade
  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    const assignment = homeworkAssignments.find(hw => hw.id === selectedSubmission.assignmentId);
    const max = assignment ? assignment.maxScore : 100;

    if (gradeScore < 0 || gradeScore > max) {
      alert(`Invalid score. Please enter a value between 0 and ${max}.`);
      return;
    }

    const updatedSubmissions = homeworkSubmissions.map(sub => {
      if (sub.id === selectedSubmission.id) {
        return {
          ...sub,
          score: Number(gradeScore),
          feedback: gradeFeedback,
          status: 'Graded' as const,
          gradedBy: session.name,
          gradedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return sub;
    });

    onUpdateHomeworkSubmissions(updatedSubmissions);
    setSelectedSubmission(null);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="teacher-homework-workspace">
      {/* 1. HEADER */}
      <div className="pb-3 border-b border-slate-200/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-700">
              <Clipboard size={20} />
            </div>
            <span>Homework center & Grading Desk</span>
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Publish academic assignments, track pupil submissions, and grade answers with AI assistance.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus size={14} />
          <span>Publish New Homework</span>
        </button>
      </div>

      {/* 2. SUB NAVIGATION TABS */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('assignments')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'assignments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-450 hover:text-slate-700'
          }`}
        >
          Active Homework ({homeworkAssignments.length})
        </button>
        <button
          onClick={() => setActiveSubTab('submissions')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'submissions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-450 hover:text-slate-700'
          }`}
        >
          Pupil Submissions ({homeworkSubmissions.length})
        </button>
      </div>

      {/* 3. ASSIGNMENTS GRID */}
      {activeSubTab === 'assignments' && (
        <div className="space-y-4 animate-fade-in">
          {homeworkAssignments.length === 0 ? (
            <div className="p-12 border border-dashed border-slate-200 rounded-3xl text-center text-slate-450 bg-slate-50/50">
              <FileText size={40} className="mx-auto mb-3 text-slate-300 animate-pulse" />
              <p className="text-sm font-bold">No assignments published yet.</p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="mt-3 text-xs font-black uppercase text-indigo-600 hover:underline cursor-pointer"
              >
                Create your first homework sheet now &rarr;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {homeworkAssignments.map(hw => {
                const targetClass = classes.find(c => c.id === hw.classId);
                const subCount = homeworkSubmissions.filter(s => s.assignmentId === hw.id).length;
                const gradedSubCount = homeworkSubmissions.filter(s => s.assignmentId === hw.id && s.status === 'Graded').length;

                return (
                  <div key={hw.id} className="bg-white border border-slate-200/85 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 space-y-4 flex flex-col justify-between text-slate-700">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full uppercase">
                          {hw.subjectName}
                        </span>
                        <div className="flex space-x-1.5">
                          <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full uppercase">
                            {targetClass ? targetClass.name : 'Unknown'}
                          </span>
                          <button
                            onClick={() => handleDeleteAssignment(hw.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                            title="Delete Homework"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-display font-bold text-slate-800 text-sm leading-snug">{hw.title}</h4>
                        <div className="text-[10px] font-medium text-slate-450 mt-1 flex items-center space-x-1.5">
                          <Calendar size={11} />
                          <span>Due Date: {hw.dueDate}</span>
                          <span>•</span>
                          <span>Max Score: {hw.maxScore} pts</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {hw.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
                      <span>Submitted: <strong className="text-slate-700">{subCount} entries</strong></span>
                      <span>Graded: <strong className="text-slate-700">{gradedSubCount}/{subCount} graded</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. SUBMISSIONS VIEW */}
      {activeSubTab === 'submissions' && (
        <div className="space-y-4 animate-fade-in">
          {homeworkSubmissions.length === 0 ? (
            <div className="p-12 border border-dashed border-slate-200 rounded-3xl text-center text-slate-450 bg-slate-50/50">
              <Plus size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-bold">Waiting for student submissions...</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Assignment Topic</th>
                    <th className="p-4">Date Submitted</th>
                    <th className="p-4">Status & Score</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                  {homeworkSubmissions.map(sub => {
                    const hw = homeworkAssignments.find(h => h.id === sub.assignmentId);
                    const statusColor = sub.status === 'Graded'
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                      : 'text-amber-700 bg-amber-50 border border-amber-100';

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/40">
                        <td className="p-4 font-bold text-slate-850">{sub.studentName}</td>
                        <td className="p-4">
                          <span className="block font-semibold text-slate-850">{sub.assignmentTitle}</span>
                          <span className="text-[10px] font-medium text-slate-400 mt-0.5 block">{hw ? hw.subjectName : 'General'}</span>
                        </td>
                        <td className="p-4 font-mono text-slate-400">{sub.submittedAt}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 border text-[10px] font-bold uppercase rounded-full ${statusColor}`}>
                            {sub.status === 'Graded' ? `Graded: ${sub.score}/${hw?.maxScore || 20}` : 'Submitted'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleOpenGradeModal(sub)}
                            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase rounded-lg cursor-pointer transition-all flex items-center space-x-1 ml-auto"
                          >
                            <PenTool size={11} />
                            <span>{sub.status === 'Graded' ? 'Update Grade' : 'Review & Grade'}</span>
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

      {/* 5. PUBLISH MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <form 
            onSubmit={handlePublishAssignment}
            className="p-6 bg-white border border-slate-100 rounded-2xl shadow-2xl max-w-md w-full space-y-4 text-slate-700"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <h3 className="font-display font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Plus size={14} className="text-indigo-600" />
                <span>Publish Homework Sheet</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Class & Subject Selector Row */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-black text-slate-400">Target Class</label>
                <select
                  value={newClassId}
                  onChange={(e) => setNewClassId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-bold text-slate-800"
                >
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-black text-slate-400">Class Subject</label>
                <select
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-bold text-slate-800"
                >
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-black text-slate-400">Assignment Title</label>
              <input
                type="text"
                placeholder="e.g. Worksheet 3 - Fractions & Percentages"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-bold focus:outline-hidden"
              />
            </div>

            {/* Description instructions */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-black text-slate-400">Problem Statements & Instructions</label>
              <textarea
                placeholder="List problems, questions, or guidelines here..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-semibold focus:outline-hidden"
              />
            </div>

            {/* Max Score & Due Date Row */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-black text-slate-400">Max Score (pts)</label>
                <input
                  type="number"
                  value={newMaxScore}
                  onChange={(e) => setNewMaxScore(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-black text-slate-400">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <Send size={12} />
                <span>Publish Assignment</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. GRADING PANEL MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <form 
            onSubmit={handleSaveGrade}
            className="p-6 bg-white border border-slate-100 rounded-2xl shadow-2xl max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto text-slate-700"
          >
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[9px] font-bold uppercase text-indigo-600 px-2.5 py-0.5 bg-indigo-50 rounded-full">
                  Review Submission
                </span>
                <h3 className="font-display font-extrabold text-slate-800 text-base leading-snug mt-1.5">
                  Grading Desk &bull; {selectedSubmission.studentName}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedSubmission(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Submission content details */}
            <div className="space-y-2.5">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400">Homework Topic:</span>
                <span className="block font-extrabold text-xs text-slate-700 mt-0.5">{selectedSubmission.assignmentTitle}</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                <span className="text-[9px] font-black uppercase text-slate-400 block">Student Answer Submission:</span>
                <p className="text-xs font-semibold text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedSubmission.submissionText}
                </p>

                {selectedSubmission.fileAttachment && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center space-x-1.5 text-xs text-indigo-700 font-extrabold">
                    <FileText size={13} />
                    <span className="hover:underline cursor-pointer">{selectedSubmission.fileAttachment}</span>
                    <span className="text-slate-400 font-bold">(Simulated PDF attachment successfully linked)</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI GRADING ASSISTANT */}
            <div className="border border-emerald-500/20 rounded-2xl overflow-hidden bg-emerald-500/5 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Sparkles size={16} className="text-emerald-600 animate-pulse" />
                  <span className="text-xs font-extrabold text-slate-800">Edweso AI Grading Evaluator</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const hw = homeworkAssignments.find(h => h.id === selectedSubmission.assignmentId);
                    if (hw) handleAiGradeEvaluation(selectedSubmission, hw);
                  }}
                  disabled={isGradingAi}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-all disabled:opacity-50"
                >
                  {isGradingAi ? 'Evaluating...' : 'Analyze with Edweso AI'}
                </button>
              </div>

              {aiGradeError && (
                <p className="text-xs font-bold text-rose-500">{aiGradeError}</p>
              )}
            </div>

            {/* Form Fields: Grade score and feedback */}
            <div className="grid grid-cols-3 gap-3.5 items-end">
              <div className="space-y-1 col-span-1">
                <label className="block text-[10px] uppercase font-black text-slate-400">Award Score</label>
                <input
                  type="number"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>

              <div className="p-2 bg-slate-100 text-slate-450 text-[10px] font-black rounded-lg text-center col-span-2 uppercase">
                / {homeworkAssignments.find(h => h.id === selectedSubmission.assignmentId)?.maxScore || 20} Max Score Points
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-black text-slate-400">Teacher's Critique & Feedback</label>
              <textarea
                rows={3}
                placeholder="Provide helpful evaluation tips, remarks, and encouragement..."
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold focus:outline-hidden"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl cursor-pointer flex items-center space-x-1.5 transition-all shadow-md"
              >
                <CheckCircle2 size={12} />
                <span>Save Assessment</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Homework Assignment"
        message="Are you sure you want to permanently delete this homework assignment and purge all student evaluation submissions associated with it? This operation is irreversible."
        onConfirm={confirmDeleteAssignment}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '' })}
      />
    </div>
  );
}
