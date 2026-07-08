import React, { useState } from 'react';
import { 
  FileText, Clipboard, Clock, CheckCircle2, AlertCircle, 
  Send, Sparkles, Upload, FileCheck, X, ChevronRight, HelpCircle
} from 'lucide-react';
import { HomeworkAssignment, HomeworkSubmission, UserSession, Student, Subject } from '../types';

interface StudentAssignmentsViewProps {
  session: UserSession;
  students: Student[];
  subjects: Subject[];
  homeworkAssignments: HomeworkAssignment[];
  homeworkSubmissions: HomeworkSubmission[];
  onUpdateHomeworkSubmissions: (subs: HomeworkSubmission[]) => void;
}

export default function StudentAssignmentsView({
  session,
  students,
  subjects,
  homeworkAssignments,
  homeworkSubmissions,
  onUpdateHomeworkSubmissions
}: StudentAssignmentsViewProps) {
  // Find current student's class
  const studentRec = students.find(s => s.id === session.id);
  const classId = studentRec ? studentRec.classId : 'c4'; // Default JHS 2

  // Filter assignments relevant to this student's class
  const classAssignments = homeworkAssignments.filter(hw => hw.classId === classId);

  // Modal / Submit state
  const [selectedAssignment, setSelectedAssignment] = useState<HomeworkAssignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [simulatedAttachment, setSimulatedAttachment] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Hint state
  const [isGeneratingHint, setIsGeneratingHint] = useState(false);
  const [aiHint, setAiHint] = useState('');
  const [aiError, setAiError] = useState('');

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSimulatedAttachment(file.name);
    }
  };

  // Trigger AI Tutor Hint helper
  const handleGetAiHint = async (assignment: HomeworkAssignment) => {
    setIsGeneratingHint(true);
    setAiHint('');
    setAiError('');
    try {
      const res = await fetch('/api/ai/homework-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: assignment.subjectName,
          assignmentTitle: assignment.title,
          assignmentDescription: assignment.description
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setAiHint(data.hint);
      } else {
        setAiError(data.error || 'Failed to retrieve academic hint.');
      }
    } catch (err) {
      console.error(err);
      setAiError('Network error connecting to Edweso AI Tutor.');
    } finally {
      setIsGeneratingHint(false);
    }
  };

  // Submit Homework Answer
  const handleOpenSubmit = (assignment: HomeworkAssignment) => {
    const existing = homeworkSubmissions.find(
      sub => sub.assignmentId === assignment.id && sub.studentId === session.id
    );
    setSelectedAssignment(assignment);
    setSubmissionText(existing ? existing.submissionText : '');
    setSimulatedAttachment(existing ? existing.fileAttachment || '' : '');
    setAiHint('');
    setAiError('');
  };

  const handleSubmitHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    if (!submissionText.trim()) {
      alert('Please write down your homework response before submitting.');
      return;
    }

    setIsSubmitting(true);

    const existingIndex = homeworkSubmissions.findIndex(
      sub => sub.assignmentId === selectedAssignment.id && sub.studentId === session.id
    );

    const updatedSubmissions = [...homeworkSubmissions];

    if (existingIndex > -1) {
      // Update existing submission
      updatedSubmissions[existingIndex] = {
        ...updatedSubmissions[existingIndex],
        submissionText,
        fileAttachment: simulatedAttachment || undefined,
        submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Submitted' // reset to submitted so teacher can re-grade
      };
    } else {
      // Create new submission
      const newSub: HomeworkSubmission = {
        id: 'sub-' + Date.now(),
        assignmentId: selectedAssignment.id,
        assignmentTitle: selectedAssignment.title,
        studentId: session.id,
        studentName: session.name,
        submissionText,
        fileAttachment: simulatedAttachment || undefined,
        submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Submitted'
      };
      updatedSubmissions.push(newSub);
    }

    onUpdateHomeworkSubmissions(updatedSubmissions);
    setIsSubmitting(false);
    setSelectedAssignment(null);
  };

  // Submissions count helpers
  const mySubmissions = homeworkSubmissions.filter(sub => sub.studentId === session.id);
  const pendingCount = classAssignments.filter(
    hw => !mySubmissions.some(sub => sub.assignmentId === hw.id)
  ).length;
  const gradedCount = mySubmissions.filter(sub => sub.status === 'Graded').length;

  return (
    <div className="space-y-6 animate-fade-in" id="student-homework-center">
      {/* 1. PORTAL HEADER */}
      <div className="pb-3 border-b border-slate-200/40 flex justify-between items-center">
        <div>
          <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-700">
              <Clipboard size={20} />
            </div>
            <span>My Homework & Submissions</span>
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Access assigned course tasks, request step-by-step AI hints, and view grades.
          </p>
        </div>
      </div>

      {/* 2. STATS OVERVIEW */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-700">
            <Clipboard size={20} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-slate-400">Assigned Tasks</div>
            <div className="text-xl font-extrabold text-slate-800">{classAssignments.length}</div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-700">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-slate-400">Pending Actions</div>
            <div className="text-xl font-extrabold text-slate-800">{pendingCount}</div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-slate-400">Graded & Reviewed</div>
            <div className="text-xl font-extrabold text-slate-800">{gradedCount}</div>
          </div>
        </div>
      </div>

      {/* 3. ASSIGNMENTS LIST */}
      <div className="space-y-4">
        <h3 className="text-xs uppercase font-black tracking-wider text-slate-400">Active Course Homework</h3>
        
        {classAssignments.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-slate-450">
            <FileText size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold">No homework assignments found for your class syllabus.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classAssignments.map(hw => {
              const submission = mySubmissions.find(sub => sub.assignmentId === hw.id);
              
              let statusLabel = 'Not Submitted';
              let statusColor = 'text-amber-700 bg-amber-50 border-amber-200/50';
              if (submission) {
                if (submission.status === 'Graded') {
                  statusLabel = `Graded: ${submission.score}/${hw.maxScore}`;
                  statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200/50';
                } else {
                  statusLabel = 'Submitted & Pending';
                  statusColor = 'text-indigo-700 bg-indigo-50 border-indigo-200/50';
                }
              }

              return (
                <div key={hw.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3.5 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full uppercase">
                        {hw.subjectName}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-extrabold text-slate-800 text-sm leading-snug">{hw.title}</h4>
                      <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-400 mt-1">
                        <Clock size={11} />
                        <span>Due Date: {hw.dueDate}</span>
                        <span>•</span>
                        <span>Max Score: {hw.maxScore} pts</span>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-slate-600 line-clamp-3 leading-relaxed">
                      {hw.description}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
                    {submission && submission.status === 'Graded' ? (
                      <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl w-full">
                        <div className="text-[10px] uppercase font-black text-slate-400 flex items-center space-x-1">
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          <span>Teacher Feedback</span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 mt-1 italic">
                          "{submission.feedback || 'Excellent work!'}"
                        </p>
                        <div className="text-[9px] font-bold text-slate-400 mt-1.5 flex justify-between">
                          <span>Graded by {submission.gradedBy}</span>
                          <span>{submission.gradedAt}</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenSubmit(hw)}
                        className="w-full text-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Send size={12} />
                        <span>{submission ? 'Edit Submission' : 'Draft & Submit Homework'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. WORKSPACE MODAL */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <form 
            onSubmit={handleSubmitHomework}
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto text-slate-800"
          >
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-full border border-indigo-100">
                  {selectedAssignment.subjectName} Workspace
                </span>
                <h3 className="font-display font-extrabold text-slate-800 text-base leading-snug mt-1.5">
                  {selectedAssignment.title}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedAssignment(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Assignment instructions */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-1.5">
              <h4 className="text-[10px] uppercase font-black text-slate-400">Assigned Homework Guidance:</h4>
              <p className="text-xs font-bold text-slate-600 leading-relaxed whitespace-pre-wrap">
                {selectedAssignment.description}
              </p>
            </div>

            {/* AI TUTOR WIDGET */}
            <div className="border border-emerald-500/20 rounded-2xl overflow-hidden bg-emerald-500/5 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Sparkles size={16} className="text-emerald-600 animate-pulse" />
                  <span className="text-xs font-extrabold text-slate-800">Edweso AI Academic Tutor</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleGetAiHint(selectedAssignment)}
                  disabled={isGeneratingHint}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-all disabled:opacity-50"
                >
                  {isGeneratingHint ? 'Tuning...' : 'Generate Step Hint'}
                </button>
              </div>

              {aiHint && (
                <div className="text-xs font-bold text-emerald-950 bg-emerald-50/50 p-3 rounded-xl border border-emerald-500/10 leading-relaxed whitespace-pre-wrap">
                  {aiHint}
                </div>
              )}
              {aiError && (
                <p className="text-xs font-bold text-rose-500">{aiError}</p>
              )}
            </div>

            {/* Response Area */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-black text-slate-400">Your Submission Draft</label>
              <textarea
                rows={5}
                placeholder="Write down your calculations, answers, or essays here..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/70 p-3 rounded-xl text-xs font-semibold focus:outline-hidden text-slate-800"
              />
            </div>

            {/* Simulated file uploader with Drag and Drop */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-black text-slate-400">Attach Document / Photo of homework (Simulated)</label>
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDragOver ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-200 hover:border-indigo-400 bg-slate-50'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  {simulatedAttachment ? (
                    <>
                      <FileCheck size={24} className="text-emerald-600" />
                      <span className="text-xs font-extrabold text-slate-700">{simulatedAttachment}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSimulatedAttachment('');
                        }}
                        className="text-[9px] font-black uppercase text-rose-500 mt-1 hover:underline"
                      >
                        Remove Attachment
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload size={24} className="text-slate-400" />
                      <span className="text-xs font-extrabold text-slate-600">Drag & Drop file solution here, or click to mock upload</span>
                      <span className="text-[10px] text-slate-400 font-bold">Supports PDF, PNG, JPG</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSimulatedAttachment(`hw_sheet_upload_${Date.now().toString().substring(8)}.pdf`);
                        }}
                        className="text-[10px] font-black uppercase text-indigo-600 mt-1 hover:underline"
                      >
                        Simulate File Choice
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Form Action row */}
            <div className="flex justify-end space-x-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl cursor-pointer flex items-center space-x-1.5 transition-all shadow-md disabled:opacity-50"
              >
                <Send size={12} />
                <span>{isSubmitting ? 'Submitting...' : 'Upload Submission'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
