/**
 * OmniCam Sequencer extension and UI widget entrypoint.
 */

import { applySpeedPreset } from "./retime-provider.js";
import { createDefaultState, generateStableId, recalculateTimeline, splitShotAt } from "./state.js";
import { SequencerTimelineRenderer } from "./timeline.js";
import { createSequencerToolbar } from "./toolbar.js";
import { SpeedGraphRenderer } from "./speed-graph.js";
import { SEQUENCER_STYLES } from "./styles.js";
import { createPreviewMedia, managedPreviewDescriptor, upstreamPreviewDescriptor } from "./media-preview.js";

const EXTENSION_NAME = "MajoorOmniCam.Sequencer";
const NODE_CLASS = "MajoorOmniCamSequencer";

function graphLink(graph, linkRef) {
  if (linkRef && typeof linkRef === "object") return linkRef;
  return graph?.links?.get?.(linkRef) || graph?.links?.[linkRef]
    || graph?._links?.get?.(linkRef) || graph?._links?.[linkRef] || null;
}

function graphNode(graph, nodeId) {
  if (nodeId == null) return null;
  return graph?.getNodeById?.(nodeId) || graph?._nodes_by_id?.get?.(nodeId)
    || graph?._nodes_by_id?.[nodeId] || null;
}

function inputOriginNode(node, input, inputIndex) {
  const direct = node?.getInputNode?.(inputIndex);
  if (direct) return direct;
  const graph = node?.graph;
  const link = graphLink(graph, input?.link);
  const originId = link?.origin_id ?? link?.originId ?? (Array.isArray(link) ? link[1] : null);
  return graphNode(graph, originId);
}

export function sequencerInputSlot(input) {
  const rawName = String(input?.name || input?.localized_name || "");
  return rawName.split(".").filter(Boolean).at(-1) || rawName;
}

export class OmniCamSequencerUI {
  constructor(node, api = null) {
    this.node = node;
    this.state = createDefaultState(24);
    this.isPlaying = false;
    this.playTimer = null;
    this.dragTarget = null; // { type: "playhead" | "trim_left" | "trim_right" | "clip", shotId, startX, startFrame }
    this.api = api;
    this.mediaPreviews = new Map();
    this.mediaPreviewKeys = new Map();

    this.root = document.createElement("div");
    this.root.className = "majoor-omnicam omnicam-sequencer-root";
    const style = document.createElement("style");
    style.textContent = SEQUENCER_STYLES;
    this.root.appendChild(style);

    this.toolbar = createSequencerToolbar(this);
    this.root.appendChild(this.toolbar);

    this.canvas = document.createElement("canvas");
    this.canvas.className = "omnicam-sequencer-canvas";
    this.timelineSection = document.createElement("div");
    this.timelineSection.className = "sequencer-section sequencer-timeline-section";
    const timelineTitle = document.createElement("div");
    timelineTitle.className = "sequencer-section-title";
    timelineTitle.textContent = "Timeline";
    this.timelineSection.append(timelineTitle, this.canvas);
    this.root.appendChild(this.timelineSection);

    this.renderer = new SequencerTimelineRenderer(this.canvas, this.state, this.mediaPreviews);
    this.graphCanvas = document.createElement("canvas");
    this.graphCanvas.className = "omnicam-sequencer-speed-graph";
    this.graphSection = document.createElement("div");
    this.graphSection.className = "sequencer-section sequencer-graph-section";
    const graphTitle = document.createElement("div");
    graphTitle.className = "sequencer-section-title";
    graphTitle.textContent = "Graph Editor · Speed";
    this.graphSection.append(graphTitle, this.graphCanvas);
    this.root.appendChild(this.graphSection);
    this.speedGraph = new SpeedGraphRenderer(this.graphCanvas, this);
    this.bindEvents();
    this.restoreFromWidgets();
    // Graph links may not be restored yet during node construction. Import
    // available sources now, but defer destructive disconnect reconciliation.
    this.syncConnectedSlots(false);
  }

