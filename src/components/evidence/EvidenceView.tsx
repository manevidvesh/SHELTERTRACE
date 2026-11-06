import { useState } from 'react';
import {
  FileText,
  Calendar,
  Layers,
  ExternalLink,
  AlertTriangle,
  GitCommit,
  Clock,
  Compass,
  Sliders,
  CheckSquare,
  ArrowLeft,
  BarChart3,
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
import { ParameterComparisonView } from '../analytics/ParameterComparisonView';

type EvidenceDossierTab =
  | 'PROVENANCE_AND_CARDS'
  | 'PARAMETER_COMPARISON'
  | 'TEMPORAL_TIMELINE'
  | 'SPATIAL_UNCERTAINTY'
  | 'CONFLICT_REGISTER'
  | 'PRIORITY_STABILITY'
  | 'FIELD_DIRECTIVES_AUDIT';

interface EvidenceViewProps {
  habitations: Habitation[];
  selectedHabitation: Habitation;
  result: PrioritisationResult;
  resultsMap: Map<string, PrioritisationResult>;
  onSelectHabitation: (habitation: Habitation) => void;
  onReturnToMap: () => void;
}

export function EvidenceView({
  habitations,
  selectedHabitation,
  result,
  resultsMap,
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
    { key: 'PROVENANCE_AND_CARDS', label: '1. Provenance DAG & Dossier', icon: GitCommit },
    { key: 'PARAMETER_COMPARISON', label: '2. Parameter Comparison', icon: BarChart3 },
    { key: 'TEMPORAL_TIMELINE', label: '3. Temporal Timeline', icon: Clock },
    { key: 'SPATIAL_UNCERTAINTY', label: '4. Spatial Quality & CRS', icon: Compass },
    { key: 'CONFLICT_REGISTER', label: '5. Conflict Register', icon: AlertTriangle },
    { key: 'PRIORITY_STABILITY', label: '6. Priority Stability', icon: Sliders },
    { key: 'FIELD_DIRECTIVES_AUDIT', label: '7. Field Directives & Audit', icon: CheckSquare },
  ];

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Top Controls: Habitation Selector & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white border border-stone-200 rounded-lg shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onReturnToMap}
            className="px-3 py-1.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium flex items-center gap-1.5 border border-stone-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Map</span>
          </button>
          <div>
            <span className="text-[10px] text-stone-500 uppercase font-medium block">Active Settlement Dossier</span>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedHabitation.id}
                onChange={e => {
                  const found = habitations.find(h => h.id === e.target.value);
                  if (found) onSelectHabitation(found);
                }}
                className="bg-white border border-stone-300 rounded px-2.5 py-1 text-xs font-semibold text-stone-900 focus:outline-none focus:border-stone-500 cursor-pointer"
              >
                {habitations.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.localAdministrativeUnit.split(',')[0]})
                  </option>
                ))}
              </select>
              {selectedHabitation.isIllustrativeRecord && (
                <ProvenanceTypeBadge type="SYNTHETIC_RECORD" />
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

      {/* Executive Decision Summary */}
      <div className="p-4 rounded-lg bg-white border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
          <span className="text-xs font-semibold text-stone-900">
            Deterministic Decision Reasoning
          </span>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>Elevation: {selectedHabitation.elevationMeters}m</span>
            <span>•</span>
            <span>Buildings: {selectedHabitation.buildingCount}</span>
            <span>•</span>
            <span>Est. Pop: ~{selectedHabitation.estimatedPopulation}</span>
          </div>
        </div>

        <p className="text-xs text-stone-800 leading-relaxed bg-stone-50 p-3 rounded border border-stone-200">
          {result.primaryReason}
        </p>

        {/* Step-by-Step Reasoning Steps */}
        <div className="space-y-1 pt-1">
          <span className="text-[10px] text-stone-500 uppercase font-medium block">
            Inspectable Decision Steps:
          </span>
          <div className="space-y-1">
            {result.detailedReasoning.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                <span className="text-stone-400 font-mono text-[11px] shrink-0 mt-0.5">
                  [{idx + 1}]
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Applicable Rules */}
        {result.applicableRules.length > 0 && (
          <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] text-stone-500 uppercase font-medium">Triggered Rules:</span>
            {result.applicableRules.map((rule, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-[11px] font-mono text-stone-800">
                {rule}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Critical Warnings / Missing Evidence Banners */}
      {result.conflictingEvidence.length > 0 && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-950 space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-xs text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-700" />
            <span>Contradiction Recorded in Primary Evidence</span>
          </div>
          <div className="text-xs space-y-1">
            {result.conflictingEvidence.map((conf, idx) => (
              <p key={idx} className="bg-white/80 p-2 rounded border border-rose-200 text-rose-900 leading-relaxed">
                {conf}
              </p>
            ))}
          </div>
        </div>
      )}

      {result.missingEvidence.length > 0 && result.hazardUrgency === 'UNDETERMINED' && (
        <div className="p-3.5 rounded-lg bg-stone-100 border border-stone-300 text-stone-800 space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-xs text-stone-900">
            <AlertTriangle className="w-4 h-4 text-stone-600" />
            <span>Missing Critical Baseline Data</span>
          </div>
          <div className="text-xs space-y-1">
            {result.missingEvidence.map((miss, idx) => (
              <p key={idx} className="bg-white p-2 rounded border border-stone-300 leading-relaxed">
                {miss}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Progressive Disclosure Sub-Navigation Tabs */}
      <div className="border-b border-stone-200 flex items-center gap-1 overflow-x-auto pb-1 text-xs">
        {subTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeDossierTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveDossierTab(tab.key)}
              className={`px-3 py-2 rounded-t-md flex items-center gap-1.5 font-medium transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-b-2 border-stone-900 bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-stone-600" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Provenance Graph & Detailed Evidence Cards */}
      {activeDossierTab === 'PROVENANCE_AND_CARDS' && (
        <div className="space-y-4">
          <ProvenanceGraphView habitation={selectedHabitation} result={result} />

          {/* Full Evidence Quality Matrix Table */}
          <div className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-3.5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#233f33]" />
                <h3 className="text-xs font-semibold text-stone-900">
                  Supporting Evidence Items ({result.supportingEvidence.length})
                </h3>
              </div>
              <span className="text-[11px] text-stone-500 hidden sm:inline">
                Explicit Types: Observed • Modelled • Derived • Illustrative
              </span>
            </div>

            {/* Domain Groupings */}
            <div className="divide-y divide-stone-100">
              {domains.map(dom => {
                const domainItems = result.supportingEvidence.filter(e => e.domain === dom.key);
                if (domainItems.length === 0) return null;

                return (
                  <div key={dom.key} className="p-4 space-y-2.5 bg-white">
                    <div className="text-xs font-semibold text-stone-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#233f33]" />
                      <span>{dom.label}</span>
                      <span className="text-stone-400 text-[11px] font-normal">
                        ({domainItems.length} record{domainItems.length > 1 ? 's' : ''})
                      </span>
                    </div>

                    {/* Evidence Cards */}
                    <div className="grid grid-cols-1 gap-2.5">
                      {domainItems.map(item => (
                        <div
                          key={item.id}
                          className="p-3 rounded-md border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors text-xs space-y-2"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-stone-900">{item.name}</span>
                              <CategoryBadge category={item.category} />
                              <QualityBadge status={item.status} />
                              {item.isCritical && (
                                <span className="text-[10px] text-red-800 bg-red-50 px-1.5 py-0.2 rounded border border-red-200 font-medium">
                                  Critical Domain
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-500 flex items-center gap-2 font-mono">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-stone-400" />
                                {item.observationDate}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Layers className="w-3 h-3 text-stone-400" />
                                {item.spatialResolution}
                              </span>
                            </div>
                          </div>

                          {/* Finding Statement */}
                          <p className="text-stone-800 bg-white p-2.5 rounded border border-stone-200 leading-relaxed">
                            {item.finding}
                          </p>

                          {/* Provenance & Limitations */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-[11px] text-stone-600 pt-1 border-t border-stone-200/60">
                            <div className="space-y-0.5">
                              <div>
                                <span className="text-stone-400">Source: </span>
                                <span className="text-stone-800 font-medium">{item.sourceOrg}</span>
                              </div>
                              <div>
                                <span className="text-stone-400">Reference: </span>
                                <span className="text-stone-700">{item.sourceReference}</span>
                                {item.sourceUrl && (
                                  <a
                                    href={item.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-0.5 ml-1 text-stone-700 hover:text-stone-900 underline"
                                  >
                                    URL <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </div>

                            {item.knownLimitations.length > 0 && (
                              <div className="sm:max-w-md bg-white p-2 rounded border border-stone-200 text-[11px] text-stone-500">
                                <span className="text-amber-800 font-medium block mb-0.5 text-[10px]">
                                  Documented Limitations:
                                </span>
                                <ul className="list-disc list-inside space-y-0.5">
                                  {item.knownLimitations.map((lim, lIdx) => (
                                    <li key={lIdx} className="leading-tight">
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

      {/* Tab 2: Parameter Comparison Graph */}
      {activeDossierTab === 'PARAMETER_COMPARISON' && (
        <ParameterComparisonView
          habitations={habitations}
          resultsMap={resultsMap}
          selectedHabitation={selectedHabitation}
          onSelectHabitation={onSelectHabitation}
        />
      )}

      {/* Tab 3: Temporal Evidence Intelligence */}
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
        <div className="space-y-4">
          <PriorityStabilitySection habitation={selectedHabitation} />
          <SensitivityWorkbench habitation={selectedHabitation} />
        </div>
      )}

      {/* Tab 6: Field Directives & Local Review History */}
      {activeDossierTab === 'FIELD_DIRECTIVES_AUDIT' && (
        <div className="space-y-4">
          <FieldSuggestionsSection habitation={selectedHabitation} result={result} />
          <LocalReviewAuditSection habitation={selectedHabitation} />
        </div>
      )}
    </div>
  );
}
