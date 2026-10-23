import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FileCode,
  FolderTree,
  ExternalLink,
  Code2,
  Terminal,
  Sparkles
} from 'lucide-react';
import { ANDROID_PROJECT_FILES, downloadAndroidProjectZip, AndroidFile } from '../utils/androidProjectFiles';

interface AndroidCodeExporterViewProps {
  onShowToast: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const AndroidCodeExporterView: React.FC<AndroidCodeExporterViewProps> = ({
  onShowToast,
}) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    'app/src/main/java/com/smartalert/app/MainActivity.kt'
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const selectedFile =
    ANDROID_PROJECT_FILES.find((f) => f.path === selectedFilePath) || ANDROID_PROJECT_FILES[0];

  const filteredFiles = ANDROID_PROJECT_FILES.filter((f) => {
    if (categoryFilter === 'all') return true;
    return f.category === categoryFilter;
  });

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(selectedFile.content);
      setHasCopied(true);
      onShowToast(`Copied ${selectedFile.filename} to clipboard!`, 'success');
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      onShowToast('Could not copy to clipboard', 'error');
    }
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      onShowToast('Generating complete Android Studio project zip...', 'info');
      const blob = await downloadAndroidProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SmartAlert-Android-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsDownloading(false);
      onShowToast('SmartAlert-Android-Project.zip downloaded successfully!', 'success');
    } catch (e) {
      console.error(e);
      setIsDownloading(false);
      onShowToast('Failed to build project zip archive', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner with Download Button */}
      <div className="p-5 bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Complete Ready-to-Run Project</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Native Kotlin & Jetpack Compose Source Code
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            100% production-ready project structure with Room database, AlarmManager, Google Play Geofencing, and DND handling. Ready to open directly in Android Studio.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <a
            href="/SmartAlert-Complete-Project.zip"
            download="SmartAlert-Complete-Project.zip"
            onClick={() => onShowToast('Downloading SmartAlert-Complete-Project.zip (Full Codebase)...', 'success')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer no-underline"
            title="Download full project repository (Web App + Android Studio project + configs)"
          >
            <Download className="w-4 h-4" />
            <span>Complete Project (.zip)</span>
          </a>

          <a
            href="/SmartAlert-Android-Project.zip"
            download="SmartAlert-Android-Project.zip"
            onClick={() => onShowToast('Downloading SmartAlert-Android-Project.zip (Native Android)...', 'success')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer no-underline"
            title="Download pure native Android Studio project (Kotlin + Jetpack Compose)"
          >
            <Download className="w-4 h-4" />
            <span>Android Studio (.zip)</span>
          </a>
        </div>
      </div>

      {/* Code Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* File Tree Sidebar */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <FolderTree className="w-4 h-4 text-indigo-400" />
              <span>Project Files</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {ANDROID_PROJECT_FILES.length} files
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'ui', label: 'Compose UI' },
              { id: 'data', label: 'Room DB' },
              { id: 'notifications', label: 'Channels/DND' },
              { id: 'geofence', label: 'Geofence' },
              { id: 'reminders', label: 'Alarms' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2 py-1 text-[10px] font-semibold rounded-lg shrink-0 transition-colors ${
                  categoryFilter === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* File list */}
          <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
            {filteredFiles.map((file) => {
              const isSelected = file.path === selectedFilePath;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                      : 'hover:bg-slate-950 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <FileCode
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isSelected ? 'text-indigo-400' : 'text-slate-500'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate text-slate-200">
                      {file.filename}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{file.path}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Content Viewer */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          {/* File Tab Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-mono font-bold text-white truncate">
                {selectedFile.path}
              </span>
              <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 shrink-0">
                {selectedFile.language}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/60 text-[11px] text-slate-400">
            {selectedFile.description}
          </div>

          {/* Code Viewer body */}
          <div className="p-4 overflow-x-auto max-h-[500px] overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-200 bg-slate-950 selection:bg-indigo-500/40 selection:text-white">
            <pre className="whitespace-pre">{selectedFile.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