  bindEvents() {
    this.boundPointerDown = (e) => this.onPointerDown(e);
    this.boundPointerMove = (e) => this.onPointerMove(e);
    this.boundPointerUp = (e) => this.onPointerUp(e);
    this.boundWheel = (e) => this.onWheel(e);
    this.canvas.addEventListener("pointerdown", this.boundPointerDown);
    window.addEventListener("pointermove", this.boundPointerMove);
    window.addEventListener("pointerup", this.boundPointerUp);
    this.canvas.addEventListener("wheel", this.boundWheel, { passive: false });

    const resizeObs = new ResizeObserver(() => {
      this.resizeCanvas();
      this.render();
    });
    resizeObs.observe(this.root);
    this.resizeObserver = resizeObs;
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      this.canvas.width = Math.round(rect.width * dpr);
      this.canvas.height = Math.round(rect.height * dpr);
      this.renderer.pixelRatio = dpr;
    }
    this.speedGraph.resize();
  }

  render() {
    this.renderer.render();
    this.speedGraph.render();
    this.updateTimeDisplay();
  }

  updateTimeDisplay() {
    if (!this.timeDisplay) return;
    const f = this.state.timeline.playhead_frame || 0;
    const fps = this.state.timeline.fps_num || 24;
    const s = f / fps;
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(Math.floor(s % 60)).padStart(2, "0");
    const ff = String(f % fps).padStart(2, "0");
    this.timeDisplay.innerText = `00:${mm}:${ss}:${ff} (${f}f)`;
  }

  onPointerDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const frame = this.renderer.xToFrame(x);

    // Clicking ruler -> scrub playhead
    if (y <= this.renderer.rulerHeight) {
      this.state.timeline.playhead_frame = Math.max(0, frame);
      this.dragTarget = { type: "playhead" };
      this.render();
      this.syncToWidgets();
      return;
    }

    // Check hit on video clips
    const shots = this.state.shots || {};
    const order = this.state.shot_order || [];
    let hitShot = null;
    let hitShotId = null;

    for (const sid of order) {
      const shot = shots[sid];
      if (!shot || !shot.timeline) continue;
      const tl = shot.timeline;
      if (frame >= tl.start_frame && frame <= tl.end_frame) {
        hitShot = shot;
        hitShotId = sid;
        break;
      }
    }

    const audioStartY = this.renderer.rulerHeight + this.renderer.trackHeight + 16;
    if (!hitShot && y >= audioStartY) {
      const audioIndex = Math.floor((y - audioStartY) / (this.renderer.audioTrackHeight + 4));
      const audioEntries = Object.entries(this.state.audio_tracks || {}).filter(([, audio]) => audio?.enabled);
      const hitAudio = audioEntries[audioIndex];
      if (hitAudio) {
        this.state.selected_audio_id = hitAudio[0];
        this.state.selected_clip_id = null;
        this.dragTarget = { type: "audio", audioId: hitAudio[0], pointerFrame: frame, initialStart: hitAudio[1].timeline?.start_frame || 0 };
        this.render();
        this.syncToWidgets();
        return;
      }
    }

    if (hitShot) {
      this.state.selected_clip_id = hitShotId;
      this.state.selected_audio_id = null;
      const tl = hitShot.timeline;
      const startX = this.renderer.frameToX(tl.start_frame);
      const endX = this.renderer.frameToX(tl.end_frame + 1);

      if (Math.abs(x - startX) <= 6) {
        this.dragTarget = { type: "trim_left", shotId: hitShotId, initialIn: hitShot.trim.in_frame, pointerFrame: frame };
      } else if (Math.abs(x - endX) <= 6) {
        this.dragTarget = { type: "trim_right", shotId: hitShotId, initialOut: hitShot.trim.out_frame, pointerFrame: frame };
      } else {
        this.dragTarget = { type: "clip", shotId: hitShotId, pointerFrame: frame };
        this.state.timeline.playhead_frame = Math.max(0, frame);
      }
      this.render();
      this.syncToWidgets();
    } else {
      this.state.timeline.playhead_frame = Math.max(0, frame);
      this.dragTarget = { type: "playhead" };
      this.render();
      this.syncToWidgets();
    }
  }

  onPointerMove(e) {
    if (!this.dragTarget) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const frame = this.renderer.xToFrame(x);

    if (this.dragTarget.type === "playhead") {
      this.state.timeline.playhead_frame = Math.max(0, frame);
      this.render();
      this.syncToWidgets();
    } else if (this.dragTarget.type === "trim_left") {
      const shot = this.state.shots[this.dragTarget.shotId];
      if (shot && shot.timeline) {
        const delta = frame - this.dragTarget.pointerFrame;
        shot.trim.in_frame = Math.max(0, Math.min(shot.trim.out_frame - 1, this.dragTarget.initialIn + delta));
        recalculateTimeline(this.state);
        this.render();
        this.syncToWidgets();
      }
    } else if (this.dragTarget.type === "trim_right") {
      const shot = this.state.shots[this.dragTarget.shotId];
      if (shot && shot.timeline) {
        const delta = frame - this.dragTarget.pointerFrame;
        shot.trim.out_frame = Math.max(shot.trim.in_frame + 1, Math.min(shot.source.duration_frames - 1, this.dragTarget.initialOut + delta));
        recalculateTimeline(this.state);
        this.render();
        this.syncToWidgets();
      }
    } else if (this.dragTarget.type === "clip") {
      const order = this.state.shot_order;
      const from = order.indexOf(this.dragTarget.shotId);
      const to = order.findIndex((id) => frame < (this.state.shots[id]?.timeline?.end_frame ?? -1));
      const target = to < 0 ? order.length - 1 : to;
      if (from >= 0 && target >= 0 && from !== target) {
        order.splice(from, 1);
        order.splice(target, 0, this.dragTarget.shotId);
        recalculateTimeline(this.state);
        this.render();
        this.syncToWidgets();
      }
    } else if (this.dragTarget.type === "audio") {
      const audio = this.state.audio_tracks?.[this.dragTarget.audioId];
      if (audio) {
        audio.timeline = { start_frame: Math.max(0, this.dragTarget.initialStart + frame - this.dragTarget.pointerFrame) };
        this.render();
        this.syncToWidgets();
      }
    }
  }

  onPointerUp() {
    this.dragTarget = null;
  }

  onWheel(e) {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    this.zoom(zoomFactor);
  }

  zoom(factor) {
    const current = this.state.timeline.zoom || 1.0;
    this.state.timeline.zoom = Math.max(0.1, Math.min(10.0, current * factor));
    this.render();
    this.syncToWidgets();
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
  }

  startPlayback() {
    this.isPlaying = true;
    let lastTime = performance.now();
    const fps = (this.state.timeline.fps_num || 24) / (this.state.timeline.fps_den || 1);
    const frameInterval = 1000 / fps;

    const loop = (now) => {
      if (!this.isPlaying) return;
      const elapsed = now - lastTime;
      if (elapsed >= frameInterval) {
        const advance = Math.max(1, Math.floor(elapsed / frameInterval));
        const endFrame = this.sequenceEndFrame();
        this.state.timeline.playhead_frame = Math.min(endFrame, (this.state.timeline.playhead_frame || 0) + advance);
        lastTime += advance * frameInterval;
        this.render();
        if (this.state.timeline.playhead_frame >= endFrame) {
          this.stopPlayback();
          this.syncToWidgets();
          return;
        }
      }
      this.playTimer = requestAnimationFrame(loop);
    };
    this.playTimer = requestAnimationFrame(loop);
  }

  stopPlayback() {
    this.isPlaying = false;
    if (this.playTimer) cancelAnimationFrame(this.playTimer);
    this.render();
  }

  sequenceEndFrame() {
    return Math.max(0, ...Object.values(this.state.shots || {}).filter((shot) => shot?.enabled).map((shot) => shot.timeline?.end_frame || 0));
  }

  splitAtPlayhead() {
    if (!this.state.selected_clip_id) return;
    const playhead = this.state.timeline.playhead_frame || 0;
    const res = splitShotAt(this.state, this.state.selected_clip_id, playhead);
    if (res) {
      this.render();
      this.syncToWidgets();
    }
  }

  toggleSelectedAudio(flag) {
    const audio = this.state.audio_tracks?.[this.state.selected_audio_id];
    if (!audio) return;
    audio[flag] = !audio[flag];
    this.render();
    this.syncToWidgets();
  }

  movePlayhead(delta) {
    this.state.timeline.playhead_frame = Math.max(0, Math.min(this.sequenceEndFrame(), (this.state.timeline.playhead_frame || 0) + delta));
    this.render();
    this.syncToWidgets();
  }

  duplicateSelected() {
    const source = this.state.shots?.[this.state.selected_clip_id];
    if (!source) return;
    const id = generateStableId("shot");
    const copy = structuredClone(source);
    copy.id = id;
    copy.name = `${source.name} Copy`;
    this.state.shots[id] = copy;
    const index = this.state.shot_order.indexOf(source.id);
    this.state.shot_order.splice(index + 1, 0, id);
    this.state.selected_clip_id = id;
    recalculateTimeline(this.state);
    this.render();
    this.syncToWidgets();
  }

  setSelectedEnabled(enabled) {
    const shot = this.state.shots?.[this.state.selected_clip_id];
    if (!shot) return;
    shot.enabled = enabled;
    recalculateTimeline(this.state);
    this.render();
    this.syncToWidgets();
  }

  resetSelected() {
    const shot = this.state.shots?.[this.state.selected_clip_id];
    if (!shot) return;
    shot.enabled = true;
    shot.trim = { in_frame: 0, out_frame: Math.max(0, shot.source.duration_frames - 1) };
    shot.retime = { enabled: false, mode: "absolute_speed", interpolation: "blend", curve: { keys: [{ frame: 0, value: 1, interpolation: "constant" }] } };
    recalculateTimeline(this.state);
    this.render();
    this.syncToWidgets();
  }

  applySpeedPresetToSelected(presetId) {
    if (!this.state.selected_clip_id) return;
    const shot = this.state.shots[this.state.selected_clip_id];
    if (!shot) return;
    applySpeedPreset(shot, presetId);
    recalculateTimeline(this.state);
    this.render();
    this.syncToWidgets();
  }

  syncToWidgets() {
    if (!this.node || !this.node.widgets) return;
    const widget = this.node.widgets.find((w) => w.name === "sequence_state");
    if (widget) {
      widget.value = JSON.stringify(this.state);
    }
  }

  restoreFromWidgets() {
    if (!this.node || !this.node.widgets) return;
    const widget = this.node.widgets.find((w) => w.name === "sequence_state");
    if (widget && widget.value) {
      try {
        const parsed = JSON.parse(widget.value);
        if (parsed && typeof parsed === "object") {
          this.state = Object.assign(this.state, parsed);
          recalculateTimeline(this.state);
        }
      } catch (err) {
        // Fallback default state
      }
    }
    this.resizeCanvas();
    this.render();
  }

  syncMediaPreview(sourceSlot, descriptor) {
    if (!descriptor || this.mediaPreviewKeys.get(sourceSlot) === descriptor.key) return;
    const previous = this.mediaPreviews.get(sourceSlot);
    if (previous?.tagName === "VIDEO") {
      previous.pause?.();
      previous.removeAttribute?.("src");
      previous.load?.();
    }
    const media = createPreviewMedia(descriptor, () => this.render());
    if (!media) return;
    this.mediaPreviewKeys.set(sourceSlot, descriptor.key);
    this.mediaPreviews.set(sourceSlot, media);
  }

  removeMediaPreview(sourceSlot) {
    const media = this.mediaPreviews.get(sourceSlot);
    if (media?.tagName === "VIDEO") {
      media.pause?.();
      media.removeAttribute?.("src");
      media.load?.();
    }
    this.mediaPreviews.delete(sourceSlot);
    this.mediaPreviewKeys.delete(sourceSlot);
  }

  syncConnectedSlots(pruneDisconnected = true) {
    const inputs = Array.isArray(this.node?.inputs) ? this.node.inputs : [];
    let changed = false;
    const connectedShotSlots = new Set();
    const connectedAudioSlots = new Set();
    for (const [inputIndex, input] of inputs.entries()) {
      // ComfyUI V3 namespaces dynamic inputs as `shots.shot0` and
      // `audio_tracks.audio0`. Older frontends expose only the leaf name.
      const name = sequencerInputSlot(input);
      if (input?.link == null) continue;
      if (name === "shot_collection") {
        const origin = inputOriginNode(this.node, input, inputIndex);
        const stateWidget = origin?.widgets?.find((widget) => widget.name === "state_json");
        let cameras = [];
        let directorState = {};
        try {
          directorState = JSON.parse(stateWidget?.value || "{}");
          cameras = Array.isArray(directorState.cameras) ? directorState.cameras : [];
        } catch {
          cameras = [];
        }
        cameras.forEach((camera, index) => {
          const sourceSlot = `collection_shot${index}`;
          connectedShotSlots.add(sourceSlot);
          const recording = camera?.recording_path || camera?.proxy_path;
          if (recording) this.syncMediaPreview(sourceSlot, managedPreviewDescriptor(this.api, recording));
          const existing = Object.values(this.state.shots).find((shot) => shot.source_slot === sourceSlot);
          if (existing) {
            const nextName = String(camera?.name || existing.name || `Camera ${index + 1}`);
            if (existing.name !== nextName) {
              existing.name = nextName;
              changed = true;
            }
            return;
          }
          const preferredId = String(camera?.id || `camera_${index + 1}`);
          const id = this.state.shots[preferredId] ? generateStableId("shot") : preferredId;
          const duration = Math.max(1, Number(directorState.duration_frames || 120));
          this.state.shots[id] = {
            id,
            name: String(camera?.name || `Camera ${index + 1}`),
            source_slot: sourceSlot,
            enabled: true,
            source: { duration_frames: duration, fps_num: Number(directorState.fps || this.state.timeline.fps_num || 24), fps_den: 1 },
            trim: { in_frame: 0, out_frame: duration - 1 },
            retime: { enabled: false, mode: "absolute_speed", interpolation: "blend", curve: { keys: [{ frame: 0, value: 1, interpolation: "constant" }] } },
            timeline: { start_frame: 0, duration_frames: duration, end_frame: duration - 1 },
            prompt: "",
            description: "",
            tags: [],
          };
          this.state.shot_order.push(id);
          changed = true;
        });
        continue;
      }
      if (/^shot\d+$/.test(name)) {
        connectedShotSlots.add(name);
        const origin = inputOriginNode(this.node, input, inputIndex);
        this.syncMediaPreview(name, upstreamPreviewDescriptor(origin, this.api));
        const existing = Object.values(this.state.shots).find((shot) => shot.source_slot === name);
        if (existing) continue;
        const slotNumber = name.slice(4);
        const preferredId = `shot_${slotNumber.padStart(3, "0")}`;
        const id = this.state.shots[preferredId] ? generateStableId("shot") : preferredId;
        this.state.shots[id] = {
          id,
          name: `Shot ${slotNumber.padStart(3, "0")}`,
          source_slot: name,
          enabled: true,
          source: { duration_frames: 120, fps_num: this.state.timeline.fps_num || 24, fps_den: this.state.timeline.fps_den || 1 },
          trim: { in_frame: 0, out_frame: 119 },
          retime: { enabled: false, mode: "absolute_speed", interpolation: "blend", curve: { keys: [{ frame: 0, value: 1, interpolation: "constant" }] } },
          timeline: { start_frame: 0, duration_frames: 120, end_frame: 119 },
          prompt: "",
          description: "",
          tags: [],
        };
        this.state.shot_order.push(id);
        changed = true;
      } else if (/^audio\d+$/.test(name)) {
        connectedAudioSlots.add(name);
        const existing = Object.values(this.state.audio_tracks).find((track) => track.source_slot === name);
        if (existing) continue;
        const preferredId = `audio_${name.slice(5).padStart(3, "0")}`;
        const id = this.state.audio_tracks[preferredId] ? generateStableId("audio") : preferredId;
        this.state.audio_tracks[id] = {
          id,
          name: `Audio ${name.slice(5).padStart(3, "0")}`,
          source_slot: name,
          enabled: true,
          timeline: { start_frame: 0 },
          trim: { in_seconds: 0, out_seconds: null },
          gain_db: 0,
          pan: 0,
          fade: { in_seconds: 0, out_seconds: 0 },
          linked_shot_id: null,
          audio_retime_mode: "fixed",
          mute: false,
          solo: false,
          split_linked_audio: true,
        };
        changed = true;
      }
    }
    const removedShotIds = [];
    if (pruneDisconnected) {
    for (const [shotId, shot] of Object.entries(this.state.shots || {})) {
      const slot = String(shot?.source_slot || "");
      const managed = /^shot\d+$/.test(slot) || /^collection_shot\d+$/.test(slot);
      if (managed && !connectedShotSlots.has(slot)) removedShotIds.push(shotId);
    }
    for (const shotId of removedShotIds) {
      const slot = this.state.shots[shotId]?.source_slot;
      delete this.state.shots[shotId];
      this.state.shot_order = this.state.shot_order.filter((id) => id !== shotId);
      if (slot) this.removeMediaPreview(slot);
      if (this.state.selected_clip_id === shotId) this.state.selected_clip_id = null;
      changed = true;
    }
    for (const [audioId, audio] of Object.entries(this.state.audio_tracks || {})) {
      const slot = String(audio?.source_slot || "");
      if (/^audio\d+$/.test(slot) && !connectedAudioSlots.has(slot)) {
        delete this.state.audio_tracks[audioId];
        if (this.state.selected_audio_id === audioId) this.state.selected_audio_id = null;
        changed = true;
      }
    }
    }
    if (changed) {
      recalculateTimeline(this.state);
      this.syncToWidgets();
      this.render();
    }
  }

  dispose() {
    this.stopPlayback();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.canvas.removeEventListener("pointerdown", this.boundPointerDown);
    this.canvas.removeEventListener("wheel", this.boundWheel);
    window.removeEventListener("pointermove", this.boundPointerMove);
    window.removeEventListener("pointerup", this.boundPointerUp);
    for (const slot of [...this.mediaPreviews.keys()]) this.removeMediaPreview(slot);
  }
}

