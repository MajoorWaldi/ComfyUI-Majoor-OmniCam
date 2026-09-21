import { app as Et } from "../../scripts/app.js";
import { api as ye } from "../../scripts/api.js";
import { s as se, a as ae, c as bt, d as De, b as At, e as ue, f as wt, l as $e, n as Ee, g as ze, h as q, m as pe, I as fe, D as yt, r as Tt, p as It, t as kt, i as Nt, j as vt, k as St, w as Rt, o as Ke, q as Ot, u as Ct, T as x, v as L } from "./chunk-CWhNUkd6.js";
import { s as jt, w as Mt } from "./chunk-DVHX6-b8.js";
import { H as Dt } from "./chunk-_f2VoZbc.js";
import { e as He, d as Ut } from "./chunk-Ckq7Yzp8.js";
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
function B(e, t) {
  return e.widgets?.find((n) => n.name === t) ?? null;
}
class Bt extends EventTarget {
  constructor(t, { app: n, api: r } = {}) {
    super(), this.app = n, this.api = r, this.node = t, this.disposed = !1, this.workbench = null, this.pendingUiDirtyMask = 0, this.serializeScheduled = !1, this.serializeFrame = null, this.directorApi = null, this.agentBridge = null, this.workbenchGeneration = 0, this.pendingUpstreamResync = !1, this.stateWidget = B(t, "state_json"), this.recordingWidget = B(t, "recording_path"), this.cardWidget = B(t, "card_asset"), this.widthWidget = B(t, "width"), this.heightWidget = B(t, "height"), this.fpsWidget = B(t, "fps"), this.durationWidget = B(t, "duration_seconds"), this.modeWidget = B(t, "render_mode");
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
        this.state = se(o.state), this.frame = bt(o.frame, 0, this.state.duration_frames - 1), this.camera = ae(this.state, this.frame);
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
      previewDataUrl: this.previewDataUrl
    };
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
const F = 1, xe = 50, C = 120, V = 160, Pt = Object.freeze(["perspective", "orthographic"]), _ = Object.freeze({
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
}), lt = Object.freeze(Object.values(_)), I = Object.freeze({
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
}), Ft = Object.freeze(Object.values(I));
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
const Kt = 25, Ve = 100;
function J(e, t) {
  const n = e?.offset === void 0 ? 0 : Number(e.offset), r = e?.limit === void 0 ? Kt : Number(e.limit);
  if (!Number.isInteger(n) || n < 0)
    throw new d(
      "BAD_QUERY",
      "offset must be a non-negative integer"
    );
  if (!Number.isInteger(r) || r < 1 || r > Ve)
    throw new d(
      "BAD_QUERY",
      `limit must be between 1 and ${Ve}`
    );
  return {
    offset: n,
    limit: r,
    end: Math.min(t, n + r)
  };
}
function be(e) {
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
function P(e) {
  return typeof structuredClone == "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e));
}
function xt(e) {
  return Number.isInteger(e.directorRevision) ? Math.max(0, e.directorRevision) : 0;
}
function k(e, t) {
  return {
    ...t,
    revision: xt(e)
  };
}
function Vt(e, t) {
  const n = e.state || {};
  switch (t?.type) {
    case I.SCENE_GET:
      return k(e, {
        version: 1,
        type: t.type,
        scene: P({
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
    case I.SCENE_SUMMARY: {
      const r = n.objects || [], s = n.sequence?.cuts || n.cuts || [];
      return k(e, {
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
    case I.CAMERA_GET: {
      const r = t.cameraId || n.active_camera_id, s = (n.cameras || []).find((a) => a.id === r);
      if (!s) throw new d("UNKNOWN_CAMERA", `Unknown camera: ${r}`);
      return k(e, { version: 1, type: t.type, camera: P(s) });
    }
    case I.CAMERA_LIST: {
      const r = n.cameras || [], { offset: s, limit: a, end: o } = J(t, r.length);
      return k(e, {
        version: 1,
        type: t.type,
        items: r.slice(s, o).map(Ht),
        total: r.length,
        offset: s,
        limit: a
      });
    }
    case I.TIMELINE_GET:
      return k(e, {
        version: 1,
        type: t.type,
        timeline: P({
          frame: e.frame ?? 0,
          duration_frames: n.duration_frames,
          fps: n.fps,
          playback_range: Array.isArray(n.playback_range) ? n.playback_range : null
        })
      });
    case I.SELECTION_GET:
      return k(e, {
        version: 1,
        type: t.type,
        selection: {
          entity: e.selectedEntity ?? null,
          objectId: e.selectedObjectId ?? null,
          objectIds: [...e.selectedObjectIds || []],
          keyFrame: e.selectedKeyFrame ?? null
        }
      });
    case I.HEALTH_GET:
      return k(e, {
        version: 1,
        type: t.type,
        frames: zt(n.metadata, n.duration_frames)
      });
    case I.ASSET_LIST: {
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
      return k(e, { version: 1, type: t.type, items: P(s), total: s.length });
    }
    case I.ASSET_GET: {
      const r = (n.objects || []).find((s) => s.id === t.objectId);
      if (!r) throw new d("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      return k(e, {
        version: 1,
        type: t.type,
        asset: P({
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
    case I.CHARACTER_GET_RIG: {
      const r = (n.objects || []).find((a) => a.id === t.objectId);
      if (!r) throw new d("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      const s = r.character || null;
      return k(e, {
        version: 1,
        type: t.type,
        rig: P({
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
    case I.CHARACTER_GET_POSE: {
      const r = (n.objects || []).find((a) => a.id === t.objectId);
      if (!r) throw new d("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      const s = r.character?.pose || {};
      return k(e, {
        version: 1,
        type: t.type,
        pose: P({
          objectId: r.id,
          preset_id: s.preset_id || "neutral",
          root_offset: Array.isArray(s.root_offset) ? s.root_offset : [0, 0, 0],
          joints: s.joints || {},
          has_motion: !!r.character?.motion
        })
      });
    }
    case I.OBJECT_LIST: {
      const r = n.objects || [], { offset: s, limit: a, end: o } = J(t, r.length);
      return k(e, {
        version: 1,
        type: t.type,
        items: r.slice(s, o).map(be),
        total: r.length,
        offset: s,
        limit: a
      });
    }
    case I.OBJECT_GET: {
      const r = (n.objects || []).find((s) => s.id === t.objectId);
      if (!r) throw new d("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      return k(e, {
        version: 1,
        type: t.type,
        object: P({
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
    case I.OBJECT_SEARCH: {
      const r = String(t.text || "").trim().toLowerCase(), s = Array.isArray(t.tags) ? t.tags.map((g) => String(g).toLowerCase()) : [], a = t.asset_kind !== void 0 ? t.asset_kind : null, o = t.type_ !== void 0 ? t.type_ : t.objectType !== void 0 ? t.objectType : null, i = typeof t.enabled == "boolean" ? t.enabled : null, c = (g) => {
        if (r && ![g.id, g.name || "", ...Array.isArray(g.tags) ? g.tags : []].map((p) => String(p).toLowerCase()).some((p) => p.includes(r)))
          return !1;
        if (s.length) {
          const w = (Array.isArray(g.tags) ? g.tags : []).map((p) => String(p).toLowerCase());
          if (!s.every((p) => w.includes(p))) return !1;
        }
        return !(a !== null && g.asset_kind !== a || o !== null && g.type !== o || i !== null && g.enabled !== !1 !== i);
      }, h = (n.objects || []).filter(c), { offset: m, limit: f, end: u } = J(t, h.length);
      return k(e, {
        version: 1,
        type: t.type,
        items: h.slice(m, u).map(be),
        total: h.length,
        offset: m,
        limit: f
      });
    }
    case I.CHARACTER_LIST: {
      const r = (n.objects || []).filter((i) => i.asset_kind === "character"), { offset: s, limit: a, end: o } = J(t, r.length);
      return k(e, {
        version: 1,
        type: t.type,
        items: r.slice(s, o).map((i) => ({
          ...be(i),
          has_motion: !!i.character?.motion,
          pose_preset: i.character?.pose?.preset_id || null
        })),
        total: r.length,
        offset: s,
        limit: a
      });
    }
    case I.SHOT_LIST: {
      const r = n.sequence?.cuts || n.cuts || [], s = Math.max(0, (n.duration_frames || 1) - 1), a = r.map((h, m) => ({
        index: m,
        start: h.start,
        end: m + 1 < r.length ? r[m + 1].start - 1 : s,
        camera_id: h.camera_id
      })), { offset: o, limit: i, end: c } = J(t, a.length);
      return k(e, {
        version: 1,
        type: t.type,
        items: a.slice(o, c),
        total: a.length,
        offset: o,
        limit: i
      });
    }
    case I.KEYFRAME_LIST: {
      const r = t.cameraId || n.active_camera_id, s = (n.cameras || []).find((h) => h.id === r);
      if (!s) throw new d("UNKNOWN_CAMERA", `Unknown camera: ${r}`);
      const a = s.keyframes || [], { offset: o, limit: i, end: c } = J(t, a.length);
      return k(e, {
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
function Jt(e) {
  const t = e === "ground", n = e === "human", r = e === "card", s = e === "sun_light", a = e === "point_light", o = e === "spot_light";
  let i;
  t ? i = [12, 0.1, 12] : n ? i = [0.7, 1.8, 0.4] : r ? i = [2, 3] : i = [1.5, 1.5, 1.5];
  let c = [0, 0, 0], h = [0, 0, 0], m = "#8c929b", f, u, g, w;
  return s ? (c = [5, 8.5, 4], h = [-55, 35, 0], m = "#fff6ec", f = 2.2, u = !0) : a ? (c = [0, 3, 0], m = "#ffffff", f = 2, u = !1) : o && (c = [0, 4, 0], h = [-60, 0, 0], m = "#ffffff", f = 3, g = 45, w = 0.25, u = !0), {
    position: c,
    rotation: h,
    size: i,
    color: m,
    material_mode: t ? "checker" : "textured",
    ...f !== void 0 ? { intensity: f } : {},
    ...u !== void 0 ? { cast_shadow: u } : {},
    ...g !== void 0 ? { cone_angle: g } : {},
    ...w !== void 0 ? { penumbra: w } : {}
  };
}
function Wt(e, t) {
  e.cameras ||= [];
  const n = new Set(e.cameras.map((o) => o.id)), r = ge(n, "camera", t.id), s = { ...At(), ...t.camera || {} }, a = {
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
  const n = new Set(e.objects.map((o) => o.id)), r = ge(n, t.objectType, t.id), s = Jt(t.objectType), a = {
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
], vr = {
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
  const n = [...e.position], r = Array.isArray(t) ? [...t] : [...e.target], s = wt(r, n), a = $e(s) > 1e-9 ? Ee(s) : [0, 0, -1];
  let o = ze(a, Ue);
  $e(o) < 1e-6 && (o = [1, 0, 0]), o = Ee(o);
  const i = Ee(ze(o, a));
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
function Je(e, t, n) {
  const r = n === "out" ? -1 : 1, s = q(e.position, pe(e.forward, r * t));
  return [
    { position: e.position, target: e.target },
    { position: s, target: e.target }
  ];
}
function We(e, t, n) {
  const r = n === "right" ? 1 : -1, s = pe(e.right, r * t);
  return [
    { position: e.position, target: e.target },
    { position: q(e.position, s), target: q(e.target, s) }
  ];
}
function Ge(e, t, n) {
  const s = pe(Ue, (n === "down" ? -1 : 1) * t);
  return [
    { position: e.position, target: e.target },
    { position: q(e.position, s), target: q(e.target, s) }
  ];
}
function Ye(e, t, n) {
  const r = n === "down" ? -1 : 1, s = q(e.position, pe(Ue, r * t));
  return [
    { position: e.position, target: e.target },
    { position: s, target: e.target }
  ];
}
function oe(e, { degrees: t = 180, direction: n = "cw", radius: r, radiusEnd: s, heightOffset: a = 0, samples: o = 5, close: i = !1 } = {}) {
  const c = e.target, h = e.position[0] - c[0], m = e.position[2] - c[2], f = Math.hypot(h, m) || 1e-6, u = Math.atan2(m, h), g = Number.isFinite(r) ? r : f, w = Number.isFinite(s) ? s : g, p = n === "ccw" ? 1 : -1, N = Math.abs(t) * Math.PI / 180 * p, O = Math.max(2, Math.round(o)), X = e.position[1] + a, A = [];
  for (let b = 0; b < O; b += 1) {
    const T = i ? b / O : b / (O - 1), R = u + N * T, j = g + (w - g) * T;
    A.push({
      position: [c[0] + Math.cos(R) * j, X, c[2] + Math.sin(R) * j],
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
  const c = on(t, n), h = Number(a.distance) > 0 ? Number(a.distance) : 1, m = (p, N, O) => ({
    degrees: Number(a.degrees) || p,
    direction: N,
    radius: Number.isFinite(Number(a.radius)) ? Number(a.radius) : void 0,
    heightOffset: Number(a.heightOffset) || 0,
    samples: Number(a.samples) || O
  });
  let f;
  switch (e) {
    case "static":
      f = ln(c);
      break;
    case "dolly_in":
      f = Je(c, h, "in");
      break;
    case "dolly_out":
      f = Je(c, h, "out");
      break;
    case "truck_left":
      f = We(c, h, "left");
      break;
    case "truck_right":
      f = We(c, h, "right");
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
  const u = f.map((p, N) => f.length <= 1 ? o : Math.round(o + (i - o) * N / (f.length - 1)));
  for (let p = 1; p < u.length; p += 1) u[p] <= u[p - 1] && (u[p] = u[p - 1] + 1);
  for (let p = u.length - 1; p > 0; p -= 1) u[p] > i - (u.length - 1 - p) && (u[p] = i - (u.length - 1 - p));
  u[0] = o, u[u.length - 1] = i;
  const g = cn(t);
  return { ok: !0, keyframes: f.map((p, N) => ({
    frame: u[N],
    interpolation: "smooth",
    camera: { position: p.position, target: p.target, ...g }
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
function y(e, t, n) {
  if (!Array.isArray(e) || e.length !== 3 || !e.every(K))
    throw new d("BAD_VECTOR", `${t} must be [x,y,z] of finite numbers`, n);
}
function v(e, t, n) {
  if (!Number.isInteger(e) || e < 0)
    throw new d("BAD_FRAME", `${t} must be a non-negative integer frame`, n);
}
function E(e, t, n, r) {
  if (typeof e != "string" || e.length === 0)
    throw new d("BAD_ID", `${t} must be a non-empty string`, n);
  if (r !== void 0 && e.length > r)
    throw new d("BAD_ID", `${t} exceeds ${r} characters`, n);
}
function G(e, t, n) {
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
  if (e.position !== void 0 && y(e.position, "camera.position", t), e.target !== void 0 && y(e.target, "camera.target", t), e.up !== void 0 && y(e.up, "camera.up", t), e.fov !== void 0 && (G(e.fov, "camera.fov", t), e.fov < 1 || e.fov > 179))
    throw new d("BAD_VALUE", "camera.fov must be within 1..179", t);
  if (e.roll !== void 0 && G(e.roll, "camera.roll", t), e.zoom !== void 0 && (G(e.zoom, "camera.zoom", t), e.zoom <= 0))
    throw new d("BAD_VALUE", "camera.zoom must be > 0", t);
  if (e.near !== void 0 && (G(e.near, "camera.near", t), e.near <= 0))
    throw new d("BAD_VALUE", "camera.near must be > 0", t);
  if (e.far !== void 0) {
    G(e.far, "camera.far", t);
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
      if (E(r.id, "asset.id", t), E(r.kind, "asset.kind", t), String(r.id).length > 120 || String(r.kind).length > 32)
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
      e.point !== void 0 && y(e.point, "point", t), e.id !== void 0 && E(e.id, "id", t);
      break;
    }
    case _.CAMERA_SET_ACTIVE:
      E(e.cameraId, "cameraId", t);
      break;
    case _.CAMERA_SET_LOCKED:
      if (E(e.cameraId, "cameraId", t), typeof e.value != "boolean")
        throw new d("BAD_VALUE", "camera.set_locked needs a boolean value", t);
      break;
    case _.CAMERA_CREATE:
      if (e.id !== void 0 && E(e.id, "id", t, C), e.name !== void 0 && E(e.name, "name", t, V), e.camera !== void 0) {
        if (typeof e.camera != "object" || Array.isArray(e.camera) || e.camera === null)
          throw new d("BAD_VALUE", "camera.create camera must be an object", t);
        pn(e.camera, t);
      }
      if (e.interpolation !== void 0 && !fe.includes(e.interpolation))
        throw new d("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
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
        throw new d("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${e.objectType}`, t);
      if (e.asset !== void 0 || e.url !== void 0 || e.path !== void 0)
        throw new d("BAD_VALUE", "object.create does not accept asset/url/path -- use asset.instantiate", t);
      e.id !== void 0 && E(e.id, "id", t, C), e.name !== void 0 && E(e.name, "name", t, V), e.position !== void 0 && y(e.position, "position", t), e.rotation !== void 0 && y(e.rotation, "rotation", t);
      break;
    case _.OBJECT_DUPLICATE:
      E(e.objectId, "objectId", t, C), e.id !== void 0 && E(e.id, "id", t, C), e.name !== void 0 && E(e.name, "name", t, V), e.offset !== void 0 && y(e.offset, "offset", t);
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
      if (e.cameraId !== void 0 && E(e.cameraId, "cameraId", t), e.position !== void 0 && y(e.position, "position", t), e.target !== void 0 && y(e.target, "target", t), e.frame !== void 0 && v(e.frame, "frame", t), e.position === void 0 && e.target === void 0)
        throw new d("EMPTY_OPERATION", "camera.transform needs position and/or target", t);
      break;
    case _.CAMERA_LOOK_AT:
      if (e.cameraId !== void 0 && E(e.cameraId, "cameraId", t), e.point !== void 0 && y(e.point, "point", t), e.objectId !== void 0 && e.objectId !== null && E(e.objectId, "objectId", t), e.point === void 0 && e.objectId === void 0)
        throw new d("EMPTY_OPERATION", "camera.look_at needs a point or an objectId", t);
      break;
    case _.OBJECT_TRANSFORM:
      if (E(e.objectId, "objectId", t), e.position !== void 0 && y(e.position, "position", t), e.rotation !== void 0 && y(e.rotation, "rotation", t), e.scale !== void 0 && y(e.scale, "scale", t), e.position === void 0 && e.rotation === void 0 && e.scale === void 0)
        throw new d("EMPTY_OPERATION", "object.transform needs position, rotation and/or scale", t);
      break;
    case _.OBJECT_SET_ENABLED:
    case _.OBJECT_SET_LOCKED:
      if (E(e.objectId, "objectId", t), typeof e.value != "boolean")
        throw new d("BAD_VALUE", `${n} needs a boolean value`, t);
      break;
    case _.OBJECT_SET_TAGS:
      if (E(e.objectId, "objectId", t), !Array.isArray(e.tags) || e.tags.some((r) => typeof r != "string"))
        throw new d("BAD_VALUE", "object.set_tags needs a string array", t);
      if (e.tags.length > 64)
        throw new d("BAD_VALUE", "object.set_tags: too many tags", t);
      break;
    case _.OBJECT_SET_ANNOTATION:
      if (E(e.objectId, "objectId", t), e.annotation !== null && (typeof e.annotation != "object" || Array.isArray(e.annotation)))
        throw new d("BAD_VALUE", "object.set_annotation needs an object or null", t);
      break;
    case _.CHARACTER_SET_POSE:
      if (E(e.objectId, "objectId", t), e.pose !== null && (typeof e.pose != "object" || Array.isArray(e.pose)))
        throw new d("BAD_VALUE", "character.set_pose needs a pose object or null", t);
      break;
    case _.CHARACTER_SET_JOINT_ROTATION:
      if (E(e.objectId, "objectId", t), E(e.joint, "joint", t), !Array.isArray(e.rotation) || e.rotation.length !== 4 || !e.rotation.every(K))
        throw new d("BAD_QUATERNION", "rotation must be [x,y,z,w] of finite numbers", t);
      break;
    case _.CHARACTER_SET_MOTION: {
      E(e.objectId, "objectId", t);
      const r = e.motion;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new d("BAD_VALUE", "character.set_motion needs a motion object", t);
      E(r.clip_id, "motion.clip_id", t);
      for (const s of ["start_frame", "end_frame", "speed", "offset_seconds"])
        if (r[s] !== void 0 && !K(r[s]))
          throw new d("BAD_VALUE", `motion.${s} must be a finite number`, t);
      if (K(r.start_frame) && K(r.end_frame) && r.end_frame > 0 && r.end_frame <= r.start_frame)
        throw new d("BAD_MOTION_RANGE", "motion end_frame is not after start_frame", t);
      break;
    }
    case _.CHARACTER_CLEAR_MOTION:
      E(e.objectId, "objectId", t);
      break;
    case _.KEYFRAME_UPSERT:
      if (e.cameraId !== void 0 && E(e.cameraId, "cameraId", t), v(e.frame, "frame", t), e.interpolation !== void 0 && !fe.includes(e.interpolation))
        throw new d("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      if (e.camera !== void 0) {
        if (!e.camera || typeof e.camera != "object")
          throw new d("BAD_VALUE", "keyframe.upsert camera must be an object", t);
        e.camera.position !== void 0 && y(e.camera.position, "camera.position", t), e.camera.target !== void 0 && y(e.camera.target, "camera.target", t);
        for (const r of ["fov", "roll", "zoom", "near", "far"])
          if (e.camera[r] !== void 0 && !K(e.camera[r]))
            throw new d("BAD_VALUE", `camera.${r} must be finite`, t);
      }
      break;
    case _.KEYFRAME_REMOVE:
      e.cameraId !== void 0 && E(e.cameraId, "cameraId", t), v(e.frame, "frame", t);
      break;
    case _.KEYFRAME_SET_INTERPOLATION:
      if (e.cameraId !== void 0 && E(e.cameraId, "cameraId", t), v(e.frame, "frame", t), !fe.includes(e.interpolation))
        throw new d("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      break;
    case _.TIMELINE_SET_RANGE:
      if (v(e.start, "start", t), v(e.end, "end", t), e.end < e.start)
        throw new d("BAD_RANGE", "range end is before start", t);
      break;
    case _.TIMELINE_SET_DURATION:
      if (!Number.isInteger(e.frames) || e.frames < 1)
        throw new d("BAD_VALUE", "timeline.set_duration needs frames >= 1", t);
      break;
    case _.CUT_UPSERT:
      v(e.start, "start", t), E(e.cameraId, "cameraId", t);
      break;
    case _.CUT_REMOVE:
      v(e.start, "start", t);
      break;
    case _.CUT_SET_CAMERA:
      v(e.start, "start", t), E(e.cameraId, "cameraId", t);
      break;
    case _.CAMERA_PATH_TRANSFORM_KEYS: {
      e.cameraId !== void 0 && E(e.cameraId, "cameraId", t), qe(e.frames, "frames", t);
      const r = e.transform;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new d("BAD_VALUE", "camera.path.transform_keys needs a transform object", t);
      if (!hn.has(r.mode))
        throw new d("BAD_VALUE", "transform.mode must be translate, rotate or scale", t);
      r.mode === "translate" ? y(r.delta, "transform.delta", t) : r.mode === "scale" ? y(r.factors, "transform.factors", t) : y(r.rotationDeg, "transform.rotationDeg", t), r.origin !== void 0 && y(r.origin, "transform.origin", t);
      break;
    }
    case _.CAMERA_PATH_INSERT_KEY:
      e.cameraId !== void 0 && E(e.cameraId, "cameraId", t), v(e.leftFrame, "leftFrame", t), v(e.rightFrame, "rightFrame", t), e.t !== void 0 && G(e.t, "t", t);
      break;
    case _.CAMERA_PATH_DELETE_KEYS:
      e.cameraId !== void 0 && E(e.cameraId, "cameraId", t), qe(e.frames, "frames", t);
      break;
    case _.CAMERA_PATH_REDISTRIBUTE_TIMING:
      e.cameraId !== void 0 && E(e.cameraId, "cameraId", t), e.startFrame !== void 0 && v(e.startFrame, "startFrame", t), e.endFrame !== void 0 && v(e.endFrame, "endFrame", t);
      break;
    case _.CAMERA_PATH_APPLY_PRESET:
      if (e.cameraId !== void 0 && E(e.cameraId, "cameraId", t), !Te.includes(e.presetType))
        throw new d("BAD_VALUE", `presetType must be one of: ${Te.join(", ")}`, t);
      if (v(e.startFrame, "startFrame", t), v(e.endFrame, "endFrame", t), e.endFrame <= e.startFrame)
        throw new d("BAD_RANGE", "camera.path.apply_preset endFrame must be after startFrame", t);
      if (e.target !== void 0 && y(e.target, "target", t), e.params !== void 0 && (typeof e.params != "object" || Array.isArray(e.params)))
        throw new d("BAD_VALUE", "camera.path.apply_preset params must be an object", t);
      break;
    default:
      throw new d("UNKNOWN_OPERATION", `Unknown operation type: ${n}`, t);
  }
}
function En(e, t) {
  if (!t || typeof t != "object" || Array.isArray(t))
    throw new d("BAD_TRANSACTION", "transaction must be an object");
  if (t.version !== F)
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
  if (t.operations.length > xe)
    throw new d(
      "TOO_MANY_OPERATIONS",
      `transaction has ${t.operations.length} operations (max ${xe})`
    );
  return t.operations.forEach((n, r) => gn(n, r)), {
    version: F,
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
const bn = "omnicam/library", An = "majoor_omnicam/blockout_library", wn = Object.freeze({
  "omnicam.helper.human_lowpoly": "human",
  "omnicam.helper.null": "null"
});
function yn(e, t) {
  if (!Array.isArray(e) || e.length < 3) return [...t];
  const n = e.slice(0, 3).map((r) => Number(r));
  return n.every((r) => Number.isFinite(r)) ? n : [...t];
}
function Tn(e) {
  return e.file ? `${e.source === "legacy" ? An : bn}/${e.file} [input]` : "";
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
  const n = yn(t.point, [0, 0, 0]), r = String(t.idSeed || Date.now().toString(36)), s = String(e.kind || "prop"), a = s === "character", o = wn[e.id];
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
function S(e, t = 0) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
function D(e) {
  const t = e?.camera?.position;
  return [S(t?.[0]), S(t?.[1]), S(t?.[2])];
}
function Q(e, t) {
  return [e[0] - t[0], e[1] - t[1], e[2] - t[2]];
}
function Xe(e) {
  return Math.hypot(e[0], e[1], e[2]);
}
function me(e, t) {
  return [e[0] * t, e[1] * t, e[2] * t];
}
function ke(e, t, n) {
  const r = D(e), s = t ? D(t) : r, a = n ? D(n) : r, o = Math.max(Ie, S(e?.frame) - S(t?.frame, S(e?.frame) - 1)), i = Math.max(Ie, S(n?.frame, S(e?.frame) + 1) - S(e?.frame)), c = [0, 0, 0], h = [0, 0, 0];
  for (let m = 0; m < 3; m += 1) {
    const f = (r[m] - s[m]) / o, u = (a[m] - r[m]) / i;
    let g = (f + u) * 0.5;
    t ? n ? f * u <= 0 && (g = 0) : g = f : g = u, c[m] = g * i * (1 / 3), h[m] = -g * o * (1 / 3);
  }
  return { out: c, in: h };
}
function ut(e, t, n) {
  const r = D(e), s = t ? D(t) : r, a = n ? D(n) : r;
  return {
    out: me(Q(a, r), 1 / 3),
    in: me(Q(s, r), 1 / 3)
  };
}
function Ne(e, t) {
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
function ve(e, t = null, n = null) {
  const r = he(e), s = D(e);
  if (r === "corner") {
    const c = ut(e, t, n);
    return { in: ie(s, c.in), out: ie(s, c.out), mode: r };
  }
  const a = ke(e, t, n), o = (r === "free" || r === "aligned") && Ne(e, "out") || a.out, i = (r === "free" || r === "aligned") && Ne(e, "in") || a.in;
  return { in: ie(s, i), out: ie(s, o), mode: r };
}
function ie(e, t) {
  return [e[0] + t[0], e[1] + t[1], e[2] + t[2]];
}
function Nn(e) {
  return e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.channels = e.tangents.channels && typeof e.tangents.channels == "object" ? e.tangents.channels : {}, e.tangents.channels;
}
function H(e, t, n) {
  const r = Nn(e);
  for (let s = 0; s < 3; s += 1) {
    const a = Le[s], o = r[a] && typeof r[a] == "object" ? r[a] : {};
    o.mode = "free", o.out_x = 1 / 3, o.in_x = -1 / 3, t === "out" ? o.out_y = n[s] : o.in_y = n[s], o.out_y === void 0 && (o.out_y = 0), o.in_y === void 0 && (o.in_y = 0), r[a] = o;
  }
}
function _e(e) {
  e.interpolation !== "bezier" && (e.interpolation = "bezier");
}
function mt(e, t, n) {
  const r = D(e), s = ve(e, t, n);
  H(e, "out", Q(s.out, r)), H(e, "in", Q(s.in, r));
}
function Cr(e, t, n, { prevKey: r = null, nextKey: s = null, breakCoupling: a = !1 } = {}) {
  if (!e || t !== "in" && t !== "out") return e;
  let o = he(e);
  if (o === "corner") return e;
  o === "auto" && (o = "aligned", e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.spatial_mode = "aligned", mt(e, r, s));
  const i = D(e), c = Q([
    S(n?.[0]),
    S(n?.[1]),
    S(n?.[2])
  ], i);
  if (_e(e), H(e, t, c), o === "aligned" && !a) {
    const h = t === "out" ? "in" : "out", m = Ne(e, h) || (h === "out" ? ke(e, r, s).out : ke(e, r, s).in), f = Xe(c), u = Xe(m) || f || 1, g = f > Ie ? me(c, -u / f) : me(m, 1);
    H(e, h, g);
  }
  return e;
}
function ce(e, t, n) {
  if (!e || t !== "in" && t !== "out") return e;
  const r = D(e);
  return _e(e), H(e, t, Q([
    S(n?.[0]),
    S(n?.[1]),
    S(n?.[2])
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
    return _e(e), H(e, "out", s.out), H(e, "in", s.in), e;
  }
  return _e(e), mt(e, n, r), e;
}
const ht = 1e-9;
function vn(e, t) {
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
  const n = e.map((o) => vn(o, t)), r = Sn(n), s = e.map((o) => o.frame), a = Math.max(1, s[s.length - 1] - s[0]);
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
  const a = [...e].sort((u, g) => u.frame - g.frame), o = a.length, i = new Set(s), c = [];
  for (const u of a) {
    const g = c[c.length - 1];
    g && u.frame - g.frame <= Math.max(0, n) && !i.has(u.frame) || c.push(u);
  }
  if (c.length <= 2) return { keys: c, removed: o - c.length };
  const h = Be(c, t), m = /* @__PURE__ */ new Set();
  for (let u = 1; u < c.length - 1; u += 1) {
    if (i.has(c[u].frame)) continue;
    const g = m.has(u - 1) ? null : u - 1;
    if (g === null) continue;
    Pe(h[u], h[g], h[u + 1]) <= r && m.add(u);
  }
  const f = c.filter((u, g) => !m.has(g));
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
function W(e, t, n) {
  return [0, 1, 2].map((r) => e[r] + (t[r] - e[r]) * n);
}
function Cn(e, t, n, r, s) {
  const a = W(e, t, s), o = W(t, n, s), i = W(n, r, s), c = W(a, o, s), h = W(o, i, s), m = W(c, h, s);
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
  const s = [...e].sort((A, b) => A.frame - b.frame), a = s.findIndex((A) => A.frame === t), o = a >= 0 ? a + 1 : -1;
  if (a < 0 || o < 0 || o >= s.length || s[o].frame !== n)
    return { ok: !1, reason: "segment_not_found" };
  if (n - t < 2)
    return { ok: !1, reason: "no_free_frame" };
  const i = Math.min(0.999, Math.max(1e-3, Number.isFinite(r) ? r : 0.5)), c = Math.round(t + i * (n - t)), h = jn(s, t, n, c);
  if (h < 0) return { ok: !1, reason: "no_free_frame" };
  const m = (h - t) / (n - t), f = s[a], u = s[o], g = a > 0 ? s[a - 1] : null, w = o + 1 < s.length ? s[o + 1] : null, p = f.interpolation === "bezier" || u.interpolation === "bezier", N = ae({ keyframes: s }, h), O = { frame: h, interpolation: p ? "bezier" : f.interpolation, camera: N };
  if (p) {
    const A = [...f.camera.position], b = ve(f, g, u).out, T = ve(u, f, w).in, R = [...u.camera.position], j = Cn(A, b, T, R, m);
    O.camera = { ...ue(N), position: [...j.point] };
    const U = he(f);
    (U === "free" || U === "aligned") && ce(f, "out", j.left[1]);
    const Fe = he(u);
    (Fe === "free" || Fe === "aligned") && ce(u, "in", j.right[2]), ce(O, "in", j.left[2]), ce(O, "out", j.right[1]);
  }
  return { ok: !0, keys: [...s, O].sort((A, b) => A.frame - b.frame), frame: h };
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
  const n = z(e, t);
  if (n.asset_kind !== "character")
    throw new d("NOT_A_CHARACTER", `${t} is not a character`);
  return n;
}
function M(e, t) {
  const n = Se(e, t);
  if (n.locked)
    throw new d("ENTITY_LOCKED", `${n.id} is locked`);
  return n;
}
function z(e, t) {
  const n = Re(e, t);
  if (n.locked)
    throw new d("ENTITY_LOCKED", `${n.id} is locked`);
  return n;
}
function Ae(e) {
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
    const n = Wt(e, t);
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
    M(e, t.cameraId);
    const n = qt(e, t);
    return { dirtyMask: l.outliner | l.inspector, outcome: n };
  },
  [_.CAMERA_SET_PLAYBLAST](e, t) {
    const n = Qt(e, t);
    return { dirtyMask: l.outliner | l.inspector | l.status, outcome: n };
  },
  [_.CAMERA_TRANSFORM](e, t) {
    const n = M(e, t.cameraId), r = Ae(n);
    if (t.position && (r.position = [...t.position]), t.target && (r.target = [...t.target]), Number.isInteger(t.frame)) {
      const s = de(n, t.frame);
      if (!s) throw new d("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
      s.camera = { ...s.camera }, t.position && (s.camera.position = [...t.position]), t.target && (s.camera.target = [...t.target]);
    }
    return { dirtyMask: l.viewport | l.previews | l.inspector | l.timeline };
  },
  [_.CAMERA_LOOK_AT](e, t) {
    const n = M(e, t.cameraId);
    if (t.objectId !== void 0 && (t.objectId === null || t.objectId === "" ? (n.target_object_id = null, n.id === e.active_camera_id && (e.target_object_id = null)) : (Re(e, t.objectId), n.target_object_id = t.objectId, n.id === e.active_camera_id && (e.target_object_id = t.objectId))), t.point) {
      const r = Ae(n);
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
    z(e, t.objectId);
    const n = tn(e, t);
    return { dirtyMask: l.outliner | l.inspector, outcome: n };
  },
  [_.OBJECT_SET_PARENT](e, t) {
    z(e, t.objectId);
    const n = nn(e, t);
    return { dirtyMask: l.viewport | l.outliner | l.inspector, outcome: n };
  },
  [_.OBJECT_TRANSFORM](e, t) {
    const n = z(e, t.objectId);
    return t.position && (n.position = [...t.position]), t.rotation && (n.rotation = [...t.rotation]), t.scale && (n.size = [...t.scale]), { dirtyMask: l.viewport | l.previews | l.inspector };
  },
  [_.OBJECT_SET_ENABLED](e, t) {
    return z(e, t.objectId).enabled = t.value, { dirtyMask: l.viewport | l.previews | l.outliner | l.inspector };
  },
  [_.OBJECT_SET_LOCKED](e, t) {
    return Re(e, t.objectId).locked = t.value, { dirtyMask: l.outliner | l.inspector };
  },
  [_.OBJECT_SET_TAGS](e, t) {
    const n = z(e, t.objectId), r = Ct(t.tags), s = r.length !== t.tags.length ? "some tags were dropped or normalised" : void 0;
    return r.length ? n.tags = r : delete n.tags, { dirtyMask: l.outliner | l.inspector | l.viewport, warning: s };
  },
  [_.OBJECT_SET_ANNOTATION](e, t) {
    const n = z(e, t.objectId), r = t.annotation === null ? null : Ot(t.annotation);
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
      pose: t.pose === null ? Ke(null) : Ke(t.pose)
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
    const n = le(e, t.objectId), r = vt(t.motion);
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
    const n = M(e, t.cameraId);
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
    const n = M(e, t.cameraId), r = (n.keyframes || []).length;
    if (n.keyframes = (n.keyframes || []).filter((a) => a.frame !== t.frame), n.keyframes.length === r)
      throw new d("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
    const s = n.keyframes.length === 0 ? "camera has no keyframes left" : void 0;
    return { dirtyMask: l.viewport | l.previews | l.timeline | l.inspector, warning: s };
  },
  [_.KEYFRAME_SET_INTERPOLATION](e, t) {
    const n = M(e, t.cameraId), r = de(n, t.frame);
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
    const n = M(e, t.cameraId);
    et(n, t.frames, "camera.path.transform_keys");
    const r = (n.keyframes || []).filter((o) => t.frames.includes(o.frame)), s = Array.isArray(t.transform.origin) ? t.transform.origin : It(r), a = kt(n.keyframes || [], t.frames, {
      mode: t.transform.mode,
      origin: s,
      delta: t.transform.delta,
      factors: t.transform.factors,
      rotationDeg: t.transform.rotationDeg,
      lookAtActive: Nt(n, e.objects)
    });
    return Z(e, n, a), { dirtyMask: ee };
  },
  [_.CAMERA_PATH_INSERT_KEY](e, t) {
    const n = M(e, t.cameraId), r = Mn(n.keyframes || [], {
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
    const n = M(e, t.cameraId);
    et(n, t.frames, "camera.path.delete_keys");
    const r = Dn(n.keyframes || [], t.frames);
    if (!r.ok)
      throw new d("CANNOT_DELETE", "camera.path.delete_keys: a camera track needs at least one key");
    return Z(e, n, r.keys), { dirtyMask: ee, outcome: { removed: r.removed } };
  },
  [_.CAMERA_PATH_REDISTRIBUTE_TIMING](e, t) {
    const n = M(e, t.cameraId), r = [...n.keyframes || []].sort((i, c) => i.frame - c.frame), s = Number.isInteger(t.startFrame) ? t.startFrame : r[0]?.frame, a = Number.isInteger(t.endFrame) ? t.endFrame : r[r.length - 1]?.frame, o = Tt(r, { startFrame: s, endFrame: a });
    if (!o.ok) {
      const i = { not_enough_keys: "NOT_ENOUGH_KEYS", invalid_range: "BAD_RANGE", insufficient_frame_slots: "INSUFFICIENT_FRAME_SLOTS" };
      throw new d(i[o.reason] || "BAD_RANGE", `camera.path.redistribute_timing: ${o.reason}`);
    }
    return Z(e, n, o.keys), { dirtyMask: ee };
  },
  [_.CAMERA_PATH_APPLY_PRESET](e, t) {
    const n = M(e, t.cameraId), r = Ae(n), s = dn({
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
function $(e) {
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
  return $n(e, t, s), Kn(e, t, s), xn(e, t, s), Hn(e, t, s), Vn(e, t, s), Jn(e, t, s), { changes: n, truncated: r };
}
const Fn = ["fov", "roll", "zoom", "near", "far", "camera_type"];
function $n(e, t, n) {
  const r = $(e?.cameras), s = $(t?.cameras);
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
function Kn(e, t, n) {
  const r = $(e?.cameras), s = $(t?.cameras);
  for (const [a, o] of s) {
    const i = r.get(a), c = new Map((i?.keyframes || []).map((f) => [f.frame, f])), h = new Map((o.keyframes || []).map((f) => [f.frame, f])), m = `${a}@keyframes`;
    for (const [f, u] of c)
      h.has(f) || n(m, `frame_${f}`, u.interpolation ?? "present", null);
    for (const [f, u] of h) {
      const g = c.get(f);
      if (!g) {
        n(m, `frame_${f}`, null, u.interpolation ?? "present");
        continue;
      }
      for (const w of zn)
        n(m, `frame_${f}_${w}`, g.camera?.[w], u.camera?.[w]);
      n(m, `frame_${f}_interpolation`, g.interpolation, u.interpolation);
    }
  }
}
function Hn(e, t, n) {
  const r = $(e?.objects), s = $(t?.objects);
  for (const [a, o] of s) {
    const c = r.get(a)?.character?.pose?.joints || {}, h = o.character?.pose?.joints || {}, m = /* @__PURE__ */ new Set([...Object.keys(c), ...Object.keys(h)]);
    for (const f of m)
      n(`${a}#${f}`, "joint_rotation", c[f] ?? null, h[f] ?? null);
  }
}
function xn(e, t, n) {
  const r = $(e?.objects), s = $(t?.objects);
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
function Vn(e, t, n) {
  n("timeline", "duration_frames", e?.duration_frames, t?.duration_frames), n("timeline", "playback_range", e?.playback_range ?? null, t?.playback_range ?? null);
}
function Jn(e, t, n) {
  const r = new Map((e?.sequence?.cuts || []).map((a) => [a.start, a])), s = new Map((t?.sequence?.cuts || []).map((a) => [a.start, a]));
  for (const [a, o] of r)
    s.has(a) || n(`cut_${a}`, "cut", o.camera_id, null);
  for (const [a, o] of s) {
    const i = r.get(a);
    i ? n(`cut_${a}`, "cut_camera_id", i.camera_id, o.camera_id) : n(`cut_${a}`, "cut", null, o.camera_id);
  }
}
function Wn(e) {
  return typeof structuredClone == "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e));
}
function Ce(e) {
  return Number.isInteger(e.directorRevision) ? Math.max(0, e.directorRevision) : 0;
}
function we(e, t, n) {
  return {
    ok: !1,
    version: F,
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
    n = En(e, t);
  } catch (f) {
    if (f instanceof d) return we(e, t?.id, f);
    throw f;
  }
  const r = Ce(e);
  if (n.baseRevision !== void 0 && n.baseRevision !== r)
    return we(
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
  const s = Wn(e.state);
  let a = 0;
  const o = [], i = [];
  for (let f = 0; f < n.operations.length; f += 1)
    try {
      const u = Ln({ ui: e, state: s, operation: n.operations[f] });
      a |= u?.dirtyMask || 0, u?.warning && o.push(u.warning), u?.outcome && i.push({ index: f, ...u.outcome });
    } catch (u) {
      if (u instanceof d)
        return (u.operationIndex === null || u.operationIndex === void 0) && (u.operationIndex = f), we(e, n.id, u);
      throw u;
    }
  if (n.validateOnly) {
    const { changes: f, truncated: u } = Pn(e.state, s);
    return {
      ok: !0,
      version: F,
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
    version: F,
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
    query: (t) => Vt(e, t),
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
    version: F,
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
    version: F,
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
    const A = h, b = m();
    if (!b) {
      g();
      return;
    }
    try {
      const T = await ne(n, te.register, {
        protocol: tt,
        client_id: b,
        node_id: String(t.id),
        label: `OmniCam Director ${t.id}`,
        director_api: F,
        revision: Number(e.directorRevision || 0),
        operations: [...rt],
        queries: [...Ft]
      });
      if (r || A !== h) return;
      s = T.session_id, a = T.session_token, o = b, w();
    } catch {
      if (r || A !== h) return;
      g();
    }
  }
  function g() {
    r || (clearTimeout(c), c = setTimeout(() => {
      u();
    }, rr));
  }
  function w() {
    clearInterval(i), i = setInterval(() => {
      p();
    }, nr);
  }
  async function p() {
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
  async function N(A) {
    const b = A?.detail;
    if (r || !b || b.protocol !== tt || Number(b.schema_version) !== tr || b.session_id !== s || String(b.node_id) !== String(t.id)) return;
    let T;
    try {
      if (b.kind === "query")
        T = b.payload?.type === pt ? await or(e, b.payload) : e.directorApi.query(b.payload);
      else if (b.kind === "transaction") {
        const R = b.payload, j = (R?.operations || []).find(
          (U) => !rt.includes(U?.type)
        );
        if (!Number.isInteger(R?.baseRevision) || R.baseRevision < 0)
          T = re(
            e,
            "BASE_REVISION_REQUIRED",
            "External Agent transactions require baseRevision"
          );
        else if (j)
          T = re(
            e,
            "OPERATION_NOT_ADVERTISED",
            `External Agent transactions cannot use operation: ${j?.type}`
          );
        else {
          const U = await ar(e, R.operations);
          U.ok ? (T = e.directorApi.execute({ ...R, operations: U.operations }), await T?._reconciliation) : T = re(e, U.code, U.message);
        }
      } else
        T = re(e, "UNKNOWN_AGENT_REQUEST", `Unsupported Agent request kind: ${b.kind}`);
    } catch (R) {
      T = re(e, R?.code || "INTERNAL", R?.message || "OmniCam Agent request failed");
    }
    try {
      await ne(n, te.reply, {
        session_id: s,
        session_token: a,
        request_id: b.request_id,
        result: T
      });
    } catch {
    }
  }
  async function O(A, b) {
    if (!(!A || !b))
      try {
        await ne(n, te.close, {
          session_id: A,
          session_token: b
        });
      } catch {
      }
  }
  function X() {
    if (r) return;
    const A = m();
    if (A && o && A !== o) {
      const b = s, T = a;
      f(), O(b, T).finally(() => u());
    }
  }
  return n.addEventListener?.(nt, N), n.addEventListener?.("status", X), u(), {
    get sessionId() {
      return s;
    },
    dispose() {
      if (r) return;
      r = !0, clearInterval(i), clearTimeout(c), n.removeEventListener?.(nt, N), n.removeEventListener?.("status", X);
      const A = s, b = a;
      s = null, a = null, A && b && ne(n, te.close, {
        session_id: A,
        session_token: b
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
  .oc-workbench-title{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--oc-text-primary);font:600 13px/1.4 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .oc-workbench-actions{display:flex;align-items:center;gap:6px;flex:none}
  .oc-workbench-actions button{display:inline-grid;place-items:center;width:28px;height:28px;padding:0;color:var(--oc-text-secondary);background:var(--oc-bg-control);border:1px solid var(--oc-border-default);border-radius:6px;cursor:pointer;transition:all .15s ease}
  .oc-workbench-actions button:hover{background:var(--oc-bg-control);border-color:${x.accent};color:var(--oc-text-primary)}
  .oc-workbench-actions button:focus-visible{outline:2px solid ${x.accent};outline-offset:2px}
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
  .oc-node-shell-title{font-weight:700;color:var(--oc-text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-node-shell-meta{color:var(--oc-text-secondary);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-node-shell-status{color:var(--oc-text-secondary);font-size:11px}
  .oc-node-shell-progress{position:relative;height:5px;border-radius:3px;background:var(--oc-bg-control);border:1px solid var(--oc-border-default);overflow:hidden;display:none}
  .oc-node-shell-progress[data-active="true"]{display:block}
  .oc-node-shell-progress>span{display:block;height:100%;background:${x.accent};width:0%;transition:width .15s ease}
  .oc-node-shell-open{margin-top:auto;padding:6px 10px;border-radius:6px;background:${x.accent};border:1px solid ${x.accent};color:#fff;font-weight:600;cursor:pointer;transition:filter .15s ease}
  .oc-node-shell-open:hover{filter:brightness(1.12)}
  .oc-node-shell-open:focus-visible{outline:2px solid ${x.accent};outline-offset:2px}
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
  i.className = "oc-node-shell-title", i.textContent = t ?? "";
  const c = document.createElement("div");
  c.className = "oc-node-shell-meta";
  const h = document.createElement("div");
  h.className = "oc-node-shell-status";
  const m = document.createElement("div");
  m.className = "oc-node-shell-progress";
  const f = document.createElement("span");
  m.append(f);
  const u = document.createElement("button");
  u.type = "button", u.className = "oc-node-shell-open", u.textContent = n ?? "Open", o ? s.append(a, o, i, c, h, m, u) : s.append(a, i, c, h, m, u);
  const g = new AbortController();
  u.addEventListener("click", (p) => r?.(p), { signal: g.signal });
  function w() {
    o && (o.pause(), o.removeAttribute("src"), o.load(), o.style.display = "none");
  }
  return {
    root: s,
    openButton: u,
    setTitle(p) {
      i.textContent = p ?? "";
    },
    setMeta(p) {
      c.textContent = p ?? "";
    },
    setStatus(p) {
      h.textContent = p ?? "";
    },
    // Still-frame path. Composes with setPreviewVideo(): setting one with a
    // value hides+stops the other, and clearing one only drops
    // data-has-preview when the other has nothing showing either.
    setPreview(p) {
      p ? (a.src = p, a.style.display = "block", w(), s.dataset.hasPreview = "true") : (a.removeAttribute("src"), a.style.display = "none", o?.getAttribute("src") || delete s.dataset.hasPreview);
    },
    // Live-looping playblast preview, Director/Monitor shells only -- a
    // no-op on an Extractor shell (no <video> was mounted). See setPreview()
    // for the composition rule between the two.
    setPreviewVideo(p) {
      o && (p ? (a.style.display = "none", o.autoplay = !0, o.src = p, o.style.display = "block", s.dataset.hasPreview = "true", o.play().catch(() => {
      })) : (w(), a.getAttribute("src") || delete s.dataset.hasPreview));
    },
    setProgress(p) {
      if (p == null) {
        m.dataset.active = "false";
        return;
      }
      m.dataset.active = "true";
      const N = Math.max(0, Math.min(1, p));
      f.style.width = `${(N * 100).toFixed(1)}%`;
    },
    dispose() {
      g.abort(), w();
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
          <div id="${r}" class="oc-workbench-title"></div>
          <div class="oc-workbench-actions">
            <button type="button" data-workbench-act="maximize" aria-label="${He(L("Maximize workbench"))}">[ ]</button>
            <button type="button" data-workbench-act="close" aria-label="${He(L("Close workbench"))}">x</button>
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
    const n = this.backdrop?.querySelector(".oc-workbench-title");
    n && (n.textContent = this.title);
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
function Y(e) {
  const t = e.getSnapshot(), n = [];
  t.fps && n.push(`${t.fps} fps`), t.durationSeconds && n.push(`${t.durationSeconds.toFixed(1)} s`), t.width && t.height && n.push(`${t.width}x${t.height}`), e.shell?.setTitle(t.sceneName || L("OmniCam Director")), e.shell?.setMeta(n.join("  |  ")), e.shell?.setStatus(
    `${t.cameraCount} ${L("cameras")}  |  ${t.objectCount} ${L("objects")}`
  ), e.previewVideoUrl ? e.shell?.setPreviewVideo(e.previewVideoUrl) : (e.shell?.setPreviewVideo(null), e.shell?.setPreview(t.previewDataUrl ?? null));
}
const at = 240, ot = 135;
function Er(e, t) {
  try {
    const n = t?.canvas;
    if (!n || !n.width || !n.height) return;
    const r = document.createElement("canvas");
    r.width = at, r.height = ot;
    const s = r.getContext("2d");
    if (!s) return;
    s.drawImage(n, 0, 0, at, ot), e.previewDataUrl = r.toDataURL("image/webp", 0.7), Y(e);
  } catch (n) {
    console.warn("[OmniCam] Director preview capture failed", n);
  }
}
function it(e, t) {
  try {
    const n = Ut(ye, e.node);
    if (n) {
      e.previewVideoUrl = n.url, Y(e);
      return;
    }
  } catch (n) {
    console.warn("[OmniCam] Director playblast preview lookup failed", n);
  }
  e.previewVideoUrl = null, Er(e, t);
}
function ct(e) {
  return `director:${e.id}`;
}
async function br(e, t) {
  return Me.open({
    key: ct(e.node),
    nodeId: e.node.id,
    opener: t,
    createSession: async () => {
      const n = ++e.workbenchGeneration, { openDirectorWorkbench: r, closeDirectorWorkbench: s } = await import("./chunk-RkbYLWvk.js").then((c) => c.e);
      if (e.disposed || n !== e.workbenchGeneration) return null;
      const a = r(e);
      e.pendingUpstreamResync && (e.pendingUpstreamResync = !1, a.syncUpstreamInputs?.());
      const o = ct(e.node), i = new _r({
        kind: "director",
        nodeId: e.node.id,
        title: e.getSnapshot().sceneName || L("OmniCam Director"),
        onRequestClose: (c) => Me.close(o, c),
        onResize: () => a.scheduleResizeAndRender?.()
      });
      return i.mount(a.root), {
        key: o,
        nodeId: e.node.id,
        host: i,
        close: async () => a.recording ? (a.setStatus?.(L("Cannot close Director while a playblast is recording")), !1) : (a.serialize?.(), it(e, a), s(a), i.dispose(), !0),
        dispose: () => {
          it(e, a), s(a), i.dispose();
        }
      };
    }
  });
}
function Ar(e) {
  if (e.__majoorOmniCamDirectorRuntime) return e.__majoorOmniCamDirectorRuntime;
  const t = new Bt(e, { app: Et, api: ye });
  er(t);
  try {
    t.agentBridge = ir(t, e, ye);
  } catch (u) {
    console.warn("[OmniCam] Agent bridge unavailable", u);
  }
  gr(e);
  const n = dr({
    kind: "director",
    title: L("OmniCam Director"),
    buttonLabel: L("OPEN DIRECTOR"),
    onOpen: (u) => {
      br(t, u.currentTarget);
    }
  });
  t.shell = n, Y(t), t.addEventListener("statechange", () => Y(t)), t.addEventListener("statuschange", () => Y(t)), t.addEventListener("upstreamchange", () => Y(t)), e.__majoorOmniCamDirectorRuntime = t, e.addDOMWidget("majoor_omnicam_director_shell", "omnicam", n.root, {
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
  attachDirectorShell: Ar
}, Symbol.toStringTag, { value: "Module" }));
export {
  vr as C,
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
  ve as n,
  Fr as o,
  Or as p,
  Dr as r,
  he as s,
  Cr as w
};
