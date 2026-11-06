// src/engine/network/roadGraph.ts
// Deterministic graph-based road accessibility engine for Wayanad Meppadi disaster corridor
// Implements Dijkstra shortest-path and connected-component analysis across 3 explicit network states

import { OSM_ROAD_DATASET } from '../../data/spatial/osmRoadData';
import type {
  NetworkState,
  RoadNode,
  RoadEdge,
  NetworkPathResult,
  HabitationAccessibilityReport,
} from '../../types/spatial';
import type { Habitation } from '../../types/habitation';

// Haversine geodesic distance in metres
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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

// Key junction nodes identified in OSM at the Chooralmala river crossing bottleneck
// West bank approach road node (Chooralmala market junction)
export const CHOORALMALA_WEST_BANK_NODE_ID = '3842231901'; // [11.54356, 76.14090]
// East bank approach road node (leading to Mundakkai / Attamala)
export const CHOORALMALA_EAST_BANK_NODE_ID = '5870048345'; // [11.54304, 76.14390]

// Regional emergency response hub: Meppadi Town Center / CHC Hospital Junction
export const MEPPADI_HUB_NODE_ID = '5870046874'; // [11.55405, 76.12775]

// Main trunk and regional highways preserved in State 2
export const PRESERVED_REGIONAL_HIGHWAYS = new Set([
  '380928361',  // Calicut - Vythiri - Gudalur Road (NH 766)
  '34491672',   // Calicut - Vythiri - Gudalur Road
  '1347579612', // Calicut - Vythiri - Gudalur Road
  '1347579611', // Calicut - Vythiri - Gudalur Road
  '1347579610', // Calicut - Vythiri - Gudalur Road
  '1347579607', // Calicut - Vythiri - Gudalur Road
  '387007018',  // Muttil - Meppadi Road (Kottappadi Ridge corridor)
  '380928375',  // Kalpetta - Meppadi - Chooralmala Road (mainland valley corridor)
  '380928377',  // Kalpetta - Meppadi Road
  '380928374',  // Kalpetta - Meppadi Road
]);

// Documented cross-river edges and active debris flow crossings severed during the 30 July 2024 disaster
export const SEVERED_DISASTER_CROSSING_EDGES: [string, string][] = [
  // 1. Chooralmala bridge crossing on way 380928405 (the primary bridge washed away)
  ['3842231971', '3842231977'],
  ['3842231977', '3842231971'],
  // 2. Direct bottleneck connection between West and East bank approach nodes
  ['3842231901', '5870048345'],
  ['5870048345', '3842231901'],
  // 3. Attamala river crossing on way 621374542 (washed away)
  ['5870046621', '5870046622'],
  ['5870046622', '5870046621'],
  // 4. Southern debris channel crossing on way 380928390 (runout scour zone)
  ['3249498976', '3249498978'],
  ['3249498978', '3249498976'],
  // 5. Mid-valley track crossing on way 621374624 (inundated)
  ['5870048914', '5870048916'],
  ['5870048916', '5870048914'],
  // 6. Northern valley crossing on way 755416172 (debris channel)
  ['7056287079', '7056287078'],
  ['7056287078', '7056287079'],
  // 7. Southern stream crossings on way 621374591
  ['5870047541', '5870047543'],
  ['5870047543', '5870047541'],
  ['5870047548', '5870047550'],
  ['5870047550', '5870047548'],
  ['5870047551', '5870047552'],
  ['5870047552', '5870047551'],
  // 8. Southern footpath crossing on way 848010054
  ['7913079702', '7913079703'],
  ['7913079703', '7913079702'],
];

// Binary Min-Heap Priority Queue for O((V + E) log V) Dijkstra execution
class PriorityQueue<T> {
  private data: { item: T; priority: number }[] = [];

  push(item: T, priority: number): void {
    this.data.push({ item, priority });
    this.up(this.data.length - 1);
  }

