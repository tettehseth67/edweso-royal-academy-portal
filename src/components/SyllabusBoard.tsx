import React, { useState } from 'react';
import { 
  FileSpreadsheet, Search, Filter, Plus, Calendar, BookOpen, 
  CheckSquare, ArrowDownToLine, Clock, Edit2, Trash2, X, Check, Save,
  Users, UserCheck, Award, GraduationCap, ClipboardCheck, Sparkles, 
  AlertCircle, ChevronRight, PenTool, Flame
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

  // Dual role perspective for student/parent dashboard
  const [viewMode, setViewMode] = useState<'student' | 'parent'>('student');

  // Checklist for student self-study (persisted locally)
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

  // Persistent Parent Verification Sign-offs
  const [parentLogs, setParentLogs] = useState<Record<string, Array<{ parentName: string; note: string; date: string }>>>(() => {
    try {
      const saved = localStorage.getItem(`syllabus_parent_verification_logs`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // State for parent submission form inside cards
  const [parentNames, setParentNames] = useState<Record<string, string>>({});
  const [parentNotes, setParentNotes] = useState<Record<string, string>>({});

  const handleAddParentLog = (planId: string, e: React.FormEvent) => {
    e.preventDefault();
    const name = parentNames[planId]?.trim() || '';
    const note = parentNotes[planId]?.trim() || '';

    if (!name) {
      alert('Parent/Guardian name is required for verification.');
      return;
    }

    const currentList = parentLogs[planId] || [];
    const newEntry = {
      parentName: name,
      note: note || 'Reviewed this weekly topic and verified my ward\'s study materials.',
      date: new Date().toLocaleString('en-US', { hour12: true, month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    const updated = {
      ...parentLogs,
      [planId]: [...currentList, newEntry]
    };
    
    setParentLogs(updated);
    try {
      localStorage.setItem(`syllabus_parent_verification_logs`, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    // Reset parent inputs for this card
    setParentNames(prev => ({ ...prev, [planId]: '' }));
    setParentNotes(prev => ({ ...prev, [planId]: '' }));
    alert('Verification submitted! The study guide session has been certified.');
  };

  const handleClearParentLogs = (planId: string) => {
    if (window.confirm('Are you sure you want to clear the parental verification history for this topic?')) {
      const updated = { ...parentLogs };
      delete updated[planId];
      setParentLogs(updated);
      try {
        localStorage.setItem(`syllabus_parent_verification_logs`, JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
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
  const [formScheduleDates, setFormScheduleDates] = useState('');

  // AI syllabus helper states
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSyllabusError, setAiSyllabusError] = useState('');

  const handleGenerateAiSyllabus = async () => {
    if (!formTopic.trim()) {
      alert('Please enter an Outline Topic Title first.');
      return;
    }
    setIsGeneratingAi(true);
    setAiSyllabusError('');
    const matchedSub = subjects.find(s => s.id === formSubjectId);
    const subName = matchedSub ? matchedSub.name : 'General Studies';
    try {
      const res = await fetch('/api/ai/generate-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectName: subName, topicTitle: formTopic })
      });
      const resData = await res.json();
      if (res.ok && resData.status === 'success' && resData.data) {
        const { learningObjectives, resources } = resData.data;
        if (learningObjectives && Array.isArray(learningObjectives)) {
          setFormObjectives(learningObjectives.join('\n'));
        }
        if (resources && Array.isArray(resources)) {
          setFormResources(resources.join('\n'));
        }
      } else {
        setAiSyllabusError(resData.error || 'Failed to auto-generate content.');
      }
    } catch (err) {
      console.error(err);
      setAiSyllabusError('Network error connecting to Edweso AI hub.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Open creation modal
  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormWeek(1);
    setFormSubjectId(subjects[0]?.id || '');
    setFormTopic('');
    setFormObjectives('');
    setFormResources('');
    setFormStatus('Scheduled');
    setFormScheduleDates('');
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (plan: SyllabusPlan) => {
    // Determine initial form strings by parsing possibly normalized arrays/objects
    const rawObjectives = plan.learningObjectives 
      ? plan.learningObjectives.join('\n') 
      : plan.objectives || '';
      
    const rawResources = plan.resources 
      ? plan.resources.join('\n') 
      : plan.studyMaterials || '';

    setEditingPlan(plan);
    setFormWeek(plan.weekNumber);
    setFormSubjectId(plan.subjectId);
    setFormTopic(plan.topicTitle || plan.topic || '');
    setFormObjectives(rawObjectives);
    setFormResources(rawResources);
    setFormStatus((plan.status as any) || 'Scheduled');
    setFormScheduleDates(plan.scheduleDates || '');
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
            topic: formTopic, // preserve legacy
            learningObjectives: objectivesArray,
            objectives: objectivesArray.join('\n'), // preserve legacy
            resources: resourcesArray,
            studyMaterials: resourcesArray.join(', '), // preserve legacy
            status: formStatus,
            scheduleDates: formScheduleDates || `Week ${formWeek}`
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
        topic: formTopic, // preserve legacy
        learningObjectives: objectivesArray,
        objectives: objectivesArray.join('\n'), // preserve legacy
        resources: resourcesArray,
        studyMaterials: resourcesArray.join(', '), // preserve legacy
        status: formStatus,
        scheduleDates: formScheduleDates || `Week ${formWeek}`
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

  // NORMALIZE PLANS list to prevent crashes on legacy mock values
  const normalizedPlans = syllabusPlans.map(plan => {
    const topicTitle = plan.topicTitle || plan.topic || 'Untitled Topic';
    
    let learningObjectives: string[] = [];
    if (plan.learningObjectives && plan.learningObjectives.length > 0) {
      learningObjectives = plan.learningObjectives;
    } else if (plan.objectives) {
      learningObjectives = plan.objectives
        .split('\n')
        .map(o => o.replace(/^\d+\.\s*/, '').trim())
        .filter(o => o.length > 0);
    } else {
      learningObjectives = ['Master basic course elements', 'Participate in classroom reviews'];
    }

    let resources: string[] = [];
    if (plan.resources && plan.resources.length > 0) {
      resources = plan.resources;
    } else if (plan.studyMaterials) {
      resources = plan.studyMaterials
        .split(/[,\n]/)
        .map(r => r.trim())
        .filter(r => r.length > 0);
    } else {
      resources = ['Assigned Class Reference Textbook'];
    }

    const scheduleDates = plan.scheduleDates || `Week ${plan.weekNumber}`;

    return {
      ...plan,
      topicTitle,
      learningObjectives,
      resources,
      scheduleDates,
      status: plan.status || 'Scheduled'
    };
  });

  // Filter calculations based on normalized fields
  const filteredPlans = normalizedPlans.filter(plan => {
    const matchesSearch = plan.topicTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          plan.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
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
      case 'Completed':
        return 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20';
      case 'In Progress':
        return 'text-amber-700 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  // Helper to calculate syllabus metrics
  const totalSyllabusCount = normalizedPlans.length;
  const inProgressCount = normalizedPlans.filter(p => p.status === 'In Progress').length;
  const completedSyllabusCount = normalizedPlans.filter(p => p.status === 'Complete' || p.status === 'Completed').length;

  return (
    <div className="space-y-6 animate-fade-in" id="syllabus-planner-digital-board">
      
      {/* 1. SECTION HEADER */}
      <div className="pb-3 border-b border-slate-200/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-700 dark:text-emerald-400">
              <FileSpreadsheet size={20} />
            </div>
            <span>Digital Syllabus & Weekly Lesson Board</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse class syllabus timelines, download secure teacher study materials, and complete parent study check-ins.
          </p>
        </div>

        {/* Action Controls based on Role */}
        <div className="flex items-center space-x-3 w-full sm:w-auto self-end sm:self-auto">
          {/* Dual Student-Parent view switch on pupil accounts */}
          {session.role === 'student' && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200/50 dark:border-slate-800 text-xs shrink-0 font-bold">
              <button
                onClick={() => setViewMode('student')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1 ${
                  viewMode === 'student' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <GraduationCap size={13} />
                <span>Student Mode</span>
              </button>
              <button
                onClick={() => setViewMode('parent')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1 ${
                  viewMode === 'parent' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                id="btn-parent-mode-toggle"
              >
                <Users size={13} />
                <span>Parent Mode</span>
              </button>
            </div>
          )}

          {/* Create button for teachers & admins */}
          {(session.role === 'teacher' || session.role === 'admin') && (
            <button
              onClick={handleOpenCreate}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-all shadow-md flex items-center space-x-1 cursor-pointer"
              id="btn-syllabus-create-outline"
            >
              <Plus size={14} />
              <span>Schedule New Lesson</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. DYNAMIC TIMELINE CURRICULUM TIMELINE (WEEKS 1-12) */}
      <div className={`p-4 rounded-2xl border ${
        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
            <Calendar size={13} />
            <span className="text-[10px] uppercase font-bold tracking-widest">Academic Calendar Timeline</span>
          </div>
          <div className="flex space-x-3 text-[10px] font-bold">
            <span className="flex items-center space-x-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> <span className="text-slate-400">Completed</span></span>
            <span className="flex items-center space-x-1"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> <span className="text-slate-400">In Progress</span></span>
            <span className="flex items-center space-x-1"><span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></span> <span className="text-slate-400">Scheduled</span></span>
          </div>
        </div>

        {/* Timeline Grid Buttons */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(wk => {
            const wkPlans = normalizedPlans.filter(p => p.weekNumber === wk);
            const isSelected = selectedWeek === wk.toString();
            
            // Determine combined status color of the week
            let indicatorColor = 'bg-slate-300 dark:bg-slate-700';
            if (wkPlans.some(p => p.status === 'In Progress')) {
              indicatorColor = 'bg-amber-500';
            } else if (wkPlans.length > 0 && wkPlans.every(p => p.status === 'Complete' || p.status === 'Completed')) {
              indicatorColor = 'bg-emerald-500';
            } else if (wkPlans.length > 0) {
              indicatorColor = 'bg-slate-400 dark:bg-slate-500';
            }

            return (
              <button
                key={wk}
                onClick={() => setSelectedWeek(selectedWeek === wk.toString() ? 'all' : wk.toString())}
                className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-between space-y-1.5 hover:scale-[1.03] ${
                  isSelected 
                    ? 'bg-emerald-600/10 border-emerald-600 text-emerald-800 dark:text-emerald-300' 
                    : isDarkMode 
                      ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-[10px] font-black font-mono">Wk {wk}</span>
                <span className={`w-2 h-2 rounded-full ${indicatorColor}`}></span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. METRIC TILES SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Total Syllabus Topics</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{totalSyllabusCount}</p>
          </div>
          <div className="p-2.5 bg-indigo-500/10 rounded-lg text-indigo-600">
            <BookOpen size={16} />
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Active Week / In Progress</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{inProgressCount}</p>
          </div>
          <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-600">
            <Clock size={16} />
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Curriculum Completed</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{completedSyllabusCount}</p>
          </div>
          <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-600">
            <CheckSquare size={16} />
          </div>
        </div>
      </div>

      {/* 4. FILTER & SEARCH CONTROLS */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row gap-3 items-center justify-between ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search syllabus topic or course name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 py-2 pl-9 pr-4 rounded-lg text-xs font-semibold focus:outline-hidden text-slate-700 dark:text-slate-200"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Clear Filter Indicator */}
          {(selectedWeek !== 'all' || selectedSubjectId !== 'all' || searchTerm !== '') && (
            <button
              onClick={() => {
                setSelectedWeek('all');
                setSelectedSubjectId('all');
                setSearchTerm('');
              }}
              className="px-2.5 py-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 rounded-lg hover:bg-emerald-500/5 cursor-pointer flex items-center space-x-1"
            >
              <X size={10} />
              <span>Reset Filters</span>
            </button>
          )}

          {/* Week Selector */}
          <div className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-1.5 rounded-lg shrink-0">
            <Calendar size={12} className="text-slate-400 ml-1" />
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="bg-transparent border-0 text-xs font-bold focus:outline-hidden cursor-pointer text-slate-700 dark:text-slate-300"
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
              className="bg-transparent border-0 text-xs font-bold focus:outline-hidden cursor-pointer max-w-[150px] text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Courses</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 5. SYLLABUS GRID CARDS */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-16 text-slate-400 italic text-xs font-semibold bg-white dark:bg-slate-900 border rounded-2xl">
          No weekly lesson plans or syllabus logs match the selected filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => {
            const checkedCount = plan.learningObjectives.filter((_, idx) => completedObjectives[`${plan.id}_${idx}`]).length;
            const progressPercent = Math.round((checkedCount / (plan.learningObjectives.length || 1)) * 100);
            
            // Get parent log entries for this plan
            const thisCardParentLogs = parentLogs[plan.id] || [];

            return (
              <div 
                key={plan.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all hover:shadow-lg ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                } relative`}
              >
                {/* Active Indicator Pulse for In Progress topics */}
                {plan.status === 'In Progress' && (
                  <div className="absolute top-0 right-10 -translate-y-1/2 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                    <span>Active Topic</span>
                  </div>
                )}

                {/* Card Top Block */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-700 dark:text-emerald-400 font-mono flex items-center space-x-1">
                      <span>Week {plan.weekNumber} Plan</span>
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${getStatusColor(plan.status)}`}>
                      {plan.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-sans text-[10px] text-slate-400 font-black uppercase tracking-wider">{plan.subjectName}</h3>
                    <h4 className="font-display font-extrabold text-sm text-slate-800 dark:text-white mt-0.5 leading-snug">
                      {plan.topicTitle}
                    </h4>
                  </div>

                  {/* Scheduled Calendar Date Range */}
                  <div className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-md border border-slate-100 dark:border-slate-800/60 w-fit">
                    <Calendar size={11} className="text-emerald-600" />
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                      Scheduled: <strong className="text-slate-700 dark:text-slate-300">{plan.scheduleDates}</strong>
                    </span>
                  </div>
                </div>

                {/* Learning Objectives Checklist */}
                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">
                    <span>Target Objectives Checkpoints</span>
                    {session.role === 'student' && viewMode === 'student' && (
                      <span className="font-mono text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">{progressPercent}% Mastered</span>
                    )}
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {plan.learningObjectives.map((obj, idx) => {
                      const isChecked = completedObjectives[`${plan.id}_${idx}`];
                      // Students can toggle checkpoints, or parents in parent view to see status
                      const canToggle = session.role === 'student' && viewMode === 'student';

                      return (
                        <div 
                          key={idx} 
                          onClick={() => canToggle && handleToggleObjective(plan.id, idx)}
                          className={`flex items-start space-x-2 p-1.5 rounded text-[11px] ${
                            canToggle ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/40' : ''
                          }`}
                        >
                          <span className={`p-0.5 rounded shrink-0 border mt-0.5 transition-all ${
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
                </div>

                {/* PARENT/GUARDIAN SIGN-OFF PORTAL IN DUAL VIEW MODE */}
                {session.role === 'student' && viewMode === 'parent' && (
                  <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/2 rounded-xl border border-emerald-500/20 space-y-2 pt-2">
                    <div className="flex items-center space-x-1 text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">
                      <Users size={12} />
                      <span>Parent Sign-Off & Verification</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Confirm you have guided your ward through these materials. This logs your review instantly.
                    </p>

                    <form onSubmit={(e) => handleAddParentLog(plan.id, e)} className="space-y-2">
                      <div className="grid grid-cols-1 gap-1.5">
                        <input
                          type="text"
                          required
                          placeholder="Your Name (Parent/Guardian Signature)"
                          value={parentNames[plan.id] || ''}
                          onChange={(e) => setParentNames(prev => ({ ...prev, [plan.id]: e.target.value }))}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden"
                        />
                        <input
                          type="text"
                          placeholder="Optional study notes (e.g. Practiced algebraic roots)"
                          value={parentNotes[plan.id] || ''}
                          onChange={(e) => setParentNotes(prev => ({ ...prev, [plan.id]: e.target.value }))}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-2 py-1 rounded text-[10px] font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider py-1 rounded transition-colors cursor-pointer"
                      >
                        Sign-off & Certify Progress
                      </button>
                    </form>
                  </div>
                )}

                {/* PARENT HISTORY LOGGER WITHIN CARD */}
                {thisCardParentLogs.length > 0 && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800/80 space-y-1.5 max-h-24 overflow-y-auto">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold flex items-center space-x-1">
                        <ClipboardCheck size={10} className="text-emerald-500" />
                        <span>Guardian Verifications ({thisCardParentLogs.length})</span>
                      </span>
                      {session.role === 'student' && viewMode === 'parent' && (
                        <button 
                          onClick={() => handleClearParentLogs(plan.id)}
                          className="text-[8px] text-rose-500 hover:underline font-bold"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {thisCardParentLogs.map((log, lIdx) => (
                      <div key={lIdx} className="text-[9px] border-b last:border-b-0 pb-1.5 mb-1.5 last:pb-0 last:mb-0 border-slate-200/40 text-slate-500 dark:text-slate-400">
                        <div className="flex justify-between items-center">
                          <strong className="text-slate-700 dark:text-slate-300">{log.parentName}</strong>
                          <span className="text-[8px] font-mono text-slate-400">{log.date}</span>
                        </div>
                        <p className="italic mt-0.5 leading-snug">{log.note}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Resources & Actions footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
                  {plan.resources.length > 0 && (
                    <div className="space-y-1 text-[10px]">
                      <span className="text-slate-400 uppercase font-black block">Study Materials Attached</span>
                      <div className="flex flex-wrap gap-1.5">
                        {plan.resources.map((res, idx) => (
                          <span key={idx} className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/80 px-2 py-0.5 rounded font-mono text-[9px] font-bold text-slate-500 dark:text-slate-400 max-w-full truncate">
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
                        className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] rounded-md flex items-center space-x-1 cursor-pointer transition-all"
                      >
                        <ArrowDownToLine size={10} />
                        <span>Download Pack</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No notes attached</span>
                    )}

                    {/* Editor actions for teacher or admin */}
                    {(session.role === 'teacher' || session.role === 'admin') && (
                      <div className="flex items-center space-x-1.5 shrink-0">
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

      {/* 6. MODAL FOR RECORDING / EDITING OUTLINE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <form 
            onSubmit={handleSubmitSyllabus}
            className={`p-6 rounded-2xl shadow-2xl max-w-md w-full border space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex justify-between items-center border-b pb-2.5 dark:border-slate-800">
              <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                <PenTool size={14} className="text-emerald-600" />
                <span>{editingPlan ? 'Edit Syllabus Lesson' : 'Schedule Weekly Topic'}</span>
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
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-2 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200"
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
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-2 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Topic input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] uppercase font-black text-slate-400">Outline Topic Title</label>
                <button
                  type="button"
                  onClick={handleGenerateAiSyllabus}
                  disabled={isGeneratingAi}
                  className="flex items-center space-x-1 text-[9px] font-black uppercase bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 px-2 py-1 rounded-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={10} className={isGeneratingAi ? "animate-spin text-emerald-600" : "text-emerald-600"} />
                  <span>{isGeneratingAi ? 'Generating...' : 'Edweso AI Gen'}</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. Quadratic Equations & Graphs"
                value={formTopic}
                onChange={(e) => setFormTopic(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-2 rounded-lg text-xs font-bold focus:outline-hidden text-slate-800 dark:text-slate-200"
              />
              {aiSyllabusError && (
                <p className="text-[9px] text-rose-500 font-bold mt-0.5">{aiSyllabusError}</p>
              )}
            </div>

            {/* Schedule Date Ranges Input */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-black text-slate-400">
                Scheduled Dates (e.g. July 6 - July 10, 2026)
              </label>
              <input
                type="text"
                placeholder="e.g. July 6 – July 10, 2026"
                value={formScheduleDates}
                onChange={(e) => setFormScheduleDates(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-2 rounded-lg text-xs font-bold focus:outline-hidden text-slate-800 dark:text-slate-200"
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
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-2 rounded-lg text-xs font-semibold focus:outline-hidden text-slate-800 dark:text-slate-200"
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
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-2 rounded-lg text-xs font-mono font-bold focus:outline-hidden text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Status Option */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-black text-slate-400">Syllabus Progress Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-2 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200"
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
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 rounded text-xs font-bold transition-all dark:border-slate-800 cursor-pointer text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded transition-all shadow-md flex items-center space-x-1 cursor-pointer"
              >
                <Save size={12} />
                <span>Save Topic</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
