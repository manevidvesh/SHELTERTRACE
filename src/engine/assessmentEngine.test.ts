import { describe, it, expect } from 'vitest';
import {
  assessHabitation,
  REQUIRED_EVIDENCE_DOMAINS,
  CRITICAL_EVIDENCE_DOMAINS,
} from './assessmentEngine';
import { evaluateSensitivity, DOCUMENTED_SENSITIVITY_ASSUMPTIONS } from './sensitivityEngine';
import { WAYANAD_HABITATIONS } from '../data/wayanadHabitations';
import {
  OBSERVED_DEBRIS_FLOW_GEOJSON,
  MODELLED_SUSCEPTIBILITY_GEOJSON,
} from '../data/wayanadGeoJson';
import type { Habitation } from '../types/habitation';

describe('SHELTERTRACE Assessment Engine - Two-Dimension Evaluation', () => {
  it('assigns URGENT hazard urgency to habitations with direct observed debris flow impact (e.g. Mundakkai)', () => {
    const mundakkai = WAYANAD_HABITATIONS.find(h => h.id === 'hab-mundakkai')!;
    expect(mundakkai).toBeDefined();

    const result = assessHabitation(mundakkai);
    expect(result.hazardUrgency).toBe('URGENT');
    expect(result.primaryReason).toContain('Mapped physical landslide / debris flow envelope directly intersects');
    expect(result.applicableRules).toContain('RULE-IMPACT-01: Direct Observed Debris Flow Inundation');
    expect(result.recommendedFieldChecks.length).toBeGreaterThan(0);
  });

  it('assigns URGENT hazard urgency to isolated habitations with severed infrastructure access (e.g. Attamala)', () => {
    const attamala = WAYANAD_HABITATIONS.find(h => h.id === 'hab-attamala')!;
    expect(attamala).toBeDefined();

    const result = assessHabitation(attamala);
    expect(result.hazardUrgency).toBe('URGENT');
    expect(result.primaryReason).toContain('Complete severance of lifeline access route');
    expect(result.applicableRules).toContain('RULE-INFRA-01: Lifeline Access Severance in Susceptible Valley Flank');
  });

  it('assigns ELEVATED hazard urgency to habitations with high susceptibility and steep slope but no direct mapped debris impact (e.g. Kalladi)', () => {
    const kalladi = WAYANAD_HABITATIONS.find(h => h.id === 'hab-kalladi')!;
    expect(kalladi).toBeDefined();

    const result = assessHabitation(kalladi);
    expect(result.hazardUrgency).toBe('ELEVATED');
    expect(result.primaryReason).toContain('High modelled landslide susceptibility and steep terrain slope (>25°)');
    expect(result.applicableRules).toContain('RULE-SUSC-01: Modelled Susceptibility & Steep Slope Exposure');
  });

  it('assigns UNDETERMINED hazard urgency and CONFLICTING evidence quality when primary hazard evidence is contradicted (e.g. Kottappadi)', () => {
    const kottappadi = WAYANAD_HABITATIONS.find(h => h.id === 'hab-kottappadi')!;
    expect(kottappadi).toBeDefined();

    const result = assessHabitation(kottappadi);
    expect(result.hazardUrgency).toBe('UNDETERMINED');
    expect(result.evidenceQuality).toBe('CONFLICTING');
    expect(result.conflictingEvidence.length).toBeGreaterThan(0);
    expect(result.primaryReason).toContain('Primary hazard observation is directly contradicted');
    expect(result.applicableRules).toContain('RULE-CONFL-01: Conflicting Primary Hazard Evidence');
  });

  it('assigns UNDETERMINED hazard urgency and INSUFFICIENT evidence quality when baseline hazard footprint is missing (e.g. Nedumpala)', () => {
    const nedumpala = WAYANAD_HABITATIONS.find(h => h.id === 'hab-nedumpala')!;
    expect(nedumpala).toBeDefined();

    const result = assessHabitation(nedumpala);
    expect(result.hazardUrgency).toBe('UNDETERMINED');
    expect(result.evidenceQuality).toBe('INSUFFICIENT');
    expect(result.missingEvidence.length).toBeGreaterThan(0);
    // Crucial requirement: System explicitly refuses to claim safe or routine!
    expect(result.hazardUrgency).not.toBe('ROUTINE');
    expect(result.primaryReason).toContain('Critical baseline hazard evidence (satellite runout / mapped footprint) is missing');
    expect(result.applicableRules).toContain('RULE-INSUFF-01: Critical Baseline Hazard Evidence Missing');
  });

  it('assigns ROUTINE hazard urgency and COMPLETE evidence quality to unaffected staging hubs outside debris corridors (e.g. Meppadi Town)', () => {
    const meppadi = WAYANAD_HABITATIONS.find(h => h.id === 'hab-meppadi-town')!;
    expect(meppadi).toBeDefined();

    const result = assessHabitation(meppadi);
    expect(result.hazardUrgency).toBe('ROUTINE');
    expect(result.evidenceQuality).toBe('COMPLETE');
    expect(result.primaryReason).toContain('Outside direct mapped debris flow footprint');
    expect(result.applicableRules).toContain('RULE-MONIT-01: Baseline Regional Monsoon Monitoring');
  });

  it('correctly decouples physical hazard urgency from missing secondary evidence (URGENT + INSUFFICIENT)', () => {
    // Construct test settlement with direct observed impact, but missing terrain slope data
    const impactWithMissingTerrain: Habitation = {
      id: 'hab-test-urgent-insufficient',
      name: 'Test Settlement Inundated with Missing Terrain',
      localAdministrativeUnit: 'Test Unit',
      centroid: [11.53, 76.15],
      elevationMeters: 900,
      estimatedPopulation: 150,
      buildingCount: 30,
      tags: ['Test'],
      evidence: [
        {
          id: 'ev-test-impact',
          name: 'Direct Debris Flow Footprint',
          domain: 'HAZARD_IMPACT',
          category: 'OBSERVED',
          finding: 'Direct intersection: mud and boulder slurry inundated core residential cluster.',
          status: 'COMPLETE',
          sourceOrg: 'Test Space Agency',
          sourceReference: 'Test Satellite Runout Vector',
          observationDate: '2024-07-31',
          spatialResolution: '10m',
          knownLimitations: [],
          isCritical: true,
        },
        {
          id: 'ev-test-terrain-missing',
          name: 'Copernicus DEM Slope',
          domain: 'TERRAIN_GEOLOGY',
          category: 'DERIVED',
          finding: 'DATA UNAVAILABLE: Terrain elevation model missing for parcel.',
          status: 'INSUFFICIENT',
          sourceOrg: 'ESA',
          sourceReference: 'GLO-30 Missing Tile',
          observationDate: '2021-11-30',
          spatialResolution: 'Unresolved',
          knownLimitations: ['Missing critical terrain baseline.'],
          isCritical: true,
        },
      ],
    };

    const result = assessHabitation(impactWithMissingTerrain);
    // Physical hazard is URGENT (direct observed impact is not erased)
    expect(result.hazardUrgency).toBe('URGENT');
    // Epistemic quality is INSUFFICIENT (due to missing critical slope layer)
    expect(result.evidenceQuality).toBe('INSUFFICIENT');
    expect(result.detailedReasoning.some(r => r.includes('EVIDENCE INTEGRITY NOTICE'))).toBe(true);
  });

  it('correctly handles high susceptibility with incomplete settlement evidence (ELEVATED + INSUFFICIENT)', () => {
    const suscWithMissingSettlement: Habitation = {
      id: 'hab-test-susc-insufficient',
      name: 'Test Settlement High Slope with Incomplete Cadastre',
      localAdministrativeUnit: 'Test Unit',
      centroid: [11.54, 76.13],
      elevationMeters: 850,
      estimatedPopulation: 50,
      buildingCount: 10,
      tags: ['Test'],
      evidence: [
        {
          id: 'ev-test-impact-none',
          name: 'Satellite Event Footprint',
          domain: 'HAZARD_IMPACT',
          category: 'OBSERVED',
          finding: 'Outside mapped debris flow track.',
          status: 'COMPLETE',
          sourceOrg: 'Test Space Agency',
          sourceReference: 'Event Polygon',
          observationDate: '2024-07-31',
          spatialResolution: '10m',
          knownLimitations: [],
          isCritical: true,
        },
        {
          id: 'ev-test-terrain-steep',
          name: 'Copernicus DEM Slope',
          domain: 'TERRAIN_GEOLOGY',
          category: 'DERIVED',
          finding: 'Mean slope gradient 29.5° on steep escarpment.',
          valueNumeric: 29.5,
          valueUnit: 'degrees',
          status: 'COMPLETE',
          sourceOrg: 'ESA',
          sourceReference: 'GLO-30',
          observationDate: '2021-11-30',
          spatialResolution: '30m',
          knownLimitations: [],
          isCritical: true,
        },
        {
          id: 'ev-test-settlement-missing',
          name: 'Building Cadastre',
          domain: 'SETTLEMENT_EXPOSURE',
          category: 'OBSERVED',
          finding: 'DATA UNAVAILABLE: Building footprints unmapped.',
          status: 'INSUFFICIENT',
          sourceOrg: 'Local Cadastre',
          sourceReference: 'Cadastre Register',
          observationDate: '2023-01-01',
          spatialResolution: 'Unresolved',
          knownLimitations: ['Missing exposure inventory.'],
          isCritical: true,
        },
      ],
    };

    const result = assessHabitation(suscWithMissingSettlement);
    expect(result.hazardUrgency).toBe('ELEVATED');
    expect(result.evidenceQuality).toBe('INSUFFICIENT');
  });

  it('correctly handles conflicting evidence alongside direct observed impact (URGENT + CONFLICTING)', () => {
    const impactWithConflictingReport: Habitation = {
      id: 'hab-test-impact-conflicting',
      name: 'Test Settlement Inundated with Conflicting Secondary Report',
      localAdministrativeUnit: 'Test Unit',
      centroid: [11.53, 76.15],
      elevationMeters: 900,
      estimatedPopulation: 200,
      buildingCount: 50,
      tags: ['Test'],
      evidence: [
        {
          id: 'ev-test-impact',
          name: 'Satellite Debris Flow Footprint',
          domain: 'HAZARD_IMPACT',
          category: 'OBSERVED',
          finding: 'Direct intersection: satellite multispectral imagery documents debris deposition across village center.',
          status: 'COMPLETE',
          sourceOrg: 'Test Space Agency',
          sourceReference: 'Satellite Runout Map',
          observationDate: '2024-07-31',
          spatialResolution: '0.5m',
          knownLimitations: [],
          isCritical: true,
        },
        {
          id: 'ev-test-field-conflict',
          name: 'Unverified Field Telegram',
          domain: 'FIELD_VERIFICATION',
          category: 'OBSERVED',
          finding: 'Telegram claims no damage to buildings.',
          status: 'CONFLICTING',
          isContradictory: true,
          contradictionNote: 'Secondary telegram contradicts satellite inundation findings.',
          sourceOrg: 'Local Observer',
          sourceReference: 'Telegram #42',
          observationDate: '2024-08-01',
          spatialResolution: 'Field note',
          knownLimitations: [],
          isCritical: false,
        },
      ],
    };

    const result = assessHabitation(impactWithConflictingReport);
    // Physical urgency is URGENT
    expect(result.hazardUrgency).toBe('URGENT');
    // Epistemic quality is CONFLICTING
    expect(result.evidenceQuality).toBe('CONFLICTING');
  });

  it('correctly handles a habitation with no sufficient baseline evidence (UNDETERMINED + INSUFFICIENT)', () => {
    const missingBaselineHab: Habitation = {
      id: 'hab-test-no-baseline',
      name: 'Test Habitation No Baseline',
      localAdministrativeUnit: 'Test Unit',
      centroid: [11.55, 76.12],
      elevationMeters: 800,
      estimatedPopulation: 80,
      buildingCount: 15,
      tags: ['Test'],
      evidence: [
        {
          id: 'ev-no-hazard',
          name: 'Hazard Footprint',
          domain: 'HAZARD_IMPACT',
          category: 'OBSERVED',
          finding: 'DATA UNAVAILABLE: No satellite or ground coverage.',
          status: 'INSUFFICIENT',
          sourceOrg: 'None',
          sourceReference: 'None',
          observationDate: '2024-08-01',
          spatialResolution: 'Unresolved',
          knownLimitations: [],
          isCritical: true,
        },
      ],
    };

    const result = assessHabitation(missingBaselineHab);
    expect(result.hazardUrgency).toBe('UNDETERMINED');
    expect(result.evidenceQuality).toBe('INSUFFICIENT');
  });
});

