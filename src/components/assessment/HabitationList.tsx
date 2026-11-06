import { useState } from 'react';
import { Search, ChevronRight, Home, Users, AlertCircle } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-slate-900/60 rounded-lg border border-slate-800 overflow-hidden">
      {/* Header & Search */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/90">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
            Assessed Settlements ({filteredHabitations.length})
          </span>
          {activeFilter !== 'ALL' && (
            <span className="text-[10px] font-mono text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/60">
              Filter: {activeFilter}
            </span>
          )}
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by settlement, tag, or reason..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 pl-8 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/60"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
        {filteredHabitations.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs font-mono">
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
                    ? 'bg-rose-950/30 border-l-4 border-l-rose-500'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                {/* Title & Badges */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-xs font-semibold text-slate-100 group-hover:text-rose-300">
                        {hab.name}
                      </h3>
                      {hab.isIllustrativeRecord ? (
                        <ProvenanceTypeBadge type="SYNTHETIC_RECORD" />
                      ) : (
                        <ProvenanceTypeBadge type="SOURCE_BACKED" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{hab.localAdministrativeUnit}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isSelected ? 'rotate-90 text-rose-400' : 'group-hover:translate-x-0.5'}`} />
                </div>

                {/* Independent Hazard Urgency & Evidence Quality Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <HazardUrgencyBadge urgency={result.hazardUrgency} size="sm" />
                  <EvidenceQualityBadge quality={result.evidenceQuality} size="sm" />
                </div>

                {/* Primary Reason */}
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-2 font-sans bg-slate-950/40 p-1.5 rounded border border-slate-800/50">
                  <span className="font-semibold text-slate-400">Rationale: </span>
                  {result.primaryReason}
                </p>

                {/* Metadata Footer */}
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Home className="w-3 h-3 text-slate-500" />
                    {hab.buildingCount} bldgs
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-500" />
                    ~{hab.estimatedPopulation} pop
                  </span>
                  <span className="text-slate-500">|</span>
                  <span>{hab.elevationMeters}m MSL</span>
                  {result.conflictingEvidence.length > 0 && (
                    <span className="ml-auto text-purple-400 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" />
                      Conflict
                    </span>
                  )}
                  {result.missingEvidence.length > 0 && (
                    <span className="ml-auto text-amber-400 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" />
                      Gap
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
