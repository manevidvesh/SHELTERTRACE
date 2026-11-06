import type { DatasetMetadata } from '../types/evidence';

export const AUTHENTIC_DATASETS: DatasetMetadata[] = [
  {
    id: 'NRSC_ISRO_WAYANAD_2024',
    name: 'ISRO / NRSC Post-Disaster Satellite Overview Maps (Reference Background)',
    sourceOrg: 'National Remote Sensing Centre (NRSC), Indian Space Research Organisation (ISRO)',
    sourceUrl: 'https://bhuvan-app1.nrsc.gov.in/disaster/disaster.php?id=landslide',
    publicationDate: '2024-07-31',
    spatialResolution: 'Reference figure: 0.5m Cartosat-3 / Sentinel-2 published overview maps',
    category: 'DERIVED',
    description: 'Published disaster overview maps referencing the debris flow corridor from Punchirimattom down through Chooralmala. NOTE: Raw multi-gigabyte satellite rasters were NOT processed in this project; an illustrative 25-vertex sketch polygon was manually digitized for demonstration visualization.',
    knownLimitations: [
      'Raw satellite imagery was not ingested into an image processing pipeline.',
      'Vector polygon in this project is an illustrative 25-vertex sketch approximation, not official GIS vector data.',
      'High cloud cover on July 30-31 obscured peripheral flank margins in source figures.'
    ],
    processingSteps: [
      'Inspection of published NRSC Plate-02 situation overview map',
      'Manual digitization of demonstrative 25-vertex overview sketch vector for Leaflet map overlay'
    ],
    isAuthentic: false, // The vector geometry in this project is illustrative
  },
  {
    id: 'GSI_NLSM_SUSCEPTIBILITY',
    name: 'GSI National Landslide Susceptibility Mapping (Reference Baseline)',
    sourceOrg: 'Geological Survey of India (GSI), Ministry of Mines, Govt. of India',
    sourceUrl: 'https://bhukosh.gsi.gov.in/',
    publicationDate: '2020-04-12',
    spatialResolution: '1:50,000 scale regional macro-zonation',
    category: 'MODELLED',
    description: 'Regional macro-scale landslide susceptibility zonation from GSI Quadrangle Sheet 58A/02. NOTE: Raw GSI GIS layer was not ingested; an illustrative 8-vertex sketch polygon is displayed on the map, and regional susceptibility classes are referenced as background data.',
    knownLimitations: [
      'Regional 1:50,000 macro-scale cannot be used for individual house-plot safety without site-specific slope engineering.',
      'Polygon in this project is an 8-vertex demonstrative sketch approximation.',
      'Derived before recent localized land-use modifications and tea estate drainage alterations.'
    ],
    processingSteps: [
      'Reference to published GSI 1:50,000 NLSM quadrangle sheet susceptibility ratings',
      'Manual digitization of demonstrative 8-vertex high-susceptibility zone for Leaflet overlay'
    ],
    isAuthentic: false, // Geometry in project is illustrative sketch
  },
  {
    id: 'COPERNICUS_GLO30_DEM',
    name: 'Copernicus Global 30m Digital Elevation Model (GLO-30 Baseline)',
    sourceOrg: 'European Space Agency (ESA) / Copernicus Programme',
    sourceUrl: 'https://spacedata.copernicus.eu/collections/copernicus-digital-elevation-model',
    publicationDate: '2021-11-30',
    spatialResolution: '30m horizontal grid, <4m relative vertical accuracy',
    category: 'DERIVED',
    description: 'Digital elevation baseline used to reference terrain slope gradients, aspect, and elevations at settlement centroids across the Vellarimala mountain massif.',
    knownLimitations: [
      '30m resolution averages micro-topographic knickpoints and vertical road cuts.',
      'Canopy elevation in dense evergreen rainforest may slightly elevate terrain model above true bare-earth ground.'
    ],
    processingSteps: [
      'Extraction of elevation values at settlement centroids from GLO-30 tile N11_E076',
      'Calculation of mean slope gradient in degrees for settlement sectors'
    ],
    isAuthentic: true,
  },
  {
    id: 'OSM_INFRA_SETTLEMENTS',
    name: 'OpenStreetMap Road Network & Settlement Centroids',
    sourceOrg: 'OpenStreetMap Contributors / Humanitarian OpenStreetMap Team (HOT)',
    sourceUrl: 'https://www.openstreetmap.org/',
    publicationDate: '2024-08-02',
    spatialResolution: 'Crowdsourced vector geometry (<5m positional precision)',
    category: 'DERIVED',
    description: 'Road network geometry (SH-59 Meppadi-Chooralmala road), Iruvaipuzha river bridge location, and settlement centroid coordinates.',
    knownLimitations: [
      'Crowdsourced data may have uneven completeness between urban centers and tea plantation line-houses.',
      'Damage state tags are unverified until cross-referenced with official Disaster Management Authority bulletins.'
    ],
    processingSteps: [
      'Extraction of highway, bridge, and place tags for Meppadi Panchayat',
      'Centroid calculation and topological connection verification'
    ],
    isAuthentic: true,
  },
  {
    id: 'ILLUSTRATIVE_GEOTECH_SURVEY',
    name: 'Demonstration Subsurface Geotechnical Boreholes & Structural Audits',
    sourceOrg: 'SHELTERTRACE Demonstration Dataset (Clearly Labelled Synthetic)',
    sourceUrl: 'Internal demonstration fixture',
    publicationDate: '2024-08-04',
    spatialResolution: 'Simulated point coordinates (5m radius)',
    category: 'ILLUSTRATIVE',
    description: 'Hypothetical borehole logs (colluvium mantle thickness, groundwater level) and sample building structural integrity checklists used solely to demonstrate engine sensitivity features where official field boreholes are not yet published.',
    knownLimitations: [
      'SYNTHETIC / DEMONSTRATION DATA ONLY.',
      'Must NEVER be used for real-life evacuation, structural occupancy, or resettlement decisions.'
    ],
    processingSteps: [
      'Synthesized based on typical charnockite/gneissic saprolite profiles described in GSI geotechnical literature'
    ],
    isAuthentic: false,
  },
];
