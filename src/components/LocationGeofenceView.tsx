import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Store,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Task, LocationGeofence } from '../types';
import { PRESET_LOCATIONS, calculateDistanceMeters } from '../utils/storage';
import { soundEffects } from '../utils/audio';

interface LocationGeofenceViewProps {
  tasks: Task[];
  simulatedLat: number;
  simulatedLon: number;
  simulatedLocationName: string;
  onUpdateSimulatedLocation: (lat: number, lon: number, name: string) => void;
  onOpenCreate: () => void;
  onTriggerGeofenceArrival: (task: Task) => void;
}

export const LocationGeofenceView: React.FC<LocationGeofenceViewProps> = ({
  tasks,
  simulatedLat,
  simulatedLon,
  simulatedLocationName,
  onUpdateSimulatedLocation,
  onOpenCreate,
  onTriggerGeofenceArrival,
}) => {
  const [usingRealGps, setUsingRealGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Filter tasks with locations
  const geofencedTasks = tasks.filter((t) => Boolean(t.location));

  // Switch to real GPS
  const handleRequestRealGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUsingRealGps(true);
        onUpdateSimulatedLocation(
          position.coords.latitude,
          position.coords.longitude,
          'Your Real GPS Location'
        );
      },
      (err) => {
        setGpsError(`Location access denied: ${err.message}. You can use the simulated GPS presets.`);
        setUsingRealGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Teleport simulator to a preset
  const handleTeleport = (preset: typeof PRESET_LOCATIONS[0]) => {
    setUsingRealGps(false);
    setGpsError(null);
    onUpdateSimulatedLocation(preset.latitude, preset.longitude, preset.name);

    // Check if any task is within radius of this new location and trigger alert
    const triggered = geofencedTasks.filter((t) => {
      if (!t.location || t.isCompleted) return false;
      const dist = calculateDistanceMeters(
        preset.latitude,
        preset.longitude,
        t.location.latitude,
        t.location.longitude
      );
      return dist <= t.location.radius;
    });

    if (triggered.length > 0) {
      soundEffects.playGeofenceEnter();
      triggered.forEach((task) => onTriggerGeofenceArrival(task));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Geofence Explanation */}
      <div className="p-4 sm:p-5 bg-emerald-950/20 border border-emerald-800/40 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Proximity & Supermarket Geofences</span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Play Services API
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              In Android, <code className="text-emerald-300 font-mono">GeofencingClient</code> monitors virtual perimeters around physical locations using low-power cell tower & Wi-Fi triangulation. When you arrive, the background receiver triggers your reminder automatically.
            </p>
          </div>
        </div>
      </div>

      {/* GPS / Location Simulator Controller (Crucial for Hackathon Judge Demo!) */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Hackathon Live Demo: Location Simulator
            </h4>
          </div>
          <button
            onClick={handleRequestRealGps}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              usingRealGps
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{usingRealGps ? 'Using Real GPS' : 'Try Real GPS'}</span>
          </button>
        </div>

        {gpsError && (
          <div className="p-2.5 bg-rose-950/30 border border-rose-800/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{gpsError}</span>
          </div>
        )}

        {/* Current Coordinates Banner */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">
              Simulated Current Position
            </div>
            <div className="text-xs font-bold text-white mt-0.5">{simulatedLocationName}</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              Lat: {simulatedLat.toFixed(4)}, Lon: {simulatedLon.toFixed(4)}
            </div>
          </div>
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
        </div>

        {/* Quick Teleport Presets */}
        <div>
          <span className="block text-[11px] font-semibold text-slate-400 mb-2">
            1-Click Teleport (Simulate Walking to Store in front of judges):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESET_LOCATIONS.map((preset) => {
              const isCurrent =
                simulatedLocationName === preset.name ||
                (Math.abs(simulatedLat - preset.latitude) < 0.001 &&
                  Math.abs(simulatedLon - preset.longitude) < 0.001);

              return (
                <button
                  key={preset.id}
                  onClick={() => handleTeleport(preset)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isCurrent
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{preset.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{preset.category}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Visual Proximity Radar (Real-Time Geofence Breacher) */}
        <div className="pt-3 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Proximity Radar & Distance Breacher</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Google GeofencingClient Simulator
            </span>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* SVG Circular Radar Screen */}
            <div className="relative w-44 h-44 rounded-full bg-slate-900 border-2 border-emerald-500/30 overflow-hidden flex items-center justify-center shadow-inner">
              {/* Concentric rings */}
              <div className="absolute w-36 h-36 rounded-full border border-emerald-500/20" />
              <div className="absolute w-24 h-24 rounded-full border border-emerald-500/30 border-dashed" />
              <div className="absolute w-12 h-12 rounded-full border border-emerald-500/40" />
              {/* Crosshairs */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-[1px] bg-emerald-500/20" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-full w-[1px] bg-emerald-500/20" />
              </div>

              {/* Rotating Sweep Beam */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-500/10 to-transparent animate-spin duration-3000 pointer-events-none" />

              {/* Center Store Icon */}
              <div className="relative z-10 w-8 h-8 rounded-full bg-emerald-600/40 border border-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <Store className="w-4 h-4" />
              </div>

              {/* User Position Beacon */}
              <div
                className="absolute z-20 transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${50 + (calculateDistanceMeters(simulatedLat, simulatedLon, 37.7749, -122.4194) > 150 ? 25 : 5)}%`,
                  top: `${50 - (calculateDistanceMeters(simulatedLat, simulatedLon, 37.7749, -122.4194) > 150 ? 22 : 4)}%`,
                }}
              >
                <div className="w-4 h-4 rounded-full bg-indigo-500 border-2 border-white animate-pulse shadow-lg shadow-indigo-500/50" />
              </div>
            </div>

            {/* Radar Controls & Distance Meter */}
            <div className="flex-1 w-full space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Distance to Supermarket:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {calculateDistanceMeters(simulatedLat, simulatedLon, 37.7749, -122.4194)} meters
                </span>
              </div>

              {/* Visual Distance Slider */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>0m (Inside Store Door)</span>
                  <span className="text-emerald-400 font-semibold">150m (Trigger Boundary)</span>
                  <span>500m (Far Away)</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={10}
                  value={Math.min(500, calculateDistanceMeters(simulatedLat, simulatedLon, 37.7749, -122.4194))}
                  onChange={(e) => {
                    const dist = Number(e.target.value);
                    // Adjust simulated latitude offset relative to Whole Foods (37.7749)
                    // 1 deg lat ~= 111,000 meters
                    const latOffset = (dist / 111000);
                    onUpdateSimulatedLocation(
                      37.7749 + latOffset,
                      -122.4194,
                      dist <= 150 ? 'Whole Foods Market (Inside Zone)' : `Walking near 4th St (${dist}m away)`
                    );

                    if (dist <= 150) {
                      soundEffects.playGeofenceEnter();
                    }
                  }}
                  className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-400">Status:</span>
                <span
                  className={`font-bold ${
                    calculateDistanceMeters(simulatedLat, simulatedLon, 37.7749, -122.4194) <= 150
                      ? 'text-emerald-400 animate-pulse'
                      : 'text-amber-400'
                  }`}
                >
                  {calculateDistanceMeters(simulatedLat, simulatedLon, 37.7749, -122.4194) <= 150
                    ? '🎯 TARGET REACHED — ALARM TRIGGERED!'
                    : 'OUTSIDE GEOFENCE (MONITORING CELL TOWERS)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Geofenced Tasks List with Live Proximity Radar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Geofence Tasks ({geofencedTasks.length})
          </h4>
          <button
            onClick={onOpenCreate}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            + Add Store Reminder
          </button>
        </div>

        {geofencedTasks.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
            <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">No location-based reminders set yet.</p>
            <button
              onClick={onOpenCreate}
              className="mt-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
            >
              Add Supermarket Reminder
            </button>
          </div>
        ) : (
          geofencedTasks.map((task) => {
            const loc = task.location as LocationGeofence;
            const distance = calculateDistanceMeters(
              simulatedLat,
              simulatedLon,
              loc.latitude,
              loc.longitude
            );
            const isInside = distance <= loc.radius;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isInside
                    ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isInside
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isInside ? 'TARGET REACHED (IN ZONE)' : `${distance}m AWAY`}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{task.category}</span>
                    </div>

                    <h5 className="text-sm font-bold text-white tracking-tight">{task.title}</h5>

                    {task.notes && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{task.notes}</p>
                    )}

                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-semibold">{loc.name}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">Trigger radius: {loc.radius}m</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => {
                        soundEffects.playGeofenceEnter();
                        onTriggerGeofenceArrival(task);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all shrink-0"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Simulate Trigger</span>
                    </button>
                    {isInside && (
                      <span className="text-[10px] text-emerald-400 font-semibold animate-pulse">
                        Auto-alert triggered
                      </span>
                    )}
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
