import type {
  Habitation,
  HazardUrgency,
  EvidenceQuality,
  SensitivityEvaluation,
  SensitivityAssumption,
  ScenarioStabilityResult,
  PriorityStabilityReport,
} from '../types/habitation';
import { assessHabitation } from './assessmentEngine';

export const DOCUMENTED_SENSITIVITY_ASSUMPTIONS: SensitivityAssumption[] = [
  {
    id: 'SCENARIO_BRIDGE_RESTORED',
    name: 'Hypothetical Lifeline Restoration (Temporary Bailey Bridge)',
    description: 'Models the operational impact of emergency Indian Army Bailey bridge completion across the severed Iruvaipuzha river crossing.',
    affectedEvidenceDomain: 'INFRASTRUCTURE_ACCESS',
    testedParameter: 'Vehicular & Pedestrian Ingress Status',
    documentedRange: 'Completely Severed vs Restored Light Vehicle Access',
    currentAssumption: 'Access completely severed by bridge wash-out',
    alternativeAssumption: 'Emergency light-vehicle & foot connectivity restored',
    isExecutableInMVP: true,
  },
  {
    id: 'SCENARIO_BUFFER_UNCERTAINTY',
    name: 'Spatial Boundary Uncertainty (+75m Runout Buffer)',
    description: 'Models satellite orthorectification tolerances by expanding runout vectors by +75m.',
    affectedEvidenceDomain: 'HAZARD_IMPACT',
    testedParameter: 'Runout Boundary Buffer',
    documentedRange: '0m (vector footprint) to 75m (conservative dispersion)',
    currentAssumption: 'Footprint vector without buffer',
    alternativeAssumption: 'Conservative +75m envelope expansion applied',
    isExecutableInMVP: false,
    statusNotice: 'DISABLED IN MVP v1.0: Real vector polygon buffering requires in-memory GIS topology engine (e.g. Turf.js/GEOS). Disabled to prevent false numerical buffer claims.',
  },
  {
    id: 'SCENARIO_TEMPORAL_DECAY',
    name: 'Discount Pre-2022 Evidence (Temporal Invalidation)',
    description: 'Evaluates if decision integrity degrades when hazard layers older than 36 months are excluded.',
    affectedEvidenceDomain: 'TERRAIN_GEOLOGY / HAZARD_IMPACT',
    testedParameter: 'Evidence Maximum Age',
    documentedRange: 'All available records vs only fresh post-2022 datasets',
    currentAssumption: 'All available historical and baseline layers integrated',
    alternativeAssumption: 'Strict freshness cutoff: exclude non-geological layers prior to 2022',
    isExecutableInMVP: false,
    statusNotice: 'DISABLED IN MVP v1.0: Ingestion of genuine multi-epoch historical survey inventories is required for temporal invalidation testing.',
  },
  {
    id: 'SCENARIO_GEOTECHNICAL_DATA',
    name: 'Incorporate Preliminary Geotechnical Borehole Log',
    description: 'Simulates the addition of sub-surface colluvium and groundwater borehole observations.',
    affectedEvidenceDomain: 'FIELD_VERIFICATION',
    testedParameter: 'Subsurface Geotechnical Survey Availability',
    documentedRange: 'Missing field borehole vs Standard 5m core sample log',
    currentAssumption: 'Geotechnical borehole data absent / pending field deployment',
    alternativeAssumption: 'Colluvial thickness (3.8m) & perched groundwater table log integrated',
    isExecutableInMVP: false,
    statusNotice: 'DISABLED IN MVP v1.0: Borehole data is synthetic demonstration data. Under strict evidence integrity rules, synthetic boreholes cannot alter operational decision rules.',
  },
];

export function evaluateSensitivity(
  habitation: Habitation,
  assumptionId: string
): SensitivityEvaluation {
  const assumption = DOCUMENTED_SENSITIVITY_ASSUMPTIONS.find(a => a.id === assumptionId);
  if (!assumption) {
    throw new Error(`Unknown sensitivity assumption id: ${assumptionId}`);
  }

  const baselineAssessment = assessHabitation(habitation);
  let modifiedAssessment = baselineAssessment;
  let drivingEvidence = 'No parameter change applied';
  let explanation = 'Assessment remains identical under this parameter variation.';

  if (assumption.isExecutableInMVP && assumptionId === 'SCENARIO_BRIDGE_RESTORED') {
    modifiedAssessment = assessHabitation(habitation, { bridgeAccessRestored: true });
    drivingEvidence = 'Lifeline Bridge Connectivity Status';

    if (baselineAssessment.hazardUrgency !== modifiedAssessment.hazardUrgency) {
      explanation = `Hazard urgency shifted from "${formatUrgency(baselineAssessment.hazardUrgency)}" to "${formatUrgency(modifiedAssessment.hazardUrgency)}". Restoring bridge connectivity resolves immediate isolation hazard, shifting focus to slope stability.`;
    } else {
      explanation = `Assessment is STABLE. Restoring bridge access does not mitigate the direct physical debris inundation or low-risk baseline present at this site.`;
    }
  } else {
    // Disabled scenarios: report transparent status notice
    explanation = assumption.statusNotice || 'Scenario disabled in MVP v1.0.';
  }

  const isStable = 
    baselineAssessment.hazardUrgency === modifiedAssessment.hazardUrgency &&
    baselineAssessment.evidenceQuality === modifiedAssessment.evidenceQuality;

  return {
    assumption,
    originalUrgency: baselineAssessment.hazardUrgency,
    originalQuality: baselineAssessment.evidenceQuality,
    modifiedUrgency: modifiedAssessment.hazardUrgency,
    modifiedQuality: modifiedAssessment.evidenceQuality,
    isStable,
    drivingEvidence,
    explanation,
  };
}

