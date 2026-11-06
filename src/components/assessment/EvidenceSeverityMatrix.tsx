import { useState } from 'react';
import {
  Grid,
  Info,
  AlertTriangle,
} from 'lucide-react';
import type { Habitation, PrioritisationResult, HazardUrgency, EvidenceQuality } from '../../types/habitation';

interface EvidenceSeverityMatrixProps {
  habitations: Habitation[];
  resultsMap: Map<string, PrioritisationResult>;
  selectedHabitation: Habitation;
  onSelectHabitation: (habitation: Habitation) => void;
  onClose?: () => void;
}

export function EvidenceSeverityMatrix({
  habitations,
  resultsMap,
  selectedHabitation,
  onSelectHabitation,
}: EvidenceSeverityMatrixProps) {
  const [inspectedHabitationId, setInspectedHabitationId] = useState<string | null>(null);

  const qualityColumns: { key: EvidenceQuality; label: string; description: string }[] = [
    {
      key: 'INSUFFICIENT',
      label: 'Insufficient',
      description: 'Critical baseline layer (hazard, slope, or access) absent.',
    },
    {
      key: 'PARTIAL',
      label: 'Partial',
      description: 'Critical baseline present; secondary surveys pending.',
    },
    {
      key: 'COMPLETE',
      label: 'Complete',
      description: 'All baseline domains verified with documented metadata.',
    },
    {
      key: 'CONFLICTING',
      label: 'Conflicting',
      description: 'Contradictions detected between independent reports.',
    },
  ];

  const urgencyRows: { key: HazardUrgency; label: string; dotColor: string; description: string }[] = [
    {
      key: 'URGENT',
      label: 'Urgent Hazard',
      dotColor: 'bg-red-600',
      description: 'Direct observed debris flow inundation or severed lifeline road/bridge access.',
    },
    {
      key: 'ELEVATED',
      label: 'Elevated Hazard',
      dotColor: 'bg-amber-600',
      description: 'Modelled High susceptibility and steep slopes (>25°) outside active channel.',
    },
    {
      key: 'ROUTINE',
      label: 'Routine Baseline',
      dotColor: 'bg-emerald-600',
      description: 'Outside runout corridor, gentle terrain (<20°), intact access.',
    },
  ];

  const getHabitationsInCell = (urgency: HazardUrgency, quality: EvidenceQuality): Habitation[] => {
    return habitations.filter(h => {
      const res = resultsMap.get(h.id);
      if (!res) return false;
      return res.hazardUrgency === urgency && res.evidenceQuality === quality;
    });
  };

  const undeterminedHabitations = habitations.filter(h => {
    const res = resultsMap.get(h.id);
    return res?.hazardUrgency === 'UNDETERMINED';
  });

  const inspectedHabitation = habitations.find(h => h.id === (inspectedHabitationId || selectedHabitation.id)) || selectedHabitation;
  const inspectedResult = resultsMap.get(inspectedHabitation.id);

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-2">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-[#233f33]" />
          <div>
            <h3 className="text-xs font-semibold text-stone-900 tracking-tight">
              Evidence vs Hazard Contingency Matrix (2D)
            </h3>
            <p className="text-[11px] text-stone-500">
              Evaluates physical hazard severity orthogonally against epistemic data completeness.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-stone-500">
          <span className="w-2 h-2 rounded-full bg-red-600" />
          <span>Urgent</span>
          <span className="w-2 h-2 rounded-full bg-amber-600 ml-1" />
          <span>Elevated</span>
          <span className="w-2 h-2 rounded-full bg-emerald-600 ml-1" />
          <span>Routine</span>
          <span className="w-2 h-2 rounded-full bg-stone-400 ml-1" />
          <span>Quarantined</span>
        </div>
      </div>

      {/* The 4x3 Core Matrix Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[620px]">
          <thead>
            <tr>
              <th className="p-2 border border-stone-200 bg-[#f4f2ee] text-left text-[11px] font-medium text-stone-600 w-36">
                Physical Hazard ↓ / Evidence →
              </th>
              {qualityColumns.map(col => (
                <th
                  key={col.key}
                  className="p-2 border border-stone-200 bg-[#f4f2ee] text-center text-[11px] font-medium text-stone-700"
                >
                  <div>{col.label}</div>
                  <div className="text-[10px] text-stone-500 font-normal mt-0.5 line-clamp-1">
                    {col.description}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {urgencyRows.map(row => (
              <tr key={row.key}>
                <td className="p-2 border border-stone-200 bg-stone-50 text-left align-top">
                  <div className="flex items-center gap-1.5 font-medium text-xs text-stone-800">
                    <span className={`w-2 h-2 rounded-full ${row.dotColor}`} />
                    <span>{row.label}</span>
                  </div>
                  <div className="text-[10px] text-stone-500 mt-1 leading-tight">
                    {row.description}
                  </div>
                </td>

                {qualityColumns.map(col => {
                  const itemsInCell = getHabitationsInCell(row.key, col.key);

                  return (
                    <td
                      key={col.key}
                      className="p-2 border border-stone-200 bg-white align-top min-h-[70px] hover:bg-stone-50/50 transition-colors"
                    >
                      {itemsInCell.length === 0 ? (
                        <div className="text-[10px] text-stone-400 text-center py-3 italic">
                          None
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {itemsInCell.map(hab => {
                            const isSelected = selectedHabitation.id === hab.id;
                            const isHovered = inspectedHabitationId === hab.id;

                            return (
                              <button
                                key={hab.id}
                                onClick={() => {
                                  onSelectHabitation(hab);
                                  setInspectedHabitationId(hab.id);
                                }}
                                onMouseEnter={() => setInspectedHabitationId(hab.id)}
                                className={`px-2 py-1 rounded text-xs text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-stone-900 text-white font-medium shadow-xs ring-1 ring-stone-900'
                                    : isHovered
                                    ? 'bg-stone-200 text-stone-900'
                                    : 'bg-stone-100 text-stone-800 hover:bg-stone-200/70 border border-stone-200'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isSelected ? 'bg-white' : row.dotColor
                                  }`}
                                />
                                <span>{hab.name}</span>
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

      {/* Undetermined Hazard Quarantine Shelf */}
      <div className="p-3 bg-stone-50 rounded border border-stone-200 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-stone-600" />
            <span className="text-xs font-medium text-stone-800">
              Epistemically Quarantined Tier (UNDETERMINED Hazard)
            </span>
          </div>
          <span className="text-[11px] text-stone-500">
            Cannot be cleared as Routine due to unmapped baseline gaps or unresolved conflicts
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {undeterminedHabitations.map(hab => {
            const isSelected = selectedHabitation.id === hab.id;
            const res = resultsMap.get(hab.id);

            return (
              <button
                key={hab.id}
                onClick={() => {
                  onSelectHabitation(hab);
                  setInspectedHabitationId(hab.id);
                }}
                onMouseEnter={() => setInspectedHabitationId(hab.id)}
                className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-stone-900 text-white font-medium shadow-xs'
                    : 'bg-white text-stone-800 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                <span className="font-medium">{hab.name}</span>
                <span className={`text-[10px] ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                  ({res?.evidenceQuality === 'CONFLICTING' ? 'Conflicting Data' : 'Cloud Obscured / Missing'})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Selection Rationale Callout */}
      {inspectedResult && (
        <div className="p-3 rounded bg-[#f4f2ee] border border-stone-200 text-xs text-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start sm:items-center gap-2">
            <Info className="w-4 h-4 text-[#233f33] shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-semibold text-stone-900 mr-1.5">
                {inspectedHabitation.name}:
              </span>
              <span>{inspectedResult.primaryReason}</span>
            </div>
          </div>
          <div className="shrink-0 text-[11px] text-stone-500 font-medium">
            Status: {inspectedResult.hazardUrgency} / {inspectedResult.evidenceQuality}
          </div>
        </div>
      )}
    </div>
  );
}
