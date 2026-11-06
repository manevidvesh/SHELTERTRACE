import {
  CheckSquare,
  HelpCircle,
  TrendingUp,
  Layers,
} from 'lucide-react';
import type { Habitation, PrioritisationResult } from '../../types/habitation';
import {
  generateInvestigationSuggestions,
  type FieldInvestigationSuggestion,
} from '../../engine/investigationSuggestions';

interface FieldSuggestionsSectionProps {
  habitation: Habitation;
  result: PrioritisationResult;
}

export function FieldSuggestionsSection({ habitation, result }: FieldSuggestionsSectionProps) {
  const suggestions = generateInvestigationSuggestions(habitation, result);

  const getPriorityChangeBadge = (potential: FieldInvestigationSuggestion['canChangePriority']) => {
    switch (potential) {
      case 'CAN_CHANGE_PRIORITY':
        return (
          <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/70 text-rose-300 font-mono text-[10px] font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-rose-400" />
            <span>Can Change Priority: YES</span>
          </span>
        );
      case 'CAN_CONFIRM_QUALITY_ONLY':
        return (
          <span className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-500/70 text-sky-300 font-mono text-[10px] font-medium flex items-center gap-1">
            <Layers className="w-3 h-3 text-sky-400" />
            <span>Confirms Quality (Priority Locked)</span>
          </span>
        );
      case 'NO_CHANGE_EXPECTED':
        return (
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[10px]">
            <span>Routine Maintenance (No Priority Shift)</span>
          </span>
        );
      case 'UNKNOWN':
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px] flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-zinc-400" />
            <span>Potential Effect: UNKNOWN</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-lg border border-slate-800 overflow-hidden shadow-xl text-xs space-y-4 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          <h3 className="font-mono font-bold uppercase tracking-wider text-slate-100 text-xs">
            Decision-Impact-Based Field Investigation Directives ({suggestions.length})
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Ranked by potential to alter the habitation's investigation priority
        </span>
      </div>

      <div className="space-y-3">
        {suggestions.map((sug) => (
          <div
            key={sug.id}
            className={`p-3.5 rounded-lg border transition-all ${
              sug.impactLevel === 'CRITICAL_DECISION_MAKER'
                ? 'bg-rose-950/20 border-rose-900/60'
                : sug.impactLevel === 'EPISTEMIC_VERIFICATION'
                ? 'bg-sky-950/20 border-sky-900/60'
                : 'bg-slate-950/40 border-slate-800'
            }`}
          >
            {/* Top row: Rank, Check, and Priority Shift Badge */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
              <div className="flex items-start gap-2">
                <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                  sug.priorityRank === 1
                    ? 'bg-rose-900 text-rose-200 border border-rose-700'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  Rank #{sug.priorityRank}
                </span>
                <span className="font-bold text-slate-100 text-xs font-sans leading-snug">
                  {sug.fieldCheck}
                </span>
              </div>
              <div className="shrink-0">{getPriorityChangeBadge(sug.canChangePriority)}</div>
            </div>

            {/* Grid of structured reasoning */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2.5 pt-2.5 border-t border-slate-800/80 text-[11px]">
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold block">
                  Why Suggested:
                </span>
                <p className="text-slate-300 leading-relaxed font-sans">{sug.reason}</p>
                <div className="text-[10px] text-amber-300/90 font-mono pt-1">
                  <span className="text-slate-500">Related Missing Gap: </span>
                  <span>{sug.relatedMissingEvidence}</span>
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold block">
                  Potential Decision Impact:
                </span>
                <p className="text-slate-300 leading-relaxed font-sans">{sug.potentialEffect}</p>
                <div className="text-[10px] text-sky-300/90 font-mono pt-1">
                  <span className="text-slate-500">Dependent Finding: </span>
                  <span>{sug.dependentFinding}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
        <span>
          Governance Rule: Suggestions use inspectable deterministic logic without synthetic probabilities or speculative VOI percentages.
        </span>
        <span className="text-slate-500 hidden sm:inline">Statutory Authority: DDMA Wayanad</span>
      </div>
    </div>
  );
}
