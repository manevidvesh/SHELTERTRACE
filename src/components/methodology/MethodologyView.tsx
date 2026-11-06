import {
  FileText,
  AlertTriangle,
  Database,
  ExternalLink,
  Layers,
  Scale,
  Sliders,
} from 'lucide-react';
import { AUTHENTIC_DATASETS } from '../../data/datasetMetadata';
import { DOCUMENTED_SENSITIVITY_ASSUMPTIONS } from '../../engine/sensitivityEngine';

export function MethodologyView() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 text-slate-200">
      {/* Title & Core Philosophy */}
      <div className="p-6 bg-slate-900/90 rounded-lg border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-wider">
          <Scale className="w-4 h-4" />
          <span>Transparent Decision Framework</span>
        </div>
        <h1 className="text-xl font-bold font-mono text-slate-100">
          SHELTERTRACE Methodology & Algorithmic Provenance
        </h1>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          In high-consequence disaster response and post-landslide rehabilitation, assigning an unexplained numerical "risk score" to a human settlement is ethically indefensible and legally hazardous. SHELTERTRACE implements a <strong>deterministic, inspectable rule engine</strong> that guarantees full traceability from primary observations to field prioritisation.
        </p>

        {/* Ethical Governance Box */}
        <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-500/50 space-y-2 mt-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Ethical, Legal & Governance Guardrails</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-rose-200/90 leading-relaxed">
            <li>
              <strong>"Requires Investigation" ≠ "Unsafe":</strong> Prioritising a habitation for on-ground inspection is an operational reconnaissance directive, not an engineered declaration of structural condemnation.
            </li>
            <li>
              <strong>"No Mapped Impact" ≠ "Safe":</strong> Absence of satellite-visible debris scour does NOT certify ground safety. Unmapped subsurface pore pressure or active tension cracks require ground verification.
            </li>
            <li>
              <strong>"Insufficient Evidence" must NEVER equal Low Risk:</strong> If satellite cloud cover or missing terrain surveys prevent assessment, the system explicitly refuses to calculate risk and outputs <span className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-200">UNDETERMINED</span> hazard urgency with <span className="font-mono bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">INSUFFICIENT</span> evidence quality.
            </li>
            <li>
              <strong>Human Authority Final Mandate:</strong> The software <em>never</em> autonomously orders evacuations or mandates relocation. High-consequence resettlement decisions rest solely with statutory constitutional authorities (e.g. District Disaster Management Authority).
            </li>
          </ul>
        </div>
      </div>

      {/* Section 1: Two Independent Dimensions */}
      <div className="p-6 bg-slate-900/90 rounded-lg border border-slate-800 space-y-4">
        <h2 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>1. Two Independent Evaluative Dimensions</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          SHELTERTRACE completely decouples physical hazard urgency from epistemic evidence quality:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Dimension 1: Hazard Urgency */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
            <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider block border-b border-slate-800 pb-1">
              Dimension 1: Physical Hazard Urgency
            </span>
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="font-mono font-bold text-rose-400">URGENT:</span> Direct physical debris flow inundation observed on site, or severed lifeline road/bridge access in steep mountainous terrain.
              </div>
              <div>
                <span className="font-mono font-bold text-amber-400">ELEVATED:</span> High modelled landslide susceptibility and steep slope gradient (&gt;25°) with exposed settlement, outside direct debris channel.
              </div>
              <div>
                <span className="font-mono font-bold text-slate-300">UNDETERMINED:</span> Critical baseline hazard or slope evidence is missing or contradicted. Cannot be declared routine or low hazard.
              </div>
              <div>
                <span className="font-mono font-bold text-emerald-400">ROUTINE:</span> Outside runout corridor, gentle slope (&lt;20°), normal connectivity, with verified baseline data.
              </div>
            </div>
          </div>

          {/* Dimension 2: Evidence Quality */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
            <span className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wider block border-b border-slate-800 pb-1">
              Dimension 2: Epistemic Evidence Quality
            </span>
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="font-mono font-bold text-emerald-400">COMPLETE:</span> All critical baseline hazard, terrain, and exposure parameters verified with documented metadata.
              </div>
              <div>
                <span className="font-mono font-bold text-amber-400">PARTIAL:</span> Critical baseline present; secondary geotechnical or field reconnaissance surveys pending.
              </div>
              <div>
                <span className="font-mono font-bold text-zinc-400">INSUFFICIENT:</span> Critical baseline data layer (e.g. cloud-obscured satellite coverage or missing slope) is absent.
              </div>
              <div>
                <span className="font-mono font-bold text-purple-400">CONFLICTING:</span> Contradictory observations detected between independent data layers (e.g. satellite scar vs local field memo).
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded text-xs text-slate-300">
          <strong>Key Decoupling Rule:</strong> A settlement with confirmed debris flow inundation whose geotechnical slope log is missing is classified as <strong>URGENT</strong> hazard urgency and <strong>INSUFFICIENT</strong> evidence quality. Missing secondary data does NOT erase observed physical destruction.
        </div>
      </div>

      {/* Section 2: Deterministic Decision Logic */}
      <div className="p-6 bg-slate-900/90 rounded-lg border border-slate-800 space-y-4">
        <h2 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-rose-400" />
          <span>2. Deterministic Prioritisation Rules Hierarchy</span>
        </h2>
        <div className="space-y-3 pt-2 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-rose-800/60">
            <div className="flex items-center justify-between font-mono font-bold text-rose-300 mb-1">
              <span>RULE-IMPACT-01: Direct Observed Debris Flow Inundation</span>
              <span className="text-[11px] bg-rose-950 px-2 py-0.5 rounded border border-rose-700">
                &rarr; Hazard: URGENT
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              When an observed debris flow polygon directly intersects settlement boundaries with exposed population, urgent structural triage is mandated regardless of secondary gaps.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-rose-800/60">
            <div className="flex items-center justify-between font-mono font-bold text-rose-300 mb-1">
              <span>RULE-INFRA-01: Lifeline Access Severance in Susceptible Flank</span>
              <span className="text-[11px] bg-rose-950 px-2 py-0.5 rounded border border-rose-700">
                &rarr; Hazard: URGENT
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              When bridge wash-out or road collapse completely isolates a habitation situated on steep or moderate susceptibility hillslopes (e.g. Attamala), emergency air/ropeway supply and evacuation verification is ordered.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-amber-800/60">
            <div className="flex items-center justify-between font-mono font-bold text-amber-300 mb-1">
              <span>RULE-SUSC-01: Modelled Susceptibility & Steep Slope Exposure</span>
              <span className="text-[11px] bg-amber-950 px-2 py-0.5 rounded border border-amber-700">
                &rarr; Hazard: ELEVATED
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              When a settlement lies outside the direct debris channel but on steep terrain (&gt;25°) within High susceptibility zones with intact road access (e.g. Kalladi), secondary geotechnical profiling is scheduled.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-700">
            <div className="flex items-center justify-between font-mono font-bold text-slate-300 mb-1">
              <span>RULE-INSUFF-01 / 02: Baseline Evidence Missing</span>
              <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded border border-slate-600">
                &rarr; Hazard: UNDETERMINED
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              If baseline hazard footprint or terrain slope data is missing (e.g. cloud-masked imagery), the engine refuses to guess and marks physical urgency as UNDETERMINED.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-emerald-800/60">
            <div className="flex items-center justify-between font-mono font-bold text-emerald-300 mb-1">
              <span>RULE-MONIT-01: Baseline Regional Monsoon Monitoring</span>
              <span className="text-[11px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">
                &rarr; Hazard: ROUTINE
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              For plateau habitations outside runout envelopes on gentle slopes with unimpaired arterial highway connectivity and verified baseline (e.g. Meppadi Town), standard rainfall threshold alerts suffice.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Sensitivity Assumptions Audit */}
      <div className="p-6 bg-slate-900/90 rounded-lg border border-slate-800 space-y-4">
        <h2 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <span>3. Operational Sensitivity Workbench</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          SHELTERTRACE maintains strict integrity in its sensitivity analysis:
        </p>

        <div className="space-y-3 pt-2 text-xs font-mono">
          {DOCUMENTED_SENSITIVITY_ASSUMPTIONS.map(scen => (
            <div key={scen.id} className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{scen.name}</span>
                {scen.isExecutableInMVP ? (
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800">
                    ACTIVE OPERATIONAL SCENARIO
                  </span>
                ) : (
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded border border-zinc-700">
                    DISABLED IN MVP v1.0
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-sans">{scen.description}</div>
              {scen.statusNotice && (
                <div className="text-[10px] text-amber-300/90 font-sans bg-amber-950/20 p-1.5 rounded border border-amber-900/40 mt-1">
                  {scen.statusNotice}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Data Provenance Ledger */}
      <div className="p-6 bg-slate-900/90 rounded-lg border border-slate-800 space-y-4">
        <h2 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>4. Dataset Provenance & Geometry Limitations</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Spatial Geometry Notice:</strong> All polygon layers displayed on the interactive map (debris flow corridor and susceptibility zone) are <em>illustrative vector approximations</em> digitized from published figures for demonstrative visualization. They are not raw GIS vector files ingested from official agency databases.
        </p>

        <div className="space-y-3 pt-2">
          {AUTHENTIC_DATASETS.map(ds => (
            <div
              key={ds.id}
              className="p-3.5 rounded-lg border text-xs space-y-2 bg-slate-950 border-slate-800"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 font-mono">{ds.name}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Published: {ds.publicationDate} | Resolution: {ds.spatialResolution}
                </span>
              </div>

              <p className="text-slate-300 leading-relaxed font-sans">{ds.description}</p>

              <div className="text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                <div>
                  <span className="text-slate-500 font-mono">Organisation: </span>
                  <span className="text-slate-300">{ds.sourceOrg}</span>
                </div>
                {ds.sourceUrl.startsWith('http') && (
                  <a
                    href={ds.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:text-sky-300 underline flex items-center gap-1 font-mono text-[10px]"
                  >
                    Official Reference <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
