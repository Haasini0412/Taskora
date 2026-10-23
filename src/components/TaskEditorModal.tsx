import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, ShieldAlert, Sparkles } from 'lucide-react';
import { Task, Priority, LocationGeofence } from '../types';
import { PRESET_LOCATIONS } from '../utils/storage';

interface TaskEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt'>, existingId?: string) => void;
  editingTask?: Task | null;
  defaultGeofenceRadius: number;
}

export const TaskEditorModal: React.FC<TaskEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTask,
  defaultGeofenceRadius,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Task['category']>('General');
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('12:00');
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderOffsetMinutes, setReminderOffsetMinutes] = useState(0); // 0 = at time, 15 = 15m before

  // Geofence states
  const [hasLocation, setHasLocation] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('loc_market');
  const [locationName, setLocationName] = useState('Whole Foods Market');
  const [locationAddress, setLocationAddress] = useState('399 4th St, San Francisco, CA');
  const [latitude, setLatitude] = useState(37.7749);
  const [longitude, setLongitude] = useState(-122.4194);
  const [radius, setRadius] = useState(defaultGeofenceRadius);
  const [triggerOn, setTriggerOn] = useState<'enter' | 'exit' | 'both'>('enter');

  // DND flag
  const [highPriorityDndBypass, setHighPriorityDndBypass] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setNotes(editingTask.notes || '');
      setPriority(editingTask.priority);
      setCategory(editingTask.category);
      setHasDueDate(Boolean(editingTask.dueDate));
      setDueDate(editingTask.dueDate || new Date().toISOString().split('T')[0]);
      setDueTime(editingTask.dueTime || '12:00');
      setHasReminder(Boolean(editingTask.reminderDateTime));
      setHighPriorityDndBypass(Boolean(editingTask.highPriorityDndBypass));

      if (editingTask.location) {
        setHasLocation(true);
        setLocationName(editingTask.location.name);
        setLocationAddress(editingTask.location.address || '');
        setLatitude(editingTask.location.latitude);
        setLongitude(editingTask.location.longitude);
        setRadius(editingTask.location.radius);
        setTriggerOn(editingTask.location.triggerOn);
      } else {
        setHasLocation(false);
      }
    } else {
      // Default reset for new task
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setNotes('');
      setPriority('medium');
      setCategory('General');
      setHasDueDate(true);
      setDueDate(today);
      setDueTime('18:00');
      setHasReminder(true);
      setReminderOffsetMinutes(0);
      setHasLocation(false);
      setHighPriorityDndBypass(false);
      setRadius(defaultGeofenceRadius);

      const defaultPreset = PRESET_LOCATIONS[0];
      setSelectedPresetId(defaultPreset.id);
      setLocationName(defaultPreset.name);
      setLocationAddress(defaultPreset.address);
      setLatitude(defaultPreset.latitude);
      setLongitude(defaultPreset.longitude);
    }
  }, [editingTask, isOpen, defaultGeofenceRadius]);

  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = PRESET_LOCATIONS.find((p) => p.id === presetId);
    if (found) {
      setLocationName(found.name);
      setLocationAddress(found.address);
      setLatitude(found.latitude);
      setLongitude(found.longitude);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let reminderIso: string | undefined = undefined;
    if (hasDueDate && hasReminder && dueDate && dueTime) {
      const scheduled = new Date(`${dueDate}T${dueTime}`);
      if (!isNaN(scheduled.getTime())) {
        const adjustedTime = new Date(scheduled.getTime() - reminderOffsetMinutes * 60000);
        reminderIso = adjustedTime.toISOString();
      }
    }

    let locationGeofence: LocationGeofence | undefined = undefined;
    if (hasLocation) {
      locationGeofence = {
        name: locationName.trim() || 'Selected Location',
        latitude,
        longitude,
        radius,
        triggerOn,
        address: locationAddress,
      };
    }

    onSave(
      {
        title: title.trim(),
        notes: notes.trim(),
        priority,
        category,
        dueDate: hasDueDate ? dueDate : undefined,
        dueTime: hasDueDate ? dueTime : undefined,
        reminderDateTime: reminderIso,
        isCompleted: editingTask ? editingTask.isCompleted : false,
        location: locationGeofence,
        highPriorityDndBypass,
      },
      editingTask?.id
    );

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-base font-bold text-white">
              {editingTask ? 'Edit Task & Reminder' : 'Create New Task'}
            </h3>
            <p className="text-xs text-slate-400">
              Configure alarms, geofencing, and priority
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Buy milk at Whole Foods, submit project pitch..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category & Priority Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Task['category'])}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="General">General</option>
                <option value="Groceries">Groceries</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Health">Health</option>
                <option value="Errand">Errand</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => {
                  const isActive = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-1 text-[11px] font-semibold capitalize rounded-lg transition-colors ${
                        isActive
                          ? p === 'urgent'
                            ? 'bg-rose-500 text-white'
                            : p === 'high'
                            ? 'bg-amber-500 text-slate-950'
                            : p === 'medium'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-700 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Date & Time Scheduling */}
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-white">Date & Alarm Reminder</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDueDate}
                  onChange={(e) => setHasDueDate(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {hasDueDate && (
              <div className="space-y-3 pt-2 border-t border-slate-800/60">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[11px] text-slate-400 mb-1">Due Date</span>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-400 mb-1">Due Time</span>
                    <input
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Exact Alarm</span>
                  </div>
                  <select
                    value={reminderOffsetMinutes}
                    onChange={(e) => setReminderOffsetMinutes(Number(e.target.value))}
                    className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  >
                    <option value={0}>At scheduled time</option>
                    <option value={10}>10 minutes before</option>
                    <option value={30}>30 minutes before</option>
                    <option value={60}>1 hour before</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Location-based Geofence */}
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Location Geofence Alert
                  </span>
                  <span className="text-[11px] text-slate-400">
                    e.g. Remind to buy groceries when reaching store
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasLocation}
                  onChange={(e) => setHasLocation(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {hasLocation && (
              <div className="space-y-3 pt-2 border-t border-slate-800/60">
                <div>
                  <span className="block text-[11px] text-slate-400 mb-1">
                    Select Quick Store / Place Preset
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRESET_LOCATIONS.map((preset) => {
                      const isSelected = selectedPresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handlePresetChange(preset.id)}
                          className={`p-2 text-left rounded-xl border text-xs transition-colors ${
                            isSelected
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="font-semibold truncate">{preset.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{preset.category}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="block text-[11px] text-slate-400 mb-1">
                      Trigger Radius ({radius} meters)
                    </span>
                    <input
                      type="range"
                      min={50}
                      max={500}
                      step={25}
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                      <span>50m (Store door)</span>
                      <span>500m (Neighborhood)</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] text-slate-400 mb-1">Trigger Event</span>
                    <select
                      value={triggerOn}
                      onChange={(e) => setTriggerOn(e.target.value as 'enter' | 'exit' | 'both')}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="enter">When Arriving (Enter)</option>
                      <option value="exit">When Leaving (Exit)</option>
                      <option value="both">Both Arriving & Leaving</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DND High Priority Investigation Switch */}
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    High Priority Alarm (DND Candidate)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Uses CATEGORY_ALARM + USAGE_ALARM channel
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={highPriorityDndBypass}
                  onChange={(e) => setHighPriorityDndBypass(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Android does not allow silent DND bypass. Marking this task flags it as an alarm. If the user’s Android DND profile permits alarms (or Notification Policy Access is granted), it will sound audibly even during quiet hours.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Notes & Grocery Items
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add checklist, store aisle details, or memo..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{editingTask ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
