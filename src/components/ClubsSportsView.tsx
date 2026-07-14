import React, { useState } from 'react';
import { 
  Award, Calendar, Check, Send, Sparkles, Users, Clock, ShieldCheck, 
  User, CheckCircle, Heart, Star, BookOpen, ChevronRight, MessageSquare
} from 'lucide-react';

interface ClubDetail {
  id: string;
  name: string;
  category: 'STEM' | 'Civic' | 'Creative' | 'Sports';
  desc: string;
  patron: string;
  meetingTime: string;
  enrolling: boolean;
  achievement: string;
  activities: string[];
}

export default function ClubsSportsView() {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'STEM' | 'Civic' | 'Creative' | 'Sports'>('All');
  
  // Join club inquiry form state
  const [formData, setFormData] = useState({
    studentName: '',
    gradeLevel: 'JHS 1',
    selectedClub: 'Robotics & Coding Society',
    parentPhone: '',
    parentEmail: '',
    priorExperience: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

  const clubsList: ClubDetail[] = [
    {
      id: 'robotics',
      name: 'Robotics & Coding Society',
      category: 'STEM',
      desc: 'Exploring foundational physical computing, electronics breadboarding, Scratch sequencing, and Python controls for local smart assemblies.',
      patron: 'Mr. Ernest Mensah (ICT Lead)',
      meetingTime: 'Wednesdays, 3:30 PM - 5:00 PM',
      enrolling: true,
      achievement: 'Winner of Ashanti Region STEM Innovation Challenge 2025',
      activities: ['Assembling robotic motor chassis', 'Introductory Python scripting with Raspberry Pi', 'Solving logical maze algorithms']
    },
    {
      id: 'science-olympiad',
      name: 'Science Olympiad Group',
      category: 'STEM',
      desc: 'Intensive scientific reasoning, laboratory investigation, chemical analysis, and advanced physics mock preparation for young innovators.',
      patron: 'Mrs. Rebecca Osei (Integrated Science)',
      meetingTime: 'Tuesdays, 3:30 PM - 4:45 PM',
      enrolling: true,
      achievement: 'Placed 3rd in National Science & Maths Quiz (JHS Division)',
      activities: ['Acids & Bases titration exercises', 'Refraction & focal lens measurements', 'Venn set calculations']
    },
    {
      id: 'debate-club',
      name: 'Debating & Public Oratory Society',
      category: 'Civic',
      desc: 'Formulating structured analytical arguments, cross-examinations, parliamentary procedure controls, and high-confidence voice projection.',
      patron: 'Mr. Albert Appiah (English Language)',
      meetingTime: 'Thursdays, 3:30 PM - 5:00 PM',
      enrolling: true,
      achievement: 'Ashanti Inter-Schools Debating Champions 2024',
      activities: ['Parliamentary style cross-fire sessions', 'Syllabic accentuation drills', 'Drafting brief analytical opening arguments']
    },
    {
      id: 'cadet-corps',
      name: 'School Cadet Corps (Military Division)',
      category: 'Civic',
      desc: 'Developing high physical discipline, patriotic service, tactical drill sequence layouts, band drum routines, and civil volunteer structures.',
      patron: 'Officer George Kwarteng (Staff Sergeant)',
      meetingTime: 'Mondays & Fridays, 4:00 PM - 5:30 PM',
      enrolling: true,
      achievement: 'Best Uniform & Precision Drill Award (Independence Day Parade)',
      activities: ['Drill formation alignment testing', 'First-aid emergency handling methods', 'Flag ceremony protocol management']
    },
    {
      id: 'adowa-dance',
      name: 'Traditional Adowa & Cultural Troupe',
      category: 'Creative',
      desc: 'Nurturing historic Akan cultural heritage, authentic Adowa drumming, intricate hand gesture meanings, and rhythmic fontomfrom drum patterns.',
      patron: 'Madam Comfort Boateng (Creative Arts)',
      meetingTime: 'Thursdays, 3:45 PM - 5:15 PM',
      enrolling: true,
      achievement: 'Featured performances at regional traditional arts showcases',
      activities: ['Developing hand gesture symbolic mastery', 'Learning historical Kete & Adowa sequences', 'Rhythmic lead drum timing cues']
    },
    {
      id: 'school-choir',
      name: 'Edweso Royal Symphonic Choir',
      category: 'Creative',
      desc: 'Cultivating classical four-part choral harmony (SOPRANO, ALTO, TENOR, BASS), Ghanaian patriotic anthems, and standard music notations.',
      patron: 'Mr. Frederick Nkrumah (Music Specialist)',
      meetingTime: 'Wednesdays, 3:30 PM - 5:00 PM',
      enrolling: true,
      achievement: 'Accredited with Class-A Honor Distinction (Ashanti Vocal Festival)',
      activities: ['Diaphragmatic vocal warming routines', 'Sight-reading choral sheet files', 'Annual Easter & Festival rehearsals']
    },
    {
      id: 'football',
      name: 'Edweso Royals Football Academy',
      category: 'Sports',
      desc: 'The official school soccer club focusing on strategic positions, cardiovascular endurance, team coordination drills, and penalty setups.',
      patron: 'Coach Kofi Asare (PE Instructor)',
      meetingTime: 'Mondays, Tuesdays & Thursdays, 3:45 PM - 5:15 PM',
      enrolling: true,
      achievement: 'Ejisu-Juaben District JHS League Champions 2025',
      activities: ['Dynamic dribbling and ball control circuits', 'Tactical set-piece strategies', 'Weekly practice matches against local teams']
    },
    {
      id: 'basketball',
      name: 'Royals Basketball Club',
      category: 'Sports',
      desc: 'Fast-paced transition play, three-point shooting drills, man-to-man defensive setups, and team agility training sessions.',
      patron: 'Coach Kofi Asare (PE Instructor)',
      meetingTime: 'Wednesdays & Fridays, 3:45 PM - 5:15 PM',
      enrolling: true,
      achievement: 'First place in Municipal High School Shootout',
      activities: ['Zone defenses and offensive pick-and-roll plays', 'Agility ladder runs and shuttle sprints', 'Free-throw and lay-up execution testing']
    }
  ];

  const filteredClubs = selectedCategory === 'All' 
    ? clubsList 
    : clubsList.filter(c => c.category === selectedCategory);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName || !formData.parentPhone) {
      alert('Please complete all required fields.');
      return;
    }
    const inquiryId = 'ERA-CLUB-' + Math.floor(1000 + Math.random() * 9000);
    setSubmittedId(inquiryId);
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Page Heading */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full font-black uppercase tracking-wider">
          Campus Life & Sports Hub
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 font-display tracking-tight">
          Extracurricular Clubs & Athletics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          At Edweso Royal Academy, academic rigors are balanced beautifully with athletic development, leadership cadet training, technological exploration, and native Akan arts preservation.
        </p>
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-8">
        {[
          { id: 'All', label: 'All Activities' },
          { id: 'STEM', label: 'STEM & Science' },
          { id: 'Civic', label: 'Leadership & Civic' },
          { id: 'Creative', label: 'Creative & Cultural' },
          { id: 'Sports', label: 'Sports & Athletics' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              selectedCategory === cat.id
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Grid of Clubs (8 columns) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClubs.map(club => (
            <div 
              key={club.id} 
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                
                {/* Header Tag + Title */}
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    club.category === 'STEM' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300' 
                      : club.category === 'Civic'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                        : club.category === 'Creative'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  }`}>
                    {club.category}
                  </span>
                  
                  {club.enrolling ? (
                    <span className="text-[8px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded uppercase">
                      Enrolling
                    </span>
                  ) : (
                    <span className="text-[8px] bg-slate-100 text-slate-400 font-extrabold px-1.5 py-0.5 rounded uppercase">
                      Full Capacity
                    </span>
                  )}
                </div>

                <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                  {club.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  {club.desc}
                </p>

                {/* Core activities */}
                <div className="pt-2">
                  <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Key Session Focus</span>
                  <ul className="mt-1 space-y-1">
                    {club.activities.map((act, i) => (
                      <li key={i} className="text-[11px] text-slate-600 dark:text-slate-450 font-semibold flex items-start space-x-1">
                        <Check size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Footer Meta */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2 space-y-2">
                
                {club.achievement && (
                  <div className="flex items-center space-x-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/5 p-1.5 rounded-lg border border-amber-500/10">
                    <Award size={13} />
                    <span className="truncate">{club.achievement}</span>
                  </div>
                )}

                <div className="flex flex-col space-y-1 text-[10px] text-slate-450 font-semibold pl-0.5">
                  <div className="flex items-center space-x-1.5">
                    <User size={12} className="text-slate-400" />
                    <span>Patron: <strong className="text-slate-755 dark:text-slate-200">{club.patron}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock size={12} className="text-slate-400" />
                    <span>Schedule: <strong className="text-slate-755 dark:text-slate-200">{club.meetingTime}</strong></span>
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>

        {/* Right Side: Club Membership Inquiry Form (4 columns) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-5">
          
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <MessageSquare className="text-emerald-600 animate-pulse" size={16} />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Enroll in a Campus Activity
            </h3>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleJoinSubmit} className="space-y-4">
              
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                Submit this inquiry to receive parent authorization slips and session timetables for chosen programs.
              </p>

              {/* Student Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Student's Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kwame Boateng"
                  value={formData.studentName}
                  onChange={e => setFormData({...formData, studentName: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              {/* Grade Level */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Grade Level *</label>
                <select
                  value={formData.gradeLevel}
                  onChange={e => setFormData({...formData, gradeLevel: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden"
                >
                  <option value="Primary 4">Primary Class 4</option>
                  <option value="Primary 5">Primary Class 5</option>
                  <option value="Primary 6">Primary Class 6</option>
                  <option value="JHS 1">JHS 1 (Basic 7)</option>
                  <option value="JHS 2">JHS 2 (Basic 8)</option>
                  <option value="JHS 3">JHS 3 (Basic 9)</option>
                  <option value="SHS 1">SHS 1 (Grade 10)</option>
                  <option value="SHS 2">SHS 2 (Grade 11)</option>
                  <option value="SHS 3">SHS 3 (Grade 12)</option>
                </select>
              </div>

              {/* Selected Club */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Target Club/Team *</label>
                <select
                  value={formData.selectedClub}
                  onChange={e => setFormData({...formData, selectedClub: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden"
                >
                  {clubsList.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Parent Phone */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Parent Mobile (WhatsApp Enabled) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +233 24 412 3456"
                  value={formData.parentPhone}
                  onChange={e => setFormData({...formData, parentPhone: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              {/* Prior Experience notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Prior Experience (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Played soccer at previous school, or basic Scratch programming..."
                  value={formData.priorExperience}
                  onChange={e => setFormData({...formData, priorExperience: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden resize-none"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center space-x-1.5"
              >
                <Send size={13} />
                <span>Submit Club Inquiry</span>
              </button>

            </form>
          ) : (
            <div className="text-center py-8 space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle size={26} />
              </div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase">Inquiry Received Successfully!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                An authorization voucher for <strong className="text-slate-800 dark:text-slate-200">{formData.studentName}</strong> to join <strong className="text-slate-800 dark:text-slate-200">{formData.selectedClub}</strong> has been prepared. Your confirmation key is:
              </p>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2.5 rounded-xl font-mono text-xs font-black text-slate-800 dark:text-slate-200">
                {submittedId}
              </div>
              <p className="text-[10px] text-slate-400">
                A counselor or patron will communicate directly with your registered contact number to conclude onboarding.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    studentName: '',
                    gradeLevel: 'JHS 1',
                    selectedClub: 'Robotics & Coding Society',
                    parentPhone: '',
                    parentEmail: '',
                    priorExperience: ''
                  });
                }}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
              >
                Register another student
              </button>
            </div>
          )}

          {/* Verification Badge */}
          <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex items-start space-x-2 text-[9px] text-slate-400 font-semibold leading-relaxed">
            <ShieldCheck size={14} className="text-indigo-500 shrink-0 mt-0.5" />
            <p>Participation logs automatically accumulate toward student termly conduct marks, shaping continuous assessment grade projections.</p>
          </div>

        </div>

      </div>

    </div>
  );
}
