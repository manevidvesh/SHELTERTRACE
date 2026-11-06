import { ShieldAlert, Compass, FileText, Database, Info } from 'lucide-react';
import type { Habitation } from '../../types/habitation';

interface HeaderProps {
  activeTab: 'assessment' | 'evidence' | 'methodology';
  setActiveTab: (tab: 'assessment' | 'evidence' | 'methodology') => void;
  selectedHabitation: Habitation | null;
}

export function Header({ activeTab, setActiveTab, selectedHabitation }: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      {/* Top Banner: Authenticity & Disclaimer */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 font-mono text-[10px] font-bold tracking-wider">
            CASE STUDY CONTEXT (SYNTHESIZED VECTORS)
          </span>
          <span className="hidden sm:inline text-slate-300">
            30 July 2024 Wayanad Disaster Case Study • Approximated Geometries from NRSC & GSI Overviews
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-300 font-medium hidden md:inline">
            Field Prioritisation Support — Human Authority Final Decision Mandated
          </span>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-950/50">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold font-mono tracking-wider text-slate-100">SHELTERTRACE</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded border border-slate-700">
                MVP v1.1
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Evidence-Driven Habitation Safety & Resettlement Prioritisation
            </p>
          </div>
        </div>

        {/* Selected Habitation Quick Indicator */}
        {selectedHabitation && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-800/80 rounded-md border border-slate-700 text-xs">
            <span className="text-slate-400">Selected Habitation:</span>
            <span className="text-rose-300 font-mono font-semibold">{selectedHabitation.name}</span>
            <button
              onClick={() => setActiveTab('evidence')}
              className="ml-2 text-xs text-sky-400 hover:text-sky-300 underline underline-offset-2 flex items-center gap-1"
            >
              Inspect Evidence &rarr;
            </button>
          </div>
        )}

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab('assessment')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'assessment'
                ? 'bg-rose-950/70 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Assessment</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'evidence'
                ? 'bg-rose-950/70 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Evidence Dossier</span>
            {selectedHabitation && (
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('methodology')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'methodology'
                ? 'bg-rose-950/70 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Methodology</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
