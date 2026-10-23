import React, { useState } from 'react';
import { Bell, MapPin, ShieldAlert, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestPermissions: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onRequestPermissions,
}) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      icon: Bell,
      iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      title: 'Precision Reminders that Never Fail',
      subtitle: 'Powered by Android AlarmManager',
      description:
        'Schedule tasks with exact alarms that wake your device even during Android Doze mode. Never miss critical hackathon deadlines, medications, or meetings.',
      bullets: [
        'Exact alarms with AlarmManager.setExactAndAllowWhileIdle',
        'Customizable alert tones and high-priority heads-up banners',
        'Offline-first local storage with Room database',
      ],
    },
    {
      icon: MapPin,
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      title: 'Smart Location-Based Geofences',
      subtitle: 'Automatic store & arrival triggers',
      description:
        'SmartAlert alerts you the moment you arrive near a supermarket, pharmacy, or office. Keep your grocery list ready without constantly checking your phone.',
      bullets: [
        'Google Play Services GeofencingClient background triggers',
        'Configurable proximity radius (50m - 500m)',
        'Built-in hackathon simulator to test geofences from any desk',
      ],
    },
    {
      icon: ShieldAlert,
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      title: 'Honest Do Not Disturb (DND) Handling',
      subtitle: 'No false promises. True Android compliance.',
      description:
        'Android protects user peace of mind. We clearly explain how DND works, why 3rd-party apps cannot silently bypass it, and how Notification Policy Access lets high-priority alarms sound through.',
      bullets: [
        'Explicit user permission via Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS',
        'NotificationCompat.CATEGORY_ALARM classification',
        'Clear, accessible permission requests only when you need them',
      ],
    },
  ];

  const current = slides[step];
  const IconComponent = current.icon;

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      onRequestPermissions();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300 font-medium transition-colors"
          >
            Skip Tour
          </button>
        </div>

        {/* Icon & Heading */}
        <div className="mb-6">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border mb-4 ${current.iconColor}`}
          >
            <IconComponent className="w-7 h-7" />
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            {current.subtitle}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {current.title}
          </h2>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Bullets */}
        <div className="space-y-2.5 mb-8">
          {current.bullets.map((b, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{b}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
          >
            <span>{step === slides.length - 1 ? 'Get Started' : 'Next'}</span>
            {step === slides.length - 1 ? (
              <Sparkles className="w-3.5 h-3.5" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
