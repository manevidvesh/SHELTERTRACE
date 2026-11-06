// scripts/audit_data_feasibility.mjs
// Audit script to test and verify OpenStreetMap data availability for Meppadi-Chooralmala-Mundakkai study area

const BBOX = '11.51,76.10,11.58,76.19'; // South, West, North, East

async function queryOverpass(query) {
  const url = 'https://overpass-api.de/api/interpreter';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`
  });
  if (!response.ok) {
    throw new Error(`Overpass HTTP ${response.status}: ${response.statusText}`);
  }
  return await response.json();
}

async function runAudit() {
  console.log('=== SHELTERTRACE DATA FEASIBILITY AUDIT ===');
  console.log(`Study Area Bounding Box: [${BBOX}] (Meppadi - Chooralmala - Mundakkai)\n`);

  // 1. Audit Building Footprints
  console.log('1. Querying OSM Building Footprints...');
  try {
    const bldgQuery = `
      [out:json][timeout:60];
      (
        way["building"](${BBOX});
        relation["building"](${BBOX});
      );
      out tags;
    `;
    const bldgData = await queryOverpass(bldgQuery);
    const elements = bldgData.elements || [];
    console.log(`- Total Building Features Found: ${elements.length}`);

    const buildingTypes = {};
    let missingClassification = 0;
    elements.forEach(e => {
      const type = e.tags?.building || 'unknown';
      buildingTypes[type] = (buildingTypes[type] || 0) + 1;
      if (type === 'yes' || type === 'unknown') {
        missingClassification++;
      }
    });

    console.log('- Building Classifications Breakdown:');
    Object.entries(buildingTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([k, v]) => console.log(`    ${k}: ${v}`));
    console.log(`- Generic/Unclassified ('yes'): ${missingClassification} (${((missingClassification / (elements.length || 1)) * 100).toFixed(1)}%)`);
  } catch (err) {
    console.error('Error querying buildings:', err.message);
  }

  // 2. Audit Road & Bridge Network
  console.log('\n2. Querying OSM Highway & Bridge Network...');
  try {
    const roadQuery = `
      [out:json][timeout:60];
      (
        way["highway"](${BBOX});
      );
      out tags;
    `;
    const roadData = await queryOverpass(roadQuery);
    const roads = roadData.elements || [];
    console.log(`- Total Highway/Road Edges Found: ${roads.length}`);

    const roadTypes = {};
    const bridges = [];
    roads.forEach(r => {
      const hwy = r.tags?.highway || 'unknown';
      roadTypes[hwy] = (roadTypes[hwy] || 0) + 1;
      if (r.tags?.bridge === 'yes' || r.tags?.bridge) {
        bridges.push(r);
      }
    });

    console.log('- Road Classification Breakdown:');
    Object.entries(roadTypes)
      .sort((a, b) => b[1] - a[1])
      .forEach(([k, v]) => console.log(`    ${k}: ${v}`));

    console.log(`- Bridges Found: ${bridges.length}`);
    bridges.forEach(b => {
      console.log(`    Bridge ID: way/${b.id}, name: "${b.tags?.name || 'unnamed'}", highway: ${b.tags?.highway}, layer: ${b.tags?.layer}`);
    });
  } catch (err) {
    console.error('Error querying roads:', err.message);
  }

  // 3. Audit Critical Facilities (Amenities, Health, Education, Emergency)
  console.log('\n3. Querying Critical Facilities (amenity, healthcare, emergency)...');
  try {
    const facilityQuery = `
      [out:json][timeout:60];
      (
        node["amenity"](${BBOX});
        way["amenity"](${BBOX});
        node["healthcare"](${BBOX});
        way["healthcare"](${BBOX});
        node["emergency"](${BBOX});
        way["emergency"](${BBOX});
      );
      out tags center;
    `;
    const facData = await queryOverpass(facilityQuery);
    const facilities = facData.elements || [];
    console.log(`- Total Facility Elements Found: ${facilities.length}`);

    const facilityByType = {};
    const criticalList = [];
    facilities.forEach(f => {
      const type = f.tags?.amenity || f.tags?.healthcare || f.tags?.emergency || 'other';
      facilityByType[type] = (facilityByType[type] || 0) + 1;
      if (['hospital', 'clinic', 'doctors', 'pharmacy', 'school', 'kindergarten', 'college', 'police', 'fire_station'].includes(type)) {
        criticalList.push({
          id: `${f.type}/${f.id}`,
          name: f.tags?.name || 'Unnamed',
          type,
          lat: f.lat || f.center?.lat,
          lon: f.lon || f.center?.lon
        });
      }
    });

    console.log('- Facility Breakdown:');
    Object.entries(facilityByType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([k, v]) => console.log(`    ${k}: ${v}`));

    console.log(`\n- Verified Healthcare / Education / Emergency Facilities (${criticalList.length}):`);
    criticalList.forEach(c => {
      console.log(`    [${c.type.toUpperCase()}] "${c.name}" @ [${c.lat?.toFixed(4)}, ${c.lon?.toFixed(4)}] (${c.id})`);
    });
  } catch (err) {
    console.error('Error querying facilities:', err.message);
  }
}

runAudit();
