import React, { useState } from 'react';
import { 
  FileSpreadsheet, Search, Filter, Plus, Calendar, BookOpen, 
  CheckSquare, ArrowDownToLine, Clock, Edit2, Trash2, X, Check, Save 
} from 'lucide-react';
import { SyllabusPlan, Subject, UserSession } from '../types';

interface SyllabusBoardProps {
  session: UserSession;
  subjects: Subject[];
  syllabusPlans: SyllabusPlan[];
  onUpdateSyllabusPlans: (updated: SyllabusPlan[]) => void;
  isDarkMode: boolean;
}

export default function SyllabusBoard({
  session,
  subjects,
  syllabusPlans,
  onUpdateSyllabusPlans,
  isDarkMode
}: SyllabusBoardProps) {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');

  // Checklist for student self-study (persisted locally in local state/localStorage)
  const [completedObjectives, setCompletedObjectives] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`syllabus_obj_checklist_${session.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleToggleObjective = (syllabusId: string, index: number) => {
    const key = `${syllabusId}_${index}`;
    const updated = { ...completedObjectives, [key]: !completedObjectives[key] };
    setCompletedObjectives(updated);
    try {
      localStorage.setItem(`syllabus_obj_checklist_${session.id}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  // Syllabus Creator/Editor modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SyllabusPlan | null>(null);

  // Form states
  const [formWeek, setFormWeek] = useState<number>(1);
  const [formSubjectId, setFormSubjectId] = useState<string>(subjects[0]?.id || '');
  const [formTopic, setFormTopic] = useState('');
  const [formObjectives, setFormObjectives] = useState('');
  const [formResources, setFormResources] = useState('');
  const [formStatus, setFormStatus] = useState<'Scheduled' | 'In Progress' | 'Complete'>('Scheduled');

  // Open creation modal
  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormWeek(1);
    setFormSubjectId(subjects[0]?.id || '');
    setFormTopic('');
    setFormObjectives('');
    setFormResources('');
    setFormStatus('Scheduled');
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (plan: SyllabusPlan) => {
    setEditingPlan(plan);
    setFormWeek(plan.weekNumber);
    setFormSubjectId(plan.subjectId);
    setFormTopic(plan.topicTitle);
    setFormObjectives(plan.learningObjectives.join('\n'));
    setFormResources(plan.resources.join('\n'));
    setFormStatus(plan.status);
    setIsModalOpen(true);
  };

  // Save/Submit Form
  const handleSubmitSyllabus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTopic.trim()) {
      alert('Topic title is required.');
      return;
    }

    const objectivesArray = formObjectives
      .split('\n')
      .map(o => o.trim())
      .filter(o => o.length > 0);

    const resourcesArray = formResources
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    const matchSubject = subjects.find(s => s.id === formSubjectId);
    const subjectName = matchSubject ? matchSubject.name : 'Unknown Subject';

    if (editingPlan) {
      // Edit mode
      const updated = syllabusPlans.map(p => {
        if (p.id === editingPlan.id) {
          return {
            ...p,
            weekNumber: formWeek,
            subjectId: formSubjectId,
            subjectName,
            topicTitle: formTopic,
            learningObjectives: objectivesArray,
            resources: resourcesArray,
            status: formStatus
          };
        }
        return p;
      });
      onUpdateSyllabusPlans(updated);
    } else {
      // Create mode
      const newPlan: SyllabusPlan = {
        id: 'syllabus-new-' + Date.now(),
        weekNumber: formWeek,
        subjectId: formSubjectId,
        subjectName,
        topicTitle: formTopic,
        learningObjectives: objectivesArray,
        resources: resourcesArray,
        status: formStatus
      };
      onUpdateSyllabusPlans([newPlan, ...syllabusPlans]);
    }

    setIsModalOpen(false);
    setEditingPlan(null);
  };

  // Delete outline
  const handleDeleteSyllabus = (id: string) => {
    if (window.confirm('Are you sure you want to delete this syllabus outline? This cannot be undone.')) {
      const filtered = syllabusPlans.filter(p => p.id !== id);
      onUpdateSyllabusPlans(filtered);
    }
  };

  // Filter calculations
  const filteredPlans = syllabusPlans.filter(plan => {
    const matchesSearch = (plan.topicTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (plan.subjectName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWeek = selectedWeek === 'all' || plan.weekNumber.toString() === selectedWeek;
    const matchesSubject = selectedSubjectId === 'all' || plan.subjectId === selectedSubjectId;
    return matchesSearch && matchesWeek && matchesSubject;
  });

  // Simulated download handler
  const handleDownloadStudyPack = (topic: string, subject: string) => {
    alert(`Starting simulated secure download of study guide pack for [${subject} - ${topic}]. \nDownloaded file: edweso_curriculum_wk_notes_${topic.replace(/\s+/g, '_').toLowerCase()}.pdf`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20';
      case 'In Progress':
        return 'text-amber-700 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="syllabus-planner-digital-board">
      
      {/* 1. SECTION HEADER */}
      <div className="pb-2 border-b border-slate-200/40 flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center space-x-1.5">
            <FileSpreadsheet className="text-emerald-700" size={20} />
            <span>Digital Syllabus & Weekly Lesson Boards</span>
          </h2>
          <p className="text-xs text-slate-400">View class curriculums, learning checkpoints, and securely access lecture guides.</p>
        </div>

        {/* Create button for teachers & admins */}
        {(session.role === 'teacher' || session.role === 'admin') && (
          <button
            onClick={handleOpenCreate}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
            id="btn-syllabus-create-outline"
          >
            <Plus size={14} />
            <span>Record Weekly Outline</span>
          </button>
        )}
      </div>

      {/* 2. FILTER & SEARCH CONTROLS */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row gap-3 items-center justify-between ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search outline topic or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 py-2 pl-9 pr-4 rounded-lg text-xs font-semibold focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Week Selector */}
          <div className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-1.5 rounded-lg shrink-0">
            <Calendar size={12} className="text-slate-400 ml-1" />
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="bg-transparent border-0 text-xs font-bold focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Weeks</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(wk => (
                <option key={wk} value={wk}>Week {wk}</option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-1.5 rounded-lg shrink-0">
            <BookOpen size={12} className="text-slate-400 ml-1" />
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="bg-transparent border-0 text-xs font-bold focus:outline-hidden cursor-pointer max-w-[150px]"
            >
              <option value="all">All Courses</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. SYLLABUS GRID CARDS */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-16 text-slate-400 italic text-xs font-semibold bg-white dark:bg-slate-900 border rounded-2xl">
          No weekly lesson plans or syllabus logs match the selected filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => {
            const checkedCount = plan.learningObjectives.filter((_, idx) => completedObjectives[`${plan.id}_${idx}`]).length;
            const progressPercent = Math.round((checkedCount / (plan.learningObjectives.length || 1)) * 100);

            return (
              <div 
                key={plan.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                }`}
              >
                {/* Card Top Block */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-700 font-mono">
                      Week {plan.weekNumber} Curriculum
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${getStatusColor(plan.status)}`}>
                      {plan.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-sans text-[10px] text-slate-400 font-bold uppercase">{plan.subjectName}</h3>
                    <h4 className="font-display font-extrabold text-sm text-slate-800 dark:text-white mt-0.5 leading-snug">{plan.topicTitle}</h4>
                  </div>
                </div>

                {/* Checklist (Self Study Progress) */}
                <div className="space-y-2 pt-2 border-t border-slate-150 dark:border-slate-800">
                  <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">
                    <span>Learning Objectives Checkpoints</span>
                    {session.role === 'student' && <span className="font-mono text-emerald-600">{progressPercent}% Mastered</span>}
                  </div>

                  {plan.learningObjectives.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No checklist checkpoints declared for this topic.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {plan.learningObjectives.map((obj, idx) => {
                        const isChecked = completedObjectives[`${plan.id}_${idx}`];
                        return (
                          <div 
                            key={idx} 
                            onClick={() => session.role === 'student' && handleToggleObjective(plan.id, idx)}
                            className={`flex items-start space-x-2 p-1.5 rounded text-[11px] ${
                              session.role === 'student' ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/40' : ''
                            }`}
                          >
                            <span className={`p-0.5 rounded shrink-0 border mt-0.5 transition-colors ${
                              isChecked 
                                ? 'bg-emerald-600 border-emerald-600 text-white' 
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200/60 text-transparent'
                            }`}>
                              <Check size={10} />
                            </span>
                            <span className={`leading-snug transition-all ${
                              isChecked ? 'text-slate-400 line-through font-medium' : 'text-slate-600 dark:text-slate-300 font-semibold'
                            }`}>
                              {obj}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Resources & Actions footer */}
                <div className="pt-3 border-t border-slate-150 dark:border-slate-800 space-y-3">
                  {plan.resources.length > 0 && (
                    <div className="space-y-1 text-[10px]">
                      <span className="text-slate-400 uppercase font-black block">Study Materials Available</span>
                      <div className="flex flex-wrap gap-1.5">
                        {plan.resources.map((res, idx) => (
                          <span key={idx} className="bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded font-mono text-[9px] font-bold text-slate-500 dark:text-slate-400 max-w-full truncate">
                            {res}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    {/* Student download button */}
                    {plan.resources.length > 0 ? (
                      <button
                        onClick={() => handleDownloadStudyPack(plan.topicTitle, plan.subjectName)}
                        className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] rounded flex items-center space-x-1 cursor-pointer"
                      >
                        <ArrowDownToLine size={10} />
                        <span>Download Study Guide</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No notes uploaded</span>
                    )}

                    {/* Editor actions for teacher or admin */}
                    {(session.role === 'teacher' || session.role === 'admin') && (
                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => handleOpenEdit(plan)}
                          className="p-1 text-slate-400 hover:text-teal-600 rounded cursor-pointer"
                          title="Edit Syllabus Outline"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteSyllabus(plan.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Delete Lesson Plan"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL FOR RECORDING / EDITING OUTLINE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <form 
            onSubmit={handleSubmitSyllabus}
            className={`p-6 rounded-2xl shadow-2xl max-w-md w-full border space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex justify-between items-center border-b pb-2.5">
              <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">
                {editingPlan ? 'Edit Syllabus Lesson Record' : 'Record Weekly Lesson Outline'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white font-extrabold text-sm cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Week & Subject Row */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-black text-slate-400">Week Number</label>
                <select
                  value={formWeek}
                  onChange={(e) => setFormWeek(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-2 rounded-lg text-xs font-bold"
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(wk => (
                    <option key={wk} value={wk}>Week {wk}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-black text-slate-400">Class Course</label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-2 rounded-lg text-xs font-bold"
                >
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Topic input */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-black text-slate-400">Outline Topic Title</label>
              <input
                type="text"
                placeholder="e.g. Quadratic Equations & Graphs"
                value={formTopic}
                onChange={(e) => setFormTopic(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-2 rounded-lg text-xs font-bold focus:outline-hidden"
              />
            </div>

            {/* Objectives textarea */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-black text-slate-400">Learning Objectives (One per line)</label>
              <textarea
                placeholder="e.g. Find quadratic roots factoring&#10;Plot graphs coordinate plane&#10;Solve vertex equations"
                value={formObjectives}
                onChange={(e) => setFormObjectives(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-2 rounded-lg text-xs font-semibold focus:outline-hidden"
              />
            </div>

            {/* Study Materials Resources textarea */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-black text-slate-400">Study Materials / Notes PDF Refs (One per line)</label>
              <textarea
                placeholder="e.g. quadratic_roots_cheatsheet.pdf&#10;wk_4_lecture_presentation.pdf"
                value={formResources}
                onChange={(e) => setFormResources(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-2 rounded-lg text-xs font-mono font-bold focus:outline-hidden"
              />
            </div>

            {/* Status Option */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-black text-slate-400">Syllabus Progress Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-2 rounded-lg text-xs font-bold"
              >
                <option value="Scheduled">Scheduled (Not started)</option>
                <option value="In Progress">In Progress (Active Week)</option>
                <option value="Complete">Complete (Closed block)</option>
              </select>
            </div>

            {/* Form actions */}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-150 rounded text-xs font-bold transition-all dark:border-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
              >
                <Save size={12} />
                <span>Save Outline</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
