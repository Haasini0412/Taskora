import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldAlert,
  Search,
  Plus,
  Trash2,
  Edit3,
  BellRing,
  CheckCircle2,
  Circle,
  Layers,
  Sparkles,
  Zap,
  ShoppingCart,
  Briefcase,
  BookOpen,
  HeartPulse,
  Package,
  Check
} from 'lucide-react';
import { Task, Priority } from '../types';
import { soundEffects } from '../utils/audio';
import { WeeklyProductivityChart } from './WeeklyProductivityChart';
import { SmartInputBar } from './SmartInputBar';

export interface QuickAddPresetOption {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgClass: string;
  borderClass: string;
  defaultTitle: string;
  notes: string;
  category: Task['category'];
  priority: Priority;
  locationPresetId?: string;
  dueTime: string;
  highPriorityDndBypass?: boolean;
}

interface DashboardViewProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onOpenCreate: () => void;
  onTriggerAlarmNow: (task: Task) => void;
  currentLat: number;
  currentLon: number;
  onQuickAdd?: (preset: {
    title: string;
    notes?: string;
    category: Task['category'];
    priority: Priority;
    dueTime?: string;
    locationPresetId?: string;
    highPriorityDndBypass?: boolean;
  }) => void;
  onSaveTask?: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

export const QUICK_ADD_PRESETS: QuickAddPresetOption[] = [
  {
    id: 'quick_groceries',
    label: 'Groceries',
    subtitle: 'Whole Foods Geofence',
    icon: ShoppingCart,
    color: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95',
    borderClass: 'border-emerald-500/30 hover:border-emerald-500/60',
    defaultTitle: 'Buy Groceries & Produce',
    notes: 'Pick up milk, fresh produce, and supermarket essentials.',
    category: 'Groceries',
    priority: 'high',
    locationPresetId: 'loc_market',
    dueTime: '18:30',
  },
  {
    id: 'quick_meeting',
    label: 'Meeting',
    subtitle: 'Alarm + DND Ready',
    icon: Briefcase,
    color: 'text-amber-400',
    bgClass: 'bg-amber-500/10 hover:bg-amber-500/20 active:scale-95',
    borderClass: 'border-amber-500/30 hover:border-amber-500/60',
    defaultTitle: 'Team Sync & Hackathon Standup',
    notes: 'Review project milestones, deliverables, and architecture questions.',
    category: 'Work',
    priority: 'urgent',
    highPriorityDndBypass: true,
    dueTime: '15:00',
  },
  {
    id: 'quick_study',
    label: 'Study',
    subtitle: 'Focus Block',
    icon: BookOpen,
    color: 'text-sky-400',
    bgClass: 'bg-sky-500/10 hover:bg-sky-500/20 active:scale-95',
    borderClass: 'border-sky-500/30 hover:border-sky-500/60',
    defaultTitle: 'Deep Study & Code Review',
    notes: 'Review Android Jetpack Compose notes and algorithms.',
    category: 'Work',
    priority: 'medium',
    dueTime: '20:00',
  },
  {
    id: 'quick_health',
    label: 'Health',
    subtitle: 'CVS Pharmacy Alert',
    icon: HeartPulse,
    color: 'text-rose-400',
    bgClass: 'bg-rose-500/10 hover:bg-rose-500/20 active:scale-95',
    borderClass: 'border-rose-500/30 hover:border-rose-500/60',
    defaultTitle: 'Refill Prescription & Vitamins',
    notes: 'Pick up Rx counter order and multivitamins.',
    category: 'Health',
    priority: 'high',
    locationPresetId: 'loc_pharmacy',
    dueTime: '17:00',
  },
  {
    id: 'quick_errand',
    label: 'Errand',
    subtitle: 'Package / Mail',
    icon: Package,
    color: 'text-purple-400',
    bgClass: 'bg-purple-500/10 hover:bg-purple-500/20 active:scale-95',
    borderClass: 'border-purple-500/30 hover:border-purple-500/60',
    defaultTitle: 'Drop Off Mail & Post Office Errand',
    notes: 'Return parcel and check post office box.',
    category: 'Errand',
    priority: 'medium',
    dueTime: '16:30',
  },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onOpenCreate,
  onTriggerAlarmNow,
  currentLat,
  currentLon,
  onQuickAdd,
  onSaveTask,
}) => {
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'geofenced' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [customQuickTitle, setCustomQuickTitle] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Derived metrics
  const todayCount = tasks.filter((t) => !t.isCompleted && t.dueDate === todayStr).length;
  const upcomingCount = tasks.filter((t) => !t.isCompleted && t.dueDate && t.dueDate > todayStr).length;
  const geofencedCount = tasks.filter((t) => !t.isCompleted && t.location).length;
  const completedCount = tasks.filter((t) => t.isCompleted).length;

  const handleQuickAddClick = (preset: QuickAddPresetOption) => {
    if (onQuickAdd) {
      onQuickAdd({
        title: preset.defaultTitle,
        notes: preset.notes,
        category: preset.category,
        priority: preset.priority,
        dueTime: preset.dueTime,
        locationPresetId: preset.locationPresetId,
        highPriorityDndBypass: preset.highPriorityDndBypass,
      });
    }
    soundEffects.playNotification();
    setRecentlyAddedId(preset.id);
    setTimeout(() => {
      setRecentlyAddedId((prev) => (prev === preset.id ? null : prev));
    }, 1800);
  };

  const handleCustomQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuickTitle.trim()) return;

    if (onQuickAdd) {
      onQuickAdd({
        title: customQuickTitle.trim(),
        notes: 'Quick task created from Dashboard',
        category: 'General',
        priority: 'medium',
        dueTime: '18:00',
      });
    }
    soundEffects.playNotification();
    setCustomQuickTitle('');
  };

  const filteredTasks = tasks.filter((task) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchNotes = (task.notes || '').toLowerCase().includes(q);
      const matchLoc = (task.location?.name || '').toLowerCase().includes(q);
      const matchCat = task.category.toLowerCase().includes(q);
      if (!matchTitle && !matchNotes && !matchLoc && !matchCat) return false;
    }

    // Tab filter
    if (filter === 'completed') return task.isCompleted;
    if (task.isCompleted && filter !== 'all') return false;

    if (filter === 'today') {
      return task.dueDate === todayStr;
    }
    if (filter === 'upcoming') {
      return task.dueDate && task.dueDate > todayStr;
    }
    if (filter === 'geofenced') {
      return Boolean(task.location);
    }
    return true;
  });

  const handleToggle = (task: Task) => {
    if (!task.isCompleted) {
      soundEffects.playSuccess();
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#38bdf8', '#fbbf24'],
        });
      } catch {
        // Confetti fallback
      }
    }
    onToggleComplete(task.id);
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'urgent':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'high':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'medium':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'low':
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* 1-Tap Quick Add Row at the Top */}
      <div className="p-3.5 sm:p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Quick Add</span>
                <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                  1-Tap
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Instantly create pre-configured reminders for common tasks
              </p>
            </div>
          </div>
        </div>

        {/* Quick Add Preset Buttons (Horizontal Scrollable on mobile, Grid on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {QUICK_ADD_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isJustAdded = recentlyAddedId === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleQuickAddClick(preset)}
                className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  isJustAdded
                    ? 'bg-emerald-500/20 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/50'
                    : `${preset.bgClass} ${preset.borderClass}`
                }`}
                title={`One-tap create: ${preset.defaultTitle}`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div
                    className={`w-7 h-7 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-center ${
                      isJustAdded ? 'text-emerald-300' : preset.color
                    }`}
                  >
                    {isJustAdded ? (
                      <Check className="w-4 h-4 text-emerald-400 animate-in zoom-in-75 duration-200" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isJustAdded
                        ? 'bg-emerald-500 text-slate-950 font-extrabold'
                        : 'text-slate-400 bg-slate-950/60'
                    }`}
                  >
                    {isJustAdded ? 'Added!' : '+1 Tap'}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold text-white truncate">{preset.label}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {preset.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Natural Language Smart Input Bar */}
        <SmartInputBar onAddTask={(newTask) => onSaveTask && onSaveTask(newTask)} />
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div
          onClick={() => setFilter('today')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filter === 'today'
              ? 'bg-indigo-600/15 border-indigo-500/50 shadow-sm'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Today's Tasks</span>
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{todayCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Due before midnight</div>
        </div>

        <div
          onClick={() => setFilter('upcoming')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filter === 'upcoming'
              ? 'bg-indigo-600/15 border-indigo-500/50 shadow-sm'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Upcoming</span>
            <Clock className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{upcomingCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Exact alarms queued</div>
        </div>

        <div
          onClick={() => setFilter('geofenced')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filter === 'geofenced'
              ? 'bg-emerald-600/15 border-emerald-500/50 shadow-sm'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Geofenced</span>
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{geofencedCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Store arrival alerts</div>
        </div>

        <div
          onClick={() => setFilter('completed')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filter === 'completed'
              ? 'bg-emerald-600/15 border-emerald-500/50 shadow-sm'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Completed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{completedCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Archived locally</div>
        </div>
      </div>

      {/* Weekly Productivity Trends Visual Summary (Recharts) */}
      <WeeklyProductivityChart tasks={tasks} />

      {/* Search & Filter Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, grocery items, or locations..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Segmented Buttons */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl shrink-0">
            {[
              { id: 'all', label: 'All Tasks' },
              { id: 'today', label: `Today (${todayCount})` },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'geofenced', label: 'Geofenced' },
              { id: 'completed', label: 'Completed' },
            ].map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as typeof filter)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 shrink-0 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
            <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">No tasks found</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
              {searchQuery
                ? 'No reminders match your search term. Try a different query.'
                : 'Your task list is clear! Create a new task with date or supermarket location.'}
            </p>
            <button
              onClick={onOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-500"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.isCompleted;

            return (
              <div
                key={task.id}
                className={`group p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-900/40 border-slate-800/50 opacity-65'
                    : 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Completion Checkbox */}
                  <button
                    onClick={() => handleToggle(task)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                    title={isCompleted ? 'Mark pending' : 'Mark completed'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 hover:stroke-indigo-400" />
                    )}
                  </button>

                  {/* Main Task Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>

                      <span className="text-[11px] text-slate-400 font-medium">
                        {task.category}
                      </span>

                      {task.highPriorityDndBypass && (
                        <span
                          className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold"
                          title="Android CATEGORY_ALARM priority for DND handling"
                        >
                          <ShieldAlert className="w-3 h-3" />
                          <span>DND Alarm</span>
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-sm font-semibold tracking-tight ${
                        isCompleted ? 'text-slate-400 line-through' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </h4>

                    {task.notes && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {task.notes}
                      </p>
                    )}

                    {/* Meta info: dates & geofence */}
                    <div className="flex items-center gap-3 flex-wrap mt-2.5 text-[11px] text-slate-400">
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          <span>
                            {task.dueDate === todayStr ? 'Today' : task.dueDate}
                            {task.dueTime ? ` at ${task.dueTime}` : ''}
                          </span>
                        </div>
                      )}

                      {task.location && (
                        <div className="flex items-center gap-1 text-emerald-400 font-medium">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate max-w-[200px]">
                            {task.location.name} ({task.location.radius}m)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Dropdown / Quick Buttons */}
                  <div className="flex items-center gap-1 shrink-0 opacity-90 group-hover:opacity-100">
                    <button
                      onClick={() => onTriggerAlarmNow(task)}
                      className="p-1.5 text-slate-400 hover:text-amber-300 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Test ring exact alarm right now"
                    >
                      <BellRing className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditTask(task)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      title="Edit task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
