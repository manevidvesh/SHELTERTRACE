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
          <span className="px-2.5 py-1 rounded bg-rose-950/80 border border-rose-500 text-rose-300 font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>STABLE TOP-PRIORITY TIER</span>
          </span>
        );
      case 'CONDITIONAL_ON_LIFELINE':
        return (
          <span className="px-2.5 py-1 rounded bg-amber-950/80 border border-amber-500 text-amber-300 font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
            <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
            <span>CONDITIONAL ON LIFELINE ACCESS</span>
          </span>
        );
      case 'UNDETERMINED_PENDING_SURVEY':
        return (
          <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-600 text-zinc-300 font-mono text-[11px] font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" />
            <span>UNDETERMINED PENDING SURVEY</span>
          </span>
        );
      case 'STABLE_LOWER_SEVERITY':
      default:
        return (
          <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px] font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>STABLE LOWER SEVERITY / ROUTINE</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-lg border border-slate-800 overflow-hidden shadow-xl text-xs p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-rose-400" />
          <h3 className="font-mono font-bold uppercase tracking-wider text-slate-100 text-xs">
            Investigation Priority Stability Analysis
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {getStabilityCategoryBadge(stabilityReport.stabilityCategory)}
        </div>
      </div>

      {/* Stability Summary Callout */}
      <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-400 text-[11px]">Baseline Investigation Urgency:</span>
            <HazardUrgencyBadge urgency={stabilityReport.baseUrgency} size="sm" />
            <span className="text-slate-600">|</span>
            <span className="font-mono text-slate-400 text-[11px]">Quality:</span>
            <EvidenceQualityBadge quality={stabilityReport.baseQuality} size="sm" />
          </div>

          <div className="font-mono text-xs font-bold text-slate-200 bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
            Remains Top-Priority: {stabilityReport.scenariosInTopPriorityGroup} of {stabilityReport.totalScenariosTested} Tested Scenarios
          </div>
        </div>

        <p className="text-slate-300 text-xs leading-relaxed font-sans pt-1">
          {stabilityReport.summaryExplanation}
        </p>
      </div>

      {/* Scenario Breakdown Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left min-w-[650px]">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400">
              <th className="p-2.5 border border-slate-800">Scenario Name</th>
              <th className="p-2.5 border border-slate-800">Tested Parameter</th>
              <th className="p-2.5 border border-slate-800">Applied Assumption</th>
              <th className="p-2.5 border border-slate-800 text-center">Urgency</th>
              <th className="p-2.5 border border-slate-800 text-center">Quality</th>
              <th className="p-2.5 border border-slate-800">Driving Reason</th>
            </tr>
          </thead>
          <tbody>
            {stabilityReport.results.map((scen) => (
              <tr
                key={scen.scenarioId}
                className="hover:bg-slate-950/40 transition-colors border-b border-slate-800/80 text-[11px]"
              >
                <td className="p-2.5 border border-slate-800 font-mono font-bold text-slate-200">
                  <div className="flex flex-col gap-1 items-start">
                    <span>{scen.scenarioName}</span>
                    {scen.isExecutable ? (
                      <span className="text-[9px] font-mono font-normal px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                        RECALCULATED PIPELINE
                      </span>
                    ) : (
                      <span
                        className="text-[9px] font-mono font-normal px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-400 border border-amber-800/80 cursor-help"
                        title={scen.statusNote}
                      >
                        DEMONSTRATION APPROX
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-2.5 border border-slate-800 font-mono text-slate-400 text-[10px]">
                  {scen.testedParameter}
                </td>
                <td className="p-2.5 border border-slate-800 text-slate-300 font-sans text-[11px] leading-tight">
                  {scen.appliedAssumption}
                </td>
                <td className="p-2.5 border border-slate-800 text-center">
                  <HazardUrgencyBadge urgency={scen.resultingUrgency} size="sm" />
                </td>
                <td className="p-2.5 border border-slate-800 text-center">
                  <EvidenceQualityBadge quality={scen.resultingQuality} size="sm" />
                </td>
                <td className="p-2.5 border border-slate-800 text-slate-400 font-sans text-[10px] leading-tight">
                  {scen.drivingFactor}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mandatory Statistical Guardrail Disclaimer */}
      <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed">{stabilityReport.disclaimer}</span>
      </div>
    </div>
  );
}
