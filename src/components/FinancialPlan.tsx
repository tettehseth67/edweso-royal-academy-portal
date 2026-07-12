import React, { useState } from 'react';
import { 
  CreditCard, Landmark, Coins, FileText, ChevronRight, Calculator, 
  Percent, ShieldAlert, Sparkles, TrendingUp, HelpCircle, GraduationCap, 
  Truck, CheckCircle2, Award, Users, Download, Printer, ArrowLeft, Smartphone
} from 'lucide-react';

interface FinancialPlanProps {
  isDarkMode?: boolean;
}

export default function FinancialPlan({ isDarkMode = false }: FinancialPlanProps) {
  const [activePlanTab, setActivePlanTab] = useState<string>('executive-summary');
  
  // Interactive Calculator State
  const [calcLevel, setCalcLevel] = useState<string>('primary');
  const [calcIsNew, setCalcIsNew] = useState<boolean>(true);
  const [calcTransportZone, setCalcTransportZone] = useState<string>('none');
  const [calcFeedingPlan, setCalcFeedingPlan] = useState<boolean>(true);
  const [calcBoardingPlan, setCalcBoardingPlan] = useState<boolean>(false);
  const [calcSupplies, setCalcSupplies] = useState({
    uniforms: true,
    peUniform: true,
    houseShirt: true,
    sweater: true,
    bag: true,
    textbooks: true
  });
  const [calcNumChildren, setCalcNumChildren] = useState<number>(1);
  const [calcPaymentPlan, setCalcPaymentPlan] = useState<string>('termly');
  const [calcFinancialAid, setCalcFinancialAid] = useState<string>('none');

  // Paystack Simulation State
  const [showPaystackModal, setShowPaystackModal] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [paidReference, setPaidReference] = useState<string>('');
  const [paystackChannel, setPaystackChannel] = useState<'card' | 'momo'>('card');
  const [momoProvider, setMomoProvider] = useState<string>('mtn');
  const [momoNumber, setMomoNumber] = useState<string>('0244123456');

  // Pricing constants (GHS)
  const tuitionRates: Record<string, { termly: number; annual: number; monthly: number }> = {
    daycare: { termly: 1200, annual: 3400, monthly: 420 },
    kindergarten: { termly: 1400, annual: 3900, monthly: 490 },
    primary: { termly: 1600, annual: 4500, monthly: 560 },
    jhs: { termly: 1900, annual: 5300, monthly: 660 },
    shs: { termly: 2400, annual: 6800, monthly: 840 }
  };

  const transportRates: Record<string, { termly: number; annual: number; monthly: number }> = {
    none: { termly: 0, annual: 0, monthly: 0 },
    zoneA: { termly: 700, annual: 1900, monthly: 250 },
    zoneB: { termly: 980, annual: 2700, monthly: 350 },
    zoneC: { termly: 1260, annual: 3500, monthly: 450 },
    zoneD: { termly: 1540, annual: 4300, monthly: 550 }
  };

  const feedingRates = { termly: 900, annual: 2500, monthly: 330 };
  const boardingRates = { termly: 1500, annual: 4200, monthly: 520 };

  const admissionRates = {
    form: 150,
    assessment: 100,
    registration: 250,
    idCard: 50,
    onboarding: 150
  };

  const supplyRates = {
    uniforms: 300,
    peUniform: 120,
    houseShirt: 80,
    sweater: 150,
    bag: 100,
    textbooks: 450
  };

  // Calculations
  const getTuitionBase = () => {
    const rate = tuitionRates[calcLevel] || tuitionRates.primary;
    if (calcPaymentPlan === 'annual') return rate.annual;
    if (calcPaymentPlan === 'monthly') return rate.monthly * 4; // per term equivalent or actual term plan
    if (calcPaymentPlan === 'weekly') return (rate.monthly * 4) / 4;
    return rate.termly;
  };

  const getSubtotalFees = () => {
    let total = 0;
    
    // Tuition Base
    let tuition = getTuitionBase();
    
    // Auto-pay or financial aid discount
    let discountPercent = 0;
    if (calcPaymentPlan === 'annual') {
      // already discounted rate
    } else if (calcPaymentPlan === 'autopay') {
      discountPercent += 3;
    }

    if (calcFinancialAid === 'merit') {
      discountPercent += 50;
    } else if (calcFinancialAid === 'need') {
      discountPercent += 35;
    } else if (calcFinancialAid === 'community') {
      discountPercent += 20;
    }

    // Siblings Discount
    if (calcNumChildren === 2) {
      discountPercent += 2.5; // average across children
    } else if (calcNumChildren === 3) {
      discountPercent += 5;
    } else if (calcNumChildren >= 4) {
      discountPercent += 10;
    }

    tuition = tuition * (1 - discountPercent / 100);
    total += tuition;

    // Transport Rates
    const transRate = transportRates[calcTransportZone] || transportRates.none;
    if (calcPaymentPlan === 'annual') total += transRate.annual;
    else if (calcPaymentPlan === 'monthly' || calcPaymentPlan === 'weekly') total += transRate.monthly;
    else total += transRate.termly;

    // Feeding Plan
    if (calcFeedingPlan) {
      if (calcPaymentPlan === 'annual') total += feedingRates.annual;
      else if (calcPaymentPlan === 'monthly' || calcPaymentPlan === 'weekly') total += feedingRates.monthly;
      else total += feedingRates.termly;
    }

    // Boarding Plan (SHS only)
    if (calcBoardingPlan && calcLevel === 'shs') {
      if (calcPaymentPlan === 'annual') total += boardingRates.annual;
      else if (calcPaymentPlan === 'monthly' || calcPaymentPlan === 'weekly') total += boardingRates.monthly;
      else total += boardingRates.termly;
    }

    // Admission Rates
    if (calcIsNew) {
      total += admissionRates.form + admissionRates.assessment + admissionRates.registration + admissionRates.idCard + admissionRates.onboarding;
    }

    // Supplies Rates
    if (calcSupplies.uniforms) total += supplyRates.uniforms;
    if (calcSupplies.peUniform) total += supplyRates.peUniform;
    if (calcSupplies.houseShirt) total += supplyRates.houseShirt;
    if (calcSupplies.sweater) total += supplyRates.sweater;
    if (calcSupplies.bag) total += supplyRates.bag;
    if (calcSupplies.textbooks) total += supplyRates.textbooks;

    // Weekly/monthly plan convenience surcharges
    if (calcPaymentPlan === 'weekly') {
      total = total * 1.08; // 8% service charge
    } else if (calcPaymentPlan === 'monthly') {
      total = total * 1.05; // 5% service charge
    }

    return Math.round(total);
  };

  const grandTotal = getSubtotalFees();

  const handleSimulatePaystackPayment = () => {
    setShowPaystackModal(true);
    setPaymentSuccess(false);
  };

  const handleFinalizePayment = () => {
    setPaymentSuccess(true);
    setPaidReference('ERA-PAY-' + Math.floor(100000 + Math.random() * 900000));
  };

  // Forecasting Scenarios
  const scenarios = [
    { students: 100, label: 'Emergent Phase', admissionRev: 70000, tuitionRev: 185000, foodTransRev: 140000, grossRev: 395000 },
    { students: 250, label: 'Establishment Phase', admissionRev: 175000, tuitionRev: 462500, foodTransRev: 350000, grossRev: 987500 },
    { students: 500, label: 'Consolidation Phase', admissionRev: 350000, tuitionRev: 925000, foodTransRev: 700000, grossRev: 1975000 },
    { students: 1000, label: 'Leadership Phase', admissionRev: 700000, tuitionRev: 1850000, foodTransRev: 1400000, grossRev: 3950000 }
  ];

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 font-sans ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
      
      {/* Page Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 mb-10 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-6 translate-x-6">
          <Landmark size={360} />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <span className="bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full font-mono">
            Strategic Financial Blueprint
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-none text-white">
            Edweso Royal Academy Financial Management & Fees Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
            Review our institutional pricing schedule, auto-pay program parameters, and interactive billing system powered by our secure Paystack integration portal.
          </p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Section Navigation Menu */}
        <div className="space-y-2">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 shadow-xs">
            <h3 className="font-extrabold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-2">Table of Contents</h3>
            <div className="flex flex-col space-y-1">
              {[
                { id: 'executive-summary', label: '1. Executive Summary', icon: <FileText size={14} /> },
                { id: 'student-levels', label: '2. Student Levels', icon: <Users size={14} /> },
                { id: 'admission-fees', label: '3. Admission & Onboarding', icon: <GraduationCap size={14} /> },
                { id: 'tuition-fees', label: '4. Tuition Fee Matrices', icon: <Coins size={14} /> },
                { id: 'transportation-fees', label: '5. Transportation Zones', icon: <Truck size={14} /> },
                { id: 'feeding-supplies', label: '6 & 7. Feeding & Supplies', icon: <Percent size={14} /> },
                { id: 'boarding-fees', label: '8. Boarding Framework', icon: <Landmark size={14} /> },
                { id: 'payment-plans', label: '9. Payment Schedules', icon: <CreditCard size={14} /> },
                { id: 'paystack-plan', label: '10. Paystack Gateway', icon: <Smartphone size={14} /> },
                { id: 'discounts-aid', label: '11 & 12. Sibling Aid', icon: <Award size={14} /> },
                { id: 'late-policy', label: '13. Late Payment Policy', icon: <ShieldAlert size={14} /> },
                { id: 'interactive-calc', label: '14. Parent Fee Calculator', icon: <Calculator size={14} /> },
                { id: 'financial-forecast', label: '15. Revenue Forecasts', icon: <TrendingUp size={14} /> },
                { id: 'pricing-strategy', label: '16. Strategic Blueprint', icon: <Sparkles size={14} /> }
              ].map(sec => {
                const isActive = activePlanTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActivePlanTab(sec.id)}
                    className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-black text-left transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900'
                    }`}
                  >
                    {sec.icon}
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
            <h4 className="text-xs font-bold text-amber-700 uppercase">Need Financial Assistance?</h4>
            <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              We offer scholarships and customized installment arrangements to ensure every child gets access to world-class education.
            </p>
            <button 
              onClick={() => setActivePlanTab('discounts-aid')}
              className="text-[10px] font-black uppercase text-amber-800 hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
            >
              <span>Review Criteria</span>
              <ChevronRight size={10} />
            </button>
          </div>
        </div>

        {/* Right Side: Tab Panel Content */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* 1. EXECUTIVE SUMMARY */}
          {activePlanTab === 'executive-summary' && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4 animate-fade-in shadow-xs">
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
                <FileText className="text-emerald-600" size={20} />
                <span>Executive Summary & Financial Architecture</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                Edweso Royal Academy operates on a dual-core mandate: to deliver high-quality, continuous diagnostic assessment under the Ghana Education Service (GES) standards, while ensuring complete financial transparency and administrative simplicity.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-emerald-50 dark:bg-slate-950/40 rounded-xl space-y-1">
                  <h4 className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase">Sustainability Target</h4>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Balanced Ledger Cap</p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">95%+ recovery rate inside the initial 21 calendar days of the term.</p>
                </div>
                <div className="p-4 bg-amber-500/10 rounded-xl space-y-1">
                  <h4 className="text-[10px] font-black text-amber-700 uppercase">Access to Education</h4>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Flexible Installments</p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Auto-pay schedules, allowing parents to break term costs into monthly or weekly Micro-Payments.</p>
                </div>
                <div className="p-4 bg-indigo-50 dark:bg-slate-950/40 rounded-xl space-y-1">
                  <h4 className="text-[10px] font-black text-indigo-800 dark:text-indigo-400 uppercase">Paystack Efficiency</h4>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Instant Clearing</p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">All financial transactions flow into digital sub-accounts, reducing school administrative overheads.</p>
                </div>
              </div>

              <div className="pt-2 space-y-2 text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  This blueprint outline defines the fee matrices, student grade-specific tuition levels, auxiliary costs (feeding, uniforms, textbooks, transportation), and payment programs configured into our modern Parent Portal. School Owners, Registry officials, and software developers are guided by these standard tables to enforce consistent ledger billing.
                </p>
              </div>
            </div>
          )}

          {/* 2. STUDENT LEVELS */}
          {activePlanTab === 'student-levels' && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4 animate-fade-in shadow-xs">
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
                <Users className="text-emerald-600" size={20} />
                <span>Comprehensive Student Level Classification</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                Our curriculum and facility allocations are categorized into five distinctive academic segments, each designed to balance rigorous instruction with age-appropriate physical assets.
              </p>
              
              <div className="space-y-3">
                {[
                  { level: 'Daycare & Creche', ages: 'Ages 1 - 3', description: 'Early sensory coordination, play-based learning, highly secure visual nursery units, high teacher-to-child ratio.' },
                  { level: 'Kindergarten (KG1 - KG2)', ages: 'Ages 4 - 5', description: 'Early phonic and language structures, basic numerical literacy, interactive motor development, foundational ethics.' },
                  { level: 'Primary (Class 1 - 6)', ages: 'Ages 6 - 11', description: 'Standard Ghana Curriculum (GES standard), science, math, technology, local history, and critical thinking.' },
                  { level: 'Junior High School (JHS 1 - 3)', ages: 'Ages 12 - 14', description: 'Preparation for BECE, pre-technical skills, home economics, computing, citizenship education, and career guidance.' },
                  { level: 'Senior High School (SHS 1 - 3)', ages: 'Ages 15 - 18', description: 'WASSCE exam path, specialized science / business / arts options, advanced IT, university preparatory labs.' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl flex items-start gap-3">
                    <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 font-mono">
                      {idx + 1}
                    </span>
                    <div className="space-y-0.5 text-xs">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 dark:text-slate-100 font-extrabold">{item.level}</strong>
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded font-bold font-mono">{item.ages}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. ADMISSION AND ENROLLMENT FEES */}
          {activePlanTab === 'admission-fees' && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4 animate-fade-in shadow-xs">
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
                <GraduationCap className="text-emerald-600" size={20} />
                <span>Admission, Assessment & Enrollment Fees (One-Time)</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                To complete the formal academic registration and record onboarding for new entrants, the following structured one-time fees apply:
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-150 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950/65 font-black uppercase text-slate-500 border-b border-slate-150 dark:border-slate-800 font-mono">
                    <tr>
                      <th className="p-3.5">Fee Category</th>
                      <th className="p-3.5 text-center">Amount (GHS)</th>
                      <th className="p-3.5">Coverage / Regulatory Mandate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-800 font-semibold">
                    <tr>
                      <td className="p-3.5 font-extrabold text-slate-850 dark:text-slate-100">Admission Form Fee</td>
                      <td className="p-3.5 text-center font-mono text-emerald-600">150.00</td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400">Prospectus, application dossier packet, and database entry tokens.</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-extrabold text-slate-850 dark:text-slate-100">Entrance Assessment Fee</td>
                      <td className="p-3.5 text-center font-mono text-emerald-600">100.00</td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400">Diagnostic reading, logic, and mathematics written screening tests.</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-extrabold text-slate-850 dark:text-slate-100">Registration Fee</td>
                      <td className="p-3.5 text-center font-mono text-emerald-600">250.00</td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400">Official ledger setup, regulatory document logging, system credential allocation.</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-extrabold text-slate-850 dark:text-slate-100">Student ID card</td>
                      <td className="p-3.5 text-center font-mono text-emerald-600">50.00</td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400">RFID-embedded smart card for security gates and library logs.</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-extrabold text-slate-850 dark:text-slate-100">New Student Onboarding</td>
                      <td className="p-3.5 text-center font-mono text-emerald-600">150.00</td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400">Onboarding seminar packet, portal tutorials, orientation camp files.</td>
                    </tr>
                    <tr className="bg-emerald-500/5 font-extrabold text-slate-850 dark:text-slate-100">
                      <td className="p-3.5">Total One-Time Onboarding Bundle</td>
                      <td className="p-3.5 text-center font-mono text-emerald-500">700.00</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">Mandatory for all newly enrolled students. Retained continuously.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. TUITION FEE STRUCTURE */}
          {activePlanTab === 'tuition-fees' && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4 animate-fade-in shadow-xs">
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
                <Coins className="text-emerald-600" size={20} />
                <span>Standard Tuition Fee Structure (Annual / Termly / Monthly)</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                Tuition rates vary by academic segment. The rates below are calibrated to cover first-class academic staffing, digital portal access, and general overheads:
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-150 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950/65 font-black uppercase text-slate-500 border-b border-slate-150 dark:border-slate-800 font-mono">
                    <tr>
                      <th className="p-3.5">Academic Level</th>
                      <th className="p-3.5 text-center">Termly (GHS)</th>
                      <th className="p-3.5 text-center">Annual (GHS) <span className="text-emerald-500 text-[10px] block font-semibold lowercase">~10% discount</span></th>
                      <th className="p-3.5 text-center">Monthly Installment (GHS)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-800 font-semibold">
                    {Object.entries(tuitionRates).map(([key, value]) => (
                      <tr key={key}>
                        <td className="p-3.5 font-extrabold uppercase text-slate-850 dark:text-slate-100">{key}</td>
                        <td className="p-3.5 text-center font-mono text-indigo-600">{value.termly.toFixed(2)}</td>
                        <td className="p-3.5 text-center font-mono text-emerald-600 font-extrabold">{value.annual.toFixed(2)}</td>
                        <td className="p-3.5 text-center font-mono text-slate-600 dark:text-slate-300">{value.monthly.toFixed(2)} <span className="text-[9px] text-slate-400 font-bold block">(4 payments / term)</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/30 rounded-xl space-y-1.5 border">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Recommended Selection Benefit:</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  Choosing the <strong>Annual Payment option</strong> locks in a 10% structural discount, protecting parents from potential terminal tariff updates. Annual options clear instantly on Paystack.
                </p>
              </div>
            </div>
          )}

          {/* 5. TRANSPORTATION FEE STRUCTURE */}
          {activePlanTab === 'transportation-fees' && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4 animate-fade-in shadow-xs">
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
                <Truck className="text-emerald-600" size={20} />
                <span>School Bus Transportation Fee Structure (By Distance Zones)</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                Edweso Royal Academy operates a safe, GPS-monitored student bus service. Transit pricing is organized strictly into four geographic radii based on highway distance from the main gate:
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-150 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950/65 font-black uppercase text-slate-500 border-b border-slate-150 dark:border-slate-800 font-mono">
                    <tr>
                      <th className="p-3.5">Zone & Radius</th>
                      <th className="p-3.5 text-center">Monthly (GHS)</th>
                      <th className="p-3.5 text-center">Termly (GHS)</th>
                      <th className="p-3.5 text-center">Annual Option (GHS)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-800 font-semibold">
                    {Object.entries(transportRates).filter(([key]) => key !== 'none').map(([key, value]) => (
                      <tr key={key}>
                        <td className="p-3.5 font-extrabold uppercase text-slate-850 dark:text-slate-100">
                          {key === 'zoneA' ? 'Zone A (0 - 5 km)' : key === 'zoneB' ? 'Zone B (5 - 10 km)' : key === 'zoneC' ? 'Zone C (10 - 15 km)' : 'Zone D (15 - 20 km)'}
                        </td>
                        <td className="p-3.5 text-center font-mono text-slate-600 dark:text-slate-300">{value.monthly.toFixed(2)}</td>
                        <td className="p-3.5 text-center font-mono text-indigo-600">{value.termly.toFixed(2)}</td>
                        <td className="p-3.5 text-center font-mono text-emerald-600 font-extrabold">{value.annual.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6 & 7. FEEDING & SUPPLIES FEES */}
          {activePlanTab === 'feeding-supplies' && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4 animate-fade-in shadow-xs">
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
                <Percent className="text-emerald-600" size={20} />
                <span>Feeding Program, Uniforms & Learning Materials Matrix</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                Ensure your child is equipped with highly standardized uniforms, sweaters, backpacks, and continuous diagnostic curriculum booklets.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Feeding Program */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-3 border">
                  <h4 className="font-extrabold text-xs text-indigo-800 dark:text-indigo-400 uppercase font-mono tracking-wider border-b pb-1.5">Feeding Plan Structure</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                    A nutritious, hot lunch program designed under Ghana Health Service standards. Formulated for high mineral and physical energy levels.
                  </p>
                  <div className="space-y-1.5 font-semibold text-xs font-mono">
                    <div className="flex justify-between">
                      <span>Daily Lunch rate:</span>
                      <span className="text-emerald-600">GHS 15.00 / day</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly rate:</span>
                      <span className="text-slate-600 dark:text-slate-300">GHS 330.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Termly Program:</span>
                      <span className="text-indigo-600">GHS 900.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual lock-in:</span>
                      <span className="text-emerald-600 font-extrabold">GHS 2,500.00</span>
                    </div>
                  </div>
                </div>

                {/* Supplies & Attire */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-3 border">
                  <h4 className="font-extrabold text-xs text-amber-800 uppercase font-mono tracking-wider border-b pb-1.5">Uniforms & Mandatory Supplies</h4>
                  <div className="space-y-2 text-xs font-semibold">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-800 dark:text-slate-200">Daily Wear (2 sets)</span>
                      <span className="font-mono text-emerald-600">GHS 300.00</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-800 dark:text-slate-200">PE Attire (1 set)</span>
                      <span className="font-mono text-emerald-600">GHS 120.00</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-800 dark:text-slate-200">House T-Shirt (1 set)</span>
                      <span className="font-mono text-emerald-600">GHS 80.00</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-800 dark:text-slate-200">Official Crested Sweater</span>
                      <span className="font-mono text-emerald-600">GHS 150.00</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-800 dark:text-slate-200">Heavy duty school backpack</span>
                      <span className="font-mono text-emerald-600">GHS 100.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-800 dark:text-slate-200">Textbooks & Workbook logs</span>
                      <span className="font-mono text-emerald-600">GHS 450.00</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 8. BOARDING FEES */}
          {activePlanTab === 'boarding-fees' && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4 animate-fade-in shadow-xs">
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
                <Landmark className="text-emerald-600" size={20} />
                <span>Proposed Boarding Add-On Structure (Senior High School)</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                For our WASSCE-path Senior High School (SHS) students, we offer clean, highly guarded on-site boarding hostels. The boarding fee covers high-protein meal plans, laundry, stable electricity generators, and 24/7 security.
              </p>

              <div className="p-4 bg-indigo-50 dark:bg-slate-950/40 rounded-xl space-y-3.5 border border-indigo-100">
                <h4 className="text-xs font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-wide">Boarding Tariff Matrix</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-center">
                  <div className="p-3 bg-white dark:bg-slate-950/60 rounded-lg">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Monthly Equivalent</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white">GHS 520.00</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-950/60 rounded-lg border border-indigo-200">
                    <span className="text-[10px] text-indigo-600 font-black block uppercase">Termly boarding cost</span>
                    <span className="text-sm font-black text-indigo-700">GHS 1,500.00</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-950/60 rounded-lg">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Annual structural deal</span>
                    <span className="text-xs font-black text-emerald-600 font-extrabold">GHS 4,200.00</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  *Note: Boarding is strictly an opt-in structural cost for Senior High School (SHS) entrants only. Day tuition continues to remain standard if chosen.
                </p>
              </div>
            </div>
          )}

          {/* 9. PAYMENT PLANS */}
          {activePlanTab === 'payment-plans' && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4 animate-fade-in shadow-xs">
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
                <CreditCard className="text-emerald-600" size={20} />
                <span>Structured Installment Payment Programs</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                To accommodate every family budget, Edweso Royal Academy offers five highly distinct payment channels integrated into Paystack. Select your appropriate billing plan:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: '1. Annual Payment Plan', discount: '10% OFF Tuition', desc: 'Saves 10% on tuition. Paid on or before August 31st. Perfect for inflation protection.' },
                  { title: '2. Termly Payment Plan', discount: 'Standard Rate', desc: 'Divided into 3 standard payments per year, due on the first day of each school term.' },
                  { title: '3. Monthly Installments', discount: '5% Service Fee', desc: ' Tuition + feeding split into 4 equal monthly installments. Paid by standing Paystack auto-pay.' },
                  { title: '4. Weekly Micro-Payments', discount: '8% Service Fee', desc: 'Allows weekly payments via Mobile Money. Ideal for small, fast wage clearances.' },
                  { title: '5. Auto-Pay Subscription', discount: '3% OFF Tuition Incentive', desc: 'Automated card/MoMo credit system charging your wallet on pre-approved calendar days.' }
                ].map((plan, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border space-y-1 text-xs">
                    <div className="flex justify-between items-center gap-1">
                      <strong className="text-slate-900 dark:text-slate-100 font-extrabold">{plan.title}</strong>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-500 font-black uppercase px-2 py-0.5 rounded font-mono">
                        {plan.discount}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{plan.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. PAYSTACK INTEGRATION PLAN */}
          {activePlanTab === 'paystack-plan' && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4 animate-fade-in shadow-xs">
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
                <Smartphone className="text-emerald-600" size={20} />
                <span>Paystack Secure Payment & Gateway Architecture</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                Edweso Royal Academy utilizes Paystack to process electronic transactions. No cash payments are accepted on-site to preserve accounting integrity.
              </p>

              <div className="space-y-3.5">
                {[
                  { title: 'Instant Mobile Money Integration', icon: <Smartphone className="text-amber-500" size={16} />, desc: 'Cleared instantly across MTN Mobile Money, Telecel Cash, and AT Money. Simple PIN confirmations.' },
                  { title: 'Standing Subscriptions & Recurring Debits', icon: <Coins className="text-emerald-500" size={16} />, desc: 'Configure your Visa/Mastercard once and have your monthly or weekly payments debit on paydays automatically.' },
                  { title: 'Instant Receipt & Invoice dispatch', icon: <FileText className="text-indigo-500" size={16} />, desc: 'Every payment triggers an instant cryptographic reference code, generating a downloadable PDF tuition receipt.' },
                  { title: 'System-Dispatched Reminders', icon: <ShieldAlert className="text-rose-500" size={16} />, desc: 'Automated SMS and email notices alert parents 5 days prior to an auto-debit event or installment deadline.' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl flex items-start gap-3">
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg shrink-0 mt-0.5 border shadow-2xs">
                      {item.icon}
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <h4 className="text-slate-900 dark:text-slate-100 font-extrabold">{item.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 11 & 12. SIBLING & FINANCIAL AID */}
          {activePlanTab === 'discounts-aid' && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4 animate-fade-in shadow-xs">
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
                <Award className="text-emerald-600" size={20} />
                <span>Family Sibling Discounts & Scholarship Programs</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                We believe in rewarding scholastic excellence and supporting large Ghanaian households. Sibling and aid structures apply directly to base tuition costs:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Sibling Discounts */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-3.5 border">
                  <h4 className="font-extrabold text-xs text-indigo-800 dark:text-indigo-400 uppercase font-mono tracking-wider border-b pb-1.5">Family Discount Matrix</h4>
                  <div className="space-y-2 text-xs font-semibold">
                    <div className="flex justify-between border-b pb-1">
                      <span>Two Active Children</span>
                      <span className="text-emerald-600 font-bold">5% discount</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>Three Active Children</span>
                      <span className="text-emerald-600 font-bold">10% discount</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Four or more Children</span>
                      <span className="text-emerald-600 font-extrabold">15% discount</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                    *Sibling percentage is applied across the total pooled tuition balance of the family account. Verified on enrollment.
                  </p>
                </div>

                {/* Aid & Scholarships */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-3.5 border">
                  <h4 className="font-extrabold text-xs text-amber-800 uppercase font-mono tracking-wider border-b pb-1.5">Scholarships & Financial Aid</h4>
                  <div className="space-y-2 text-xs font-semibold">
                    <div className="flex justify-between border-b pb-1">
                      <span>Merit Scholarship</span>
                      <span className="text-indigo-600 font-bold">50% off tuition</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>Need-based Sibling Aid</span>
                      <span className="text-indigo-600 font-bold">35% off tuition</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Community Servant Rebate</span>
                      <span className="text-indigo-600 font-extrabold">20% off tuition</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                    *Scholarship eligibility requires active assessment scores exceeding 85% or an audited family financial ledger report.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* 13. LATE PAYMENT POLICY */}
          {activePlanTab === 'late-policy' && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4 animate-fade-in shadow-xs">
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
                <ShieldAlert className="text-emerald-600" size={20} />
                <span>Late Payment, Grace Period & Default Policy</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                To guarantee continuous operations and staff remuneration cycles, Edweso Royal Academy enforces a firm but highly structured default policy:
              </p>

              <div className="space-y-3">
                {[
                  { phase: '1. Grace Period', timeline: 'Days 1 - 7 of deadline', color: 'border-emerald-500 bg-emerald-500/5', desc: 'No administrative penalty or notice issued. The family portal retains standard status.' },
                  { phase: '2. Late Fee Surcharge', timeline: 'Day 8 of default', color: 'border-amber-500 bg-amber-500/5', desc: 'A flat 5% late fee surcharge is applied to the outstanding terminal tuition balance automatically.' },
                  { phase: '3. Custom payment negotiations', timeline: 'Days 9 - 20 of default', color: 'border-indigo-500 bg-indigo-500/5', desc: 'Parents are invited to sign a customized promissory micro-installment schedule to halt further sanctions.' },
                  { phase: '4. Temporary Student Suspension', timeline: 'Day 21 of default', color: 'border-rose-500 bg-rose-500/5', desc: 'If no auto-pay registration or promissory schedule is completed, parent portal access and class credentials are temporarily deactivated.' }
                ].map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border-l-4 ${item.color} text-xs space-y-1`}>
                    <div className="flex justify-between items-center">
                      <strong className="text-slate-900 dark:text-slate-100 font-extrabold">{item.phase}</strong>
                      <span className="font-mono text-[10px] font-bold uppercase">{item.timeline}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 14. INTERACTIVE CALCULATOR */}
          {activePlanTab === 'interactive-calc' && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4 animate-fade-in shadow-xs">
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
                <Calculator className="text-emerald-600" size={20} />
                <span>Interactive Student Fees Estimation Engine</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                Adjust the parameters below to compute an accurate estimated bill for your child, factoring in sibling discounts, transport, boarding, and customized Paystack schedules.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                
                {/* Inputs Pane */}
                <div className="md:col-span-7 space-y-4 border-r dark:border-slate-800 pr-0 md:pr-6">
                  
                  {/* Student Level */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Student Level</label>
                    <select 
                      value={calcLevel}
                      onChange={(e) => setCalcLevel(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border bg-slate-50 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-white outline-hidden"
                    >
                      <option value="daycare">Daycare & Creche (GHS 1,200.00 / term)</option>
                      <option value="kindergarten">Kindergarten (GHS 1,400.00 / term)</option>
                      <option value="primary">Primary (GHS 1,600.00 / term)</option>
                      <option value="jhs">Junior High School (GHS 1,900.00 / term)</option>
                      <option value="shs">Senior High School (GHS 2,400.00 / term)</option>
                    </select>
                  </div>

                  {/* Sibling Count & Aid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Total Sibling Pool</label>
                      <select 
                        value={calcNumChildren}
                        onChange={(e) => setCalcNumChildren(parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-xs font-bold rounded-xl border bg-slate-50 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-white outline-hidden"
                      >
                        <option value={1}>1 Child (No Sibling rebate)</option>
                        <option value={2}>2 Children (~2.5% rebate)</option>
                        <option value={3}>3 Children (~5% rebate)</option>
                        <option value={4}>4+ Children (~10% rebate)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Financial Aid Program</label>
                      <select 
                        value={calcFinancialAid}
                        onChange={(e) => setCalcFinancialAid(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold rounded-xl border bg-slate-50 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-white outline-hidden"
                      >
                        <option value="none">None</option>
                        <option value="merit">Merit Academic (50% Off Tuition)</option>
                        <option value="need">Need-based Sibling (35% Off Tuition)</option>
                        <option value="community">Community Rebate (20% Off Tuition)</option>
                      </select>
                    </div>
                  </div>

                  {/* Transport & Meal Plan */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Bus Transportation</label>
                      <select 
                        value={calcTransportZone}
                        onChange={(e) => setCalcTransportZone(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold rounded-xl border bg-slate-50 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-white outline-hidden"
                      >
                        <option value="none">No School Bus</option>
                        <option value="zoneA">Zone A (0 - 5 km) (GHS 700.00 / term)</option>
                        <option value="zoneB">Zone B (5 - 10 km) (GHS 980.00 / term)</option>
                        <option value="zoneC">Zone C (10 - 15 km) (GHS 1,260.00 / term)</option>
                        <option value="zoneD">Zone D (15 - 20 km) (GHS 1,540.00 / term)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Payment Schedule Plan</label>
                      <select 
                        value={calcPaymentPlan}
                        onChange={(e) => setCalcPaymentPlan(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold rounded-xl border bg-slate-50 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-white outline-hidden"
                      >
                        <option value="termly">Termly Payment (Standard)</option>
                        <option value="annual">Annual Payment Plan (~10% Lock-In)</option>
                        <option value="monthly">Monthly Installments (+5% Convenience)</option>
                        <option value="weekly">Weekly Micro-Payments (+8% Convenience)</option>
                        <option value="autopay">Auto-Pay Subscription (-3% Tuition Incentive)</option>
                      </select>
                    </div>
                  </div>

                  {/* Onboarding & Supplies */}
                  <div className="space-y-2 border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Auxiliary Attire & Supplies Packages</span>
                      <button 
                        type="button"
                        onClick={() => setCalcSupplies({
                          uniforms: !calcSupplies.uniforms,
                          peUniform: !calcSupplies.peUniform,
                          houseShirt: !calcSupplies.houseShirt,
                          sweater: !calcSupplies.sweater,
                          bag: !calcSupplies.bag,
                          textbooks: !calcSupplies.textbooks
                        })}
                        className="text-[9px] font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Toggle All Supplies
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-semibold">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={calcIsNew} 
                          onChange={(e) => setCalcIsNew(e.target.checked)}
                          className="rounded text-emerald-600 border-slate-300 focus:ring-emerald-500" 
                        />
                        <span className="text-[11px]">New Entrant Admission package (GHS 700)</span>
                      </label>

                      {calcLevel === 'shs' && (
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={calcBoardingPlan} 
                            onChange={(e) => setCalcBoardingPlan(e.target.checked)}
                            className="rounded text-emerald-600 border-slate-300 focus:ring-emerald-500" 
                          />
                          <span className="text-[11px] font-black text-indigo-600">On-Site SHS Boarding (+GHS 1,500)</span>
                        </label>
                      )}

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={calcFeedingPlan} 
                          onChange={(e) => setCalcFeedingPlan(e.target.checked)}
                          className="rounded text-emerald-600 border-slate-300 focus:ring-emerald-500" 
                        />
                        <span className="text-[11px]">Mandatory Feeding program (GHS 900)</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={calcSupplies.uniforms} 
                          onChange={(e) => setCalcSupplies({ ...calcSupplies, uniforms: e.target.checked })}
                          className="rounded text-emerald-600 border-slate-300 focus:ring-emerald-500" 
                        />
                        <span className="text-[11px]">Daily Uniforms (2 Sets) (GHS 300)</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={calcSupplies.textbooks} 
                          onChange={(e) => setCalcSupplies({ ...calcSupplies, textbooks: e.target.checked })}
                          className="rounded text-emerald-600 border-slate-300 focus:ring-emerald-500" 
                        />
                        <span className="text-[11px]">Textbooks & Workbook Logs (GHS 450)</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={calcSupplies.sweater} 
                          onChange={(e) => setCalcSupplies({ ...calcSupplies, sweater: e.target.checked })}
                          className="rounded text-emerald-600 border-slate-300 focus:ring-emerald-500" 
                        />
                        <span className="text-[11px]">Official Crested Sweater (GHS 150)</span>
                      </label>
                    </div>
                  </div>

                </div>

                {/* Bill Summary Pane */}
                <div className="md:col-span-5 bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase font-mono tracking-wider border-b pb-1.5 flex justify-between items-center">
                      <span>Pro-Forma Ledger Invoice</span>
                      <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">Estimate</span>
                    </h4>

                    <div className="space-y-2 text-xs font-semibold">
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-slate-500">Base Tuition Code:</span>
                        <span className="font-mono text-slate-850 dark:text-slate-100">GHS {getTuitionBase().toFixed(2)}</span>
                      </div>

                      {calcIsNew && (
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-500">Admission & Onboarding:</span>
                          <span className="font-mono text-slate-850 dark:text-slate-100">GHS 700.00</span>
                        </div>
                      )}

                      {calcTransportZone !== 'none' && (
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-500">Bus Commute Fee:</span>
                          <span className="font-mono text-slate-850 dark:text-slate-100">
                            GHS {((transportRates[calcTransportZone] || transportRates.none).termly).toFixed(2)}
                          </span>
                        </div>
                      )}

                      {calcFeedingPlan && (
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-500">Daily Lunch Feeding Plan:</span>
                          <span className="font-mono text-slate-850 dark:text-slate-100">GHS 900.00</span>
                        </div>
                      )}

                      {calcBoardingPlan && calcLevel === 'shs' && (
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-indigo-600">Hostel Boarding Add-on:</span>
                          <span className="font-mono text-indigo-600">GHS 1500.00</span>
                        </div>
                      )}

                      <div className="flex justify-between border-b pb-1">
                        <span className="text-slate-500">Payment Plan Adjust:</span>
                        <span className="font-mono text-indigo-500 font-extrabold capitalize">{calcPaymentPlan} Program</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3.5 border-t border-dashed border-slate-350 dark:border-slate-800">
                    <div className="flex justify-between items-end">
                      <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">Estimated Invoice Total</span>
                      <span className="font-mono text-xl font-black text-emerald-600">GHS {grandTotal.toFixed(2)}</span>
                    </div>

                    <button 
                      type="button"
                      onClick={handleSimulatePaystackPayment}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <CreditCard size={15} />
                      <span>Proceed with Simulated Paystack Pay</span>
                    </button>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* 15. FINANCIAL FORECAST */}
          {activePlanTab === 'financial-forecast' && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4 animate-fade-in shadow-xs">
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
                <TrendingUp className="text-emerald-600" size={20} />
                <span>Edweso Royal Academy Multi-Year Institutional Forecast</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                This projection assumes balanced enrollment levels across daycare, primary, and JHS units. Annual pricing parameters are calibrated to reach a break-even benchmark in Phase II:
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-150 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950/65 font-black uppercase text-slate-500 border-b border-slate-150 dark:border-slate-800 font-mono">
                    <tr>
                      <th className="p-3.5">Phase / Enrollment Scale</th>
                      <th className="p-3.5 text-center">Admission & Forms (GHS)</th>
                      <th className="p-3.5 text-center">Tuition Recovery (GHS)</th>
                      <th className="p-3.5 text-center">Auxiliary Plans (Feeding/Bus) (GHS)</th>
                      <th className="p-3.5 text-center bg-emerald-500/10 text-emerald-800 dark:text-emerald-400">Est. Gross Revenue (GHS)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-800 font-semibold">
                    {scenarios.map((sc, idx) => (
                      <tr key={idx}>
                        <td className="p-3.5 text-slate-850 dark:text-slate-100">
                          <strong className="block text-slate-900 dark:text-white font-black">{sc.students} Students</strong>
                          <span className="text-[10px] text-slate-400 font-bold font-mono uppercase">{sc.label}</span>
                        </td>
                        <td className="p-3.5 text-center font-mono text-slate-600 dark:text-slate-300">{sc.admissionRev.toLocaleString()}.00</td>
                        <td className="p-3.5 text-center font-mono text-slate-600 dark:text-slate-300">{sc.tuitionRev.toLocaleString()}.00</td>
                        <td className="p-3.5 text-center font-mono text-slate-600 dark:text-slate-300">{sc.foodTransRev.toLocaleString()}.00</td>
                        <td className="p-3.5 text-center font-mono font-extrabold text-emerald-600 bg-emerald-500/5">{sc.grossRev.toLocaleString()}.00</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 16. RECOMMENDED PRICING STRATEGY */}
          {activePlanTab === 'pricing-strategy' && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4 animate-fade-in shadow-xs">
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
                <Sparkles className="text-emerald-600" size={20} />
                <span>Pricing Strategy & Commercial Blueprint Recommendations</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                To establish Edweso Royal Academy as Ashanti Region's premier private academy, we recommend School Board members follow the following administrative strategies:
              </p>

              <div className="space-y-4 text-xs font-semibold">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-1">
                  <h4 className="text-slate-900 dark:text-slate-100 font-extrabold">1. High-Conviction Value Framing</h4>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Position tuition parameters not as static costs, but as holistic investments that secure smart RFID tracking, native computer coding instructions, and continuous diagnostic exams. Contrast our premium services directly with regional default schooling structures.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-1">
                  <h4 className="text-slate-900 dark:text-slate-100 font-extrabold">2. Strategic Sibling Splicing</h4>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Promote Sibling Discount programs in all regional marketing flyers. Large families are the most efficient acquisition channel, reducing parent onboarding overheads significantly.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-1">
                  <h4 className="text-slate-900 dark:text-slate-100 font-extrabold">3. Paystack Recurring Subscriptions Incentives</h4>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Offer a 3% flat tuition incentive on auto-pay channels. Guaranteeing terminal liquidity reduces debt recovery expenses by over 80%, improving institutional cash reserves.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* PAYSTACK SIMULATOR OVERLAY MODAL */}
      {showPaystackModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 text-slate-800 flex flex-col">
            
            {/* Paystack Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="font-extrabold text-[11px] uppercase tracking-widest text-emerald-400">Paystack Checkout Engine</span>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowPaystackModal(false);
                  setPaymentSuccess(false);
                }} 
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Merchant info */}
            <div className="bg-slate-50 p-4 border-b border-slate-200/55 flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Paying merchant</span>
                <strong className="text-slate-800">EDWESO ROYAL ACADEMY</strong>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Payable</span>
                <strong className="text-emerald-600 font-mono text-sm">GHS {grandTotal.toFixed(2)}</strong>
              </div>
            </div>

            {paymentSuccess ? (
              <div className="p-6 text-center space-y-4 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2 font-black">
                  <CheckCircle2 size={28} />
                </div>
                <h4 className="font-extrabold text-emerald-800 text-sm uppercase">Simulated Payment Cleared!</h4>
                <p className="text-xs text-slate-600 font-medium max-w-xs mx-auto leading-relaxed">
                  Your payment ledger has synchronized successfully. Reference token: <strong className="font-mono text-slate-950">{paidReference}</strong>. Dispatched receipt file to primary email.
                </p>
                <div className="pt-2 flex justify-center">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowPaystackModal(false);
                      setPaymentSuccess(false);
                    }}
                    className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Return to Calculator
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 block">Select payment channel</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setPaystackChannel('card')}
                      className={`py-3 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                        paystackChannel === 'card' 
                          ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      Ghanaian Debit Card
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPaystackChannel('momo')}
                      className={`py-3 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                        paystackChannel === 'momo' 
                          ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      Mobile Money (M-Mo)
                    </button>
                  </div>
                </div>

                {paystackChannel === 'card' ? (
                  <div className="space-y-3 animate-fade-in">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase text-slate-400 block font-bold">Debit Card Number</span>
                      <input 
                        type="text" 
                        placeholder="4000 1234 5678 9010" 
                        disabled
                        className="w-full px-3 py-2 text-xs font-bold rounded-lg border bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase text-slate-400 block font-bold">Expiry Code</span>
                        <input 
                          type="text" 
                          placeholder="12/28" 
                          disabled
                          className="w-full px-3 py-2 text-xs font-bold rounded-lg border bg-slate-100 text-slate-500 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase text-slate-400 block font-bold">Security PIN / CVV</span>
                        <input 
                          type="password" 
                          placeholder="***" 
                          disabled
                          className="w-full px-3 py-2 text-xs font-bold rounded-lg border bg-slate-100 text-slate-500 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center font-medium">
                      🔒 Simulated sandbox environment. Hit finalize to mock the callback.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 animate-fade-in">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase text-slate-400 block font-bold">Select M-Mo Provider</span>
                      <div className="grid grid-cols-3 gap-2">
                        {['mtn', 'telecel', 'airteltigo'].map(provider => (
                          <button
                            type="button"
                            key={provider}
                            onClick={() => setMomoProvider(provider)}
                            className={`py-1.5 rounded-lg border font-bold text-center text-[10px] uppercase transition-all cursor-pointer ${
                              momoProvider === provider 
                                ? 'border-amber-500 bg-amber-500/10 text-amber-700' 
                                : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                            }`}
                          >
                            {provider === 'airteltigo' ? 'AT Money' : provider}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase text-slate-400 block font-bold">Mobile Money Wallet Number</span>
                      <input 
                        type="tel" 
                        value={momoNumber}
                        onChange={(e) => setMomoNumber(e.target.value)}
                        placeholder="024 412 3456" 
                        className="w-full px-3 py-2 text-xs font-bold rounded-lg border bg-slate-50 border-slate-200 text-slate-800 outline-hidden"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 text-center font-medium">
                      📲 A simulated Mobile Money prompt will be dispatched to your phone network.
                    </p>
                  </div>
                )}

                <button 
                  type="button"
                  onClick={handleFinalizePayment}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1 mt-2 cursor-pointer"
                >
                  <span>Finalize Sandbox Payment (GHS {grandTotal})</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
