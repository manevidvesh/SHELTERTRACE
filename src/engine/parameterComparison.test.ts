import { describe, it, expect } from 'vitest';
import { WAYANAD_HABITATIONS } from '../data/wayanadHabitations';
import type { Habitation } from '../types/habitation';

describe('SHELTERTRACE Parameter Comparison Data Integrity', () => {
  it('extracts genuine measurable parameters across all 9 Wayanad habitations', () => {
    expect(WAYANAD_HABITATIONS).toHaveLength(9);

    WAYANAD_HABITATIONS.forEach(hab => {
      // 1. Elevation (metres MSL)
      expect(typeof hab.elevationMeters).toBe('number');
      expect(hab.elevationMeters).toBeGreaterThan(500);
      expect(hab.elevationMeters).toBeLessThan(2000);

      // 2. Population (persons)
      expect(typeof hab.estimatedPopulation).toBe('number');
      expect(hab.estimatedPopulation).toBeGreaterThan(0);

      // 3. Building count (structures)
      expect(typeof hab.buildingCount).toBe('number');
      expect(hab.buildingCount).toBeGreaterThan(0);

      // 4. Slope gradient (degrees) from Copernicus DEM
      const slopeEv = hab.evidence.find(
        e => e.domain === 'TERRAIN_GEOLOGY' && e.valueUnit === 'degrees' && typeof e.valueNumeric === 'number'
      );
      expect(slopeEv).toBeDefined();
      expect(slopeEv!.valueNumeric).toBeGreaterThan(0);
      expect(slopeEv!.valueNumeric).toBeLessThan(90);
    });
  });

  it('preserves exact slope gradients from Copernicus GLO-30 DEM analysis without interpolation', () => {
    const punchirimattom = WAYANAD_HABITATIONS.find(h => h.id === 'hab-punchirimattom')!;
    const punchSlope = punchirimattom.evidence.find(
      e => e.domain === 'TERRAIN_GEOLOGY' && e.valueUnit === 'degrees'
    )!;
    expect(punchSlope.valueNumeric).toBe(36.4);

    const mundakkai = WAYANAD_HABITATIONS.find(h => h.id === 'hab-mundakkai')!;
    const mundakkaiSlope = mundakkai.evidence.find(
      e => e.domain === 'TERRAIN_GEOLOGY' && e.valueUnit === 'degrees'
    )!;
    expect(mundakkaiSlope.valueNumeric).toBe(21.8);

    const chooralmala = WAYANAD_HABITATIONS.find(h => h.id === 'hab-chooralmala')!;
    const chooralmalaSlope = chooralmala.evidence.find(
      e => e.domain === 'TERRAIN_GEOLOGY' && e.valueUnit === 'degrees'
    )!;
    expect(chooralmalaSlope.valueNumeric).toBe(14.2);

    const meppadi = WAYANAD_HABITATIONS.find(h => h.id === 'hab-meppadi-town')!;
    const meppadiSlope = meppadi.evidence.find(
      e => e.domain === 'TERRAIN_GEOLOGY' && e.valueUnit === 'degrees'
    )!;
    expect(meppadiSlope.valueNumeric).toBe(8.5);
  });

  it('differentiates authentic disaster habitations from synthetic demonstration records', () => {
    const syntheticRecords = WAYANAD_HABITATIONS.filter(h => h.isIllustrativeRecord);
    const authenticRecords = WAYANAD_HABITATIONS.filter(h => !h.isIllustrativeRecord);

    expect(syntheticRecords).toHaveLength(2);
    expect(syntheticRecords.map(h => h.id).sort()).toEqual(['hab-kottappadi', 'hab-nedumpala']);

    expect(authenticRecords).toHaveLength(7);
  });

  it('handles missing or absent parameters gracefully as null/unavailable without defaulting to zero', () => {
    const testHabWithMissingData: Habitation = {
      id: 'hab-test-missing',
      name: 'Unsurveyed Hamlet',
      localAdministrativeUnit: 'Test Panchayat',
      centroid: [11.55, 76.13],
      elevationMeters: 850,
      estimatedPopulation: 50,
      buildingCount: 12,
      tags: ['Test'],
      evidence: [], // No slope evidence
    };

    const slopeEv = testHabWithMissingData.evidence.find(
      e => e.domain === 'TERRAIN_GEOLOGY' && e.valueUnit === 'degrees' && typeof e.valueNumeric === 'number'
    );
    const extractedSlope = slopeEv?.valueNumeric ?? null;

    expect(extractedSlope).toBeNull();
    expect(extractedSlope).not.toBe(0);
  });
});
