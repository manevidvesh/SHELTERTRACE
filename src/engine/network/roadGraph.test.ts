// src/engine/network/roadGraph.test.ts
// Unit and integration tests for deterministic road network accessibility engine

import { describe, it, expect } from 'vitest';
import {
  roadGraphEngine,
  calculateHaversineDistanceMeters,
  CHOORALMALA_WEST_BANK_NODE_ID,
  CHOORALMALA_EAST_BANK_NODE_ID,
  MEPPADI_HUB_NODE_ID,
} from './roadGraph';
import { WAYANAD_HABITATIONS } from '../../data/wayanadHabitations';
import type { NetworkState } from '../../types/spatial';

describe('Deterministic Road Network Engine - Geodesic Math', () => {
  it('calculates zero distance for identical coordinates', () => {
    const d = calculateHaversineDistanceMeters(11.554, 76.128, 11.554, 76.128);
    expect(d).toBe(0);
  });

  it('calculates plausible geodesic distance between Meppadi and Chooralmala', () => {
    // Meppadi ~ [11.554, 76.128], Chooralmala ~ [11.543, 76.141]
    const d = calculateHaversineDistanceMeters(11.554, 76.128, 11.543, 76.141);
    // Straight-line distance should be roughly 1.8km to 2.2km
    expect(d).toBeGreaterThan(1500);
    expect(d).toBeLessThan(2500);
  });
});

describe('Deterministic Road Network Engine - Graph Topology & Datasets', () => {
  it('loads authentic OSM dataset into vertices and edges', () => {
    const nodeCount = roadGraphEngine.getNodeCount();
    const edgeCount = roadGraphEngine.getEdgeCount();

    expect(nodeCount).toBeGreaterThan(5000);
    expect(edgeCount).toBeGreaterThan(5000);
  });

  it('contains the critical river-crossing bottleneck junctions and Meppadi hub', () => {
    const activeEdgesState1 = roadGraphEngine.getActiveEdges('CURRENT_MAPPED_NETWORK');

    const hasWestBankEdge = activeEdgesState1.some(
      e => e.fromNode === CHOORALMALA_WEST_BANK_NODE_ID || e.toNode === CHOORALMALA_WEST_BANK_NODE_ID
    );
    const hasEastBankEdge = activeEdgesState1.some(
      e => e.fromNode === CHOORALMALA_EAST_BANK_NODE_ID || e.toNode === CHOORALMALA_EAST_BANK_NODE_ID
    );
    const hasMeppadiHubEdge = activeEdgesState1.some(
      e => e.fromNode === MEPPADI_HUB_NODE_ID || e.toNode === MEPPADI_HUB_NODE_ID
    );

    expect(hasWestBankEdge).toBe(true);
    expect(hasEastBankEdge).toBe(true);
    expect(hasMeppadiHubEdge).toBe(true);
  });

  it('locates nearest mapped road node within bounded search radius', () => {
    // Meppadi town center coordinates
    const res = roadGraphEngine.findNearestNode(11.554, 76.128, 500);
    expect(res.node).not.toBeNull();
    expect(res.distanceMeters).toBeLessThan(200);

    // Far away coordinate in the ocean
    const farRes = roadGraphEngine.findNearestNode(0, 0, 1000);
    expect(farRes.node).toBeNull();
    expect(farRes.distanceMeters).toBeNull();
  });
});