describe('SHELTERTRACE Dataset Authenticity & Demonstrative Flags', () => {
  it('correctly marks synthetic scenario habitations as illustrative records', () => {
    const kottappadi = WAYANAD_HABITATIONS.find(h => h.id === 'hab-kottappadi')!;
    const nedumpala = WAYANAD_HABITATIONS.find(h => h.id === 'hab-nedumpala')!;

    expect(kottappadi.isIllustrativeRecord).toBe(true);
    expect(nedumpala.isIllustrativeRecord).toBe(true);
  });

  it('correctly flags approximate GeoJSON polygons as illustrative with isAuthentic: false', () => {
    const debrisFlow = OBSERVED_DEBRIS_FLOW_GEOJSON.features[0];
    const susceptibility = MODELLED_SUSCEPTIBILITY_GEOJSON.features[0];

    expect(debrisFlow.properties.category).toBe('ILLUSTRATIVE');
    expect(debrisFlow.properties.isAuthentic).toBe(false);
    expect(debrisFlow.properties.resolution).toContain('25 vertices');

    expect(susceptibility.properties.category).toBe('ILLUSTRATIVE');
    expect(susceptibility.properties.isAuthentic).toBe(false);
    expect(susceptibility.properties.resolution).toContain('8 vertices');
  });
});

