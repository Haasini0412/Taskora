import React, { useState } from 'react';
import {
  Smartphone,
  Trophy,
  CheckCircle2,
  Terminal,
  HelpCircle,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  Download
} from 'lucide-react';

export const JudgeDemoGuideView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'install' | 'script' | 'faq'>('install');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 bg-gradient-to-r from-amber-950/40 via-indigo-950/40 to-slate-900 border border-amber-500/30 rounded-2xl">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Trophy className="w-4 h-4" />
          <span>Hackathon Victory Guide</span>
        </div>
        <h3 className="text-base font-bold text-white">
          Free Android Installation & Judge Pitch Script
        </h3>
        <p className="text-xs text-slate-300 mt-1 max-w-xl">
          Everything you need to demonstrate SmartAlert confidently to judges, install it on any physical Android device without paying a single dollar, and score top marks on technical depth.
        </p>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 mt-4 p-1 bg-slate-950/80 rounded-xl border border-slate-800 w-fit">
          <button
            onClick={() => setActiveTab('install')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'install' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            100% Free Phone Install
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'script' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            3-Min Demo Script
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'faq' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tough Judge Q&A
          </button>
        </div>
      </div>

      {/* Tab 1: Free Phone Installation */}
      {activeTab === 'install' && (
        <div className="space-y-4">
          {/* Direct Instant ZIP Download Card */}
          <div className="p-4 bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-emerald-950/20">
            <div>
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
                📦 Instant Project Archives
              </div>
              <h4 className="text-xs font-bold text-white">
                Download Pre-Packaged Project ZIPs
              </h4>
              <p className="text-[11px] text-slate-400">
                Choose the complete repository or the standalone Android Studio project.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="/SmartAlert-Complete-Project.zip"
                download="SmartAlert-Complete-Project.zip"
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-all no-underline cursor-pointer"
                title="Download full project repository (125 KB)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Complete Project (.zip)</span>
              </a>
              <a
                href="/SmartAlert-Android-Project.zip"
                download="SmartAlert-Android-Project.zip"
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition-all no-underline cursor-pointer"
                title="Download pure native Android Studio project (16 KB)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Android Only (.zip)</span>
              </a>
            </div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Option A: Run Directly via Free Android Studio (Recommended)</span>
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  <strong className="text-white">Enable Developer Options on your phone:</strong> Open Android Settings &gt; About Phone &gt; tap "Build number" 7 times.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  <strong className="text-white">Turn on USB or Wireless Debugging:</strong> Under Settings &gt; Developer Options, enable "USB Debugging". If using Wi-Fi (Android 11+), select "Wireless Debugging" and pair via QR code.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <div>
                  <strong className="text-white">Open project in Android Studio (Free):</strong> Click "Download Project (.zip)" from the Android Project Code tab, unzip, and open in free Android Studio.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  4
                </span>
                <div>
                  <strong className="text-white">Click Run ▶:</strong> Select your phone in the top bar and click Run (or press Shift + F10). It builds and installs the native app directly to your phone. Zero dollars spent!
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Option B: Build Standalone Debug APK (.apk)</span>
            </h4>
            <p className="text-xs text-slate-400 mb-2">
              If you want to generate a standalone file you can send to judges or teammates via email or WhatsApp:
            </p>
            <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-slate-200 border border-slate-800">
              ./gradlew assembleDebug
            </div>
            <p className="text-xs text-slate-400 mt-2">
              The output APK is generated at: <code className="text-indigo-300 font-mono">app/build/outputs/apk/debug/app-debug.apk</code>. Any Android phone can install it by tapping the file!
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Option C: Instant Mobile Demo via Browser (PWA)</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Open the shared web URL on your Android phone's Google Chrome browser, tap the menu (three dots), and tap <strong>"Add to Home Screen"</strong>. It installs as a full-screen mobile app with offline storage and push notifications!
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: 3-Minute Hackathon Demo Script */}
      {activeTab === 'script' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4" />
              <span>Minute 0:00 - 0:45: The Hook & The Problem</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "Judges, how many times have you set a grocery reminder on your phone, only to see it at 11 PM when you’re already back home on the couch? Traditional todo apps are dumb: they only trigger at a fixed clock time, or worse, get silently killed by Android’s aggressive battery optimization. We built <strong>SmartAlert</strong>: an offline-first Android app combining exact hardware alarms with location geofencing, so reminders fire when you actually reach the supermarket."
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4" />
              <span>Minute 0:45 - 2:00: The Live Demonstration</span>
            </div>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <div>
                <strong>1. Create a Supermarket Reminder:</strong> Show creating "Buy organic almond milk" with Whole Foods geofence (150m radius).
              </div>
              <div>
                <strong>2. Live Geofence Trigger:</strong> Open the Geofence tab, click "Teleport to Whole Foods Market", and watch the app instantly fire the arrival tone and alert!
              </div>
              <div>
                <strong>3. The Android DND Deep Dive:</strong> Switch to the DND Deep Dive tab and explain: "Unlike apps that falsely claim to bypass Do Not Disturb, SmartAlert strictly adheres to Android security. We use <code className="text-emerald-300">CATEGORY_ALARM</code> and guide users to <code className="text-indigo-300">ACCESS_NOTIFICATION_POLICY</code> so real critical alerts cut through."
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4" />
              <span>Minute 2:00 - 3:00: Architecture & Wrap-Up</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Highlight the engineering stack:
              <br />
              • <strong>UI:</strong> 100% Jetpack Compose with Material 3 design system.
              <br />
              • <strong>Database:</strong> Room with Coroutines Flow for instant reactive updates.
              <br />
              • <strong>Background:</strong> Google Play Services GeofencingClient and AlarmManager exact alarms with wake locks.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Tough Judge Q&A */}
      {activeTab === 'faq' && (
        <div className="space-y-3">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <h5 className="text-xs font-bold text-white mb-1.5 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>Judge: "Doesn't background location drain the phone battery?"</span>
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Your Winning Answer:</strong> "No, because we don't continuously poll the GPS hardware. We leverage Google Play Services <code className="text-indigo-300">GeofencingClient</code>, which aggregates low-power cell-tower IDs and Wi-Fi beacons. The GPS chip is only powered on when the device enters the approximate perimeter, keeping battery impact under 1-2% per day."
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <h5 className="text-xs font-bold text-white mb-1.5 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Judge: "Can any Android app completely ignore Do Not Disturb?"</span>
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Your Winning Answer:</strong> "No third-party app can bypass DND silently without user permission. That would violate Android security principles. SmartAlert correctly requests Notification Policy Access (<code className="text-amber-300">Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS</code>) and categorizes high-priority alarms under <code className="text-amber-300">CATEGORY_ALARM</code>, allowing legitimate emergency reminders through if the user's DND profile permits."
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <h5 className="text-xs font-bold text-white mb-1.5 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Judge: "What happens if the phone restarts?"</span>
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Your Winning Answer:</strong> "In Android, alarms scheduled via AlarmManager are cleared when the device shuts down. We handle this with a <code className="text-emerald-300">BootReceiver</code> that listens for <code className="text-emerald-300">BOOT_COMPLETED</code>, queries our Room database for active pending tasks, and automatically re-arms every exact alarm and geofence."
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
