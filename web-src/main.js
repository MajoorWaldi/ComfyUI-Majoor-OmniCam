import { app, api } from "./comfy-runtime.js";

import { registerOmniCamNodeBranding } from "./node-branding.js";
import { configureMotionHealthApi } from "./motion-health/panel.js";
import { migrateDirectorOutputs } from "./director-output-migration.js";
import {
  OMNICAM_SETTINGS,
  registerDirectorRuntime,
  registerOmniCamLocales,
  seedDirectorDefaults,
} from "./settings.js";
import { installGlobalKeyInterceptor } from "./omnicam-commands.js";
import { attachWhenLoaded } from "./lazy-node-ui.js";
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
  beforeConfigureGraph(graphData) {
    configuringGraph = true;
    migrateDirectorOutputs(graphData);
  },
  afterConfigureGraph() {
    configuringGraph = false;
  },
  async nodeCreated(node) {
    if (nodeClassOf(node) !== DIRECTOR_NODE_CLASS) return;
    // ComfyUI does not await nodeCreated while restoring a workflow. Capture
    // the lifecycle state before the dynamic import so afterConfigureGraph
    // cannot make a loaded node look new when the chunk eventually resolves.
    const seedDefaults = !configuringGraph;
    await attachWhenLoaded(node, async () => (await import("./director.js")).attachDirector);
    const ui = node.__majoorOmniCam;
    if (!ui) return;
    registerDirectorRuntime(ui);
    if (seedDefaults) seedDirectorDefaults(ui);
  },
});

app.registerExtension({
  name: "Majoor.OmniCam.Extractor",
  async nodeCreated(node) {
    if (nodeClassOf(node) !== EXTRACTOR_NODE_CLASS) return;
    await attachWhenLoaded(node, async () => (await import("./extractor/index.js")).attachExtractor);
  },
});

app.registerExtension({
  name: "Majoor.OmniCam.Monitor",
  async nodeCreated(node) {
    if (nodeClassOf(node) !== MONITOR_NODE_CLASS) return;
    await attachWhenLoaded(node, async () => (await import("./monitor/index.js")).attachMonitor);
  },
});
