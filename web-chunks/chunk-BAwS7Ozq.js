import { app as bt } from "../../scripts/app.js";
import { api as ye } from "../../scripts/api.js";
import { s as ae, a as se, c as Et, d as De, b as wt, e as ue, f as At, l as $e, n as be, g as ze, h as Q, m as pe, I as fe, D as yt, r as Tt, p as It, t as kt, i as vt, j as Nt, k as St, w as Rt, o as xe, q as Ot, u as Ct, T as B, v as j } from "./chunk-DwC7ND4U.js";
import { s as jt, w as Mt } from "./chunk-CDTKickF.js";
import { H as Dt } from "./chunk-_f2VoZbc.js";
import { e as He, d as Ut } from "./chunk-DnhjDfI_.js";
class Lt {
  constructor({ capture: t, restore: n, limit: r = 100 }) {
    this.capture = t, this.restore = n, this.limit = r, this.undoStack = [], this.redoStack = [], this.restoring = !1, this.transaction = null;
  }
  checkpoint(t = "Edit") {
    if (this.restoring) return;
    if (this.transaction) return this.commitTransaction();
    const n = this.capture();
    this.undoStack.at(-1)?.snapshot !== n && (this.undoStack.push({ label: t, snapshot: n }), this.undoStack.length > this.limit && this.undoStack.shift(), this.redoStack.length = 0);
  }
  beginTransaction(t = "Edit") {
    return this.restoring || this.transaction ? !1 : (this.transaction = { label: t, snapshot: this.capture(), redoStack: this.redoStack.slice() }, !0);
  }
  commitTransaction() {
    const t = this.transaction;
    return t ? (this.transaction = null, t.snapshot === this.capture() ? (this.redoStack = t.redoStack, null) : (this.undoStack.at(-1)?.snapshot !== t.snapshot && this.undoStack.push({ label: t.label, snapshot: t.snapshot }), this.undoStack.length > this.limit && this.undoStack.shift(), this.redoStack.length = 0, t.label)) : null;
  }
  cancelTransaction() {
    const t = this.transaction;
    if (!t) return null;
    this.transaction = null, this.redoStack = t.redoStack, this.restoring = !0;
    try {
      this.restore(t.snapshot);
    } finally {
      this.restoring = !1;
    }
    return t.label;
  }
  undo() {
    if (this.transaction && this.cancelTransaction(), !this.undoStack.length) return null;
    const t = this.undoStack.pop();
    this.redoStack.push({ label: t.label, snapshot: this.capture() }), this.restoring = !0;
    try {
      this.restore(t.snapshot);
    } finally {
      this.restoring = !1;
    }
    return t.label;
  }
  redo() {
    if (this.transaction && this.cancelTransaction(), !this.redoStack.length) return null;
    const t = this.redoStack.pop();
    this.undoStack.push({ label: t.label, snapshot: this.capture() }), this.restoring = !0;
    try {
      this.restore(t.snapshot);
    } finally {
      this.restoring = !1;
    }
    return t.label;
  }
  clear() {
    this.undoStack.length = 0, this.redoStack.length = 0, this.transaction = null;
  }
  get canUndo() {
    return this.undoStack.length > 0;
  }
  get canRedo() {
    return this.redoStack.length > 0;
  }
}
function P(e, t) {
  return e.widgets?.find((n) => n.name === t) ?? null;
}
class Bt extends EventTarget {
  constructor(t, { app: n, api: r } = {}) {
    super(), this.app = n, this.api = r, this.node = t, this.disposed = !1, this.workbench = null, this.pendingUiDirtyMask = 0, this.serializeScheduled = !1, this.serializeFrame = null, this.directorApi = null, this.agentBridge = null, this.workbenchGeneration = 0, this.pendingUpstreamResync = !1, this.stateWidget = P(t, "state_json"), this.recordingWidget = P(t, "recording_path"), this.cardWidget = P(t, "card_asset"), this.widthWidget = P(t, "width"), this.heightWidget = P(t, "height"), this.fpsWidget = P(t, "fps"), this.durationWidget = P(t, "duration_seconds"), this.modeWidget = P(t, "render_mode");
    let a = null;
    try {
      a = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
    }
    this.state = ae(a), this.sceneBaseline = this.stateWidget?.value || JSON.stringify(this.state), this.sceneName = this.state.metadata?.scene_name || "", this.frame = 0, this.camera = se(this.state, 0), this.directorRevision = 0, this.renderRevision = 0, this.previewDataUrl = null, this.previewVideoUrl = null, this.history = new Lt({
      capture: () => this.workbench?.captureHistorySnapshot?.() ?? JSON.stringify({ state: this.state, frame: this.frame }),
      restore: (s) => {
        if (this.workbench) return this.workbench.restoreHistorySnapshot(s);
        const o = JSON.parse(s);
        this.state = ae(o.state), this.frame = Et(o.frame, 0, this.state.duration_frames - 1), this.camera = se(this.state, this.frame);
      }
    });
  }
  /** Small summary for the compact node shell; never a second source of truth. */
  getSnapshot() {
    const t = this.state;
    return {
      sceneName: this.sceneName || t.metadata?.scene_name || "",
      fps: t.fps,
      durationSeconds: t.fps ? t.duration_frames / t.fps : 0,
      width: t.width,
      height: t.height,
      cameraCount: t.cameras?.length ?? 0,
      objectCount: t.objects?.length ?? 0,
      previewDataUrl: this.previewDataUrl,
      isDirty: this.isDirty
    };
  }
  /**
   * True once the serialized state_json widget has drifted from
   * sceneBaseline -- the same "last saved or opened" snapshot scene-library.js
   * already maintains for Reset Scene (New/Open/Save/Reset all refresh it).
   * Widget value lags a live edit by at most one RAF (scheduleSerialize), so
   * this is accurate to within a frame, never a second source of truth.
   */
  get isDirty() {
    return this.stateWidget ? (this.stateWidget.value ?? "") !== (this.sceneBaseline ?? "") : !1;
  }
  /** Immediate, synchronous widget flush -- reuses the existing headless-safe serializer. */
  flushToWidgets({ immediate: t = !1 } = {}) {
    t && (cancelAnimationFrame(this.serializeFrame), this.serializeScheduled = !1), jt(this);
  }
  /** Synchronous immediate flush -- what director-api's `ui.serialize?.()` call expects after a committed transaction. */
  serialize() {
    this.flushToWidgets({ immediate: !0 });
  }
  /** RAF-batched flush; ports the throttling OmniCamDirectorUI already relied on. */
  scheduleSerialize(t = "state") {
    this.serializeScheduled || (this.serializeScheduled = !0, this.serializeFrame = requestAnimationFrame(() => {
      this.serializeScheduled = !1, this.disposed || this.flushToWidgets(), this.dispatchEvent(new CustomEvent("statechange", { detail: { reason: t, revision: this.directorRevision } }));
    }));
  }
  /**
   * The state-only half of state-sync.js's restoreFromWidgets(): re-parses
   * state_json and re-samples the camera, without any of the DOM/asset/
   * history reconciliation that function also does. Used by director/shell.js
   * when a graph configure/reconfigure lands while no workbench is attached;
   * the workbench runs the full DOM-aware restore instead when one is open.
   */
  restoreFromWidgetsHeadless() {
    let t = null;
    try {
      t = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
    }
    this.state = ae(t), this.camera = se(this.state, Math.min(this.frame, this.state.duration_frames - 1)), this.sceneBaseline = this.stateWidget?.value ?? this.sceneBaseline, this.sceneName = this.state.metadata?.scene_name || "", this.dispatchEvent(new CustomEvent("upstreamchange", { detail: { reason: "restore" } }));
  }
  /** Apply a state mutation headlessly, whether or not a workbench is open. */
  mutate(t, { reason: n = "mutation", dirty: r = 0 } = {}) {
    t(this.state), this.scheduleSerialize(n), r && this.requestUiUpdate(r, n);
  }
  replaceState(t, { reason: n = "replace" } = {}) {
    this.state = ae(t), this.sceneName = this.state.metadata?.scene_name || "", this.scheduleSerialize(n), this.dispatchEvent(new CustomEvent("upstreamchange", { detail: { reason: n } }));
  }
  attachWorkbench(t) {
    this.workbench = t, this.dispatchEvent(new CustomEvent("workbenchchange", { detail: { attached: !0 } }));
  }
  detachWorkbench(t) {
    this.workbench === t && (this.workbench = null, this.dispatchEvent(new CustomEvent("workbenchchange", { detail: { attached: !1 } })));
  }
  /** No-op with no open workbench; the next open renders current canonical state from scratch. */
  requestUiUpdate(t, n) {
    this.pendingUiDirtyMask |= t, this.workbench?.requestUiUpdate?.(t, n);
  }
  /**
   * Forwards to the open workbench's undo-history checkpoint when one is
   * attached; a no-op headlessly. director-api transactions call this
   * unconditionally (`ui.checkpoint?.()`) so a committed edit is still one
   * undo step while the workbench is open, exactly as before this migration.
   */
  checkpoint(t) {
    this.workbench?.checkpoint?.(t);
  }
  setStatus(t) {
    this.status = t, this.dispatchEvent(new CustomEvent("statuschange", { detail: { status: t } })), this.workbench?.setStatus?.(t);
  }
  /** Forwards asset/media disposal to the open workbench; a no-op headlessly (deferred until next open). */
  removeObjectResources(t) {
    this.workbench?.removeObjectResources?.(t);
  }
  /** Forwards asset resource reconciliation to the open workbench; a no-op headlessly. */
  async restoreAssets() {
    return this.workbench?.restoreAssets?.();
  }
  dispose() {
    this.disposed || (this.disposed = !0, cancelAnimationFrame(this.serializeFrame), this.workbench = null);
  }
}
const $ = 1, Ke = 50, C = 120, V = 160, Pt = Object.freeze(["perspective", "orthographic"]), _ = Object.freeze({
  ASSET_INSTANTIATE: "asset.instantiate",
  CAMERA_CREATE: "camera.create",
  CAMERA_DUPLICATE: "camera.duplicate",
  CAMERA_DELETE: "camera.delete",
  CAMERA_RENAME: "camera.rename",
  CAMERA_SET_ACTIVE: "camera.set_active",
  CAMERA_SET_LOCKED: "camera.set_locked",
  CAMERA_SET_PLAYBLAST: "camera.set_playblast",
  CAMERA_TRANSFORM: "camera.transform",
  CAMERA_LOOK_AT: "camera.look_at",
  CAMERA_PATH_TRANSFORM_KEYS: "camera.path.transform_keys",
  CAMERA_PATH_INSERT_KEY: "camera.path.insert_key",
  CAMERA_PATH_DELETE_KEYS: "camera.path.delete_keys",
  CAMERA_PATH_REDISTRIBUTE_TIMING: "camera.path.redistribute_timing",
  CAMERA_PATH_APPLY_PRESET: "camera.path.apply_preset",
  OBJECT_CREATE: "object.create",
  OBJECT_DUPLICATE: "object.duplicate",
  OBJECT_DELETE: "object.delete",
  OBJECT_RENAME: "object.rename",
  OBJECT_SET_PARENT: "object.set_parent",
  OBJECT_TRANSFORM: "object.transform",
  OBJECT_SET_ENABLED: "object.set_enabled",
  OBJECT_SET_LOCKED: "object.set_locked",
  OBJECT_SET_TAGS: "object.set_tags",
  OBJECT_SET_ANNOTATION: "object.set_annotation",
  CHARACTER_SET_POSE: "character.set_pose",
  CHARACTER_SET_JOINT_ROTATION: "character.set_joint_rotation",
  CHARACTER_SET_MOTION: "character.set_motion",
  CHARACTER_CLEAR_MOTION: "character.clear_motion",
  KEYFRAME_UPSERT: "keyframe.upsert",
  KEYFRAME_REMOVE: "keyframe.remove",
  KEYFRAME_SET_INTERPOLATION: "keyframe.set_interpolation",
  TIMELINE_SET_RANGE: "timeline.set_range",
  TIMELINE_SET_DURATION: "timeline.set_duration",
  CUT_UPSERT: "cut.upsert",
  CUT_REMOVE: "cut.remove",
  CUT_SET_CAMERA: "cut.set_camera"
}), lt = Object.freeze(Object.values(_)), v = Object.freeze({
  SCENE_GET: "scene.get",
  SCENE_SUMMARY: "scene.summary",
  ASSET_LIST: "asset.list",
  ASSET_GET: "asset.get",
  CAMERA_GET: "camera.get",
  CAMERA_LIST: "camera.list",
  TIMELINE_GET: "timeline.get",
  SELECTION_GET: "selection.get",
  HEALTH_GET: "health.get",
  CHARACTER_GET_RIG: "character.get_rig",
  CHARACTER_GET_POSE: "character.get_pose",
  CHARACTER_LIST: "character.list",
  OBJECT_LIST: "object.list",
  OBJECT_GET: "object.get",
  OBJECT_SEARCH: "object.search",
  SHOT_LIST: "shot.list",
  KEYFRAME_LIST: "keyframe.list"
}), Ft = Object.freeze(Object.values(v));
class u extends Error {
  constructor(t, n, r = null, a = null) {
    super(n), this.name = "DirectorApiError", this.code = t, this.operationIndex = r, this.details = a;
  }
}
const $t = /* @__PURE__ */ new Set(["good", "warning", "bad", "unknown"]);
function zt(e, t) {
  const n = Math.max(0, Math.floor(Number(t) || 0)), r = Array.from({ length: n }, (s, o) => ({ frame: o, state: "unknown", score: null })), a = e?.solve_health_v1;
  if (!a || !Array.isArray(a.frames)) return r;
  for (const s of a.frames) {
    const o = Number(s?.frame);
    if (!Number.isInteger(o) || o < 0 || o >= r.length) continue;
    const i = $t.has(s?.state) ? s.state : "unknown", c = s?.score;
    let h = null;
    if (c != null) {
      const d = Number(c);
      h = Number.isFinite(d) ? Math.max(0, Math.min(1, d)) : null;
    }
    r[o] = { frame: o, state: i, score: h };
  }
  return r;
}
const xt = 25, We = 100;
function J(e, t) {
  const n = e?.offset === void 0 ? 0 : Number(e.offset), r = e?.limit === void 0 ? xt : Number(e.limit);
  if (!Number.isInteger(n) || n < 0)
    throw new u(
      "BAD_QUERY",
      "offset must be a non-negative integer"
    );
  if (!Number.isInteger(r) || r < 1 || r > We)
    throw new u(
      "BAD_QUERY",
      `limit must be between 1 and ${We}`
    );
  return {
    offset: n,
    limit: r,
    end: Math.min(t, n + r)
  };
}
function Ee(e) {
  return {
    id: e.id,
    name: e.name || e.id,
    type: e.type || null,
    asset_id: e.asset_id || null,
    asset_kind: e.asset_kind || null,
    tags: Array.isArray(e.tags) ? [...e.tags] : [],
    enabled: e.enabled !== !1,
    locked: !!e.locked,
    parent_id: e.parent_id || null,
    position: Array.isArray(e.position) ? [...e.position] : [0, 0, 0]
  };
}
function Ht(e) {
  return {
    id: e.id,
    name: e.name || e.id,
    color: e.color || null,
    locked: !!e.locked,
    muted: !!e.muted,
    solo: !!e.solo,
    target_object_id: e.target_object_id || null,
    keyframe_count: Array.isArray(e.keyframes) ? e.keyframes.length : 0
  };
}
function F(e) {
  return typeof structuredClone == "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e));
}
function Kt(e) {
  return Number.isInteger(e.directorRevision) ? Math.max(0, e.directorRevision) : 0;
}
function N(e, t) {
  return {
    ...t,
    revision: Kt(e)
  };
}
function Wt(e, t) {
  const n = e.state || {};
  switch (t?.type) {
    case v.SCENE_GET:
      return N(e, {
        version: 1,
        type: t.type,
        scene: F({
          duration_frames: n.duration_frames,
          fps: n.fps,
          width: n.width,
          height: n.height,
          cameras: n.cameras || [],
          active_camera_id: n.active_camera_id,
          objects: n.objects || [],
          cuts: n.sequence?.cuts || n.cuts || [],
          motion_layers: n.motion_layers || [],
          metadata: n.metadata || {}
        })
      });
    case v.SCENE_SUMMARY: {
      const r = n.objects || [], a = n.sequence?.cuts || n.cuts || [];
      return N(e, {
        version: 1,
        type: t.type,
        summary: {
          duration_frames: n.duration_frames,
          fps: n.fps,
          width: n.width,
          height: n.height,
          camera_count: (n.cameras || []).length,
          object_count: r.length,
          character_count: r.filter((s) => s.asset_kind === "character").length,
          shot_count: a.length,
          motion_layer_count: (n.motion_layers || []).length,
          active_camera_id: n.active_camera_id || null,
          playblast_camera_id: n.playblast_camera_id || null
        }
      });
    }
    case v.CAMERA_GET: {
      const r = t.cameraId || n.active_camera_id, a = (n.cameras || []).find((s) => s.id === r);
      if (!a) throw new u("UNKNOWN_CAMERA", `Unknown camera: ${r}`);
      return N(e, { version: 1, type: t.type, camera: F(a) });
    }
    case v.CAMERA_LIST: {
      const r = n.cameras || [], { offset: a, limit: s, end: o } = J(t, r.length);
      return N(e, {
        version: 1,
        type: t.type,
        items: r.slice(a, o).map(Ht),
        total: r.length,
        offset: a,
        limit: s
      });
    }
    case v.TIMELINE_GET:
      return N(e, {
        version: 1,
        type: t.type,
        timeline: F({
          frame: e.frame ?? 0,
          duration_frames: n.duration_frames,
          fps: n.fps,
          playback_range: Array.isArray(n.playback_range) ? n.playback_range : null
        })
      });
    case v.SELECTION_GET:
      return N(e, {
        version: 1,
        type: t.type,
        selection: {
          entity: e.selectedEntity ?? null,
          objectId: e.selectedObjectId ?? null,
          objectIds: [...e.selectedObjectIds || []],
          keyFrame: e.selectedKeyFrame ?? null
        }
      });
    case v.HEALTH_GET:
      return N(e, {
        version: 1,
        type: t.type,
        frames: zt(n.metadata, n.duration_frames)
      });
    case v.ASSET_LIST: {
      const r = t.kind ? String(t.kind) : null, a = (n.objects || []).filter((s) => s.asset_id && (!r || s.asset_kind === r)).map((s) => ({
        objectId: s.id,
        name: s.name || s.id,
        asset_id: s.asset_id,
        asset_kind: s.asset_kind || null,
        tags: Array.isArray(s.tags) ? [...s.tags] : [],
        position: Array.isArray(s.position) ? [...s.position] : [0, 0, 0],
        is_character: s.asset_kind === "character",
        has_motion: !!s.character?.motion
      }));
      return N(e, { version: 1, type: t.type, items: F(a), total: a.length });
    }
    case v.ASSET_GET: {
      const r = (n.objects || []).find((a) => a.id === t.objectId);
      if (!r) throw new u("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      return N(e, {
        version: 1,
        type: t.type,
        asset: F({
          objectId: r.id,
          name: r.name || r.id,
          type: r.type,
          asset: r.asset || null,
          asset_id: r.asset_id || null,
          asset_kind: r.asset_kind || null,
          tags: Array.isArray(r.tags) ? r.tags : [],
          annotation: r.annotation || null,
          character: r.character || null,
          position: r.position || [0, 0, 0],
          rotation: r.rotation || [0, 0, 0],
          size: r.size || [1, 1, 1]
        })
      });
    }
    case v.CHARACTER_GET_RIG: {
      const r = (n.objects || []).find((s) => s.id === t.objectId);
      if (!r) throw new u("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      const a = r.character || null;
      return N(e, {
        version: 1,
        type: t.type,
        rig: F({
          objectId: r.id,
          asset_id: r.asset_id || null,
          asset_kind: r.asset_kind || null,
          is_character: r.asset_kind === "character",
          rig_profile: a?.rig_profile || null,
          pose_preset: a?.pose?.preset_id || null,
          has_motion: !!a?.motion
        })
      });
    }
    case v.CHARACTER_GET_POSE: {
      const r = (n.objects || []).find((s) => s.id === t.objectId);
      if (!r) throw new u("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      const a = r.character?.pose || {};
      return N(e, {
        version: 1,
        type: t.type,
        pose: F({
          objectId: r.id,
          preset_id: a.preset_id || "neutral",
          root_offset: Array.isArray(a.root_offset) ? a.root_offset : [0, 0, 0],
          joints: a.joints || {},
          has_motion: !!r.character?.motion
        })
      });
    }
    case v.OBJECT_LIST: {
      const r = n.objects || [], { offset: a, limit: s, end: o } = J(t, r.length);
      return N(e, {
        version: 1,
        type: t.type,
        items: r.slice(a, o).map(Ee),
        total: r.length,
        offset: a,
        limit: s
      });
    }
    case v.OBJECT_GET: {
      const r = (n.objects || []).find((a) => a.id === t.objectId);
      if (!r) throw new u("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      return N(e, {
        version: 1,
        type: t.type,
        object: F({
          id: r.id,
          name: r.name || r.id,
          type: r.type,
          asset: r.asset || null,
          asset_id: r.asset_id || null,
          asset_kind: r.asset_kind || null,
          tags: Array.isArray(r.tags) ? r.tags : [],
          enabled: r.enabled !== !1,
          locked: !!r.locked,
          parent_id: r.parent_id || null,
          annotation: r.annotation || null,
          character: r.character || null,
          position: r.position || [0, 0, 0],
          rotation: r.rotation || [0, 0, 0],
          size: r.size || [1, 1, 1]
        })
      });
    }
    case v.OBJECT_SEARCH: {
      const r = String(t.text || "").trim().toLowerCase(), a = Array.isArray(t.tags) ? t.tags.map((g) => String(g).toLowerCase()) : [], s = t.asset_kind !== void 0 ? t.asset_kind : null, o = t.type_ !== void 0 ? t.type_ : t.objectType !== void 0 ? t.objectType : null, i = typeof t.enabled == "boolean" ? t.enabled : null, c = (g) => {
        if (r && ![g.id, g.name || "", ...Array.isArray(g.tags) ? g.tags : []].map((b) => String(b).toLowerCase()).some((b) => b.includes(r)))
          return !1;
        if (a.length) {
          const w = (Array.isArray(g.tags) ? g.tags : []).map((b) => String(b).toLowerCase());
          if (!a.every((b) => w.includes(b))) return !1;
        }
        return !(s !== null && g.asset_kind !== s || o !== null && g.type !== o || i !== null && g.enabled !== !1 !== i);
      }, h = (n.objects || []).filter(c), { offset: d, limit: l, end: m } = J(t, h.length);
      return N(e, {
        version: 1,
        type: t.type,
        items: h.slice(d, m).map(Ee),
        total: h.length,
        offset: d,
        limit: l
      });
    }
    case v.CHARACTER_LIST: {
      const r = (n.objects || []).filter((i) => i.asset_kind === "character"), { offset: a, limit: s, end: o } = J(t, r.length);
      return N(e, {
        version: 1,
        type: t.type,
        items: r.slice(a, o).map((i) => ({
          ...Ee(i),
          has_motion: !!i.character?.motion,
          pose_preset: i.character?.pose?.preset_id || null
        })),
        total: r.length,
        offset: a,
        limit: s
      });
    }
    case v.SHOT_LIST: {
      const r = n.sequence?.cuts || n.cuts || [], a = Math.max(0, (n.duration_frames || 1) - 1), s = r.map((h, d) => ({
        index: d,
        start: h.start,
        end: d + 1 < r.length ? r[d + 1].start - 1 : a,
        camera_id: h.camera_id
      })), { offset: o, limit: i, end: c } = J(t, s.length);
      return N(e, {
        version: 1,
        type: t.type,
        items: s.slice(o, c),
        total: s.length,
        offset: o,
        limit: i
      });
    }
    case v.KEYFRAME_LIST: {
      const r = t.cameraId || n.active_camera_id, a = (n.cameras || []).find((h) => h.id === r);
      if (!a) throw new u("UNKNOWN_CAMERA", `Unknown camera: ${r}`);
      const s = a.keyframes || [], { offset: o, limit: i, end: c } = J(t, s.length);
      return N(e, {
        version: 1,
        type: t.type,
        cameraId: a.id,
        items: s.slice(o, c).map((h) => ({
          frame: h.frame,
          interpolation: h.interpolation,
          position: Array.isArray(h.camera?.position) ? [...h.camera.position] : [0, 0, 0]
        })),
        total: s.length,
        offset: o,
        limit: i
      });
    }
    default:
      throw new u("UNKNOWN_QUERY", `Unsupported query: ${t?.type}`);
  }
}
const dt = /* @__PURE__ */ new Set([
  "cube",
  "sphere",
  "cylinder",
  "torus",
  "pyramid",
  "ground",
  "human",
  "card",
  "null",
  "sun_light",
  "point_light",
  "spot_light"
]);
function ge(e, t, n = "") {
  const r = String(n || "").trim().replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 120);
  if (r) {
    if (e.has(r))
      throw new u("DUPLICATE_ID", `${r} already exists`);
    return r;
  }
  let a = 1, s = `${t}_${a}`;
  for (; e.has(s); )
    a += 1, s = `${t}_${a}`;
  return s;
}
function Vt(e) {
  const t = e === "ground", n = e === "human", r = e === "card", a = e === "sun_light", s = e === "point_light", o = e === "spot_light";
  let i;
  t ? i = [12, 0.1, 12] : n ? i = [0.7, 1.8, 0.4] : r ? i = [2, 3] : i = [1.5, 1.5, 1.5];
  let c = [0, 0, 0], h = [0, 0, 0], d = "#8c929b", l, m, g, w;
  return a ? (c = [5, 8.5, 4], h = [-55, 35, 0], d = "#fff6ec", l = 2.2, m = !0) : s ? (c = [0, 3, 0], d = "#ffffff", l = 2, m = !1) : o && (c = [0, 4, 0], h = [-60, 0, 0], d = "#ffffff", l = 3, g = 45, w = 0.25, m = !0), {
    position: c,
    rotation: h,
    size: i,
    color: d,
    material_mode: t ? "checker" : "textured",
    ...l !== void 0 ? { intensity: l } : {},
    ...m !== void 0 ? { cast_shadow: m } : {},
    ...g !== void 0 ? { cone_angle: g } : {},
    ...w !== void 0 ? { penumbra: w } : {}
  };
}
function Jt(e, t) {
  e.cameras ||= [];
  const n = new Set(e.cameras.map((o) => o.id)), r = ge(n, "camera", t.id), a = { ...wt(), ...t.camera || {} }, s = {
    id: r,
    name: t.name || r,
    color: "#4aa3ef",
    locked: !1,
    muted: !1,
    solo: !1,
    camera: a,
    keyframes: [{ frame: 0, camera: ue(a), interpolation: t.interpolation || "ease" }]
  };
  return e.cameras.push(s), { cameraId: r };
}
function Gt(e, t) {
  const n = (e.cameras || []).find((o) => o.id === t.cameraId);
  if (!n) throw new u("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  const r = new Set(e.cameras.map((o) => o.id)), a = ge(r, "camera", t.id), s = JSON.parse(JSON.stringify(n));
  return s.id = a, s.name = t.name || `${n.name || n.id} copy`, e.cameras.push(s), { cameraId: a };
}
function Yt(e, t) {
  const n = e.cameras || [], r = n.findIndex((s) => s.id === t.cameraId);
  if (r === -1) throw new u("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  if (n.length <= 1) throw new u("LAST_CAMERA", "cannot delete the only camera");
  if (n[r].locked) throw new u("ENTITY_LOCKED", `${t.cameraId} is locked`);
  if ((e.sequence?.cuts || []).some((s) => s.camera_id === t.cameraId))
    throw new u("CAMERA_IN_USE", `${t.cameraId} is referenced by a cut`);
  return n.splice(r, 1), e.active_camera_id === t.cameraId && (e.active_camera_id = n[0].id), e.playblast_camera_id === t.cameraId && (e.playblast_camera_id = n[0].id), { cameraId: t.cameraId };
}
function qt(e, t) {
  const n = (e.cameras || []).find((r) => r.id === t.cameraId);
  if (!n) throw new u("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  return n.name = String(t.name || "").trim().slice(0, 80) || n.name, { cameraId: n.id };
}
function Qt(e, t) {
  const n = "__sequence__";
  if (t.cameraId === n) {
    if (!(e.sequence?.cuts || []).length)
      throw new u("NO_CUTS", "the sequence has no cuts to play back");
    return e.playblast_camera_id = n, { cameraId: n };
  }
  const r = (e.cameras || []).find((a) => a.id === t.cameraId);
  if (!r) throw new u("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  return e.playblast_camera_id = r.id, { cameraId: r.id };
}
function Xt(e, t) {
  if (!dt.has(t.objectType))
    throw new u("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${t.objectType}`);
  e.objects ||= [];
  const n = new Set(e.objects.map((o) => o.id)), r = ge(n, t.objectType, t.id), a = Vt(t.objectType), s = {
    id: r,
    type: t.objectType,
    name: t.name || r,
    ...a,
    ...t.position ? { position: [...t.position] } : {},
    ...t.rotation ? { rotation: [...t.rotation] } : {},
    keyframes: [],
    enabled: !0,
    locked: !1
  };
  return e.objects.push(s), { objectId: r };
}
function Zt(e, t) {
  const n = (e.objects || []).find((c) => c.id === t.objectId);
  if (!n) throw new u("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  const r = new Set(e.objects.map((c) => c.id)), a = ge(r, n.type || "object", t.id), s = Array.isArray(t.offset) ? t.offset : [0.35, 0, 0.35], o = JSON.parse(JSON.stringify(n));
  o.id = a, o.name = t.name || `${n.name || n.id} copy`, o.locked = !1;
  const i = Array.isArray(n.position) ? n.position : [0, 0, 0];
  return o.position = [i[0] + s[0], i[1] + s[1], i[2] + s[2]], e.objects.push(o), { objectId: a, resourceRefresh: !!n.asset_id };
}
function en(e, t) {
  const n = e.objects || [], r = n.findIndex((s) => s.id === t.objectId);
  if (r === -1) throw new u("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  const a = n[r];
  if (a.id === "subject") throw new u("PROTECTED_OBJECT", "the subject object cannot be deleted");
  if (a.locked) throw new u("ENTITY_LOCKED", `${t.objectId} is locked`);
  for (const s of n)
    s.parent_id === t.objectId && (s.parent_id = null);
  return n.splice(r, 1), { objectId: t.objectId, resourceRefresh: !!a.asset_id };
}
function tn(e, t) {
  const n = (e.objects || []).find((r) => r.id === t.objectId);
  if (!n) throw new u("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  return n.name = String(t.name || "").trim().slice(0, 80) || n.name, { objectId: n.id };
}
function nn(e, t) {
  const n = (e.objects || []).find((i) => i.id === t.objectId);
  if (!n) throw new u("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  if (t.parentId === null || t.parentId === void 0)
    return n.parent_id = null, { objectId: n.id };
  if (t.parentId === t.objectId)
    throw new u("INVALID_PARENT", "an object cannot be its own parent");
  const r = (e.objects || []).find((i) => i.id === t.parentId);
  if (!r) throw new u("UNKNOWN_OBJECT", `${t.parentId} does not exist`);
  const a = new Map(e.objects.map((i) => [i.id, i]));
  let s = r;
  const o = /* @__PURE__ */ new Set();
  for (; s; ) {
    if (s.id === t.objectId)
      throw new u("INVALID_PARENT", "assigning this parent would create a cycle");
    if (o.has(s.id)) break;
    o.add(s.id), s = s.parent_id ? a.get(s.parent_id) : null;
  }
  return n.parent_id = t.parentId, { objectId: n.id };
}
function rn(e, t) {
  e.sequence ||= De();
  const n = e.sequence.cuts ||= [], r = Math.max(0, (e.duration_frames || 1) - 1);
  if (!Number.isInteger(t.start) || t.start < 0 || t.start > r)
    throw new u("FRAME_OUT_OF_RANGE", `cut start must be within 0..${r}`);
  if (!(e.cameras || []).find((o) => o.id === t.cameraId)) throw new u("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  const s = n.find((o) => o.start === t.start);
  return s ? s.camera_id = t.cameraId : n.push({ start: t.start, camera_id: t.cameraId }), n.sort((o, i) => o.start - i.start), e.sequence.enabled = !0, { start: t.start, cameraId: t.cameraId };
}
function an(e, t) {
  e.sequence ||= De();
  const n = e.sequence.cuts || [], r = n.findIndex((a) => a.start === t.start);
  if (r === -1) throw new u("UNKNOWN_CUT", `no cut starts at frame ${t.start}`);
  return n.splice(r, 1), n.length && (n[0].start = 0), e.sequence.enabled = n.length > 0, { start: t.start };
}
function sn(e, t) {
  e.sequence ||= De();
  const r = (e.sequence.cuts || []).find((s) => s.start === t.start);
  if (!r) throw new u("UNKNOWN_CUT", `no cut starts at frame ${t.start}`);
  if (!(e.cameras || []).find((s) => s.id === t.cameraId)) throw new u("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  return r.camera_id = t.cameraId, { start: t.start, cameraId: t.cameraId };
}
const Ue = [0, 1, 0], Te = [
  "static",
  "dolly_in",
  "dolly_out",
  "truck_left",
  "truck_right",
  "pedestal_up",
  "pedestal_down",
  "crane_up",
  "crane_down",
  "arc_left",
  "arc_right",
  "orbit",
  "spiral"
], Nr = {
  static: "Static",
  dolly_in: "Dolly In",
  dolly_out: "Dolly Out",
  truck_left: "Truck Left",
  truck_right: "Truck Right",
  pedestal_up: "Pedestal Up",
  pedestal_down: "Pedestal Down",
  crane_up: "Crane Up",
  crane_down: "Crane Down",
  arc_left: "Arc Left",
  arc_right: "Arc Right",
  orbit: "Orbit",
  spiral: "Spiral"
};
function on(e, t) {
  const n = [...e.position], r = Array.isArray(t) ? [...t] : [...e.target], a = At(r, n), s = $e(a) > 1e-9 ? be(a) : [0, 0, -1];
  let o = ze(s, Ue);
  $e(o) < 1e-6 && (o = [1, 0, 0]), o = be(o);
  const i = be(ze(o, s));
  return { position: n, target: r, forward: s, right: o, up: i };
}
function cn(e) {
  return {
    fov: e.fov,
    roll: e.roll || 0,
    zoom: e.zoom || 1,
    near: e.near,
    far: e.far,
    camera_type: e.camera_type || "perspective"
  };
}
function ln(e) {
  return [
    { position: e.position, target: e.target },
    { position: e.position, target: e.target }
  ];
}
function Ve(e, t, n) {
  const r = n === "out" ? -1 : 1, a = Q(e.position, pe(e.forward, r * t));
  return [
    { position: e.position, target: e.target },
    { position: a, target: e.target }
  ];
}
function Je(e, t, n) {
  const r = n === "right" ? 1 : -1, a = pe(e.right, r * t);
  return [
    { position: e.position, target: e.target },
    { position: Q(e.position, a), target: Q(e.target, a) }
  ];
}
function Ge(e, t, n) {
  const a = pe(Ue, (n === "down" ? -1 : 1) * t);
  return [
    { position: e.position, target: e.target },
    { position: Q(e.position, a), target: Q(e.target, a) }
  ];
}
function Ye(e, t, n) {
  const r = n === "down" ? -1 : 1, a = Q(e.position, pe(Ue, r * t));
  return [
    { position: e.position, target: e.target },
    { position: a, target: e.target }
  ];
}
function oe(e, { degrees: t = 180, direction: n = "cw", radius: r, radiusEnd: a, heightOffset: s = 0, samples: o = 5, close: i = !1 } = {}) {
  const c = e.target, h = e.position[0] - c[0], d = e.position[2] - c[2], l = Math.hypot(h, d) || 1e-6, m = Math.atan2(d, h), g = Number.isFinite(r) ? r : l, w = Number.isFinite(a) ? a : g, b = n === "ccw" ? 1 : -1, y = Math.abs(t) * Math.PI / 180 * b, p = Math.max(2, Math.round(o)), x = e.position[1] + s, T = [];
  for (let A = 0; A < p; A += 1) {
    const k = i ? A / p : A / (p - 1), O = m + y * k, M = g + (w - g) * k;
    T.push({
      position: [c[0] + Math.cos(O) * M, x, c[2] + Math.sin(O) * M],
      target: [...c]
    });
  }
  return T;
}
function dn({ type: e, camera: t, target: n, startFrame: r, endFrame: a, params: s = {} } = {}) {
  if (!Te.includes(e)) return { ok: !1, reason: "unknown_preset" };
  if (!t || !Array.isArray(t.position) || !Array.isArray(t.target)) return { ok: !1, reason: "invalid_camera" };
  const o = Math.round(Number(r)), i = Math.round(Number(a));
  if (!Number.isFinite(o) || !Number.isFinite(i) || i <= o) return { ok: !1, reason: "invalid_range" };
  const c = on(t, n), h = Number(s.distance) > 0 ? Number(s.distance) : 1, d = (b, y, p) => ({
    degrees: Number(s.degrees) || b,
    direction: y,
    radius: Number.isFinite(Number(s.radius)) ? Number(s.radius) : void 0,
    heightOffset: Number(s.heightOffset) || 0,
    samples: Number(s.samples) || p
  });
  let l;
  switch (e) {
    case "static":
      l = ln(c);
      break;
    case "dolly_in":
      l = Ve(c, h, "in");
      break;
    case "dolly_out":
      l = Ve(c, h, "out");
      break;
    case "truck_left":
      l = Je(c, h, "left");
      break;
    case "truck_right":
      l = Je(c, h, "right");
      break;
    case "pedestal_up":
      l = Ge(c, h, "up");
      break;
    case "pedestal_down":
      l = Ge(c, h, "down");
      break;
    case "crane_up":
      l = Ye(c, h, "up");
      break;
    case "crane_down":
      l = Ye(c, h, "down");
      break;
    case "arc_left":
      l = oe(c, d(45, "ccw", 5));
      break;
    case "arc_right":
      l = oe(c, d(45, "cw", 5));
      break;
    case "orbit":
      l = oe(c, { ...d(180, s.direction === "ccw" ? "ccw" : "cw", 5), close: !!s.close });
      break;
    case "spiral":
      l = oe(c, {
        ...d(360, s.direction === "ccw" ? "ccw" : "cw", 8),
        radiusEnd: Number.isFinite(Number(s.radiusEnd)) ? Number(s.radiusEnd) : void 0
      });
      break;
    default:
      return { ok: !1, reason: "unknown_preset" };
  }
  if (i - o + 1 < l.length) return { ok: !1, reason: "insufficient_frame_slots" };
  const m = l.map((b, y) => l.length <= 1 ? o : Math.round(o + (i - o) * y / (l.length - 1)));
  for (let b = 1; b < m.length; b += 1) m[b] <= m[b - 1] && (m[b] = m[b - 1] + 1);
  for (let b = m.length - 1; b > 0; b -= 1) m[b] > i - (m.length - 1 - b) && (m[b] = i - (m.length - 1 - b));
  m[0] = o, m[m.length - 1] = i;
  const g = cn(t);
  return { ok: !0, keyframes: l.map((b, y) => ({
    frame: m[y],
    interpolation: "smooth",
    camera: { position: b.position, target: b.target, ...g }
  })) };
}
const fn = 2048;
function un(e, t) {
  const n = e._directorApiTxIds ||= /* @__PURE__ */ new Set();
  for (n.has(t) && n.delete(t), n.add(t); n.size > fn; )
    n.delete(n.values().next().value);
}
function mn(e, t) {
  return !!e._directorApiTxIds?.has(t);
}
const K = (e) => typeof e == "number" && Number.isFinite(e);
function I(e, t, n) {
  if (!Array.isArray(e) || e.length !== 3 || !e.every(K))
    throw new u("BAD_VECTOR", `${t} must be [x,y,z] of finite numbers`, n);
}
function S(e, t, n) {
  if (!Number.isInteger(e) || e < 0)
    throw new u("BAD_FRAME", `${t} must be a non-negative integer frame`, n);
}
function E(e, t, n, r) {
  if (typeof e != "string" || e.length === 0)
    throw new u("BAD_ID", `${t} must be a non-empty string`, n);
  if (r !== void 0 && e.length > r)
    throw new u("BAD_ID", `${t} exceeds ${r} characters`, n);
}
function Y(e, t, n) {
  if (!K(e))
    throw new u("BAD_VALUE", `${t} must be a finite number`, n);
}
function qe(e, t, n) {
  if (!Array.isArray(e) || e.length === 0 || !e.every((r) => Number.isInteger(r) && r >= 0))
    throw new u("BAD_VALUE", `${t} must be a non-empty array of non-negative integer frames`, n);
}
const hn = /* @__PURE__ */ new Set(["translate", "rotate", "scale"]), _n = /* @__PURE__ */ new Set([
  "position",
  "target",
  "up",
  "fov",
  "roll",
  "zoom",
  "near",
  "far",
  "camera_type"
]);
function pn(e, t) {
  for (const n of Object.keys(e))
    if (!_n.has(n))
      throw new u("BAD_VALUE", `camera.create: unsupported camera field "${n}"`, t);
  if (e.position !== void 0 && I(e.position, "camera.position", t), e.target !== void 0 && I(e.target, "camera.target", t), e.up !== void 0 && I(e.up, "camera.up", t), e.fov !== void 0 && (Y(e.fov, "camera.fov", t), e.fov < 1 || e.fov > 179))
    throw new u("BAD_VALUE", "camera.fov must be within 1..179", t);
  if (e.roll !== void 0 && Y(e.roll, "camera.roll", t), e.zoom !== void 0 && (Y(e.zoom, "camera.zoom", t), e.zoom <= 0))
    throw new u("BAD_VALUE", "camera.zoom must be > 0", t);
  if (e.near !== void 0 && (Y(e.near, "camera.near", t), e.near <= 0))
    throw new u("BAD_VALUE", "camera.near must be > 0", t);
  if (e.far !== void 0) {
    Y(e.far, "camera.far", t);
    const n = e.near === void 0 ? yt : e.near;
    if (e.far <= n)
      throw new u("BAD_VALUE", "camera.far must be greater than camera.near", t);
  }
  if (e.camera_type !== void 0 && !Pt.includes(e.camera_type))
    throw new u("BAD_VALUE", `Unsupported camera_type: ${e.camera_type}`, t);
}
function gn(e, t) {
  if (!e || typeof e != "object" || Array.isArray(e))
    throw new u("BAD_OPERATION", "operation must be an object", t);
  const { type: n } = e;
  if (!lt.includes(n))
    throw new u("UNKNOWN_OPERATION", `Unknown operation type: ${n}`, t);
  switch (n) {
    case _.ASSET_INSTANTIATE: {
      const r = e.asset;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new u("BAD_VALUE", "asset.instantiate needs a resolved asset object", t);
      if (E(r.id, "asset.id", t), E(r.kind, "asset.kind", t), String(r.id).length > 120 || String(r.kind).length > 32)
        throw new u("BAD_VALUE", "asset.id / asset.kind exceed their bounds", t);
      if (r.tags !== void 0 && (!Array.isArray(r.tags) || r.tags.length > 32))
        throw new u("BAD_VALUE", "asset.tags must be a list of at most 32", t);
      if (r.animations !== void 0 && (!Array.isArray(r.animations) || r.animations.length > 256))
        throw new u("BAD_VALUE", "asset.animations must be a list of at most 256", t);
      if (r.rig !== void 0 && r.rig !== null) {
        if (typeof r.rig != "object" || Array.isArray(r.rig))
          throw new u("BAD_VALUE", "asset.rig must be an object", t);
        if (r.rig.bone_map && Object.keys(r.rig.bone_map).length > 128)
          throw new u("BAD_VALUE", "asset.rig.bone_map exceeds 128 entries", t);
      }
      e.point !== void 0 && I(e.point, "point", t), e.id !== void 0 && E(e.id, "id", t);
      break;
    }
    case _.CAMERA_SET_ACTIVE:
      E(e.cameraId, "cameraId", t);
      break;
    case _.CAMERA_SET_LOCKED:
      if (E(e.cameraId, "cameraId", t), typeof e.value != "boolean")
        throw new u("BAD_VALUE", "camera.set_locked needs a boolean value", t);
      break;
    case _.CAMERA_CREATE:
      if (e.id !== void 0 && E(e.id, "id", t, C), e.name !== void 0 && E(e.name, "name", t, V), e.camera !== void 0) {
        if (typeof e.camera != "object" || Array.isArray(e.camera) || e.camera === null)
          throw new u("BAD_VALUE", "camera.create camera must be an object", t);
        pn(e.camera, t);
      }
      if (e.interpolation !== void 0 && !fe.includes(e.interpolation))
        throw new u("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      break;
    case _.CAMERA_DUPLICATE:
      E(e.cameraId, "cameraId", t, C), e.id !== void 0 && E(e.id, "id", t, C), e.name !== void 0 && E(e.name, "name", t, V);
      break;
    case _.CAMERA_DELETE:
    case _.CAMERA_SET_PLAYBLAST:
      E(e.cameraId, "cameraId", t, C);
      break;
    case _.CAMERA_RENAME:
      E(e.cameraId, "cameraId", t, C), E(e.name, "name", t, V);
      break;
    case _.OBJECT_CREATE:
      if (E(e.objectType, "objectType", t), !dt.has(e.objectType))
        throw new u("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${e.objectType}`, t);
      if (e.asset !== void 0 || e.url !== void 0 || e.path !== void 0)
        throw new u("BAD_VALUE", "object.create does not accept asset/url/path -- use asset.instantiate", t);
      e.id !== void 0 && E(e.id, "id", t, C), e.name !== void 0 && E(e.name, "name", t, V), e.position !== void 0 && I(e.position, "position", t), e.rotation !== void 0 && I(e.rotation, "rotation", t);
      break;
    case _.OBJECT_DUPLICATE:
      E(e.objectId, "objectId", t, C), e.id !== void 0 && E(e.id, "id", t, C), e.name !== void 0 && E(e.name, "name", t, V), e.offset !== void 0 && I(e.offset, "offset", t);
      break;
    case _.OBJECT_DELETE:
      E(e.objectId, "objectId", t, C);
      break;
    case _.OBJECT_RENAME:
      E(e.objectId, "objectId", t, C), E(e.name, "name", t, V);
      break;
    case _.OBJECT_SET_PARENT:
      E(e.objectId, "objectId", t, C), e.parentId !== null && e.parentId !== void 0 && E(e.parentId, "parentId", t, C);
      break;
    case _.CAMERA_TRANSFORM:
      if (e.cameraId !== void 0 && E(e.cameraId, "cameraId", t), e.position !== void 0 && I(e.position, "position", t), e.target !== void 0 && I(e.target, "target", t), e.frame !== void 0 && S(e.frame, "frame", t), e.position === void 0 && e.target === void 0)
        throw new u("EMPTY_OPERATION", "camera.transform needs position and/or target", t);
      break;
    case _.CAMERA_LOOK_AT:
      if (e.cameraId !== void 0 && E(e.cameraId, "cameraId", t), e.point !== void 0 && I(e.point, "point", t), e.objectId !== void 0 && e.objectId !== null && E(e.objectId, "objectId", t), e.point === void 0 && e.objectId === void 0)
        throw new u("EMPTY_OPERATION", "camera.look_at needs a point or an objectId", t);
      break;
    case _.OBJECT_TRANSFORM:
      if (E(e.objectId, "objectId", t), e.position !== void 0 && I(e.position, "position", t), e.rotation !== void 0 && I(e.rotation, "rotation", t), e.scale !== void 0 && I(e.scale, "scale", t), e.position === void 0 && e.rotation === void 0 && e.scale === void 0)
        throw new u("EMPTY_OPERATION", "object.transform needs position, rotation and/or scale", t);
      break;
    case _.OBJECT_SET_ENABLED:
    case _.OBJECT_SET_LOCKED:
      if (E(e.objectId, "objectId", t), typeof e.value != "boolean")
        throw new u("BAD_VALUE", `${n} needs a boolean value`, t);
      break;
    case _.OBJECT_SET_TAGS:
      if (E(e.objectId, "objectId", t), !Array.isArray(e.tags) || e.tags.some((r) => typeof r != "string"))
        throw new u("BAD_VALUE", "object.set_tags needs a string array", t);
      if (e.tags.length > 64)
        throw new u("BAD_VALUE", "object.set_tags: too many tags", t);
      break;
    case _.OBJECT_SET_ANNOTATION:
      if (E(e.objectId, "objectId", t), e.annotation !== null && (typeof e.annotation != "object" || Array.isArray(e.annotation)))
        throw new u("BAD_VALUE", "object.set_annotation needs an object or null", t);
      break;
    case _.CHARACTER_SET_POSE:
      if (E(e.objectId, "objectId", t), e.pose !== null && (typeof e.pose != "object" || Array.isArray(e.pose)))
        throw new u("BAD_VALUE", "character.set_pose needs a pose object or null", t);
      break;
    case _.CHARACTER_SET_JOINT_ROTATION:
      if (E(e.objectId, "objectId", t), E(e.joint, "joint", t), !Array.isArray(e.rotation) || e.rotation.length !== 4 || !e.rotation.every(K))
        throw new u("BAD_QUATERNION", "rotation must be [x,y,z,w] of finite numbers", t);
      break;
    case _.CHARACTER_SET_MOTION: {
      E(e.objectId, "objectId", t);
      const r = e.motion;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new u("BAD_VALUE", "character.set_motion needs a motion object", t);
      E(r.clip_id, "motion.clip_id", t);
      for (const a of ["start_frame", "end_frame", "speed", "offset_seconds"])
        if (r[a] !== void 0 && !K(r[a]))
          throw new u("BAD_VALUE", `motion.${a} must be a finite number`, t);
      if (K(r.start_frame) && K(r.end_frame) && r.end_frame > 0 && r.end_frame <= r.start_frame)
        throw new u("BAD_MOTION_RANGE", "motion end_frame is not after start_frame", t);
      break;
    }
    case _.CHARACTER_CLEAR_MOTION:
      E(e.objectId, "objectId", t);
      break;
    case _.KEYFRAME_UPSERT:
      if (e.cameraId !== void 0 && E(e.cameraId, "cameraId", t), S(e.frame, "frame", t), e.interpolation !== void 0 && !fe.includes(e.interpolation))
        throw new u("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      if (e.camera !== void 0) {
        if (!e.camera || typeof e.camera != "object")
          throw new u("BAD_VALUE", "keyframe.upsert camera must be an object", t);
        e.camera.position !== void 0 && I(e.camera.position, "camera.position", t), e.camera.target !== void 0 && I(e.camera.target, "camera.target", t);
        for (const r of ["fov", "roll", "zoom", "near", "far"])
          if (e.camera[r] !== void 0 && !K(e.camera[r]))
            throw new u("BAD_VALUE", `camera.${r} must be finite`, t);
      }
      break;
    case _.KEYFRAME_REMOVE:
      e.cameraId !== void 0 && E(e.cameraId, "cameraId", t), S(e.frame, "frame", t);
      break;
    case _.KEYFRAME_SET_INTERPOLATION:
      if (e.cameraId !== void 0 && E(e.cameraId, "cameraId", t), S(e.frame, "frame", t), !fe.includes(e.interpolation))
        throw new u("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      break;
    case _.TIMELINE_SET_RANGE:
      if (S(e.start, "start", t), S(e.end, "end", t), e.end < e.start)
        throw new u("BAD_RANGE", "range end is before start", t);
      break;
    case _.TIMELINE_SET_DURATION:
      if (!Number.isInteger(e.frames) || e.frames < 1)
        throw new u("BAD_VALUE", "timeline.set_duration needs frames >= 1", t);
      break;
    case _.CUT_UPSERT:
      S(e.start, "start", t), E(e.cameraId, "cameraId", t);
      break;
    case _.CUT_REMOVE:
      S(e.start, "start", t);
      break;
    case _.CUT_SET_CAMERA:
      S(e.start, "start", t), E(e.cameraId, "cameraId", t);
      break;
    case _.CAMERA_PATH_TRANSFORM_KEYS: {
      e.cameraId !== void 0 && E(e.cameraId, "cameraId", t), qe(e.frames, "frames", t);
      const r = e.transform;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new u("BAD_VALUE", "camera.path.transform_keys needs a transform object", t);
      if (!hn.has(r.mode))
        throw new u("BAD_VALUE", "transform.mode must be translate, rotate or scale", t);
      r.mode === "translate" ? I(r.delta, "transform.delta", t) : r.mode === "scale" ? I(r.factors, "transform.factors", t) : I(r.rotationDeg, "transform.rotationDeg", t), r.origin !== void 0 && I(r.origin, "transform.origin", t);
      break;
    }
    case _.CAMERA_PATH_INSERT_KEY:
      e.cameraId !== void 0 && E(e.cameraId, "cameraId", t), S(e.leftFrame, "leftFrame", t), S(e.rightFrame, "rightFrame", t), e.t !== void 0 && Y(e.t, "t", t);
      break;
    case _.CAMERA_PATH_DELETE_KEYS:
      e.cameraId !== void 0 && E(e.cameraId, "cameraId", t), qe(e.frames, "frames", t);
      break;
    case _.CAMERA_PATH_REDISTRIBUTE_TIMING:
      e.cameraId !== void 0 && E(e.cameraId, "cameraId", t), e.startFrame !== void 0 && S(e.startFrame, "startFrame", t), e.endFrame !== void 0 && S(e.endFrame, "endFrame", t);
      break;
    case _.CAMERA_PATH_APPLY_PRESET:
      if (e.cameraId !== void 0 && E(e.cameraId, "cameraId", t), !Te.includes(e.presetType))
        throw new u("BAD_VALUE", `presetType must be one of: ${Te.join(", ")}`, t);
      if (S(e.startFrame, "startFrame", t), S(e.endFrame, "endFrame", t), e.endFrame <= e.startFrame)
        throw new u("BAD_RANGE", "camera.path.apply_preset endFrame must be after startFrame", t);
      if (e.target !== void 0 && I(e.target, "target", t), e.params !== void 0 && (typeof e.params != "object" || Array.isArray(e.params)))
        throw new u("BAD_VALUE", "camera.path.apply_preset params must be an object", t);
      break;
    default:
      throw new u("UNKNOWN_OPERATION", `Unknown operation type: ${n}`, t);
  }
}
function bn(e, t) {
  if (!t || typeof t != "object" || Array.isArray(t))
    throw new u("BAD_TRANSACTION", "transaction must be an object");
  if (t.version !== $)
    throw new u("UNSUPPORTED_VERSION", `Unsupported API version: ${t.version}`);
  if (typeof t.id != "string" || t.id.length === 0)
    throw new u("BAD_TRANSACTION_ID", "transaction id must be a non-empty string");
  if (mn(e, t.id))
    throw new u("DUPLICATE_TRANSACTION_ID", `transaction id already used: ${t.id}`);
  if (typeof t.description != "string" || t.description.trim().length === 0)
    throw new u("EMPTY_DESCRIPTION", "transaction description must not be empty");
  if (t.baseRevision !== void 0 && (!Number.isInteger(t.baseRevision) || t.baseRevision < 0))
    throw new u(
      "BAD_REVISION",
      "baseRevision must be a non-negative integer"
    );
  if (!Array.isArray(t.operations))
    throw new u("BAD_OPERATIONS", "operations must be an array");
  if (t.operations.length === 0)
    throw new u("NO_OPERATIONS", "transaction has no operations");
  if (t.operations.length > Ke)
    throw new u(
      "TOO_MANY_OPERATIONS",
      `transaction has ${t.operations.length} operations (max ${Ke})`
    );
  return t.operations.forEach((n, r) => gn(n, r)), {
    version: $,
    id: t.id,
    baseRevision: t.baseRevision,
    description: t.description.trim(),
    operations: t.operations,
    validateOnly: t.validateOnly === !0
  };
}
const f = Object.freeze({
  viewport: 1,
  previews: 2,
  timeline: 4,
  inspector: 8,
  outliner: 16,
  motion: 32,
  status: 64,
  all: 127
});
function Sr(e = 0, t = 0) {
  return (e | t) >>> 0;
}
function Rr(e, t) {
  return (e & t) !== 0;
}
const En = "omnicam/library", wn = "majoor_omnicam/blockout_library", An = Object.freeze({
  "omnicam.helper.human_lowpoly": "human",
  "omnicam.helper.null": "null"
});
function yn(e, t) {
  if (!Array.isArray(e) || e.length < 3) return [...t];
  const n = e.slice(0, 3).map((r) => Number(r));
  return n.every((r) => Number.isFinite(r)) ? n : [...t];
}
function Tn(e) {
  return e.file ? `${e.source === "legacy" ? wn : En}/${e.file} [input]` : "";
}
function Qe(e, t, n) {
  const r = e || "asset";
  let a = `${r}_${n}`, s = 2;
  for (; t && t.has(a); ) a = `${r}_${n}_${s++}`;
  return a;
}
function In(e) {
  return {
    rig_profile: !!(e.rig && Object.keys(e.rig.bone_map || {}).length) ? e.rig.profile || "omnicam_humanoid_v1" : null,
    pose: { preset_id: "neutral", root_offset: [0, 0, 0], joints: {} },
    motion: null
  };
}
function kn(e, t = {}) {
  if (!e || typeof e != "object" || !e.id)
    throw new Error("compileInstance: an AssetDefinition is required");
  const n = yn(t.point, [0, 0, 0]), r = String(t.idSeed || Date.now().toString(36)), a = String(e.kind || "prop"), s = a === "character", o = An[e.id];
  if (a === "helper" && !e.file && o && o !== "null")
    return {
      id: Qe(o, t.existingIds, r),
      type: o,
      name: e.name || o,
      position: n,
      rotation: [0, 0, 0],
      size: [...e.base_size || [1, 1, 1]],
      keyframes: [],
      enabled: !0,
      asset_id: e.id,
      asset_kind: a,
      tags: [...e.tags || []]
    };
  const i = {
    id: Qe(a === "character" ? "character" : a, t.existingIds, r),
    type: "glb",
    // `type` stays "glb" for legacy render compatibility; `format` drives which
    // three.js loader the viewport picks (a catalog FBX character needs
    // FBXLoader, not GLTFLoader).
    format: String(e.format || "glb").toLowerCase() === "fbx" ? "fbx" : "glb",
    name: e.name || e.id,
    position: n,
    rotation: [0, 0, 0],
    size: [1, 1, 1],
    keyframes: [],
    enabled: !0,
    asset: Tn(e),
    asset_id: e.id,
    asset_kind: a,
    tags: [...e.tags || []]
  };
  return s && (i.character = In(e)), i;
}
function Or({ groundHit: e, orbitTarget: t } = {}) {
  return Array.isArray(e) && e.length >= 3 && e.every((n) => Number.isFinite(n)) ? e.slice(0, 3).map(Number) : Array.isArray(t) && t.length >= 3 && t.every((n) => Number.isFinite(n)) ? [Number(t[0]), 0, Number(t[2])] : [0, 0, 0];
}
const Le = ["pos_x", "pos_y", "pos_z"], Ie = 1e-9, ft = ["auto", "aligned", "free", "corner"];
function R(e, t = 0) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
function U(e) {
  const t = e?.camera?.position;
  return [R(t?.[0]), R(t?.[1]), R(t?.[2])];
}
function X(e, t) {
  return [e[0] - t[0], e[1] - t[1], e[2] - t[2]];
}
function Xe(e) {
  return Math.hypot(e[0], e[1], e[2]);
}
function me(e, t) {
  return [e[0] * t, e[1] * t, e[2] * t];
}
function ke(e, t, n) {
  const r = U(e), a = t ? U(t) : r, s = n ? U(n) : r, o = Math.max(Ie, R(e?.frame) - R(t?.frame, R(e?.frame) - 1)), i = Math.max(Ie, R(n?.frame, R(e?.frame) + 1) - R(e?.frame)), c = [0, 0, 0], h = [0, 0, 0];
  for (let d = 0; d < 3; d += 1) {
    const l = (r[d] - a[d]) / o, m = (s[d] - r[d]) / i;
    let g = (l + m) * 0.5;
    t ? n ? l * m <= 0 && (g = 0) : g = l : g = m, c[d] = g * i * (1 / 3), h[d] = -g * o * (1 / 3);
  }
  return { out: c, in: h };
}
function ut(e, t, n) {
  const r = U(e), a = t ? U(t) : r, s = n ? U(n) : r;
  return {
    out: me(X(s, r), 1 / 3),
    in: me(X(a, r), 1 / 3)
  };
}
function ve(e, t) {
  const n = e?.tangents?.channels;
  if (!n) return null;
  const r = t === "out" ? "out_y" : "in_y", a = [0, 0, 0];
  let s = !1;
  for (let o = 0; o < 3; o += 1) {
    const i = n[Le[o]];
    i && Number.isFinite(Number(i[r])) && (a[o] = Number(i[r]), s = !0);
  }
  return s ? a : null;
}
function he(e) {
  const t = e?.tangents?.spatial_mode;
  return ft.includes(t) ? t : "auto";
}
function Ne(e, t = null, n = null) {
  const r = he(e), a = U(e);
  if (r === "corner") {
    const c = ut(e, t, n);
    return { in: ie(a, c.in), out: ie(a, c.out), mode: r };
  }
  const s = ke(e, t, n), o = (r === "free" || r === "aligned") && ve(e, "out") || s.out, i = (r === "free" || r === "aligned") && ve(e, "in") || s.in;
  return { in: ie(a, i), out: ie(a, o), mode: r };
}
function ie(e, t) {
  return [e[0] + t[0], e[1] + t[1], e[2] + t[2]];
}
function vn(e) {
  return e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.channels = e.tangents.channels && typeof e.tangents.channels == "object" ? e.tangents.channels : {}, e.tangents.channels;
}
function W(e, t, n) {
  const r = vn(e);
  for (let a = 0; a < 3; a += 1) {
    const s = Le[a], o = r[s] && typeof r[s] == "object" ? r[s] : {};
    o.mode = "free", o.out_x = 1 / 3, o.in_x = -1 / 3, t === "out" ? o.out_y = n[a] : o.in_y = n[a], o.out_y === void 0 && (o.out_y = 0), o.in_y === void 0 && (o.in_y = 0), r[s] = o;
  }
}
function _e(e) {
  e.interpolation !== "bezier" && (e.interpolation = "bezier");
}
function mt(e, t, n) {
  const r = U(e), a = Ne(e, t, n);
  W(e, "out", X(a.out, r)), W(e, "in", X(a.in, r));
}
function Cr(e, t, n, { prevKey: r = null, nextKey: a = null, breakCoupling: s = !1 } = {}) {
  if (!e || t !== "in" && t !== "out") return e;
  let o = he(e);
  if (o === "corner") return e;
  o === "auto" && (o = "aligned", e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.spatial_mode = "aligned", mt(e, r, a));
  const i = U(e), c = X([
    R(n?.[0]),
    R(n?.[1]),
    R(n?.[2])
  ], i);
  if (_e(e), W(e, t, c), o === "aligned" && !s) {
    const h = t === "out" ? "in" : "out", d = ve(e, h) || (h === "out" ? ke(e, r, a).out : ke(e, r, a).in), l = Xe(c), m = Xe(d) || l || 1, g = l > Ie ? me(c, -m / l) : me(d, 1);
    W(e, h, g);
  }
  return e;
}
function ce(e, t, n) {
  if (!e || t !== "in" && t !== "out") return e;
  const r = U(e);
  return _e(e), W(e, t, X([
    R(n?.[0]),
    R(n?.[1]),
    R(n?.[2])
  ], r)), e;
}
function jr(e, t, { prevKey: n = null, nextKey: r = null } = {}) {
  if (!e || !ft.includes(t)) return e;
  if (e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.spatial_mode = t, t === "auto") {
    if (e.tangents.channels) {
      for (const a of Le) delete e.tangents.channels[a];
      Object.keys(e.tangents.channels).length || delete e.tangents.channels;
    }
    return e.interpolation === "bezier" && (e.interpolation = "smooth"), e;
  }
  if (t === "corner") {
    const a = ut(e, n, r);
    return _e(e), W(e, "out", a.out), W(e, "in", a.in), e;
  }
  return _e(e), mt(e, n, r), e;
}
const ht = 1e-9;
function Nn(e, t) {
  if (t === "object") {
    const r = e.transform || {};
    return [
      ...(r.position || [0, 0, 0]).map(Number),
      ...(r.rotation || [0, 0, 0]).map(Number),
      ...(r.size || [1, 1, 1]).map(Number)
    ];
  }
  const n = e.camera || {};
  return [
    ...(n.position || [0, 0, 0]).map(Number),
    ...(n.target || [0, 0, 0]).map(Number),
    Number(n.fov) || 0,
    Number(n.roll) || 0,
    Number(n.zoom) || 1
  ];
}
function Sn(e) {
  const t = e[0]?.length || 0, n = new Array(t).fill(1);
  for (let r = 0; r < t; r += 1) {
    let a = 1 / 0, s = -1 / 0;
    for (const i of e) {
      const c = Number.isFinite(i[r]) ? i[r] : 0;
      c < a && (a = c), c > s && (s = c);
    }
    const o = s - a;
    n[r] = o > ht ? 1 / o : 0;
  }
  return n;
}
function Be(e, t) {
  const n = e.map((o) => Nn(o, t)), r = Sn(n), a = e.map((o) => o.frame), s = Math.max(1, a[a.length - 1] - a[0]);
  return n.map((o, i) => [
    (a[i] - a[0]) / s,
    ...o.map((c, h) => (Number.isFinite(c) ? c : 0) * r[h])
  ]);
}
function Ze(e, t) {
  let n = 0;
  for (let r = 0; r < e.length; r += 1) n += (e[r] - t[r]) ** 2;
  return Math.sqrt(n);
}
function Pe(e, t, n) {
  let r = 0;
  for (let i = 0; i < t.length; i += 1) r += (n[i] - t[i]) ** 2;
  if (r <= ht) return Ze(e, t);
  let a = 0;
  for (let i = 0; i < t.length; i += 1) a += (e[i] - t[i]) * (n[i] - t[i]);
  const s = Math.max(0, Math.min(1, a / r)), o = t.map((i, c) => i + (n[c] - i) * s);
  return Ze(e, o);
}
function Rn(e, t, n) {
  const r = /* @__PURE__ */ new Set([0, e.length - 1]), a = [[0, e.length - 1]];
  for (; a.length; ) {
    const [s, o] = a.pop();
    if (o - s < 2) continue;
    let i = -1, c = -1;
    for (let h = s + 1; h < o; h += 1) {
      const d = Pe(e[h], e[s], e[o]);
      d > i && (i = d, c = h);
    }
    c < 0 || (i > t || n.has(c)) && (r.add(c), a.push([s, c], [c, o]));
  }
  return r;
}
function Mr(e, t, { tolerance: n = 0.02, keepFrames: r = [] } = {}) {
  const a = [...e].sort((d, l) => d.frame - l.frame);
  if (a.length <= 2 || n <= 0) return { keys: a, removed: 0 };
  const s = Be(a, t), o = /* @__PURE__ */ new Set(), i = new Set(r);
  a.forEach((d, l) => {
    i.has(d.frame) && o.add(l);
  });
  const c = Rn(s, n, o);
  for (const d of o) c.add(d);
  const h = a.filter((d, l) => c.has(l));
  return { keys: h, removed: a.length - h.length };
}
function Dr(e, t, { target: n = 2, keepFrames: r = [] } = {}) {
  let a = [...e].sort((c, h) => c.frame - h.frame);
  const s = Math.max(2, Math.round(n));
  if (a.length <= s) return { keys: a, removed: 0 };
  const o = new Set(r), i = a.length;
  for (; a.length > s; ) {
    const c = Be(a, t);
    let h = -1, d = 1 / 0;
    for (let l = 1; l < a.length - 1; l += 1) {
      if (o.has(a[l].frame)) continue;
      const m = Pe(c[l], c[l - 1], c[l + 1]);
      m < d && (d = m, h = l);
    }
    if (h < 0) break;
    a = a.filter((l, m) => m !== h);
  }
  return { keys: a, removed: i - a.length };
}
function Ur(e, t, { mergeWithin: n = 1, epsilon: r = 1e-3, keepFrames: a = [] } = {}) {
  const s = [...e].sort((m, g) => m.frame - g.frame), o = s.length, i = new Set(a), c = [];
  for (const m of s) {
    const g = c[c.length - 1];
    g && m.frame - g.frame <= Math.max(0, n) && !i.has(m.frame) || c.push(m);
  }
  if (c.length <= 2) return { keys: c, removed: o - c.length };
  const h = Be(c, t), d = /* @__PURE__ */ new Set();
  for (let m = 1; m < c.length - 1; m += 1) {
    if (i.has(c[m].frame)) continue;
    const g = d.has(m - 1) ? null : m - 1;
    if (g === null) continue;
    Pe(h[m], h[g], h[m + 1]) <= r && d.add(m);
  }
  const l = c.filter((m, g) => !d.has(g));
  return { keys: l, removed: o - l.length };
}
function On(e, t, { minKeys: n = 0 } = {}) {
  const r = new Set(t), a = e.filter((s) => !r.has(s.frame));
  if (a.length < n) {
    const s = e.filter((o) => r.has(o.frame)).sort((o, i) => o.frame - i.frame);
    for (; a.length < n && s.length; ) a.push(s.shift());
    a.sort((o, i) => o.frame - i.frame);
  }
  return { keys: a, removed: e.length - a.length };
}
function Lr(e, t, n, { lastFrame: r = 1 / 0 } = {}) {
  const a = [...t].sort((d, l) => d - l);
  if (!n || !a.length)
    return { keys: [...e], moved: 0, frames: a };
  const s = new Set(a), o = new Set(e.filter((d) => !s.has(d.frame)).map((d) => d.frame)), i = a.map((d) => d + n);
  return i.some((d) => d < 0 || d > r || o.has(d)) || new Set(i).size !== i.length ? { keys: [...e], moved: 0, frames: a } : { keys: e.map((d) => s.has(d.frame) ? { ...d, frame: d.frame + n } : d).sort((d, l) => d.frame - l.frame), moved: a.length, frames: i.sort((d, l) => d - l) };
}
function Br(e, t, n) {
  const r = new Set(t);
  return e.map((a) => r.has(a.frame) ? { ...a, interpolation: n } : a);
}
function Pr(e, t, n, r = []) {
  const a = new Set(t);
  return e.map((s) => {
    if (!a.has(s.frame)) return s;
    const o = { mode: n, channels: { ...s.tangents?.channels || {} } };
    for (const c of r)
      o.channels[c] = { ...o.channels[c] || {}, mode: n };
    const i = n !== "auto" && s.interpolation !== "bezier" ? "bezier" : s.interpolation;
    return { ...s, interpolation: i, tangents: o };
  });
}
function Fr(e, t, n = "camera", r = 0.5) {
  const a = new Set(t), s = [...e].sort((d, l) => d.frame - l.frame), o = [];
  if (s.forEach((d, l) => {
    a.has(d.frame) && o.push(l);
  }), o.length < 2) return e;
  const i = r * 0.5, c = 1 - r, h = s.map((d) => ({
    ...d,
    camera: d.camera ? { ...d.camera, position: [...d.camera.position], target: [...d.camera.target || [0, 0, 0]] } : void 0,
    transform: d.transform ? { ...d.transform, position: [...d.transform.position], rotation: [...d.transform.rotation || [0, 0, 0]] } : void 0
  }));
  for (let d = 0; d < o.length; d += 1) {
    const l = o[d], m = d > 0 ? o[d - 1] : l > 0 ? l - 1 : null, g = d < o.length - 1 ? o[d + 1] : l < s.length - 1 ? l + 1 : null;
    if (m === null || g === null) continue;
    const w = s[m], b = s[l], y = s[g];
    if (n === "object" && b.transform && w.transform && y.transform)
      for (let p = 0; p < 3; p += 1)
        h[l].transform.position[p] = i * w.transform.position[p] + c * b.transform.position[p] + i * y.transform.position[p], b.transform.rotation && w.transform.rotation && y.transform.rotation && (h[l].transform.rotation[p] = i * w.transform.rotation[p] + c * b.transform.rotation[p] + i * y.transform.rotation[p]);
    else if (b.camera && w.camera && y.camera) {
      for (let p = 0; p < 3; p += 1)
        h[l].camera.position[p] = i * w.camera.position[p] + c * b.camera.position[p] + i * y.camera.position[p], h[l].camera.target[p] = i * (w.camera.target?.[p] ?? 0) + c * (b.camera.target?.[p] ?? 0) + i * (y.camera.target?.[p] ?? 0);
      Number.isFinite(b.camera.roll) && Number.isFinite(w.camera.roll) && Number.isFinite(y.camera.roll) && (h[l].camera.roll = i * w.camera.roll + c * b.camera.roll + i * y.camera.roll), Number.isFinite(b.camera.fov) && Number.isFinite(w.camera.fov) && Number.isFinite(y.camera.fov) && (h[l].camera.fov = i * w.camera.fov + c * b.camera.fov + i * y.camera.fov);
    }
  }
  return h;
}
function G(e, t, n) {
  return [0, 1, 2].map((r) => e[r] + (t[r] - e[r]) * n);
}
function Cn(e, t, n, r, a) {
  const s = G(e, t, a), o = G(t, n, a), i = G(n, r, a), c = G(s, o, a), h = G(o, i, a), d = G(c, h, a);
  return { left: [e, s, c, d], right: [d, h, i, r], point: d };
}
function jn(e, t, n, r) {
  const a = new Set(e.map((i) => i.frame)), s = Math.min(n - 1, Math.max(t + 1, r));
  if (!a.has(s)) return s;
  const o = n - t;
  for (let i = 1; i < o; i += 1)
    for (const c of [s - i, s + i])
      if (!(c <= t || c >= n) && !a.has(c))
        return c;
  return -1;
}
function Mn(e, { leftFrame: t, rightFrame: n, t: r = 0.5 } = {}) {
  const a = [...e].sort((T, A) => T.frame - A.frame), s = a.findIndex((T) => T.frame === t), o = s >= 0 ? s + 1 : -1;
  if (s < 0 || o < 0 || o >= a.length || a[o].frame !== n)
    return { ok: !1, reason: "segment_not_found" };
  if (n - t < 2)
    return { ok: !1, reason: "no_free_frame" };
  const i = Math.min(0.999, Math.max(1e-3, Number.isFinite(r) ? r : 0.5)), c = Math.round(t + i * (n - t)), h = jn(a, t, n, c);
  if (h < 0) return { ok: !1, reason: "no_free_frame" };
  const d = (h - t) / (n - t), l = a[s], m = a[o], g = s > 0 ? a[s - 1] : null, w = o + 1 < a.length ? a[o + 1] : null, b = l.interpolation === "bezier" || m.interpolation === "bezier", y = se({ keyframes: a }, h), p = { frame: h, interpolation: b ? "bezier" : l.interpolation, camera: y };
  if (b) {
    const T = [...l.camera.position], A = Ne(l, g, m).out, k = Ne(m, l, w).in, O = [...m.camera.position], M = Cn(T, A, k, O, d);
    p.camera = { ...ue(y), position: [...M.point] };
    const L = he(l);
    (L === "free" || L === "aligned") && ce(l, "out", M.left[1]);
    const Fe = he(m);
    (Fe === "free" || Fe === "aligned") && ce(m, "in", M.right[2]), ce(p, "in", M.left[2]), ce(p, "out", M.right[1]);
  }
  return { ok: !0, keys: [...a, p].sort((T, A) => T.frame - A.frame), frame: h };
}
function Dn(e, t) {
  const { keys: n, removed: r } = On(e, t, { minKeys: 1 });
  return { ok: r > 0, keys: n, removed: r };
}
function Se(e, t) {
  const n = t || e.active_camera_id, r = (e.cameras || []).find((a) => a.id === n);
  if (!r) throw new u("UNKNOWN_CAMERA", `${n} does not exist`);
  return r;
}
function Re(e, t) {
  const n = (e.objects || []).find((r) => r.id === t);
  if (!n) throw new u("UNKNOWN_OBJECT", `${t} does not exist`);
  return n;
}
function le(e, t) {
  const n = H(e, t);
  if (n.asset_kind !== "character")
    throw new u("NOT_A_CHARACTER", `${t} is not a character`);
  return n;
}
function D(e, t) {
  const n = Se(e, t);
  if (n.locked)
    throw new u("ENTITY_LOCKED", `${n.id} is locked`);
  return n;
}
function H(e, t) {
  const n = Re(e, t);
  if (n.locked)
    throw new u("ENTITY_LOCKED", `${n.id} is locked`);
  return n;
}
function we(e) {
  return (!e.camera || typeof e.camera != "object") && (e.camera = {}), e.camera;
}
function de(e, t) {
  return (e.keyframes || []).find((n) => n.frame === t) || null;
}
function Z(e, t, n) {
  t.keyframes = n, t.id === e.active_camera_id && (e.keyframes = n);
}
const ee = f.viewport | f.previews | f.timeline | f.inspector;
function et(e, t, n) {
  const r = new Set((e.keyframes || []).map((s) => s.frame)), a = t.find((s) => !r.has(s));
  if (a !== void 0)
    throw new u("UNKNOWN_KEYFRAME", `${n}: camera has no key at frame ${a}`);
}
const Un = {
  [_.ASSET_INSTANTIATE](e, t) {
    const n = new Set((e.objects || []).map((a) => a.id));
    let r;
    try {
      r = kn(t.asset, { point: t.point, idSeed: t.id, existingIds: n });
    } catch (a) {
      throw new u("BAD_ASSET", `asset.instantiate could not compile: ${a.message}`);
    }
    return (e.objects ||= []).push(r), {
      dirtyMask: f.viewport | f.previews | f.outliner | f.inspector,
      outcome: { objectId: r.id, assetId: r.asset_id || null }
    };
  },
  [_.CAMERA_SET_ACTIVE](e, t) {
    return Se(e, t.cameraId), e.active_camera_id = t.cameraId, { dirtyMask: f.viewport | f.previews | f.inspector | f.outliner | f.timeline };
  },
  [_.CAMERA_SET_LOCKED](e, t) {
    return Se(e, t.cameraId).locked = t.value, { dirtyMask: f.outliner | f.inspector | f.viewport };
  },
  [_.CAMERA_CREATE](e, t) {
    const n = Jt(e, t);
    return { dirtyMask: f.outliner | f.inspector | f.viewport | f.previews | f.timeline, outcome: n };
  },
  [_.CAMERA_DUPLICATE](e, t) {
    const n = Gt(e, t);
    return { dirtyMask: f.outliner | f.inspector | f.viewport | f.previews | f.timeline, outcome: n };
  },
  [_.CAMERA_DELETE](e, t) {
    const n = Yt(e, t);
    return { dirtyMask: f.outliner | f.inspector | f.viewport | f.previews | f.timeline, outcome: n };
  },
  [_.CAMERA_RENAME](e, t) {
    D(e, t.cameraId);
    const n = qt(e, t);
    return { dirtyMask: f.outliner | f.inspector, outcome: n };
  },
  [_.CAMERA_SET_PLAYBLAST](e, t) {
    const n = Qt(e, t);
    return { dirtyMask: f.outliner | f.inspector | f.status, outcome: n };
  },
  [_.CAMERA_TRANSFORM](e, t) {
    const n = D(e, t.cameraId), r = we(n);
    if (t.position && (r.position = [...t.position]), t.target && (r.target = [...t.target]), Number.isInteger(t.frame)) {
      const a = de(n, t.frame);
      if (!a) throw new u("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
      a.camera = { ...a.camera }, t.position && (a.camera.position = [...t.position]), t.target && (a.camera.target = [...t.target]);
    }
    return { dirtyMask: f.viewport | f.previews | f.inspector | f.timeline };
  },
  [_.CAMERA_LOOK_AT](e, t) {
    const n = D(e, t.cameraId);
    if (t.objectId !== void 0 && (t.objectId === null || t.objectId === "" ? (n.target_object_id = null, n.id === e.active_camera_id && (e.target_object_id = null)) : (Re(e, t.objectId), n.target_object_id = t.objectId, n.id === e.active_camera_id && (e.target_object_id = t.objectId))), t.point) {
      const r = we(n);
      r.target = [...t.point];
      for (const a of n.keyframes || [])
        a.camera = { ...a.camera, target: [...t.point] };
    }
    return { dirtyMask: f.viewport | f.previews | f.inspector | f.timeline };
  },
  [_.OBJECT_CREATE](e, t) {
    const n = Xt(e, t);
    return { dirtyMask: f.viewport | f.previews | f.outliner | f.inspector, outcome: n };
  },
  [_.OBJECT_DUPLICATE](e, t) {
    const n = Zt(e, t);
    return { dirtyMask: f.viewport | f.previews | f.outliner | f.inspector, outcome: n };
  },
  [_.OBJECT_DELETE](e, t) {
    const n = en(e, t);
    return { dirtyMask: f.viewport | f.previews | f.outliner | f.inspector, outcome: n };
  },
  [_.OBJECT_RENAME](e, t) {
    H(e, t.objectId);
    const n = tn(e, t);
    return { dirtyMask: f.outliner | f.inspector, outcome: n };
  },
  [_.OBJECT_SET_PARENT](e, t) {
    H(e, t.objectId);
    const n = nn(e, t);
    return { dirtyMask: f.viewport | f.outliner | f.inspector, outcome: n };
  },
  [_.OBJECT_TRANSFORM](e, t) {
    const n = H(e, t.objectId);
    return t.position && (n.position = [...t.position]), t.rotation && (n.rotation = [...t.rotation]), t.scale && (n.size = [...t.scale]), { dirtyMask: f.viewport | f.previews | f.inspector };
  },
  [_.OBJECT_SET_ENABLED](e, t) {
    return H(e, t.objectId).enabled = t.value, { dirtyMask: f.viewport | f.previews | f.outliner | f.inspector };
  },
  [_.OBJECT_SET_LOCKED](e, t) {
    return Re(e, t.objectId).locked = t.value, { dirtyMask: f.outliner | f.inspector };
  },
  [_.OBJECT_SET_TAGS](e, t) {
    const n = H(e, t.objectId), r = Ct(t.tags), a = r.length !== t.tags.length ? "some tags were dropped or normalised" : void 0;
    return r.length ? n.tags = r : delete n.tags, { dirtyMask: f.outliner | f.inspector | f.viewport, warning: a };
  },
  [_.OBJECT_SET_ANNOTATION](e, t) {
    const n = H(e, t.objectId), r = t.annotation === null ? null : Ot(t.annotation);
    if (t.annotation && !r)
      throw new u("BAD_ANNOTATION", "annotation failed validation (text, hex colour, anchor)");
    return r ? n.annotation = r : delete n.annotation, { dirtyMask: f.viewport | f.outliner | f.inspector };
  },
  [_.CHARACTER_SET_POSE](e, t) {
    const n = le(e, t.objectId);
    if (n.character?.motion)
      throw new u("POSE_MOTION_EXCLUSIVE", "clear the motion clip before editing the pose");
    return n.character = {
      ...n.character || {},
      pose: t.pose === null ? xe(null) : xe(t.pose)
    }, { dirtyMask: f.viewport | f.previews | f.inspector };
  },
  [_.CHARACTER_SET_JOINT_ROTATION](e, t) {
    const n = le(e, t.objectId);
    if (n.character?.motion)
      throw new u("POSE_MOTION_EXCLUSIVE", "clear the motion clip before editing the pose");
    if (!St(t.rotation))
      throw new u("BAD_QUATERNION", "rotation is not a usable unit quaternion");
    return n.character = {
      ...n.character || {},
      pose: Rt(n.character?.pose, t.joint, t.rotation)
    }, { dirtyMask: f.viewport | f.previews | f.inspector };
  },
  [_.CHARACTER_SET_MOTION](e, t) {
    const n = le(e, t.objectId), r = Nt(t.motion);
    if (!r) throw new u("BAD_MOTION", "motion failed validation (clip_id, speed, range)");
    const a = n.character?.pose || {};
    return n.character = {
      ...n.character || {},
      pose: { preset_id: a.preset_id || "neutral", root_offset: a.root_offset || [0, 0, 0], joints: {} },
      motion: r
    }, { dirtyMask: f.viewport | f.previews | f.timeline | f.inspector };
  },
  [_.CHARACTER_CLEAR_MOTION](e, t) {
    const n = le(e, t.objectId);
    return n.character ? (n.character = { ...n.character, motion: null }, { dirtyMask: f.viewport | f.previews | f.timeline | f.inspector }) : { dirtyMask: 0 };
  },
  [_.KEYFRAME_UPSERT](e, t) {
    const n = D(e, t.cameraId);
    if (t.frame >= (e.duration_frames || 0))
      throw new u("FRAME_OUT_OF_RANGE", `frame ${t.frame} is past the timeline`);
    n.keyframes ||= [];
    let r = de(n, t.frame);
    const a = !r;
    if (!r) {
      const o = de(n, 0)?.camera || n.camera || {};
      r = { frame: t.frame, camera: JSON.parse(JSON.stringify(o)), interpolation: "ease" }, n.keyframes.push(r), n.keyframes.sort((i, c) => i.frame - c.frame);
    }
    t.camera && (r.camera = { ...r.camera, ...JSON.parse(JSON.stringify(t.camera)) }), t.interpolation && (r.interpolation = t.interpolation);
    const s = a && !t.camera ? `keyframe at frame ${t.frame} was created from the existing pose (no "camera" given) -- it will not move the camera unless another keyframe with a different position/target exists` : void 0;
    return { dirtyMask: f.viewport | f.previews | f.timeline | f.inspector, warning: s };
  },
  [_.KEYFRAME_REMOVE](e, t) {
    const n = D(e, t.cameraId), r = (n.keyframes || []).length;
    if (n.keyframes = (n.keyframes || []).filter((s) => s.frame !== t.frame), n.keyframes.length === r)
      throw new u("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
    const a = n.keyframes.length === 0 ? "camera has no keyframes left" : void 0;
    return { dirtyMask: f.viewport | f.previews | f.timeline | f.inspector, warning: a };
  },
  [_.KEYFRAME_SET_INTERPOLATION](e, t) {
    const n = D(e, t.cameraId), r = de(n, t.frame);
    if (!r) throw new u("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
    if (!fe.includes(t.interpolation))
      throw new u("BAD_INTERPOLATION", `Unsupported interpolation: ${t.interpolation}`);
    return r.interpolation = t.interpolation, { dirtyMask: f.timeline | f.viewport | f.previews };
  },
  [_.TIMELINE_SET_RANGE](e, t) {
    const n = Math.max(0, (e.duration_frames || 1) - 1);
    if (t.start > n || t.end > n)
      throw new u("FRAME_OUT_OF_RANGE", `range must stay within 0..${n}`);
    return e.playback_range = [t.start, t.end], { dirtyMask: f.timeline | f.status };
  },
  [_.TIMELINE_SET_DURATION](e, t) {
    if (e.duration_frames = t.frames, Array.isArray(e.playback_range)) {
      const n = t.frames - 1;
      e.playback_range = [
        Math.min(e.playback_range[0], n),
        Math.min(e.playback_range[1], n)
      ];
    }
    return { dirtyMask: f.timeline | f.viewport | f.previews | f.status };
  },
  [_.CUT_UPSERT](e, t) {
    const n = rn(e, t);
    return { dirtyMask: f.timeline | f.viewport | f.previews | f.status, outcome: n };
  },
  [_.CUT_REMOVE](e, t) {
    const n = an(e, t);
    return { dirtyMask: f.timeline | f.viewport | f.previews | f.status, outcome: n };
  },
  [_.CUT_SET_CAMERA](e, t) {
    const n = sn(e, t);
    return { dirtyMask: f.timeline | f.viewport | f.previews | f.status, outcome: n };
  },
  // Semantic Director API path operations (plan section 22): the same pure
  // maths the manual UI's TransformControls wiring / toolbar actions use
  // (viewport/transform-controls-wiring.js, director/methods/scene.js),
  // reached atomically and with the exact same lock/existence checks. No
  // raw Three.js object ever crosses this boundary -- every input/output
  // here is plain JSON (frames, vectors, strings).
  [_.CAMERA_PATH_TRANSFORM_KEYS](e, t) {
    const n = D(e, t.cameraId);
    et(n, t.frames, "camera.path.transform_keys");
    const r = (n.keyframes || []).filter((o) => t.frames.includes(o.frame)), a = Array.isArray(t.transform.origin) ? t.transform.origin : It(r), s = kt(n.keyframes || [], t.frames, {
      mode: t.transform.mode,
      origin: a,
      delta: t.transform.delta,
      factors: t.transform.factors,
      rotationDeg: t.transform.rotationDeg,
      lookAtActive: vt(n, e.objects)
    });
    return Z(e, n, s), { dirtyMask: ee };
  },
  [_.CAMERA_PATH_INSERT_KEY](e, t) {
    const n = D(e, t.cameraId), r = Mn(n.keyframes || [], {
      leftFrame: t.leftFrame,
      rightFrame: t.rightFrame,
      t: t.t
    });
    if (!r.ok)
      throw new u(
        r.reason === "no_free_frame" ? "NO_FREE_FRAME" : "SEGMENT_NOT_FOUND",
        `camera.path.insert_key: could not insert a key between frame ${t.leftFrame} and ${t.rightFrame}`
      );
    return Z(e, n, r.keys), { dirtyMask: ee, outcome: { frame: r.frame } };
  },
  [_.CAMERA_PATH_DELETE_KEYS](e, t) {
    const n = D(e, t.cameraId);
    et(n, t.frames, "camera.path.delete_keys");
    const r = Dn(n.keyframes || [], t.frames);
    if (!r.ok)
      throw new u("CANNOT_DELETE", "camera.path.delete_keys: a camera track needs at least one key");
    return Z(e, n, r.keys), { dirtyMask: ee, outcome: { removed: r.removed } };
  },
  [_.CAMERA_PATH_REDISTRIBUTE_TIMING](e, t) {
    const n = D(e, t.cameraId), r = [...n.keyframes || []].sort((i, c) => i.frame - c.frame), a = Number.isInteger(t.startFrame) ? t.startFrame : r[0]?.frame, s = Number.isInteger(t.endFrame) ? t.endFrame : r[r.length - 1]?.frame, o = Tt(r, { startFrame: a, endFrame: s });
    if (!o.ok) {
      const i = { not_enough_keys: "NOT_ENOUGH_KEYS", invalid_range: "BAD_RANGE", insufficient_frame_slots: "INSUFFICIENT_FRAME_SLOTS" };
      throw new u(i[o.reason] || "BAD_RANGE", `camera.path.redistribute_timing: ${o.reason}`);
    }
    return Z(e, n, o.keys), { dirtyMask: ee };
  },
  [_.CAMERA_PATH_APPLY_PRESET](e, t) {
    const n = D(e, t.cameraId), r = we(n), a = dn({
      type: t.presetType,
      camera: r,
      target: t.target,
      startFrame: t.startFrame,
      endFrame: t.endFrame,
      params: t.params || {}
    });
    if (!a.ok) {
      const s = { unknown_preset: "UNKNOWN_PRESET", invalid_camera: "BAD_VALUE", invalid_range: "BAD_RANGE", insufficient_frame_slots: "INSUFFICIENT_FRAME_SLOTS" };
      throw new u(s[a.reason] || "BAD_VALUE", `camera.path.apply_preset: ${a.reason}`);
    }
    return Z(e, n, a.keyframes), { dirtyMask: ee };
  }
};
function Ln({ state: e, operation: t }) {
  const n = Un[t.type];
  if (!n) throw new u("UNKNOWN_OPERATION", `Unknown operation type: ${t.type}`);
  return n(e, t) || { dirtyMask: 0 };
}
const Bn = 100;
function Oe(e, t) {
  if (e === t) return !0;
  if (typeof e != typeof t) return !1;
  if (Array.isArray(e) || Array.isArray(t))
    return !Array.isArray(e) || !Array.isArray(t) || e.length !== t.length ? !1 : e.every((n, r) => Oe(n, t[r]));
  if (e && t && typeof e == "object") {
    const n = /* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(t)]);
    for (const r of n) if (!Oe(e[r], t[r])) return !1;
    return !0;
  }
  return !1;
}
function z(e) {
  return new Map((e || []).map((t) => [t.id, t]));
}
function Pn(e, t) {
  const n = [];
  let r = !1;
  const a = (s, o, i, c) => {
    if (!r && !Oe(i, c)) {
      if (n.length >= Bn) {
        r = !0;
        return;
      }
      n.push({ entity: s, field: o, before: i ?? null, after: c ?? null });
    }
  };
  return $n(e, t, a), xn(e, t, a), Kn(e, t, a), Hn(e, t, a), Wn(e, t, a), Vn(e, t, a), { changes: n, truncated: r };
}
const Fn = ["fov", "roll", "zoom", "near", "far", "camera_type"];
function $n(e, t, n) {
  const r = z(e?.cameras), a = z(t?.cameras);
  for (const s of r.keys())
    a.has(s) || n(s, "camera", "present", null);
  for (const [s, o] of a) {
    const i = r.get(s);
    if (!i) {
      n(s, "camera", null, "present");
      continue;
    }
    n(s, "name", i.name, o.name), n(s, "locked", !!i.locked, !!o.locked), n(s, "muted", !!i.muted, !!o.muted), n(s, "solo", !!i.solo, !!o.solo), n(s, "target_object_id", i.target_object_id ?? null, o.target_object_id ?? null), n(s, "position", i.camera?.position, o.camera?.position), n(s, "target", i.camera?.target, o.camera?.target);
    for (const c of Fn)
      n(s, c, i.camera?.[c], o.camera?.[c]);
  }
}
const zn = ["position", "target", "fov", "roll", "zoom", "near", "far", "camera_type"];
function xn(e, t, n) {
  const r = z(e?.cameras), a = z(t?.cameras);
  for (const [s, o] of a) {
    const i = r.get(s), c = new Map((i?.keyframes || []).map((l) => [l.frame, l])), h = new Map((o.keyframes || []).map((l) => [l.frame, l])), d = `${s}@keyframes`;
    for (const [l, m] of c)
      h.has(l) || n(d, `frame_${l}`, m.interpolation ?? "present", null);
    for (const [l, m] of h) {
      const g = c.get(l);
      if (!g) {
        n(d, `frame_${l}`, null, m.interpolation ?? "present");
        continue;
      }
      for (const w of zn)
        n(d, `frame_${l}_${w}`, g.camera?.[w], m.camera?.[w]);
      n(d, `frame_${l}_interpolation`, g.interpolation, m.interpolation);
    }
  }
}
function Hn(e, t, n) {
  const r = z(e?.objects), a = z(t?.objects);
  for (const [s, o] of a) {
    const c = r.get(s)?.character?.pose?.joints || {}, h = o.character?.pose?.joints || {}, d = /* @__PURE__ */ new Set([...Object.keys(c), ...Object.keys(h)]);
    for (const l of d)
      n(`${s}#${l}`, "joint_rotation", c[l] ?? null, h[l] ?? null);
  }
}
function Kn(e, t, n) {
  const r = z(e?.objects), a = z(t?.objects);
  for (const [s] of r)
    a.has(s) || n(s, "object", "present", null);
  for (const [s, o] of a) {
    const i = r.get(s);
    if (!i) {
      n(s, "object", null, "present");
      continue;
    }
    n(s, "position", i.position, o.position), n(s, "rotation", i.rotation, o.rotation), n(s, "size", i.size, o.size), n(s, "name", i.name, o.name), n(s, "enabled", i.enabled !== !1, o.enabled !== !1), n(s, "locked", !!i.locked, !!o.locked), n(s, "tags", i.tags || [], o.tags || []), n(s, "annotation", i.annotation ?? null, o.annotation ?? null);
    const c = i.character?.pose?.preset_id ?? null, h = o.character?.pose?.preset_id ?? null;
    n(s, "pose_preset", c, h);
    const d = i.character?.motion?.clip_id ?? null, l = o.character?.motion?.clip_id ?? null;
    n(s, "motion_clip_id", d, l);
  }
}
function Wn(e, t, n) {
  n("timeline", "duration_frames", e?.duration_frames, t?.duration_frames), n("timeline", "playback_range", e?.playback_range ?? null, t?.playback_range ?? null);
}
function Vn(e, t, n) {
  const r = new Map((e?.sequence?.cuts || []).map((s) => [s.start, s])), a = new Map((t?.sequence?.cuts || []).map((s) => [s.start, s]));
  for (const [s, o] of r)
    a.has(s) || n(`cut_${s}`, "cut", o.camera_id, null);
  for (const [s, o] of a) {
    const i = r.get(s);
    i ? n(`cut_${s}`, "cut_camera_id", i.camera_id, o.camera_id) : n(`cut_${s}`, "cut", null, o.camera_id);
  }
}
function Jn(e) {
  return typeof structuredClone == "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e));
}
function Ce(e) {
  return Number.isInteger(e.directorRevision) ? Math.max(0, e.directorRevision) : 0;
}
function Ae(e, t, n) {
  return {
    ok: !1,
    version: $,
    revision: Ce(e),
    id: t ?? null,
    applied: 0,
    error: {
      code: n.code || "INTERNAL",
      operationIndex: n.operationIndex ?? null,
      message: n.message,
      ...n.details ? { details: n.details } : {}
    }
  };
}
function Gn(e) {
  const t = (e.state.cameras || []).find(
    (n) => n.id === e.state.active_camera_id
  ) || e.state.cameras?.[0] || null;
  return t ? (e.state.keyframes = t.keyframes, e.state.camera = ue(t.camera), e.camera = ue(t.camera), t) : null;
}
function Yn(e, t) {
  t && (e.camera = se(
    t,
    e.frame ?? 0,
    e.state.objects || []
  ));
}
async function qn(e, t, n) {
  const r = n.some((o) => o.resourceRefresh === !0), a = t.operations.filter((o) => o.type === _.OBJECT_DELETE).map((o) => o.objectId);
  for (const o of a)
    e.removeObjectResources?.(o);
  const s = t.operations.some((o) => o.type === _.ASSET_INSTANTIATE);
  (r || s) && await e.restoreAssets?.();
}
function Qn(e, t, n) {
  if (typeof e.requestUiUpdate == "function") {
    e.requestUiUpdate(t, n);
    return;
  }
  e.camera = e.sampleCamera?.(e.state, e.frame) ?? e.camera, e.refreshObjects?.(), e.refreshKeys?.(), e.refreshInspector?.(), e.render?.();
}
function Xn(e, t) {
  let n;
  try {
    n = bn(e, t);
  } catch (l) {
    if (l instanceof u) return Ae(e, t?.id, l);
    throw l;
  }
  const r = Ce(e);
  if (n.baseRevision !== void 0 && n.baseRevision !== r)
    return Ae(
      e,
      n.id,
      new u(
        "STALE_REVISION",
        "Scene changed since the caller read it",
        null,
        {
          expected: r,
          received: n.baseRevision
        }
      )
    );
  const a = Jn(e.state);
  let s = 0;
  const o = [], i = [];
  for (let l = 0; l < n.operations.length; l += 1)
    try {
      const m = Ln({ ui: e, state: a, operation: n.operations[l] });
      s |= m?.dirtyMask || 0, m?.warning && o.push(m.warning), m?.outcome && i.push({ index: l, ...m.outcome });
    } catch (m) {
      if (m instanceof u)
        return (m.operationIndex === null || m.operationIndex === void 0) && (m.operationIndex = l), Ae(e, n.id, m);
      throw m;
    }
  if (n.validateOnly) {
    const { changes: l, truncated: m } = Pn(e.state, a);
    return {
      ok: !0,
      version: $,
      revision: r,
      id: n.id,
      applied: n.operations.length,
      warnings: o,
      outcomes: i,
      dirtyMask: s,
      validateOnly: !0,
      changes: l,
      ...m ? { truncated: !0 } : {}
    };
  }
  e.checkpoint?.(n.description), e.state = ae(a);
  const c = Gn(e);
  un(e, n.id), e.serialize?.(), Yn(e, c), Qn(e, s, `director-api:${n.id}`);
  const h = {
    ok: !0,
    version: $,
    baseRevision: r,
    revision: Ce(e),
    id: n.id,
    applied: n.operations.length,
    warnings: o,
    outcomes: i,
    dirtyMask: s
  }, d = qn(e, n, i).catch((l) => {
    console.warn("OmniCam: resource reconciliation failed", l), o.push({
      code: "VIEWPORT_RESOURCE_RECONCILE_FAILED",
      message: "The scene change was committed, but one or more viewport resources could not be refreshed."
    }), e.setStatus?.("The scene change was committed, but one or more viewport resources could not be refreshed.");
  });
  return Object.defineProperty(h, "_reconciliation", { value: d, enumerable: !1 }), h;
}
function Zn(e) {
  return {
    query: (t) => Wt(e, t),
    execute: (t) => Xn(e, t)
  };
}
function er(e) {
  return e.directorApi = Zn(e), e.directorApi;
}
const tt = "omnicam-agent/1", nt = "majoor.omnicam.agent.request", tr = 1, te = Object.freeze({
  register: "/majoor/omnicam/agent/v1/session/register",
  heartbeat: "/majoor/omnicam/agent/v1/session/heartbeat",
  reply: "/majoor/omnicam/agent/v1/reply",
  close: "/majoor/omnicam/agent/v1/session/close"
}), nr = 1e4, rr = 5e3, _t = "asset.instantiate_by_id", pt = "asset.catalog_search", rt = Object.freeze([
  ...lt.filter((e) => e !== _.ASSET_INSTANTIATE),
  _t
]);
function je(e) {
  return e?.kind === "character" && e?.source === "default";
}
async function ar(e, t) {
  if (!e || !t || typeof t != "string") return null;
  const n = e.get(t);
  if (n) return je(n) ? null : n;
  try {
    await e.setFilter({ kind: "all", search: t });
  } catch {
  }
  const r = e.get(t);
  return je(r) ? null : r;
}
async function sr(e, t) {
  const n = e.assetBrowser?.store, r = [];
  for (const a of t || []) {
    if (a?.type !== _t) {
      r.push(a);
      continue;
    }
    if (!n)
      return { ok: !1, code: "ASSET_CATALOG_UNAVAILABLE", message: "The asset catalogue is not available in this Director session" };
    const s = await ar(n, a.assetId);
    if (!s)
      return { ok: !1, code: "UNKNOWN_ASSET", message: `Unknown catalogue asset: ${a.assetId}` };
    r.push({ type: "asset.instantiate", asset: s, id: a.id, point: a.point });
  }
  return { ok: !0, operations: r };
}
async function or(e, t) {
  const n = e.assetBrowser?.store;
  if (!n) {
    const a = new Error("The asset catalogue is not available in this Director session");
    throw a.code = "ASSET_CATALOG_UNAVAILABLE", a;
  }
  await n.setFilter({ kind: t?.kind || "all", search: String(t?.search || "") });
  const r = (n.state?.items || []).filter((a) => !je(a)).slice(0, 20).map((a) => ({
    id: a.id,
    name: a.name,
    kind: a.kind,
    tags: [...a.tags || []],
    animations: (a.animations || []).map((s) => ({ id: s.id, name: s.name, clip: s.clip }))
  }));
  return {
    version: $,
    type: pt,
    items: r,
    revision: Number(e.directorRevision || 0)
  };
}
async function ne(e, t, n) {
  const r = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
  let a = null;
  try {
    a = await r.json();
  } catch {
    a = null;
  }
  if (r.ok === !1) {
    const s = a?.error?.code || `HTTP_${r.status || 0}`, o = a?.error?.message || `OmniCam Agent request failed (${r.status})`, i = new Error(o);
    throw i.code = s, i.status = r.status || 0, i;
  }
  return a ?? {};
}
function re(e, t, n) {
  return {
    ok: !1,
    version: $,
    revision: Number(e.directorRevision || 0),
    error: { code: t, message: n }
  };
}
function ir(e, t, n) {
  let r = !1, a = null, s = null, o = null, i = null, c = null, h = 0;
  function d() {
    return n.clientId || n.initialClientId || null;
  }
  function l() {
    a = null, s = null, o = null, i && (clearInterval(i), i = null);
  }
  async function m() {
    if (r) return;
    h += 1;
    const T = h, A = d();
    if (!A) {
      g();
      return;
    }
    try {
      const k = await ne(n, te.register, {
        protocol: tt,
        client_id: A,
        node_id: String(t.id),
        label: `OmniCam Director ${t.id}`,
        director_api: $,
        revision: Number(e.directorRevision || 0),
        operations: [...rt],
        queries: [...Ft]
      });
      if (r || T !== h) return;
      a = k.session_id, s = k.session_token, o = A, w();
    } catch {
      if (r || T !== h) return;
      g();
    }
  }
  function g() {
    r || (clearTimeout(c), c = setTimeout(() => {
      m();
    }, rr));
  }
  function w() {
    clearInterval(i), i = setInterval(() => {
      b();
    }, nr);
  }
  async function b() {
    if (!(r || !a))
      try {
        await ne(n, te.heartbeat, {
          session_id: a,
          session_token: s,
          revision: Number(e.directorRevision || 0)
        });
      } catch (T) {
        if (r) return;
        (T?.code === "UNKNOWN_SESSION" || T?.code === "BAD_SESSION_TOKEN") && (l(), m());
      }
  }
  async function y(T) {
    const A = T?.detail;
    if (r || !A || A.protocol !== tt || Number(A.schema_version) !== tr || A.session_id !== a || String(A.node_id) !== String(t.id)) return;
    let k;
    try {
      if (A.kind === "query")
        k = A.payload?.type === pt ? await or(e, A.payload) : e.directorApi.query(A.payload);
      else if (A.kind === "transaction") {
        const O = A.payload, M = (O?.operations || []).find(
          (L) => !rt.includes(L?.type)
        );
        if (!Number.isInteger(O?.baseRevision) || O.baseRevision < 0)
          k = re(
            e,
            "BASE_REVISION_REQUIRED",
            "External Agent transactions require baseRevision"
          );
        else if (M)
          k = re(
            e,
            "OPERATION_NOT_ADVERTISED",
            `External Agent transactions cannot use operation: ${M?.type}`
          );
        else {
          const L = await sr(e, O.operations);
          L.ok ? (k = e.directorApi.execute({ ...O, operations: L.operations }), await k?._reconciliation) : k = re(e, L.code, L.message);
        }
      } else
        k = re(e, "UNKNOWN_AGENT_REQUEST", `Unsupported Agent request kind: ${A.kind}`);
    } catch (O) {
      k = re(e, O?.code || "INTERNAL", O?.message || "OmniCam Agent request failed");
    }
    try {
      await ne(n, te.reply, {
        session_id: a,
        session_token: s,
        request_id: A.request_id,
        result: k
      });
    } catch {
    }
  }
  async function p(T, A) {
    if (!(!T || !A))
      try {
        await ne(n, te.close, {
          session_id: T,
          session_token: A
        });
      } catch {
      }
  }
  function x() {
    if (r) return;
    const T = d();
    if (T && o && T !== o) {
      const A = a, k = s;
      l(), p(A, k).finally(() => m());
    }
  }
  return n.addEventListener?.(nt, y), n.addEventListener?.("status", x), m(), {
    get sessionId() {
      return a;
    },
    dispose() {
      if (r) return;
      r = !0, clearInterval(i), clearTimeout(c), n.removeEventListener?.(nt, y), n.removeEventListener?.("status", x);
      const T = a, A = s;
      a = null, s = null, T && A && ne(n, te.close, {
        session_id: T,
        session_token: A
      }).catch(() => {
      });
    }
  };
}
const at = "majoor-omnicam-workbench-styles", cr = `
  .oc-workbench-backdrop,.oc-node-shell{${Dt}}
  .oc-workbench-backdrop{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(5,7,12,0.92)}
  .oc-workbench-window{display:flex;flex-direction:column;width:min(96vw,1920px);height:92dvh;min-width:0;min-height:0;max-width:100vw;max-height:100dvh;background:var(--oc-bg-app);border:1px solid var(--oc-border-default);border-radius:8px;box-shadow:0 24px 64px rgba(0,0,0,0.7);overflow:hidden;outline:none}
  .oc-workbench-window.is-maximized{width:100vw;height:100vh;min-width:0;min-height:0;border-radius:0;border:none}
  .oc-workbench-header{display:flex;align-items:center;gap:10px;min-height:40px;padding:6px 12px;background:var(--oc-bg-panel);border-bottom:1px solid var(--oc-border-default);flex:none}
  .oc-workbench-title{display:flex;align-items:center;gap:6px;flex:1 1 auto;min-width:0;overflow:hidden;color:var(--oc-text-primary);font:600 13px/1.4 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .oc-workbench-title-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-workbench-dirty-dot{flex:none;width:7px;height:7px;border-radius:50%;background:${B.warning}}
  .oc-workbench-actions{display:flex;align-items:center;gap:6px;flex:none}
  .oc-workbench-actions button{display:inline-grid;place-items:center;width:28px;height:28px;padding:0;color:var(--oc-text-secondary);background:var(--oc-bg-control);border:1px solid var(--oc-border-default);border-radius:6px;cursor:pointer;transition:all .15s ease}
  .oc-workbench-actions button:hover{background:var(--oc-bg-control);border-color:${B.accent};color:var(--oc-text-primary)}
  .oc-workbench-actions button:focus-visible{outline:2px solid ${B.accent};outline-offset:2px}
  /* auto, not hidden: the embedded editor's natural content height (built for
     a graph node that grows to fit it) can exceed a modest 92vh window on a
     short viewport. Clipping it with overflow:hidden would silently strand
     bottom controls (e.g. the sequence lane) outside the hit-testable area
     instead of just requiring a scroll to reach them. */
  .oc-workbench-content{position:relative;flex:1 1 auto;min-height:0;overflow:auto}
  .oc-workbench-content>*{width:100%;height:100%}
  /* Director's own root (.majoor-omnicam.oc-director, template.js/shell.js)
     is now a bounded flex column that fits this box on its own -- .oc-dock
     scrolls internally instead. Scoped by the host's own data-kind attribute
     (host.js) so Extractor/Monitor keep the overflow:auto fallback above,
     since their content still grows to fit the old always-mounted-node way. */
  .oc-workbench-backdrop[data-kind="director"] .oc-workbench-content{overflow:hidden}
  .oc-workbench-backdrop[data-kind="extractor"] .oc-workbench-content{overflow:hidden}
  .oc-workbench-backdrop[data-kind="monitor"] .oc-workbench-content{overflow:auto}

  .oc-node-shell{position:relative;display:flex;flex-direction:column;gap:6px;width:100%;height:100%;padding:8px 10px;box-sizing:border-box;font:12px/1.35 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:var(--oc-text-secondary);background:var(--oc-bg-panel);border:1px solid var(--oc-border-default);border-radius:8px;overflow:hidden}
  .oc-node-shell-preview{display:none;position:absolute;inset:0;z-index:0;width:100%;height:100%;object-fit:cover;border-radius:7px;pointer-events:none}
  .oc-node-shell[data-has-preview="true"] .oc-node-shell-preview{display:block}
  /* Dark scrim behind the text/controls only when a preview image is showing
     underneath them -- a flat rgba(0,0,0,..) gradient, not a semantic token,
     since it exists purely to keep white text legible over an arbitrary
     photo and has no light/dark-theme variant of its own. Explicit z-index
     stack (image 0, scrim 1, text/controls 2) rather than relying on DOM
     order, since ::before would otherwise paint before -- i.e. under -- the
     real <img> sibling that follows it. */
  .oc-node-shell[data-has-preview="true"]::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.35) 55%,rgba(0,0,0,0.72) 100%);border-radius:7px;pointer-events:none}
  .oc-node-shell[data-has-preview="true"] .oc-node-shell-title,
  .oc-node-shell[data-has-preview="true"] .oc-node-shell-meta,
  .oc-node-shell[data-has-preview="true"] .oc-node-shell-status{position:relative;z-index:2;color:#fff}
  .oc-node-shell[data-has-preview="true"] .oc-node-shell-open{position:relative;z-index:2}
  .oc-node-shell[data-has-preview="true"] .oc-node-shell-progress{z-index:2}
  .oc-node-shell-title{display:flex;align-items:center;gap:5px;font-weight:700;color:var(--oc-text-primary);overflow:hidden}
  .oc-node-shell-title-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-node-shell-dirty-dot{flex:none;width:6px;height:6px;border-radius:50%;background:${B.warning}}
  .oc-node-shell-meta{color:var(--oc-text-secondary);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-node-shell-status{color:var(--oc-text-secondary);font-size:11px}
  .oc-node-shell-progress{position:relative;height:5px;border-radius:3px;background:var(--oc-bg-control);border:1px solid var(--oc-border-default);overflow:hidden;display:none}
  .oc-node-shell-progress[data-active="true"]{display:block}
  .oc-node-shell-progress>span{display:block;height:100%;background:${B.accent};width:0%;transition:width .15s ease}
  .oc-node-shell-open{margin-top:auto;padding:6px 10px;border-radius:6px;background:${B.accent};border:1px solid ${B.accent};color:#fff;font-weight:600;cursor:pointer;transition:filter .15s ease}
  .oc-node-shell-open:hover{filter:brightness(1.12)}
  .oc-node-shell-open:focus-visible{outline:2px solid ${B.accent};outline-offset:2px}
`;
function gt(e = document) {
  if (e.getElementById(at)) return;
  const t = e.createElement("style");
  t.id = at, t.textContent = cr, e.head.append(t);
}
const lr = /* @__PURE__ */ new Set(["director"]);
function dr({ kind: e, title: t, buttonLabel: n, onOpen: r }) {
  gt(document);
  const a = document.createElement("div");
  a.className = "oc-node-shell", a.dataset.shellKind = e;
  const s = document.createElement("img");
  s.className = "oc-node-shell-preview", s.alt = "", s.draggable = !1;
  let o = null;
  lr.has(e) && (o = document.createElement("video"), o.className = "oc-node-shell-preview", o.muted = !0, o.loop = !0, o.playsInline = !0, o.disablePictureInPicture = !0, o.disableRemotePlayback = !0, o.style.display = "none");
  const i = document.createElement("div");
  i.className = "oc-node-shell-title";
  const c = document.createElement("span");
  c.className = "oc-node-shell-dirty-dot", c.hidden = !0, c.setAttribute("aria-hidden", "true");
  const h = document.createElement("span");
  h.className = "oc-node-shell-title-text", h.textContent = t ?? "", i.append(c, h);
  const d = document.createElement("div");
  d.className = "oc-node-shell-meta";
  const l = document.createElement("div");
  l.className = "oc-node-shell-status";
  const m = document.createElement("div");
  m.className = "oc-node-shell-progress";
  const g = document.createElement("span");
  m.append(g);
  const w = document.createElement("button");
  w.type = "button", w.className = "oc-node-shell-open", w.textContent = n ?? "Open", o ? a.append(s, o, i, d, l, m, w) : a.append(s, i, d, l, m, w);
  const b = new AbortController();
  w.addEventListener("click", (p) => r?.(p), { signal: b.signal });
  function y() {
    o && (o.pause(), o.removeAttribute("src"), o.load(), o.style.display = "none");
  }
  return {
    root: a,
    openButton: w,
    setTitle(p) {
      h.textContent = p ?? "";
    },
    setDirty(p) {
      c.hidden = !p, c.title = p ? j("Unsaved changes") : "";
    },
    setMeta(p) {
      d.textContent = p ?? "";
    },
    setStatus(p) {
      l.textContent = p ?? "";
    },
    // Still-frame path. Composes with setPreviewVideo(): setting one with a
    // value hides+stops the other, and clearing one only drops
    // data-has-preview when the other has nothing showing either.
    setPreview(p) {
      p ? (s.src = p, s.style.display = "block", y(), a.dataset.hasPreview = "true") : (s.removeAttribute("src"), s.style.display = "none", o?.getAttribute("src") || delete a.dataset.hasPreview);
    },
    // Live-looping playblast preview, Director/Monitor shells only -- a
    // no-op on an Extractor shell (no <video> was mounted). See setPreview()
    // for the composition rule between the two.
    setPreviewVideo(p) {
      o && (p ? (s.style.display = "none", o.autoplay = !0, o.src = p, o.style.display = "block", a.dataset.hasPreview = "true", o.play().catch(() => {
      })) : (y(), s.getAttribute("src") || delete a.dataset.hasPreview));
    },
    setProgress(p) {
      if (p == null) {
        m.dataset.active = "false";
        return;
      }
      m.dataset.active = "true";
      const x = Math.max(0, Math.min(1, p));
      g.style.width = `${(x * 100).toFixed(1)}%`;
    },
    dispose() {
      b.abort(), y();
    }
  };
}
const fr = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");
function ur(e) {
  return !!(e.offsetWidth || e.offsetHeight || e.getClientRects?.().length);
}
function mr(e) {
  return [...e.querySelectorAll(fr)].filter(ur);
}
function hr(e) {
  let t = !1, n = null, r = null;
  function a(s) {
    if (s.key !== "Tab") return;
    const o = mr(e);
    if (!o.length) {
      s.preventDefault(), e.focus();
      return;
    }
    const i = o[0], c = o[o.length - 1], h = e.ownerDocument?.activeElement ?? document.activeElement;
    s.shiftKey ? (h === i || !o.includes(h)) && (s.preventDefault(), c.focus()) : (h === c || !o.includes(h)) && (s.preventDefault(), i.focus());
  }
  return {
    activate() {
      t || (t = !0, n = document.activeElement, r = new AbortController(), e.addEventListener("keydown", a, { signal: r.signal }));
    },
    deactivate() {
      if (!t) return;
      t = !1, r?.abort(), r = null;
      const s = n;
      n = null, s && typeof s.focus == "function" && s.isConnected && s.focus();
    },
    get active() {
      return t;
    }
  };
}
class _r {
  constructor({ kind: t, nodeId: n, title: r, onRequestClose: a, onResize: s }) {
    this.kind = t, this.nodeId = String(n), this.title = r, this.onRequestClose = a, this.onResize = s, this.backdrop = null, this.window = null, this.content = null, this.disposed = !1, this._maximized = !1, this.abort = null, this.focusTrap = null;
  }
  mount(t) {
    if (this.disposed) throw new Error("WorkbenchHost is disposed");
    if (this.backdrop) return;
    gt(document);
    const n = document.createElement("div");
    n.className = "oc-workbench-backdrop", n.dataset.kind = this.kind, n.dataset.nodeId = this.nodeId, n.setAttribute("role", "dialog"), n.setAttribute("aria-modal", "true");
    const r = `oc-workbench-title-${this.kind}-${this.nodeId}`;
    n.setAttribute("aria-labelledby", r), n.innerHTML = `
      <section class="oc-workbench-window" tabindex="-1">
        <header class="oc-workbench-header">
          <div id="${r}" class="oc-workbench-title">
            <span class="oc-workbench-dirty-dot" aria-hidden="true" hidden></span>
            <span class="oc-workbench-title-text"></span>
          </div>
          <div class="oc-workbench-actions">
            <button type="button" data-workbench-act="maximize" aria-label="${He(j("Maximize workbench"))}">[ ]</button>
            <button type="button" data-workbench-act="close" aria-label="${He(j("Close workbench"))}">x</button>
          </div>
        </header>
        <div class="oc-workbench-content"></div>
      </section>`, this.backdrop = n, this.window = n.querySelector(".oc-workbench-window"), this.content = n.querySelector(".oc-workbench-content"), this.setTitle(this.title), this.content.append(t), document.body.append(n), this.abort = new AbortController();
    const { signal: a } = this.abort;
    n.querySelector('[data-workbench-act="close"]')?.addEventListener("click", () => {
      this.requestClose("button");
    }, { signal: a }), n.querySelector('[data-workbench-act="maximize"]')?.addEventListener("click", () => this.setMaximized(!this._maximized), { signal: a }), n.addEventListener("keydown", (s) => {
      s.key === "Escape" && (s.stopPropagation(), this.requestClose("escape"));
    }, { signal: a, capture: !0 }), window.addEventListener("resize", () => this.onResize?.(), { signal: a }), this.focusTrap = hr(this.window), this.focusTrap.activate(), this.window.focus(), requestAnimationFrame(() => this.onResize?.());
  }
  async requestClose(t = "user") {
    return !this.backdrop || this.disposed ? !0 : await this.onRequestClose?.(t) === !1 ? !1 : (this.dispose(), !0);
  }
  setTitle(t) {
    this.title = String(t || "OmniCam");
    const n = this.backdrop?.querySelector(".oc-workbench-title-text");
    n && (n.textContent = this.title);
  }
  // Dirty dot next to the workbench title (spec section 05, top bar "nom
  // scène + dirty state"). A dot rather than a text suffix so it never fights
  // a locale's word order, matching the compact node shell's own dirty dot.
  setDirty(t) {
    const n = this.backdrop?.querySelector(".oc-workbench-dirty-dot");
    n && (n.hidden = !t, n.title = t ? j("Unsaved changes") : "");
  }
  setBusy(t) {
    this.backdrop && (this.backdrop.dataset.busy = t ? "true" : "false");
  }
  setMaximized(t) {
    this._maximized = !!t, this.window?.classList.toggle("is-maximized", this._maximized), requestAnimationFrame(() => this.onResize?.());
  }
  focus() {
    this.window?.focus();
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.focusTrap?.deactivate(), this.abort?.abort(), this.backdrop?.remove(), this.backdrop = this.window = this.content = null);
  }
  get mounted() {
    return !!this.backdrop;
  }
  get maximized() {
    return this._maximized;
  }
  get contentElement() {
    return this.content;
  }
}
class pr {
  constructor() {
    this._active = null, this._tail = Promise.resolve(), this._pending = /* @__PURE__ */ new Set();
  }
  get activeKey() {
    return this._active?.key ?? null;
  }
  get activeSession() {
    return this._active;
  }
  _enqueue(t) {
    const n = this._tail.then(t);
    return this._tail = n.catch(() => {
    }), n;
  }
  open({ key: t, nodeId: n = t, opener: r, createSession: a }) {
    const s = { nodeId: String(n), cancelled: !1 };
    return this._pending.add(s), this._enqueue(() => this._open(s, { key: t, opener: r, createSession: a })).finally(() => this._pending.delete(s));
  }
  async _open(t, { key: n, opener: r, createSession: a }) {
    if (t.cancelled) return null;
    if (this._active?.key === n)
      return this._active.host?.focus?.(), this._active;
    if (this._active && !await this._closeSession(this._active, "switch") || t.cancelled) return null;
    const s = await a();
    return s ? t.cancelled ? (s.dispose?.(), null) : (s.opener = r ?? null, this._active = s, s) : null;
  }
  close(t, n = "programmatic") {
    return this._enqueue(() => !this._active || this._active.key !== t ? !0 : this._closeSession(this._active, n));
  }
  closeActive(t = "switch") {
    return this._enqueue(() => this._active ? this._closeSession(this._active, t) : !0);
  }
  disposeForNode(t) {
    for (const n of this._pending)
      n.nodeId === String(t) && (n.cancelled = !0);
    this._active && String(this._active.nodeId) === String(t) && (this._active.dispose?.(), this._active = null);
  }
  async _closeSession(t, n) {
    return await t.close?.(n) === !1 ? !1 : (this._active === t && (this._active = null), t.opener?.focus?.(), !0);
  }
}
const Me = new pr();
function gr(e) {
  for (const t of ["state_json", "recording_path", "card_asset"]) {
    const n = e.widgets?.find((r) => r.name === t);
    n && (n.computeSize = () => [0, -4], n.draw = () => {
    }, n.hidden = !0, n.options = { ...n.options || {}, hideInVueNodes: !0 });
  }
}
function q(e) {
  const t = e.getSnapshot(), n = [];
  t.fps && n.push(`${t.fps} fps`), t.durationSeconds && n.push(`${t.durationSeconds.toFixed(1)} s`), t.width && t.height && n.push(`${t.width}x${t.height}`), e.shell?.setTitle(t.sceneName || j("OmniCam Director")), e.shell?.setDirty(t.isDirty), e.shell?.setMeta(n.join("  |  ")), e.shell?.setStatus(
    `${t.cameraCount} ${j("cameras")}  |  ${t.objectCount} ${j("objects")}`
  ), e.activeWorkbenchHost?.setTitle(t.sceneName || j("OmniCam Director")), e.activeWorkbenchHost?.setDirty(t.isDirty), e.previewVideoUrl ? e.shell?.setPreviewVideo(e.previewVideoUrl) : (e.shell?.setPreviewVideo(null), e.shell?.setPreview(t.previewDataUrl ?? null));
}
const st = 240, ot = 135;
function br(e, t) {
  try {
    const n = t?.canvas;
    if (!n || !n.width || !n.height) return;
    const r = document.createElement("canvas");
    r.width = st, r.height = ot;
    const a = r.getContext("2d");
    if (!a) return;
    a.drawImage(n, 0, 0, st, ot), e.previewDataUrl = r.toDataURL("image/webp", 0.7), q(e);
  } catch (n) {
    console.warn("[OmniCam] Director preview capture failed", n);
  }
}
function it(e, t) {
  try {
    const n = Ut(ye, e.node);
    if (n) {
      e.previewVideoUrl = n.url, q(e);
      return;
    }
  } catch (n) {
    console.warn("[OmniCam] Director playblast preview lookup failed", n);
  }
  e.previewVideoUrl = null, br(e, t);
}
function ct(e) {
  return `director:${e.id}`;
}
async function Er(e, t) {
  return Me.open({
    key: ct(e.node),
    nodeId: e.node.id,
    opener: t,
    createSession: async () => {
      const n = ++e.workbenchGeneration, { openDirectorWorkbench: r, closeDirectorWorkbench: a } = await import("./chunk-Yta5eU-O.js").then((c) => c.h);
      if (e.disposed || n !== e.workbenchGeneration) return null;
      const s = r(e);
      e.pendingUpstreamResync && (e.pendingUpstreamResync = !1, s.syncUpstreamInputs?.());
      const o = ct(e.node), i = new _r({
        kind: "director",
        nodeId: e.node.id,
        title: e.getSnapshot().sceneName || j("OmniCam Director"),
        onRequestClose: (c) => Me.close(o, c),
        onResize: () => s.scheduleResizeAndRender?.()
      });
      return i.mount(s.root), e.activeWorkbenchHost = i, i.setDirty(e.isDirty), {
        key: o,
        nodeId: e.node.id,
        host: i,
        close: async () => s.recording ? (s.setStatus?.(j("Cannot close Director while a playblast is recording")), !1) : (s.serialize?.(), it(e, s), a(s), e.activeWorkbenchHost === i && (e.activeWorkbenchHost = null), i.dispose(), !0),
        dispose: () => {
          it(e, s), a(s), e.activeWorkbenchHost === i && (e.activeWorkbenchHost = null), i.dispose();
        }
      };
    }
  });
}
function wr(e) {
  if (e.__majoorOmniCamDirectorRuntime) return e.__majoorOmniCamDirectorRuntime;
  const t = new Bt(e, { app: bt, api: ye });
  er(t);
  try {
    t.agentBridge = ir(t, e, ye);
  } catch (m) {
    console.warn("[OmniCam] Agent bridge unavailable", m);
  }
  gr(e);
  const n = dr({
    kind: "director",
    title: j("OmniCam Director"),
    buttonLabel: j("OPEN DIRECTOR"),
    onOpen: (m) => {
      Er(t, m.currentTarget);
    }
  });
  t.shell = n, q(t), t.addEventListener("statechange", () => q(t)), t.addEventListener("statuschange", () => q(t)), t.addEventListener("upstreamchange", () => q(t)), e.__majoorOmniCamDirectorRuntime = t, e.addDOMWidget("majoor_omnicam_director_shell", "omnicam", n.root, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => 124,
    getHeight: () => 124,
    getMaxHeight: () => 124
  });
  const r = () => {
    cancelAnimationFrame(t.restoreFrame), t.restoreFrame = requestAnimationFrame(() => {
      t.disposed || (t.workbench ? (t.workbench.restoreFromWidgets(), t.workbench.syncUpstreamInputs()) : (t.restoreFromWidgetsHeadless(), t.pendingUpstreamResync = !0));
    });
  }, a = e.onConfigure;
  e.onConfigure = function(...m) {
    a?.apply(this, m), r();
  };
  const s = e.onAfterGraphConfigured;
  e.onAfterGraphConfigured = function(...m) {
    s?.apply(this, m), r();
  };
  const o = () => {
    clearTimeout(t.connectionTimer), t.connectionTimer = setTimeout(() => {
      t.disposed || (t.workbench ? t.workbench.syncUpstreamInputs() : t.pendingUpstreamResync = !0, e.setDirtyCanvas?.(!0, !0));
    }, 60);
  }, i = e.onConnectionsChange;
  e.onConnectionsChange = function(...m) {
    i?.apply(this, m), o();
  };
  const c = Mt(e, o), h = e.onResize;
  e.onResize = function(...m) {
    h?.apply(this, m), t.workbench?.scheduleResizeAndRender?.();
  };
  const d = e.onExecuted;
  e.onExecuted = function(m) {
    d?.apply(this, arguments), t.workbench && (t.workbench.loadExecutionPreview(m), t.workbench.syncUpstreamInputs());
  };
  const l = e.onRemoved;
  return e.onRemoved = function(...m) {
    Me.disposeForNode(e.id), c(), cancelAnimationFrame(t.restoreFrame), clearTimeout(t.connectionTimer), t.agentBridge?.dispose?.(), n.dispose(), t.dispose(), l?.apply(this, m);
  }, t;
}
const $r = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attachDirectorShell: wr
}, Symbol.toStringTag, { value: "Module" }));
export {
  Nr as C,
  Lt as E,
  ft as S,
  f as U,
  Tn as a,
  Te as b,
  dn as c,
  jr as d,
  Fr as e,
  Pr as f,
  Br as g,
  Rr as h,
  Mn as i,
  Lr as j,
  On as k,
  Ur as l,
  Sr as m,
  Mr as n,
  Ne as o,
  Or as p,
  $r as q,
  Dr as r,
  he as s,
  Cr as w
};
