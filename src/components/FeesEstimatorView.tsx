import React, { useState, useMemo } from 'react';
import { 
  Calculator, Info, Check, ArrowRight, Sparkles, AlertCircle, 
  HelpCircle, CreditCard, Smartphone, ShieldCheck, Download
} from 'lucide-react';

export default function FeesEstimatorView() {
  const [gradeLevel, setGradeLevel] = useState<string>('JHS');
  const [residency, setResidency] = useState<'Day' | 'Boarding'>('Day');
  const [siblingsCount, setSiblingsCount] = useState<number>(1);
  const [includeTransport, setIncludeTransport] = useState<boolean>(false);
  const [transportZone, setTransportZone] = useState<string>('Zone A');
  const [includeCanteen, setIncludeCanteen] = useState<boolean>(false);
  const [includeStationery, setIncludeStationery] = useState<boolean>(true);
  const [paymentPlan, setPaymentPlan] = useState<'Full' | 'TwoPart' | 'Monthly' | 'Weekly'>('Full');

  // School Fee Standards (GHS) per term
  const baseFeesTable: Record<string, { tuition: number; development: number; medical: number; boardingAddon: number }> = {
    'Daycare/KG': { tuition: 450, development: 100, medical: 50, boardingAddon: 0 },
    'Primary (Class 1-6)': { tuition: 650, development: 120, medical: 50, boardingAddon: 0 },
    'JHS': { tuition: 850, development: 150, medical: 60, boardingAddon: 600 },
    'SHS': { tuition: 1250, development: 200, medical: 80, boardingAddon: 800 }
  };

  const selectedFeeConfig = baseFeesTable[gradeLevel] || baseFeesTable['JHS'];

  // Calculate fees
  const calculations = useMemo(() => {
    const baseTuition = selectedFeeConfig.tuition;
    const devFee = selectedFeeConfig.development;
    const medicalFee = selectedFeeConfig.medical;
    
    // Boarding setup (Daycare/KG cannot board)
    const canBoard = gradeLevel !== 'Daycare/KG';
    const activeResidency = canBoard ? residency : 'Day';
    const boardingAddon = activeResidency === 'Boarding' ? selectedFeeConfig.boardingAddon : 0;
    
    // Core fees before discounts
    const subtotalCore = baseTuition + devFee + medicalFee + boardingAddon;
    
    // Siblings discount (1 child = 0%, 2 children = 10% on tuition, 3+ children = 15% on tuition)
    let siblingDiscountPercentage = 0;
    if (siblingsCount === 2) {
      siblingDiscountPercentage = 10;
    } else if (siblingsCount >= 3) {
      siblingDiscountPercentage = 15;
    }
    const siblingDiscount = (baseTuition * siblingDiscountPercentage) / 100;

    // Plan discount: 2% tuition discount if paying in full
    const planDiscount = paymentPlan === 'Full' ? (baseTuition * 0.02) : 0;
    const totalDiscounts = siblingDiscount + planDiscount;

    // Optional Add-ons
    let transportFee = 0;
    if (includeTransport) {
      if (transportZone === 'Zone A') transportFee = 180; // Edweso Central
      else if (transportZone === 'Zone B') transportFee = 250; // Ejisu/Onwe
      else transportFee = 320; // Kumasi/Koduase
    }

    const canteenFee = includeCanteen ? 350 : 0; // Termly feeding plan
    const stationeryFee = includeStationery ? (gradeLevel.startsWith('Daycare') ? 120 : 180) : 0;

    const grandTotal = Math.max(0, (subtotalCore - totalDiscounts) + transportFee + canteenFee + stationeryFee);

    // Installment breakdowns
    let paymentsBreakdown: Array<{ label: string; amount: number; dueDate: string }> = [];
    if (paymentPlan === 'Full') {
      paymentsBreakdown = [
        { label: 'Single Termly Payment (Pay-in-Full)', amount: grandTotal, dueDate: 'First Day of Term' }
      ];
    } else if (paymentPlan === 'TwoPart') {
      paymentsBreakdown = [
        { label: '50% Upfront Commitment', amount: grandTotal * 0.5, dueDate: 'First Day of Term' },
        { label: '50% Balance Clearance', amount: grandTotal * 0.5, dueDate: 'Mid-Term Week 6' }
      ];
    } else if (paymentPlan === 'Monthly') {
      paymentsBreakdown = [
        { label: 'Installment 1 of 4', amount: grandTotal / 4, dueDate: 'Month 1 - Week 1' },
        { label: 'Installment 2 of 4', amount: grandTotal / 4, dueDate: 'Month 2 - Week 1' },
        { label: 'Installment 3 of 4', amount: grandTotal / 4, dueDate: 'Month 3 - Week 1' },
        { label: 'Installment 4 of 4', amount: grandTotal / 4, dueDate: 'Month 4 - Week 1' }
      ];
    } else if (paymentPlan === 'Weekly') {
      paymentsBreakdown = Array.from({ length: 12 }, (_, i) => ({
        label: `Weekly Micro-Payment ${i + 1} of 12`,
        amount: (grandTotal * 1.08) / 12, // Includes 8% mobile money micro-management service fee
        dueDate: `Week ${i + 1} Friday`
      }));
    }

    return {
      baseTuition,
      devFee,
      medicalFee,
      boardingAddon,
      activeResidency,
      canBoard,
      siblingDiscountPercentage,
      siblingDiscount,
      planDiscount,
      totalDiscounts,
      transportFee,
      canteenFee,
      stationeryFee,
      grandTotal,
      paymentsBreakdown
    };
  }, [gradeLevel, residency, siblingsCount, includeTransport, transportZone, includeCanteen, includeStationery, paymentPlan, selectedFeeConfig]);

  const handleExportPlan = () => {
    alert(`DISPATCH SYSTEM: Custom Tuition Budget Sheet generated.\nGrade: ${gradeLevel} (${calculations.activeResidency})\nTermly Grand Total: GHS ${calculations.grandTotal.toFixed(2)}\nPlan: ${paymentPlan}\nExported to local system successfully!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Decorative Title Block */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full font-black uppercase tracking-wider">
          Financial Transparency Portal
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 font-display tracking-tight">
          Tuition Cost & Installment Planner
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Edweso Royal Academy utilizes a cashless digital payment framework powered by Paystack. Configure your customized child enrollment options below to preview comprehensive term-by-term tuition dues and installment structures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Interactive Fee Options Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
          
          <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Calculator className="text-emerald-600" size={18} />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              Child Custom Enrollment Configurations
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. Class / Grade Division */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">GES Academic Division</label>
              <select
                value={gradeLevel}
                onChange={(e) => {
                  const val = e.target.value;
                  setGradeLevel(val);
                  if (val === 'Daycare/KG') {
                    setResidency('Day');
                  }
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden"
              >
                <option value="Daycare/KG">Daycare & Kindergarten (Day Only)</option>
                <option value="Primary (Class 1-6)">Primary Block (Class 1-6)</option>
                <option value="JHS">Junior High School (JHS 1-3)</option>
                <option value="SHS">Senior High School (SHS 1-3)</option>
              </select>
            </div>

            {/* 2. Residency Status */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Residency Type</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setResidency('Day')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    calculations.activeResidency === 'Day'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Day Student
                </button>
                <button
                  type="button"
                  disabled={!calculations.canBoard}
                  onClick={() => setResidency('Boarding')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !calculations.canBoard ? 'opacity-40 cursor-not-allowed' : ''
                  } ${
                    calculations.activeResidency === 'Boarding'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Boarding Block
                </button>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 3. Sibling Count Slider */}
            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Total Siblings Enrolled</label>
                <span className="text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md font-black">
                  {siblingsCount === 1 ? '1 Student' : `${siblingsCount} Siblings`}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={siblingsCount}
                onChange={(e) => setSiblingsCount(Number(e.target.value))}
                className="w-full accent-emerald-600 mt-2 cursor-pointer"
              />
              <p className="text-[9px] text-slate-400 font-semibold mt-1">
                {siblingsCount === 1 
                  ? 'Standard tuition rates apply' 
                  : siblingsCount === 2 
                    ? '10% Tuition Sibling Loyalty Discount active!' 
                    : '15% Family Loyalty Tuition Discount active!'}
              </p>
            </div>

            {/* 4. Termly Payment Plan */}
            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Schedule Structure</label>
              <select
                value={paymentPlan}
                onChange={(e) => setPaymentPlan(e.target.value as any)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden"
              >
                <option value="Full">Pay-in-Full Termly (With 2% Bonus Discount)</option>
                <option value="TwoPart">2-Part Installments (50% Upfront, 50% Mid-Term)</option>
                <option value="Monthly">Monthly Installments (4 Parts per term)</option>
                <option value="Weekly">Weekly Micro-Payments (12 Parts, +8% handling)</option>
              </select>
              <p className="text-[9px] text-slate-400 font-semibold mt-1">
                Installment systems are fully automated via Paystack pre-authorized mandates.
              </p>
            </div>

          </div>

          {/* 5. Optional Add-ons & Enrichment Programs */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Optional Auxiliary Services & Provisions</label>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Transport */}
              <div className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                includeTransport 
                  ? 'border-emerald-500/40 bg-emerald-500/5' 
                  : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-200'
              }`} onClick={() => setIncludeTransport(p => !p)}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">School Bus</span>
                  <input 
                    type="checkbox" 
                    checked={includeTransport} 
                    onChange={() => {}} // handled by div click
                    className="accent-emerald-600 rounded" 
                  />
                </div>
                <p className="text-[9px] text-slate-400 font-medium mt-1">Safe transit to & from campus</p>
                {includeTransport && (
                  <select
                    value={transportZone}
                    onChange={(e) => {
                      e.stopPropagation();
                      setTransportZone(e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] p-1 rounded font-bold text-slate-600 mt-2 focus:outline-hidden"
                  >
                    <option value="Zone A">Zone A: Edweso Central (GHS 180)</option>
                    <option value="Zone B">Zone B: Ejisu/Onwe (GHS 250)</option>
                    <option value="Zone C">Zone C: Kumasi Outskirts (GHS 320)</option>
                  </select>
                )}
              </div>

              {/* Canteen Feeding */}
              <div className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                includeCanteen 
                  ? 'border-emerald-500/40 bg-emerald-500/5' 
                  : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-200'
              }`} onClick={() => setIncludeCanteen(p => !p)}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Daily Hot Lunch</span>
                  <input 
                    type="checkbox" 
                    checked={includeCanteen} 
                    onChange={() => {}} // handled by div click
                    className="accent-emerald-600 rounded" 
                  />
                </div>
                <p className="text-[9px] text-slate-400 font-medium mt-1">Canteen hot meal plan (GHS 350/term)</p>
              </div>

              {/* Stationery */}
              <div className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                includeStationery 
                  ? 'border-emerald-500/40 bg-emerald-500/5' 
                  : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-200'
              }`} onClick={() => setIncludeStationery(p => !p)}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Stationery Kit</span>
                  <input 
                    type="checkbox" 
                    checked={includeStationery} 
                    onChange={() => {}} // handled by div click
                    className="accent-emerald-600 rounded" 
                  />
                </div>
                <p className="text-[9px] text-slate-400 font-medium mt-1">Textbooks, exercise books & drawing pads</p>
              </div>

            </div>
          </div>

          {/* Secure Trust Marker */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 flex items-start space-x-2.5 text-xs text-slate-500">
            <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={16} />
            <div>
              <span className="font-extrabold text-slate-800 dark:text-slate-200 text-[10px] uppercase">PCI-DSS Compliant Infrastructure</span>
              <p className="text-[10px] mt-0.5 text-slate-400">All fees estimated here correspond strictly to the current Term III schedule registered with the Ministry of Education, Ghana. Direct payments trigger instantaneous billing SMS and receipt logs.</p>
            </div>
          </div>

        </div>

        {/* Right Side: Ledger Statement & Payment Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Statement Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4 font-sans">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Termly Cost breakdown</span>
              <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                Motto: Knowledge & Discipline
              </span>
            </div>

            {/* Invoicing details list */}
            <div className="space-y-2 text-xs border-b border-slate-800 pb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Base Tuition Fee:</span>
                <span className="font-mono font-bold">GHS {calculations.baseTuition.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Development levy:</span>
                <span className="font-mono font-bold">GHS {calculations.devFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Medical Scheme allocation:</span>
                <span className="font-mono font-bold">GHS {calculations.medicalFee.toFixed(2)}</span>
              </div>
              {calculations.boardingAddon > 0 && (
                <div className="flex justify-between">
                  <span className="text-emerald-400 font-semibold">Boarding Residency add-on:</span>
                  <span className="font-mono font-bold text-emerald-400">GHS {calculations.boardingAddon.toFixed(2)}</span>
                </div>
              )}
              {calculations.totalDiscounts > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Loyalty & Plan Discounts:</span>
                  <span className="font-mono font-extrabold">- GHS {calculations.totalDiscounts.toFixed(2)}</span>
                </div>
              )}
              {calculations.transportFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Bus transport ({transportZone}):</span>
                  <span className="font-mono font-bold">GHS {calculations.transportFee.toFixed(2)}</span>
                </div>
              )}
              {calculations.canteenFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Hot lunch canteen plan:</span>
                  <span className="font-mono font-bold">GHS {calculations.canteenFee.toFixed(2)}</span>
                </div>
              )}
              {calculations.stationeryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Stationery & texts pack:</span>
                  <span className="font-mono font-bold">GHS {calculations.stationeryFee.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Total Tuition Value */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block leading-none">Termly Grand Total</span>
                <span className="text-[9px] text-emerald-400 font-semibold mt-0.5 block">After applying family discounts</span>
              </div>
              <span className="text-3xl font-extrabold font-mono text-emerald-400">
                GHS {calculations.grandTotal.toFixed(2)}
              </span>
            </div>

            {/* Button Actions */}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                onClick={handleExportPlan}
                className="w-full bg-slate-800 hover:bg-slate-755 text-slate-200 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1 border border-slate-700"
              >
                <Download size={13} />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => alert(`DISPATCH SYSTEM: Initiating enrollment inquiry for Grade: ${gradeLevel}. Sibling discount applied: GHS ${calculations.siblingDiscount.toFixed(2)}. Directing to Admissions portal.`)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1 shadow-md shadow-emerald-950/20"
              >
                <span>Commit Plan</span>
                <ArrowRight size={13} />
              </button>
            </div>

          </div>

          {/* Interactive Installment Timeline */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-1.5">
                <CreditCard className="text-amber-500 animate-pulse" size={16} />
                <span className="text-xs font-bold uppercase text-slate-800 dark:text-slate-100 tracking-wider">
                  Payment Installment Schedule
                </span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase">
                {paymentPlan === 'Full' ? '1 Payment' : paymentPlan === 'TwoPart' ? '2 Payments' : paymentPlan === 'Monthly' ? '4 Payments' : '12 Payments'}
              </span>
            </div>

            {/* Timeline track */}
            <div className={`space-y-3 max-h-[250px] overflow-y-auto pr-1 ${calculations.paymentsBreakdown.length > 4 ? 'scrollbar-thin' : ''}`}>
              {calculations.paymentsBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-xs relative">
                  {/* Left bullet track */}
                  <div className="flex flex-col items-center shrink-0 mt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white dark:border-slate-950 z-10" />
                    {idx < calculations.paymentsBreakdown.length - 1 && (
                      <div className="w-0.5 h-12 bg-slate-100 dark:bg-slate-800 -mb-3" />
                    )}
                  </div>
                  
                  {/* Item Description block */}
                  <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900/60 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-800 dark:text-slate-100 block">{item.label}</span>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Due date: {item.dueDate}</p>
                    </div>
                    <span className="font-mono font-black text-slate-900 dark:text-white">
                      GHS {item.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Surcharge alert warning */}
            <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/15 flex items-start space-x-2 text-[10px] text-amber-700 dark:text-amber-300 font-medium">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              <p>Installment milestones require a pre-authorized mobile money or debit card standing subscription. Overdue payments trigger a 5% administrative surcharge after a 7-day grace period.</p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
