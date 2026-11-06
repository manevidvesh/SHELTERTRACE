import { useState, useMemo } from 'react';
import {
  GitCommit,
  Database,
  FileCheck,
  Compass,
  Scale,
  Award,
  AlertCircle,
} from 'lucide-react';
import type { Habitation, PrioritisationResult } from '../../types/habitation';
import {
  buildProvenanceGraph,
  getUpstreamNodeIds,
  getDownstreamNodeIds,
} from '../../engine/provenanceGraph';

interface ProvenanceGraphViewProps {
  habitation: Habitation;
  result: PrioritisationResult;
}

export function ProvenanceGraphView({ habitation, result }: ProvenanceGraphViewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Build the deterministic graph
  const graph = useMemo(() => {
    return buildProvenanceGraph(habitation, result);
  }, [habitation, result]);

  // Compute active highlighting paths
  const upstreamIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    return getUpstreamNodeIds(graph, selectedNodeId);
  }, [graph, selectedNodeId]);

  const downstreamIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    return getDownstreamNodeIds(graph, selectedNodeId);
  }, [graph, selectedNodeId]);

  // Selected node details
  const activeNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return graph.nodes.find(n => n.id === selectedNodeId) || null;
  }, [graph, selectedNodeId]);

  // Group nodes by tier/type for visual pipeline representation
  const sourceDatasetNodes = graph.nodes.filter(n => n.type === 'SOURCE_DATASET');
  const evidenceNodes = graph.nodes.filter(n => n.type === 'OBSERVATION_EVIDENCE');
  const findingNodes = graph.nodes.filter(n => n.type === 'SPATIAL_FINDING');
  const ruleNodes = graph.nodes.filter(n => n.type === 'DECISION_RULE');
  const missingNodes = graph.nodes.filter(n => n.type === 'MISSING_EVIDENCE');
  const outcomeNodes = graph.nodes.filter(n => n.type === 'ASSESSMENT_OUTCOME');

  const getNodeState = (nodeId: string) => {
    if (!selectedNodeId) return 'DEFAULT';
    if (nodeId === selectedNodeId) return 'SELECTED';
    if (upstreamIds.has(nodeId)) return 'UPSTREAM';
    if (downstreamIds.has(nodeId)) return 'DOWNSTREAM';
    return 'MUTED';
  };

  const getBadgeStyle = (state: string, baseBorder: string) => {
    if (state === 'SELECTED') {
      return 'ring-2 ring-rose-400 bg-rose-950/80 text-white font-bold shadow-lg';
    }
    if (state === 'UPSTREAM') {
      return 'ring-1 ring-sky-400 bg-sky-950/60 text-sky-200 border-sky-500';
    }
    if (state === 'DOWNSTREAM') {
      return 'ring-1 ring-emerald-400 bg-emerald-950/60 text-emerald-200 border-emerald-500';
    }
    if (state === 'MUTED') {
      return 'opacity-40 bg-slate-950/50 border-slate-800 text-slate-500';
    }
    return baseBorder;
  };

  return (
    <div className="bg-slate-900/90 rounded-lg border border-slate-800 overflow-hidden shadow-xl text-xs">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-rose-400" />
          <h3 className="font-mono font-bold uppercase tracking-wider text-slate-100 text-xs">
            Evidence Provenance Graph • Inspectable Dependency Trace
          </h3>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span>Click any node to trace upstream source evidence or downstream decisions</span>
          {selectedNodeId && (
            <button
              onClick={() => setSelectedNodeId(null)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] transition-colors"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Visual Pipeline Grid (5 Tiers) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Tier 1: Source Datasets */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-slate-400 pb-1.5 border-b border-slate-800">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>1. Source Datasets</span>
            </div>
            <div className="space-y-1.5">
              {sourceDatasetNodes.map(node => {
                const state = getNodeState(node.id);
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`w-full p-2 rounded-lg border text-left transition-all ${getBadgeStyle(
                      state,
                      'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    )}`}
                  >
                    <div className="font-mono font-bold text-[11px] truncate">{node.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{node.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tier 2: Observation Evidence */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-slate-400 pb-1.5 border-b border-slate-800">
              <FileCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>2. Observations</span>
            </div>
            <div className="space-y-1.5">
              {evidenceNodes.map(node => {
                const state = getNodeState(node.id);
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`w-full p-2 rounded-lg border text-left transition-all ${getBadgeStyle(
                      state,
                      'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    )}`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-[11px] truncate">{node.label}</span>
                      <span className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                        node.status === 'CONFLICTING' ? 'bg-purple-950 text-purple-300' :
                        node.status === 'INSUFFICIENT' ? 'bg-zinc-900 text-zinc-400' :
                        'bg-slate-900 text-slate-400'
                      }`}>
                        {node.category}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{node.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tier 3: Spatial Findings & Gaps */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-slate-400 pb-1.5 border-b border-slate-800">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>3. Spatial Findings</span>
            </div>
            <div className="space-y-1.5">
              {findingNodes.map(node => {
                const state = getNodeState(node.id);
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`w-full p-2 rounded-lg border text-left transition-all ${getBadgeStyle(
                      state,
                      'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    )}`}
                  >
                    <div className="font-mono text-[10px] text-amber-300/90 truncate">{node.domain}</div>
                    <div className="text-[11px] text-slate-200 mt-0.5 line-clamp-3">{node.description}</div>
                  </button>
                );
              })}

              {/* Explicit Missing Evidence Nodes */}
              {missingNodes.map(node => {
                const state = getNodeState(node.id);
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`w-full p-2 rounded-lg border border-dashed border-amber-600/70 bg-amber-950/30 text-amber-200 text-left transition-all ${getBadgeStyle(
                      state,
                      'bg-amber-950/30 text-amber-200 hover:border-amber-500'
                    )}`}
                  >
                    <div className="flex items-center gap-1 font-mono text-[10px] text-amber-300 font-bold">
                      <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>DATA GAP: {node.label}</span>
                    </div>
                    <div className="text-[10px] text-amber-200/90 mt-0.5 leading-snug">{node.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tier 4: Executed Decision Rules */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-slate-400 pb-1.5 border-b border-slate-800">
              <Scale className="w-3.5 h-3.5 text-rose-400" />
              <span>4. Triggered Rules</span>
            </div>
            <div className="space-y-1.5">
              {ruleNodes.map(node => {
                const state = getNodeState(node.id);
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`w-full p-2.5 rounded-lg border text-left transition-all ${getBadgeStyle(
                      state,
                      'bg-rose-950/40 border-rose-900/60 text-rose-200 hover:border-rose-700'
                    )}`}
                  >
                    <div className="font-mono font-bold text-[11px] text-rose-300">{node.label}</div>
                    <div className="text-[10px] text-slate-300 mt-1 leading-snug">{node.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tier 5: Final Assessment Outcome */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-slate-400 pb-1.5 border-b border-slate-800">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>5. Final Outcome</span>
            </div>
            <div className="space-y-1.5">
              {outcomeNodes.map(node => {
                const state = getNodeState(node.id);
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${getBadgeStyle(
                      state,
                      'bg-slate-950 border-slate-700 text-slate-100 hover:border-slate-600 shadow-md'
                    )}`}
                  >
                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                      Prioritisation Result:
                    </span>
                    <div className="font-mono font-bold text-xs text-rose-300 leading-snug">
                      {node.label}
                    </div>
                    <div className="text-[10px] text-slate-300 mt-1.5 leading-snug">
                      {result.primaryReason}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Node Inspector Drawer / Banner */}
        {activeNode && (
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Node Type: {activeNode.type}
                </span>
                <span className="font-bold text-slate-100 text-xs font-mono">{activeNode.label}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                  Upstream Dependencies: {upstreamIds.size}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Downstream Consequences: {downstreamIds.size}
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed font-sans">
              {activeNode.description}
            </p>

            {activeNode.sourceReference && (
              <div className="text-[10px] font-mono text-slate-400 pt-1">
                <span className="text-slate-500">Source Lineage: </span>
                <span className="text-slate-300">{activeNode.sourceOrg} — {activeNode.sourceReference}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
