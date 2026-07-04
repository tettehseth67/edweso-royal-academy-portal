import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Timer, Zap } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function CameraCapture({ onCapture, onClose, isDarkMode }: CameraCaptureProps) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Custom camera features
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
  const [showFlash, setShowFlash] = useState<boolean>(false);
  const [useTimer, setUseTimer] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Enumerate available video devices
  useEffect(() => {
    async function getDevices() {
      try {
        // Request initial permission to ensure we can read device labels
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
        tempStream.getTracks().forEach(track => track.stop());

        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        
        if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Error listing camera devices:', err);
        setError('Camera permission denied or no camera device found.');
        setIsLoading(false);
      }
    }
    getDevices();
  }, []);

  // 2. Start streaming when selected camera device changes
  useEffect(() => {
    if (!selectedDeviceId) return;
    
    let activeStream: MediaStream | null = null;
    setIsLoading(true);
    setError('');

    async function startStream() {
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      try {
        const constraints = {
          video: {
            deviceId: { exact: selectedDeviceId },
            width: { ideal: 640 },
            height: { ideal: 640 },
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
            setIsLoading(false);
          };
        }
      } catch (err: any) {
        console.error('Error accessing camera device:', err);
        setError('Unable to start the camera stream. Please check permissions or device connection.');
        setIsLoading(false);
      }
    }

    startStream();

    // Cleanup on device change or component unmount
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedDeviceId]);

  // 3. Shutter trigger & flash feedback animation
  const triggerShutter = () => {
    if (!videoRef.current) return;
    
    // Play visual flash
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 150);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    
    // Use the natural aspect ratio of the stream
    const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror horizontal translation for selfie-style video capture
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);

      // Crop center square
      const sx = ((video.videoWidth || 480) - size) / 2;
      const sy = ((video.videoHeight || 480) - size) / 2;
      
      ctx.drawImage(video, sx, sy, size, size, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onCapture(dataUrl);
    }
  };

  // 4. Countdown snap trigger
  const handleCaptureClick = () => {
    if (isCountdownActive || isLoading) return;

    if (useTimer) {
      setIsCountdownActive(true);
      setCountdown(3);
      
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current!);
            setIsCountdownActive(false);
            triggerShutter();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      triggerShutter();
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" id="era-camera-capture-modal">
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Modal Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-200/50 dark:border-slate-800">
          <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Camera className="text-emerald-500 animate-pulse" size={15} />
            <span>Capture Portal Photo</span>
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Close camera"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content / Camera Frame */}
        <div className="p-5 space-y-4">
          {error ? (
            <div className="p-4 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl text-xs space-y-2 leading-relaxed flex items-start gap-2.5 border border-rose-500/20">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold uppercase tracking-wide">Camera Access Failed</p>
                <p className="mt-1 font-semibold text-slate-600 dark:text-slate-300">{error}</p>
                <p className="text-[10px] text-slate-400 mt-2">Please ensure you've allowed camera permissions in your browser and that no other application is using your webcam.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Camera Switcher Dropdown */}
              {devices.length > 1 && (
                <div className="flex items-center justify-between gap-2.5 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] uppercase font-black text-slate-400 pl-1.5">Select Device</span>
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="bg-white dark:bg-slate-900 text-[11px] font-bold py-1 px-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800 focus:outline-hidden"
                  >
                    {devices.map((device, index) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Viewfinder Window */}
              <div 
                onClick={handleCaptureClick}
                className="relative aspect-square w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-200/50 dark:border-slate-800 shadow-inner flex items-center justify-center cursor-pointer group hover:border-emerald-500/80 transition-all duration-200"
                title="Click anywhere inside the live feed to capture instantly"
              >
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 z-10 bg-slate-950">
                    <RefreshCw className="text-emerald-500 animate-spin" size={24} />
                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400/80">Initializing Lens...</span>
                  </div>
                )}

                {/* Shutter Flash Visual Effect */}
                {showFlash && (
                  <div className="absolute inset-0 bg-white z-20 animate-fade-out" style={{ animationDuration: '150ms' }} />
                )}

                {/* Shutter Countdown HUD Overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 bg-slate-950/60 z-15 flex items-center justify-center">
                    <span className="text-7xl font-sans font-black text-white drop-shadow-md animate-ping">
                      {countdown}
                    </span>
                  </div>
                )}

                {/* Live Video Feed */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover scale-x-[-1]"
                  playsInline
                  muted
                />

                {/* Face Alignment Overlay Guidelines */}
                <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-emerald-500/25 rounded-full m-8 flex items-center justify-center group-hover:border-emerald-500/45 transition-colors">
                  <div className="absolute bottom-6 bg-slate-900/85 border border-emerald-500/30 text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1 group-hover:bg-emerald-950 group-hover:text-emerald-300 group-hover:border-emerald-400 transition-all">
                    <Camera size={9} className="animate-pulse" />
                    <span>Click Feed to Snap</span>
                  </div>
                </div>
              </div>

              {/* Advanced Controls Options */}
              <div className="flex items-center justify-between border-t border-slate-200/40 dark:border-slate-800/80 pt-3">
                <button
                  onClick={() => setUseTimer(!useTimer)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    useTimer 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Enable 3-second self-timer"
                  disabled={isCountdownActive}
                >
                  <Timer size={13} className={useTimer ? 'animate-bounce' : ''} />
                  <span>{useTimer ? '3s Timer Active' : 'Self-Timer'}</span>
                </button>

                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Selfie Mirror Enabled
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="flex gap-3 justify-end px-5 py-4 border-t border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <button
            onClick={onClose}
            className="text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          {!error && (
            <button
              onClick={handleCaptureClick}
              disabled={isCountdownActive || isLoading}
              className={`text-xs font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer ${
                isCountdownActive || isLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
              }`}
            >
              <Camera size={14} />
              <span>{isCountdownActive ? 'Snapping...' : 'Snap Photo'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
