import React, { useState, useEffect, useRef } from 'react';
import { Camera, ShieldCheck, AlertCircle, RefreshCw, X, Check, Eye, UserCheck, ShieldAlert, Fingerprint } from 'lucide-react';
import { UserRole, UserSession } from '../types';

interface BiometricLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRole: 'admin' | 'teacher';
  onSuccess: (session: UserSession) => void;
}

type BiometricType = 'face' | 'fingerprint';

export default function BiometricLoginModal({ isOpen, onClose, selectedRole, onSuccess }: BiometricLoginModalProps) {
  const [biometricType, setBiometricType] = useState<BiometricType>('face');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [scanStep, setScanStep] = useState<number>(0);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isFallbackMode, setIsFallbackMode] = useState<boolean>(false);

  // Fingerprint reader state
  const [isFingerprintHolding, setIsFingerprintHolding] = useState<boolean>(false);
  const fingerprintIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
  const faceScanSteps = [
    'Initializing Biometric Lens...',
    'Searching for facial profile...',
    'Face detected. Locking contours...',
    'Analyzing structural landmarks (eyes, jaw, nose)...',
    'Matching facial hashes against official staff ledger...',
    'Biometric payload verified. Granting secure access...'
  ];

  // Steps in the fingerprint recognition timeline
  const fingerprintScanSteps = [
    'Place index finger on capacitive sensor terminal...',
    'Initiating dermal contact handshake...',
    'Analyzing dermal ridge bifurcations & minutiae map...',
    'Reconstructing biometric ridge template vectors...',
    'Querying hardware-isolated secure enclave...',
    'Ridge match confirmed. Dispensing terminal session...'
  ];

  const currentScanSteps = biometricType === 'face' ? faceScanSteps : fingerprintScanSteps;

  // Cleanup helper
  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // 1. Manage face camera streaming and lifecycle
  useEffect(() => {
    if (!isOpen) return;

    // Reset general scanner states
    setScanStep(0);
    setScanProgress(0);
    setIsSuccess(false);
    setIsInitializing(true);
    setCameraError('');
    setIsFallbackMode(false);
    setIsFingerprintHolding(false);

    if (fingerprintIntervalRef.current) {
      clearInterval(fingerprintIntervalRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    if (biometricType === 'face') {
      let activeStream: MediaStream | null = null;
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
              videoRef.current?.play().catch(err => console.warn('Video element play error:', err));
              setIsInitializing(false);
              startScanningTimeline();
            };
          }
        } catch (err) {
          console.warn('Camera access error or rejected:', err);
          setCameraError('Camera offline or permission denied. Booting high-fidelity facial matrix simulator...');
          setIsInitializing(false);
          setIsFallbackMode(true);
          startScanningTimeline();
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
    } else {
      // Fingerprint mode needs no camera stream
      stopCameraStream();
      setIsInitializing(false);
    }
  }, [isOpen, selectedRole, biometricType]);

  // Clean up completely on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (fingerprintIntervalRef.current) clearInterval(fingerprintIntervalRef.current);
    };
  }, [stream]);

  // Start face scanning timeline automatically
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

        const nextProgress = prev + 3; // ~3 seconds total
        const stepIndex = Math.min(
          Math.floor((nextProgress / 100) * faceScanSteps.length),
          faceScanSteps.length - 1
        );
        setScanStep(stepIndex);
        return nextProgress;
      });
    }, 100);
  };

  // Fingerprint Reader interaction logic (Hold to Scan)
  const handleFingerprintStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isSuccess) return;
    e.preventDefault();
    setIsFingerprintHolding(true);
    setScanStep(1); //Contact initiated

    if (fingerprintIntervalRef.current) {
      clearInterval(fingerprintIntervalRef.current);
    }

    fingerprintIntervalRef.current = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(fingerprintIntervalRef.current!);
          setIsFingerprintHolding(false);
          triggerSuccessState();
          return 100;
        }

        const nextProgress = prev + 4.5; // Slightly faster, about 2.2 seconds
        const stepIndex = Math.min(
          Math.floor((nextProgress / 100) * fingerprintScanSteps.length),
          fingerprintScanSteps.length - 1
        );
        setScanStep(stepIndex);
        return nextProgress;
      });
    }, 100);
  };

  const handleFingerprintRelease = () => {
    if (isSuccess) return;
    setIsFingerprintHolding(false);
    if (fingerprintIntervalRef.current) {
      clearInterval(fingerprintIntervalRef.current);
    }
    
    // Smoothly drain the progress bar instead of resetting instantly, for premium look
    setScanProgress(prev => {
      if (prev < 100) {
        setScanStep(0); // Prompt user to place finger back
        return 0; // Reset to 0 if they let go early
      }
      return prev;
    });
  };

  // Success flow
  const triggerSuccessState = () => {
    setIsSuccess(true);
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
        
        {/* Holographic glowing backgrounds */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>

        {/* Header */}
        <div className="relative z-10 flex justify-between items-center px-5 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="text-emerald-400 animate-pulse" size={18} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-200">
              Enhanced Secure Handshake
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

        {/* Biometric Type Selection Tabs */}
        {!isSuccess && (
          <div className="relative z-10 px-6 pt-4 flex gap-2">
            <button
              onClick={() => {
                setBiometricType('face');
                setScanProgress(0);
                setScanStep(0);
              }}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-1.5 ${
                biometricType === 'face'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300'
              }`}
            >
              <Camera size={13} />
              Face ID Recognition
            </button>
            <button
              onClick={() => {
                setBiometricType('fingerprint');
                setScanProgress(0);
                setScanStep(0);
              }}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-1.5 ${
                biometricType === 'fingerprint'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300'
              }`}
            >
              <Fingerprint size={13} />
              Fingerprint Reader
            </button>
          </div>
        )}

        {/* Viewfinder or Capacitive Area */}
        <div className="p-6 relative z-10 space-y-6">
          
          <div className="relative aspect-square w-full max-w-sm mx-auto bg-slate-950 rounded-2xl overflow-hidden border border-slate-850 shadow-2xl flex items-center justify-center">
            
            {/* 1. Loading camera stream indicator */}
            {biometricType === 'face' && isInitializing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 z-30 bg-slate-950">
                <RefreshCw className="text-emerald-500 animate-spin" size={28} />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400/80">
                  Warming optics system...
                </span>
              </div>
            )}

            {/* 2. Unified Success Checkmark Overlay */}
            {isSuccess && (
              <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-xs flex flex-col items-center justify-center space-y-4 animate-fade-in">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: '1.5s' }}></div>
                  <div className="absolute w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 animate-pulse"></div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 border border-emerald-300">
                    <Check className="text-white animate-bounce-short" size={32} strokeWidth={3} />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h4 className="text-md font-black text-emerald-400 uppercase tracking-widest animate-pulse">
                    Identity Synchronized
                  </h4>
                  <p className="text-xs text-slate-200 font-extrabold">
                    {selectedStaff.name}
                  </p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">
                    Payload Signature Approved ✓
                  </p>
                  <p className="text-[10px] text-slate-500 tracking-wide font-medium">
                    Redirecting to secure terminal...
                  </p>
                </div>
              </div>
            )}

            {/* 3. Render Face Scanner layout */}
            {biometricType === 'face' && !isSuccess && (
              <>
                {!isFallbackMode ? (
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                    playsInline
                    muted
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-slate-950/90 z-10 animate-fade-in">
                    <div className="relative">
                      <div className="absolute inset-[-12px] border border-emerald-500/30 rounded-full animate-spin" style={{ animationDuration: '6s' }}></div>
                      <div className="absolute inset-[-6px] border border-dashed border-emerald-400/20 rounded-full animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}></div>
                      
                      <div className="w-28 h-28 rounded-full bg-emerald-950/25 border-2 border-emerald-500/30 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 grid grid-cols-6 gap-2 p-3 opacity-30">
                          {Array.from({ length: 24 }).map((_, i) => (
                            <div key={i} className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 120}ms` }} />
                          ))}
                        </div>
                        <Eye className="text-emerald-400/80 animate-pulse relative z-10" size={44} />
                      </div>
                    </div>

                    <div className="bg-slate-900/95 px-3 py-1.5 rounded-full border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                      <span>FACIAL LENS SIMULATOR</span>
                    </div>
                  </div>
                )}

                {/* Laser scan horizontal overlay */}
                {!isInitializing && (
                  <div className="absolute inset-0 pointer-events-none z-20">
                    <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-500/50 animate-scan-line"></div>
                    <div className="absolute inset-10 border-2 border-dashed border-emerald-500/20 rounded-full flex items-center justify-center">
                      <div className="w-full h-full border border-emerald-500/30 rounded-full relative">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl-md"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr-md"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl-md"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br-md"></div>

                        <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '100ms' }}></div>
                        <div className="absolute top-1/4 right-1/3 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '400ms' }}></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 text-[8px] font-mono font-black text-emerald-400/80 tracking-widest bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/10">
                      SYS_CONF: 99.8%
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 4. Render Interactive Fingerprint layout */}
            {biometricType === 'fingerprint' && !isSuccess && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-6">
                
                {/* Touch/Press Zone representation */}
                <div className="relative">
                  {/* Concentric expanding ripples when scanning */}
                  {isFingerprintHolding && (
                    <>
                      <div className="absolute inset-[-15px] border border-emerald-500/40 rounded-full animate-ping" style={{ animationDuration: '1.2s' }}></div>
                      <div className="absolute inset-[-30px] border border-emerald-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                    </>
                  )}

                  {/* Tactile glow indicator */}
                  <div className={`absolute inset-[-8px] rounded-full blur-md transition-all duration-300 ${isFingerprintHolding ? 'bg-emerald-500/35 scale-110' : 'bg-slate-900/0'}`}></div>

                  <button
                    onMouseDown={handleFingerprintStart}
                    onMouseUp={handleFingerprintRelease}
                    onMouseLeave={handleFingerprintRelease}
                    onTouchStart={handleFingerprintStart}
                    onTouchEnd={handleFingerprintRelease}
                    id="touch-fingerprint-sensor"
                    className={`relative z-10 w-32 h-32 rounded-full border-2 flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-300 active:scale-95 ${
                      isFingerprintHolding
                        ? 'bg-emerald-950/40 border-emerald-400 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                        : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Fingerprint size={56} className={`${isFingerprintHolding ? 'animate-pulse scale-105' : ''}`} />
                    
                    {/* Sliding green scanning laser */}
                    {isFingerprintHolding && (
                      <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-md shadow-emerald-500/80 animate-scan-line"></div>
                    )}
                  </button>
                </div>

                <div className="text-center space-y-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                    isFingerprintHolding 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse'
                      : 'bg-slate-950 text-slate-500 border-slate-850'
                  }`}>
                    {isFingerprintHolding ? "Analyzing Ridge Vectors..." : "Press & Hold Sensor"}
                  </span>
                  <p className="text-[10px] text-slate-500 font-medium max-w-[240px] mx-auto pt-1">
                    {isFingerprintHolding 
                      ? "Keep your finger firmly pressed against the scanner."
                      : "Place and hold mouse click or tap-and-hold to begin secure authorization."
                    }
                  </p>
                </div>

                {/* HUD Coordinates readout */}
                <div className="absolute bottom-3 left-3 text-[7px] font-mono text-emerald-500/60 uppercase tracking-widest">
                  MINUTIAE_REF: 0x9f7a
                </div>
                <div className="absolute bottom-3 right-3 text-[7px] font-mono text-emerald-500/60 uppercase tracking-widest">
                  TEMP: 36.5°C
                </div>
              </div>
            )}

          </div>

          {/* Sync Progress metrics */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wide">
                Security Ledger Sync
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {Math.round(scanProgress)}%
              </span>
            </div>

            {/* Progress Bar track */}
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-150" 
                style={{ width: `${scanProgress}%` }}
              />
            </div>

            {/* Dynamic ledger output text */}
            <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl min-h-[58px] flex items-center justify-center text-center">
              <p className={`text-[11px] font-black tracking-wide text-slate-300 ${isFingerprintHolding || biometricType === 'face' ? 'animate-pulse text-emerald-400' : ''}`}>
                {scanProgress === 0 
                  ? (biometricType === 'face' ? 'Awaiting camera feedback...' : 'Terminal ready. Place finger on sensor above.')
                  : currentScanSteps[scanStep]
                }
              </p>
            </div>
          </div>

          {/* Ghanaian Act Note */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl flex items-start space-x-2.5">
            <UserCheck className="text-emerald-400 shrink-0 mt-0.5" size={15} />
            <div className="text-[10px] text-slate-400 leading-relaxed font-semibold">
              Biometric login steps utilize client-to-server local signature hashing. Dermal/ridge vectors and face points remain hardware-isolated on this device and conform fully to the Ghana Data Protection Act 2012 (Act 843).
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
