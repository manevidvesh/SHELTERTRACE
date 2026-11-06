import type { Habitation, PrioritisationResult } from '../types/habitation';

export type PriorityChangePotential = 'CAN_CHANGE_PRIORITY' | 'CAN_CONFIRM_QUALITY_ONLY' | 'NO_CHANGE_EXPECTED' | 'UNKNOWN';

export interface FieldInvestigationSuggestion {
  id: string;
  fieldCheck: string;
  reason: string;
  relatedMissingEvidence: string;
  dependentFinding: string;
  potentialEffect: string;
  canChangePriority: PriorityChangePotential;
  impactLevel: 'CRITICAL_DECISION_MAKER' | 'EPISTEMIC_VERIFICATION' | 'ROUTINE_MONITORING';
  priorityRank: number; // 1 = highest impact on decision
}

/**
 * Deterministically generates prioritized field investigation suggestions
 * based on actual missing evidence, contradictory reports, and rule dependencies.
 * Ranks suggestions by potential to change the habitation's investigation priority.
 * Does NOT calculate synthetic probabilities, costs, or VOI percentages.
 */
export function generateInvestigationSuggestions(
  habitation: Habitation,
  result: PrioritisationResult
): FieldInvestigationSuggestion[] {
  const suggestions: FieldInvestigationSuggestion[] = [];
  let nextId = 1;

  // Extract key indicators
  const hazardImpact = habitation.evidence.find(e => e.domain === 'HAZARD_IMPACT');
  const terrainEvidence = habitation.evidence.find(e => e.domain === 'TERRAIN_GEOLOGY');
  const infraEvidence = habitation.evidence.find(e => e.domain === 'INFRASTRUCTURE_ACCESS');
  const fieldEvidence = habitation.evidence.find(e => e.domain === 'FIELD_VERIFICATION');

  const isAccessSevered = infraEvidence && infraEvidence.finding.toLowerCase().includes('severed');
  const isHighSlope = terrainEvidence && terrainEvidence.valueNumeric !== undefined && terrainEvidence.valueNumeric > 25;

  // 1. Case: Critical Hazard Footprint is Missing or Obscured (e.g. Nedumpala)
  const missingHazard = result.missingEvidence.find(m => m.includes('HAZARD_IMPACT'));
  if (missingHazard || !hazardImpact || hazardImpact.status === 'INSUFFICIENT') {
    suggestions.push({
      id: `sug-${habitation.id}-${nextId++}`,
      fieldCheck: 'Deploy drone orthophoto survey / radar SAR pass to delineate debris flow runout boundaries',
      reason: 'Current assessment is UNDETERMINED because optical satellite coverage was obscured by persistent monsoon cloud deck.',
      relatedMissingEvidence: missingHazard || 'HAZARD_IMPACT: Satellite runout boundary unmapped due to cloud cover',
      dependentFinding: 'Direct intersection of debris flow envelope with residential building cluster',
      potentialEffect: 'Confirming debris runout intersection shifts hazard urgency from UNDETERMINED to URGENT. Confirming clear perimeter shifts urgency to ELEVATED (if steep slope) or ROUTINE.',
      canChangePriority: 'CAN_CHANGE_PRIORITY',
      impactLevel: 'CRITICAL_DECISION_MAKER',
      priorityRank: 1,
    });
  }

  // 2. Case: Contradictory Evidence Detected (e.g. Kottappadi)
  if (result.conflictingEvidence.length > 0 || (hazardImpact && hazardImpact.status === 'CONFLICTING')) {
    suggestions.push({
      id: `sug-${habitation.id}-${nextId++}`,
      fieldCheck: 'Joint geotechnical and remote-sensing patrol to reconcile ground surface rupture vs local reporting',
      reason: 'Primary hazard evidence is contradicted by an administrative or field clearance memo. Epistemic quality is CONFLICTING.',
      relatedMissingEvidence: 'Ground-truth reconciliation of contradictory satellite change anomaly vs local administrative clearance report',
      dependentFinding: 'Physical reality of debris flow scar and structural inundation',
      potentialEffect: 'Ground verification resolves contradictory layers, allowing definitive hazard classification (shifting from UNDETERMINED to URGENT or ROUTINE).',
      canChangePriority: 'CAN_CHANGE_PRIORITY',
      impactLevel: 'CRITICAL_DECISION_MAKER',
      priorityRank: 1,
    });
  }

  // 3. Case: Severed Lifeline Access in Susceptible Terrain (e.g. Attamala)
  const isRuleInfra = result.applicableRules.some(r => r.includes('RULE-INFRA-01'));
  if (isRuleInfra || (isAccessSevered && isHighSlope && !result.applicableRules.some(r => r.includes('RULE-IMPACT-01')))) {
    suggestions.push({
      id: `sug-${habitation.id}-${nextId++}`,
      fieldCheck: 'Survey pedestrian bypass stability and evaluate bridgehead for temporary Bailey bridge or ropeway staging',
      reason: 'Lifeline route wash-out isolates human settlement in high-susceptibility mountain terrain.',
      relatedMissingEvidence: 'Engineering feasibility of emergency light vehicular ingress across severed river channel',
      dependentFinding: 'Lifeline road connectivity and emergency medical evacuation access',
      potentialEffect: 'Deploying temporary bridge resolves emergency isolation hazard, shifting classification from URGENT to ELEVATED (slope-monitoring).',
      canChangePriority: 'CAN_CHANGE_PRIORITY',
      impactLevel: 'CRITICAL_DECISION_MAKER',
      priorityRank: 1,
    });
  }

  // 4. Case: Missing Critical Terrain / Slope Baseline
  const missingTerrain = result.missingEvidence.find(m => m.includes('TERRAIN_GEOLOGY'));
  if (missingTerrain || !terrainEvidence || terrainEvidence.status === 'INSUFFICIENT') {
    suggestions.push({
      id: `sug-${habitation.id}-${nextId++}`,
      fieldCheck: 'Conduct ground topographic profiling and slope angle clinometer measurement',
      reason: 'Critical terrain slope baseline is unavailable. Without slope metrics, slope instability cannot be bounded.',
      relatedMissingEvidence: missingTerrain || 'TERRAIN_GEOLOGY: Bare-earth elevation and slope gradient missing',
      dependentFinding: 'Escarpment slope gradient and landslide susceptibility zonation',
      potentialEffect: 'Slope > 25° escalates urgency to ELEVATED (or URGENT if access is severed); slope < 20° establishes ROUTINE baseline.',
      canChangePriority: 'CAN_CHANGE_PRIORITY',
      impactLevel: 'CRITICAL_DECISION_MAKER',
      priorityRank: 1,
    });
  }

  // 5. Case: Direct Observed Impact (e.g. Punchirimattom, Mundakkai, Chooralmala)
  const isRuleImpact = result.applicableRules.some(r => r.includes('RULE-IMPACT-01'));
  if (isRuleImpact || (result.hazardUrgency === 'URGENT' && !isRuleInfra)) {
    suggestions.push({
      id: `sug-${habitation.id}-${nextId++}`,
      fieldCheck: 'Inspect foundation toe-scour, bank undercutting, and active tension cracks on uphill slopes',
      reason: 'Direct physical debris flow inundation observed. Urgent structural habitability assessment required.',
      relatedMissingEvidence: 'FIELD_VERIFICATION: Standardized post-disaster rapid visual damage and foundation stability inspection report',
      dependentFinding: 'Structural integrity of standing dwellings and threat of secondary slope slumping',
      potentialEffect: 'Direct physical inundation already locks physical urgency at URGENT. Field check verifies red-tagging perimeter and upgrades evidence quality from PARTIAL to COMPLETE.',
      canChangePriority: 'CAN_CONFIRM_QUALITY_ONLY',
      impactLevel: 'EPISTEMIC_VERIFICATION',
      priorityRank: 2,
    });
  }

  // 6. Case: Elevated Susceptibility Outside Debris Flow (e.g. Kalladi)
  if (result.hazardUrgency === 'ELEVATED') {
    suggestions.push({
      id: `sug-${habitation.id}-${nextId++}`,
      fieldCheck: 'Geological slope walk-over to detect fresh crown tension cracks, soil creep, and subsurface seepage',
      reason: 'Settlement lies on steep terrain (>25°) within High susceptibility zone, outside primary debris channel.',
      relatedMissingEvidence: 'Micro-scale geotechnical soil mantle stability and groundwater seepage observations',
      dependentFinding: 'Active slope deformation and impending secondary mass movement potential',
      potentialEffect: 'Detecting active tension cracks or bulging escalates urgency from ELEVATED to URGENT. Absence of deformation maintains ELEVATED monitoring.',
      canChangePriority: 'CAN_CHANGE_PRIORITY',
      impactLevel: 'CRITICAL_DECISION_MAKER',
      priorityRank: 1,
    });
  }

  // 7. Case: Routine Baseline (e.g. Meppadi Town)
  if (result.hazardUrgency === 'ROUTINE') {
    suggestions.push({
      id: `sug-${habitation.id}-${nextId++}`,
      fieldCheck: 'Inspect roadside drainage culverts and stormwater discharge channels for sediment blockage',
      reason: 'Outside debris flow corridor on gentle terrain with intact highway access.',
      relatedMissingEvidence: 'Local monsoon drainage maintenance clearance status',
      dependentFinding: 'Culvert capacity during localized extreme cloudburst events',
      potentialEffect: 'Routine maintenance check. Unlikely to change assessment unless major secondary channel blockage is discovered.',
      canChangePriority: 'NO_CHANGE_EXPECTED',
      impactLevel: 'ROUTINE_MONITORING',
      priorityRank: 3,
    });
  }

  // 8. Pending General Field Verification Check (if no formal field inspection exists)
  if (!fieldEvidence || fieldEvidence.status === 'INSUFFICIENT' || fieldEvidence.status === 'PARTIAL') {
    // Only add if not already covered by specific suggestions above
    if (!suggestions.some(s => s.fieldCheck.includes('visual damage') || s.fieldCheck.includes('walk-over'))) {
      suggestions.push({
        id: `sug-${habitation.id}-${nextId++}`,
        fieldCheck: 'Complete standardized rapid visual damage and geotechnical field checklist',
        reason: 'No formal post-disaster engineering inspection report has been uploaded to the habitation dossier.',
        relatedMissingEvidence: 'FIELD_VERIFICATION: Standardized post-disaster field inspection checklist',
        dependentFinding: 'Ground verification of dwelling habitability and slope creep',
        potentialEffect: 'Supplies missing ground-truth baseline; upgrades evidence quality from PARTIAL to COMPLETE.',
        canChangePriority: 'CAN_CONFIRM_QUALITY_ONLY',
        impactLevel: 'EPISTEMIC_VERIFICATION',
        priorityRank: 2,
      });
    }
  }

  // Sort by priorityRank (1 = highest decision impact)
  return suggestions.sort((a, b) => a.priorityRank - b.priorityRank);
}
