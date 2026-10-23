import React, { useState } from 'react';
import { Smartphone, X, Copy, Check, ExternalLink, QrCode } from 'lucide-react';

interface PhoneQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const PhoneQrModal: React.FC<PhoneQrModalProps> = ({ isOpen, onClose, appUrl }) => {
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen) return null;

  // Generate SVG QR code via public quick API or standard SVG render
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    appUrl
  )}&bgcolor=0f172a&color=ffffff&qzone=1`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      // copy failed
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
          <QrCode className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-bold text-white">Scan & Test on Your Android Phone</h3>
          <p className="text-xs text-slate-400 mt-1">
            Open camera on any smartphone to run SmartAlert instantly without installation fees.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl inline-block shadow-inner">
          <img
            src={qrImageUrl}
            alt="Scan to open SmartAlert on phone"
            className="w-48 h-48 rounded-xl mx-auto shadow-md"
            loading="lazy"
          />
        </div>

        {/* URL Display & Copy */}
        <div className="space-y-2">
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2 text-left">
            <span className="text-[11px] font-mono text-slate-300 truncate max-w-[220px]">
              {appUrl}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              title="Copy URL"
            >
              {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
          >
            <span>Open in New Browser Window</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