function attachSequencer(node, api) {
  if (node.__majoorOmniCamSequencer) return;
  const ui = new OmniCamSequencerUI(node, api);
  node.__majoorOmniCamSequencer = ui;

  // Hide the hidden sequence_state text widget from default form
  const stateWidget = node.widgets && node.widgets.find((w) => w.name === "sequence_state");
  if (stateWidget) {
    stateWidget.type = "hidden";
    stateWidget.computeSize = () => [0, -4];
  }

  ui.domWidget = node.addDOMWidget("majoor_omnicam_sequencer", "sequencer", ui.root, {
    serialize: false,
    hideOnZoom: false,
    getMinHeight: () => 460,
    getHeight: () => 560,
    getMaxHeight: () => 900,
    afterResize: () => {
      ui.resizeCanvas();
      ui.render();
    },
  });

  const min = [760, 620];
  const current = node.size || min;
  node.setSize([Math.max(current[0], min[0]), Math.max(current[1], min[1])]);

  const originalRemoved = node.onRemoved;
  node.onRemoved = function () {
    ui.dispose();
    originalRemoved?.apply(this, arguments);
  };

  const originalConnectionsChange = node.onConnectionsChange;
  node.onConnectionsChange = function () {
    originalConnectionsChange?.apply(this, arguments);
    queueMicrotask(() => ui.syncConnectedSlots());
    requestAnimationFrame(() => ui.syncConnectedSlots());
  };
}

export function registerSequencerExtension(app, api = null) {
  app.registerExtension({
    name: EXTENSION_NAME,
    async nodeCreated(node) {
      if (node.comfyClass === NODE_CLASS || node.constructor?.type === NODE_CLASS) {
        attachSequencer(node, api);
      }
    },
    async loadedGraphNode(node) {
      if (node.comfyClass === NODE_CLASS || node.constructor?.type === NODE_CLASS) {
        attachSequencer(node, api);
        queueMicrotask(() => node.__majoorOmniCamSequencer?.syncConnectedSlots());
        requestAnimationFrame(() => node.__majoorOmniCamSequencer?.syncConnectedSlots());
      }
    },
    async afterConfigureGraph() {
      for (const node of app.graph?._nodes || []) {
        node.__majoorOmniCamSequencer?.syncConnectedSlots();
      }
    },
  });
}
