import type { EvidenceItem } from './evidence';

export type HazardUrgency = 'URGENT' | 'ELEVATED' | 'ROUTINE' | 'UNDETERMINED';

export type EvidenceQuality = 'COMPLETE' | 'PARTIAL' | 'INSUFFICIENT' | 'CONFLICTING';

export interface Habitation {
  id: string;
  name: string;
  localAdministrativeUnit: string; // e.g. "Meppadi Grama Panchayat, Wayanad"
  centroid: [number, number]; // [latitude, longitude]
  elevationMeters: number;
  estimatedPopulation: number;
  buildingCount: number;
  evidence: EvidenceItem[];
  tags: string[];
  isIllustrativeRecord?: boolean;
}

export interface PrioritisationResult {
  habitationId: string;
  hazardUrgency: HazardUrgency;
  evidenceQuality: EvidenceQuality;
  primaryReason: string;
  detailedReasoning: string[];
  supportingEvidence: EvidenceItem[];
  missingEvidence: string[];
  conflictingEvidence: string[];
  limitations: string[];
  recommendedFieldChecks: string[];
  applicableRules: string[];
  isDemonstrationOnly: boolean;
}

export interface SensitivityAssumption {
  id: string;
  name: string;
  description: string;
  affectedEvidenceDomain: string;
  testedParameter: string;
  documentedRange: string;
  currentAssumption: string;
  alternativeAssumption: string;
  isExecutableInMVP: boolean;
  statusNotice?: string;
}

export interface SensitivityEvaluation {
  assumption: SensitivityAssumption;
  originalUrgency: HazardUrgency;
  originalQuality: EvidenceQuality;
  modifiedUrgency: HazardUrgency;
  modifiedQuality: EvidenceQuality;
  isStable: boolean;
  drivingEvidence: string;
  explanation: string;
}

export interface ScenarioStabilityResult {
  scenarioId: string;
  scenarioName: string;
  testedParameter: string;
  appliedAssumption: string;
  resultingUrgency: HazardUrgency;
  resultingQuality: EvidenceQuality;
  remainsInTopPriorityGroup: boolean; // urgency === 'URGENT'
  drivingFactor: string;
  isExecutable?: boolean;
  statusNote?: string;
}

export interface PriorityStabilityReport {
  habitationId: string;
  baseUrgency: HazardUrgency;
  baseQuality: EvidenceQuality;
  totalScenariosTested: number;
  scenariosInTopPriorityGroup: number;
  stabilityCategory: 
    | 'STABLE_TOP_PRIORITY' 
    | 'CONDITIONAL_ON_LIFELINE' 
    | 'SENSITIVE_TO_GEOMETRY' 
    | 'STABLE_LOWER_SEVERITY' 
    | 'UNDETERMINED_PENDING_SURVEY';
  summaryExplanation: string;
  results: ScenarioStabilityResult[];
  disclaimer: string;
}
