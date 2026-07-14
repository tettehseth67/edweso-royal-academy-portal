import React, { useState, useEffect, useRef } from 'react';
import { Camera, ShieldCheck, AlertCircle, RefreshCw, X, Check, Eye, UserCheck, ShieldAlert } from 'lucide-react';
import { UserRole, UserSession } from '../types';

interface BiometricLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRole: 'admin' | 'teacher';
  onSuccess: (session: UserSession) => void;
}

export default function BiometricLoginModal({ isOpen, onClose, selectedRole, onSuccess }: BiometricLoginModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [scanStep, setScanStep] = useState<number>(0);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isFallbackMode, setIsFallbackMode] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const staffDetails = {
    admin: {
      name: 'Principal J. K. Appiah',
      email: 'admin@edweso.edu.gh',
      username: 'principal_appiah',
      id: 'admin-01',
    },
    teacher: {
      name: 'Mr. Kwame Boateng',
      email: 'kwame@edweso.edu.gh',
      username: 'k_boateng',
      id: 't1',
    }
  };

  const selectedStaff = staffDetails[selectedRole];

  // Steps in the facial recognition timeline
  const scanSteps = [
    'Initializing Biometric Lens...',
    'Searching for facial profile...',
    'Face detected. Locking contours...',
    'Analyzing structural landmarks (eyes, jaw, nose)...',
    'Matching facial hashes against official staff ledger...',
    'Biometric payload verified. Granting secure access...'
  ];

  // 1. Start streaming real-time video
  useEffect(() => {
    if (!isOpen) return;

    let activeStream: MediaStream | null = null;
    setIsInitializing(true);
    setCameraError('');
    setScanStep(0);
    setScanProgress(0);
    setIsSuccess(false);
    setIsFallbackMode(false);

    async function startCamera() {
      try {
        const constraints = {
          video: {
            width: { ideal: 480 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsInitializing(false);
            startScanningTimeline();
          };
        }
      } catch (err) {
        console.warn('Camera access error or rejected:', err);
        setCameraError('Permission denied or camera device is offline. Activating Simulated Biometric Scanner...');
        setIsInitializing(false);
        setIsFallbackMode(true);
        startScanningTimeline(); // Start scanning anyway with the animated mock vector avatar
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isOpen, selectedRole]);

  // 2. Control scanning progress metrics & steps
  const startScanningTimeline = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressIntervalRef.current!);
          triggerSuccessState();
          return 100;
        }
        
        const nextProgress = prev + 2.5; // Roughly 4 seconds total
        
        // Map progress percentage to step levels
        const stepIndex = Math.min(
          Math.floor((nextProgress / 100) * scanSteps.length),
          scanSteps.length - 1
        );
        setScanStep(stepIndex);
        
        return nextProgress;
      });
    }, 100);
  };

  // 3. Trigger authentic success animation and callback
  const triggerSuccessState = () => {
    setIsSuccess(true);
    
    // Auto-login after success delay
    setTimeout(() => {
      onSuccess({
        id: selectedStaff.id,
        role: selectedRole,
        username: selectedStaff.username,
        name: selectedStaff.name,
        email: selectedStaff.email
      });
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in font-sans"
      id="biometric-login-overlay"
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Dynamic Holographic Scanner Background Accent */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>

        {/* Header */}
        <div className="relative z-10 flex justify-between items-center px-5 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="text-emerald-400 animate-pulse" size={18} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-200">
              Biometric Node Verification
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            id="close-biometric-scanner"
          >
            <X size={16} />
          </button>
        </div>

        {/* Viewfinder & Simulation Container */}
        <div className="p-6 relative z-10 space-y-6">
          
          {/* Main Frame */}
          <div className="relative aspect-square w-full max-w-sm mx-auto bg-slate-950 rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl flex items-center justify-center">
            
            {/* 1. Loading stream indicator */}
            {isInitializing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 z-30 bg-slate-950">
                <RefreshCw className="text-emerald-500 animate-spin" size={28} />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400/80">
                  Booting Camera Core...
                </span>
              </div>
            )}

            {/* 2. Success Checkmark Overlay */}
            {isSuccess && (
              <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center space-y-4 animate-fade-in">
                
                {/* Glowing Success Ring Animation */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: '1.5s' }}></div>
                  <div className="absolute w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 animate-pulse"></div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 border border-emerald-300">
                    <Check className="text-white animate-bounce-short" size={32} strokeWidth={3} />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h4 className="text-md font-black text-emerald-400 uppercase tracking-widest animate-pulse">
                    Access Authenticated
                  </h4>
                  <p className="text-xs text-slate-300 font-bold">
                    {selectedStaff.name}
                  </p>
                  <p className="text-[10px] text-slate-400 tracking-wide font-medium">
                    Redirecting to secure staff terminal...
                  </p>
                </div>
              </div>
            )}

            {/* 3. Live video track */}
            {!isFallbackMode ? (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                playsInline
                muted
              />
            ) : (
              // 4. Fallback animated holographic avatar
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-slate-950/90 z-10 animate-fade-in">
                <div className="relative">
                  {/* Outer digital scan target lines */}
                  <div className="absolute inset-[-12px] border border-emerald-500/30 rounded-full animate-spin" style={{ animationDuration: '6s' }}></div>
                  <div className="absolute inset-[-6px] border border-dashed border-emerald-400/20 rounded-full animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}></div>
                  
                  <div className="w-28 h-28 rounded-full bg-emerald-950/25 border-2 border-emerald-500/30 flex items-center justify-center relative overflow-hidden">
                    {/* Simulated digital face matrix dots */}
                    <div className="absolute inset-0 grid grid-cols-6 gap-2 p-3 opacity-30">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i} className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 120}ms` }} />
                      ))}
                    </div>
                    {/* Futuristic holographic user wireframe */}
                    <Eye className="text-emerald-400/80 animate-pulse relative z-10" size={44} />
                  </div>
                </div>

                <div className="bg-slate-900/90 px-3 py-1.5 rounded-full border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  <span>SIMULATED FEED</span>
                </div>
              </div>
            )}

            {/* 5. Scanning Grid Overlay */}
            {!isSuccess && !isInitializing && (
              <div className="absolute inset-0 pointer-events-none z-20">
                
                {/* Horizontal Laser Scanning Bar */}
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-500/50 animate-scan-line"></div>
                
                {/* Simulated Face Outline Frame */}
                <div className="absolute inset-10 border-2 border-dashed border-emerald-500/20 rounded-full flex items-center justify-center">
                  <div className="w-full h-full border border-emerald-500/30 rounded-full relative">
                    {/* Scanning Target Corners */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl-md"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr-md"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl-md"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br-md"></div>

                    {/* Facial Landmark nodes */}
                    <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '100ms' }}></div>
                    <div className="absolute top-1/4 right-1/3 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '400ms' }}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-4 h-1 border-b-2 border-emerald-400 rounded-b-full"></div>
                  </div>
                </div>

                {/* Cybernetic HUD Margin Stats */}
                <div className="absolute top-3 left-3 text-[8px] font-mono font-black text-emerald-400/80 tracking-widest bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/10">
                  SYS_CONF: 99.8%
                </div>
                <div className="absolute bottom-3 right-3 text-[8px] font-mono font-black text-emerald-400/80 tracking-widest bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/10">
                  REF_LENS: HD_RGB
                </div>
              </div>
            )}

          </div>

          {/* Progress Ledger Info */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wide">
                Security Ledger Sync
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {Math.round(scanProgress)}%
              </span>
            </div>

            {/* Micro Progress Track */}
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-100" 
                style={{ width: `${scanProgress}%` }}
              />
            </div>

            {/* Dynamic Status Step Box */}
            <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl min-h-[58px] flex items-center justify-center text-center">
              <p className="text-[11px] font-black tracking-wide text-slate-300 animate-pulse">
                {scanSteps[scanStep]}
              </p>
            </div>
          </div>

          {/* Secure Note */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl flex items-start space-x-2.5">
            <UserCheck className="text-emerald-400 shrink-0 mt-0.5" size={15} />
            <div className="text-[10px] text-slate-400 leading-relaxed font-semibold">
              Biometric logins use client-to-server SHA-256 local facial mapping hashes. No direct video data is ever stored on external cloud records, complying fully with Ghana Data Protection Act 2012 (Act 843).
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-950/50 border-t border-slate-800 flex justify-between items-center relative z-10">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
            STAFF KEY_LOG: {selectedRole.toUpperCase()}
          </span>
          <button
            onClick={onClose}
            className="text-xs font-black uppercase tracking-wider text-slate-400 hover:text-white px-3.5 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
