import { AlertTriangle, Clock, HelpCircle, CheckCircle2, FileCheck2 } from 'lucide-react';
import type { PrioritisationResult, HazardUrgency, EvidenceQuality } from '../../types/habitation';

export type SummaryFilter = 'ALL' | HazardUrgency | EvidenceQuality;

interface AssessmentSummaryProps {
  results: PrioritisationResult[];
  activeFilter: SummaryFilter;
  onFilterChange: (filter: SummaryFilter) => void;
}

export function AssessmentSummary({ results, activeFilter, onFilterChange }: AssessmentSummaryProps) {
  const total = results.length;

  // Hazard Urgency Counts (Sum === total)
  const urgentCount = results.filter(r => r.hazardUrgency === 'URGENT').length;
  const elevatedCount = results.filter(r => r.hazardUrgency === 'ELEVATED').length;
  const routineCount = results.filter(r => r.hazardUrgency === 'ROUTINE').length;
  const undeterminedCount = results.filter(r => r.hazardUrgency === 'UNDETERMINED').length;

  // Evidence Quality Counts (Sum === total)
  const completeCount = results.filter(r => r.evidenceQuality === 'COMPLETE').length;
  const partialCount = results.filter(r => r.evidenceQuality === 'PARTIAL').length;
  const insufficientCount = results.filter(r => r.evidenceQuality === 'INSUFFICIENT').length;
  const conflictingCount = results.filter(r => r.evidenceQuality === 'CONFLICTING').length;

  return (
    <div className="space-y-2 mb-4">
      {/* Top Bar: Total Assessed and Urgency Dimension */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
              Dimension 1: Physical Hazard Urgency
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              (Sum = {urgentCount + elevatedCount + undeterminedCount + routineCount} of {total} settlements)
            </span>
          </div>
          {activeFilter !== 'ALL' && (
            <button
              onClick={() => onFilterChange('ALL')}
              className="text-[10px] font-mono text-sky-400 hover:text-sky-300 underline"
            >
              Reset to Show All ({total})
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {/* Total Assessed */}
          <button
            onClick={() => onFilterChange('ALL')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              activeFilter === 'ALL'
                ? 'bg-slate-800/90 border-slate-400 shadow-md ring-1 ring-slate-300/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-0.5">
              <span className="text-[10px] font-medium uppercase font-mono">Total Assessed</span>
              <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-lg font-bold font-mono text-slate-100">{total}</div>
            <div className="text-[10px] text-slate-400">All habitations</div>
          </button>

          {/* Urgent Hazard */}
          <button
            onClick={() => onFilterChange('URGENT')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              activeFilter === 'URGENT'
                ? 'bg-rose-950/80 border-rose-500 shadow-md ring-1 ring-rose-400/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-rose-900/40'
            }`}
          >
            <div className="flex items-center justify-between text-rose-400 mb-0.5">
              <span className="text-[10px] font-medium uppercase font-mono">Urgent</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-lg font-bold font-mono text-rose-300">{urgentCount}</div>
            <div className="text-[10px] text-rose-400/80">Direct impact / isolated</div>
          </button>

          {/* Elevated Hazard */}
          <button
            onClick={() => onFilterChange('ELEVATED')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              activeFilter === 'ELEVATED'
                ? 'bg-amber-950/80 border-amber-500 shadow-md ring-1 ring-amber-400/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-amber-900/40'
            }`}
          >
            <div className="flex items-center justify-between text-amber-400 mb-0.5">
              <span className="text-[10px] font-medium uppercase font-mono">Elevated</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-bold font-mono text-amber-300">{elevatedCount}</div>
            <div className="text-[10px] text-amber-400/80">Steep slope susceptibility</div>
          </button>

          {/* Undetermined Hazard */}
          <button
            onClick={() => onFilterChange('UNDETERMINED')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              activeFilter === 'UNDETERMINED'
                ? 'bg-slate-800 border-slate-400 shadow-md ring-1 ring-slate-300/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-0.5">
              <span className="text-[10px] font-medium uppercase font-mono">Undetermined</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-lg font-bold font-mono text-slate-200">{undeterminedCount}</div>
            <div className="text-[10px] text-slate-400">Baseline gap / conflict</div>
          </button>

          {/* Routine Baseline */}
          <button
            onClick={() => onFilterChange('ROUTINE')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              activeFilter === 'ROUTINE'
                ? 'bg-emerald-950/80 border-emerald-500 shadow-md ring-1 ring-emerald-400/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-emerald-900/40'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-400 mb-0.5">
              <span className="text-[10px] font-medium uppercase font-mono">Routine</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-bold font-mono text-emerald-300">{routineCount}</div>
            <div className="text-[10px] text-emerald-400/80">Gentle slope / verified</div>
          </button>
        </div>
      </div>

      {/* Bottom Bar: Evidence Quality Dimension */}
      <div className="pt-1.5 border-t border-slate-800/80">
        <div className="flex items-center gap-2 mb-1.5 px-0.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Dimension 2: Epistemic Evidence Quality
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            (Sum = {completeCount + partialCount + insufficientCount + conflictingCount} of {total} settlements)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Complete */}
          <button
            onClick={() => onFilterChange('COMPLETE')}
            className={`p-2 rounded-lg border text-left transition-all ${
              activeFilter === 'COMPLETE'
                ? 'bg-emerald-950/80 border-emerald-500 ring-1 ring-emerald-400/40'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-400 mb-0.5">
              <span className="text-[10px] font-mono uppercase">Complete Quality</span>
              <span className="text-sm font-bold font-mono">{completeCount}</span>
            </div>
            <div className="text-[10px] text-slate-400">All critical baseline present</div>
          </button>

          {/* Partial */}
          <button
            onClick={() => onFilterChange('PARTIAL')}
            className={`p-2 rounded-lg border text-left transition-all ${
              activeFilter === 'PARTIAL'
                ? 'bg-amber-950/80 border-amber-500 ring-1 ring-amber-400/40'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-amber-400 mb-0.5">
              <span className="text-[10px] font-mono uppercase">Partial Quality</span>
              <span className="text-sm font-bold font-mono">{partialCount}</span>
            </div>
            <div className="text-[10px] text-slate-400">Baseline ok; field audit pending</div>
          </button>

          {/* Insufficient */}
          <button
            onClick={() => onFilterChange('INSUFFICIENT')}
            className={`p-2 rounded-lg border text-left transition-all ${
              activeFilter === 'INSUFFICIENT'
                ? 'bg-zinc-800 border-zinc-400 ring-1 ring-zinc-300/40'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-zinc-300 mb-0.5">
              <span className="text-[10px] font-mono uppercase">Insufficient Data</span>
              <span className="text-sm font-bold font-mono">{insufficientCount}</span>
            </div>
            <div className="text-[10px] text-slate-400">Critical baseline data missing</div>
          </button>

          {/* Conflicting */}
          <button
            onClick={() => onFilterChange('CONFLICTING')}
            className={`p-2 rounded-lg border text-left transition-all ${
              activeFilter === 'CONFLICTING'
                ? 'bg-purple-950/80 border-purple-500 ring-1 ring-purple-400/40'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-purple-400 mb-0.5">
              <span className="text-[10px] font-mono uppercase">Conflicting Data</span>
              <span className="text-sm font-bold font-mono">{conflictingCount}</span>
            </div>
            <div className="text-[10px] text-slate-400">Contradiction in primary layer</div>
          </button>
        </div>
      </div>
    </div>
  );
}
