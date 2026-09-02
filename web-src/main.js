import { app, api } from "./comfy-runtime.js";

import { registerOmniCamNodeBranding } from "./node-branding.js";
import { configureMotionHealthApi } from "./motion-health/panel.js";
import {
  OMNICAM_SETTINGS,
  registerDirectorRuntime,
  registerOmniCamLocales,
  seedDirectorDefaults,
} from "./settings.js";
import { installGlobalKeyInterceptor } from "./omnicam-commands.js";
import { attachWhenLoaded } from "./lazy-node-ui.js";
import { applyDefaultNodeSize, clampNodeSizeToMinimum } from "./shared/node-layout.js";
import {
  DIRECTOR_NODE_CLASS,
  EXTRACTOR_NODE_CLASS,
  MONITOR_NODE_CLASS,
  nodeClassOf,
} from "./node-classes.js";
// The per-node "?" help button attaches to the selection toolbar rather than
// to a node, so it has nothing to defer to and stays here.
import "./help/index.js";

// This module is the whole of OmniCam's startup cost: everything ComfyUI has
// to parse before the user has placed a single node. Each product's UI is
// behind a dynamic import in its nodeCreated below, so keep this file's static
// imports to registration, preferences and the key interceptor. Adding a
// static import of a product module here silently undoes the code splitting;
// tests/frontend/production-bundle.node.mjs guards the expensive cases.

configureMotionHealthApi(api);

let configuringGraph = false;

// A node created while a graph is being configured is being restored from a
// saved workflow, not added by the user: give it the comfortable default size
// only in the fresh case, and never take a saved size away from the other.
// `seedDefaults` is read synchronously in nodeCreated, well before the lazy
// chunk import -- see web-src/shared/node-layout.js for why that matters.
function applyNodeLayout(node, comfyClass, seedDefaults, restoredSize) {
  if (seedDefaults) applyDefaultNodeSize(node, comfyClass);
  else clampNodeSizeToMinimum(node, comfyClass, restoredSize);
}

// Captures the [width, height] a restored node's own saved workflow data
// carries, synchronously as LiteGraph's graph.configure() calls node.configure
// with it -- before the lazy chunk import resolves. Without this, the size
// applyNodeLayout later reads off node.size can already have been shrunk by
// LiteGraph's own layout pass, which runs on this node while it still has no
// DOM widget mounted (ours attaches only once the lazy import resolves) and
// so treats it as having nothing to fit around. That shrink is what made a
// real browser refresh floor every OmniCam node to its bare minimum size
// instead of restoring what was saved.
function captureRestoredSize(node) {
  if (typeof node.configure !== "function") return () => null;
  let size = null;
  const originalConfigure = node.configure.bind(node);
  node.configure = function (data) {
    if (size === null && Array.isArray(data?.size)) size = [...data.size];
    return originalConfigure(data);
  };
  return () => size;
}

function recordDirectorTrace(stage, node) {
  const trace = globalThis.__majoorOmniCamCiTrace;
  if (!Array.isArray(trace)) return;
  trace.push({ stage, nodeId: node?.id ?? null, nodeClass: nodeClassOf(node), configuringGraph });
}

// Claim OmniCam shortcuts on window-capture as early as possible -- ideally
// before ComfyUI's ChangeTracker registers its own Ctrl+Z handler.
installGlobalKeyInterceptor();
registerOmniCamNodeBranding(app);
// Locales must be registered before the first buildRoot() call, which resolves
// every label through t() eagerly.
registerOmniCamLocales(app);

app.registerExtension({
  name: "Majoor.OmniCam.Director",
  settings: OMNICAM_SETTINGS,
  beforeConfigureGraph() {
    configuringGraph = true;
  },
  afterConfigureGraph() {
    configuringGraph = false;
  },
  async nodeCreated(node) {
    if (nodeClassOf(node) !== DIRECTOR_NODE_CLASS) return;
    recordDirectorTrace("director:nodeCreated", node);
    // ComfyUI does not await nodeCreated while restoring a workflow. Capture
    // the lifecycle state before the dynamic import so afterConfigureGraph
    // cannot make a loaded node look new when the chunk eventually resolves.
    const seedDefaults = !configuringGraph;
    const getRestoredSize = seedDefaults ? null : captureRestoredSize(node);
    await attachWhenLoaded(node, async () => {
      recordDirectorTrace("director:import:start", node);
      const { attachDirector } = await import("./director.js");
      recordDirectorTrace("director:import:resolved", node);
      return attachDirector;
    });
    const ui = node.__majoorOmniCam;
    if (!ui) return;
    recordDirectorTrace("director:attach:complete", node);
    registerDirectorRuntime(ui);
    if (seedDefaults) seedDirectorDefaults(ui);
    applyNodeLayout(node, DIRECTOR_NODE_CLASS, seedDefaults, getRestoredSize?.());
  },
});

app.registerExtension({
  name: "Majoor.OmniCam.Extractor",
  async nodeCreated(node) {
    if (nodeClassOf(node) !== EXTRACTOR_NODE_CLASS) return;
    const seedDefaults = !configuringGraph;
    const getRestoredSize = seedDefaults ? null : captureRestoredSize(node);
    await attachWhenLoaded(node, async () => (await import("./extractor/index.js")).attachExtractor);
    if (!node.__majoorOmniCamExtractor) return;
    applyNodeLayout(node, EXTRACTOR_NODE_CLASS, seedDefaults, getRestoredSize?.());
  },
});

app.registerExtension({
  name: "Majoor.OmniCam.Monitor",
  async nodeCreated(node) {
    if (nodeClassOf(node) !== MONITOR_NODE_CLASS) return;
    const seedDefaults = !configuringGraph;
    const getRestoredSize = seedDefaults ? null : captureRestoredSize(node);
    await attachWhenLoaded(node, async () => (await import("./monitor/index.js")).attachMonitor);
    if (!node.__majoorOmniCamMonitor) return;
    applyNodeLayout(node, MONITOR_NODE_CLASS, seedDefaults, getRestoredSize?.());
  },
});
