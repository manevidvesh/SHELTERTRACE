// src/types/spatial.ts
// Shared spatial intelligence and road network accessibility types

export type NetworkState =
  | 'CURRENT_MAPPED_NETWORK'
  | 'DOCUMENTED_BRIDGE_DISRUPTION'
  | 'DOCUMENTED_RESTORATION';

export type AccessibilityStatus =
  | 'CONNECTED IN MAPPED NETWORK'
  | 'DISCONNECTED IN MODELLED SCENARIO'
  | 'NO VALID ROUTE FOUND'
  | 'INSUFFICIENT NETWORK EVIDENCE';

export interface RoadNode {
  id: string;
  lat: number;
  lon: number;
}

export interface RoadEdge {
  id: string;
  wayId: string;
  fromNode: string;
  toNode: string;
  distanceMeters: number;
  highway: string;
  name: string;
  oneway: boolean;
  bridge?: string;
  isScenarioEdge?: boolean;
  scenarioNote?: string;
}

export interface NetworkPathResult {
  fromNodeId: string;
  toNodeId: string;
  distanceMeters: number | null;
  pathNodeIds: string[];
  edgesTraversed: number;
  status: AccessibilityStatus;
  scenarioState: NetworkState;
  explanation: string;
}

export interface HabitationAccessibilityReport {
  habitationId: string;
  habitationName: string;
  centroid: [number, number];
  nearestRoadNodeId: string | null;
  distanceToRoadMeters: number | null;
  status: AccessibilityStatus;
  routeDistanceMeters: number | null;
  routeHopCount: number;
  activeScenario: NetworkState;
  connectivityChangeSummary: string;
}

export type FacilityType =
  | 'HOSPITAL'
  | 'CLINIC'
  | 'EMERGENCY_POLICE'
  | 'SCHOOL_HIGHER'
  | 'SCHOOL_PRIMARY'
  | 'BRIDGE_INFRASTRUCTURE'
  | 'ADMINISTRATIVE';

export type LocationQuality =
  | 'OFFICIALLY_SURVEYED'
  | 'CROWDSOURCED_OSM'
  | 'GEOREFERENCED_APPROXIMATE'
  | 'UNVERIFIED_COORDINATES';

export interface CriticalFacility {
  id: string;
  name: string;
  type: FacilityType;
  coordinates: [number, number]; // [lat, lon]
  sourceId: string;
  publisher: string;
  sourceDate: string;
  category: 'OBSERVED' | 'DERIVED' | 'ILLUSTRATIVE' | 'SYNTHETIC';
  locationQuality: LocationQuality;
  spatialRelationshipToHazard: string;
  operationalStatus: string;
  limitations: string[];
}

export interface PopulationContextSummary {
  datasetName: string;
  datasetIdentifier: string;
  spatialResolution: string;
  coordinateReferenceSystem: string;
  referenceYear: number;
  format: string;
  calculationStatus: 'DATA UNAVAILABLE (NO ADMISSIBLE SURVEYED IMPACT POLYGON)' | 'MODELLED REGIONAL POPULATION CONTEXT';
  disclaimer: string;
  methodologicalNotes: string[];
}

export interface BuildingCoverageSummary {
  auditStatus: 'DATA INSUFFICIENT FOR REPRESENTATIVE BUILDING EXPOSURE ESTIMATION';
  downloadedPolygonCount: number;
  unclassifiedRate: string;
  actualValleyBuildingEstimate: string;
  captureRatio: string;
  reasonForDeferral: string;
  limitations: string[];
}
