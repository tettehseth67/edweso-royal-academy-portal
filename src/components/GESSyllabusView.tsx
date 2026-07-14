import React, { useState } from 'react';
import { 
  BookOpen, Sparkles, Download, Layers, Award, Milestone, 
  Percent, Star, CheckCircle, Search, HelpCircle, FileText
} from 'lucide-react';

interface SubjectDetail {
  overview: string;
  strands: string[];
  substrands: string[];
  termlyMilestones: {
    term1: string;
    term2: string;
    term3: string;
  };
  textbooks: string;
  assessmentWeight: {
    sba: string;
    homework: string;
    project: string;
    exam: string;
  };
}

export default function GESSyllabusView() {
  const [activeLevel, setActiveLevel] = useState<'Primary' | 'JHS' | 'SHS'>('JHS');
  const [selectedSubject, setSelectedSubject] = useState<string>('Computing & ICT');

  const syllabusData: Record<string, Record<string, SubjectDetail>> = {
    Primary: {
      'Mathematics': {
        overview: 'Develop elementary mathematical thinking, foundational arithmetic, structural geometry, and real-world currency conversions under the primary Ghana Education Service (GES) layout.',
        strands: ['Number (Whole Numbers, Fractions, Decimals)', 'Algebra (Patterns and Relations)', 'Geometry and Measurement', 'Data (Basic Probability and Graphing)'],
        substrands: ['Place Value representation up to 100,000', 'Basic fractions representation and addition', 'Reading 12-hour and 24-hour clocks', 'Identifying shapes and symmetry lines'],
        termlyMilestones: {
          term1: 'Mastery of place value systems and base-10 operations.',
          term2: 'Fractions exploration and introduction to perimeter and simple areas.',
          term3: 'Basic data handling, pictographs, and currency calculations (GHS).'
        },
        textbooks: 'GES Standard Mathematics for Primary Schools (Book 4-6), Golden Publications Ghana.',
        assessmentWeight: { sba: '30%', homework: '15%', project: '15%', exam: '40%' }
      },
      'Computing & ICT': {
        overview: 'Introduction to basic keyboarding, primary input/output components of microcomputers, and simple paint programs to nurture technological confidence at a young age.',
        strands: ['Introduction to Computers', 'Basic Keyboarding Skills', 'Drawing & Painting with MS Paint', 'Ethics and Health in Computer Usage'],
        substrands: ['Identifying Monitor, CPU, Keyboard, Mouse', 'Correct finger placement on the Home Row', 'Creating basic vector patterns and pixel compositions', 'Computer laboratory safety guidelines'],
        termlyMilestones: {
          term1: 'Visual identification of computer physical hardware blocks.',
          term2: 'Developing typing control and finger dexterity exercises.',
          term3: 'Creative pixel drawings and printing student artwork.'
        },
        textbooks: 'ERA Primary Computing Kit (Level 1), DigiKids West Africa.',
        assessmentWeight: { sba: '20%', homework: '10%', project: '30%', exam: '40%' }
      },
      'Integrated Science': {
        overview: 'Nurturing curiosity about living and non-living things, physical forces, environmental hygiene, and safety precautions.',
        strands: ['Diversity of Matter', 'Cycles (Life Cycles of Flowering Plants)', 'Systems (The Human Skeleton)', 'Forces and Energy'],
        substrands: ['Characteristics of living things', 'Sources and preservation of clean drinking water', 'Identifying skeletal structures and joints', 'Forms of clean energy in Ghana (Solar, Hydro)'],
        termlyMilestones: {
          term1: 'Classification of materials in the school environment.',
          term2: 'Observing bean seed germination and recording plant progress.',
          term3: 'Personal hygiene practices and basic waste sorting concepts.'
        },
        textbooks: 'Shedding Light on Integrated Science (Primary Block), Excellence Series GH.',
        assessmentWeight: { sba: '25%', homework: '15%', project: '20%', exam: '40%' }
      }
    },
    JHS: {
      'Computing & ICT': {
        overview: 'Empowering JHS scholars with software design foundations, basic database systems, visual layout publishing, safe digital networking, and high-efficiency keyboarding.',
        strands: ['Computing Systems & Network Topologies', 'Information Technology & Productivity Suites', 'Core Programming Algorithms & Coding Foundations', 'Global Information Security & Cyber Hygiene'],
        substrands: ['Internal System architecture and RAM configurations', 'Microsoft Word stylesheets & Excel formulas', 'Visual block programming (Scratch) & HTML structure', 'Securing local data logs and password hashes'],
        termlyMilestones: {
          term1: 'Detailed network structures, LAN/WAN topologies, and hardware protocols.',
          term2: 'Productivity sheets: complex formulas (SUM, AVERAGE, IF-statements) and visual graphs.',
          term3: 'Writing structured HTML markup to build basic offline web portals.'
        },
        textbooks: 'Edweso JHS Technical Computing Syllabus Guide, compiled by the ICT Board.',
        assessmentWeight: { sba: '30%', homework: '10%', project: '20%', exam: '40%' }
      },
      'Mathematics': {
        overview: 'Comprehensive preparation for the Basic Education Certificate Examination (BECE) covering geometry, structural algebra, ratio and proportions, and basic probability.',
        strands: ['Numbers and Number Systems (Real Number Systems)', 'Algebra (Linear Equations, Vectors, Coordinate Geometry)', 'Geometry and Trigonometry', 'Handling Data & Probability'],
        substrands: ['Set theory, subsets, Venn diagrams (2 and 3 sets)', 'Solving single and multi-step linear inequalities', 'Constructing angles (60°, 90°, 45°) with ruler and compass', 'Analyzing frequency tables and cumulative curves'],
        termlyMilestones: {
          term1: 'Real Number applications, rational approximations, and advanced set algebra.',
          term2: 'Linear inequalities, Cartesian plane mapping, and vector additions.',
          term3: 'Geometric construction, statistical averages, and BECE Mock preparatory drills.'
        },
        textbooks: 'Aki-Ola Mathematics series for Junior High Schools, Aki-Ola GH Publications.',
        assessmentWeight: { sba: '30%', homework: '10%', project: '20%', exam: '40%' }
      },
      'Integrated Science': {
        overview: 'Advanced inquiry into physics, organic chemistry, mammalian biology, and agricultural sciences aligned with GES guidelines for JHS.',
        strands: ['Diversity of Matter (Chemical Bonding & Acids)', 'Cycles (Carbon Cycle, Water Cycle, Soil Erosion)', 'Systems (The Mammalian Heart & Respiratory Tract)', 'Forces, Energy and Agricultural Mechanics'],
        substrands: ['Elements, compounds, physical and chemical changes', 'Properties of acidic and basic solutions in soil', 'Blood circulation, chambers of the heart, and pulmonary system', 'Types of soil nutrients and organic composting techniques'],
        termlyMilestones: {
          term1: 'Chemical formulation, balance equations, and physical properties of elements.',
          term2: 'Detailed study of mammalian skeletal, cardiac and digestive systems.',
          term3: 'Soil science, fertilizer application, crop harvesting cycles in Ghana.'
        },
        textbooks: 'Integrated Science for JHS (BECE Masterclass Series), G-Pak Publications.',
        assessmentWeight: { sba: '30%', homework: '10%', project: '20%', exam: '40%' }
      }
    },
    SHS: {
      'Computing & ICT': {
        overview: 'In-depth introduction to Python scripting, database management systems (SQL query operations), hardware engineering, and digital entrepreneurship.',
        strands: ['Introductory Python Programming', 'Relational Database Engineering & SQL', 'Digital Media Design & Web Frameworks', 'System Analysis and Design Principles'],
        substrands: ['Variables, logical loops, functions, and arrays in Python', 'Writing structured queries (SELECT, JOIN, INSERT)', 'Cascading Style Sheets (CSS) and responsive layout rules', 'The System Development Life Cycle (SDLC) stages'],
        termlyMilestones: {
          term1: 'Python console programming: data types, conditionals, and looping routines.',
          term2: 'SQL database schema definitions, relational integrity, and simple queries.',
          term3: 'Building and hosting local static projects with complete documentation logs.'
        },
        textbooks: 'Advanced Computing & Code Architecture for West Africa, Tech-Science GH.',
        assessmentWeight: { sba: '30%', homework: '10%', project: '30%', exam: '30%' }
      },
      'Core Mathematics': {
        overview: 'Preparation for the West African Senior School Certificate Examination (WASSCE) covering logarithmic functions, trigonometry, coordinate geometry, and sequence/series.',
        strands: ['Algebra and Functions', 'Trigonometric Identities and Curves', 'Statistics and Probability Distribution', 'Calculus and Vector coordinates'],
        substrands: ['Logarithms, indices, surds simplification', 'Trigonometric ratios, sine and cosine laws', 'Standard deviation, variance, and cumulative curves', 'Basic derivatives and integrals with geometric meaning'],
        termlyMilestones: {
          term1: 'Indices, surds, logarithms, and quadratic equation systems.',
          term2: 'Trigonometry: unit circle, compound angles, and heights/distances.',
          term3: 'Statistics: standard deviation, variance, and grouped frequency tables.'
        },
        textbooks: 'Core Mathematics for Senior High Schools (WASSCE Series), Aki-Ola GH.',
        assessmentWeight: { sba: '30%', homework: '10%', project: '10%', exam: '50%' }
      }
    }
  };

  const levelSubjects = Object.keys(syllabusData[activeLevel]);
  const currentSubjectData = syllabusData[activeLevel][selectedSubject] || levelSubjects[0] ? syllabusData[activeLevel][levelSubjects[0]] : null;

  // Handle auto adjusting subject when active level changes
  const handleLevelChange = (level: 'Primary' | 'JHS' | 'SHS') => {
    setActiveLevel(level);
    const subjects = Object.keys(syllabusData[level]);
    if (subjects.length > 0) {
      setSelectedSubject(subjects[0]);
    }
  };

  const triggerDownloadSim = () => {
    alert(`DISPATCH SYSTEM: Exporting Official GES ${activeLevel} - ${selectedSubject} Syllabus (2026 Revision) in PDF format.\nDigital digest token successfully compiled.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Decorative Title Block */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-black uppercase tracking-wider">
          Academic Transparency Suite
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 font-display tracking-tight">
          GES Curriculum & Syllabus Explorer
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Discover learning milestones, terminal course modules, and recommended textbook publications mapped directly to the Ghana Education Service (GES) national syllabus standards.
        </p>
      </div>

      {/* Main Interactive Workspace Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Department & Subject Selector (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-50/55 dark:bg-slate-950/20 border-r border-slate-100 dark:border-slate-800 p-6 space-y-6">
          
          {/* Department Selection Tabs */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">GES Department Blocks</span>
            <div className="flex flex-col space-y-1.5">
              {[
                { id: 'Primary', label: 'Primary Block (Class 1-6)' },
                { id: 'JHS', label: 'Junior High School (JHS 1-3)' },
                { id: 'SHS', label: 'Senior High School (SHS 1-3)' }
              ].map((level) => (
                <button
                  key={level.id}
                  onClick={() => handleLevelChange(level.id as any)}
                  className={`w-full text-left p-3 rounded-xl font-bold text-xs transition-all cursor-pointer border flex items-center justify-between ${
                    activeLevel === level.id
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-800/80 text-slate-600 dark:text-slate-350 hover:bg-slate-100/50'
                  }`}
                >
                  <span>{level.label}</span>
                  {activeLevel === level.id && <CheckCircle size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Navigation List */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Registered Core Subjects</span>
            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
              {levelSubjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 border ${
                    selectedSubject === sub
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 border-transparent font-bold'
                      : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <BookOpen size={14} className="shrink-0" />
                  <span className="truncate">{sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Curriculum Compliance Badge */}
          <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 flex items-start space-x-2 text-[10px] text-slate-500">
            <Award className="text-amber-500 shrink-0 mt-0.5" size={14} />
            <p className="font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
              Our curriculum and examinations are fully certified by the National Council for Curriculum and Assessment (NaCCA), Ghana.
            </p>
          </div>

        </div>

        {/* Right Side: Interactive Content Display (8 Cols) */}
        <div className="lg:col-span-8 p-6 sm:p-8 space-y-6">
          
          {currentSubjectData ? (
            <div className="space-y-6">
              
              {/* Header Title with action button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
                <div>
                  <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white leading-tight">
                    {selectedSubject}
                  </h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-md font-extrabold uppercase mt-1 inline-block">
                    {activeLevel} Block • National Standard
                  </span>
                </div>
                <button
                  onClick={triggerDownloadSim}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer self-start sm:self-auto uppercase tracking-wide"
                >
                  <Download size={13} />
                  <span>Download GES Syllabus</span>
                </button>
              </div>

              {/* 1. Overview */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Syllabus Overview & Intent</span>
                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                  {currentSubjectData.overview}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                
                {/* 2. Core Strands */}
                <div className="bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 p-4 rounded-xl space-y-2.5">
                  <div className="flex items-center space-x-1.5 border-b border-slate-200/50 dark:border-slate-800 pb-2">
                    <Layers size={14} className="text-emerald-600" />
                    <span className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200">Core Curriculum Strands</span>
                  </div>
                  <ul className="space-y-1.5">
                    {currentSubjectData.strands.map((strand, idx) => (
                      <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span className="font-semibold leading-relaxed">{strand}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Sub-strands & Skills */}
                <div className="bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 p-4 rounded-xl space-y-2.5">
                  <div className="flex items-center space-x-1.5 border-b border-slate-200/50 dark:border-slate-800 pb-2">
                    <Star size={14} className="text-amber-500" />
                    <span className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200">Sub-strands & Active Skills</span>
                  </div>
                  <ul className="space-y-1.5">
                    {currentSubjectData.substrands.map((sub, idx) => (
                      <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span className="font-semibold leading-relaxed">{sub}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* 4. Termly Milestones (Chronological Sequence) */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Termly Milestones Sequence</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { title: 'Term I Focus', text: currentSubjectData.termlyMilestones.term1, bg: 'bg-indigo-500/5 border-indigo-500/10' },
                    { title: 'Term II Focus', text: currentSubjectData.termlyMilestones.term2, bg: 'bg-emerald-500/5 border-emerald-500/10' },
                    { title: 'Term III Focus', text: currentSubjectData.termlyMilestones.term3, bg: 'bg-amber-500/5 border-amber-500/10' }
                  ].map((term, i) => (
                    <div key={i} className={`p-3.5 rounded-xl border ${term.bg} space-y-1`}>
                      <div className="flex items-center space-x-1.5">
                        <Milestone size={12} className="text-slate-400" />
                        <span className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200">{term.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                        {term.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Course Metadata: Books & Assessments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-black text-slate-400">Prescribed Reference Publications</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {currentSubjectData.textbooks}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-black text-slate-400 block">Academic Grading Weights</span>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block">SBA Tests</span>
                      <span className="text-emerald-600 font-extrabold">{currentSubjectData.assessmentWeight.sba}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block">Homework</span>
                      <span className="text-emerald-600 font-extrabold">{currentSubjectData.assessmentWeight.homework}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block">Projects</span>
                      <span className="text-emerald-600 font-extrabold">{currentSubjectData.assessmentWeight.project}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block">Exams</span>
                      <span className="text-emerald-600 font-extrabold">{currentSubjectData.assessmentWeight.exam}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">
              Select a valid department and subject core program to view syllabus.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
