import React, { useState } from 'react';
import { ShieldCheck, UserCheck, GraduationCap, Mail, Lock, User, Phone, ArrowLeft, Info, HelpCircle } from 'lucide-react';
import { UserRole, UserSession } from '../types';

interface AuthPageProps {
  onLoginSuccess: (session: UserSession) => void;
  onBackToLanding: () => void;
  initialRole?: UserRole;
}

export default function AuthPage({ onLoginSuccess, onBackToLanding, initialRole = 'student' }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regParent, setRegParent] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regClass, setRegClass] = useState('JHS 1');
  const [regSuccess, setRegSuccess] = useState(false);

  // Forgot Form States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Quick credentials list for demo purposes
  const demoUsers = {
    admin: { email: 'admin@edweso.edu.gh', pass: 'admin123', name: 'Principal J. K. Appiah' },
    teacher: { email: 'kwame@edweso.edu.gh', pass: 'teacher123', name: 'Mr. Kwame Boateng' },
    student: { email: 'kofi@edweso.edu.gh', pass: 'student123', name: 'Kofi Mensah Jnr' },
    parent: { email: 'parent@gmail.com', pass: 'parent123', name: 'Isaac Mensah' }
  };

  const autofillDemo = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(demoUsers[role].email);
    setPassword(demoUsers[role].pass);
    setLoginError('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedEmail = email.trim().toLowerCase();

    if (selectedRole === 'admin' && trimmedEmail === demoUsers.admin.email && password === demoUsers.admin.pass) {
      onLoginSuccess({
        id: 'admin-01',
        role: 'admin',
        username: 'principal_appiah',
        name: demoUsers.admin.name,
        email: demoUsers.admin.email
      });
    } else if (selectedRole === 'teacher' && trimmedEmail === demoUsers.teacher.email && password === demoUsers.teacher.pass) {
      onLoginSuccess({
        id: 't1',
        role: 'teacher',
        username: 'k_boateng',
        name: demoUsers.teacher.name,
        email: demoUsers.teacher.email
      });
    } else if (selectedRole === 'student' && trimmedEmail === demoUsers.student.email && password === demoUsers.student.pass) {
      onLoginSuccess({
        id: 'st1',
        role: 'student',
        username: 'kofi_mensah',
        name: demoUsers.student.name,
        email: demoUsers.student.email,
        classId: 'c4' // JHS 2
      });
    } else if (selectedRole === 'parent' && trimmedEmail === demoUsers.parent.email && password === demoUsers.parent.pass) {
      onLoginSuccess({
        id: 'st1',
        role: 'parent',
        username: 'isaac_mensah',
        name: demoUsers.parent.name,
        email: demoUsers.parent.email
      });
    } else {
      setLoginError(`Invalid email or password for ${selectedRole} account.`);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setActiveTab('login');
      setRegName('');
      setRegParent('');
      setRegPhone('');
      setRegEmail('');
    }, 4000);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setActiveTab('login');
      setForgotEmail('');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">

      {/* Visual background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-700/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>

      {/* Back button */}
      <button
        onClick={onBackToLanding}
        id="auth-back-to-landing"
        className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors flex items-center space-x-2 text-xs font-semibold bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800"
      >
        <ArrowLeft size={14} />
        <span>Back to Landing Website</span>
      </button>

      {/* Main card */}
      <div id="auth-box" className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative z-10">

        {/* Banner with school details */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-6 text-center border-b border-emerald-500/20">
          <img
            src="/assets/images/logo.png"
            alt="Edweso Royal Academy Logo"
            className="inline-block w-16 h-16 rounded-2xl object-contain border border-amber-400/15 mb-3 shadow-md bg-emerald-950/50 p-1.5"
            referrerPolicy="no-referrer"
          />
          <h2 className="text-xl font-extrabold text-white font-sans tracking-tight">Edweso Royal Academy</h2>
          <p className="text-[11px] uppercase tracking-widest text-amber-400 font-bold mt-1">Knowledge, Discipline, Excellence</p>
        </div>

        <div className="p-6">

          {activeTab === 'login' && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center">
                <h3 className="text-lg font-bold text-white">Sign In to Your Portal</h3>
                <p className="text-xs text-slate-400 mt-1">Select your account tier and enter credentials.</p>
              </div>

              {/* Role Selectors */}
              <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  id="role-btn-student"
                  onClick={() => autofillDemo('student')}
                  className={`flex flex-col items-center justify-center py-2 rounded-md transition-all ${selectedRole === 'student'
                      ? 'bg-emerald-700 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                    }`}
                >
                  <GraduationCap size={15} className="mb-0.5" />
                  <span className="text-[9px]">Student</span>
                </button>
                <button
                  type="button"
                  id="role-btn-parent"
                  onClick={() => autofillDemo('parent')}
                  className={`flex flex-col items-center justify-center py-2 rounded-md transition-all ${selectedRole === 'parent'
                      ? 'bg-emerald-700 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                    }`}
                >
                  <User size={15} className="mb-0.5" />
                  <span className="text-[9px]">Parent</span>
                </button>
                <button
                  type="button"
                  id="role-btn-teacher"
                  onClick={() => autofillDemo('teacher')}
                  className={`flex flex-col items-center justify-center py-2 rounded-md transition-all ${selectedRole === 'teacher'
                      ? 'bg-emerald-700 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                    }`}
                >
                  <UserCheck size={15} className="mb-0.5" />
                  <span className="text-[9px]">Teacher</span>
                </button>
                <button
                  type="button"
                  id="role-btn-admin"
                  onClick={() => autofillDemo('admin')}
                  className={`flex flex-col items-center justify-center py-2 rounded-md transition-all ${selectedRole === 'admin'
                      ? 'bg-emerald-700 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                    }`}
                >
                  <ShieldCheck size={15} className="mb-0.5" />
                  <span className="text-[9px]">Admin</span>
                </button>
              </div>

              {/* Login Form */}
              <form id="login-form" onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-red-950/50 border border-red-900 rounded-lg text-red-200 text-xs text-center font-medium">
                    {loginError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      id="login-email"
                      required
                      placeholder="e.g. kofi@edweso.edu.gh"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-hidden focus:border-emerald-500 font-medium"
                    />
                    <Mail className="absolute left-3.5 top-3 text-slate-500" size={16} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold text-slate-300">Password</label>
                    <button
                      type="button"
                      id="forgot-pwd-link"
                      onClick={() => setActiveTab('forgot')}
                      className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      id="login-password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-hidden focus:border-emerald-500 font-medium"
                    />
                    <Lock className="absolute left-3.5 top-3 text-slate-500" size={16} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-950 text-emerald-600 focus:ring-0"
                    />
                    <span>Remember session</span>
                  </label>
                </div>

                <button
                  type="submit"
                  id="submit-login"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-sm transition-colors shadow-lg"
                >
                  Enter Administrative Console
                </button>
              </form>

              {/* Interactive Quick Autofill Suggestion box */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-semibold">
                  <Info size={14} className="text-amber-400 shrink-0" />
                  <span>Click to auto-fill mock credential:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    onClick={() => autofillDemo('student')}
                    className="text-[10px] bg-slate-900 border border-slate-800 text-emerald-400 font-bold px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                  >
                    Student (Kofi)
                  </button>
                  <button
                    onClick={() => autofillDemo('teacher')}
                    className="text-[10px] bg-slate-900 border border-slate-800 text-amber-400 font-bold px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                  >
                    Teacher (Kwame)
                  </button>
                  <button
                    onClick={() => autofillDemo('admin')}
                    className="text-[10px] bg-slate-900 border border-slate-800 text-sky-400 font-bold px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                  >
                    Admin (Principal)
                  </button>
                </div>
              </div>

              <div className="text-center text-xs text-slate-400 border-t border-slate-800/60 pt-4">
                <span>Looking to register a student? </span>
                <button
                  onClick={() => setActiveTab('register')}
                  id="register-link"
                  className="text-amber-400 hover:text-amber-300 font-bold transition-colors"
                >
                  Submit Admission Inquiry
                </button>
              </div>
            </div>
          )}

          {activeTab === 'register' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center">
                <h3 className="text-lg font-bold text-white">Admission Inquiry Form</h3>
                <p className="text-xs text-slate-400 mt-1">Pre-register your ward for enrollment review.</p>
              </div>

              {regSuccess ? (
                <div className="p-4 bg-emerald-950/80 border border-emerald-900 text-emerald-200 text-xs rounded-lg text-center font-semibold space-y-2">
                  <p>✓ Admission inquiry filed successfully!</p>
                  <p className="font-normal text-[11px] text-emerald-300">
                    A school administrator from Edweso Royal Academy will contact you via {regPhone} within 48 business hours. Thank you!
                  </p>
                </div>
              ) : (
                <form id="register-form" onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Student Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="reg-student-name"
                        required
                        placeholder="e.g. Kwadwo Mensah Jnr"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 text-xs text-white focus:outline-hidden focus:border-emerald-500 font-medium"
                      />
                      <User className="absolute left-3 top-2.5 text-slate-500" size={14} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Parent / Guardian Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="reg-parent-name"
                        required
                        placeholder="e.g. Isaac Mensah Snr"
                        value={regParent}
                        onChange={(e) => setRegParent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 text-xs text-white focus:outline-hidden focus:border-emerald-500 font-medium"
                      />
                      <User className="absolute left-3 top-2.5 text-slate-500" size={14} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Mobile Number (+233)</label>
                    <div className="relative">
                      <input
                        type="tel"
                        id="reg-parent-phone"
                        required
                        placeholder="e.g. +233 24 412 3456"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 text-xs text-white focus:outline-hidden focus:border-emerald-500 font-medium"
                      />
                      <Phone className="absolute left-3 top-2.5 text-slate-500" size={14} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        id="reg-parent-email"
                        required
                        placeholder="e.g. parent@gmail.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 text-xs text-white focus:outline-hidden focus:border-emerald-500 font-medium"
                      />
                      <Mail className="absolute left-3 top-2.5 text-slate-500" size={14} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Intended Class Level</label>
                    <select
                      id="reg-student-class"
                      value={regClass}
                      onChange={(e) => setRegClass(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-hidden focus:border-emerald-500 font-medium"
                    >
                      <option value="Primary 5">Primary 5</option>
                      <option value="Primary 6">Primary 6</option>
                      <option value="JHS 1">JHS 1 (Junior High)</option>
                      <option value="JHS 2">JHS 2 (Junior High)</option>
                      <option value="JHS 3">JHS 3 (Junior High)</option>
                      <option value="SHS 1">SHS 1 (Senior High)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    id="submit-register"
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs transition-colors mt-2"
                  >
                    Submit Admission Application
                  </button>
                </form>
              )}

              <div className="text-center pt-2 border-t border-slate-800/50">
                <button
                  type="button"
                  id="register-back-login"
                  onClick={() => setActiveTab('login')}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}

          {activeTab === 'forgot' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center">
                <h3 className="text-lg font-bold text-white">Reset Account Password</h3>
                <p className="text-xs text-slate-400 mt-1">Provide your registered school email address.</p>
              </div>

              {forgotSuccess ? (
                <div className="p-4 bg-emerald-950/80 border border-emerald-900 text-emerald-200 text-xs rounded-lg text-center font-semibold space-y-2">
                  <p>✓ Password Reset Request Transmitted</p>
                  <p className="font-normal text-[11px] text-emerald-300">
                    If this email matches our student/teacher ledger, reset instructions have been dispatched via SMS and Email coordinates on file.
                  </p>
                </div>
              ) : (
                <form id="forgot-form" onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Registered Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        id="forgot-email"
                        required
                        placeholder="e.g. kofi@edweso.edu.gh"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-hidden focus:border-emerald-500 font-medium"
                      />
                      <Mail className="absolute left-3.5 top-3 text-slate-500" size={16} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="submit-forgot"
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-sm transition-colors"
                  >
                    Request Password Instructions
                  </button>
                </form>
              )}

              <div className="text-center pt-2 border-t border-slate-800/50">
                <button
                  type="button"
                  id="forgot-back-login"
                  onClick={() => setActiveTab('login')}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Security assurance */}
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-center space-x-2 border-t border-slate-800/60 text-[10px] text-slate-500">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Edweso Royal Academy official cybersecurity gateway encryption.</span>
        </div>

      </div>
    </div>
  );
}
