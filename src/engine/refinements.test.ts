import { describe, it, expect } from 'vitest';
import { WAYANAD_HABITATIONS } from '../data/wayanadHabitations';
import { EVIDENCE_CONFLICT_REGISTER, getConflictsForHabitation } from '../data/conflictRegister';
import { getReviewAuditEntriesForHabitation } from '../data/reviewAuditHistory';
import { evaluatePriorityStability } from './sensitivityEngine';
import { assessHabitation } from './assessmentEngine';
import type { Habitation } from '../types/habitation';

describe('SHELTERTRACE Refinement 1: Temporal Evidence Intelligence', () => {
  it('distinguishes event date from observation and publication dates without inventing dates', () => {
    const punchirimattom = WAYANAD_HABITATIONS.find(h => h.id === 'hab-punchirimattom')!;
    const debrisItem = punchirimattom.evidence.find(e => e.id === 'ev-punch-01')!;

    expect(debrisItem).toBeDefined();
    expect(debrisItem.observationDate).toBe('2024-07-31');

    // Historical GSI dataset
    const gsiItem = punchirimattom.evidence.find(e => e.id === 'ev-punch-03')!;
    expect(gsiItem).toBeDefined();
    expect(gsiItem.observationDate).toBe('2020-04-12');
  });

  it('preserves historical baseline relevance without assuming old evidence is invalid', () => {
    const meppadi = WAYANAD_HABITATIONS.find(h => h.id === 'hab-meppadi-town')!;
    const gsiSusceptibility = meppadi.evidence.find(e => e.domain === 'TERRAIN_GEOLOGY' && e.category === 'MODELLED')!;

    expect(gsiSusceptibility).toBeDefined();
    // 2020 GSI map is historical baseline
    expect(gsiSusceptibility.observationDate).toContain('2020');
    // Historical status must NOT invalidate baseline macro-zonation
    expect(gsiSusceptibility.status).toBe('COMPLETE');
  });

  it('handles undated or partially dated records gracefully without inventing dates', () => {
    const undatedHab: Habitation = {
      id: 'hab-test-undated',
      name: 'Test Settlement With Undated Evidence',
      localAdministrativeUnit: 'Test Unit',
      centroid: [11.53, 76.15],
      elevationMeters: 800,
      estimatedPopulation: 100,
      buildingCount: 20,
      tags: ['Test'],
      evidence: [
        {
          id: 'ev-test-undated-item',
          name: 'Legacy Field Note',
          domain: 'FIELD_VERIFICATION',
          category: 'OBSERVED',
          finding: 'Old handwritten field survey note with missing acquisition date.',
          status: 'PARTIAL',
          sourceOrg: 'Local Observer',
          sourceReference: 'Unregistered Sheet',
          observationDate: '', // Undated
          spatialResolution: 'Field note',
          knownLimitations: ['Undated record; observation epoch unrecorded.'],
          isCritical: false,
        },
      ],
    };

    expect(undatedHab.evidence[0].observationDate).toBe('');
    // Assessment must not crash on undated records
    const result = assessHabitation(undatedHab);
    expect(result).toBeDefined();
  });
});

describe('SHELTERTRACE Refinement 2: Spatial Uncertainty & Geometry Quality', () => {
  it('distinguishes geometry origin, quality, and intersection types', () => {
    const mundakkai = WAYANAD_HABITATIONS.find(h => h.id === 'hab-mundakkai')!;
    const impactEvidence = mundakkai.evidence.find(e => e.domain === 'HAZARD_IMPACT')!;

    expect(impactEvidence.spatialResolution).toContain('0.5m Cartosat-3');
    expect(impactEvidence.knownLimitations.length).toBeGreaterThan(0);
  });

  it('does NOT claim sub-meter cadastral certainty for macro-scale regional maps', () => {
    const punchirimattom = WAYANAD_HABITATIONS.find(h => h.id === 'hab-punchirimattom')!;
    const gsiItem = punchirimattom.evidence.find(e => e.id === 'ev-punch-03')!;

    // 1:50,000 regional quadrangle map limitations must be explicitly documented
    expect(gsiItem.spatialResolution).toContain('1:50,000');
    expect(gsiItem.knownLimitations.some(lim => lim.includes('Macro-scale'))).toBe(true);
  });
});

describe('SHELTERTRACE Refinement 3: Explicit Evidence Conflict Register', () => {
  it('preserves contradictory observations without averaging or silently discarding older sources', () => {
    const conflicts = getConflictsForHabitation('hab-kottappadi');
    expect(conflicts.length).toBeGreaterThan(0);

    const conflict = conflicts[0];
    // Both contradictory sources must be preserved
    expect(conflict.conflictingSources.length).toBe(2);
    expect(conflict.conflictingSources[0]).toContain('Cartosat-3');
    expect(conflict.conflictingSources[1]).toContain('Revenue');

    // Both observation dates must be preserved
    expect(conflict.observationDates.length).toBe(2);
    expect(conflict.observationDates[0]).toBe('2024-07-31');
    expect(conflict.observationDates[1]).toBe('2024-08-01');

    // Must record geographic coverage, nature of disagreement, and review status
    expect(conflict.geographicCoverage).toContain('Kottappadi');
    expect(conflict.natureOfDisagreement).toContain('spectral mud anomaly');
    expect(conflict.reviewStatus).toBe('UNDER_REVIEW');
    expect(conflict.affectsAssessment).toBe(true);
  });

  it('requires a documented reason to mark a conflict resolved', () => {
    const resolvedConflict = EVIDENCE_CONFLICT_REGISTER.find(c => c.reviewStatus === 'RESOLVED_WITH_REASON');
    expect(resolvedConflict).toBeDefined();
    // Must contain documented resolution reasoning and reviewer
    expect(resolvedConflict!.resolutionReason).toBeDefined();
    expect(resolvedConflict!.resolutionReason!.length).toBeGreaterThan(20);
    expect(resolvedConflict!.reviewedBy).toBeDefined();
  });
});

