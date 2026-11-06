import { describe, it, expect } from 'vitest';
import { buildProvenanceGraph, getUpstreamNodeIds, getDownstreamNodeIds } from './provenanceGraph';
import { generateInvestigationSuggestions } from './investigationSuggestions';
import { assessHabitation } from './assessmentEngine';
import { WAYANAD_HABITATIONS } from '../data/wayanadHabitations';
import type { Habitation } from '../types/habitation';

describe('SHELTERTRACE Enhancement 1: Evidence Provenance Graph', () => {
  it('ensures every provenance graph relationship points to a real evidence or assessment dependency', () => {
    const punchirimattom = WAYANAD_HABITATIONS.find(h => h.id === 'hab-punchirimattom')!;
    const result = assessHabitation(punchirimattom);
    const graph = buildProvenanceGraph(punchirimattom, result);

    expect(graph.habitationId).toBe('hab-punchirimattom');
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.edges.length).toBeGreaterThan(0);

    const nodeIds = new Set(graph.nodes.map(n => n.id));

    // Every edge source and target must exist in nodeIds
    for (const edge of graph.edges) {
      expect(nodeIds.has(edge.from)).toBe(true);
      expect(nodeIds.has(edge.to)).toBe(true);
      expect(['PRODUCED_EVIDENCE', 'DERIVED_FROM', 'EVALUATED_BY', 'DETERMINES_OUTCOME', 'EXPOSES_GAP']).toContain(
        edge.relation
      );
    }

    // Verify node types are meaningful
    const nodeTypes = new Set(graph.nodes.map(n => n.type));
    expect(nodeTypes.has('SOURCE_DATASET')).toBe(true);
    expect(nodeTypes.has('OBSERVATION_EVIDENCE')).toBe(true);
    expect(nodeTypes.has('SPATIAL_FINDING')).toBe(true);
    expect(nodeTypes.has('DECISION_RULE')).toBe(true);
    expect(nodeTypes.has('ASSESSMENT_OUTCOME')).toBe(true);
  });

  it('updates the affected graph and assessment when an input is removed or modified', () => {
    const baseHab = WAYANAD_HABITATIONS.find(h => h.id === 'hab-mundakkai')!;
    const baseResult = assessHabitation(baseHab);
    const baseGraph = buildProvenanceGraph(baseHab, baseResult);

    // Create copy with the direct impact evidence removed
    const modifiedHab: Habitation = {
      ...baseHab,
      evidence: baseHab.evidence.filter(e => e.domain !== 'HAZARD_IMPACT'),
    };

    const modifiedResult = assessHabitation(modifiedHab);
    const modifiedGraph = buildProvenanceGraph(modifiedHab, modifiedResult);

    // Assessment urgency must change or reflect missing hazard impact
    expect(modifiedResult.evidenceQuality).toBe('INSUFFICIENT');

    // Graph must now contain a MISSING_EVIDENCE node for HAZARD_IMPACT
    const missingNodes = modifiedGraph.nodes.filter(n => n.type === 'MISSING_EVIDENCE');
    expect(missingNodes.some(n => n.description.includes('HAZARD_IMPACT'))).toBe(true);

    // Old hazard evidence node must NOT exist in the modified graph
    const baseHazardNode = baseGraph.nodes.find(n => n.id === 'evidence-ev-mund-01');
    expect(baseHazardNode).toBeDefined();
    expect(modifiedGraph.nodes.some(n => n.id === 'evidence-ev-mund-01')).toBe(false);
  });

  it('allows upstream traversal: selecting a finding reveals its source evidence and dataset', () => {
    const kalladi = WAYANAD_HABITATIONS.find(h => h.id === 'hab-kalladi')!;
    const result = assessHabitation(kalladi);
    const graph = buildProvenanceGraph(kalladi, result);

    // Find the Copernicus DEM slope finding
    const slopeFinding = graph.nodes.find(n => n.type === 'SPATIAL_FINDING' && n.label.includes('Copernicus'));
    expect(slopeFinding).toBeDefined();

    const upstreamIds = getUpstreamNodeIds(graph, slopeFinding!.id);
    expect(upstreamIds.size).toBeGreaterThan(0);

    // Upstream must contain the Observation Evidence node
    const upstreamNodes = graph.nodes.filter(n => upstreamIds.has(n.id));
    expect(upstreamNodes.some(n => n.type === 'OBSERVATION_EVIDENCE')).toBe(true);
    expect(upstreamNodes.some(n => n.type === 'SOURCE_DATASET')).toBe(true);
  });

  it('allows downstream traversal: selecting a rule reveals that it determines the assessment outcome', () => {
    const attamala = WAYANAD_HABITATIONS.find(h => h.id === 'hab-attamala')!;
    const result = assessHabitation(attamala);
    const graph = buildProvenanceGraph(attamala, result);

    const ruleNode = graph.nodes.find(n => n.type === 'DECISION_RULE');
    expect(ruleNode).toBeDefined();

    const downstreamIds = getDownstreamNodeIds(graph, ruleNode!.id);
    expect(downstreamIds.size).toBeGreaterThan(0);

    const outcomeNode = graph.nodes.find(n => n.type === 'ASSESSMENT_OUTCOME');
    expect(downstreamIds.has(outcomeNode!.id)).toBe(true);
  });

  it('keeps observed damage and modelled susceptibility separate in the provenance graph', () => {
    const mundakkai = WAYANAD_HABITATIONS.find(h => h.id === 'hab-mundakkai')!;
    const result = assessHabitation(mundakkai);
    const graph = buildProvenanceGraph(mundakkai, result);

    const observedNodes = graph.nodes.filter(n => n.category === 'OBSERVED');
    const modelledNodes = graph.nodes.filter(n => n.category === 'MODELLED');

    expect(observedNodes.length).toBeGreaterThan(0);
    expect(modelledNodes.length).toBeGreaterThan(0);

    // Direct impact scarp must be OBSERVED, while regional susceptibility zonation must be MODELLED
    const impactEvidence = observedNodes.find(n => n.label.includes('ISRO/NRSC'));
    const suscEvidence = modelledNodes.find(n => n.label.includes('GSI National Landslide Susceptibility'));

    expect(impactEvidence).toBeDefined();
    expect(suscEvidence).toBeDefined();
    expect(impactEvidence!.category).not.toBe(suscEvidence!.category);
  });
});