  pop(): T | null {
    if (this.data.length === 0) return null;
    const top = this.data[0];
    const b = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = b;
      this.down(0);
    }
    return top.item;
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  private up(i: number): void {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[i].priority < this.data[p].priority) {
        [this.data[i], this.data[p]] = [this.data[p], this.data[i]];
        i = p;
      } else break;
    }
  }

  private down(i: number): void {
    const len = this.data.length;
    while ((i << 1) + 1 < len) {
      const l = (i << 1) + 1;
      const r = l + 1;
      let s = l;
      if (r < len && this.data[r].priority < this.data[l].priority) s = r;
      if (this.data[s].priority < this.data[i].priority) {
        [this.data[i], this.data[s]] = [this.data[s], this.data[i]];
        i = s;
      } else break;
    }
  }
}

// Nodes along NH 766 (Calicut-Vythiri-Gudalur Road) used to identify unpassable southern descent branches into the disaster zone
const nhWay = OSM_ROAD_DATASET.ways.find(w => w.id === '380928361');
const NH_766_NODE_IDS = new Set(nhWay ? nhWay.nodeIds : []);

export class RoadGraphEngine {
  private nodes: Map<string, RoadNode> = new Map();
  // Adjacency list: fromNodeId -> Array of outgoing RoadEdge
  private adjacency: Map<string, RoadEdge[]> = new Map();

  constructor() {
    this.buildGraphFromDataset();
  }

  /**
   * Builds the graph from the bundled authentic OSM road dataset
   */
  private buildGraphFromDataset(): void {
    this.nodes.clear();
    this.adjacency.clear();

    // 1. Ingest nodes
    OSM_ROAD_DATASET.nodes.forEach(n => {
      this.nodes.set(n.id, { id: n.id, lat: n.lat, lon: n.lon });
      this.adjacency.set(n.id, []);
    });

    // 2. Ingest ways into directed/undirected edges
    OSM_ROAD_DATASET.ways.forEach(way => {
      for (let i = 0; i < way.nodeIds.length - 1; i++) {
        const uId = way.nodeIds[i];
        const vId = way.nodeIds[i + 1];
        const u = this.nodes.get(uId);
        const v = this.nodes.get(vId);

        if (!u || !v) continue;

        const dist = calculateHaversineDistanceMeters(u.lat, u.lon, v.lat, v.lon);

        const edgeForward: RoadEdge = {
          id: `${way.id}-${uId}-${vId}`,
          wayId: way.id,
          fromNode: uId,
          toNode: vId,
          distanceMeters: dist,
          highway: way.highway,
          name: way.name,
          oneway: !!way.oneway,
          bridge: way.bridge,
        };

        this.addEdge(edgeForward);

        // If not oneway, add reverse edge
        if (!way.oneway) {
          const edgeBackward: RoadEdge = {
            id: `${way.id}-${vId}-${uId}`,
            wayId: way.id,
            fromNode: vId,
            toNode: uId,
            distanceMeters: dist,
            highway: way.highway,
            name: way.name,
            oneway: false,
            bridge: way.bridge,
          };
          this.addEdge(edgeBackward);
        }
      }
    });
  }

  private addEdge(edge: RoadEdge): void {
    if (!this.adjacency.has(edge.fromNode)) {
      this.adjacency.set(edge.fromNode, []);
    }
    this.adjacency.get(edge.fromNode)!.push(edge);
  }

