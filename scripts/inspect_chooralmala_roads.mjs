// scripts/inspect_chooralmala_roads.mjs
import fs from 'fs';
import path from 'path';

const RAW_FILE = path.resolve('data/audit/osm_wayanad_corridor.osm');
const osmXml = fs.readFileSync(RAW_FILE, 'utf-8');

// Parse nodes to get coordinates map
const nodes = new Map();
const nodeRegex = /<node id="(\d+)"[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"[^>]*>/g;
let m;
while ((m = nodeRegex.exec(osmXml)) !== null) {
  nodes.set(m[1], { lat: parseFloat(m[2]), lon: parseFloat(m[3]) });
}

// Find roads passing within 500m of Chooralmala Bridge [11.5430, 76.1418]
const TARGET_LAT = 11.5430;
const TARGET_LON = 76.1418;

function distance(lat1, lon1, lat2, lon2) {
  const dlat = (lat2 - lat1) * 111000;
  const dlon = (lon2 - lon1) * 111000 * Math.cos(lat1 * Math.PI / 180);
  return Math.sqrt(dlat * dlat + dlon * dlon);
}

const wayRegex = /<way id="(\d+)"[^>]*>([\s\S]*?)<\/way>/g;
let wMatch;
const nearbyRoads = [];

while ((wMatch = wayRegex.exec(osmXml)) !== null) {
  const wayId = wMatch[1];
  const wayBody = wMatch[2];

  // check if highway
  if (!wayBody.includes('k="highway"')) continue;

  // get nodes
  const ndRegex = /<nd ref="(\d+)"\/>/g;
  let ndMatch;
  const wayNodeIds = [];
  while ((ndMatch = ndRegex.exec(wayBody)) !== null) {
    wayNodeIds.push(ndMatch[1]);
  }

  // check distance
  let minD = Infinity;
  for (const nId of wayNodeIds) {
    const pt = nodes.get(nId);
    if (pt) {
      const d = distance(TARGET_LAT, TARGET_LON, pt.lat, pt.lon);
      if (d < minD) minD = d;
    }
  }

  if (minD < 600) {
    // extract tags
    const tagRegex = /<tag k="([^"]+)" v="([^"]+)"\/>/g;
    let tMatch;
    const tags = {};
    while ((tMatch = tagRegex.exec(wayBody)) !== null) {
      tags[tMatch[1]] = tMatch[2];
    }
    nearbyRoads.push({ wayId, minD, tags, nodeCount: wayNodeIds.length });
  }
}

console.log(`Found ${nearbyRoads.length} road ways within 600m of Chooralmala Bridge point:`);
nearbyRoads.sort((a,b) => a.minD - b.minD).forEach(r => {
  console.log(`- Way ${r.wayId} (dist: ${r.minD.toFixed(0)}m): highway=${r.tags.highway}, name="${r.tags.name || 'unnamed'}", bridge=${r.tags.bridge || 'no'}, access=${r.tags.access || 'yes'}, description="${r.tags.description || ''}"`);
});
