import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { Habitation } from '../../types/habitation';
import { EVIDENCE_CONFLICT_REGISTER } from '../../data/conflictRegister';

interface ConflictRegisterSectionProps {
  habitation: Habitation;
}

export function ConflictRegisterSection({ habitation }: ConflictRegisterSectionProps) {
  const habitationConflicts = EVIDENCE_CONFLICT_REGISTER.filter(c => c.habitationId === habitation.id);

  return (
    <div className="bg-slate-900/90 rounded-lg border border-slate-800 overflow-hidden shadow-xl text-xs p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-purple-400" />
          <h3 className="font-mono font-bold uppercase tracking-wider text-slate-100 text-xs">
            Explicit Evidence Conflict Register ({habitationConflicts.length} recorded)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Transparent Contradiction Preservation • Zero Silent Discarding
        </span>
      </div>

      {/* Mandatory Anti-Averaging Guardrail */}
      <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-800/60 flex items-start gap-2.5 text-[11px] text-purple-200">
        <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-mono font-bold text-purple-300">
            Anti-Averaging Evidence Safeguard:
          </span>
          <p className="leading-relaxed">
            When evidence sources disagree, the system preserves both individual observations. Decision rules strictly prohibit averaging contradictory numbers, discarding older sources simply because newer ones exist, or picking the source that yields the lowest hazard. Conflicts remain explicit until resolved with documented justification.
          </p>
        </div>
      </div>

      {/* Conflicts List */}
      {habitationConflicts.length === 0 ? (
        <div className="p-6 text-center text-slate-400 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <span className="font-mono font-bold text-slate-200 block text-xs">
            No Active Evidence Contradictions Recorded for {habitation.name}
          </span>
          <p className="text-[11px] text-slate-400">
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
                    ? 'bg-slate-950/80 border-slate-700'
                    : isUnderReview
                    ? 'bg-purple-950/30 border-purple-600/70'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                {/* Conflict Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-100 text-xs">
                      Conflict Record ID: {conf.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Target: {conf.geographicCoverage}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                      isResolved
                        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                        : isUnderReview
                        ? 'bg-purple-950 text-purple-300 border-purple-700'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                    }`}>
                      Status: {conf.reviewStatus}
                    </span>
                    {conf.affectsAssessment && (
                      <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-[10px] font-bold border border-rose-800">
                        Affects Assessment Urgency
                      </span>
                    )}
                  </div>
                </div>

                {/* Disagreeing Sources */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                      Observational Source A:
                    </span>
                    <div className="font-mono text-rose-300 text-[11px] font-bold">
                      {conf.conflictingSources[0]}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Date: {conf.observationDates[0]}
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                      Observational Source B:
                    </span>
                    <div className="font-mono text-sky-300 text-[11px] font-bold">
                      {conf.conflictingSources[1]}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Date: {conf.observationDates[1]}
                    </div>
                  </div>
                </div>

                {/* Nature of Disagreement */}
                <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800 text-[11px] space-y-1">
                  <span className="text-slate-400 font-mono text-[10px] uppercase font-bold block">
                    Nature of Disagreement:
                  </span>
                  <p className="text-slate-200 leading-relaxed font-sans">{conf.natureOfDisagreement}</p>
                </div>

                {/* Suggested Ground Verification */}
                <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800 text-[11px] space-y-1">
                  <span className="text-emerald-400 font-mono text-[10px] uppercase font-bold block">
                    Required Ground Verification Directive:
                  </span>
                  <p className="text-slate-300 leading-relaxed font-sans">{conf.suggestedVerification}</p>
                </div>

                {/* Documented Resolution Reason */}
                {conf.resolutionReason && (
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                    <span className="text-slate-400 font-mono text-[10px] uppercase font-bold block">
                      Resolution Rationale & Governance Record:
                    </span>
                    <p className="text-slate-300 leading-relaxed font-sans italic">{conf.resolutionReason}</p>
                    {conf.reviewedBy && (
                      <div className="text-[10px] font-mono text-slate-400 pt-1">
                        Reviewed by: <span className="text-slate-300 font-bold">{conf.reviewedBy}</span> on {conf.reviewedAt}
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
