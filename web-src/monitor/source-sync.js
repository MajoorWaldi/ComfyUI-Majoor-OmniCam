import { linkedOrigin } from "../graph-links.js";

function nodeClassOf(node) {
  return String(node?.comfyClass || node?.constructor?.type || "");
}

function originFor(node, inputName) {
  const input = node?.inputs?.find((item) => item.name === inputName);
  if (input?.link == null || !node?.graph) return null;
  return linkedOrigin(node.graph, input.link);
}

export function readMonitorSource(node) {
  const sceneOrigin = originFor(node, "motion_scene");
  const playblastOrigin = originFor(node, "playblast_video");
  return {
    sceneConnected: Boolean(sceneOrigin),
    sceneOrigin,
    sceneNodeClass: nodeClassOf(sceneOrigin),
    playblastConnected: Boolean(playblastOrigin),
    playblastOrigin,
    playblastNodeClass: nodeClassOf(playblastOrigin),
  };
}

export class MonitorSourceWatcher {
  constructor(node, onChange, interval = 250) {
    this.node = node;
    this.onChange = onChange;
    this.initialized = false;
    this.last = "";
    this.timer = setInterval(() => this.poll(), interval);
    this.poll();
  }

  poll() {
    const source = readMonitorSource(this.node);
    const key = JSON.stringify([
      source.sceneOrigin?.id ?? null,
      source.playblastOrigin?.id ?? null,
      source.playblastOrigin?.imageIndex ?? null,
    ]);
    if (this.initialized && key === this.last) return false;
    this.initialized = true;
    this.last = key;
    this.onChange(source);
    return true;
  }

  dispose() {
    clearInterval(this.timer);
    this.timer = null;
  }
}
