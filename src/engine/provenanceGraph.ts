import type { Habitation, PrioritisationResult } from '../types/habitation';
import type { EvidenceCategory, QualityStatus } from '../types/evidence';

export type ProvenanceNodeType =
  | 'SOURCE_DATASET'
  | 'OBSERVATION_EVIDENCE'
  | 'MISSING_EVIDENCE'
  | 'SPATIAL_FINDING'
  | 'DECISION_RULE'
  | 'ASSESSMENT_OUTCOME';

export interface ProvenanceNode {
  id: string;
  type: ProvenanceNodeType;
  label: string;
  category?: EvidenceCategory | 'STATUS_GAP';
  status?: QualityStatus;
  domain?: string;
  sourceOrg?: string;
  sourceReference?: string;
  description: string;
}

export type ProvenanceRelation =
  | 'PRODUCED_EVIDENCE'
  | 'DERIVED_FROM'
  | 'EVALUATED_BY'
  | 'DETERMINES_OUTCOME'
  | 'EXPOSES_GAP';

export interface ProvenanceEdge {
  id: string;
  from: string; // source node id
  to: string;   // target node id
  relation: ProvenanceRelation;
  description: string;
}

export interface ProvenanceGraph {
  habitationId: string;
  nodes: ProvenanceNode[];
  edges: ProvenanceEdge[];
}

/**
 * Builds a deterministic evidence-to-decision graph for a habitation assessment.
 * Every edge represents an actual dependency in the assessment logic:
 * Source Dataset -> Observation Evidence -> Spatial Finding -> Decision Rule -> Assessment Outcome.
 * Missing evidence domains are explicitly represented as gap nodes.
 */