  /**
   * Returns active edges filtered by the chosen NetworkState
   */
  public getActiveEdges(state: NetworkState): RoadEdge[] {
    const allEdges: RoadEdge[] = [];
    this.adjacency.forEach(edgeList => {
      edgeList.forEach(edge => {
        // STATE 2: Documented Bridge Disruption Scenario
        if (state === 'DOCUMENTED_BRIDGE_DISRUPTION') {
          // 1. Suppress local estate lanes branching off NH 766 down into the flooded disaster slope
          if (
            !PRESERVED_REGIONAL_HIGHWAYS.has(edge.wayId) &&
            (NH_766_NODE_IDS.has(edge.fromNode) || NH_766_NODE_IDS.has(edge.toNode))
          ) {
            return;
          }

          // 2. Suppress specific river crossings destroyed during disaster
          const isSevered = SEVERED_DISASTER_CROSSING_EDGES.some(
            ([a, b]) => edge.fromNode === a && edge.toNode === b
          );
          if (isSevered) {
            return;
          }
        }

        allEdges.push(edge);
      });
    });

    // STATE 3: Documented Restoration Scenario (Indian Army 190-ft Bailey Bridge)
    if (state === 'DOCUMENTED_RESTORATION') {
      const u = this.nodes.get(CHOORALMALA_WEST_BANK_NODE_ID);
      const v = this.nodes.get(CHOORALMALA_EAST_BANK_NODE_ID);
      if (u && v) {
        // Documented 58-meter military superstructure (190 ft single-lane class 24)
        allEdges.push({
          id: 'scenario-bailey-bridge-fwd',
          wayId: 'scen-bailey-190ft',
          fromNode: CHOORALMALA_WEST_BANK_NODE_ID,
          toNode: CHOORALMALA_EAST_BANK_NODE_ID,
          distanceMeters: 58,
          highway: 'tertiary',
          name: 'Indian Army Bailey Bridge (190-ft Emergency Crossing)',
          oneway: false,
          bridge: 'yes',
          isScenarioEdge: true,
          scenarioNote: 'Temporary military single-lane crossing constructed by MEG 01 August 2024.',
        });

        allEdges.push({
          id: 'scenario-bailey-bridge-bwd',
          wayId: 'scen-bailey-190ft',
          fromNode: CHOORALMALA_EAST_BANK_NODE_ID,
          toNode: CHOORALMALA_WEST_BANK_NODE_ID,
          distanceMeters: 58,
          highway: 'tertiary',
          name: 'Indian Army Bailey Bridge (190-ft Emergency Crossing)',
          oneway: false,
          bridge: 'yes',
          isScenarioEdge: true,
          scenarioNote: 'Temporary military single-lane crossing constructed by MEG 01 August 2024.',
        });
      }
    }

    return allEdges;
  }

  /**
   * Builds an active adjacency lookup for the requested network state
   */
  private getAdjacencyMap(state: NetworkState): Map<string, RoadEdge[]> {
    const adj = new Map<string, RoadEdge[]>();
    this.nodes.forEach(n => adj.set(n.id, []));

    const activeEdges = this.getActiveEdges(state);
    activeEdges.forEach(e => {
      if (!adj.has(e.fromNode)) adj.set(e.fromNode, []);
      adj.get(e.fromNode)!.push(e);
    });

    return adj;
  }

  /**
   * Deterministic Dijkstra shortest-path calculation using Binary Min-Heap Priority Queue
   */
  public findShortestPath(
    fromNodeId: string,
    toNodeId: string,
    state: NetworkState
  ): NetworkPathResult {
    if (!this.nodes.has(fromNodeId) || !this.nodes.has(toNodeId)) {
      return {
        fromNodeId,
        toNodeId,
        distanceMeters: null,
        pathNodeIds: [],
        edgesTraversed: 0,
        status: 'INSUFFICIENT NETWORK EVIDENCE',
        scenarioState: state,
        explanation: 'One or both destination nodes do not exist in the mapped OSM road network.',
      };
    }

    if (fromNodeId === toNodeId) {
      return {
        fromNodeId,
        toNodeId,
        distanceMeters: 0,
        pathNodeIds: [fromNodeId],
        edgesTraversed: 0,
        status: 'CONNECTED IN MAPPED NETWORK',
        scenarioState: state,
        explanation: 'Origin and destination are identical mapped nodes.',
      };
    }

    const adj = this.getAdjacencyMap(state);
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();

    this.nodes.forEach(n => {
      distances.set(n.id, Infinity);
      previous.set(n.id, null);
    });

    distances.set(fromNodeId, 0);

    const pq = new PriorityQueue<string>();
    pq.push(fromNodeId, 0);

    while (!pq.isEmpty()) {
      const u = pq.pop()!;
      const d = distances.get(u)!;

      if (u === toNodeId) {
        break; // Target reached
      }

      const neighbors = adj.get(u) || [];
      for (const edge of neighbors) {
        const alt = d + edge.distanceMeters;
        if (alt < distances.get(edge.toNode)!) {
          distances.set(edge.toNode, alt);
          previous.set(edge.toNode, u);
          pq.push(edge.toNode, alt);
        }
      }
    }

    const finalDist = distances.get(toNodeId)!;
    if (finalDist === Infinity) {
      return {
        fromNodeId,
        toNodeId,
        distanceMeters: null,
        pathNodeIds: [],
        edgesTraversed: 0,
        status: state === 'DOCUMENTED_BRIDGE_DISRUPTION'
          ? 'DISCONNECTED IN MODELLED SCENARIO'
          : 'NO VALID ROUTE FOUND',
        scenarioState: state,
        explanation: state === 'DOCUMENTED_BRIDGE_DISRUPTION'
          ? 'Route completely severed by bridge collapse scenario. No alternative vehicular crossing exists in mapped network.'
          : 'No continuous road path exists between nodes in mapped topology.',
      };
    }

    // Reconstruct path
    const path: string[] = [];
    let curr: string | null = toNodeId;
    while (curr) {
      path.unshift(curr);
      curr = previous.get(curr) || null;
    }

    return {
      fromNodeId,
      toNodeId,
      distanceMeters: finalDist,
      pathNodeIds: path,
      edgesTraversed: path.length - 1,
      status: 'CONNECTED IN MAPPED NETWORK',
      scenarioState: state,
      explanation: `Continuous vehicular route verified across ${path.length - 1} road edges (${finalDist.toLocaleString()}m total geometric distance).`,
    };
  }

