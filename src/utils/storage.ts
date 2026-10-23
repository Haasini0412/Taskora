import { Task, AppSettings, PresetLocation } from '../types';

const TASKS_STORAGE_KEY = 'smartalert_tasks_v1';
const SETTINGS_STORAGE_KEY = 'smartalert_settings_v1';

export const PRESET_LOCATIONS: PresetLocation[] = [
  {
    id: 'loc_market',
    name: 'Whole Foods Market',
    category: 'Supermarket',
    latitude: 37.7749,
    longitude: -122.4194,
    address: '399 4th St, San Francisco, CA',
  },
  {
    id: 'loc_traderjoes',
    name: "Trader Joe's",
    category: 'Grocery Store',
    latitude: 37.7831,
    longitude: -122.4039,
    address: '555 9th St, San Francisco, CA',
  },
  {
    id: 'loc_pharmacy',
    name: 'CVS Pharmacy & Wellness',
    category: 'Pharmacy',
    latitude: 37.7879,
    longitude: -122.4075,
    address: '731 Market St, San Francisco, CA',
  },
  {
    id: 'loc_office',
    name: 'Tech Campus & Library',
    category: 'Work / Study',
    latitude: 37.7897,
    longitude: -122.4014,
    address: 'Mission Bay Blvd, San Francisco, CA',
  },
  {
    id: 'loc_home',
    name: 'Home Apartment',
    category: 'Home',
    latitude: 37.7699,
    longitude: -122.4467,
    address: 'Twin Peaks Terr, San Francisco, CA',
  },
];

export const INITIAL_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  defaultGeofenceRadius: 150,
  simulatedLatitude: 37.7749,
  simulatedLongitude: -122.4194,
  simulatedLocationName: 'Whole Foods Market (Entrance)',
  theme: 'dark',
  dndAccessSimulatedGranted: false,
  dndModeActive: false,
  alarmTone: 'digital',
  hasSeenOnboarding: false,
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task_1',
    title: 'Buy fresh almond milk & Greek yogurt',
    notes: 'Remember to pick up Greek yogurt and check for ripe avocados.',
    priority: 'high',
    category: 'Groceries',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '18:30',
    reminderDateTime: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    isCompleted: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    location: {
      name: 'Whole Foods Market',
      latitude: 37.7749,
      longitude: -122.4194,
      radius: 150,
      triggerOn: 'enter',
      address: '399 4th St, San Francisco, CA',
    },
    highPriorityDndBypass: true,
  },
  {
    id: 'task_2',
    title: 'Submit SmartAlert Hackathon Demo Video',
    notes: 'Upload the 2-minute video pitch and GitHub repository link before the deadline.',
    priority: 'urgent',
    category: 'Work',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '23:59',
    reminderDateTime: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
    isCompleted: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    highPriorityDndBypass: true,
  },
  {
    id: 'task_3',
    title: 'Pick up allergy prescription & eye drops',
    notes: 'Rx ready at CVS Pharmacy counter under order #4920.',
    priority: 'medium',
    category: 'Health',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    dueTime: '15:00',
    reminderDateTime: new Date(Date.now() + 86400000 + 15 * 3600000).toISOString(),
    isCompleted: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    location: {
      name: 'CVS Pharmacy & Wellness',
      latitude: 37.7879,
      longitude: -122.4075,
      radius: 200,
      triggerOn: 'enter',
      address: '731 Market St, San Francisco, CA',
    },
    highPriorityDndBypass: false,
  },
  {
    id: 'task_4',
    title: 'Review Jetpack Compose Room migration',
    notes: 'Double check SQLite indices and TypeConverters for Geofence coordinates.',
    priority: 'low',
    category: 'Work',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    dueTime: '10:00',
    isCompleted: true,
    completedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    highPriorityDndBypass: false,
  },
];

export function getStoredTasks(): Task[] {
  if (typeof window === 'undefined') return INITIAL_TASKS;
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load tasks from localStorage', e);
    return INITIAL_TASKS;
  }
}

export function saveStoredTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage', e);
  }
}

export function getStoredSettings(): AppSettings {
  if (typeof window === 'undefined') return INITIAL_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings', e);
    return INITIAL_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

// Calculate distance in meters using Haversine formula
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}
