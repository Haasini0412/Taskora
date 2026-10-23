import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  ShieldAlert,
  Code2,
  Trophy,
  Settings as SettingsIcon,
  BellRing,
  X,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Task, AppSettings, Priority } from './types';
import {
  getStoredTasks,
  saveStoredTasks,
  getStoredSettings,
  saveStoredSettings,
  INITIAL_TASKS,
  INITIAL_SETTINGS,
  PRESET_LOCATIONS,
} from './utils/storage';
import { soundEffects } from './utils/audio';
import { DeviceFrame } from './components/DeviceFrame';
import { DashboardView } from './components/DashboardView';
import { LocationGeofenceView } from './components/LocationGeofenceView';
import { DndInvestigationView } from './components/DndInvestigationView';
import { AndroidCodeExporterView } from './components/AndroidCodeExporterView';
import { JudgeDemoGuideView } from './components/JudgeDemoGuideView';
import { SettingsView } from './components/SettingsView';
import { TaskEditorModal } from './components/TaskEditorModal';
import { OnboardingModal } from './components/OnboardingModal';
import { FullScreenAlarmModal } from './components/FullScreenAlarmModal';
import { PhoneQrModal } from './components/PhoneQrModal';

interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface ActiveAlarm {
  task: Task;
  reason: 'due_time' | 'geofence' | 'manual_test';
  timestamp: string;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'geofence' | 'dnd' | 'code' | 'guide' | 'settings'>('dashboard');
  const [isPhoneMockup, setIsPhoneMockup] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarm | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isFullScreenAlarmOpen, setIsFullScreenAlarmOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const loadedTasks = getStoredTasks();
    const loadedSettings = getStoredSettings();
    setTasks(loadedTasks);
    setSettings(loadedSettings);

    if (!loadedSettings.hasSeenOnboarding) {
      setIsOnboardingOpen(true);
    }
  }, []);

  // Save changes to localStorage
  const updateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    saveStoredTasks(newTasks);
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      saveStoredSettings(updated);
      return updated;
    });
  };

  const showToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Periodic alarm checker simulating Android AlarmManager
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date().getTime();
      tasks.forEach((task) => {
        if (!task.isCompleted && task.reminderDateTime && !task.isAlarmTriggered) {
          const reminderTime = new Date(task.reminderDateTime).getTime();
          // Check if due within the last 2 minutes and not triggered yet
          if (now >= reminderTime && now - reminderTime < 1000 * 60 * 3) {
            triggerAlarm(task, 'due_time');
            // Mark triggered
            const updated = tasks.map((t) =>
              t.id === task.id ? { ...t, isAlarmTriggered: true } : t
            );
            updateTasks(updated);
          }
        }
      });
    };

    const interval = setInterval(checkAlarms, 10000);
    return () => clearInterval(interval);
  }, [tasks, settings]);

  const triggerAlarm = (task: Task, reason: ActiveAlarm['reason'] = 'manual_test') => {
    setActiveAlarm({
      task,
      reason,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setIsFullScreenAlarmOpen(true);

    // Play tone based on task DND setting and audio preferences
    if (task.highPriorityDndBypass) {
      soundEffects.playAlarm(settings.alarmTone);
    } else {
      soundEffects.playNotification();
    }

    // Trigger browser notification if allowed
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const titleText =
          reason === 'geofence'
            ? `📍 Arrived near ${task.location?.name || 'Store'}`
            : `⏰ SmartAlert: ${task.title}`;
        new Notification(titleText, {
          body: task.notes || 'Reminder from SmartAlert',
          icon: '/favicon.ico',
        });
      } catch {
        // notification failure
      }
    }

    showToast(
      reason === 'geofence'
        ? `📍 Geofence Alert: Arrived near ${task.location?.name}`
        : `⏰ Alarm Triggered: ${task.title}`,
      task.highPriorityDndBypass ? 'warning' : 'info'
    );
  };

  const handleSnoozeAlarm = (minutes: number = 5) => {
    if (!activeAlarm) return;
    const snoozeTime = new Date(Date.now() + minutes * 60000);
    const updated = tasks.map((t) => {
      if (t.id === activeAlarm.task.id) {
        return {
          ...t,
          reminderDateTime: snoozeTime.toISOString(),
          isAlarmTriggered: false,
        };
      }
      return t;
    });
    updateTasks(updated);
    setIsFullScreenAlarmOpen(false);
    setActiveAlarm(null);
    soundEffects.playNotification();
    showToast(`⏰ Alarm snoozed for ${minutes} minutes`, 'info');
  };

  const handleToggleComplete = (id: string) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        const nextState = !t.isCompleted;
        return {
          ...t,
          isCompleted: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    updateTasks(updated);
    showToast('Task updated', 'info');
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    updateTasks(updated);
    showToast('Task deleted', 'info');
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'>, existingId?: string) => {
    if (existingId) {
      const updated = tasks.map((t) => {
        if (t.id === existingId) {
          return {
            ...t,
            ...taskData,
          };
        }
        return t;
      });
      updateTasks(updated);
      showToast('Task updated successfully', 'success');
    } else {
      const newTask: Task = {
        ...taskData,
        id: 'task_' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      updateTasks([newTask, ...tasks]);
      showToast('New reminder created!', 'success');
    }
  };

  const handleQuickAdd = (preset: {
    title: string;
    notes?: string;
    category: Task['category'];
    priority: Priority;
    dueTime?: string;
    locationPresetId?: string;
    highPriorityDndBypass?: boolean;
  }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    let loc;
    if (preset.locationPresetId) {
      const pLoc = PRESET_LOCATIONS.find((l) => l.id === preset.locationPresetId);
      if (pLoc) {
        loc = {
          name: pLoc.name,
          latitude: pLoc.latitude,
          longitude: pLoc.longitude,
          radius: 150,
          triggerOn: 'enter' as const,
          address: pLoc.address,
        };
      }
    }

    const dueTime = preset.dueTime || '18:00';
    const reminderDateTime = new Date(`${todayStr}T${dueTime}`).toISOString();

    const newTask: Task = {
      id: 'task_' + Date.now(),
      title: preset.title,
      notes: preset.notes || '',
      category: preset.category,
      priority: preset.priority,
      dueDate: todayStr,
      dueTime: dueTime,
      reminderDateTime: reminderDateTime,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      location: loc,
      highPriorityDndBypass: Boolean(preset.highPriorityDndBypass),
    };

    updateTasks([newTask, ...tasks]);
    showToast(
      `⚡ Added "${newTask.title}"${loc ? ` (${loc.name} geofence)` : ''}`,
      'success'
    );
  };

  const handleResetData = () => {
    updateTasks(INITIAL_TASKS);
    updateSettings(INITIAL_SETTINGS);
    showToast('Demo tasks and settings restored', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Toast Overlay */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none max-w-sm w-full px-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3 rounded-2xl shadow-xl border flex items-start gap-2.5 backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
              t.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : t.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
                : t.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            {t.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            ) : t.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            ) : t.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed flex-1 font-medium">{t.message}</div>
          </div>
        ))}
      </div>

      <DeviceFrame
        isPhoneMockup={isPhoneMockup}
        onTogglePhoneMockup={() => setIsPhoneMockup(!isPhoneMockup)}
        onTestSound={() => {
          soundEffects.playAlarm(settings.alarmTone);
          showToast(`Playing ${settings.alarmTone.replace('_', ' ')} alarm tone`, 'info');
        }}
        onOpenTour={() => setIsOnboardingOpen(true)}
        onOpenQr={() => setIsQrModalOpen(true)}
        activeNavTab={activeTab}
      >
        {/* Realistic Heads-Up Alarm Notification Banner (Simulates Android NotificationChannel IMPORTANCE_HIGH) */}
        {activeAlarm && (
          <div
            onClick={() => setIsFullScreenAlarmOpen(true)}
            className="mb-4 p-4 bg-gradient-to-r from-indigo-900/90 via-slate-900 to-purple-900/90 border border-indigo-500/60 rounded-2xl shadow-2xl animate-bounce-once relative overflow-hidden cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                  <BellRing className="w-5 h-5 animate-pulse text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-indigo-300 tracking-wider">
                    <span>
                      {activeAlarm.reason === 'geofence'
                        ? '📍 Supermarket Geofence Trigger'
                        : '⏰ Android Exact Alarm'}
                    </span>
                    <span>·</span>
                    <span>{activeAlarm.timestamp}</span>
                    <span className="hidden sm:inline text-indigo-400 font-semibold">(Tap to open Lockscreen HUD)</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5">{activeAlarm.task.title}</h4>
                  {activeAlarm.task.notes && (
                    <p className="text-xs text-slate-300 mt-0.5">{activeAlarm.task.notes}</p>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveAlarm(null);
                  setIsFullScreenAlarmOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-indigo-500/20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleComplete(activeAlarm.task.id);
                  setActiveAlarm(null);
                  setIsFullScreenAlarmOpen(false);
                }}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg shadow-sm"
              >
                Mark Completed
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSnoozeAlarm(5);
                }}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg"
              >
                Snooze 5m
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Tab Screen View */}
        <div className="flex-1 pb-20">
          {activeTab === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsEditorOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onOpenCreate={() => {
                setEditingTask(null);
                setIsEditorOpen(true);
              }}
              onTriggerAlarmNow={(task) => triggerAlarm(task, 'manual_test')}
              currentLat={settings.simulatedLatitude}
              currentLon={settings.simulatedLongitude}
              onQuickAdd={handleQuickAdd}
              onSaveTask={handleSaveTask}
            />
          )}

          {activeTab === 'geofence' && (
            <LocationGeofenceView
              tasks={tasks}
              simulatedLat={settings.simulatedLatitude}
              simulatedLon={settings.simulatedLongitude}
              simulatedLocationName={settings.simulatedLocationName}
              onUpdateSimulatedLocation={(lat, lon, name) => {
                updateSettings({
                  simulatedLatitude: lat,
                  simulatedLongitude: lon,
                  simulatedLocationName: name,
                });
                showToast(`Location shifted to: ${name}`, 'info');
              }}
              onOpenCreate={() => {
                setEditingTask(null);
                setIsEditorOpen(true);
              }}
              onTriggerGeofenceArrival={(task) => triggerAlarm(task, 'geofence')}
            />
          )}

          {activeTab === 'dnd' && <DndInvestigationView onShowToast={showToast} />}

          {activeTab === 'code' && <AndroidCodeExporterView onShowToast={showToast} />}

          {activeTab === 'guide' && <JudgeDemoGuideView />}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={updateSettings}
              onRequestBrowserNotification={() => {
                if ('Notification' in window) {
                  Notification.requestPermission();
                }
              }}
              onRequestBrowserLocation={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      updateSettings({
                        simulatedLatitude: pos.coords.latitude,
                        simulatedLongitude: pos.coords.longitude,
                        simulatedLocationName: 'Real Device Location',
                      });
                      showToast('GPS coordinates updated successfully', 'success');
                    },
                    (err) => showToast(`GPS error: ${err.message}`, 'warning')
                  );
                }
              }}
              onResetData={handleResetData}
              tasks={tasks}
              onImportTasks={(imported) => {
                updateTasks(imported);
              }}
              onShowToast={showToast}
            />
          )}
        </div>

        {/* Android Material 3 Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-full sm:max-w-md md:max-w-xl lg:max-w-2xl mx-auto px-2 pb-2 pt-1 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80">
          <div className="grid grid-cols-6 gap-1 items-center">
            {[
              { id: 'dashboard', label: 'Today', icon: Calendar },
              { id: 'geofence', label: 'Geofence', icon: MapPin },
              { id: 'dnd', label: 'DND Reality', icon: ShieldAlert },
              { id: 'code', label: 'Kotlin Code', icon: Code2 },
              { id: 'guide', label: 'Judge Pitch', icon: Trophy },
              { id: 'settings', label: 'Settings', icon: SettingsIcon },
            ].map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all ${
                    active
                      ? 'text-indigo-400 font-bold'
                      : 'text-slate-500 hover:text-slate-300 font-medium'
                  }`}
                >
                  <div
                    className={`p-1 rounded-xl transition-colors ${
                      active ? 'bg-indigo-600/20 text-indigo-400' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </DeviceFrame>

      {/* Task Creation / Edit Modal */}
      <TaskEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
        defaultGeofenceRadius={settings.defaultGeofenceRadius}
      />

      {/* Onboarding Guide Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => {
          setIsOnboardingOpen(false);
          updateSettings({ hasSeenOnboarding: true });
        }}
        onRequestPermissions={() => {
          if ('Notification' in window) {
            Notification.requestPermission();
          }
        }}
      />

      {/* Full-Screen Alarm Intent HUD (Android USE_FULL_SCREEN_INTENT) */}
      <FullScreenAlarmModal
        isOpen={isFullScreenAlarmOpen && Boolean(activeAlarm)}
        task={activeAlarm?.task || null}
        reason={activeAlarm?.reason || 'manual_test'}
        onDismiss={() => {
          setIsFullScreenAlarmOpen(false);
        }}
        onSnooze={(mins) => handleSnoozeAlarm(mins)}
        onComplete={() => {
          if (activeAlarm) {
            handleToggleComplete(activeAlarm.task.id);
          }
          setIsFullScreenAlarmOpen(false);
          setActiveAlarm(null);
        }}
      />

      {/* Phone QR Code Modal for Instant Physical Device Testing */}
      <PhoneQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        appUrl="https://ais-pre-fb5nziff2xibfpfrdpsiw5-387155239853.asia-east1.run.app"
      />
    </div>
  );
}