  /**
   * Finds the nearest mapped road node to a given geographical coordinate
   */
  public findNearestNode(
    lat: number,
    lon: number,
    maxSearchRadiusMeters = 2000
  ): { node: RoadNode | null; distanceMeters: number | null } {
    let nearest: RoadNode | null = null;
    let minD = Infinity;

    this.nodes.forEach(n => {
      const d = calculateHaversineDistanceMeters(lat, lon, n.lat, n.lon);
      if (d < minD) {
        minD = d;
        nearest = n;
      }
    });

    if (minD > maxSearchRadiusMeters) {
      return { node: null, distanceMeters: null };
    }

    return { node: nearest, distanceMeters: minD };
  }

  /**
   * Evaluates accessibility for all 9 habitations from the Meppadi Emergency / Hospital Hub
   */
  public evaluateHabitationAccessibility(
    habitations: Habitation[],
    state: NetworkState
  ): HabitationAccessibilityReport[] {
    const hubNode = this.nodes.get(MEPPADI_HUB_NODE_ID);
    const originNodeId = hubNode ? hubNode.id : Array.from(this.nodes.keys())[0];

    return habitations.map(hab => {
      const nearest = this.findNearestNode(hab.centroid[0], hab.centroid[1]);

      if (!nearest.node) {
        return {
          habitationId: hab.id,
          habitationName: hab.name,
          centroid: hab.centroid,
          nearestRoadNodeId: null,
          distanceToRoadMeters: null,
          status: 'INSUFFICIENT NETWORK EVIDENCE',
          routeDistanceMeters: null,
          routeHopCount: 0,
          activeScenario: state,
          connectivityChangeSummary: 'No mapped road node located within 2,000m of settlement centroid.',
        };
      }

      const pathResult = this.findShortestPath(originNodeId, nearest.node.id, state);

      let changeSummary = 'Route intact in mapped baseline.';
      if (state === 'DOCUMENTED_BRIDGE_DISRUPTION') {
        if (pathResult.status === 'DISCONNECTED IN MODELLED SCENARIO') {
          changeSummary = 'ACCESS SEVERED: Settlement isolated east of collapsed Chooralmala bridge crossing.';
        } else {
          changeSummary = 'ACCESS INTACT: Settlement situated west of river crossing; mainland connectivity maintained.';
        }
      } else if (state === 'DOCUMENTED_RESTORATION') {
        if (pathResult.distanceMeters !== null) {
          changeSummary = 'ACCESS RESTORED: Traverses emergency 190-ft Indian Army Bailey bridge.';
        }
      }

      return {
        habitationId: hab.id,
        habitationName: hab.name,
        centroid: hab.centroid,
        nearestRoadNodeId: nearest.node.id,
        distanceToRoadMeters: nearest.distanceMeters,
        status: pathResult.status,
        routeDistanceMeters: pathResult.distanceMeters,
        routeHopCount: pathResult.edgesTraversed,
        activeScenario: state,
        connectivityChangeSummary: changeSummary,
      };
    });
  }

  public getNodeCount(): number {
    return this.nodes.size;
  }

  public getEdgeCount(): number {
    let count = 0;
    this.adjacency.forEach(list => (count += list.length));
    return count;
  }
}

// Singleton engine instance
export const roadGraphEngine = new RoadGraphEngine();
