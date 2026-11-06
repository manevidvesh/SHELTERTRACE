// src/data/spatial/criticalFacilities.ts
// Traceable facility directory combining verified OpenStreetMap infrastructure with official Kerala PDNA records

import type { CriticalFacility } from '../../types/spatial';

export const CRITICAL_FACILITY_DIRECTORY: CriticalFacility[] = [
  // 1. Regional Tertiary Referral Hospital (Meppadi Valley)
  {
    id: 'fac-dm-wims',
    name: 'DM Wayanad Institute of Medical Sciences (DM WIMS)',
    type: 'HOSPITAL',
    coordinates: [11.5645, 76.1315],
    sourceId: 'OSM way/380933351 & way/804086142',
    publisher: 'OpenStreetMap Contributors / DM Education & Research Foundation',
    sourceDate: '2024-08-01',
    category: 'OBSERVED',
    locationQuality: 'CROWDSOURCED_OSM',
    spatialRelationshipToHazard: 'OUTSIDE DISASTER RUNOUT CORRIDOR (STABLE RECEPTION BASE)',
    operationalStatus: 'OPERATIONAL — Primary casualty reception center during 2024 rescue operations.',
    limitations: ['Building outline crowdsourced; campus boundary approximate.'],
  },

  // 2. Public Community Health Center (Meppadi Hub)
  {
    id: 'fac-meppadi-chc',
    name: 'Community Health Centre (CHC) Meppadi',
    type: 'HOSPITAL',
    coordinates: [11.5548, 76.1268],
    sourceId: 'OSM way/763029796 & node/8667718017',
    publisher: 'OpenStreetMap Contributors / Directorate of Health Services, Kerala',
    sourceDate: '2024-08-01',
    category: 'OBSERVED',
    locationQuality: 'CROWDSOURCED_OSM',
    spatialRelationshipToHazard: 'OUTSIDE DISASTER RUNOUT CORRIDOR (EMERGENCY TRIAGE HUB)',
    operationalStatus: 'OPERATIONAL — Main government field triage clinic in Meppadi town.',
    limitations: ['Node coordinates reflect outpatient entry gate.'],
  },

  // 3. Family Health Centre Meppadi
  {
    id: 'fac-fhc-meppadi',
    name: 'Family Health Centre (FHC) Meppadi',
    type: 'CLINIC',
    coordinates: [11.5539, 76.1272],
    sourceId: 'OSM node/7130140273',
    publisher: 'OpenStreetMap Contributors / National Health Mission Kerala',
    sourceDate: '2024-08-01',
    category: 'OBSERVED',
    locationQuality: 'CROWDSOURCED_OSM',
    spatialRelationshipToHazard: 'OUTSIDE DISASTER RUNOUT CORRIDOR',
    operationalStatus: 'OPERATIONAL — Primary outpatient clinic.',
    limitations: ['Crowdsourced point coordinate.'],
  },

  // 4. Harrisons Malayalam Limited (HML) Estate Hospital
  {
    id: 'fac-hml-hospital',
    name: 'Harrisons Malayalam Limited (HML) Estate Hospital',
    type: 'HOSPITAL',
    coordinates: [11.5482, 76.1345],
    sourceId: 'OSM way/804180240',
    publisher: 'OpenStreetMap Contributors / Harrisons Malayalam Ltd',
    sourceDate: '2024-08-01',
    category: 'OBSERVED',
    locationQuality: 'CROWDSOURCED_OSM',
    spatialRelationshipToHazard: 'VALLEY MARGIN PROXIMITY (INTACT ACCESS)',
    operationalStatus: 'OPERATIONAL — Plantation dispensary providing first-aid to estate workforce.',
    limitations: ['Estate clinic structure; limited surgical capacity.'],
  },

  // 5. Emergency Services: Meppadi Police Station
  {
    id: 'fac-police-meppadi',
    name: 'Police Station, Meppadi',
    type: 'EMERGENCY_POLICE',
    coordinates: [11.5542, 76.1284],
    sourceId: 'OSM node/8667718018 & node/9511157519',
    publisher: 'OpenStreetMap Contributors / Kerala Police',
    sourceDate: '2024-08-01',
    category: 'OBSERVED',
    locationQuality: 'CROWDSOURCED_OSM',
    spatialRelationshipToHazard: 'OUTSIDE DISASTER RUNOUT CORRIDOR (COMMAND STAGING)',
    operationalStatus: 'OPERATIONAL — Law enforcement and disaster control room.',
    limitations: ['Crowdsourced pin.'],
  },

  // 6. Regional Higher Secondary School (Meppadi)
  {
    id: 'fac-ghss-meppadi',
    name: 'Government Higher Secondary School (GHSS) Meppadi',
    type: 'SCHOOL_HIGHER',
    coordinates: [11.5528, 76.1245],
    sourceId: 'OSM way/839911667',
    publisher: 'OpenStreetMap Contributors / Department of General Education, Kerala',
    sourceDate: '2024-08-01',
    category: 'OBSERVED',
    locationQuality: 'CROWDSOURCED_OSM',
    spatialRelationshipToHazard: 'OUTSIDE DISASTER RUNOUT CORRIDOR (RELIEF CAMP SHELTER)',
    operationalStatus: 'OPERATIONAL — Repurposed as central relief camp and temporary classrooms post-disaster.',
    limitations: ['Footprint verified from OSM cadastre.'],
  },

  // 7. St. Joseph Girls Higher Secondary School Meppadi
  {
    id: 'fac-st-joseph-hss',
    name: 'St. Joseph Girls Higher Secondary School, Meppadi',
    type: 'SCHOOL_HIGHER',
    coordinates: [11.5512, 76.1292],
    sourceId: 'OSM way/839882452 & node/8667887018',
    publisher: 'OpenStreetMap Contributors',
    sourceDate: '2024-08-01',
    category: 'OBSERVED',
    locationQuality: 'CROWDSOURCED_OSM',
    spatialRelationshipToHazard: 'OUTSIDE DISASTER RUNOUT CORRIDOR',
    operationalStatus: 'OPERATIONAL — Educational campus.',
    limitations: ['Crowdsourced building outline.'],
  },

  // 8. Ground-Zero Casualty: GVHSS Vellarmala (Missing in OSM tags, georeferenced from PDNA)
  {
    id: 'fac-gvhss-vellarmala',
    name: 'Government Vocational Higher Secondary School (GVHSS) Vellarmala',
    type: 'SCHOOL_HIGHER',
    coordinates: [11.5412, 76.1438],
    sourceId: 'Kerala Post-Disaster Needs Assessment (PDNA) & Dept of General Education Table 4.2',
    publisher: 'Government of Kerala / Kerala State Disaster Management Authority (KSDMA)',
    sourceDate: '2024-08-05',
    category: 'OBSERVED',
    locationQuality: 'GEOREFERENCED_APPROXIMATE',
    spatialRelationshipToHazard: 'ILLUSTRATIVE PROXIMITY ONLY (NON-SURVEYED: CAMPUS SEVERELY DAMAGED)',
    operationalStatus: 'DESTROYED / CONDEMNED (30 July 2024) — Classrooms and grounds buried under debris surge; students relocated to GHSS Meppadi.',
    limitations: [
      'Facility omitted from pre-disaster OpenStreetMap amenity tags.',
      'Coordinates georeferenced from Education Department revenue cadastres and drone survey mosaics with ±25m uncertainty.',
      'Cannot be calculated against illustrative debris polygon without false precision claims.',
    ],
  },

  // 9. Ground-Zero Casualty: GLPS Mundakkai (Missing in OSM tags, georeferenced from PDNA)
  {
    id: 'fac-glps-mundakkai',
    name: 'Government Lower Primary School (GLPS) Mundakkai',
    type: 'SCHOOL_PRIMARY',
    coordinates: [11.5365, 76.1558],
    sourceId: 'Kerala PDNA Sectoral Report & LSGD Ward Cadastre',
    publisher: 'Local Self Government Department, Kerala / District Administration Wayanad',
    sourceDate: '2024-08-05',
    category: 'OBSERVED',
    locationQuality: 'GEOREFERENCED_APPROXIMATE',
    spatialRelationshipToHazard: 'ILLUSTRATIVE PROXIMITY ONLY (NON-SURVEYED: STRUCTURAL DESTRUCTION)',
    operationalStatus: 'DESTROYED (30 July 2024) — Completely ruined by high-velocity debris surge in upper valley.',
    limitations: [
      'Facility omitted from pre-disaster OpenStreetMap tags.',
      'Coordinates approximate (±30m) based on local revenue records.',
      'Must not be used to compute synthetic damage percentages.',
    ],
  },

  // 10. Critical Lifeline: Chooralmala Vehicular Bridge (Destroyed)
  {
    id: 'fac-bridge-chooralmala',
    name: 'Chooralmala River Bridge (Pre-Disaster Concrete Structure)',
    type: 'BRIDGE_INFRASTRUCTURE',
    coordinates: [11.5430, 76.1418],
    sourceId: 'Kerala Public Works Department (PWD) Bridges Division Incident Log',
    publisher: 'Kerala PWD / KSDMA Situation Report #01',
    sourceDate: '2024-07-30',
    category: 'OBSERVED',
    locationQuality: 'OFFICIALLY_SURVEYED',
    spatialRelationshipToHazard: 'CONFIRMED GROUND SEVERANCE (PRIMARY ACCESS BOTTLENECK)',
    operationalStatus: 'WASHED AWAY (30 July 2024, ~02:00 IST) — Concrete bridge over Iruvaipuzha river connecting mainland to Mundakkai destroyed.',
    limitations: [
      'Omitted as an explicit bridge tag in current OpenStreetMap highway dataset.',
      'Point coordinate corresponds to western abutment survey mark.',
    ],
  },

  // 11. Restoration Infrastructure: Indian Army Bailey Bridge
  {
    id: 'fac-bailey-bridge',
    name: 'Indian Army Bailey Bridge (190-ft Emergency Crossing)',
    type: 'BRIDGE_INFRASTRUCTURE',
    coordinates: [11.5430, 76.1418],
    sourceId: 'Indian Army MEG Press Release & KSDMA Operational Directive',
    publisher: 'Madras Engineer Group (MEG), Indian Army / Ministry of Defence',
    sourceDate: '2024-08-01',
    category: 'DERIVED',
    locationQuality: 'OFFICIALLY_SURVEYED',
    spatialRelationshipToHazard: 'OPERATIONAL RESTORATION (CROSSES ACTIVE DEBRIS CHANNEL)',
    operationalStatus: 'OPERATIONAL RESTORATION (Constructed 01 August 2024) — Single-lane 24-tonne temporary crossing restoring vehicular rescue ingress.',
    limitations: [
      'Temporary military superstructure; subject to continuous hydraulic monitoring.',
      'Single-lane alternating traffic; cannot support pre-disaster multi-axle freight volume.',
    ],
  },
];