describe('SHELTERTRACE Summary Counts Integrity', () => {
  it('ensures each habitation is counted exactly once and urgency sums to total', () => {
    const results = WAYANAD_HABITATIONS.map(h => assessHabitation(h));
    const total = results.length;
    expect(total).toBe(9);

    const urgentCount = results.filter(r => r.hazardUrgency === 'URGENT').length;
    const elevatedCount = results.filter(r => r.hazardUrgency === 'ELEVATED').length;
    const routineCount = results.filter(r => r.hazardUrgency === 'ROUTINE').length;
    const undeterminedCount = results.filter(r => r.hazardUrgency === 'UNDETERMINED').length;

    // Must sum to exactly total (9)
    expect(urgentCount + elevatedCount + routineCount + undeterminedCount).toBe(total);
    expect(urgentCount).toBe(5); // Punchirimattom, Mundakkai, Chooralmala, Attamala, Vellarmala
    expect(elevatedCount).toBe(1); // Kalladi
    expect(undeterminedCount).toBe(2); // Kottappadi (conflict), Nedumpala (cloud gap)
    expect(routineCount).toBe(1); // Meppadi Town
  });

  it('ensures evidence quality counts sum to exactly total', () => {
    const results = WAYANAD_HABITATIONS.map(h => assessHabitation(h));
    const total = results.length;

    const completeCount = results.filter(r => r.evidenceQuality === 'COMPLETE').length;
    const partialCount = results.filter(r => r.evidenceQuality === 'PARTIAL').length;
    const insufficientCount = results.filter(r => r.evidenceQuality === 'INSUFFICIENT').length;
    const conflictingCount = results.filter(r => r.evidenceQuality === 'CONFLICTING').length;

    // Must sum to exactly total (9)
    expect(completeCount + partialCount + insufficientCount + conflictingCount).toBe(total);
    expect(conflictingCount).toBe(1); // Kottappadi
    expect(insufficientCount).toBe(1); // Nedumpala
  });
});

