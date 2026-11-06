// GeoJSON FeatureCollections for Wayanad Meppadi Case Study
// All polygon geometries are demonstrative approximations digitized from published overview maps.

export interface GeoJsonGeometry {
  type: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon';
  coordinates: any;
}

export interface GeoJsonFeature {
  type: 'Feature';
  id?: string;
  properties: {
    id: string;
    name: string;
    category: 'OBSERVED' | 'MODELLED' | 'DERIVED' | 'ILLUSTRATIVE';
    layerType: 'DEBRIS_FLOW_IMPACT' | 'SUSCEPTIBILITY_ZONE' | 'RIVER_CORRIDOR' | 'CRITICAL_INFRASTRUCTURE' | 'HABITATION_BOUNDARY';
    sourceOrg: string;
    description: string;
    date: string;
    resolution: string;
    isAuthentic: boolean;
    [key: string]: any;
  };
  geometry: GeoJsonGeometry;
}

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

/**
 * Observed Landslide & Debris Flow Footprint (Illustrative Vector Approximation)
 * Digitized from published ISRO / NRSC Post-Disaster Satellite Overview Maps (July 31 2024).
 * NOTE: Approximated sketch polygon consisting of 25 vertices for demonstrative visualization.
 */
export const OBSERVED_DEBRIS_FLOW_GEOJSON: GeoJsonFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'nrsc-debris-flow-footprint',
      properties: {
        id: 'nrsc-debris-flow-footprint',
        name: 'Approximate Debris Flow Track (30 July 2024 Event)',
        category: 'ILLUSTRATIVE',
        layerType: 'DEBRIS_FLOW_IMPACT',
        sourceOrg: 'Digitized from published NRSC / ISRO event overview figures',
        description: 'Demonstration polygon approximating the ~8 km debris flow corridor from Punchirimattom down through Chooralmala. Digitized with 25 vertices; not raw official GIS data.',
        date: '2024-07-31',
        resolution: 'Illustrative approximation (25 vertices)',
        isAuthentic: false,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            // Upper Initiation Scarp (Punchirimattom)
            [76.1685, 11.5295],
            [76.1710, 11.5280],
            [76.1695, 11.5260],
            [76.1650, 11.5265],
            // Upper Valley Funnel
            [76.1620, 11.5280],
            [76.1595, 11.5305],
            // Mundakkai Inundation Zone
            [76.1580, 11.5335],
            [76.1565, 11.5365],
            [76.1530, 11.5385],
            // Valley Gorge towards Chooralmala
            [76.1485, 11.5400],
            [76.1450, 11.5415],
            // Chooralmala Town Center & River Confluence
            [76.1430, 11.5428],
            [76.1410, 11.5435],
            // Vellarmala School & Downstream Riparian Fan
            [76.1385, 11.5465],
            [76.1375, 11.5485],
            [76.1388, 11.5492],
            [76.1405, 11.5472],
            // Eastern Margin Return Path
            [76.1425, 11.5448],
            [76.1442, 11.5430],
            [76.1470, 11.5412],
            [76.1515, 11.5395],
            [76.1550, 11.5370],
            [76.1570, 11.5340],
            [76.1600, 11.5310],
            [76.1645, 11.5290],
            [76.1685, 11.5295],
          ],
        ],
      },
    },
  ],
};

/**
 * Modelled High Landslide Susceptibility Zone (Illustrative Boundary)
 * Approximated from Geological Survey of India (GSI) NLSM Overview Zonation.
 * NOTE: 8-vertex bounding polygon for demonstrative visualization; not raw GSI 1:50,000 shapefile.
 */
export const MODELLED_SUSCEPTIBILITY_GEOJSON: GeoJsonFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'gsi-nlsm-high-susceptibility',
      properties: {
        id: 'gsi-nlsm-high-susceptibility',
        name: 'Modelled High Susceptibility Area (Illustrative Boundary)',
        category: 'ILLUSTRATIVE',
        layerType: 'SUSCEPTIBILITY_ZONE',
        sourceOrg: 'Approximated from GSI NLSM regional zonation maps',
        description: 'Demonstration boundary outlining the steep mountain flank (>25°) subject to rain-induced failure. Approximated with 8 bounding vertices.',
        date: '2020-04-12',
        resolution: 'Illustrative approximation (8 vertices)',
        isAuthentic: false,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [76.1200, 11.5580],
            [76.1450, 11.5600],
            [76.1750, 11.5450],
            [76.1820, 11.5250],
            [76.1700, 11.5120],
            [76.1420, 11.5150],
            [76.1250, 11.5350],
            [76.1200, 11.5580],
          ],
        ],
      },
    },
  ],
};

/**
 * Iruvaipuzha River Corridor Polyline (Derived Approximate Centerline)
 */
export const RIVER_CORRIDOR_GEOJSON: GeoJsonFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'iruvaipuzha-river-line',
      properties: {
        id: 'iruvaipuzha-river-line',
        name: 'Iruvaipuzha River Axis (Approximate Centerline)',
        category: 'DERIVED',
        layerType: 'RIVER_CORRIDOR',
        sourceOrg: 'Traced from OpenStreetMap drainage centerline',
        description: 'Main drainage axis transmitting debris surge down Vellarimala massif.',
        date: '2024-08-01',
        resolution: 'Approximate centerline (9 vertices)',
        isAuthentic: false,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [76.1700, 11.5270],
          [76.1640, 11.5285],
          [76.1590, 11.5315],
          [76.1550, 11.5355],
          [76.1490, 11.5395],
          [76.1435, 11.5425],
          [76.1395, 11.5470],
          [76.1350, 11.5510],
          [76.1300, 11.5535],
        ],
      },
    },
  ],
};

/**
 * Critical Infrastructure Point: Chooralmala Swept Bridge
 */
export const CRITICAL_INFRASTRUCTURE_GEOJSON: GeoJsonFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'chooralmala-bridge-destroyed',
      properties: {
        id: 'chooralmala-bridge-destroyed',
        name: 'Chooralmala Bridge (Severed Structure)',
        category: 'OBSERVED',
        layerType: 'CRITICAL_INFRASTRUCTURE',
        sourceOrg: 'Kerala PWD Bridges Division (Documented Incident)',
        description: 'Documented site of 60m vehicular bridge on SH-59 swept away on 30 July 2024.',
        date: '2024-07-30',
        resolution: 'Documented point location',
        isAuthentic: true,
      },
      geometry: {
        type: 'Point',
        coordinates: [76.1418, 11.5430],
      },
    },
  ],
};
