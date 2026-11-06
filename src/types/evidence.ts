export type EvidenceCategory = 'OBSERVED' | 'MODELLED' | 'DERIVED' | 'ILLUSTRATIVE';

export type QualityStatus = 'COMPLETE' | 'PARTIAL' | 'INSUFFICIENT' | 'CONFLICTING';

export type EvidenceDomain = 
  | 'HAZARD_IMPACT' 
  | 'TERRAIN_GEOLOGY' 
  | 'SETTLEMENT_EXPOSURE' 
  | 'INFRASTRUCTURE_ACCESS' 
  | 'FIELD_VERIFICATION';

export type GeometryOrigin = 
  | 'OFFICIALLY_MAPPED' 
  | 'FIELD_SURVEYED' 
  | 'IMAGERY_DERIVED' 
  | 'MANUALLY_DIGITISED' 
  | 'APPROXIMATE_ILLUSTRATIVE';

export type GeometryQuality = 
  | 'FIELD_VERIFIED' 
  | 'ACCURACY_DOCUMENTED' 
  | 'ACCURACY_UNKNOWN' 
  | 'KNOWN_LIMITATION';

export type SpatialIntersectionType = 
  | 'CONFIRMED_INTERSECTION' 
  | 'APPROXIMATE_INTERSECTION' 
  | 'PROXIMITY_BASED' 
  | 'UNRELIABLE_CANNOT_ESTABLISH';

export type ConflictReviewStatus = 
  | 'UNREVIEWED' 
  | 'UNDER_REVIEW' 
  | 'RESOLVED_WITH_REASON' 
  | 'INCONCLUSIVE';

export type ReviewActionType = 
  | 'ACCEPTED' 
  | 'REJECTED' 
  | 'INCONCLUSIVE' 
  | 'FIELD_NOTE_ADDED';

export interface EvidenceItem {
  id: string;
  name: string;
  domain: EvidenceDomain;
  category: EvidenceCategory;
  finding: string;
  valueNumeric?: number;
  valueUnit?: string;
  status: QualityStatus;
  sourceOrg: string;
  sourceUrl?: string;
  sourceReference: string;

  // 1. Temporal Intelligence
  eventDate?: string;               // ISO date of physical event (e.g. "2024-07-30")
  observationDate: string;          // ISO date sensor or field team observed record (e.g. "2024-07-31")
  dataAcquisitionDate?: string;     // ISO date raw data was acquired by satellite/sensor
  publicationDate?: string;         // ISO date published in official gazette / portal
  lastVerificationDate?: string;    // ISO date last verified on ground
  isHistorical?: boolean;           // True if baseline/historical (e.g. 2020 GSI); False if event-specific
  relevanceDependsOnRecency?: boolean; // True for perishable evidence (road access, rainfall, active cracks)
  isOutdatedForDomain?: boolean;    // Flagged only where recency matters and evidence is stale

  // 2. Spatial Uncertainty & Geometry Quality
  spatialResolution: string;        // e.g. "0.5m Cartosat-3", "30m Copernicus DEM", "1:50,000 GSI"
  geometryOrigin?: GeometryOrigin;
  geometryQuality?: GeometryQuality;
  coordinateReferenceSystem?: string; // e.g. "EPSG:4326 (WGS84)"
  positionalAccuracy?: string;       // e.g. "±0.5m Cartosat-3", "±15m Copernicus DEM", "Unknown / Undocumented"
  spatialIntersectionType?: SpatialIntersectionType;
  geometryProcessingHistory?: string[];
  spatialLimitations?: string[];

  // 3. Conflict & Criticality Flags
  knownLimitations: string[];
  isContradictory?: boolean;
  contradictionNote?: string;
  isCritical: boolean;              // if missing/insufficient, prevents definitive prioritisation
}

export interface EvidenceConflictRecord {
  id: string;
  habitationId: string;
  conflictingEvidenceIds: string[];
  conflictingSources: string[];
  observationDates: string[];
  geographicCoverage: string;
  natureOfDisagreement: string;
  affectsAssessment: boolean;
  suggestedVerification: string;
  reviewStatus: ConflictReviewStatus;
  resolutionReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface ReviewAuditEntry {
  id: string;
  habitationId: string;
  timestamp: string;
  reviewerRole: string; // e.g. "Field Geologist (Team 02)"
  action: ReviewActionType;
  targetEvidenceId?: string;
  previousState: string;
  newState: string;
  changeReason: string;
  fieldObservationText?: string;
}

export interface DatasetMetadata {
  id: string;
  name: string;
  sourceOrg: string;
  sourceUrl: string;
  publicationDate: string;
  spatialResolution: string;
  category: EvidenceCategory;
  description: string;
  knownLimitations: string[];
  processingSteps: string[];
  isAuthentic: boolean;
}