describe('SHELTERTRACE Sensitivity Engine - Documented Hypothetical Assumptions', () => {
  it('correctly separates active operational scenarios from disabled GIS-pipeline scenarios', () => {
    const bridgeScenario = DOCUMENTED_SENSITIVITY_ASSUMPTIONS.find(a => a.id === 'SCENARIO_BRIDGE_RESTORED')!;
    const bufferScenario = DOCUMENTED_SENSITIVITY_ASSUMPTIONS.find(a => a.id === 'SCENARIO_BUFFER_UNCERTAINTY')!;

    expect(bridgeScenario.isExecutableInMVP).toBe(true);
    expect(bufferScenario.isExecutableInMVP).toBe(false);
    expect(bufferScenario.statusNotice).toContain('DISABLED IN MVP v1.0');
  });

  it('evaluates Lifeline Infrastructure Restoration for Attamala (shifts from URGENT to ELEVATED)', () => {
    const attamala = WAYANAD_HABITATIONS.find(h => h.id === 'hab-attamala')!;
    const evalResult = evaluateSensitivity(attamala, 'SCENARIO_BRIDGE_RESTORED');

    // With bridge restored, Attamala's isolation is resolved, but steep slope leaves it at ELEVATED
    expect(evalResult.originalUrgency).toBe('URGENT');
    expect(evalResult.modifiedUrgency).toBe('ELEVATED');
    expect(evalResult.isStable).toBe(false);
    expect(evalResult.explanation).toContain('Hazard urgency shifted from "Urgent Hazard" to "Elevated Hazard"');
  });

  it('demonstrates decision stability for direct-hit locations (Mundakkai) even with bridge restored', () => {
    const mundakkai = WAYANAD_HABITATIONS.find(h => h.id === 'hab-mundakkai')!;
    const evalResult = evaluateSensitivity(mundakkai, 'SCENARIO_BRIDGE_RESTORED');

    // Direct debris inundation keeps Mundakkai at URGENT
    expect(evalResult.originalUrgency).toBe('URGENT');
    expect(evalResult.modifiedUrgency).toBe('URGENT');
    expect(evalResult.isStable).toBe(true);
    expect(evalResult.explanation).toContain('Assessment is STABLE');
  });
});

