import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Signal,
  Battery,
  Smartphone,
  Maximize2,
  Minimize2,
  Sparkles,
  Volume2,
  BellRing,
  BookOpen,
  QrCode,
  Download
} from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
  isPhoneMockup: boolean;
  onTogglePhoneMockup: () => void;
  onTestSound: () => void;
  onOpenTour: () => void;
  onOpenQr?: () => void;
  activeNavTab: string;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  isPhoneMockup,
  onTogglePhoneMockup,
  onTestSound,
  onOpenTour,
  onOpenQr,
  activeNavTab,
}) => {
  const [timeStr, setTimeStr] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Utility Bar */}
      <header className="w-full max-w-5xl px-4 py-3 flex items-center justify-between gap-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 font-extrabold text-sm">
            S
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <span>SmartAlert</span>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                Android & Web
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">
              Kotlin · Jetpack Compose · Room · Geofence · AlarmManager
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenQr && (
            <button
              onClick={onOpenQr}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/40 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              title="Scan QR to open directly on physical Android device"
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Phone QR</span>
            </button>
          )}

          <a
            href="/SmartAlert-Complete-Project.zip"
            download="SmartAlert-Complete-Project.zip"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold rounded-xl transition-all cursor-pointer no-underline"
            title="Download complete project zip archive (Web App + Android Studio code)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Project ZIP</span>
          </a>

          <button
            onClick={onTestSound}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            title="Play synthetic Android alarm tone"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Test Tone</span>
          </button>

          <button
            onClick={onOpenTour}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
            title="Open App Tour"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Tour</span>
          </button>

          <button
            onClick={onTogglePhoneMockup}
            className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-semibold rounded-xl transition-all ${
              isPhoneMockup
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
            title={isPhoneMockup ? 'Switch to Full Screen View' : 'Switch to Phone Frame View'}
          >
            {isPhoneMockup ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full Width</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="w-full flex justify-center px-2 sm:px-4 pb-12">
        {isPhoneMockup ? (
          /* Realistic Android Phone Mockup Frame */
          <div className="relative w-full max-w-[420px] bg-slate-950 border-[6px] border-slate-800 rounded-[44px] shadow-2xl shadow-indigo-950/20 overflow-hidden ring-1 ring-white/10 flex flex-col min-h-[760px] max-h-[92vh]">
            {/* Camera Punch Hole */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-900 border border-slate-800 z-30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-950/80" />
            </div>

            {/* Android Status Bar */}
            <div className="px-6 pt-3 pb-2 flex items-center justify-between text-xs text-slate-300 font-medium z-20 select-none bg-slate-950">
              <span className="text-[11px] font-mono font-bold">{timeStr}</span>
              <div className="flex items-center gap-2 text-slate-400">
                <Wifi className="w-3 h-3 text-slate-300" />
                <Signal className="w-3 h-3 text-slate-300" />
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300">
                  <span className="text-[10px]">98%</span>
                  <Battery className="w-3.5 h-3.5 text-slate-200 fill-slate-200" />
                </div>
              </div>
            </div>

            {/* App Screen Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col">
              {children}
            </div>

            {/* Android Navigation Gesture Bar */}
            <div className="py-2.5 flex justify-center bg-slate-950 border-t border-slate-900 select-none">
              <div className="w-28 h-1 bg-slate-600/60 rounded-full" />
            </div>
          </div>
        ) : (
          /* Expanded Full-Width Responsive Container */
          <div className="w-full max-w-5xl bg-slate-950/70 border border-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