describe('Deterministic Road Network Engine - Network State Filtering', () => {
  it('State 1 (CURRENT_MAPPED_NETWORK) maintains all mapped edges without scenario additions', () => {
    const edges = roadGraphEngine.getActiveEdges('CURRENT_MAPPED_NETWORK');
    const scenarioEdges = edges.filter(e => e.isScenarioEdge);
    expect(scenarioEdges.length).toBe(0);
  });

  it('State 2 (DOCUMENTED_BRIDGE_DISRUPTION) severs direct crossing between west and east bank nodes', () => {
    const edges = roadGraphEngine.getActiveEdges('DOCUMENTED_BRIDGE_DISRUPTION');
    const directBridgeCrossing = edges.filter(
      e =>
        (e.fromNode === CHOORALMALA_WEST_BANK_NODE_ID && e.toNode === CHOORALMALA_EAST_BANK_NODE_ID) ||
        (e.fromNode === CHOORALMALA_EAST_BANK_NODE_ID && e.toNode === CHOORALMALA_WEST_BANK_NODE_ID)
    );
    expect(directBridgeCrossing.length).toBe(0);
  });

  it('State 3 (DOCUMENTED_RESTORATION) introduces the documented 58-metre military Bailey bridge', () => {
    const edges = roadGraphEngine.getActiveEdges('DOCUMENTED_RESTORATION');
    const baileyEdges = edges.filter(e => e.isScenarioEdge && e.wayId === 'scen-bailey-190ft');

    expect(baileyEdges.length).toBe(2); // Bidirectional crossing
    expect(baileyEdges[0].distanceMeters).toBe(58);
    expect(baileyEdges[0].bridge).toBe('yes');
    expect(baileyEdges[0].name).toContain('Bailey Bridge');
  });
});

describe('Deterministic Road Network Engine - Dijkstra Shortest Path Routing', () => {
  it('returns INSUFFICIENT NETWORK EVIDENCE when origin or destination node does not exist', () => {
    const result = roadGraphEngine.findShortestPath('non-existent-node-1', 'non-existent-node-2', 'CURRENT_MAPPED_NETWORK');
    expect(result.status).toBe('INSUFFICIENT NETWORK EVIDENCE');
    expect(result.distanceMeters).toBeNull();
    expect(result.pathNodeIds).toHaveLength(0);
  });

  it('returns 0 distance when origin and destination are identical mapped nodes', () => {
    const result = roadGraphEngine.findShortestPath(MEPPADI_HUB_NODE_ID, MEPPADI_HUB_NODE_ID, 'CURRENT_MAPPED_NETWORK');
    expect(result.status).toBe('CONNECTED IN MAPPED NETWORK');
    expect(result.distanceMeters).toBe(0);
    expect(result.edgesTraversed).toBe(0);
    expect(result.pathNodeIds).toEqual([MEPPADI_HUB_NODE_ID]);
  });

  it('computes continuous path from Meppadi Hub to Chooralmala West Bank in all 3 states', () => {
    const states: NetworkState[] = [
      'CURRENT_MAPPED_NETWORK',
      'DOCUMENTED_BRIDGE_DISRUPTION',
      'DOCUMENTED_RESTORATION',
    ];

    states.forEach(state => {
      const result = roadGraphEngine.findShortestPath(MEPPADI_HUB_NODE_ID, CHOORALMALA_WEST_BANK_NODE_ID, state);
      expect(result.status).toBe('CONNECTED IN MAPPED NETWORK');
      expect(result.distanceMeters).toBeGreaterThan(2000);
      expect(result.edgesTraversed).toBeGreaterThan(5);
      expect(result.pathNodeIds[0]).toBe(MEPPADI_HUB_NODE_ID);
      expect(result.pathNodeIds[result.pathNodeIds.length - 1]).toBe(CHOORALMALA_WEST_BANK_NODE_ID);
    });
  });

  it('demonstrates clear isolation in State 2 and recovery in State 3 for Chooralmala East Bank', () => {
    // State 1: Connected
    const res1 = roadGraphEngine.findShortestPath(MEPPADI_HUB_NODE_ID, CHOORALMALA_EAST_BANK_NODE_ID, 'CURRENT_MAPPED_NETWORK');
    expect(res1.status).toBe('CONNECTED IN MAPPED NETWORK');
    expect(res1.distanceMeters).not.toBeNull();

    // State 2: Severed / Disconnected
    const res2 = roadGraphEngine.findShortestPath(MEPPADI_HUB_NODE_ID, CHOORALMALA_EAST_BANK_NODE_ID, 'DOCUMENTED_BRIDGE_DISRUPTION');
    expect(res2.status).toBe('DISCONNECTED IN MODELLED SCENARIO');
    expect(res2.distanceMeters).toBeNull();
    expect(res2.pathNodeIds).toHaveLength(0);
    expect(res2.explanation).toContain('Route completely severed by bridge collapse scenario');

    // State 3: Restored via Bailey Bridge
    const res3 = roadGraphEngine.findShortestPath(MEPPADI_HUB_NODE_ID, CHOORALMALA_EAST_BANK_NODE_ID, 'DOCUMENTED_RESTORATION');
    expect(res3.status).toBe('CONNECTED IN MAPPED NETWORK');
    expect(res3.distanceMeters).not.toBeNull();
    expect(res3.pathNodeIds).toContain(CHOORALMALA_WEST_BANK_NODE_ID);
    expect(res3.pathNodeIds).toContain(CHOORALMALA_EAST_BANK_NODE_ID);
  });
});

