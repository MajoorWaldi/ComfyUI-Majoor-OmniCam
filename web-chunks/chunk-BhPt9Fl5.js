import { app as St } from "../../scripts/app.js";
import { api as Oe } from "../../scripts/api.js";
import { s as le, a as ue, c as Rt, d as ze, b as Ot, e as be, f as Ct, l as Ge, n as ve, g as Ye, h as re, m as ye, I as ge, D as Mt, r as jt, p as Dt, t as Ut, i as Lt, j as Bt, k as Pt, w as xt, o as qe, q as Ft, u as $t, T as U, v as C } from "./chunk-Czpt4cKc.js";
import { i as de, s as zt, w as Ht } from "./chunk-D0SL7x0a.js";
import { H as Qe, O as Vt } from "./chunk-CUnIPhgW.js";
import { e as Xe, d as Kt } from "./chunk-DEF5LsU5.js";
function Ze(t, e, n = "success") {
  if (!e || t?.disposed || t?.runtime?.disposed) return !1;
  const s = (t?.app || t?.runtime?.app)?.extensionManager?.toast;
  if (!s) return !1;
  const a = ["success", "error", "warning", "info"].includes(n) ? n : "info";
  try {
    if (typeof s[a] == "function") s[a](String(e));
    else if (typeof s.add == "function")
      s.add({
        severity: a === "warning" ? "warn" : a,
        summary: "OmniCam",
        detail: String(e),
        life: a === "error" ? 8e3 : 5e3,
        closable: !0
      });
    else return !1;
    return !0;
  } catch {
    return !1;
  }
}
class Wt {
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
function z(t, e) {
  return t.widgets?.find((n) => n.name === e) ?? null;
}
class Jt extends EventTarget {
  constructor(e, { app: n, api: r } = {}) {
    super(), this.app = n, this.api = r, this.node = e, this.disposed = !1, this.workbench = null, this.pendingUiDirtyMask = 0, this.serializeScheduled = !1, this.serializeFrame = null, this.directorApi = null, this.agentBridge = null, this.workbenchGeneration = 0, this.pendingUpstreamResync = !1, this.stateWidget = z(e, "state_json"), this.recordingWidget = z(e, "recording_path"), this.cardWidget = z(e, "card_asset"), this.widthWidget = z(e, "width"), this.heightWidget = z(e, "height"), this.fpsWidget = z(e, "fps"), this.durationWidget = z(e, "duration_seconds"), this.modeWidget = z(e, "render_mode");
    let s = null;
    try {
      s = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
    }
    this.state = le(s), this.sceneBaseline = this.stateWidget?.value || JSON.stringify(this.state), this.sceneName = this.state.metadata?.scene_name || "", this.frame = 0, this.camera = ue(this.state, 0), this.directorRevision = 0, this.renderRevision = 0, this.previewDataUrl = null, this.previewVideoUrl = null, this.history = new Wt({
      capture: () => this.workbench?.captureHistorySnapshot?.() ?? JSON.stringify({ state: this.state, frame: this.frame }),
      restore: (a) => {
        if (this.workbench) return this.workbench.restoreHistorySnapshot(a);
        const i = JSON.parse(a);
        this.state = le(i.state), de(this), this.frame = Rt(i.frame, 0, this.state.duration_frames - 1), this.camera = ue(this.state, this.frame);
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
    e && (cancelAnimationFrame(this.serializeFrame), this.serializeScheduled = !1), zt(this);
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
    de(this);
    let e = null;
    try {
      e = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
    }
    this.state = le(e), this.camera = ue(this.state, Math.min(this.frame, this.state.duration_frames - 1)), this.sceneBaseline = this.stateWidget?.value ?? this.sceneBaseline, this.sceneName = this.state.metadata?.scene_name || "", this.dispatchEvent(new CustomEvent("upstreamchange", { detail: { reason: "restore" } }));
  }
  /** Apply a state mutation headlessly, whether or not a workbench is open. */
  mutate(e, { reason: n = "mutation", dirty: r = 0 } = {}) {
    e(this.state), de(this), this.scheduleSerialize(n), r && this.requestUiUpdate(r, n);
  }
  replaceState(e, { reason: n = "replace" } = {}) {
    this.state = le(e), de(this), this.sceneName = this.state.metadata?.scene_name || "", this.scheduleSerialize(n), this.dispatchEvent(new CustomEvent("upstreamchange", { detail: { reason: n } }));
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
const V = 1, et = 50, B = 120, X = 160, Gt = Object.freeze(["perspective", "orthographic"]), p = Object.freeze({
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
}), Et = Object.freeze(Object.values(p)), S = Object.freeze({
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
}), Yt = Object.freeze(Object.values(S));
class f extends Error {
  constructor(e, n, r = null, s = null) {
    super(n), this.name = "DirectorApiError", this.code = e, this.operationIndex = r, this.details = s;
  }
}
const qt = /* @__PURE__ */ new Set(["good", "warning", "bad", "unknown"]);
function Qt(t, e) {
  const n = Math.max(0, Math.floor(Number(e) || 0)), r = Array.from({ length: n }, (a, i) => ({ frame: i, state: "unknown", score: null })), s = t?.solve_health_v1;
  if (!s || !Array.isArray(s.frames)) return r;
  for (const a of s.frames) {
    const i = Number(a?.frame);
    if (!Number.isInteger(i) || i < 0 || i >= r.length) continue;
    const o = qt.has(a?.state) ? a.state : "unknown", l = a?.score;
    let m = null;
    if (l != null) {
      const d = Number(l);
      m = Number.isFinite(d) ? Math.max(0, Math.min(1, d)) : null;
    }
    r[i] = { frame: i, state: o, score: m };
  }
  return r;
}
const Xt = 25, tt = 100;
function Z(t, e) {
  const n = t?.offset === void 0 ? 0 : Number(t.offset), r = t?.limit === void 0 ? Xt : Number(t.limit);
  if (!Number.isInteger(n) || n < 0)
    throw new f(
      "BAD_QUERY",
      "offset must be a non-negative integer"
    );
  if (!Number.isInteger(r) || r < 1 || r > tt)
    throw new f(
      "BAD_QUERY",
      `limit must be between 1 and ${tt}`
    );
  return {
    offset: n,
    limit: r,
    end: Math.min(e, n + r)
  };
}
function Ie(t) {
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
function Zt(t) {
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
function H(t) {
  return typeof structuredClone == "function" ? structuredClone(t) : JSON.parse(JSON.stringify(t));
}
function en(t) {
  return Number.isInteger(t.directorRevision) ? Math.max(0, t.directorRevision) : 0;
}
function O(t, e) {
  return {
    ...e,
    revision: en(t)
  };
}
function tn(t, e) {
  const n = t.state || {};
  switch (e?.type) {
    case S.SCENE_GET:
      return O(t, {
        version: 1,
        type: e.type,
        scene: H({
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
    case S.SCENE_SUMMARY: {
      const r = n.objects || [], s = n.sequence?.cuts || n.cuts || [];
      return O(t, {
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
    case S.CAMERA_GET: {
      const r = e.cameraId || n.active_camera_id, s = (n.cameras || []).find((a) => a.id === r);
      if (!s) throw new f("UNKNOWN_CAMERA", `Unknown camera: ${r}`);
      return O(t, { version: 1, type: e.type, camera: H(s) });
    }
    case S.CAMERA_LIST: {
      const r = n.cameras || [], { offset: s, limit: a, end: i } = Z(e, r.length);
      return O(t, {
        version: 1,
        type: e.type,
        items: r.slice(s, i).map(Zt),
        total: r.length,
        offset: s,
        limit: a
      });
    }
    case S.TIMELINE_GET:
      return O(t, {
        version: 1,
        type: e.type,
        timeline: H({
          frame: t.frame ?? 0,
          duration_frames: n.duration_frames,
          fps: n.fps,
          playback_range: Array.isArray(n.playback_range) ? n.playback_range : null
        })
      });
    case S.SELECTION_GET:
      return O(t, {
        version: 1,
        type: e.type,
        selection: {
          entity: t.selectedEntity ?? null,
          objectId: t.selectedObjectId ?? null,
          objectIds: [...t.selectedObjectIds || []],
          keyFrame: t.selectedKeyFrame ?? null
        }
      });
    case S.HEALTH_GET:
      return O(t, {
        version: 1,
        type: e.type,
        frames: Qt(n.metadata, n.duration_frames)
      });
    case S.ASSET_LIST: {
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
      return O(t, { version: 1, type: e.type, items: H(s), total: s.length });
    }
    case S.ASSET_GET: {
      const r = (n.objects || []).find((s) => s.id === e.objectId);
      if (!r) throw new f("UNKNOWN_OBJECT", `Unknown object: ${e.objectId}`);
      return O(t, {
        version: 1,
        type: e.type,
        asset: H({
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
    case S.CHARACTER_GET_RIG: {
      const r = (n.objects || []).find((a) => a.id === e.objectId);
      if (!r) throw new f("UNKNOWN_OBJECT", `Unknown object: ${e.objectId}`);
      const s = r.character || null;
      return O(t, {
        version: 1,
        type: e.type,
        rig: H({
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
    case S.CHARACTER_GET_POSE: {
      const r = (n.objects || []).find((a) => a.id === e.objectId);
      if (!r) throw new f("UNKNOWN_OBJECT", `Unknown object: ${e.objectId}`);
      const s = r.character?.pose || {};
      return O(t, {
        version: 1,
        type: e.type,
        pose: H({
          objectId: r.id,
          preset_id: s.preset_id || "neutral",
          root_offset: Array.isArray(s.root_offset) ? s.root_offset : [0, 0, 0],
          joints: s.joints || {},
          has_motion: !!r.character?.motion
        })
      });
    }
    case S.OBJECT_LIST: {
      const r = n.objects || [], { offset: s, limit: a, end: i } = Z(e, r.length);
      return O(t, {
        version: 1,
        type: e.type,
        items: r.slice(s, i).map(Ie),
        total: r.length,
        offset: s,
        limit: a
      });
    }
    case S.OBJECT_GET: {
      const r = (n.objects || []).find((s) => s.id === e.objectId);
      if (!r) throw new f("UNKNOWN_OBJECT", `Unknown object: ${e.objectId}`);
      return O(t, {
        version: 1,
        type: e.type,
        object: H({
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
    case S.OBJECT_SEARCH: {
      const r = String(e.text || "").trim().toLowerCase(), s = Array.isArray(e.tags) ? e.tags.map((_) => String(_).toLowerCase()) : [], a = e.asset_kind !== void 0 ? e.asset_kind : null, i = e.type_ !== void 0 ? e.type_ : e.objectType !== void 0 ? e.objectType : null, o = typeof e.enabled == "boolean" ? e.enabled : null, l = (_) => {
        if (r && ![_.id, _.name || "", ...Array.isArray(_.tags) ? _.tags : []].map((b) => String(b).toLowerCase()).some((b) => b.includes(r)))
          return !1;
        if (s.length) {
          const A = (Array.isArray(_.tags) ? _.tags : []).map((b) => String(b).toLowerCase());
          if (!s.every((b) => A.includes(b))) return !1;
        }
        return !(a !== null && _.asset_kind !== a || i !== null && _.type !== i || o !== null && _.enabled !== !1 !== o);
      }, m = (n.objects || []).filter(l), { offset: d, limit: c, end: h } = Z(e, m.length);
      return O(t, {
        version: 1,
        type: e.type,
        items: m.slice(d, h).map(Ie),
        total: m.length,
        offset: d,
        limit: c
      });
    }
    case S.CHARACTER_LIST: {
      const r = (n.objects || []).filter((o) => o.asset_kind === "character"), { offset: s, limit: a, end: i } = Z(e, r.length);
      return O(t, {
        version: 1,
        type: e.type,
        items: r.slice(s, i).map((o) => ({
          ...Ie(o),
          has_motion: !!o.character?.motion,
          pose_preset: o.character?.pose?.preset_id || null
        })),
        total: r.length,
        offset: s,
        limit: a
      });
    }
    case S.SHOT_LIST: {
      const r = n.sequence?.cuts || n.cuts || [], s = Math.max(0, (n.duration_frames || 1) - 1), a = r.map((m, d) => ({
        index: d,
        start: m.start,
        end: d + 1 < r.length ? r[d + 1].start - 1 : s,
        camera_id: m.camera_id
      })), { offset: i, limit: o, end: l } = Z(e, a.length);
      return O(t, {
        version: 1,
        type: e.type,
        items: a.slice(i, l),
        total: a.length,
        offset: i,
        limit: o
      });
    }
    case S.KEYFRAME_LIST: {
      const r = e.cameraId || n.active_camera_id, s = (n.cameras || []).find((m) => m.id === r);
      if (!s) throw new f("UNKNOWN_CAMERA", `Unknown camera: ${r}`);
      const a = s.keyframes || [], { offset: i, limit: o, end: l } = Z(e, a.length);
      return O(t, {
        version: 1,
        type: e.type,
        cameraId: s.id,
        items: a.slice(i, l).map((m) => ({
          frame: m.frame,
          interpolation: m.interpolation,
          position: Array.isArray(m.camera?.position) ? [...m.camera.position] : [0, 0, 0]
        })),
        total: a.length,
        offset: i,
        limit: o
      });
    }
    default:
      throw new f("UNKNOWN_QUERY", `Unsupported query: ${e?.type}`);
  }
}
const wt = /* @__PURE__ */ new Set([
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
function Te(t, e, n = "") {
  const r = String(n || "").trim().replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 120);
  if (r) {
    if (t.has(r))
      throw new f("DUPLICATE_ID", `${r} already exists`);
    return r;
  }
  let s = 1, a = `${e}_${s}`;
  for (; t.has(a); )
    s += 1, a = `${e}_${s}`;
  return a;
}
function nn(t) {
  const e = t === "ground", n = t === "human", r = t === "card", s = t === "sun_light", a = t === "point_light", i = t === "spot_light";
  let o;
  e ? o = [12, 0.1, 12] : n ? o = [0.7, 1.8, 0.4] : r ? o = [2, 3] : o = [1.5, 1.5, 1.5];
  let l = [0, 0, 0], m = [0, 0, 0], d = "#8c929b", c, h, _, A;
  return s ? (l = [5, 8.5, 4], m = [-55, 35, 0], d = "#fff6ec", c = 2.2, h = !0) : a ? (l = [0, 3, 0], d = "#ffffff", c = 2, h = !1) : i && (l = [0, 4, 0], m = [-60, 0, 0], d = "#ffffff", c = 3, _ = 45, A = 0.25, h = !0), {
    position: l,
    rotation: m,
    size: o,
    color: d,
    material_mode: e ? "checker" : "textured",
    ...s || a || i ? { light_role: "auto" } : {},
    ...c !== void 0 ? { intensity: c } : {},
    ...h !== void 0 ? { cast_shadow: h } : {},
    ..._ !== void 0 ? { cone_angle: _ } : {},
    ...A !== void 0 ? { penumbra: A } : {}
  };
}
function rn(t, e) {
  t.cameras ||= [];
  const n = new Set(t.cameras.map((i) => i.id)), r = Te(n, "camera", e.id), s = { ...Ot(), ...e.camera || {} }, a = {
    id: r,
    name: e.name || r,
    color: "#4aa3ef",
    locked: !1,
    muted: !1,
    solo: !1,
    camera: s,
    keyframes: [{ frame: 0, camera: be(s), interpolation: e.interpolation || "ease" }]
  };
  return t.cameras.push(a), { cameraId: r };
}
function sn(t, e) {
  const n = (t.cameras || []).find((i) => i.id === e.cameraId);
  if (!n) throw new f("UNKNOWN_CAMERA", `${e.cameraId} does not exist`);
  const r = new Set(t.cameras.map((i) => i.id)), s = Te(r, "camera", e.id), a = JSON.parse(JSON.stringify(n));
  return a.id = s, a.name = e.name || `${n.name || n.id} copy`, t.cameras.push(a), { cameraId: s };
}
function an(t, e) {
  const n = t.cameras || [], r = n.findIndex((a) => a.id === e.cameraId);
  if (r === -1) throw new f("UNKNOWN_CAMERA", `${e.cameraId} does not exist`);
  if (n.length <= 1) throw new f("LAST_CAMERA", "cannot delete the only camera");
  if (n[r].locked) throw new f("ENTITY_LOCKED", `${e.cameraId} is locked`);
  if ((t.sequence?.cuts || []).some((a) => a.camera_id === e.cameraId))
    throw new f("CAMERA_IN_USE", `${e.cameraId} is referenced by a cut`);
  return n.splice(r, 1), t.active_camera_id === e.cameraId && (t.active_camera_id = n[0].id), t.playblast_camera_id === e.cameraId && (t.playblast_camera_id = n[0].id), { cameraId: e.cameraId };
}
function on(t, e) {
  const n = (t.cameras || []).find((r) => r.id === e.cameraId);
  if (!n) throw new f("UNKNOWN_CAMERA", `${e.cameraId} does not exist`);
  return n.name = String(e.name || "").trim().slice(0, 80) || n.name, { cameraId: n.id };
}
function cn(t, e) {
  const n = "__sequence__";
  if (e.cameraId === n) {
    if (!(t.sequence?.cuts || []).length)
      throw new f("NO_CUTS", "the sequence has no cuts to play back");
    return t.playblast_camera_id = n, { cameraId: n };
  }
  const r = (t.cameras || []).find((s) => s.id === e.cameraId);
  if (!r) throw new f("UNKNOWN_CAMERA", `${e.cameraId} does not exist`);
  return t.playblast_camera_id = r.id, { cameraId: r.id };
}
function ln(t, e) {
  if (!wt.has(e.objectType))
    throw new f("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${e.objectType}`);
  t.objects ||= [];
  const n = new Set(t.objects.map((i) => i.id)), r = Te(n, e.objectType, e.id), s = nn(e.objectType), a = {
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
function dn(t, e) {
  const n = (t.objects || []).find((l) => l.id === e.objectId);
  if (!n) throw new f("UNKNOWN_OBJECT", `${e.objectId} does not exist`);
  const r = new Set(t.objects.map((l) => l.id)), s = Te(r, n.type || "object", e.id), a = Array.isArray(e.offset) ? e.offset : [0.35, 0, 0.35], i = JSON.parse(JSON.stringify(n));
  i.id = s, i.name = e.name || `${n.name || n.id} copy`, i.locked = !1;
  const o = Array.isArray(n.position) ? n.position : [0, 0, 0];
  return i.position = [o[0] + a[0], o[1] + a[1], o[2] + a[2]], t.objects.push(i), { objectId: s, resourceRefresh: !!n.asset_id };
}
function un(t, e) {
  const n = t.objects || [], r = n.findIndex((a) => a.id === e.objectId);
  if (r === -1) throw new f("UNKNOWN_OBJECT", `${e.objectId} does not exist`);
  const s = n[r];
  if (s.id === "subject") throw new f("PROTECTED_OBJECT", "the subject object cannot be deleted");
  if (s.locked) throw new f("ENTITY_LOCKED", `${e.objectId} is locked`);
  for (const a of n)
    a.parent_id === e.objectId && (a.parent_id = null);
  return n.splice(r, 1), { objectId: e.objectId, resourceRefresh: !!s.asset_id };
}
function fn(t, e) {
  const n = (t.objects || []).find((r) => r.id === e.objectId);
  if (!n) throw new f("UNKNOWN_OBJECT", `${e.objectId} does not exist`);
  return n.name = String(e.name || "").trim().slice(0, 80) || n.name, { objectId: n.id };
}
function mn(t, e) {
  const n = (t.objects || []).find((o) => o.id === e.objectId);
  if (!n) throw new f("UNKNOWN_OBJECT", `${e.objectId} does not exist`);
  if (e.parentId === null || e.parentId === void 0)
    return n.parent_id = null, { objectId: n.id };
  if (e.parentId === e.objectId)
    throw new f("INVALID_PARENT", "an object cannot be its own parent");
  const r = (t.objects || []).find((o) => o.id === e.parentId);
  if (!r) throw new f("UNKNOWN_OBJECT", `${e.parentId} does not exist`);
  const s = new Map(t.objects.map((o) => [o.id, o]));
  let a = r;
  const i = /* @__PURE__ */ new Set();
  for (; a; ) {
    if (a.id === e.objectId)
      throw new f("INVALID_PARENT", "assigning this parent would create a cycle");
    if (i.has(a.id)) break;
    i.add(a.id), a = a.parent_id ? s.get(a.parent_id) : null;
  }
  return n.parent_id = e.parentId, { objectId: n.id };
}
function hn(t, e) {
  t.sequence ||= ze();
  const n = t.sequence.cuts ||= [], r = Math.max(0, (t.duration_frames || 1) - 1);
  if (!Number.isInteger(e.start) || e.start < 0 || e.start > r)
    throw new f("FRAME_OUT_OF_RANGE", `cut start must be within 0..${r}`);
  if (!(t.cameras || []).find((i) => i.id === e.cameraId)) throw new f("UNKNOWN_CAMERA", `${e.cameraId} does not exist`);
  const a = n.find((i) => i.start === e.start);
  return a ? a.camera_id = e.cameraId : n.push({ start: e.start, camera_id: e.cameraId }), n.sort((i, o) => i.start - o.start), t.sequence.enabled = !0, { start: e.start, cameraId: e.cameraId };
}
function pn(t, e) {
  t.sequence ||= ze();
  const n = t.sequence.cuts || [], r = n.findIndex((s) => s.start === e.start);
  if (r === -1) throw new f("UNKNOWN_CUT", `no cut starts at frame ${e.start}`);
  return n.splice(r, 1), n.length && (n[0].start = 0), t.sequence.enabled = n.length > 0, { start: e.start };
}
function _n(t, e) {
  t.sequence ||= ze();
  const r = (t.sequence.cuts || []).find((a) => a.start === e.start);
  if (!r) throw new f("UNKNOWN_CUT", `no cut starts at frame ${e.start}`);
  if (!(t.cameras || []).find((a) => a.id === e.cameraId)) throw new f("UNKNOWN_CAMERA", `${e.cameraId} does not exist`);
  return r.camera_id = e.cameraId, { start: e.start, cameraId: e.cameraId };
}
const He = [0, 1, 0], Ce = [
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
], Gr = {
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
function gn(t, e) {
  const n = [...t.position], r = Array.isArray(e) ? [...e] : [...t.target], s = Ct(r, n), a = Ge(s) > 1e-9 ? ve(s) : [0, 0, -1];
  let i = Ye(a, He);
  Ge(i) < 1e-6 && (i = [1, 0, 0]), i = ve(i);
  const o = ve(Ye(i, a));
  return { position: n, target: r, forward: a, right: i, up: o };
}
function bn(t) {
  return {
    fov: t.fov,
    roll: t.roll || 0,
    zoom: t.zoom || 1,
    near: t.near,
    far: t.far,
    camera_type: t.camera_type || "perspective"
  };
}
function En(t) {
  return [
    { position: t.position, target: t.target },
    { position: t.position, target: t.target }
  ];
}
function nt(t, e, n) {
  const r = n === "out" ? -1 : 1, s = re(t.position, ye(t.forward, r * e));
  return [
    { position: t.position, target: t.target },
    { position: s, target: t.target }
  ];
}
function rt(t, e, n) {
  const r = n === "right" ? 1 : -1, s = ye(t.right, r * e);
  return [
    { position: t.position, target: t.target },
    { position: re(t.position, s), target: re(t.target, s) }
  ];
}
function st(t, e, n) {
  const s = ye(He, (n === "down" ? -1 : 1) * e);
  return [
    { position: t.position, target: t.target },
    { position: re(t.position, s), target: re(t.target, s) }
  ];
}
function at(t, e, n) {
  const r = n === "down" ? -1 : 1, s = re(t.position, ye(He, r * e));
  return [
    { position: t.position, target: t.target },
    { position: s, target: t.target }
  ];
}
function fe(t, { degrees: e = 180, direction: n = "cw", radius: r, radiusEnd: s, heightOffset: a = 0, samples: i = 5, close: o = !1 } = {}) {
  const l = t.target, m = t.position[0] - l[0], d = t.position[2] - l[2], c = Math.hypot(m, d) || 1e-6, h = Math.atan2(d, m), _ = Number.isFinite(r) ? r : c, A = Number.isFinite(s) ? s : _, b = n === "ccw" ? 1 : -1, v = Math.abs(e) * Math.PI / 180 * b, g = Math.max(2, Math.round(i)), L = t.position[1] + a, I = [];
  for (let y = 0; y < g; y += 1) {
    const E = o ? y / g : y / (g - 1), N = h + v * E, M = _ + (A - _) * E;
    I.push({
      position: [l[0] + Math.cos(N) * M, L, l[2] + Math.sin(N) * M],
      target: [...l]
    });
  }
  return I;
}
function wn({ type: t, camera: e, target: n, startFrame: r, endFrame: s, params: a = {} } = {}) {
  if (!Ce.includes(t)) return { ok: !1, reason: "unknown_preset" };
  if (!e || !Array.isArray(e.position) || !Array.isArray(e.target)) return { ok: !1, reason: "invalid_camera" };
  const i = Math.round(Number(r)), o = Math.round(Number(s));
  if (!Number.isFinite(i) || !Number.isFinite(o) || o <= i) return { ok: !1, reason: "invalid_range" };
  const l = gn(e, n), m = Number(a.distance) > 0 ? Number(a.distance) : 1, d = (b, v, g) => ({
    degrees: Number(a.degrees) || b,
    direction: v,
    radius: Number.isFinite(Number(a.radius)) ? Number(a.radius) : void 0,
    heightOffset: Number(a.heightOffset) || 0,
    samples: Number(a.samples) || g
  });
  let c;
  switch (t) {
    case "static":
      c = En(l);
      break;
    case "dolly_in":
      c = nt(l, m, "in");
      break;
    case "dolly_out":
      c = nt(l, m, "out");
      break;
    case "truck_left":
      c = rt(l, m, "left");
      break;
    case "truck_right":
      c = rt(l, m, "right");
      break;
    case "pedestal_up":
      c = st(l, m, "up");
      break;
    case "pedestal_down":
      c = st(l, m, "down");
      break;
    case "crane_up":
      c = at(l, m, "up");
      break;
    case "crane_down":
      c = at(l, m, "down");
      break;
    case "arc_left":
      c = fe(l, d(45, "ccw", 5));
      break;
    case "arc_right":
      c = fe(l, d(45, "cw", 5));
      break;
    case "orbit":
      c = fe(l, { ...d(180, a.direction === "ccw" ? "ccw" : "cw", 5), close: !!a.close });
      break;
    case "spiral":
      c = fe(l, {
        ...d(360, a.direction === "ccw" ? "ccw" : "cw", 8),
        radiusEnd: Number.isFinite(Number(a.radiusEnd)) ? Number(a.radiusEnd) : void 0
      });
      break;
    default:
      return { ok: !1, reason: "unknown_preset" };
  }
  if (o - i + 1 < c.length) return { ok: !1, reason: "insufficient_frame_slots" };
  const h = c.map((b, v) => c.length <= 1 ? i : Math.round(i + (o - i) * v / (c.length - 1)));
  for (let b = 1; b < h.length; b += 1) h[b] <= h[b - 1] && (h[b] = h[b - 1] + 1);
  for (let b = h.length - 1; b > 0; b -= 1) h[b] > o - (h.length - 1 - b) && (h[b] = o - (h.length - 1 - b));
  h[0] = i, h[h.length - 1] = o;
  const _ = bn(e);
  return { ok: !0, keyframes: c.map((b, v) => ({
    frame: h[v],
    interpolation: "smooth",
    camera: { position: b.position, target: b.target, ..._ }
  })) };
}
const An = 2048;
function yn(t, e) {
  const n = t._directorApiTxIds ||= /* @__PURE__ */ new Set();
  for (n.has(e) && n.delete(e), n.add(e); n.size > An; )
    n.delete(n.values().next().value);
}
function Tn(t, e) {
  return !!t._directorApiTxIds?.has(e);
}
const J = (t) => typeof t == "number" && Number.isFinite(t);
function k(t, e, n) {
  if (!Array.isArray(t) || t.length !== 3 || !t.every(J))
    throw new f("BAD_VECTOR", `${e} must be [x,y,z] of finite numbers`, n);
}
function j(t, e, n) {
  if (!Number.isInteger(t) || t < 0)
    throw new f("BAD_FRAME", `${e} must be a non-negative integer frame`, n);
}
function w(t, e, n, r) {
  if (typeof t != "string" || t.length === 0)
    throw new f("BAD_ID", `${e} must be a non-empty string`, n);
  if (r !== void 0 && t.length > r)
    throw new f("BAD_ID", `${e} exceeds ${r} characters`, n);
}
function ne(t, e, n) {
  if (!J(t))
    throw new f("BAD_VALUE", `${e} must be a finite number`, n);
}
function it(t, e, n) {
  if (!Array.isArray(t) || t.length === 0 || !t.every((r) => Number.isInteger(r) && r >= 0))
    throw new f("BAD_VALUE", `${e} must be a non-empty array of non-negative integer frames`, n);
}
const vn = /* @__PURE__ */ new Set(["translate", "rotate", "scale"]), In = /* @__PURE__ */ new Set([
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
function kn(t, e) {
  for (const n of Object.keys(t))
    if (!In.has(n))
      throw new f("BAD_VALUE", `camera.create: unsupported camera field "${n}"`, e);
  if (t.position !== void 0 && k(t.position, "camera.position", e), t.target !== void 0 && k(t.target, "camera.target", e), t.up !== void 0 && k(t.up, "camera.up", e), t.fov !== void 0 && (ne(t.fov, "camera.fov", e), t.fov < 1 || t.fov > 179))
    throw new f("BAD_VALUE", "camera.fov must be within 1..179", e);
  if (t.roll !== void 0 && ne(t.roll, "camera.roll", e), t.zoom !== void 0 && (ne(t.zoom, "camera.zoom", e), t.zoom <= 0))
    throw new f("BAD_VALUE", "camera.zoom must be > 0", e);
  if (t.near !== void 0 && (ne(t.near, "camera.near", e), t.near <= 0))
    throw new f("BAD_VALUE", "camera.near must be > 0", e);
  if (t.far !== void 0) {
    ne(t.far, "camera.far", e);
    const n = t.near === void 0 ? Mt : t.near;
    if (t.far <= n)
      throw new f("BAD_VALUE", "camera.far must be greater than camera.near", e);
  }
  if (t.camera_type !== void 0 && !Gt.includes(t.camera_type))
    throw new f("BAD_VALUE", `Unsupported camera_type: ${t.camera_type}`, e);
}
function Nn(t, e) {
  if (!t || typeof t != "object" || Array.isArray(t))
    throw new f("BAD_OPERATION", "operation must be an object", e);
  const { type: n } = t;
  if (!Et.includes(n))
    throw new f("UNKNOWN_OPERATION", `Unknown operation type: ${n}`, e);
  switch (n) {
    case p.ASSET_INSTANTIATE: {
      const r = t.asset;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new f("BAD_VALUE", "asset.instantiate needs a resolved asset object", e);
      if (w(r.id, "asset.id", e), w(r.kind, "asset.kind", e), String(r.id).length > 120 || String(r.kind).length > 32)
        throw new f("BAD_VALUE", "asset.id / asset.kind exceed their bounds", e);
      if (r.tags !== void 0 && (!Array.isArray(r.tags) || r.tags.length > 32))
        throw new f("BAD_VALUE", "asset.tags must be a list of at most 32", e);
      if (r.animations !== void 0 && (!Array.isArray(r.animations) || r.animations.length > 256))
        throw new f("BAD_VALUE", "asset.animations must be a list of at most 256", e);
      if (r.rig !== void 0 && r.rig !== null) {
        if (typeof r.rig != "object" || Array.isArray(r.rig))
          throw new f("BAD_VALUE", "asset.rig must be an object", e);
        if (r.rig.bone_map && Object.keys(r.rig.bone_map).length > 128)
          throw new f("BAD_VALUE", "asset.rig.bone_map exceeds 128 entries", e);
      }
      t.point !== void 0 && k(t.point, "point", e), t.id !== void 0 && w(t.id, "id", e);
      break;
    }
    case p.CAMERA_SET_ACTIVE:
      w(t.cameraId, "cameraId", e);
      break;
    case p.CAMERA_SET_LOCKED:
      if (w(t.cameraId, "cameraId", e), typeof t.value != "boolean")
        throw new f("BAD_VALUE", "camera.set_locked needs a boolean value", e);
      break;
    case p.CAMERA_CREATE:
      if (t.id !== void 0 && w(t.id, "id", e, B), t.name !== void 0 && w(t.name, "name", e, X), t.camera !== void 0) {
        if (typeof t.camera != "object" || Array.isArray(t.camera) || t.camera === null)
          throw new f("BAD_VALUE", "camera.create camera must be an object", e);
        kn(t.camera, e);
      }
      if (t.interpolation !== void 0 && !ge.includes(t.interpolation))
        throw new f("BAD_INTERPOLATION", `Unsupported interpolation: ${t.interpolation}`, e);
      break;
    case p.CAMERA_DUPLICATE:
      w(t.cameraId, "cameraId", e, B), t.id !== void 0 && w(t.id, "id", e, B), t.name !== void 0 && w(t.name, "name", e, X);
      break;
    case p.CAMERA_DELETE:
    case p.CAMERA_SET_PLAYBLAST:
      w(t.cameraId, "cameraId", e, B);
      break;
    case p.CAMERA_RENAME:
      w(t.cameraId, "cameraId", e, B), w(t.name, "name", e, X);
      break;
    case p.OBJECT_CREATE:
      if (w(t.objectType, "objectType", e), !wt.has(t.objectType))
        throw new f("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${t.objectType}`, e);
      if (t.asset !== void 0 || t.url !== void 0 || t.path !== void 0)
        throw new f("BAD_VALUE", "object.create does not accept asset/url/path -- use asset.instantiate", e);
      t.id !== void 0 && w(t.id, "id", e, B), t.name !== void 0 && w(t.name, "name", e, X), t.position !== void 0 && k(t.position, "position", e), t.rotation !== void 0 && k(t.rotation, "rotation", e);
      break;
    case p.OBJECT_DUPLICATE:
      w(t.objectId, "objectId", e, B), t.id !== void 0 && w(t.id, "id", e, B), t.name !== void 0 && w(t.name, "name", e, X), t.offset !== void 0 && k(t.offset, "offset", e);
      break;
    case p.OBJECT_DELETE:
      w(t.objectId, "objectId", e, B);
      break;
    case p.OBJECT_RENAME:
      w(t.objectId, "objectId", e, B), w(t.name, "name", e, X);
      break;
    case p.OBJECT_SET_PARENT:
      w(t.objectId, "objectId", e, B), t.parentId !== null && t.parentId !== void 0 && w(t.parentId, "parentId", e, B);
      break;
    case p.CAMERA_TRANSFORM:
      if (t.cameraId !== void 0 && w(t.cameraId, "cameraId", e), t.position !== void 0 && k(t.position, "position", e), t.target !== void 0 && k(t.target, "target", e), t.frame !== void 0 && j(t.frame, "frame", e), t.position === void 0 && t.target === void 0)
        throw new f("EMPTY_OPERATION", "camera.transform needs position and/or target", e);
      break;
    case p.CAMERA_LOOK_AT:
      if (t.cameraId !== void 0 && w(t.cameraId, "cameraId", e), t.point !== void 0 && k(t.point, "point", e), t.objectId !== void 0 && t.objectId !== null && w(t.objectId, "objectId", e), t.point === void 0 && t.objectId === void 0)
        throw new f("EMPTY_OPERATION", "camera.look_at needs a point or an objectId", e);
      break;
    case p.OBJECT_TRANSFORM:
      if (w(t.objectId, "objectId", e), t.position !== void 0 && k(t.position, "position", e), t.rotation !== void 0 && k(t.rotation, "rotation", e), t.scale !== void 0 && k(t.scale, "scale", e), t.position === void 0 && t.rotation === void 0 && t.scale === void 0)
        throw new f("EMPTY_OPERATION", "object.transform needs position, rotation and/or scale", e);
      break;
    case p.OBJECT_SET_ENABLED:
    case p.OBJECT_SET_LOCKED:
      if (w(t.objectId, "objectId", e), typeof t.value != "boolean")
        throw new f("BAD_VALUE", `${n} needs a boolean value`, e);
      break;
    case p.OBJECT_SET_TAGS:
      if (w(t.objectId, "objectId", e), !Array.isArray(t.tags) || t.tags.some((r) => typeof r != "string"))
        throw new f("BAD_VALUE", "object.set_tags needs a string array", e);
      if (t.tags.length > 64)
        throw new f("BAD_VALUE", "object.set_tags: too many tags", e);
      break;
    case p.OBJECT_SET_ANNOTATION:
      if (w(t.objectId, "objectId", e), t.annotation !== null && (typeof t.annotation != "object" || Array.isArray(t.annotation)))
        throw new f("BAD_VALUE", "object.set_annotation needs an object or null", e);
      break;
    case p.CHARACTER_SET_POSE:
      if (w(t.objectId, "objectId", e), t.pose !== null && (typeof t.pose != "object" || Array.isArray(t.pose)))
        throw new f("BAD_VALUE", "character.set_pose needs a pose object or null", e);
      break;
    case p.CHARACTER_SET_JOINT_ROTATION:
      if (w(t.objectId, "objectId", e), w(t.joint, "joint", e), !Array.isArray(t.rotation) || t.rotation.length !== 4 || !t.rotation.every(J))
        throw new f("BAD_QUATERNION", "rotation must be [x,y,z,w] of finite numbers", e);
      break;
    case p.CHARACTER_SET_MOTION: {
      w(t.objectId, "objectId", e);
      const r = t.motion;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new f("BAD_VALUE", "character.set_motion needs a motion object", e);
      w(r.clip_id, "motion.clip_id", e);
      for (const s of ["start_frame", "end_frame", "speed", "offset_seconds"])
        if (r[s] !== void 0 && !J(r[s]))
          throw new f("BAD_VALUE", `motion.${s} must be a finite number`, e);
      if (J(r.start_frame) && J(r.end_frame) && r.end_frame > 0 && r.end_frame <= r.start_frame)
        throw new f("BAD_MOTION_RANGE", "motion end_frame is not after start_frame", e);
      break;
    }
    case p.CHARACTER_CLEAR_MOTION:
      w(t.objectId, "objectId", e);
      break;
    case p.KEYFRAME_UPSERT:
      if (t.cameraId !== void 0 && w(t.cameraId, "cameraId", e), j(t.frame, "frame", e), t.interpolation !== void 0 && !ge.includes(t.interpolation))
        throw new f("BAD_INTERPOLATION", `Unsupported interpolation: ${t.interpolation}`, e);
      if (t.camera !== void 0) {
        if (!t.camera || typeof t.camera != "object")
          throw new f("BAD_VALUE", "keyframe.upsert camera must be an object", e);
        t.camera.position !== void 0 && k(t.camera.position, "camera.position", e), t.camera.target !== void 0 && k(t.camera.target, "camera.target", e);
        for (const r of ["fov", "roll", "zoom", "near", "far"])
          if (t.camera[r] !== void 0 && !J(t.camera[r]))
            throw new f("BAD_VALUE", `camera.${r} must be finite`, e);
      }
      break;
    case p.KEYFRAME_REMOVE:
      t.cameraId !== void 0 && w(t.cameraId, "cameraId", e), j(t.frame, "frame", e);
      break;
    case p.KEYFRAME_SET_INTERPOLATION:
      if (t.cameraId !== void 0 && w(t.cameraId, "cameraId", e), j(t.frame, "frame", e), !ge.includes(t.interpolation))
        throw new f("BAD_INTERPOLATION", `Unsupported interpolation: ${t.interpolation}`, e);
      break;
    case p.TIMELINE_SET_RANGE:
      if (j(t.start, "start", e), j(t.end, "end", e), t.end < t.start)
        throw new f("BAD_RANGE", "range end is before start", e);
      break;
    case p.TIMELINE_SET_DURATION:
      if (!Number.isInteger(t.frames) || t.frames < 1)
        throw new f("BAD_VALUE", "timeline.set_duration needs frames >= 1", e);
      break;
    case p.CUT_UPSERT:
      j(t.start, "start", e), w(t.cameraId, "cameraId", e);
      break;
    case p.CUT_REMOVE:
      j(t.start, "start", e);
      break;
    case p.CUT_SET_CAMERA:
      j(t.start, "start", e), w(t.cameraId, "cameraId", e);
      break;
    case p.CAMERA_PATH_TRANSFORM_KEYS: {
      t.cameraId !== void 0 && w(t.cameraId, "cameraId", e), it(t.frames, "frames", e);
      const r = t.transform;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new f("BAD_VALUE", "camera.path.transform_keys needs a transform object", e);
      if (!vn.has(r.mode))
        throw new f("BAD_VALUE", "transform.mode must be translate, rotate or scale", e);
      r.mode === "translate" ? k(r.delta, "transform.delta", e) : r.mode === "scale" ? k(r.factors, "transform.factors", e) : k(r.rotationDeg, "transform.rotationDeg", e), r.origin !== void 0 && k(r.origin, "transform.origin", e);
      break;
    }
    case p.CAMERA_PATH_INSERT_KEY:
      t.cameraId !== void 0 && w(t.cameraId, "cameraId", e), j(t.leftFrame, "leftFrame", e), j(t.rightFrame, "rightFrame", e), t.t !== void 0 && ne(t.t, "t", e);
      break;
    case p.CAMERA_PATH_DELETE_KEYS:
      t.cameraId !== void 0 && w(t.cameraId, "cameraId", e), it(t.frames, "frames", e);
      break;
    case p.CAMERA_PATH_REDISTRIBUTE_TIMING:
      t.cameraId !== void 0 && w(t.cameraId, "cameraId", e), t.startFrame !== void 0 && j(t.startFrame, "startFrame", e), t.endFrame !== void 0 && j(t.endFrame, "endFrame", e);
      break;
    case p.CAMERA_PATH_APPLY_PRESET:
      if (t.cameraId !== void 0 && w(t.cameraId, "cameraId", e), !Ce.includes(t.presetType))
        throw new f("BAD_VALUE", `presetType must be one of: ${Ce.join(", ")}`, e);
      if (j(t.startFrame, "startFrame", e), j(t.endFrame, "endFrame", e), t.endFrame <= t.startFrame)
        throw new f("BAD_RANGE", "camera.path.apply_preset endFrame must be after startFrame", e);
      if (t.target !== void 0 && k(t.target, "target", e), t.params !== void 0 && (typeof t.params != "object" || Array.isArray(t.params)))
        throw new f("BAD_VALUE", "camera.path.apply_preset params must be an object", e);
      break;
    default:
      throw new f("UNKNOWN_OPERATION", `Unknown operation type: ${n}`, e);
  }
}
function Sn(t, e) {
  if (!e || typeof e != "object" || Array.isArray(e))
    throw new f("BAD_TRANSACTION", "transaction must be an object");
  if (e.version !== V)
    throw new f("UNSUPPORTED_VERSION", `Unsupported API version: ${e.version}`);
  if (typeof e.id != "string" || e.id.length === 0)
    throw new f("BAD_TRANSACTION_ID", "transaction id must be a non-empty string");
  if (Tn(t, e.id))
    throw new f("DUPLICATE_TRANSACTION_ID", `transaction id already used: ${e.id}`);
  if (typeof e.description != "string" || e.description.trim().length === 0)
    throw new f("EMPTY_DESCRIPTION", "transaction description must not be empty");
  if (e.baseRevision !== void 0 && (!Number.isInteger(e.baseRevision) || e.baseRevision < 0))
    throw new f(
      "BAD_REVISION",
      "baseRevision must be a non-negative integer"
    );
  if (!Array.isArray(e.operations))
    throw new f("BAD_OPERATIONS", "operations must be an array");
  if (e.operations.length === 0)
    throw new f("NO_OPERATIONS", "transaction has no operations");
  if (e.operations.length > et)
    throw new f(
      "TOO_MANY_OPERATIONS",
      `transaction has ${e.operations.length} operations (max ${et})`
    );
  return e.operations.forEach((n, r) => Nn(n, r)), {
    version: V,
    id: e.id,
    baseRevision: e.baseRevision,
    description: e.description.trim(),
    operations: e.operations,
    validateOnly: e.validateOnly === !0
  };
}
const u = Object.freeze({
  viewport: 1,
  previews: 2,
  timeline: 4,
  inspector: 8,
  outliner: 16,
  motion: 32,
  status: 64,
  all: 127
});
function Yr(t = 0, e = 0) {
  return (t | e) >>> 0;
}
function qr(t, e) {
  return (t & e) !== 0;
}
const Rn = "omnicam/library", On = "majoor_omnicam/blockout_library", Cn = Object.freeze({
  "omnicam.helper.human_lowpoly": "human",
  "omnicam.helper.null": "null"
});
function Mn(t, e) {
  if (!Array.isArray(t) || t.length < 3) return [...e];
  const n = t.slice(0, 3).map((r) => Number(r));
  return n.every((r) => Number.isFinite(r)) ? n : [...e];
}
function jn(t) {
  return t.file ? `${t.source === "legacy" ? On : Rn}/${t.file} [input]` : "";
}
function ot(t, e, n) {
  const r = t || "asset";
  let s = `${r}_${n}`, a = 2;
  for (; e && e.has(s); ) s = `${r}_${n}_${a++}`;
  return s;
}
function Dn(t) {
  return {
    rig_profile: !!(t.rig && Object.keys(t.rig.bone_map || {}).length) ? t.rig.profile || "omnicam_humanoid_v1" : null,
    pose: { preset_id: "neutral", root_offset: [0, 0, 0], joints: {} },
    motion: null
  };
}
function Un(t, e = {}) {
  if (!t || typeof t != "object" || !t.id)
    throw new Error("compileInstance: an AssetDefinition is required");
  const n = Mn(e.point, [0, 0, 0]), r = String(e.idSeed || Date.now().toString(36)), s = String(t.kind || "prop"), a = s === "character", i = Cn[t.id];
  if (s === "helper" && !t.file && i && i !== "null")
    return {
      id: ot(i, e.existingIds, r),
      type: i,
      name: t.name || i,
      position: n,
      rotation: [0, 0, 0],
      size: [...t.base_size || [1, 1, 1]],
      keyframes: [],
      enabled: !0,
      asset_id: t.id,
      asset_kind: s,
      tags: [...t.tags || []]
    };
  const o = {
    id: ot(s === "character" ? "character" : s, e.existingIds, r),
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
    asset: jn(t),
    asset_id: t.id,
    asset_kind: s,
    tags: [...t.tags || []]
  };
  return a && (o.character = Dn(t)), o;
}
function Qr({ groundHit: t, orbitTarget: e } = {}) {
  return Array.isArray(t) && t.length >= 3 && t.every((n) => Number.isFinite(n)) ? t.slice(0, 3).map(Number) : Array.isArray(e) && e.length >= 3 && e.every((n) => Number.isFinite(n)) ? [Number(e[0]), 0, Number(e[2])] : [0, 0, 0];
}
const Ve = ["pos_x", "pos_y", "pos_z"], Me = 1e-9, At = ["auto", "aligned", "free", "corner"];
function D(t, e = 0) {
  const n = Number(t);
  return Number.isFinite(n) ? n : e;
}
function x(t) {
  const e = t?.camera?.position;
  return [D(e?.[0]), D(e?.[1]), D(e?.[2])];
}
function se(t, e) {
  return [t[0] - e[0], t[1] - e[1], t[2] - e[2]];
}
function ct(t) {
  return Math.hypot(t[0], t[1], t[2]);
}
function Ee(t, e) {
  return [t[0] * e, t[1] * e, t[2] * e];
}
function je(t, e, n) {
  const r = x(t), s = e ? x(e) : r, a = n ? x(n) : r, i = Math.max(Me, D(t?.frame) - D(e?.frame, D(t?.frame) - 1)), o = Math.max(Me, D(n?.frame, D(t?.frame) + 1) - D(t?.frame)), l = [0, 0, 0], m = [0, 0, 0];
  for (let d = 0; d < 3; d += 1) {
    const c = (r[d] - s[d]) / i, h = (a[d] - r[d]) / o;
    let _ = (c + h) * 0.5;
    e ? n ? c * h <= 0 && (_ = 0) : _ = c : _ = h, l[d] = _ * o * (1 / 3), m[d] = -_ * i * (1 / 3);
  }
  return { out: l, in: m };
}
function yt(t, e, n) {
  const r = x(t), s = e ? x(e) : r, a = n ? x(n) : r;
  return {
    out: Ee(se(a, r), 1 / 3),
    in: Ee(se(s, r), 1 / 3)
  };
}
function De(t, e) {
  const n = t?.tangents?.channels;
  if (!n) return null;
  const r = e === "out" ? "out_y" : "in_y", s = [0, 0, 0];
  let a = !1;
  for (let i = 0; i < 3; i += 1) {
    const o = n[Ve[i]];
    o && Number.isFinite(Number(o[r])) && (s[i] = Number(o[r]), a = !0);
  }
  return a ? s : null;
}
function we(t) {
  const e = t?.tangents?.spatial_mode;
  return At.includes(e) ? e : "auto";
}
function Ue(t, e = null, n = null) {
  const r = we(t), s = x(t);
  if (r === "corner") {
    const l = yt(t, e, n);
    return { in: me(s, l.in), out: me(s, l.out), mode: r };
  }
  const a = je(t, e, n), i = (r === "free" || r === "aligned") && De(t, "out") || a.out, o = (r === "free" || r === "aligned") && De(t, "in") || a.in;
  return { in: me(s, o), out: me(s, i), mode: r };
}
function me(t, e) {
  return [t[0] + e[0], t[1] + e[1], t[2] + e[2]];
}
function Ln(t) {
  return t.tangents = t.tangents && typeof t.tangents == "object" ? t.tangents : {}, t.tangents.channels = t.tangents.channels && typeof t.tangents.channels == "object" ? t.tangents.channels : {}, t.tangents.channels;
}
function Y(t, e, n) {
  const r = Ln(t);
  for (let s = 0; s < 3; s += 1) {
    const a = Ve[s], i = r[a] && typeof r[a] == "object" ? r[a] : {};
    i.mode = "free", i.out_x = 1 / 3, i.in_x = -1 / 3, e === "out" ? i.out_y = n[s] : i.in_y = n[s], i.out_y === void 0 && (i.out_y = 0), i.in_y === void 0 && (i.in_y = 0), r[a] = i;
  }
}
function Ae(t) {
  t.interpolation !== "bezier" && (t.interpolation = "bezier");
}
function Tt(t, e, n) {
  const r = x(t), s = Ue(t, e, n);
  Y(t, "out", se(s.out, r)), Y(t, "in", se(s.in, r));
}
function Xr(t, e, n, { prevKey: r = null, nextKey: s = null, breakCoupling: a = !1 } = {}) {
  if (!t || e !== "in" && e !== "out") return t;
  let i = we(t);
  if (i === "corner") return t;
  i === "auto" && (i = "aligned", t.tangents = t.tangents && typeof t.tangents == "object" ? t.tangents : {}, t.tangents.spatial_mode = "aligned", Tt(t, r, s));
  const o = x(t), l = se([
    D(n?.[0]),
    D(n?.[1]),
    D(n?.[2])
  ], o);
  if (Ae(t), Y(t, e, l), i === "aligned" && !a) {
    const m = e === "out" ? "in" : "out", d = De(t, m) || (m === "out" ? je(t, r, s).out : je(t, r, s).in), c = ct(l), h = ct(d) || c || 1, _ = c > Me ? Ee(l, -h / c) : Ee(d, 1);
    Y(t, m, _);
  }
  return t;
}
function he(t, e, n) {
  if (!t || e !== "in" && e !== "out") return t;
  const r = x(t);
  return Ae(t), Y(t, e, se([
    D(n?.[0]),
    D(n?.[1]),
    D(n?.[2])
  ], r)), t;
}
function Zr(t, e, { prevKey: n = null, nextKey: r = null } = {}) {
  if (!t || !At.includes(e)) return t;
  if (t.tangents = t.tangents && typeof t.tangents == "object" ? t.tangents : {}, t.tangents.spatial_mode = e, e === "auto") {
    if (t.tangents.channels) {
      for (const s of Ve) delete t.tangents.channels[s];
      Object.keys(t.tangents.channels).length || delete t.tangents.channels;
    }
    return t.interpolation === "bezier" && (t.interpolation = "smooth"), t;
  }
  if (e === "corner") {
    const s = yt(t, n, r);
    return Ae(t), Y(t, "out", s.out), Y(t, "in", s.in), t;
  }
  return Ae(t), Tt(t, n, r), t;
}
const vt = 1e-9;
function Bn(t, e) {
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
function Pn(t) {
  const e = t[0]?.length || 0, n = new Array(e).fill(1);
  for (let r = 0; r < e; r += 1) {
    let s = 1 / 0, a = -1 / 0;
    for (const o of t) {
      const l = Number.isFinite(o[r]) ? o[r] : 0;
      l < s && (s = l), l > a && (a = l);
    }
    const i = a - s;
    n[r] = i > vt ? 1 / i : 0;
  }
  return n;
}
function Ke(t, e) {
  const n = t.map((i) => Bn(i, e)), r = Pn(n), s = t.map((i) => i.frame), a = Math.max(1, s[s.length - 1] - s[0]);
  return n.map((i, o) => [
    (s[o] - s[0]) / a,
    ...i.map((l, m) => (Number.isFinite(l) ? l : 0) * r[m])
  ]);
}
function lt(t, e) {
  let n = 0;
  for (let r = 0; r < t.length; r += 1) n += (t[r] - e[r]) ** 2;
  return Math.sqrt(n);
}
function We(t, e, n) {
  let r = 0;
  for (let o = 0; o < e.length; o += 1) r += (n[o] - e[o]) ** 2;
  if (r <= vt) return lt(t, e);
  let s = 0;
  for (let o = 0; o < e.length; o += 1) s += (t[o] - e[o]) * (n[o] - e[o]);
  const a = Math.max(0, Math.min(1, s / r)), i = e.map((o, l) => o + (n[l] - o) * a);
  return lt(t, i);
}
function xn(t, e, n) {
  const r = /* @__PURE__ */ new Set([0, t.length - 1]), s = [[0, t.length - 1]];
  for (; s.length; ) {
    const [a, i] = s.pop();
    if (i - a < 2) continue;
    let o = -1, l = -1;
    for (let m = a + 1; m < i; m += 1) {
      const d = We(t[m], t[a], t[i]);
      d > o && (o = d, l = m);
    }
    l < 0 || (o > e || n.has(l)) && (r.add(l), s.push([a, l], [l, i]));
  }
  return r;
}
function es(t, e, { tolerance: n = 0.02, keepFrames: r = [] } = {}) {
  const s = [...t].sort((d, c) => d.frame - c.frame);
  if (s.length <= 2 || n <= 0) return { keys: s, removed: 0 };
  const a = Ke(s, e), i = /* @__PURE__ */ new Set(), o = new Set(r);
  s.forEach((d, c) => {
    o.has(d.frame) && i.add(c);
  });
  const l = xn(a, n, i);
  for (const d of i) l.add(d);
  const m = s.filter((d, c) => l.has(c));
  return { keys: m, removed: s.length - m.length };
}
function ts(t, e, { target: n = 2, keepFrames: r = [] } = {}) {
  let s = [...t].sort((l, m) => l.frame - m.frame);
  const a = Math.max(2, Math.round(n));
  if (s.length <= a) return { keys: s, removed: 0 };
  const i = new Set(r), o = s.length;
  for (; s.length > a; ) {
    const l = Ke(s, e);
    let m = -1, d = 1 / 0;
    for (let c = 1; c < s.length - 1; c += 1) {
      if (i.has(s[c].frame)) continue;
      const h = We(l[c], l[c - 1], l[c + 1]);
      h < d && (d = h, m = c);
    }
    if (m < 0) break;
    s = s.filter((c, h) => h !== m);
  }
  return { keys: s, removed: o - s.length };
}
function ns(t, e, { mergeWithin: n = 1, epsilon: r = 1e-3, keepFrames: s = [] } = {}) {
  const a = [...t].sort((h, _) => h.frame - _.frame), i = a.length, o = new Set(s), l = [];
  for (const h of a) {
    const _ = l[l.length - 1];
    _ && h.frame - _.frame <= Math.max(0, n) && !o.has(h.frame) || l.push(h);
  }
  if (l.length <= 2) return { keys: l, removed: i - l.length };
  const m = Ke(l, e), d = /* @__PURE__ */ new Set();
  for (let h = 1; h < l.length - 1; h += 1) {
    if (o.has(l[h].frame)) continue;
    const _ = d.has(h - 1) ? null : h - 1;
    if (_ === null) continue;
    We(m[h], m[_], m[h + 1]) <= r && d.add(h);
  }
  const c = l.filter((h, _) => !d.has(_));
  return { keys: c, removed: i - c.length };
}
function Fn(t, e, { minKeys: n = 0 } = {}) {
  const r = new Set(e), s = t.filter((a) => !r.has(a.frame));
  if (s.length < n) {
    const a = t.filter((i) => r.has(i.frame)).sort((i, o) => i.frame - o.frame);
    for (; s.length < n && a.length; ) s.push(a.shift());
    s.sort((i, o) => i.frame - o.frame);
  }
  return { keys: s, removed: t.length - s.length };
}
function rs(t, e, n, { lastFrame: r = 1 / 0 } = {}) {
  const s = [...e].sort((d, c) => d - c);
  if (!n || !s.length)
    return { keys: [...t], moved: 0, frames: s };
  const a = new Set(s), i = new Set(t.filter((d) => !a.has(d.frame)).map((d) => d.frame)), o = s.map((d) => d + n);
  return o.some((d) => d < 0 || d > r || i.has(d)) || new Set(o).size !== o.length ? { keys: [...t], moved: 0, frames: s } : { keys: t.map((d) => a.has(d.frame) ? { ...d, frame: d.frame + n } : d).sort((d, c) => d.frame - c.frame), moved: s.length, frames: o.sort((d, c) => d - c) };
}
function ss(t, e, n) {
  const r = new Set(e);
  return t.map((s) => r.has(s.frame) ? { ...s, interpolation: n } : s);
}
function as(t, e, n, r = []) {
  const s = new Set(e);
  return t.map((a) => {
    if (!s.has(a.frame)) return a;
    const i = { mode: n, channels: { ...a.tangents?.channels || {} } };
    for (const l of r)
      i.channels[l] = { ...i.channels[l] || {}, mode: n };
    const o = n !== "auto" && a.interpolation !== "bezier" ? "bezier" : a.interpolation;
    return { ...a, interpolation: o, tangents: i };
  });
}
function is(t, e, n = "camera", r = 0.5) {
  const s = new Set(e), a = [...t].sort((d, c) => d.frame - c.frame), i = [];
  if (a.forEach((d, c) => {
    s.has(d.frame) && i.push(c);
  }), i.length < 2) return t;
  const o = r * 0.5, l = 1 - r, m = a.map((d) => ({
    ...d,
    camera: d.camera ? { ...d.camera, position: [...d.camera.position], target: [...d.camera.target || [0, 0, 0]] } : void 0,
    transform: d.transform ? { ...d.transform, position: [...d.transform.position], rotation: [...d.transform.rotation || [0, 0, 0]] } : void 0
  }));
  for (let d = 0; d < i.length; d += 1) {
    const c = i[d], h = d > 0 ? i[d - 1] : c > 0 ? c - 1 : null, _ = d < i.length - 1 ? i[d + 1] : c < a.length - 1 ? c + 1 : null;
    if (h === null || _ === null) continue;
    const A = a[h], b = a[c], v = a[_];
    if (n === "object" && b.transform && A.transform && v.transform)
      for (let g = 0; g < 3; g += 1)
        m[c].transform.position[g] = o * A.transform.position[g] + l * b.transform.position[g] + o * v.transform.position[g], b.transform.rotation && A.transform.rotation && v.transform.rotation && (m[c].transform.rotation[g] = o * A.transform.rotation[g] + l * b.transform.rotation[g] + o * v.transform.rotation[g]);
    else if (b.camera && A.camera && v.camera) {
      for (let g = 0; g < 3; g += 1)
        m[c].camera.position[g] = o * A.camera.position[g] + l * b.camera.position[g] + o * v.camera.position[g], m[c].camera.target[g] = o * (A.camera.target?.[g] ?? 0) + l * (b.camera.target?.[g] ?? 0) + o * (v.camera.target?.[g] ?? 0);
      Number.isFinite(b.camera.roll) && Number.isFinite(A.camera.roll) && Number.isFinite(v.camera.roll) && (m[c].camera.roll = o * A.camera.roll + l * b.camera.roll + o * v.camera.roll), Number.isFinite(b.camera.fov) && Number.isFinite(A.camera.fov) && Number.isFinite(v.camera.fov) && (m[c].camera.fov = o * A.camera.fov + l * b.camera.fov + o * v.camera.fov);
    }
  }
  return m;
}
function ee(t, e, n) {
  return [0, 1, 2].map((r) => t[r] + (e[r] - t[r]) * n);
}
function $n(t, e, n, r, s) {
  const a = ee(t, e, s), i = ee(e, n, s), o = ee(n, r, s), l = ee(a, i, s), m = ee(i, o, s), d = ee(l, m, s);
  return { left: [t, a, l, d], right: [d, m, o, r], point: d };
}
function zn(t, e, n, r) {
  const s = new Set(t.map((o) => o.frame)), a = Math.min(n - 1, Math.max(e + 1, r));
  if (!s.has(a)) return a;
  const i = n - e;
  for (let o = 1; o < i; o += 1)
    for (const l of [a - o, a + o])
      if (!(l <= e || l >= n) && !s.has(l))
        return l;
  return -1;
}
function Hn(t, { leftFrame: e, rightFrame: n, t: r = 0.5 } = {}) {
  const s = [...t].sort((I, y) => I.frame - y.frame), a = s.findIndex((I) => I.frame === e), i = a >= 0 ? a + 1 : -1;
  if (a < 0 || i < 0 || i >= s.length || s[i].frame !== n)
    return { ok: !1, reason: "segment_not_found" };
  if (n - e < 2)
    return { ok: !1, reason: "no_free_frame" };
  const o = Math.min(0.999, Math.max(1e-3, Number.isFinite(r) ? r : 0.5)), l = Math.round(e + o * (n - e)), m = zn(s, e, n, l);
  if (m < 0) return { ok: !1, reason: "no_free_frame" };
  const d = (m - e) / (n - e), c = s[a], h = s[i], _ = a > 0 ? s[a - 1] : null, A = i + 1 < s.length ? s[i + 1] : null, b = c.interpolation === "bezier" || h.interpolation === "bezier", v = ue({ keyframes: s }, m), g = { frame: m, interpolation: b ? "bezier" : c.interpolation, camera: v };
  if (b) {
    const I = [...c.camera.position], y = Ue(c, _, h).out, E = Ue(h, c, A).in, N = [...h.camera.position], M = $n(I, y, E, N, d);
    g.camera = { ...be(v), position: [...M.point] };
    const F = we(c);
    (F === "free" || F === "aligned") && he(c, "out", M.left[1]);
    const R = we(h);
    (R === "free" || R === "aligned") && he(h, "in", M.right[2]), he(g, "in", M.left[2]), he(g, "out", M.right[1]);
  }
  return { ok: !0, keys: [...s, g].sort((I, y) => I.frame - y.frame), frame: m };
}
function Vn(t, e) {
  const { keys: n, removed: r } = Fn(t, e, { minKeys: 1 });
  return { ok: r > 0, keys: n, removed: r };
}
function Le(t, e) {
  const n = e || t.active_camera_id, r = (t.cameras || []).find((s) => s.id === n);
  if (!r) throw new f("UNKNOWN_CAMERA", `${n} does not exist`);
  return r;
}
function Be(t, e) {
  const n = (t.objects || []).find((r) => r.id === e);
  if (!n) throw new f("UNKNOWN_OBJECT", `${e} does not exist`);
  return n;
}
function pe(t, e) {
  const n = W(t, e);
  if (n.asset_kind !== "character")
    throw new f("NOT_A_CHARACTER", `${e} is not a character`);
  return n;
}
function P(t, e) {
  const n = Le(t, e);
  if (n.locked)
    throw new f("ENTITY_LOCKED", `${n.id} is locked`);
  return n;
}
function W(t, e) {
  const n = Be(t, e);
  if (n.locked)
    throw new f("ENTITY_LOCKED", `${n.id} is locked`);
  return n;
}
function ke(t) {
  return (!t.camera || typeof t.camera != "object") && (t.camera = {}), t.camera;
}
function _e(t, e) {
  return (t.keyframes || []).find((n) => n.frame === e) || null;
}
function ae(t, e, n) {
  e.keyframes = n, e.id === t.active_camera_id && (t.keyframes = n);
}
const ie = u.viewport | u.previews | u.timeline | u.inspector;
function dt(t, e, n) {
  const r = new Set((t.keyframes || []).map((a) => a.frame)), s = e.find((a) => !r.has(a));
  if (s !== void 0)
    throw new f("UNKNOWN_KEYFRAME", `${n}: camera has no key at frame ${s}`);
}
const Kn = {
  [p.ASSET_INSTANTIATE](t, e) {
    const n = new Set((t.objects || []).map((s) => s.id));
    let r;
    try {
      r = Un(e.asset, { point: e.point, idSeed: e.id, existingIds: n });
    } catch (s) {
      throw new f("BAD_ASSET", `asset.instantiate could not compile: ${s.message}`);
    }
    return (t.objects ||= []).push(r), {
      dirtyMask: u.viewport | u.previews | u.outliner | u.inspector,
      outcome: { objectId: r.id, assetId: r.asset_id || null }
    };
  },
  [p.CAMERA_SET_ACTIVE](t, e) {
    return Le(t, e.cameraId), t.active_camera_id = e.cameraId, { dirtyMask: u.viewport | u.previews | u.inspector | u.outliner | u.timeline };
  },
  [p.CAMERA_SET_LOCKED](t, e) {
    return Le(t, e.cameraId).locked = e.value, { dirtyMask: u.outliner | u.inspector | u.viewport };
  },
  [p.CAMERA_CREATE](t, e) {
    const n = rn(t, e);
    return { dirtyMask: u.outliner | u.inspector | u.viewport | u.previews | u.timeline, outcome: n };
  },
  [p.CAMERA_DUPLICATE](t, e) {
    const n = sn(t, e);
    return { dirtyMask: u.outliner | u.inspector | u.viewport | u.previews | u.timeline, outcome: n };
  },
  [p.CAMERA_DELETE](t, e) {
    const n = an(t, e);
    return { dirtyMask: u.outliner | u.inspector | u.viewport | u.previews | u.timeline, outcome: n };
  },
  [p.CAMERA_RENAME](t, e) {
    P(t, e.cameraId);
    const n = on(t, e);
    return { dirtyMask: u.outliner | u.inspector, outcome: n };
  },
  [p.CAMERA_SET_PLAYBLAST](t, e) {
    const n = cn(t, e);
    return { dirtyMask: u.outliner | u.inspector | u.status, outcome: n };
  },
  [p.CAMERA_TRANSFORM](t, e) {
    const n = P(t, e.cameraId), r = ke(n);
    if (e.position && (r.position = [...e.position]), e.target && (r.target = [...e.target]), Number.isInteger(e.frame)) {
      const s = _e(n, e.frame);
      if (!s) throw new f("UNKNOWN_KEYFRAME", `camera has no key at frame ${e.frame}`);
      s.camera = { ...s.camera }, e.position && (s.camera.position = [...e.position]), e.target && (s.camera.target = [...e.target]);
    }
    return { dirtyMask: u.viewport | u.previews | u.inspector | u.timeline };
  },
  [p.CAMERA_LOOK_AT](t, e) {
    const n = P(t, e.cameraId);
    if (e.objectId !== void 0 && (e.objectId === null || e.objectId === "" ? (n.target_object_id = null, n.id === t.active_camera_id && (t.target_object_id = null)) : (Be(t, e.objectId), n.target_object_id = e.objectId, n.id === t.active_camera_id && (t.target_object_id = e.objectId))), e.point) {
      const r = ke(n);
      r.target = [...e.point];
      for (const s of n.keyframes || [])
        s.camera = { ...s.camera, target: [...e.point] };
    }
    return { dirtyMask: u.viewport | u.previews | u.inspector | u.timeline };
  },
  [p.OBJECT_CREATE](t, e) {
    const n = ln(t, e);
    return { dirtyMask: u.viewport | u.previews | u.outliner | u.inspector, outcome: n };
  },
  [p.OBJECT_DUPLICATE](t, e) {
    const n = dn(t, e);
    return { dirtyMask: u.viewport | u.previews | u.outliner | u.inspector, outcome: n };
  },
  [p.OBJECT_DELETE](t, e) {
    const n = un(t, e);
    return { dirtyMask: u.viewport | u.previews | u.outliner | u.inspector, outcome: n };
  },
  [p.OBJECT_RENAME](t, e) {
    W(t, e.objectId);
    const n = fn(t, e);
    return { dirtyMask: u.outliner | u.inspector, outcome: n };
  },
  [p.OBJECT_SET_PARENT](t, e) {
    W(t, e.objectId);
    const n = mn(t, e);
    return { dirtyMask: u.viewport | u.outliner | u.inspector, outcome: n };
  },
  [p.OBJECT_TRANSFORM](t, e) {
    const n = W(t, e.objectId);
    return e.position && (n.position = [...e.position]), e.rotation && (n.rotation = [...e.rotation]), e.scale && (n.size = [...e.scale]), { dirtyMask: u.viewport | u.previews | u.inspector };
  },
  [p.OBJECT_SET_ENABLED](t, e) {
    return W(t, e.objectId).enabled = e.value, { dirtyMask: u.viewport | u.previews | u.outliner | u.inspector };
  },
  [p.OBJECT_SET_LOCKED](t, e) {
    return Be(t, e.objectId).locked = e.value, { dirtyMask: u.outliner | u.inspector };
  },
  [p.OBJECT_SET_TAGS](t, e) {
    const n = W(t, e.objectId), r = $t(e.tags), s = r.length !== e.tags.length ? "some tags were dropped or normalised" : void 0;
    return r.length ? n.tags = r : delete n.tags, { dirtyMask: u.outliner | u.inspector | u.viewport, warning: s };
  },
  [p.OBJECT_SET_ANNOTATION](t, e) {
    const n = W(t, e.objectId), r = e.annotation === null ? null : Ft(e.annotation);
    if (e.annotation && !r)
      throw new f("BAD_ANNOTATION", "annotation failed validation (text, hex colour, anchor)");
    return r ? n.annotation = r : delete n.annotation, { dirtyMask: u.viewport | u.outliner | u.inspector };
  },
  [p.CHARACTER_SET_POSE](t, e) {
    const n = pe(t, e.objectId);
    if (n.character?.motion)
      throw new f("POSE_MOTION_EXCLUSIVE", "clear the motion clip before editing the pose");
    return n.character = {
      ...n.character || {},
      pose: e.pose === null ? qe(null) : qe(e.pose)
    }, { dirtyMask: u.viewport | u.previews | u.inspector };
  },
  [p.CHARACTER_SET_JOINT_ROTATION](t, e) {
    const n = pe(t, e.objectId);
    if (n.character?.motion)
      throw new f("POSE_MOTION_EXCLUSIVE", "clear the motion clip before editing the pose");
    if (!Pt(e.rotation))
      throw new f("BAD_QUATERNION", "rotation is not a usable unit quaternion");
    return n.character = {
      ...n.character || {},
      pose: xt(n.character?.pose, e.joint, e.rotation)
    }, { dirtyMask: u.viewport | u.previews | u.inspector };
  },
  [p.CHARACTER_SET_MOTION](t, e) {
    const n = pe(t, e.objectId), r = Bt(e.motion);
    if (!r) throw new f("BAD_MOTION", "motion failed validation (clip_id, speed, range)");
    const s = n.character?.pose || {};
    return n.character = {
      ...n.character || {},
      pose: { preset_id: s.preset_id || "neutral", root_offset: s.root_offset || [0, 0, 0], joints: {} },
      motion: r
    }, { dirtyMask: u.viewport | u.previews | u.timeline | u.inspector };
  },
  [p.CHARACTER_CLEAR_MOTION](t, e) {
    const n = pe(t, e.objectId);
    return n.character ? (n.character = { ...n.character, motion: null }, { dirtyMask: u.viewport | u.previews | u.timeline | u.inspector }) : { dirtyMask: 0 };
  },
  [p.KEYFRAME_UPSERT](t, e) {
    const n = P(t, e.cameraId);
    if (e.frame >= (t.duration_frames || 0))
      throw new f("FRAME_OUT_OF_RANGE", `frame ${e.frame} is past the timeline`);
    n.keyframes ||= [];
    let r = _e(n, e.frame);
    const s = !r;
    if (!r) {
      const i = _e(n, 0)?.camera || n.camera || {};
      r = { frame: e.frame, camera: JSON.parse(JSON.stringify(i)), interpolation: "ease" }, n.keyframes.push(r), n.keyframes.sort((o, l) => o.frame - l.frame);
    }
    e.camera && (r.camera = { ...r.camera, ...JSON.parse(JSON.stringify(e.camera)) }), e.interpolation && (r.interpolation = e.interpolation);
    const a = s && !e.camera ? `keyframe at frame ${e.frame} was created from the existing pose (no "camera" given) -- it will not move the camera unless another keyframe with a different position/target exists` : void 0;
    return { dirtyMask: u.viewport | u.previews | u.timeline | u.inspector, warning: a };
  },
  [p.KEYFRAME_REMOVE](t, e) {
    const n = P(t, e.cameraId), r = (n.keyframes || []).length;
    if (n.keyframes = (n.keyframes || []).filter((a) => a.frame !== e.frame), n.keyframes.length === r)
      throw new f("UNKNOWN_KEYFRAME", `camera has no key at frame ${e.frame}`);
    const s = n.keyframes.length === 0 ? "camera has no keyframes left" : void 0;
    return { dirtyMask: u.viewport | u.previews | u.timeline | u.inspector, warning: s };
  },
  [p.KEYFRAME_SET_INTERPOLATION](t, e) {
    const n = P(t, e.cameraId), r = _e(n, e.frame);
    if (!r) throw new f("UNKNOWN_KEYFRAME", `camera has no key at frame ${e.frame}`);
    if (!ge.includes(e.interpolation))
      throw new f("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`);
    return r.interpolation = e.interpolation, { dirtyMask: u.timeline | u.viewport | u.previews };
  },
  [p.TIMELINE_SET_RANGE](t, e) {
    const n = Math.max(0, (t.duration_frames || 1) - 1);
    if (e.start > n || e.end > n)
      throw new f("FRAME_OUT_OF_RANGE", `range must stay within 0..${n}`);
    return t.playback_range = [e.start, e.end], { dirtyMask: u.timeline | u.status };
  },
  [p.TIMELINE_SET_DURATION](t, e) {
    if (t.duration_frames = e.frames, Array.isArray(t.playback_range)) {
      const n = e.frames - 1;
      t.playback_range = [
        Math.min(t.playback_range[0], n),
        Math.min(t.playback_range[1], n)
      ];
    }
    return { dirtyMask: u.timeline | u.viewport | u.previews | u.status };
  },
  [p.CUT_UPSERT](t, e) {
    const n = hn(t, e);
    return { dirtyMask: u.timeline | u.viewport | u.previews | u.status, outcome: n };
  },
  [p.CUT_REMOVE](t, e) {
    const n = pn(t, e);
    return { dirtyMask: u.timeline | u.viewport | u.previews | u.status, outcome: n };
  },
  [p.CUT_SET_CAMERA](t, e) {
    const n = _n(t, e);
    return { dirtyMask: u.timeline | u.viewport | u.previews | u.status, outcome: n };
  },
  // Semantic Director API path operations (plan section 22): the same pure
  // maths the manual UI's TransformControls wiring / toolbar actions use
  // (viewport/transform-controls-wiring.js, director/methods/scene.js),
  // reached atomically and with the exact same lock/existence checks. No
  // raw Three.js object ever crosses this boundary -- every input/output
  // here is plain JSON (frames, vectors, strings).
  [p.CAMERA_PATH_TRANSFORM_KEYS](t, e) {
    const n = P(t, e.cameraId);
    dt(n, e.frames, "camera.path.transform_keys");
    const r = (n.keyframes || []).filter((i) => e.frames.includes(i.frame)), s = Array.isArray(e.transform.origin) ? e.transform.origin : Dt(r), a = Ut(n.keyframes || [], e.frames, {
      mode: e.transform.mode,
      origin: s,
      delta: e.transform.delta,
      factors: e.transform.factors,
      rotationDeg: e.transform.rotationDeg,
      lookAtActive: Lt(n, t.objects)
    });
    return ae(t, n, a), { dirtyMask: ie };
  },
  [p.CAMERA_PATH_INSERT_KEY](t, e) {
    const n = P(t, e.cameraId), r = Hn(n.keyframes || [], {
      leftFrame: e.leftFrame,
      rightFrame: e.rightFrame,
      t: e.t
    });
    if (!r.ok)
      throw new f(
        r.reason === "no_free_frame" ? "NO_FREE_FRAME" : "SEGMENT_NOT_FOUND",
        `camera.path.insert_key: could not insert a key between frame ${e.leftFrame} and ${e.rightFrame}`
      );
    return ae(t, n, r.keys), { dirtyMask: ie, outcome: { frame: r.frame } };
  },
  [p.CAMERA_PATH_DELETE_KEYS](t, e) {
    const n = P(t, e.cameraId);
    dt(n, e.frames, "camera.path.delete_keys");
    const r = Vn(n.keyframes || [], e.frames);
    if (!r.ok)
      throw new f("CANNOT_DELETE", "camera.path.delete_keys: a camera track needs at least one key");
    return ae(t, n, r.keys), { dirtyMask: ie, outcome: { removed: r.removed } };
  },
  [p.CAMERA_PATH_REDISTRIBUTE_TIMING](t, e) {
    const n = P(t, e.cameraId), r = [...n.keyframes || []].sort((o, l) => o.frame - l.frame), s = Number.isInteger(e.startFrame) ? e.startFrame : r[0]?.frame, a = Number.isInteger(e.endFrame) ? e.endFrame : r[r.length - 1]?.frame, i = jt(r, { startFrame: s, endFrame: a });
    if (!i.ok) {
      const o = { not_enough_keys: "NOT_ENOUGH_KEYS", invalid_range: "BAD_RANGE", insufficient_frame_slots: "INSUFFICIENT_FRAME_SLOTS" };
      throw new f(o[i.reason] || "BAD_RANGE", `camera.path.redistribute_timing: ${i.reason}`);
    }
    return ae(t, n, i.keys), { dirtyMask: ie };
  },
  [p.CAMERA_PATH_APPLY_PRESET](t, e) {
    const n = P(t, e.cameraId), r = ke(n), s = wn({
      type: e.presetType,
      camera: r,
      target: e.target,
      startFrame: e.startFrame,
      endFrame: e.endFrame,
      params: e.params || {}
    });
    if (!s.ok) {
      const a = { unknown_preset: "UNKNOWN_PRESET", invalid_camera: "BAD_VALUE", invalid_range: "BAD_RANGE", insufficient_frame_slots: "INSUFFICIENT_FRAME_SLOTS" };
      throw new f(a[s.reason] || "BAD_VALUE", `camera.path.apply_preset: ${s.reason}`);
    }
    return ae(t, n, s.keyframes), { dirtyMask: ie };
  }
};
function Wn({ state: t, operation: e }) {
  const n = Kn[e.type];
  if (!n) throw new f("UNKNOWN_OPERATION", `Unknown operation type: ${e.type}`);
  return n(t, e) || { dirtyMask: 0 };
}
const Jn = 100;
function Pe(t, e) {
  if (t === e) return !0;
  if (typeof t != typeof e) return !1;
  if (Array.isArray(t) || Array.isArray(e))
    return !Array.isArray(t) || !Array.isArray(e) || t.length !== e.length ? !1 : t.every((n, r) => Pe(n, e[r]));
  if (t && e && typeof t == "object") {
    const n = /* @__PURE__ */ new Set([...Object.keys(t), ...Object.keys(e)]);
    for (const r of n) if (!Pe(t[r], e[r])) return !1;
    return !0;
  }
  return !1;
}
function K(t) {
  return new Map((t || []).map((e) => [e.id, e]));
}
function Gn(t, e) {
  const n = [];
  let r = !1;
  const s = (a, i, o, l) => {
    if (!r && !Pe(o, l)) {
      if (n.length >= Jn) {
        r = !0;
        return;
      }
      n.push({ entity: a, field: i, before: o ?? null, after: l ?? null });
    }
  };
  return qn(t, e, s), Xn(t, e, s), er(t, e, s), Zn(t, e, s), tr(t, e, s), nr(t, e, s), { changes: n, truncated: r };
}
const Yn = ["fov", "roll", "zoom", "near", "far", "camera_type"];
function qn(t, e, n) {
  const r = K(t?.cameras), s = K(e?.cameras);
  for (const a of r.keys())
    s.has(a) || n(a, "camera", "present", null);
  for (const [a, i] of s) {
    const o = r.get(a);
    if (!o) {
      n(a, "camera", null, "present");
      continue;
    }
    n(a, "name", o.name, i.name), n(a, "locked", !!o.locked, !!i.locked), n(a, "muted", !!o.muted, !!i.muted), n(a, "solo", !!o.solo, !!i.solo), n(a, "target_object_id", o.target_object_id ?? null, i.target_object_id ?? null), n(a, "position", o.camera?.position, i.camera?.position), n(a, "target", o.camera?.target, i.camera?.target);
    for (const l of Yn)
      n(a, l, o.camera?.[l], i.camera?.[l]);
  }
}
const Qn = ["position", "target", "fov", "roll", "zoom", "near", "far", "camera_type"];
function Xn(t, e, n) {
  const r = K(t?.cameras), s = K(e?.cameras);
  for (const [a, i] of s) {
    const o = r.get(a), l = new Map((o?.keyframes || []).map((c) => [c.frame, c])), m = new Map((i.keyframes || []).map((c) => [c.frame, c])), d = `${a}@keyframes`;
    for (const [c, h] of l)
      m.has(c) || n(d, `frame_${c}`, h.interpolation ?? "present", null);
    for (const [c, h] of m) {
      const _ = l.get(c);
      if (!_) {
        n(d, `frame_${c}`, null, h.interpolation ?? "present");
        continue;
      }
      for (const A of Qn)
        n(d, `frame_${c}_${A}`, _.camera?.[A], h.camera?.[A]);
      n(d, `frame_${c}_interpolation`, _.interpolation, h.interpolation);
    }
  }
}
function Zn(t, e, n) {
  const r = K(t?.objects), s = K(e?.objects);
  for (const [a, i] of s) {
    const l = r.get(a)?.character?.pose?.joints || {}, m = i.character?.pose?.joints || {}, d = /* @__PURE__ */ new Set([...Object.keys(l), ...Object.keys(m)]);
    for (const c of d)
      n(`${a}#${c}`, "joint_rotation", l[c] ?? null, m[c] ?? null);
  }
}
function er(t, e, n) {
  const r = K(t?.objects), s = K(e?.objects);
  for (const [a] of r)
    s.has(a) || n(a, "object", "present", null);
  for (const [a, i] of s) {
    const o = r.get(a);
    if (!o) {
      n(a, "object", null, "present");
      continue;
    }
    n(a, "position", o.position, i.position), n(a, "rotation", o.rotation, i.rotation), n(a, "size", o.size, i.size), n(a, "name", o.name, i.name), n(a, "enabled", o.enabled !== !1, i.enabled !== !1), n(a, "locked", !!o.locked, !!i.locked), n(a, "tags", o.tags || [], i.tags || []), n(a, "annotation", o.annotation ?? null, i.annotation ?? null);
    const l = o.character?.pose?.preset_id ?? null, m = i.character?.pose?.preset_id ?? null;
    n(a, "pose_preset", l, m);
    const d = o.character?.motion?.clip_id ?? null, c = i.character?.motion?.clip_id ?? null;
    n(a, "motion_clip_id", d, c);
  }
}
function tr(t, e, n) {
  n("timeline", "duration_frames", t?.duration_frames, e?.duration_frames), n("timeline", "playback_range", t?.playback_range ?? null, e?.playback_range ?? null);
}
function nr(t, e, n) {
  const r = new Map((t?.sequence?.cuts || []).map((a) => [a.start, a])), s = new Map((e?.sequence?.cuts || []).map((a) => [a.start, a]));
  for (const [a, i] of r)
    s.has(a) || n(`cut_${a}`, "cut", i.camera_id, null);
  for (const [a, i] of s) {
    const o = r.get(a);
    o ? n(`cut_${a}`, "cut_camera_id", o.camera_id, i.camera_id) : n(`cut_${a}`, "cut", null, i.camera_id);
  }
}
function rr(t) {
  return typeof structuredClone == "function" ? structuredClone(t) : JSON.parse(JSON.stringify(t));
}
function xe(t) {
  return Number.isInteger(t.directorRevision) ? Math.max(0, t.directorRevision) : 0;
}
function Ne(t, e, n) {
  return {
    ok: !1,
    version: V,
    revision: xe(t),
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
function sr(t) {
  const e = (t.state.cameras || []).find(
    (n) => n.id === t.state.active_camera_id
  ) || t.state.cameras?.[0] || null;
  return e ? (t.state.keyframes = e.keyframes, t.state.camera = be(e.camera), t.camera = be(e.camera), e) : null;
}
function ar(t, e) {
  e && (t.camera = ue(
    e,
    t.frame ?? 0,
    t.state.objects || []
  ));
}
async function ir(t, e, n) {
  const r = n.some((i) => i.resourceRefresh === !0), s = e.operations.filter((i) => i.type === p.OBJECT_DELETE).map((i) => i.objectId);
  for (const i of s)
    t.removeObjectResources?.(i);
  const a = e.operations.some((i) => i.type === p.ASSET_INSTANTIATE);
  (r || a) && await t.restoreAssets?.();
}
function or(t, e, n) {
  if (typeof t.requestUiUpdate == "function") {
    t.requestUiUpdate(e, n);
    return;
  }
  t.camera = t.sampleCamera?.(t.state, t.frame) ?? t.camera, t.refreshObjects?.(), t.refreshKeys?.(), t.refreshInspector?.(), t.render?.();
}
function cr(t, e) {
  let n;
  try {
    n = Sn(t, e);
  } catch (c) {
    if (c instanceof f) return Ne(t, e?.id, c);
    throw c;
  }
  const r = xe(t);
  if (n.baseRevision !== void 0 && n.baseRevision !== r)
    return Ne(
      t,
      n.id,
      new f(
        "STALE_REVISION",
        "Scene changed since the caller read it",
        null,
        {
          expected: r,
          received: n.baseRevision
        }
      )
    );
  const s = rr(t.state);
  let a = 0;
  const i = [], o = [];
  for (let c = 0; c < n.operations.length; c += 1)
    try {
      const h = Wn({ ui: t, state: s, operation: n.operations[c] });
      a |= h?.dirtyMask || 0, h?.warning && i.push(h.warning), h?.outcome && o.push({ index: c, ...h.outcome });
    } catch (h) {
      if (h instanceof f)
        return (h.operationIndex === null || h.operationIndex === void 0) && (h.operationIndex = c), Ne(t, n.id, h);
      throw h;
    }
  if (n.validateOnly) {
    const { changes: c, truncated: h } = Gn(t.state, s);
    return {
      ok: !0,
      version: V,
      revision: r,
      id: n.id,
      applied: n.operations.length,
      warnings: i,
      outcomes: o,
      dirtyMask: a,
      validateOnly: !0,
      changes: c,
      ...h ? { truncated: !0 } : {}
    };
  }
  t.checkpoint?.(n.description), t.state = le(s);
  const l = sr(t);
  yn(t, n.id), t.serialize?.(), ar(t, l), or(t, a, `director-api:${n.id}`);
  const m = {
    ok: !0,
    version: V,
    baseRevision: r,
    revision: xe(t),
    id: n.id,
    applied: n.operations.length,
    warnings: i,
    outcomes: o,
    dirtyMask: a
  }, d = ir(t, n, o).catch((c) => {
    console.warn("OmniCam: resource reconciliation failed", c), i.push({
      code: "VIEWPORT_RESOURCE_RECONCILE_FAILED",
      message: "The scene change was committed, but one or more viewport resources could not be refreshed."
    }), t.setStatus?.("The scene change was committed, but one or more viewport resources could not be refreshed.");
  });
  return Object.defineProperty(m, "_reconciliation", { value: d, enumerable: !1 }), m;
}
function lr(t) {
  return {
    query: (e) => tn(t, e),
    execute: (e) => cr(t, e)
  };
}
function dr(t) {
  return t.directorApi = lr(t), t.directorApi;
}
const ut = "omnicam-agent/1", ft = "majoor.omnicam.agent.request", ur = 1, oe = Object.freeze({
  register: "/majoor/omnicam/agent/v1/session/register",
  heartbeat: "/majoor/omnicam/agent/v1/session/heartbeat",
  reply: "/majoor/omnicam/agent/v1/reply",
  close: "/majoor/omnicam/agent/v1/session/close"
}), fr = 1e4, Se = /* @__PURE__ */ new WeakMap();
function It() {
  return globalThis.crypto.randomUUID();
}
function mt(t, e) {
  return !t || typeof t != "object" ? e : t.id ? String(t.id) : (Se.has(t) || Se.set(t, It()), Se.get(t));
}
function ht(t, e) {
  const n = It();
  return () => {
    const r = e.graph?.rootGraph || e.graph || t.app?.rootGraph, s = mt(r, n), a = mt(e.graph, s);
    return {
      document_id: s,
      graph_id: a,
      node_locator: `${a}:${e.id}`,
      instance_id: n
    };
  };
}
const mr = 5e3, kt = "asset.instantiate_by_id", Je = "asset.catalog_search", pt = Object.freeze([
  ...Et.filter((t) => t !== p.ASSET_INSTANTIATE),
  kt
]), hr = Object.freeze([...Yt, Je]);
function Fe(t) {
  return t?.kind === "character" && t?.source === "default";
}
async function pr(t, e) {
  if (!t || !e || typeof e != "string") return null;
  const n = t.get(e);
  if (n) return Fe(n) ? null : n;
  try {
    await t.setFilter({ kind: "all", search: e });
  } catch {
  }
  const r = t.get(e);
  return Fe(r) ? null : r;
}
async function _r(t, e) {
  const n = t.assetBrowser?.store, r = [];
  for (const s of e || []) {
    if (s?.type !== kt) {
      r.push(s);
      continue;
    }
    if (!n)
      return { ok: !1, code: "ASSET_CATALOG_UNAVAILABLE", message: "The asset catalogue is not available in this Director session" };
    const a = await pr(n, s.assetId);
    if (!a)
      return { ok: !1, code: "UNKNOWN_ASSET", message: `Unknown catalogue asset: ${s.assetId}` };
    r.push({ type: "asset.instantiate", asset: a, id: s.id, point: s.point });
  }
  return { ok: !0, operations: r };
}
async function gr(t, e) {
  const n = t.assetBrowser?.store;
  if (!n) {
    const s = new Error("The asset catalogue is not available in this Director session");
    throw s.code = "ASSET_CATALOG_UNAVAILABLE", s;
  }
  await n.setFilter({ kind: e?.kind || "all", search: String(e?.search || "") });
  const r = (n.state?.items || []).filter((s) => !Fe(s)).slice(0, 20).map((s) => ({
    id: s.id,
    name: s.name,
    kind: s.kind,
    tags: [...s.tags || []],
    animations: (s.animations || []).map((a) => ({ id: a.id, name: a.name, clip: a.clip }))
  }));
  return {
    version: V,
    type: Je,
    items: r,
    revision: Number(t.directorRevision || 0)
  };
}
async function ce(t, e, n) {
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
    const a = s?.error?.code || `HTTP_${r.status || 0}`, i = s?.error?.message || `OmniCam Agent request failed (${r.status})`, o = new Error(i);
    throw o.code = a, o.status = r.status || 0, o;
  }
  return s ?? {};
}
function te(t, e, n) {
  return {
    ok: !1,
    version: V,
    revision: Number(t.directorRevision || 0),
    error: { code: e, message: n }
  };
}
function br(t, e, n) {
  let r = ht(t, e), s = !1, a = null, i = null, o = null, l = null, m = null, d = 0;
  function c() {
    return n.clientId || n.initialClientId || null;
  }
  function h() {
    a = null, i = null, o = null, l && (clearInterval(l), l = null);
  }
  async function _() {
    if (s) return;
    d += 1;
    const y = d, E = c();
    if (!E) {
      A();
      return;
    }
    try {
      const N = await ce(n, oe.register, {
        protocol: ut,
        client_id: E,
        node_id: String(e.id),
        label: `OmniCam Director ${e.id}`,
        director_api: V,
        revision: Number(t.directorRevision || 0),
        operations: [...pt],
        queries: [...hr],
        target: r()
      });
      if (s || y !== d) {
        await L(N.session_id, N.session_token);
        return;
      }
      a = N.session_id, i = N.session_token, o = E, b();
    } catch {
      if (s || y !== d) return;
      A();
    }
  }
  function A() {
    s || (clearTimeout(m), m = setTimeout(() => {
      _();
    }, mr));
  }
  function b() {
    clearInterval(l), l = setInterval(() => {
      v();
    }, fr);
  }
  async function v() {
    if (!(s || !a))
      try {
        await ce(n, oe.heartbeat, {
          session_id: a,
          session_token: i,
          revision: Number(t.directorRevision || 0)
        });
      } catch (y) {
        if (s) return;
        (y?.code === "UNKNOWN_SESSION" || y?.code === "BAD_SESSION_TOKEN") && (h(), _());
      }
  }
  async function g(y) {
    const E = y?.detail;
    if (s || !E || E.protocol !== ut || Number(E.schema_version) !== ur || E.session_id !== a || String(E.node_id) !== String(e.id) || E.target && JSON.stringify(E.target) !== JSON.stringify(r())) return;
    const N = a, M = i, F = () => s || a !== N || Number.isFinite(E.deadline_ms) && Date.now() >= E.deadline_ms;
    let R;
    try {
      if (E.kind === "query")
        R = E.payload?.type === Je ? await gr(t, E.payload) : t.directorApi.query(E.payload);
      else if (E.kind === "transaction") {
        const T = E.payload, q = (T?.operations || []).find(
          (Q) => !pt.includes(Q?.type)
        );
        if (!Number.isInteger(T?.baseRevision) || T.baseRevision < 0)
          R = te(
            t,
            "BASE_REVISION_REQUIRED",
            "External Agent transactions require baseRevision"
          );
        else if (q)
          R = te(
            t,
            "OPERATION_NOT_ADVERTISED",
            `External Agent transactions cannot use operation: ${q?.type}`
          );
        else {
          const Q = await _r(t, T.operations);
          F() ? R = te(t, "REQUEST_EXPIRED", "The request expired before commit; query the current state before retrying") : Q.ok ? (R = t.directorApi.execute({ ...T, operations: Q.operations }), await R?._reconciliation) : R = te(t, Q.code, Q.message);
        }
      } else
        R = te(t, "UNKNOWN_AGENT_REQUEST", `Unsupported Agent request kind: ${E.kind}`);
    } catch (T) {
      R = te(t, T?.code || "INTERNAL", T?.message || "OmniCam Agent request failed");
    }
    try {
      await ce(n, oe.reply, {
        session_id: N,
        session_token: M,
        request_id: E.request_id,
        result: R
      });
    } catch {
    }
  }
  async function L(y, E) {
    if (!(!y || !E))
      try {
        await ce(n, oe.close, {
          session_id: y,
          session_token: E
        });
      } catch {
      }
  }
  function I() {
    if (s) return;
    const y = c();
    if (y && o && y !== o) {
      const E = a, N = i;
      h(), L(E, N).finally(() => _());
    }
  }
  return n.addEventListener?.(ft, g), n.addEventListener?.("status", I), _(), {
    get sessionId() {
      return a;
    },
    invalidateDocument() {
      const y = a, E = i;
      d += 1, h(), r = ht(t, e), L(y, E).finally(() => _());
    },
    dispose() {
      if (s) return;
      s = !0, clearInterval(l), clearTimeout(m), n.removeEventListener?.(ft, g), n.removeEventListener?.("status", I);
      const y = a, E = i;
      a = null, i = null, y && E && ce(n, oe.close, {
        session_id: y,
        session_token: E
      }).catch(() => {
      });
    }
  };
}
const _t = "majoor-omnicam-workbench-styles", Er = `
  .oc-workbench-backdrop,.oc-node-shell{${Qe}}
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
  .oc-director-node{${Qe};display:flex;flex-direction:column;gap:6px;width:100%;height:100%;min-height:420px;container-type:inline-size}
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
function Nt(t = document) {
  if (t.getElementById(_t)) return;
  const e = t.createElement("style");
  e.id = _t, e.textContent = Er, t.head.append(e);
}
const wr = /* @__PURE__ */ new Set(["director"]);
function Ar({ kind: t, title: e, buttonLabel: n, onOpen: r, secondaryLabel: s, onSecondary: a, recordLabel: i, recordTitle: o, onRecord: l }) {
  Nt(document);
  const m = document.createElement("div");
  m.className = "oc-node-shell", m.dataset.shellKind = t;
  const d = document.createElement("img");
  d.className = "oc-node-shell-preview", d.alt = "", d.draggable = !1;
  let c = null;
  wr.has(t) && (c = document.createElement("video"), c.className = "oc-node-shell-preview", c.muted = !0, c.loop = !0, c.playsInline = !0, c.disablePictureInPicture = !0, c.disableRemotePlayback = !0, c.style.display = "none");
  const h = document.createElement("div");
  h.className = "oc-node-shell-title";
  const _ = document.createElement("span");
  _.className = "oc-node-shell-dirty-dot", _.hidden = !0, _.setAttribute("aria-hidden", "true");
  const A = document.createElement("span");
  A.className = "oc-node-shell-title-text", A.textContent = e ?? "", h.append(_, A);
  const b = document.createElement("div");
  b.className = "oc-node-shell-meta";
  const v = document.createElement("div");
  v.className = "oc-node-shell-status";
  const g = document.createElement("div");
  g.className = "oc-node-shell-progress";
  const L = document.createElement("span");
  g.append(L);
  const I = document.createElement("button");
  I.type = "button", I.className = "oc-node-shell-open", I.textContent = n ?? "Open";
  let y = null;
  s && (y = document.createElement("button"), y.type = "button", y.className = "oc-node-shell-secondary", y.textContent = s);
  let E = null;
  i && (E = document.createElement("button"), E.type = "button", E.className = "oc-node-shell-record", E.textContent = i, E.title = o ?? "");
  const N = document.createElement("div");
  N.className = "oc-node-shell-actions", N.append(...[y, E, I].filter(Boolean));
  const M = document.createElement("span");
  M.className = "oc-node-shell-version", M.textContent = `v${Vt}`, c ? m.append(d, c, M, h, b, v, g, N) : m.append(d, M, h, b, v, g, N);
  const F = new AbortController();
  I.addEventListener("click", (T) => r?.(T), { signal: F.signal }), y?.addEventListener("click", (T) => a?.(T), { signal: F.signal }), E?.addEventListener("click", (T) => l?.(T), { signal: F.signal });
  function R() {
    c && (c.pause(), c.removeAttribute("src"), c.load(), c.style.display = "none");
  }
  return {
    root: m,
    openButton: I,
    secondaryButton: y,
    recordButton: E,
    /** Busy state of the record action: disabled, with `label` (e.g. "12/121") instead of its own text. */
    setRecording(T, q = i) {
      E && (E.disabled = T, E.textContent = T ? q : i, m.dataset.recording = String(T));
    },
    setTitle(T) {
      A.textContent = T ?? "";
    },
    setDirty(T) {
      _.hidden = !T, _.title = T ? C("Unsaved changes") : "";
    },
    setMeta(T) {
      b.textContent = T ?? "";
    },
    setStatus(T) {
      v.textContent = T ?? "";
    },
    // Still-frame path. Composes with setPreviewVideo(): setting one with a
    // value hides+stops the other, and clearing one only drops
    // data-has-preview when the other has nothing showing either.
    setPreview(T) {
      T ? (d.src = T, d.style.display = "block", R(), m.dataset.hasPreview = "true") : (d.removeAttribute("src"), d.style.display = "none", c?.getAttribute("src") || delete m.dataset.hasPreview);
    },
    // Live-looping playblast preview, Director/Monitor shells only -- a
    // no-op on an Extractor shell (no <video> was mounted). See setPreview()
    // for the composition rule between the two.
    setPreviewVideo(T) {
      c && (T ? (d.style.display = "none", c.autoplay = !0, c.src = T, c.style.display = "block", m.dataset.hasPreview = "true", c.play().catch(() => {
      })) : (R(), d.getAttribute("src") || delete m.dataset.hasPreview));
    },
    setProgress(T) {
      if (T == null) {
        g.dataset.active = "false";
        return;
      }
      g.dataset.active = "true";
      const q = Math.max(0, Math.min(1, T));
      L.style.width = `${(q * 100).toFixed(1)}%`;
    },
    dispose() {
      F.abort(), R();
    }
  };
}
class yr {
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
const $e = new yr(), Tr = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");
function vr(t) {
  return !!(t.offsetWidth || t.offsetHeight || t.getClientRects?.().length);
}
function Ir(t) {
  return [...t.querySelectorAll(Tr)].filter(vr);
}
function kr(t) {
  let e = !1, n = null, r = null;
  function s(a) {
    if (a.key !== "Tab") return;
    const i = Ir(t);
    if (!i.length) {
      a.preventDefault(), t.focus();
      return;
    }
    const o = i[0], l = i[i.length - 1], m = t.ownerDocument?.activeElement ?? document.activeElement;
    a.shiftKey ? (m === o || !i.includes(m)) && (a.preventDefault(), l.focus()) : (m === l || !i.includes(m)) && (a.preventDefault(), o.focus());
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
class Nr {
  constructor({ kind: e, nodeId: n, title: r, onRequestClose: s, onResize: a }) {
    this.kind = e, this.nodeId = String(n), this.title = r, this.onRequestClose = s, this.onResize = a, this.backdrop = null, this.window = null, this.content = null, this.disposed = !1, this._maximized = !1, this.abort = null, this.focusTrap = null;
  }
  mount(e) {
    if (this.disposed) throw new Error("WorkbenchHost is disposed");
    if (this.backdrop) return;
    Nt(document);
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
            <button type="button" data-workbench-act="maximize" aria-label="${Xe(C("Maximize workbench"))}">[ ]</button>
            <button type="button" data-workbench-act="close" aria-label="${Xe(C("Close workbench"))}">x</button>
          </div>
        </header>
        <div class="oc-workbench-content"></div>
      </section>`, this.backdrop = n, this.window = n.querySelector(".oc-workbench-window"), this.content = n.querySelector(".oc-workbench-content"), this.setTitle(this.title), this.content.append(e), document.body.append(n), this.abort = new AbortController();
    const { signal: s } = this.abort;
    n.querySelector('[data-workbench-act="close"]')?.addEventListener("click", () => {
      this.requestClose("button");
    }, { signal: s }), n.querySelector('[data-workbench-act="maximize"]')?.addEventListener("click", () => this.setMaximized(!this._maximized), { signal: s }), n.addEventListener("keydown", (a) => {
      a.key === "Escape" && (a.stopPropagation(), this.requestClose("escape"));
    }, { signal: s, capture: !0 }), window.addEventListener("resize", () => this.onResize?.(), { signal: s }), this.focusTrap = kr(this.window), this.focusTrap.activate(), this.window.focus(), requestAnimationFrame(() => this.onResize?.());
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
const Sr = 4, G = [];
function Re(t) {
  const e = G.indexOf(t);
  e >= 0 && G.splice(e, 1), G.push(t);
}
function Rr() {
  const t = G.find((e) => !e.host && !e.ui?.recording);
  return t ? t.hide() : !1;
}
class Or {
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
    return this.ui ? (Re(this), Promise.resolve(this.ui)) : (this.loading ||= this.mount().finally(() => {
      this.loading = null;
    }), this.loading);
  }
  async mount() {
    const { openDirectorWorkbench: e, closeDirectorWorkbench: n } = await import("./chunk-DDfFfUOH.js").then((s) => s.h);
    if (this.disposed) return null;
    for (; G.length >= Sr && Rr(); )
      ;
    this.closeWorkbench = n;
    const r = e(this.runtime);
    return this.runtime.pendingUpstreamResync && (this.runtime.pendingUpstreamResync = !1, r.syncUpstreamInputs?.()), r.root.dataset.inline = "true", r.root.addEventListener("pointerdown", () => Re(this), { capture: !0 }), this.container.append(r.root), this.ui = r, Re(this), this.onLiveChange(!0), r.scheduleResizeAndRender?.(), r;
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
    return n ? $e.open({
      key: this.key,
      nodeId: this.runtime.node.id,
      opener: e,
      createSession: async () => {
        if (this.disposed || this.ui !== n) return null;
        const r = new Nr({
          kind: "director",
          nodeId: this.runtime.node.id,
          title: this.runtime.getSnapshot().sceneName || C("OmniCam Director"),
          onRequestClose: (s) => $e.close(this.key, s),
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
    const n = G.indexOf(this);
    n >= 0 && G.splice(n, 1), e && (this.closeWorkbench(e), e.root.remove());
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = !0, this.visibilityObserver?.disconnect(), this.resizeObserver.disconnect();
    const e = this.host;
    this.host = null, this.runtime.activeWorkbenchHost === e && (this.runtime.activeWorkbenchHost = null), e?.dispose(), this.teardown();
  }
}
function Cr(t) {
  const e = /* @__PURE__ */ new Map();
  function n() {
    for (const [s, a] of e)
      s.hasAttribute("inert") || s.setAttribute("inert", a);
    e.clear();
  }
  function r() {
    const s = t.closest('[data-testid="app-mode-widget-item"]');
    if (!s || t.closest('[data-testid="builder-widget-item"]')) {
      n();
      return;
    }
    for (const [i, o] of e)
      s.contains(i) || (i.hasAttribute("inert") || i.setAttribute("inert", o), e.delete(i));
    let a = t;
    for (; a && s.contains(a) && (a.hasAttribute("inert") && (e.has(a) || e.set(a, a.getAttribute("inert")), a.removeAttribute("inert")), a !== s); )
      a = a.parentElement;
  }
  return { sync: r, dispose: n };
}
const Mr = '[data-testid="app-mode-widget-item"], [data-testid="builder-widget-item"]';
function jr(t, e, n = globalThis) {
  let r = !1, s = null, a = 0;
  const i = Cr(t);
  async function o() {
    if (s = null, r) return;
    const c = ++a;
    if (i.sync(), !(t.isConnected && !!t.closest(Mr))) {
      delete t.dataset.appMode;
      return;
    }
    t.dataset.appMode = "true";
    const _ = t.getBoundingClientRect();
    if (!(!_.width || !_.height))
      try {
        const A = await e.show();
        !r && c === a && t.isConnected && A?.scheduleResizeAndRender?.();
      } catch (A) {
        console.warn("[OmniCam] App viewer mount failed", A);
      }
  }
  function l() {
    r || s !== null || (s = n.requestAnimationFrame(o));
  }
  const m = new n.MutationObserver((c) => {
    c.some((h) => h.type === "attributes" ? h.target === t || h.target.contains?.(t) : [...h.addedNodes, ...h.removedNodes].some((_) => _ === t || _.contains?.(t))) && l();
  });
  m.observe(t.ownerDocument.body, {
    childList: !0,
    subtree: !0,
    attributes: !0,
    attributeFilter: ["inert", "data-testid"]
  });
  const d = new n.ResizeObserver(l);
  return d.observe(t), l(), () => {
    r = !0, a++, m.disconnect(), d.disconnect(), i.dispose(), s !== null && n.cancelAnimationFrame(s), delete t.dataset.appMode;
  };
}
const Dr = `
  .oc-director-node[data-app-mode="true"] {
    display:flex !important; position:relative !important;
    visibility:visible !important; transform:none !important;
    inset:auto !important; opacity:1 !important;
    width:100% !important; min-width:0; height:560px;
    min-height:420px; max-height:80vh; resize:vertical; overflow:hidden;
    box-sizing:border-box;
  }
  .oc-director-node[data-app-mode="true"]>.oc-director-inline {
    min-width:0; min-height:0;
  }
  [data-testid="app-mode-widget-item"] .oc-director-node[data-app-mode="true"] {
    pointer-events:auto !important;
  }
`, Ur = 420, Lr = 6e3;
function Br(t) {
  for (const e of ["state_json", "recording_path", "card_asset"]) {
    const n = t.widgets?.find((r) => r.name === e);
    n && (n.computeSize = () => [0, -4], n.draw = () => {
    }, n.hidden = !0, n.options = { ...n.options || {}, hideInVueNodes: !0 });
  }
}
function $(t) {
  const e = t.getSnapshot(), n = [];
  e.fps && n.push(`${e.fps} fps`), e.durationSeconds && n.push(`${e.durationSeconds.toFixed(1)} s`), e.width && e.height && n.push(`${e.width}x${e.height}`), t.shell?.setTitle(e.sceneName || C("OmniCam Director")), t.shell?.setDirty(e.isDirty), t.shell?.setMeta(n.join("  |  ")), t.shell?.setStatus(
    t.recordNotice || `${e.cameraCount} ${C("cameras")}  |  ${e.objectCount} ${C("objects")}`
  ), t.activeWorkbenchHost?.setTitle(e.sceneName || C("OmniCam Director")), t.activeWorkbenchHost?.setDirty(e.isDirty), t.inlineView?.ui ? (t.shell?.setPreviewVideo(null), t.shell?.setPreview(null)) : t.previewVideoUrl ? t.shell?.setPreviewVideo(t.previewVideoUrl) : (t.shell?.setPreviewVideo(null), t.shell?.setPreview(e.previewDataUrl ?? null));
}
const gt = 240, bt = 135;
function Pr(t, e) {
  try {
    const n = e?.canvas;
    if (!n || !n.width || !n.height) return;
    const r = document.createElement("canvas");
    r.width = gt, r.height = bt;
    const s = r.getContext("2d");
    if (!s) return;
    s.drawImage(n, 0, 0, gt, bt), t.previewDataUrl = r.toDataURL("image/webp", 0.7), $(t);
  } catch (n) {
    console.warn("[OmniCam] Director preview capture failed", n);
  }
}
function xr(t, e) {
  try {
    const n = Kt(Oe, t.node);
    if (n) {
      t.previewVideoUrl = n.url, $(t);
      return;
    }
  } catch (n) {
    console.warn("[OmniCam] Director playblast preview lookup failed", n);
  }
  t.previewVideoUrl = null, Pr(t, e);
}
async function Fr(t) {
  if (t.shellRecording) return;
  t.shellRecording = !0, t.shell.setRecording(!0, "…");
  let e = { ok: !1, message: C("The Director editor could not be started") };
  try {
    const n = await t.inlineView.show();
    n ? (await n.webglReady, await new Promise((r) => requestAnimationFrame(r)), e = await n.makePlayblast({ inline: !0 })) : Ze(t, e.message, "error");
  } catch (n) {
    e = { ok: !1, message: C("Playblast failed: {value1}", { value1: n.message || n }) }, Ze(t, e.message, "error");
  } finally {
    t.shellRecording = !1, t.shell.setRecording(!1), t.shell.setProgress(null), t.recordNotice = e.message, clearTimeout(t.recordNoticeTimer), t.recordNoticeTimer = setTimeout(() => {
      t.recordNotice = "", $(t);
    }, Lr), $(t);
  }
}
function $r(t) {
  if (t.__majoorOmniCamDirectorRuntime) return t.__majoorOmniCamDirectorRuntime;
  const e = new Jt(t, { app: St, api: Oe });
  dr(e);
  try {
    e.agentBridge = br(e, t, Oe);
  } catch (g) {
    console.warn("[OmniCam] Agent bridge unavailable", g);
  }
  Br(t);
  const n = document.createElement("div");
  n.className = "oc-director-node", n.dataset.live = "false";
  const r = document.createElement("div");
  r.className = "oc-director-inline";
  const s = new Or(e, {
    container: r,
    onLiveChange: (g) => {
      n.dataset.live = String(g), $(e);
    },
    onRetire: (g) => xr(e, g)
  });
  e.inlineView = s;
  const a = Ar({
    kind: "director",
    title: C("OmniCam Director"),
    buttonLabel: C("OPEN DIRECTOR"),
    onOpen: (g) => {
      s.expand(g.currentTarget);
    },
    secondaryLabel: C("LIVE VIEW"),
    onSecondary: () => {
      s.show();
    },
    recordLabel: C("● REC"),
    recordTitle: C("Record the playblast without opening the editor"),
    onRecord: () => {
      Fr(e);
    }
  });
  e.shell = a, e.addEventListener("playblastprogress", (g) => {
    if (!e.shellRecording) return;
    const { frame: L, total: I } = g.detail;
    a.setRecording(!0, `${L}/${I}`), a.setProgress(L / I);
  }), n.append(a.root, r);
  const i = document.createElement("style");
  i.textContent = Dr, n.append(i), $(e), e.addEventListener("statechange", () => $(e)), e.addEventListener("statuschange", () => $(e)), e.addEventListener("upstreamchange", () => $(e)), t.__majoorOmniCamDirectorRuntime = e, t.addDOMWidget("majoor_omnicam_director_shell", "omnicam", n, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => Ur
  }), s.showWhenVisible(n);
  const o = jr(n, s), l = () => {
    cancelAnimationFrame(e.restoreFrame), e.restoreFrame = requestAnimationFrame(() => {
      e.disposed || (e.workbench ? (e.workbench.restoreFromWidgets(), e.workbench.syncUpstreamInputs()) : (e.restoreFromWidgetsHeadless(), e.pendingUpstreamResync = !0));
    });
  }, m = t.onConfigure;
  t.onConfigure = function(...g) {
    de(e), e.agentBridge?.invalidateDocument?.(), m?.apply(this, g), l();
  };
  const d = t.onAfterGraphConfigured;
  t.onAfterGraphConfigured = function(...g) {
    d?.apply(this, g), l();
  };
  const c = () => {
    clearTimeout(e.connectionTimer), e.connectionTimer = setTimeout(() => {
      e.disposed || (e.workbench ? e.workbench.syncUpstreamInputs() : e.pendingUpstreamResync = !0, t.setDirtyCanvas?.(!0, !0));
    }, 60);
  }, h = t.onConnectionsChange;
  t.onConnectionsChange = function(...g) {
    h?.apply(this, g), c();
  };
  const _ = Ht(t, c), A = t.onResize;
  t.onResize = function(...g) {
    A?.apply(this, g), e.workbench?.scheduleResizeAndRender?.();
  };
  const b = t.onExecuted;
  t.onExecuted = function(g) {
    b?.apply(this, arguments), e.workbench && (e.workbench.loadExecutionPreview(g), e.workbench.syncUpstreamInputs());
  };
  const v = t.onRemoved;
  return t.onRemoved = function(...g) {
    $e.disposeForNode(t.id), clearTimeout(e.recordNoticeTimer), o(), s.dispose(), _(), cancelAnimationFrame(e.restoreFrame), clearTimeout(e.connectionTimer), e.agentBridge?.dispose?.(), a.dispose(), e.dispose(), v?.apply(this, g);
  }, e;
}
const os = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attachDirectorShell: $r
}, Symbol.toStringTag, { value: "Module" }));
export {
  Gr as C,
  Wt as E,
  At as S,
  u as U,
  jn as a,
  we as b,
  wn as c,
  Ce as d,
  Zr as e,
  as as f,
  ss as g,
  qr as h,
  Hn as i,
  rs as j,
  Fn as k,
  ns as l,
  Yr as m,
  Ze as n,
  es as o,
  Qr as p,
  Ue as q,
  ts as r,
  is as s,
  os as t,
  Xr as w
};
