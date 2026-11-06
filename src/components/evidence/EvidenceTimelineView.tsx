import { Calendar, Clock, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import type { Habitation } from '../../types/habitation';
import type { EvidenceItem } from '../../types/evidence';

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
    <div className="bg-slate-900/90 rounded-lg border border-slate-800 overflow-hidden shadow-xl text-xs p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <h3 className="font-mono font-bold uppercase tracking-wider text-slate-100 text-xs">
            Temporal Evidence Intelligence & Multi-Epoch Timeline ({sortedEvidence.length} items)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Chronological lineage • Event vs Observation vs Publication dates
        </span>
      </div>

      {/* Methodological Context Note */}
      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-300">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-mono font-bold text-slate-200">
            Temporal Relevance Principle:
          </span>
          <p className="leading-relaxed">
            Historical baseline evidence (e.g. 2020 GSI Landslide Susceptibility or 2021 Copernicus DEM) remains scientifically relevant for persistent bedrock and slope properties despite being 3–4 years prior to the disaster. Conversely, infrastructure access, road passability, and active tension cracking are perishable and require fresh post-event verification.
          </p>
        </div>
      </div>

      {/* Chronological Timeline Axis */}
      <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
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
                    ? 'border-zinc-500 bg-zinc-900'
                    : isHistorical
                    ? 'border-amber-400 bg-amber-950'
                    : 'border-rose-500 bg-rose-950'
                }`}
              />

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/90 hover:border-slate-700 transition-colors space-y-2">
                {/* Date & Metadata Chips */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-slate-100 text-xs">{item.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {item.domain}
                    </span>
                    {isHistorical ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/70 text-amber-300 border border-amber-800">
                        Historical Baseline (Persistent)
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950/70 text-rose-300 border border-rose-800">
                        Post-Event Observation (2024)
                      </span>
                    )}
                  </div>

                  {/* Multi-Epoch Date Chips */}
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 flex-wrap">
                    {item.eventDate && (
                      <span className="flex items-center gap-1 text-rose-300 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-900/60">
                        <Calendar className="w-3 h-3" /> Event: {item.eventDate}
                      </span>
                    )}
                    {item.observationDate ? (
                      <span className="flex items-center gap-1 text-slate-200 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        <Clock className="w-3 h-3 text-sky-400" /> Observed: {item.observationDate}
                      </span>
                    ) : (
                      <span className="text-zinc-500 italic">Date Unrecorded</span>
                    )}
                    {item.publicationDate && (
                      <span className="text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        Published: {item.publicationDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Finding */}
                <p className="text-slate-300 text-xs leading-relaxed font-sans bg-slate-900/50 p-2 rounded border border-slate-800/60">
                  {item.finding}
                </p>

                {/* Provenance & Recency Evaluation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                  <div>
                    <span className="text-slate-500">Source Lineage: </span>
                    <span className="text-slate-300">{item.sourceOrg} — {item.sourceReference}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isRecencyCritical ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Recency Sensitive: Condition changes rapidly</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Persistent Domain: Valid across multi-year epochs</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