export function buildProvenanceGraph(
  habitation: Habitation,
  result: PrioritisationResult
): ProvenanceGraph {
  const nodes: ProvenanceNode[] = [];
  const edges: ProvenanceEdge[] = [];
  const nodeIds = new Set<string>();

  const addNode = (node: ProvenanceNode) => {
    if (!nodeIds.has(node.id)) {
      nodeIds.add(node.id);
      nodes.push(node);
    }
  };

  const addEdge = (edge: ProvenanceEdge) => {
    edges.push(edge);
  };

  // 1. Assessment Outcome Node (Final Sink)
  const outcomeNodeId = `outcome-${habitation.id}`;
  addNode({
    id: outcomeNodeId,
    type: 'ASSESSMENT_OUTCOME',
    label: `${result.hazardUrgency} Hazard / ${result.evidenceQuality} Quality`,
    status: result.evidenceQuality,
    description: `Deterministic Prioritisation: ${result.primaryReason}`,
  });

  // 2. Decision Rule Nodes
  result.applicableRules.forEach((ruleStr) => {
    const ruleParts = ruleStr.split(':');
    const ruleId = ruleParts[0].trim();
    const ruleLabel = ruleParts.length > 1 ? ruleParts[1].trim() : ruleStr;
    const ruleNodeId = `rule-${habitation.id}-${ruleId}`;

    addNode({
      id: ruleNodeId,
      type: 'DECISION_RULE',
      label: ruleId,
      description: ruleLabel,
    });

    // Rule -> Outcome Edge
    addEdge({
      id: `edge-${ruleNodeId}->${outcomeNodeId}`,
      from: ruleNodeId,
      to: outcomeNodeId,
      relation: 'DETERMINES_OUTCOME',
      description: `Rule ${ruleId} contributes to final ${result.hazardUrgency} urgency`,
    });
  });

  // Primary active rule for connecting findings
  const primaryRuleStr = result.applicableRules[0] || 'RULE-MONIT-01';
  const primaryRuleId = primaryRuleStr.split(':')[0].trim();
  const primaryRuleNodeId = `rule-${habitation.id}-${primaryRuleId}`;

  // 3. Evidence Items, Source Datasets & Spatial Findings
  result.supportingEvidence.forEach(item => {
    // A. Source Dataset Node
    const datasetNodeId = `dataset-${item.id}`;
    addNode({
      id: datasetNodeId,
      type: 'SOURCE_DATASET',
      label: item.sourceOrg,
      category: item.category,
      sourceOrg: item.sourceOrg,
      sourceReference: item.sourceReference,
      description: `${item.sourceReference} (${item.observationDate || 'Date unrecorded'})`,
    });

    // B. Observation Evidence Node
    const evidenceNodeId = `evidence-${item.id}`;
    addNode({
      id: evidenceNodeId,
      type: 'OBSERVATION_EVIDENCE',
      label: item.name,
      category: item.category,
      status: item.status,
      domain: item.domain,
      sourceOrg: item.sourceOrg,
      sourceReference: item.sourceReference,
      description: item.status === 'CONFLICTING' 
        ? `[CONFLICTING] ${item.contradictionNote || item.finding}`
        : item.status === 'INSUFFICIENT'
        ? `[INSUFFICIENT] ${item.finding}`
        : item.finding,
    });

    // Dataset -> Evidence Edge
    addEdge({
      id: `edge-${datasetNodeId}->${evidenceNodeId}`,
      from: datasetNodeId,
      to: evidenceNodeId,
      relation: 'PRODUCED_EVIDENCE',
      description: `${item.sourceOrg} produced ${item.name}`,
    });

    // C. Spatial Finding Node
    const findingNodeId = `finding-${item.id}`;
    let findingLabel = item.finding;
    if (findingLabel.length > 60) {
      findingLabel = findingLabel.substring(0, 57) + '...';
    }

    addNode({
      id: findingNodeId,
      type: 'SPATIAL_FINDING',
      label: `${item.domain}: ${item.name}`,
      category: item.category,
      domain: item.domain,
      description: item.finding,
    });

    // Evidence -> Finding Edge
    addEdge({
      id: `edge-${evidenceNodeId}->${findingNodeId}`,
      from: evidenceNodeId,
      to: findingNodeId,
      relation: 'DERIVED_FROM',
      description: `Spatial finding derived from ${item.name}`,
    });

    // D. Connect relevant Findings to Decision Rules
    // Connect finding to rule if this evidence item triggered or directly informed the rule
    let targetRuleNodeId = primaryRuleNodeId;
    let connectsToRule = false;

    if (item.domain === 'HAZARD_IMPACT' && (primaryRuleId === 'RULE-IMPACT-01' || primaryRuleId === 'RULE-CONFL-01' || primaryRuleId === 'RULE-INSUFF-01')) {
      connectsToRule = true;
    } else if (item.domain === 'INFRASTRUCTURE_ACCESS' && primaryRuleId === 'RULE-INFRA-01') {
      connectsToRule = true;
    } else if (item.domain === 'TERRAIN_GEOLOGY' && (primaryRuleId === 'RULE-INFRA-01' || primaryRuleId === 'RULE-SUSC-01' || primaryRuleId === 'RULE-INSUFF-02')) {
      connectsToRule = true;
    } else if (primaryRuleId === 'RULE-MONIT-01') {
      connectsToRule = true;
    }

    if (connectsToRule && nodeIds.has(targetRuleNodeId)) {
      addEdge({
        id: `edge-${findingNodeId}->${targetRuleNodeId}`,
        from: findingNodeId,
        to: targetRuleNodeId,
        relation: 'EVALUATED_BY',
        description: `Finding evaluated by ${primaryRuleId}`,
      });
    }
  });

  // 4. Missing Evidence Gap Nodes
  result.missingEvidence.forEach((miss, idx) => {
    const gapNodeId = `missing-${habitation.id}-${idx}`;
    addNode({
      id: gapNodeId,
      type: 'MISSING_EVIDENCE',
      label: miss.split(':')[0],
      category: 'STATUS_GAP',
      status: 'INSUFFICIENT',
      description: miss,
    });

    // Connect Missing Evidence to the relevant Insufficiency Rule or directly to Outcome
    const insuffRule = result.applicableRules.find(r => r.includes('RULE-INSUFF'));
    if (insuffRule) {
      const insuffRuleId = insuffRule.split(':')[0].trim();
      const insuffRuleNodeId = `rule-${habitation.id}-${insuffRuleId}`;
      if (nodeIds.has(insuffRuleNodeId)) {
        addEdge({
          id: `edge-${gapNodeId}->${insuffRuleNodeId}`,
          from: gapNodeId,
          to: insuffRuleNodeId,
          relation: 'EXPOSES_GAP',
          description: `Missing evidence triggers ${insuffRuleId}`,
        });
        return;
      }
    }

    // Otherwise connect to Outcome
    addEdge({
      id: `edge-${gapNodeId}->${outcomeNodeId}`,
      from: gapNodeId,
      to: outcomeNodeId,
      relation: 'EXPOSES_GAP',
      description: `Critical evidence gap forces INSUFFICIENT evidence quality`,
    });
  });

  return {
    habitationId: habitation.id,
    nodes,
    edges,
  };
}

/**
 * Returns all upstream node IDs that contribute to a target node.
 */
export function getUpstreamNodeIds(graph: ProvenanceGraph, targetNodeId: string): Set<string> {
  const upstream = new Set<string>();
  const queue = [targetNodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const incomingEdges = graph.edges.filter(e => e.to === current);
    for (const edge of incomingEdges) {
      if (!upstream.has(edge.from)) {
        upstream.add(edge.from);
        queue.push(edge.from);
      }
    }
  }

  return upstream;
}

/**
 * Returns all downstream node IDs that depend on a source node.
 */
export function getDownstreamNodeIds(graph: ProvenanceGraph, sourceNodeId: string): Set<string> {
  const downstream = new Set<string>();
  const queue = [sourceNodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const outgoingEdges = graph.edges.filter(e => e.from === current);
    for (const edge of outgoingEdges) {
      if (!downstream.has(edge.to)) {
        downstream.add(edge.to);
        queue.push(edge.to);
      }
    }
  }

  return downstream;
}
