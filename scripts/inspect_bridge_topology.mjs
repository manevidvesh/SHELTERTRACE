// scripts/inspect_bridge_topology.mjs
import fs from 'fs';
import path from 'path';

const xml = fs.readFileSync('data/audit/osm_wayanad_corridor.osm', 'utf-8');

// Parse nodes
const nodes = new Map();
const nRe = /<node id="(\d+)"[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"/g;
let m;
while ((m = nRe.exec(xml)) !== null) {
  nodes.set(m[1], { lat: parseFloat(m[2]), lon: parseFloat(m[3]) });
}

// Find all ways with highway tag
const wRe = /<way id="(\d+)"[^>]*>([\s\S]*?)<\/way>/g;
let wm;
const highways = [];
while ((wm = wRe.exec(xml)) !== null) {
  const wid = wm[1];
  const body = wm[2];
  if (!body.includes('k="highway"')) continue;
  
  const nds = [];
  const ndRe = /<nd ref="(\d+)"\/>/g;
  let ndm;
  while ((ndm = ndRe.exec(body)) !== null) nds.push(ndm[1]);
  
  const tags = {};
  const tRe = /<tag k="([^"]+)" v="([^"]+)"\/>/g;
  let tm;
  while ((tm = tRe.exec(body)) !== null) tags[tm[1]] = tm[2];
  
  highways.push({ id: wid, nds, tags });
}

console.log('Total highways:', highways.length);

// Look at highways within 250m of Chooralmala bridge [11.5430, 76.1418]
const bridgeLat = 11.5430, bridgeLon = 76.1418;
function dist(lat1, lon1, lat2, lon2) {
  const dy = (lat2 - lat1) * 111000;
  const dx = (lon2 - lon1) * 111000 * Math.cos(lat1 * Math.PI / 180);
  return Math.sqrt(dx*dx + dy*dy);
}

const near = highways.filter(h => {
  return h.nds.some(nid => {
    const p = nodes.get(nid);
    return p && dist(bridgeLat, bridgeLon, p.lat, p.lon) < 300;
  });
});

console.log(`\nHighways within 300m of bridge coordinate [${bridgeLat}, ${bridgeLon}]:`);
near.forEach(h => {
  const p1 = nodes.get(h.nds[0]);
  const p2 = nodes.get(h.nds[h.nds.length - 1]);
  console.log(`- Way ${h.id} (${h.tags.highway}, name: "${h.tags.name || 'unnamed'}"): ${h.nds.length} nodes, start=[${p1?.lat.toFixed(5)}, ${p1?.lon.toFixed(5)}], end=[${p2?.lat.toFixed(5)}, ${p2?.lon.toFixed(5)}]`);
  
  // Print each node of this way
  console.log(`    Nodes:`, h.nds.map(nid => {
    const p = nodes.get(nid);
    return `${nid}@[${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}]`;
  }).join(' -> '));
});
