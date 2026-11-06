import { useState } from 'react';
import {
  FileText,
  Database,
  ExternalLink,
  Layers,
  Scale,
  Sliders,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { AUTHENTIC_DATASETS } from '../../data/datasetMetadata';
import { DOCUMENTED_SENSITIVITY_ASSUMPTIONS } from '../../engine/sensitivityEngine';

export function MethodologyView() {
  const [showDatasets, setShowDatasets] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 text-stone-800 text-xs">
      {/* Title & Philosophy Banner */}
      <div className="p-6 bg-white rounded-lg border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[#233f33] font-medium text-xs">
          <Scale className="w-4 h-4" />
          <span>Transparent Decision Framework</span>
        </div>
        <h1 className="text-xl font-semibold text-stone-900 tracking-tight">
          SHELTERTRACE Methodology & Decision Architecture
        </h1>
        <p className="text-stone-600 text-xs leading-relaxed">
          In high-consequence disaster response and post-landslide rehabilitation, assigning an unexplained numerical "risk score" to a human settlement is ethically indefensible and legally hazardous. SHELTERTRACE implements a <strong>deterministic, inspectable rule engine</strong> that guarantees full traceability from primary observations to field prioritisation.
        </p>

        {/* Ethical Governance Box */}
        <div className="p-4 rounded-md bg-stone-50 border border-stone-200 space-y-2 mt-4 text-xs">
          <div className="flex items-center gap-2 font-semibold text-stone-900">
            <ShieldCheck className="w-4 h-4 text-[#233f33]" />
            <span>Ethical, Legal & Governance Principles</span>
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-stone-600 leading-relaxed pl-1">
            <li>
              <strong>"Requires Investigation" ≠ "Unsafe":</strong> Prioritising a habitation for on-ground inspection is an operational reconnaissance directive, not an engineered declaration of structural condemnation.
            </li>
            <li>
              <strong>"No Mapped Impact" ≠ "Safe":</strong> Absence of satellite-visible debris scour does NOT certify ground safety. Unmapped subsurface pore pressure or active tension cracks require ground verification.
            </li>
            <li>
              <strong>"Insufficient Evidence" must NEVER equal Low Risk:</strong> If satellite cloud cover or missing terrain surveys prevent assessment, the system explicitly refuses to calculate risk and outputs <span className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-800 font-medium">UNDETERMINED</span> hazard urgency with <span className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-800 font-medium">INSUFFICIENT</span> evidence quality.
            </li>
            <li>
              <strong>Human Authority Final Mandate:</strong> The software <em>never</em> autonomously orders evacuations or mandates relocation. High-consequence resettlement decisions rest solely with statutory constitutional authorities (e.g. District Disaster Management Authority).
            </li>
          </ul>
        </div>
      </div>

      {/* The 4-Stage Sequential Investigation Pipeline */}
      <div className="p-6 bg-white rounded-lg border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#233f33]" />
          <span>The Four-Stage Decision Sequence</span>
        </h2>
        <p className="text-stone-600 text-xs leading-relaxed">
          Every assessed habitation passes through an explicit, sequential pipeline that preserves causal provenance:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded bg-stone-50 border border-stone-200 space-y-1">
            <div className="text-[10px] font-semibold text-stone-400 uppercase">Stage 1</div>
            <div className="font-semibold text-stone-900 text-xs">Evidence Acquisition</div>
            <p className="text-[11px] text-stone-500 leading-tight">
              Ingestion of satellite observations, topographical models, infrastructure checks, and census data.
            </p>
          </div>

          <div className="p-3 rounded bg-stone-50 border border-stone-200 space-y-1">
            <div className="text-[10px] font-semibold text-stone-400 uppercase">Stage 2</div>
            <div className="font-semibold text-stone-900 text-xs">Spatial Findings</div>
            <p className="text-[11px] text-stone-500 leading-tight">
              Geometric intersection tests, slope calculations (&gt;25° threshold), and lifeline access audits.
            </p>
          </div>

          <div className="p-3 rounded bg-stone-50 border border-stone-200 space-y-1">
            <div className="text-[10px] font-semibold text-stone-400 uppercase">Stage 3</div>
            <div className="font-semibold text-stone-900 text-xs">Assessment Rules</div>
            <p className="text-[11px] text-stone-500 leading-tight">
              Deterministic rule hierarchy separating physical urgency from epistemic evidence quality.
            </p>
          </div>

          <div className="p-3 rounded bg-stone-50 border border-stone-200 space-y-1">
            <div className="text-[10px] font-semibold text-stone-400 uppercase">Stage 4</div>
            <div className="font-semibold text-stone-900 text-xs">Field Prioritisation</div>
            <p className="text-[11px] text-stone-500 leading-tight">
              Decision-impact directives guiding on-ground geotechnical inspection teams.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Two Independent Dimensions */}
      <div className="p-6 bg-white rounded-lg border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#233f33]" />
          <span>Two Independent Evaluative Dimensions</span>
        </h2>
        <p className="text-stone-600 text-xs leading-relaxed">
          SHELTERTRACE completely decouples physical hazard threat from epistemic evidence completeness:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Dimension 1: Hazard Urgency */}
          <div className="p-4 rounded-md bg-stone-50 border border-stone-200 space-y-2">
            <span className="text-xs font-semibold text-stone-900 block border-b border-stone-200 pb-1">
              Dimension 1: Physical Hazard Urgency
            </span>
            <div className="space-y-2 text-xs text-stone-700">
              <div>
                <strong className="text-red-800">URGENT:</strong> Direct physical debris flow inundation observed on site, or severed lifeline road/bridge access in steep mountainous terrain.
              </div>
              <div>
                <strong className="text-amber-800">ELEVATED:</strong> High modelled landslide susceptibility and steep slope gradient (&gt;25°) with exposed settlement, outside direct debris channel.
              </div>
              <div>
                <strong className="text-stone-800">UNDETERMINED:</strong> Critical baseline hazard or slope evidence is missing or contradicted. Cannot be declared routine or low hazard.
              </div>
              <div>
                <strong className="text-emerald-800">ROUTINE:</strong> Outside runout corridor, gentle slope (&lt;20°), normal connectivity, with verified baseline data.
              </div>
            </div>
          </div>

          {/* Dimension 2: Evidence Quality */}
          <div className="p-4 rounded-md bg-stone-50 border border-stone-200 space-y-2">
            <span className="text-xs font-semibold text-stone-900 block border-b border-stone-200 pb-1">
              Dimension 2: Epistemic Evidence Quality
            </span>
            <div className="space-y-2 text-xs text-stone-700">
              <div>
                <strong className="text-emerald-800">COMPLETE:</strong> All critical baseline hazard, terrain, and exposure parameters verified with documented metadata.
              </div>
              <div>
                <strong className="text-amber-800">PARTIAL:</strong> Critical baseline present; secondary geotechnical or field reconnaissance surveys pending.
              </div>
              <div>
                <strong className="text-stone-800">INSUFFICIENT:</strong> Critical baseline data layer (e.g. cloud-obscured satellite coverage or missing slope) is absent.
              </div>
              <div>
                <strong className="text-rose-800">CONFLICTING:</strong> Contradictory observations detected between independent data layers (e.g. satellite scar vs local field memo).
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#f4f2ee] border border-stone-200 rounded text-xs text-stone-700">
          <strong>Key Decoupling Rule:</strong> A settlement with confirmed debris flow inundation whose geotechnical slope log is missing is classified as <strong>URGENT</strong> hazard urgency and <strong>INSUFFICIENT</strong> evidence quality. Missing secondary data does NOT erase observed physical destruction.
        </div>
      </div>

      {/* Section 2: Deterministic Decision Rules */}
      <div className="p-6 bg-white rounded-lg border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#233f33]" />
          <span>Deterministic Decision Rules Hierarchy</span>
        </h2>
        <div className="space-y-2.5 pt-1 text-xs">
          <div className="p-3 rounded-md bg-stone-50 border border-stone-200 space-y-1">
            <div className="flex items-center justify-between font-semibold text-stone-900">
              <span>RULE-IMPACT-01: Direct Observed Debris Flow Inundation</span>
              <span className="text-[10px] bg-red-50 text-red-800 px-2 py-0.5 rounded border border-red-200 font-medium">
                Hazard: URGENT
              </span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              When an observed debris flow polygon directly intersects settlement boundaries with exposed population, urgent structural triage is mandated regardless of secondary gaps.
            </p>
          </div>

          <div className="p-3 rounded-md bg-stone-50 border border-stone-200 space-y-1">
            <div className="flex items-center justify-between font-semibold text-stone-900">
              <span>RULE-INFRA-01: Lifeline Access Severance in Susceptible Flank</span>
              <span className="text-[10px] bg-red-50 text-red-800 px-2 py-0.5 rounded border border-red-200 font-medium">
                Hazard: URGENT
              </span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              When bridge wash-out or road collapse completely isolates a habitation situated on steep or moderate susceptibility hillslopes (e.g. Attamala), emergency air/ropeway supply and evacuation verification is ordered.
            </p>
          </div>

          <div className="p-3 rounded-md bg-stone-50 border border-stone-200 space-y-1">
            <div className="flex items-center justify-between font-semibold text-stone-900">
              <span>RULE-SUSC-01: Modelled Susceptibility & Steep Slope Exposure</span>
              <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-medium">
                Hazard: ELEVATED
              </span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              When a settlement lies outside the direct debris channel but on steep terrain (&gt;25°) within High susceptibility zones with intact road access (e.g. Kalladi), secondary geotechnical profiling is scheduled.
            </p>
          </div>

          <div className="p-3 rounded-md bg-stone-50 border border-stone-200 space-y-1">
            <div className="flex items-center justify-between font-semibold text-stone-900">
              <span>RULE-INSUFF-01 / 02: Baseline Evidence Missing</span>
              <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-300 font-medium">
                Hazard: UNDETERMINED
              </span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              If baseline hazard footprint or terrain slope data is missing (e.g. cloud-masked imagery), the engine refuses to guess and marks physical urgency as UNDETERMINED.
            </p>
          </div>

          <div className="p-3 rounded-md bg-stone-50 border border-stone-200 space-y-1">
            <div className="flex items-center justify-between font-semibold text-stone-900">
              <span>RULE-MONIT-01: Baseline Regional Monsoon Monitoring</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                Hazard: ROUTINE
              </span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              For plateau habitations outside runout envelopes on gentle slopes with unimpaired arterial highway connectivity and verified baseline (e.g. Meppadi Town), standard rainfall threshold alerts suffice.
            </p>
          </div>
        </div>
      </div>

      {/* Expandable Section 3: Sensitivity Assumptions Audit */}
      <div className="p-4 bg-white rounded-lg border border-stone-200 shadow-xs space-y-3">
        <button
          onClick={() => setShowScenarios(!showScenarios)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2 font-semibold text-stone-900 text-sm">
            <Sliders className="w-4 h-4 text-[#233f33]" />
            <span>Sensitivity Assumptions & Operational Scenarios ({DOCUMENTED_SENSITIVITY_ASSUMPTIONS.length})</span>
          </div>
          {showScenarios ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </button>

        {showScenarios && (
          <div className="space-y-2 pt-2 border-t border-stone-100">
            {DOCUMENTED_SENSITIVITY_ASSUMPTIONS.map(scen => (
              <div key={scen.id} className="p-3 rounded bg-stone-50 border border-stone-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-900">{scen.name}</span>
                  {scen.isExecutableInMVP ? (
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                      Active Operational Scenario
                    </span>
                  ) : (
                    <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-200">
                      Disabled in MVP v1.0
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-stone-600">{scen.description}</div>
                {scen.statusNotice && (
                  <div className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 mt-1">
                    {scen.statusNotice}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expandable Section 4: Data Provenance Ledger */}
      <div className="p-4 bg-white rounded-lg border border-stone-200 shadow-xs space-y-3">
        <button
          onClick={() => setShowDatasets(!showDatasets)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2 font-semibold text-stone-900 text-sm">
            <Database className="w-4 h-4 text-[#233f33]" />
            <span>Dataset Provenance & Spatial Geometry Notice ({AUTHENTIC_DATASETS.length} Datasets)</span>
          </div>
          {showDatasets ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </button>

        {showDatasets && (
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <p className="text-stone-600 text-xs leading-relaxed">
              <strong>Spatial Geometry Notice:</strong> All polygon layers displayed on the interactive map (debris flow corridor and susceptibility zone) are <em>illustrative vector approximations</em> digitized from published figures for demonstrative visualization. They are not raw GIS vector files ingested from official agency databases.
            </p>

            {AUTHENTIC_DATASETS.map(ds => (
              <div
                key={ds.id}
                className="p-3 rounded bg-stone-50 border border-stone-200 text-xs space-y-1.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-semibold text-stone-900">{ds.name}</span>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Published: {ds.publicationDate} • Res: {ds.spatialResolution}
                  </span>
                </div>

                <p className="text-stone-600 leading-relaxed">{ds.description}</p>

                <div className="text-[11px] text-stone-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 border-t border-stone-200/60">
                  <div>
                    <span>Source: </span>
                    <span className="text-stone-800 font-medium">{ds.sourceOrg}</span>
                  </div>
                  {ds.sourceUrl.startsWith('http') && (
                    <a
                      href={ds.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-stone-700 hover:text-stone-900 underline flex items-center gap-1"
                    >
                      Official Reference <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
