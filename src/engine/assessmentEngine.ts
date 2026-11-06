import type { Habitation, PrioritisationResult, HazardUrgency, EvidenceQuality } from '../types/habitation';
import type { EvidenceItem, EvidenceDomain, QualityStatus } from '../types/evidence';

export const REQUIRED_EVIDENCE_DOMAINS: EvidenceDomain[] = [
  'HAZARD_IMPACT',
  'TERRAIN_GEOLOGY',
  'SETTLEMENT_EXPOSURE',
  'INFRASTRUCTURE_ACCESS',
];

export const CRITICAL_EVIDENCE_DOMAINS: EvidenceDomain[] = [
  'HAZARD_IMPACT',
  'TERRAIN_GEOLOGY',
  'SETTLEMENT_EXPOSURE',
  'INFRASTRUCTURE_ACCESS',
];

export interface AssessmentOptions {
  bridgeAccessRestored?: boolean; // default false
  includeIllustrativeGeotechnical?: boolean; // default false
}

/**
 * Deterministic assessment engine for SHELTERTRACE.
 * Evaluates available evidence according to inspectable, reproducible rules.
 * Separates physical Hazard Urgency (URGENT, ELEVATED, ROUTINE, UNDETERMINED)
 * from epistemic Evidence Quality (COMPLETE, PARTIAL, INSUFFICIENT, CONFLICTING).
 * Validates domain existence so missing critical domains cannot yield COMPLETE or imply safety.
 * Does NOT generate black-box weighted numerical scores.
 */
