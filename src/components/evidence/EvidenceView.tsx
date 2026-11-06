import { useState } from 'react';
import {
  AlertTriangle,
  FileText,
  Calendar,
  Layers,
  ExternalLink,
  AlertCircle,
  GitCommit,
  Clock,
  Compass,
  Sliders,
  ShieldCheck,
  CheckSquare,
} from 'lucide-react';
import type { Habitation, PrioritisationResult } from '../../types/habitation';
import type { EvidenceDomain } from '../../types/evidence';
import { HazardUrgencyBadge, EvidenceQualityBadge, CategoryBadge, QualityBadge, ProvenanceTypeBadge } from '../common/Badge';
import { SensitivityWorkbench } from './SensitivityWorkbench';
import { ProvenanceGraphView } from './ProvenanceGraphView';
import { FieldSuggestionsSection } from './FieldSuggestionsSection';
import { EvidenceTimelineView } from './EvidenceTimelineView';
import { SpatialUncertaintySection } from './SpatialUncertaintySection';
import { ConflictRegisterSection } from './ConflictRegisterSection';
import { PriorityStabilitySection } from './PriorityStabilitySection';
import { LocalReviewAuditSection } from './LocalReviewAuditSection';

type EvidenceDossierTab =
  | 'PROVENANCE_AND_CARDS'
  | 'TEMPORAL_TIMELINE'
  | 'SPATIAL_UNCERTAINTY'
  | 'CONFLICT_REGISTER'
  | 'PRIORITY_STABILITY'
  | 'FIELD_DIRECTIVES_AUDIT';

interface EvidenceViewProps {
  habitations: Habitation[];
  selectedHabitation: Habitation;
  result: PrioritisationResult;
  onSelectHabitation: (habitation: Habitation) => void;
  onReturnToMap: () => void;
}

