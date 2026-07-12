import React, { useState } from 'react';
import { 
  BookOpen, Users, Compass, Eye, Shield, History, MapPin, 
  Phone, Mail, Calendar, Sparkles, Megaphone, ArrowRight, CheckCircle2, ChevronDown, ChevronUp
} from 'lucide-react';

interface SubPageProps {
  isDarkMode?: boolean;
}

// 1. SCHOOL HISTORY
export function SchoolHistory({ isDarkMode = false }: SubPageProps) {
  const timeline = [
    { year: '2012', title: 'The Founding Seed', desc: 'Edweso Royal Academy was established in a humble rented property in Edweso, Ashanti Region, Ghana, with just 15 daycare students and a vision to merge ICT with moral education.' },
    { year: '2016', title: 'Primary Block Dedication', desc: 'Commissioned our main primary school complex, incorporating 12 modern ventilated classrooms and a playground. Student body grew to 180.' },
    { year: '2020', title: 'STEM & Robotics Lab Commissioning', desc: 'Installed a premium ICT lab with 40 desktop stations, introducing programming and robotics courses for primary and JHS students.' },
    { year: '2024', title: 'SHS WASSCE Accreditation', desc: 'Granted full accreditation by the Ministry of Education and GES to operate Senior High School science, business, and arts curricula.' },
    { year: '2026', title: 'The Digital Campus Integration', desc: 'Launched the integrated Parent, Student, and Teacher dashboards with instant mobile money and credit card tuition payments powered by Paystack.' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in space-y-8">
      <div className="text-center space-y-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-mono">Our Heritage</span>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">The Edweso Royal Academy Story</h2>
        <p className="text-xs text-slate-500 max-w-lg mx-auto font-medium">Since 2012, we have co-navigated academic excellence, technology instruction, and moral discipline in Ghana's Ashanti Region.</p>
      </div>

      <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 md:ml-32 space-y-8">
        {timeline.map((item, idx) => (
          <div key={idx} className="relative pl-6 md:pl-8">
            {/* Year Badge Side Panel on Desktop */}
            <div className="hidden md:block absolute right-full mr-8 text-right top-0.5">
              <span className="font-mono font-black text-lg text-emerald-700">{item.year}</span>
            </div>
            
            {/* Timeline Circle */}
            <div className="absolute -left-2.5 top-1.5 w-5 h-5 rounded-full bg-emerald-600 border-4 border-white dark:border-slate-950 shadow-xs"></div>
            
            <div className="space-y-1.5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-2xs">
              <div className="md:hidden flex items-center space-x-2">
                <span className="font-mono font-black text-sm text-emerald-600">{item.year}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{item.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. MISSION & VISION
export function MissionVision({ isDarkMode = false }: SubPageProps) {
  const values = [
    { title: 'Moral Integrity', desc: 'Instilling absolute honesty, spiritual fear of God, and personal accountability.' },
    { title: 'Academic Excellence', desc: 'Rigorous terminal diagnostic assessments, critical inquiry, and analytical skillsets.' },
    { title: 'Computational Literacy', desc: 'Enabling every child to build code, utilize IT, and lead in a digital economy.' },
    { title: 'Stewardship', desc: 'Promoting community care, environment conservation, and resource leadership.' }
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-fade-in space-y-10">
      <div className="text-center space-y-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-mono">Purpose & Core</span>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Mission, Vision & Institutional Pillar Values</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mission */}
        <div className="p-6 bg-emerald-600 text-white rounded-3xl relative overflow-hidden shadow-lg space-y-3">
          <Compass className="absolute right-4 bottom-4 opacity-10 pointer-events-none" size={160} />
          <span className="bg-emerald-700 text-amber-300 font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-mono">The Mandate</span>
          <h3 className="text-xl font-black">Our Sacred Mission</h3>
          <p className="text-xs text-emerald-50 leading-relaxed font-semibold">
            To provide a holistic, moral-based, and technology-centered education that challenges students to realize academic heights, critical computing competencies, and deep ethical discipline, empowering them as transformative leaders in West Africa.
          </p>
        </div>

        {/* Vision */}
        <div className="p-6 bg-slate-900 text-white rounded-3xl relative overflow-hidden shadow-lg space-y-3 border border-slate-800">
          <Eye className="absolute right-4 bottom-4 opacity-10 pointer-events-none" size={160} />
          <span className="bg-slate-800 text-amber-400 font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-mono">The Horizon</span>
          <h3 className="text-xl font-black">Our Ultimate Vision</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-semibold">
            To stand as the Ashanti Region's premier private educational institution, recognized internationally for delivering seamless computational science integration, flawless moral character records, and WASSCE academic excellence.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-sm text-slate-400 uppercase tracking-widest text-center">Institutional Pillars</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map((val, idx) => (
            <div key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-1.5 text-xs">
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-900/35 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-black font-mono">PILLAR 0{idx + 1}</span>
              <h4 className="font-extrabold text-slate-900 dark:text-white mt-1">{val.title}</h4>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 3. LEADERSHIP TEAM
export function Leadership({ isDarkMode = false }: SubPageProps) {
  const leaders = [
    { name: 'Prof. Kofi Antwi', role: 'Chairman, Board of Trustees', bio: 'Former Senior Lecturer of Education at KNUST. Directs institutional governance, academic alignments, and strategic funding.' },
    { name: 'Mrs. Ama Serwaah', role: 'Headmistress & Administrator', bio: 'Educator with 20+ years of primary and secondary experience. Oversaw the accreditation phase of Edweso Royal Academy.' },
    { name: 'Mr. Seth Tetteh', role: 'Registrar & Chief Accountant', bio: 'Fintech specialist and management architect. Oversees school fees structuring, Paystack integration, and parent communications.' },
    { name: 'Mr. Ebenezer Mensah', role: 'Dean of ICT & Computing', bio: 'Software developer and curriculum expert. Formulated our robotics, programming, and RFID continuous grade logging system.' }
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-fade-in space-y-8">
      <div className="text-center space-y-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-mono">Governing Board</span>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Institutional Leadership & Academic Board</h2>
        <p className="text-xs text-slate-500 max-w-lg mx-auto font-medium">Meet the experienced educators, administrators, and technologists guiding our academy's structural mandate.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {leaders.map((leader, idx) => (
          <div key={idx} className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-150 dark:border-slate-800 shadow-2xs space-y-3.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-black text-lg border">
                {leader.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">{leader.name}</h4>
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">{leader.role}</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold mt-2 pt-2 border-t border-dashed">
              {leader.bio}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. SCHOOL POLICIES
export function SchoolPolicies({ isDarkMode = false }: SubPageProps) {
  const policies = [
    { title: 'Mandatory Dress Code', desc: 'All daycare, primary, and JHS/SHS entrants must wear the authorized school uniforms during instruction. Standard crested sweaters must be worn during cold morning logs, and authorized PE uniforms during athletic schedules.' },
    { title: 'RFID Attendance Tracking', desc: 'Students are logged at the terminal gate using their RFID student cards. A morning summary is generated at 08:30 and sent instantly as an SMS and email dispatch via the system to parent dashboard accounts.' },
    { title: 'Mobile Device Compliance', desc: 'To protect intellectual focus, students are strictly forbidden from operating mobile devices or gaming units in classrooms. Approved computing devices are securely locked in lockers during lectures.' },
    { title: 'Academic Honesty Code', desc: 'Any instance of exam cheating, continuous homework plagiarism, or credential sharing triggers an immediate Academic Board review. Sibling aid programs are locked upon serious honor infractions.' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in space-y-8">
      <div className="text-center space-y-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full font-mono">Code of Compliance</span>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Institutional Policies & Conduct Code</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {policies.map((pol, idx) => (
          <div key={idx} className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black flex items-center justify-center shrink-0 font-mono">
                {idx + 1}
              </span>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{pol.title}</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold pl-7">
              {pol.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 5. GALLERY
export function GalleryView({ isDarkMode = false }: SubPageProps) {
  const items = [
    { title: 'STEM Computing Center', tag: 'Academics', desc: 'JHS 2 students utilizing our modern computer lab for visual basic programming.' },
    { title: 'WASSCE Experimental Physics', tag: 'Labs', desc: 'Our science laboratory equipped with standard mechanical and fluid dynamic models.' },
    { title: 'Inter-School Soccer Finals', tag: 'Athletics', desc: 'Edweso Royal Academy soccer team celebrates the regional Ashanti League victory.' },
    { title: 'PTA Strategic Consultation', tag: 'Community', desc: 'Parents and Board of Trustees reviewing the terminal school fees structures.' },
    { title: 'Nursery Playground Activities', tag: 'Daycare', desc: 'Daycare and Creche sensory games in our padded, fully secure toddler zone.' },
    { title: 'Morning Assembly Address', tag: 'Morals', desc: 'Daily devotional hymns, national pledges, and moral discipline briefings.' }
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-fade-in space-y-8">
      <div className="text-center space-y-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-mono">Visual Archive</span>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Campus Gallery & Facilities</h2>
        <p className="text-xs text-slate-500 max-w-lg mx-auto font-medium">Review actual captures of our educational blocks, modern science labs, inter-school athletics, and community gatherings.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((it, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs group hover:shadow-md transition-all">
            {/* Elegant Vector Art Placeholder */}
            <div className="h-44 bg-slate-100 dark:bg-slate-950/60 p-6 flex flex-col justify-between border-b relative overflow-hidden">
              <span className="bg-emerald-600 text-white font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-full self-start">
                {it.tag}
              </span>
              <div className="text-center space-y-1 z-10">
                <h5 className="font-black text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wide">{it.title}</h5>
                <span className="text-[9px] font-bold text-slate-400 font-mono">MEDIA REF ERA-G-{100 + idx}</span>
              </div>
              <div className="absolute inset-0 bg-linear-to-tr from-emerald-500/5 to-transparent pointer-events-none"></div>
            </div>
            
            <div className="p-4 space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                {it.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 6. NEWS & EVENTS
export function NewsEvents({ isDarkMode = false }: SubPageProps) {
  const posts = [
    {
      date: 'July 11, 2026',
      cat: 'Institutional',
      title: 'Edweso Royal Academy Partners with Paystack for Modern Terminal billing',
      excerpt: 'We have completely removed cash handovers at the administrative block. Parents can now configure weekly, monthly, or termly tuition payment plans securely using mobile money wallets.'
    },
    {
      date: 'June 28, 2026',
      cat: 'Academics',
      title: 'BECE Preliminary Trial Results: 100% Distinction Benchmark Reached',
      excerpt: 'The Academic Board is proud to report that our JHS 3 candidates registered outstanding continuous assessment averages during the terminal mock examinations. Science and math leads.'
    },
    {
      date: 'May 15, 2026',
      cat: 'Events',
      title: 'STEM Robotics Camp Launch Scheduled for August Holiday Period',
      excerpt: 'Calling all primary class 4 to JHS 3 entrants! Join our expert-led programming camps. Learn JavaScript syntax, sensory hardware routing, and drone logic. Registration form in Parent Portal.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in space-y-8">
      <div className="text-center space-y-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full font-mono">Academy Newsfeed</span>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">News, Press Releases & Event Registers</h2>
      </div>

      <div className="space-y-6">
        {posts.map((post, idx) => (
          <div key={idx} className="p-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl space-y-3 shadow-2xs hover:shadow-xs transition-all">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold text-slate-400 font-mono uppercase">{post.date}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              <span className="bg-indigo-500/10 text-indigo-600 text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono">{post.cat}</span>
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight hover:text-indigo-600 transition-colors cursor-pointer">
              {post.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              {post.excerpt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 7. FAQ
export function FAQView({ isDarkMode = false }: SubPageProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  
  const faqs = [
    { q: 'Can we pay terminal tuition fees in cash at the administration block?', a: 'No. To maintain complete accounting transparency and ledger accuracy, Edweso Royal Academy is a cashless campus. All payments are processed digitally via Ghanaian mobile money (MoMo) or debit cards through our secure Paystack integration portal.' },
    { q: 'Is there a tuition discount for enrolling multiple children?', a: 'Yes! We run a generous Family Sibling Discount program. Families with 2 enrolled children receive a 5% discount across the total tuition. 3 children receive 10%, and 4 or more children receive a 15% discount across the family ledger.' },
    { q: 'What is the morning timeline and grace period for student check-ins?', a: 'Students are expected to scan their RFID cards at the main security gate by 08:00 AM. A late checklist is processed by 08:30 AM, dispatching an automated terminal alert to parent profiles on the dashboard.' },
    { q: 'Is transportation and daily lunch feeding mandatory for all levels?', a: 'The school bus transport program is completely optional and depends on your residential zone. The daily lunch feeding program is optional for primary and JHS students but is highly recommended to maintain balanced sensory energy levels.' },
    { q: 'What is the administrative late payment policy?', a: 'We offer a 7-day grace period from the chosen installment deadline. On day 8, a 5% flat fee is applied. If there are continuous default periods exceeding 21 days without an approved micro-payment promissory agreement, portal access is temporarily deactivated.' }
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in space-y-8">
      <div className="text-center space-y-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-mono">Support Hub</span>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Frequently Asked Questions</h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between font-extrabold text-xs text-slate-900 dark:text-white gap-3 cursor-pointer"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {isOpen && (
                <div className="p-4 pt-0 border-t border-dashed text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed animate-fade-in bg-slate-50/50 dark:bg-slate-950/20">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 8. PRIVACY POLICY
export function PrivacyPolicy({ isDarkMode = false }: SubPageProps) {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in space-y-6 text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
      <div className="text-center space-y-2 pb-4 border-b">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Privacy & Student Record Policy</h2>
        <p className="text-slate-400 text-[10px] font-mono">Last updated: July 12, 2026</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wide">1. Data Collection Framework</h3>
        <p>
          Edweso Royal Academy collects administrative data including names, birth parameters, guardian telephone contacts, email dispatches, continuous diagnostic terminal assessment grades, and gate RFID logs. This data is handled in complete compliance with the Ghana Data Protection Act, 2012 (Act 843).
        </p>

        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wide">2. Financial Integrity</h3>
        <p>
          Our tuition payments are processed directly by Paystack. Edweso Royal Academy does not cache, record, or inspect raw mobile money PIN codes, debit card credentials, CVV parameters, or banking keys. Paystack is completely PCI-DSS compliant.
        </p>

        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wide">3. Third-Party Restrictions</h3>
        <p>
          Student diagnostic assessment records, attendance histories, and SMS parent telephone contacts are strictly confidential. We do not transmit, lease, or expose educational metrics to any corporate marketing agencies, advertisers, or unaccredited academic bodies.
        </p>
      </div>
    </div>
  );
}

// 9. TERMS & CONDITIONS
export function TermsConditions({ isDarkMode = false }: SubPageProps) {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in space-y-6 text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
      <div className="text-center space-y-2 pb-4 border-b">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Enrollment Contract & Financial Terms</h2>
        <p className="text-slate-400 text-[10px] font-mono">Last updated: July 12, 2026</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wide">1. Tuition Responsibility</h3>
        <p>
          By finalizing an enrollment application or logging credentials on the Edweso Royal Academy Parent Portal, the primary guardian agrees to pay the designated tuition rate, bus transport surcharge, and feeding fees according to the chosen installment schedule.
        </p>

        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wide">2. Payment Schedule Grace Periods</h3>
        <p>
          Installment payments must clear on or before the calendar deadline. Accounts that fail to clear or register an authorized standing debit subscription on Paystack within the 7-day grace period are subject to a flat 5% administrative surcharge.
        </p>

        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wide">3. Code of Conduct Compliance</h3>
        <p>
          Edweso Royal Academy retains absolute authority to suspend parent portal credentials or students whose continuous actions violate the moral integrity and safety boundaries of our physical campus, including bullying, continuous defaults, or fraudulent assessment tampering.
        </p>
      </div>
    </div>
  );
}
