// A reliable "something in the graph got (dis)connected" signal.
//
// The per-node `node.onConnectionsChange` hook is not delivered in every
// ComfyUI build when the change originates elsewhere -- an upstream node
// deleted, a link re-routed by the Vue graph, a workflow fragment pasted over
// an existing link. `LGraph.onConnectionChange` *is* called after every
// connect and disconnect on any node (including the implicit disconnects when a
// node is removed), so we fan that single graph-level callback out to per-node
// listeners as a backstop. Callers still keep their own `onConnectionsChange`
// wrapper for the fast path; this only guarantees they also hear the cases it
// misses.

const WATCHERS = new WeakMap(); // graph -> Set<cb>

function ensureGraphHook(graph) {
  let set = WATCHERS.get(graph);
  if (set) return set;
  set = new Set();
  WATCHERS.set(graph, set);
  const previous = graph.onConnectionChange;
  graph.onConnectionChange = function (changedNode) {
    const result = previous?.apply(this, arguments);
    for (const cb of [...set]) {
      try {
        cb(changedNode);
      } catch (error) {
        console.warn("[OmniCam] graph connection watcher failed", error);
      }
    }
    return result;
  };
  return set;
}

/**
 * Run `callback` whenever any connection in `node`'s graph changes. Returns an
 * unsubscribe function; safe to call before the node has a graph (it simply
 * does nothing until re-invoked once one is attached).
 */
export function watchGraphConnections(node, callback) {
  const graph = node?.graph;
  if (!graph || typeof callback !== "function") return () => {};
  const set = ensureGraphHook(graph);
  set.add(callback);
  return () => set.delete(callback);
}
