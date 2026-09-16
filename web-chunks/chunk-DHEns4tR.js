import { app as ut } from "../../scripts/app.js";
import { api as Fe } from "../../scripts/api.js";
import { s as ce, a as de, d as je, b as ht, c as fe, e as _t, l as Pe, n as pe, f as $e, g as Y, m as _e, I as le, D as Et, r as pt, p as gt, t as At, h as bt, i as wt, j as Tt, w as yt, k as ze, o as It, q as Nt, u as V } from "./chunk-Cgt_u7Uc.js";
import { s as Rt, w as kt } from "./chunk-BvpYpyx-.js";
const St = /* @__PURE__ */ new Set(["good", "warning", "bad", "unknown"]);
function Ot(e, t) {
  const n = Math.max(0, Math.floor(Number(t) || 0)), r = Array.from({ length: n }, (a, i) => ({ frame: i, state: "unknown", score: null })), s = e?.solve_health_v1;
  if (!s || !Array.isArray(s.frames)) return r;
  for (const a of s.frames) {
    const i = Number(a?.frame);
    if (!Number.isInteger(i) || i < 0 || i >= r.length) continue;
    const o = St.has(a?.state) ? a.state : "unknown", c = a?.score;
    let h = null;
    if (c != null) {
      const u = Number(c);
      h = Number.isFinite(u) ? Math.max(0, Math.min(1, u)) : null;
    }
    r[i] = { frame: i, state: o, score: h };
  }
  return r;
}
function U(e, t) {
  return e.widgets?.find((n) => n.name === t) ?? null;
}
class Ct extends EventTarget {
  constructor(t, { app: n, api: r } = {}) {
    super(), this.app = n, this.api = r, this.node = t, this.disposed = !1, this.workbench = null, this.pendingUiDirtyMask = 0, this.serializeScheduled = !1, this.serializeFrame = null, this.directorApi = null, this.agentBridge = null, this.workbenchGeneration = 0, this.pendingUpstreamResync = !1, this.stateWidget = U(t, "state_json"), this.recordingWidget = U(t, "recording_path"), this.cardWidget = U(t, "card_asset"), this.widthWidget = U(t, "width"), this.heightWidget = U(t, "height"), this.fpsWidget = U(t, "fps"), this.durationWidget = U(t, "duration_seconds"), this.modeWidget = U(t, "render_mode");
    let s = null;
    try {
      s = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
    }
    this.state = ce(s), this.sceneBaseline = this.stateWidget?.value || JSON.stringify(this.state), this.sceneName = this.state.metadata?.scene_name || "", this.frame = 0, this.camera = de(this.state, 0), this.directorRevision = 0, this.renderRevision = 0;
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
      objectCount: t.objects?.length ?? 0
    };
  }
  /** Immediate, synchronous widget flush -- reuses the existing headless-safe serializer. */
  flushToWidgets({ immediate: t = !1 } = {}) {
    t && (cancelAnimationFrame(this.serializeFrame), this.serializeScheduled = !1), Rt(this);
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
    this.state = ce(t), this.camera = de(this.state, Math.min(this.frame, this.state.duration_frames - 1)), this.sceneBaseline = this.stateWidget?.value ?? this.sceneBaseline, this.sceneName = this.state.metadata?.scene_name || "", this.dispatchEvent(new CustomEvent("upstreamchange", { detail: { reason: "restore" } }));
  }
  /** Apply a state mutation headlessly, whether or not a workbench is open. */
  mutate(t, { reason: n = "mutation", dirty: r = 0 } = {}) {
    t(this.state), this.scheduleSerialize(n), r && this.requestUiUpdate(r, n);
  }
  replaceState(t, { reason: n = "replace" } = {}) {
    this.state = ce(t), this.sceneName = this.state.metadata?.scene_name || "", this.scheduleSerialize(n), this.dispatchEvent(new CustomEvent("upstreamchange", { detail: { reason: n } }));
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
const F = 1, Ke = 50, v = 120, H = 160, vt = Object.freeze(["perspective", "orthographic"]), _ = Object.freeze({
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
}), st = Object.freeze(Object.values(_)), I = Object.freeze({
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
}), jt = Object.freeze(Object.values(I));
class d extends Error {
  constructor(t, n, r = null, s = null) {
    super(n), this.name = "DirectorApiError", this.code = t, this.operationIndex = r, this.details = s;
  }
}
const Mt = 25, He = 100;
function J(e, t) {
  const n = e?.offset === void 0 ? 0 : Number(e.offset), r = e?.limit === void 0 ? Mt : Number(e.limit);
  if (!Number.isInteger(n) || n < 0)
    throw new d(
      "BAD_QUERY",
      "offset must be a non-negative integer"
    );
  if (!Number.isInteger(r) || r < 1 || r > He)
    throw new d(
      "BAD_QUERY",
      `limit must be between 1 and ${He}`
    );
  return {
    offset: n,
    limit: r,
    end: Math.min(t, n + r)
  };
}
function ge(e) {
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
function Dt(e) {
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
function B(e) {
  return typeof structuredClone == "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e));
}
function Lt(e) {
  return Number.isInteger(e.directorRevision) ? Math.max(0, e.directorRevision) : 0;
}
function N(e, t) {
  return {
    ...t,
    revision: Lt(e)
  };
}
function Ut(e, t) {
  const n = e.state || {};
  switch (t?.type) {
    case I.SCENE_GET:
      return N(e, {
        version: 1,
        type: t.type,
        scene: B({
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
    case I.CAMERA_GET: {
      const r = t.cameraId || n.active_camera_id, s = (n.cameras || []).find((a) => a.id === r);
      if (!s) throw new d("UNKNOWN_CAMERA", `Unknown camera: ${r}`);
      return N(e, { version: 1, type: t.type, camera: B(s) });
    }
    case I.CAMERA_LIST: {
      const r = n.cameras || [], { offset: s, limit: a, end: i } = J(t, r.length);
      return N(e, {
        version: 1,
        type: t.type,
        items: r.slice(s, i).map(Dt),
        total: r.length,
        offset: s,
        limit: a
      });
    }
    case I.TIMELINE_GET:
      return N(e, {
        version: 1,
        type: t.type,
        timeline: B({
          frame: e.frame ?? 0,
          duration_frames: n.duration_frames,
          fps: n.fps,
          playback_range: Array.isArray(n.playback_range) ? n.playback_range : null
        })
      });
    case I.SELECTION_GET:
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
    case I.HEALTH_GET:
      return N(e, {
        version: 1,
        type: t.type,
        frames: Ot(n.metadata, n.duration_frames)
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
      return N(e, { version: 1, type: t.type, items: B(s), total: s.length });
    }
    case I.ASSET_GET: {
      const r = (n.objects || []).find((s) => s.id === t.objectId);
      if (!r) throw new d("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      return N(e, {
        version: 1,
        type: t.type,
        asset: B({
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
      return N(e, {
        version: 1,
        type: t.type,
        rig: B({
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
      return N(e, {
        version: 1,
        type: t.type,
        pose: B({
          objectId: r.id,
          preset_id: s.preset_id || "neutral",
          root_offset: Array.isArray(s.root_offset) ? s.root_offset : [0, 0, 0],
          joints: s.joints || {},
          has_motion: !!r.character?.motion
        })
      });
    }
    case I.OBJECT_LIST: {
      const r = n.objects || [], { offset: s, limit: a, end: i } = J(t, r.length);
      return N(e, {
        version: 1,
        type: t.type,
        items: r.slice(s, i).map(ge),
        total: r.length,
        offset: s,
        limit: a
      });
    }
    case I.OBJECT_GET: {
      const r = (n.objects || []).find((s) => s.id === t.objectId);
      if (!r) throw new d("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      return N(e, {
        version: 1,
        type: t.type,
        object: B({
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
      const r = String(t.text || "").trim().toLowerCase(), s = Array.isArray(t.tags) ? t.tags.map((E) => String(E).toLowerCase()) : [], a = t.asset_kind !== void 0 ? t.asset_kind : null, i = t.type_ !== void 0 ? t.type_ : t.objectType !== void 0 ? t.objectType : null, o = typeof t.enabled == "boolean" ? t.enabled : null, c = (E) => {
        if (r && ![E.id, E.name || "", ...Array.isArray(E.tags) ? E.tags : []].map((A) => String(A).toLowerCase()).some((A) => A.includes(r)))
          return !1;
        if (s.length) {
          const y = (Array.isArray(E.tags) ? E.tags : []).map((A) => String(A).toLowerCase());
          if (!s.every((A) => y.includes(A))) return !1;
        }
        return !(a !== null && E.asset_kind !== a || i !== null && E.type !== i || o !== null && E.enabled !== !1 !== o);
      }, h = (n.objects || []).filter(c), { offset: u, limit: m, end: f } = J(t, h.length);
      return N(e, {
        version: 1,
        type: t.type,
        items: h.slice(u, f).map(ge),
        total: h.length,
        offset: u,
        limit: m
      });
    }
    case I.CHARACTER_LIST: {
      const r = (n.objects || []).filter((o) => o.asset_kind === "character"), { offset: s, limit: a, end: i } = J(t, r.length);
      return N(e, {
        version: 1,
        type: t.type,
        items: r.slice(s, i).map((o) => ({
          ...ge(o),
          has_motion: !!o.character?.motion,
          pose_preset: o.character?.pose?.preset_id || null
        })),
        total: r.length,
        offset: s,
        limit: a
      });
    }
    case I.SHOT_LIST: {
      const r = n.sequence?.cuts || n.cuts || [], s = Math.max(0, (n.duration_frames || 1) - 1), a = r.map((h, u) => ({
        index: u,
        start: h.start,
        end: u + 1 < r.length ? r[u + 1].start - 1 : s,
        camera_id: h.camera_id
      })), { offset: i, limit: o, end: c } = J(t, a.length);
      return N(e, {
        version: 1,
        type: t.type,
        items: a.slice(i, c),
        total: a.length,
        offset: i,
        limit: o
      });
    }
    case I.KEYFRAME_LIST: {
      const r = t.cameraId || n.active_camera_id, s = (n.cameras || []).find((h) => h.id === r);
      if (!s) throw new d("UNKNOWN_CAMERA", `Unknown camera: ${r}`);
      const a = s.keyframes || [], { offset: i, limit: o, end: c } = J(t, a.length);
      return N(e, {
        version: 1,
        type: t.type,
        cameraId: s.id,
        items: a.slice(i, c).map((h) => ({
          frame: h.frame,
          interpolation: h.interpolation,
          position: Array.isArray(h.camera?.position) ? [...h.camera.position] : [0, 0, 0]
        })),
        total: a.length,
        offset: i,
        limit: o
      });
    }
    default:
      throw new d("UNKNOWN_QUERY", `Unsupported query: ${t?.type}`);
  }
}
const at = /* @__PURE__ */ new Set([
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
function Ee(e, t, n = "") {
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
function Bt(e) {
  const t = e === "ground", n = e === "human", r = e === "card", s = e === "sun_light", a = e === "point_light", i = e === "spot_light";
  let o;
  t ? o = [12, 0.1, 12] : n ? o = [0.7, 1.8, 0.4] : r ? o = [2, 3] : o = [1.5, 1.5, 1.5];
  let c = [0, 0, 0], h = [0, 0, 0], u = "#8c929b", m, f, E, y;
  return s ? (c = [5, 8.5, 4], h = [-55, 35, 0], u = "#fff6ec", m = 2.2, f = !0) : a ? (c = [0, 3, 0], u = "#ffffff", m = 2, f = !1) : i && (c = [0, 4, 0], h = [-60, 0, 0], u = "#ffffff", m = 3, E = 45, y = 0.25, f = !0), {
    position: c,
    rotation: h,
    size: o,
    color: u,
    material_mode: t ? "checker" : "textured",
    ...m !== void 0 ? { intensity: m } : {},
    ...f !== void 0 ? { cast_shadow: f } : {},
    ...E !== void 0 ? { cone_angle: E } : {},
    ...y !== void 0 ? { penumbra: y } : {}
  };
}
function Ft(e, t) {
  e.cameras ||= [];
  const n = new Set(e.cameras.map((i) => i.id)), r = Ee(n, "camera", t.id), s = { ...ht(), ...t.camera || {} }, a = {
    id: r,
    name: t.name || r,
    color: "#4aa3ef",
    locked: !1,
    muted: !1,
    solo: !1,
    camera: s,
    keyframes: [{ frame: 0, camera: fe(s), interpolation: t.interpolation || "ease" }]
  };
  return e.cameras.push(a), { cameraId: r };
}
function Pt(e, t) {
  const n = (e.cameras || []).find((i) => i.id === t.cameraId);
  if (!n) throw new d("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  const r = new Set(e.cameras.map((i) => i.id)), s = Ee(r, "camera", t.id), a = JSON.parse(JSON.stringify(n));
  return a.id = s, a.name = t.name || `${n.name || n.id} copy`, e.cameras.push(a), { cameraId: s };
}
function $t(e, t) {
  const n = e.cameras || [], r = n.findIndex((a) => a.id === t.cameraId);
  if (r === -1) throw new d("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  if (n.length <= 1) throw new d("LAST_CAMERA", "cannot delete the only camera");
  if (n[r].locked) throw new d("ENTITY_LOCKED", `${t.cameraId} is locked`);
  if ((e.sequence?.cuts || []).some((a) => a.camera_id === t.cameraId))
    throw new d("CAMERA_IN_USE", `${t.cameraId} is referenced by a cut`);
  return n.splice(r, 1), e.active_camera_id === t.cameraId && (e.active_camera_id = n[0].id), e.playblast_camera_id === t.cameraId && (e.playblast_camera_id = n[0].id), { cameraId: t.cameraId };
}
function zt(e, t) {
  const n = (e.cameras || []).find((r) => r.id === t.cameraId);
  if (!n) throw new d("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  return n.name = String(t.name || "").trim().slice(0, 80) || n.name, { cameraId: n.id };
}
function Kt(e, t) {
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
function Ht(e, t) {
  if (!at.has(t.objectType))
    throw new d("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${t.objectType}`);
  e.objects ||= [];
  const n = new Set(e.objects.map((i) => i.id)), r = Ee(n, t.objectType, t.id), s = Bt(t.objectType), a = {
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
function Jt(e, t) {
  const n = (e.objects || []).find((c) => c.id === t.objectId);
  if (!n) throw new d("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  const r = new Set(e.objects.map((c) => c.id)), s = Ee(r, n.type || "object", t.id), a = Array.isArray(t.offset) ? t.offset : [0.35, 0, 0.35], i = JSON.parse(JSON.stringify(n));
  i.id = s, i.name = t.name || `${n.name || n.id} copy`, i.locked = !1;
  const o = Array.isArray(n.position) ? n.position : [0, 0, 0];
  return i.position = [o[0] + a[0], o[1] + a[1], o[2] + a[2]], e.objects.push(i), { objectId: s, resourceRefresh: !!n.asset_id };
}
function Wt(e, t) {
  const n = e.objects || [], r = n.findIndex((a) => a.id === t.objectId);
  if (r === -1) throw new d("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  const s = n[r];
  if (s.id === "subject") throw new d("PROTECTED_OBJECT", "the subject object cannot be deleted");
  if (s.locked) throw new d("ENTITY_LOCKED", `${t.objectId} is locked`);
  for (const a of n)
    a.parent_id === t.objectId && (a.parent_id = null);
  return n.splice(r, 1), { objectId: t.objectId, resourceRefresh: !!s.asset_id };
}
function Gt(e, t) {
  const n = (e.objects || []).find((r) => r.id === t.objectId);
  if (!n) throw new d("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  return n.name = String(t.name || "").trim().slice(0, 80) || n.name, { objectId: n.id };
}
function Vt(e, t) {
  const n = (e.objects || []).find((o) => o.id === t.objectId);
  if (!n) throw new d("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  if (t.parentId === null || t.parentId === void 0)
    return n.parent_id = null, { objectId: n.id };
  if (t.parentId === t.objectId)
    throw new d("INVALID_PARENT", "an object cannot be its own parent");
  const r = (e.objects || []).find((o) => o.id === t.parentId);
  if (!r) throw new d("UNKNOWN_OBJECT", `${t.parentId} does not exist`);
  const s = new Map(e.objects.map((o) => [o.id, o]));
  let a = r;
  const i = /* @__PURE__ */ new Set();
  for (; a; ) {
    if (a.id === t.objectId)
      throw new d("INVALID_PARENT", "assigning this parent would create a cycle");
    if (i.has(a.id)) break;
    i.add(a.id), a = a.parent_id ? s.get(a.parent_id) : null;
  }
  return n.parent_id = t.parentId, { objectId: n.id };
}
function Yt(e, t) {
  e.sequence ||= je();
  const n = e.sequence.cuts ||= [], r = Math.max(0, (e.duration_frames || 1) - 1);
  if (!Number.isInteger(t.start) || t.start < 0 || t.start > r)
    throw new d("FRAME_OUT_OF_RANGE", `cut start must be within 0..${r}`);
  if (!(e.cameras || []).find((i) => i.id === t.cameraId)) throw new d("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  const a = n.find((i) => i.start === t.start);
  return a ? a.camera_id = t.cameraId : n.push({ start: t.start, camera_id: t.cameraId }), n.sort((i, o) => i.start - o.start), e.sequence.enabled = !0, { start: t.start, cameraId: t.cameraId };
}
function xt(e, t) {
  e.sequence ||= je();
  const n = e.sequence.cuts || [], r = n.findIndex((s) => s.start === t.start);
  if (r === -1) throw new d("UNKNOWN_CUT", `no cut starts at frame ${t.start}`);
  return n.splice(r, 1), n.length && (n[0].start = 0), e.sequence.enabled = n.length > 0, { start: t.start };
}
function qt(e, t) {
  e.sequence ||= je();
  const r = (e.sequence.cuts || []).find((a) => a.start === t.start);
  if (!r) throw new d("UNKNOWN_CUT", `no cut starts at frame ${t.start}`);
  if (!(e.cameras || []).find((a) => a.id === t.cameraId)) throw new d("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  return r.camera_id = t.cameraId, { start: t.start, cameraId: t.cameraId };
}
const Me = [0, 1, 0], we = [
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
], hr = {
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
function Qt(e, t) {
  const n = [...e.position], r = Array.isArray(t) ? [...t] : [...e.target], s = _t(r, n), a = Pe(s) > 1e-9 ? pe(s) : [0, 0, -1];
  let i = $e(a, Me);
  Pe(i) < 1e-6 && (i = [1, 0, 0]), i = pe(i);
  const o = pe($e(i, a));
  return { position: n, target: r, forward: a, right: i, up: o };
}
function Xt(e) {
  return {
    fov: e.fov,
    roll: e.roll || 0,
    zoom: e.zoom || 1,
    near: e.near,
    far: e.far,
    camera_type: e.camera_type || "perspective"
  };
}
function Zt(e) {
  return [
    { position: e.position, target: e.target },
    { position: e.position, target: e.target }
  ];
}
function Je(e, t, n) {
  const r = n === "out" ? -1 : 1, s = Y(e.position, _e(e.forward, r * t));
  return [
    { position: e.position, target: e.target },
    { position: s, target: e.target }
  ];
}
function We(e, t, n) {
  const r = n === "right" ? 1 : -1, s = _e(e.right, r * t);
  return [
    { position: e.position, target: e.target },
    { position: Y(e.position, s), target: Y(e.target, s) }
  ];
}
function Ge(e, t, n) {
  const s = _e(Me, (n === "down" ? -1 : 1) * t);
  return [
    { position: e.position, target: e.target },
    { position: Y(e.position, s), target: Y(e.target, s) }
  ];
}
function Ve(e, t, n) {
  const r = n === "down" ? -1 : 1, s = Y(e.position, _e(Me, r * t));
  return [
    { position: e.position, target: e.target },
    { position: s, target: e.target }
  ];
}
function ne(e, { degrees: t = 180, direction: n = "cw", radius: r, radiusEnd: s, heightOffset: a = 0, samples: i = 5, close: o = !1 } = {}) {
  const c = e.target, h = e.position[0] - c[0], u = e.position[2] - c[2], m = Math.hypot(h, u) || 1e-6, f = Math.atan2(u, h), E = Number.isFinite(r) ? r : m, y = Number.isFinite(s) ? s : E, A = n === "ccw" ? 1 : -1, S = Math.abs(t) * Math.PI / 180 * A, C = Math.max(2, Math.round(i)), q = e.position[1] + a, b = [];
  for (let g = 0; g < C; g += 1) {
    const T = o ? g / C : g / (C - 1), O = f + S * T, j = E + (y - E) * T;
    b.push({
      position: [c[0] + Math.cos(O) * j, q, c[2] + Math.sin(O) * j],
      target: [...c]
    });
  }
  return b;
}
function en({ type: e, camera: t, target: n, startFrame: r, endFrame: s, params: a = {} } = {}) {
  if (!we.includes(e)) return { ok: !1, reason: "unknown_preset" };
  if (!t || !Array.isArray(t.position) || !Array.isArray(t.target)) return { ok: !1, reason: "invalid_camera" };
  const i = Math.round(Number(r)), o = Math.round(Number(s));
  if (!Number.isFinite(i) || !Number.isFinite(o) || o <= i) return { ok: !1, reason: "invalid_range" };
  const c = Qt(t, n), h = Number(a.distance) > 0 ? Number(a.distance) : 1, u = (A, S, C) => ({
    degrees: Number(a.degrees) || A,
    direction: S,
    radius: Number.isFinite(Number(a.radius)) ? Number(a.radius) : void 0,
    heightOffset: Number(a.heightOffset) || 0,
    samples: Number(a.samples) || C
  });
  let m;
  switch (e) {
    case "static":
      m = Zt(c);
      break;
    case "dolly_in":
      m = Je(c, h, "in");
      break;
    case "dolly_out":
      m = Je(c, h, "out");
      break;
    case "truck_left":
      m = We(c, h, "left");
      break;
    case "truck_right":
      m = We(c, h, "right");
      break;
    case "pedestal_up":
      m = Ge(c, h, "up");
      break;
    case "pedestal_down":
      m = Ge(c, h, "down");
      break;
    case "crane_up":
      m = Ve(c, h, "up");
      break;
    case "crane_down":
      m = Ve(c, h, "down");
      break;
    case "arc_left":
      m = ne(c, u(45, "ccw", 5));
      break;
    case "arc_right":
      m = ne(c, u(45, "cw", 5));
      break;
    case "orbit":
      m = ne(c, { ...u(180, a.direction === "ccw" ? "ccw" : "cw", 5), close: !!a.close });
      break;
    case "spiral":
      m = ne(c, {
        ...u(360, a.direction === "ccw" ? "ccw" : "cw", 8),
        radiusEnd: Number.isFinite(Number(a.radiusEnd)) ? Number(a.radiusEnd) : void 0
      });
      break;
    default:
      return { ok: !1, reason: "unknown_preset" };
  }
  if (o - i + 1 < m.length) return { ok: !1, reason: "insufficient_frame_slots" };
  const f = m.map((A, S) => m.length <= 1 ? i : Math.round(i + (o - i) * S / (m.length - 1)));
  for (let A = 1; A < f.length; A += 1) f[A] <= f[A - 1] && (f[A] = f[A - 1] + 1);
  for (let A = f.length - 1; A > 0; A -= 1) f[A] > o - (f.length - 1 - A) && (f[A] = o - (f.length - 1 - A));
  f[0] = i, f[f.length - 1] = o;
  const E = Xt(t);
  return { ok: !0, keyframes: m.map((A, S) => ({
    frame: f[S],
    interpolation: "smooth",
    camera: { position: A.position, target: A.target, ...E }
  })) };
}
const tn = 2048;
function nn(e, t) {
  const n = e._directorApiTxIds ||= /* @__PURE__ */ new Set();
  for (n.has(t) && n.delete(t), n.add(t); n.size > tn; )
    n.delete(n.values().next().value);
}
function rn(e, t) {
  return !!e._directorApiTxIds?.has(t);
}
const z = (e) => typeof e == "number" && Number.isFinite(e);
function w(e, t, n) {
  if (!Array.isArray(e) || e.length !== 3 || !e.every(z))
    throw new d("BAD_VECTOR", `${t} must be [x,y,z] of finite numbers`, n);
}
function R(e, t, n) {
  if (!Number.isInteger(e) || e < 0)
    throw new d("BAD_FRAME", `${t} must be a non-negative integer frame`, n);
}
function p(e, t, n, r) {
  if (typeof e != "string" || e.length === 0)
    throw new d("BAD_ID", `${t} must be a non-empty string`, n);
  if (r !== void 0 && e.length > r)
    throw new d("BAD_ID", `${t} exceeds ${r} characters`, n);
}
function G(e, t, n) {
  if (!z(e))
    throw new d("BAD_VALUE", `${t} must be a finite number`, n);
}
function Ye(e, t, n) {
  if (!Array.isArray(e) || e.length === 0 || !e.every((r) => Number.isInteger(r) && r >= 0))
    throw new d("BAD_VALUE", `${t} must be a non-empty array of non-negative integer frames`, n);
}
const sn = /* @__PURE__ */ new Set(["translate", "rotate", "scale"]), an = /* @__PURE__ */ new Set([
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
function on(e, t) {
  for (const n of Object.keys(e))
    if (!an.has(n))
      throw new d("BAD_VALUE", `camera.create: unsupported camera field "${n}"`, t);
  if (e.position !== void 0 && w(e.position, "camera.position", t), e.target !== void 0 && w(e.target, "camera.target", t), e.up !== void 0 && w(e.up, "camera.up", t), e.fov !== void 0 && (G(e.fov, "camera.fov", t), e.fov < 1 || e.fov > 179))
    throw new d("BAD_VALUE", "camera.fov must be within 1..179", t);
  if (e.roll !== void 0 && G(e.roll, "camera.roll", t), e.zoom !== void 0 && (G(e.zoom, "camera.zoom", t), e.zoom <= 0))
    throw new d("BAD_VALUE", "camera.zoom must be > 0", t);
  if (e.near !== void 0 && (G(e.near, "camera.near", t), e.near <= 0))
    throw new d("BAD_VALUE", "camera.near must be > 0", t);
  if (e.far !== void 0) {
    G(e.far, "camera.far", t);
    const n = e.near === void 0 ? Et : e.near;
    if (e.far <= n)
      throw new d("BAD_VALUE", "camera.far must be greater than camera.near", t);
  }
  if (e.camera_type !== void 0 && !vt.includes(e.camera_type))
    throw new d("BAD_VALUE", `Unsupported camera_type: ${e.camera_type}`, t);
}
function cn(e, t) {
  if (!e || typeof e != "object" || Array.isArray(e))
    throw new d("BAD_OPERATION", "operation must be an object", t);
  const { type: n } = e;
  if (!st.includes(n))
    throw new d("UNKNOWN_OPERATION", `Unknown operation type: ${n}`, t);
  switch (n) {
    case _.ASSET_INSTANTIATE: {
      const r = e.asset;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new d("BAD_VALUE", "asset.instantiate needs a resolved asset object", t);
      if (p(r.id, "asset.id", t), p(r.kind, "asset.kind", t), String(r.id).length > 120 || String(r.kind).length > 32)
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
      e.point !== void 0 && w(e.point, "point", t), e.id !== void 0 && p(e.id, "id", t);
      break;
    }
    case _.CAMERA_SET_ACTIVE:
      p(e.cameraId, "cameraId", t);
      break;
    case _.CAMERA_SET_LOCKED:
      if (p(e.cameraId, "cameraId", t), typeof e.value != "boolean")
        throw new d("BAD_VALUE", "camera.set_locked needs a boolean value", t);
      break;
    case _.CAMERA_CREATE:
      if (e.id !== void 0 && p(e.id, "id", t, v), e.name !== void 0 && p(e.name, "name", t, H), e.camera !== void 0) {
        if (typeof e.camera != "object" || Array.isArray(e.camera) || e.camera === null)
          throw new d("BAD_VALUE", "camera.create camera must be an object", t);
        on(e.camera, t);
      }
      if (e.interpolation !== void 0 && !le.includes(e.interpolation))
        throw new d("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      break;
    case _.CAMERA_DUPLICATE:
      p(e.cameraId, "cameraId", t, v), e.id !== void 0 && p(e.id, "id", t, v), e.name !== void 0 && p(e.name, "name", t, H);
      break;
    case _.CAMERA_DELETE:
    case _.CAMERA_SET_PLAYBLAST:
      p(e.cameraId, "cameraId", t, v);
      break;
    case _.CAMERA_RENAME:
      p(e.cameraId, "cameraId", t, v), p(e.name, "name", t, H);
      break;
    case _.OBJECT_CREATE:
      if (p(e.objectType, "objectType", t), !at.has(e.objectType))
        throw new d("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${e.objectType}`, t);
      if (e.asset !== void 0 || e.url !== void 0 || e.path !== void 0)
        throw new d("BAD_VALUE", "object.create does not accept asset/url/path -- use asset.instantiate", t);
      e.id !== void 0 && p(e.id, "id", t, v), e.name !== void 0 && p(e.name, "name", t, H), e.position !== void 0 && w(e.position, "position", t), e.rotation !== void 0 && w(e.rotation, "rotation", t);
      break;
    case _.OBJECT_DUPLICATE:
      p(e.objectId, "objectId", t, v), e.id !== void 0 && p(e.id, "id", t, v), e.name !== void 0 && p(e.name, "name", t, H), e.offset !== void 0 && w(e.offset, "offset", t);
      break;
    case _.OBJECT_DELETE:
      p(e.objectId, "objectId", t, v);
      break;
    case _.OBJECT_RENAME:
      p(e.objectId, "objectId", t, v), p(e.name, "name", t, H);
      break;
    case _.OBJECT_SET_PARENT:
      p(e.objectId, "objectId", t, v), e.parentId !== null && e.parentId !== void 0 && p(e.parentId, "parentId", t, v);
      break;
    case _.CAMERA_TRANSFORM:
      if (e.cameraId !== void 0 && p(e.cameraId, "cameraId", t), e.position !== void 0 && w(e.position, "position", t), e.target !== void 0 && w(e.target, "target", t), e.frame !== void 0 && R(e.frame, "frame", t), e.position === void 0 && e.target === void 0)
        throw new d("EMPTY_OPERATION", "camera.transform needs position and/or target", t);
      break;
    case _.CAMERA_LOOK_AT:
      if (e.cameraId !== void 0 && p(e.cameraId, "cameraId", t), e.point !== void 0 && w(e.point, "point", t), e.objectId !== void 0 && e.objectId !== null && p(e.objectId, "objectId", t), e.point === void 0 && e.objectId === void 0)
        throw new d("EMPTY_OPERATION", "camera.look_at needs a point or an objectId", t);
      break;
    case _.OBJECT_TRANSFORM:
      if (p(e.objectId, "objectId", t), e.position !== void 0 && w(e.position, "position", t), e.rotation !== void 0 && w(e.rotation, "rotation", t), e.scale !== void 0 && w(e.scale, "scale", t), e.position === void 0 && e.rotation === void 0 && e.scale === void 0)
        throw new d("EMPTY_OPERATION", "object.transform needs position, rotation and/or scale", t);
      break;
    case _.OBJECT_SET_ENABLED:
    case _.OBJECT_SET_LOCKED:
      if (p(e.objectId, "objectId", t), typeof e.value != "boolean")
        throw new d("BAD_VALUE", `${n} needs a boolean value`, t);
      break;
    case _.OBJECT_SET_TAGS:
      if (p(e.objectId, "objectId", t), !Array.isArray(e.tags) || e.tags.some((r) => typeof r != "string"))
        throw new d("BAD_VALUE", "object.set_tags needs a string array", t);
      if (e.tags.length > 64)
        throw new d("BAD_VALUE", "object.set_tags: too many tags", t);
      break;
    case _.OBJECT_SET_ANNOTATION:
      if (p(e.objectId, "objectId", t), e.annotation !== null && (typeof e.annotation != "object" || Array.isArray(e.annotation)))
        throw new d("BAD_VALUE", "object.set_annotation needs an object or null", t);
      break;
    case _.CHARACTER_SET_POSE:
      if (p(e.objectId, "objectId", t), e.pose !== null && (typeof e.pose != "object" || Array.isArray(e.pose)))
        throw new d("BAD_VALUE", "character.set_pose needs a pose object or null", t);
      break;
    case _.CHARACTER_SET_JOINT_ROTATION:
      if (p(e.objectId, "objectId", t), p(e.joint, "joint", t), !Array.isArray(e.rotation) || e.rotation.length !== 4 || !e.rotation.every(z))
        throw new d("BAD_QUATERNION", "rotation must be [x,y,z,w] of finite numbers", t);
      break;
    case _.CHARACTER_SET_MOTION: {
      p(e.objectId, "objectId", t);
      const r = e.motion;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new d("BAD_VALUE", "character.set_motion needs a motion object", t);
      p(r.clip_id, "motion.clip_id", t);
      for (const s of ["start_frame", "end_frame", "speed", "offset_seconds"])
        if (r[s] !== void 0 && !z(r[s]))
          throw new d("BAD_VALUE", `motion.${s} must be a finite number`, t);
      if (z(r.start_frame) && z(r.end_frame) && r.end_frame > 0 && r.end_frame <= r.start_frame)
        throw new d("BAD_MOTION_RANGE", "motion end_frame is not after start_frame", t);
      break;
    }
    case _.CHARACTER_CLEAR_MOTION:
      p(e.objectId, "objectId", t);
      break;
    case _.KEYFRAME_UPSERT:
      if (e.cameraId !== void 0 && p(e.cameraId, "cameraId", t), R(e.frame, "frame", t), e.interpolation !== void 0 && !le.includes(e.interpolation))
        throw new d("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      if (e.camera !== void 0) {
        if (!e.camera || typeof e.camera != "object")
          throw new d("BAD_VALUE", "keyframe.upsert camera must be an object", t);
        e.camera.position !== void 0 && w(e.camera.position, "camera.position", t), e.camera.target !== void 0 && w(e.camera.target, "camera.target", t);
        for (const r of ["fov", "roll", "zoom", "near", "far"])
          if (e.camera[r] !== void 0 && !z(e.camera[r]))
            throw new d("BAD_VALUE", `camera.${r} must be finite`, t);
      }
      break;
    case _.KEYFRAME_REMOVE:
      e.cameraId !== void 0 && p(e.cameraId, "cameraId", t), R(e.frame, "frame", t);
      break;
    case _.KEYFRAME_SET_INTERPOLATION:
      if (e.cameraId !== void 0 && p(e.cameraId, "cameraId", t), R(e.frame, "frame", t), !le.includes(e.interpolation))
        throw new d("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      break;
    case _.TIMELINE_SET_RANGE:
      if (R(e.start, "start", t), R(e.end, "end", t), e.end < e.start)
        throw new d("BAD_RANGE", "range end is before start", t);
      break;
    case _.TIMELINE_SET_DURATION:
      if (!Number.isInteger(e.frames) || e.frames < 1)
        throw new d("BAD_VALUE", "timeline.set_duration needs frames >= 1", t);
      break;
    case _.CUT_UPSERT:
      R(e.start, "start", t), p(e.cameraId, "cameraId", t);
      break;
    case _.CUT_REMOVE:
      R(e.start, "start", t);
      break;
    case _.CUT_SET_CAMERA:
      R(e.start, "start", t), p(e.cameraId, "cameraId", t);
      break;
    case _.CAMERA_PATH_TRANSFORM_KEYS: {
      e.cameraId !== void 0 && p(e.cameraId, "cameraId", t), Ye(e.frames, "frames", t);
      const r = e.transform;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new d("BAD_VALUE", "camera.path.transform_keys needs a transform object", t);
      if (!sn.has(r.mode))
        throw new d("BAD_VALUE", "transform.mode must be translate, rotate or scale", t);
      r.mode === "translate" ? w(r.delta, "transform.delta", t) : r.mode === "scale" ? w(r.factors, "transform.factors", t) : w(r.rotationDeg, "transform.rotationDeg", t), r.origin !== void 0 && w(r.origin, "transform.origin", t);
      break;
    }
    case _.CAMERA_PATH_INSERT_KEY:
      e.cameraId !== void 0 && p(e.cameraId, "cameraId", t), R(e.leftFrame, "leftFrame", t), R(e.rightFrame, "rightFrame", t), e.t !== void 0 && G(e.t, "t", t);
      break;
    case _.CAMERA_PATH_DELETE_KEYS:
      e.cameraId !== void 0 && p(e.cameraId, "cameraId", t), Ye(e.frames, "frames", t);
      break;
    case _.CAMERA_PATH_REDISTRIBUTE_TIMING:
      e.cameraId !== void 0 && p(e.cameraId, "cameraId", t), e.startFrame !== void 0 && R(e.startFrame, "startFrame", t), e.endFrame !== void 0 && R(e.endFrame, "endFrame", t);
      break;
    case _.CAMERA_PATH_APPLY_PRESET:
      if (e.cameraId !== void 0 && p(e.cameraId, "cameraId", t), !we.includes(e.presetType))
        throw new d("BAD_VALUE", `presetType must be one of: ${we.join(", ")}`, t);
      if (R(e.startFrame, "startFrame", t), R(e.endFrame, "endFrame", t), e.endFrame <= e.startFrame)
        throw new d("BAD_RANGE", "camera.path.apply_preset endFrame must be after startFrame", t);
      if (e.target !== void 0 && w(e.target, "target", t), e.params !== void 0 && (typeof e.params != "object" || Array.isArray(e.params)))
        throw new d("BAD_VALUE", "camera.path.apply_preset params must be an object", t);
      break;
    default:
      throw new d("UNKNOWN_OPERATION", `Unknown operation type: ${n}`, t);
  }
}
function ln(e, t) {
  if (!t || typeof t != "object" || Array.isArray(t))
    throw new d("BAD_TRANSACTION", "transaction must be an object");
  if (t.version !== F)
    throw new d("UNSUPPORTED_VERSION", `Unsupported API version: ${t.version}`);
  if (typeof t.id != "string" || t.id.length === 0)
    throw new d("BAD_TRANSACTION_ID", "transaction id must be a non-empty string");
  if (rn(e, t.id))
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
  return t.operations.forEach((n, r) => cn(n, r)), {
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
function _r(e = 0, t = 0) {
  return (e | t) >>> 0;
}
function Er(e, t) {
  return (e & t) !== 0;
}
const dn = "omnicam/library", fn = "majoor_omnicam/blockout_library", mn = Object.freeze({
  "omnicam.helper.human_lowpoly": "human",
  "omnicam.helper.null": "null"
});
function un(e, t) {
  if (!Array.isArray(e) || e.length < 3) return [...t];
  const n = e.slice(0, 3).map((r) => Number(r));
  return n.every((r) => Number.isFinite(r)) ? n : [...t];
}
function hn(e) {
  return e.file ? `${e.source === "legacy" ? fn : dn}/${e.file} [input]` : "";
}
function xe(e, t, n) {
  const r = e || "asset";
  let s = `${r}_${n}`, a = 2;
  for (; t && t.has(s); ) s = `${r}_${n}_${a++}`;
  return s;
}
function _n(e) {
  return {
    rig_profile: !!(e.rig && Object.keys(e.rig.bone_map || {}).length) ? e.rig.profile || "omnicam_humanoid_v1" : null,
    pose: { preset_id: "neutral", root_offset: [0, 0, 0], joints: {} },
    motion: null
  };
}
function En(e, t = {}) {
  if (!e || typeof e != "object" || !e.id)
    throw new Error("compileInstance: an AssetDefinition is required");
  const n = un(t.point, [0, 0, 0]), r = String(t.idSeed || Date.now().toString(36)), s = String(e.kind || "prop"), a = s === "character", i = mn[e.id];
  if (s === "helper" && !e.file && i && i !== "null")
    return {
      id: xe(i, t.existingIds, r),
      type: i,
      name: e.name || i,
      position: n,
      rotation: [0, 0, 0],
      size: [...e.base_size || [1, 1, 1]],
      keyframes: [],
      enabled: !0,
      asset_id: e.id,
      asset_kind: s,
      tags: [...e.tags || []]
    };
  const o = {
    id: xe(s === "character" ? "character" : s, t.existingIds, r),
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
    asset: hn(e),
    asset_id: e.id,
    asset_kind: s,
    tags: [...e.tags || []]
  };
  return a && (o.character = _n(e)), o;
}
function pr({ groundHit: e, orbitTarget: t } = {}) {
  return Array.isArray(e) && e.length >= 3 && e.every((n) => Number.isFinite(n)) ? e.slice(0, 3).map(Number) : Array.isArray(t) && t.length >= 3 && t.every((n) => Number.isFinite(n)) ? [Number(t[0]), 0, Number(t[2])] : [0, 0, 0];
}
const De = ["pos_x", "pos_y", "pos_z"], Te = 1e-9, it = ["auto", "aligned", "free", "corner"];
function k(e, t = 0) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
function D(e) {
  const t = e?.camera?.position;
  return [k(t?.[0]), k(t?.[1]), k(t?.[2])];
}
function x(e, t) {
  return [e[0] - t[0], e[1] - t[1], e[2] - t[2]];
}
function qe(e) {
  return Math.hypot(e[0], e[1], e[2]);
}
function me(e, t) {
  return [e[0] * t, e[1] * t, e[2] * t];
}
function ye(e, t, n) {
  const r = D(e), s = t ? D(t) : r, a = n ? D(n) : r, i = Math.max(Te, k(e?.frame) - k(t?.frame, k(e?.frame) - 1)), o = Math.max(Te, k(n?.frame, k(e?.frame) + 1) - k(e?.frame)), c = [0, 0, 0], h = [0, 0, 0];
  for (let u = 0; u < 3; u += 1) {
    const m = (r[u] - s[u]) / i, f = (a[u] - r[u]) / o;
    let E = (m + f) * 0.5;
    t ? n ? m * f <= 0 && (E = 0) : E = m : E = f, c[u] = E * o * (1 / 3), h[u] = -E * i * (1 / 3);
  }
  return { out: c, in: h };
}
function ot(e, t, n) {
  const r = D(e), s = t ? D(t) : r, a = n ? D(n) : r;
  return {
    out: me(x(a, r), 1 / 3),
    in: me(x(s, r), 1 / 3)
  };
}
function Ie(e, t) {
  const n = e?.tangents?.channels;
  if (!n) return null;
  const r = t === "out" ? "out_y" : "in_y", s = [0, 0, 0];
  let a = !1;
  for (let i = 0; i < 3; i += 1) {
    const o = n[De[i]];
    o && Number.isFinite(Number(o[r])) && (s[i] = Number(o[r]), a = !0);
  }
  return a ? s : null;
}
function ue(e) {
  const t = e?.tangents?.spatial_mode;
  return it.includes(t) ? t : "auto";
}
function Ne(e, t = null, n = null) {
  const r = ue(e), s = D(e);
  if (r === "corner") {
    const c = ot(e, t, n);
    return { in: re(s, c.in), out: re(s, c.out), mode: r };
  }
  const a = ye(e, t, n), i = (r === "free" || r === "aligned") && Ie(e, "out") || a.out, o = (r === "free" || r === "aligned") && Ie(e, "in") || a.in;
  return { in: re(s, o), out: re(s, i), mode: r };
}
function re(e, t) {
  return [e[0] + t[0], e[1] + t[1], e[2] + t[2]];
}
function pn(e) {
  return e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.channels = e.tangents.channels && typeof e.tangents.channels == "object" ? e.tangents.channels : {}, e.tangents.channels;
}
function K(e, t, n) {
  const r = pn(e);
  for (let s = 0; s < 3; s += 1) {
    const a = De[s], i = r[a] && typeof r[a] == "object" ? r[a] : {};
    i.mode = "free", i.out_x = 1 / 3, i.in_x = -1 / 3, t === "out" ? i.out_y = n[s] : i.in_y = n[s], i.out_y === void 0 && (i.out_y = 0), i.in_y === void 0 && (i.in_y = 0), r[a] = i;
  }
}
function he(e) {
  e.interpolation !== "bezier" && (e.interpolation = "bezier");
}
function ct(e, t, n) {
  const r = D(e), s = Ne(e, t, n);
  K(e, "out", x(s.out, r)), K(e, "in", x(s.in, r));
}
function gr(e, t, n, { prevKey: r = null, nextKey: s = null, breakCoupling: a = !1 } = {}) {
  if (!e || t !== "in" && t !== "out") return e;
  let i = ue(e);
  if (i === "corner") return e;
  i === "auto" && (i = "aligned", e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.spatial_mode = "aligned", ct(e, r, s));
  const o = D(e), c = x([
    k(n?.[0]),
    k(n?.[1]),
    k(n?.[2])
  ], o);
  if (he(e), K(e, t, c), i === "aligned" && !a) {
    const h = t === "out" ? "in" : "out", u = Ie(e, h) || (h === "out" ? ye(e, r, s).out : ye(e, r, s).in), m = qe(c), f = qe(u) || m || 1, E = m > Te ? me(c, -f / m) : me(u, 1);
    K(e, h, E);
  }
  return e;
}
function se(e, t, n) {
  if (!e || t !== "in" && t !== "out") return e;
  const r = D(e);
  return he(e), K(e, t, x([
    k(n?.[0]),
    k(n?.[1]),
    k(n?.[2])
  ], r)), e;
}
function Ar(e, t, { prevKey: n = null, nextKey: r = null } = {}) {
  if (!e || !it.includes(t)) return e;
  if (e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.spatial_mode = t, t === "auto") {
    if (e.tangents.channels) {
      for (const s of De) delete e.tangents.channels[s];
      Object.keys(e.tangents.channels).length || delete e.tangents.channels;
    }
    return e.interpolation === "bezier" && (e.interpolation = "smooth"), e;
  }
  if (t === "corner") {
    const s = ot(e, n, r);
    return he(e), K(e, "out", s.out), K(e, "in", s.in), e;
  }
  return he(e), ct(e, n, r), e;
}
const lt = 1e-9;
function gn(e, t) {
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
function An(e) {
  const t = e[0]?.length || 0, n = new Array(t).fill(1);
  for (let r = 0; r < t; r += 1) {
    let s = 1 / 0, a = -1 / 0;
    for (const o of e) {
      const c = Number.isFinite(o[r]) ? o[r] : 0;
      c < s && (s = c), c > a && (a = c);
    }
    const i = a - s;
    n[r] = i > lt ? 1 / i : 0;
  }
  return n;
}
function Le(e, t) {
  const n = e.map((i) => gn(i, t)), r = An(n), s = e.map((i) => i.frame), a = Math.max(1, s[s.length - 1] - s[0]);
  return n.map((i, o) => [
    (s[o] - s[0]) / a,
    ...i.map((c, h) => (Number.isFinite(c) ? c : 0) * r[h])
  ]);
}
function Qe(e, t) {
  let n = 0;
  for (let r = 0; r < e.length; r += 1) n += (e[r] - t[r]) ** 2;
  return Math.sqrt(n);
}
function Ue(e, t, n) {
  let r = 0;
  for (let o = 0; o < t.length; o += 1) r += (n[o] - t[o]) ** 2;
  if (r <= lt) return Qe(e, t);
  let s = 0;
  for (let o = 0; o < t.length; o += 1) s += (e[o] - t[o]) * (n[o] - t[o]);
  const a = Math.max(0, Math.min(1, s / r)), i = t.map((o, c) => o + (n[c] - o) * a);
  return Qe(e, i);
}
function bn(e, t, n) {
  const r = /* @__PURE__ */ new Set([0, e.length - 1]), s = [[0, e.length - 1]];
  for (; s.length; ) {
    const [a, i] = s.pop();
    if (i - a < 2) continue;
    let o = -1, c = -1;
    for (let h = a + 1; h < i; h += 1) {
      const u = Ue(e[h], e[a], e[i]);
      u > o && (o = u, c = h);
    }
    c < 0 || (o > t || n.has(c)) && (r.add(c), s.push([a, c], [c, i]));
  }
  return r;
}
function br(e, t, { tolerance: n = 0.02, keepFrames: r = [] } = {}) {
  const s = [...e].sort((u, m) => u.frame - m.frame);
  if (s.length <= 2 || n <= 0) return { keys: s, removed: 0 };
  const a = Le(s, t), i = /* @__PURE__ */ new Set(), o = new Set(r);
  s.forEach((u, m) => {
    o.has(u.frame) && i.add(m);
  });
  const c = bn(a, n, i);
  for (const u of i) c.add(u);
  const h = s.filter((u, m) => c.has(m));
  return { keys: h, removed: s.length - h.length };
}
function wr(e, t, { target: n = 2, keepFrames: r = [] } = {}) {
  let s = [...e].sort((c, h) => c.frame - h.frame);
  const a = Math.max(2, Math.round(n));
  if (s.length <= a) return { keys: s, removed: 0 };
  const i = new Set(r), o = s.length;
  for (; s.length > a; ) {
    const c = Le(s, t);
    let h = -1, u = 1 / 0;
    for (let m = 1; m < s.length - 1; m += 1) {
      if (i.has(s[m].frame)) continue;
      const f = Ue(c[m], c[m - 1], c[m + 1]);
      f < u && (u = f, h = m);
    }
    if (h < 0) break;
    s = s.filter((m, f) => f !== h);
  }
  return { keys: s, removed: o - s.length };
}
function Tr(e, t, { mergeWithin: n = 1, epsilon: r = 1e-3, keepFrames: s = [] } = {}) {
  const a = [...e].sort((f, E) => f.frame - E.frame), i = a.length, o = new Set(s), c = [];
  for (const f of a) {
    const E = c[c.length - 1];
    E && f.frame - E.frame <= Math.max(0, n) && !o.has(f.frame) || c.push(f);
  }
  if (c.length <= 2) return { keys: c, removed: i - c.length };
  const h = Le(c, t), u = /* @__PURE__ */ new Set();
  for (let f = 1; f < c.length - 1; f += 1) {
    if (o.has(c[f].frame)) continue;
    const E = u.has(f - 1) ? null : f - 1;
    if (E === null) continue;
    Ue(h[f], h[E], h[f + 1]) <= r && u.add(f);
  }
  const m = c.filter((f, E) => !u.has(E));
  return { keys: m, removed: i - m.length };
}
function wn(e, t, { minKeys: n = 0 } = {}) {
  const r = new Set(t), s = e.filter((a) => !r.has(a.frame));
  if (s.length < n) {
    const a = e.filter((i) => r.has(i.frame)).sort((i, o) => i.frame - o.frame);
    for (; s.length < n && a.length; ) s.push(a.shift());
    s.sort((i, o) => i.frame - o.frame);
  }
  return { keys: s, removed: e.length - s.length };
}
function yr(e, t, n, { lastFrame: r = 1 / 0 } = {}) {
  const s = [...t].sort((u, m) => u - m);
  if (!n || !s.length)
    return { keys: [...e], moved: 0, frames: s };
  const a = new Set(s), i = new Set(e.filter((u) => !a.has(u.frame)).map((u) => u.frame)), o = s.map((u) => u + n);
  return o.some((u) => u < 0 || u > r || i.has(u)) || new Set(o).size !== o.length ? { keys: [...e], moved: 0, frames: s } : { keys: e.map((u) => a.has(u.frame) ? { ...u, frame: u.frame + n } : u).sort((u, m) => u.frame - m.frame), moved: s.length, frames: o.sort((u, m) => u - m) };
}
function Ir(e, t, n) {
  const r = new Set(t);
  return e.map((s) => r.has(s.frame) ? { ...s, interpolation: n } : s);
}
function Nr(e, t, n, r = []) {
  const s = new Set(t);
  return e.map((a) => {
    if (!s.has(a.frame)) return a;
    const i = { mode: n, channels: { ...a.tangents?.channels || {} } };
    for (const c of r)
      i.channels[c] = { ...i.channels[c] || {}, mode: n };
    const o = n !== "auto" && a.interpolation !== "bezier" ? "bezier" : a.interpolation;
    return { ...a, interpolation: o, tangents: i };
  });
}
function W(e, t, n) {
  return [0, 1, 2].map((r) => e[r] + (t[r] - e[r]) * n);
}
function Tn(e, t, n, r, s) {
  const a = W(e, t, s), i = W(t, n, s), o = W(n, r, s), c = W(a, i, s), h = W(i, o, s), u = W(c, h, s);
  return { left: [e, a, c, u], right: [u, h, o, r], point: u };
}
function yn(e, t, n, r) {
  const s = new Set(e.map((o) => o.frame)), a = Math.min(n - 1, Math.max(t + 1, r));
  if (!s.has(a)) return a;
  const i = n - t;
  for (let o = 1; o < i; o += 1)
    for (const c of [a - o, a + o])
      if (!(c <= t || c >= n) && !s.has(c))
        return c;
  return -1;
}
function In(e, { leftFrame: t, rightFrame: n, t: r = 0.5 } = {}) {
  const s = [...e].sort((b, g) => b.frame - g.frame), a = s.findIndex((b) => b.frame === t), i = a >= 0 ? a + 1 : -1;
  if (a < 0 || i < 0 || i >= s.length || s[i].frame !== n)
    return { ok: !1, reason: "segment_not_found" };
  if (n - t < 2)
    return { ok: !1, reason: "no_free_frame" };
  const o = Math.min(0.999, Math.max(1e-3, Number.isFinite(r) ? r : 0.5)), c = Math.round(t + o * (n - t)), h = yn(s, t, n, c);
  if (h < 0) return { ok: !1, reason: "no_free_frame" };
  const u = (h - t) / (n - t), m = s[a], f = s[i], E = a > 0 ? s[a - 1] : null, y = i + 1 < s.length ? s[i + 1] : null, A = m.interpolation === "bezier" || f.interpolation === "bezier", S = de({ keyframes: s }, h), C = { frame: h, interpolation: A ? "bezier" : m.interpolation, camera: S };
  if (A) {
    const b = [...m.camera.position], g = Ne(m, E, f).out, T = Ne(f, m, y).in, O = [...f.camera.position], j = Tn(b, g, T, O, u);
    C.camera = { ...fe(S), position: [...j.point] };
    const L = ue(m);
    (L === "free" || L === "aligned") && se(m, "out", j.left[1]);
    const Be = ue(f);
    (Be === "free" || Be === "aligned") && se(f, "in", j.right[2]), se(C, "in", j.left[2]), se(C, "out", j.right[1]);
  }
  return { ok: !0, keys: [...s, C].sort((b, g) => b.frame - g.frame), frame: h };
}
function Nn(e, t) {
  const { keys: n, removed: r } = wn(e, t, { minKeys: 1 });
  return { ok: r > 0, keys: n, removed: r };
}
function Re(e, t) {
  const n = t || e.active_camera_id, r = (e.cameras || []).find((s) => s.id === n);
  if (!r) throw new d("UNKNOWN_CAMERA", `${n} does not exist`);
  return r;
}
function ke(e, t) {
  const n = (e.objects || []).find((r) => r.id === t);
  if (!n) throw new d("UNKNOWN_OBJECT", `${t} does not exist`);
  return n;
}
function ae(e, t) {
  const n = $(e, t);
  if (n.asset_kind !== "character")
    throw new d("NOT_A_CHARACTER", `${t} is not a character`);
  return n;
}
function M(e, t) {
  const n = Re(e, t);
  if (n.locked)
    throw new d("ENTITY_LOCKED", `${n.id} is locked`);
  return n;
}
function $(e, t) {
  const n = ke(e, t);
  if (n.locked)
    throw new d("ENTITY_LOCKED", `${n.id} is locked`);
  return n;
}
function Ae(e) {
  return (!e.camera || typeof e.camera != "object") && (e.camera = {}), e.camera;
}
function ie(e, t) {
  return (e.keyframes || []).find((n) => n.frame === t) || null;
}
function Q(e, t, n) {
  t.keyframes = n, t.id === e.active_camera_id && (e.keyframes = n);
}
const X = l.viewport | l.previews | l.timeline | l.inspector;
function Xe(e, t, n) {
  const r = new Set((e.keyframes || []).map((a) => a.frame)), s = t.find((a) => !r.has(a));
  if (s !== void 0)
    throw new d("UNKNOWN_KEYFRAME", `${n}: camera has no key at frame ${s}`);
}
const Rn = {
  [_.ASSET_INSTANTIATE](e, t) {
    const n = new Set((e.objects || []).map((s) => s.id));
    let r;
    try {
      r = En(t.asset, { point: t.point, idSeed: t.id, existingIds: n });
    } catch (s) {
      throw new d("BAD_ASSET", `asset.instantiate could not compile: ${s.message}`);
    }
    return (e.objects ||= []).push(r), {
      dirtyMask: l.viewport | l.previews | l.outliner | l.inspector,
      outcome: { objectId: r.id, assetId: r.asset_id || null }
    };
  },
  [_.CAMERA_SET_ACTIVE](e, t) {
    return Re(e, t.cameraId), e.active_camera_id = t.cameraId, { dirtyMask: l.viewport | l.previews | l.inspector | l.outliner | l.timeline };
  },
  [_.CAMERA_SET_LOCKED](e, t) {
    return Re(e, t.cameraId).locked = t.value, { dirtyMask: l.outliner | l.inspector | l.viewport };
  },
  [_.CAMERA_CREATE](e, t) {
    const n = Ft(e, t);
    return { dirtyMask: l.outliner | l.inspector | l.viewport | l.previews | l.timeline, outcome: n };
  },
  [_.CAMERA_DUPLICATE](e, t) {
    const n = Pt(e, t);
    return { dirtyMask: l.outliner | l.inspector | l.viewport | l.previews | l.timeline, outcome: n };
  },
  [_.CAMERA_DELETE](e, t) {
    const n = $t(e, t);
    return { dirtyMask: l.outliner | l.inspector | l.viewport | l.previews | l.timeline, outcome: n };
  },
  [_.CAMERA_RENAME](e, t) {
    M(e, t.cameraId);
    const n = zt(e, t);
    return { dirtyMask: l.outliner | l.inspector, outcome: n };
  },
  [_.CAMERA_SET_PLAYBLAST](e, t) {
    const n = Kt(e, t);
    return { dirtyMask: l.outliner | l.inspector | l.status, outcome: n };
  },
  [_.CAMERA_TRANSFORM](e, t) {
    const n = M(e, t.cameraId), r = Ae(n);
    if (t.position && (r.position = [...t.position]), t.target && (r.target = [...t.target]), Number.isInteger(t.frame)) {
      const s = ie(n, t.frame);
      if (!s) throw new d("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
      s.camera = { ...s.camera }, t.position && (s.camera.position = [...t.position]), t.target && (s.camera.target = [...t.target]);
    }
    return { dirtyMask: l.viewport | l.previews | l.inspector | l.timeline };
  },
  [_.CAMERA_LOOK_AT](e, t) {
    const n = M(e, t.cameraId);
    if (t.objectId !== void 0 && (t.objectId === null || t.objectId === "" ? (n.target_object_id = null, n.id === e.active_camera_id && (e.target_object_id = null)) : (ke(e, t.objectId), n.target_object_id = t.objectId, n.id === e.active_camera_id && (e.target_object_id = t.objectId))), t.point) {
      const r = Ae(n);
      r.target = [...t.point];
      for (const s of n.keyframes || [])
        s.camera = { ...s.camera, target: [...t.point] };
    }
    return { dirtyMask: l.viewport | l.previews | l.inspector | l.timeline };
  },
  [_.OBJECT_CREATE](e, t) {
    const n = Ht(e, t);
    return { dirtyMask: l.viewport | l.previews | l.outliner | l.inspector, outcome: n };
  },
  [_.OBJECT_DUPLICATE](e, t) {
    const n = Jt(e, t);
    return { dirtyMask: l.viewport | l.previews | l.outliner | l.inspector, outcome: n };
  },
  [_.OBJECT_DELETE](e, t) {
    const n = Wt(e, t);
    return { dirtyMask: l.viewport | l.previews | l.outliner | l.inspector, outcome: n };
  },
  [_.OBJECT_RENAME](e, t) {
    $(e, t.objectId);
    const n = Gt(e, t);
    return { dirtyMask: l.outliner | l.inspector, outcome: n };
  },
  [_.OBJECT_SET_PARENT](e, t) {
    $(e, t.objectId);
    const n = Vt(e, t);
    return { dirtyMask: l.viewport | l.outliner | l.inspector, outcome: n };
  },
  [_.OBJECT_TRANSFORM](e, t) {
    const n = $(e, t.objectId);
    return t.position && (n.position = [...t.position]), t.rotation && (n.rotation = [...t.rotation]), t.scale && (n.size = [...t.scale]), { dirtyMask: l.viewport | l.previews | l.inspector };
  },
  [_.OBJECT_SET_ENABLED](e, t) {
    return $(e, t.objectId).enabled = t.value, { dirtyMask: l.viewport | l.previews | l.outliner | l.inspector };
  },
  [_.OBJECT_SET_LOCKED](e, t) {
    return ke(e, t.objectId).locked = t.value, { dirtyMask: l.outliner | l.inspector };
  },
  [_.OBJECT_SET_TAGS](e, t) {
    const n = $(e, t.objectId), r = Nt(t.tags), s = r.length !== t.tags.length ? "some tags were dropped or normalised" : void 0;
    return r.length ? n.tags = r : delete n.tags, { dirtyMask: l.outliner | l.inspector | l.viewport, warning: s };
  },
  [_.OBJECT_SET_ANNOTATION](e, t) {
    const n = $(e, t.objectId), r = t.annotation === null ? null : It(t.annotation);
    if (t.annotation && !r)
      throw new d("BAD_ANNOTATION", "annotation failed validation (text, hex colour, anchor)");
    return r ? n.annotation = r : delete n.annotation, { dirtyMask: l.viewport | l.outliner | l.inspector };
  },
  [_.CHARACTER_SET_POSE](e, t) {
    const n = ae(e, t.objectId);
    if (n.character?.motion)
      throw new d("POSE_MOTION_EXCLUSIVE", "clear the motion clip before editing the pose");
    return n.character = {
      ...n.character || {},
      pose: t.pose === null ? ze(null) : ze(t.pose)
    }, { dirtyMask: l.viewport | l.previews | l.inspector };
  },
  [_.CHARACTER_SET_JOINT_ROTATION](e, t) {
    const n = ae(e, t.objectId);
    if (n.character?.motion)
      throw new d("POSE_MOTION_EXCLUSIVE", "clear the motion clip before editing the pose");
    if (!Tt(t.rotation))
      throw new d("BAD_QUATERNION", "rotation is not a usable unit quaternion");
    return n.character = {
      ...n.character || {},
      pose: yt(n.character?.pose, t.joint, t.rotation)
    }, { dirtyMask: l.viewport | l.previews | l.inspector };
  },
  [_.CHARACTER_SET_MOTION](e, t) {
    const n = ae(e, t.objectId), r = wt(t.motion);
    if (!r) throw new d("BAD_MOTION", "motion failed validation (clip_id, speed, range)");
    const s = n.character?.pose || {};
    return n.character = {
      ...n.character || {},
      pose: { preset_id: s.preset_id || "neutral", root_offset: s.root_offset || [0, 0, 0], joints: {} },
      motion: r
    }, { dirtyMask: l.viewport | l.previews | l.timeline | l.inspector };
  },
  [_.CHARACTER_CLEAR_MOTION](e, t) {
    const n = ae(e, t.objectId);
    return n.character ? (n.character = { ...n.character, motion: null }, { dirtyMask: l.viewport | l.previews | l.timeline | l.inspector }) : { dirtyMask: 0 };
  },
  [_.KEYFRAME_UPSERT](e, t) {
    const n = M(e, t.cameraId);
    if (t.frame >= (e.duration_frames || 0))
      throw new d("FRAME_OUT_OF_RANGE", `frame ${t.frame} is past the timeline`);
    n.keyframes ||= [];
    let r = ie(n, t.frame);
    const s = !r;
    if (!r) {
      const i = ie(n, 0)?.camera || n.camera || {};
      r = { frame: t.frame, camera: JSON.parse(JSON.stringify(i)), interpolation: "ease" }, n.keyframes.push(r), n.keyframes.sort((o, c) => o.frame - c.frame);
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
    const n = M(e, t.cameraId), r = ie(n, t.frame);
    if (!r) throw new d("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
    if (!le.includes(t.interpolation))
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
    const n = Yt(e, t);
    return { dirtyMask: l.timeline | l.viewport | l.previews | l.status, outcome: n };
  },
  [_.CUT_REMOVE](e, t) {
    const n = xt(e, t);
    return { dirtyMask: l.timeline | l.viewport | l.previews | l.status, outcome: n };
  },
  [_.CUT_SET_CAMERA](e, t) {
    const n = qt(e, t);
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
    Xe(n, t.frames, "camera.path.transform_keys");
    const r = (n.keyframes || []).filter((i) => t.frames.includes(i.frame)), s = Array.isArray(t.transform.origin) ? t.transform.origin : gt(r), a = At(n.keyframes || [], t.frames, {
      mode: t.transform.mode,
      origin: s,
      delta: t.transform.delta,
      factors: t.transform.factors,
      rotationDeg: t.transform.rotationDeg,
      lookAtActive: bt(n, e.objects)
    });
    return Q(e, n, a), { dirtyMask: X };
  },
  [_.CAMERA_PATH_INSERT_KEY](e, t) {
    const n = M(e, t.cameraId), r = In(n.keyframes || [], {
      leftFrame: t.leftFrame,
      rightFrame: t.rightFrame,
      t: t.t
    });
    if (!r.ok)
      throw new d(
        r.reason === "no_free_frame" ? "NO_FREE_FRAME" : "SEGMENT_NOT_FOUND",
        `camera.path.insert_key: could not insert a key between frame ${t.leftFrame} and ${t.rightFrame}`
      );
    return Q(e, n, r.keys), { dirtyMask: X, outcome: { frame: r.frame } };
  },
  [_.CAMERA_PATH_DELETE_KEYS](e, t) {
    const n = M(e, t.cameraId);
    Xe(n, t.frames, "camera.path.delete_keys");
    const r = Nn(n.keyframes || [], t.frames);
    if (!r.ok)
      throw new d("CANNOT_DELETE", "camera.path.delete_keys: a camera track needs at least one key");
    return Q(e, n, r.keys), { dirtyMask: X, outcome: { removed: r.removed } };
  },
  [_.CAMERA_PATH_REDISTRIBUTE_TIMING](e, t) {
    const n = M(e, t.cameraId), r = [...n.keyframes || []].sort((o, c) => o.frame - c.frame), s = Number.isInteger(t.startFrame) ? t.startFrame : r[0]?.frame, a = Number.isInteger(t.endFrame) ? t.endFrame : r[r.length - 1]?.frame, i = pt(r, { startFrame: s, endFrame: a });
    if (!i.ok) {
      const o = { not_enough_keys: "NOT_ENOUGH_KEYS", invalid_range: "BAD_RANGE", insufficient_frame_slots: "INSUFFICIENT_FRAME_SLOTS" };
      throw new d(o[i.reason] || "BAD_RANGE", `camera.path.redistribute_timing: ${i.reason}`);
    }
    return Q(e, n, i.keys), { dirtyMask: X };
  },
  [_.CAMERA_PATH_APPLY_PRESET](e, t) {
    const n = M(e, t.cameraId), r = Ae(n), s = en({
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
    return Q(e, n, s.keyframes), { dirtyMask: X };
  }
};
function kn({ state: e, operation: t }) {
  const n = Rn[t.type];
  if (!n) throw new d("UNKNOWN_OPERATION", `Unknown operation type: ${t.type}`);
  return n(e, t) || { dirtyMask: 0 };
}
const Sn = 100;
function Se(e, t) {
  if (e === t) return !0;
  if (typeof e != typeof t) return !1;
  if (Array.isArray(e) || Array.isArray(t))
    return !Array.isArray(e) || !Array.isArray(t) || e.length !== t.length ? !1 : e.every((n, r) => Se(n, t[r]));
  if (e && t && typeof e == "object") {
    const n = /* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(t)]);
    for (const r of n) if (!Se(e[r], t[r])) return !1;
    return !0;
  }
  return !1;
}
function P(e) {
  return new Map((e || []).map((t) => [t.id, t]));
}
function On(e, t) {
  const n = [];
  let r = !1;
  const s = (a, i, o, c) => {
    if (!r && !Se(o, c)) {
      if (n.length >= Sn) {
        r = !0;
        return;
      }
      n.push({ entity: a, field: i, before: o ?? null, after: c ?? null });
    }
  };
  return vn(e, t, s), Mn(e, t, s), Ln(e, t, s), Dn(e, t, s), Un(e, t, s), Bn(e, t, s), { changes: n, truncated: r };
}
const Cn = ["fov", "roll", "zoom", "near", "far", "camera_type"];
function vn(e, t, n) {
  const r = P(e?.cameras), s = P(t?.cameras);
  for (const a of r.keys())
    s.has(a) || n(a, "camera", "present", null);
  for (const [a, i] of s) {
    const o = r.get(a);
    if (!o) {
      n(a, "camera", null, "present");
      continue;
    }
    n(a, "name", o.name, i.name), n(a, "locked", !!o.locked, !!i.locked), n(a, "muted", !!o.muted, !!i.muted), n(a, "solo", !!o.solo, !!i.solo), n(a, "target_object_id", o.target_object_id ?? null, i.target_object_id ?? null), n(a, "position", o.camera?.position, i.camera?.position), n(a, "target", o.camera?.target, i.camera?.target);
    for (const c of Cn)
      n(a, c, o.camera?.[c], i.camera?.[c]);
  }
}
const jn = ["position", "target", "fov", "roll", "zoom", "near", "far", "camera_type"];
function Mn(e, t, n) {
  const r = P(e?.cameras), s = P(t?.cameras);
  for (const [a, i] of s) {
    const o = r.get(a), c = new Map((o?.keyframes || []).map((m) => [m.frame, m])), h = new Map((i.keyframes || []).map((m) => [m.frame, m])), u = `${a}@keyframes`;
    for (const [m, f] of c)
      h.has(m) || n(u, `frame_${m}`, f.interpolation ?? "present", null);
    for (const [m, f] of h) {
      const E = c.get(m);
      if (!E) {
        n(u, `frame_${m}`, null, f.interpolation ?? "present");
        continue;
      }
      for (const y of jn)
        n(u, `frame_${m}_${y}`, E.camera?.[y], f.camera?.[y]);
      n(u, `frame_${m}_interpolation`, E.interpolation, f.interpolation);
    }
  }
}
function Dn(e, t, n) {
  const r = P(e?.objects), s = P(t?.objects);
  for (const [a, i] of s) {
    const c = r.get(a)?.character?.pose?.joints || {}, h = i.character?.pose?.joints || {}, u = /* @__PURE__ */ new Set([...Object.keys(c), ...Object.keys(h)]);
    for (const m of u)
      n(`${a}#${m}`, "joint_rotation", c[m] ?? null, h[m] ?? null);
  }
}
function Ln(e, t, n) {
  const r = P(e?.objects), s = P(t?.objects);
  for (const [a] of r)
    s.has(a) || n(a, "object", "present", null);
  for (const [a, i] of s) {
    const o = r.get(a);
    if (!o) {
      n(a, "object", null, "present");
      continue;
    }
    n(a, "position", o.position, i.position), n(a, "rotation", o.rotation, i.rotation), n(a, "size", o.size, i.size), n(a, "name", o.name, i.name), n(a, "enabled", o.enabled !== !1, i.enabled !== !1), n(a, "locked", !!o.locked, !!i.locked), n(a, "tags", o.tags || [], i.tags || []), n(a, "annotation", o.annotation ?? null, i.annotation ?? null);
    const c = o.character?.pose?.preset_id ?? null, h = i.character?.pose?.preset_id ?? null;
    n(a, "pose_preset", c, h);
    const u = o.character?.motion?.clip_id ?? null, m = i.character?.motion?.clip_id ?? null;
    n(a, "motion_clip_id", u, m);
  }
}
function Un(e, t, n) {
  n("timeline", "duration_frames", e?.duration_frames, t?.duration_frames), n("timeline", "playback_range", e?.playback_range ?? null, t?.playback_range ?? null);
}
function Bn(e, t, n) {
  const r = new Map((e?.sequence?.cuts || []).map((a) => [a.start, a])), s = new Map((t?.sequence?.cuts || []).map((a) => [a.start, a]));
  for (const [a, i] of r)
    s.has(a) || n(`cut_${a}`, "cut", i.camera_id, null);
  for (const [a, i] of s) {
    const o = r.get(a);
    o ? n(`cut_${a}`, "cut_camera_id", o.camera_id, i.camera_id) : n(`cut_${a}`, "cut", null, i.camera_id);
  }
}
function Fn(e) {
  return typeof structuredClone == "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e));
}
function Oe(e) {
  return Number.isInteger(e.directorRevision) ? Math.max(0, e.directorRevision) : 0;
}
function be(e, t, n) {
  return {
    ok: !1,
    version: F,
    revision: Oe(e),
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
function Pn(e) {
  const t = (e.state.cameras || []).find(
    (n) => n.id === e.state.active_camera_id
  ) || e.state.cameras?.[0] || null;
  return t ? (e.state.keyframes = t.keyframes, e.state.camera = fe(t.camera), e.camera = fe(t.camera), t) : null;
}
function $n(e, t) {
  t && (e.camera = de(
    t,
    e.frame ?? 0,
    e.state.objects || []
  ));
}
async function zn(e, t, n) {
  const r = n.some((i) => i.resourceRefresh === !0), s = t.operations.filter((i) => i.type === _.OBJECT_DELETE).map((i) => i.objectId);
  for (const i of s)
    e.removeObjectResources?.(i);
  const a = t.operations.some((i) => i.type === _.ASSET_INSTANTIATE);
  (r || a) && await e.restoreAssets?.();
}
function Kn(e, t, n) {
  if (typeof e.requestUiUpdate == "function") {
    e.requestUiUpdate(t, n);
    return;
  }
  e.camera = e.sampleCamera?.(e.state, e.frame) ?? e.camera, e.refreshObjects?.(), e.refreshKeys?.(), e.refreshInspector?.(), e.render?.();
}
function Hn(e, t) {
  let n;
  try {
    n = ln(e, t);
  } catch (m) {
    if (m instanceof d) return be(e, t?.id, m);
    throw m;
  }
  const r = Oe(e);
  if (n.baseRevision !== void 0 && n.baseRevision !== r)
    return be(
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
  const s = Fn(e.state);
  let a = 0;
  const i = [], o = [];
  for (let m = 0; m < n.operations.length; m += 1)
    try {
      const f = kn({ ui: e, state: s, operation: n.operations[m] });
      a |= f?.dirtyMask || 0, f?.warning && i.push(f.warning), f?.outcome && o.push({ index: m, ...f.outcome });
    } catch (f) {
      if (f instanceof d)
        return (f.operationIndex === null || f.operationIndex === void 0) && (f.operationIndex = m), be(e, n.id, f);
      throw f;
    }
  if (n.validateOnly) {
    const { changes: m, truncated: f } = On(e.state, s);
    return {
      ok: !0,
      version: F,
      revision: r,
      id: n.id,
      applied: n.operations.length,
      warnings: i,
      outcomes: o,
      dirtyMask: a,
      validateOnly: !0,
      changes: m,
      ...f ? { truncated: !0 } : {}
    };
  }
  e.checkpoint?.(n.description), e.state = ce(s);
  const c = Pn(e);
  nn(e, n.id), e.serialize?.(), $n(e, c), Kn(e, a, `director-api:${n.id}`);
  const h = {
    ok: !0,
    version: F,
    baseRevision: r,
    revision: Oe(e),
    id: n.id,
    applied: n.operations.length,
    warnings: i,
    outcomes: o,
    dirtyMask: a
  }, u = zn(e, n, o).catch((m) => {
    console.warn("OmniCam: resource reconciliation failed", m), i.push({
      code: "VIEWPORT_RESOURCE_RECONCILE_FAILED",
      message: "The scene change was committed, but one or more viewport resources could not be refreshed."
    }), e.setStatus?.("The scene change was committed, but one or more viewport resources could not be refreshed.");
  });
  return Object.defineProperty(h, "_reconciliation", { value: u, enumerable: !1 }), h;
}
function Jn(e) {
  return {
    query: (t) => Ut(e, t),
    execute: (t) => Hn(e, t)
  };
}
function Wn(e) {
  return e.directorApi = Jn(e), e.directorApi;
}
const Ze = "omnicam-agent/1", et = "majoor.omnicam.agent.request", Gn = 1, Z = Object.freeze({
  register: "/majoor/omnicam/agent/v1/session/register",
  heartbeat: "/majoor/omnicam/agent/v1/session/heartbeat",
  reply: "/majoor/omnicam/agent/v1/reply",
  close: "/majoor/omnicam/agent/v1/session/close"
}), Vn = 1e4, Yn = 5e3, dt = "asset.instantiate_by_id", ft = "asset.catalog_search", tt = Object.freeze([
  ...st.filter((e) => e !== _.ASSET_INSTANTIATE),
  dt
]);
function Ce(e) {
  return e?.kind === "character" && e?.source === "default";
}
async function xn(e, t) {
  if (!e || !t || typeof t != "string") return null;
  const n = e.get(t);
  if (n) return Ce(n) ? null : n;
  try {
    await e.setFilter({ kind: "all", search: t });
  } catch {
  }
  const r = e.get(t);
  return Ce(r) ? null : r;
}
async function qn(e, t) {
  const n = e.assetBrowser?.store, r = [];
  for (const s of t || []) {
    if (s?.type !== dt) {
      r.push(s);
      continue;
    }
    if (!n)
      return { ok: !1, code: "ASSET_CATALOG_UNAVAILABLE", message: "The asset catalogue is not available in this Director session" };
    const a = await xn(n, s.assetId);
    if (!a)
      return { ok: !1, code: "UNKNOWN_ASSET", message: `Unknown catalogue asset: ${s.assetId}` };
    r.push({ type: "asset.instantiate", asset: a, id: s.id, point: s.point });
  }
  return { ok: !0, operations: r };
}
async function Qn(e, t) {
  const n = e.assetBrowser?.store;
  if (!n) {
    const s = new Error("The asset catalogue is not available in this Director session");
    throw s.code = "ASSET_CATALOG_UNAVAILABLE", s;
  }
  await n.setFilter({ kind: t?.kind || "all", search: String(t?.search || "") });
  const r = (n.state?.items || []).filter((s) => !Ce(s)).slice(0, 20).map((s) => ({
    id: s.id,
    name: s.name,
    kind: s.kind,
    tags: [...s.tags || []],
    animations: (s.animations || []).map((a) => ({ id: a.id, name: a.name, clip: a.clip }))
  }));
  return {
    version: F,
    type: ft,
    items: r,
    revision: Number(e.directorRevision || 0)
  };
}
async function ee(e, t, n) {
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
    const a = s?.error?.code || `HTTP_${r.status || 0}`, i = s?.error?.message || `OmniCam Agent request failed (${r.status})`, o = new Error(i);
    throw o.code = a, o.status = r.status || 0, o;
  }
  return s ?? {};
}
function te(e, t, n) {
  return {
    ok: !1,
    version: F,
    revision: Number(e.directorRevision || 0),
    error: { code: t, message: n }
  };
}
function Xn(e, t, n) {
  let r = !1, s = null, a = null, i = null, o = null, c = null, h = 0;
  function u() {
    return n.clientId || n.initialClientId || null;
  }
  function m() {
    s = null, a = null, i = null, o && (clearInterval(o), o = null);
  }
  async function f() {
    if (r) return;
    h += 1;
    const b = h, g = u();
    if (!g) {
      E();
      return;
    }
    try {
      const T = await ee(n, Z.register, {
        protocol: Ze,
        client_id: g,
        node_id: String(t.id),
        label: `OmniCam Director ${t.id}`,
        director_api: F,
        revision: Number(e.directorRevision || 0),
        operations: [...tt],
        queries: [...jt]
      });
      if (r || b !== h) return;
      s = T.session_id, a = T.session_token, i = g, y();
    } catch {
      if (r || b !== h) return;
      E();
    }
  }
  function E() {
    r || (clearTimeout(c), c = setTimeout(() => {
      f();
    }, Yn));
  }
  function y() {
    clearInterval(o), o = setInterval(() => {
      A();
    }, Vn);
  }
  async function A() {
    if (!(r || !s))
      try {
        await ee(n, Z.heartbeat, {
          session_id: s,
          session_token: a,
          revision: Number(e.directorRevision || 0)
        });
      } catch (b) {
        if (r) return;
        (b?.code === "UNKNOWN_SESSION" || b?.code === "BAD_SESSION_TOKEN") && (m(), f());
      }
  }
  async function S(b) {
    const g = b?.detail;
    if (r || !g || g.protocol !== Ze || Number(g.schema_version) !== Gn || g.session_id !== s || String(g.node_id) !== String(t.id)) return;
    let T;
    try {
      if (g.kind === "query")
        T = g.payload?.type === ft ? await Qn(e, g.payload) : e.directorApi.query(g.payload);
      else if (g.kind === "transaction") {
        const O = g.payload, j = (O?.operations || []).find(
          (L) => !tt.includes(L?.type)
        );
        if (!Number.isInteger(O?.baseRevision) || O.baseRevision < 0)
          T = te(
            e,
            "BASE_REVISION_REQUIRED",
            "External Agent transactions require baseRevision"
          );
        else if (j)
          T = te(
            e,
            "OPERATION_NOT_ADVERTISED",
            `External Agent transactions cannot use operation: ${j?.type}`
          );
        else {
          const L = await qn(e, O.operations);
          L.ok ? (T = e.directorApi.execute({ ...O, operations: L.operations }), await T?._reconciliation) : T = te(e, L.code, L.message);
        }
      } else
        T = te(e, "UNKNOWN_AGENT_REQUEST", `Unsupported Agent request kind: ${g.kind}`);
    } catch (O) {
      T = te(e, O?.code || "INTERNAL", O?.message || "OmniCam Agent request failed");
    }
    try {
      await ee(n, Z.reply, {
        session_id: s,
        session_token: a,
        request_id: g.request_id,
        result: T
      });
    } catch {
    }
  }
  async function C(b, g) {
    if (!(!b || !g))
      try {
        await ee(n, Z.close, {
          session_id: b,
          session_token: g
        });
      } catch {
      }
  }
  function q() {
    if (r) return;
    const b = u();
    if (b && i && b !== i) {
      const g = s, T = a;
      m(), C(g, T).finally(() => f());
    }
  }
  return n.addEventListener?.(et, S), n.addEventListener?.("status", q), f(), {
    get sessionId() {
      return s;
    },
    dispose() {
      if (r) return;
      r = !0, clearInterval(o), clearTimeout(c), n.removeEventListener?.(et, S), n.removeEventListener?.("status", q);
      const b = s, g = a;
      s = null, a = null, b && g && ee(n, Z.close, {
        session_id: b,
        session_token: g
      }).catch(() => {
      });
    }
  };
}
const nt = "majoor-omnicam-workbench-styles", Zn = `
  .oc-workbench-backdrop{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(8,8,11,0.72);backdrop-filter:blur(2px)}
  .oc-workbench-window{display:flex;flex-direction:column;width:min(96vw,1920px);height:92vh;min-width:960px;min-height:640px;background:#161618;border:1px solid #383842;border-radius:10px;box-shadow:0 24px 64px rgba(0,0,0,0.6);overflow:hidden;outline:none}
  .oc-workbench-window.is-maximized{width:100vw;height:100vh;min-width:0;min-height:0;border-radius:0;border:none}
  .oc-workbench-header{display:flex;align-items:center;gap:10px;min-height:40px;padding:6px 10px;background:#1e1e24;border-bottom:1px solid #32323c;flex:none}
  .oc-workbench-title{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e2e2e8;font:600 13px/1.4 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .oc-workbench-actions{display:flex;align-items:center;gap:4px;flex:none}
  .oc-workbench-actions button{display:inline-grid;place-items:center;width:28px;height:28px;padding:0;color:#9494a8;background:#23232c;border:1px solid #3c3c4a;border-radius:6px;cursor:pointer}
  .oc-workbench-actions button:hover{background:#31313e;border-color:#58586c;color:#fff}
  /* auto, not hidden: the embedded editor's natural content height (built for
     a graph node that grows to fit it) can exceed a modest 92vh window on a
     short viewport. Clipping it with overflow:hidden would silently strand
     bottom controls (e.g. the sequence lane) outside the hit-testable area
     instead of just requiring a scroll to reach them. */
  .oc-workbench-content{position:relative;flex:1 1 auto;min-height:0;overflow:auto}
  .oc-workbench-content>*{width:100%;height:100%}

  .oc-node-shell{display:flex;flex-direction:column;gap:6px;width:100%;height:100%;padding:8px 10px;box-sizing:border-box;font:12px/1.35 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#ddd;background:#161618;border-radius:8px}
  .oc-node-shell-title{font-weight:700;color:#e2e2e8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-node-shell-meta{color:#9494a8;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-node-shell-status{color:#c7ccd4;font-size:11px}
  .oc-node-shell-progress{position:relative;height:5px;border-radius:3px;background:#23232c;overflow:hidden;display:none}
  .oc-node-shell-progress[data-active="true"]{display:block}
  .oc-node-shell-progress>span{display:block;height:100%;background:var(--oc-accent,#7c8bf0);width:0%;transition:width .15s ease}
  .oc-node-shell-open{margin-top:auto;padding:6px 10px;border-radius:6px;background:var(--oc-accent,#7c8bf0);border:1px solid var(--oc-accent,#7c8bf0);color:#0b0d1a;font-weight:600;cursor:pointer}
  .oc-node-shell-open:hover{filter:brightness(1.08)}
`;
function mt(e = document) {
  if (e.getElementById(nt)) return;
  const t = e.createElement("style");
  t.id = nt, t.textContent = Zn, e.head.append(t);
}
function er({ kind: e, title: t, buttonLabel: n, onOpen: r }) {
  mt(document);
  const s = document.createElement("div");
  s.className = "oc-node-shell", s.dataset.shellKind = e;
  const a = document.createElement("div");
  a.className = "oc-node-shell-title", a.textContent = t ?? "";
  const i = document.createElement("div");
  i.className = "oc-node-shell-meta";
  const o = document.createElement("div");
  o.className = "oc-node-shell-status";
  const c = document.createElement("div");
  c.className = "oc-node-shell-progress";
  const h = document.createElement("span");
  c.append(h);
  const u = document.createElement("button");
  u.type = "button", u.className = "oc-node-shell-open", u.textContent = n ?? "Open", s.append(a, i, o, c, u);
  const m = new AbortController();
  return u.addEventListener("click", (f) => r?.(f), { signal: m.signal }), {
    root: s,
    openButton: u,
    setTitle(f) {
      a.textContent = f ?? "";
    },
    setMeta(f) {
      i.textContent = f ?? "";
    },
    setStatus(f) {
      o.textContent = f ?? "";
    },
    setProgress(f) {
      if (f == null) {
        c.dataset.active = "false";
        return;
      }
      c.dataset.active = "true";
      const E = Math.max(0, Math.min(1, f));
      h.style.width = `${(E * 100).toFixed(1)}%`;
    },
    dispose() {
      m.abort();
    }
  };
}
const tr = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");
function nr(e) {
  return !!(e.offsetWidth || e.offsetHeight || e.getClientRects?.().length);
}
function rr(e) {
  return [...e.querySelectorAll(tr)].filter(nr);
}
function sr(e) {
  let t = !1, n = null, r = null;
  function s(a) {
    if (a.key !== "Tab") return;
    const i = rr(e);
    if (!i.length) {
      a.preventDefault(), e.focus();
      return;
    }
    const o = i[0], c = i[i.length - 1], h = e.ownerDocument?.activeElement ?? document.activeElement;
    a.shiftKey ? (h === o || !i.includes(h)) && (a.preventDefault(), c.focus()) : (h === c || !i.includes(h)) && (a.preventDefault(), o.focus());
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
class ar {
  constructor({ kind: t, nodeId: n, title: r, onRequestClose: s, onResize: a }) {
    this.kind = t, this.nodeId = String(n), this.title = r, this.onRequestClose = s, this.onResize = a, this.backdrop = null, this.window = null, this.content = null, this.disposed = !1, this._maximized = !1, this.abort = null, this.focusTrap = null;
  }
  mount(t) {
    if (this.disposed) throw new Error("WorkbenchHost is disposed");
    if (this.backdrop) return;
    mt(document);
    const n = document.createElement("div");
    n.className = "oc-workbench-backdrop", n.dataset.kind = this.kind, n.dataset.nodeId = this.nodeId, n.setAttribute("role", "dialog"), n.setAttribute("aria-modal", "true");
    const r = `oc-workbench-title-${this.kind}-${this.nodeId}`;
    n.setAttribute("aria-labelledby", r), n.innerHTML = `
      <section class="oc-workbench-window" tabindex="-1">
        <header class="oc-workbench-header">
          <div id="${r}" class="oc-workbench-title"></div>
          <div class="oc-workbench-actions">
            <button type="button" data-workbench-act="maximize" aria-label="Maximize workbench">[ ]</button>
            <button type="button" data-workbench-act="close" aria-label="Close workbench">x</button>
          </div>
        </header>
        <div class="oc-workbench-content"></div>
      </section>`, this.backdrop = n, this.window = n.querySelector(".oc-workbench-window"), this.content = n.querySelector(".oc-workbench-content"), this.setTitle(this.title), this.content.append(t), document.body.append(n), this.abort = new AbortController();
    const { signal: s } = this.abort;
    n.querySelector('[data-workbench-act="close"]')?.addEventListener("click", () => {
      this.requestClose("button");
    }, { signal: s }), n.querySelector('[data-workbench-act="maximize"]')?.addEventListener("click", () => this.setMaximized(!this._maximized), { signal: s }), n.addEventListener("keydown", (a) => {
      a.key === "Escape" && (a.stopPropagation(), this.requestClose("escape"));
    }, { signal: s, capture: !0 }), window.addEventListener("resize", () => this.onResize?.(), { signal: s }), this.focusTrap = sr(this.window), this.focusTrap.activate(), this.window.focus(), requestAnimationFrame(() => this.onResize?.());
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
class ir {
  constructor() {
    this._active = null;
  }
  get activeKey() {
    return this._active?.key ?? null;
  }
  get activeSession() {
    return this._active;
  }
  async open({ key: t, opener: n, createSession: r }) {
    if (this._active?.key === t)
      return this._active.host?.focus?.(), this._active;
    if (this._active && !await this._closeSession(this._active, "switch"))
      return null;
    const s = await r();
    return s ? (s.opener = n ?? null, this._active = s, s) : null;
  }
  async close(t, n = "programmatic") {
    return !this._active || this._active.key !== t ? !0 : this._closeSession(this._active, n);
  }
  async closeActive(t = "switch") {
    return this._active ? this._closeSession(this._active, t) : !0;
  }
  disposeForNode(t) {
    this._active && String(this._active.nodeId) === String(t) && (this._active.dispose?.(), this._active = null);
  }
  async _closeSession(t, n) {
    return await t.close?.(n) === !1 ? !1 : (this._active === t && (this._active = null), t.opener?.focus?.(), !0);
  }
}
const ve = new ir();
function or(e) {
  for (const t of ["state_json", "recording_path", "card_asset"]) {
    const n = e.widgets?.find((r) => r.name === t);
    n && (n.computeSize = () => [0, -4], n.draw = () => {
    }, n.hidden = !0, n.options = { ...n.options || {}, hideInVueNodes: !0 });
  }
}
function oe(e) {
  const t = e.getSnapshot(), n = [];
  t.fps && n.push(`${t.fps} fps`), t.durationSeconds && n.push(`${t.durationSeconds.toFixed(1)} s`), t.width && t.height && n.push(`${t.width}x${t.height}`), e.shell?.setTitle(t.sceneName || V("OmniCam Director")), e.shell?.setMeta(n.join("  |  ")), e.shell?.setStatus(
    `${t.cameraCount} ${V("cameras")}  |  ${t.objectCount} ${V("objects")}`
  );
}
function rt(e) {
  return `director:${e.id}`;
}
async function cr(e, t) {
  return ve.open({
    key: rt(e.node),
    opener: t,
    createSession: async () => {
      const n = ++e.workbenchGeneration, { openDirectorWorkbench: r, closeDirectorWorkbench: s } = await import("./chunk-CKCGudqZ.js").then((c) => c.e);
      if (e.disposed || n !== e.workbenchGeneration) return null;
      const a = r(e);
      e.pendingUpstreamResync && (e.pendingUpstreamResync = !1, a.syncUpstreamInputs?.());
      const i = rt(e.node), o = new ar({
        kind: "director",
        nodeId: e.node.id,
        title: e.getSnapshot().sceneName || V("OmniCam Director"),
        // No non-interruptible capture guard in this pass: closing always
        // succeeds. A future pass can refuse here while a realtime capture is
        // in its finalization window (plan section 15).
        onRequestClose: (c) => ve.close(i, c),
        onResize: () => a.scheduleResizeAndRender?.()
      });
      return o.mount(a.root), {
        key: i,
        nodeId: e.node.id,
        host: o,
        close: async () => (a.serialize?.(), s(a), o.dispose(), !0),
        dispose: () => {
          s(a), o.dispose();
        }
      };
    }
  });
}
function lr(e) {
  if (e.__majoorOmniCamDirectorRuntime) return e.__majoorOmniCamDirectorRuntime;
  const t = new Ct(e, { app: ut, api: Fe });
  Wn(t);
  try {
    t.agentBridge = Xn(t, e, Fe);
  } catch (f) {
    console.warn("[OmniCam] Agent bridge unavailable", f);
  }
  or(e);
  const n = er({
    kind: "director",
    title: V("OmniCam Director"),
    buttonLabel: V("OPEN DIRECTOR"),
    onOpen: (f) => {
      cr(t, f.currentTarget);
    }
  });
  t.shell = n, oe(t), t.addEventListener("statechange", () => oe(t)), t.addEventListener("statuschange", () => oe(t)), t.addEventListener("upstreamchange", () => oe(t)), e.__majoorOmniCamDirectorRuntime = t, e.addDOMWidget("majoor_omnicam_director_shell", "omnicam", n.root, {
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
  e.onConfigure = function(...f) {
    s?.apply(this, f), r();
  };
  const a = e.onAfterGraphConfigured;
  e.onAfterGraphConfigured = function(...f) {
    a?.apply(this, f), r();
  };
  const i = () => {
    clearTimeout(t.connectionTimer), t.connectionTimer = setTimeout(() => {
      t.disposed || (t.workbench ? t.workbench.syncUpstreamInputs() : t.pendingUpstreamResync = !0, e.setDirtyCanvas?.(!0, !0));
    }, 60);
  }, o = e.onConnectionsChange;
  e.onConnectionsChange = function(...f) {
    o?.apply(this, f), i();
  };
  const c = kt(e, i), h = e.onResize;
  e.onResize = function(...f) {
    h?.apply(this, f), t.workbench?.scheduleResizeAndRender?.();
  };
  const u = e.onExecuted;
  e.onExecuted = function(f) {
    u?.apply(this, arguments), t.workbench && (t.workbench.loadExecutionPreview(f), t.workbench.syncUpstreamInputs());
  };
  const m = e.onRemoved;
  return e.onRemoved = function(...f) {
    ve.disposeForNode(e.id), c(), cancelAnimationFrame(t.restoreFrame), clearTimeout(t.connectionTimer), t.agentBridge?.dispose?.(), n.dispose(), t.dispose(), m?.apply(this, f);
  }, t;
}
const Rr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attachDirectorShell: lr
}, Symbol.toStringTag, { value: "Module" }));
export {
  hr as C,
  it as S,
  l as U,
  hn as a,
  we as b,
  en as c,
  Ar as d,
  Nr as e,
  Ir as f,
  yr as g,
  Er as h,
  In as i,
  wn as j,
  Tr as k,
  br as l,
  _r as m,
  Ot as n,
  Ne as o,
  pr as p,
  Rr as q,
  wr as r,
  ue as s,
  gr as w
};