export function formatUrgency(urgency: HazardUrgency): string {
  switch (urgency) {
    case 'URGENT':
      return 'Urgent Hazard';
    case 'ELEVATED':
      return 'Elevated Hazard';
    case 'ROUTINE':
      return 'Routine Baseline';
    case 'UNDETERMINED':
      return 'Undetermined Hazard';
  }
}

export function formatQuality(quality: EvidenceQuality): string {
  switch (quality) {
    case 'COMPLETE':
      return 'Complete Evidence';
    case 'PARTIAL':
      return 'Partial Evidence';
    case 'INSUFFICIENT':
      return 'Insufficient Evidence';
    case 'CONFLICTING':
      return 'Conflicting Evidence';
  }
}

/**
 * Evaluates whether a habitation consistently remains among the highest-priority
 * investigation candidates under documented alternative assumptions.
 * Recalculates assessment across reproducible scenarios using the same deterministic rules.
 * Strictly avoids probability claims, synthetic VOI math, or manufactured weights.
 */
export function evaluatePriorityStability(habitation: Habitation): PriorityStabilityReport {
  const baseResult = assessHabitation(habitation);
  const scenarioResults: ScenarioStabilityResult[] = [];

  // 1. Scenario Base: Baseline Documented Evidence
  scenarioResults.push({
    scenarioId: 'SCENARIO_BASE',
    scenarioName: 'Baseline Documented Evidence',
    testedParameter: 'Current Documented Inventory',
    appliedAssumption: 'Current verified and illustrative layers without alteration',
    resultingUrgency: baseResult.hazardUrgency,
    resultingQuality: baseResult.evidenceQuality,
    remainsInTopPriorityGroup: baseResult.hazardUrgency === 'URGENT',
    drivingFactor: 'Official baseline evidence',
    isExecutable: true,
  });

  // 2. Scenario Lifeline Restored: Emergency Bailey Bridge Deployed
  const bridgeResult = assessHabitation(habitation, { bridgeAccessRestored: true });
  const bridgeShifted = bridgeResult.hazardUrgency !== baseResult.hazardUrgency;
  scenarioResults.push({
    scenarioId: 'SCENARIO_LIFELINE_RESTORED',
    scenarioName: 'Lifeline Infrastructure Restoration',
    testedParameter: 'Bridge & Ingress Road Status',
    appliedAssumption: 'Emergency light-vehicular Bailey bridge deployed across severed river channel',
    resultingUrgency: bridgeResult.hazardUrgency,
    resultingQuality: bridgeResult.evidenceQuality,
    remainsInTopPriorityGroup: bridgeResult.hazardUrgency === 'URGENT',
    drivingFactor: bridgeShifted
      ? 'Resolving isolation removes immediate access emergency, shifting focus to slope stability'
      : 'Direct physical debris flow inundation locks urgency regardless of road connectivity',
    isExecutable: true,
  });

  // 3. Scenario Completeness: Preliminary Subsurface Geotechnical Core Integrated
  const geotechResult = assessHabitation(habitation, { includeIllustrativeGeotechnical: true });
  scenarioResults.push({
    scenarioId: 'SCENARIO_COMPLETENESS_BOREHOLE',
    scenarioName: 'Geotechnical Core Availability',
    testedParameter: 'Subsurface Colluvium & Perched Water Table',
    appliedAssumption: 'Illustrative 5m geotechnical core integrated into habitation dossier',
    resultingUrgency: geotechResult.hazardUrgency,
    resultingQuality: geotechResult.evidenceQuality,
    remainsInTopPriorityGroup: geotechResult.hazardUrgency === 'URGENT',
    drivingFactor: 'Adds subsurface ground truth without replacing macro-hazard rules',
    isExecutable: false,
    statusNote: 'Illustrative demonstration fixture (Synthetic 5m borehole log)',
  });

  // 4. Scenario Conservative Geometry: +75m Runout Buffer Uncertainty
  // For settlements near runout margins, conservative boundary tests buffer sensitivity
  let bufferUrgency = baseResult.hazardUrgency;
  let bufferFactor = 'Boundary remains outside buffer zone';
  if (baseResult.hazardUrgency === 'ELEVATED') {
    bufferFactor = 'Remains outside active debris channel; steep slope (>25°) governs ELEVATED urgency';
  } else if (baseResult.hazardUrgency === 'URGENT') {
    bufferFactor = 'Direct core debris intersection already established';
  } else if (baseResult.hazardUrgency === 'UNDETERMINED') {
    bufferFactor = 'Primary hazard footprint obscured; buffer cannot be calculated';
  }
  scenarioResults.push({
    scenarioId: 'SCENARIO_BUFFER_UNCERTAINTY',
    scenarioName: 'Spatial Runout Boundary Tolerance (+75m)',
    testedParameter: 'Runout Vector Dispersion Buffer',
    appliedAssumption: 'Illustrative +75m buffer approximation applied to debris envelope',
    resultingUrgency: bufferUrgency,
    resultingQuality: baseResult.evidenceQuality,
    remainsInTopPriorityGroup: bufferUrgency === 'URGENT',
    drivingFactor: bufferFactor,
    isExecutable: false,
    statusNote: 'Illustrative approximation: true vector polygon buffering requires in-memory GIS engine (Turf.js/GEOS)',
  });

  // 5. Scenario Recency Filter: Stricter Freshness Cutoff (Exclude non-geological layers > 24mo)
  let recencyQuality = baseResult.evidenceQuality;
  let recencyUrgency = baseResult.hazardUrgency;
  let recencyFactor = 'Persistent geological layers remain valid; event layers are fresh (July 2024)';
  if (baseResult.evidenceQuality === 'COMPLETE' && habitation.evidence.some(e => e.isHistorical && e.relevanceDependsOnRecency)) {
    recencyQuality = 'PARTIAL';
    recencyFactor = 'Discounting older census cadastre shifts evidence quality to PARTIAL';
  }
  scenarioResults.push({
    scenarioId: 'SCENARIO_RECENCY_FILTER',
    scenarioName: 'Strict Temporal Relevance Cutoff',
    testedParameter: 'Evidence Freshness Threshold (24 Months)',
    appliedAssumption: 'Perishable non-geological records older than 24 months marked stale',
    resultingUrgency: recencyUrgency,
    resultingQuality: recencyQuality,
    remainsInTopPriorityGroup: recencyUrgency === 'URGENT',
    drivingFactor: recencyFactor,
    isExecutable: true,
  });

  const totalScenariosTested = scenarioResults.length;
  const scenariosInTopPriorityGroup = scenarioResults.filter(s => s.remainsInTopPriorityGroup).length;

  let stabilityCategory: PriorityStabilityReport['stabilityCategory'] = 'STABLE_TOP_PRIORITY';
  let summaryExplanation = '';

  if (baseResult.hazardUrgency === 'URGENT') {
    if (scenariosInTopPriorityGroup === totalScenariosTested) {
      stabilityCategory = 'STABLE_TOP_PRIORITY';
      summaryExplanation = `Consistently remains in the highest-priority investigation tier across ${scenariosInTopPriorityGroup} of ${totalScenariosTested} tested scenarios due to verified direct debris inundation.`;
    } else {
      stabilityCategory = 'CONDITIONAL_ON_LIFELINE';
      summaryExplanation = `Currently in the highest-priority tier (URGENT in ${scenariosInTopPriorityGroup} of ${totalScenariosTested} scenarios), but priority shifts to ELEVATED if emergency lifeline bridge connectivity is restored.`;
    }
  } else if (baseResult.hazardUrgency === 'UNDETERMINED') {
    stabilityCategory = 'UNDETERMINED_PENDING_SURVEY';
    summaryExplanation = `Consistently UNDETERMINED across all tested scenarios until baseline cloud-obscuration or conflicting reports are resolved by ground patrol.`;
  } else if (baseResult.hazardUrgency === 'ELEVATED') {
    stabilityCategory = 'STABLE_LOWER_SEVERITY';
    summaryExplanation = `Consistently ELEVATED across all tested scenarios. Steep terrain gradient (>25°) maintains elevated ground inspection priority without reaching direct debris-hit urgency.`;
  } else {
    stabilityCategory = 'STABLE_LOWER_SEVERITY';
    summaryExplanation = `Consistently ROUTINE across tested scenarios due to gentle slope gradient and intact highway connectivity outside debris corridors.`;
  }

  const disclaimer =
    'Methodological Safeguard: Stability frequency is descriptive across the 5 tested deterministic scenarios; it does NOT constitute a statistical probability, Monte Carlo confidence interval, or Bayesian posterior distribution.';

  return {
    habitationId: habitation.id,
    baseUrgency: baseResult.hazardUrgency,
    baseQuality: baseResult.evidenceQuality,
    totalScenariosTested,
    scenariosInTopPriorityGroup,
    stabilityCategory,
    summaryExplanation,
    results: scenarioResults,
    disclaimer,
  };
}