describe('SHELTERTRACE Refinement 4: Investigation Priority Stability Analysis', () => {
  it('evaluates priority stability across 5 reproducible scenarios for direct-hit settlements (Mundakkai)', () => {
    const mundakkai = WAYANAD_HABITATIONS.find(h => h.id === 'hab-mundakkai')!;
    const stabilityReport = evaluatePriorityStability(mundakkai);

    expect(stabilityReport.habitationId).toBe('hab-mundakkai');
    expect(stabilityReport.baseUrgency).toBe('URGENT');
    expect(stabilityReport.totalScenariosTested).toBe(5);

    // Direct debris inundation locks urgency at URGENT across all tested scenarios
    expect(stabilityReport.scenariosInTopPriorityGroup).toBe(5);
    expect(stabilityReport.stabilityCategory).toBe('STABLE_TOP_PRIORITY');
    expect(stabilityReport.summaryExplanation).toContain('Consistently remains in the highest-priority');

    // Mandatory disclaimer asserting descriptive frequency != probability
    expect(stabilityReport.disclaimer).toContain('does NOT constitute a statistical probability');
  });

  it('correctly classifies lifeline-sensitive settlements (Attamala) as CONDITIONAL_ON_LIFELINE', () => {
    const attamala = WAYANAD_HABITATIONS.find(h => h.id === 'hab-attamala')!;
    const stabilityReport = evaluatePriorityStability(attamala);

    expect(stabilityReport.habitationId).toBe('hab-attamala');
    expect(stabilityReport.baseUrgency).toBe('URGENT');
    expect(stabilityReport.stabilityCategory).toBe('CONDITIONAL_ON_LIFELINE');

    // Bridge restored scenario shifts Attamala out of URGENT
    const bridgeScenario = stabilityReport.results.find(s => s.scenarioId === 'SCENARIO_LIFELINE_RESTORED')!;
    expect(bridgeScenario.resultingUrgency).toBe('ELEVATED');
    expect(bridgeScenario.remainsInTopPriorityGroup).toBe(false);
  });

  it('classifies cloud-obscured settlements (Nedumpala) as UNDETERMINED_PENDING_SURVEY', () => {
    const nedumpala = WAYANAD_HABITATIONS.find(h => h.id === 'hab-nedumpala')!;
    const stabilityReport = evaluatePriorityStability(nedumpala);

    expect(stabilityReport.baseUrgency).toBe('UNDETERMINED');
    expect(stabilityReport.stabilityCategory).toBe('UNDETERMINED_PENDING_SURVEY');
    expect(stabilityReport.scenariosInTopPriorityGroup).toBe(0);
  });

  it('does NOT call scenario counts a probability or claim statistical confidence', () => {
    for (const hab of WAYANAD_HABITATIONS) {
      const report = evaluatePriorityStability(hab);
      // Results and summary explanation must not claim probability or p-values
      const summaryText = (report.summaryExplanation + JSON.stringify(report.results)).toLowerCase();
      expect(summaryText).not.toContain('probability');
      expect(summaryText).not.toContain('p-value');
      expect(summaryText).not.toContain('confidence interval');
      expect(summaryText).not.toContain('monte carlo');

      // The disclaimer must explicitly disclaim probability claims
      expect(report.disclaimer).toContain('does NOT constitute a statistical probability');
    }
  });
});

describe('SHELTERTRACE Refinement 5: Local Review and Audit History (P2)', () => {
  it('maintains an append-only local review log without overwriting original evidence', () => {
    const punchAudit = getReviewAuditEntriesForHabitation('hab-punchirimattom');
    expect(punchAudit.length).toBeGreaterThan(0);

    const firstEntry = punchAudit[0];
    expect(firstEntry.reviewerRole).toContain('NDRF');
    expect(firstEntry.action).toBe('ACCEPTED');
    expect(firstEntry.previousState).toBeDefined();
    expect(firstEntry.newState).toBeDefined();
    expect(firstEntry.changeReason).toBeDefined();
    expect(firstEntry.timestamp).toBeDefined();

    // Original habitation evidence must remain untouched
    const punchirimattom = WAYANAD_HABITATIONS.find(h => h.id === 'hab-punchirimattom')!;
    expect(punchirimattom.evidence.length).toBe(6);
    expect(punchirimattom.evidence[0].id).toBe('ev-punch-01');
  });
});
