import { X, ExternalLink, AlertTriangle, CheckSquare, TrendingUp, Layers } from 'lucide-react';
import type { Habitation, PrioritisationResult } from '../../types/habitation';
import { HazardUrgencyBadge, EvidenceQualityBadge, ProvenanceTypeBadge } from '../common/Badge';
import { generateInvestigationSuggestions } from '../../engine/investigationSuggestions';

interface HabitationDetailDrawerProps {
  habitation: Habitation;
  result: PrioritisationResult;
  onClose: () => void;
  onOpenEvidenceDossier: () => void;
}

export function HabitationDetailDrawer({
  habitation,
  result,
  onClose,
  onOpenEvidenceDossier,
}: HabitationDetailDrawerProps) {
  return (
    <div className="bg-slate-900/95 backdrop-blur border border-slate-700/80 rounded-lg shadow-2xl p-4 flex flex-col text-xs max-h-[550px] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-slate-100 font-mono tracking-tight">{habitation.name}</h2>
            {habitation.isIllustrativeRecord ? (
              <ProvenanceTypeBadge type="SYNTHETIC_RECORD" />
            ) : (
              <ProvenanceTypeBadge type="SOURCE_BACKED" />
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{habitation.localAdministrativeUnit}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
          title="Close drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Two-Dimension Assessment Banner */}
      <div className="my-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400">Physical Hazard Urgency</span>
          <HazardUrgencyBadge urgency={result.hazardUrgency} size="md" />
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
          <span className="text-[10px] font-mono uppercase text-slate-400">Epistemic Evidence Quality</span>
          <EvidenceQualityBadge quality={result.evidenceQuality} size="md" />
        </div>
      </div>

      {/* Core Decision Explanation */}
      <div className="mb-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
          Deterministic Decision Logic
        </span>
        <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-slate-200 text-xs leading-relaxed">
          {result.primaryReason}
        </div>
      </div>

      {/* Triggered Rule */}
      {result.applicableRules.length > 0 && (
        <div className="mb-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Triggered Rules
          </span>
          <div className="space-y-1">
            {result.applicableRules.map((rule, idx) => (
              <div key={idx} className="font-mono text-[11px] text-rose-300 bg-rose-950/40 px-2 py-1 rounded border border-rose-900/50">
                {rule}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Exposure Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="p-2 rounded bg-slate-950 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-mono">Elevation</div>
          <div className="text-xs font-bold font-mono text-slate-200 mt-0.5">{habitation.elevationMeters}m</div>
        </div>
        <div className="p-2 rounded bg-slate-950 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-mono">Buildings</div>
          <div className="text-xs font-bold font-mono text-slate-200 mt-0.5">{habitation.buildingCount}</div>
        </div>
        <div className="p-2 rounded bg-slate-950 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-mono">Est. Pop</div>
          <div className="text-xs font-bold font-mono text-slate-200 mt-0.5">~{habitation.estimatedPopulation}</div>
        </div>
      </div>

      {/* Alerts for Conflicting or Missing Data */}
      {result.conflictingEvidence.length > 0 && (
        <div className="mb-3 p-2.5 rounded bg-purple-950/50 border border-purple-700/60 text-purple-200">
          <div className="flex items-center gap-1.5 font-bold text-purple-300 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
            <span>Conflicting Evidence Detected</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {result.conflictingEvidence[0]}
          </p>
        </div>
      )}

      {result.missingEvidence.length > 0 && (
        <div className="mb-3 p-2.5 rounded bg-amber-950/40 border border-amber-700/60 text-amber-200">
          <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Critical Baseline Data Gap</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {result.missingEvidence[0]}
          </p>
        </div>
      )}

      {/* Decision-Impact Field Directive */}
      {(() => {
        const suggestions = generateInvestigationSuggestions(habitation, result);
        const topSuggestion = suggestions[0];
        if (!topSuggestion) return null;

        return (
          <div className="mb-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Top Field Directive (Rank #{topSuggestion.priorityRank})
              </span>
              {topSuggestion.canChangePriority === 'CAN_CHANGE_PRIORITY' ? (
                <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 font-mono text-[9px] font-bold border border-rose-800 flex items-center gap-1">
                  <TrendingUp className="w-2.5 h-2.5" />
                  <span>Can Shift Priority</span>
                </span>
              ) : topSuggestion.canChangePriority === 'CAN_CONFIRM_QUALITY_ONLY' ? (
                <span className="px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 font-mono text-[9px] border border-sky-800 flex items-center gap-1">
                  <Layers className="w-2.5 h-2.5" />
                  <span>Confirms Quality</span>
                </span>
              ) : null}
            </div>
            <div className="flex items-start gap-1.5 text-[11px] text-slate-200">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{topSuggestion.fieldCheck}</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {topSuggestion.potentialEffect}
            </p>
          </div>
        );
      })()}

      {/* Deep Link to Evidence Dossier */}
      <button
        onClick={onOpenEvidenceDossier}
        className="w-full mt-auto py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950 transition-colors"
      >
        <span>Open Deep Evidence Dossier & Sensitivity Workbench</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
