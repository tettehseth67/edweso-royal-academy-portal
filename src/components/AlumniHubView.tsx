import React, { useState } from 'react';
import { 
  Award, Heart, Send, CheckCircle, Sparkles, Star, Users, MapPin, 
  Briefcase, Landmark, BookOpen, ThumbsUp, HelpCircle
} from 'lucide-react';

interface Alumnus {
  name: string;
  gradYear: string;
  dest: string;
  role: string;
  quote: string;
  photoColor: string;
}

export default function AlumniHubView() {
  const [formData, setFormData] = useState({
    name: '',
    gradYear: '2018',
    currentOccupation: '',
    currentLocation: '',
    email: '',
    phone: '',
    testimonial: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registryId, setRegistryId] = useState('');

  // Hall of Fame Pupils List
  const alumniList: Alumnus[] = [
    {
      name: 'Dr. Derrick Owusu-Ansah',
      gradYear: 'Class of 2014 (First Batch)',
      dest: 'Kwame Nkrumah University of Science & Technology (KNUST)',
      role: 'Medical Officer, Komfo Anokye Teaching Hospital',
      quote: 'Edweso Royal Academy laid the baseline disciplines of rigorous analytical focus and selflessness that pushed me to finish my medical licensure examinations successfully.',
      photoColor: 'from-emerald-500 to-teal-600'
    },
    {
      name: 'Evelyn Adjei-Mensah',
      gradYear: 'Class of 2016',
      dest: 'Ashesi University / University of Edinburgh',
      role: 'Senior Software Engineer, Google Ghana',
      quote: 'My very first coding exercise was written in the ERA microcomputer laboratory! The ICT teachers inspired me to dream big and build scalable software.',
      photoColor: 'from-amber-500 to-orange-600'
    },
    {
      name: 'Richmond Baffour-Awuah',
      gradYear: 'Class of 2018',
      dest: 'University of Ghana (Legon) / LSE',
      role: 'Financial Analyst, Ministry of Finance, Ghana',
      quote: 'The rigorous continuous assessments and mathematical speed drills at the academy gave me a massive headstart in statistical analysis.',
      photoColor: 'from-blue-500 to-indigo-600'
    }
  ];

  // Campaign Progress (e.g. GHS 50,000 target for Computer Lab Expansion)
  const campaignGoal = 50000;
  const campaignCurrent = 34500;
  const percentReached = Math.round((campaignCurrent / campaignGoal) * 100);

  const handleRegistrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Please complete all required fields.');
      return;
    }
    const token = 'ERA-ALUM-' + Math.floor(1000 + Math.random() * 9000);
    setRegistryId(token);
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Decorative Title Block */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full font-black uppercase tracking-wider">
          Edweso Royals Network
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 font-display tracking-tight">
          Alumni Association & Hall of Fame
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Celebrating over a decade of holistic education and leadership. Our past scholars are actively contributing to medicine, software architecture, civic finance, and education worldwide.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Hall of Fame List & Project Campaign (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section: Hall of Fame */}
          <div className="space-y-4">
            <div className="flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Award className="text-amber-500 animate-pulse" size={18} />
              <h2 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                Graduate Spotlights & Hall of Fame
              </h2>
            </div>

            <div className="space-y-6">
              {alumniList.map((alumnus, idx) => (
                <div 
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center gap-5"
                >
                  {/* Pseudo Photo Avatar with Initials */}
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${alumnus.photoColor} shrink-0 flex items-center justify-center text-white font-black text-lg shadow-sm uppercase`}>
                    {alumnus.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('')}
                  </div>

                  {/* Testimonial details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {alumnus.name}
                      </h4>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded-full font-bold text-slate-450 dark:text-slate-400">
                        {alumnus.gradYear}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 text-[11px] font-semibold text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Briefcase size={12} className="text-slate-400" />
                        <span>{alumnus.role}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Landmark size={12} className="text-slate-400" />
                        <span className="text-emerald-755 dark:text-emerald-400">{alumnus.dest}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-350 italic leading-relaxed pt-1.5 font-medium border-t border-dashed border-slate-100 dark:border-slate-800/80">
                      "{alumnus.quote}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Giving Back Campaign Progress */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Heart className="text-rose-500 fill-rose-500 animate-pulse" size={16} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Active Alumni Campaign: Computing Lab Expansion
                </span>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded font-black uppercase">
                Active Project 2026
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              To accommodate modern Python coding curricula and relational database training logs across both JHS and SHS levels, our alumni association is sponsoring the deployment of 15 advanced workstation blocks on campus.
            </p>

            {/* Live Progress Bar indicator */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Progress: <strong className="text-white">GHS {campaignCurrent.toLocaleString()}</strong> of GHS {campaignGoal.toLocaleString()}</span>
                <span className="text-emerald-400 font-black">{percentReached}% Reached</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000" 
                  style={{ width: `${percentReached}%` }}
                />
              </div>
            </div>

            {/* Direct Donation action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 text-xs">
              <div className="text-[10px] text-slate-400 font-semibold max-w-sm">
                * All donations trigger secure ledger logs and immediate confirmation SMS. Donors are permanently engraved on our campus digital plaque.
              </div>
              <button 
                onClick={() => alert(`DISPATCH SYSTEM: Directing to secure alumni payment portal via Paystack.\nCampaign: Computing Lab Fund.`)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer self-start sm:self-auto shrink-0 shadow-sm"
              >
                Support Project
              </button>
            </div>

          </div>

        </div>

        {/* Right Side: Alumni Registry Form (4 columns) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
          
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Users className="text-emerald-600" size={16} />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Join the Alumni Register
            </h3>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleRegistrySubmit} className="space-y-3.5">
              
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                Are you a past student of Edweso Royal Academy? Register your credentials to join international networking forums and local reunion groups.
              </p>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Seth Tetteh"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              {/* Graduation class */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Completion Year *</label>
                <select
                  value={formData.gradYear}
                  onChange={e => setFormData({...formData, gradYear: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden"
                >
                  {Array.from({ length: 13 }, (_, i) => 2014 + i).map(year => (
                    <option key={year} value={year.toString()}>{year} Batch</option>
                  ))}
                </select>
              </div>

              {/* Current Occupation */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Current Sector / University *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Medical Student at KNUST"
                  value={formData.currentOccupation}
                  onChange={e => setFormData({...formData, currentOccupation: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              {/* Current Location */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Current City / Country *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kumasi, Ghana"
                  value={formData.currentLocation}
                  onChange={e => setFormData({...formData, currentLocation: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Primary Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. alumni@example.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              {/* Testimonial message */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Short word of Advice to current pupils</label>
                <textarea
                  rows={2}
                  placeholder="What is your best advice for pupils preparing for terminal exams?"
                  value={formData.testimonial}
                  onChange={e => setFormData({...formData, testimonial: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden resize-none"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center space-x-1.5"
              >
                <Send size={13} />
                <span>Submit Registry Profile</span>
              </button>

            </form>
          ) : (
            <div className="text-center py-8 space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle size={26} />
              </div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase">Registry Profile Created!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Welcome back to the Edweso Royals Family, <strong className="text-slate-800 dark:text-slate-200">{formData.name}</strong>. Your membership reference has been securely registered:
              </p>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2.5 rounded-xl font-mono text-xs font-black text-slate-800 dark:text-slate-200">
                {registryId}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                The Alumni Secretary will review your details to sync with your class graduation register logs.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    name: '',
                    gradYear: '2018',
                    currentOccupation: '',
                    currentLocation: '',
                    email: '',
                    phone: '',
                    testimonial: ''
                  });
                }}
                className="text-xs text-emerald-650 hover:text-emerald-700 font-bold underline cursor-pointer"
              >
                Register another alumnus
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
