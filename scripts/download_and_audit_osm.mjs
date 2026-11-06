// scripts/download_and_audit_osm.mjs
import fs from 'fs';
import path from 'path';

// Study area bounding box: Chooralmala - Mundakkai - Punchirimattom - Vellarmala - Attamala
// min_lon=76.12, min_lat=11.52, max_lon=76.175, max_lat=11.56
const MIN_LON = 76.12;
const MIN_LAT = 11.52;
const MAX_LON = 76.175;
const MAX_LAT = 11.56;

const BBOX = `${MIN_LON},${MIN_LAT},${MAX_LON},${MAX_LAT}`;
const OUTPUT_DIR = path.resolve('data/audit');
const RAW_FILE = path.join(OUTPUT_DIR, 'osm_wayanad_corridor.osm');

async function downloadOSM() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const url = `https://api.openstreetmap.org/api/0.6/map?bbox=${BBOX}`;
  console.log(`Downloading authentic OSM data from: ${url}`);

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'ShelterTrace-Feasibility-Audit/1.0 (contact: auditor@sheltertrace.internal)'
    }
  });

  if (!res.ok) {
    throw new Error(`OSM API returned HTTP ${res.status}: ${res.statusText}`);
  }

  const text = await res.text();
  fs.writeFileSync(RAW_FILE, text, 'utf-8');
  console.log(`Saved raw OSM file to: ${RAW_FILE} (${(text.length / 1024).toFixed(1)} KB)`);

  return text;
}

function parseAndAudit(osmXml) {
  console.log('\n=== PARSING & AUDITING OPENSTREETMAP DATA ===\n');

  // Parse nodes
  const nodeMatches = osmXml.match(/<node id="(\d+)"[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"[^>]*>/g) || [];
  console.log(`1. Total Nodes Ingested: ${nodeMatches.length}`);

  // Parse ways
  const wayRegex = /<way id="(\d+)"[^>]*>([\s\S]*?)<\/way>/g;
  let wayMatch;
  let totalWays = 0;
  let buildingsCount = 0;
  const buildingTypes = {};
  let highwaysCount = 0;
  const highwayTypes = {};
  const bridges = [];
  const facilities = [];

  while ((wayMatch = wayRegex.exec(osmXml)) !== null) {
    totalWays++;
    const wayId = wayMatch[1];
    const wayBody = wayMatch[2];

    // Tags
    const tagRegex = /<tag k="([^"]+)" v="([^"]+)"\/>/g;
    let tagMatch;
    const tags = {};
    while ((tagMatch = tagRegex.exec(wayBody)) !== null) {
      tags[tagMatch[1]] = tagMatch[2];
    }

    // Building
    if (tags['building']) {
      buildingsCount++;
      const bType = tags['building'];
      buildingTypes[bType] = (buildingTypes[bType] || 0) + 1;
    }

    // Highway
    if (tags['highway']) {
      highwaysCount++;
      const hType = tags['highway'];
      highwayTypes[hType] = (highwayTypes[hType] || 0) + 1;

      if (tags['bridge'] && tags['bridge'] !== 'no') {
        bridges.push({ id: wayId, tags });
      }
    }

    // Amenities/Facilities
    if (tags['amenity'] || tags['healthcare'] || tags['school']) {
      facilities.push({ type: 'way', id: wayId, tags });
    }
  }

  // Parse node tags for facilities/points of interest
  const nodeTagRegex = /<node id="(\d+)"[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"[^>]*>([\s\S]*?)<\/node>/g;
  let nodeTagMatch;
  while ((nodeTagMatch = nodeTagRegex.exec(osmXml)) !== null) {
    const nId = nodeTagMatch[1];
    const lat = parseFloat(nodeTagMatch[2]);
    const lon = parseFloat(nodeTagMatch[3]);
    const nBody = nodeTagMatch[4];

    const tagRegex = /<tag k="([^"]+)" v="([^"]+)"\/>/g;
    let tagMatch;
    const tags = {};
    while ((tagMatch = tagRegex.exec(nBody)) !== null) {
      tags[tagMatch[1]] = tagMatch[2];
    }

    if (tags['amenity'] || tags['healthcare'] || tags['school'] || tags['emergency']) {
      facilities.push({ type: 'node', id: nId, lat, lon, tags });
    }
  }

  console.log(`2. Total Ways Ingested: ${totalWays}`);
  console.log(`\n--- A. BUILDING FOOTPRINTS AUDIT ---`);
  console.log(`- Verified Building Polygons: ${buildingsCount}`);
  console.log(`- Building Classifications:`, buildingTypes);
  const genericCount = buildingTypes['yes'] || 0;
  console.log(`- Generic/Unclassified ('yes'): ${genericCount} (${((genericCount / buildingsCount) * 100).toFixed(1)}%)`);
  console.log(`- Residential/House classified: ${(buildingTypes['residential'] || 0) + (buildingTypes['house'] || 0)}`);

  console.log(`\n--- B. ROAD & BRIDGE NETWORK AUDIT ---`);
  console.log(`- Total Road Network Edges: ${highwaysCount}`);
  console.log(`- Highway Classifications:`, highwayTypes);
  console.log(`- Bridges Found in Disaster Corridor: ${bridges.length}`);
  bridges.forEach(b => {
    console.log(`    Bridge way/${b.id}: name="${b.tags.name || 'unnamed'}", highway=${b.tags.highway}, layer=${b.tags.layer || 'unspecified'}`);
  });

  console.log(`\n--- C. CRITICAL FACILITIES AUDIT ---`);
  console.log(`- Total Facility / Amenity Records Found: ${facilities.length}`);
  facilities.forEach(f => {
    const name = f.tags.name || 'Unnamed';
    const kind = f.tags.amenity || f.tags.healthcare || f.tags.school || 'other';
    console.log(`    [${f.type.toUpperCase()}/${f.id}] Kind: "${kind}", Name: "${name}"`);
  });

  // Save audit summary JSON
  const summary = {
    auditTimestamp: new Date().toISOString(),
    boundingBox: { minLon: MIN_LON, minLat: MIN_LAT, maxLon: MAX_LON, maxLat: MAX_LAT },
    nodesCount: nodeMatches.length,
    waysCount: totalWays,
    buildings: {
      total: buildingsCount,
      breakdown: buildingTypes,
      unclassifiedRate: ((genericCount / buildingsCount) * 100).toFixed(1) + '%'
    },
    roads: {
      totalEdges: highwaysCount,
      breakdown: highwayTypes,
      bridgesCount: bridges.length,
      bridges: bridges.map(b => ({ id: b.id, name: b.tags.name, highway: b.tags.highway }))
    },
    criticalFacilities: {
      total: facilities.length,
      records: facilities.map(f => ({ id: f.id, type: f.type, kind: f.tags.amenity || f.tags.healthcare || 'other', name: f.tags.name }))
    }
  };

  const auditJsonPath = path.join(OUTPUT_DIR, 'osm_feasibility_audit_summary.json');
  fs.writeFileSync(auditJsonPath, JSON.stringify(summary, null, 2), 'utf-8');
  console.log(`\nAudit summary saved to: ${auditJsonPath}`);
}

async function main() {
  try {
    const xml = await downloadOSM();
    parseAndAudit(xml);
  } catch (err) {
    console.error('Audit failed:', err);
  }
}

main();
