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
    <div className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5 shadow-xs text-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
            <Sliders className="w-4 h-4 text-[#233f33]" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-stone-900 tracking-tight">
              Uncertainty & Sensitivity Workbench
            </h3>
            <p className="text-[11px] text-stone-500">
              Inspect how decision stability behaves under alternative operational assumptions.
            </p>
          </div>
        </div>

        {/* Global Stability Status Pill */}
        {evaluation.assumption.isExecutableInMVP ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-500">Decision Stability:</span>
            {evaluation.isStable ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Stable Decision</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium text-xs">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>Sensitive to Assumption</span>
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-[11px] text-stone-600">
            <AlertTriangle className="w-3.5 h-3.5 text-stone-500" />
            <span>Disabled in MVP v1.0</span>
          </div>
        )}
      </div>

      {/* Assumption Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 my-2">
        {DOCUMENTED_SENSITIVITY_ASSUMPTIONS.map(assumption => {
          const isSelected = selectedAssumptionId === assumption.id;
          const isExecutable = assumption.isExecutableInMVP;

          return (
            <button
              key={assumption.id}
              onClick={() => setSelectedAssumptionId(assumption.id)}
              className={`p-3 rounded-md border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-stone-100 border-stone-400 shadow-xs ring-1 ring-stone-400'
                  : 'bg-white border-stone-200 hover:bg-stone-50'
              } ${!isExecutable ? 'opacity-85' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-stone-500 uppercase font-medium">
                  {assumption.affectedEvidenceDomain.split('/')[0]}
                </span>
                {isExecutable ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 border border-stone-200">
                    Disabled
                  </span>
                )}
              </div>
              <div className="font-semibold text-xs text-stone-900 line-clamp-1">
                {assumption.name}
              </div>
              <div className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-tight">
                {assumption.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Scenario Evaluation Dossier */}
      <div className="bg-stone-50 rounded-lg border border-stone-200 p-4 space-y-3">
        {/* Scenario Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-3 border-b border-stone-200 text-xs">
          <div>
            <span className="text-stone-500 text-[10px] uppercase font-medium block">
              Tested Parameter
            </span>
            <span className="text-stone-800 font-medium">
              {evaluation.assumption.testedParameter}
            </span>
          </div>
          <div>
            <span className="text-stone-500 text-[10px] uppercase font-medium block">
              Documented Physical Range
            </span>
            <span className="text-stone-800 font-mono text-[11px]">
              {evaluation.assumption.documentedRange}
            </span>
          </div>
          <div>
            <span className="text-stone-500 text-[10px] uppercase font-medium block">
              Driving Evidence Layer
            </span>
            <span className="text-stone-800 font-medium">
              {evaluation.drivingEvidence}
            </span>
          </div>
        </div>

        {/* Transition Comparison (When Executable) */}
        {evaluation.assumption.isExecutableInMVP ? (
          <div className="p-3 rounded bg-white border border-stone-200 space-y-2">
            <span className="text-[11px] font-medium text-stone-700 block">
              Decision Transition Under Hypothetical Assumption
            </span>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              {/* Baseline */}
              <div className="space-y-1">
                <span className="text-[10px] text-stone-500 block">Baseline Application State:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <HazardUrgencyBadge urgency={evaluation.originalUrgency} size="sm" />
                  <EvidenceQualityBadge quality={evaluation.originalQuality} size="sm" />
                </div>
                <p className="text-[11px] text-stone-600 mt-1">
                  "{evaluation.assumption.currentAssumption}"
                </p>
              </div>

              {/* Transition Arrow */}
              <div className="flex items-center gap-2 text-stone-400 py-1 sm:py-0">
                <ArrowRight className="w-5 h-5 text-stone-500" />
              </div>

              {/* Modified */}
              <div className="space-y-1">
                <span className="text-[10px] text-stone-500 block">Tested Scenario Output:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <HazardUrgencyBadge urgency={evaluation.modifiedUrgency} size="sm" />
                  <EvidenceQualityBadge quality={evaluation.modifiedQuality} size="sm" />
                </div>
                <p className="text-[11px] text-stone-800 font-medium mt-1">
                  "{evaluation.assumption.alternativeAssumption}"
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded bg-amber-50/70 border border-amber-200/80 text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-amber-950">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>Scenario Status Notice</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-800">
              {evaluation.assumption.statusNotice}
            </p>
          </div>
        )}

        {/* Technical Decision Engine Explanation */}
        <div className="rounded p-3 bg-white border border-stone-200">
          <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-stone-800">
            <RefreshCw className="w-3.5 h-3.5 text-[#233f33]" />
            <span>Audit & Stability Explanation</span>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed">
            {evaluation.explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