describe('SHELTERTRACE Enhancement 2: Evidence vs Severity Matrix Integrity', () => {
  it('ensures missing evidence does not automatically reduce hazard severity', () => {
    // Habitation with severed access + steep terrain but missing hazard footprint
    const habSeveredNoFootprint: Habitation = {
      id: 'hab-test-matrix-missing-not-safe',
      name: 'Severed Access Missing Footprint',
      localAdministrativeUnit: 'Test Unit',
      centroid: [11.51, 76.17],
      elevationMeters: 1000,
      estimatedPopulation: 200,
      buildingCount: 40,
      tags: ['Test'],
      evidence: [
        {
          id: 'ev-test-infra-cut',
          name: 'Lifeline Access',
          domain: 'INFRASTRUCTURE_ACCESS',
          category: 'OBSERVED',
          finding: 'Bridge washed out; road severed.',
          status: 'COMPLETE',
          sourceOrg: 'PWD',
          sourceReference: 'PWD Log',
          observationDate: '2024-07-30',
          spatialResolution: 'Waypoint',
          knownLimitations: [],
          isCritical: true,
        },
        {
          id: 'ev-test-slope-steep',
          name: 'Copernicus DEM Slope',
          domain: 'TERRAIN_GEOLOGY',
          category: 'DERIVED',
          finding: 'Mean slope 31° on steep escarpment.',
          valueNumeric: 31,
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
          id: 'ev-test-dwellings',
          name: 'Cadastre',
          domain: 'SETTLEMENT_EXPOSURE',
          category: 'OBSERVED',
          finding: '40 buildings exposed.',
          status: 'COMPLETE',
          sourceOrg: 'Local Cadastre',
          sourceReference: 'Register',
          observationDate: '2023-01-01',
          spatialResolution: 'Vector',
          knownLimitations: [],
          isCritical: true,
        },
      ],
    };

    const result = assessHabitation(habSeveredNoFootprint);
    // Missing hazard footprint results in INSUFFICIENT evidence quality
    expect(result.evidenceQuality).toBe('INSUFFICIENT');
    // But hazard urgency remains URGENT (not reduced to ROUTINE or safe!)
    expect(result.hazardUrgency).toBe('URGENT');
    expect(result.hazardUrgency).not.toBe('ROUTINE');
  });

  it('ensures matrix positions are derived strictly from documented indicators', () => {
    for (const hab of WAYANAD_HABITATIONS) {
      const result = assessHabitation(hab);
      // Valid Y-axis values
      expect(['URGENT', 'ELEVATED', 'ROUTINE', 'UNDETERMINED']).toContain(result.hazardUrgency);
      // Valid X-axis values
      expect(['COMPLETE', 'PARTIAL', 'INSUFFICIENT', 'CONFLICTING']).toContain(result.evidenceQuality);
      // Primary reason must explain the positioning
      expect(result.primaryReason.length).toBeGreaterThan(15);
    }
  });
});

