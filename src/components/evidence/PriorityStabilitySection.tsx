import { ShieldCheck, Sliders, Info, AlertTriangle, Layers, TrendingDown } from 'lucide-react';
import type { Habitation } from '../../types/habitation';
import { evaluatePriorityStability } from '../../engine/sensitivityEngine';
import { HazardUrgencyBadge, EvidenceQualityBadge } from '../common/Badge';

interface PriorityStabilitySectionProps {
  habitation: Habitation;
}

export function PriorityStabilitySection({ habitation }: PriorityStabilitySectionProps) {
  const stabilityReport = evaluatePriorityStability(habitation);

  const getStabilityCategoryBadge = (category: typeof stabilityReport.stabilityCategory) => {
    switch (category) {
      case 'STABLE_TOP_PRIORITY':
        return (
          <span className="px-2.5 py-1 rounded bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-1.5 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-red-700" />
            <span>Stable Top-Priority Tier</span>
          </span>
        );
      case 'CONDITIONAL_ON_LIFELINE':
        return (
          <span className="px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5 shadow-xs">
            <TrendingDown className="w-3.5 h-3.5 text-amber-700" />
            <span>Conditional on Lifeline Access</span>
          </span>
        );
      case 'UNDETERMINED_PENDING_SURVEY':
        return (
          <span className="px-2.5 py-1 rounded bg-stone-100 border border-stone-300 text-stone-700 text-xs font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-stone-500" />
            <span>Undetermined Pending Survey</span>
          </span>
        );
      case 'STABLE_LOWER_SEVERITY':
      default:
        return (
          <span className="px-2.5 py-1 rounded bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            <span>Stable Lower Severity / Routine</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-xs text-xs p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#233f33]" />
          <h3 className="font-semibold text-stone-900 text-xs tracking-tight">
            Investigation Priority Stability Analysis
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {getStabilityCategoryBadge(stabilityReport.stabilityCategory)}
        </div>
      </div>

      {/* Stability Summary Callout */}
      <div className="p-3.5 rounded bg-stone-50 border border-stone-200 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-stone-500 text-xs">Baseline Urgency:</span>
            <HazardUrgencyBadge urgency={stabilityReport.baseUrgency} size="sm" />
            <span className="text-stone-300">|</span>
            <span className="text-stone-500 text-xs">Quality:</span>
            <EvidenceQualityBadge quality={stabilityReport.baseQuality} size="sm" />
          </div>

          <div className="text-xs font-semibold text-stone-800 bg-white px-2.5 py-1 rounded border border-stone-200">
            Remains Top-Priority: {stabilityReport.scenariosInTopPriorityGroup} of {stabilityReport.totalScenariosTested} Tested Scenarios
          </div>
        </div>

        <p className="text-stone-700 text-xs leading-relaxed pt-1">
          {stabilityReport.summaryExplanation}
        </p>
      </div>

      {/* Scenario Breakdown Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left min-w-[650px]">
          <thead>
            <tr className="bg-[#f4f2ee] border-b border-stone-200 text-[11px] font-medium text-stone-600">
              <th className="p-2.5 border border-stone-200">Scenario Name</th>
              <th className="p-2.5 border border-stone-200">Tested Parameter</th>
              <th className="p-2.5 border border-stone-200">Applied Assumption</th>
              <th className="p-2.5 border border-stone-200 text-center">Urgency</th>
              <th className="p-2.5 border border-stone-200 text-center">Quality</th>
              <th className="p-2.5 border border-stone-200">Driving Reason</th>
            </tr>
          </thead>
          <tbody>
            {stabilityReport.results.map((scen) => (
              <tr
                key={scen.scenarioId}
                className="hover:bg-stone-50 transition-colors border-b border-stone-200 text-xs"
              >
                <td className="p-2.5 border border-stone-200 font-medium text-stone-900">
                  <div className="flex flex-col gap-1 items-start">
                    <span>{scen.scenarioName}</span>
                    {scen.isExecutable ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                        Recalculated Pipeline
                      </span>
                    ) : (
                      <span
                        className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 cursor-help font-medium"
                        title={scen.statusNote}
                      >
                        Demonstration Approx
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-2.5 border border-stone-200 text-stone-600 text-[11px]">
                  {scen.testedParameter}
                </td>
                <td className="p-2.5 border border-stone-200 text-stone-700 text-xs leading-tight">
                  {scen.appliedAssumption}
                </td>
                <td className="p-2.5 border border-stone-200 text-center">
                  <HazardUrgencyBadge urgency={scen.resultingUrgency} size="sm" />
                </td>
                <td className="p-2.5 border border-stone-200 text-center">
                  <EvidenceQualityBadge quality={scen.resultingQuality} size="sm" />
                </td>
                <td className="p-2.5 border border-stone-200 text-stone-600 text-[11px] leading-tight">
                  {scen.drivingFactor}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mandatory Statistical Guardrail Disclaimer */}
      <div className="p-2.5 rounded bg-stone-50 border border-stone-200 text-[11px] text-stone-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-[#233f33] shrink-0 mt-0.5" />
        <span className="leading-relaxed">{stabilityReport.disclaimer}</span>
      </div>
    </div>
  );
}
