import React, { useState, useMemo } from 'react';
import { Sparkles, Calendar, Clock, MapPin, ShieldAlert, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Task, Priority } from '../types';
import { PRESET_LOCATIONS } from '../utils/storage';

interface SmartInputBarProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

export const SmartInputBar: React.FC<SmartInputBarProps> = ({ onAddTask }) => {
  const [input, setInput] = useState('');

  // Parse natural language from current text
  const parsed = useMemo(() => {
    const text = input.trim();
    if (!text) return null;

    const lower = text.toLowerCase();

    // Priority
    let priority: Priority = 'medium';
    let highPriorityDnd = false;
    if (lower.includes('!urgent') || lower.includes('#urgent') || lower.includes('urgent')) {
      priority = 'urgent';
      highPriorityDnd = true;
    } else if (lower.includes('!high') || lower.includes('#high') || lower.includes('high priority')) {
      priority = 'high';
      highPriorityDnd = true;
    } else if (lower.includes('!low') || lower.includes('#low')) {
      priority = 'low';
    }

    // Category
    let category: Task['category'] = 'General';
    if (lower.match(/\b(grocery|groceries|milk|bread|produce|supermarket|eggs|vegetable|fruit|cereal)\b/)) {
      category = 'Groceries';
    } else if (lower.match(/\b(meeting|sync|standup|call|pitch|hackathon|demo|code|pr|sprint)\b/)) {
      category = 'Work';
    } else if (lower.match(/\b(study|read|exam|assignment|course|lecture|homework|notes)\b/)) {
      category = 'Work';
    } else if (lower.match(/\b(doctor|medicine|rx|prescription|pill|gym|workout|health|vitamins)\b/)) {
      category = 'Health';
    } else if (lower.match(/\b(package|mail|post office|dry clean|errand|repair)\b/)) {
      category = 'Errand';
    }

    // Location preset
    let locationPreset: typeof PRESET_LOCATIONS[0] | undefined = undefined;
    if (lower.includes('whole foods')) {
      locationPreset = PRESET_LOCATIONS.find((p) => p.id === 'loc_market');
    } else if (lower.includes('trader joe') || lower.includes("trader joe's")) {
      locationPreset = PRESET_LOCATIONS.find((p) => p.id === 'loc_traderjoes');
    } else if (lower.includes('cvs') || lower.includes('pharmacy')) {
      locationPreset = PRESET_LOCATIONS.find((p) => p.id === 'loc_pharmacy');
    } else if (lower.includes('office') || lower.includes('campus') || lower.includes('library')) {
      locationPreset = PRESET_LOCATIONS.find((p) => p.id === 'loc_office');
    } else if (lower.includes('home')) {
      locationPreset = PRESET_LOCATIONS.find((p) => p.id === 'loc_home');
    }

    // Date & Time detection
    const now = new Date();
    let targetDate = new Date(now);
    let detectedTimeStr = '18:00';
    let hasExplicitDate = false;

    if (lower.includes('tomorrow')) {
      targetDate.setDate(targetDate.getDate() + 1);
      hasExplicitDate = true;
    } else if (lower.includes('tonight')) {
      detectedTimeStr = '20:00';
      hasExplicitDate = true;
    }

    // Detect "at X pm" or "at X:XX"
    const timeMatch = lower.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const meridiem = timeMatch[3];

      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;

      detectedTimeStr = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`;
      hasExplicitDate = true;
    }

    // Detect "in X hours"
    const inHoursMatch = lower.match(/\bin\s+(\d+)\s*(?:hour|hours|hr|hrs)\b/);
    if (inHoursMatch) {
      const addedHours = parseInt(inHoursMatch[1], 10);
      const future = new Date(now.getTime() + addedHours * 3600000);
      detectedTimeStr = `${future.getHours().toString().padStart(2, '0')}:${future
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      targetDate = future;
      hasExplicitDate = true;
    }

    const dueDateStr = targetDate.toISOString().split('T')[0];
    const reminderIso = new Date(`${dueDateStr}T${detectedTimeStr}`).toISOString();

    // Cleaned Title
    let cleanedTitle = text
      .replace(/!(urgent|high|low)/gi, '')
      .replace(/#(urgent|high|low|work|groceries)/gi, '')
      .replace(/\bat\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?/gi, '')
      .replace(/\bin\s+\d+\s*(?:hour|hours|hr|hrs)/gi, '')
      .replace(/\b(tomorrow|tonight|today)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanedTitle) cleanedTitle = text;

    return {
      title: cleanedTitle,
      category,
      priority,
      highPriorityDnd,
      dueDate: dueDateStr,
      dueTime: detectedTimeStr,
      reminderDateTime: reminderIso,
      location: locationPreset,
      hasExplicitDate,
    };
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed || !parsed.title) return;

    onAddTask({
      title: parsed.title,
      notes: `Created via Smart Natural Language Bar ("${input}")`,
      category: parsed.category,
      priority: parsed.priority,
      dueDate: parsed.dueDate,
      dueTime: parsed.dueTime,
      reminderDateTime: parsed.reminderDateTime,
      isCompleted: false,
      highPriorityDndBypass: parsed.highPriorityDnd,
      location: parsed.location
        ? {
            name: parsed.location.name,
            latitude: parsed.location.latitude,
            longitude: parsed.location.longitude,
            radius: 150,
            triggerOn: 'enter',
            address: parsed.location.address,
          }
        : undefined,
    });

    setInput('');
  };

  return (
    <div className="p-3 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 rounded-2xl space-y-2 shadow-sm">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Try: "Buy milk at Whole Foods tomorrow at 6pm !urgent" or "Team standup in 2 hours"'
          className="flex-1 bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={!input.trim()}
          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer"
        >
          <span>Add</span>
          <CornerDownLeft className="w-3 h-3" />
        </button>
      </form>

      {/* Real-Time Detection Pill Strip */}
      {parsed && input.trim().length > 3 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/60 text-[10px] animate-in fade-in duration-150">
          <span className="text-slate-500 font-semibold">Detected:</span>

          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
            Category: <strong className="text-white">{parsed.category}</strong>
          </span>

          <span
            className={`px-2 py-0.5 rounded-md font-bold uppercase ${
              parsed.priority === 'urgent'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : parsed.priority === 'high'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {parsed.priority}
          </span>

          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-500/30 text-indigo-300">
            <Clock className="w-3 h-3" />
            <span>
              {parsed.dueDate} at {parsed.dueTime}
            </span>
          </span>

          {parsed.location && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
              <MapPin className="w-3 h-3" />
              <span>{parsed.location.name} (150m)</span>
            </span>
          )}

          {parsed.highPriorityDnd && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/30 text-amber-300 font-semibold">
              <ShieldAlert className="w-3 h-3" />
              <span>DND Alarm</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
