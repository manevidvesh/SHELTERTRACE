import { X, ArrowRight, AlertTriangle, HelpCircle } from 'lucide-react';
import type { Habitation, PrioritisationResult } from '../../types/habitation';
import { HazardUrgencyBadge, EvidenceQualityBadge, ProvenanceTypeBadge } from '../common/Badge';

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
    <div className="bg-white border border-stone-200 rounded-lg shadow-lg p-4 flex flex-col text-xs max-h-[540px] overflow-y-auto space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between pb-2.5 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <h2 className="text-sm font-semibold text-stone-900 tracking-tight">{habitation.name}</h2>
            {habitation.isIllustrativeRecord && (
              <ProvenanceTypeBadge type="SYNTHETIC_RECORD" />
            )}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">{habitation.localAdministrativeUnit}</p>
        </div>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-600 p-1 rounded hover:bg-stone-100 transition-colors cursor-pointer"
          title="Close drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Two-Dimension Evaluation Summary */}
      <div className="p-2.5 rounded bg-stone-50 border border-stone-200 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-stone-500">Physical Hazard Urgency</span>
          <HazardUrgencyBadge urgency={result.hazardUrgency} size="sm" />
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
          <span className="text-[11px] text-stone-500">Epistemic Evidence Quality</span>
          <EvidenceQualityBadge quality={result.evidenceQuality} size="sm" />
        </div>
      </div>

      {/* Primary Decision Logic */}
      <div>
        <span className="text-[11px] font-medium text-stone-700 block mb-1">
          Decision Reasoning
        </span>
        <div className="p-2.5 rounded bg-[#f4f2ee] border border-stone-200/80 text-stone-800 text-xs leading-relaxed">
          {result.primaryReason}
        </div>
      </div>

      {/* Critical Warnings (Missing or Conflicting Data) */}
      {result.conflictingEvidence.length > 0 && (
        <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-900 text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-rose-800">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
            <span>Conflicting Evidence Detected</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-rose-800/90 pl-1">
            {result.conflictingEvidence.map((conflict, idx) => (
              <li key={idx} className="line-clamp-2">{conflict}</li>
            ))}
          </ul>
        </div>
      )}

      {result.missingEvidence.length > 0 && result.hazardUrgency === 'UNDETERMINED' && (
        <div className="p-2.5 rounded bg-stone-100 border border-stone-300 text-stone-800 text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-stone-700">
            <HelpCircle className="w-3.5 h-3.5 text-stone-600" />
            <span>Missing Critical Baseline Layers</span>
          </div>
          <p className="text-stone-600 leading-snug">
            Site is quarantined as Undetermined. Cannot declare routine safety without baseline ground observation.
          </p>
        </div>
      )}

      {/* Primary Call-to-Action to Inspect Dossier */}
      <div className="pt-2">
        <button
          onClick={onOpenEvidenceDossier}
          className="w-full py-2 px-3 rounded bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <span>Inspect Evidence Dossier</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
