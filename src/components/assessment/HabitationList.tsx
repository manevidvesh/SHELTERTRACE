import { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import type { Habitation, PrioritisationResult } from '../../types/habitation';
import type { SummaryFilter } from './AssessmentSummary';
import { HazardUrgencyBadge, EvidenceQualityBadge, ProvenanceTypeBadge } from '../common/Badge';

interface HabitationListProps {
  habitations: Habitation[];
  resultsMap: Map<string, PrioritisationResult>;
  selectedHabitation: Habitation | null;
  onSelectHabitation: (habitation: Habitation) => void;
  activeFilter: SummaryFilter;
}

export function HabitationList({
  habitations,
  resultsMap,
  selectedHabitation,
  onSelectHabitation,
  activeFilter,
}: HabitationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter habitations based on activeFilter and searchQuery
  const filteredHabitations = habitations.filter(hab => {
    const result = resultsMap.get(hab.id);
    if (!result) return false;

    if (activeFilter !== 'ALL') {
      const isUrgencyMatch = result.hazardUrgency === activeFilter;
      const isQualityMatch = result.evidenceQuality === activeFilter;
      if (!isUrgencyMatch && !isQualityMatch) {
        return false;
      }
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = hab.name.toLowerCase().includes(q);
      const matchReason = result.primaryReason.toLowerCase().includes(q);
      const matchTag = hab.tags.some(t => t.toLowerCase().includes(q));
      return matchName || matchReason || matchTag;
    }

    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-stone-200 overflow-hidden shadow-xs">
      {/* Header & Search */}
      <div className="p-3 border-b border-stone-200 bg-stone-50/70 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-900 tracking-tight">
            Assessed Settlements ({filteredHabitations.length})
          </span>
          {activeFilter !== 'ALL' && (
            <span className="text-[11px] text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
              Filter: {activeFilter}
            </span>
          )}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by settlement, tag, or reason..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 pl-8 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
          />
        </div>
      </div>

      {/* Settlement List */}
      <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
        {filteredHabitations.length === 0 ? (
          <div className="p-6 text-center text-stone-400 text-xs">
            No habitations match the current filter ({activeFilter}).
          </div>
        ) : (
          filteredHabitations.map(hab => {
            const result = resultsMap.get(hab.id);
            if (!result) return null;
            const isSelected = selectedHabitation?.id === hab.id;

            return (
              <div
                key={hab.id}
                onClick={() => onSelectHabitation(hab)}
                className={`p-3 text-left transition-colors cursor-pointer group ${
                  isSelected
                    ? 'bg-stone-100/80 border-l-3 border-l-[#233f33]'
                    : 'hover:bg-stone-50'
                }`}
              >
                {/* Title & Badges */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-xs font-semibold text-stone-900 group-hover:text-[#233f33]">
                        {hab.name}
                      </h3>
                      {hab.isIllustrativeRecord ? (
                        <ProvenanceTypeBadge type="SYNTHETIC_RECORD" />
                      ) : null}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">{hab.localAdministrativeUnit}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <HazardUrgencyBadge urgency={result.hazardUrgency} size="sm" />
                    <EvidenceQualityBadge quality={result.evidenceQuality} size="sm" />
                  </div>
                </div>

                {/* Primary Decision Reason */}
                <p className="text-[11px] text-stone-600 line-clamp-1 leading-snug">
                  {result.primaryReason}
                </p>

                {/* Summary Metrics & Action Indicator */}
                <div className="flex items-center justify-between text-[10px] text-stone-400 mt-2 pt-1 border-t border-stone-100">
                  <div className="flex items-center gap-3">
                    <span>Elevation: {hab.elevationMeters}m</span>
                    <span>•</span>
                    <span>Pop: ~{hab.estimatedPopulation}</span>
                    <span>•</span>
                    <span>Buildings: {hab.buildingCount}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-stone-800 translate-x-0.5' : 'text-stone-300'}`} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
