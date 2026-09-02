// Initial and minimum sizes for OmniCam's three DOM-widget-heavy nodes.
//
// Each of Director, Extractor and Monitor is one large DOMWidget (a viewport,
// or a panel) rather than a row of ordinary Comfy widgets, so LiteGraph's own
// computeSize() -- built for measuring widget rows -- has nothing to measure
// at node-creation time and falls back to a small placeholder. Left alone, a
// freshly added node renders too small and has to be dragged bigger by hand
// every time.
//
// The two sizes mean different things and are applied at different moments:
//
// - `default` is a size a genuinely *new* node is set to once, so it opens
//   comfortable to work in immediately. It must never be reapplied to a node
//   restored from a saved workflow -- that would silently discard a size the
//   user chose and saved, on every load.
// - `min` is a floor applied to a *restored* node instead: old workflows
//   saved before a panel grew new UI can carry a size too small for what the
//   node now renders, and min protects against that without ever overriding
//   a size the user deliberately chose above it.
//
// Callers decide which applies using ComfyUI's own
// beforeConfigureGraph/afterConfigureGraph signal (see web-src/main.js): a
// node created while a graph is being configured is being restored, not
// added fresh. That flag is read synchronously inside nodeCreated, so it is
// available well before any lazy import resolves -- unlike node.onConfigure,
// which a lazily-attached node can genuinely miss for the very load that
// matters (see the warning in web-src/lazy-node-ui.js) and must not be
// re-hooked to compensate.
import { DIRECTOR_NODE_CLASS, EXTRACTOR_NODE_CLASS, MONITOR_NODE_CLASS } from "../node-classes.js";

// `default` values are taken verbatim (rounded to whole pixels) from a real
// workflow saved with each node laid out comfortably: Extractor's SOURCE/
// TRACK 3D player and solve timeline, Director's viewport/outliner/graph
// editor, and Monitor's playblast player and preflight all visible without
// scrolling.
export const NODE_LAYOUTS = {
  [DIRECTOR_NODE_CLASS]: { default: [1313, 1633], min: [760, 760] },
  [EXTRACTOR_NODE_CLASS]: { default: [761, 1458], min: [700, 760] },
  [MONITOR_NODE_CLASS]: { default: [798, 1634], min: [640, 680] },
};

// The `default` sizes above are taller than a 1080p screen. Opening a new node
// larger than the window lands it with its resize handle and half its panel
// off-screen, and the user's first interaction is a fight to shrink it. Cap a
// *fresh* node to most of the current viewport; the minimum still wins if the
// window is genuinely tiny, and restored nodes never pass through here so a
// saved size the user chose is untouched.
const VIEWPORT_WIDTH_FRACTION = 0.92;
const VIEWPORT_HEIGHT_FRACTION = 0.88;

function fitDefaultToViewport([width, height], [minWidth, minHeight]) {
  if (typeof window === "undefined") return [width, height];
  const maxWidth = Math.round((window.innerWidth || width) * VIEWPORT_WIDTH_FRACTION);
  const maxHeight = Math.round((window.innerHeight || height) * VIEWPORT_HEIGHT_FRACTION);
  return [
    Math.max(minWidth, Math.min(width, maxWidth)),
    Math.max(minHeight, Math.min(height, maxHeight)),
  ];
}

/** Set once, only for a node the user just added -- never for one being restored. */
export function applyDefaultNodeSize(node, comfyClass) {
  const layout = NODE_LAYOUTS[comfyClass];
  if (!layout || !node?.setSize) return false;
  node.setSize(fitDefaultToViewport(layout.default, layout.min));
  return true;
}

/**
 * A floor for a restored node's saved size, not a target: never shrinks it.
 *
 * `baseSize`, when given, is the size to clamp -- pass the workflow's actual
 * saved [width, height] here rather than relying on node.size at call time.
 * Between graph-configure and this running (the lazy chunk's import gap),
 * LiteGraph's own layout can already have shrunk node.size to fit a node
 * that, at that moment, has no DOM widget mounted yet -- so reading
 * node.size here would floor a genuinely large saved width down to the
 * minimum instead of restoring it. See web-src/main.js's configure capture.
 */
export function clampNodeSizeToMinimum(node, comfyClass, baseSize) {
  const layout = NODE_LAYOUTS[comfyClass];
  if (!layout || !node?.setSize) return false;
  // A node genuinely has no size before this, but if that ever slips
  // through, treat it as needing the floor rather than as already fine.
  const source = Array.isArray(baseSize) ? baseSize
    : Array.isArray(node.size) ? node.size : [0, 0];
  const current = Array.isArray(node.size) ? node.size : [0, 0];
  const [minWidth, minHeight] = layout.min;
  const width = Math.max(Number(source[0]) || 0, minWidth);
  const height = Math.max(Number(source[1]) || 0, minHeight);
  if (width === current[0] && height === current[1]) return false;
  node.setSize([width, height]);
  return true;
}
