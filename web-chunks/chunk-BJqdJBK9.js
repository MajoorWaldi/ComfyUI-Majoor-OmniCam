import { app as bt } from "../../scripts/app.js";
import { api as ye } from "../../scripts/api.js";
import { s as se, a as ae, c as Et, d as De, b as wt, e as ue, f as At, l as $e, n as be, g as ze, h as Q, m as pe, I as fe, D as yt, r as Tt, p as It, t as vt, i as kt, j as Nt, k as St, w as Rt, o as xe, q as Ot, u as Ct, T as P, v as M } from "./chunk-Cg3_Iw1A.js";
import { s as jt, w as Mt } from "./chunk-C_hMby-H.js";
import { H as Dt, O as Ut } from "./chunk-Bu3EGLOJ.js";
import { e as He, d as Lt } from "./chunk-DfmZyiNh.js";
class Bt {
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
function F(e, t) {
  return e.widgets?.find((n) => n.name === t) ?? null;
}
class Pt extends EventTarget {
  constructor(t, { app: n, api: r } = {}) {
    super(), this.app = n, this.api = r, this.node = t, this.disposed = !1, this.workbench = null, this.pendingUiDirtyMask = 0, this.serializeScheduled = !1, this.serializeFrame = null, this.directorApi = null, this.agentBridge = null, this.workbenchGeneration = 0, this.pendingUpstreamResync = !1, this.stateWidget = F(t, "state_json"), this.recordingWidget = F(t, "recording_path"), this.cardWidget = F(t, "card_asset"), this.widthWidget = F(t, "width"), this.heightWidget = F(t, "height"), this.fpsWidget = F(t, "fps"), this.durationWidget = F(t, "duration_seconds"), this.modeWidget = F(t, "render_mode");
    let s = null;
    try {
      s = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
    }
    this.state = se(s), this.sceneBaseline = this.stateWidget?.value || JSON.stringify(this.state), this.sceneName = this.state.metadata?.scene_name || "", this.frame = 0, this.camera = ae(this.state, 0), this.directorRevision = 0, this.renderRevision = 0, this.previewDataUrl = null, this.previewVideoUrl = null, this.history = new Bt({
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
const z = 1, Ke = 50, j = 120, V = 160, Ft = Object.freeze(["perspective", "orthographic"]), _ = Object.freeze({
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
}), lt = Object.freeze(Object.values(_)), N = Object.freeze({
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
}), $t = Object.freeze(Object.values(N));
class u extends Error {
  constructor(t, n, r = null, s = null) {
    super(n), this.name = "DirectorApiError", this.code = t, this.operationIndex = r, this.details = s;
  }
}
const zt = /* @__PURE__ */ new Set(["good", "warning", "bad", "unknown"]);
function xt(e, t) {
  const n = Math.max(0, Math.floor(Number(t) || 0)), r = Array.from({ length: n }, (a, o) => ({ frame: o, state: "unknown", score: null })), s = e?.solve_health_v1;
  if (!s || !Array.isArray(s.frames)) return r;
  for (const a of s.frames) {
    const o = Number(a?.frame);
    if (!Number.isInteger(o) || o < 0 || o >= r.length) continue;
    const i = zt.has(a?.state) ? a.state : "unknown", c = a?.score;
    let h = null;
    if (c != null) {
      const d = Number(c);
      h = Number.isFinite(d) ? Math.max(0, Math.min(1, d)) : null;
    }
    r[o] = { frame: o, state: i, score: h };
  }
  return r;
}
const Ht = 25, We = 100;
function J(e, t) {
  const n = e?.offset === void 0 ? 0 : Number(e.offset), r = e?.limit === void 0 ? Ht : Number(e.limit);
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
function Kt(e) {
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
function $(e) {
  return typeof structuredClone == "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e));
}
function Wt(e) {
  return Number.isInteger(e.directorRevision) ? Math.max(0, e.directorRevision) : 0;
}
function S(e, t) {
  return {
    ...t,
    revision: Wt(e)
  };
}
function Vt(e, t) {
  const n = e.state || {};
  switch (t?.type) {
    case N.SCENE_GET:
      return S(e, {
        version: 1,
        type: t.type,
        scene: $({
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
    case N.SCENE_SUMMARY: {
      const r = n.objects || [], s = n.sequence?.cuts || n.cuts || [];
      return S(e, {
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
    case N.CAMERA_GET: {
      const r = t.cameraId || n.active_camera_id, s = (n.cameras || []).find((a) => a.id === r);
      if (!s) throw new u("UNKNOWN_CAMERA", `Unknown camera: ${r}`);
      return S(e, { version: 1, type: t.type, camera: $(s) });
    }
    case N.CAMERA_LIST: {
      const r = n.cameras || [], { offset: s, limit: a, end: o } = J(t, r.length);
      return S(e, {
        version: 1,
        type: t.type,
        items: r.slice(s, o).map(Kt),
        total: r.length,
        offset: s,
        limit: a
      });
    }
    case N.TIMELINE_GET:
      return S(e, {
        version: 1,
        type: t.type,
        timeline: $({
          frame: e.frame ?? 0,
          duration_frames: n.duration_frames,
          fps: n.fps,
          playback_range: Array.isArray(n.playback_range) ? n.playback_range : null
        })
      });
    case N.SELECTION_GET:
      return S(e, {
        version: 1,
        type: t.type,
        selection: {
          entity: e.selectedEntity ?? null,
          objectId: e.selectedObjectId ?? null,
          objectIds: [...e.selectedObjectIds || []],
          keyFrame: e.selectedKeyFrame ?? null
        }
      });
    case N.HEALTH_GET:
      return S(e, {
        version: 1,
        type: t.type,
        frames: xt(n.metadata, n.duration_frames)
      });
    case N.ASSET_LIST: {
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
      return S(e, { version: 1, type: t.type, items: $(s), total: s.length });
    }
    case N.ASSET_GET: {
      const r = (n.objects || []).find((s) => s.id === t.objectId);
      if (!r) throw new u("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      return S(e, {
        version: 1,
        type: t.type,
        asset: $({
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
    case N.CHARACTER_GET_RIG: {
      const r = (n.objects || []).find((a) => a.id === t.objectId);
      if (!r) throw new u("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      const s = r.character || null;
      return S(e, {
        version: 1,
        type: t.type,
        rig: $({
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
    case N.CHARACTER_GET_POSE: {
      const r = (n.objects || []).find((a) => a.id === t.objectId);
      if (!r) throw new u("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      const s = r.character?.pose || {};
      return S(e, {
        version: 1,
        type: t.type,
        pose: $({
          objectId: r.id,
          preset_id: s.preset_id || "neutral",
          root_offset: Array.isArray(s.root_offset) ? s.root_offset : [0, 0, 0],
          joints: s.joints || {},
          has_motion: !!r.character?.motion
        })
      });
    }
    case N.OBJECT_LIST: {
      const r = n.objects || [], { offset: s, limit: a, end: o } = J(t, r.length);
      return S(e, {
        version: 1,
        type: t.type,
        items: r.slice(s, o).map(Ee),
        total: r.length,
        offset: s,
        limit: a
      });
    }
    case N.OBJECT_GET: {
      const r = (n.objects || []).find((s) => s.id === t.objectId);
      if (!r) throw new u("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      return S(e, {
        version: 1,
        type: t.type,
        object: $({
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
    case N.OBJECT_SEARCH: {
      const r = String(t.text || "").trim().toLowerCase(), s = Array.isArray(t.tags) ? t.tags.map((p) => String(p).toLowerCase()) : [], a = t.asset_kind !== void 0 ? t.asset_kind : null, o = t.type_ !== void 0 ? t.type_ : t.objectType !== void 0 ? t.objectType : null, i = typeof t.enabled == "boolean" ? t.enabled : null, c = (p) => {
        if (r && ![p.id, p.name || "", ...Array.isArray(p.tags) ? p.tags : []].map((g) => String(g).toLowerCase()).some((g) => g.includes(r)))
          return !1;
        if (s.length) {
          const E = (Array.isArray(p.tags) ? p.tags : []).map((g) => String(g).toLowerCase());
          if (!s.every((g) => E.includes(g))) return !1;
        }
        return !(a !== null && p.asset_kind !== a || o !== null && p.type !== o || i !== null && p.enabled !== !1 !== i);
      }, h = (n.objects || []).filter(c), { offset: d, limit: l, end: m } = J(t, h.length);
      return S(e, {
        version: 1,
        type: t.type,
        items: h.slice(d, m).map(Ee),
        total: h.length,
        offset: d,
        limit: l
      });
    }
    case N.CHARACTER_LIST: {
      const r = (n.objects || []).filter((i) => i.asset_kind === "character"), { offset: s, limit: a, end: o } = J(t, r.length);
      return S(e, {
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
    case N.SHOT_LIST: {
      const r = n.sequence?.cuts || n.cuts || [], s = Math.max(0, (n.duration_frames || 1) - 1), a = r.map((h, d) => ({
        index: d,
        start: h.start,
        end: d + 1 < r.length ? r[d + 1].start - 1 : s,
        camera_id: h.camera_id
      })), { offset: o, limit: i, end: c } = J(t, a.length);
      return S(e, {
        version: 1,
        type: t.type,
        items: a.slice(o, c),
        total: a.length,
        offset: o,
        limit: i
      });
    }
    case N.KEYFRAME_LIST: {
      const r = t.cameraId || n.active_camera_id, s = (n.cameras || []).find((h) => h.id === r);
      if (!s) throw new u("UNKNOWN_CAMERA", `Unknown camera: ${r}`);
      const a = s.keyframes || [], { offset: o, limit: i, end: c } = J(t, a.length);
      return S(e, {
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
  let s = 1, a = `${t}_${s}`;
  for (; e.has(a); )
    s += 1, a = `${t}_${s}`;
  return a;
}
function Jt(e) {
  const t = e === "ground", n = e === "human", r = e === "card", s = e === "sun_light", a = e === "point_light", o = e === "spot_light";
  let i;
  t ? i = [12, 0.1, 12] : n ? i = [0.7, 1.8, 0.4] : r ? i = [2, 3] : i = [1.5, 1.5, 1.5];
  let c = [0, 0, 0], h = [0, 0, 0], d = "#8c929b", l, m, p, E;
  return s ? (c = [5, 8.5, 4], h = [-55, 35, 0], d = "#fff6ec", l = 2.2, m = !0) : a ? (c = [0, 3, 0], d = "#ffffff", l = 2, m = !1) : o && (c = [0, 4, 0], h = [-60, 0, 0], d = "#ffffff", l = 3, p = 45, E = 0.25, m = !0), {
    position: c,
    rotation: h,
    size: i,
    color: d,
    material_mode: t ? "checker" : "textured",
    ...l !== void 0 ? { intensity: l } : {},
    ...m !== void 0 ? { cast_shadow: m } : {},
    ...p !== void 0 ? { cone_angle: p } : {},
    ...E !== void 0 ? { penumbra: E } : {}
  };
}
function Gt(e, t) {
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
function Yt(e, t) {
  const n = (e.cameras || []).find((o) => o.id === t.cameraId);
  if (!n) throw new u("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  const r = new Set(e.cameras.map((o) => o.id)), s = ge(r, "camera", t.id), a = JSON.parse(JSON.stringify(n));
  return a.id = s, a.name = t.name || `${n.name || n.id} copy`, e.cameras.push(a), { cameraId: s };
}
function qt(e, t) {
  const n = e.cameras || [], r = n.findIndex((a) => a.id === t.cameraId);
  if (r === -1) throw new u("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  if (n.length <= 1) throw new u("LAST_CAMERA", "cannot delete the only camera");
  if (n[r].locked) throw new u("ENTITY_LOCKED", `${t.cameraId} is locked`);
  if ((e.sequence?.cuts || []).some((a) => a.camera_id === t.cameraId))
    throw new u("CAMERA_IN_USE", `${t.cameraId} is referenced by a cut`);
  return n.splice(r, 1), e.active_camera_id === t.cameraId && (e.active_camera_id = n[0].id), e.playblast_camera_id === t.cameraId && (e.playblast_camera_id = n[0].id), { cameraId: t.cameraId };
}
function Qt(e, t) {
  const n = (e.cameras || []).find((r) => r.id === t.cameraId);
  if (!n) throw new u("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  return n.name = String(t.name || "").trim().slice(0, 80) || n.name, { cameraId: n.id };
}
function Xt(e, t) {
  const n = "__sequence__";
  if (t.cameraId === n) {
    if (!(e.sequence?.cuts || []).length)
      throw new u("NO_CUTS", "the sequence has no cuts to play back");
    return e.playblast_camera_id = n, { cameraId: n };
  }
  const r = (e.cameras || []).find((s) => s.id === t.cameraId);
  if (!r) throw new u("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  return e.playblast_camera_id = r.id, { cameraId: r.id };
}
function Zt(e, t) {
  if (!dt.has(t.objectType))
    throw new u("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${t.objectType}`);
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
function en(e, t) {
  const n = (e.objects || []).find((c) => c.id === t.objectId);
  if (!n) throw new u("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  const r = new Set(e.objects.map((c) => c.id)), s = ge(r, n.type || "object", t.id), a = Array.isArray(t.offset) ? t.offset : [0.35, 0, 0.35], o = JSON.parse(JSON.stringify(n));
  o.id = s, o.name = t.name || `${n.name || n.id} copy`, o.locked = !1;
  const i = Array.isArray(n.position) ? n.position : [0, 0, 0];
  return o.position = [i[0] + a[0], i[1] + a[1], i[2] + a[2]], e.objects.push(o), { objectId: s, resourceRefresh: !!n.asset_id };
}
function tn(e, t) {
  const n = e.objects || [], r = n.findIndex((a) => a.id === t.objectId);
  if (r === -1) throw new u("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  const s = n[r];
  if (s.id === "subject") throw new u("PROTECTED_OBJECT", "the subject object cannot be deleted");
  if (s.locked) throw new u("ENTITY_LOCKED", `${t.objectId} is locked`);
  for (const a of n)
    a.parent_id === t.objectId && (a.parent_id = null);
  return n.splice(r, 1), { objectId: t.objectId, resourceRefresh: !!s.asset_id };
}
function nn(e, t) {
  const n = (e.objects || []).find((r) => r.id === t.objectId);
  if (!n) throw new u("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  return n.name = String(t.name || "").trim().slice(0, 80) || n.name, { objectId: n.id };
}
function rn(e, t) {
  const n = (e.objects || []).find((i) => i.id === t.objectId);
  if (!n) throw new u("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  if (t.parentId === null || t.parentId === void 0)
    return n.parent_id = null, { objectId: n.id };
  if (t.parentId === t.objectId)
    throw new u("INVALID_PARENT", "an object cannot be its own parent");
  const r = (e.objects || []).find((i) => i.id === t.parentId);
  if (!r) throw new u("UNKNOWN_OBJECT", `${t.parentId} does not exist`);
  const s = new Map(e.objects.map((i) => [i.id, i]));
  let a = r;
  const o = /* @__PURE__ */ new Set();
  for (; a; ) {
    if (a.id === t.objectId)
      throw new u("INVALID_PARENT", "assigning this parent would create a cycle");
    if (o.has(a.id)) break;
    o.add(a.id), a = a.parent_id ? s.get(a.parent_id) : null;
  }
  return n.parent_id = t.parentId, { objectId: n.id };
}
function sn(e, t) {
  e.sequence ||= De();
  const n = e.sequence.cuts ||= [], r = Math.max(0, (e.duration_frames || 1) - 1);
  if (!Number.isInteger(t.start) || t.start < 0 || t.start > r)
    throw new u("FRAME_OUT_OF_RANGE", `cut start must be within 0..${r}`);
  if (!(e.cameras || []).find((o) => o.id === t.cameraId)) throw new u("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  const a = n.find((o) => o.start === t.start);
  return a ? a.camera_id = t.cameraId : n.push({ start: t.start, camera_id: t.cameraId }), n.sort((o, i) => o.start - i.start), e.sequence.enabled = !0, { start: t.start, cameraId: t.cameraId };
}
function an(e, t) {
  e.sequence ||= De();
  const n = e.sequence.cuts || [], r = n.findIndex((s) => s.start === t.start);
  if (r === -1) throw new u("UNKNOWN_CUT", `no cut starts at frame ${t.start}`);
  return n.splice(r, 1), n.length && (n[0].start = 0), e.sequence.enabled = n.length > 0, { start: t.start };
}
function on(e, t) {
  e.sequence ||= De();
  const r = (e.sequence.cuts || []).find((a) => a.start === t.start);
  if (!r) throw new u("UNKNOWN_CUT", `no cut starts at frame ${t.start}`);
  if (!(e.cameras || []).find((a) => a.id === t.cameraId)) throw new u("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
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
], Sr = {
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
function cn(e, t) {
  const n = [...e.position], r = Array.isArray(t) ? [...t] : [...e.target], s = At(r, n), a = $e(s) > 1e-9 ? be(s) : [0, 0, -1];
  let o = ze(a, Ue);
  $e(o) < 1e-6 && (o = [1, 0, 0]), o = be(o);
  const i = be(ze(o, a));
  return { position: n, target: r, forward: a, right: o, up: i };
}
function ln(e) {
  return {
    fov: e.fov,
    roll: e.roll || 0,
    zoom: e.zoom || 1,
    near: e.near,
    far: e.far,
    camera_type: e.camera_type || "perspective"
  };
}
function dn(e) {
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
  const c = e.target, h = e.position[0] - c[0], d = e.position[2] - c[2], l = Math.hypot(h, d) || 1e-6, m = Math.atan2(d, h), p = Number.isFinite(r) ? r : l, E = Number.isFinite(s) ? s : p, g = n === "ccw" ? 1 : -1, T = Math.abs(t) * Math.PI / 180 * g, w = Math.max(2, Math.round(o)), I = e.position[1] + a, y = [];
  for (let A = 0; A < w; A += 1) {
    const k = i ? A / w : A / (w - 1), C = m + T * k, D = p + (E - p) * k;
    y.push({
      position: [c[0] + Math.cos(C) * D, I, c[2] + Math.sin(C) * D],
      target: [...c]
    });
  }
  return y;
}
function fn({ type: e, camera: t, target: n, startFrame: r, endFrame: s, params: a = {} } = {}) {
  if (!Te.includes(e)) return { ok: !1, reason: "unknown_preset" };
  if (!t || !Array.isArray(t.position) || !Array.isArray(t.target)) return { ok: !1, reason: "invalid_camera" };
  const o = Math.round(Number(r)), i = Math.round(Number(s));
  if (!Number.isFinite(o) || !Number.isFinite(i) || i <= o) return { ok: !1, reason: "invalid_range" };
  const c = cn(t, n), h = Number(a.distance) > 0 ? Number(a.distance) : 1, d = (g, T, w) => ({
    degrees: Number(a.degrees) || g,
    direction: T,
    radius: Number.isFinite(Number(a.radius)) ? Number(a.radius) : void 0,
    heightOffset: Number(a.heightOffset) || 0,
    samples: Number(a.samples) || w
  });
  let l;
  switch (e) {
    case "static":
      l = dn(c);
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
      l = oe(c, { ...d(180, a.direction === "ccw" ? "ccw" : "cw", 5), close: !!a.close });
      break;
    case "spiral":
      l = oe(c, {
        ...d(360, a.direction === "ccw" ? "ccw" : "cw", 8),
        radiusEnd: Number.isFinite(Number(a.radiusEnd)) ? Number(a.radiusEnd) : void 0
      });
      break;
    default:
      return { ok: !1, reason: "unknown_preset" };
  }
  if (i - o + 1 < l.length) return { ok: !1, reason: "insufficient_frame_slots" };
  const m = l.map((g, T) => l.length <= 1 ? o : Math.round(o + (i - o) * T / (l.length - 1)));
  for (let g = 1; g < m.length; g += 1) m[g] <= m[g - 1] && (m[g] = m[g - 1] + 1);
  for (let g = m.length - 1; g > 0; g -= 1) m[g] > i - (m.length - 1 - g) && (m[g] = i - (m.length - 1 - g));
  m[0] = o, m[m.length - 1] = i;
  const p = ln(t);
  return { ok: !0, keyframes: l.map((g, T) => ({
    frame: m[T],
    interpolation: "smooth",
    camera: { position: g.position, target: g.target, ...p }
  })) };
}
const un = 2048;
function mn(e, t) {
  const n = e._directorApiTxIds ||= /* @__PURE__ */ new Set();
  for (n.has(t) && n.delete(t), n.add(t); n.size > un; )
    n.delete(n.values().next().value);
}
function hn(e, t) {
  return !!e._directorApiTxIds?.has(t);
}
const K = (e) => typeof e == "number" && Number.isFinite(e);
function v(e, t, n) {
  if (!Array.isArray(e) || e.length !== 3 || !e.every(K))
    throw new u("BAD_VECTOR", `${t} must be [x,y,z] of finite numbers`, n);
}
function R(e, t, n) {
  if (!Number.isInteger(e) || e < 0)
    throw new u("BAD_FRAME", `${t} must be a non-negative integer frame`, n);
}
function b(e, t, n, r) {
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
const _n = /* @__PURE__ */ new Set(["translate", "rotate", "scale"]), pn = /* @__PURE__ */ new Set([
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
function gn(e, t) {
  for (const n of Object.keys(e))
    if (!pn.has(n))
      throw new u("BAD_VALUE", `camera.create: unsupported camera field "${n}"`, t);
  if (e.position !== void 0 && v(e.position, "camera.position", t), e.target !== void 0 && v(e.target, "camera.target", t), e.up !== void 0 && v(e.up, "camera.up", t), e.fov !== void 0 && (Y(e.fov, "camera.fov", t), e.fov < 1 || e.fov > 179))
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
  if (e.camera_type !== void 0 && !Ft.includes(e.camera_type))
    throw new u("BAD_VALUE", `Unsupported camera_type: ${e.camera_type}`, t);
}
function bn(e, t) {
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
      if (b(r.id, "asset.id", t), b(r.kind, "asset.kind", t), String(r.id).length > 120 || String(r.kind).length > 32)
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
      e.point !== void 0 && v(e.point, "point", t), e.id !== void 0 && b(e.id, "id", t);
      break;
    }
    case _.CAMERA_SET_ACTIVE:
      b(e.cameraId, "cameraId", t);
      break;
    case _.CAMERA_SET_LOCKED:
      if (b(e.cameraId, "cameraId", t), typeof e.value != "boolean")
        throw new u("BAD_VALUE", "camera.set_locked needs a boolean value", t);
      break;
    case _.CAMERA_CREATE:
      if (e.id !== void 0 && b(e.id, "id", t, j), e.name !== void 0 && b(e.name, "name", t, V), e.camera !== void 0) {
        if (typeof e.camera != "object" || Array.isArray(e.camera) || e.camera === null)
          throw new u("BAD_VALUE", "camera.create camera must be an object", t);
        gn(e.camera, t);
      }
      if (e.interpolation !== void 0 && !fe.includes(e.interpolation))
        throw new u("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      break;
    case _.CAMERA_DUPLICATE:
      b(e.cameraId, "cameraId", t, j), e.id !== void 0 && b(e.id, "id", t, j), e.name !== void 0 && b(e.name, "name", t, V);
      break;
    case _.CAMERA_DELETE:
    case _.CAMERA_SET_PLAYBLAST:
      b(e.cameraId, "cameraId", t, j);
      break;
    case _.CAMERA_RENAME:
      b(e.cameraId, "cameraId", t, j), b(e.name, "name", t, V);
      break;
    case _.OBJECT_CREATE:
      if (b(e.objectType, "objectType", t), !dt.has(e.objectType))
        throw new u("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${e.objectType}`, t);
      if (e.asset !== void 0 || e.url !== void 0 || e.path !== void 0)
        throw new u("BAD_VALUE", "object.create does not accept asset/url/path -- use asset.instantiate", t);
      e.id !== void 0 && b(e.id, "id", t, j), e.name !== void 0 && b(e.name, "name", t, V), e.position !== void 0 && v(e.position, "position", t), e.rotation !== void 0 && v(e.rotation, "rotation", t);
      break;
    case _.OBJECT_DUPLICATE:
      b(e.objectId, "objectId", t, j), e.id !== void 0 && b(e.id, "id", t, j), e.name !== void 0 && b(e.name, "name", t, V), e.offset !== void 0 && v(e.offset, "offset", t);
      break;
    case _.OBJECT_DELETE:
      b(e.objectId, "objectId", t, j);
      break;
    case _.OBJECT_RENAME:
      b(e.objectId, "objectId", t, j), b(e.name, "name", t, V);
      break;
    case _.OBJECT_SET_PARENT:
      b(e.objectId, "objectId", t, j), e.parentId !== null && e.parentId !== void 0 && b(e.parentId, "parentId", t, j);
      break;
    case _.CAMERA_TRANSFORM:
      if (e.cameraId !== void 0 && b(e.cameraId, "cameraId", t), e.position !== void 0 && v(e.position, "position", t), e.target !== void 0 && v(e.target, "target", t), e.frame !== void 0 && R(e.frame, "frame", t), e.position === void 0 && e.target === void 0)
        throw new u("EMPTY_OPERATION", "camera.transform needs position and/or target", t);
      break;
    case _.CAMERA_LOOK_AT:
      if (e.cameraId !== void 0 && b(e.cameraId, "cameraId", t), e.point !== void 0 && v(e.point, "point", t), e.objectId !== void 0 && e.objectId !== null && b(e.objectId, "objectId", t), e.point === void 0 && e.objectId === void 0)
        throw new u("EMPTY_OPERATION", "camera.look_at needs a point or an objectId", t);
      break;
    case _.OBJECT_TRANSFORM:
      if (b(e.objectId, "objectId", t), e.position !== void 0 && v(e.position, "position", t), e.rotation !== void 0 && v(e.rotation, "rotation", t), e.scale !== void 0 && v(e.scale, "scale", t), e.position === void 0 && e.rotation === void 0 && e.scale === void 0)
        throw new u("EMPTY_OPERATION", "object.transform needs position, rotation and/or scale", t);
      break;
    case _.OBJECT_SET_ENABLED:
    case _.OBJECT_SET_LOCKED:
      if (b(e.objectId, "objectId", t), typeof e.value != "boolean")
        throw new u("BAD_VALUE", `${n} needs a boolean value`, t);
      break;
    case _.OBJECT_SET_TAGS:
      if (b(e.objectId, "objectId", t), !Array.isArray(e.tags) || e.tags.some((r) => typeof r != "string"))
        throw new u("BAD_VALUE", "object.set_tags needs a string array", t);
      if (e.tags.length > 64)
        throw new u("BAD_VALUE", "object.set_tags: too many tags", t);
      break;
    case _.OBJECT_SET_ANNOTATION:
      if (b(e.objectId, "objectId", t), e.annotation !== null && (typeof e.annotation != "object" || Array.isArray(e.annotation)))
        throw new u("BAD_VALUE", "object.set_annotation needs an object or null", t);
      break;
    case _.CHARACTER_SET_POSE:
      if (b(e.objectId, "objectId", t), e.pose !== null && (typeof e.pose != "object" || Array.isArray(e.pose)))
        throw new u("BAD_VALUE", "character.set_pose needs a pose object or null", t);
      break;
    case _.CHARACTER_SET_JOINT_ROTATION:
      if (b(e.objectId, "objectId", t), b(e.joint, "joint", t), !Array.isArray(e.rotation) || e.rotation.length !== 4 || !e.rotation.every(K))
        throw new u("BAD_QUATERNION", "rotation must be [x,y,z,w] of finite numbers", t);
      break;
    case _.CHARACTER_SET_MOTION: {
      b(e.objectId, "objectId", t);
      const r = e.motion;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new u("BAD_VALUE", "character.set_motion needs a motion object", t);
      b(r.clip_id, "motion.clip_id", t);
      for (const s of ["start_frame", "end_frame", "speed", "offset_seconds"])
        if (r[s] !== void 0 && !K(r[s]))
          throw new u("BAD_VALUE", `motion.${s} must be a finite number`, t);
      if (K(r.start_frame) && K(r.end_frame) && r.end_frame > 0 && r.end_frame <= r.start_frame)
        throw new u("BAD_MOTION_RANGE", "motion end_frame is not after start_frame", t);
      break;
    }
    case _.CHARACTER_CLEAR_MOTION:
      b(e.objectId, "objectId", t);
      break;
    case _.KEYFRAME_UPSERT:
      if (e.cameraId !== void 0 && b(e.cameraId, "cameraId", t), R(e.frame, "frame", t), e.interpolation !== void 0 && !fe.includes(e.interpolation))
        throw new u("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      if (e.camera !== void 0) {
        if (!e.camera || typeof e.camera != "object")
          throw new u("BAD_VALUE", "keyframe.upsert camera must be an object", t);
        e.camera.position !== void 0 && v(e.camera.position, "camera.position", t), e.camera.target !== void 0 && v(e.camera.target, "camera.target", t);
        for (const r of ["fov", "roll", "zoom", "near", "far"])
          if (e.camera[r] !== void 0 && !K(e.camera[r]))
            throw new u("BAD_VALUE", `camera.${r} must be finite`, t);
      }
      break;
    case _.KEYFRAME_REMOVE:
      e.cameraId !== void 0 && b(e.cameraId, "cameraId", t), R(e.frame, "frame", t);
      break;
    case _.KEYFRAME_SET_INTERPOLATION:
      if (e.cameraId !== void 0 && b(e.cameraId, "cameraId", t), R(e.frame, "frame", t), !fe.includes(e.interpolation))
        throw new u("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      break;
    case _.TIMELINE_SET_RANGE:
      if (R(e.start, "start", t), R(e.end, "end", t), e.end < e.start)
        throw new u("BAD_RANGE", "range end is before start", t);
      break;
    case _.TIMELINE_SET_DURATION:
      if (!Number.isInteger(e.frames) || e.frames < 1)
        throw new u("BAD_VALUE", "timeline.set_duration needs frames >= 1", t);
      break;
    case _.CUT_UPSERT:
      R(e.start, "start", t), b(e.cameraId, "cameraId", t);
      break;
    case _.CUT_REMOVE:
      R(e.start, "start", t);
      break;
    case _.CUT_SET_CAMERA:
      R(e.start, "start", t), b(e.cameraId, "cameraId", t);
      break;
    case _.CAMERA_PATH_TRANSFORM_KEYS: {
      e.cameraId !== void 0 && b(e.cameraId, "cameraId", t), qe(e.frames, "frames", t);
      const r = e.transform;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new u("BAD_VALUE", "camera.path.transform_keys needs a transform object", t);
      if (!_n.has(r.mode))
        throw new u("BAD_VALUE", "transform.mode must be translate, rotate or scale", t);
      r.mode === "translate" ? v(r.delta, "transform.delta", t) : r.mode === "scale" ? v(r.factors, "transform.factors", t) : v(r.rotationDeg, "transform.rotationDeg", t), r.origin !== void 0 && v(r.origin, "transform.origin", t);
      break;
    }
    case _.CAMERA_PATH_INSERT_KEY:
      e.cameraId !== void 0 && b(e.cameraId, "cameraId", t), R(e.leftFrame, "leftFrame", t), R(e.rightFrame, "rightFrame", t), e.t !== void 0 && Y(e.t, "t", t);
      break;
    case _.CAMERA_PATH_DELETE_KEYS:
      e.cameraId !== void 0 && b(e.cameraId, "cameraId", t), qe(e.frames, "frames", t);
      break;
    case _.CAMERA_PATH_REDISTRIBUTE_TIMING:
      e.cameraId !== void 0 && b(e.cameraId, "cameraId", t), e.startFrame !== void 0 && R(e.startFrame, "startFrame", t), e.endFrame !== void 0 && R(e.endFrame, "endFrame", t);
      break;
    case _.CAMERA_PATH_APPLY_PRESET:
      if (e.cameraId !== void 0 && b(e.cameraId, "cameraId", t), !Te.includes(e.presetType))
        throw new u("BAD_VALUE", `presetType must be one of: ${Te.join(", ")}`, t);
      if (R(e.startFrame, "startFrame", t), R(e.endFrame, "endFrame", t), e.endFrame <= e.startFrame)
        throw new u("BAD_RANGE", "camera.path.apply_preset endFrame must be after startFrame", t);
      if (e.target !== void 0 && v(e.target, "target", t), e.params !== void 0 && (typeof e.params != "object" || Array.isArray(e.params)))
        throw new u("BAD_VALUE", "camera.path.apply_preset params must be an object", t);
      break;
    default:
      throw new u("UNKNOWN_OPERATION", `Unknown operation type: ${n}`, t);
  }
}
function En(e, t) {
  if (!t || typeof t != "object" || Array.isArray(t))
    throw new u("BAD_TRANSACTION", "transaction must be an object");
  if (t.version !== z)
    throw new u("UNSUPPORTED_VERSION", `Unsupported API version: ${t.version}`);
  if (typeof t.id != "string" || t.id.length === 0)
    throw new u("BAD_TRANSACTION_ID", "transaction id must be a non-empty string");
  if (hn(e, t.id))
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
  return t.operations.forEach((n, r) => bn(n, r)), {
    version: z,
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
function Rr(e = 0, t = 0) {
  return (e | t) >>> 0;
}
function Or(e, t) {
  return (e & t) !== 0;
}
const wn = "omnicam/library", An = "majoor_omnicam/blockout_library", yn = Object.freeze({
  "omnicam.helper.human_lowpoly": "human",
  "omnicam.helper.null": "null"
});
function Tn(e, t) {
  if (!Array.isArray(e) || e.length < 3) return [...t];
  const n = e.slice(0, 3).map((r) => Number(r));
  return n.every((r) => Number.isFinite(r)) ? n : [...t];
}
function In(e) {
  return e.file ? `${e.source === "legacy" ? An : wn}/${e.file} [input]` : "";
}
function Qe(e, t, n) {
  const r = e || "asset";
  let s = `${r}_${n}`, a = 2;
  for (; t && t.has(s); ) s = `${r}_${n}_${a++}`;
  return s;
}
function vn(e) {
  return {
    rig_profile: !!(e.rig && Object.keys(e.rig.bone_map || {}).length) ? e.rig.profile || "omnicam_humanoid_v1" : null,
    pose: { preset_id: "neutral", root_offset: [0, 0, 0], joints: {} },
    motion: null
  };
}
function kn(e, t = {}) {
  if (!e || typeof e != "object" || !e.id)
    throw new Error("compileInstance: an AssetDefinition is required");
  const n = Tn(t.point, [0, 0, 0]), r = String(t.idSeed || Date.now().toString(36)), s = String(e.kind || "prop"), a = s === "character", o = yn[e.id];
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
    asset: In(e),
    asset_id: e.id,
    asset_kind: s,
    tags: [...e.tags || []]
  };
  return a && (i.character = vn(e)), i;
}
function Cr({ groundHit: e, orbitTarget: t } = {}) {
  return Array.isArray(e) && e.length >= 3 && e.every((n) => Number.isFinite(n)) ? e.slice(0, 3).map(Number) : Array.isArray(t) && t.length >= 3 && t.every((n) => Number.isFinite(n)) ? [Number(t[0]), 0, Number(t[2])] : [0, 0, 0];
}
const Le = ["pos_x", "pos_y", "pos_z"], Ie = 1e-9, ft = ["auto", "aligned", "free", "corner"];
function O(e, t = 0) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
function L(e) {
  const t = e?.camera?.position;
  return [O(t?.[0]), O(t?.[1]), O(t?.[2])];
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
function ve(e, t, n) {
  const r = L(e), s = t ? L(t) : r, a = n ? L(n) : r, o = Math.max(Ie, O(e?.frame) - O(t?.frame, O(e?.frame) - 1)), i = Math.max(Ie, O(n?.frame, O(e?.frame) + 1) - O(e?.frame)), c = [0, 0, 0], h = [0, 0, 0];
  for (let d = 0; d < 3; d += 1) {
    const l = (r[d] - s[d]) / o, m = (a[d] - r[d]) / i;
    let p = (l + m) * 0.5;
    t ? n ? l * m <= 0 && (p = 0) : p = l : p = m, c[d] = p * i * (1 / 3), h[d] = -p * o * (1 / 3);
  }
  return { out: c, in: h };
}
function ut(e, t, n) {
  const r = L(e), s = t ? L(t) : r, a = n ? L(n) : r;
  return {
    out: me(X(a, r), 1 / 3),
    in: me(X(s, r), 1 / 3)
  };
}
function ke(e, t) {
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
  const r = he(e), s = L(e);
  if (r === "corner") {
    const c = ut(e, t, n);
    return { in: ie(s, c.in), out: ie(s, c.out), mode: r };
  }
  const a = ve(e, t, n), o = (r === "free" || r === "aligned") && ke(e, "out") || a.out, i = (r === "free" || r === "aligned") && ke(e, "in") || a.in;
  return { in: ie(s, i), out: ie(s, o), mode: r };
}
function ie(e, t) {
  return [e[0] + t[0], e[1] + t[1], e[2] + t[2]];
}
function Nn(e) {
  return e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.channels = e.tangents.channels && typeof e.tangents.channels == "object" ? e.tangents.channels : {}, e.tangents.channels;
}
function W(e, t, n) {
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
  const r = L(e), s = Ne(e, t, n);
  W(e, "out", X(s.out, r)), W(e, "in", X(s.in, r));
}
function jr(e, t, n, { prevKey: r = null, nextKey: s = null, breakCoupling: a = !1 } = {}) {
  if (!e || t !== "in" && t !== "out") return e;
  let o = he(e);
  if (o === "corner") return e;
  o === "auto" && (o = "aligned", e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.spatial_mode = "aligned", mt(e, r, s));
  const i = L(e), c = X([
    O(n?.[0]),
    O(n?.[1]),
    O(n?.[2])
  ], i);
  if (_e(e), W(e, t, c), o === "aligned" && !a) {
    const h = t === "out" ? "in" : "out", d = ke(e, h) || (h === "out" ? ve(e, r, s).out : ve(e, r, s).in), l = Xe(c), m = Xe(d) || l || 1, p = l > Ie ? me(c, -m / l) : me(d, 1);
    W(e, h, p);
  }
  return e;
}
function ce(e, t, n) {
  if (!e || t !== "in" && t !== "out") return e;
  const r = L(e);
  return _e(e), W(e, t, X([
    O(n?.[0]),
    O(n?.[1]),
    O(n?.[2])
  ], r)), e;
}
function Mr(e, t, { prevKey: n = null, nextKey: r = null } = {}) {
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
function Sn(e, t) {
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
function Rn(e) {
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
  const n = e.map((o) => Sn(o, t)), r = Rn(n), s = e.map((o) => o.frame), a = Math.max(1, s[s.length - 1] - s[0]);
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
function On(e, t, n) {
  const r = /* @__PURE__ */ new Set([0, e.length - 1]), s = [[0, e.length - 1]];
  for (; s.length; ) {
    const [a, o] = s.pop();
    if (o - a < 2) continue;
    let i = -1, c = -1;
    for (let h = a + 1; h < o; h += 1) {
      const d = Pe(e[h], e[a], e[o]);
      d > i && (i = d, c = h);
    }
    c < 0 || (i > t || n.has(c)) && (r.add(c), s.push([a, c], [c, o]));
  }
  return r;
}
function Dr(e, t, { tolerance: n = 0.02, keepFrames: r = [] } = {}) {
  const s = [...e].sort((d, l) => d.frame - l.frame);
  if (s.length <= 2 || n <= 0) return { keys: s, removed: 0 };
  const a = Be(s, t), o = /* @__PURE__ */ new Set(), i = new Set(r);
  s.forEach((d, l) => {
    i.has(d.frame) && o.add(l);
  });
  const c = On(a, n, o);
  for (const d of o) c.add(d);
  const h = s.filter((d, l) => c.has(l));
  return { keys: h, removed: s.length - h.length };
}
function Ur(e, t, { target: n = 2, keepFrames: r = [] } = {}) {
  let s = [...e].sort((c, h) => c.frame - h.frame);
  const a = Math.max(2, Math.round(n));
  if (s.length <= a) return { keys: s, removed: 0 };
  const o = new Set(r), i = s.length;
  for (; s.length > a; ) {
    const c = Be(s, t);
    let h = -1, d = 1 / 0;
    for (let l = 1; l < s.length - 1; l += 1) {
      if (o.has(s[l].frame)) continue;
      const m = Pe(c[l], c[l - 1], c[l + 1]);
      m < d && (d = m, h = l);
    }
    if (h < 0) break;
    s = s.filter((l, m) => m !== h);
  }
  return { keys: s, removed: i - s.length };
}
function Lr(e, t, { mergeWithin: n = 1, epsilon: r = 1e-3, keepFrames: s = [] } = {}) {
  const a = [...e].sort((m, p) => m.frame - p.frame), o = a.length, i = new Set(s), c = [];
  for (const m of a) {
    const p = c[c.length - 1];
    p && m.frame - p.frame <= Math.max(0, n) && !i.has(m.frame) || c.push(m);
  }
  if (c.length <= 2) return { keys: c, removed: o - c.length };
  const h = Be(c, t), d = /* @__PURE__ */ new Set();
  for (let m = 1; m < c.length - 1; m += 1) {
    if (i.has(c[m].frame)) continue;
    const p = d.has(m - 1) ? null : m - 1;
    if (p === null) continue;
    Pe(h[m], h[p], h[m + 1]) <= r && d.add(m);
  }
  const l = c.filter((m, p) => !d.has(p));
  return { keys: l, removed: o - l.length };
}
function Cn(e, t, { minKeys: n = 0 } = {}) {
  const r = new Set(t), s = e.filter((a) => !r.has(a.frame));
  if (s.length < n) {
    const a = e.filter((o) => r.has(o.frame)).sort((o, i) => o.frame - i.frame);
    for (; s.length < n && a.length; ) s.push(a.shift());
    s.sort((o, i) => o.frame - i.frame);
  }
  return { keys: s, removed: e.length - s.length };
}
function Br(e, t, n, { lastFrame: r = 1 / 0 } = {}) {
  const s = [...t].sort((d, l) => d - l);
  if (!n || !s.length)
    return { keys: [...e], moved: 0, frames: s };
  const a = new Set(s), o = new Set(e.filter((d) => !a.has(d.frame)).map((d) => d.frame)), i = s.map((d) => d + n);
  return i.some((d) => d < 0 || d > r || o.has(d)) || new Set(i).size !== i.length ? { keys: [...e], moved: 0, frames: s } : { keys: e.map((d) => a.has(d.frame) ? { ...d, frame: d.frame + n } : d).sort((d, l) => d.frame - l.frame), moved: s.length, frames: i.sort((d, l) => d - l) };
}
function Pr(e, t, n) {
  const r = new Set(t);
  return e.map((s) => r.has(s.frame) ? { ...s, interpolation: n } : s);
}
function Fr(e, t, n, r = []) {
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
function $r(e, t, n = "camera", r = 0.5) {
  const s = new Set(t), a = [...e].sort((d, l) => d.frame - l.frame), o = [];
  if (a.forEach((d, l) => {
    s.has(d.frame) && o.push(l);
  }), o.length < 2) return e;
  const i = r * 0.5, c = 1 - r, h = a.map((d) => ({
    ...d,
    camera: d.camera ? { ...d.camera, position: [...d.camera.position], target: [...d.camera.target || [0, 0, 0]] } : void 0,
    transform: d.transform ? { ...d.transform, position: [...d.transform.position], rotation: [...d.transform.rotation || [0, 0, 0]] } : void 0
  }));
  for (let d = 0; d < o.length; d += 1) {
    const l = o[d], m = d > 0 ? o[d - 1] : l > 0 ? l - 1 : null, p = d < o.length - 1 ? o[d + 1] : l < a.length - 1 ? l + 1 : null;
    if (m === null || p === null) continue;
    const E = a[m], g = a[l], T = a[p];
    if (n === "object" && g.transform && E.transform && T.transform)
      for (let w = 0; w < 3; w += 1)
        h[l].transform.position[w] = i * E.transform.position[w] + c * g.transform.position[w] + i * T.transform.position[w], g.transform.rotation && E.transform.rotation && T.transform.rotation && (h[l].transform.rotation[w] = i * E.transform.rotation[w] + c * g.transform.rotation[w] + i * T.transform.rotation[w]);
    else if (g.camera && E.camera && T.camera) {
      for (let w = 0; w < 3; w += 1)
        h[l].camera.position[w] = i * E.camera.position[w] + c * g.camera.position[w] + i * T.camera.position[w], h[l].camera.target[w] = i * (E.camera.target?.[w] ?? 0) + c * (g.camera.target?.[w] ?? 0) + i * (T.camera.target?.[w] ?? 0);
      Number.isFinite(g.camera.roll) && Number.isFinite(E.camera.roll) && Number.isFinite(T.camera.roll) && (h[l].camera.roll = i * E.camera.roll + c * g.camera.roll + i * T.camera.roll), Number.isFinite(g.camera.fov) && Number.isFinite(E.camera.fov) && Number.isFinite(T.camera.fov) && (h[l].camera.fov = i * E.camera.fov + c * g.camera.fov + i * T.camera.fov);
    }
  }
  return h;
}
function G(e, t, n) {
  return [0, 1, 2].map((r) => e[r] + (t[r] - e[r]) * n);
}
function jn(e, t, n, r, s) {
  const a = G(e, t, s), o = G(t, n, s), i = G(n, r, s), c = G(a, o, s), h = G(o, i, s), d = G(c, h, s);
  return { left: [e, a, c, d], right: [d, h, i, r], point: d };
}
function Mn(e, t, n, r) {
  const s = new Set(e.map((i) => i.frame)), a = Math.min(n - 1, Math.max(t + 1, r));
  if (!s.has(a)) return a;
  const o = n - t;
  for (let i = 1; i < o; i += 1)
    for (const c of [a - i, a + i])
      if (!(c <= t || c >= n) && !s.has(c))
        return c;
  return -1;
}
function Dn(e, { leftFrame: t, rightFrame: n, t: r = 0.5 } = {}) {
  const s = [...e].sort((y, A) => y.frame - A.frame), a = s.findIndex((y) => y.frame === t), o = a >= 0 ? a + 1 : -1;
  if (a < 0 || o < 0 || o >= s.length || s[o].frame !== n)
    return { ok: !1, reason: "segment_not_found" };
  if (n - t < 2)
    return { ok: !1, reason: "no_free_frame" };
  const i = Math.min(0.999, Math.max(1e-3, Number.isFinite(r) ? r : 0.5)), c = Math.round(t + i * (n - t)), h = Mn(s, t, n, c);
  if (h < 0) return { ok: !1, reason: "no_free_frame" };
  const d = (h - t) / (n - t), l = s[a], m = s[o], p = a > 0 ? s[a - 1] : null, E = o + 1 < s.length ? s[o + 1] : null, g = l.interpolation === "bezier" || m.interpolation === "bezier", T = ae({ keyframes: s }, h), w = { frame: h, interpolation: g ? "bezier" : l.interpolation, camera: T };
  if (g) {
    const y = [...l.camera.position], A = Ne(l, p, m).out, k = Ne(m, l, E).in, C = [...m.camera.position], D = jn(y, A, k, C, d);
    w.camera = { ...ue(T), position: [...D.point] };
    const B = he(l);
    (B === "free" || B === "aligned") && ce(l, "out", D.left[1]);
    const Fe = he(m);
    (Fe === "free" || Fe === "aligned") && ce(m, "in", D.right[2]), ce(w, "in", D.left[2]), ce(w, "out", D.right[1]);
  }
  return { ok: !0, keys: [...s, w].sort((y, A) => y.frame - A.frame), frame: h };
}
function Un(e, t) {
  const { keys: n, removed: r } = Cn(e, t, { minKeys: 1 });
  return { ok: r > 0, keys: n, removed: r };
}
function Se(e, t) {
  const n = t || e.active_camera_id, r = (e.cameras || []).find((s) => s.id === n);
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
function U(e, t) {
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
  const r = new Set((e.keyframes || []).map((a) => a.frame)), s = t.find((a) => !r.has(a));
  if (s !== void 0)
    throw new u("UNKNOWN_KEYFRAME", `${n}: camera has no key at frame ${s}`);
}
const Ln = {
  [_.ASSET_INSTANTIATE](e, t) {
    const n = new Set((e.objects || []).map((s) => s.id));
    let r;
    try {
      r = kn(t.asset, { point: t.point, idSeed: t.id, existingIds: n });
    } catch (s) {
      throw new u("BAD_ASSET", `asset.instantiate could not compile: ${s.message}`);
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
    const n = Gt(e, t);
    return { dirtyMask: f.outliner | f.inspector | f.viewport | f.previews | f.timeline, outcome: n };
  },
  [_.CAMERA_DUPLICATE](e, t) {
    const n = Yt(e, t);
    return { dirtyMask: f.outliner | f.inspector | f.viewport | f.previews | f.timeline, outcome: n };
  },
  [_.CAMERA_DELETE](e, t) {
    const n = qt(e, t);
    return { dirtyMask: f.outliner | f.inspector | f.viewport | f.previews | f.timeline, outcome: n };
  },
  [_.CAMERA_RENAME](e, t) {
    U(e, t.cameraId);
    const n = Qt(e, t);
    return { dirtyMask: f.outliner | f.inspector, outcome: n };
  },
  [_.CAMERA_SET_PLAYBLAST](e, t) {
    const n = Xt(e, t);
    return { dirtyMask: f.outliner | f.inspector | f.status, outcome: n };
  },
  [_.CAMERA_TRANSFORM](e, t) {
    const n = U(e, t.cameraId), r = we(n);
    if (t.position && (r.position = [...t.position]), t.target && (r.target = [...t.target]), Number.isInteger(t.frame)) {
      const s = de(n, t.frame);
      if (!s) throw new u("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
      s.camera = { ...s.camera }, t.position && (s.camera.position = [...t.position]), t.target && (s.camera.target = [...t.target]);
    }
    return { dirtyMask: f.viewport | f.previews | f.inspector | f.timeline };
  },
  [_.CAMERA_LOOK_AT](e, t) {
    const n = U(e, t.cameraId);
    if (t.objectId !== void 0 && (t.objectId === null || t.objectId === "" ? (n.target_object_id = null, n.id === e.active_camera_id && (e.target_object_id = null)) : (Re(e, t.objectId), n.target_object_id = t.objectId, n.id === e.active_camera_id && (e.target_object_id = t.objectId))), t.point) {
      const r = we(n);
      r.target = [...t.point];
      for (const s of n.keyframes || [])
        s.camera = { ...s.camera, target: [...t.point] };
    }
    return { dirtyMask: f.viewport | f.previews | f.inspector | f.timeline };
  },
  [_.OBJECT_CREATE](e, t) {
    const n = Zt(e, t);
    return { dirtyMask: f.viewport | f.previews | f.outliner | f.inspector, outcome: n };
  },
  [_.OBJECT_DUPLICATE](e, t) {
    const n = en(e, t);
    return { dirtyMask: f.viewport | f.previews | f.outliner | f.inspector, outcome: n };
  },
  [_.OBJECT_DELETE](e, t) {
    const n = tn(e, t);
    return { dirtyMask: f.viewport | f.previews | f.outliner | f.inspector, outcome: n };
  },
  [_.OBJECT_RENAME](e, t) {
    H(e, t.objectId);
    const n = nn(e, t);
    return { dirtyMask: f.outliner | f.inspector, outcome: n };
  },
  [_.OBJECT_SET_PARENT](e, t) {
    H(e, t.objectId);
    const n = rn(e, t);
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
    const n = H(e, t.objectId), r = Ct(t.tags), s = r.length !== t.tags.length ? "some tags were dropped or normalised" : void 0;
    return r.length ? n.tags = r : delete n.tags, { dirtyMask: f.outliner | f.inspector | f.viewport, warning: s };
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
    const s = n.character?.pose || {};
    return n.character = {
      ...n.character || {},
      pose: { preset_id: s.preset_id || "neutral", root_offset: s.root_offset || [0, 0, 0], joints: {} },
      motion: r
    }, { dirtyMask: f.viewport | f.previews | f.timeline | f.inspector };
  },
  [_.CHARACTER_CLEAR_MOTION](e, t) {
    const n = le(e, t.objectId);
    return n.character ? (n.character = { ...n.character, motion: null }, { dirtyMask: f.viewport | f.previews | f.timeline | f.inspector }) : { dirtyMask: 0 };
  },
  [_.KEYFRAME_UPSERT](e, t) {
    const n = U(e, t.cameraId);
    if (t.frame >= (e.duration_frames || 0))
      throw new u("FRAME_OUT_OF_RANGE", `frame ${t.frame} is past the timeline`);
    n.keyframes ||= [];
    let r = de(n, t.frame);
    const s = !r;
    if (!r) {
      const o = de(n, 0)?.camera || n.camera || {};
      r = { frame: t.frame, camera: JSON.parse(JSON.stringify(o)), interpolation: "ease" }, n.keyframes.push(r), n.keyframes.sort((i, c) => i.frame - c.frame);
    }
    t.camera && (r.camera = { ...r.camera, ...JSON.parse(JSON.stringify(t.camera)) }), t.interpolation && (r.interpolation = t.interpolation);
    const a = s && !t.camera ? `keyframe at frame ${t.frame} was created from the existing pose (no "camera" given) -- it will not move the camera unless another keyframe with a different position/target exists` : void 0;
    return { dirtyMask: f.viewport | f.previews | f.timeline | f.inspector, warning: a };
  },
  [_.KEYFRAME_REMOVE](e, t) {
    const n = U(e, t.cameraId), r = (n.keyframes || []).length;
    if (n.keyframes = (n.keyframes || []).filter((a) => a.frame !== t.frame), n.keyframes.length === r)
      throw new u("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
    const s = n.keyframes.length === 0 ? "camera has no keyframes left" : void 0;
    return { dirtyMask: f.viewport | f.previews | f.timeline | f.inspector, warning: s };
  },
  [_.KEYFRAME_SET_INTERPOLATION](e, t) {
    const n = U(e, t.cameraId), r = de(n, t.frame);
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
    const n = sn(e, t);
    return { dirtyMask: f.timeline | f.viewport | f.previews | f.status, outcome: n };
  },
  [_.CUT_REMOVE](e, t) {
    const n = an(e, t);
    return { dirtyMask: f.timeline | f.viewport | f.previews | f.status, outcome: n };
  },
  [_.CUT_SET_CAMERA](e, t) {
    const n = on(e, t);
    return { dirtyMask: f.timeline | f.viewport | f.previews | f.status, outcome: n };
  },
  // Semantic Director API path operations (plan section 22): the same pure
  // maths the manual UI's TransformControls wiring / toolbar actions use
  // (viewport/transform-controls-wiring.js, director/methods/scene.js),
  // reached atomically and with the exact same lock/existence checks. No
  // raw Three.js object ever crosses this boundary -- every input/output
  // here is plain JSON (frames, vectors, strings).
  [_.CAMERA_PATH_TRANSFORM_KEYS](e, t) {
    const n = U(e, t.cameraId);
    et(n, t.frames, "camera.path.transform_keys");
    const r = (n.keyframes || []).filter((o) => t.frames.includes(o.frame)), s = Array.isArray(t.transform.origin) ? t.transform.origin : It(r), a = vt(n.keyframes || [], t.frames, {
      mode: t.transform.mode,
      origin: s,
      delta: t.transform.delta,
      factors: t.transform.factors,
      rotationDeg: t.transform.rotationDeg,
      lookAtActive: kt(n, e.objects)
    });
    return Z(e, n, a), { dirtyMask: ee };
  },
  [_.CAMERA_PATH_INSERT_KEY](e, t) {
    const n = U(e, t.cameraId), r = Dn(n.keyframes || [], {
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
    const n = U(e, t.cameraId);
    et(n, t.frames, "camera.path.delete_keys");
    const r = Un(n.keyframes || [], t.frames);
    if (!r.ok)
      throw new u("CANNOT_DELETE", "camera.path.delete_keys: a camera track needs at least one key");
    return Z(e, n, r.keys), { dirtyMask: ee, outcome: { removed: r.removed } };
  },
  [_.CAMERA_PATH_REDISTRIBUTE_TIMING](e, t) {
    const n = U(e, t.cameraId), r = [...n.keyframes || []].sort((i, c) => i.frame - c.frame), s = Number.isInteger(t.startFrame) ? t.startFrame : r[0]?.frame, a = Number.isInteger(t.endFrame) ? t.endFrame : r[r.length - 1]?.frame, o = Tt(r, { startFrame: s, endFrame: a });
    if (!o.ok) {
      const i = { not_enough_keys: "NOT_ENOUGH_KEYS", invalid_range: "BAD_RANGE", insufficient_frame_slots: "INSUFFICIENT_FRAME_SLOTS" };
      throw new u(i[o.reason] || "BAD_RANGE", `camera.path.redistribute_timing: ${o.reason}`);
    }
    return Z(e, n, o.keys), { dirtyMask: ee };
  },
  [_.CAMERA_PATH_APPLY_PRESET](e, t) {
    const n = U(e, t.cameraId), r = we(n), s = fn({
      type: t.presetType,
      camera: r,
      target: t.target,
      startFrame: t.startFrame,
      endFrame: t.endFrame,
      params: t.params || {}
    });
    if (!s.ok) {
      const a = { unknown_preset: "UNKNOWN_PRESET", invalid_camera: "BAD_VALUE", invalid_range: "BAD_RANGE", insufficient_frame_slots: "INSUFFICIENT_FRAME_SLOTS" };
      throw new u(a[s.reason] || "BAD_VALUE", `camera.path.apply_preset: ${s.reason}`);
    }
    return Z(e, n, s.keyframes), { dirtyMask: ee };
  }
};
function Bn({ state: e, operation: t }) {
  const n = Ln[t.type];
  if (!n) throw new u("UNKNOWN_OPERATION", `Unknown operation type: ${t.type}`);
  return n(e, t) || { dirtyMask: 0 };
}
const Pn = 100;
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
function x(e) {
  return new Map((e || []).map((t) => [t.id, t]));
}
function Fn(e, t) {
  const n = [];
  let r = !1;
  const s = (a, o, i, c) => {
    if (!r && !Oe(i, c)) {
      if (n.length >= Pn) {
        r = !0;
        return;
      }
      n.push({ entity: a, field: o, before: i ?? null, after: c ?? null });
    }
  };
  return zn(e, t, s), Hn(e, t, s), Wn(e, t, s), Kn(e, t, s), Vn(e, t, s), Jn(e, t, s), { changes: n, truncated: r };
}
const $n = ["fov", "roll", "zoom", "near", "far", "camera_type"];
function zn(e, t, n) {
  const r = x(e?.cameras), s = x(t?.cameras);
  for (const a of r.keys())
    s.has(a) || n(a, "camera", "present", null);
  for (const [a, o] of s) {
    const i = r.get(a);
    if (!i) {
      n(a, "camera", null, "present");
      continue;
    }
    n(a, "name", i.name, o.name), n(a, "locked", !!i.locked, !!o.locked), n(a, "muted", !!i.muted, !!o.muted), n(a, "solo", !!i.solo, !!o.solo), n(a, "target_object_id", i.target_object_id ?? null, o.target_object_id ?? null), n(a, "position", i.camera?.position, o.camera?.position), n(a, "target", i.camera?.target, o.camera?.target);
    for (const c of $n)
      n(a, c, i.camera?.[c], o.camera?.[c]);
  }
}
const xn = ["position", "target", "fov", "roll", "zoom", "near", "far", "camera_type"];
function Hn(e, t, n) {
  const r = x(e?.cameras), s = x(t?.cameras);
  for (const [a, o] of s) {
    const i = r.get(a), c = new Map((i?.keyframes || []).map((l) => [l.frame, l])), h = new Map((o.keyframes || []).map((l) => [l.frame, l])), d = `${a}@keyframes`;
    for (const [l, m] of c)
      h.has(l) || n(d, `frame_${l}`, m.interpolation ?? "present", null);
    for (const [l, m] of h) {
      const p = c.get(l);
      if (!p) {
        n(d, `frame_${l}`, null, m.interpolation ?? "present");
        continue;
      }
      for (const E of xn)
        n(d, `frame_${l}_${E}`, p.camera?.[E], m.camera?.[E]);
      n(d, `frame_${l}_interpolation`, p.interpolation, m.interpolation);
    }
  }
}
function Kn(e, t, n) {
  const r = x(e?.objects), s = x(t?.objects);
  for (const [a, o] of s) {
    const c = r.get(a)?.character?.pose?.joints || {}, h = o.character?.pose?.joints || {}, d = /* @__PURE__ */ new Set([...Object.keys(c), ...Object.keys(h)]);
    for (const l of d)
      n(`${a}#${l}`, "joint_rotation", c[l] ?? null, h[l] ?? null);
  }
}
function Wn(e, t, n) {
  const r = x(e?.objects), s = x(t?.objects);
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
    const d = i.character?.motion?.clip_id ?? null, l = o.character?.motion?.clip_id ?? null;
    n(a, "motion_clip_id", d, l);
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
function Gn(e) {
  return typeof structuredClone == "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e));
}
function Ce(e) {
  return Number.isInteger(e.directorRevision) ? Math.max(0, e.directorRevision) : 0;
}
function Ae(e, t, n) {
  return {
    ok: !1,
    version: z,
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
function Yn(e) {
  const t = (e.state.cameras || []).find(
    (n) => n.id === e.state.active_camera_id
  ) || e.state.cameras?.[0] || null;
  return t ? (e.state.keyframes = t.keyframes, e.state.camera = ue(t.camera), e.camera = ue(t.camera), t) : null;
}
function qn(e, t) {
  t && (e.camera = ae(
    t,
    e.frame ?? 0,
    e.state.objects || []
  ));
}
async function Qn(e, t, n) {
  const r = n.some((o) => o.resourceRefresh === !0), s = t.operations.filter((o) => o.type === _.OBJECT_DELETE).map((o) => o.objectId);
  for (const o of s)
    e.removeObjectResources?.(o);
  const a = t.operations.some((o) => o.type === _.ASSET_INSTANTIATE);
  (r || a) && await e.restoreAssets?.();
}
function Xn(e, t, n) {
  if (typeof e.requestUiUpdate == "function") {
    e.requestUiUpdate(t, n);
    return;
  }
  e.camera = e.sampleCamera?.(e.state, e.frame) ?? e.camera, e.refreshObjects?.(), e.refreshKeys?.(), e.refreshInspector?.(), e.render?.();
}
function Zn(e, t) {
  let n;
  try {
    n = En(e, t);
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
  const s = Gn(e.state);
  let a = 0;
  const o = [], i = [];
  for (let l = 0; l < n.operations.length; l += 1)
    try {
      const m = Bn({ ui: e, state: s, operation: n.operations[l] });
      a |= m?.dirtyMask || 0, m?.warning && o.push(m.warning), m?.outcome && i.push({ index: l, ...m.outcome });
    } catch (m) {
      if (m instanceof u)
        return (m.operationIndex === null || m.operationIndex === void 0) && (m.operationIndex = l), Ae(e, n.id, m);
      throw m;
    }
  if (n.validateOnly) {
    const { changes: l, truncated: m } = Fn(e.state, s);
    return {
      ok: !0,
      version: z,
      revision: r,
      id: n.id,
      applied: n.operations.length,
      warnings: o,
      outcomes: i,
      dirtyMask: a,
      validateOnly: !0,
      changes: l,
      ...m ? { truncated: !0 } : {}
    };
  }
  e.checkpoint?.(n.description), e.state = se(s);
  const c = Yn(e);
  mn(e, n.id), e.serialize?.(), qn(e, c), Xn(e, a, `director-api:${n.id}`);
  const h = {
    ok: !0,
    version: z,
    baseRevision: r,
    revision: Ce(e),
    id: n.id,
    applied: n.operations.length,
    warnings: o,
    outcomes: i,
    dirtyMask: a
  }, d = Qn(e, n, i).catch((l) => {
    console.warn("OmniCam: resource reconciliation failed", l), o.push({
      code: "VIEWPORT_RESOURCE_RECONCILE_FAILED",
      message: "The scene change was committed, but one or more viewport resources could not be refreshed."
    }), e.setStatus?.("The scene change was committed, but one or more viewport resources could not be refreshed.");
  });
  return Object.defineProperty(h, "_reconciliation", { value: d, enumerable: !1 }), h;
}
function er(e) {
  return {
    query: (t) => Vt(e, t),
    execute: (t) => Zn(e, t)
  };
}
function tr(e) {
  return e.directorApi = er(e), e.directorApi;
}
const tt = "omnicam-agent/1", nt = "majoor.omnicam.agent.request", nr = 1, te = Object.freeze({
  register: "/majoor/omnicam/agent/v1/session/register",
  heartbeat: "/majoor/omnicam/agent/v1/session/heartbeat",
  reply: "/majoor/omnicam/agent/v1/reply",
  close: "/majoor/omnicam/agent/v1/session/close"
}), rr = 1e4, sr = 5e3, _t = "asset.instantiate_by_id", pt = "asset.catalog_search", rt = Object.freeze([
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
async function or(e, t) {
  const n = e.assetBrowser?.store, r = [];
  for (const s of t || []) {
    if (s?.type !== _t) {
      r.push(s);
      continue;
    }
    if (!n)
      return { ok: !1, code: "ASSET_CATALOG_UNAVAILABLE", message: "The asset catalogue is not available in this Director session" };
    const a = await ar(n, s.assetId);
    if (!a)
      return { ok: !1, code: "UNKNOWN_ASSET", message: `Unknown catalogue asset: ${s.assetId}` };
    r.push({ type: "asset.instantiate", asset: a, id: s.id, point: s.point });
  }
  return { ok: !0, operations: r };
}
async function ir(e, t) {
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
    version: z,
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
    version: z,
    revision: Number(e.directorRevision || 0),
    error: { code: t, message: n }
  };
}
function cr(e, t, n) {
  let r = !1, s = null, a = null, o = null, i = null, c = null, h = 0;
  function d() {
    return n.clientId || n.initialClientId || null;
  }
  function l() {
    s = null, a = null, o = null, i && (clearInterval(i), i = null);
  }
  async function m() {
    if (r) return;
    h += 1;
    const y = h, A = d();
    if (!A) {
      p();
      return;
    }
    try {
      const k = await ne(n, te.register, {
        protocol: tt,
        client_id: A,
        node_id: String(t.id),
        label: `OmniCam Director ${t.id}`,
        director_api: z,
        revision: Number(e.directorRevision || 0),
        operations: [...rt],
        queries: [...$t]
      });
      if (r || y !== h) return;
      s = k.session_id, a = k.session_token, o = A, E();
    } catch {
      if (r || y !== h) return;
      p();
    }
  }
  function p() {
    r || (clearTimeout(c), c = setTimeout(() => {
      m();
    }, sr));
  }
  function E() {
    clearInterval(i), i = setInterval(() => {
      g();
    }, rr);
  }
  async function g() {
    if (!(r || !s))
      try {
        await ne(n, te.heartbeat, {
          session_id: s,
          session_token: a,
          revision: Number(e.directorRevision || 0)
        });
      } catch (y) {
        if (r) return;
        (y?.code === "UNKNOWN_SESSION" || y?.code === "BAD_SESSION_TOKEN") && (l(), m());
      }
  }
  async function T(y) {
    const A = y?.detail;
    if (r || !A || A.protocol !== tt || Number(A.schema_version) !== nr || A.session_id !== s || String(A.node_id) !== String(t.id)) return;
    let k;
    try {
      if (A.kind === "query")
        k = A.payload?.type === pt ? await ir(e, A.payload) : e.directorApi.query(A.payload);
      else if (A.kind === "transaction") {
        const C = A.payload, D = (C?.operations || []).find(
          (B) => !rt.includes(B?.type)
        );
        if (!Number.isInteger(C?.baseRevision) || C.baseRevision < 0)
          k = re(
            e,
            "BASE_REVISION_REQUIRED",
            "External Agent transactions require baseRevision"
          );
        else if (D)
          k = re(
            e,
            "OPERATION_NOT_ADVERTISED",
            `External Agent transactions cannot use operation: ${D?.type}`
          );
        else {
          const B = await or(e, C.operations);
          B.ok ? (k = e.directorApi.execute({ ...C, operations: B.operations }), await k?._reconciliation) : k = re(e, B.code, B.message);
        }
      } else
        k = re(e, "UNKNOWN_AGENT_REQUEST", `Unsupported Agent request kind: ${A.kind}`);
    } catch (C) {
      k = re(e, C?.code || "INTERNAL", C?.message || "OmniCam Agent request failed");
    }
    try {
      await ne(n, te.reply, {
        session_id: s,
        session_token: a,
        request_id: A.request_id,
        result: k
      });
    } catch {
    }
  }
  async function w(y, A) {
    if (!(!y || !A))
      try {
        await ne(n, te.close, {
          session_id: y,
          session_token: A
        });
      } catch {
      }
  }
  function I() {
    if (r) return;
    const y = d();
    if (y && o && y !== o) {
      const A = s, k = a;
      l(), w(A, k).finally(() => m());
    }
  }
  return n.addEventListener?.(nt, T), n.addEventListener?.("status", I), m(), {
    get sessionId() {
      return s;
    },
    dispose() {
      if (r) return;
      r = !0, clearInterval(i), clearTimeout(c), n.removeEventListener?.(nt, T), n.removeEventListener?.("status", I);
      const y = s, A = a;
      s = null, a = null, y && A && ne(n, te.close, {
        session_id: y,
        session_token: A
      }).catch(() => {
      });
    }
  };
}
const st = "majoor-omnicam-workbench-styles", lr = `
  .oc-workbench-backdrop,.oc-node-shell{${Dt}}
  .oc-workbench-backdrop{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(5,7,12,0.92)}
  .oc-workbench-window{display:flex;flex-direction:column;width:min(96vw,1920px);height:92dvh;min-width:0;min-height:0;max-width:100vw;max-height:100dvh;background:var(--oc-bg-app);border:1px solid var(--oc-border-default);border-radius:8px;box-shadow:0 24px 64px rgba(0,0,0,0.7);overflow:hidden;outline:none}
  .oc-workbench-window.is-maximized{width:100vw;height:100vh;min-width:0;min-height:0;border-radius:0;border:none}
  .oc-workbench-header{display:flex;align-items:center;gap:10px;min-height:40px;padding:6px 12px;background:var(--oc-bg-panel);border-bottom:1px solid var(--oc-border-default);flex:none}
  .oc-workbench-title{display:flex;align-items:center;gap:6px;flex:1 1 auto;min-width:0;overflow:hidden;color:var(--oc-text-primary);font:600 13px/1.4 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .oc-workbench-title-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-workbench-dirty-dot{flex:none;width:7px;height:7px;border-radius:50%;background:${P.warning}}
  .oc-workbench-actions{display:flex;align-items:center;gap:6px;flex:none}
  .oc-workbench-actions button{display:inline-grid;place-items:center;width:28px;height:28px;padding:0;color:var(--oc-text-secondary);background:var(--oc-bg-control);border:1px solid var(--oc-border-default);border-radius:6px;cursor:pointer;transition:all .15s ease}
  .oc-workbench-actions button:hover{background:var(--oc-bg-control);border-color:${P.accent};color:var(--oc-text-primary)}
  .oc-workbench-actions button:focus-visible{outline:2px solid ${P.accent};outline-offset:2px}
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
  .oc-node-shell-dirty-dot{flex:none;width:6px;height:6px;border-radius:50%;background:${P.warning}}
  .oc-node-shell-meta{color:var(--oc-text-secondary);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-node-shell-status{color:var(--oc-text-secondary);font-size:11px}
  .oc-node-shell-progress{position:relative;height:5px;border-radius:3px;background:var(--oc-bg-control);border:1px solid var(--oc-border-default);overflow:hidden;display:none}
  .oc-node-shell-progress[data-active="true"]{display:block}
  .oc-node-shell-progress>span{display:block;height:100%;background:${P.accent};width:0%;transition:width .15s ease}
  .oc-node-shell-open{margin-top:auto;padding:6px 10px;border-radius:6px;background:${P.accent};border:1px solid ${P.accent};color:#fff;font-weight:600;cursor:pointer;transition:filter .15s ease}
  .oc-node-shell-open:hover{filter:brightness(1.12)}
  .oc-node-shell-open:focus-visible{outline:2px solid ${P.accent};outline-offset:2px}
`;
function gt(e = document) {
  if (e.getElementById(st)) return;
  const t = e.createElement("style");
  t.id = st, t.textContent = lr, e.head.append(t);
}
const dr = /* @__PURE__ */ new Set(["director"]);
function fr({ kind: e, title: t, buttonLabel: n, onOpen: r }) {
  gt(document);
  const s = document.createElement("div");
  s.className = "oc-node-shell", s.dataset.shellKind = e;
  const a = document.createElement("img");
  a.className = "oc-node-shell-preview", a.alt = "", a.draggable = !1;
  let o = null;
  dr.has(e) && (o = document.createElement("video"), o.className = "oc-node-shell-preview", o.muted = !0, o.loop = !0, o.playsInline = !0, o.disablePictureInPicture = !0, o.disableRemotePlayback = !0, o.style.display = "none");
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
  const p = document.createElement("span");
  m.append(p);
  const E = document.createElement("button");
  E.type = "button", E.className = "oc-node-shell-open", E.textContent = n ?? "Open";
  const g = document.createElement("span");
  g.className = "oc-node-shell-version", g.textContent = `v${Ut}`, o ? s.append(a, o, g, i, d, l, m, E) : s.append(a, g, i, d, l, m, E);
  const T = new AbortController();
  E.addEventListener("click", (I) => r?.(I), { signal: T.signal });
  function w() {
    o && (o.pause(), o.removeAttribute("src"), o.load(), o.style.display = "none");
  }
  return {
    root: s,
    openButton: E,
    setTitle(I) {
      h.textContent = I ?? "";
    },
    setDirty(I) {
      c.hidden = !I, c.title = I ? M("Unsaved changes") : "";
    },
    setMeta(I) {
      d.textContent = I ?? "";
    },
    setStatus(I) {
      l.textContent = I ?? "";
    },
    // Still-frame path. Composes with setPreviewVideo(): setting one with a
    // value hides+stops the other, and clearing one only drops
    // data-has-preview when the other has nothing showing either.
    setPreview(I) {
      I ? (a.src = I, a.style.display = "block", w(), s.dataset.hasPreview = "true") : (a.removeAttribute("src"), a.style.display = "none", o?.getAttribute("src") || delete s.dataset.hasPreview);
    },
    // Live-looping playblast preview, Director/Monitor shells only -- a
    // no-op on an Extractor shell (no <video> was mounted). See setPreview()
    // for the composition rule between the two.
    setPreviewVideo(I) {
      o && (I ? (a.style.display = "none", o.autoplay = !0, o.src = I, o.style.display = "block", s.dataset.hasPreview = "true", o.play().catch(() => {
      })) : (w(), a.getAttribute("src") || delete s.dataset.hasPreview));
    },
    setProgress(I) {
      if (I == null) {
        m.dataset.active = "false";
        return;
      }
      m.dataset.active = "true";
      const y = Math.max(0, Math.min(1, I));
      p.style.width = `${(y * 100).toFixed(1)}%`;
    },
    dispose() {
      T.abort(), w();
    }
  };
}
const ur = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");
function mr(e) {
  return !!(e.offsetWidth || e.offsetHeight || e.getClientRects?.().length);
}
function hr(e) {
  return [...e.querySelectorAll(ur)].filter(mr);
}
function _r(e) {
  let t = !1, n = null, r = null;
  function s(a) {
    if (a.key !== "Tab") return;
    const o = hr(e);
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
class pr {
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
            <button type="button" data-workbench-act="maximize" aria-label="${He(M("Maximize workbench"))}">[ ]</button>
            <button type="button" data-workbench-act="close" aria-label="${He(M("Close workbench"))}">x</button>
          </div>
        </header>
        <div class="oc-workbench-content"></div>
      </section>`, this.backdrop = n, this.window = n.querySelector(".oc-workbench-window"), this.content = n.querySelector(".oc-workbench-content"), this.setTitle(this.title), this.content.append(t), document.body.append(n), this.abort = new AbortController();
    const { signal: s } = this.abort;
    n.querySelector('[data-workbench-act="close"]')?.addEventListener("click", () => {
      this.requestClose("button");
    }, { signal: s }), n.querySelector('[data-workbench-act="maximize"]')?.addEventListener("click", () => this.setMaximized(!this._maximized), { signal: s }), n.addEventListener("keydown", (a) => {
      a.key === "Escape" && (a.stopPropagation(), this.requestClose("escape"));
    }, { signal: s, capture: !0 }), window.addEventListener("resize", () => this.onResize?.(), { signal: s }), this.focusTrap = _r(this.window), this.focusTrap.activate(), this.window.focus(), requestAnimationFrame(() => this.onResize?.());
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
    n && (n.hidden = !t, n.title = t ? M("Unsaved changes") : "");
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
class gr {
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
const Me = new gr();
function br(e) {
  for (const t of ["state_json", "recording_path", "card_asset"]) {
    const n = e.widgets?.find((r) => r.name === t);
    n && (n.computeSize = () => [0, -4], n.draw = () => {
    }, n.hidden = !0, n.options = { ...n.options || {}, hideInVueNodes: !0 });
  }
}
function q(e) {
  const t = e.getSnapshot(), n = [];
  t.fps && n.push(`${t.fps} fps`), t.durationSeconds && n.push(`${t.durationSeconds.toFixed(1)} s`), t.width && t.height && n.push(`${t.width}x${t.height}`), e.shell?.setTitle(t.sceneName || M("OmniCam Director")), e.shell?.setDirty(t.isDirty), e.shell?.setMeta(n.join("  |  ")), e.shell?.setStatus(
    `${t.cameraCount} ${M("cameras")}  |  ${t.objectCount} ${M("objects")}`
  ), e.activeWorkbenchHost?.setTitle(t.sceneName || M("OmniCam Director")), e.activeWorkbenchHost?.setDirty(t.isDirty), e.previewVideoUrl ? e.shell?.setPreviewVideo(e.previewVideoUrl) : (e.shell?.setPreviewVideo(null), e.shell?.setPreview(t.previewDataUrl ?? null));
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
    s.drawImage(n, 0, 0, at, ot), e.previewDataUrl = r.toDataURL("image/webp", 0.7), q(e);
  } catch (n) {
    console.warn("[OmniCam] Director preview capture failed", n);
  }
}
function it(e, t) {
  try {
    const n = Lt(ye, e.node);
    if (n) {
      e.previewVideoUrl = n.url, q(e);
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
async function wr(e, t) {
  return Me.open({
    key: ct(e.node),
    nodeId: e.node.id,
    opener: t,
    createSession: async () => {
      const n = ++e.workbenchGeneration, { openDirectorWorkbench: r, closeDirectorWorkbench: s } = await import("./chunk-DEdNyiJv.js").then((c) => c.h);
      if (e.disposed || n !== e.workbenchGeneration) return null;
      const a = r(e);
      e.pendingUpstreamResync && (e.pendingUpstreamResync = !1, a.syncUpstreamInputs?.());
      const o = ct(e.node), i = new pr({
        kind: "director",
        nodeId: e.node.id,
        title: e.getSnapshot().sceneName || M("OmniCam Director"),
        onRequestClose: (c) => Me.close(o, c),
        onResize: () => a.scheduleResizeAndRender?.()
      });
      return i.mount(a.root), e.activeWorkbenchHost = i, i.setDirty(e.isDirty), {
        key: o,
        nodeId: e.node.id,
        host: i,
        close: async () => a.recording ? (a.setStatus?.(M("Cannot close Director while a playblast is recording")), !1) : (a.serialize?.(), it(e, a), s(a), e.activeWorkbenchHost === i && (e.activeWorkbenchHost = null), i.dispose(), !0),
        dispose: () => {
          it(e, a), s(a), e.activeWorkbenchHost === i && (e.activeWorkbenchHost = null), i.dispose();
        }
      };
    }
  });
}
function Ar(e) {
  if (e.__majoorOmniCamDirectorRuntime) return e.__majoorOmniCamDirectorRuntime;
  const t = new Pt(e, { app: bt, api: ye });
  tr(t);
  try {
    t.agentBridge = cr(t, e, ye);
  } catch (m) {
    console.warn("[OmniCam] Agent bridge unavailable", m);
  }
  br(e);
  const n = fr({
    kind: "director",
    title: M("OmniCam Director"),
    buttonLabel: M("OPEN DIRECTOR"),
    onOpen: (m) => {
      wr(t, m.currentTarget);
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
  e.onConfigure = function(...m) {
    s?.apply(this, m), r();
  };
  const a = e.onAfterGraphConfigured;
  e.onAfterGraphConfigured = function(...m) {
    a?.apply(this, m), r();
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
const zr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attachDirectorShell: Ar
}, Symbol.toStringTag, { value: "Module" }));
export {
  Sr as C,
  Bt as E,
  ft as S,
  f as U,
  In as a,
  Te as b,
  fn as c,
  Mr as d,
  $r as e,
  Fr as f,
  Pr as g,
  Or as h,
  Dn as i,
  Br as j,
  Cn as k,
  Lr as l,
  Rr as m,
  Dr as n,
  Ne as o,
  Cr as p,
  zr as q,
  Ur as r,
  he as s,
  jr as w
};
