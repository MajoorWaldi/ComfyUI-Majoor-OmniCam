// Transport identity only. Never serialized into the authored MotionScene.
const graphIds = new WeakMap();

function opaqueId() {
  return globalThis.crypto.randomUUID();
}

function graphId(graph, fallback) {
  if (!graph || typeof graph !== "object") return fallback;
  if (graph.id) return String(graph.id);
  if (!graphIds.has(graph)) graphIds.set(graph, opaqueId());
  return graphIds.get(graph);
}

export function createSessionTarget(ui, node) {
  const instanceId = opaqueId();
  return () => {
    // Use the node's owning root, never whichever tab is currently visible.
    const root = node.graph?.rootGraph || node.graph || ui.app?.rootGraph;
    const documentId = graphId(root, instanceId);
    const containingGraph = graphId(node.graph, documentId);
    return {
      document_id: documentId,
      graph_id: containingGraph,
      node_locator: `${containingGraph}:${node.id}`,
      instance_id: instanceId,
    };
  };
}
