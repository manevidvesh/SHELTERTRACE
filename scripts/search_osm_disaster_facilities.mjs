// scripts/search_osm_disaster_facilities.mjs
import fs from 'fs';
import path from 'path';

const RAW_FILE = path.resolve('data/audit/osm_wayanad_corridor.osm');
const osmXml = fs.readFileSync(RAW_FILE, 'utf-8');

const searchTerms = ['vellarmala', 'mundakkai', 'chooralmala', 'punchiri', 'attamala', 'school', 'hospital'];

console.log('Searching OSM XML for disaster site landmarks...\n');

// Search in all tags
const tagRegex = /<tag k="([^"]+)" v="([^"]+)"\/>/g;
let m;
const matches = [];

// Split by entity
const entities = osmXml.split(/<\/(?:way|node|relation)>/);
entities.forEach(ent => {
  const isMatch = searchTerms.some(term => ent.toLowerCase().includes(term));
  if (isMatch) {
    const idMatch = ent.match(/<(node|way|relation) id="(\d+)"/);
    const nameMatch = ent.match(/<tag k="name" v="([^"]+)"\/>/);
    const amenityMatch = ent.match(/<tag k="(amenity|building|highway|place)" v="([^"]+)"\/>/);
    if (idMatch && (nameMatch || amenityMatch)) {
      matches.push({
        type: idMatch[1],
        id: idMatch[2],
        name: nameMatch ? nameMatch[1] : 'unnamed',
        tag: amenityMatch ? `${amenityMatch[1]}=${amenityMatch[2]}` : 'no-type'
      });
    }
  }
});

console.log(`Found ${matches.length} matching entities in disaster corridor:`);
matches.slice(0, 30).forEach(m => {
  console.log(`- [${m.type.toUpperCase()} ${m.id}] ${m.name} (${m.tag})`);
});
