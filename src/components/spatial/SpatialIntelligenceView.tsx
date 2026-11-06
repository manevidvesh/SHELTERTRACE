// src/components/spatial/SpatialIntelligenceView.tsx
// Evidence-backed Spatial Intelligence Extension: Road Accessibility, Facility Register, Population & Building Feasibility

import { useState, useMemo } from 'react';
import {
  Route,
  Building,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import type { NetworkState, AccessibilityStatus } from '../../types/spatial';
import {
  roadGraphEngine,
  CHOORALMALA_WEST_BANK_NODE_ID,
  CHOORALMALA_EAST_BANK_NODE_ID,
  MEPPADI_HUB_NODE_ID,
} from '../../engine/network/roadGraph';
import { CRITICAL_FACILITY_DIRECTORY } from '../../data/spatial/criticalFacilities';
import { WAYANAD_HABITATIONS } from '../../data/wayanadHabitations';

type SpatialSubTab = 'network' | 'facilities' | 'population' | 'buildings';

export function SpatialIntelligenceView() {
  const [subTab, setSubTab] = useState<SpatialSubTab>('network');
  const [networkState, setNetworkState] = useState<NetworkState>('DOCUMENTED_BRIDGE_DISRUPTION');
  const [selectedOriginNode, setSelectedOriginNode] = useState<string>(MEPPADI_HUB_NODE_ID);
  const [selectedDestinationHabId, setSelectedDestinationHabId] = useState<string>('hab-mundakkai');

  // Compute habitation accessibility report for currently selected network state
  const accessibilityReports = useMemo(() => {
    return roadGraphEngine.evaluateHabitationAccessibility(WAYANAD_HABITATIONS, networkState);
  }, [networkState]);

  // Network metrics
  const networkMetrics = useMemo(() => {
    const reachable = accessibilityReports.filter(r => r.status === 'CONNECTED IN MAPPED NETWORK').length;
    const severed = accessibilityReports.filter(r => r.status === 'DISCONNECTED IN MODELLED SCENARIO').length;
    const insufficient = accessibilityReports.filter(r => r.status === 'INSUFFICIENT NETWORK EVIDENCE' || r.status === 'NO VALID ROUTE FOUND').length;
    return { reachable, severed, insufficient, total: accessibilityReports.length };
  }, [accessibilityReports]);

  // Route calculation for custom inspector
  const destinationHabitation = useMemo(() => {
    return WAYANAD_HABITATIONS.find(h => h.id === selectedDestinationHabId) || WAYANAD_HABITATIONS[0];
  }, [selectedDestinationHabId]);

  const nearestDestNode = useMemo(() => {
    return roadGraphEngine.findNearestNode(destinationHabitation.centroid[0], destinationHabitation.centroid[1]);
  }, [destinationHabitation]);

  const inspectedRoute = useMemo(() => {
    if (!nearestDestNode.node) return null;
    return roadGraphEngine.findShortestPath(selectedOriginNode, nearestDestNode.node.id, networkState);
  }, [selectedOriginNode, nearestDestNode, networkState]);

  const getStatusBadge = (status: AccessibilityStatus) => {
    switch (status) {
      case 'CONNECTED IN MAPPED NETWORK':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            CONNECTED IN MAPPED NETWORK
          </span>
        );
      case 'DISCONNECTED IN MODELLED SCENARIO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            DISCONNECTED IN MODELLED SCENARIO
          </span>
        );
      case 'NO VALID ROUTE FOUND':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            NO VALID ROUTE FOUND
          </span>
        );
      case 'INSUFFICIENT NETWORK EVIDENCE':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            <HelpCircle className="w-3 h-3 text-stone-500" />
            INSUFFICIENT NETWORK EVIDENCE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner: Spatial Intelligence Scope */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#233f33]/10 text-[#233f33] rounded">
                <Layers className="w-5 h-5" />
              </span>
              <h1 className="text-lg font-bold text-stone-900 tracking-tight">
                Evidence-Backed Spatial Intelligence Extension
              </h1>
            </div>
            <p className="text-xs text-stone-500 mt-1 max-w-3xl leading-relaxed">
              Deterministic topological road graph, georeferenced critical facility directory, and real-world feasibility audits for Meppadi–Chooralmala–Mundakkai corridor. All results backed strictly by verifiable source datasets.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 px-3 py-1.5 rounded border border-stone-200 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>OSM Corridor: 6,253 Nodes • 288 Ways</span>
          </div>
        </div>

        {/* Sub-Navigation Pills */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setSubTab('network')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
              subTab === 'network'
                ? 'bg-[#233f33] text-white shadow-xs font-semibold'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span>Road Accessibility Graph</span>
          </button>

          <button
            onClick={() => setSubTab('facilities')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
              subTab === 'facilities'
                ? 'bg-[#233f33] text-white shadow-xs font-semibold'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Critical Facility Register ({CRITICAL_FACILITY_DIRECTORY.length})</span>
          </button>

          <button
            onClick={() => setSubTab('population')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
              subTab === 'population'
                ? 'bg-[#233f33] text-white shadow-xs font-semibold'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Population Context (WorldPop)</span>
          </button>

          <button
            onClick={() => setSubTab('buildings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors cursor-pointer ${
              subTab === 'buildings'
                ? 'bg-[#233f33] text-white shadow-xs font-semibold'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Building Data Coverage Audit</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ROAD ACCESSIBILITY GRAPH */}
      {subTab === 'network' && (
        <div className="space-y-6">
          {/* Scenario State Switcher Toolbar */}
          <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-stone-900">
                  Modelled Network Disaster States
                </h2>
                <p className="text-xs text-stone-500">
                  Select a documented infrastructure condition to evaluate deterministic Dijkstra reachability from the Meppadi emergency hub.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-400 font-mono">SCENARIO:</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setNetworkState('CURRENT_MAPPED_NETWORK')}
                className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                  networkState === 'CURRENT_MAPPED_NETWORK'
                    ? 'border-[#233f33] bg-[#233f33]/5 ring-1 ring-[#233f33]'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-900">State 1: Baseline Network</span>
                  {networkState === 'CURRENT_MAPPED_NETWORK' && (
                    <span className="w-2 h-2 rounded-full bg-[#233f33]"></span>
                  )}
                </div>
                <p className="text-[11px] text-stone-600 line-clamp-2">
                  Pre-disaster OpenStreetMap topology. Pre-event concrete Chooralmala river bridge intact.
                </p>
              </button>

              <button
                onClick={() => setNetworkState('DOCUMENTED_BRIDGE_DISRUPTION')}
                className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                  networkState === 'DOCUMENTED_BRIDGE_DISRUPTION'
                    ? 'border-rose-600 bg-rose-50/50 ring-1 ring-rose-600'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-900">State 2: Bridge Disruption</span>
                  {networkState === 'DOCUMENTED_BRIDGE_DISRUPTION' && (
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  )}
                </div>
                <p className="text-[11px] text-stone-600 line-clamp-2">
                  30 July 2024: Chooralmala concrete bridge destroyed by high-velocity debris surge. Eastern valley isolated.
                </p>
              </button>

              <button
                onClick={() => setNetworkState('DOCUMENTED_RESTORATION')}
                className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                  networkState === 'DOCUMENTED_RESTORATION'
                    ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-900">State 3: Bailey Bridge Restored</span>
                  {networkState === 'DOCUMENTED_RESTORATION' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  )}
                </div>
                <p className="text-[11px] text-stone-600 line-clamp-2">
                  01 August 2024: Indian Army MEG completes 190-ft temporary superstructure. Vehicular rescue ingress restored.
                </p>
              </button>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center text-xs">
              <div className="p-2.5 bg-stone-50 rounded border border-stone-200">
                <span className="text-[10px] text-stone-500 uppercase font-semibold block">Reachable Settlements</span>
                <span className="text-base font-bold text-emerald-800">{networkMetrics.reachable} / {networkMetrics.total}</span>
              </div>
              <div className="p-2.5 bg-stone-50 rounded border border-stone-200">
                <span className="text-[10px] text-stone-500 uppercase font-semibold block">Isolated Settlements</span>
                <span className="text-base font-bold text-rose-800">{networkMetrics.severed} / {networkMetrics.total}</span>
              </div>
              <div className="p-2.5 bg-stone-50 rounded border border-stone-200">
                <span className="text-[10px] text-stone-500 uppercase font-semibold block">Bottleneck Location</span>
                <span className="text-xs font-medium text-stone-900">Chooralmala Bridge (11.543°N, 76.141°E)</span>
              </div>
              <div className="p-2.5 bg-stone-50 rounded border border-stone-200">
                <span className="text-[10px] text-stone-500 uppercase font-semibold block">Routing Algorithm</span>
                <span className="text-xs font-medium text-stone-900">Deterministic Dijkstra (Min-Heap)</span>
              </div>
            </div>
          </div>

          {/* Habitation Reachability Table */}
          <div className="bg-white border border-stone-200 rounded-lg shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-stone-50/70 border-b border-stone-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                Settlement Accessibility Matrix from Meppadi Emergency Hub
              </h3>
              <span className="text-[11px] text-stone-500 font-mono">
                Hub Origin: Node #{MEPPADI_HUB_NODE_ID} (Meppadi CHC / Town Junction)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 border-b border-stone-200 text-[11px] uppercase text-stone-500 font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Settlement Name</th>
                    <th className="py-2.5 px-4">Centroid Coordinates</th>
                    <th className="py-2.5 px-4">Nearest OSM Road Node</th>
                    <th className="py-2.5 px-4">Route Distance</th>
                    <th className="py-2.5 px-4">Road Hops</th>
                    <th className="py-2.5 px-4">Topological Status</th>
                    <th className="py-2.5 px-4">Operational Status Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {accessibilityReports.map(rep => (
                    <tr key={rep.habitationId} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-stone-900">{rep.habitationName}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-stone-500">
                        [{rep.centroid[0].toFixed(4)}, {rep.centroid[1].toFixed(4)}]
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-stone-600">
                        {rep.nearestRoadNodeId ? (
                          <span>
                            Node #{rep.nearestRoadNodeId}{' '}
                            <span className="text-stone-400">({rep.distanceToRoadMeters}m off-road)</span>
                          </span>
                        ) : (
                          <span className="text-stone-400">None within 2km</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-stone-900">
                        {rep.routeDistanceMeters !== null
                          ? `${(rep.routeDistanceMeters / 1000).toFixed(2)} km (${rep.routeDistanceMeters.toLocaleString()} m)`
                          : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-600">{rep.routeHopCount}</td>
                      <td className="py-3 px-4">{getStatusBadge(rep.status)}</td>
                      <td className="py-3 px-4 text-[11px] text-stone-600 max-w-xs leading-normal">
                        {rep.connectivityChangeSummary}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dijkstra Route Trace Inspector */}
          <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                  Topological Route Inspector & Path Tracer
                </h3>
                <p className="text-xs text-stone-500">
                  Inspect the deterministic Dijkstra path between key response nodes and settlement approach roads.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-400 font-mono">DETERMINISTIC GRAPH EVALUATOR</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                  Origin Staging Node
                </label>
                <select
                  value={selectedOriginNode}
                  onChange={e => setSelectedOriginNode(e.target.value)}
                  className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded text-stone-900 font-medium"
                >
                  <option value={MEPPADI_HUB_NODE_ID}>
                    Meppadi Emergency Hub (CHC Meppadi / Town Center) [11.5540, 76.1278]
                  </option>
                  <option value={CHOORALMALA_WEST_BANK_NODE_ID}>
                    Chooralmala West Bank Staging (Market Junction Approach) [11.5436, 76.1409]
                  </option>
                  <option value={CHOORALMALA_EAST_BANK_NODE_ID}>
                    Chooralmala East Bank Junction (Mundakkai / Attamala Branch) [11.5430, 76.1439]
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                  Destination Habitation
                </label>
                <select
                  value={selectedDestinationHabId}
                  onChange={e => setSelectedDestinationHabId(e.target.value)}
                  className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded text-stone-900 font-medium"
                >
                  {WAYANAD_HABITATIONS.map(hab => (
                    <option key={hab.id} value={hab.id}>
                      {hab.name} (Centroid: [{hab.centroid[0].toFixed(3)}, {hab.centroid[1].toFixed(3)}])
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calculated Path Result */}
            {inspectedRoute && (
              <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-900">Path Status:</span>
                    {getStatusBadge(inspectedRoute.status)}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-stone-700">
                    <span>Distance: {inspectedRoute.distanceMeters !== null ? `${inspectedRoute.distanceMeters.toLocaleString()} m` : 'None'}</span>
                    <span>Traversed Edges: {inspectedRoute.edgesTraversed}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong>Path Engine Output:</strong> {inspectedRoute.explanation}
                </p>

                {inspectedRoute.pathNodeIds.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-mono text-stone-500 uppercase block mb-1">
                      Key Traverse Nodes ({inspectedRoute.pathNodeIds.length} vertices in path sequence):
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-stone-700 max-h-24 overflow-y-auto p-2 bg-white rounded border border-stone-200">
                      {inspectedRoute.pathNodeIds.map((nodeId, idx) => (
                        <span key={nodeId} className="inline-flex items-center gap-1">
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              nodeId === CHOORALMALA_WEST_BANK_NODE_ID || nodeId === CHOORALMALA_EAST_BANK_NODE_ID
                                ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            #{nodeId}
                          </span>
                          {idx < inspectedRoute.pathNodeIds.length - 1 && (
                            <ArrowRight className="w-2.5 h-2.5 text-stone-400" />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CRITICAL FACILITY REGISTER */}
      {subTab === 'facilities' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Integrity Notice — Illustrative Debris Relationship:</span>
              <p className="leading-relaxed">
                Spatial relationships displayed below indicate <strong>illustrative proximity only</strong> relative to public situational sketches. They must <em>never</em> be interpreted as confirmed real-world structural exposure, casualty percentages, or engineering damage estimates without ground survey cadastre verification.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CRITICAL_FACILITY_DIRECTORY.map(fac => (
              <div
                key={fac.id}
                className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs space-y-3 hover:border-stone-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[10px] font-bold uppercase tracking-wider mb-1">
                      {fac.type}
                    </span>
                    <h3 className="text-sm font-bold text-stone-900">{fac.name}</h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      fac.locationQuality === 'OFFICIALLY_SURVEYED'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : fac.locationQuality === 'CROWDSOURCED_OSM'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {fac.locationQuality.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 bg-stone-50 p-2.5 rounded border border-stone-100 font-mono text-[11px]">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-sans">Coordinates</span>
                    <span>[{fac.coordinates[0].toFixed(4)}, {fac.coordinates[1].toFixed(4)}]</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-sans">Source Provenance</span>
                    <span className="truncate block" title={fac.sourceId}>{fac.sourceId}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-stone-600">
                  <p>
                    <strong className="text-stone-900">Operational Status:</strong> {fac.operationalStatus}
                  </p>
                  <p>
                    <strong className="text-stone-900">Hazard Relationship:</strong>{' '}
                    <span className="font-medium text-stone-800">{fac.spatialRelationshipToHazard}</span>
                  </p>
                </div>

                {fac.limitations.length > 0 && (
                  <div className="pt-2 border-t border-stone-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                      Documented Limitations:
                    </span>
                    <ul className="list-disc list-inside text-[11px] text-stone-500 space-y-0.5">
                      {fac.limitations.map((lim, i) => (
                        <li key={i}>{lim}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: POPULATION CONTEXT (WORLDPOP 2023) */}
      {subTab === 'population' && (
        <div className="space-y-6">
          {/* Explicit Prominent Disclaimer Banner */}
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-5 shadow-xs flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-rose-200 text-rose-900 rounded text-xs font-bold font-mono">
                  DATA UNAVAILABLE (NO ADMISSIBLE SURVEYED IMPACT POLYGON)
                </span>
              </div>
              <p className="text-xs text-rose-900 leading-relaxed">
                Calculations of building-level or corridor-specific population casualties are strictly withheld in SHELTERTRACE. In accordance with spatial evidence integrity standards, aggregate rasters like WorldPop (100m dasymetric redistribution) cannot be clipped against illustrative debris boundaries without introducing dangerous false precision.
              </p>
            </div>
          </div>

          {/* WorldPop Technical Specifications */}
          <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
              WorldPop 2023 India Demographic Raster Metadata
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">Dataset Identifier</span>
                <span className="font-mono text-stone-800 text-[11px] block truncate" title="ind_pop_2023_CN_100m_R2025A_v1.tif">
                  ind_pop_2023_CN_100m_R2025A_v1.tif
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">Spatial Resolution</span>
                <span className="font-medium text-stone-800">100m (3 arc-seconds at equator)</span>
              </div>
              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">Coordinate System</span>
                <span className="font-medium text-stone-800">WGS84 (EPSG:4326)</span>
              </div>
              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">Publisher & Licence</span>
                <span className="font-medium text-stone-800">WorldPop, University of Southampton (CC-BY 4.0)</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-stone-600 leading-relaxed pt-2">
              <h4 className="font-bold text-stone-900">Regional Demographic Overview (Meppadi Grama Panchayat):</h4>
              <p>
                The total administrative population of Meppadi Grama Panchayat (Census 2011 baseline with natural growth projections) is approximately 86,000 across 21 wards. However, the upper disaster valley (Wards 10, 11, and 12 encompassing Chooralmala, Mundakkai, and Attamala) comprises scattered tea plantation colonies (estate line-houses) with high day-time migrant labor flux.
              </p>
              <div className="p-3 bg-stone-50 rounded border border-stone-200 space-y-1">
                <span className="font-semibold text-stone-800 block text-[11px] uppercase">
                  Methodological Audit Constraints:
                </span>
                <ul className="list-disc list-inside text-stone-600 text-[11px] space-y-1">
                  <li>WorldPop relies on random forest dasymetric modelling using building foot-prints, slope, and land cover. In steep tropical valleys with dense forest canopy, 100m pixel values represent smoothed ambient probabilities, not physical headcount.</li>
                  <li>Disaster occurrence time (~02:00 IST) coincided with resident sleep patterns; however, accurate vulnerability counts require local LSGD ward ration registers rather than national-scale raster disaggregation.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BUILDING DATA COVERAGE AUDIT */}
      {subTab === 'buildings' && (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 shadow-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded text-xs font-bold font-mono">
                  DATA INSUFFICIENT FOR REPRESENTATIVE BUILDING EXPOSURE ESTIMATION
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                A total of only 82 building outlines exist in the crowdsourced OpenStreetMap database for this entire 30 km² study area. Reporting building damage ratios or exposed counts based on this dataset would result in severe statistical distortion.
              </p>
            </div>
          </div>

          {/* Audit Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 bg-white border border-stone-200 rounded-lg shadow-xs">
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">Mapped OSM Polygons</span>
              <span className="text-xl font-bold text-stone-900">82</span>
              <span className="text-[10px] text-stone-500 block mt-0.5">Crowdsourced footprint total</span>
            </div>
            <div className="p-3 bg-white border border-stone-200 rounded-lg shadow-xs">
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">Untyped Building Rate</span>
              <span className="text-xl font-bold text-amber-800">82.9%</span>
              <span className="text-[10px] text-stone-500 block mt-0.5">68 of 82 tagged simply "yes"</span>
            </div>
            <div className="p-3 bg-white border border-stone-200 rounded-lg shadow-xs">
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">Actual Valley Cadastre</span>
              <span className="text-xl font-bold text-stone-900">~1,200 - 1,500</span>
              <span className="text-[10px] text-stone-500 block mt-0.5">PDNA estimated residential structures</span>
            </div>
            <div className="p-3 bg-white border border-stone-200 rounded-lg shadow-xs">
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">Current OSM Capture Ratio</span>
              <span className="text-xl font-bold text-rose-800">&lt; 6.8%</span>
              <span className="text-[10px] text-stone-500 block mt-0.5">&gt;93% physical structures omitted</span>
            </div>
          </div>

          {/* Detailed Audit Findings */}
          <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs space-y-3 text-xs text-stone-600 leading-relaxed">
            <h3 className="font-bold text-stone-900 text-sm">Reason for Deferral & Scientific Justification:</h3>
            <p>
              In rural estate areas like Mundakkai and Punchirimattom, OpenStreetMap vector coverage is severely skewed toward urban commercial centers (Meppadi town). In rural plantation tracts, estate line-houses, tea factory quarters, and homesteads are predominantly unmapped in pre-disaster vector layers.
            </p>
            <p>
              Calculating an intersection between the illustrative debris envelope and the 82 OSM polygons yields only 4 intersecting structures. In reality, the Kerala Post-Disaster Needs Assessment (PDNA) and revenue surveys documented over 400 structures damaged or completely swept away. Presenting 4 buildings would create a dangerously misleading impression of minimal loss.
            </p>
            <div className="p-3 bg-stone-50 rounded border border-stone-200">
              <strong className="text-stone-900 block mb-1">Admissible Future Source:</strong>
              <span>
                Accurate building exposure analysis requires pre-event and post-event cadastral drone photogrammetry or high-resolution (≤0.3m) satellite stereo-pair extraction. Until such an audited vector polygon dataset is available in the public domain, building exposure calculations are officially deferred.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
