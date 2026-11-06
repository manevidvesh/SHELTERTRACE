import type { EvidenceConflictRecord } from '../types/evidence';

export const EVIDENCE_CONFLICT_REGISTER: EvidenceConflictRecord[] = [
  {
    id: 'conf-kottappadi-01',
    habitationId: 'hab-kottappadi',
    conflictingEvidenceIds: ['ev-kot-01', 'ev-kot-02'],
    conflictingSources: [
      'NRSC / ISRO (Cartosat-3 Multispectral Change Anomaly)',
      'Meppadi Grama Panchayat Revenue Desk (Demonstration Telegram #24)',
    ],
    observationDates: ['2024-07-31', '2024-08-01'],
    geographicCoverage: 'Ward 06 residential cluster, Kottappadi [SYNTHETIC DEMONSTRATION FIXTURE]',
    natureOfDisagreement:
      'SYNTHETIC DEMONSTRATION FIXTURE: Constructed to exercise engine conflicting-evidence decision logic. Optical satellite change detection flagged 0.8m surface spectral mud anomaly; synthetic demonstration revenue clerk telegram asserts zero structural inundation occurred within settlement limits.',
    affectsAssessment: true,
    suggestedVerification:
      'Deploy joint geotechnical patrol with GPS camera to verify mud tide marks on foundation walls and sample surface silt thickness.',
    reviewStatus: 'UNDER_REVIEW',
    resolutionReason:
      'Under active demonstration review. Synthetic conflict fixture remains unresolved in baseline state to demonstrate CONFLICTING epistemic quarantine tier.',
    reviewedAt: '2024-08-02T14:30:00Z',
    reviewedBy: 'Simulated DDMA Reviewer (Demonstration Role)',
  },
  {
    id: 'conf-vellarmala-01',
    habitationId: 'hab-vellarmala',
    conflictingEvidenceIds: ['ev-vel-01', 'ev-vel-04'],
    conflictingSources: [
      'ISRO / NRSC High-Resolution Vector Delineation',
      'Preliminary Community Broadcast Wire (Informal Report)',
    ],
    observationDates: ['2024-07-31', '2024-07-31'],
    geographicCoverage: 'Vellarmala GVHSS School Compound and river terrace',
    natureOfDisagreement:
      'Early informal community report claimed school building remained untouched on high ground; satellite orthophoto and field reporting confirmed school ground floor completely inundated by 2.2m boulder-mud debris.',
    affectsAssessment: false,
    suggestedVerification:
      'Resolved via high-resolution aerial imagery and ground inspection.',
    reviewStatus: 'RESOLVED_WITH_REASON',
    resolutionReason:
      'RESOLVED: Ground photos verified 2.2m mud deposition inside school classrooms, confirming satellite vector finding. Early unverified informal broadcast discounted.',
    reviewedAt: '2024-08-01T09:15:00Z',
    reviewedBy: 'Demonstration Review Entry (Based on Published Field Reporting)',
  },
];

/**
 * Returns documented conflict records for a specific habitation.
 */
export function getConflictsForHabitation(habitationId: string): EvidenceConflictRecord[] {
  return EVIDENCE_CONFLICT_REGISTER.filter(c => c.habitationId === habitationId);
}
