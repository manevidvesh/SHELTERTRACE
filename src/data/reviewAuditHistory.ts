import type { ReviewAuditEntry } from '../types/evidence';

export const INITIAL_REVIEW_AUDIT_LOG: ReviewAuditEntry[] = [
  {
    id: 'rev-001',
    habitationId: 'hab-punchirimattom',
    timestamp: '2024-07-31T11:20:00Z',
    reviewerRole: 'Simulated Field Role (Based on NDRF Reconnaissance Report)',
    action: 'ACCEPTED',
    targetEvidenceId: 'ev-punch-01',
    previousState: 'STATUS: PENDING_GROUND_CHECK',
    newState: 'STATUS: VERIFIED_CROWN_COLLAPSE',
    changeReason:
      'Aerial reconnaissance flyover confirms 200m crown initiation scarp and exposed bedrock terraces at Punchirimattom.',
    fieldObservationText: 'Upper terrace residential dwellings completely erased; deep bedrock exposed.',
  },
  {
    id: 'rev-002',
    habitationId: 'hab-chooralmala',
    timestamp: '2024-07-31T13:45:00Z',
    reviewerRole: 'Simulated Engineering Role (Based on PWD Bridge Inspection Log)',
    action: 'ACCEPTED',
    targetEvidenceId: 'ev-choor-04',
    previousState: 'STATUS: REPORTED_BRIDGE_DAMAGE',
    newState: 'STATUS: CONFIRMED_BRIDGE_SEVERANCE',
    changeReason:
      'Bridge engineer field inspection confirms complete structural collapse of Chooralmala concrete bridge across Iruvaipuzha river.',
    fieldObservationText: 'Both abutments scoured; 64m bridge span completely swept away. Access to Attamala entirely severed.',
  },
  {
    id: 'rev-003',
    habitationId: 'hab-kottappadi',
    timestamp: '2024-08-02T16:00:00Z',
    reviewerRole: 'Simulated DDMA Officer (Demonstration Audit Role)',
    action: 'INCONCLUSIVE',
    targetEvidenceId: 'ev-kot-02',
    previousState: 'STATUS: UNREVIEWED_CONFLICT',
    newState: 'STATUS: UNDER_REVIEW_QUARANTINED',
    changeReason:
      'Demonstration conflict fixture: Contradiction between NRSC spectral change anomaly and revenue clerk clearance telegram cannot be resolved without photographic field proof.',
    fieldObservationText: 'Designating habitation as UNDETERMINED hazard urgency until joint ground reconnaissance team files geotagged site photos.',
  },
];

/**
 * Returns audit entries for a specific habitation.
 */
export function getReviewAuditEntriesForHabitation(habitationId: string): ReviewAuditEntry[] {
  return INITIAL_REVIEW_AUDIT_LOG.filter(e => e.habitationId === habitationId);
}