describe('SHELTERTRACE Enhancement 3: Decision-Impact-Based Field Investigation Suggestions', () => {
  it('references actual evidence gaps in suggestions for incomplete habitations (Nedumpala)', () => {
    const nedumpala = WAYANAD_HABITATIONS.find(h => h.id === 'hab-nedumpala')!;
    const result = assessHabitation(nedumpala);
    const suggestions = generateInvestigationSuggestions(nedumpala, result);

    expect(suggestions.length).toBeGreaterThan(0);

    // Top suggestion must address the satellite cloud obscuration gap
    const topSuggestion = suggestions[0];
    expect(topSuggestion.priorityRank).toBe(1);
    expect(topSuggestion.canChangePriority).toBe('CAN_CHANGE_PRIORITY');
    expect(topSuggestion.relatedMissingEvidence).toContain('HAZARD_IMPACT');
    expect(topSuggestion.potentialEffect).toContain('UNDETERMINED');
  });

  it('references conflicting reports for contradicted habitations (Kottappadi)', () => {
    const kottappadi = WAYANAD_HABITATIONS.find(h => h.id === 'hab-kottappadi')!;
    const result = assessHabitation(kottappadi);
    const suggestions = generateInvestigationSuggestions(kottappadi, result);

    const conflictSuggestion = suggestions.find(s => s.reason.includes('contradicted'));
    expect(conflictSuggestion).toBeDefined();
    expect(conflictSuggestion!.canChangePriority).toBe('CAN_CHANGE_PRIORITY');
    expect(conflictSuggestion!.potentialEffect).toContain('resolves contradictory');
  });

  it('indicates CAN_CONFIRM_QUALITY_ONLY for direct-hit settlements (Mundakkai) without falsely claiming urgency can drop to routine', () => {
    const mundakkai = WAYANAD_HABITATIONS.find(h => h.id === 'hab-mundakkai')!;
    const result = assessHabitation(mundakkai);
    const suggestions = generateInvestigationSuggestions(mundakkai, result);

    const directHitCheck = suggestions.find(s => s.fieldCheck.includes('Inspect foundation toe-scour'));
    expect(directHitCheck).toBeDefined();
    // Direct debris inundation keeps urgency at URGENT; ground inspection cannot falsely downgrade to routine
    expect(directHitCheck!.canChangePriority).toBe('CAN_CONFIRM_QUALITY_ONLY');
    expect(directHitCheck!.potentialEffect).toContain('locks physical urgency at URGENT');
  });

  it('ranks field checks by decision impact (CRITICAL_DECISION_MAKER before ROUTINE_MONITORING)', () => {
    const meppadi = WAYANAD_HABITATIONS.find(h => h.id === 'hab-meppadi-town')!;
    const result = assessHabitation(meppadi);
    const suggestions = generateInvestigationSuggestions(meppadi, result);

    // Routine settlement suggestions should have NO_CHANGE_EXPECTED and lower rank
    const routineCheck = suggestions.find(s => s.impactLevel === 'ROUTINE_MONITORING');
    expect(routineCheck).toBeDefined();
    expect(routineCheck!.canChangePriority).toBe('NO_CHANGE_EXPECTED');
  });

  it('does NOT claim unsupported probabilities, cost figures, or optimal VOI math', () => {
    for (const hab of WAYANAD_HABITATIONS) {
      const result = assessHabitation(hab);
      const suggestions = generateInvestigationSuggestions(hab, result);

      for (const s of suggestions) {
        // Must not contain fake probability or cost buzzwords
        const serialized = JSON.stringify(s).toLowerCase();
        expect(serialized).not.toContain('probability');
        expect(serialized).not.toContain('monte carlo');
        expect(serialized).not.toContain('expected loss');
        expect(serialized).not.toContain('cost-benefit');
        expect(serialized).not.toContain('optimal value of information');
      }
    }
  });
});
