/**
 * Attach a node's UI from a lazily imported module.
 *
 * ComfyUI calls `nodeCreated` from the end of the ComfyNode constructor and
 * does *not* await it -- a constructor cannot. So an attach that awaits an
 * import() lands after the node has already been configured, and after the
 * user may have deleted it again.
 *
 * Being late is fine on its own: each product rebuilds its state from the
 * node's widgets when it attaches, and by then `configure()` has written the
 * saved values into them. What is *not* fine is attaching to a node that no
 * longer exists, so that is what this guards.
 *
 * An earlier version also recorded onConfigure / onAfterGraphConfigured while
 * the chunk was in flight and replayed them after attaching. Do not bring that
 * back: re-entering ComfyUI's own graph-configured path a second time drives
 * the frontend's Vue node adapter (extractVueNodeData) to re-wrap the node's
 * `widgets` accessor on every pass, and the resulting getter chain overflows
 * the stack, which aborts the whole workflow load. The replay bought nothing
 * that the widget re-read does not already cover.
 *
 * The one thing genuinely lost is an `onExecuted` that arrives inside the load
 * window -- a prompt finishing in the moment a node is first placed. That is
 * narrow enough to accept.
 */

/**
 * @param {object} node ComfyUI node, fresh out of its constructor.
 * @param {() => Promise<(node: object) => void>} load Resolves to the attach function.
 * @returns {Promise<void>} Resolves once attached (or once the load has failed).
 */
export function attachWhenLoaded(node, load) {
  let removed = false;
  const originalRemoved = node.onRemoved;
  const removedShim = function (...args) {
    removed = true;
    originalRemoved?.apply(this, args);
  };
  removedShim.__omnicamShim = true;
  node.onRemoved = removedShim;

  // Only take the hook back if it is still ours: another extension may have
  // wrapped it while we waited, and clobbering that would break it.
  const restore = () => {
    if (node.onRemoved?.__omnicamShim) node.onRemoved = originalRemoved;
  };

  return load().then((attach) => {
    restore();
    // Building a UI for a deleted node grafts a DOM widget onto a dead node
    // and, for the Director, opens a WebGL context nothing will dispose.
    if (removed) return;
    attach(node);
  }).catch((error) => {
    restore();
    console.error("OmniCam: node UI failed to load", error);
  });
}
