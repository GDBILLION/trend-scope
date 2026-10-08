import React from 'react';
import { Download, Sliders, Activity, Sparkles } from 'lucide-react';
import { ProviderStatus } from '../types/index.js';

interface HeaderProps {
  providerStatus: ProviderStatus | null;
  onOpenSettings: () => void;
  onOpenMethodology: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  providerStatus,
  onOpenSettings,
  onOpenMethodology,
}) => {
  const handleDownloadZip = () => {
    window.location.href = '/api/export-zip';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-lg font-bold tracking-tight text-white hover:text-indigo-400 transition-colors flex items-center gap-2"
          >
            <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <Activity className="w-4 h-4" />
            </span>
            <span>TrendScope</span>
          </a>
          <span className="hidden sm:inline-block text-xs font-mono text-slate-500 border-l border-slate-800 pl-3">
            Google Trends Intelligence
          </span>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-slate-100 transition-colors cursor-pointer"
          >
            Discovery Engine
          </button>
          <button
            onClick={onOpenMethodology}
            className="hover:text-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Verification Pipeline</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="hover:text-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            <span>API Credentials</span>
          </button>
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSettings}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Configure SerpApi & Groq API credentials"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button
            onClick={handleDownloadZip}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm shadow-indigo-600/30 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            title="Download complete standalone TrendScope MVP project as a ZIP file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .zip</span>
          </button>
        </div>
      </div>
    </header>
  );
};