describe('Deterministic Road Network Engine - Habitation Accessibility Reports', () => {
  it('evaluates all 9 habitations across scenario transitions', () => {
    const reportState1 = roadGraphEngine.evaluateHabitationAccessibility(WAYANAD_HABITATIONS, 'CURRENT_MAPPED_NETWORK');
    expect(reportState1).toHaveLength(9);

    const reportState2 = roadGraphEngine.evaluateHabitationAccessibility(WAYANAD_HABITATIONS, 'DOCUMENTED_BRIDGE_DISRUPTION');
    expect(reportState2).toHaveLength(9);

    // Mundakkai and Punchirimattom are located east/upstream of the severed Chooralmala bridge crossing
    const mundakkaiState2 = reportState2.find(r => r.habitationId === 'hab-mundakkai')!;
    expect(mundakkaiState2).toBeDefined();
    expect(mundakkaiState2.status).toBe('DISCONNECTED IN MODELLED SCENARIO');
    expect(mundakkaiState2.connectivityChangeSummary).toContain('ACCESS SEVERED');

    // Meppadi Town is west of the river bottleneck and maintains intact mainland access
    const meppadiTownState2 = reportState2.find(r => r.habitationId === 'hab-meppadi-town')!;
    expect(meppadiTownState2).toBeDefined();
    expect(meppadiTownState2.status).toBe('CONNECTED IN MAPPED NETWORK');
    expect(meppadiTownState2.connectivityChangeSummary).toContain('ACCESS INTACT');

    // State 3 restores Mundakkai connectivity via Bailey bridge
    const reportState3 = roadGraphEngine.evaluateHabitationAccessibility(WAYANAD_HABITATIONS, 'DOCUMENTED_RESTORATION');
    const mundakkaiState3 = reportState3.find(r => r.habitationId === 'hab-mundakkai')!;
    expect(mundakkaiState3.status).toBe('CONNECTED IN MAPPED NETWORK');
    expect(mundakkaiState3.connectivityChangeSummary).toContain('ACCESS RESTORED');
  });

  it('uses strictly admissible status labels with zero unsupported claims', () => {
    const reports = roadGraphEngine.evaluateHabitationAccessibility(WAYANAD_HABITATIONS, 'DOCUMENTED_BRIDGE_DISRUPTION');
    const validStatuses = [
      'CONNECTED IN MAPPED NETWORK',
      'DISCONNECTED IN MODELLED SCENARIO',
      'NO VALID ROUTE FOUND',
      'INSUFFICIENT NETWORK EVIDENCE',
    ];

    reports.forEach(r => {
      expect(validStatuses).toContain(r.status);
      expect(r.connectivityChangeSummary).not.toMatch(/100%|guaranteed|safe|casualty|fatalities/i);
    });
  });
});
