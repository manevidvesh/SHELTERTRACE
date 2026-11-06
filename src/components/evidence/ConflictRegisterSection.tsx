import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { Habitation } from '../../types/habitation';
import { EVIDENCE_CONFLICT_REGISTER } from '../../data/conflictRegister';

interface ConflictRegisterSectionProps {
  habitation: Habitation;
}

export function ConflictRegisterSection({ habitation }: ConflictRegisterSectionProps) {
  const habitationConflicts = EVIDENCE_CONFLICT_REGISTER.filter(c => c.habitationId === habitation.id);

  return (
    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-xs text-xs p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-700" />
          <h3 className="font-semibold text-stone-900 text-xs tracking-tight">
            Explicit Evidence Conflict Register ({habitationConflicts.length} recorded)
          </h3>
        </div>
        <span className="text-[11px] text-stone-500">
          Contradiction Preservation • Zero Silent Discarding
        </span>
      </div>

      {/* Methodological Guardrail */}
      <div className="p-3 rounded bg-[#f4f2ee] border border-stone-200 flex items-start gap-2.5 text-xs text-stone-700">
        <ShieldAlert className="w-4 h-4 text-[#233f33] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-stone-900">
            Anti-Averaging Evidence Safeguard:
          </span>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            When evidence sources disagree, the engine preserves both observations. Decision rules strictly prohibit averaging contradictory numbers, discarding older sources simply because newer ones exist, or picking the source that yields the lowest hazard. Conflicts remain explicit until resolved with documented justification.
          </p>
        </div>
      </div>

      {/* Conflicts List */}
      {habitationConflicts.length === 0 ? (
        <div className="p-6 text-center text-stone-500 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 mx-auto mb-1.5" />
          <span className="font-semibold text-stone-800 block text-xs">
            No Active Evidence Contradictions Recorded for {habitation.name}
          </span>
          <p className="text-[11px] text-stone-500">
            All supporting spatial and field reports are mutually consistent across observation domains.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {habitationConflicts.map((conf) => {
            const isResolved = conf.reviewStatus === 'RESOLVED_WITH_REASON';
            const isUnderReview = conf.reviewStatus === 'UNDER_REVIEW';

            return (
              <div
                key={conf.id}
                className={`p-4 rounded-lg border space-y-3 transition-colors ${
                  isResolved
                    ? 'bg-stone-50 border-stone-200'
                    : isUnderReview
                    ? 'bg-rose-50/40 border-rose-200'
                    : 'bg-white border-stone-200'
                }`}
              >
                {/* Conflict Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900 text-xs">
                      Conflict Record: {conf.id}
                    </span>
                    <span className="text-[11px] text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
                      Target: {conf.geographicCoverage}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                      isResolved
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : isUnderReview
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-stone-100 text-stone-700 border-stone-200'
                    }`}>
                      Status: {conf.reviewStatus}
                    </span>
                    {conf.affectsAssessment && (
                      <span className="px-2 py-0.5 rounded bg-red-50 text-red-800 font-medium text-[11px] border border-red-200">
                        Affects Assessment Urgency
                      </span>
                    )}
                  </div>
                </div>

                {/* Disagreeing Sources Side-by-Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded bg-white border border-stone-200 space-y-1">
                    <span className="text-[10px] text-stone-500 font-medium uppercase block">
                      Observational Source A:
                    </span>
                    <div className="text-red-900 text-xs font-semibold">
                      {conf.conflictingSources[0]}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Observed: {conf.observationDates[0]}
                    </div>
                  </div>

                  <div className="p-3 rounded bg-white border border-stone-200 space-y-1">
                    <span className="text-[10px] text-stone-500 font-medium uppercase block">
                      Observational Source B:
                    </span>
                    <div className="text-stone-900 text-xs font-semibold">
                      {conf.conflictingSources[1]}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Observed: {conf.observationDates[1]}
                    </div>
                  </div>
                </div>

                {/* Nature of Disagreement */}
                <div className="p-3 rounded bg-white border border-stone-200 text-xs space-y-1">
                  <span className="text-stone-500 text-[10px] uppercase font-medium block">
                    Nature of Disagreement:
                  </span>
                  <p className="text-stone-800 leading-relaxed">{conf.natureOfDisagreement}</p>
                </div>

                {/* Suggested Ground Verification */}
                <div className="p-3 rounded bg-white border border-stone-200 text-xs space-y-1">
                  <span className="text-emerald-800 text-[10px] uppercase font-medium block">
                    Required Ground Verification Directive:
                  </span>
                  <p className="text-stone-700 leading-relaxed">{conf.suggestedVerification}</p>
                </div>

                {/* Documented Resolution Reason */}
                {conf.resolutionReason && (
                  <div className="p-3 rounded bg-stone-50 border border-stone-200 text-xs space-y-1">
                    <span className="text-stone-500 text-[10px] uppercase font-medium block">
                      Resolution Rationale & Governance Record:
                    </span>
                    <p className="text-stone-800 leading-relaxed italic">{conf.resolutionReason}</p>
                    {conf.reviewedBy && (
                      <div className="text-[11px] text-stone-500 pt-1">
                        Reviewed by: <span className="text-stone-700 font-medium">{conf.reviewedBy}</span> on {conf.reviewedAt}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
