import { app as bt } from "../../scripts/app.js";
import { api as ye } from "../../scripts/api.js";
import { s as se, a as ae, c as Et, d as De, b as wt, e as ue, f as At, l as $e, n as be, g as ze, h as Q, m as pe, I as fe, D as yt, r as Tt, p as It, t as kt, i as vt, j as Nt, k as St, w as Rt, o as xe, q as Ot, u as Ct, T as B, v as j } from "./chunk-D9faitIi.js";
import { s as jt, w as Mt } from "./chunk-Dk3qBM44.js";
import { H as Dt } from "./chunk-_f2VoZbc.js";
import { e as He, d as Ut } from "./chunk-B9b32Nbr.js";
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
    let s = null;
    try {
      s = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
    }
    this.state = se(s), this.sceneBaseline = this.stateWidget?.value || JSON.stringify(this.state), this.sceneName = this.state.metadata?.scene_name || "", this.frame = 0, this.camera = ae(this.state, 0), this.directorRevision = 0, this.renderRevision = 0, this.previewDataUrl = null, this.previewVideoUrl = null, this.history = new Lt({
      capture: () => this.workbench?.captureHistorySnapshot?.() ?? JSON.stringify({ state: this.state, frame: this.frame }),
      restore: (a) => {
        if (this.workbench) return this.workbench.restoreHistorySnapshot(a);
        const o = JSON.parse(a);
        this.state = se(o.state), this.frame = Et(o.frame, 0, this.state.duration_frames - 1), this.camera = ae(this.state, this.frame);
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
    this.state = se(t), this.camera = ae(this.state, Math.min(this.frame, this.state.duration_frames - 1)), this.sceneBaseline = this.stateWidget?.value ?? this.sceneBaseline, this.sceneName = this.state.metadata?.scene_name || "", this.dispatchEvent(new CustomEvent("upstreamchange", { detail: { reason: "restore" } }));
  }
  /** Apply a state mutation headlessly, whether or not a workbench is open. */
  mutate(t, { reason: n = "mutation", dirty: r = 0 } = {}) {
    t(this.state), this.scheduleSerialize(n), r && this.requestUiUpdate(r, n);
  }
  replaceState(t, { reason: n = "replace" } = {}) {
    this.state = se(t), this.sceneName = this.state.metadata?.scene_name || "", this.scheduleSerialize(n), this.dispatchEvent(new CustomEvent("upstreamchange", { detail: { reason: n } }));
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
}), lt = Object.freeze(Object.values(_)), k = Object.freeze({
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
}), Ft = Object.freeze(Object.values(k));
class d extends Error {
  constructor(t, n, r = null, s = null) {
    super(n), this.name = "DirectorApiError", this.code = t, this.operationIndex = r, this.details = s;
  }
}
const $t = /* @__PURE__ */ new Set(["good", "warning", "bad", "unknown"]);
function zt(e, t) {
  const n = Math.max(0, Math.floor(Number(t) || 0)), r = Array.from({ length: n }, (a, o) => ({ frame: o, state: "unknown", score: null })), s = e?.solve_health_v1;
  if (!s || !Array.isArray(s.frames)) return r;
  for (const a of s.frames) {
    const o = Number(a?.frame);
    if (!Number.isInteger(o) || o < 0 || o >= r.length) continue;
    const i = $t.has(a?.state) ? a.state : "unknown", c = a?.score;
    let h = null;
    if (c != null) {
      const m = Number(c);
      h = Number.isFinite(m) ? Math.max(0, Math.min(1, m)) : null;
    }
    r[o] = { frame: o, state: i, score: h };
  }
  return r;
}
const xt = 25, We = 100;
function J(e, t) {
  const n = e?.offset === void 0 ? 0 : Number(e.offset), r = e?.limit === void 0 ? xt : Number(e.limit);
  if (!Number.isInteger(n) || n < 0)
    throw new d(
      "BAD_QUERY",
      "offset must be a non-negative integer"
    );
  if (!Number.isInteger(r) || r < 1 || r > We)
    throw new d(
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
    case k.SCENE_GET:
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
    case k.SCENE_SUMMARY: {
      const r = n.objects || [], s = n.sequence?.cuts || n.cuts || [];
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
          character_count: r.filter((a) => a.asset_kind === "character").length,
          shot_count: s.length,
          motion_layer_count: (n.motion_layers || []).length,
          active_camera_id: n.active_camera_id || null,
          playblast_camera_id: n.playblast_camera_id || null
        }
      });
    }
    case k.CAMERA_GET: {
      const r = t.cameraId || n.active_camera_id, s = (n.cameras || []).find((a) => a.id === r);
      if (!s) throw new d("UNKNOWN_CAMERA", `Unknown camera: ${r}`);
      return N(e, { version: 1, type: t.type, camera: F(s) });
    }
    case k.CAMERA_LIST: {
      const r = n.cameras || [], { offset: s, limit: a, end: o } = J(t, r.length);
      return N(e, {
        version: 1,
        type: t.type,
        items: r.slice(s, o).map(Ht),
        total: r.length,
        offset: s,
        limit: a
      });
    }
    case k.TIMELINE_GET:
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
    case k.SELECTION_GET:
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
    case k.HEALTH_GET:
      return N(e, {
        version: 1,
        type: t.type,
        frames: zt(n.metadata, n.duration_frames)
      });
    case k.ASSET_LIST: {
      const r = t.kind ? String(t.kind) : null, s = (n.objects || []).filter((a) => a.asset_id && (!r || a.asset_kind === r)).map((a) => ({
        objectId: a.id,
        name: a.name || a.id,
        asset_id: a.asset_id,
        asset_kind: a.asset_kind || null,
        tags: Array.isArray(a.tags) ? [...a.tags] : [],
        position: Array.isArray(a.position) ? [...a.position] : [0, 0, 0],
        is_character: a.asset_kind === "character",
        has_motion: !!a.character?.motion
      }));
      return N(e, { version: 1, type: t.type, items: F(s), total: s.length });
    }
    case k.ASSET_GET: {
      const r = (n.objects || []).find((s) => s.id === t.objectId);
      if (!r) throw new d("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
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
    case k.CHARACTER_GET_RIG: {
      const r = (n.objects || []).find((a) => a.id === t.objectId);
      if (!r) throw new d("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      const s = r.character || null;
      return N(e, {
        version: 1,
        type: t.type,
        rig: F({
          objectId: r.id,
          asset_id: r.asset_id || null,
          asset_kind: r.asset_kind || null,
          is_character: r.asset_kind === "character",
          rig_profile: s?.rig_profile || null,
          pose_preset: s?.pose?.preset_id || null,
          has_motion: !!s?.motion
        })
      });
    }
    case k.CHARACTER_GET_POSE: {
      const r = (n.objects || []).find((a) => a.id === t.objectId);
      if (!r) throw new d("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      const s = r.character?.pose || {};
      return N(e, {
        version: 1,
        type: t.type,
        pose: F({
          objectId: r.id,
          preset_id: s.preset_id || "neutral",
          root_offset: Array.isArray(s.root_offset) ? s.root_offset : [0, 0, 0],
          joints: s.joints || {},
          has_motion: !!r.character?.motion
        })
      });
    }
    case k.OBJECT_LIST: {
      const r = n.objects || [], { offset: s, limit: a, end: o } = J(t, r.length);
      return N(e, {
        version: 1,
        type: t.type,
        items: r.slice(s, o).map(Ee),
        total: r.length,
        offset: s,
        limit: a
      });
    }
    case k.OBJECT_GET: {
      const r = (n.objects || []).find((s) => s.id === t.objectId);
      if (!r) throw new d("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
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
    case k.OBJECT_SEARCH: {
      const r = String(t.text || "").trim().toLowerCase(), s = Array.isArray(t.tags) ? t.tags.map((p) => String(p).toLowerCase()) : [], a = t.asset_kind !== void 0 ? t.asset_kind : null, o = t.type_ !== void 0 ? t.type_ : t.objectType !== void 0 ? t.objectType : null, i = typeof t.enabled == "boolean" ? t.enabled : null, c = (p) => {
        if (r && ![p.id, p.name || "", ...Array.isArray(p.tags) ? p.tags : []].map((b) => String(b).toLowerCase()).some((b) => b.includes(r)))
          return !1;
        if (s.length) {
          const y = (Array.isArray(p.tags) ? p.tags : []).map((b) => String(b).toLowerCase());
          if (!s.every((b) => y.includes(b))) return !1;
        }
        return !(a !== null && p.asset_kind !== a || o !== null && p.type !== o || i !== null && p.enabled !== !1 !== i);
      }, h = (n.objects || []).filter(c), { offset: m, limit: f, end: u } = J(t, h.length);
      return N(e, {
        version: 1,
        type: t.type,
        items: h.slice(m, u).map(Ee),
        total: h.length,
        offset: m,
        limit: f
      });
    }
    case k.CHARACTER_LIST: {
      const r = (n.objects || []).filter((i) => i.asset_kind === "character"), { offset: s, limit: a, end: o } = J(t, r.length);
      return N(e, {
        version: 1,
        type: t.type,
        items: r.slice(s, o).map((i) => ({
          ...Ee(i),
          has_motion: !!i.character?.motion,
          pose_preset: i.character?.pose?.preset_id || null
        })),
        total: r.length,
        offset: s,
        limit: a
      });
    }
    case k.SHOT_LIST: {
      const r = n.sequence?.cuts || n.cuts || [], s = Math.max(0, (n.duration_frames || 1) - 1), a = r.map((h, m) => ({
        index: m,
        start: h.start,
        end: m + 1 < r.length ? r[m + 1].start - 1 : s,
        camera_id: h.camera_id
      })), { offset: o, limit: i, end: c } = J(t, a.length);
      return N(e, {
        version: 1,
        type: t.type,
        items: a.slice(o, c),
        total: a.length,
        offset: o,
        limit: i
      });
    }
    case k.KEYFRAME_LIST: {
      const r = t.cameraId || n.active_camera_id, s = (n.cameras || []).find((h) => h.id === r);
      if (!s) throw new d("UNKNOWN_CAMERA", `Unknown camera: ${r}`);
      const a = s.keyframes || [], { offset: o, limit: i, end: c } = J(t, a.length);
      return N(e, {
        version: 1,
        type: t.type,
        cameraId: s.id,
        items: a.slice(o, c).map((h) => ({
          frame: h.frame,
          interpolation: h.interpolation,
          position: Array.isArray(h.camera?.position) ? [...h.camera.position] : [0, 0, 0]
        })),
        total: a.length,
        offset: o,
        limit: i
      });
    }
    default:
      throw new d("UNKNOWN_QUERY", `Unsupported query: ${t?.type}`);
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
      throw new d("DUPLICATE_ID", `${r} already exists`);
    return r;
  }
  let s = 1, a = `${t}_${s}`;
  for (; e.has(a); )
    s += 1, a = `${t}_${s}`;
  return a;
}
function Vt(e) {
  const t = e === "ground", n = e === "human", r = e === "card", s = e === "sun_light", a = e === "point_light", o = e === "spot_light";
  let i;
  t ? i = [12, 0.1, 12] : n ? i = [0.7, 1.8, 0.4] : r ? i = [2, 3] : i = [1.5, 1.5, 1.5];
  let c = [0, 0, 0], h = [0, 0, 0], m = "#8c929b", f, u, p, y;
  return s ? (c = [5, 8.5, 4], h = [-55, 35, 0], m = "#fff6ec", f = 2.2, u = !0) : a ? (c = [0, 3, 0], m = "#ffffff", f = 2, u = !1) : o && (c = [0, 4, 0], h = [-60, 0, 0], m = "#ffffff", f = 3, p = 45, y = 0.25, u = !0), {
    position: c,
    rotation: h,
    size: i,
    color: m,
    material_mode: t ? "checker" : "textured",
    ...f !== void 0 ? { intensity: f } : {},
    ...u !== void 0 ? { cast_shadow: u } : {},
    ...p !== void 0 ? { cone_angle: p } : {},
    ...y !== void 0 ? { penumbra: y } : {}
  };
}
function Jt(e, t) {
  e.cameras ||= [];
  const n = new Set(e.cameras.map((o) => o.id)), r = ge(n, "camera", t.id), s = { ...wt(), ...t.camera || {} }, a = {
    id: r,
    name: t.name || r,
    color: "#4aa3ef",
    locked: !1,
    muted: !1,
    solo: !1,
    camera: s,
    keyframes: [{ frame: 0, camera: ue(s), interpolation: t.interpolation || "ease" }]
  };
  return e.cameras.push(a), { cameraId: r };
}
function Gt(e, t) {
  const n = (e.cameras || []).find((o) => o.id === t.cameraId);
  if (!n) throw new d("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  const r = new Set(e.cameras.map((o) => o.id)), s = ge(r, "camera", t.id), a = JSON.parse(JSON.stringify(n));
  return a.id = s, a.name = t.name || `${n.name || n.id} copy`, e.cameras.push(a), { cameraId: s };
}
function Yt(e, t) {
  const n = e.cameras || [], r = n.findIndex((a) => a.id === t.cameraId);
  if (r === -1) throw new d("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  if (n.length <= 1) throw new d("LAST_CAMERA", "cannot delete the only camera");
  if (n[r].locked) throw new d("ENTITY_LOCKED", `${t.cameraId} is locked`);
  if ((e.sequence?.cuts || []).some((a) => a.camera_id === t.cameraId))
    throw new d("CAMERA_IN_USE", `${t.cameraId} is referenced by a cut`);
  return n.splice(r, 1), e.active_camera_id === t.cameraId && (e.active_camera_id = n[0].id), e.playblast_camera_id === t.cameraId && (e.playblast_camera_id = n[0].id), { cameraId: t.cameraId };
}
function qt(e, t) {
  const n = (e.cameras || []).find((r) => r.id === t.cameraId);
  if (!n) throw new d("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  return n.name = String(t.name || "").trim().slice(0, 80) || n.name, { cameraId: n.id };
}
function Qt(e, t) {
  const n = "__sequence__";
  if (t.cameraId === n) {
    if (!(e.sequence?.cuts || []).length)
      throw new d("NO_CUTS", "the sequence has no cuts to play back");
    return e.playblast_camera_id = n, { cameraId: n };
  }
  const r = (e.cameras || []).find((s) => s.id === t.cameraId);
  if (!r) throw new d("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  return e.playblast_camera_id = r.id, { cameraId: r.id };
}
function Xt(e, t) {
  if (!dt.has(t.objectType))
    throw new d("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${t.objectType}`);
  e.objects ||= [];
  const n = new Set(e.objects.map((o) => o.id)), r = ge(n, t.objectType, t.id), s = Vt(t.objectType), a = {
    id: r,
    type: t.objectType,
    name: t.name || r,
    ...s,
    ...t.position ? { position: [...t.position] } : {},
    ...t.rotation ? { rotation: [...t.rotation] } : {},
    keyframes: [],
    enabled: !0,
    locked: !1
  };
  return e.objects.push(a), { objectId: r };
}
function Zt(e, t) {
  const n = (e.objects || []).find((c) => c.id === t.objectId);
  if (!n) throw new d("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  const r = new Set(e.objects.map((c) => c.id)), s = ge(r, n.type || "object", t.id), a = Array.isArray(t.offset) ? t.offset : [0.35, 0, 0.35], o = JSON.parse(JSON.stringify(n));
  o.id = s, o.name = t.name || `${n.name || n.id} copy`, o.locked = !1;
  const i = Array.isArray(n.position) ? n.position : [0, 0, 0];
  return o.position = [i[0] + a[0], i[1] + a[1], i[2] + a[2]], e.objects.push(o), { objectId: s, resourceRefresh: !!n.asset_id };
}
function en(e, t) {
  const n = e.objects || [], r = n.findIndex((a) => a.id === t.objectId);
  if (r === -1) throw new d("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  const s = n[r];
  if (s.id === "subject") throw new d("PROTECTED_OBJECT", "the subject object cannot be deleted");
  if (s.locked) throw new d("ENTITY_LOCKED", `${t.objectId} is locked`);
  for (const a of n)
    a.parent_id === t.objectId && (a.parent_id = null);
  return n.splice(r, 1), { objectId: t.objectId, resourceRefresh: !!s.asset_id };
}
function tn(e, t) {
  const n = (e.objects || []).find((r) => r.id === t.objectId);
  if (!n) throw new d("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  return n.name = String(t.name || "").trim().slice(0, 80) || n.name, { objectId: n.id };
}
function nn(e, t) {
  const n = (e.objects || []).find((i) => i.id === t.objectId);
  if (!n) throw new d("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  if (t.parentId === null || t.parentId === void 0)
    return n.parent_id = null, { objectId: n.id };
  if (t.parentId === t.objectId)
    throw new d("INVALID_PARENT", "an object cannot be its own parent");
  const r = (e.objects || []).find((i) => i.id === t.parentId);
  if (!r) throw new d("UNKNOWN_OBJECT", `${t.parentId} does not exist`);
  const s = new Map(e.objects.map((i) => [i.id, i]));
  let a = r;
  const o = /* @__PURE__ */ new Set();
  for (; a; ) {
    if (a.id === t.objectId)
      throw new d("INVALID_PARENT", "assigning this parent would create a cycle");
    if (o.has(a.id)) break;
    o.add(a.id), a = a.parent_id ? s.get(a.parent_id) : null;
  }
  return n.parent_id = t.parentId, { objectId: n.id };
}
function rn(e, t) {
  e.sequence ||= De();
  const n = e.sequence.cuts ||= [], r = Math.max(0, (e.duration_frames || 1) - 1);
  if (!Number.isInteger(t.start) || t.start < 0 || t.start > r)
    throw new d("FRAME_OUT_OF_RANGE", `cut start must be within 0..${r}`);
  if (!(e.cameras || []).find((o) => o.id === t.cameraId)) throw new d("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  const a = n.find((o) => o.start === t.start);
  return a ? a.camera_id = t.cameraId : n.push({ start: t.start, camera_id: t.cameraId }), n.sort((o, i) => o.start - i.start), e.sequence.enabled = !0, { start: t.start, cameraId: t.cameraId };
}
function sn(e, t) {
  e.sequence ||= De();
  const n = e.sequence.cuts || [], r = n.findIndex((s) => s.start === t.start);
  if (r === -1) throw new d("UNKNOWN_CUT", `no cut starts at frame ${t.start}`);
  return n.splice(r, 1), n.length && (n[0].start = 0), e.sequence.enabled = n.length > 0, { start: t.start };
}
function an(e, t) {
  e.sequence ||= De();
  const r = (e.sequence.cuts || []).find((a) => a.start === t.start);
  if (!r) throw new d("UNKNOWN_CUT", `no cut starts at frame ${t.start}`);
  if (!(e.cameras || []).find((a) => a.id === t.cameraId)) throw new d("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
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
  const n = [...e.position], r = Array.isArray(t) ? [...t] : [...e.target], s = At(r, n), a = $e(s) > 1e-9 ? be(s) : [0, 0, -1];
  let o = ze(a, Ue);
  $e(o) < 1e-6 && (o = [1, 0, 0]), o = be(o);
  const i = be(ze(o, a));
  return { position: n, target: r, forward: a, right: o, up: i };
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
  const r = n === "out" ? -1 : 1, s = Q(e.position, pe(e.forward, r * t));
  return [
    { position: e.position, target: e.target },
    { position: s, target: e.target }
  ];
}
function Je(e, t, n) {
  const r = n === "right" ? 1 : -1, s = pe(e.right, r * t);
  return [
    { position: e.position, target: e.target },
    { position: Q(e.position, s), target: Q(e.target, s) }
  ];
}
function Ge(e, t, n) {
  const s = pe(Ue, (n === "down" ? -1 : 1) * t);
  return [
    { position: e.position, target: e.target },
    { position: Q(e.position, s), target: Q(e.target, s) }
  ];
}
function Ye(e, t, n) {
  const r = n === "down" ? -1 : 1, s = Q(e.position, pe(Ue, r * t));
  return [
    { position: e.position, target: e.target },
    { position: s, target: e.target }
  ];
}
function oe(e, { degrees: t = 180, direction: n = "cw", radius: r, radiusEnd: s, heightOffset: a = 0, samples: o = 5, close: i = !1 } = {}) {
  const c = e.target, h = e.position[0] - c[0], m = e.position[2] - c[2], f = Math.hypot(h, m) || 1e-6, u = Math.atan2(m, h), p = Number.isFinite(r) ? r : f, y = Number.isFinite(s) ? s : p, b = n === "ccw" ? 1 : -1, v = Math.abs(t) * Math.PI / 180 * b, w = Math.max(2, Math.round(o)), x = e.position[1] + a, A = [];
  for (let E = 0; E < w; E += 1) {
    const I = i ? E / w : E / (w - 1), O = u + v * I, M = p + (y - p) * I;
    A.push({
      position: [c[0] + Math.cos(O) * M, x, c[2] + Math.sin(O) * M],
      target: [...c]
    });
  }
  return A;
}
function dn({ type: e, camera: t, target: n, startFrame: r, endFrame: s, params: a = {} } = {}) {
  if (!Te.includes(e)) return { ok: !1, reason: "unknown_preset" };
  if (!t || !Array.isArray(t.position) || !Array.isArray(t.target)) return { ok: !1, reason: "invalid_camera" };
  const o = Math.round(Number(r)), i = Math.round(Number(s));
  if (!Number.isFinite(o) || !Number.isFinite(i) || i <= o) return { ok: !1, reason: "invalid_range" };
  const c = on(t, n), h = Number(a.distance) > 0 ? Number(a.distance) : 1, m = (b, v, w) => ({
    degrees: Number(a.degrees) || b,
    direction: v,
    radius: Number.isFinite(Number(a.radius)) ? Number(a.radius) : void 0,
    heightOffset: Number(a.heightOffset) || 0,
    samples: Number(a.samples) || w
  });
  let f;
  switch (e) {
    case "static":
      f = ln(c);
      break;
    case "dolly_in":
      f = Ve(c, h, "in");
      break;
    case "dolly_out":
      f = Ve(c, h, "out");
      break;
    case "truck_left":
      f = Je(c, h, "left");
      break;
    case "truck_right":
      f = Je(c, h, "right");
      break;
    case "pedestal_up":
      f = Ge(c, h, "up");
      break;
    case "pedestal_down":
      f = Ge(c, h, "down");
      break;
    case "crane_up":
      f = Ye(c, h, "up");
      break;
    case "crane_down":
      f = Ye(c, h, "down");
      break;
    case "arc_left":
      f = oe(c, m(45, "ccw", 5));
      break;
    case "arc_right":
      f = oe(c, m(45, "cw", 5));
      break;
    case "orbit":
      f = oe(c, { ...m(180, a.direction === "ccw" ? "ccw" : "cw", 5), close: !!a.close });
      break;
    case "spiral":
      f = oe(c, {
        ...m(360, a.direction === "ccw" ? "ccw" : "cw", 8),
        radiusEnd: Number.isFinite(Number(a.radiusEnd)) ? Number(a.radiusEnd) : void 0
      });
      break;
    default:
      return { ok: !1, reason: "unknown_preset" };
  }
  if (i - o + 1 < f.length) return { ok: !1, reason: "insufficient_frame_slots" };
  const u = f.map((b, v) => f.length <= 1 ? o : Math.round(o + (i - o) * v / (f.length - 1)));
  for (let b = 1; b < u.length; b += 1) u[b] <= u[b - 1] && (u[b] = u[b - 1] + 1);
  for (let b = u.length - 1; b > 0; b -= 1) u[b] > i - (u.length - 1 - b) && (u[b] = i - (u.length - 1 - b));
  u[0] = o, u[u.length - 1] = i;
  const p = cn(t);
  return { ok: !0, keyframes: f.map((b, v) => ({
    frame: u[v],
    interpolation: "smooth",
    camera: { position: b.position, target: b.target, ...p }
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
function T(e, t, n) {
  if (!Array.isArray(e) || e.length !== 3 || !e.every(K))
    throw new d("BAD_VECTOR", `${t} must be [x,y,z] of finite numbers`, n);
}
function S(e, t, n) {
  if (!Number.isInteger(e) || e < 0)
    throw new d("BAD_FRAME", `${t} must be a non-negative integer frame`, n);
}
function g(e, t, n, r) {
  if (typeof e != "string" || e.length === 0)
    throw new d("BAD_ID", `${t} must be a non-empty string`, n);
  if (r !== void 0 && e.length > r)
    throw new d("BAD_ID", `${t} exceeds ${r} characters`, n);
}
function Y(e, t, n) {
  if (!K(e))
    throw new d("BAD_VALUE", `${t} must be a finite number`, n);
}
function qe(e, t, n) {
  if (!Array.isArray(e) || e.length === 0 || !e.every((r) => Number.isInteger(r) && r >= 0))
    throw new d("BAD_VALUE", `${t} must be a non-empty array of non-negative integer frames`, n);
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
      throw new d("BAD_VALUE", `camera.create: unsupported camera field "${n}"`, t);
  if (e.position !== void 0 && T(e.position, "camera.position", t), e.target !== void 0 && T(e.target, "camera.target", t), e.up !== void 0 && T(e.up, "camera.up", t), e.fov !== void 0 && (Y(e.fov, "camera.fov", t), e.fov < 1 || e.fov > 179))
    throw new d("BAD_VALUE", "camera.fov must be within 1..179", t);
  if (e.roll !== void 0 && Y(e.roll, "camera.roll", t), e.zoom !== void 0 && (Y(e.zoom, "camera.zoom", t), e.zoom <= 0))
    throw new d("BAD_VALUE", "camera.zoom must be > 0", t);
  if (e.near !== void 0 && (Y(e.near, "camera.near", t), e.near <= 0))
    throw new d("BAD_VALUE", "camera.near must be > 0", t);
  if (e.far !== void 0) {
    Y(e.far, "camera.far", t);
    const n = e.near === void 0 ? yt : e.near;
    if (e.far <= n)
      throw new d("BAD_VALUE", "camera.far must be greater than camera.near", t);
  }
  if (e.camera_type !== void 0 && !Pt.includes(e.camera_type))
    throw new d("BAD_VALUE", `Unsupported camera_type: ${e.camera_type}`, t);
}
function gn(e, t) {
  if (!e || typeof e != "object" || Array.isArray(e))
    throw new d("BAD_OPERATION", "operation must be an object", t);
  const { type: n } = e;
  if (!lt.includes(n))
    throw new d("UNKNOWN_OPERATION", `Unknown operation type: ${n}`, t);
  switch (n) {
    case _.ASSET_INSTANTIATE: {
      const r = e.asset;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new d("BAD_VALUE", "asset.instantiate needs a resolved asset object", t);
      if (g(r.id, "asset.id", t), g(r.kind, "asset.kind", t), String(r.id).length > 120 || String(r.kind).length > 32)
        throw new d("BAD_VALUE", "asset.id / asset.kind exceed their bounds", t);
      if (r.tags !== void 0 && (!Array.isArray(r.tags) || r.tags.length > 32))
        throw new d("BAD_VALUE", "asset.tags must be a list of at most 32", t);
      if (r.animations !== void 0 && (!Array.isArray(r.animations) || r.animations.length > 256))
        throw new d("BAD_VALUE", "asset.animations must be a list of at most 256", t);
      if (r.rig !== void 0 && r.rig !== null) {
        if (typeof r.rig != "object" || Array.isArray(r.rig))
          throw new d("BAD_VALUE", "asset.rig must be an object", t);
        if (r.rig.bone_map && Object.keys(r.rig.bone_map).length > 128)
          throw new d("BAD_VALUE", "asset.rig.bone_map exceeds 128 entries", t);
      }
      e.point !== void 0 && T(e.point, "point", t), e.id !== void 0 && g(e.id, "id", t);
      break;
    }
    case _.CAMERA_SET_ACTIVE:
      g(e.cameraId, "cameraId", t);
      break;
    case _.CAMERA_SET_LOCKED:
      if (g(e.cameraId, "cameraId", t), typeof e.value != "boolean")
        throw new d("BAD_VALUE", "camera.set_locked needs a boolean value", t);
      break;
    case _.CAMERA_CREATE:
      if (e.id !== void 0 && g(e.id, "id", t, C), e.name !== void 0 && g(e.name, "name", t, V), e.camera !== void 0) {
        if (typeof e.camera != "object" || Array.isArray(e.camera) || e.camera === null)
          throw new d("BAD_VALUE", "camera.create camera must be an object", t);
        pn(e.camera, t);
      }
      if (e.interpolation !== void 0 && !fe.includes(e.interpolation))
        throw new d("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      break;
    case _.CAMERA_DUPLICATE:
      g(e.cameraId, "cameraId", t, C), e.id !== void 0 && g(e.id, "id", t, C), e.name !== void 0 && g(e.name, "name", t, V);
      break;
    case _.CAMERA_DELETE:
    case _.CAMERA_SET_PLAYBLAST:
      g(e.cameraId, "cameraId", t, C);
      break;
    case _.CAMERA_RENAME:
      g(e.cameraId, "cameraId", t, C), g(e.name, "name", t, V);
      break;
    case _.OBJECT_CREATE:
      if (g(e.objectType, "objectType", t), !dt.has(e.objectType))
        throw new d("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${e.objectType}`, t);
      if (e.asset !== void 0 || e.url !== void 0 || e.path !== void 0)
        throw new d("BAD_VALUE", "object.create does not accept asset/url/path -- use asset.instantiate", t);
      e.id !== void 0 && g(e.id, "id", t, C), e.name !== void 0 && g(e.name, "name", t, V), e.position !== void 0 && T(e.position, "position", t), e.rotation !== void 0 && T(e.rotation, "rotation", t);
      break;
    case _.OBJECT_DUPLICATE:
      g(e.objectId, "objectId", t, C), e.id !== void 0 && g(e.id, "id", t, C), e.name !== void 0 && g(e.name, "name", t, V), e.offset !== void 0 && T(e.offset, "offset", t);
      break;
    case _.OBJECT_DELETE:
      g(e.objectId, "objectId", t, C);
      break;
    case _.OBJECT_RENAME:
      g(e.objectId, "objectId", t, C), g(e.name, "name", t, V);
      break;
    case _.OBJECT_SET_PARENT:
      g(e.objectId, "objectId", t, C), e.parentId !== null && e.parentId !== void 0 && g(e.parentId, "parentId", t, C);
      break;
    case _.CAMERA_TRANSFORM:
      if (e.cameraId !== void 0 && g(e.cameraId, "cameraId", t), e.position !== void 0 && T(e.position, "position", t), e.target !== void 0 && T(e.target, "target", t), e.frame !== void 0 && S(e.frame, "frame", t), e.position === void 0 && e.target === void 0)
        throw new d("EMPTY_OPERATION", "camera.transform needs position and/or target", t);
      break;
    case _.CAMERA_LOOK_AT:
      if (e.cameraId !== void 0 && g(e.cameraId, "cameraId", t), e.point !== void 0 && T(e.point, "point", t), e.objectId !== void 0 && e.objectId !== null && g(e.objectId, "objectId", t), e.point === void 0 && e.objectId === void 0)
        throw new d("EMPTY_OPERATION", "camera.look_at needs a point or an objectId", t);
      break;
    case _.OBJECT_TRANSFORM:
      if (g(e.objectId, "objectId", t), e.position !== void 0 && T(e.position, "position", t), e.rotation !== void 0 && T(e.rotation, "rotation", t), e.scale !== void 0 && T(e.scale, "scale", t), e.position === void 0 && e.rotation === void 0 && e.scale === void 0)
        throw new d("EMPTY_OPERATION", "object.transform needs position, rotation and/or scale", t);
      break;
    case _.OBJECT_SET_ENABLED:
    case _.OBJECT_SET_LOCKED:
      if (g(e.objectId, "objectId", t), typeof e.value != "boolean")
        throw new d("BAD_VALUE", `${n} needs a boolean value`, t);
      break;
    case _.OBJECT_SET_TAGS:
      if (g(e.objectId, "objectId", t), !Array.isArray(e.tags) || e.tags.some((r) => typeof r != "string"))
        throw new d("BAD_VALUE", "object.set_tags needs a string array", t);
      if (e.tags.length > 64)
        throw new d("BAD_VALUE", "object.set_tags: too many tags", t);
      break;
    case _.OBJECT_SET_ANNOTATION:
      if (g(e.objectId, "objectId", t), e.annotation !== null && (typeof e.annotation != "object" || Array.isArray(e.annotation)))
        throw new d("BAD_VALUE", "object.set_annotation needs an object or null", t);
      break;
    case _.CHARACTER_SET_POSE:
      if (g(e.objectId, "objectId", t), e.pose !== null && (typeof e.pose != "object" || Array.isArray(e.pose)))
        throw new d("BAD_VALUE", "character.set_pose needs a pose object or null", t);
      break;
    case _.CHARACTER_SET_JOINT_ROTATION:
      if (g(e.objectId, "objectId", t), g(e.joint, "joint", t), !Array.isArray(e.rotation) || e.rotation.length !== 4 || !e.rotation.every(K))
        throw new d("BAD_QUATERNION", "rotation must be [x,y,z,w] of finite numbers", t);
      break;
    case _.CHARACTER_SET_MOTION: {
      g(e.objectId, "objectId", t);
      const r = e.motion;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new d("BAD_VALUE", "character.set_motion needs a motion object", t);
      g(r.clip_id, "motion.clip_id", t);
      for (const s of ["start_frame", "end_frame", "speed", "offset_seconds"])
        if (r[s] !== void 0 && !K(r[s]))
          throw new d("BAD_VALUE", `motion.${s} must be a finite number`, t);
      if (K(r.start_frame) && K(r.end_frame) && r.end_frame > 0 && r.end_frame <= r.start_frame)
        throw new d("BAD_MOTION_RANGE", "motion end_frame is not after start_frame", t);
      break;
    }
    case _.CHARACTER_CLEAR_MOTION:
      g(e.objectId, "objectId", t);
      break;
    case _.KEYFRAME_UPSERT:
      if (e.cameraId !== void 0 && g(e.cameraId, "cameraId", t), S(e.frame, "frame", t), e.interpolation !== void 0 && !fe.includes(e.interpolation))
        throw new d("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      if (e.camera !== void 0) {
        if (!e.camera || typeof e.camera != "object")
          throw new d("BAD_VALUE", "keyframe.upsert camera must be an object", t);
        e.camera.position !== void 0 && T(e.camera.position, "camera.position", t), e.camera.target !== void 0 && T(e.camera.target, "camera.target", t);
        for (const r of ["fov", "roll", "zoom", "near", "far"])
          if (e.camera[r] !== void 0 && !K(e.camera[r]))
            throw new d("BAD_VALUE", `camera.${r} must be finite`, t);
      }
      break;
    case _.KEYFRAME_REMOVE:
      e.cameraId !== void 0 && g(e.cameraId, "cameraId", t), S(e.frame, "frame", t);
      break;
    case _.KEYFRAME_SET_INTERPOLATION:
      if (e.cameraId !== void 0 && g(e.cameraId, "cameraId", t), S(e.frame, "frame", t), !fe.includes(e.interpolation))
        throw new d("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      break;
    case _.TIMELINE_SET_RANGE:
      if (S(e.start, "start", t), S(e.end, "end", t), e.end < e.start)
        throw new d("BAD_RANGE", "range end is before start", t);
      break;
    case _.TIMELINE_SET_DURATION:
      if (!Number.isInteger(e.frames) || e.frames < 1)
        throw new d("BAD_VALUE", "timeline.set_duration needs frames >= 1", t);
      break;
    case _.CUT_UPSERT:
      S(e.start, "start", t), g(e.cameraId, "cameraId", t);
      break;
    case _.CUT_REMOVE:
      S(e.start, "start", t);
      break;
    case _.CUT_SET_CAMERA:
      S(e.start, "start", t), g(e.cameraId, "cameraId", t);
      break;
    case _.CAMERA_PATH_TRANSFORM_KEYS: {
      e.cameraId !== void 0 && g(e.cameraId, "cameraId", t), qe(e.frames, "frames", t);
      const r = e.transform;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new d("BAD_VALUE", "camera.path.transform_keys needs a transform object", t);
      if (!hn.has(r.mode))
        throw new d("BAD_VALUE", "transform.mode must be translate, rotate or scale", t);
      r.mode === "translate" ? T(r.delta, "transform.delta", t) : r.mode === "scale" ? T(r.factors, "transform.factors", t) : T(r.rotationDeg, "transform.rotationDeg", t), r.origin !== void 0 && T(r.origin, "transform.origin", t);
      break;
    }
    case _.CAMERA_PATH_INSERT_KEY:
      e.cameraId !== void 0 && g(e.cameraId, "cameraId", t), S(e.leftFrame, "leftFrame", t), S(e.rightFrame, "rightFrame", t), e.t !== void 0 && Y(e.t, "t", t);
      break;
    case _.CAMERA_PATH_DELETE_KEYS:
      e.cameraId !== void 0 && g(e.cameraId, "cameraId", t), qe(e.frames, "frames", t);
      break;
    case _.CAMERA_PATH_REDISTRIBUTE_TIMING:
      e.cameraId !== void 0 && g(e.cameraId, "cameraId", t), e.startFrame !== void 0 && S(e.startFrame, "startFrame", t), e.endFrame !== void 0 && S(e.endFrame, "endFrame", t);
      break;
    case _.CAMERA_PATH_APPLY_PRESET:
      if (e.cameraId !== void 0 && g(e.cameraId, "cameraId", t), !Te.includes(e.presetType))
        throw new d("BAD_VALUE", `presetType must be one of: ${Te.join(", ")}`, t);
      if (S(e.startFrame, "startFrame", t), S(e.endFrame, "endFrame", t), e.endFrame <= e.startFrame)
        throw new d("BAD_RANGE", "camera.path.apply_preset endFrame must be after startFrame", t);
      if (e.target !== void 0 && T(e.target, "target", t), e.params !== void 0 && (typeof e.params != "object" || Array.isArray(e.params)))
        throw new d("BAD_VALUE", "camera.path.apply_preset params must be an object", t);
      break;
    default:
      throw new d("UNKNOWN_OPERATION", `Unknown operation type: ${n}`, t);
  }
}
function bn(e, t) {
  if (!t || typeof t != "object" || Array.isArray(t))
    throw new d("BAD_TRANSACTION", "transaction must be an object");
  if (t.version !== $)
    throw new d("UNSUPPORTED_VERSION", `Unsupported API version: ${t.version}`);
  if (typeof t.id != "string" || t.id.length === 0)
    throw new d("BAD_TRANSACTION_ID", "transaction id must be a non-empty string");
  if (mn(e, t.id))
    throw new d("DUPLICATE_TRANSACTION_ID", `transaction id already used: ${t.id}`);
  if (typeof t.description != "string" || t.description.trim().length === 0)
    throw new d("EMPTY_DESCRIPTION", "transaction description must not be empty");
  if (t.baseRevision !== void 0 && (!Number.isInteger(t.baseRevision) || t.baseRevision < 0))
    throw new d(
      "BAD_REVISION",
      "baseRevision must be a non-negative integer"
    );
  if (!Array.isArray(t.operations))
    throw new d("BAD_OPERATIONS", "operations must be an array");
  if (t.operations.length === 0)
    throw new d("NO_OPERATIONS", "transaction has no operations");
  if (t.operations.length > Ke)
    throw new d(
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
const l = Object.freeze({
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
  let s = `${r}_${n}`, a = 2;
  for (; t && t.has(s); ) s = `${r}_${n}_${a++}`;
  return s;
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
  const n = yn(t.point, [0, 0, 0]), r = String(t.idSeed || Date.now().toString(36)), s = String(e.kind || "prop"), a = s === "character", o = An[e.id];
  if (s === "helper" && !e.file && o && o !== "null")
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
      asset_kind: s,
      tags: [...e.tags || []]
    };
  const i = {
    id: Qe(s === "character" ? "character" : s, t.existingIds, r),
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
    asset_kind: s,
    tags: [...e.tags || []]
  };
  return a && (i.character = In(e)), i;
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
  const r = U(e), s = t ? U(t) : r, a = n ? U(n) : r, o = Math.max(Ie, R(e?.frame) - R(t?.frame, R(e?.frame) - 1)), i = Math.max(Ie, R(n?.frame, R(e?.frame) + 1) - R(e?.frame)), c = [0, 0, 0], h = [0, 0, 0];
  for (let m = 0; m < 3; m += 1) {
    const f = (r[m] - s[m]) / o, u = (a[m] - r[m]) / i;
    let p = (f + u) * 0.5;
    t ? n ? f * u <= 0 && (p = 0) : p = f : p = u, c[m] = p * i * (1 / 3), h[m] = -p * o * (1 / 3);
  }
  return { out: c, in: h };
}
function ut(e, t, n) {
  const r = U(e), s = t ? U(t) : r, a = n ? U(n) : r;
  return {
    out: me(X(a, r), 1 / 3),
    in: me(X(s, r), 1 / 3)
  };
}
function ve(e, t) {
  const n = e?.tangents?.channels;
  if (!n) return null;
  const r = t === "out" ? "out_y" : "in_y", s = [0, 0, 0];
  let a = !1;
  for (let o = 0; o < 3; o += 1) {
    const i = n[Le[o]];
    i && Number.isFinite(Number(i[r])) && (s[o] = Number(i[r]), a = !0);
  }
  return a ? s : null;
}
function he(e) {
  const t = e?.tangents?.spatial_mode;
  return ft.includes(t) ? t : "auto";
}
function Ne(e, t = null, n = null) {
  const r = he(e), s = U(e);
  if (r === "corner") {
    const c = ut(e, t, n);
    return { in: ie(s, c.in), out: ie(s, c.out), mode: r };
  }
  const a = ke(e, t, n), o = (r === "free" || r === "aligned") && ve(e, "out") || a.out, i = (r === "free" || r === "aligned") && ve(e, "in") || a.in;
  return { in: ie(s, i), out: ie(s, o), mode: r };
}
function ie(e, t) {
  return [e[0] + t[0], e[1] + t[1], e[2] + t[2]];
}
function vn(e) {
  return e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.channels = e.tangents.channels && typeof e.tangents.channels == "object" ? e.tangents.channels : {}, e.tangents.channels;
}
function W(e, t, n) {
  const r = vn(e);
  for (let s = 0; s < 3; s += 1) {
    const a = Le[s], o = r[a] && typeof r[a] == "object" ? r[a] : {};
    o.mode = "free", o.out_x = 1 / 3, o.in_x = -1 / 3, t === "out" ? o.out_y = n[s] : o.in_y = n[s], o.out_y === void 0 && (o.out_y = 0), o.in_y === void 0 && (o.in_y = 0), r[a] = o;
  }
}
function _e(e) {
  e.interpolation !== "bezier" && (e.interpolation = "bezier");
}
function mt(e, t, n) {
  const r = U(e), s = Ne(e, t, n);
  W(e, "out", X(s.out, r)), W(e, "in", X(s.in, r));
}
function Cr(e, t, n, { prevKey: r = null, nextKey: s = null, breakCoupling: a = !1 } = {}) {
  if (!e || t !== "in" && t !== "out") return e;
  let o = he(e);
  if (o === "corner") return e;
  o === "auto" && (o = "aligned", e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.spatial_mode = "aligned", mt(e, r, s));
  const i = U(e), c = X([
    R(n?.[0]),
    R(n?.[1]),
    R(n?.[2])
  ], i);
  if (_e(e), W(e, t, c), o === "aligned" && !a) {
    const h = t === "out" ? "in" : "out", m = ve(e, h) || (h === "out" ? ke(e, r, s).out : ke(e, r, s).in), f = Xe(c), u = Xe(m) || f || 1, p = f > Ie ? me(c, -u / f) : me(m, 1);
    W(e, h, p);
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
      for (const s of Le) delete e.tangents.channels[s];
      Object.keys(e.tangents.channels).length || delete e.tangents.channels;
    }
    return e.interpolation === "bezier" && (e.interpolation = "smooth"), e;
  }
  if (t === "corner") {
    const s = ut(e, n, r);
    return _e(e), W(e, "out", s.out), W(e, "in", s.in), e;
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
    let s = 1 / 0, a = -1 / 0;
    for (const i of e) {
      const c = Number.isFinite(i[r]) ? i[r] : 0;
      c < s && (s = c), c > a && (a = c);
    }
    const o = a - s;
    n[r] = o > ht ? 1 / o : 0;
  }
  return n;
}
function Be(e, t) {
  const n = e.map((o) => Nn(o, t)), r = Sn(n), s = e.map((o) => o.frame), a = Math.max(1, s[s.length - 1] - s[0]);
  return n.map((o, i) => [
    (s[i] - s[0]) / a,
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
  let s = 0;
  for (let i = 0; i < t.length; i += 1) s += (e[i] - t[i]) * (n[i] - t[i]);
  const a = Math.max(0, Math.min(1, s / r)), o = t.map((i, c) => i + (n[c] - i) * a);
  return Ze(e, o);
}
function Rn(e, t, n) {
  const r = /* @__PURE__ */ new Set([0, e.length - 1]), s = [[0, e.length - 1]];
  for (; s.length; ) {
    const [a, o] = s.pop();
    if (o - a < 2) continue;
    let i = -1, c = -1;
    for (let h = a + 1; h < o; h += 1) {
      const m = Pe(e[h], e[a], e[o]);
      m > i && (i = m, c = h);
    }
    c < 0 || (i > t || n.has(c)) && (r.add(c), s.push([a, c], [c, o]));
  }
  return r;
}
function Mr(e, t, { tolerance: n = 0.02, keepFrames: r = [] } = {}) {
  const s = [...e].sort((m, f) => m.frame - f.frame);
  if (s.length <= 2 || n <= 0) return { keys: s, removed: 0 };
  const a = Be(s, t), o = /* @__PURE__ */ new Set(), i = new Set(r);
  s.forEach((m, f) => {
    i.has(m.frame) && o.add(f);
  });
  const c = Rn(a, n, o);
  for (const m of o) c.add(m);
  const h = s.filter((m, f) => c.has(f));
  return { keys: h, removed: s.length - h.length };
}
function Dr(e, t, { target: n = 2, keepFrames: r = [] } = {}) {
  let s = [...e].sort((c, h) => c.frame - h.frame);
  const a = Math.max(2, Math.round(n));
  if (s.length <= a) return { keys: s, removed: 0 };
  const o = new Set(r), i = s.length;
  for (; s.length > a; ) {
    const c = Be(s, t);
    let h = -1, m = 1 / 0;
    for (let f = 1; f < s.length - 1; f += 1) {
      if (o.has(s[f].frame)) continue;
      const u = Pe(c[f], c[f - 1], c[f + 1]);
      u < m && (m = u, h = f);
    }
    if (h < 0) break;
    s = s.filter((f, u) => u !== h);
  }
  return { keys: s, removed: i - s.length };
}
function Ur(e, t, { mergeWithin: n = 1, epsilon: r = 1e-3, keepFrames: s = [] } = {}) {
  const a = [...e].sort((u, p) => u.frame - p.frame), o = a.length, i = new Set(s), c = [];
  for (const u of a) {
    const p = c[c.length - 1];
    p && u.frame - p.frame <= Math.max(0, n) && !i.has(u.frame) || c.push(u);
  }
  if (c.length <= 2) return { keys: c, removed: o - c.length };
  const h = Be(c, t), m = /* @__PURE__ */ new Set();
  for (let u = 1; u < c.length - 1; u += 1) {
    if (i.has(c[u].frame)) continue;
    const p = m.has(u - 1) ? null : u - 1;
    if (p === null) continue;
    Pe(h[u], h[p], h[u + 1]) <= r && m.add(u);
  }
  const f = c.filter((u, p) => !m.has(p));
  return { keys: f, removed: o - f.length };
}
function On(e, t, { minKeys: n = 0 } = {}) {
  const r = new Set(t), s = e.filter((a) => !r.has(a.frame));
  if (s.length < n) {
    const a = e.filter((o) => r.has(o.frame)).sort((o, i) => o.frame - i.frame);
    for (; s.length < n && a.length; ) s.push(a.shift());
    s.sort((o, i) => o.frame - i.frame);
  }
  return { keys: s, removed: e.length - s.length };
}
function Lr(e, t, n, { lastFrame: r = 1 / 0 } = {}) {
  const s = [...t].sort((m, f) => m - f);
  if (!n || !s.length)
    return { keys: [...e], moved: 0, frames: s };
  const a = new Set(s), o = new Set(e.filter((m) => !a.has(m.frame)).map((m) => m.frame)), i = s.map((m) => m + n);
  return i.some((m) => m < 0 || m > r || o.has(m)) || new Set(i).size !== i.length ? { keys: [...e], moved: 0, frames: s } : { keys: e.map((m) => a.has(m.frame) ? { ...m, frame: m.frame + n } : m).sort((m, f) => m.frame - f.frame), moved: s.length, frames: i.sort((m, f) => m - f) };
}
function Br(e, t, n) {
  const r = new Set(t);
  return e.map((s) => r.has(s.frame) ? { ...s, interpolation: n } : s);
}
function Pr(e, t, n, r = []) {
  const s = new Set(t);
  return e.map((a) => {
    if (!s.has(a.frame)) return a;
    const o = { mode: n, channels: { ...a.tangents?.channels || {} } };
    for (const c of r)
      o.channels[c] = { ...o.channels[c] || {}, mode: n };
    const i = n !== "auto" && a.interpolation !== "bezier" ? "bezier" : a.interpolation;
    return { ...a, interpolation: i, tangents: o };
  });
}
function G(e, t, n) {
  return [0, 1, 2].map((r) => e[r] + (t[r] - e[r]) * n);
}
function Cn(e, t, n, r, s) {
  const a = G(e, t, s), o = G(t, n, s), i = G(n, r, s), c = G(a, o, s), h = G(o, i, s), m = G(c, h, s);
  return { left: [e, a, c, m], right: [m, h, i, r], point: m };
}
function jn(e, t, n, r) {
  const s = new Set(e.map((i) => i.frame)), a = Math.min(n - 1, Math.max(t + 1, r));
  if (!s.has(a)) return a;
  const o = n - t;
  for (let i = 1; i < o; i += 1)
    for (const c of [a - i, a + i])
      if (!(c <= t || c >= n) && !s.has(c))
        return c;
  return -1;
}
function Mn(e, { leftFrame: t, rightFrame: n, t: r = 0.5 } = {}) {
  const s = [...e].sort((A, E) => A.frame - E.frame), a = s.findIndex((A) => A.frame === t), o = a >= 0 ? a + 1 : -1;
  if (a < 0 || o < 0 || o >= s.length || s[o].frame !== n)
    return { ok: !1, reason: "segment_not_found" };
  if (n - t < 2)
    return { ok: !1, reason: "no_free_frame" };
  const i = Math.min(0.999, Math.max(1e-3, Number.isFinite(r) ? r : 0.5)), c = Math.round(t + i * (n - t)), h = jn(s, t, n, c);
  if (h < 0) return { ok: !1, reason: "no_free_frame" };
  const m = (h - t) / (n - t), f = s[a], u = s[o], p = a > 0 ? s[a - 1] : null, y = o + 1 < s.length ? s[o + 1] : null, b = f.interpolation === "bezier" || u.interpolation === "bezier", v = ae({ keyframes: s }, h), w = { frame: h, interpolation: b ? "bezier" : f.interpolation, camera: v };
  if (b) {
    const A = [...f.camera.position], E = Ne(f, p, u).out, I = Ne(u, f, y).in, O = [...u.camera.position], M = Cn(A, E, I, O, m);
    w.camera = { ...ue(v), position: [...M.point] };
    const L = he(f);
    (L === "free" || L === "aligned") && ce(f, "out", M.left[1]);
    const Fe = he(u);
    (Fe === "free" || Fe === "aligned") && ce(u, "in", M.right[2]), ce(w, "in", M.left[2]), ce(w, "out", M.right[1]);
  }
  return { ok: !0, keys: [...s, w].sort((A, E) => A.frame - E.frame), frame: h };
}
function Dn(e, t) {
  const { keys: n, removed: r } = On(e, t, { minKeys: 1 });
  return { ok: r > 0, keys: n, removed: r };
}
function Se(e, t) {
  const n = t || e.active_camera_id, r = (e.cameras || []).find((s) => s.id === n);
  if (!r) throw new d("UNKNOWN_CAMERA", `${n} does not exist`);
  return r;
}
function Re(e, t) {
  const n = (e.objects || []).find((r) => r.id === t);
  if (!n) throw new d("UNKNOWN_OBJECT", `${t} does not exist`);
  return n;
}
function le(e, t) {
  const n = H(e, t);
  if (n.asset_kind !== "character")
    throw new d("NOT_A_CHARACTER", `${t} is not a character`);
  return n;
}
function D(e, t) {
  const n = Se(e, t);
  if (n.locked)
    throw new d("ENTITY_LOCKED", `${n.id} is locked`);
  return n;
}
function H(e, t) {
  const n = Re(e, t);
  if (n.locked)
    throw new d("ENTITY_LOCKED", `${n.id} is locked`);
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
const ee = l.viewport | l.previews | l.timeline | l.inspector;
function et(e, t, n) {
  const r = new Set((e.keyframes || []).map((a) => a.frame)), s = t.find((a) => !r.has(a));
  if (s !== void 0)
    throw new d("UNKNOWN_KEYFRAME", `${n}: camera has no key at frame ${s}`);
}
const Un = {
  [_.ASSET_INSTANTIATE](e, t) {
    const n = new Set((e.objects || []).map((s) => s.id));
    let r;
    try {
      r = kn(t.asset, { point: t.point, idSeed: t.id, existingIds: n });
    } catch (s) {
      throw new d("BAD_ASSET", `asset.instantiate could not compile: ${s.message}`);
    }
    return (e.objects ||= []).push(r), {
      dirtyMask: l.viewport | l.previews | l.outliner | l.inspector,
      outcome: { objectId: r.id, assetId: r.asset_id || null }
    };
  },
  [_.CAMERA_SET_ACTIVE](e, t) {
    return Se(e, t.cameraId), e.active_camera_id = t.cameraId, { dirtyMask: l.viewport | l.previews | l.inspector | l.outliner | l.timeline };
  },
  [_.CAMERA_SET_LOCKED](e, t) {
    return Se(e, t.cameraId).locked = t.value, { dirtyMask: l.outliner | l.inspector | l.viewport };
  },
  [_.CAMERA_CREATE](e, t) {
    const n = Jt(e, t);
    return { dirtyMask: l.outliner | l.inspector | l.viewport | l.previews | l.timeline, outcome: n };
  },
  [_.CAMERA_DUPLICATE](e, t) {
    const n = Gt(e, t);
    return { dirtyMask: l.outliner | l.inspector | l.viewport | l.previews | l.timeline, outcome: n };
  },
  [_.CAMERA_DELETE](e, t) {
    const n = Yt(e, t);
    return { dirtyMask: l.outliner | l.inspector | l.viewport | l.previews | l.timeline, outcome: n };
  },
  [_.CAMERA_RENAME](e, t) {
    D(e, t.cameraId);
    const n = qt(e, t);
    return { dirtyMask: l.outliner | l.inspector, outcome: n };
  },
  [_.CAMERA_SET_PLAYBLAST](e, t) {
    const n = Qt(e, t);
    return { dirtyMask: l.outliner | l.inspector | l.status, outcome: n };
  },
  [_.CAMERA_TRANSFORM](e, t) {
    const n = D(e, t.cameraId), r = we(n);
    if (t.position && (r.position = [...t.position]), t.target && (r.target = [...t.target]), Number.isInteger(t.frame)) {
      const s = de(n, t.frame);
      if (!s) throw new d("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
      s.camera = { ...s.camera }, t.position && (s.camera.position = [...t.position]), t.target && (s.camera.target = [...t.target]);
    }
    return { dirtyMask: l.viewport | l.previews | l.inspector | l.timeline };
  },
  [_.CAMERA_LOOK_AT](e, t) {
    const n = D(e, t.cameraId);
    if (t.objectId !== void 0 && (t.objectId === null || t.objectId === "" ? (n.target_object_id = null, n.id === e.active_camera_id && (e.target_object_id = null)) : (Re(e, t.objectId), n.target_object_id = t.objectId, n.id === e.active_camera_id && (e.target_object_id = t.objectId))), t.point) {
      const r = we(n);
      r.target = [...t.point];
      for (const s of n.keyframes || [])
        s.camera = { ...s.camera, target: [...t.point] };
    }
    return { dirtyMask: l.viewport | l.previews | l.inspector | l.timeline };
  },
  [_.OBJECT_CREATE](e, t) {
    const n = Xt(e, t);
    return { dirtyMask: l.viewport | l.previews | l.outliner | l.inspector, outcome: n };
  },
  [_.OBJECT_DUPLICATE](e, t) {
    const n = Zt(e, t);
    return { dirtyMask: l.viewport | l.previews | l.outliner | l.inspector, outcome: n };
  },
  [_.OBJECT_DELETE](e, t) {
    const n = en(e, t);
    return { dirtyMask: l.viewport | l.previews | l.outliner | l.inspector, outcome: n };
  },
  [_.OBJECT_RENAME](e, t) {
    H(e, t.objectId);
    const n = tn(e, t);
    return { dirtyMask: l.outliner | l.inspector, outcome: n };
  },
  [_.OBJECT_SET_PARENT](e, t) {
    H(e, t.objectId);
    const n = nn(e, t);
    return { dirtyMask: l.viewport | l.outliner | l.inspector, outcome: n };
  },
  [_.OBJECT_TRANSFORM](e, t) {
    const n = H(e, t.objectId);
    return t.position && (n.position = [...t.position]), t.rotation && (n.rotation = [...t.rotation]), t.scale && (n.size = [...t.scale]), { dirtyMask: l.viewport | l.previews | l.inspector };
  },
  [_.OBJECT_SET_ENABLED](e, t) {
    return H(e, t.objectId).enabled = t.value, { dirtyMask: l.viewport | l.previews | l.outliner | l.inspector };
  },
  [_.OBJECT_SET_LOCKED](e, t) {
    return Re(e, t.objectId).locked = t.value, { dirtyMask: l.outliner | l.inspector };
  },
  [_.OBJECT_SET_TAGS](e, t) {
    const n = H(e, t.objectId), r = Ct(t.tags), s = r.length !== t.tags.length ? "some tags were dropped or normalised" : void 0;
    return r.length ? n.tags = r : delete n.tags, { dirtyMask: l.outliner | l.inspector | l.viewport, warning: s };
  },
  [_.OBJECT_SET_ANNOTATION](e, t) {
    const n = H(e, t.objectId), r = t.annotation === null ? null : Ot(t.annotation);
    if (t.annotation && !r)
      throw new d("BAD_ANNOTATION", "annotation failed validation (text, hex colour, anchor)");
    return r ? n.annotation = r : delete n.annotation, { dirtyMask: l.viewport | l.outliner | l.inspector };
  },
  [_.CHARACTER_SET_POSE](e, t) {
    const n = le(e, t.objectId);
    if (n.character?.motion)
      throw new d("POSE_MOTION_EXCLUSIVE", "clear the motion clip before editing the pose");
    return n.character = {
      ...n.character || {},
      pose: t.pose === null ? xe(null) : xe(t.pose)
    }, { dirtyMask: l.viewport | l.previews | l.inspector };
  },
  [_.CHARACTER_SET_JOINT_ROTATION](e, t) {
    const n = le(e, t.objectId);
    if (n.character?.motion)
      throw new d("POSE_MOTION_EXCLUSIVE", "clear the motion clip before editing the pose");
    if (!St(t.rotation))
      throw new d("BAD_QUATERNION", "rotation is not a usable unit quaternion");
    return n.character = {
      ...n.character || {},
      pose: Rt(n.character?.pose, t.joint, t.rotation)
    }, { dirtyMask: l.viewport | l.previews | l.inspector };
  },
  [_.CHARACTER_SET_MOTION](e, t) {
    const n = le(e, t.objectId), r = Nt(t.motion);
    if (!r) throw new d("BAD_MOTION", "motion failed validation (clip_id, speed, range)");
    const s = n.character?.pose || {};
    return n.character = {
      ...n.character || {},
      pose: { preset_id: s.preset_id || "neutral", root_offset: s.root_offset || [0, 0, 0], joints: {} },
      motion: r
    }, { dirtyMask: l.viewport | l.previews | l.timeline | l.inspector };
  },
  [_.CHARACTER_CLEAR_MOTION](e, t) {
    const n = le(e, t.objectId);
    return n.character ? (n.character = { ...n.character, motion: null }, { dirtyMask: l.viewport | l.previews | l.timeline | l.inspector }) : { dirtyMask: 0 };
  },
  [_.KEYFRAME_UPSERT](e, t) {
    const n = D(e, t.cameraId);
    if (t.frame >= (e.duration_frames || 0))
      throw new d("FRAME_OUT_OF_RANGE", `frame ${t.frame} is past the timeline`);
    n.keyframes ||= [];
    let r = de(n, t.frame);
    const s = !r;
    if (!r) {
      const o = de(n, 0)?.camera || n.camera || {};
      r = { frame: t.frame, camera: JSON.parse(JSON.stringify(o)), interpolation: "ease" }, n.keyframes.push(r), n.keyframes.sort((i, c) => i.frame - c.frame);
    }
    t.camera && (r.camera = { ...r.camera, ...JSON.parse(JSON.stringify(t.camera)) }), t.interpolation && (r.interpolation = t.interpolation);
    const a = s && !t.camera ? `keyframe at frame ${t.frame} was created from the existing pose (no "camera" given) -- it will not move the camera unless another keyframe with a different position/target exists` : void 0;
    return { dirtyMask: l.viewport | l.previews | l.timeline | l.inspector, warning: a };
  },
  [_.KEYFRAME_REMOVE](e, t) {
    const n = D(e, t.cameraId), r = (n.keyframes || []).length;
    if (n.keyframes = (n.keyframes || []).filter((a) => a.frame !== t.frame), n.keyframes.length === r)
      throw new d("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
    const s = n.keyframes.length === 0 ? "camera has no keyframes left" : void 0;
    return { dirtyMask: l.viewport | l.previews | l.timeline | l.inspector, warning: s };
  },
  [_.KEYFRAME_SET_INTERPOLATION](e, t) {
    const n = D(e, t.cameraId), r = de(n, t.frame);
    if (!r) throw new d("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
    if (!fe.includes(t.interpolation))
      throw new d("BAD_INTERPOLATION", `Unsupported interpolation: ${t.interpolation}`);
    return r.interpolation = t.interpolation, { dirtyMask: l.timeline | l.viewport | l.previews };
  },
  [_.TIMELINE_SET_RANGE](e, t) {
    const n = Math.max(0, (e.duration_frames || 1) - 1);
    if (t.start > n || t.end > n)
      throw new d("FRAME_OUT_OF_RANGE", `range must stay within 0..${n}`);
    return e.playback_range = [t.start, t.end], { dirtyMask: l.timeline | l.status };
  },
  [_.TIMELINE_SET_DURATION](e, t) {
    if (e.duration_frames = t.frames, Array.isArray(e.playback_range)) {
      const n = t.frames - 1;
      e.playback_range = [
        Math.min(e.playback_range[0], n),
        Math.min(e.playback_range[1], n)
      ];
    }
    return { dirtyMask: l.timeline | l.viewport | l.previews | l.status };
  },
  [_.CUT_UPSERT](e, t) {
    const n = rn(e, t);
    return { dirtyMask: l.timeline | l.viewport | l.previews | l.status, outcome: n };
  },
  [_.CUT_REMOVE](e, t) {
    const n = sn(e, t);
    return { dirtyMask: l.timeline | l.viewport | l.previews | l.status, outcome: n };
  },
  [_.CUT_SET_CAMERA](e, t) {
    const n = an(e, t);
    return { dirtyMask: l.timeline | l.viewport | l.previews | l.status, outcome: n };
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
    const r = (n.keyframes || []).filter((o) => t.frames.includes(o.frame)), s = Array.isArray(t.transform.origin) ? t.transform.origin : It(r), a = kt(n.keyframes || [], t.frames, {
      mode: t.transform.mode,
      origin: s,
      delta: t.transform.delta,
      factors: t.transform.factors,
      rotationDeg: t.transform.rotationDeg,
      lookAtActive: vt(n, e.objects)
    });
    return Z(e, n, a), { dirtyMask: ee };
  },
  [_.CAMERA_PATH_INSERT_KEY](e, t) {
    const n = D(e, t.cameraId), r = Mn(n.keyframes || [], {
      leftFrame: t.leftFrame,
      rightFrame: t.rightFrame,
      t: t.t
    });
    if (!r.ok)
      throw new d(
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
      throw new d("CANNOT_DELETE", "camera.path.delete_keys: a camera track needs at least one key");
    return Z(e, n, r.keys), { dirtyMask: ee, outcome: { removed: r.removed } };
  },
  [_.CAMERA_PATH_REDISTRIBUTE_TIMING](e, t) {
    const n = D(e, t.cameraId), r = [...n.keyframes || []].sort((i, c) => i.frame - c.frame), s = Number.isInteger(t.startFrame) ? t.startFrame : r[0]?.frame, a = Number.isInteger(t.endFrame) ? t.endFrame : r[r.length - 1]?.frame, o = Tt(r, { startFrame: s, endFrame: a });
    if (!o.ok) {
      const i = { not_enough_keys: "NOT_ENOUGH_KEYS", invalid_range: "BAD_RANGE", insufficient_frame_slots: "INSUFFICIENT_FRAME_SLOTS" };
      throw new d(i[o.reason] || "BAD_RANGE", `camera.path.redistribute_timing: ${o.reason}`);
    }
    return Z(e, n, o.keys), { dirtyMask: ee };
  },
  [_.CAMERA_PATH_APPLY_PRESET](e, t) {
    const n = D(e, t.cameraId), r = we(n), s = dn({
      type: t.presetType,
      camera: r,
      target: t.target,
      startFrame: t.startFrame,
      endFrame: t.endFrame,
      params: t.params || {}
    });
    if (!s.ok) {
      const a = { unknown_preset: "UNKNOWN_PRESET", invalid_camera: "BAD_VALUE", invalid_range: "BAD_RANGE", insufficient_frame_slots: "INSUFFICIENT_FRAME_SLOTS" };
      throw new d(a[s.reason] || "BAD_VALUE", `camera.path.apply_preset: ${s.reason}`);
    }
    return Z(e, n, s.keyframes), { dirtyMask: ee };
  }
};
function Ln({ state: e, operation: t }) {
  const n = Un[t.type];
  if (!n) throw new d("UNKNOWN_OPERATION", `Unknown operation type: ${t.type}`);
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
  const s = (a, o, i, c) => {
    if (!r && !Oe(i, c)) {
      if (n.length >= Bn) {
        r = !0;
        return;
      }
      n.push({ entity: a, field: o, before: i ?? null, after: c ?? null });
    }
  };
  return $n(e, t, s), xn(e, t, s), Kn(e, t, s), Hn(e, t, s), Wn(e, t, s), Vn(e, t, s), { changes: n, truncated: r };
}
const Fn = ["fov", "roll", "zoom", "near", "far", "camera_type"];
function $n(e, t, n) {
  const r = z(e?.cameras), s = z(t?.cameras);
  for (const a of r.keys())
    s.has(a) || n(a, "camera", "present", null);
  for (const [a, o] of s) {
    const i = r.get(a);
    if (!i) {
      n(a, "camera", null, "present");
      continue;
    }
    n(a, "name", i.name, o.name), n(a, "locked", !!i.locked, !!o.locked), n(a, "muted", !!i.muted, !!o.muted), n(a, "solo", !!i.solo, !!o.solo), n(a, "target_object_id", i.target_object_id ?? null, o.target_object_id ?? null), n(a, "position", i.camera?.position, o.camera?.position), n(a, "target", i.camera?.target, o.camera?.target);
    for (const c of Fn)
      n(a, c, i.camera?.[c], o.camera?.[c]);
  }
}
const zn = ["position", "target", "fov", "roll", "zoom", "near", "far", "camera_type"];
function xn(e, t, n) {
  const r = z(e?.cameras), s = z(t?.cameras);
  for (const [a, o] of s) {
    const i = r.get(a), c = new Map((i?.keyframes || []).map((f) => [f.frame, f])), h = new Map((o.keyframes || []).map((f) => [f.frame, f])), m = `${a}@keyframes`;
    for (const [f, u] of c)
      h.has(f) || n(m, `frame_${f}`, u.interpolation ?? "present", null);
    for (const [f, u] of h) {
      const p = c.get(f);
      if (!p) {
        n(m, `frame_${f}`, null, u.interpolation ?? "present");
        continue;
      }
      for (const y of zn)
        n(m, `frame_${f}_${y}`, p.camera?.[y], u.camera?.[y]);
      n(m, `frame_${f}_interpolation`, p.interpolation, u.interpolation);
    }
  }
}
function Hn(e, t, n) {
  const r = z(e?.objects), s = z(t?.objects);
  for (const [a, o] of s) {
    const c = r.get(a)?.character?.pose?.joints || {}, h = o.character?.pose?.joints || {}, m = /* @__PURE__ */ new Set([...Object.keys(c), ...Object.keys(h)]);
    for (const f of m)
      n(`${a}#${f}`, "joint_rotation", c[f] ?? null, h[f] ?? null);
  }
}
function Kn(e, t, n) {
  const r = z(e?.objects), s = z(t?.objects);
  for (const [a] of r)
    s.has(a) || n(a, "object", "present", null);
  for (const [a, o] of s) {
    const i = r.get(a);
    if (!i) {
      n(a, "object", null, "present");
      continue;
    }
    n(a, "position", i.position, o.position), n(a, "rotation", i.rotation, o.rotation), n(a, "size", i.size, o.size), n(a, "name", i.name, o.name), n(a, "enabled", i.enabled !== !1, o.enabled !== !1), n(a, "locked", !!i.locked, !!o.locked), n(a, "tags", i.tags || [], o.tags || []), n(a, "annotation", i.annotation ?? null, o.annotation ?? null);
    const c = i.character?.pose?.preset_id ?? null, h = o.character?.pose?.preset_id ?? null;
    n(a, "pose_preset", c, h);
    const m = i.character?.motion?.clip_id ?? null, f = o.character?.motion?.clip_id ?? null;
    n(a, "motion_clip_id", m, f);
  }
}
function Wn(e, t, n) {
  n("timeline", "duration_frames", e?.duration_frames, t?.duration_frames), n("timeline", "playback_range", e?.playback_range ?? null, t?.playback_range ?? null);
}
function Vn(e, t, n) {
  const r = new Map((e?.sequence?.cuts || []).map((a) => [a.start, a])), s = new Map((t?.sequence?.cuts || []).map((a) => [a.start, a]));
  for (const [a, o] of r)
    s.has(a) || n(`cut_${a}`, "cut", o.camera_id, null);
  for (const [a, o] of s) {
    const i = r.get(a);
    i ? n(`cut_${a}`, "cut_camera_id", i.camera_id, o.camera_id) : n(`cut_${a}`, "cut", null, o.camera_id);
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
  t && (e.camera = ae(
    t,
    e.frame ?? 0,
    e.state.objects || []
  ));
}
async function qn(e, t, n) {
  const r = n.some((o) => o.resourceRefresh === !0), s = t.operations.filter((o) => o.type === _.OBJECT_DELETE).map((o) => o.objectId);
  for (const o of s)
    e.removeObjectResources?.(o);
  const a = t.operations.some((o) => o.type === _.ASSET_INSTANTIATE);
  (r || a) && await e.restoreAssets?.();
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
  } catch (f) {
    if (f instanceof d) return Ae(e, t?.id, f);
    throw f;
  }
  const r = Ce(e);
  if (n.baseRevision !== void 0 && n.baseRevision !== r)
    return Ae(
      e,
      n.id,
      new d(
        "STALE_REVISION",
        "Scene changed since the caller read it",
        null,
        {
          expected: r,
          received: n.baseRevision
        }
      )
    );
  const s = Jn(e.state);
  let a = 0;
  const o = [], i = [];
  for (let f = 0; f < n.operations.length; f += 1)
    try {
      const u = Ln({ ui: e, state: s, operation: n.operations[f] });
      a |= u?.dirtyMask || 0, u?.warning && o.push(u.warning), u?.outcome && i.push({ index: f, ...u.outcome });
    } catch (u) {
      if (u instanceof d)
        return (u.operationIndex === null || u.operationIndex === void 0) && (u.operationIndex = f), Ae(e, n.id, u);
      throw u;
    }
  if (n.validateOnly) {
    const { changes: f, truncated: u } = Pn(e.state, s);
    return {
      ok: !0,
      version: $,
      revision: r,
      id: n.id,
      applied: n.operations.length,
      warnings: o,
      outcomes: i,
      dirtyMask: a,
      validateOnly: !0,
      changes: f,
      ...u ? { truncated: !0 } : {}
    };
  }
  e.checkpoint?.(n.description), e.state = se(s);
  const c = Gn(e);
  un(e, n.id), e.serialize?.(), Yn(e, c), Qn(e, a, `director-api:${n.id}`);
  const h = {
    ok: !0,
    version: $,
    baseRevision: r,
    revision: Ce(e),
    id: n.id,
    applied: n.operations.length,
    warnings: o,
    outcomes: i,
    dirtyMask: a
  }, m = qn(e, n, i).catch((f) => {
    console.warn("OmniCam: resource reconciliation failed", f), o.push({
      code: "VIEWPORT_RESOURCE_RECONCILE_FAILED",
      message: "The scene change was committed, but one or more viewport resources could not be refreshed."
    }), e.setStatus?.("The scene change was committed, but one or more viewport resources could not be refreshed.");
  });
  return Object.defineProperty(h, "_reconciliation", { value: m, enumerable: !1 }), h;
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
async function sr(e, t) {
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
async function ar(e, t) {
  const n = e.assetBrowser?.store, r = [];
  for (const s of t || []) {
    if (s?.type !== _t) {
      r.push(s);
      continue;
    }
    if (!n)
      return { ok: !1, code: "ASSET_CATALOG_UNAVAILABLE", message: "The asset catalogue is not available in this Director session" };
    const a = await sr(n, s.assetId);
    if (!a)
      return { ok: !1, code: "UNKNOWN_ASSET", message: `Unknown catalogue asset: ${s.assetId}` };
    r.push({ type: "asset.instantiate", asset: a, id: s.id, point: s.point });
  }
  return { ok: !0, operations: r };
}
async function or(e, t) {
  const n = e.assetBrowser?.store;
  if (!n) {
    const s = new Error("The asset catalogue is not available in this Director session");
    throw s.code = "ASSET_CATALOG_UNAVAILABLE", s;
  }
  await n.setFilter({ kind: t?.kind || "all", search: String(t?.search || "") });
  const r = (n.state?.items || []).filter((s) => !je(s)).slice(0, 20).map((s) => ({
    id: s.id,
    name: s.name,
    kind: s.kind,
    tags: [...s.tags || []],
    animations: (s.animations || []).map((a) => ({ id: a.id, name: a.name, clip: a.clip }))
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
  let s = null;
  try {
    s = await r.json();
  } catch {
    s = null;
  }
  if (r.ok === !1) {
    const a = s?.error?.code || `HTTP_${r.status || 0}`, o = s?.error?.message || `OmniCam Agent request failed (${r.status})`, i = new Error(o);
    throw i.code = a, i.status = r.status || 0, i;
  }
  return s ?? {};
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
  let r = !1, s = null, a = null, o = null, i = null, c = null, h = 0;
  function m() {
    return n.clientId || n.initialClientId || null;
  }
  function f() {
    s = null, a = null, o = null, i && (clearInterval(i), i = null);
  }
  async function u() {
    if (r) return;
    h += 1;
    const A = h, E = m();
    if (!E) {
      p();
      return;
    }
    try {
      const I = await ne(n, te.register, {
        protocol: tt,
        client_id: E,
        node_id: String(t.id),
        label: `OmniCam Director ${t.id}`,
        director_api: $,
        revision: Number(e.directorRevision || 0),
        operations: [...rt],
        queries: [...Ft]
      });
      if (r || A !== h) return;
      s = I.session_id, a = I.session_token, o = E, y();
    } catch {
      if (r || A !== h) return;
      p();
    }
  }
  function p() {
    r || (clearTimeout(c), c = setTimeout(() => {
      u();
    }, rr));
  }
  function y() {
    clearInterval(i), i = setInterval(() => {
      b();
    }, nr);
  }
  async function b() {
    if (!(r || !s))
      try {
        await ne(n, te.heartbeat, {
          session_id: s,
          session_token: a,
          revision: Number(e.directorRevision || 0)
        });
      } catch (A) {
        if (r) return;
        (A?.code === "UNKNOWN_SESSION" || A?.code === "BAD_SESSION_TOKEN") && (f(), u());
      }
  }
  async function v(A) {
    const E = A?.detail;
    if (r || !E || E.protocol !== tt || Number(E.schema_version) !== tr || E.session_id !== s || String(E.node_id) !== String(t.id)) return;
    let I;
    try {
      if (E.kind === "query")
        I = E.payload?.type === pt ? await or(e, E.payload) : e.directorApi.query(E.payload);
      else if (E.kind === "transaction") {
        const O = E.payload, M = (O?.operations || []).find(
          (L) => !rt.includes(L?.type)
        );
        if (!Number.isInteger(O?.baseRevision) || O.baseRevision < 0)
          I = re(
            e,
            "BASE_REVISION_REQUIRED",
            "External Agent transactions require baseRevision"
          );
        else if (M)
          I = re(
            e,
            "OPERATION_NOT_ADVERTISED",
            `External Agent transactions cannot use operation: ${M?.type}`
          );
        else {
          const L = await ar(e, O.operations);
          L.ok ? (I = e.directorApi.execute({ ...O, operations: L.operations }), await I?._reconciliation) : I = re(e, L.code, L.message);
        }
      } else
        I = re(e, "UNKNOWN_AGENT_REQUEST", `Unsupported Agent request kind: ${E.kind}`);
    } catch (O) {
      I = re(e, O?.code || "INTERNAL", O?.message || "OmniCam Agent request failed");
    }
    try {
      await ne(n, te.reply, {
        session_id: s,
        session_token: a,
        request_id: E.request_id,
        result: I
      });
    } catch {
    }
  }
  async function w(A, E) {
    if (!(!A || !E))
      try {
        await ne(n, te.close, {
          session_id: A,
          session_token: E
        });
      } catch {
      }
  }
  function x() {
    if (r) return;
    const A = m();
    if (A && o && A !== o) {
      const E = s, I = a;
      f(), w(E, I).finally(() => u());
    }
  }
  return n.addEventListener?.(nt, v), n.addEventListener?.("status", x), u(), {
    get sessionId() {
      return s;
    },
    dispose() {
      if (r) return;
      r = !0, clearInterval(i), clearTimeout(c), n.removeEventListener?.(nt, v), n.removeEventListener?.("status", x);
      const A = s, E = a;
      s = null, a = null, A && E && ne(n, te.close, {
        session_id: A,
        session_token: E
      }).catch(() => {
      });
    }
  };
}
const st = "majoor-omnicam-workbench-styles", cr = `
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
  if (e.getElementById(st)) return;
  const t = e.createElement("style");
  t.id = st, t.textContent = cr, e.head.append(t);
}
const lr = /* @__PURE__ */ new Set(["director"]);
function dr({ kind: e, title: t, buttonLabel: n, onOpen: r }) {
  gt(document);
  const s = document.createElement("div");
  s.className = "oc-node-shell", s.dataset.shellKind = e;
  const a = document.createElement("img");
  a.className = "oc-node-shell-preview", a.alt = "", a.draggable = !1;
  let o = null;
  lr.has(e) && (o = document.createElement("video"), o.className = "oc-node-shell-preview", o.muted = !0, o.loop = !0, o.playsInline = !0, o.disablePictureInPicture = !0, o.disableRemotePlayback = !0, o.style.display = "none");
  const i = document.createElement("div");
  i.className = "oc-node-shell-title";
  const c = document.createElement("span");
  c.className = "oc-node-shell-dirty-dot", c.hidden = !0, c.setAttribute("aria-hidden", "true");
  const h = document.createElement("span");
  h.className = "oc-node-shell-title-text", h.textContent = t ?? "", i.append(c, h);
  const m = document.createElement("div");
  m.className = "oc-node-shell-meta";
  const f = document.createElement("div");
  f.className = "oc-node-shell-status";
  const u = document.createElement("div");
  u.className = "oc-node-shell-progress";
  const p = document.createElement("span");
  u.append(p);
  const y = document.createElement("button");
  y.type = "button", y.className = "oc-node-shell-open", y.textContent = n ?? "Open", o ? s.append(a, o, i, m, f, u, y) : s.append(a, i, m, f, u, y);
  const b = new AbortController();
  y.addEventListener("click", (w) => r?.(w), { signal: b.signal });
  function v() {
    o && (o.pause(), o.removeAttribute("src"), o.load(), o.style.display = "none");
  }
  return {
    root: s,
    openButton: y,
    setTitle(w) {
      h.textContent = w ?? "";
    },
    setDirty(w) {
      c.hidden = !w, c.title = w ? j("Unsaved changes") : "";
    },
    setMeta(w) {
      m.textContent = w ?? "";
    },
    setStatus(w) {
      f.textContent = w ?? "";
    },
    // Still-frame path. Composes with setPreviewVideo(): setting one with a
    // value hides+stops the other, and clearing one only drops
    // data-has-preview when the other has nothing showing either.
    setPreview(w) {
      w ? (a.src = w, a.style.display = "block", v(), s.dataset.hasPreview = "true") : (a.removeAttribute("src"), a.style.display = "none", o?.getAttribute("src") || delete s.dataset.hasPreview);
    },
    // Live-looping playblast preview, Director/Monitor shells only -- a
    // no-op on an Extractor shell (no <video> was mounted). See setPreview()
    // for the composition rule between the two.
    setPreviewVideo(w) {
      o && (w ? (a.style.display = "none", o.autoplay = !0, o.src = w, o.style.display = "block", s.dataset.hasPreview = "true", o.play().catch(() => {
      })) : (v(), a.getAttribute("src") || delete s.dataset.hasPreview));
    },
    setProgress(w) {
      if (w == null) {
        u.dataset.active = "false";
        return;
      }
      u.dataset.active = "true";
      const x = Math.max(0, Math.min(1, w));
      p.style.width = `${(x * 100).toFixed(1)}%`;
    },
    dispose() {
      b.abort(), v();
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
  function s(a) {
    if (a.key !== "Tab") return;
    const o = mr(e);
    if (!o.length) {
      a.preventDefault(), e.focus();
      return;
    }
    const i = o[0], c = o[o.length - 1], h = e.ownerDocument?.activeElement ?? document.activeElement;
    a.shiftKey ? (h === i || !o.includes(h)) && (a.preventDefault(), c.focus()) : (h === c || !o.includes(h)) && (a.preventDefault(), i.focus());
  }
  return {
    activate() {
      t || (t = !0, n = document.activeElement, r = new AbortController(), e.addEventListener("keydown", s, { signal: r.signal }));
    },
    deactivate() {
      if (!t) return;
      t = !1, r?.abort(), r = null;
      const a = n;
      n = null, a && typeof a.focus == "function" && a.isConnected && a.focus();
    },
    get active() {
      return t;
    }
  };
}
class _r {
  constructor({ kind: t, nodeId: n, title: r, onRequestClose: s, onResize: a }) {
    this.kind = t, this.nodeId = String(n), this.title = r, this.onRequestClose = s, this.onResize = a, this.backdrop = null, this.window = null, this.content = null, this.disposed = !1, this._maximized = !1, this.abort = null, this.focusTrap = null;
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
    const { signal: s } = this.abort;
    n.querySelector('[data-workbench-act="close"]')?.addEventListener("click", () => {
      this.requestClose("button");
    }, { signal: s }), n.querySelector('[data-workbench-act="maximize"]')?.addEventListener("click", () => this.setMaximized(!this._maximized), { signal: s }), n.addEventListener("keydown", (a) => {
      a.key === "Escape" && (a.stopPropagation(), this.requestClose("escape"));
    }, { signal: s, capture: !0 }), window.addEventListener("resize", () => this.onResize?.(), { signal: s }), this.focusTrap = hr(this.window), this.focusTrap.activate(), this.window.focus(), requestAnimationFrame(() => this.onResize?.());
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
  open({ key: t, nodeId: n = t, opener: r, createSession: s }) {
    const a = { nodeId: String(n), cancelled: !1 };
    return this._pending.add(a), this._enqueue(() => this._open(a, { key: t, opener: r, createSession: s })).finally(() => this._pending.delete(a));
  }
  async _open(t, { key: n, opener: r, createSession: s }) {
    if (t.cancelled) return null;
    if (this._active?.key === n)
      return this._active.host?.focus?.(), this._active;
    if (this._active && !await this._closeSession(this._active, "switch") || t.cancelled) return null;
    const a = await s();
    return a ? t.cancelled ? (a.dispose?.(), null) : (a.opener = r ?? null, this._active = a, a) : null;
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
const at = 240, ot = 135;
function br(e, t) {
  try {
    const n = t?.canvas;
    if (!n || !n.width || !n.height) return;
    const r = document.createElement("canvas");
    r.width = at, r.height = ot;
    const s = r.getContext("2d");
    if (!s) return;
    s.drawImage(n, 0, 0, at, ot), e.previewDataUrl = r.toDataURL("image/webp", 0.7), q(e);
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
      const n = ++e.workbenchGeneration, { openDirectorWorkbench: r, closeDirectorWorkbench: s } = await import("./chunk-DkBHjde-.js").then((c) => c.e);
      if (e.disposed || n !== e.workbenchGeneration) return null;
      const a = r(e);
      e.pendingUpstreamResync && (e.pendingUpstreamResync = !1, a.syncUpstreamInputs?.());
      const o = ct(e.node), i = new _r({
        kind: "director",
        nodeId: e.node.id,
        title: e.getSnapshot().sceneName || j("OmniCam Director"),
        onRequestClose: (c) => Me.close(o, c),
        onResize: () => a.scheduleResizeAndRender?.()
      });
      return i.mount(a.root), e.activeWorkbenchHost = i, i.setDirty(e.isDirty), {
        key: o,
        nodeId: e.node.id,
        host: i,
        close: async () => a.recording ? (a.setStatus?.(j("Cannot close Director while a playblast is recording")), !1) : (a.serialize?.(), it(e, a), s(a), e.activeWorkbenchHost === i && (e.activeWorkbenchHost = null), i.dispose(), !0),
        dispose: () => {
          it(e, a), s(a), e.activeWorkbenchHost === i && (e.activeWorkbenchHost = null), i.dispose();
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
  } catch (u) {
    console.warn("[OmniCam] Agent bridge unavailable", u);
  }
  gr(e);
  const n = dr({
    kind: "director",
    title: j("OmniCam Director"),
    buttonLabel: j("OPEN DIRECTOR"),
    onOpen: (u) => {
      Er(t, u.currentTarget);
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
  }, s = e.onConfigure;
  e.onConfigure = function(...u) {
    s?.apply(this, u), r();
  };
  const a = e.onAfterGraphConfigured;
  e.onAfterGraphConfigured = function(...u) {
    a?.apply(this, u), r();
  };
  const o = () => {
    clearTimeout(t.connectionTimer), t.connectionTimer = setTimeout(() => {
      t.disposed || (t.workbench ? t.workbench.syncUpstreamInputs() : t.pendingUpstreamResync = !0, e.setDirtyCanvas?.(!0, !0));
    }, 60);
  }, i = e.onConnectionsChange;
  e.onConnectionsChange = function(...u) {
    i?.apply(this, u), o();
  };
  const c = Mt(e, o), h = e.onResize;
  e.onResize = function(...u) {
    h?.apply(this, u), t.workbench?.scheduleResizeAndRender?.();
  };
  const m = e.onExecuted;
  e.onExecuted = function(u) {
    m?.apply(this, arguments), t.workbench && (t.workbench.loadExecutionPreview(u), t.workbench.syncUpstreamInputs());
  };
  const f = e.onRemoved;
  return e.onRemoved = function(...u) {
    Me.disposeForNode(e.id), c(), cancelAnimationFrame(t.restoreFrame), clearTimeout(t.connectionTimer), t.agentBridge?.dispose?.(), n.dispose(), t.dispose(), f?.apply(this, u);
  }, t;
}
const Fr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attachDirectorShell: wr
}, Symbol.toStringTag, { value: "Module" }));
export {
  Nr as C,
  Lt as E,
  ft as S,
  l as U,
  Tn as a,
  Te as b,
  dn as c,
  jr as d,
  Pr as e,
  Br as f,
  Lr as g,
  Rr as h,
  Mn as i,
  On as j,
  Ur as k,
  Mr as l,
  Sr as m,
  Ne as n,
  Fr as o,
  Or as p,
  Dr as r,
  he as s,
  Cr as w
};
