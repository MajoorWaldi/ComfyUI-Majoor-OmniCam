// The ComfyUI class names of the OmniCam nodes, shared by the eager entry
// (which matches on them before loading anything) and the product modules.
export const DIRECTOR_NODE_CLASS = "MajoorOmniCamDirector";
export const EXTRACTOR_NODE_CLASS = "MajoorOmniCamExtractor";
export const MONITOR_NODE_CLASS = "MajoorOmniCamMonitor";

/** Read a node's class the several ways ComfyUI exposes it. */
export function nodeClassOf(node) {
  return String(node?.comfyClass || node?.type || node?.constructor?.type || "");
}