export function EvidenceView({
  habitations,
  selectedHabitation,
  result,
  onSelectHabitation,
  onReturnToMap,
}: EvidenceViewProps) {
  const [activeDossierTab, setActiveDossierTab] = useState<EvidenceDossierTab>('PROVENANCE_AND_CARDS');

  // Domain groupings for evidence cards
  const domains: { key: EvidenceDomain; label: string }[] = [
    { key: 'HAZARD_IMPACT', label: '1. Hazard Impact & Landslide Footprints' },
    { key: 'TERRAIN_GEOLOGY', label: '2. Terrain & Geological Evidence' },
    { key: 'SETTLEMENT_EXPOSURE', label: '3. Settlement & Building Exposure' },
    { key: 'INFRASTRUCTURE_ACCESS', label: '4. Infrastructure & Access Lifelines' },
    { key: 'FIELD_VERIFICATION', label: '5. Field Reconnaissance & Subsurface Verification' },
  ];

  const subTabs: { key: EvidenceDossierTab; label: string; icon: typeof GitCommit }[] = [
    { key: 'PROVENANCE_AND_CARDS', label: '1. Provenance & Dossier', icon: GitCommit },
    { key: 'TEMPORAL_TIMELINE', label: '2. Temporal Timeline', icon: Clock },
    { key: 'SPATIAL_UNCERTAINTY', label: '3. Spatial Quality & CRS', icon: Compass },
    { key: 'CONFLICT_REGISTER', label: '4. Conflict Register', icon: AlertTriangle },
    { key: 'PRIORITY_STABILITY', label: '5. Priority Stability', icon: Sliders },
    { key: 'FIELD_DIRECTIVES_AUDIT', label: '6. Field Directives & Audit', icon: CheckSquare },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Controls: Habitation Selector & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onReturnToMap}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <span>&larr; Back to Map</span>
          </button>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Inspecting Habitation Dossier</span>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedHabitation.id}
                onChange={e => {
                  const found = habitations.find(h => h.id === e.target.value);
                  if (found) onSelectHabitation(found);
                }}
                className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-sm font-bold text-slate-100 font-mono focus:outline-none focus:border-rose-500"
              >
                {habitations.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.localAdministrativeUnit.split(',')[0]})
                  </option>
                ))}
              </select>
              {selectedHabitation.isIllustrativeRecord ? (
                <ProvenanceTypeBadge type="SYNTHETIC_RECORD" />
              ) : (
                <ProvenanceTypeBadge type="SOURCE_BACKED" />
              )}
            </div>
          </div>
        </div>

        {/* Two-Dimension Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <HazardUrgencyBadge urgency={result.hazardUrgency} size="md" />
          <EvidenceQualityBadge quality={result.evidenceQuality} size="md" />
        </div>
      </div>

      {/* Primary Executive Summary of Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Core Rationale */}
        <div className="lg:col-span-2 p-4 rounded-lg bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Deterministic Decision Rationale
            </span>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-slate-400">Urgency:</span>
              <span className="font-bold text-rose-300">{result.hazardUrgency}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Quality:</span>
              <span className="font-bold text-sky-300">{result.evidenceQuality}</span>
            </div>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3 rounded border border-slate-800/80 font-sans">
            {result.primaryReason}
          </p>

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Step-by-Step Inspectable Reasoning:
            </span>
            {result.detailedReasoning.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-slate-500 font-mono text-[11px] shrink-0 mt-0.5">
                  [{idx + 1}]
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>

          {result.applicableRules.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-mono uppercase text-slate-400">Triggered Rules:</span>
              {result.applicableRules.map((rule, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-900 text-[11px] font-mono text-rose-300">
                  {rule}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Habitation Profile & Fast Indicators */}
        <div className="p-4 rounded-lg bg-slate-900/90 border border-slate-800 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block pb-2 border-b border-slate-800">
            Habitation Exposure Baseline
          </span>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Centroid Elevation</span>
              <span className="text-slate-200 font-bold">{selectedHabitation.elevationMeters}m MSL</span>
            </div>
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Dwelling Exposure</span>
              <span className="text-slate-200 font-bold">{selectedHabitation.buildingCount} bldgs / ~{selectedHabitation.estimatedPopulation} pop</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5 text-[11px]">
            <span className="text-slate-400 font-mono text-[10px] uppercase block">Governance Status</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>DDMA Priority Tier: {result.hazardUrgency}</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight pt-1">
              Deterministic rule execution completed without composite scores or ML black boxes.
            </p>
          </div>
        </div>
      </div>

      {/* Critical Warnings / Missing Evidence Banners */}
      {result.conflictingEvidence.length > 0 && (
        <div className="p-4 rounded-lg bg-purple-950/60 border border-purple-600/70 text-purple-200">
          <div className="flex items-center gap-2 font-bold text-sm text-purple-300 mb-1">
            <AlertTriangle className="w-4 h-4 text-purple-400" />
            <span>CRITICAL CONFLICT DETECTED IN PRIMARY EVIDENCE</span>
          </div>
          <div className="text-xs space-y-1 mt-2">
            {result.conflictingEvidence.map((conf, idx) => (
              <p key={idx} className="leading-relaxed bg-purple-950/80 p-2 rounded border border-purple-800">
                {conf}
              </p>
            ))}
          </div>
          <p className="text-[11px] text-purple-300 mt-2 italic">
            Governance Rule: System exposes contradictory intelligence and mandates on-ground verification before final safety classification.
          </p>
        </div>
      )}

      {result.missingEvidence.length > 0 && (
        <div className="p-4 rounded-lg bg-amber-950/50 border border-amber-600/70 text-amber-200">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-300 mb-1">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>CRITICAL BASELINE EVIDENCE GAP</span>
          </div>
          <div className="text-xs space-y-1 mt-2">
            {result.missingEvidence.map((miss, idx) => (
              <p key={idx} className="leading-relaxed bg-amber-950/80 p-2 rounded border border-amber-800">
                {miss}
              </p>
            ))}
          </div>
          <p className="text-[11px] text-amber-300 mt-2 font-medium">
            Essential Constraint: Insufficient evidence must NEVER be interpreted as low risk or safe.
          </p>
        </div>
      )}

      {/* Progressive Disclosure Sub-Navigation Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-1 overflow-x-auto pb-1 text-xs font-mono">
        {subTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeDossierTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveDossierTab(tab.key)}
              className={`px-3 py-2 rounded-t-lg flex items-center gap-2 border-b-2 font-bold transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-rose-500 bg-slate-900 text-rose-300 shadow'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Provenance Graph & Detailed Evidence Cards */}
      {activeDossierTab === 'PROVENANCE_AND_CARDS' && (
        <div className="space-y-6">
          <ProvenanceGraphView habitation={selectedHabitation} result={result} />

          {/* Full Evidence Quality Matrix Table */}
          <div className="bg-slate-900/90 rounded-lg border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Evidence Quality & Provenance Dossier ({result.supportingEvidence.length} items)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Explicit Distinction: OBSERVED vs MODELLED vs DERIVED vs ILLUSTRATIVE
              </span>
            </div>

            {/* Domain Groupings */}
            <div className="divide-y divide-slate-800">
              {domains.map(dom => {
                const domainItems = result.supportingEvidence.filter(e => e.domain === dom.key);
                if (domainItems.length === 0) return null;

                return (
                  <div key={dom.key} className="p-4 space-y-3 bg-slate-950/30">
                    <div className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span>{dom.label}</span>
                      <span className="text-slate-500 text-[10px] font-normal">
                        ({domainItems.length} record{domainItems.length > 1 ? 's' : ''})
                      </span>
                    </div>

                    {/* Evidence Cards */}
                    <div className="grid grid-cols-1 gap-2.5">
                      {domainItems.map(item => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg border text-xs ${
                            item.status === 'CONFLICTING'
                              ? 'bg-purple-950/40 border-purple-600/70'
                              : item.status === 'INSUFFICIENT'
                              ? 'bg-zinc-900 border-zinc-700'
                              : item.category === 'ILLUSTRATIVE'
                              ? 'bg-orange-950/30 border-orange-700/60'
                              : 'bg-slate-900/70 border-slate-800/90'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-100">{item.name}</span>
                              <CategoryBadge category={item.category} />
                              <QualityBadge status={item.status} />
                              {item.isCritical && (
                                <span className="text-[10px] font-mono text-rose-400 bg-rose-950 px-1.5 py-0.2 rounded border border-rose-900">
                                  CRITICAL
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                {item.observationDate}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Layers className="w-3 h-3 text-slate-500" />
                                {item.spatialResolution}
                              </span>
                            </div>
                          </div>

                          {/* Finding Statement */}
                          <p className="text-slate-200 bg-slate-950/70 p-2 rounded border border-slate-800/60 leading-relaxed font-sans mb-2">
                            {item.finding}
                          </p>

                          {/* Provenance & Limitations */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/60">
                            <div className="space-y-0.5">
                              <div>
                                <span className="text-slate-500 font-mono">Source Org: </span>
                                <span className="text-slate-300 font-medium">{item.sourceOrg}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 font-mono">Reference: </span>
                                <span className="text-slate-300">{item.sourceReference}</span>
                                {item.sourceUrl && (
                                  <a
                                    href={item.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-0.5 ml-1.5 text-sky-400 hover:text-sky-300 underline"
                                  >
                                    Source URL <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </div>

                            {item.knownLimitations.length > 0 && (
                              <div className="sm:max-w-md bg-slate-950 p-2 rounded border border-slate-800 text-[10px] text-slate-400">
                                <span className="text-amber-400 font-mono uppercase font-bold block mb-0.5">
                                  Documented Limitations:
                                </span>
                                <ul className="list-disc list-inside space-y-0.5">
                                  {item.knownLimitations.map((lim, lIdx) => (
                                    <li key={lIdx} className="leading-tight text-slate-400">
                                      {lim}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Temporal Evidence Intelligence */}
      {activeDossierTab === 'TEMPORAL_TIMELINE' && (
        <EvidenceTimelineView habitation={selectedHabitation} />
      )}

      {/* Tab 3: Spatial Uncertainty & Geometry Quality */}
      {activeDossierTab === 'SPATIAL_UNCERTAINTY' && (
        <SpatialUncertaintySection habitation={selectedHabitation} />
      )}

      {/* Tab 4: Explicit Conflict Register */}
      {activeDossierTab === 'CONFLICT_REGISTER' && (
        <ConflictRegisterSection habitation={selectedHabitation} />
      )}

      {/* Tab 5: Priority Stability & Scenario Workbench */}
      {activeDossierTab === 'PRIORITY_STABILITY' && (
        <div className="space-y-6">
          <PriorityStabilitySection habitation={selectedHabitation} />
          <SensitivityWorkbench habitation={selectedHabitation} />
        </div>
      )}

      {/* Tab 6: Field Directives & Local Review History */}
      {activeDossierTab === 'FIELD_DIRECTIVES_AUDIT' && (
        <div className="space-y-6">
          <FieldSuggestionsSection habitation={selectedHabitation} result={result} />
          <LocalReviewAuditSection habitation={selectedHabitation} />
        </div>
      )}
    </div>
  );
}
