import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Clock,
  MapPin,
  CheckCircle2,
  Volume2,
  X,
  RotateCcw,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Task } from '../types';
import { soundEffects } from '../utils/audio';

interface FullScreenAlarmModalProps {
  task: Task | null;
  reason: 'due_time' | 'geofence' | 'manual_test';
  isOpen: boolean;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
  onComplete: () => void;
}

export const FullScreenAlarmModal: React.FC<FullScreenAlarmModalProps> = ({
  task,
  reason,
  isOpen,
  onDismiss,
  onSnooze,
  onComplete,
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentSeconds, setCurrentSeconds] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
      setCurrentSeconds(now.getSeconds().toString().padStart(2, '0'));
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen || !task) return null;

  const isGeofence = reason === 'geofence';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
      {/* Background Pulsing Radial Waves */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-indigo-600/10 animate-ping duration-1000" />
        <div className="w-[320px] h-[320px] rounded-full bg-indigo-500/15 animate-pulse" />
      </div>

      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 overflow-hidden">
        {/* Android Lockscreen Category Tag */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-indigo-400 text-[10px]">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Android Full-Screen Intent</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">PRIORITY_MAX</span>
        </div>

        {/* Dynamic Big Digital Clock */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-extrabold text-white tracking-tight font-mono">
              {currentTime}
            </span>
            <span className="text-xl font-bold text-slate-400 font-mono">
              :{currentSeconds}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Pulsing Alarm Icon Indicator */}
        <div className="relative flex justify-center my-2">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-600/30 animate-bounce-once">
            {isGeofence ? (
              <MapPin className="w-10 h-10 text-emerald-400 animate-pulse" />
            ) : (
              <BellRing className="w-10 h-10 text-amber-300 animate-wiggle" />
            )}
          </div>
        </div>

        {/* Task Title & Notes */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
            {isGeofence ? '📍 Geofence Target Reached' : '⏰ Scheduled Exact Alarm'}
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
            {task.title}
          </h3>

          {task.location && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>{task.location.name}</span>
            </div>
          )}

          {task.notes && (
            <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed px-2">
              {task.notes}
            </p>
          )}
        </div>

        {/* Android Alarm Actions */}
        <div className="space-y-2.5 pt-2">
          {/* Primary Action: Mark Completed */}
          <button
            onClick={() => {
              soundEffects.playSuccess();
              onComplete();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark as Completed</span>
          </button>

          {/* Secondary Actions: Snooze & Dismiss */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSnooze(5)}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Snooze (5m)</span>
            </button>

            <button
              onClick={onDismiss}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold rounded-xl border border-slate-800 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Dismiss</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
