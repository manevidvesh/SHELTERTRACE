import { useState } from 'react';
import { Sliders, ShieldCheck, AlertCircle, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';
import type { Habitation } from '../../types/habitation';
import { DOCUMENTED_SENSITIVITY_ASSUMPTIONS, evaluateSensitivity } from '../../engine/sensitivityEngine';
import { HazardUrgencyBadge, EvidenceQualityBadge } from '../common/Badge';

interface SensitivityWorkbenchProps {
  habitation: Habitation;
}

export function SensitivityWorkbench({ habitation }: SensitivityWorkbenchProps) {
  const [selectedAssumptionId, setSelectedAssumptionId] = useState<string>(
    DOCUMENTED_SENSITIVITY_ASSUMPTIONS[0].id
  );

  const evaluation = evaluateSensitivity(habitation, selectedAssumptionId);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 sm:p-5 shadow-xl text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-mono">
              Uncertainty & Sensitivity Workbench
            </h3>
            <p className="text-[11px] text-slate-400">
              Inspect how decision stability behaves under alternative operational assumptions.
            </p>
          </div>
        </div>

        {/* Global Stability Status Pill */}
        {evaluation.assumption.isExecutableInMVP ? (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-slate-400">Decision Stability:</span>
            {evaluation.isStable ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 font-mono font-bold text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                STABLE DECISION
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/80 text-rose-300 border border-rose-500/60 font-mono font-bold text-xs animate-pulse">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                SENSITIVE TO ASSUMPTION
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-[10px] font-mono text-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Disabled in MVP v1.0</span>
          </div>
        )}
      </div>

      {/* Assumption Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 my-4">
        {DOCUMENTED_SENSITIVITY_ASSUMPTIONS.map(assumption => {
          const isSelected = selectedAssumptionId === assumption.id;
          const isExecutable = assumption.isExecutableInMVP;

          return (
            <button
              key={assumption.id}
              onClick={() => setSelectedAssumptionId(assumption.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'bg-slate-800/90 border-sky-500 shadow-md ring-1 ring-sky-400/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              } ${!isExecutable ? 'opacity-80' : ''}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  {assumption.affectedEvidenceDomain.split('/')[0]}
                </span>
                {isExecutable ? (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    ACTIVE
                  </span>
                ) : (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                    DISABLED
                  </span>
                )}
              </div>
              <div className="font-semibold text-xs text-slate-200 line-clamp-1">
                {assumption.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                {assumption.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Scenario Evaluation Dossier */}
      <div className="bg-slate-950/90 rounded-lg border border-slate-800 p-4 space-y-4">
        {/* Scenario Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-3 border-b border-slate-800 text-[11px]">
          <div>
            <span className="text-slate-400 font-mono text-[10px] uppercase block">
              Tested Parameter
            </span>
            <span className="text-slate-200 font-medium">
              {evaluation.assumption.testedParameter}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-mono text-[10px] uppercase block">
              Documented Physical Range
            </span>
            <span className="text-slate-200 font-mono">
              {evaluation.assumption.documentedRange}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-mono text-[10px] uppercase block">
              Driving Evidence Layer
            </span>
            <span className="text-sky-300 font-mono">
              {evaluation.drivingEvidence}
            </span>
          </div>
        </div>

        {/* Transition Comparison (When Executable) */}
        {evaluation.assumption.isExecutableInMVP ? (
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2">
              Decision Transition Under Hypothetical Assumption
            </span>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              {/* Baseline */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block">Baseline Application State:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <HazardUrgencyBadge urgency={evaluation.originalUrgency} size="sm" />
                  <EvidenceQualityBadge quality={evaluation.originalQuality} size="sm" />
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  "{evaluation.assumption.currentAssumption}"
                </p>
              </div>

              {/* Transition Arrow */}
              <div className="flex items-center gap-2 text-slate-500 py-1 sm:py-0">
                <ArrowRight className={`w-5 h-5 ${evaluation.isStable ? 'text-slate-500' : 'text-rose-400 animate-pulse'}`} />
              </div>

              {/* Modified */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block">Tested Scenario Output:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <HazardUrgencyBadge urgency={evaluation.modifiedUrgency} size="sm" />
                  <EvidenceQualityBadge quality={evaluation.modifiedQuality} size="sm" />
                </div>
                <p className="text-[10px] text-sky-400 font-mono mt-1">
                  "{evaluation.assumption.alternativeAssumption}"
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Scenario Status Notice</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">
              {evaluation.assumption.statusNotice}
            </p>
          </div>
        )}

        {/* Technical Decision Engine Explanation */}
        <div className="rounded-lg p-3 bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px] font-bold text-slate-300">
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            <span>Audit & Stability Explanation</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {evaluation.explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
