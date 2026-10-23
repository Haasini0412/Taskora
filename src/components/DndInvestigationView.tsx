import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Volume2,
  VolumeX,
  ExternalLink,
  Code2,
  Play
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface DndInvestigationViewProps {
  onShowToast: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const DndInvestigationView: React.FC<DndInvestigationViewProps> = ({ onShowToast }) => {
  // Simulator test toggles
  const [deviceDndMode, setDeviceDndMode] = useState<'off' | 'priority' | 'total_silence'>('priority');
  const [userGrantedPolicyAccess, setUserGrantedPolicyAccess] = useState<boolean>(false);
  const [reminderType, setReminderType] = useState<'standard' | 'category_alarm'>('category_alarm');
  const [allowAlarmsInDndProfile, setAllowAlarmsInDndProfile] = useState<boolean>(true);

  // Evaluate the simulated Android outcome
  const evaluateSimulation = () => {
    let audible = false;
    let visual = false;
    let reason = '';

    if (deviceDndMode === 'off') {
      audible = true;
      visual = true;
      reason = 'DND is OFF: Notification sounds and displays normally.';
    } else if (deviceDndMode === 'total_silence') {
      audible = false;
      visual = false;
      reason = 'DND Total Silence: Android OS completely mutes all sound, alarms, and visual interruptions at the kernel/hardware level. No app can override this.';
    } else {
      // Priority-only DND mode
      if (userGrantedPolicyAccess) {
        audible = true;
        visual = true;
        reason = 'Allowed via Notification Policy Access: User explicitly granted special DND access in Android System Settings, enabling channel.setBypassDnd(true).';
      } else if (reminderType === 'category_alarm' && allowAlarmsInDndProfile) {
        audible = true;
        visual = true;
        reason = 'Allowed via CATEGORY_ALARM: Tagged with USAGE_ALARM and CATEGORY_ALARM. Because user’s DND profile allows Alarms (default), audio sounds through.';
      } else {
        audible = false;
        visual = false;
        reason = 'Silenced: Standard notification without Notification Policy Access is blocked by Android Do Not Disturb policy.';
      }
    }

    if (audible) {
      soundEffects.playAlarm('digital');
      onShowToast(`🚨 Simulated Sound: ${reason}`, 'success');
    } else {
      onShowToast(`🔇 Silenced: ${reason}`, 'warning');
    }

    return { audible, visual, reason };
  };

  const currentResult = (() => {
    if (deviceDndMode === 'off') {
      return { audible: true, visual: true, verdict: 'ALERTS NORMALLY', color: 'emerald' };
    }
    if (deviceDndMode === 'total_silence') {
      return { audible: false, visual: false, verdict: 'MUTED BY ANDROID KERNEL', color: 'rose' };
    }
    if (userGrantedPolicyAccess || (reminderType === 'category_alarm' && allowAlarmsInDndProfile)) {
      return { audible: true, visual: true, verdict: 'ALARM SOUNDS THROUGH DND', color: 'emerald' };
    }
    return { audible: false, visual: false, verdict: 'SILENCED BY DND FILTER', color: 'amber' };
  })();

  return (
    <div className="space-y-6">
      {/* Executive Callout */}
      <div className="p-5 bg-amber-950/20 border border-amber-500/30 rounded-2xl relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              The Reality of Android Do Not Disturb (DND)
            </h3>
            <p className="text-xs text-amber-200/90 mt-1.5 leading-relaxed font-medium">
              <strong>Official Android Engineering Truth:</strong> No third-party app can silently or automatically bypass Do Not Disturb. Claiming otherwise is technically false. Android reserves DND enforcement for user privacy and sanity.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Pillars of Android DND Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>1. Special User Permission</span>
          </div>
          <div className="font-mono text-[11px] text-slate-300 bg-slate-950 p-2 rounded-lg mb-2">
            ACCESS_NOTIFICATION_POLICY
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Standard runtime dialogs cannot grant this. The app must guide the user to Android Settings (<code className="text-indigo-300">ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS</code>).
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>2. Category Alarm Channel</span>
          </div>
          <div className="font-mono text-[11px] text-slate-300 bg-slate-950 p-2 rounded-lg mb-2">
            NotificationCompat.CATEGORY_ALARM
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            By assigning <code className="text-emerald-300">USAGE_ALARM</code> audio attributes, the notification enters the alarm audio stream. If the user’s DND profile allows alarms, it sounds audibly.
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold mb-2">
            <XCircle className="w-4 h-4" />
            <span>3. Total Silence Boundary</span>
          </div>
          <div className="font-mono text-[11px] text-slate-300 bg-slate-950 p-2 rounded-lg mb-2">
            INTERRUPTION_FILTER_NONE
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            If the user selects "Total Silence" on their device, Android mutes all audio streams without exception. SmartAlert respects this system boundary.
          </p>
        </div>
      </div>

      {/* Interactive DND Simulator for Hackathon Demonstrations */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Interactive Android OS DND Policy Simulator</span>
              <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Live Test
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Change the system state below to test how Android routes reminder audio
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Toggle: Device DND Mode */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <span className="block text-xs font-semibold text-slate-300">
              Device System DND Mode
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-lg">
              {(['off', 'priority', 'total_silence'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDeviceDndMode(mode)}
                  className={`py-1.5 text-[11px] font-bold rounded capitalize transition-all ${
                    deviceDndMode === mode
                      ? mode === 'off'
                        ? 'bg-emerald-600 text-white'
                        : mode === 'priority'
                        ? 'bg-amber-600 text-white'
                        : 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle: Notification Policy Access */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <span className="block text-xs font-semibold text-slate-300">
              Notification Policy Access Granted?
            </span>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">
                {userGrantedPolicyAccess ? 'Granted by user in Settings' : 'Not granted (Default)'}
              </span>
              <button
                onClick={() => setUserGrantedPolicyAccess(!userGrantedPolicyAccess)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                  userGrantedPolicyAccess
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {userGrantedPolicyAccess ? 'Granted' : 'Revoked'}
              </button>
            </div>
          </div>

          {/* Toggle: Reminder Type */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <span className="block text-xs font-semibold text-slate-300">
              Reminder Classification
            </span>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 rounded-lg">
              <button
                onClick={() => setReminderType('standard')}
                className={`py-1 text-xs font-bold rounded transition-all ${
                  reminderType === 'standard'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Standard Reminder
              </button>
              <button
                onClick={() => setReminderType('category_alarm')}
                className={`py-1 text-xs font-bold rounded transition-all ${
                  reminderType === 'category_alarm'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                CATEGORY_ALARM
              </button>
            </div>
          </div>

          {/* Toggle: DND Profile allows Alarms */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <span className="block text-xs font-semibold text-slate-300">
              User DND Profile "Allow Alarms"
            </span>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">
                {allowAlarmsInDndProfile ? 'Alarms Allowed (Android default)' : 'Alarms Blocked'}
              </span>
              <button
                onClick={() => setAllowAlarmsInDndProfile(!allowAlarmsInDndProfile)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                  allowAlarmsInDndProfile
                    ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {allowAlarmsInDndProfile ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>

        {/* Live Simulator Verdict Card */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Android OS Kernel Evaluation
            </div>
            <div className="flex items-center gap-2 mt-1">
              {currentResult.audible ? (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-rose-400" />
              )}
              <span
                className={`text-sm font-extrabold ${
                  currentResult.color === 'emerald'
                    ? 'text-emerald-400'
                    : currentResult.color === 'amber'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {currentResult.verdict}
              </span>
            </div>
          </div>

          <button
            onClick={evaluateSimulation}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all self-start sm:self-auto"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Test Sound in this State</span>
          </button>
        </div>
      </div>

      {/* Production Kotlin Implementation Code Snippet */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span>Production Kotlin Code Pattern</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">NotificationHelper.kt</span>
        </div>
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto">
          <pre>{`// 1. Check if user granted special Notification Policy Access
val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

fun isDndPolicyAccessGranted(): Boolean {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        notificationManager.isNotificationPolicyAccessGranted
    } else true
}

// 2. Guide user to system settings if they want alarms to override DND
fun promptUserForDndAccess() {
    val intent = Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS)
    context.startActivity(intent)
}

// 3. Configure channel with USAGE_ALARM and CATEGORY_ALARM
val alarmAudioAttributes = AudioAttributes.Builder()
    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
    .setUsage(AudioAttributes.USAGE_ALARM)
    .build()

channel.setSound(alarmUri, alarmAudioAttributes)
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
    channel.setBypassDnd(true) // Takes effect when permission is granted
}`}</pre>
        </div>
      </div>
    </div>
  );
};