export function assessHabitation(
  habitation: Habitation,
  options: AssessmentOptions = {}
): PrioritisationResult {
  const {
    bridgeAccessRestored = false,
    includeIllustrativeGeotechnical = false,
  } = options;

  let evidenceList: EvidenceItem[] = [...habitation.evidence];

  // Optional geotechnical inclusion (strictly labelled as illustrative)
  if (includeIllustrativeGeotechnical) {
    const hasGeotech = evidenceList.some(e => e.id.includes('geotech') || e.name.toLowerCase().includes('borehole'));
    if (!hasGeotech) {
      evidenceList.push({
        id: `geotech-${habitation.id}`,
        name: 'Simulated Geotechnical Borehole Log',
        domain: 'FIELD_VERIFICATION',
        category: 'ILLUSTRATIVE',
        finding: 'Borehole log indicates 3.8m colluvial mantle over weathered gneissic bedrock with perched groundwater table.',
        status: 'COMPLETE',
        sourceOrg: 'Illustrative Geotechnical Field Team',
        sourceReference: 'Hypothetical borehole record BH-W-04 (demonstration only)',
        observationDate: '2024-08-05',
        spatialResolution: 'Point measurement (approximate 5m)',
        knownLimitations: ['Illustrative demonstration data only; not verified on ground by GSI.'],
        isCritical: false,
      });
    }
  }

  // If bridge access is restored hypothetically, modify infrastructure evidence
  if (bridgeAccessRestored) {
    evidenceList = evidenceList.map(item => {
      if (item.domain === 'INFRASTRUCTURE_ACCESS' && item.finding.toLowerCase().includes('severed')) {
        return {
          ...item,
          finding: '[ASSUMPTION: TEMPORARY BAILEY BRIDGE DEPLOYED] Foot & light vehicle vehicular access restored.',
          status: 'COMPLETE' as QualityStatus,
        };
      }
      return item;
    });
  }

  // ---------------------------------------------------------
  // 1. Evaluate Evidence Quality & Completeness (Dimension 1)
  // ---------------------------------------------------------
  const conflictingItems = evidenceList.filter(e => e.isContradictory || e.status === 'CONFLICTING');
  const criticalItems = evidenceList.filter(e => e.isCritical);
  const missingCriticalItems = criticalItems.filter(e => e.status === 'INSUFFICIENT');
  const partialItems = evidenceList.filter(e => e.status === 'PARTIAL');

  // Explicit domain existence check (not merely inspecting statuses of existing items)
  const presentDomains = new Set<EvidenceDomain>(evidenceList.map(e => e.domain));
  const absentRequiredDomains = REQUIRED_EVIDENCE_DOMAINS.filter(d => !presentDomains.has(d));
  const absentCriticalDomains = CRITICAL_EVIDENCE_DOMAINS.filter(d => !presentDomains.has(d));

  let evidenceQuality: EvidenceQuality = 'COMPLETE';
  if (conflictingItems.length > 0) {
    evidenceQuality = 'CONFLICTING';
  } else if (missingCriticalItems.length > 0 || absentCriticalDomains.length > 0) {
    evidenceQuality = 'INSUFFICIENT';
  } else if (partialItems.length > 0 || absentRequiredDomains.length > 0) {
    evidenceQuality = 'PARTIAL';
  }

  const missingEvidence: string[] = [];

  // Report entirely absent required/critical baseline domains
  absentRequiredDomains.forEach(domain => {
    const isCritical = CRITICAL_EVIDENCE_DOMAINS.includes(domain);
    missingEvidence.push(
      `[Missing Domain] ${domain}: ${isCritical ? 'Critical' : 'Required'} baseline evidence domain is entirely absent.`
    );
  });

  // Report present critical items marked INSUFFICIENT
  missingCriticalItems.forEach(item => {
    missingEvidence.push(
      `${item.name} (${item.domain}): ${item.finding || 'Missing critical baseline measurement'}`
    );
  });

  const conflictingEvidence: string[] = conflictingItems.map(
    item => `${item.name}: ${item.contradictionNote || item.finding}`
  );

  const limitations: string[] = [];
  evidenceList.forEach(e => {
    e.knownLimitations.forEach(lim => {
      if (!limitations.includes(lim)) limitations.push(lim);
    });
  });

  const detailedReasoning: string[] = [];
  const applicableRules: string[] = [];
  const recommendedFieldChecks: string[] = [];

  // Extract key indicators by domain
  const hazardImpact = evidenceList.find(e => e.domain === 'HAZARD_IMPACT');
  const terrainEvidence = evidenceList.find(e => e.domain === 'TERRAIN_GEOLOGY');
  const settlementEvidence = evidenceList.find(e => e.domain === 'SETTLEMENT_EXPOSURE');
  const infraEvidence = evidenceList.find(e => e.domain === 'INFRASTRUCTURE_ACCESS');
  const fieldEvidence = evidenceList.find(e => e.domain === 'FIELD_VERIFICATION');

  const hazardFinding = hazardImpact ? hazardImpact.finding.toLowerCase() : '';
  const isExplicitlyNoImpact = 
    hazardFinding.includes('no mapped') || 
    hazardFinding.includes('no debris flow') || 
    hazardFinding.includes('outside') ||
    hazardFinding.includes('unaffected');

  const hasObservedImpact = 
    hazardImpact && 
    (hazardImpact.category === 'OBSERVED' || hazardImpact.category === 'DERIVED') &&
    hazardImpact.status !== 'CONFLICTING' &&
    hazardImpact.status !== 'INSUFFICIENT' &&
    !isExplicitlyNoImpact &&
    (hazardFinding.includes('direct intersection') || 
     hazardFinding.includes('directly intersects') || 
     hazardFinding.includes('inundated') || 
     hazardFinding.includes('scoured') ||
     (hazardFinding.includes('intersect') && !hazardFinding.includes('no ')));

  const isAccessSevered = 
    infraEvidence && 
    infraEvidence.finding.toLowerCase().includes('severed') && 
    infraEvidence.status !== 'INSUFFICIENT';

  const isHighSusceptibility = 
    terrainEvidence &&
    terrainEvidence.status !== 'INSUFFICIENT' &&
    (terrainEvidence.finding.toLowerCase().includes('high susceptibility') ||
     terrainEvidence.finding.toLowerCase().includes('very high') ||
     (terrainEvidence.valueNumeric !== undefined && terrainEvidence.valueNumeric > 25)); // slope > 25 deg

  const isModerateSusceptibility = 
    terrainEvidence &&
    terrainEvidence.status !== 'INSUFFICIENT' &&
    (terrainEvidence.finding.toLowerCase().includes('moderate susceptibility') ||
     terrainEvidence.finding.toLowerCase().includes('moderate'));

  // ---------------------------------------------------------
  // 2. Evaluate Physical Hazard Urgency (Dimension 2)
  // ---------------------------------------------------------
  let hazardUrgency: HazardUrgency = 'ROUTINE';
  let primaryReason = '';

  // BRANCH A: Direct Observed Event Impact
  if (hasObservedImpact) {
    hazardUrgency = 'URGENT';
    applicableRules.push('RULE-IMPACT-01: Direct Observed Debris Flow Inundation');
    primaryReason = 'Mapped physical landslide / debris flow envelope directly intersects habitation boundary with exposed structures.';
    detailedReasoning.push(
      'Direct physical evidence (satellite-mapped debris flow track) intersects the settlement cluster.',
      `Documented settlement exposure: ${settlementEvidence ? settlementEvidence.finding : `${habitation.buildingCount} buildings, est. population ${habitation.estimatedPopulation}`}.`,
      'Immediate field verification is necessary to confirm structural integrity, bank erosion, and secondary slump danger.'
    );
    recommendedFieldChecks.push(
      'Inspect foundation toe-scour and bank undercut along stream banks.',
      'Evaluate structural habitability and identify buildings requiring structural red-tagging.',
      'Assess active slope tension cracks on uphill slopes above remaining houses.'
    );
  }
  // BRANCH B: Severed Lifeline Access in Susceptible / Mountain Terrain
  // (CRUCIAL: Evaluated before missing/conflicting hazard checks so confirmed
  // access severance in steep terrain is not suppressed when hazard footprint is missing)
  else if (isAccessSevered && (isHighSusceptibility || isModerateSusceptibility)) {
    hazardUrgency = 'URGENT';
    applicableRules.push('RULE-INFRA-01: Lifeline Access Severance in Susceptible Valley Flank');
    primaryReason = 'Complete severance of lifeline access route (bridge/road wash-out) creates critical isolation in hazardous terrain.';
    detailedReasoning.push(
      'Primary evacuation and supply access has been physically severed by bridge failure or road subsidence.',
      'Even in the absence of total debris inundation over the core settlement, isolated habitations cannot receive emergency relief or safe egress.',
      'Urgent ground inspection required to determine if evacuation by temporary bridge or aerial means is mandatory.'
    );
    if (!hazardImpact || hazardImpact.status === 'INSUFFICIENT') {
      detailedReasoning.push(
        'CRITICAL ACCESS FINDING: Lifeline access is confirmed severed in hazardous terrain, but satellite hazard footprint is unavailable or unverified. Urgency is evaluated as URGENT for emergency field access despite incomplete hazard footprint coverage.'
      );
    }
    recommendedFieldChecks.push(
      'Assess alternative foot-trail stability across steep side-slopes.',
      'Verify civilian casualty/isolation status and emergency medical requirement.',
      'Evaluate site for temporary Bailey bridge or aerial ropeway staging.'
    );
  }
  // BRANCH C: Primary Hazard Observation is Contradicted
  else if (hazardImpact?.status === 'CONFLICTING') {
    hazardUrgency = 'UNDETERMINED';
    applicableRules.push('RULE-CONFL-01: Conflicting Primary Hazard Evidence');
    primaryReason = 'Primary hazard observation is directly contradicted by local reporting. Ground reconciliation required to determine physical hazard urgency.';
    detailedReasoning.push(
      'Contradictory information exists between independent data layers (e.g. satellite change anomaly vs local administrative clearance memo).',
      'Physical hazard urgency cannot be safely determined while fundamental observational evidence remains contradictory.',
      `Conflicting items flagged: ${conflictingItems.map(i => i.name).join(', ')}.`
    );
    recommendedFieldChecks.push(
      'Deploy joint geotechnical-remote sensing team to verify ground surface rupture vs satellite polygon discrepancies.',
      'Document high-water/mud debris tide marks on standing structures.'
    );
  }
  // BRANCH D: Critical Baseline Hazard Footprint Missing (Cloud cover / unsurveyed)
  else if (!hazardImpact || hazardImpact.status === 'INSUFFICIENT') {
    hazardUrgency = 'UNDETERMINED';
    applicableRules.push('RULE-INSUFF-01: Critical Baseline Hazard Evidence Missing');
    primaryReason = 'Critical baseline hazard evidence (satellite runout / mapped footprint) is missing or unverified. Physical hazard urgency cannot be determined.';
    detailedReasoning.push(
      'Essential hazard footprint evidence is unavailable or marked insufficient.',
      'According to core principles, insufficient evidence MUST NEVER be interpreted as low risk or safe.',
      'Physical hazard classification is deferred until baseline geospatial coverage is integrated.'
    );
    recommendedFieldChecks.push(
      'Acquire cloud-free post-event satellite imagery or radar SAR.',
      'Conduct drone orthophoto survey of settlement periphery.'
    );
  }
  // BRANCH E: High Modelled Susceptibility & Steep Slope (Verified Outside Impact, Intact Access)
  else if (isHighSusceptibility) {
    hazardUrgency = 'ELEVATED';
    applicableRules.push('RULE-SUSC-01: Modelled Susceptibility & Steep Slope Exposure');
    primaryReason = 'High modelled landslide susceptibility and steep terrain slope (>25°) with exposed settlement, outside direct mapped debris flow intersection.';
    detailedReasoning.push(
      'Habitation lies in a macro-scale High/Very High susceptibility zone on steep terrain gradient.',
      'While outside the primary debris channel, steep slope gradient and high rainfall present risk of secondary slope failure.',
      'Detailed site investigation required prior to making resettlement or habitation clearance decisions.'
    );
    recommendedFieldChecks.push(
      'Conduct geological slope profiling for crown cracks and fresh soil creep.',
      'Measure subsurface water seepage points on uphill cuttings.'
    );
  }
  // BRANCH F: Critical Terrain Slope Baseline Missing
  else if (!terrainEvidence || terrainEvidence.status === 'INSUFFICIENT') {
    hazardUrgency = 'UNDETERMINED';
    applicableRules.push('RULE-INSUFF-02: Critical Terrain Slope Baseline Missing');
    primaryReason = 'Critical terrain elevation and slope stability baseline data is missing. Physical hazard urgency cannot be determined without slope verification.';
    detailedReasoning.push(
      'Terrain slope gradient and elevation data are unverified or missing.',
      'Without verified terrain slope metrics, the system cannot confirm whether the habitation is on safe flat terrain or an unstable escarpment.',
      'Hazard urgency remains UNDETERMINED until slope profiling is completed.'
    );
    recommendedFieldChecks.push(
      'Conduct ground topographic survey and slope angle measurement.',
      'Integrate high-resolution bare-earth DEM.'
    );
  }
  // BRANCH G: Routine Baseline (Outside debris flow, gentle slope, normal access, baseline verified)
  else {
    hazardUrgency = 'ROUTINE';
    applicableRules.push('RULE-MONIT-01: Baseline Regional Monsoon Monitoring');
    primaryReason = 'Outside direct mapped debris flow footprint with moderate-to-low terrain slope and accessible road connectivity.';
    detailedReasoning.push(
      'Terrain slope is relatively gentle (<20°) and outside mapped debris flow runout channels.',
      'Direct structural impact not indicated by current satellite coverage.',
      'Maintain standard automated rainfall threshold monitoring (IMD/KSWTD) during active monsoon.'
    );
    recommendedFieldChecks.push(
      'Periodic visual check of road culverts and roadside drainage ditches.',
      'Verify local drainage discharge channels for blockage.'
    );
  }

  // ---------------------------------------------------------
  // 3. Epistemic Cross-Notes (Preserving orthogonal visibility)
  // ---------------------------------------------------------
  if (hazardUrgency === 'URGENT' && evidenceQuality === 'INSUFFICIENT') {
    detailedReasoning.push(
      'EVIDENCE INTEGRITY NOTICE: Physical urgency is confirmed as URGENT based on observed physical evidence, but evidence quality is INSUFFICIENT due to missing secondary baseline data.'
    );
  }

  if (hazardUrgency === 'URGENT' && evidenceQuality === 'CONFLICTING') {
    detailedReasoning.push(
      'EVIDENCE INTEGRITY NOTICE: Physical urgency is URGENT, but conflicting intelligence exists in secondary reports that must be resolved.'
    );
  }

  if (hazardUrgency === 'ELEVATED' && evidenceQuality === 'INSUFFICIENT') {
    detailedReasoning.push(
      'EVIDENCE INTEGRITY NOTICE: Modelled susceptibility indicates ELEVATED hazard, but critical settlement or geotechnical baseline layers are INSUFFICIENT.'
    );
  }

  if (!fieldEvidence || fieldEvidence.status === 'INSUFFICIENT') {
    detailedReasoning.push('NOTE: No formal post-disaster field engineering inspection report has been uploaded for this habitation yet.');
    if (!recommendedFieldChecks.some(c => c.includes('Deploy geotechnical') || c.includes('standardized'))) {
      recommendedFieldChecks.unshift('Complete standardized rapid visual damage and geotechnical field checklist.');
    }
  }

  return {
    habitationId: habitation.id,
    hazardUrgency,
    evidenceQuality,
    primaryReason,
    detailedReasoning,
    supportingEvidence: evidenceList,
    missingEvidence,
    conflictingEvidence,
    limitations,
    recommendedFieldChecks,
    applicableRules,
    isDemonstrationOnly: !!habitation.isIllustrativeRecord,
  };
}
