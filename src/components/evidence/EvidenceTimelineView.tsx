import { Calendar, Clock, Info } from 'lucide-react';
import type { Habitation } from '../../types/habitation';
import type { EvidenceItem } from '../../types/evidence';
import { CategoryBadge, QualityBadge } from '../common/Badge';

interface EvidenceTimelineViewProps {
  habitation: Habitation;
}

export function EvidenceTimelineView({ habitation }: EvidenceTimelineViewProps) {
  // Sort evidence items by observation/publication date chronologically
  const sortedEvidence: EvidenceItem[] = [...habitation.evidence].sort((a, b) => {
    const dateA = a.observationDate || a.publicationDate || '9999-99-99';
    const dateB = b.observationDate || b.publicationDate || '9999-99-99';
    return dateA.localeCompare(dateB);
  });

  return (
    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-xs text-xs p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#233f33]" />
          <h3 className="font-semibold text-stone-900 text-xs tracking-tight">
            Temporal Evidence Intelligence & Multi-Epoch Timeline ({sortedEvidence.length} items)
          </h3>
        </div>
        <span className="text-[11px] text-stone-500">
          Chronological Lineage • Historical Baselines vs Fresh Event Observations
        </span>
      </div>

      {/* Methodological Context Note */}
      <div className="p-3 rounded bg-[#f4f2ee] border border-stone-200 flex items-start gap-2.5 text-xs text-stone-700">
        <Info className="w-4 h-4 text-[#233f33] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-stone-900">
            Temporal Relevance Principle:
          </span>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            Historical baseline evidence (e.g. 2020 GSI Landslide Susceptibility or 2021 Copernicus DEM) remains scientifically valid for persistent bedrock and slope properties. Conversely, infrastructure access, road passability, and active tension cracking are perishable and require fresh post-event verification.
          </p>
        </div>
      </div>

      {/* Chronological Timeline Axis */}
      <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
        {sortedEvidence.map((item) => {
          const isUndated = !item.observationDate && !item.publicationDate;
          const isRecencyCritical = item.relevanceDependsOnRecency;
          const isHistorical = item.isHistorical ?? (item.observationDate ? item.observationDate < '2024-01-01' : false);

          return (
            <div key={item.id} className="relative group">
              {/* Timeline Node Pip */}
              <div
                className={`absolute -left-[27px] top-1.5 w-3 h-3 rounded-full border-2 ${
                  isUndated
                    ? 'border-stone-400 bg-stone-100'
                    : isHistorical
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-red-600 bg-red-50'
                }`}
              />

              {/* Card Surface */}
              <div className="bg-stone-50/70 border border-stone-200 rounded-md p-3 space-y-2 hover:bg-stone-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-stone-900 text-xs">{item.name}</span>
                    <CategoryBadge category={item.category} />
                    <QualityBadge status={item.status} />
                    {isHistorical ? (
                      <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px]">
                        Historical Baseline
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded bg-red-50 text-red-800 border border-red-200 text-[10px] font-medium">
                        Post-Event (2024)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>{item.observationDate || item.publicationDate || 'Undated'}</span>
                  </div>
                </div>

                {/* Finding */}
                <p className="text-stone-800 text-xs leading-relaxed bg-white p-2.5 rounded border border-stone-200/80">
                  {item.finding}
                </p>

                {/* Metadata & Recency Warning */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-stone-500 pt-1">
                  <div>
                    <span>Source: </span>
                    <span className="text-stone-700 font-medium">{item.sourceOrg}</span>
                    <span className="mx-1">•</span>
                    <span>Ref: {item.sourceReference}</span>
                  </div>

                  {isRecencyCritical && (
                    <span className="text-amber-800 text-[10px] font-medium">
                      ⚠️ Recency-sensitive observation
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