describe('SHELTERTRACE Targeted Regression - Missing Domains & Decision Hierarchy', () => {
  it('explicitly defines required and critical evidence domains', () => {
    expect(REQUIRED_EVIDENCE_DOMAINS).toContain('HAZARD_IMPACT');
    expect(REQUIRED_EVIDENCE_DOMAINS).toContain('TERRAIN_GEOLOGY');
    expect(REQUIRED_EVIDENCE_DOMAINS).toContain('SETTLEMENT_EXPOSURE');
    expect(REQUIRED_EVIDENCE_DOMAINS).toContain('INFRASTRUCTURE_ACCESS');

    expect(CRITICAL_EVIDENCE_DOMAINS).toContain('HAZARD_IMPACT');
    expect(CRITICAL_EVIDENCE_DOMAINS).toContain('TERRAIN_GEOLOGY');
    expect(CRITICAL_EVIDENCE_DOMAINS).toContain('SETTLEMENT_EXPOSURE');
    expect(CRITICAL_EVIDENCE_DOMAINS).toContain('INFRASTRUCTURE_ACCESS');
  });

  // Test combination 1: Entirely absent hazard evidence
  it('assigns UNDETERMINED hazard urgency and INSUFFICIENT evidence quality when hazard evidence is entirely absent', () => {
    const habMissingHazard: Habitation = {
      id: 'hab-regression-no-hazard',
      name: 'Habitation With Entirely Absent Hazard Evidence',
      localAdministrativeUnit: 'Test Unit',
      centroid: [11.53, 76.14],
      elevationMeters: 750,
      estimatedPopulation: 120,
      buildingCount: 25,
      tags: ['Regression Test'],
      evidence: [
        {
          id: 'ev-reg-terrain',
          name: 'Copernicus DEM Slope',
          domain: 'TERRAIN_GEOLOGY',
          category: 'DERIVED',
          finding: 'Mean slope gradient 14° on undulating terrain.',
          valueNumeric: 14,
          valueUnit: 'degrees',
          status: 'COMPLETE',
          sourceOrg: 'ESA',
          sourceReference: 'GLO-30',
          observationDate: '2021-11-30',
          spatialResolution: '30m',
          knownLimitations: [],
          isCritical: true,
        },
        {
          id: 'ev-reg-settlement',
          name: 'Settlement Cadastre',
          domain: 'SETTLEMENT_EXPOSURE',
          category: 'OBSERVED',
          finding: '25 residential structures.',
          status: 'COMPLETE',
          sourceOrg: 'Local Revenue',
          sourceReference: 'Survey Register',
          observationDate: '2023-01-01',
          spatialResolution: 'Sub-meter',
          knownLimitations: [],
          isCritical: true,
        },
        {
          id: 'ev-reg-infra',
          name: 'Road Access Status',
          domain: 'INFRASTRUCTURE_ACCESS',
          category: 'OBSERVED',
          finding: 'Normal paved road connectivity intact.',
          status: 'COMPLETE',
          sourceOrg: 'PWD',
          sourceReference: 'Road Status Log',
          observationDate: '2024-08-01',
          spatialResolution: 'Road network',
          knownLimitations: [],
          isCritical: true,
        },
      ],
    };

    const result = assessHabitation(habMissingHazard);
    expect(result.hazardUrgency).toBe('UNDETERMINED');
    expect(result.evidenceQuality).toBe('INSUFFICIENT');
    expect(result.hazardUrgency).not.toBe('ROUTINE');
    expect(result.evidenceQuality).not.toBe('COMPLETE');
    expect(result.missingEvidence.some(m => m.includes('HAZARD_IMPACT'))).toBe(true);
    expect(result.applicableRules).toContain('RULE-INSUFF-01: Critical Baseline Hazard Evidence Missing');
  });

  // Test combination 2: Entirely absent critical terrain evidence
  it('assigns UNDETERMINED hazard urgency and INSUFFICIENT evidence quality when critical terrain evidence is entirely absent', () => {
    const habMissingTerrain: Habitation = {
      id: 'hab-regression-no-terrain',
      name: 'Habitation With Entirely Absent Terrain Evidence',
      localAdministrativeUnit: 'Test Unit',
      centroid: [11.53, 76.14],
      elevationMeters: 750,
      estimatedPopulation: 120,
      buildingCount: 25,
      tags: ['Regression Test'],
      evidence: [
        {
          id: 'ev-reg-hazard',
          name: 'Satellite Debris Flow Footprint',
          domain: 'HAZARD_IMPACT',
          category: 'OBSERVED',
          finding: 'Outside mapped debris flow track.',
          status: 'COMPLETE',
          sourceOrg: 'NRSC',
          sourceReference: 'Cartosat-3 Overview',
          observationDate: '2024-07-31',
          spatialResolution: '0.5m',
          knownLimitations: [],
          isCritical: true,
        },
        {
          id: 'ev-reg-settlement',
          name: 'Settlement Cadastre',
          domain: 'SETTLEMENT_EXPOSURE',
          category: 'OBSERVED',
          finding: '25 residential structures.',
          status: 'COMPLETE',
          sourceOrg: 'Local Revenue',
          sourceReference: 'Survey Register',
          observationDate: '2023-01-01',
          spatialResolution: 'Sub-meter',
          knownLimitations: [],
          isCritical: true,
        },
        {
          id: 'ev-reg-infra',
          name: 'Road Access Status',
          domain: 'INFRASTRUCTURE_ACCESS',
          category: 'OBSERVED',
          finding: 'Normal paved road connectivity intact.',
          status: 'COMPLETE',
          sourceOrg: 'PWD',
          sourceReference: 'Road Status Log',
          observationDate: '2024-08-01',
          spatialResolution: 'Road network',
          knownLimitations: [],
          isCritical: true,
        },
      ],
    };

    const result = assessHabitation(habMissingTerrain);
    expect(result.hazardUrgency).toBe('UNDETERMINED');
    expect(result.evidenceQuality).toBe('INSUFFICIENT');
    expect(result.hazardUrgency).not.toBe('ROUTINE');
    expect(result.evidenceQuality).not.toBe('COMPLETE');
    expect(result.missingEvidence.some(m => m.includes('TERRAIN_GEOLOGY'))).toBe(true);
    expect(result.applicableRules).toContain('RULE-INSUFF-02: Critical Terrain Slope Baseline Missing');
  });

  // Test combination 3: Confirmed severed access + steep terrain + missing hazard footprint
  it('assigns URGENT hazard urgency and INSUFFICIENT evidence quality when lifeline access is severed in steep terrain despite missing hazard footprint', () => {
    const habSeveredAccessMissingFootprint: Habitation = {
      id: 'hab-regression-severed-missing-footprint',
      name: 'Habitation With Severed Access on Steep Terrain but Missing Hazard Footprint',
      localAdministrativeUnit: 'Test Unit',
      centroid: [11.51, 76.17],
      elevationMeters: 1050,
      estimatedPopulation: 280,
      buildingCount: 60,
      tags: ['Regression Test'],
      evidence: [
        // HAZARD_IMPACT is entirely absent (e.g. cloud obscuration)
        {
          id: 'ev-reg-terrain-steep',
          name: 'Copernicus DEM Slope',
          domain: 'TERRAIN_GEOLOGY',
          category: 'DERIVED',
          finding: 'Mean slope gradient 33.2° on steep mountain valley flank.',
          valueNumeric: 33.2,
          valueUnit: 'degrees',
          status: 'COMPLETE',
          sourceOrg: 'ESA',
          sourceReference: 'GLO-30 Tile N11_E076',
          observationDate: '2021-11-30',
          spatialResolution: '30m',
          knownLimitations: [],
          isCritical: true,
        },
        {
          id: 'ev-reg-infra-severed',
          name: 'Lifeline Access Bridge Connection',
          domain: 'INFRASTRUCTURE_ACCESS',
          category: 'OBSERVED',
          finding: 'Access completely severed: sole concrete bridge structure washed out by flash flood waters.',
          status: 'COMPLETE',
          sourceOrg: 'PWD / Police Reconnaissance',
          sourceReference: 'Field Situation Report #01',
          observationDate: '2024-07-30',
          spatialResolution: 'Point bridge waypoint',
          knownLimitations: [],
          isCritical: true,
        },
        {
          id: 'ev-reg-settlement',
          name: 'Settlement Exposure',
          domain: 'SETTLEMENT_EXPOSURE',
          category: 'OBSERVED',
          finding: '60 residential buildings with 280 residents stranded.',
          status: 'COMPLETE',
          sourceOrg: 'Revenue Department',
          sourceReference: 'Local Census',
          observationDate: '2023-01-01',
          spatialResolution: 'Vector cadastre',
          knownLimitations: [],
          isCritical: true,
        },
      ],
    };

    const result = assessHabitation(habSeveredAccessMissingFootprint);
    // Crucial requirement: severed access in hazardous terrain MUST NOT be suppressed by missing hazard footprint!
    expect(result.hazardUrgency).toBe('URGENT');
    expect(result.evidenceQuality).toBe('INSUFFICIENT');
    expect(result.applicableRules).toContain('RULE-INFRA-01: Lifeline Access Severance in Susceptible Valley Flank');
    expect(result.missingEvidence.some(m => m.includes('HAZARD_IMPACT'))).toBe(true);
    expect(result.detailedReasoning.some(r => r.includes('CRITICAL ACCESS FINDING'))).toBe(true);
  });

  // Test combination 4: Direct observed impact + missing secondary evidence
  it('assigns URGENT hazard urgency and INSUFFICIENT evidence quality when direct observed impact is present but secondary baseline is absent', () => {
    const habImpactMissingSecondary: Habitation = {
      id: 'hab-regression-impact-missing-secondary',
      name: 'Habitation With Direct Impact but Absent Baseline Terrain Data',
      localAdministrativeUnit: 'Test Unit',
      centroid: [11.53, 76.15],
      elevationMeters: 900,
      estimatedPopulation: 180,
      buildingCount: 35,
      tags: ['Regression Test'],
      evidence: [
        {
          id: 'ev-reg-impact-direct',
          name: 'Cartosat-3 Debris Flow Inundation Polygon',
          domain: 'HAZARD_IMPACT',
          category: 'OBSERVED',
          finding: 'Direct intersection: high-velocity mud slurry inundated 18 structures and scoured central road.',
          status: 'COMPLETE',
          sourceOrg: 'NRSC / ISRO',
          sourceReference: 'Cartosat-3 Post-Event Analysis',
          observationDate: '2024-07-31',
          spatialResolution: '0.5m',
          knownLimitations: [],
          isCritical: true,
        },
        // TERRAIN_GEOLOGY is entirely absent!
        {
          id: 'ev-reg-infra',
          name: 'Road Access Status',
          domain: 'INFRASTRUCTURE_ACCESS',
          category: 'OBSERVED',
          finding: 'Road partially blocked by debris; foot access intact.',
          status: 'COMPLETE',
          sourceOrg: 'PWD',
          sourceReference: 'Log #12',
          observationDate: '2024-07-31',
          spatialResolution: 'Road network',
          knownLimitations: [],
          isCritical: true,
        },
        {
          id: 'ev-reg-settlement',
          name: 'Settlement Exposure',
          domain: 'SETTLEMENT_EXPOSURE',
          category: 'OBSERVED',
          finding: '35 buildings recorded.',
          status: 'COMPLETE',
          sourceOrg: 'Revenue Cadastre',
          sourceReference: 'Register',
          observationDate: '2023-01-01',
          spatialResolution: 'Sub-meter',
          knownLimitations: [],
          isCritical: true,
        },
      ],
    };

    const result = assessHabitation(habImpactMissingSecondary);
    // Direct observed physical impact must remain URGENT
    expect(result.hazardUrgency).toBe('URGENT');
    // But epistemic quality must be INSUFFICIENT due to absent critical terrain domain
    expect(result.evidenceQuality).toBe('INSUFFICIENT');
    expect(result.applicableRules).toContain('RULE-IMPACT-01: Direct Observed Debris Flow Inundation');
    expect(result.missingEvidence.some(m => m.includes('TERRAIN_GEOLOGY'))).toBe(true);
    expect(result.detailedReasoning.some(r => r.includes('EVIDENCE INTEGRITY NOTICE'))).toBe(true);
  });

  // Test combination 5: Direct observed impact + conflicting secondary evidence
  it('assigns URGENT hazard urgency and CONFLICTING evidence quality when direct observed impact is accompanied by conflicting secondary report', () => {
    const habImpactConflictingSecondary: Habitation = {
      id: 'hab-regression-impact-conflicting',
      name: 'Habitation With Direct Impact and Conflicting Secondary Report',
      localAdministrativeUnit: 'Test Unit',
      centroid: [11.53, 76.15],
      elevationMeters: 900,
      estimatedPopulation: 200,
      buildingCount: 45,
      tags: ['Regression Test'],
      evidence: [
        {
          id: 'ev-reg-impact-sat',
          name: 'Satellite Debris Flow Inundation',
          domain: 'HAZARD_IMPACT',
          category: 'OBSERVED',
          finding: 'Direct intersection: multi-spectral satellite imagery delineates 2.5m debris mantle over village cluster.',
          status: 'COMPLETE',
          sourceOrg: 'NRSC / ISRO',
          sourceReference: 'Satellite Runout Map 2024-07-31',
          observationDate: '2024-07-31',
          spatialResolution: '0.5m',
          knownLimitations: [],
          isCritical: true,
        },
        {
          id: 'ev-reg-terrain',
          name: 'Copernicus DEM Slope',
          domain: 'TERRAIN_GEOLOGY',
          category: 'DERIVED',
          finding: 'Mean slope gradient 28.5° on active hillslope.',
          valueNumeric: 28.5,
          valueUnit: 'degrees',
          status: 'COMPLETE',
          sourceOrg: 'ESA',
          sourceReference: 'GLO-30',
          observationDate: '2021-11-30',
          spatialResolution: '30m',
          knownLimitations: [],
          isCritical: true,
        },
        {
          id: 'ev-reg-infra',
          name: 'Road Access Status',
          domain: 'INFRASTRUCTURE_ACCESS',
          category: 'OBSERVED',
          finding: 'Road impassable due to sediment siltation.',
          status: 'COMPLETE',
          sourceOrg: 'PWD',
          sourceReference: 'PWD Log',
          observationDate: '2024-07-31',
          spatialResolution: 'Road network',
          knownLimitations: [],
          isCritical: true,
        },
        {
          id: 'ev-reg-settlement',
          name: 'Settlement Exposure',
          domain: 'SETTLEMENT_EXPOSURE',
          category: 'OBSERVED',
          finding: '45 residential structures in valley bottom.',
          status: 'COMPLETE',
          sourceOrg: 'Revenue Cadastre',
          sourceReference: 'Register',
          observationDate: '2023-01-01',
          spatialResolution: 'Cadastre',
          knownLimitations: [],
          isCritical: true,
        },
        {
          id: 'ev-reg-conflict-wire',
          name: 'Unverified Revenue Telegram',
          domain: 'FIELD_VERIFICATION',
          category: 'OBSERVED',
          finding: 'Local revenue clerk telegram claims zero structural damage occurred within settlement limits.',
          status: 'CONFLICTING',
          isContradictory: true,
          contradictionNote: 'Clerk telegram contradicts satellite debris flow inundation maps.',
          sourceOrg: 'Local Revenue Office',
          sourceReference: 'Disaster Desk Wire #108',
          observationDate: '2024-08-01',
          spatialResolution: 'Local wire report',
          knownLimitations: ['Unverified wire report; lacks photo documentation.'],
          isCritical: false,
        },
      ],
    };

    const result = assessHabitation(habImpactConflictingSecondary);
    // Physical hazard urgency is URGENT (direct observed impact is not erased by conflicting report)
    expect(result.hazardUrgency).toBe('URGENT');
    // Epistemic quality is CONFLICTING
    expect(result.evidenceQuality).toBe('CONFLICTING');
    expect(result.applicableRules).toContain('RULE-IMPACT-01: Direct Observed Debris Flow Inundation');
    expect(result.conflictingEvidence.length).toBeGreaterThan(0);
    expect(result.detailedReasoning.some(r => r.includes('EVIDENCE INTEGRITY NOTICE'))).toBe(true);
  });

  // Validation constraint: Never classify as COMPLETE when any required domain is absent
  it('never classifies an assessment as COMPLETE when any required domain is absent', () => {
    // Missing SETTLEMENT_EXPOSURE
    const habMissingSettlement: Habitation = {
      id: 'hab-regression-no-settlement',
      name: 'Habitation With Absent Settlement Exposure',
      localAdministrativeUnit: 'Test Unit',
      centroid: [11.55, 76.12],
      elevationMeters: 750,
      estimatedPopulation: 0,
      buildingCount: 0,
      tags: ['Regression Test'],
      evidence: [
        {
          id: 'ev-reg-hazard-outside',
          name: 'Satellite Footprint',
          domain: 'HAZARD_IMPACT',
          category: 'OBSERVED',
          finding: 'Outside mapped debris flow track.',
          status: 'COMPLETE',
          sourceOrg: 'NRSC',
          sourceReference: 'Ref #1',
          observationDate: '2024-07-31',
          spatialResolution: '0.5m',
          knownLimitations: [],
          isCritical: true,
        },
        {
          id: 'ev-reg-terrain-flat',
          name: 'DEM Slope',
          domain: 'TERRAIN_GEOLOGY',
          category: 'DERIVED',
          finding: 'Mean slope gradient 8° on flat valley floor.',
          valueNumeric: 8,
          valueUnit: 'degrees',
          status: 'COMPLETE',
          sourceOrg: 'ESA',
          sourceReference: 'GLO-30',
          observationDate: '2021-11-30',
          spatialResolution: '30m',
          knownLimitations: [],
          isCritical: true,
        },
        {
          id: 'ev-reg-infra-ok',
          name: 'Road Network',
          domain: 'INFRASTRUCTURE_ACCESS',
          category: 'OBSERVED',
          finding: 'Road fully operational.',
          status: 'COMPLETE',
          sourceOrg: 'PWD',
          sourceReference: 'Log',
          observationDate: '2024-08-01',
          spatialResolution: 'Network',
          knownLimitations: [],
          isCritical: true,
        },
      ],
    };

    const result = assessHabitation(habMissingSettlement);
    expect(result.evidenceQuality).not.toBe('COMPLETE');
    expect(result.evidenceQuality).toBe('INSUFFICIENT');
    expect(result.missingEvidence.some(m => m.includes('SETTLEMENT_EXPOSURE'))).toBe(true);
  });
});
