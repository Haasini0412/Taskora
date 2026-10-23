import React, { useState } from 'react';
import {
  Bell,
  Volume2,
  Vibrate,
  ShieldCheck,
  Battery,
  MapPin,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Play
} from 'lucide-react';
import { AppSettings, Task } from '../types';
import { soundEffects } from '../utils/audio';
import { INITIAL_TASKS, INITIAL_SETTINGS } from '../utils/storage';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onRequestBrowserNotification: () => void;
  onRequestBrowserLocation: () => void;
  onResetData: () => void;
  tasks: Task[];
  onImportTasks: (tasks: Task[]) => void;
  onShowToast: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onRequestBrowserNotification,
  onRequestBrowserLocation,
  onResetData,
  tasks,
  onImportTasks,
  onShowToast,
}) => {
  const [browserNotificationStatus, setBrowserNotificationStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const handleTestTone = (tone: AppSettings['alarmTone']) => {
    soundEffects.playAlarm(tone);
    onShowToast(`Playing preview tone: ${tone.replace('_', ' ')}`, 'info');
  };

  const handleRequestNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setBrowserNotificationStatus(res);
        if (res === 'granted') {
          onShowToast('Notification permission granted!', 'success');
          new Notification('SmartAlert Active', {
            body: 'Task alarms and store arrival alerts will appear here.',
            icon: '/favicon.ico',
          });
        } else {
          onShowToast('Notification permission was denied.', 'warning');
        }
      } catch {
        onShowToast('Error requesting notification permission', 'error');
      }
    }
    onRequestBrowserNotification();
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', 'smartalert_tasks_backup.json');
    dlAnchorElem.click();
    onShowToast('Tasks exported to JSON', 'success');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportTasks(parsed);
          onShowToast(`Successfully imported ${parsed.length} tasks!`, 'success');
        } else {
          onShowToast('Invalid JSON file format', 'error');
        }
      } catch {
        onShowToast('Failed to parse JSON file', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Android System Permissions Status Card */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Android Permission Manifest & Status</span>
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Permissions are requested transparently and only when required by features.
          </p>
        </div>

        <div className="space-y-2.5">
          {/* Push Notifications */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Notifications (POST_NOTIFICATIONS)</div>
                <div className="text-[11px] text-slate-400">
                  Required for heads-up task alerts on Android 13+
                </div>
              </div>
            </div>
            <button
              onClick={handleRequestNotification}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                browserNotificationStatus === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500'
              }`}
            >
              {browserNotificationStatus === 'granted' ? 'Active' : 'Enable'}
            </button>
          </div>

          {/* Location & Geofencing */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Location (ACCESS_FINE_LOCATION)
                </div>
                <div className="text-[11px] text-slate-400">
                  Used by GeofencingClient for store arrival triggers
                </div>
              </div>
            </div>
            <button
              onClick={onRequestBrowserLocation}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
            >
              Verify GPS
            </button>
          </div>

          {/* Exact Alarm Permission */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Battery className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Exact Alarms (SCHEDULE_EXACT_ALARM)
                </div>
                <div className="text-[11px] text-slate-400">
                  Wakes CPU from Doze mode at exact scheduled second
                </div>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
              Granted (Auto)
            </span>
          </div>
        </div>
      </div>

      {/* Reminder & Sound Preferences */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-indigo-400" />
          <span>Reminder & Audio Preferences</span>
        </h4>

        {/* Alarm Tone Picker */}
        <div>
          <span className="block text-xs font-semibold text-slate-300 mb-2">
            Alarm Ringtone / Sound Effect
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['digital', 'urgent_siren', 'chime', 'gentle'] as const).map((tone) => {
              const isSelected = settings.alarmTone === tone;
              return (
                <div
                  key={tone}
                  onClick={() => onUpdateSettings({ alarmTone: tone })}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold capitalize">{tone.replace('_', ' ')}</div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestTone(tone);
                    }}
                    className="mt-2 flex items-center justify-center gap-1 py-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Preview</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Default Geofence Radius */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-300">Default Store Geofence Radius</span>
            <span className="text-xs font-bold text-emerald-400">{settings.defaultGeofenceRadius} meters</span>
          </div>
          <input
            type="range"
            min={50}
            max={500}
            step={25}
            value={settings.defaultGeofenceRadius}
            onChange={(e) => onUpdateSettings({ defaultGeofenceRadius: Number(e.target.value) })}
            className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Battery Optimization Notice */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-start gap-3">
        <Battery className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 leading-relaxed">
          <strong className="text-slate-200">Android Battery Optimization (Doze Mode):</strong> On modern Samsung, Xiaomi, and Pixel devices, aggressive battery management can delay background workers. SmartAlert uses <code className="text-amber-300">AlarmManager.setExactAndAllowWhileIdle</code> to trigger alarms even while the phone is asleep.
        </div>
      </div>

      {/* Data Backup & Reset */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <h4 className="text-sm font-bold text-white">Local Data Management</h4>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-white text-xs font-semibold rounded-xl transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Tasks (JSON)</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5" />
            <span>Import Tasks</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/30 border border-rose-800/40 hover:bg-rose-900/40 text-rose-300 text-xs font-semibold rounded-xl transition-all ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
