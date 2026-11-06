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
          <span className="px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-800 text-[11px] font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-red-700" />
            <span>Can Change Priority Tier</span>
          </span>
        );
      case 'CAN_CONFIRM_QUALITY_ONLY':
        return (
          <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-medium flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-sky-700" />
            <span>Confirms Quality (Priority Constant)</span>
          </span>
        );
      case 'NO_CHANGE_EXPECTED':
        return (
          <span className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-600 text-[11px]">
            <span>Routine Check (No Priority Shift)</span>
          </span>
        );
      case 'UNKNOWN':
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-600 text-[11px] flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
            <span>Potential Effect: Unspecified</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-xs text-xs space-y-4 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-[#233f33]" />
          <h3 className="font-semibold text-stone-900 text-xs tracking-tight">
            Decision-Impact Field Directives ({suggestions.length})
          </h3>
        </div>
        <span className="text-[11px] text-stone-500">
          Ranked by potential to alter the habitation's investigation priority
        </span>
      </div>

      <div className="space-y-3">
        {suggestions.map((sug) => (
          <div
            key={sug.id}
            className={`p-3.5 rounded-lg border transition-all ${
              sug.impactLevel === 'CRITICAL_DECISION_MAKER'
                ? 'bg-red-50/40 border-red-200'
                : sug.impactLevel === 'EPISTEMIC_VERIFICATION'
                ? 'bg-sky-50/40 border-sky-200'
                : 'bg-stone-50 border-stone-200'
            }`}
          >
            {/* Top row: Rank, Check, and Priority Shift Badge */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
              <div className="flex items-start gap-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  sug.priorityRank === 1
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-200 text-stone-700'
                }`}>
                  Rank #{sug.priorityRank}
                </span>
                <span className="font-semibold text-stone-900 text-xs leading-snug">
                  {sug.fieldCheck}
                </span>
              </div>
              <div className="shrink-0">{getPriorityChangeBadge(sug.canChangePriority)}</div>
            </div>

            {/* Grid of structured reasoning */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2.5 pt-2.5 border-t border-stone-200/80 text-xs">
              <div className="p-2.5 rounded bg-white border border-stone-200 space-y-1">
                <span className="text-stone-500 text-[10px] uppercase font-medium block">
                  Why Suggested:
                </span>
                <p className="text-stone-800 leading-relaxed">{sug.reason}</p>
                <div className="text-[11px] text-stone-500 pt-1">
                  <span>Related Missing Gap: </span>
                  <span className="font-medium text-stone-700">{sug.relatedMissingEvidence}</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-white border border-stone-200 space-y-1">
                <span className="text-stone-500 text-[10px] uppercase font-medium block">
                  Potential Decision Impact:
                </span>
                <p className="text-stone-800 leading-relaxed">{sug.potentialEffect}</p>
                <div className="text-[11px] text-stone-500 pt-1">
                  <span>Dependent Finding: </span>
                  <span className="font-medium text-stone-700">{sug.dependentFinding}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2.5 rounded bg-stone-50 border border-stone-200 text-[11px] text-stone-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <span>
          Governance Rule: Directives use deterministic impact logic without synthetic probability scores.
        </span>
        <span className="text-stone-400">Statutory Authority: DDMA Wayanad</span>
      </div>
    </div>
  );
}
