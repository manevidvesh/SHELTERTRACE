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

  const getNodeStyle = (state: string, baseClass: string) => {
    if (state === 'SELECTED') {
      return 'bg-stone-900 text-white font-medium shadow-md ring-2 ring-stone-900';
    }
    if (state === 'UPSTREAM') {
      return 'bg-sky-50 text-sky-900 border-sky-300 ring-1 ring-sky-300';
    }
    if (state === 'DOWNSTREAM') {
      return 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-1 ring-emerald-300';
    }
    if (state === 'MUTED') {
      return 'opacity-35 bg-stone-50 border-stone-200 text-stone-400';
    }
    return baseClass;
  };

  return (
    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-xs text-xs">
      {/* Header */}
      <div className="p-4 bg-stone-50/70 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-[#233f33]" />
          <h3 className="font-semibold text-stone-900 text-xs tracking-tight">
            Evidence Provenance Graph: Inspectable Dependency Trace
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-stone-500">
          <span>Click any node to trace upstream evidence or downstream decisions</span>
          {selectedNodeId && (
            <button
              onClick={() => setSelectedNodeId(null)}
              className="px-2 py-0.5 rounded bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-[11px] transition-colors cursor-pointer"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>

      {/* Dependency Status Callout */}
      {activeNode ? (
        <div className="p-3 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-900">Inspecting Node:</span>
            <span className="px-2 py-0.5 rounded bg-white text-stone-800 border border-stone-300 font-medium">
              {activeNode.label}
            </span>
            <span className="text-stone-500 text-[11px]">({activeNode.type})</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-stone-600">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-600" />
              <span>Upstream Sources ({upstreamIds.size})</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Downstream Impacts ({downstreamIds.size})</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="p-2.5 bg-[#f4f2ee] border-b border-stone-200/80 text-[11px] text-stone-600 text-center">
          Showing complete provenance DAG for {habitation.name}. Select any node below to trace its causal lineage.
        </div>
      )}

      {/* Graph Pipeline Layout (5 Sequential Stages) */}
      <div className="p-4 overflow-x-auto">
        <div className="min-w-[840px] grid grid-cols-5 gap-3">
          {/* Stage 1: Source Datasets */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 pb-1 border-b border-stone-200 font-medium text-stone-600 text-[11px]">
              <Database className="w-3.5 h-3.5 text-stone-500" />
              <span>1. Sources</span>
            </div>
            <div className="space-y-1.5">
              {sourceDatasetNodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
                  className={`w-full p-2 rounded text-left border transition-all cursor-pointer ${getNodeStyle(
                    getNodeState(node.id),
                    'bg-white border-stone-200 text-stone-800 hover:border-stone-300 hover:bg-stone-50'
                  )}`}
                >
                  <div className="font-medium text-[11px] leading-tight line-clamp-1">{node.label}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">{node.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Stage 2: Observation Evidence */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 pb-1 border-b border-stone-200 font-medium text-stone-600 text-[11px]">
              <FileCheck className="w-3.5 h-3.5 text-stone-500" />
              <span>2. Evidence</span>
            </div>
            <div className="space-y-1.5">
              {evidenceNodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
                  className={`w-full p-2 rounded text-left border transition-all cursor-pointer ${getNodeStyle(
                    getNodeState(node.id),
                    'bg-white border-stone-200 text-stone-800 hover:border-stone-300 hover:bg-stone-50'
                  )}`}
                >
                  <div className="font-medium text-[11px] leading-tight line-clamp-1">{node.label}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5 line-clamp-2 leading-tight">
                    {node.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stage 3: Spatial Findings & Missing Flags */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 pb-1 border-b border-stone-200 font-medium text-stone-600 text-[11px]">
              <Compass className="w-3.5 h-3.5 text-stone-500" />
              <span>3. Findings</span>
            </div>
            <div className="space-y-1.5">
              {findingNodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
                  className={`w-full p-2 rounded text-left border transition-all cursor-pointer ${getNodeStyle(
                    getNodeState(node.id),
                    'bg-white border-stone-200 text-stone-800 hover:border-stone-300 hover:bg-stone-50'
                  )}`}
                >
                  <div className="font-medium text-[11px] leading-tight line-clamp-1">{node.label}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5 line-clamp-2 leading-tight">
                    {node.description}
                  </div>
                </button>
              ))}

              {missingNodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
                  className={`w-full p-2 rounded text-left border border-dashed transition-all cursor-pointer ${getNodeStyle(
                    getNodeState(node.id),
                    'bg-stone-50 border-stone-300 text-stone-700 hover:border-stone-400'
                  )}`}
                >
                  <div className="flex items-center gap-1 font-medium text-[11px] text-stone-700">
                    <AlertCircle className="w-3 h-3 text-stone-500" />
                    <span className="line-clamp-1">{node.label}</span>
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5 line-clamp-2 leading-tight">
                    {node.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stage 4: Decision Rules */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 pb-1 border-b border-stone-200 font-medium text-stone-600 text-[11px]">
              <Scale className="w-3.5 h-3.5 text-stone-500" />
              <span>4. Rules</span>
            </div>
            <div className="space-y-1.5">
              {ruleNodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
                  className={`w-full p-2 rounded text-left border transition-all cursor-pointer ${getNodeStyle(
                    getNodeState(node.id),
                    'bg-white border-stone-200 text-stone-800 hover:border-stone-300 hover:bg-stone-50'
                  )}`}
                >
                  <div className="font-medium text-[11px] text-stone-900 leading-tight line-clamp-1">
                    {node.label}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5 line-clamp-2 leading-tight">
                    {node.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stage 5: Final Assessment Outcome */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 pb-1 border-b border-stone-200 font-medium text-stone-600 text-[11px]">
              <Award className="w-3.5 h-3.5 text-stone-500" />
              <span>5. Outcome</span>
            </div>
            <div className="space-y-1.5">
              {outcomeNodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
                  className={`w-full p-2.5 rounded text-left border transition-all cursor-pointer ${getNodeStyle(
                    getNodeState(node.id),
                    'bg-stone-50 border-stone-300 text-stone-900 font-medium shadow-xs'
                  )}`}
                >
                  <div className="text-xs font-semibold text-stone-900 leading-tight">{node.label}</div>
                  <div className="text-[11px] text-stone-600 mt-1 leading-snug">
                    {node.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
