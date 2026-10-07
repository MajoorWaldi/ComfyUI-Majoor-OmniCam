import { app as At } from "../../scripts/app.js";
import { api as Ne } from "../../scripts/api.js";
import { s as ie, a as ce, c as yt, d as xe, b as Tt, e as _e, f as vt, l as Ve, n as ye, g as Ke, h as ee, m as Ee, I as he, D as It, r as kt, p as Nt, t as Rt, i as St, j as Ot, k as Ct, w as jt, o as We, q as Mt, u as Dt, T as U, v as C } from "./chunk-BO4NGxuQ.js";
import { s as Ut, w as Lt } from "./chunk-WXTguuc6.js";
import { H as Je, O as Bt } from "./chunk-CUnIPhgW.js";
import { e as Ge, d as Pt } from "./chunk-CLujxzO0.js";
class xt {
  constructor({ capture: e, restore: n, limit: r = 100 }) {
    this.capture = e, this.restore = n, this.limit = r, this.undoStack = [], this.redoStack = [], this.restoring = !1, this.transaction = null;
  }
  checkpoint(e = "Edit") {
    if (this.restoring) return;
    if (this.transaction) return this.commitTransaction();
    const n = this.capture();
    this.undoStack.at(-1)?.snapshot !== n && (this.undoStack.push({ label: e, snapshot: n }), this.undoStack.length > this.limit && this.undoStack.shift(), this.redoStack.length = 0);
  }
  beginTransaction(e = "Edit") {
    return this.restoring || this.transaction ? !1 : (this.transaction = { label: e, snapshot: this.capture(), redoStack: this.redoStack.slice() }, !0);
  }
  commitTransaction() {
    const e = this.transaction;
    return e ? (this.transaction = null, e.snapshot === this.capture() ? (this.redoStack = e.redoStack, null) : (this.undoStack.at(-1)?.snapshot !== e.snapshot && this.undoStack.push({ label: e.label, snapshot: e.snapshot }), this.undoStack.length > this.limit && this.undoStack.shift(), this.redoStack.length = 0, e.label)) : null;
  }
  cancelTransaction() {
    const e = this.transaction;
    if (!e) return null;
    this.transaction = null, this.redoStack = e.redoStack, this.restoring = !0;
    try {
      this.restore(e.snapshot);
    } finally {
      this.restoring = !1;
    }
    return e.label;
  }
  undo() {
    if (this.transaction && this.cancelTransaction(), !this.undoStack.length) return null;
    const e = this.undoStack.pop();
    this.redoStack.push({ label: e.label, snapshot: this.capture() }), this.restoring = !0;
    try {
      this.restore(e.snapshot);
    } finally {
      this.restoring = !1;
    }
    return e.label;
  }
  redo() {
    if (this.transaction && this.cancelTransaction(), !this.redoStack.length) return null;
    const e = this.redoStack.pop();
    this.undoStack.push({ label: e.label, snapshot: this.capture() }), this.restoring = !0;
    try {
      this.restore(e.snapshot);
    } finally {
      this.restoring = !1;
    }
    return e.label;
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
function $(t, e) {
  return t.widgets?.find((n) => n.name === e) ?? null;
}
class Ft extends EventTarget {
  constructor(e, { app: n, api: r } = {}) {
    super(), this.app = n, this.api = r, this.node = e, this.disposed = !1, this.workbench = null, this.pendingUiDirtyMask = 0, this.serializeScheduled = !1, this.serializeFrame = null, this.directorApi = null, this.agentBridge = null, this.workbenchGeneration = 0, this.pendingUpstreamResync = !1, this.stateWidget = $(e, "state_json"), this.recordingWidget = $(e, "recording_path"), this.cardWidget = $(e, "card_asset"), this.widthWidget = $(e, "width"), this.heightWidget = $(e, "height"), this.fpsWidget = $(e, "fps"), this.durationWidget = $(e, "duration_seconds"), this.modeWidget = $(e, "render_mode");
    let s = null;
    try {
      s = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
    }
    this.state = ie(s), this.sceneBaseline = this.stateWidget?.value || JSON.stringify(this.state), this.sceneName = this.state.metadata?.scene_name || "", this.frame = 0, this.camera = ce(this.state, 0), this.directorRevision = 0, this.renderRevision = 0, this.previewDataUrl = null, this.previewVideoUrl = null, this.history = new xt({
      capture: () => this.workbench?.captureHistorySnapshot?.() ?? JSON.stringify({ state: this.state, frame: this.frame }),
      restore: (a) => {
        if (this.workbench) return this.workbench.restoreHistorySnapshot(a);
        const o = JSON.parse(a);
        this.state = ie(o.state), this.frame = yt(o.frame, 0, this.state.duration_frames - 1), this.camera = ce(this.state, this.frame);
      }
    });
  }
  /** Small summary for the compact node shell; never a second source of truth. */
  getSnapshot() {
    const e = this.state;
    return {
      sceneName: this.sceneName || e.metadata?.scene_name || "",
      fps: e.fps,
      durationSeconds: e.fps ? e.duration_frames / e.fps : 0,
      width: e.width,
      height: e.height,
      cameraCount: e.cameras?.length ?? 0,
      objectCount: e.objects?.length ?? 0,
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
  flushToWidgets({ immediate: e = !1 } = {}) {
    e && (cancelAnimationFrame(this.serializeFrame), this.serializeScheduled = !1), Ut(this);
  }
  /** Synchronous immediate flush -- what director-api's `ui.serialize?.()` call expects after a committed transaction. */
  serialize() {
    this.flushToWidgets({ immediate: !0 });
  }
  /** RAF-batched flush; ports the throttling OmniCamDirectorUI already relied on. */
  scheduleSerialize(e = "state") {
    this.serializeScheduled || (this.serializeScheduled = !0, this.serializeFrame = requestAnimationFrame(() => {
      this.serializeScheduled = !1, this.disposed || this.flushToWidgets(), this.dispatchEvent(new CustomEvent("statechange", { detail: { reason: e, revision: this.directorRevision } }));
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
    let e = null;
    try {
      e = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
    }
    this.state = ie(e), this.camera = ce(this.state, Math.min(this.frame, this.state.duration_frames - 1)), this.sceneBaseline = this.stateWidget?.value ?? this.sceneBaseline, this.sceneName = this.state.metadata?.scene_name || "", this.dispatchEvent(new CustomEvent("upstreamchange", { detail: { reason: "restore" } }));
  }
  /** Apply a state mutation headlessly, whether or not a workbench is open. */
  mutate(e, { reason: n = "mutation", dirty: r = 0 } = {}) {
    e(this.state), this.scheduleSerialize(n), r && this.requestUiUpdate(r, n);
  }
  replaceState(e, { reason: n = "replace" } = {}) {
    this.state = ie(e), this.sceneName = this.state.metadata?.scene_name || "", this.scheduleSerialize(n), this.dispatchEvent(new CustomEvent("upstreamchange", { detail: { reason: n } }));
  }
  attachWorkbench(e) {
    this.workbench = e, this.dispatchEvent(new CustomEvent("workbenchchange", { detail: { attached: !0 } }));
  }
  detachWorkbench(e) {
    this.workbench === e && (this.workbench = null, this.dispatchEvent(new CustomEvent("workbenchchange", { detail: { attached: !1 } })));
  }
  /** No-op with no open workbench; the next open renders current canonical state from scratch. */
  requestUiUpdate(e, n) {
    this.pendingUiDirtyMask |= e, this.workbench?.requestUiUpdate?.(e, n);
  }
  /**
   * Forwards to the open workbench's undo-history checkpoint when one is
   * attached; a no-op headlessly. director-api transactions call this
   * unconditionally (`ui.checkpoint?.()`) so a committed edit is still one
   * undo step while the workbench is open, exactly as before this migration.
   */
  checkpoint(e) {
    this.workbench?.checkpoint?.(e);
  }
  setStatus(e) {
    this.status = e, this.dispatchEvent(new CustomEvent("statuschange", { detail: { status: e } })), this.workbench?.setStatus?.(e);
  }
  /** Forwards asset/media disposal to the open workbench; a no-op headlessly (deferred until next open). */
  removeObjectResources(e) {
    this.workbench?.removeObjectResources?.(e);
  }
  /** Forwards asset resource reconciliation to the open workbench; a no-op headlessly. */
  async restoreAssets() {
    return this.workbench?.restoreAssets?.();
  }
  dispose() {
    this.disposed || (this.disposed = !0, cancelAnimationFrame(this.serializeFrame), this.workbench = null);
  }
}
const H = 1, Ye = 50, L = 120, q = 160, $t = Object.freeze(["perspective", "orthographic"]), _ = Object.freeze({
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
}), ut = Object.freeze(Object.values(_)), R = Object.freeze({
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
}), zt = Object.freeze(Object.values(R));
class u extends Error {
  constructor(e, n, r = null, s = null) {
    super(n), this.name = "DirectorApiError", this.code = e, this.operationIndex = r, this.details = s;
  }
}
const Ht = /* @__PURE__ */ new Set(["good", "warning", "bad", "unknown"]);
function Vt(t, e) {
  const n = Math.max(0, Math.floor(Number(e) || 0)), r = Array.from({ length: n }, (a, o) => ({ frame: o, state: "unknown", score: null })), s = t?.solve_health_v1;
  if (!s || !Array.isArray(s.frames)) return r;
  for (const a of s.frames) {
    const o = Number(a?.frame);
    if (!Number.isInteger(o) || o < 0 || o >= r.length) continue;
    const i = Ht.has(a?.state) ? a.state : "unknown", l = a?.score;
    let m = null;
    if (l != null) {
      const d = Number(l);
      m = Number.isFinite(d) ? Math.max(0, Math.min(1, d)) : null;
    }
    r[o] = { frame: o, state: i, score: m };
  }
  return r;
}
const Kt = 25, qe = 100;
function Q(t, e) {
  const n = t?.offset === void 0 ? 0 : Number(t.offset), r = t?.limit === void 0 ? Kt : Number(t.limit);
  if (!Number.isInteger(n) || n < 0)
    throw new u(
      "BAD_QUERY",
      "offset must be a non-negative integer"
    );
  if (!Number.isInteger(r) || r < 1 || r > qe)
    throw new u(
      "BAD_QUERY",
      `limit must be between 1 and ${qe}`
    );
  return {
    offset: n,
    limit: r,
    end: Math.min(e, n + r)
  };
}
function Te(t) {
  return {
    id: t.id,
    name: t.name || t.id,
    type: t.type || null,
    asset_id: t.asset_id || null,
    asset_kind: t.asset_kind || null,
    tags: Array.isArray(t.tags) ? [...t.tags] : [],
    enabled: t.enabled !== !1,
    locked: !!t.locked,
    parent_id: t.parent_id || null,
    position: Array.isArray(t.position) ? [...t.position] : [0, 0, 0]
  };
}
function Wt(t) {
  return {
    id: t.id,
    name: t.name || t.id,
    color: t.color || null,
    locked: !!t.locked,
    muted: !!t.muted,
    solo: !!t.solo,
    target_object_id: t.target_object_id || null,
    keyframe_count: Array.isArray(t.keyframes) ? t.keyframes.length : 0
  };
}
function z(t) {
  return typeof structuredClone == "function" ? structuredClone(t) : JSON.parse(JSON.stringify(t));
}
function Jt(t) {
  return Number.isInteger(t.directorRevision) ? Math.max(0, t.directorRevision) : 0;
}
function S(t, e) {
  return {
    ...e,
    revision: Jt(t)
  };
}
function Gt(t, e) {
  const n = t.state || {};
  switch (e?.type) {
    case R.SCENE_GET:
      return S(t, {
        version: 1,
        type: e.type,
        scene: z({
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
    case R.SCENE_SUMMARY: {
      const r = n.objects || [], s = n.sequence?.cuts || n.cuts || [];
      return S(t, {
        version: 1,
        type: e.type,
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
    case R.CAMERA_GET: {
      const r = e.cameraId || n.active_camera_id, s = (n.cameras || []).find((a) => a.id === r);
      if (!s) throw new u("UNKNOWN_CAMERA", `Unknown camera: ${r}`);
      return S(t, { version: 1, type: e.type, camera: z(s) });
    }
    case R.CAMERA_LIST: {
      const r = n.cameras || [], { offset: s, limit: a, end: o } = Q(e, r.length);
      return S(t, {
        version: 1,
        type: e.type,
        items: r.slice(s, o).map(Wt),
        total: r.length,
        offset: s,
        limit: a
      });
    }
    case R.TIMELINE_GET:
      return S(t, {
        version: 1,
        type: e.type,
        timeline: z({
          frame: t.frame ?? 0,
          duration_frames: n.duration_frames,
          fps: n.fps,
          playback_range: Array.isArray(n.playback_range) ? n.playback_range : null
        })
      });
    case R.SELECTION_GET:
      return S(t, {
        version: 1,
        type: e.type,
        selection: {
          entity: t.selectedEntity ?? null,
          objectId: t.selectedObjectId ?? null,
          objectIds: [...t.selectedObjectIds || []],
          keyFrame: t.selectedKeyFrame ?? null
        }
      });
    case R.HEALTH_GET:
      return S(t, {
        version: 1,
        type: e.type,
        frames: Vt(n.metadata, n.duration_frames)
      });
    case R.ASSET_LIST: {
      const r = e.kind ? String(e.kind) : null, s = (n.objects || []).filter((a) => a.asset_id && (!r || a.asset_kind === r)).map((a) => ({
        objectId: a.id,
        name: a.name || a.id,
        asset_id: a.asset_id,
        asset_kind: a.asset_kind || null,
        tags: Array.isArray(a.tags) ? [...a.tags] : [],
        position: Array.isArray(a.position) ? [...a.position] : [0, 0, 0],
        is_character: a.asset_kind === "character",
        has_motion: !!a.character?.motion
      }));
      return S(t, { version: 1, type: e.type, items: z(s), total: s.length });
    }
    case R.ASSET_GET: {
      const r = (n.objects || []).find((s) => s.id === e.objectId);
      if (!r) throw new u("UNKNOWN_OBJECT", `Unknown object: ${e.objectId}`);
      return S(t, {
        version: 1,
        type: e.type,
        asset: z({
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
    case R.CHARACTER_GET_RIG: {
      const r = (n.objects || []).find((a) => a.id === e.objectId);
      if (!r) throw new u("UNKNOWN_OBJECT", `Unknown object: ${e.objectId}`);
      const s = r.character || null;
      return S(t, {
        version: 1,
        type: e.type,
        rig: z({
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
    case R.CHARACTER_GET_POSE: {
      const r = (n.objects || []).find((a) => a.id === e.objectId);
      if (!r) throw new u("UNKNOWN_OBJECT", `Unknown object: ${e.objectId}`);
      const s = r.character?.pose || {};
      return S(t, {
        version: 1,
        type: e.type,
        pose: z({
          objectId: r.id,
          preset_id: s.preset_id || "neutral",
          root_offset: Array.isArray(s.root_offset) ? s.root_offset : [0, 0, 0],
          joints: s.joints || {},
          has_motion: !!r.character?.motion
        })
      });
    }
    case R.OBJECT_LIST: {
      const r = n.objects || [], { offset: s, limit: a, end: o } = Q(e, r.length);
      return S(t, {
        version: 1,
        type: e.type,
        items: r.slice(s, o).map(Te),
        total: r.length,
        offset: s,
        limit: a
      });
    }
    case R.OBJECT_GET: {
      const r = (n.objects || []).find((s) => s.id === e.objectId);
      if (!r) throw new u("UNKNOWN_OBJECT", `Unknown object: ${e.objectId}`);
      return S(t, {
        version: 1,
        type: e.type,
        object: z({
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
    case R.OBJECT_SEARCH: {
      const r = String(e.text || "").trim().toLowerCase(), s = Array.isArray(e.tags) ? e.tags.map((g) => String(g).toLowerCase()) : [], a = e.asset_kind !== void 0 ? e.asset_kind : null, o = e.type_ !== void 0 ? e.type_ : e.objectType !== void 0 ? e.objectType : null, i = typeof e.enabled == "boolean" ? e.enabled : null, l = (g) => {
        if (r && ![g.id, g.name || "", ...Array.isArray(g.tags) ? g.tags : []].map((p) => String(p).toLowerCase()).some((p) => p.includes(r)))
          return !1;
        if (s.length) {
          const A = (Array.isArray(g.tags) ? g.tags : []).map((p) => String(p).toLowerCase());
          if (!s.every((p) => A.includes(p))) return !1;
        }
        return !(a !== null && g.asset_kind !== a || o !== null && g.type !== o || i !== null && g.enabled !== !1 !== i);
      }, m = (n.objects || []).filter(l), { offset: d, limit: c, end: h } = Q(e, m.length);
      return S(t, {
        version: 1,
        type: e.type,
        items: m.slice(d, h).map(Te),
        total: m.length,
        offset: d,
        limit: c
      });
    }
    case R.CHARACTER_LIST: {
      const r = (n.objects || []).filter((i) => i.asset_kind === "character"), { offset: s, limit: a, end: o } = Q(e, r.length);
      return S(t, {
        version: 1,
        type: e.type,
        items: r.slice(s, o).map((i) => ({
          ...Te(i),
          has_motion: !!i.character?.motion,
          pose_preset: i.character?.pose?.preset_id || null
        })),
        total: r.length,
        offset: s,
        limit: a
      });
    }
    case R.SHOT_LIST: {
      const r = n.sequence?.cuts || n.cuts || [], s = Math.max(0, (n.duration_frames || 1) - 1), a = r.map((m, d) => ({
        index: d,
        start: m.start,
        end: d + 1 < r.length ? r[d + 1].start - 1 : s,
        camera_id: m.camera_id
      })), { offset: o, limit: i, end: l } = Q(e, a.length);
      return S(t, {
        version: 1,
        type: e.type,
        items: a.slice(o, l),
        total: a.length,
        offset: o,
        limit: i
      });
    }
    case R.KEYFRAME_LIST: {
      const r = e.cameraId || n.active_camera_id, s = (n.cameras || []).find((m) => m.id === r);
      if (!s) throw new u("UNKNOWN_CAMERA", `Unknown camera: ${r}`);
      const a = s.keyframes || [], { offset: o, limit: i, end: l } = Q(e, a.length);
      return S(t, {
        version: 1,
        type: e.type,
        cameraId: s.id,
        items: a.slice(o, l).map((m) => ({
          frame: m.frame,
          interpolation: m.interpolation,
          position: Array.isArray(m.camera?.position) ? [...m.camera.position] : [0, 0, 0]
        })),
        total: a.length,
        offset: o,
        limit: i
      });
    }
    default:
      throw new u("UNKNOWN_QUERY", `Unsupported query: ${e?.type}`);
  }
}
const mt = /* @__PURE__ */ new Set([
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
function we(t, e, n = "") {
  const r = String(n || "").trim().replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 120);
  if (r) {
    if (t.has(r))
      throw new u("DUPLICATE_ID", `${r} already exists`);
    return r;
  }
  let s = 1, a = `${e}_${s}`;
  for (; t.has(a); )
    s += 1, a = `${e}_${s}`;
  return a;
}
function Yt(t) {
  const e = t === "ground", n = t === "human", r = t === "card", s = t === "sun_light", a = t === "point_light", o = t === "spot_light";
  let i;
  e ? i = [12, 0.1, 12] : n ? i = [0.7, 1.8, 0.4] : r ? i = [2, 3] : i = [1.5, 1.5, 1.5];
  let l = [0, 0, 0], m = [0, 0, 0], d = "#8c929b", c, h, g, A;
  return s ? (l = [5, 8.5, 4], m = [-55, 35, 0], d = "#fff6ec", c = 2.2, h = !0) : a ? (l = [0, 3, 0], d = "#ffffff", c = 2, h = !1) : o && (l = [0, 4, 0], m = [-60, 0, 0], d = "#ffffff", c = 3, g = 45, A = 0.25, h = !0), {
    position: l,
    rotation: m,
    size: i,
    color: d,
    material_mode: e ? "checker" : "textured",
    ...s || a || o ? { light_role: "auto" } : {},
    ...c !== void 0 ? { intensity: c } : {},
    ...h !== void 0 ? { cast_shadow: h } : {},
    ...g !== void 0 ? { cone_angle: g } : {},
    ...A !== void 0 ? { penumbra: A } : {}
  };
}
function qt(t, e) {
  t.cameras ||= [];
  const n = new Set(t.cameras.map((o) => o.id)), r = we(n, "camera", e.id), s = { ...Tt(), ...e.camera || {} }, a = {
    id: r,
    name: e.name || r,
    color: "#4aa3ef",
    locked: !1,
    muted: !1,
    solo: !1,
    camera: s,
    keyframes: [{ frame: 0, camera: _e(s), interpolation: e.interpolation || "ease" }]
  };
  return t.cameras.push(a), { cameraId: r };
}
function Qt(t, e) {
  const n = (t.cameras || []).find((o) => o.id === e.cameraId);
  if (!n) throw new u("UNKNOWN_CAMERA", `${e.cameraId} does not exist`);
  const r = new Set(t.cameras.map((o) => o.id)), s = we(r, "camera", e.id), a = JSON.parse(JSON.stringify(n));
  return a.id = s, a.name = e.name || `${n.name || n.id} copy`, t.cameras.push(a), { cameraId: s };
}
function Xt(t, e) {
  const n = t.cameras || [], r = n.findIndex((a) => a.id === e.cameraId);
  if (r === -1) throw new u("UNKNOWN_CAMERA", `${e.cameraId} does not exist`);
  if (n.length <= 1) throw new u("LAST_CAMERA", "cannot delete the only camera");
  if (n[r].locked) throw new u("ENTITY_LOCKED", `${e.cameraId} is locked`);
  if ((t.sequence?.cuts || []).some((a) => a.camera_id === e.cameraId))
    throw new u("CAMERA_IN_USE", `${e.cameraId} is referenced by a cut`);
  return n.splice(r, 1), t.active_camera_id === e.cameraId && (t.active_camera_id = n[0].id), t.playblast_camera_id === e.cameraId && (t.playblast_camera_id = n[0].id), { cameraId: e.cameraId };
}
function Zt(t, e) {
  const n = (t.cameras || []).find((r) => r.id === e.cameraId);
  if (!n) throw new u("UNKNOWN_CAMERA", `${e.cameraId} does not exist`);
  return n.name = String(e.name || "").trim().slice(0, 80) || n.name, { cameraId: n.id };
}
function en(t, e) {
  const n = "__sequence__";
  if (e.cameraId === n) {
    if (!(t.sequence?.cuts || []).length)
      throw new u("NO_CUTS", "the sequence has no cuts to play back");
    return t.playblast_camera_id = n, { cameraId: n };
  }
  const r = (t.cameras || []).find((s) => s.id === e.cameraId);
  if (!r) throw new u("UNKNOWN_CAMERA", `${e.cameraId} does not exist`);
  return t.playblast_camera_id = r.id, { cameraId: r.id };
}
function tn(t, e) {
  if (!mt.has(e.objectType))
    throw new u("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${e.objectType}`);
  t.objects ||= [];
  const n = new Set(t.objects.map((o) => o.id)), r = we(n, e.objectType, e.id), s = Yt(e.objectType), a = {
    id: r,
    type: e.objectType,
    name: e.name || r,
    ...s,
    ...e.position ? { position: [...e.position] } : {},
    ...e.rotation ? { rotation: [...e.rotation] } : {},
    keyframes: [],
    enabled: !0,
    locked: !1
  };
  return t.objects.push(a), { objectId: r };
}
function nn(t, e) {
  const n = (t.objects || []).find((l) => l.id === e.objectId);
  if (!n) throw new u("UNKNOWN_OBJECT", `${e.objectId} does not exist`);
  const r = new Set(t.objects.map((l) => l.id)), s = we(r, n.type || "object", e.id), a = Array.isArray(e.offset) ? e.offset : [0.35, 0, 0.35], o = JSON.parse(JSON.stringify(n));
  o.id = s, o.name = e.name || `${n.name || n.id} copy`, o.locked = !1;
  const i = Array.isArray(n.position) ? n.position : [0, 0, 0];
  return o.position = [i[0] + a[0], i[1] + a[1], i[2] + a[2]], t.objects.push(o), { objectId: s, resourceRefresh: !!n.asset_id };
}
function rn(t, e) {
  const n = t.objects || [], r = n.findIndex((a) => a.id === e.objectId);
  if (r === -1) throw new u("UNKNOWN_OBJECT", `${e.objectId} does not exist`);
  const s = n[r];
  if (s.id === "subject") throw new u("PROTECTED_OBJECT", "the subject object cannot be deleted");
  if (s.locked) throw new u("ENTITY_LOCKED", `${e.objectId} is locked`);
  for (const a of n)
    a.parent_id === e.objectId && (a.parent_id = null);
  return n.splice(r, 1), { objectId: e.objectId, resourceRefresh: !!s.asset_id };
}
function sn(t, e) {
  const n = (t.objects || []).find((r) => r.id === e.objectId);
  if (!n) throw new u("UNKNOWN_OBJECT", `${e.objectId} does not exist`);
  return n.name = String(e.name || "").trim().slice(0, 80) || n.name, { objectId: n.id };
}
function an(t, e) {
  const n = (t.objects || []).find((i) => i.id === e.objectId);
  if (!n) throw new u("UNKNOWN_OBJECT", `${e.objectId} does not exist`);
  if (e.parentId === null || e.parentId === void 0)
    return n.parent_id = null, { objectId: n.id };
  if (e.parentId === e.objectId)
    throw new u("INVALID_PARENT", "an object cannot be its own parent");
  const r = (t.objects || []).find((i) => i.id === e.parentId);
  if (!r) throw new u("UNKNOWN_OBJECT", `${e.parentId} does not exist`);
  const s = new Map(t.objects.map((i) => [i.id, i]));
  let a = r;
  const o = /* @__PURE__ */ new Set();
  for (; a; ) {
    if (a.id === e.objectId)
      throw new u("INVALID_PARENT", "assigning this parent would create a cycle");
    if (o.has(a.id)) break;
    o.add(a.id), a = a.parent_id ? s.get(a.parent_id) : null;
  }
  return n.parent_id = e.parentId, { objectId: n.id };
}
function on(t, e) {
  t.sequence ||= xe();
  const n = t.sequence.cuts ||= [], r = Math.max(0, (t.duration_frames || 1) - 1);
  if (!Number.isInteger(e.start) || e.start < 0 || e.start > r)
    throw new u("FRAME_OUT_OF_RANGE", `cut start must be within 0..${r}`);
  if (!(t.cameras || []).find((o) => o.id === e.cameraId)) throw new u("UNKNOWN_CAMERA", `${e.cameraId} does not exist`);
  const a = n.find((o) => o.start === e.start);
  return a ? a.camera_id = e.cameraId : n.push({ start: e.start, camera_id: e.cameraId }), n.sort((o, i) => o.start - i.start), t.sequence.enabled = !0, { start: e.start, cameraId: e.cameraId };
}
function cn(t, e) {
  t.sequence ||= xe();
  const n = t.sequence.cuts || [], r = n.findIndex((s) => s.start === e.start);
  if (r === -1) throw new u("UNKNOWN_CUT", `no cut starts at frame ${e.start}`);
  return n.splice(r, 1), n.length && (n[0].start = 0), t.sequence.enabled = n.length > 0, { start: e.start };
}
function ln(t, e) {
  t.sequence ||= xe();
  const r = (t.sequence.cuts || []).find((a) => a.start === e.start);
  if (!r) throw new u("UNKNOWN_CUT", `no cut starts at frame ${e.start}`);
  if (!(t.cameras || []).find((a) => a.id === e.cameraId)) throw new u("UNKNOWN_CAMERA", `${e.cameraId} does not exist`);
  return r.camera_id = e.cameraId, { start: e.start, cameraId: e.cameraId };
}
const Fe = [0, 1, 0], Re = [
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
], Lr = {
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
function dn(t, e) {
  const n = [...t.position], r = Array.isArray(e) ? [...e] : [...t.target], s = vt(r, n), a = Ve(s) > 1e-9 ? ye(s) : [0, 0, -1];
  let o = Ke(a, Fe);
  Ve(o) < 1e-6 && (o = [1, 0, 0]), o = ye(o);
  const i = ye(Ke(o, a));
  return { position: n, target: r, forward: a, right: o, up: i };
}
function fn(t) {
  return {
    fov: t.fov,
    roll: t.roll || 0,
    zoom: t.zoom || 1,
    near: t.near,
    far: t.far,
    camera_type: t.camera_type || "perspective"
  };
}
function un(t) {
  return [
    { position: t.position, target: t.target },
    { position: t.position, target: t.target }
  ];
}
function Qe(t, e, n) {
  const r = n === "out" ? -1 : 1, s = ee(t.position, Ee(t.forward, r * e));
  return [
    { position: t.position, target: t.target },
    { position: s, target: t.target }
  ];
}
function Xe(t, e, n) {
  const r = n === "right" ? 1 : -1, s = Ee(t.right, r * e);
  return [
    { position: t.position, target: t.target },
    { position: ee(t.position, s), target: ee(t.target, s) }
  ];
}
function Ze(t, e, n) {
  const s = Ee(Fe, (n === "down" ? -1 : 1) * e);
  return [
    { position: t.position, target: t.target },
    { position: ee(t.position, s), target: ee(t.target, s) }
  ];
}
function et(t, e, n) {
  const r = n === "down" ? -1 : 1, s = ee(t.position, Ee(Fe, r * e));
  return [
    { position: t.position, target: t.target },
    { position: s, target: t.target }
  ];
}
function le(t, { degrees: e = 180, direction: n = "cw", radius: r, radiusEnd: s, heightOffset: a = 0, samples: o = 5, close: i = !1 } = {}) {
  const l = t.target, m = t.position[0] - l[0], d = t.position[2] - l[2], c = Math.hypot(m, d) || 1e-6, h = Math.atan2(d, m), g = Number.isFinite(r) ? r : c, A = Number.isFinite(s) ? s : g, p = n === "ccw" ? 1 : -1, T = Math.abs(e) * Math.PI / 180 * p, E = Math.max(2, Math.round(o)), F = t.position[1] + a, y = [];
  for (let w = 0; w < E; w += 1) {
    const v = i ? w / E : w / (E - 1), N = h + T * v, O = g + (A - g) * v;
    y.push({
      position: [l[0] + Math.cos(N) * O, F, l[2] + Math.sin(N) * O],
      target: [...l]
    });
  }
  return y;
}
function mn({ type: t, camera: e, target: n, startFrame: r, endFrame: s, params: a = {} } = {}) {
  if (!Re.includes(t)) return { ok: !1, reason: "unknown_preset" };
  if (!e || !Array.isArray(e.position) || !Array.isArray(e.target)) return { ok: !1, reason: "invalid_camera" };
  const o = Math.round(Number(r)), i = Math.round(Number(s));
  if (!Number.isFinite(o) || !Number.isFinite(i) || i <= o) return { ok: !1, reason: "invalid_range" };
  const l = dn(e, n), m = Number(a.distance) > 0 ? Number(a.distance) : 1, d = (p, T, E) => ({
    degrees: Number(a.degrees) || p,
    direction: T,
    radius: Number.isFinite(Number(a.radius)) ? Number(a.radius) : void 0,
    heightOffset: Number(a.heightOffset) || 0,
    samples: Number(a.samples) || E
  });
  let c;
  switch (t) {
    case "static":
      c = un(l);
      break;
    case "dolly_in":
      c = Qe(l, m, "in");
      break;
    case "dolly_out":
      c = Qe(l, m, "out");
      break;
    case "truck_left":
      c = Xe(l, m, "left");
      break;
    case "truck_right":
      c = Xe(l, m, "right");
      break;
    case "pedestal_up":
      c = Ze(l, m, "up");
      break;
    case "pedestal_down":
      c = Ze(l, m, "down");
      break;
    case "crane_up":
      c = et(l, m, "up");
      break;
    case "crane_down":
      c = et(l, m, "down");
      break;
    case "arc_left":
      c = le(l, d(45, "ccw", 5));
      break;
    case "arc_right":
      c = le(l, d(45, "cw", 5));
      break;
    case "orbit":
      c = le(l, { ...d(180, a.direction === "ccw" ? "ccw" : "cw", 5), close: !!a.close });
      break;
    case "spiral":
      c = le(l, {
        ...d(360, a.direction === "ccw" ? "ccw" : "cw", 8),
        radiusEnd: Number.isFinite(Number(a.radiusEnd)) ? Number(a.radiusEnd) : void 0
      });
      break;
    default:
      return { ok: !1, reason: "unknown_preset" };
  }
  if (i - o + 1 < c.length) return { ok: !1, reason: "insufficient_frame_slots" };
  const h = c.map((p, T) => c.length <= 1 ? o : Math.round(o + (i - o) * T / (c.length - 1)));
  for (let p = 1; p < h.length; p += 1) h[p] <= h[p - 1] && (h[p] = h[p - 1] + 1);
  for (let p = h.length - 1; p > 0; p -= 1) h[p] > i - (h.length - 1 - p) && (h[p] = i - (h.length - 1 - p));
  h[0] = o, h[h.length - 1] = i;
  const g = fn(e);
  return { ok: !0, keyframes: c.map((p, T) => ({
    frame: h[T],
    interpolation: "smooth",
    camera: { position: p.position, target: p.target, ...g }
  })) };
}
const hn = 2048;
function _n(t, e) {
  const n = t._directorApiTxIds ||= /* @__PURE__ */ new Set();
  for (n.has(e) && n.delete(e), n.add(e); n.size > hn; )
    n.delete(n.values().next().value);
}
function pn(t, e) {
  return !!t._directorApiTxIds?.has(e);
}
const W = (t) => typeof t == "number" && Number.isFinite(t);
function k(t, e, n) {
  if (!Array.isArray(t) || t.length !== 3 || !t.every(W))
    throw new u("BAD_VECTOR", `${e} must be [x,y,z] of finite numbers`, n);
}
function j(t, e, n) {
  if (!Number.isInteger(t) || t < 0)
    throw new u("BAD_FRAME", `${e} must be a non-negative integer frame`, n);
}
function b(t, e, n, r) {
  if (typeof t != "string" || t.length === 0)
    throw new u("BAD_ID", `${e} must be a non-empty string`, n);
  if (r !== void 0 && t.length > r)
    throw new u("BAD_ID", `${e} exceeds ${r} characters`, n);
}
function Z(t, e, n) {
  if (!W(t))
    throw new u("BAD_VALUE", `${e} must be a finite number`, n);
}
function tt(t, e, n) {
  if (!Array.isArray(t) || t.length === 0 || !t.every((r) => Number.isInteger(r) && r >= 0))
    throw new u("BAD_VALUE", `${e} must be a non-empty array of non-negative integer frames`, n);
}
const gn = /* @__PURE__ */ new Set(["translate", "rotate", "scale"]), bn = /* @__PURE__ */ new Set([
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
function En(t, e) {
  for (const n of Object.keys(t))
    if (!bn.has(n))
      throw new u("BAD_VALUE", `camera.create: unsupported camera field "${n}"`, e);
  if (t.position !== void 0 && k(t.position, "camera.position", e), t.target !== void 0 && k(t.target, "camera.target", e), t.up !== void 0 && k(t.up, "camera.up", e), t.fov !== void 0 && (Z(t.fov, "camera.fov", e), t.fov < 1 || t.fov > 179))
    throw new u("BAD_VALUE", "camera.fov must be within 1..179", e);
  if (t.roll !== void 0 && Z(t.roll, "camera.roll", e), t.zoom !== void 0 && (Z(t.zoom, "camera.zoom", e), t.zoom <= 0))
    throw new u("BAD_VALUE", "camera.zoom must be > 0", e);
  if (t.near !== void 0 && (Z(t.near, "camera.near", e), t.near <= 0))
    throw new u("BAD_VALUE", "camera.near must be > 0", e);
  if (t.far !== void 0) {
    Z(t.far, "camera.far", e);
    const n = t.near === void 0 ? It : t.near;
    if (t.far <= n)
      throw new u("BAD_VALUE", "camera.far must be greater than camera.near", e);
  }
  if (t.camera_type !== void 0 && !$t.includes(t.camera_type))
    throw new u("BAD_VALUE", `Unsupported camera_type: ${t.camera_type}`, e);
}
function wn(t, e) {
  if (!t || typeof t != "object" || Array.isArray(t))
    throw new u("BAD_OPERATION", "operation must be an object", e);
  const { type: n } = t;
  if (!ut.includes(n))
    throw new u("UNKNOWN_OPERATION", `Unknown operation type: ${n}`, e);
  switch (n) {
    case _.ASSET_INSTANTIATE: {
      const r = t.asset;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new u("BAD_VALUE", "asset.instantiate needs a resolved asset object", e);
      if (b(r.id, "asset.id", e), b(r.kind, "asset.kind", e), String(r.id).length > 120 || String(r.kind).length > 32)
        throw new u("BAD_VALUE", "asset.id / asset.kind exceed their bounds", e);
      if (r.tags !== void 0 && (!Array.isArray(r.tags) || r.tags.length > 32))
        throw new u("BAD_VALUE", "asset.tags must be a list of at most 32", e);
      if (r.animations !== void 0 && (!Array.isArray(r.animations) || r.animations.length > 256))
        throw new u("BAD_VALUE", "asset.animations must be a list of at most 256", e);
      if (r.rig !== void 0 && r.rig !== null) {
        if (typeof r.rig != "object" || Array.isArray(r.rig))
          throw new u("BAD_VALUE", "asset.rig must be an object", e);
        if (r.rig.bone_map && Object.keys(r.rig.bone_map).length > 128)
          throw new u("BAD_VALUE", "asset.rig.bone_map exceeds 128 entries", e);
      }
      t.point !== void 0 && k(t.point, "point", e), t.id !== void 0 && b(t.id, "id", e);
      break;
    }
    case _.CAMERA_SET_ACTIVE:
      b(t.cameraId, "cameraId", e);
      break;
    case _.CAMERA_SET_LOCKED:
      if (b(t.cameraId, "cameraId", e), typeof t.value != "boolean")
        throw new u("BAD_VALUE", "camera.set_locked needs a boolean value", e);
      break;
    case _.CAMERA_CREATE:
      if (t.id !== void 0 && b(t.id, "id", e, L), t.name !== void 0 && b(t.name, "name", e, q), t.camera !== void 0) {
        if (typeof t.camera != "object" || Array.isArray(t.camera) || t.camera === null)
          throw new u("BAD_VALUE", "camera.create camera must be an object", e);
        En(t.camera, e);
      }
      if (t.interpolation !== void 0 && !he.includes(t.interpolation))
        throw new u("BAD_INTERPOLATION", `Unsupported interpolation: ${t.interpolation}`, e);
      break;
    case _.CAMERA_DUPLICATE:
      b(t.cameraId, "cameraId", e, L), t.id !== void 0 && b(t.id, "id", e, L), t.name !== void 0 && b(t.name, "name", e, q);
      break;
    case _.CAMERA_DELETE:
    case _.CAMERA_SET_PLAYBLAST:
      b(t.cameraId, "cameraId", e, L);
      break;
    case _.CAMERA_RENAME:
      b(t.cameraId, "cameraId", e, L), b(t.name, "name", e, q);
      break;
    case _.OBJECT_CREATE:
      if (b(t.objectType, "objectType", e), !mt.has(t.objectType))
        throw new u("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${t.objectType}`, e);
      if (t.asset !== void 0 || t.url !== void 0 || t.path !== void 0)
        throw new u("BAD_VALUE", "object.create does not accept asset/url/path -- use asset.instantiate", e);
      t.id !== void 0 && b(t.id, "id", e, L), t.name !== void 0 && b(t.name, "name", e, q), t.position !== void 0 && k(t.position, "position", e), t.rotation !== void 0 && k(t.rotation, "rotation", e);
      break;
    case _.OBJECT_DUPLICATE:
      b(t.objectId, "objectId", e, L), t.id !== void 0 && b(t.id, "id", e, L), t.name !== void 0 && b(t.name, "name", e, q), t.offset !== void 0 && k(t.offset, "offset", e);
      break;
    case _.OBJECT_DELETE:
      b(t.objectId, "objectId", e, L);
      break;
    case _.OBJECT_RENAME:
      b(t.objectId, "objectId", e, L), b(t.name, "name", e, q);
      break;
    case _.OBJECT_SET_PARENT:
      b(t.objectId, "objectId", e, L), t.parentId !== null && t.parentId !== void 0 && b(t.parentId, "parentId", e, L);
      break;
    case _.CAMERA_TRANSFORM:
      if (t.cameraId !== void 0 && b(t.cameraId, "cameraId", e), t.position !== void 0 && k(t.position, "position", e), t.target !== void 0 && k(t.target, "target", e), t.frame !== void 0 && j(t.frame, "frame", e), t.position === void 0 && t.target === void 0)
        throw new u("EMPTY_OPERATION", "camera.transform needs position and/or target", e);
      break;
    case _.CAMERA_LOOK_AT:
      if (t.cameraId !== void 0 && b(t.cameraId, "cameraId", e), t.point !== void 0 && k(t.point, "point", e), t.objectId !== void 0 && t.objectId !== null && b(t.objectId, "objectId", e), t.point === void 0 && t.objectId === void 0)
        throw new u("EMPTY_OPERATION", "camera.look_at needs a point or an objectId", e);
      break;
    case _.OBJECT_TRANSFORM:
      if (b(t.objectId, "objectId", e), t.position !== void 0 && k(t.position, "position", e), t.rotation !== void 0 && k(t.rotation, "rotation", e), t.scale !== void 0 && k(t.scale, "scale", e), t.position === void 0 && t.rotation === void 0 && t.scale === void 0)
        throw new u("EMPTY_OPERATION", "object.transform needs position, rotation and/or scale", e);
      break;
    case _.OBJECT_SET_ENABLED:
    case _.OBJECT_SET_LOCKED:
      if (b(t.objectId, "objectId", e), typeof t.value != "boolean")
        throw new u("BAD_VALUE", `${n} needs a boolean value`, e);
      break;
    case _.OBJECT_SET_TAGS:
      if (b(t.objectId, "objectId", e), !Array.isArray(t.tags) || t.tags.some((r) => typeof r != "string"))
        throw new u("BAD_VALUE", "object.set_tags needs a string array", e);
      if (t.tags.length > 64)
        throw new u("BAD_VALUE", "object.set_tags: too many tags", e);
      break;
    case _.OBJECT_SET_ANNOTATION:
      if (b(t.objectId, "objectId", e), t.annotation !== null && (typeof t.annotation != "object" || Array.isArray(t.annotation)))
        throw new u("BAD_VALUE", "object.set_annotation needs an object or null", e);
      break;
    case _.CHARACTER_SET_POSE:
      if (b(t.objectId, "objectId", e), t.pose !== null && (typeof t.pose != "object" || Array.isArray(t.pose)))
        throw new u("BAD_VALUE", "character.set_pose needs a pose object or null", e);
      break;
    case _.CHARACTER_SET_JOINT_ROTATION:
      if (b(t.objectId, "objectId", e), b(t.joint, "joint", e), !Array.isArray(t.rotation) || t.rotation.length !== 4 || !t.rotation.every(W))
        throw new u("BAD_QUATERNION", "rotation must be [x,y,z,w] of finite numbers", e);
      break;
    case _.CHARACTER_SET_MOTION: {
      b(t.objectId, "objectId", e);
      const r = t.motion;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new u("BAD_VALUE", "character.set_motion needs a motion object", e);
      b(r.clip_id, "motion.clip_id", e);
      for (const s of ["start_frame", "end_frame", "speed", "offset_seconds"])
        if (r[s] !== void 0 && !W(r[s]))
          throw new u("BAD_VALUE", `motion.${s} must be a finite number`, e);
      if (W(r.start_frame) && W(r.end_frame) && r.end_frame > 0 && r.end_frame <= r.start_frame)
        throw new u("BAD_MOTION_RANGE", "motion end_frame is not after start_frame", e);
      break;
    }
    case _.CHARACTER_CLEAR_MOTION:
      b(t.objectId, "objectId", e);
      break;
    case _.KEYFRAME_UPSERT:
      if (t.cameraId !== void 0 && b(t.cameraId, "cameraId", e), j(t.frame, "frame", e), t.interpolation !== void 0 && !he.includes(t.interpolation))
        throw new u("BAD_INTERPOLATION", `Unsupported interpolation: ${t.interpolation}`, e);
      if (t.camera !== void 0) {
        if (!t.camera || typeof t.camera != "object")
          throw new u("BAD_VALUE", "keyframe.upsert camera must be an object", e);
        t.camera.position !== void 0 && k(t.camera.position, "camera.position", e), t.camera.target !== void 0 && k(t.camera.target, "camera.target", e);
        for (const r of ["fov", "roll", "zoom", "near", "far"])
          if (t.camera[r] !== void 0 && !W(t.camera[r]))
            throw new u("BAD_VALUE", `camera.${r} must be finite`, e);
      }
      break;
    case _.KEYFRAME_REMOVE:
      t.cameraId !== void 0 && b(t.cameraId, "cameraId", e), j(t.frame, "frame", e);
      break;
    case _.KEYFRAME_SET_INTERPOLATION:
      if (t.cameraId !== void 0 && b(t.cameraId, "cameraId", e), j(t.frame, "frame", e), !he.includes(t.interpolation))
        throw new u("BAD_INTERPOLATION", `Unsupported interpolation: ${t.interpolation}`, e);
      break;
    case _.TIMELINE_SET_RANGE:
      if (j(t.start, "start", e), j(t.end, "end", e), t.end < t.start)
        throw new u("BAD_RANGE", "range end is before start", e);
      break;
    case _.TIMELINE_SET_DURATION:
      if (!Number.isInteger(t.frames) || t.frames < 1)
        throw new u("BAD_VALUE", "timeline.set_duration needs frames >= 1", e);
      break;
    case _.CUT_UPSERT:
      j(t.start, "start", e), b(t.cameraId, "cameraId", e);
      break;
    case _.CUT_REMOVE:
      j(t.start, "start", e);
      break;
    case _.CUT_SET_CAMERA:
      j(t.start, "start", e), b(t.cameraId, "cameraId", e);
      break;
    case _.CAMERA_PATH_TRANSFORM_KEYS: {
      t.cameraId !== void 0 && b(t.cameraId, "cameraId", e), tt(t.frames, "frames", e);
      const r = t.transform;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new u("BAD_VALUE", "camera.path.transform_keys needs a transform object", e);
      if (!gn.has(r.mode))
        throw new u("BAD_VALUE", "transform.mode must be translate, rotate or scale", e);
      r.mode === "translate" ? k(r.delta, "transform.delta", e) : r.mode === "scale" ? k(r.factors, "transform.factors", e) : k(r.rotationDeg, "transform.rotationDeg", e), r.origin !== void 0 && k(r.origin, "transform.origin", e);
      break;
    }
    case _.CAMERA_PATH_INSERT_KEY:
      t.cameraId !== void 0 && b(t.cameraId, "cameraId", e), j(t.leftFrame, "leftFrame", e), j(t.rightFrame, "rightFrame", e), t.t !== void 0 && Z(t.t, "t", e);
      break;
    case _.CAMERA_PATH_DELETE_KEYS:
      t.cameraId !== void 0 && b(t.cameraId, "cameraId", e), tt(t.frames, "frames", e);
      break;
    case _.CAMERA_PATH_REDISTRIBUTE_TIMING:
      t.cameraId !== void 0 && b(t.cameraId, "cameraId", e), t.startFrame !== void 0 && j(t.startFrame, "startFrame", e), t.endFrame !== void 0 && j(t.endFrame, "endFrame", e);
      break;
    case _.CAMERA_PATH_APPLY_PRESET:
      if (t.cameraId !== void 0 && b(t.cameraId, "cameraId", e), !Re.includes(t.presetType))
        throw new u("BAD_VALUE", `presetType must be one of: ${Re.join(", ")}`, e);
      if (j(t.startFrame, "startFrame", e), j(t.endFrame, "endFrame", e), t.endFrame <= t.startFrame)
        throw new u("BAD_RANGE", "camera.path.apply_preset endFrame must be after startFrame", e);
      if (t.target !== void 0 && k(t.target, "target", e), t.params !== void 0 && (typeof t.params != "object" || Array.isArray(t.params)))
        throw new u("BAD_VALUE", "camera.path.apply_preset params must be an object", e);
      break;
    default:
      throw new u("UNKNOWN_OPERATION", `Unknown operation type: ${n}`, e);
  }
}
function An(t, e) {
  if (!e || typeof e != "object" || Array.isArray(e))
    throw new u("BAD_TRANSACTION", "transaction must be an object");
  if (e.version !== H)
    throw new u("UNSUPPORTED_VERSION", `Unsupported API version: ${e.version}`);
  if (typeof e.id != "string" || e.id.length === 0)
    throw new u("BAD_TRANSACTION_ID", "transaction id must be a non-empty string");
  if (pn(t, e.id))
    throw new u("DUPLICATE_TRANSACTION_ID", `transaction id already used: ${e.id}`);
  if (typeof e.description != "string" || e.description.trim().length === 0)
    throw new u("EMPTY_DESCRIPTION", "transaction description must not be empty");
  if (e.baseRevision !== void 0 && (!Number.isInteger(e.baseRevision) || e.baseRevision < 0))
    throw new u(
      "BAD_REVISION",
      "baseRevision must be a non-negative integer"
    );
  if (!Array.isArray(e.operations))
    throw new u("BAD_OPERATIONS", "operations must be an array");
  if (e.operations.length === 0)
    throw new u("NO_OPERATIONS", "transaction has no operations");
  if (e.operations.length > Ye)
    throw new u(
      "TOO_MANY_OPERATIONS",
      `transaction has ${e.operations.length} operations (max ${Ye})`
    );
  return e.operations.forEach((n, r) => wn(n, r)), {
    version: H,
    id: e.id,
    baseRevision: e.baseRevision,
    description: e.description.trim(),
    operations: e.operations,
    validateOnly: e.validateOnly === !0
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
function Br(t = 0, e = 0) {
  return (t | e) >>> 0;
}
function Pr(t, e) {
  return (t & e) !== 0;
}
const yn = "omnicam/library", Tn = "majoor_omnicam/blockout_library", vn = Object.freeze({
  "omnicam.helper.human_lowpoly": "human",
  "omnicam.helper.null": "null"
});
function In(t, e) {
  if (!Array.isArray(t) || t.length < 3) return [...e];
  const n = t.slice(0, 3).map((r) => Number(r));
  return n.every((r) => Number.isFinite(r)) ? n : [...e];
}
function kn(t) {
  return t.file ? `${t.source === "legacy" ? Tn : yn}/${t.file} [input]` : "";
}
function nt(t, e, n) {
  const r = t || "asset";
  let s = `${r}_${n}`, a = 2;
  for (; e && e.has(s); ) s = `${r}_${n}_${a++}`;
  return s;
}
function Nn(t) {
  return {
    rig_profile: !!(t.rig && Object.keys(t.rig.bone_map || {}).length) ? t.rig.profile || "omnicam_humanoid_v1" : null,
    pose: { preset_id: "neutral", root_offset: [0, 0, 0], joints: {} },
    motion: null
  };
}
function Rn(t, e = {}) {
  if (!t || typeof t != "object" || !t.id)
    throw new Error("compileInstance: an AssetDefinition is required");
  const n = In(e.point, [0, 0, 0]), r = String(e.idSeed || Date.now().toString(36)), s = String(t.kind || "prop"), a = s === "character", o = vn[t.id];
  if (s === "helper" && !t.file && o && o !== "null")
    return {
      id: nt(o, e.existingIds, r),
      type: o,
      name: t.name || o,
      position: n,
      rotation: [0, 0, 0],
      size: [...t.base_size || [1, 1, 1]],
      keyframes: [],
      enabled: !0,
      asset_id: t.id,
      asset_kind: s,
      tags: [...t.tags || []]
    };
  const i = {
    id: nt(s === "character" ? "character" : s, e.existingIds, r),
    type: "glb",
    // `type` stays "glb" for legacy render compatibility; `format` drives which
    // three.js loader the viewport picks (a catalog FBX character needs
    // FBXLoader, not GLTFLoader).
    format: String(t.format || "glb").toLowerCase() === "fbx" ? "fbx" : "glb",
    name: t.name || t.id,
    position: n,
    rotation: [0, 0, 0],
    size: [1, 1, 1],
    keyframes: [],
    enabled: !0,
    asset: kn(t),
    asset_id: t.id,
    asset_kind: s,
    tags: [...t.tags || []]
  };
  return a && (i.character = Nn(t)), i;
}
function xr({ groundHit: t, orbitTarget: e } = {}) {
  return Array.isArray(t) && t.length >= 3 && t.every((n) => Number.isFinite(n)) ? t.slice(0, 3).map(Number) : Array.isArray(e) && e.length >= 3 && e.every((n) => Number.isFinite(n)) ? [Number(e[0]), 0, Number(e[2])] : [0, 0, 0];
}
const $e = ["pos_x", "pos_y", "pos_z"], Se = 1e-9, ht = ["auto", "aligned", "free", "corner"];
function M(t, e = 0) {
  const n = Number(t);
  return Number.isFinite(n) ? n : e;
}
function P(t) {
  const e = t?.camera?.position;
  return [M(e?.[0]), M(e?.[1]), M(e?.[2])];
}
function te(t, e) {
  return [t[0] - e[0], t[1] - e[1], t[2] - e[2]];
}
function rt(t) {
  return Math.hypot(t[0], t[1], t[2]);
}
function pe(t, e) {
  return [t[0] * e, t[1] * e, t[2] * e];
}
function Oe(t, e, n) {
  const r = P(t), s = e ? P(e) : r, a = n ? P(n) : r, o = Math.max(Se, M(t?.frame) - M(e?.frame, M(t?.frame) - 1)), i = Math.max(Se, M(n?.frame, M(t?.frame) + 1) - M(t?.frame)), l = [0, 0, 0], m = [0, 0, 0];
  for (let d = 0; d < 3; d += 1) {
    const c = (r[d] - s[d]) / o, h = (a[d] - r[d]) / i;
    let g = (c + h) * 0.5;
    e ? n ? c * h <= 0 && (g = 0) : g = c : g = h, l[d] = g * i * (1 / 3), m[d] = -g * o * (1 / 3);
  }
  return { out: l, in: m };
}
function _t(t, e, n) {
  const r = P(t), s = e ? P(e) : r, a = n ? P(n) : r;
  return {
    out: pe(te(a, r), 1 / 3),
    in: pe(te(s, r), 1 / 3)
  };
}
function Ce(t, e) {
  const n = t?.tangents?.channels;
  if (!n) return null;
  const r = e === "out" ? "out_y" : "in_y", s = [0, 0, 0];
  let a = !1;
  for (let o = 0; o < 3; o += 1) {
    const i = n[$e[o]];
    i && Number.isFinite(Number(i[r])) && (s[o] = Number(i[r]), a = !0);
  }
  return a ? s : null;
}
function ge(t) {
  const e = t?.tangents?.spatial_mode;
  return ht.includes(e) ? e : "auto";
}
function je(t, e = null, n = null) {
  const r = ge(t), s = P(t);
  if (r === "corner") {
    const l = _t(t, e, n);
    return { in: de(s, l.in), out: de(s, l.out), mode: r };
  }
  const a = Oe(t, e, n), o = (r === "free" || r === "aligned") && Ce(t, "out") || a.out, i = (r === "free" || r === "aligned") && Ce(t, "in") || a.in;
  return { in: de(s, i), out: de(s, o), mode: r };
}
function de(t, e) {
  return [t[0] + e[0], t[1] + e[1], t[2] + e[2]];
}
function Sn(t) {
  return t.tangents = t.tangents && typeof t.tangents == "object" ? t.tangents : {}, t.tangents.channels = t.tangents.channels && typeof t.tangents.channels == "object" ? t.tangents.channels : {}, t.tangents.channels;
}
function G(t, e, n) {
  const r = Sn(t);
  for (let s = 0; s < 3; s += 1) {
    const a = $e[s], o = r[a] && typeof r[a] == "object" ? r[a] : {};
    o.mode = "free", o.out_x = 1 / 3, o.in_x = -1 / 3, e === "out" ? o.out_y = n[s] : o.in_y = n[s], o.out_y === void 0 && (o.out_y = 0), o.in_y === void 0 && (o.in_y = 0), r[a] = o;
  }
}
function be(t) {
  t.interpolation !== "bezier" && (t.interpolation = "bezier");
}
function pt(t, e, n) {
  const r = P(t), s = je(t, e, n);
  G(t, "out", te(s.out, r)), G(t, "in", te(s.in, r));
}
function Fr(t, e, n, { prevKey: r = null, nextKey: s = null, breakCoupling: a = !1 } = {}) {
  if (!t || e !== "in" && e !== "out") return t;
  let o = ge(t);
  if (o === "corner") return t;
  o === "auto" && (o = "aligned", t.tangents = t.tangents && typeof t.tangents == "object" ? t.tangents : {}, t.tangents.spatial_mode = "aligned", pt(t, r, s));
  const i = P(t), l = te([
    M(n?.[0]),
    M(n?.[1]),
    M(n?.[2])
  ], i);
  if (be(t), G(t, e, l), o === "aligned" && !a) {
    const m = e === "out" ? "in" : "out", d = Ce(t, m) || (m === "out" ? Oe(t, r, s).out : Oe(t, r, s).in), c = rt(l), h = rt(d) || c || 1, g = c > Se ? pe(l, -h / c) : pe(d, 1);
    G(t, m, g);
  }
  return t;
}
function fe(t, e, n) {
  if (!t || e !== "in" && e !== "out") return t;
  const r = P(t);
  return be(t), G(t, e, te([
    M(n?.[0]),
    M(n?.[1]),
    M(n?.[2])
  ], r)), t;
}
function $r(t, e, { prevKey: n = null, nextKey: r = null } = {}) {
  if (!t || !ht.includes(e)) return t;
  if (t.tangents = t.tangents && typeof t.tangents == "object" ? t.tangents : {}, t.tangents.spatial_mode = e, e === "auto") {
    if (t.tangents.channels) {
      for (const s of $e) delete t.tangents.channels[s];
      Object.keys(t.tangents.channels).length || delete t.tangents.channels;
    }
    return t.interpolation === "bezier" && (t.interpolation = "smooth"), t;
  }
  if (e === "corner") {
    const s = _t(t, n, r);
    return be(t), G(t, "out", s.out), G(t, "in", s.in), t;
  }
  return be(t), pt(t, n, r), t;
}
const gt = 1e-9;
function On(t, e) {
  if (e === "object") {
    const r = t.transform || {};
    return [
      ...(r.position || [0, 0, 0]).map(Number),
      ...(r.rotation || [0, 0, 0]).map(Number),
      ...(r.size || [1, 1, 1]).map(Number)
    ];
  }
  const n = t.camera || {};
  return [
    ...(n.position || [0, 0, 0]).map(Number),
    ...(n.target || [0, 0, 0]).map(Number),
    Number(n.fov) || 0,
    Number(n.roll) || 0,
    Number(n.zoom) || 1
  ];
}
function Cn(t) {
  const e = t[0]?.length || 0, n = new Array(e).fill(1);
  for (let r = 0; r < e; r += 1) {
    let s = 1 / 0, a = -1 / 0;
    for (const i of t) {
      const l = Number.isFinite(i[r]) ? i[r] : 0;
      l < s && (s = l), l > a && (a = l);
    }
    const o = a - s;
    n[r] = o > gt ? 1 / o : 0;
  }
  return n;
}
function ze(t, e) {
  const n = t.map((o) => On(o, e)), r = Cn(n), s = t.map((o) => o.frame), a = Math.max(1, s[s.length - 1] - s[0]);
  return n.map((o, i) => [
    (s[i] - s[0]) / a,
    ...o.map((l, m) => (Number.isFinite(l) ? l : 0) * r[m])
  ]);
}
function st(t, e) {
  let n = 0;
  for (let r = 0; r < t.length; r += 1) n += (t[r] - e[r]) ** 2;
  return Math.sqrt(n);
}
function He(t, e, n) {
  let r = 0;
  for (let i = 0; i < e.length; i += 1) r += (n[i] - e[i]) ** 2;
  if (r <= gt) return st(t, e);
  let s = 0;
  for (let i = 0; i < e.length; i += 1) s += (t[i] - e[i]) * (n[i] - e[i]);
  const a = Math.max(0, Math.min(1, s / r)), o = e.map((i, l) => i + (n[l] - i) * a);
  return st(t, o);
}
function jn(t, e, n) {
  const r = /* @__PURE__ */ new Set([0, t.length - 1]), s = [[0, t.length - 1]];
  for (; s.length; ) {
    const [a, o] = s.pop();
    if (o - a < 2) continue;
    let i = -1, l = -1;
    for (let m = a + 1; m < o; m += 1) {
      const d = He(t[m], t[a], t[o]);
      d > i && (i = d, l = m);
    }
    l < 0 || (i > e || n.has(l)) && (r.add(l), s.push([a, l], [l, o]));
  }
  return r;
}
function zr(t, e, { tolerance: n = 0.02, keepFrames: r = [] } = {}) {
  const s = [...t].sort((d, c) => d.frame - c.frame);
  if (s.length <= 2 || n <= 0) return { keys: s, removed: 0 };
  const a = ze(s, e), o = /* @__PURE__ */ new Set(), i = new Set(r);
  s.forEach((d, c) => {
    i.has(d.frame) && o.add(c);
  });
  const l = jn(a, n, o);
  for (const d of o) l.add(d);
  const m = s.filter((d, c) => l.has(c));
  return { keys: m, removed: s.length - m.length };
}
function Hr(t, e, { target: n = 2, keepFrames: r = [] } = {}) {
  let s = [...t].sort((l, m) => l.frame - m.frame);
  const a = Math.max(2, Math.round(n));
  if (s.length <= a) return { keys: s, removed: 0 };
  const o = new Set(r), i = s.length;
  for (; s.length > a; ) {
    const l = ze(s, e);
    let m = -1, d = 1 / 0;
    for (let c = 1; c < s.length - 1; c += 1) {
      if (o.has(s[c].frame)) continue;
      const h = He(l[c], l[c - 1], l[c + 1]);
      h < d && (d = h, m = c);
    }
    if (m < 0) break;
    s = s.filter((c, h) => h !== m);
  }
  return { keys: s, removed: i - s.length };
}
function Vr(t, e, { mergeWithin: n = 1, epsilon: r = 1e-3, keepFrames: s = [] } = {}) {
  const a = [...t].sort((h, g) => h.frame - g.frame), o = a.length, i = new Set(s), l = [];
  for (const h of a) {
    const g = l[l.length - 1];
    g && h.frame - g.frame <= Math.max(0, n) && !i.has(h.frame) || l.push(h);
  }
  if (l.length <= 2) return { keys: l, removed: o - l.length };
  const m = ze(l, e), d = /* @__PURE__ */ new Set();
  for (let h = 1; h < l.length - 1; h += 1) {
    if (i.has(l[h].frame)) continue;
    const g = d.has(h - 1) ? null : h - 1;
    if (g === null) continue;
    He(m[h], m[g], m[h + 1]) <= r && d.add(h);
  }
  const c = l.filter((h, g) => !d.has(g));
  return { keys: c, removed: o - c.length };
}
function Mn(t, e, { minKeys: n = 0 } = {}) {
  const r = new Set(e), s = t.filter((a) => !r.has(a.frame));
  if (s.length < n) {
    const a = t.filter((o) => r.has(o.frame)).sort((o, i) => o.frame - i.frame);
    for (; s.length < n && a.length; ) s.push(a.shift());
    s.sort((o, i) => o.frame - i.frame);
  }
  return { keys: s, removed: t.length - s.length };
}
function Kr(t, e, n, { lastFrame: r = 1 / 0 } = {}) {
  const s = [...e].sort((d, c) => d - c);
  if (!n || !s.length)
    return { keys: [...t], moved: 0, frames: s };
  const a = new Set(s), o = new Set(t.filter((d) => !a.has(d.frame)).map((d) => d.frame)), i = s.map((d) => d + n);
  return i.some((d) => d < 0 || d > r || o.has(d)) || new Set(i).size !== i.length ? { keys: [...t], moved: 0, frames: s } : { keys: t.map((d) => a.has(d.frame) ? { ...d, frame: d.frame + n } : d).sort((d, c) => d.frame - c.frame), moved: s.length, frames: i.sort((d, c) => d - c) };
}
function Wr(t, e, n) {
  const r = new Set(e);
  return t.map((s) => r.has(s.frame) ? { ...s, interpolation: n } : s);
}
function Jr(t, e, n, r = []) {
  const s = new Set(e);
  return t.map((a) => {
    if (!s.has(a.frame)) return a;
    const o = { mode: n, channels: { ...a.tangents?.channels || {} } };
    for (const l of r)
      o.channels[l] = { ...o.channels[l] || {}, mode: n };
    const i = n !== "auto" && a.interpolation !== "bezier" ? "bezier" : a.interpolation;
    return { ...a, interpolation: i, tangents: o };
  });
}
function Gr(t, e, n = "camera", r = 0.5) {
  const s = new Set(e), a = [...t].sort((d, c) => d.frame - c.frame), o = [];
  if (a.forEach((d, c) => {
    s.has(d.frame) && o.push(c);
  }), o.length < 2) return t;
  const i = r * 0.5, l = 1 - r, m = a.map((d) => ({
    ...d,
    camera: d.camera ? { ...d.camera, position: [...d.camera.position], target: [...d.camera.target || [0, 0, 0]] } : void 0,
    transform: d.transform ? { ...d.transform, position: [...d.transform.position], rotation: [...d.transform.rotation || [0, 0, 0]] } : void 0
  }));
  for (let d = 0; d < o.length; d += 1) {
    const c = o[d], h = d > 0 ? o[d - 1] : c > 0 ? c - 1 : null, g = d < o.length - 1 ? o[d + 1] : c < a.length - 1 ? c + 1 : null;
    if (h === null || g === null) continue;
    const A = a[h], p = a[c], T = a[g];
    if (n === "object" && p.transform && A.transform && T.transform)
      for (let E = 0; E < 3; E += 1)
        m[c].transform.position[E] = i * A.transform.position[E] + l * p.transform.position[E] + i * T.transform.position[E], p.transform.rotation && A.transform.rotation && T.transform.rotation && (m[c].transform.rotation[E] = i * A.transform.rotation[E] + l * p.transform.rotation[E] + i * T.transform.rotation[E]);
    else if (p.camera && A.camera && T.camera) {
      for (let E = 0; E < 3; E += 1)
        m[c].camera.position[E] = i * A.camera.position[E] + l * p.camera.position[E] + i * T.camera.position[E], m[c].camera.target[E] = i * (A.camera.target?.[E] ?? 0) + l * (p.camera.target?.[E] ?? 0) + i * (T.camera.target?.[E] ?? 0);
      Number.isFinite(p.camera.roll) && Number.isFinite(A.camera.roll) && Number.isFinite(T.camera.roll) && (m[c].camera.roll = i * A.camera.roll + l * p.camera.roll + i * T.camera.roll), Number.isFinite(p.camera.fov) && Number.isFinite(A.camera.fov) && Number.isFinite(T.camera.fov) && (m[c].camera.fov = i * A.camera.fov + l * p.camera.fov + i * T.camera.fov);
    }
  }
  return m;
}
function X(t, e, n) {
  return [0, 1, 2].map((r) => t[r] + (e[r] - t[r]) * n);
}
function Dn(t, e, n, r, s) {
  const a = X(t, e, s), o = X(e, n, s), i = X(n, r, s), l = X(a, o, s), m = X(o, i, s), d = X(l, m, s);
  return { left: [t, a, l, d], right: [d, m, i, r], point: d };
}
function Un(t, e, n, r) {
  const s = new Set(t.map((i) => i.frame)), a = Math.min(n - 1, Math.max(e + 1, r));
  if (!s.has(a)) return a;
  const o = n - e;
  for (let i = 1; i < o; i += 1)
    for (const l of [a - i, a + i])
      if (!(l <= e || l >= n) && !s.has(l))
        return l;
  return -1;
}
function Ln(t, { leftFrame: e, rightFrame: n, t: r = 0.5 } = {}) {
  const s = [...t].sort((y, w) => y.frame - w.frame), a = s.findIndex((y) => y.frame === e), o = a >= 0 ? a + 1 : -1;
  if (a < 0 || o < 0 || o >= s.length || s[o].frame !== n)
    return { ok: !1, reason: "segment_not_found" };
  if (n - e < 2)
    return { ok: !1, reason: "no_free_frame" };
  const i = Math.min(0.999, Math.max(1e-3, Number.isFinite(r) ? r : 0.5)), l = Math.round(e + i * (n - e)), m = Un(s, e, n, l);
  if (m < 0) return { ok: !1, reason: "no_free_frame" };
  const d = (m - e) / (n - e), c = s[a], h = s[o], g = a > 0 ? s[a - 1] : null, A = o + 1 < s.length ? s[o + 1] : null, p = c.interpolation === "bezier" || h.interpolation === "bezier", T = ce({ keyframes: s }, m), E = { frame: m, interpolation: p ? "bezier" : c.interpolation, camera: T };
  if (p) {
    const y = [...c.camera.position], w = je(c, g, h).out, v = je(h, c, A).in, N = [...h.camera.position], O = Dn(y, w, v, N, d);
    E.camera = { ..._e(T), position: [...O.point] };
    const D = ge(c);
    (D === "free" || D === "aligned") && fe(c, "out", O.left[1]);
    const Y = ge(h);
    (Y === "free" || Y === "aligned") && fe(h, "in", O.right[2]), fe(E, "in", O.left[2]), fe(E, "out", O.right[1]);
  }
  return { ok: !0, keys: [...s, E].sort((y, w) => y.frame - w.frame), frame: m };
}
function Bn(t, e) {
  const { keys: n, removed: r } = Mn(t, e, { minKeys: 1 });
  return { ok: r > 0, keys: n, removed: r };
}
function Me(t, e) {
  const n = e || t.active_camera_id, r = (t.cameras || []).find((s) => s.id === n);
  if (!r) throw new u("UNKNOWN_CAMERA", `${n} does not exist`);
  return r;
}
function De(t, e) {
  const n = (t.objects || []).find((r) => r.id === e);
  if (!n) throw new u("UNKNOWN_OBJECT", `${e} does not exist`);
  return n;
}
function ue(t, e) {
  const n = K(t, e);
  if (n.asset_kind !== "character")
    throw new u("NOT_A_CHARACTER", `${e} is not a character`);
  return n;
}
function B(t, e) {
  const n = Me(t, e);
  if (n.locked)
    throw new u("ENTITY_LOCKED", `${n.id} is locked`);
  return n;
}
function K(t, e) {
  const n = De(t, e);
  if (n.locked)
    throw new u("ENTITY_LOCKED", `${n.id} is locked`);
  return n;
}
function ve(t) {
  return (!t.camera || typeof t.camera != "object") && (t.camera = {}), t.camera;
}
function me(t, e) {
  return (t.keyframes || []).find((n) => n.frame === e) || null;
}
function ne(t, e, n) {
  e.keyframes = n, e.id === t.active_camera_id && (t.keyframes = n);
}
const re = f.viewport | f.previews | f.timeline | f.inspector;
function at(t, e, n) {
  const r = new Set((t.keyframes || []).map((a) => a.frame)), s = e.find((a) => !r.has(a));
  if (s !== void 0)
    throw new u("UNKNOWN_KEYFRAME", `${n}: camera has no key at frame ${s}`);
}
const Pn = {
  [_.ASSET_INSTANTIATE](t, e) {
    const n = new Set((t.objects || []).map((s) => s.id));
    let r;
    try {
      r = Rn(e.asset, { point: e.point, idSeed: e.id, existingIds: n });
    } catch (s) {
      throw new u("BAD_ASSET", `asset.instantiate could not compile: ${s.message}`);
    }
    return (t.objects ||= []).push(r), {
      dirtyMask: f.viewport | f.previews | f.outliner | f.inspector,
      outcome: { objectId: r.id, assetId: r.asset_id || null }
    };
  },
  [_.CAMERA_SET_ACTIVE](t, e) {
    return Me(t, e.cameraId), t.active_camera_id = e.cameraId, { dirtyMask: f.viewport | f.previews | f.inspector | f.outliner | f.timeline };
  },
  [_.CAMERA_SET_LOCKED](t, e) {
    return Me(t, e.cameraId).locked = e.value, { dirtyMask: f.outliner | f.inspector | f.viewport };
  },
  [_.CAMERA_CREATE](t, e) {
    const n = qt(t, e);
    return { dirtyMask: f.outliner | f.inspector | f.viewport | f.previews | f.timeline, outcome: n };
  },
  [_.CAMERA_DUPLICATE](t, e) {
    const n = Qt(t, e);
    return { dirtyMask: f.outliner | f.inspector | f.viewport | f.previews | f.timeline, outcome: n };
  },
  [_.CAMERA_DELETE](t, e) {
    const n = Xt(t, e);
    return { dirtyMask: f.outliner | f.inspector | f.viewport | f.previews | f.timeline, outcome: n };
  },
  [_.CAMERA_RENAME](t, e) {
    B(t, e.cameraId);
    const n = Zt(t, e);
    return { dirtyMask: f.outliner | f.inspector, outcome: n };
  },
  [_.CAMERA_SET_PLAYBLAST](t, e) {
    const n = en(t, e);
    return { dirtyMask: f.outliner | f.inspector | f.status, outcome: n };
  },
  [_.CAMERA_TRANSFORM](t, e) {
    const n = B(t, e.cameraId), r = ve(n);
    if (e.position && (r.position = [...e.position]), e.target && (r.target = [...e.target]), Number.isInteger(e.frame)) {
      const s = me(n, e.frame);
      if (!s) throw new u("UNKNOWN_KEYFRAME", `camera has no key at frame ${e.frame}`);
      s.camera = { ...s.camera }, e.position && (s.camera.position = [...e.position]), e.target && (s.camera.target = [...e.target]);
    }
    return { dirtyMask: f.viewport | f.previews | f.inspector | f.timeline };
  },
  [_.CAMERA_LOOK_AT](t, e) {
    const n = B(t, e.cameraId);
    if (e.objectId !== void 0 && (e.objectId === null || e.objectId === "" ? (n.target_object_id = null, n.id === t.active_camera_id && (t.target_object_id = null)) : (De(t, e.objectId), n.target_object_id = e.objectId, n.id === t.active_camera_id && (t.target_object_id = e.objectId))), e.point) {
      const r = ve(n);
      r.target = [...e.point];
      for (const s of n.keyframes || [])
        s.camera = { ...s.camera, target: [...e.point] };
    }
    return { dirtyMask: f.viewport | f.previews | f.inspector | f.timeline };
  },
  [_.OBJECT_CREATE](t, e) {
    const n = tn(t, e);
    return { dirtyMask: f.viewport | f.previews | f.outliner | f.inspector, outcome: n };
  },
  [_.OBJECT_DUPLICATE](t, e) {
    const n = nn(t, e);
    return { dirtyMask: f.viewport | f.previews | f.outliner | f.inspector, outcome: n };
  },
  [_.OBJECT_DELETE](t, e) {
    const n = rn(t, e);
    return { dirtyMask: f.viewport | f.previews | f.outliner | f.inspector, outcome: n };
  },
  [_.OBJECT_RENAME](t, e) {
    K(t, e.objectId);
    const n = sn(t, e);
    return { dirtyMask: f.outliner | f.inspector, outcome: n };
  },
  [_.OBJECT_SET_PARENT](t, e) {
    K(t, e.objectId);
    const n = an(t, e);
    return { dirtyMask: f.viewport | f.outliner | f.inspector, outcome: n };
  },
  [_.OBJECT_TRANSFORM](t, e) {
    const n = K(t, e.objectId);
    return e.position && (n.position = [...e.position]), e.rotation && (n.rotation = [...e.rotation]), e.scale && (n.size = [...e.scale]), { dirtyMask: f.viewport | f.previews | f.inspector };
  },
  [_.OBJECT_SET_ENABLED](t, e) {
    return K(t, e.objectId).enabled = e.value, { dirtyMask: f.viewport | f.previews | f.outliner | f.inspector };
  },
  [_.OBJECT_SET_LOCKED](t, e) {
    return De(t, e.objectId).locked = e.value, { dirtyMask: f.outliner | f.inspector };
  },
  [_.OBJECT_SET_TAGS](t, e) {
    const n = K(t, e.objectId), r = Dt(e.tags), s = r.length !== e.tags.length ? "some tags were dropped or normalised" : void 0;
    return r.length ? n.tags = r : delete n.tags, { dirtyMask: f.outliner | f.inspector | f.viewport, warning: s };
  },
  [_.OBJECT_SET_ANNOTATION](t, e) {
    const n = K(t, e.objectId), r = e.annotation === null ? null : Mt(e.annotation);
    if (e.annotation && !r)
      throw new u("BAD_ANNOTATION", "annotation failed validation (text, hex colour, anchor)");
    return r ? n.annotation = r : delete n.annotation, { dirtyMask: f.viewport | f.outliner | f.inspector };
  },
  [_.CHARACTER_SET_POSE](t, e) {
    const n = ue(t, e.objectId);
    if (n.character?.motion)
      throw new u("POSE_MOTION_EXCLUSIVE", "clear the motion clip before editing the pose");
    return n.character = {
      ...n.character || {},
      pose: e.pose === null ? We(null) : We(e.pose)
    }, { dirtyMask: f.viewport | f.previews | f.inspector };
  },
  [_.CHARACTER_SET_JOINT_ROTATION](t, e) {
    const n = ue(t, e.objectId);
    if (n.character?.motion)
      throw new u("POSE_MOTION_EXCLUSIVE", "clear the motion clip before editing the pose");
    if (!Ct(e.rotation))
      throw new u("BAD_QUATERNION", "rotation is not a usable unit quaternion");
    return n.character = {
      ...n.character || {},
      pose: jt(n.character?.pose, e.joint, e.rotation)
    }, { dirtyMask: f.viewport | f.previews | f.inspector };
  },
  [_.CHARACTER_SET_MOTION](t, e) {
    const n = ue(t, e.objectId), r = Ot(e.motion);
    if (!r) throw new u("BAD_MOTION", "motion failed validation (clip_id, speed, range)");
    const s = n.character?.pose || {};
    return n.character = {
      ...n.character || {},
      pose: { preset_id: s.preset_id || "neutral", root_offset: s.root_offset || [0, 0, 0], joints: {} },
      motion: r
    }, { dirtyMask: f.viewport | f.previews | f.timeline | f.inspector };
  },
  [_.CHARACTER_CLEAR_MOTION](t, e) {
    const n = ue(t, e.objectId);
    return n.character ? (n.character = { ...n.character, motion: null }, { dirtyMask: f.viewport | f.previews | f.timeline | f.inspector }) : { dirtyMask: 0 };
  },
  [_.KEYFRAME_UPSERT](t, e) {
    const n = B(t, e.cameraId);
    if (e.frame >= (t.duration_frames || 0))
      throw new u("FRAME_OUT_OF_RANGE", `frame ${e.frame} is past the timeline`);
    n.keyframes ||= [];
    let r = me(n, e.frame);
    const s = !r;
    if (!r) {
      const o = me(n, 0)?.camera || n.camera || {};
      r = { frame: e.frame, camera: JSON.parse(JSON.stringify(o)), interpolation: "ease" }, n.keyframes.push(r), n.keyframes.sort((i, l) => i.frame - l.frame);
    }
    e.camera && (r.camera = { ...r.camera, ...JSON.parse(JSON.stringify(e.camera)) }), e.interpolation && (r.interpolation = e.interpolation);
    const a = s && !e.camera ? `keyframe at frame ${e.frame} was created from the existing pose (no "camera" given) -- it will not move the camera unless another keyframe with a different position/target exists` : void 0;
    return { dirtyMask: f.viewport | f.previews | f.timeline | f.inspector, warning: a };
  },
  [_.KEYFRAME_REMOVE](t, e) {
    const n = B(t, e.cameraId), r = (n.keyframes || []).length;
    if (n.keyframes = (n.keyframes || []).filter((a) => a.frame !== e.frame), n.keyframes.length === r)
      throw new u("UNKNOWN_KEYFRAME", `camera has no key at frame ${e.frame}`);
    const s = n.keyframes.length === 0 ? "camera has no keyframes left" : void 0;
    return { dirtyMask: f.viewport | f.previews | f.timeline | f.inspector, warning: s };
  },
  [_.KEYFRAME_SET_INTERPOLATION](t, e) {
    const n = B(t, e.cameraId), r = me(n, e.frame);
    if (!r) throw new u("UNKNOWN_KEYFRAME", `camera has no key at frame ${e.frame}`);
    if (!he.includes(e.interpolation))
      throw new u("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`);
    return r.interpolation = e.interpolation, { dirtyMask: f.timeline | f.viewport | f.previews };
  },
  [_.TIMELINE_SET_RANGE](t, e) {
    const n = Math.max(0, (t.duration_frames || 1) - 1);
    if (e.start > n || e.end > n)
      throw new u("FRAME_OUT_OF_RANGE", `range must stay within 0..${n}`);
    return t.playback_range = [e.start, e.end], { dirtyMask: f.timeline | f.status };
  },
  [_.TIMELINE_SET_DURATION](t, e) {
    if (t.duration_frames = e.frames, Array.isArray(t.playback_range)) {
      const n = e.frames - 1;
      t.playback_range = [
        Math.min(t.playback_range[0], n),
        Math.min(t.playback_range[1], n)
      ];
    }
    return { dirtyMask: f.timeline | f.viewport | f.previews | f.status };
  },
  [_.CUT_UPSERT](t, e) {
    const n = on(t, e);
    return { dirtyMask: f.timeline | f.viewport | f.previews | f.status, outcome: n };
  },
  [_.CUT_REMOVE](t, e) {
    const n = cn(t, e);
    return { dirtyMask: f.timeline | f.viewport | f.previews | f.status, outcome: n };
  },
  [_.CUT_SET_CAMERA](t, e) {
    const n = ln(t, e);
    return { dirtyMask: f.timeline | f.viewport | f.previews | f.status, outcome: n };
  },
  // Semantic Director API path operations (plan section 22): the same pure
  // maths the manual UI's TransformControls wiring / toolbar actions use
  // (viewport/transform-controls-wiring.js, director/methods/scene.js),
  // reached atomically and with the exact same lock/existence checks. No
  // raw Three.js object ever crosses this boundary -- every input/output
  // here is plain JSON (frames, vectors, strings).
  [_.CAMERA_PATH_TRANSFORM_KEYS](t, e) {
    const n = B(t, e.cameraId);
    at(n, e.frames, "camera.path.transform_keys");
    const r = (n.keyframes || []).filter((o) => e.frames.includes(o.frame)), s = Array.isArray(e.transform.origin) ? e.transform.origin : Nt(r), a = Rt(n.keyframes || [], e.frames, {
      mode: e.transform.mode,
      origin: s,
      delta: e.transform.delta,
      factors: e.transform.factors,
      rotationDeg: e.transform.rotationDeg,
      lookAtActive: St(n, t.objects)
    });
    return ne(t, n, a), { dirtyMask: re };
  },
  [_.CAMERA_PATH_INSERT_KEY](t, e) {
    const n = B(t, e.cameraId), r = Ln(n.keyframes || [], {
      leftFrame: e.leftFrame,
      rightFrame: e.rightFrame,
      t: e.t
    });
    if (!r.ok)
      throw new u(
        r.reason === "no_free_frame" ? "NO_FREE_FRAME" : "SEGMENT_NOT_FOUND",
        `camera.path.insert_key: could not insert a key between frame ${e.leftFrame} and ${e.rightFrame}`
      );
    return ne(t, n, r.keys), { dirtyMask: re, outcome: { frame: r.frame } };
  },
  [_.CAMERA_PATH_DELETE_KEYS](t, e) {
    const n = B(t, e.cameraId);
    at(n, e.frames, "camera.path.delete_keys");
    const r = Bn(n.keyframes || [], e.frames);
    if (!r.ok)
      throw new u("CANNOT_DELETE", "camera.path.delete_keys: a camera track needs at least one key");
    return ne(t, n, r.keys), { dirtyMask: re, outcome: { removed: r.removed } };
  },
  [_.CAMERA_PATH_REDISTRIBUTE_TIMING](t, e) {
    const n = B(t, e.cameraId), r = [...n.keyframes || []].sort((i, l) => i.frame - l.frame), s = Number.isInteger(e.startFrame) ? e.startFrame : r[0]?.frame, a = Number.isInteger(e.endFrame) ? e.endFrame : r[r.length - 1]?.frame, o = kt(r, { startFrame: s, endFrame: a });
    if (!o.ok) {
      const i = { not_enough_keys: "NOT_ENOUGH_KEYS", invalid_range: "BAD_RANGE", insufficient_frame_slots: "INSUFFICIENT_FRAME_SLOTS" };
      throw new u(i[o.reason] || "BAD_RANGE", `camera.path.redistribute_timing: ${o.reason}`);
    }
    return ne(t, n, o.keys), { dirtyMask: re };
  },
  [_.CAMERA_PATH_APPLY_PRESET](t, e) {
    const n = B(t, e.cameraId), r = ve(n), s = mn({
      type: e.presetType,
      camera: r,
      target: e.target,
      startFrame: e.startFrame,
      endFrame: e.endFrame,
      params: e.params || {}
    });
    if (!s.ok) {
      const a = { unknown_preset: "UNKNOWN_PRESET", invalid_camera: "BAD_VALUE", invalid_range: "BAD_RANGE", insufficient_frame_slots: "INSUFFICIENT_FRAME_SLOTS" };
      throw new u(a[s.reason] || "BAD_VALUE", `camera.path.apply_preset: ${s.reason}`);
    }
    return ne(t, n, s.keyframes), { dirtyMask: re };
  }
};
function xn({ state: t, operation: e }) {
  const n = Pn[e.type];
  if (!n) throw new u("UNKNOWN_OPERATION", `Unknown operation type: ${e.type}`);
  return n(t, e) || { dirtyMask: 0 };
}
const Fn = 100;
function Ue(t, e) {
  if (t === e) return !0;
  if (typeof t != typeof e) return !1;
  if (Array.isArray(t) || Array.isArray(e))
    return !Array.isArray(t) || !Array.isArray(e) || t.length !== e.length ? !1 : t.every((n, r) => Ue(n, e[r]));
  if (t && e && typeof t == "object") {
    const n = /* @__PURE__ */ new Set([...Object.keys(t), ...Object.keys(e)]);
    for (const r of n) if (!Ue(t[r], e[r])) return !1;
    return !0;
  }
  return !1;
}
function V(t) {
  return new Map((t || []).map((e) => [e.id, e]));
}
function $n(t, e) {
  const n = [];
  let r = !1;
  const s = (a, o, i, l) => {
    if (!r && !Ue(i, l)) {
      if (n.length >= Fn) {
        r = !0;
        return;
      }
      n.push({ entity: a, field: o, before: i ?? null, after: l ?? null });
    }
  };
  return Hn(t, e, s), Kn(t, e, s), Jn(t, e, s), Wn(t, e, s), Gn(t, e, s), Yn(t, e, s), { changes: n, truncated: r };
}
const zn = ["fov", "roll", "zoom", "near", "far", "camera_type"];
function Hn(t, e, n) {
  const r = V(t?.cameras), s = V(e?.cameras);
  for (const a of r.keys())
    s.has(a) || n(a, "camera", "present", null);
  for (const [a, o] of s) {
    const i = r.get(a);
    if (!i) {
      n(a, "camera", null, "present");
      continue;
    }
    n(a, "name", i.name, o.name), n(a, "locked", !!i.locked, !!o.locked), n(a, "muted", !!i.muted, !!o.muted), n(a, "solo", !!i.solo, !!o.solo), n(a, "target_object_id", i.target_object_id ?? null, o.target_object_id ?? null), n(a, "position", i.camera?.position, o.camera?.position), n(a, "target", i.camera?.target, o.camera?.target);
    for (const l of zn)
      n(a, l, i.camera?.[l], o.camera?.[l]);
  }
}
const Vn = ["position", "target", "fov", "roll", "zoom", "near", "far", "camera_type"];
function Kn(t, e, n) {
  const r = V(t?.cameras), s = V(e?.cameras);
  for (const [a, o] of s) {
    const i = r.get(a), l = new Map((i?.keyframes || []).map((c) => [c.frame, c])), m = new Map((o.keyframes || []).map((c) => [c.frame, c])), d = `${a}@keyframes`;
    for (const [c, h] of l)
      m.has(c) || n(d, `frame_${c}`, h.interpolation ?? "present", null);
    for (const [c, h] of m) {
      const g = l.get(c);
      if (!g) {
        n(d, `frame_${c}`, null, h.interpolation ?? "present");
        continue;
      }
      for (const A of Vn)
        n(d, `frame_${c}_${A}`, g.camera?.[A], h.camera?.[A]);
      n(d, `frame_${c}_interpolation`, g.interpolation, h.interpolation);
    }
  }
}
function Wn(t, e, n) {
  const r = V(t?.objects), s = V(e?.objects);
  for (const [a, o] of s) {
    const l = r.get(a)?.character?.pose?.joints || {}, m = o.character?.pose?.joints || {}, d = /* @__PURE__ */ new Set([...Object.keys(l), ...Object.keys(m)]);
    for (const c of d)
      n(`${a}#${c}`, "joint_rotation", l[c] ?? null, m[c] ?? null);
  }
}
function Jn(t, e, n) {
  const r = V(t?.objects), s = V(e?.objects);
  for (const [a] of r)
    s.has(a) || n(a, "object", "present", null);
  for (const [a, o] of s) {
    const i = r.get(a);
    if (!i) {
      n(a, "object", null, "present");
      continue;
    }
    n(a, "position", i.position, o.position), n(a, "rotation", i.rotation, o.rotation), n(a, "size", i.size, o.size), n(a, "name", i.name, o.name), n(a, "enabled", i.enabled !== !1, o.enabled !== !1), n(a, "locked", !!i.locked, !!o.locked), n(a, "tags", i.tags || [], o.tags || []), n(a, "annotation", i.annotation ?? null, o.annotation ?? null);
    const l = i.character?.pose?.preset_id ?? null, m = o.character?.pose?.preset_id ?? null;
    n(a, "pose_preset", l, m);
    const d = i.character?.motion?.clip_id ?? null, c = o.character?.motion?.clip_id ?? null;
    n(a, "motion_clip_id", d, c);
  }
}
function Gn(t, e, n) {
  n("timeline", "duration_frames", t?.duration_frames, e?.duration_frames), n("timeline", "playback_range", t?.playback_range ?? null, e?.playback_range ?? null);
}
function Yn(t, e, n) {
  const r = new Map((t?.sequence?.cuts || []).map((a) => [a.start, a])), s = new Map((e?.sequence?.cuts || []).map((a) => [a.start, a]));
  for (const [a, o] of r)
    s.has(a) || n(`cut_${a}`, "cut", o.camera_id, null);
  for (const [a, o] of s) {
    const i = r.get(a);
    i ? n(`cut_${a}`, "cut_camera_id", i.camera_id, o.camera_id) : n(`cut_${a}`, "cut", null, o.camera_id);
  }
}
function qn(t) {
  return typeof structuredClone == "function" ? structuredClone(t) : JSON.parse(JSON.stringify(t));
}
function Le(t) {
  return Number.isInteger(t.directorRevision) ? Math.max(0, t.directorRevision) : 0;
}
function Ie(t, e, n) {
  return {
    ok: !1,
    version: H,
    revision: Le(t),
    id: e ?? null,
    applied: 0,
    error: {
      code: n.code || "INTERNAL",
      operationIndex: n.operationIndex ?? null,
      message: n.message,
      ...n.details ? { details: n.details } : {}
    }
  };
}
function Qn(t) {
  const e = (t.state.cameras || []).find(
    (n) => n.id === t.state.active_camera_id
  ) || t.state.cameras?.[0] || null;
  return e ? (t.state.keyframes = e.keyframes, t.state.camera = _e(e.camera), t.camera = _e(e.camera), e) : null;
}
function Xn(t, e) {
  e && (t.camera = ce(
    e,
    t.frame ?? 0,
    t.state.objects || []
  ));
}
async function Zn(t, e, n) {
  const r = n.some((o) => o.resourceRefresh === !0), s = e.operations.filter((o) => o.type === _.OBJECT_DELETE).map((o) => o.objectId);
  for (const o of s)
    t.removeObjectResources?.(o);
  const a = e.operations.some((o) => o.type === _.ASSET_INSTANTIATE);
  (r || a) && await t.restoreAssets?.();
}
function er(t, e, n) {
  if (typeof t.requestUiUpdate == "function") {
    t.requestUiUpdate(e, n);
    return;
  }
  t.camera = t.sampleCamera?.(t.state, t.frame) ?? t.camera, t.refreshObjects?.(), t.refreshKeys?.(), t.refreshInspector?.(), t.render?.();
}
function tr(t, e) {
  let n;
  try {
    n = An(t, e);
  } catch (c) {
    if (c instanceof u) return Ie(t, e?.id, c);
    throw c;
  }
  const r = Le(t);
  if (n.baseRevision !== void 0 && n.baseRevision !== r)
    return Ie(
      t,
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
  const s = qn(t.state);
  let a = 0;
  const o = [], i = [];
  for (let c = 0; c < n.operations.length; c += 1)
    try {
      const h = xn({ ui: t, state: s, operation: n.operations[c] });
      a |= h?.dirtyMask || 0, h?.warning && o.push(h.warning), h?.outcome && i.push({ index: c, ...h.outcome });
    } catch (h) {
      if (h instanceof u)
        return (h.operationIndex === null || h.operationIndex === void 0) && (h.operationIndex = c), Ie(t, n.id, h);
      throw h;
    }
  if (n.validateOnly) {
    const { changes: c, truncated: h } = $n(t.state, s);
    return {
      ok: !0,
      version: H,
      revision: r,
      id: n.id,
      applied: n.operations.length,
      warnings: o,
      outcomes: i,
      dirtyMask: a,
      validateOnly: !0,
      changes: c,
      ...h ? { truncated: !0 } : {}
    };
  }
  t.checkpoint?.(n.description), t.state = ie(s);
  const l = Qn(t);
  _n(t, n.id), t.serialize?.(), Xn(t, l), er(t, a, `director-api:${n.id}`);
  const m = {
    ok: !0,
    version: H,
    baseRevision: r,
    revision: Le(t),
    id: n.id,
    applied: n.operations.length,
    warnings: o,
    outcomes: i,
    dirtyMask: a
  }, d = Zn(t, n, i).catch((c) => {
    console.warn("OmniCam: resource reconciliation failed", c), o.push({
      code: "VIEWPORT_RESOURCE_RECONCILE_FAILED",
      message: "The scene change was committed, but one or more viewport resources could not be refreshed."
    }), t.setStatus?.("The scene change was committed, but one or more viewport resources could not be refreshed.");
  });
  return Object.defineProperty(m, "_reconciliation", { value: d, enumerable: !1 }), m;
}
function nr(t) {
  return {
    query: (e) => Gt(t, e),
    execute: (e) => tr(t, e)
  };
}
function rr(t) {
  return t.directorApi = nr(t), t.directorApi;
}
const ot = "omnicam-agent/1", it = "majoor.omnicam.agent.request", sr = 1, se = Object.freeze({
  register: "/majoor/omnicam/agent/v1/session/register",
  heartbeat: "/majoor/omnicam/agent/v1/session/heartbeat",
  reply: "/majoor/omnicam/agent/v1/reply",
  close: "/majoor/omnicam/agent/v1/session/close"
}), ar = 1e4, or = 5e3, bt = "asset.instantiate_by_id", Et = "asset.catalog_search", ct = Object.freeze([
  ...ut.filter((t) => t !== _.ASSET_INSTANTIATE),
  bt
]);
function Be(t) {
  return t?.kind === "character" && t?.source === "default";
}
async function ir(t, e) {
  if (!t || !e || typeof e != "string") return null;
  const n = t.get(e);
  if (n) return Be(n) ? null : n;
  try {
    await t.setFilter({ kind: "all", search: e });
  } catch {
  }
  const r = t.get(e);
  return Be(r) ? null : r;
}
async function cr(t, e) {
  const n = t.assetBrowser?.store, r = [];
  for (const s of e || []) {
    if (s?.type !== bt) {
      r.push(s);
      continue;
    }
    if (!n)
      return { ok: !1, code: "ASSET_CATALOG_UNAVAILABLE", message: "The asset catalogue is not available in this Director session" };
    const a = await ir(n, s.assetId);
    if (!a)
      return { ok: !1, code: "UNKNOWN_ASSET", message: `Unknown catalogue asset: ${s.assetId}` };
    r.push({ type: "asset.instantiate", asset: a, id: s.id, point: s.point });
  }
  return { ok: !0, operations: r };
}
async function lr(t, e) {
  const n = t.assetBrowser?.store;
  if (!n) {
    const s = new Error("The asset catalogue is not available in this Director session");
    throw s.code = "ASSET_CATALOG_UNAVAILABLE", s;
  }
  await n.setFilter({ kind: e?.kind || "all", search: String(e?.search || "") });
  const r = (n.state?.items || []).filter((s) => !Be(s)).slice(0, 20).map((s) => ({
    id: s.id,
    name: s.name,
    kind: s.kind,
    tags: [...s.tags || []],
    animations: (s.animations || []).map((a) => ({ id: a.id, name: a.name, clip: a.clip }))
  }));
  return {
    version: H,
    type: Et,
    items: r,
    revision: Number(t.directorRevision || 0)
  };
}
async function ae(t, e, n) {
  const r = await t.fetchApi(e, {
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
function oe(t, e, n) {
  return {
    ok: !1,
    version: H,
    revision: Number(t.directorRevision || 0),
    error: { code: e, message: n }
  };
}
function dr(t, e, n) {
  let r = !1, s = null, a = null, o = null, i = null, l = null, m = 0;
  function d() {
    return n.clientId || n.initialClientId || null;
  }
  function c() {
    s = null, a = null, o = null, i && (clearInterval(i), i = null);
  }
  async function h() {
    if (r) return;
    m += 1;
    const y = m, w = d();
    if (!w) {
      g();
      return;
    }
    try {
      const v = await ae(n, se.register, {
        protocol: ot,
        client_id: w,
        node_id: String(e.id),
        label: `OmniCam Director ${e.id}`,
        director_api: H,
        revision: Number(t.directorRevision || 0),
        operations: [...ct],
        queries: [...zt]
      });
      if (r || y !== m) return;
      s = v.session_id, a = v.session_token, o = w, A();
    } catch {
      if (r || y !== m) return;
      g();
    }
  }
  function g() {
    r || (clearTimeout(l), l = setTimeout(() => {
      h();
    }, or));
  }
  function A() {
    clearInterval(i), i = setInterval(() => {
      p();
    }, ar);
  }
  async function p() {
    if (!(r || !s))
      try {
        await ae(n, se.heartbeat, {
          session_id: s,
          session_token: a,
          revision: Number(t.directorRevision || 0)
        });
      } catch (y) {
        if (r) return;
        (y?.code === "UNKNOWN_SESSION" || y?.code === "BAD_SESSION_TOKEN") && (c(), h());
      }
  }
  async function T(y) {
    const w = y?.detail;
    if (r || !w || w.protocol !== ot || Number(w.schema_version) !== sr || w.session_id !== s || String(w.node_id) !== String(e.id)) return;
    let v;
    try {
      if (w.kind === "query")
        v = w.payload?.type === Et ? await lr(t, w.payload) : t.directorApi.query(w.payload);
      else if (w.kind === "transaction") {
        const N = w.payload, O = (N?.operations || []).find(
          (D) => !ct.includes(D?.type)
        );
        if (!Number.isInteger(N?.baseRevision) || N.baseRevision < 0)
          v = oe(
            t,
            "BASE_REVISION_REQUIRED",
            "External Agent transactions require baseRevision"
          );
        else if (O)
          v = oe(
            t,
            "OPERATION_NOT_ADVERTISED",
            `External Agent transactions cannot use operation: ${O?.type}`
          );
        else {
          const D = await cr(t, N.operations);
          D.ok ? (v = t.directorApi.execute({ ...N, operations: D.operations }), await v?._reconciliation) : v = oe(t, D.code, D.message);
        }
      } else
        v = oe(t, "UNKNOWN_AGENT_REQUEST", `Unsupported Agent request kind: ${w.kind}`);
    } catch (N) {
      v = oe(t, N?.code || "INTERNAL", N?.message || "OmniCam Agent request failed");
    }
    try {
      await ae(n, se.reply, {
        session_id: s,
        session_token: a,
        request_id: w.request_id,
        result: v
      });
    } catch {
    }
  }
  async function E(y, w) {
    if (!(!y || !w))
      try {
        await ae(n, se.close, {
          session_id: y,
          session_token: w
        });
      } catch {
      }
  }
  function F() {
    if (r) return;
    const y = d();
    if (y && o && y !== o) {
      const w = s, v = a;
      c(), E(w, v).finally(() => h());
    }
  }
  return n.addEventListener?.(it, T), n.addEventListener?.("status", F), h(), {
    get sessionId() {
      return s;
    },
    dispose() {
      if (r) return;
      r = !0, clearInterval(i), clearTimeout(l), n.removeEventListener?.(it, T), n.removeEventListener?.("status", F);
      const y = s, w = a;
      s = null, a = null, y && w && ae(n, se.close, {
        session_id: y,
        session_token: w
      }).catch(() => {
      });
    }
  };
}
const lt = "majoor-omnicam-workbench-styles", fr = `
  .oc-workbench-backdrop,.oc-node-shell{${Je}}
  .oc-workbench-backdrop{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(5,7,12,0.92)}
  .oc-workbench-window{display:flex;flex-direction:column;width:min(96vw,1920px);height:92dvh;min-width:0;min-height:0;max-width:100vw;max-height:100dvh;background:var(--oc-bg-app);border:1px solid var(--oc-border-default);border-radius:8px;box-shadow:0 24px 64px rgba(0,0,0,0.7);overflow:hidden;outline:none}
  .oc-workbench-window.is-maximized{width:100vw;height:100vh;min-width:0;min-height:0;border-radius:0;border:none}
  .oc-workbench-header{display:flex;align-items:center;gap:10px;min-height:40px;padding:6px 12px;background:var(--oc-bg-panel);border-bottom:1px solid var(--oc-border-default);flex:none}
  .oc-workbench-title{display:flex;align-items:center;gap:6px;flex:1 1 auto;min-width:0;overflow:hidden;color:var(--oc-text-primary);font:600 13px/1.4 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .oc-workbench-title-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-workbench-dirty-dot{flex:none;width:7px;height:7px;border-radius:50%;background:${U.warning}}
  .oc-workbench-actions{display:flex;align-items:center;gap:6px;flex:none}
  .oc-workbench-actions button{display:inline-grid;place-items:center;width:28px;height:28px;padding:0;color:var(--oc-text-secondary);background:var(--oc-bg-control);border:1px solid var(--oc-border-default);border-radius:6px;cursor:pointer;transition:all .15s ease}
  .oc-workbench-actions button:hover{background:var(--oc-bg-control);border-color:${U.accent};color:var(--oc-text-primary)}
  .oc-workbench-actions button:focus-visible{outline:2px solid ${U.accent};outline-offset:2px}
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
  .oc-node-shell-version{position:absolute;top:6px;right:8px;z-index:2;font-size:9px;color:var(--oc-text-muted);pointer-events:none}
  .oc-node-shell[data-has-preview="true"] .oc-node-shell-version{color:rgba(255,255,255,.65)}
  .oc-node-shell-title{display:flex;align-items:center;gap:5px;font-weight:700;color:var(--oc-text-primary);overflow:hidden}
  .oc-node-shell-title-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-node-shell-dirty-dot{flex:none;width:6px;height:6px;border-radius:50%;background:${U.warning}}
  .oc-node-shell-meta{color:var(--oc-text-secondary);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-node-shell-status{color:var(--oc-text-secondary);font-size:11px}
  .oc-node-shell-progress{position:relative;height:5px;border-radius:3px;background:var(--oc-bg-control);border:1px solid var(--oc-border-default);overflow:hidden;display:none}
  .oc-node-shell-progress[data-active="true"]{display:block}
  .oc-node-shell-progress>span{display:block;height:100%;background:${U.accent};width:0%;transition:width .15s ease}
  .oc-node-shell-actions{position:relative;z-index:2;display:flex;gap:6px;margin-top:auto}
  .oc-node-shell-actions>button{flex:1 1 0}
  .oc-node-shell-secondary{padding:6px 10px;border-radius:6px;background:var(--oc-bg-control);border:1px solid var(--oc-border-default);color:var(--oc-text-primary);font-weight:600;cursor:pointer}
  .oc-node-shell-secondary:hover{border-color:${U.accent}}
  .oc-node-shell-record{padding:6px 10px;border-radius:6px;background:var(--oc-bg-control);border:1px solid var(--oc-border-default);color:var(--oc-text-primary);font-weight:600;cursor:pointer;white-space:nowrap}
  .oc-node-shell-record:hover:not(:disabled){border-color:${U.error};color:${U.error}}
  .oc-node-shell-record:disabled{opacity:.8;cursor:default;border-color:${U.error};color:${U.error}}
  .oc-node-shell-record:focus-visible{outline:2px solid ${U.accent};outline-offset:2px}
  .oc-node-shell-open{white-space:nowrap;padding:6px 10px;border-radius:6px;background:${U.accent};border:1px solid ${U.accent};color:#fff;font-weight:600;cursor:pointer;transition:filter .15s ease}
  .oc-node-shell-open:hover{filter:brightness(1.12)}
  .oc-node-shell-open:focus-visible{outline:2px solid ${U.accent};outline-offset:2px}

  /* Director node: status card, then the live inline editor
     (director/inline-view.js). While live, the card shrinks to one header
     row and the editor takes the rest of the node. */
  .oc-director-node{${Je};display:flex;flex-direction:column;gap:6px;width:100%;height:100%;min-height:420px;container-type:inline-size}
  .oc-director-node>.oc-node-shell{flex:1 1 auto;height:auto;min-height:124px}
  .oc-director-inline{display:none;flex:1 1 auto;min-height:0}
  .oc-director-inline>.majoor-omnicam{flex:1 1 auto;width:100%;min-width:0;min-height:0}
  .oc-director-node[data-live="true"] .oc-director-inline{display:flex}
  .oc-director-node[data-live="true"]>.oc-node-shell{flex:0 0 auto;min-height:0;flex-direction:row;align-items:center;gap:10px;padding:4px 6px 4px 10px}
  .oc-director-node[data-live="true"] .oc-node-shell-preview,
  .oc-director-node[data-live="true"] .oc-node-shell-version,
  .oc-director-node[data-live="true"] .oc-node-shell-secondary{display:none}
  .oc-director-node[data-live="true"] .oc-node-shell-title{flex:0 1 auto;min-width:0}
  .oc-director-node[data-live="true"] .oc-node-shell-meta,
  .oc-director-node[data-live="true"] .oc-node-shell-status{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-director-node[data-live="true"] .oc-node-shell-actions{flex:none;margin:0 0 0 auto}
  .oc-director-node[data-live="true"] .oc-node-shell-open,
  .oc-director-node[data-live="true"] .oc-node-shell-record{padding:3px 10px;font-size:11px}
  .oc-director-node[data-live="true"] .oc-node-shell-progress{position:absolute;left:0;right:0;bottom:0;height:3px;border:none;border-radius:0}
  @container (max-width:520px){
    .oc-director-node[data-live="true"] .oc-node-shell-meta,
    .oc-director-node[data-live="true"] .oc-node-shell-status{display:none}
  }
`;
function wt(t = document) {
  if (t.getElementById(lt)) return;
  const e = t.createElement("style");
  e.id = lt, e.textContent = fr, t.head.append(e);
}
const ur = /* @__PURE__ */ new Set(["director"]);
function mr({ kind: t, title: e, buttonLabel: n, onOpen: r, secondaryLabel: s, onSecondary: a, recordLabel: o, recordTitle: i, onRecord: l }) {
  wt(document);
  const m = document.createElement("div");
  m.className = "oc-node-shell", m.dataset.shellKind = t;
  const d = document.createElement("img");
  d.className = "oc-node-shell-preview", d.alt = "", d.draggable = !1;
  let c = null;
  ur.has(t) && (c = document.createElement("video"), c.className = "oc-node-shell-preview", c.muted = !0, c.loop = !0, c.playsInline = !0, c.disablePictureInPicture = !0, c.disableRemotePlayback = !0, c.style.display = "none");
  const h = document.createElement("div");
  h.className = "oc-node-shell-title";
  const g = document.createElement("span");
  g.className = "oc-node-shell-dirty-dot", g.hidden = !0, g.setAttribute("aria-hidden", "true");
  const A = document.createElement("span");
  A.className = "oc-node-shell-title-text", A.textContent = e ?? "", h.append(g, A);
  const p = document.createElement("div");
  p.className = "oc-node-shell-meta";
  const T = document.createElement("div");
  T.className = "oc-node-shell-status";
  const E = document.createElement("div");
  E.className = "oc-node-shell-progress";
  const F = document.createElement("span");
  E.append(F);
  const y = document.createElement("button");
  y.type = "button", y.className = "oc-node-shell-open", y.textContent = n ?? "Open";
  let w = null;
  s && (w = document.createElement("button"), w.type = "button", w.className = "oc-node-shell-secondary", w.textContent = s);
  let v = null;
  o && (v = document.createElement("button"), v.type = "button", v.className = "oc-node-shell-record", v.textContent = o, v.title = i ?? "");
  const N = document.createElement("div");
  N.className = "oc-node-shell-actions", N.append(...[w, v, y].filter(Boolean));
  const O = document.createElement("span");
  O.className = "oc-node-shell-version", O.textContent = `v${Bt}`, c ? m.append(d, c, O, h, p, T, E, N) : m.append(d, O, h, p, T, E, N);
  const D = new AbortController();
  y.addEventListener("click", (I) => r?.(I), { signal: D.signal }), w?.addEventListener("click", (I) => a?.(I), { signal: D.signal }), v?.addEventListener("click", (I) => l?.(I), { signal: D.signal });
  function Y() {
    c && (c.pause(), c.removeAttribute("src"), c.load(), c.style.display = "none");
  }
  return {
    root: m,
    openButton: y,
    secondaryButton: w,
    recordButton: v,
    /** Busy state of the record action: disabled, with `label` (e.g. "12/121") instead of its own text. */
    setRecording(I, Ae = o) {
      v && (v.disabled = I, v.textContent = I ? Ae : o, m.dataset.recording = String(I));
    },
    setTitle(I) {
      A.textContent = I ?? "";
    },
    setDirty(I) {
      g.hidden = !I, g.title = I ? C("Unsaved changes") : "";
    },
    setMeta(I) {
      p.textContent = I ?? "";
    },
    setStatus(I) {
      T.textContent = I ?? "";
    },
    // Still-frame path. Composes with setPreviewVideo(): setting one with a
    // value hides+stops the other, and clearing one only drops
    // data-has-preview when the other has nothing showing either.
    setPreview(I) {
      I ? (d.src = I, d.style.display = "block", Y(), m.dataset.hasPreview = "true") : (d.removeAttribute("src"), d.style.display = "none", c?.getAttribute("src") || delete m.dataset.hasPreview);
    },
    // Live-looping playblast preview, Director/Monitor shells only -- a
    // no-op on an Extractor shell (no <video> was mounted). See setPreview()
    // for the composition rule between the two.
    setPreviewVideo(I) {
      c && (I ? (d.style.display = "none", c.autoplay = !0, c.src = I, c.style.display = "block", m.dataset.hasPreview = "true", c.play().catch(() => {
      })) : (Y(), d.getAttribute("src") || delete m.dataset.hasPreview));
    },
    setProgress(I) {
      if (I == null) {
        E.dataset.active = "false";
        return;
      }
      E.dataset.active = "true";
      const Ae = Math.max(0, Math.min(1, I));
      F.style.width = `${(Ae * 100).toFixed(1)}%`;
    },
    dispose() {
      D.abort(), Y();
    }
  };
}
class hr {
  constructor() {
    this._active = null, this._tail = Promise.resolve(), this._pending = /* @__PURE__ */ new Set();
  }
  get activeKey() {
    return this._active?.key ?? null;
  }
  get activeSession() {
    return this._active;
  }
  _enqueue(e) {
    const n = this._tail.then(e);
    return this._tail = n.catch(() => {
    }), n;
  }
  open({ key: e, nodeId: n = e, opener: r, createSession: s }) {
    const a = { nodeId: String(n), cancelled: !1 };
    return this._pending.add(a), this._enqueue(() => this._open(a, { key: e, opener: r, createSession: s })).finally(() => this._pending.delete(a));
  }
  async _open(e, { key: n, opener: r, createSession: s }) {
    if (e.cancelled) return null;
    if (this._active?.key === n)
      return this._active.host?.focus?.(), this._active;
    if (this._active && !await this._closeSession(this._active, "switch") || e.cancelled) return null;
    const a = await s();
    return a ? e.cancelled ? (a.dispose?.(), null) : (a.opener = r ?? null, this._active = a, a) : null;
  }
  close(e, n = "programmatic") {
    return this._enqueue(() => !this._active || this._active.key !== e ? !0 : this._closeSession(this._active, n));
  }
  closeActive(e = "switch") {
    return this._enqueue(() => this._active ? this._closeSession(this._active, e) : !0);
  }
  disposeForNode(e) {
    for (const n of this._pending)
      n.nodeId === String(e) && (n.cancelled = !0);
    this._active && String(this._active.nodeId) === String(e) && (this._active.dispose?.(), this._active = null);
  }
  async _closeSession(e, n) {
    return await e.close?.(n) === !1 ? !1 : (this._active === e && (this._active = null), e.opener?.focus?.(), !0);
  }
}
const Pe = new hr(), _r = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");
function pr(t) {
  return !!(t.offsetWidth || t.offsetHeight || t.getClientRects?.().length);
}
function gr(t) {
  return [...t.querySelectorAll(_r)].filter(pr);
}
function br(t) {
  let e = !1, n = null, r = null;
  function s(a) {
    if (a.key !== "Tab") return;
    const o = gr(t);
    if (!o.length) {
      a.preventDefault(), t.focus();
      return;
    }
    const i = o[0], l = o[o.length - 1], m = t.ownerDocument?.activeElement ?? document.activeElement;
    a.shiftKey ? (m === i || !o.includes(m)) && (a.preventDefault(), l.focus()) : (m === l || !o.includes(m)) && (a.preventDefault(), i.focus());
  }
  return {
    activate() {
      e || (e = !0, n = document.activeElement, r = new AbortController(), t.addEventListener("keydown", s, { signal: r.signal }));
    },
    deactivate() {
      if (!e) return;
      e = !1, r?.abort(), r = null;
      const a = n;
      n = null, a && typeof a.focus == "function" && a.isConnected && a.focus();
    },
    get active() {
      return e;
    }
  };
}
class Er {
  constructor({ kind: e, nodeId: n, title: r, onRequestClose: s, onResize: a }) {
    this.kind = e, this.nodeId = String(n), this.title = r, this.onRequestClose = s, this.onResize = a, this.backdrop = null, this.window = null, this.content = null, this.disposed = !1, this._maximized = !1, this.abort = null, this.focusTrap = null;
  }
  mount(e) {
    if (this.disposed) throw new Error("WorkbenchHost is disposed");
    if (this.backdrop) return;
    wt(document);
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
            <button type="button" data-workbench-act="maximize" aria-label="${Ge(C("Maximize workbench"))}">[ ]</button>
            <button type="button" data-workbench-act="close" aria-label="${Ge(C("Close workbench"))}">x</button>
          </div>
        </header>
        <div class="oc-workbench-content"></div>
      </section>`, this.backdrop = n, this.window = n.querySelector(".oc-workbench-window"), this.content = n.querySelector(".oc-workbench-content"), this.setTitle(this.title), this.content.append(e), document.body.append(n), this.abort = new AbortController();
    const { signal: s } = this.abort;
    n.querySelector('[data-workbench-act="close"]')?.addEventListener("click", () => {
      this.requestClose("button");
    }, { signal: s }), n.querySelector('[data-workbench-act="maximize"]')?.addEventListener("click", () => this.setMaximized(!this._maximized), { signal: s }), n.addEventListener("keydown", (a) => {
      a.key === "Escape" && (a.stopPropagation(), this.requestClose("escape"));
    }, { signal: s, capture: !0 }), window.addEventListener("resize", () => this.onResize?.(), { signal: s }), this.focusTrap = br(this.window), this.focusTrap.activate(), this.window.focus(), requestAnimationFrame(() => this.onResize?.());
  }
  async requestClose(e = "user") {
    return !this.backdrop || this.disposed ? !0 : await this.onRequestClose?.(e) === !1 ? !1 : (this.dispose(), !0);
  }
  setTitle(e) {
    this.title = String(e || "OmniCam");
    const n = this.backdrop?.querySelector(".oc-workbench-title-text");
    n && (n.textContent = this.title);
  }
  // Dirty dot next to the workbench title (spec section 05, top bar "nom
  // scène + dirty state"). A dot rather than a text suffix so it never fights
  // a locale's word order, matching the compact node shell's own dirty dot.
  setDirty(e) {
    const n = this.backdrop?.querySelector(".oc-workbench-dirty-dot");
    n && (n.hidden = !e, n.title = e ? C("Unsaved changes") : "");
  }
  setBusy(e) {
    this.backdrop && (this.backdrop.dataset.busy = e ? "true" : "false");
  }
  setMaximized(e) {
    this._maximized = !!e, this.window?.classList.toggle("is-maximized", this._maximized), requestAnimationFrame(() => this.onResize?.());
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
const wr = 4, J = [];
function ke(t) {
  const e = J.indexOf(t);
  e >= 0 && J.splice(e, 1), J.push(t);
}
function Ar() {
  const t = J.find((e) => !e.host && !e.ui?.recording);
  return t ? t.hide() : !1;
}
class yr {
  /**
   * @param runtime DirectorRuntime of the node.
   * @param container Element the inline editor root is mounted into.
   * @param onLiveChange Called with true/false whenever the live editor appears or goes.
   * @param onRetire Called with the editor just before it is torn down (preview capture).
   */
  constructor(e, { container: n, onLiveChange: r, onRetire: s }) {
    this.runtime = e, this.container = n, this.onLiveChange = r, this.onRetire = s, this.ui = null, this.host = null, this.closeWorkbench = null, this.loading = null, this.disposed = !1, this.visibilityObserver = null, this.resizeObserver = new ResizeObserver(() => this.ui?.scheduleResizeAndRender?.()), this.resizeObserver.observe(n);
  }
  get key() {
    return `director:${this.runtime.node.id}`;
  }
  /**
   * Bring up the live editor in the node; resolves to it, or null if the node
   * went away meanwhile. Concurrent callers (first layout, OPEN DIRECTOR,
   * LIVE VIEW) share one load, so none of them can cancel another's.
   */
  show() {
    return this.ui ? (ke(this), Promise.resolve(this.ui)) : (this.loading ||= this.mount().finally(() => {
      this.loading = null;
    }), this.loading);
  }
  async mount() {
    const { openDirectorWorkbench: e, closeDirectorWorkbench: n } = await import("./chunk-VD424qSc.js").then((s) => s.h);
    if (this.disposed) return null;
    for (; J.length >= wr && Ar(); )
      ;
    this.closeWorkbench = n;
    const r = e(this.runtime);
    return this.runtime.pendingUpstreamResync && (this.runtime.pendingUpstreamResync = !1, r.syncUpstreamInputs?.()), r.root.dataset.inline = "true", r.root.addEventListener("pointerdown", () => ke(this), { capture: !0 }), this.container.append(r.root), this.ui = r, ke(this), this.onLiveChange(!0), r.scheduleResizeAndRender?.(), r;
  }
  /**
   * Go live the first time `element` is actually laid out. A Director inside
   * a closed subgraph has no DOM on screen and must not hold WebGL contexts
   * or a live slot until the subgraph is opened.
   */
  showWhenVisible(e) {
    this.visibilityObserver?.disconnect(), this.visibilityObserver = new ResizeObserver(([n]) => {
      !e.isConnected || !n.contentRect.width || !n.contentRect.height || (this.visibilityObserver.disconnect(), this.visibilityObserver = null, this.show());
    }), this.visibilityObserver.observe(e);
  }
  /** Back to the static card. False while recording or expanded, which must not be interrupted. */
  hide() {
    const e = this.ui;
    return e ? this.host || e.recording ? !1 : (e.serialize?.(), this.onRetire(e), this.teardown(), this.onLiveChange(!1), !0) : !0;
  }
  /** Open the full editor: the live instance moves into the modal workbench. */
  async expand(e) {
    const n = await this.show();
    return n ? Pe.open({
      key: this.key,
      nodeId: this.runtime.node.id,
      opener: e,
      createSession: async () => {
        if (this.disposed || this.ui !== n) return null;
        const r = new Er({
          kind: "director",
          nodeId: this.runtime.node.id,
          title: this.runtime.getSnapshot().sceneName || C("OmniCam Director"),
          onRequestClose: (s) => Pe.close(this.key, s),
          onResize: () => n.scheduleResizeAndRender?.()
        });
        return delete n.root.dataset.inline, r.mount(n.root), this.host = r, this.runtime.activeWorkbenchHost = r, r.setDirty(this.runtime.isDirty), {
          key: this.key,
          nodeId: this.runtime.node.id,
          host: r,
          close: async () => n.recording ? (n.setStatus?.(C("Cannot close Director while a playblast is recording")), !1) : (n.serialize?.(), this.collapse(), !0),
          dispose: () => this.dispose()
        };
      }
    }) : null;
  }
  collapse() {
    const e = this.host;
    e && (this.host = null, this.runtime.activeWorkbenchHost === e && (this.runtime.activeWorkbenchHost = null), this.ui && (this.ui.root.dataset.inline = "true", this.container.append(this.ui.root), this.ui.scheduleResizeAndRender?.()), e.dispose());
  }
  teardown() {
    const e = this.ui;
    this.ui = null;
    const n = J.indexOf(this);
    n >= 0 && J.splice(n, 1), e && (this.closeWorkbench(e), e.root.remove());
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = !0, this.visibilityObserver?.disconnect(), this.resizeObserver.disconnect();
    const e = this.host;
    this.host = null, this.runtime.activeWorkbenchHost === e && (this.runtime.activeWorkbenchHost = null), e?.dispose(), this.teardown();
  }
}
const Tr = 420, vr = 6e3;
function Ir(t) {
  for (const e of ["state_json", "recording_path", "card_asset"]) {
    const n = t.widgets?.find((r) => r.name === e);
    n && (n.computeSize = () => [0, -4], n.draw = () => {
    }, n.hidden = !0, n.options = { ...n.options || {}, hideInVueNodes: !0 });
  }
}
function x(t) {
  const e = t.getSnapshot(), n = [];
  e.fps && n.push(`${e.fps} fps`), e.durationSeconds && n.push(`${e.durationSeconds.toFixed(1)} s`), e.width && e.height && n.push(`${e.width}x${e.height}`), t.shell?.setTitle(e.sceneName || C("OmniCam Director")), t.shell?.setDirty(e.isDirty), t.shell?.setMeta(n.join("  |  ")), t.shell?.setStatus(
    t.recordNotice || `${e.cameraCount} ${C("cameras")}  |  ${e.objectCount} ${C("objects")}`
  ), t.activeWorkbenchHost?.setTitle(e.sceneName || C("OmniCam Director")), t.activeWorkbenchHost?.setDirty(e.isDirty), t.inlineView?.ui ? (t.shell?.setPreviewVideo(null), t.shell?.setPreview(null)) : t.previewVideoUrl ? t.shell?.setPreviewVideo(t.previewVideoUrl) : (t.shell?.setPreviewVideo(null), t.shell?.setPreview(e.previewDataUrl ?? null));
}
const dt = 240, ft = 135;
function kr(t, e) {
  try {
    const n = e?.canvas;
    if (!n || !n.width || !n.height) return;
    const r = document.createElement("canvas");
    r.width = dt, r.height = ft;
    const s = r.getContext("2d");
    if (!s) return;
    s.drawImage(n, 0, 0, dt, ft), t.previewDataUrl = r.toDataURL("image/webp", 0.7), x(t);
  } catch (n) {
    console.warn("[OmniCam] Director preview capture failed", n);
  }
}
function Nr(t, e) {
  try {
    const n = Pt(Ne, t.node);
    if (n) {
      t.previewVideoUrl = n.url, x(t);
      return;
    }
  } catch (n) {
    console.warn("[OmniCam] Director playblast preview lookup failed", n);
  }
  t.previewVideoUrl = null, kr(t, e);
}
async function Rr(t) {
  if (t.shellRecording) return;
  t.shellRecording = !0, t.shell.setRecording(!0, "…");
  let e = { ok: !1, message: C("The Director editor could not be started") };
  try {
    const n = await t.inlineView.show();
    n && (await n.webglReady, await new Promise((r) => requestAnimationFrame(r)), e = await n.makePlayblast({ inline: !0 }));
  } finally {
    t.shellRecording = !1, t.shell.setRecording(!1), t.shell.setProgress(null), t.recordNotice = e.message, clearTimeout(t.recordNoticeTimer), t.recordNoticeTimer = setTimeout(() => {
      t.recordNotice = "", x(t);
    }, vr), x(t);
  }
}
function Sr(t) {
  if (t.__majoorOmniCamDirectorRuntime) return t.__majoorOmniCamDirectorRuntime;
  const e = new Ft(t, { app: At, api: Ne });
  rr(e);
  try {
    e.agentBridge = dr(e, t, Ne);
  } catch (p) {
    console.warn("[OmniCam] Agent bridge unavailable", p);
  }
  Ir(t);
  const n = document.createElement("div");
  n.className = "oc-director-node", n.dataset.live = "false";
  const r = document.createElement("div");
  r.className = "oc-director-inline";
  const s = new yr(e, {
    container: r,
    onLiveChange: (p) => {
      n.dataset.live = String(p), x(e);
    },
    onRetire: (p) => Nr(e, p)
  });
  e.inlineView = s;
  const a = mr({
    kind: "director",
    title: C("OmniCam Director"),
    buttonLabel: C("OPEN DIRECTOR"),
    onOpen: (p) => {
      s.expand(p.currentTarget);
    },
    secondaryLabel: C("LIVE VIEW"),
    onSecondary: () => {
      s.show();
    },
    recordLabel: C("● REC"),
    recordTitle: C("Record the playblast without opening the editor"),
    onRecord: () => {
      Rr(e);
    }
  });
  e.shell = a, e.addEventListener("playblastprogress", (p) => {
    if (!e.shellRecording) return;
    const { frame: T, total: E } = p.detail;
    a.setRecording(!0, `${T}/${E}`), a.setProgress(T / E);
  }), n.append(a.root, r), x(e), e.addEventListener("statechange", () => x(e)), e.addEventListener("statuschange", () => x(e)), e.addEventListener("upstreamchange", () => x(e)), t.__majoorOmniCamDirectorRuntime = e, t.addDOMWidget("majoor_omnicam_director_shell", "omnicam", n, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => Tr
  }), s.showWhenVisible(n);
  const o = () => {
    cancelAnimationFrame(e.restoreFrame), e.restoreFrame = requestAnimationFrame(() => {
      e.disposed || (e.workbench ? (e.workbench.restoreFromWidgets(), e.workbench.syncUpstreamInputs()) : (e.restoreFromWidgetsHeadless(), e.pendingUpstreamResync = !0));
    });
  }, i = t.onConfigure;
  t.onConfigure = function(...p) {
    i?.apply(this, p), o();
  };
  const l = t.onAfterGraphConfigured;
  t.onAfterGraphConfigured = function(...p) {
    l?.apply(this, p), o();
  };
  const m = () => {
    clearTimeout(e.connectionTimer), e.connectionTimer = setTimeout(() => {
      e.disposed || (e.workbench ? e.workbench.syncUpstreamInputs() : e.pendingUpstreamResync = !0, t.setDirtyCanvas?.(!0, !0));
    }, 60);
  }, d = t.onConnectionsChange;
  t.onConnectionsChange = function(...p) {
    d?.apply(this, p), m();
  };
  const c = Lt(t, m), h = t.onResize;
  t.onResize = function(...p) {
    h?.apply(this, p), e.workbench?.scheduleResizeAndRender?.();
  };
  const g = t.onExecuted;
  t.onExecuted = function(p) {
    g?.apply(this, arguments), e.workbench && (e.workbench.loadExecutionPreview(p), e.workbench.syncUpstreamInputs());
  };
  const A = t.onRemoved;
  return t.onRemoved = function(...p) {
    Pe.disposeForNode(t.id), clearTimeout(e.recordNoticeTimer), s.dispose(), c(), cancelAnimationFrame(e.restoreFrame), clearTimeout(e.connectionTimer), e.agentBridge?.dispose?.(), a.dispose(), e.dispose(), A?.apply(this, p);
  }, e;
}
const Yr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attachDirectorShell: Sr
}, Symbol.toStringTag, { value: "Module" }));
export {
  Lr as C,
  xt as E,
  ht as S,
  f as U,
  kn as a,
  ge as b,
  mn as c,
  Re as d,
  $r as e,
  Jr as f,
  Wr as g,
  Pr as h,
  Ln as i,
  Kr as j,
  Mn as k,
  Vr as l,
  Br as m,
  zr as n,
  je as o,
  xr as p,
  Yr as q,
  Hr as r,
  Gr as s,
  Fr as w
};
