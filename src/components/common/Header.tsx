import { useState } from 'react';
import { Compass, FileText, Database, Info, X, ShieldCheck, Layers } from 'lucide-react';
import type { Habitation } from '../../types/habitation';

interface HeaderProps {
  activeTab: 'assessment' | 'evidence' | 'methodology' | 'spatial';
  setActiveTab: (tab: 'assessment' | 'evidence' | 'methodology' | 'spatial') => void;
  selectedHabitation: Habitation | null;
  onReturnToLanding?: () => void;
}

export function Header({ activeTab, setActiveTab, selectedHabitation, onReturnToLanding }: HeaderProps) {
  const [showLegalNotice, setShowLegalNotice] = useState(false);

  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-50">
      {/* Context & Governance Sub-Bar */}
      <div className="bg-[#f4f2ee] px-4 sm:px-6 py-1.5 border-b border-stone-200/80 flex items-center justify-between text-xs text-stone-600">
        <div className="flex items-center gap-2">
          {onReturnToLanding && (
            <button
              onClick={onReturnToLanding}
              className="text-[11px] text-stone-500 hover:text-stone-900 font-medium underline underline-offset-2 mr-1 cursor-pointer"
            >
              &larr; Overview
            </button>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-white text-stone-700 border border-stone-200 text-[11px] font-medium">
            Wayanad Case Study (July 2024 Event)
          </span>
          <span className="hidden sm:inline text-stone-500 text-[11px]">
            Meppadi Grama Panchayat • 9 Assessed Settlements
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLegalNotice(true)}
            className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-800 underline underline-offset-2 transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-stone-400" />
            <span>Statutory Authority Notice</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={onReturnToLanding}
          className={`flex items-center gap-3 ${onReturnToLanding ? 'cursor-pointer group' : ''}`}
          title={onReturnToLanding ? 'Return to demonstration overview' : undefined}
        >
          <div className="h-8 w-8 rounded bg-[#233f33] text-white flex items-center justify-center font-bold text-sm tracking-wide shadow-xs group-hover:bg-[#1a3027] transition-colors">
            ST
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-stone-900 tracking-tight group-hover:text-[#233f33] transition-colors">
                SHELTERTRACE
              </span>
              <span className="text-[11px] px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded border border-stone-200">
                Investigation Workspace
              </span>
            </div>
            <p className="text-[11px] text-stone-500 hidden md:block">
              Evidence-Driven Habitation Safety & Resettlement Prioritisation
            </p>
          </div>
        </div>

        {/* Selected Habitation Breadcrumb */}
        {selectedHabitation && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-stone-50 rounded border border-stone-200 text-xs">
            <span className="text-stone-400">Inspecting:</span>
            <span className="text-stone-900 font-medium">{selectedHabitation.name}</span>
            <button
              onClick={() => setActiveTab('evidence')}
              className="ml-1 text-[11px] text-stone-600 hover:text-stone-900 font-medium underline underline-offset-2 cursor-pointer"
            >
              View Dossier &rarr;
            </button>
          </div>
        )}

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('assessment')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'assessment'
                ? 'bg-stone-100 text-stone-900 border border-stone-300 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-stone-500" />
            <span>Assessment</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'evidence'
                ? 'bg-stone-100 text-stone-900 border border-stone-300 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-stone-500" />
            <span>Evidence Dossier</span>
          </button>

          <button
            onClick={() => setActiveTab('spatial')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'spatial'
                ? 'bg-stone-100 text-stone-900 border border-stone-300 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            <span>Spatial Intelligence</span>
          </button>

          <button
            onClick={() => setActiveTab('methodology')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'methodology'
                ? 'bg-stone-100 text-stone-900 border border-stone-300 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-stone-500" />
            <span>Methodology</span>
          </button>
        </nav>
      </div>

      {/* Statutory Governance Modal */}
      {showLegalNotice && (
        <div className="fixed inset-0 z-[2000] bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#233f33]" />
                <h3 className="font-semibold text-stone-900 text-sm">
                  Statutory Decision & Ethical Governance Notice
                </h3>
              </div>
              <button
                onClick={() => setShowLegalNotice(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
              <p>
                <strong>Operational Reconnaissance Only:</strong> SHELTERTRACE is an analytical decision-support tool created to prioritize rapid on-ground field reconnaissance and identify critical data gaps after a landslide disaster.
              </p>
              <p>
                <strong>No Autonomous Orders:</strong> The software does not issue evacuation mandates, resettlement orders, or formal structural condemnations. All decisions of statutory consequence are reserved exclusively for designated constitutional authorities (e.g. District Disaster Management Authority).
              </p>
              <p>
                <strong>Illustrative Geometries:</strong> Spatial runout envelopes and susceptibility boundaries displayed in this MVP are illustrative vector approximations digitized from public situational reports, intended for interface demonstration rather than engineering slope construction.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowLegalNotice(false)}
                className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
