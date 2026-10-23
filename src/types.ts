export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface LocationGeofence {
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters (e.g., 100m, 250m, 500m)
  triggerOn: 'enter' | 'exit' | 'both';
  address?: string;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  priority: Priority;
  category: 'General' | 'Work' | 'Personal' | 'Groceries' | 'Health' | 'Errand';
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  reminderDateTime?: string; // ISO string
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  location?: LocationGeofence;
  highPriorityDndBypass?: boolean; // Requests DND alarm category
  isAlarmTriggered?: boolean;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  defaultGeofenceRadius: number; // in meters
  simulatedLatitude: number;
  simulatedLongitude: number;
  simulatedLocationName: string;
  theme: 'dark' | 'light' | 'system';
  dndAccessSimulatedGranted: boolean;
  dndModeActive: boolean;
  alarmTone: 'chime' | 'digital' | 'urgent_siren' | 'gentle';
  hasSeenOnboarding: boolean;
}

export interface PresetLocation {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
}
