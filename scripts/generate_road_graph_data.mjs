// scripts/generate_road_graph_data.mjs
// Reproducible processing script to extract authentic OSM road network from data/audit/osm_wayanad_corridor.osm

import fs from 'fs';
import path from 'path';

const RAW_FILE = path.resolve('data/audit/osm_wayanad_corridor.osm');
const OUT_FILE = path.resolve('src/data/spatial/osmRoadData.ts');

const xml = fs.readFileSync(RAW_FILE, 'utf-8');

// 1. Parse all nodes
const nodesMap = new Map();
const nodeRegex = /<node id="(\d+)"[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"/g;
let nMatch;
while ((nMatch = nodeRegex.exec(xml)) !== null) {
  nodesMap.set(nMatch[1], {
    id: nMatch[1],
    lat: parseFloat(nMatch[2]),
    lon: parseFloat(nMatch[3]),
  });
}

console.log(`Parsed ${nodesMap.size} nodes from raw OSM.`);

// Haversine distance in metres
function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// 2. Parse all highway ways
const wayRegex = /<way id="(\d+)"[^>]*>([\s\S]*?)<\/way>/g;
let wMatch;
const rawWays = [];
const usedNodeIds = new Set();

while ((wMatch = wayRegex.exec(xml)) !== null) {
  const wayId = wMatch[1];
  const wayBody = wMatch[2];

  if (!wayBody.includes('k="highway"')) continue;

  const nodeRefs = [];
  const ndRegex = /<nd ref="(\d+)"\/>/g;
  let ndMatch;
  while ((ndMatch = ndRegex.exec(wayBody)) !== null) {
    nodeRefs.push(ndMatch[1]);
  }

  const tags = {};
  const tagRegex = /<tag k="([^"]+)" v="([^"]+)"\/>/g;
  let tMatch;
  while ((tMatch = tagRegex.exec(wayBody)) !== null) {
    tags[tMatch[1]] = tMatch[2];
  }

  // Calculate length
  let lengthMeters = 0;
  for (let i = 0; i < nodeRefs.length - 1; i++) {
    const n1 = nodesMap.get(nodeRefs[i]);
    const n2 = nodesMap.get(nodeRefs[i + 1]);
    if (n1 && n2) {
      lengthMeters += haversineMeters(n1.lat, n1.lon, n2.lat, n2.lon);
    }
  }

  nodeRefs.forEach(id => usedNodeIds.add(id));

  rawWays.push({
    id: wayId,
    name: tags['name'] || 'Unnamed Road',
    highway: tags['highway'] || 'unclassified',
    bridge: tags['bridge'] || undefined,
    oneway: tags['oneway'] === 'yes',
    nodeIds: nodeRefs,
    lengthMeters,
  });
}

console.log(`Parsed ${rawWays.length} highway ways using ${usedNodeIds.size} unique nodes.`);

// Filter nodes to only those used by roads to keep bundle compact
const nodesList = [];
usedNodeIds.forEach(id => {
  const n = nodesMap.get(id);
  if (n) {
    nodesList.push(n);
  }
});

const outContent = `// src/data/spatial/osmRoadData.ts
// Generated reproducibly by scripts/generate_road_graph_data.mjs from data/audit/osm_wayanad_corridor.osm
// Source: OpenStreetMap Contributors (ODbL v1.0), Extracted 06 November 2026

export interface RawOsmNode {
  id: string;
  lat: number;
  lon: number;
}

export interface RawOsmWay {
  id: string;
  name: string;
  highway: string;
  bridge?: string;
  oneway?: boolean;
  nodeIds: string[];
  lengthMeters: number;
}

export interface OsmRoadDataset {
  metadata: {
    source: string;
    licence: string;
    extractionDate: string;
    boundingBox: { minLon: number; minLat: number; maxLon: number; maxLat: number };
    totalNodes: number;
    totalWays: number;
  };
  nodes: RawOsmNode[];
  ways: RawOsmWay[];
}

export const OSM_ROAD_DATASET: OsmRoadDataset = {
  metadata: {
    source: 'OpenStreetMap API 0.6 Export',
    licence: 'Open Database License (ODbL) v1.0',
    extractionDate: '2026-11-06T14:32:00Z',
    boundingBox: { minLon: 76.12, minLat: 11.52, maxLon: 76.175, maxLat: 11.56 },
    totalNodes: ${nodesList.length},
    totalWays: ${rawWays.length},
  },
  nodes: ${JSON.stringify(nodesList)},
  ways: ${JSON.stringify(rawWays)},
};
`;

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, outContent, 'utf-8');
console.log(`Successfully generated ${OUT_FILE} (${(outContent.length / 1024).toFixed(1)} KB).`);
