import { useState } from 'react';
import {
  Grid,
  ChevronDown,
  ChevronUp,
  Info,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import type { Habitation, PrioritisationResult, HazardUrgency, EvidenceQuality } from '../../types/habitation';

interface EvidenceSeverityMatrixProps {
  habitations: Habitation[];
  resultsMap: Map<string, PrioritisationResult>;
  selectedHabitation: Habitation;
  onSelectHabitation: (habitation: Habitation) => void;
}

export function EvidenceSeverityMatrix({
  habitations,
  resultsMap,
  selectedHabitation,
  onSelectHabitation,
}: EvidenceSeverityMatrixProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [inspectedHabitationId, setInspectedHabitationId] = useState<string | null>(null);

  const qualityColumns: { key: EvidenceQuality; label: string; description: string }[] = [
    {
      key: 'INSUFFICIENT',
      label: 'Insufficient',
      description: 'Critical baseline layer (hazard footprint, slope, or access) is absent or unverified.',
    },
    {
      key: 'PARTIAL',
      label: 'Partial',
      description: 'Critical baseline present; secondary geotechnical or field surveys pending.',
    },
    {
      key: 'COMPLETE',
      label: 'Complete',
      description: 'All 4 baseline domains verified with documented metadata and lineage.',
    },
    {
      key: 'CONFLICTING',
      label: 'Conflicting',
      description: 'Direct contradictions detected between independent observational reports.',
    },
  ];

  const urgencyRows: { key: HazardUrgency; label: string; badgeColor: string; description: string }[] = [
    {
      key: 'URGENT',
      label: 'Urgent Hazard',
      badgeColor: 'border-rose-500/80 text-rose-300 bg-rose-950/70',
      description: 'Direct observed debris flow inundation or severed lifeline access in hazardous terrain.',
    },
    {
      key: 'ELEVATED',
      label: 'Elevated Hazard',
      badgeColor: 'border-amber-500/80 text-amber-300 bg-amber-950/70',
      description: 'Modelled High susceptibility and steep slopes (>25°) outside primary debris channel.',
    },
    {
      key: 'ROUTINE',
      label: 'Routine Baseline',
      badgeColor: 'border-emerald-500/80 text-emerald-300 bg-emerald-950/70',
      description: 'Outside runout corridor, gentle terrain (<20°), normal access. (Does NOT guarantee safety).',
    },
  ];

  // Helper to get habitations in a specific cell
  const getHabitationsInCell = (urgency: HazardUrgency, quality: EvidenceQuality): Habitation[] => {
    return habitations.filter(h => {
      const res = resultsMap.get(h.id);
      if (!res) return false;
      return res.hazardUrgency === urgency && res.evidenceQuality === quality;
    });
  };

  // Undetermined habitations (treated as a distinct epistemically quarantined tier)
  const undeterminedHabitations = habitations.filter(h => {
    const res = resultsMap.get(h.id);
    return res?.hazardUrgency === 'UNDETERMINED';
  });

  const inspectedHabitation = habitations.find(h => h.id === (inspectedHabitationId || selectedHabitation.id)) || selectedHabitation;
  const inspectedResult = resultsMap.get(inspectedHabitation.id);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg shadow-xl overflow-hidden text-xs">
      {/* Header bar with toggle */}
      <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-rose-400" />
          <div className="flex items-center gap-2">
            <h3 className="font-mono font-bold uppercase tracking-wider text-slate-100 text-xs">
              Evidence Quality vs Hazard Severity Matrix
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              Orthogonal 2D Verification
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
            Zero composite scores • Epistemic confidence decoupled from physical urgency
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-[11px] font-mono transition-colors"
          >
            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Main 2D Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[620px]">
              <thead>
                <tr>
                  <th className="p-2.5 w-32 bg-slate-950/80 border border-slate-800 font-mono text-[10px] uppercase text-slate-400">
                    <div className="flex items-center gap-1">
                      <span>Y: Hazard &darr;</span>
                      <span className="text-slate-600">|</span>
                      <span>X: Quality &rarr;</span>
                    </div>
                  </th>
                  {qualityColumns.map(col => (
                    <th
                      key={col.key}
                      className="p-2 bg-slate-950/80 border border-slate-800 font-mono text-[11px] font-bold text-slate-300 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <span>{col.label}</span>
                        <span className="text-[9px] text-slate-500 font-normal mt-0.5 font-sans leading-tight">
                          {col.key === 'INSUFFICIENT' ? 'Baseline gap' : col.key === 'PARTIAL' ? 'Field unverified' : col.key === 'COMPLETE' ? '4/4 domains verified' : 'Contradicted'}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {urgencyRows.map(row => (
                  <tr key={row.key} className="hover:bg-slate-950/30 transition-colors">
                    {/* Row Header (Urgency) */}
                    <td className="p-2.5 bg-slate-950/60 border border-slate-800 align-top">
                      <span className={`inline-block px-1.5 py-0.5 rounded border text-[10px] font-mono font-bold ${row.badgeColor}`}>
                        {row.label}
                      </span>
                      <p className="text-[9px] text-slate-400 mt-1 font-sans leading-tight">
                        {row.key === 'URGENT' ? 'Debris hit or road cut' : row.key === 'ELEVATED' ? 'Slope >25° in high zone' : 'Gentle slope outside'}
                      </p>
                    </td>

                    {/* Columns (Evidence Quality) */}
                    {qualityColumns.map(col => {
                      const habsInCell = getHabitationsInCell(row.key, col.key);

                      // Strategic background tint based on the 4 focal quadrants
                      let cellBg = 'bg-slate-950/40';
                      let cellBorder = 'border-slate-800/80';
                      if (row.key === 'URGENT' && (col.key === 'COMPLETE' || col.key === 'PARTIAL')) {
                        cellBg = 'bg-rose-950/20'; // Strong evidence of serious hazard
                        cellBorder = 'border-rose-900/40';
                      } else if ((row.key === 'URGENT' || row.key === 'ELEVATED') && col.key === 'INSUFFICIENT') {
                        cellBg = 'bg-amber-950/20'; // Potentially serious with incomplete evidence
                        cellBorder = 'border-amber-900/40';
                      } else if (row.key === 'ROUTINE' && col.key === 'COMPLETE') {
                        cellBg = 'bg-emerald-950/20'; // Better-documented, lower indicated severity
                        cellBorder = 'border-emerald-900/40';
                      }

                      return (
                        <td
                          key={col.key}
                          className={`p-2 border ${cellBorder} ${cellBg} align-top min-h-[60px]`}
                        >
                          {habsInCell.length === 0 ? (
                            <span className="text-[10px] text-slate-600 font-mono italic block text-center py-2">
                              —
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {habsInCell.map(hab => {
                                const isSelected = hab.id === selectedHabitation.id;
                                const isInspected = hab.id === inspectedHabitation.id;

                                return (
                                  <button
                                    key={hab.id}
                                    onClick={() => {
                                      setInspectedHabitationId(hab.id);
                                      onSelectHabitation(hab);
                                    }}
                                    className={`px-2 py-1 rounded text-[11px] font-mono transition-all text-left flex items-center gap-1.5 ${
                                      isSelected
                                        ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-950 ring-1 ring-rose-400'
                                        : isInspected
                                        ? 'bg-slate-700 text-slate-100 font-medium ring-1 ring-slate-500'
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                                    }`}
                                    title={`Click to inspect ${hab.name} in details`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                      row.key === 'URGENT' ? 'bg-rose-400' : row.key === 'ELEVATED' ? 'bg-amber-400' : 'bg-emerald-400'
                                    }`} />
                                    <span>{hab.name.split('(')[0].trim()}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Epistemic Quarantine Tier: Undetermined Urgency Settlements */}
          <div className="p-3 rounded-lg bg-slate-950/90 border border-dashed border-amber-600/60 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="font-mono font-bold text-amber-300 text-xs">
                  Epistemic Quarantine Tier: Hazard Urgency UNDETERMINED
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-400/90">
                Rule: Insufficient evidence MUST NEVER equal Routine or Safe
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              Habitations in this zone cannot be placed on the physical hazard scale because optical satellite sensors were cloud-obscured or observational reports are contradictory. They require immediate ground reconnaissance to establish baseline certainty.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {undeterminedHabitations.map(hab => {
                const res = resultsMap.get(hab.id);
                const isSelected = hab.id === selectedHabitation.id;
                const isInspected = hab.id === inspectedHabitation.id;

                return (
                  <button
                    key={hab.id}
                    onClick={() => {
                      setInspectedHabitationId(hab.id);
                      onSelectHabitation(hab);
                    }}
                    className={`px-2.5 py-1.5 rounded text-[11px] font-mono transition-all text-left flex items-center gap-2 ${
                      isSelected
                        ? 'bg-rose-600 text-white font-bold shadow-md ring-1 ring-rose-400'
                        : isInspected
                        ? 'bg-slate-700 text-slate-100 font-medium ring-1 ring-slate-500'
                        : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>{hab.name}</span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-700">
                      Quality: {res?.evidenceQuality}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Habitation Axis Inspector Footnote */}
          {inspectedResult && (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-mono font-bold text-slate-200">
                    Matrix Position for {inspectedHabitation.name}:
                  </span>
                  <span className="font-mono text-rose-300 font-bold">
                    [Y: {inspectedResult.hazardUrgency}]
                  </span>
                  <span className="text-slate-600">×</span>
                  <span className="font-mono text-sky-300 font-bold">
                    [X: {inspectedResult.evidenceQuality}]
                  </span>
                </div>
                <p className="text-slate-400 leading-snug">
                  {inspectedResult.primaryReason}
                </p>
              </div>

              <div className="shrink-0 text-[10px] font-mono text-slate-400 bg-slate-900 p-2 rounded border border-slate-800 max-w-xs">
                <span className="text-amber-400 font-bold block mb-0.5 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" /> Governance Caveat:
                </span>
                <span>
                  ROUTINE placement indicates gentle terrain and intact roads outside the debris corridor; it does NOT certify absolute safety or structural immunity.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
