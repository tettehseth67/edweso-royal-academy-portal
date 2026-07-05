import React, { useState, useEffect } from 'react';
import { 
  Award, Calculator, TrendingUp, HelpCircle, ChevronRight, 
  CheckCircle2, AlertTriangle, GraduationCap, RotateCcw, Sparkles, Info 
} from 'lucide-react';
import { Student, ExamGrade, Subject } from '../types';

interface GradeProjectionToolProps {
  student: Student;
  studentGrades: ExamGrade[];
  studentSubjects: Subject[];
}

interface HypotheticalScore {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  classScore: number; // 0 - 30
  examScore: number;  // 0 - 70
  isRecorded: boolean;
}

export default function GradeProjectionTool({
  student,
  studentGrades,
  studentSubjects
}: GradeProjectionToolProps) {
  // Main Navigation Tab
  const [activeCalculatorTab, setActiveCalculatorTab] = useState<'single' | 'gpa'>('single');

  // ==================== TAB 1: WHAT-IF SINGLE COURSE STATES & LOGIC ====================
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(studentSubjects[0]?.id || '');
  const [targetGrade, setTargetGrade] = useState<number>(80); // Target total score (A)
  const [customClassScore, setCustomClassScore] = useState<number>(24); // out of 30

  // Update customClassScore when subject changes
  const activeSubject = studentSubjects.find(s => s.id === selectedSubjectId);
  const activeGradeRecord = studentGrades.find(g => g.subjectId === selectedSubjectId);

  useEffect(() => {
    if (activeGradeRecord) {
      setCustomClassScore(activeGradeRecord.classScore);
    } else {
      setCustomClassScore(22); // Default estimate
    }
  }, [selectedSubjectId, activeGradeRecord]);

  // Calculations for Tab 1
  const examNeeded = Math.max(0, targetGrade - customClassScore);
  const examPercent = Math.round((examNeeded / 70) * 100);
  const isImpossible = examNeeded > 70;
  const alreadyAchieved = examNeeded <= 0;

  // Mock trend data points for consecutive assessments across weeks (Term Continuous Assessment blocks)
  const averageGradeScore = studentGrades.length > 0 
    ? Math.round(studentGrades.reduce((acc, curr) => acc + curr.totalScore, 0) / studentGrades.length)
    : 75;

  const trendPoints = [
    { block: 'Quiz Block I', score: Math.max(40, averageGradeScore - 8), date: 'Wk 3 Assessment' },
    { block: 'Mid-Term Exam', score: Math.max(40, averageGradeScore - 3), date: 'Wk 6 Assessment' },
    { block: 'Quiz Block II', score: Math.max(40, averageGradeScore + 2), date: 'Wk 9 Assessment' },
    { block: 'Final Term-End', score: averageGradeScore, date: 'Term Final Release' }
  ];

  // SVG Chart layout calculations
  const chartHeight = 160;
  const chartWidth = 500;
  const padding = 35;
  const graphHeight = chartHeight - padding * 2;
  const graphWidth = chartWidth - padding * 2;

  const maxScore = 100;
  const minScore = 30;

  const getX = (index: number) => padding + (index * graphWidth) / (trendPoints.length - 1);
  const getY = (score: number) => {
    const ratio = (score - minScore) / (maxScore - minScore);
    return chartHeight - padding - ratio * graphHeight;
  };

  // Generate SVG path coordinate strings
  let linePath = '';
  let areaPath = '';
  if (trendPoints.length > 0) {
    linePath = `M ${getX(0)} ${getY(trendPoints[0].score)}`;
    areaPath = `M ${getX(0)} ${chartHeight - padding}`;
    trendPoints.forEach((p, idx) => {
      linePath += ` L ${getX(idx)} ${getY(p.score)}`;
      areaPath += ` L ${getX(idx)} ${getY(p.score)}`;
    });
    areaPath += ` L ${getX(trendPoints.length - 1)} ${chartHeight - padding} Z`;
  }

  // ==================== TAB 2: TERM-WIDE GPA PLANNING LOGIC ====================
  const [hypotheticalScores, setHypotheticalScores] = useState<HypotheticalScore[]>([]);

  // Helper: Get letter grade and visual style for any score
  const getLetterGrade = (score: number) => {
    if (score >= 80) return { char: 'A', label: 'Excellent', color: 'text-emerald-700 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/5 border-emerald-500/20' };
    if (score >= 70) return { char: 'B', label: 'Very Good', color: 'text-teal-700 bg-teal-500/10 dark:text-teal-400 dark:bg-teal-500/5 border-teal-500/20' };
    if (score >= 60) return { char: 'C', label: 'Credit', color: 'text-amber-700 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/5 border-amber-500/20' };
    if (score >= 50) return { char: 'D', label: 'Pass', color: 'text-yellow-600 bg-yellow-500/10 dark:text-yellow-500/5 border-yellow-500/20' };
    if (score >= 40) return { char: 'E', label: 'Weak Pass', color: 'text-orange-600 bg-orange-500/10 dark:text-orange-500/5 border-orange-500/20' };
    return { char: 'F', label: 'Fail', color: 'text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/5 border-rose-500/20' };
  };

  // Helper: Convert score to standard Ghana Basic/Secondary continuous Grade Point (4.0 scale)
  const getGradePoint = (score: number) => {
    if (score >= 80) return 4.0; // A
    if (score >= 70) return 3.0; // B
    if (score >= 60) return 2.0; // C
    if (score >= 50) return 1.0; // D
    if (score >= 40) return 0.5; // E
    return 0.0; // F
  };

  // Initialize hypothetical scores
  useEffect(() => {
    const initial = studentSubjects.map(sub => {
      const actual = studentGrades.find(g => g.subjectId === sub.id);
      return {
        subjectId: sub.id,
        subjectName: sub.name,
        subjectCode: sub.code || 'SUB',
        classScore: actual ? actual.classScore : 20, // default if not graded
        examScore: actual ? actual.examScore : 45,   // default if not graded
        isRecorded: !!actual
      };
    });
    setHypotheticalScores(initial);
  }, [studentSubjects, studentGrades]);

  // Reset all to actual recorded scores (or default estimates)
  const handleResetToActual = () => {
    const reset = studentSubjects.map(sub => {
      const actual = studentGrades.find(g => g.subjectId === sub.id);
      return {
        subjectId: sub.id,
        subjectName: sub.name,
        subjectCode: sub.code || 'SUB',
        classScore: actual ? actual.classScore : 20,
        examScore: actual ? actual.examScore : 45,
        isRecorded: !!actual
      };
    });
    setHypotheticalScores(reset);
  };

  // Model a peak perfect term performance
  const handleModelPerfectTerm = () => {
    const perfect = hypotheticalScores.map(hs => ({
      ...hs,
      classScore: 30,
      examScore: 70
    }));
    setHypotheticalScores(perfect);
  };

  // Update a single hypothetical grade
  const handleUpdateHypothetical = (subjectId: string, field: 'classScore' | 'examScore', val: number) => {
    setHypotheticalScores(prev => prev.map(item => {
      if (item.subjectId === subjectId) {
        return {
          ...item,
          [field]: val
        };
      }
      return item;
    }));
  };

  // Revert a single subject to its original recorded grade
  const handleRevertSubject = (subjectId: string) => {
    const actual = studentGrades.find(g => g.subjectId === subjectId);
    setHypotheticalScores(prev => prev.map(item => {
      if (item.subjectId === subjectId) {
        return {
          ...item,
          classScore: actual ? actual.classScore : 20,
          examScore: actual ? actual.examScore : 45
        };
      }
      return item;
    }));
  };

  // Actual term GPA (based only on already recorded grades)
  const gradedSubjectsCount = studentGrades.length;
  const actualGPAPointsSum = studentGrades.reduce((acc, curr) => acc + getGradePoint(curr.totalScore), 0);
  const actualGPA = gradedSubjectsCount > 0
    ? Number((actualGPAPointsSum / gradedSubjectsCount).toFixed(2))
    : 0.0;

  // Projected term GPA (calculated across ALL subjects using sliders)
  const projectedGPAPointsSum = hypotheticalScores.reduce((acc, curr) => {
    const total = curr.classScore + curr.examScore;
    return acc + getGradePoint(total);
  }, 0);
  const projectedGPA = hypotheticalScores.length > 0
    ? Number((projectedGPAPointsSum / hypotheticalScores.length).toFixed(2))
    : 0.0;

  // GPA Improvement/Boost calculation
  const gpaDifference = Number((projectedGPA - actualGPA).toFixed(2));

  // Visual honor designation based on GPA
  const getHonorDesignation = (gpa: number) => {
    if (gpa >= 3.6) return { title: 'First Class Honors', color: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/5', badge: 'bg-emerald-600', text: 'text-emerald-600', stroke: '#059669', description: "Principal's Honor List Outstanding" };
    if (gpa >= 3.0) return { title: 'Second Class Upper', color: 'text-teal-700 bg-teal-500/10 border-teal-500/20 dark:text-teal-400 dark:bg-teal-500/5', badge: 'bg-teal-600', text: 'text-teal-600', stroke: '#0d9488', description: "Honor Roll Standing" };
    if (gpa >= 2.0) return { title: 'Second Class Lower', color: 'text-amber-700 bg-amber-500/10 border-amber-500/20 dark:text-amber-400 dark:bg-amber-500/5', badge: 'bg-amber-600', text: 'text-amber-600', stroke: '#d97706', description: "Satisfactory Academic Progress" };
    if (gpa >= 1.0) return { title: 'Pass Standard', color: 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20 dark:text-yellow-500/5', badge: 'bg-yellow-500', text: 'text-yellow-600', stroke: '#ca8a04', description: "Minimum Standard Cleared" };
    return { title: 'Academic Focus Required', color: 'text-rose-600 bg-rose-500/10 border-rose-500/20 dark:text-rose-400 dark:bg-rose-500/5', badge: 'bg-rose-600', text: 'text-rose-600', stroke: '#dc2626', description: "Advisory Guidance Recommended" };
  };

  const honorInfo = getHonorDesignation(projectedGPA);

  // Personalized dynamic Dean remarks based on projection
  const getDeanAdvice = (gpa: number) => {
    if (gpa >= 3.8) {
      return "Phenomenal academic command! Your projected targets place you at the highest tier of the Principal's Honor List. Continue reviewing your core topics and assist peers to cement your understanding.";
    }
    if (gpa >= 3.5) {
      return "Superb trajectory! You are firmly in the First Class Honors bracket. Try fine-tuning your elective classes to secure a perfect 4.0 average term finish.";
    }
    if (gpa >= 3.0) {
      return "Excellent standing! You are currently on track for a Second Class Upper. Boosting your written exam targets by just 5 marks in your lowest subject could elevate you into First Class Honors.";
    }
    if (gpa >= 2.0) {
      return "Solid performance with room to soar. You are in the Second Class Lower category. Focus your preparation on subjects with class scores below 22 to unlock high-impact GPA gains.";
    }
    if (gpa >= 1.0) {
      return "Passing average, but you can push higher! Reviewing classroom notes daily and working closely with your subject teachers will help you reach the 2.5+ GPA bracket next term.";
    }
    return "Academic intervention recommended. Focus on bringing your core class assessments up to at least 18/30 to secure a passing grade. Our peer tutoring labs are available Monday through Friday.";
  };

  // SVG Gauge specifications
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  // Map GPA (0 to 4.0) to stroke offset (dash array)
  const gpaPercentage = Math.min(100, Math.max(0, (projectedGPA / 4.0) * 100));
  const strokeDashoffset = circumference - (gpaPercentage / 100) * circumference;

  return (
    <div className="space-y-6 mt-8" id="grade-projection-interactive-hub">
      
      {/* 1. Header with custom Navigation tab */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
            <Calculator size={18} />
            <h3 className="text-xs font-black uppercase tracking-wider font-mono">Interactive Grade Projection Desk</h3>
          </div>
          <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-1">What-If Terminal Performance Planner</h2>
        </div>
        
        {/* Toggle Switch */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/80 shrink-0 self-start sm:self-center shadow-inner">
          <button
            onClick={() => setActiveCalculatorTab('single')}
            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeCalculatorTab === 'single'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Exam Target Goal
          </button>
          <button
            onClick={() => setActiveCalculatorTab('gpa')}
            id="gpa-planner-tab-trigger"
            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeCalculatorTab === 'gpa'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Term GPA Projection
          </button>
        </div>
      </div>

      {/* ==================== ACTIVE VIEW ==================== */}
      {activeCalculatorTab === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          
          {/* Progress Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
            <div>
              <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
                <TrendingUp size={16} />
                <h3 className="text-xs font-black uppercase tracking-wider">Terminal Learning Curve & Trend</h3>
              </div>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-1">Continuous Assessment Performance Curve</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Plotting cumulative weighted average across consecutive testing periods.</p>
            </div>

            {/* Beautiful Custom SVG Chart */}
            <div className="relative pt-2">
              <div className="w-full overflow-x-auto">
                <svg 
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                  className="w-full h-auto min-w-[340px]"
                  id="svg-academic-trend-chart"
                >
                  {/* Grid Lines */}
                  {[40, 60, 80, 100].map((val, idx) => (
                    <g key={idx}>
                      <line 
                        x1={padding} 
                        y1={getY(val)} 
                        x2={chartWidth - padding} 
                        y2={getY(val)} 
                        stroke="#e2e8f0" 
                        strokeDasharray="4,4" 
                        className="dark:stroke-slate-800"
                      />
                      <text 
                        x={padding - 10} 
                        y={getY(val) + 4} 
                        textAnchor="end" 
                        className="fill-slate-400 font-mono text-[9px] font-bold"
                      >
                        {val}%
                      </text>
                    </g>
                  ))}

                  {/* Area Under Curve */}
                  {areaPath && (
                    <path 
                      d={areaPath} 
                      fill="url(#trend-area-grad)" 
                      opacity="0.15"
                    />
                  )}

                  {/* Core Progression Line */}
                  {linePath && (
                    <path 
                      d={linePath} 
                      fill="none" 
                      stroke="#0f766e" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Data Points / Interactivity circles */}
                  {trendPoints.map((pt, idx) => (
                    <g key={idx} className="group cursor-pointer">
                      <circle 
                        cx={getX(idx)} 
                        cy={getY(pt.score)} 
                        r="5" 
                        fill="#0f766e" 
                        stroke="#ffffff" 
                        strokeWidth="2"
                        className="filter drop-shadow-xs transition-all duration-300 hover:r-7"
                      />
                      <text 
                        x={getX(idx)} 
                        y={getY(pt.score) - 10} 
                        textAnchor="middle" 
                        className="fill-slate-800 dark:fill-white font-mono text-[10px] font-black"
                      >
                        {pt.score}%
                      </text>
                      <text 
                        x={getX(idx)} 
                        y={chartHeight - 12} 
                        textAnchor="middle" 
                        className="fill-slate-400 font-sans text-[8px] font-bold uppercase tracking-wider"
                      >
                        {pt.block}
                      </text>
                    </g>
                  ))}

                  {/* Gradients Definitions */}
                  <defs>
                    <linearGradient id="trend-area-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f766e" />
                      <stop offset="100%" stopColor="#0f766e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Chart Legend Summary */}
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs mt-2">
              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-400 uppercase font-black">Active Performance Mean</span>
                <p className="font-extrabold text-slate-800 dark:text-white font-mono text-sm">{averageGradeScore}% Aggregate Score</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 uppercase font-black">Current Letter Standing</span>
                <div className="flex items-center space-x-1 justify-end mt-0.5">
                  <span className={`px-1.5 py-0.5 font-mono text-[10px] font-black rounded ${getLetterGrade(averageGradeScore).color}`}>
                    {getLetterGrade(averageGradeScore).char}
                  </span>
                  <span className="font-bold text-slate-600 dark:text-slate-300 text-[10px]">{getLetterGrade(averageGradeScore).label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* "What-If" Goal Calculator */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
            <div>
              <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400">
                <Calculator size={16} />
                <h3 className="text-xs font-black uppercase tracking-wider">"What-If" Assessment Forecaster</h3>
              </div>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-1">Written Exam Goal Calculator</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Input your target grade and continuous assessment score to see your exam target.</p>
            </div>

            {/* Inputs row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[9px] text-slate-400 uppercase font-black">1. Choose Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-2 rounded-lg text-xs font-bold focus:outline-hidden"
                  id="whatif-subject-selector"
                >
                  {studentSubjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] text-slate-400 uppercase font-black">2. Target Grade Percentage ({targetGrade}%)</label>
                <input 
                  type="range"
                  min="40"
                  max="100"
                  step="5"
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(Number(e.target.value))}
                  className="w-full accent-teal-700"
                  id="whatif-target-slider"
                />
              </div>
            </div>

            {/* Second input with interactive class scores */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                <span>3. Class Score Assessment (30% Max)</span>
                <span className="font-mono text-teal-700 dark:text-teal-400 font-extrabold text-xs">{customClassScore} / 30 marks</span>
              </div>
              <input 
                type="range"
                min="5"
                max="30"
                value={customClassScore}
                onChange={(e) => setCustomClassScore(Number(e.target.value))}
                className="w-full accent-teal-700"
                id="whatif-class-score-slider"
              />
              <p className="text-[9px] text-slate-400 italic">
                *Initialized to your recorded class score ({activeGradeRecord ? `${activeGradeRecord.classScore}/30` : 'Estimate'}). Slide to model alternate test scores.
              </p>
            </div>

            {/* Dynamic Goal Result Indicator */}
            <div className="pt-2">
              {isImpossible ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 flex items-start space-x-3 text-xs leading-relaxed font-medium text-rose-700 dark:text-rose-400">
                  <AlertTriangle className="shrink-0 mt-0.5 animate-bounce" size={16} />
                  <div className="space-y-1">
                    <p className="font-extrabold text-[13px] uppercase tracking-wide">Mathematical Warning</p>
                    <p>
                      To achieve your <strong>{targetGrade}%</strong> target with a continuous assessment of <strong>{customClassScore}/30</strong>, you would need to score <strong>{examNeeded}/70 ({examPercent}%)</strong> on the final exam.
                    </p>
                    <p className="text-[10px] font-semibold text-rose-500">Since the final exam is scored out of 70, this target is currently mathematically out of reach. Consider adjusting your goal or consult your tutor.</p>
                  </div>
                </div>
              ) : alreadyAchieved ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 flex items-start space-x-3 text-xs leading-relaxed font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
                  <div className="space-y-1">
                    <p className="font-extrabold text-[13px] uppercase tracking-wide">Target Already Secured!</p>
                    <p>
                      With your current continuous assessment class score of <strong>{customClassScore}/30</strong>, you have already exceeded your target of <strong>{targetGrade}%</strong> total.
                    </p>
                    <p className="text-[10px] font-semibold text-emerald-500">Even if you score 0 on the final written exam, you will successfully clear your target grade with ease!</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div className="space-y-1 leading-relaxed">
                    <span className="px-2 py-0.5 bg-teal-600 text-white rounded text-[8px] font-black uppercase tracking-widest">Projection Target</span>
                    <p className="text-slate-600 dark:text-slate-300 font-medium">
                      For active course <strong className="text-slate-800 dark:text-white font-bold">{activeSubject ? activeSubject.name : 'Selected Course'}</strong>, you must score:
                    </p>
                    <p className="font-extrabold text-[13px] text-slate-800 dark:text-white">
                      At least <span className="text-teal-700 dark:text-teal-400 font-mono text-base font-black">{examNeeded} out of 70</span> ({examPercent}%)
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-teal-500/20 text-center space-y-0.5 shrink-0 w-full sm:w-auto">
                    <span className="text-[8px] text-slate-400 uppercase font-black block leading-none">Target Grade Letter</span>
                    <span className={`text-xl font-black font-mono inline-block px-2 py-0.5 rounded leading-none mt-1 ${getLetterGrade(targetGrade).color}`}>
                      {getLetterGrade(targetGrade).char}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 block mt-1">{getLetterGrade(targetGrade).label} Standard</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      ) : (
        /* ==================== TAB 2: COMPREHENSIVE TERM GPA PLANNER ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="term-gpa-projection-panel">
          
          {/* Left Column: Sliders for all subjects (7/12 layout) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Course-by-Course Hypothetical Slider Deck</h3>
                <p className="text-xs text-slate-400 mt-0.5">Toggle and adjust hypothetical scores for classwork (30%) and examinations (70%) per subject.</p>
              </div>

              {/* Subject Sliders List */}
              <div className="space-y-4 pt-2">
                {hypotheticalScores.length > 0 ? (
                  hypotheticalScores.map((hs) => {
                    const totalScore = hs.classScore + hs.examScore;
                    const letterGrade = getLetterGrade(totalScore);
                    const gradePoint = getGradePoint(totalScore);
                    
                    // Retrieve actual record if present to compare
                    const originalRecord = studentGrades.find(g => g.subjectId === hs.subjectId);
                    const isModified = originalRecord 
                      ? (originalRecord.classScore !== hs.classScore || originalRecord.examScore !== hs.examScore)
                      : (hs.classScore !== 20 || hs.examScore !== 45); // comparing to defaults

                    return (
                      <div 
                        key={hs.subjectId} 
                        className={`p-4 rounded-xl border transition-all ${
                          isModified 
                            ? 'bg-emerald-500/5 border-emerald-500/20' 
                            : 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-800/80'
                        }`}
                        id={`hypothetical-card-${hs.subjectId}`}
                      >
                        {/* Course header */}
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[9px] font-bold font-mono text-slate-400 bg-slate-200/40 dark:bg-slate-800/60 px-1.5 py-0.5 rounded">
                              {hs.subjectCode}
                            </span>
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mt-1.5">
                              {hs.subjectName}
                            </h4>
                          </div>

                          {/* Dynamic Output indicators on right */}
                          <div className="flex items-center space-x-2.5 shrink-0 text-right">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-black font-mono text-emerald-700 dark:text-emerald-400 text-sm">
                                {totalScore}%
                              </span>
                              <span className="text-[8px] text-slate-400 uppercase font-black block leading-none">
                                {gradePoint.toFixed(1)} GP
                              </span>
                            </div>

                            <span className={`text-sm font-black font-mono px-2 py-0.5 rounded ${letterGrade.color}`}>
                              {letterGrade.char}
                            </span>

                            {isModified && (
                              <button
                                onClick={() => handleRevertSubject(hs.subjectId)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                                title="Revert to Recorded"
                              >
                                <RotateCcw size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Interactive Sliders */}
                        <div className="space-y-3 mt-4 border-t border-slate-200/40 dark:border-slate-800/40 pt-3">
                          
                          {/* Class score slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
                              <span>Continuous Assessment Score (30% Max)</span>
                              <span className="font-mono text-slate-700 dark:text-slate-200">{hs.classScore} Marks</span>
                            </div>
                            <input 
                              type="range"
                              min="0"
                              max="30"
                              value={hs.classScore}
                              onChange={(e) => handleUpdateHypothetical(hs.subjectId, 'classScore', Number(e.target.value))}
                              className="w-full accent-emerald-600 cursor-ew-resize h-1"
                              id={`slider-class-${hs.subjectId}`}
                            />
                          </div>

                          {/* Exam score slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
                              <span>Term Written Examination (70% Max)</span>
                              <span className="font-mono text-slate-700 dark:text-slate-200">{hs.examScore} Marks</span>
                            </div>
                            <input 
                              type="range"
                              min="0"
                              max="70"
                              value={hs.examScore}
                              onChange={(e) => handleUpdateHypothetical(hs.subjectId, 'examScore', Number(e.target.value))}
                              className="w-full accent-emerald-600 cursor-ew-resize h-1"
                              id={`slider-exam-${hs.subjectId}`}
                            />
                          </div>
                        </div>

                        {/* Original vs hypothetical footer label */}
                        <div className="mt-2.5 flex items-center justify-between text-[8px] font-extrabold uppercase tracking-wider text-slate-400/80">
                          <span>Recorded Status: {hs.isRecorded ? 'Official Grade' : 'Estimate pending exam'}</span>
                          {originalRecord && (
                            <span>
                              Original Total: {originalRecord.totalScore}% ({originalRecord.grade})
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-6 text-xs text-slate-400 italic">No subject listings initialized.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Visual GPA Ring & Summaries (5/12 layout) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* 1. Main visual GPA dial progress circle */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-xs text-center space-y-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Projected Performance Outcome</h3>
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">Projected Term GPA</h4>
              </div>

              {/* Dynamic SVG Circular Progress Ring */}
              <div className="relative flex justify-center items-center py-2">
                <svg className="w-32 h-32 transform -rotate-90">
                  {/* Track ring */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="#e2e8f0"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="dark:stroke-slate-800"
                  />
                  {/* Progress ring with transition */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke={honorInfo.stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>

                {/* Inside circle text */}
                <div className="absolute flex flex-col justify-center items-center text-center">
                  <span className="text-3xl font-black font-mono tracking-tight text-slate-800 dark:text-white leading-none">
                    {projectedGPA.toFixed(2)}
                  </span>
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-1 leading-none">
                    out of 4.0
                  </span>
                </div>
              </div>

              {/* Classification Badge */}
              <div className="inline-flex flex-col items-center gap-1">
                <span className={`px-3 py-1 font-extrabold text-xs rounded-full border ${honorInfo.color}`}>
                  {honorInfo.title}
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                  {honorInfo.description}
                </span>
              </div>

              {/* GPA Comparison Grid */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-150 dark:border-slate-800/80 text-center">
                <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-lg">
                  <span className="text-[8px] text-slate-400 uppercase font-black block">Actual GPA</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-xs mt-1 block">
                    {actualGPA.toFixed(2)}
                  </span>
                </div>

                <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-lg">
                  <span className="text-[8px] text-slate-400 uppercase font-black block">Projected GPA</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs mt-1 block">
                    {projectedGPA.toFixed(2)}
                  </span>
                </div>

                <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-lg flex flex-col justify-center items-center">
                  <span className="text-[8px] text-slate-400 uppercase font-black block">GPA Boost</span>
                  <span className={`font-mono font-bold text-xs mt-1 block px-1.5 py-0.5 rounded ${
                    gpaDifference > 0 
                      ? 'text-emerald-600 bg-emerald-500/10' 
                      : gpaDifference < 0 
                        ? 'text-rose-600 bg-rose-500/10' 
                        : 'text-slate-500 bg-slate-100 dark:bg-slate-900'
                  }`}>
                    {gpaDifference > 0 ? `+${gpaDifference}` : gpaDifference}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Dean's Evaluation Remarks Box */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl text-left space-y-2.5">
              <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300">
                <Sparkles size={14} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider font-mono">Dean's Projected Evaluation</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic">
                "{getDeanAdvice(projectedGPA)}"
              </p>
              <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 font-bold uppercase pt-1 border-t border-slate-200/40">
                <Info size={11} />
                <span>Computed live for Term III Honor standing.</span>
              </div>
            </div>

            {/* 3. Action Deck (Model Perfect Term, Reset, GPA Guidelines) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-1.5 text-slate-400">
                Projection Control Center
              </h4>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleModelPerfectTerm}
                  id="model-perfect-term-btn"
                  className="py-2 px-3 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs text-center flex items-center justify-center space-x-1"
                >
                  <Sparkles size={11} />
                  <span>Model Peak Term</span>
                </button>
                
                <button
                  onClick={handleResetToActual}
                  id="reset-gpa-planner-btn"
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center flex items-center justify-center space-x-1"
                >
                  <RotateCcw size={11} />
                  <span>Reset Planner</span>
                </button>
              </div>

              {/* Grading criteria help legend */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-[9px] text-slate-400 space-y-1.5 border border-slate-150 dark:border-slate-800/40">
                <p className="font-extrabold uppercase text-[8px] text-slate-500 tracking-wider">Ghana GES Point Standard Mapping</p>
                <div className="grid grid-cols-3 gap-1 font-mono">
                  <span>A (80-100) &bull; 4.0 GP</span>
                  <span>B (70-79) &bull; 3.0 GP</span>
                  <span>C (60-69) &bull; 2.0 GP</span>
                  <span>D (50-59) &bull; 1.0 GP</span>
                  <span>E (40-49) &bull; 0.5 GP</span>
                  <span>F (00-39) &bull; 0.0 GP</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
