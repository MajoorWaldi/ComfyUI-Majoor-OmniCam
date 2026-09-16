import { app as ft } from "../../scripts/app.js";
import { api as Pe } from "../../scripts/api.js";
import { s as ce, a as de, d as ve, b as mt, c as fe, e as ut, l as Fe, n as Ae, f as $e, g as Y, m as he, I as le, D as _t, r as ht, p as Et, t as At, h as gt, i as pt, j as bt, w as Tt, k as ze, o as wt, q as yt, u as W } from "./chunk-C3_sdQC-.js";
import { s as It } from "./chunk-BEx9le1G.js";
import { c as Nt, w as Rt, a as Te, W as Ot } from "./chunk-B8M65iay.js";
const St = /* @__PURE__ */ new Set(["good", "warning", "bad", "unknown"]);
function Ct(e, t) {
  const n = Math.max(0, Math.floor(Number(t) || 0)), r = Array.from({ length: n }, (s, i) => ({ frame: i, state: "unknown", score: null })), a = e?.solve_health_v1;
  if (!a || !Array.isArray(a.frames)) return r;
  for (const s of a.frames) {
    const i = Number(s?.frame);
    if (!Number.isInteger(i) || i < 0 || i >= r.length) continue;
    const o = St.has(s?.state) ? s.state : "unknown", c = s?.score;
    let _ = null;
    if (c != null) {
      const u = Number(c);
      _ = Number.isFinite(u) ? Math.max(0, Math.min(1, u)) : null;
    }
    r[i] = { frame: i, state: o, score: _ };
  }
  return r;
}
function L(e, t) {
  return e.widgets?.find((n) => n.name === t) ?? null;
}
class kt extends EventTarget {
  constructor(t, { app: n, api: r } = {}) {
    super(), this.app = n, this.api = r, this.node = t, this.disposed = !1, this.workbench = null, this.pendingUiDirtyMask = 0, this.serializeScheduled = !1, this.serializeFrame = null, this.directorApi = null, this.agentBridge = null, this.workbenchGeneration = 0, this.pendingUpstreamResync = !1, this.stateWidget = L(t, "state_json"), this.recordingWidget = L(t, "recording_path"), this.cardWidget = L(t, "card_asset"), this.widthWidget = L(t, "width"), this.heightWidget = L(t, "height"), this.fpsWidget = L(t, "fps"), this.durationWidget = L(t, "duration_seconds"), this.modeWidget = L(t, "render_mode");
    let a = null;
    try {
      a = JSON.parse(this.stateWidget?.value || "{}");
    } catch {
    }
    this.state = ce(a), this.sceneBaseline = this.stateWidget?.value || JSON.stringify(this.state), this.sceneName = this.state.metadata?.scene_name || "", this.frame = 0, this.camera = de(this.state, 0), this.directorRevision = 0, this.renderRevision = 0;
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
    t && (cancelAnimationFrame(this.serializeFrame), this.serializeScheduled = !1), It(this);
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
const P = 1, Ke = 50, j = 120, J = 160, jt = Object.freeze(["perspective", "orthographic"]), h = Object.freeze({
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
}), rt = Object.freeze(Object.values(h)), I = Object.freeze({
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
}), vt = Object.freeze(Object.values(I));
class d extends Error {
  constructor(t, n, r = null, a = null) {
    super(n), this.name = "DirectorApiError", this.code = t, this.operationIndex = r, this.details = a;
  }
}
const Mt = 25, Je = 100;
function H(e, t) {
  const n = e?.offset === void 0 ? 0 : Number(e.offset), r = e?.limit === void 0 ? Mt : Number(e.limit);
  if (!Number.isInteger(n) || n < 0)
    throw new d(
      "BAD_QUERY",
      "offset must be a non-negative integer"
    );
  if (!Number.isInteger(r) || r < 1 || r > Je)
    throw new d(
      "BAD_QUERY",
      `limit must be between 1 and ${Je}`
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
function Ut(e) {
  return Number.isInteger(e.directorRevision) ? Math.max(0, e.directorRevision) : 0;
}
function N(e, t) {
  return {
    ...t,
    revision: Ut(e)
  };
}
function Lt(e, t) {
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
    case I.CAMERA_GET: {
      const r = t.cameraId || n.active_camera_id, a = (n.cameras || []).find((s) => s.id === r);
      if (!a) throw new d("UNKNOWN_CAMERA", `Unknown camera: ${r}`);
      return N(e, { version: 1, type: t.type, camera: B(a) });
    }
    case I.CAMERA_LIST: {
      const r = n.cameras || [], { offset: a, limit: s, end: i } = H(t, r.length);
      return N(e, {
        version: 1,
        type: t.type,
        items: r.slice(a, i).map(Dt),
        total: r.length,
        offset: a,
        limit: s
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
        frames: Ct(n.metadata, n.duration_frames)
      });
    case I.ASSET_LIST: {
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
      return N(e, { version: 1, type: t.type, items: B(a), total: a.length });
    }
    case I.ASSET_GET: {
      const r = (n.objects || []).find((a) => a.id === t.objectId);
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
      const r = (n.objects || []).find((s) => s.id === t.objectId);
      if (!r) throw new d("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      const a = r.character || null;
      return N(e, {
        version: 1,
        type: t.type,
        rig: B({
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
    case I.CHARACTER_GET_POSE: {
      const r = (n.objects || []).find((s) => s.id === t.objectId);
      if (!r) throw new d("UNKNOWN_OBJECT", `Unknown object: ${t.objectId}`);
      const a = r.character?.pose || {};
      return N(e, {
        version: 1,
        type: t.type,
        pose: B({
          objectId: r.id,
          preset_id: a.preset_id || "neutral",
          root_offset: Array.isArray(a.root_offset) ? a.root_offset : [0, 0, 0],
          joints: a.joints || {},
          has_motion: !!r.character?.motion
        })
      });
    }
    case I.OBJECT_LIST: {
      const r = n.objects || [], { offset: a, limit: s, end: i } = H(t, r.length);
      return N(e, {
        version: 1,
        type: t.type,
        items: r.slice(a, i).map(ge),
        total: r.length,
        offset: a,
        limit: s
      });
    }
    case I.OBJECT_GET: {
      const r = (n.objects || []).find((a) => a.id === t.objectId);
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
      const r = String(t.text || "").trim().toLowerCase(), a = Array.isArray(t.tags) ? t.tags.map((E) => String(E).toLowerCase()) : [], s = t.asset_kind !== void 0 ? t.asset_kind : null, i = t.type_ !== void 0 ? t.type_ : t.objectType !== void 0 ? t.objectType : null, o = typeof t.enabled == "boolean" ? t.enabled : null, c = (E) => {
        if (r && ![E.id, E.name || "", ...Array.isArray(E.tags) ? E.tags : []].map((p) => String(p).toLowerCase()).some((p) => p.includes(r)))
          return !1;
        if (a.length) {
          const y = (Array.isArray(E.tags) ? E.tags : []).map((p) => String(p).toLowerCase());
          if (!a.every((p) => y.includes(p))) return !1;
        }
        return !(s !== null && E.asset_kind !== s || i !== null && E.type !== i || o !== null && E.enabled !== !1 !== o);
      }, _ = (n.objects || []).filter(c), { offset: u, limit: f, end: m } = H(t, _.length);
      return N(e, {
        version: 1,
        type: t.type,
        items: _.slice(u, m).map(ge),
        total: _.length,
        offset: u,
        limit: f
      });
    }
    case I.CHARACTER_LIST: {
      const r = (n.objects || []).filter((o) => o.asset_kind === "character"), { offset: a, limit: s, end: i } = H(t, r.length);
      return N(e, {
        version: 1,
        type: t.type,
        items: r.slice(a, i).map((o) => ({
          ...ge(o),
          has_motion: !!o.character?.motion,
          pose_preset: o.character?.pose?.preset_id || null
        })),
        total: r.length,
        offset: a,
        limit: s
      });
    }
    case I.SHOT_LIST: {
      const r = n.sequence?.cuts || n.cuts || [], a = Math.max(0, (n.duration_frames || 1) - 1), s = r.map((_, u) => ({
        index: u,
        start: _.start,
        end: u + 1 < r.length ? r[u + 1].start - 1 : a,
        camera_id: _.camera_id
      })), { offset: i, limit: o, end: c } = H(t, s.length);
      return N(e, {
        version: 1,
        type: t.type,
        items: s.slice(i, c),
        total: s.length,
        offset: i,
        limit: o
      });
    }
    case I.KEYFRAME_LIST: {
      const r = t.cameraId || n.active_camera_id, a = (n.cameras || []).find((_) => _.id === r);
      if (!a) throw new d("UNKNOWN_CAMERA", `Unknown camera: ${r}`);
      const s = a.keyframes || [], { offset: i, limit: o, end: c } = H(t, s.length);
      return N(e, {
        version: 1,
        type: t.type,
        cameraId: a.id,
        items: s.slice(i, c).map((_) => ({
          frame: _.frame,
          interpolation: _.interpolation,
          position: Array.isArray(_.camera?.position) ? [..._.camera.position] : [0, 0, 0]
        })),
        total: s.length,
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
  let a = 1, s = `${t}_${a}`;
  for (; e.has(s); )
    a += 1, s = `${t}_${a}`;
  return s;
}
function Bt(e) {
  const t = e === "ground", n = e === "human", r = e === "card", a = e === "sun_light", s = e === "point_light", i = e === "spot_light";
  let o;
  t ? o = [12, 0.1, 12] : n ? o = [0.7, 1.8, 0.4] : r ? o = [2, 3] : o = [1.5, 1.5, 1.5];
  let c = [0, 0, 0], _ = [0, 0, 0], u = "#8c929b", f, m, E, y;
  return a ? (c = [5, 8.5, 4], _ = [-55, 35, 0], u = "#fff6ec", f = 2.2, m = !0) : s ? (c = [0, 3, 0], u = "#ffffff", f = 2, m = !1) : i && (c = [0, 4, 0], _ = [-60, 0, 0], u = "#ffffff", f = 3, E = 45, y = 0.25, m = !0), {
    position: c,
    rotation: _,
    size: o,
    color: u,
    material_mode: t ? "checker" : "textured",
    ...f !== void 0 ? { intensity: f } : {},
    ...m !== void 0 ? { cast_shadow: m } : {},
    ...E !== void 0 ? { cone_angle: E } : {},
    ...y !== void 0 ? { penumbra: y } : {}
  };
}
function Pt(e, t) {
  e.cameras ||= [];
  const n = new Set(e.cameras.map((i) => i.id)), r = Ee(n, "camera", t.id), a = { ...mt(), ...t.camera || {} }, s = {
    id: r,
    name: t.name || r,
    color: "#4aa3ef",
    locked: !1,
    muted: !1,
    solo: !1,
    camera: a,
    keyframes: [{ frame: 0, camera: fe(a), interpolation: t.interpolation || "ease" }]
  };
  return e.cameras.push(s), { cameraId: r };
}
function Ft(e, t) {
  const n = (e.cameras || []).find((i) => i.id === t.cameraId);
  if (!n) throw new d("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  const r = new Set(e.cameras.map((i) => i.id)), a = Ee(r, "camera", t.id), s = JSON.parse(JSON.stringify(n));
  return s.id = a, s.name = t.name || `${n.name || n.id} copy`, e.cameras.push(s), { cameraId: a };
}
function $t(e, t) {
  const n = e.cameras || [], r = n.findIndex((s) => s.id === t.cameraId);
  if (r === -1) throw new d("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  if (n.length <= 1) throw new d("LAST_CAMERA", "cannot delete the only camera");
  if (n[r].locked) throw new d("ENTITY_LOCKED", `${t.cameraId} is locked`);
  if ((e.sequence?.cuts || []).some((s) => s.camera_id === t.cameraId))
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
  const r = (e.cameras || []).find((a) => a.id === t.cameraId);
  if (!r) throw new d("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  return e.playblast_camera_id = r.id, { cameraId: r.id };
}
function Jt(e, t) {
  if (!at.has(t.objectType))
    throw new d("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${t.objectType}`);
  e.objects ||= [];
  const n = new Set(e.objects.map((i) => i.id)), r = Ee(n, t.objectType, t.id), a = Bt(t.objectType), s = {
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
function Ht(e, t) {
  const n = (e.objects || []).find((c) => c.id === t.objectId);
  if (!n) throw new d("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  const r = new Set(e.objects.map((c) => c.id)), a = Ee(r, n.type || "object", t.id), s = Array.isArray(t.offset) ? t.offset : [0.35, 0, 0.35], i = JSON.parse(JSON.stringify(n));
  i.id = a, i.name = t.name || `${n.name || n.id} copy`, i.locked = !1;
  const o = Array.isArray(n.position) ? n.position : [0, 0, 0];
  return i.position = [o[0] + s[0], o[1] + s[1], o[2] + s[2]], e.objects.push(i), { objectId: a, resourceRefresh: !!n.asset_id };
}
function Gt(e, t) {
  const n = e.objects || [], r = n.findIndex((s) => s.id === t.objectId);
  if (r === -1) throw new d("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  const a = n[r];
  if (a.id === "subject") throw new d("PROTECTED_OBJECT", "the subject object cannot be deleted");
  if (a.locked) throw new d("ENTITY_LOCKED", `${t.objectId} is locked`);
  for (const s of n)
    s.parent_id === t.objectId && (s.parent_id = null);
  return n.splice(r, 1), { objectId: t.objectId, resourceRefresh: !!a.asset_id };
}
function Vt(e, t) {
  const n = (e.objects || []).find((r) => r.id === t.objectId);
  if (!n) throw new d("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  return n.name = String(t.name || "").trim().slice(0, 80) || n.name, { objectId: n.id };
}
function Wt(e, t) {
  const n = (e.objects || []).find((o) => o.id === t.objectId);
  if (!n) throw new d("UNKNOWN_OBJECT", `${t.objectId} does not exist`);
  if (t.parentId === null || t.parentId === void 0)
    return n.parent_id = null, { objectId: n.id };
  if (t.parentId === t.objectId)
    throw new d("INVALID_PARENT", "an object cannot be its own parent");
  const r = (e.objects || []).find((o) => o.id === t.parentId);
  if (!r) throw new d("UNKNOWN_OBJECT", `${t.parentId} does not exist`);
  const a = new Map(e.objects.map((o) => [o.id, o]));
  let s = r;
  const i = /* @__PURE__ */ new Set();
  for (; s; ) {
    if (s.id === t.objectId)
      throw new d("INVALID_PARENT", "assigning this parent would create a cycle");
    if (i.has(s.id)) break;
    i.add(s.id), s = s.parent_id ? a.get(s.parent_id) : null;
  }
  return n.parent_id = t.parentId, { objectId: n.id };
}
function Yt(e, t) {
  e.sequence ||= ve();
  const n = e.sequence.cuts ||= [], r = Math.max(0, (e.duration_frames || 1) - 1);
  if (!Number.isInteger(t.start) || t.start < 0 || t.start > r)
    throw new d("FRAME_OUT_OF_RANGE", `cut start must be within 0..${r}`);
  if (!(e.cameras || []).find((i) => i.id === t.cameraId)) throw new d("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
  const s = n.find((i) => i.start === t.start);
  return s ? s.camera_id = t.cameraId : n.push({ start: t.start, camera_id: t.cameraId }), n.sort((i, o) => i.start - o.start), e.sequence.enabled = !0, { start: t.start, cameraId: t.cameraId };
}
function Qt(e, t) {
  e.sequence ||= ve();
  const n = e.sequence.cuts || [], r = n.findIndex((a) => a.start === t.start);
  if (r === -1) throw new d("UNKNOWN_CUT", `no cut starts at frame ${t.start}`);
  return n.splice(r, 1), n.length && (n[0].start = 0), e.sequence.enabled = n.length > 0, { start: t.start };
}
function Xt(e, t) {
  e.sequence ||= ve();
  const r = (e.sequence.cuts || []).find((s) => s.start === t.start);
  if (!r) throw new d("UNKNOWN_CUT", `no cut starts at frame ${t.start}`);
  if (!(e.cameras || []).find((s) => s.id === t.cameraId)) throw new d("UNKNOWN_CAMERA", `${t.cameraId} does not exist`);
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
], or = {
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
function qt(e, t) {
  const n = [...e.position], r = Array.isArray(t) ? [...t] : [...e.target], a = ut(r, n), s = Fe(a) > 1e-9 ? Ae(a) : [0, 0, -1];
  let i = $e(s, Me);
  Fe(i) < 1e-6 && (i = [1, 0, 0]), i = Ae(i);
  const o = Ae($e(i, s));
  return { position: n, target: r, forward: s, right: i, up: o };
}
function Zt(e) {
  return {
    fov: e.fov,
    roll: e.roll || 0,
    zoom: e.zoom || 1,
    near: e.near,
    far: e.far,
    camera_type: e.camera_type || "perspective"
  };
}
function xt(e) {
  return [
    { position: e.position, target: e.target },
    { position: e.position, target: e.target }
  ];
}
function He(e, t, n) {
  const r = n === "out" ? -1 : 1, a = Y(e.position, he(e.forward, r * t));
  return [
    { position: e.position, target: e.target },
    { position: a, target: e.target }
  ];
}
function Ge(e, t, n) {
  const r = n === "right" ? 1 : -1, a = he(e.right, r * t);
  return [
    { position: e.position, target: e.target },
    { position: Y(e.position, a), target: Y(e.target, a) }
  ];
}
function Ve(e, t, n) {
  const a = he(Me, (n === "down" ? -1 : 1) * t);
  return [
    { position: e.position, target: e.target },
    { position: Y(e.position, a), target: Y(e.target, a) }
  ];
}
function We(e, t, n) {
  const r = n === "down" ? -1 : 1, a = Y(e.position, he(Me, r * t));
  return [
    { position: e.position, target: e.target },
    { position: a, target: e.target }
  ];
}
function ne(e, { degrees: t = 180, direction: n = "cw", radius: r, radiusEnd: a, heightOffset: s = 0, samples: i = 5, close: o = !1 } = {}) {
  const c = e.target, _ = e.position[0] - c[0], u = e.position[2] - c[2], f = Math.hypot(_, u) || 1e-6, m = Math.atan2(u, _), E = Number.isFinite(r) ? r : f, y = Number.isFinite(a) ? a : E, p = n === "ccw" ? 1 : -1, S = Math.abs(t) * Math.PI / 180 * p, k = Math.max(2, Math.round(i)), X = e.position[1] + s, b = [];
  for (let g = 0; g < k; g += 1) {
    const w = o ? g / k : g / (k - 1), C = m + S * w, v = E + (y - E) * w;
    b.push({
      position: [c[0] + Math.cos(C) * v, X, c[2] + Math.sin(C) * v],
      target: [...c]
    });
  }
  return b;
}
function en({ type: e, camera: t, target: n, startFrame: r, endFrame: a, params: s = {} } = {}) {
  if (!we.includes(e)) return { ok: !1, reason: "unknown_preset" };
  if (!t || !Array.isArray(t.position) || !Array.isArray(t.target)) return { ok: !1, reason: "invalid_camera" };
  const i = Math.round(Number(r)), o = Math.round(Number(a));
  if (!Number.isFinite(i) || !Number.isFinite(o) || o <= i) return { ok: !1, reason: "invalid_range" };
  const c = qt(t, n), _ = Number(s.distance) > 0 ? Number(s.distance) : 1, u = (p, S, k) => ({
    degrees: Number(s.degrees) || p,
    direction: S,
    radius: Number.isFinite(Number(s.radius)) ? Number(s.radius) : void 0,
    heightOffset: Number(s.heightOffset) || 0,
    samples: Number(s.samples) || k
  });
  let f;
  switch (e) {
    case "static":
      f = xt(c);
      break;
    case "dolly_in":
      f = He(c, _, "in");
      break;
    case "dolly_out":
      f = He(c, _, "out");
      break;
    case "truck_left":
      f = Ge(c, _, "left");
      break;
    case "truck_right":
      f = Ge(c, _, "right");
      break;
    case "pedestal_up":
      f = Ve(c, _, "up");
      break;
    case "pedestal_down":
      f = Ve(c, _, "down");
      break;
    case "crane_up":
      f = We(c, _, "up");
      break;
    case "crane_down":
      f = We(c, _, "down");
      break;
    case "arc_left":
      f = ne(c, u(45, "ccw", 5));
      break;
    case "arc_right":
      f = ne(c, u(45, "cw", 5));
      break;
    case "orbit":
      f = ne(c, { ...u(180, s.direction === "ccw" ? "ccw" : "cw", 5), close: !!s.close });
      break;
    case "spiral":
      f = ne(c, {
        ...u(360, s.direction === "ccw" ? "ccw" : "cw", 8),
        radiusEnd: Number.isFinite(Number(s.radiusEnd)) ? Number(s.radiusEnd) : void 0
      });
      break;
    default:
      return { ok: !1, reason: "unknown_preset" };
  }
  if (o - i + 1 < f.length) return { ok: !1, reason: "insufficient_frame_slots" };
  const m = f.map((p, S) => f.length <= 1 ? i : Math.round(i + (o - i) * S / (f.length - 1)));
  for (let p = 1; p < m.length; p += 1) m[p] <= m[p - 1] && (m[p] = m[p - 1] + 1);
  for (let p = m.length - 1; p > 0; p -= 1) m[p] > o - (m.length - 1 - p) && (m[p] = o - (m.length - 1 - p));
  m[0] = i, m[m.length - 1] = o;
  const E = Zt(t);
  return { ok: !0, keyframes: f.map((p, S) => ({
    frame: m[S],
    interpolation: "smooth",
    camera: { position: p.position, target: p.target, ...E }
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
function T(e, t, n) {
  if (!Array.isArray(e) || e.length !== 3 || !e.every(z))
    throw new d("BAD_VECTOR", `${t} must be [x,y,z] of finite numbers`, n);
}
function R(e, t, n) {
  if (!Number.isInteger(e) || e < 0)
    throw new d("BAD_FRAME", `${t} must be a non-negative integer frame`, n);
}
function A(e, t, n, r) {
  if (typeof e != "string" || e.length === 0)
    throw new d("BAD_ID", `${t} must be a non-empty string`, n);
  if (r !== void 0 && e.length > r)
    throw new d("BAD_ID", `${t} exceeds ${r} characters`, n);
}
function V(e, t, n) {
  if (!z(e))
    throw new d("BAD_VALUE", `${t} must be a finite number`, n);
}
function Ye(e, t, n) {
  if (!Array.isArray(e) || e.length === 0 || !e.every((r) => Number.isInteger(r) && r >= 0))
    throw new d("BAD_VALUE", `${t} must be a non-empty array of non-negative integer frames`, n);
}
const an = /* @__PURE__ */ new Set(["translate", "rotate", "scale"]), sn = /* @__PURE__ */ new Set([
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
    if (!sn.has(n))
      throw new d("BAD_VALUE", `camera.create: unsupported camera field "${n}"`, t);
  if (e.position !== void 0 && T(e.position, "camera.position", t), e.target !== void 0 && T(e.target, "camera.target", t), e.up !== void 0 && T(e.up, "camera.up", t), e.fov !== void 0 && (V(e.fov, "camera.fov", t), e.fov < 1 || e.fov > 179))
    throw new d("BAD_VALUE", "camera.fov must be within 1..179", t);
  if (e.roll !== void 0 && V(e.roll, "camera.roll", t), e.zoom !== void 0 && (V(e.zoom, "camera.zoom", t), e.zoom <= 0))
    throw new d("BAD_VALUE", "camera.zoom must be > 0", t);
  if (e.near !== void 0 && (V(e.near, "camera.near", t), e.near <= 0))
    throw new d("BAD_VALUE", "camera.near must be > 0", t);
  if (e.far !== void 0) {
    V(e.far, "camera.far", t);
    const n = e.near === void 0 ? _t : e.near;
    if (e.far <= n)
      throw new d("BAD_VALUE", "camera.far must be greater than camera.near", t);
  }
  if (e.camera_type !== void 0 && !jt.includes(e.camera_type))
    throw new d("BAD_VALUE", `Unsupported camera_type: ${e.camera_type}`, t);
}
function cn(e, t) {
  if (!e || typeof e != "object" || Array.isArray(e))
    throw new d("BAD_OPERATION", "operation must be an object", t);
  const { type: n } = e;
  if (!rt.includes(n))
    throw new d("UNKNOWN_OPERATION", `Unknown operation type: ${n}`, t);
  switch (n) {
    case h.ASSET_INSTANTIATE: {
      const r = e.asset;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new d("BAD_VALUE", "asset.instantiate needs a resolved asset object", t);
      if (A(r.id, "asset.id", t), A(r.kind, "asset.kind", t), String(r.id).length > 120 || String(r.kind).length > 32)
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
      e.point !== void 0 && T(e.point, "point", t), e.id !== void 0 && A(e.id, "id", t);
      break;
    }
    case h.CAMERA_SET_ACTIVE:
      A(e.cameraId, "cameraId", t);
      break;
    case h.CAMERA_SET_LOCKED:
      if (A(e.cameraId, "cameraId", t), typeof e.value != "boolean")
        throw new d("BAD_VALUE", "camera.set_locked needs a boolean value", t);
      break;
    case h.CAMERA_CREATE:
      if (e.id !== void 0 && A(e.id, "id", t, j), e.name !== void 0 && A(e.name, "name", t, J), e.camera !== void 0) {
        if (typeof e.camera != "object" || Array.isArray(e.camera) || e.camera === null)
          throw new d("BAD_VALUE", "camera.create camera must be an object", t);
        on(e.camera, t);
      }
      if (e.interpolation !== void 0 && !le.includes(e.interpolation))
        throw new d("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      break;
    case h.CAMERA_DUPLICATE:
      A(e.cameraId, "cameraId", t, j), e.id !== void 0 && A(e.id, "id", t, j), e.name !== void 0 && A(e.name, "name", t, J);
      break;
    case h.CAMERA_DELETE:
    case h.CAMERA_SET_PLAYBLAST:
      A(e.cameraId, "cameraId", t, j);
      break;
    case h.CAMERA_RENAME:
      A(e.cameraId, "cameraId", t, j), A(e.name, "name", t, J);
      break;
    case h.OBJECT_CREATE:
      if (A(e.objectType, "objectType", t), !at.has(e.objectType))
        throw new d("UNSUPPORTED_OBJECT_TYPE", `object.create does not support type: ${e.objectType}`, t);
      if (e.asset !== void 0 || e.url !== void 0 || e.path !== void 0)
        throw new d("BAD_VALUE", "object.create does not accept asset/url/path -- use asset.instantiate", t);
      e.id !== void 0 && A(e.id, "id", t, j), e.name !== void 0 && A(e.name, "name", t, J), e.position !== void 0 && T(e.position, "position", t), e.rotation !== void 0 && T(e.rotation, "rotation", t);
      break;
    case h.OBJECT_DUPLICATE:
      A(e.objectId, "objectId", t, j), e.id !== void 0 && A(e.id, "id", t, j), e.name !== void 0 && A(e.name, "name", t, J), e.offset !== void 0 && T(e.offset, "offset", t);
      break;
    case h.OBJECT_DELETE:
      A(e.objectId, "objectId", t, j);
      break;
    case h.OBJECT_RENAME:
      A(e.objectId, "objectId", t, j), A(e.name, "name", t, J);
      break;
    case h.OBJECT_SET_PARENT:
      A(e.objectId, "objectId", t, j), e.parentId !== null && e.parentId !== void 0 && A(e.parentId, "parentId", t, j);
      break;
    case h.CAMERA_TRANSFORM:
      if (e.cameraId !== void 0 && A(e.cameraId, "cameraId", t), e.position !== void 0 && T(e.position, "position", t), e.target !== void 0 && T(e.target, "target", t), e.frame !== void 0 && R(e.frame, "frame", t), e.position === void 0 && e.target === void 0)
        throw new d("EMPTY_OPERATION", "camera.transform needs position and/or target", t);
      break;
    case h.CAMERA_LOOK_AT:
      if (e.cameraId !== void 0 && A(e.cameraId, "cameraId", t), e.point !== void 0 && T(e.point, "point", t), e.objectId !== void 0 && e.objectId !== null && A(e.objectId, "objectId", t), e.point === void 0 && e.objectId === void 0)
        throw new d("EMPTY_OPERATION", "camera.look_at needs a point or an objectId", t);
      break;
    case h.OBJECT_TRANSFORM:
      if (A(e.objectId, "objectId", t), e.position !== void 0 && T(e.position, "position", t), e.rotation !== void 0 && T(e.rotation, "rotation", t), e.scale !== void 0 && T(e.scale, "scale", t), e.position === void 0 && e.rotation === void 0 && e.scale === void 0)
        throw new d("EMPTY_OPERATION", "object.transform needs position, rotation and/or scale", t);
      break;
    case h.OBJECT_SET_ENABLED:
    case h.OBJECT_SET_LOCKED:
      if (A(e.objectId, "objectId", t), typeof e.value != "boolean")
        throw new d("BAD_VALUE", `${n} needs a boolean value`, t);
      break;
    case h.OBJECT_SET_TAGS:
      if (A(e.objectId, "objectId", t), !Array.isArray(e.tags) || e.tags.some((r) => typeof r != "string"))
        throw new d("BAD_VALUE", "object.set_tags needs a string array", t);
      if (e.tags.length > 64)
        throw new d("BAD_VALUE", "object.set_tags: too many tags", t);
      break;
    case h.OBJECT_SET_ANNOTATION:
      if (A(e.objectId, "objectId", t), e.annotation !== null && (typeof e.annotation != "object" || Array.isArray(e.annotation)))
        throw new d("BAD_VALUE", "object.set_annotation needs an object or null", t);
      break;
    case h.CHARACTER_SET_POSE:
      if (A(e.objectId, "objectId", t), e.pose !== null && (typeof e.pose != "object" || Array.isArray(e.pose)))
        throw new d("BAD_VALUE", "character.set_pose needs a pose object or null", t);
      break;
    case h.CHARACTER_SET_JOINT_ROTATION:
      if (A(e.objectId, "objectId", t), A(e.joint, "joint", t), !Array.isArray(e.rotation) || e.rotation.length !== 4 || !e.rotation.every(z))
        throw new d("BAD_QUATERNION", "rotation must be [x,y,z,w] of finite numbers", t);
      break;
    case h.CHARACTER_SET_MOTION: {
      A(e.objectId, "objectId", t);
      const r = e.motion;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new d("BAD_VALUE", "character.set_motion needs a motion object", t);
      A(r.clip_id, "motion.clip_id", t);
      for (const a of ["start_frame", "end_frame", "speed", "offset_seconds"])
        if (r[a] !== void 0 && !z(r[a]))
          throw new d("BAD_VALUE", `motion.${a} must be a finite number`, t);
      if (z(r.start_frame) && z(r.end_frame) && r.end_frame > 0 && r.end_frame <= r.start_frame)
        throw new d("BAD_MOTION_RANGE", "motion end_frame is not after start_frame", t);
      break;
    }
    case h.CHARACTER_CLEAR_MOTION:
      A(e.objectId, "objectId", t);
      break;
    case h.KEYFRAME_UPSERT:
      if (e.cameraId !== void 0 && A(e.cameraId, "cameraId", t), R(e.frame, "frame", t), e.interpolation !== void 0 && !le.includes(e.interpolation))
        throw new d("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      if (e.camera !== void 0) {
        if (!e.camera || typeof e.camera != "object")
          throw new d("BAD_VALUE", "keyframe.upsert camera must be an object", t);
        e.camera.position !== void 0 && T(e.camera.position, "camera.position", t), e.camera.target !== void 0 && T(e.camera.target, "camera.target", t);
        for (const r of ["fov", "roll", "zoom", "near", "far"])
          if (e.camera[r] !== void 0 && !z(e.camera[r]))
            throw new d("BAD_VALUE", `camera.${r} must be finite`, t);
      }
      break;
    case h.KEYFRAME_REMOVE:
      e.cameraId !== void 0 && A(e.cameraId, "cameraId", t), R(e.frame, "frame", t);
      break;
    case h.KEYFRAME_SET_INTERPOLATION:
      if (e.cameraId !== void 0 && A(e.cameraId, "cameraId", t), R(e.frame, "frame", t), !le.includes(e.interpolation))
        throw new d("BAD_INTERPOLATION", `Unsupported interpolation: ${e.interpolation}`, t);
      break;
    case h.TIMELINE_SET_RANGE:
      if (R(e.start, "start", t), R(e.end, "end", t), e.end < e.start)
        throw new d("BAD_RANGE", "range end is before start", t);
      break;
    case h.TIMELINE_SET_DURATION:
      if (!Number.isInteger(e.frames) || e.frames < 1)
        throw new d("BAD_VALUE", "timeline.set_duration needs frames >= 1", t);
      break;
    case h.CUT_UPSERT:
      R(e.start, "start", t), A(e.cameraId, "cameraId", t);
      break;
    case h.CUT_REMOVE:
      R(e.start, "start", t);
      break;
    case h.CUT_SET_CAMERA:
      R(e.start, "start", t), A(e.cameraId, "cameraId", t);
      break;
    case h.CAMERA_PATH_TRANSFORM_KEYS: {
      e.cameraId !== void 0 && A(e.cameraId, "cameraId", t), Ye(e.frames, "frames", t);
      const r = e.transform;
      if (!r || typeof r != "object" || Array.isArray(r))
        throw new d("BAD_VALUE", "camera.path.transform_keys needs a transform object", t);
      if (!an.has(r.mode))
        throw new d("BAD_VALUE", "transform.mode must be translate, rotate or scale", t);
      r.mode === "translate" ? T(r.delta, "transform.delta", t) : r.mode === "scale" ? T(r.factors, "transform.factors", t) : T(r.rotationDeg, "transform.rotationDeg", t), r.origin !== void 0 && T(r.origin, "transform.origin", t);
      break;
    }
    case h.CAMERA_PATH_INSERT_KEY:
      e.cameraId !== void 0 && A(e.cameraId, "cameraId", t), R(e.leftFrame, "leftFrame", t), R(e.rightFrame, "rightFrame", t), e.t !== void 0 && V(e.t, "t", t);
      break;
    case h.CAMERA_PATH_DELETE_KEYS:
      e.cameraId !== void 0 && A(e.cameraId, "cameraId", t), Ye(e.frames, "frames", t);
      break;
    case h.CAMERA_PATH_REDISTRIBUTE_TIMING:
      e.cameraId !== void 0 && A(e.cameraId, "cameraId", t), e.startFrame !== void 0 && R(e.startFrame, "startFrame", t), e.endFrame !== void 0 && R(e.endFrame, "endFrame", t);
      break;
    case h.CAMERA_PATH_APPLY_PRESET:
      if (e.cameraId !== void 0 && A(e.cameraId, "cameraId", t), !we.includes(e.presetType))
        throw new d("BAD_VALUE", `presetType must be one of: ${we.join(", ")}`, t);
      if (R(e.startFrame, "startFrame", t), R(e.endFrame, "endFrame", t), e.endFrame <= e.startFrame)
        throw new d("BAD_RANGE", "camera.path.apply_preset endFrame must be after startFrame", t);
      if (e.target !== void 0 && T(e.target, "target", t), e.params !== void 0 && (typeof e.params != "object" || Array.isArray(e.params)))
        throw new d("BAD_VALUE", "camera.path.apply_preset params must be an object", t);
      break;
    default:
      throw new d("UNKNOWN_OPERATION", `Unknown operation type: ${n}`, t);
  }
}
function ln(e, t) {
  if (!t || typeof t != "object" || Array.isArray(t))
    throw new d("BAD_TRANSACTION", "transaction must be an object");
  if (t.version !== P)
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
    version: P,
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
function cr(e = 0, t = 0) {
  return (e | t) >>> 0;
}
function lr(e, t) {
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
function _n(e) {
  return e.file ? `${e.source === "legacy" ? fn : dn}/${e.file} [input]` : "";
}
function Qe(e, t, n) {
  const r = e || "asset";
  let a = `${r}_${n}`, s = 2;
  for (; t && t.has(a); ) a = `${r}_${n}_${s++}`;
  return a;
}
function hn(e) {
  return {
    rig_profile: !!(e.rig && Object.keys(e.rig.bone_map || {}).length) ? e.rig.profile || "omnicam_humanoid_v1" : null,
    pose: { preset_id: "neutral", root_offset: [0, 0, 0], joints: {} },
    motion: null
  };
}
function En(e, t = {}) {
  if (!e || typeof e != "object" || !e.id)
    throw new Error("compileInstance: an AssetDefinition is required");
  const n = un(t.point, [0, 0, 0]), r = String(t.idSeed || Date.now().toString(36)), a = String(e.kind || "prop"), s = a === "character", i = mn[e.id];
  if (a === "helper" && !e.file && i && i !== "null")
    return {
      id: Qe(i, t.existingIds, r),
      type: i,
      name: e.name || i,
      position: n,
      rotation: [0, 0, 0],
      size: [...e.base_size || [1, 1, 1]],
      keyframes: [],
      enabled: !0,
      asset_id: e.id,
      asset_kind: a,
      tags: [...e.tags || []]
    };
  const o = {
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
    asset: _n(e),
    asset_id: e.id,
    asset_kind: a,
    tags: [...e.tags || []]
  };
  return s && (o.character = hn(e)), o;
}
function dr({ groundHit: e, orbitTarget: t } = {}) {
  return Array.isArray(e) && e.length >= 3 && e.every((n) => Number.isFinite(n)) ? e.slice(0, 3).map(Number) : Array.isArray(t) && t.length >= 3 && t.every((n) => Number.isFinite(n)) ? [Number(t[0]), 0, Number(t[2])] : [0, 0, 0];
}
const De = ["pos_x", "pos_y", "pos_z"], ye = 1e-9, st = ["auto", "aligned", "free", "corner"];
function O(e, t = 0) {
  const n = Number(e);
  return Number.isFinite(n) ? n : t;
}
function D(e) {
  const t = e?.camera?.position;
  return [O(t?.[0]), O(t?.[1]), O(t?.[2])];
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
function Ie(e, t, n) {
  const r = D(e), a = t ? D(t) : r, s = n ? D(n) : r, i = Math.max(ye, O(e?.frame) - O(t?.frame, O(e?.frame) - 1)), o = Math.max(ye, O(n?.frame, O(e?.frame) + 1) - O(e?.frame)), c = [0, 0, 0], _ = [0, 0, 0];
  for (let u = 0; u < 3; u += 1) {
    const f = (r[u] - a[u]) / i, m = (s[u] - r[u]) / o;
    let E = (f + m) * 0.5;
    t ? n ? f * m <= 0 && (E = 0) : E = f : E = m, c[u] = E * o * (1 / 3), _[u] = -E * i * (1 / 3);
  }
  return { out: c, in: _ };
}
function it(e, t, n) {
  const r = D(e), a = t ? D(t) : r, s = n ? D(n) : r;
  return {
    out: me(Q(s, r), 1 / 3),
    in: me(Q(a, r), 1 / 3)
  };
}
function Ne(e, t) {
  const n = e?.tangents?.channels;
  if (!n) return null;
  const r = t === "out" ? "out_y" : "in_y", a = [0, 0, 0];
  let s = !1;
  for (let i = 0; i < 3; i += 1) {
    const o = n[De[i]];
    o && Number.isFinite(Number(o[r])) && (a[i] = Number(o[r]), s = !0);
  }
  return s ? a : null;
}
function ue(e) {
  const t = e?.tangents?.spatial_mode;
  return st.includes(t) ? t : "auto";
}
function Re(e, t = null, n = null) {
  const r = ue(e), a = D(e);
  if (r === "corner") {
    const c = it(e, t, n);
    return { in: re(a, c.in), out: re(a, c.out), mode: r };
  }
  const s = Ie(e, t, n), i = (r === "free" || r === "aligned") && Ne(e, "out") || s.out, o = (r === "free" || r === "aligned") && Ne(e, "in") || s.in;
  return { in: re(a, o), out: re(a, i), mode: r };
}
function re(e, t) {
  return [e[0] + t[0], e[1] + t[1], e[2] + t[2]];
}
function An(e) {
  return e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.channels = e.tangents.channels && typeof e.tangents.channels == "object" ? e.tangents.channels : {}, e.tangents.channels;
}
function K(e, t, n) {
  const r = An(e);
  for (let a = 0; a < 3; a += 1) {
    const s = De[a], i = r[s] && typeof r[s] == "object" ? r[s] : {};
    i.mode = "free", i.out_x = 1 / 3, i.in_x = -1 / 3, t === "out" ? i.out_y = n[a] : i.in_y = n[a], i.out_y === void 0 && (i.out_y = 0), i.in_y === void 0 && (i.in_y = 0), r[s] = i;
  }
}
function _e(e) {
  e.interpolation !== "bezier" && (e.interpolation = "bezier");
}
function ot(e, t, n) {
  const r = D(e), a = Re(e, t, n);
  K(e, "out", Q(a.out, r)), K(e, "in", Q(a.in, r));
}
function fr(e, t, n, { prevKey: r = null, nextKey: a = null, breakCoupling: s = !1 } = {}) {
  if (!e || t !== "in" && t !== "out") return e;
  let i = ue(e);
  if (i === "corner") return e;
  i === "auto" && (i = "aligned", e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.spatial_mode = "aligned", ot(e, r, a));
  const o = D(e), c = Q([
    O(n?.[0]),
    O(n?.[1]),
    O(n?.[2])
  ], o);
  if (_e(e), K(e, t, c), i === "aligned" && !s) {
    const _ = t === "out" ? "in" : "out", u = Ne(e, _) || (_ === "out" ? Ie(e, r, a).out : Ie(e, r, a).in), f = Xe(c), m = Xe(u) || f || 1, E = f > ye ? me(c, -m / f) : me(u, 1);
    K(e, _, E);
  }
  return e;
}
function ae(e, t, n) {
  if (!e || t !== "in" && t !== "out") return e;
  const r = D(e);
  return _e(e), K(e, t, Q([
    O(n?.[0]),
    O(n?.[1]),
    O(n?.[2])
  ], r)), e;
}
function mr(e, t, { prevKey: n = null, nextKey: r = null } = {}) {
  if (!e || !st.includes(t)) return e;
  if (e.tangents = e.tangents && typeof e.tangents == "object" ? e.tangents : {}, e.tangents.spatial_mode = t, t === "auto") {
    if (e.tangents.channels) {
      for (const a of De) delete e.tangents.channels[a];
      Object.keys(e.tangents.channels).length || delete e.tangents.channels;
    }
    return e.interpolation === "bezier" && (e.interpolation = "smooth"), e;
  }
  if (t === "corner") {
    const a = it(e, n, r);
    return _e(e), K(e, "out", a.out), K(e, "in", a.in), e;
  }
  return _e(e), ot(e, n, r), e;
}
const ct = 1e-9;
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
function pn(e) {
  const t = e[0]?.length || 0, n = new Array(t).fill(1);
  for (let r = 0; r < t; r += 1) {
    let a = 1 / 0, s = -1 / 0;
    for (const o of e) {
      const c = Number.isFinite(o[r]) ? o[r] : 0;
      c < a && (a = c), c > s && (s = c);
    }
    const i = s - a;
    n[r] = i > ct ? 1 / i : 0;
  }
  return n;
}
function Ue(e, t) {
  const n = e.map((i) => gn(i, t)), r = pn(n), a = e.map((i) => i.frame), s = Math.max(1, a[a.length - 1] - a[0]);
  return n.map((i, o) => [
    (a[o] - a[0]) / s,
    ...i.map((c, _) => (Number.isFinite(c) ? c : 0) * r[_])
  ]);
}
function qe(e, t) {
  let n = 0;
  for (let r = 0; r < e.length; r += 1) n += (e[r] - t[r]) ** 2;
  return Math.sqrt(n);
}
function Le(e, t, n) {
  let r = 0;
  for (let o = 0; o < t.length; o += 1) r += (n[o] - t[o]) ** 2;
  if (r <= ct) return qe(e, t);
  let a = 0;
  for (let o = 0; o < t.length; o += 1) a += (e[o] - t[o]) * (n[o] - t[o]);
  const s = Math.max(0, Math.min(1, a / r)), i = t.map((o, c) => o + (n[c] - o) * s);
  return qe(e, i);
}
function bn(e, t, n) {
  const r = /* @__PURE__ */ new Set([0, e.length - 1]), a = [[0, e.length - 1]];
  for (; a.length; ) {
    const [s, i] = a.pop();
    if (i - s < 2) continue;
    let o = -1, c = -1;
    for (let _ = s + 1; _ < i; _ += 1) {
      const u = Le(e[_], e[s], e[i]);
      u > o && (o = u, c = _);
    }
    c < 0 || (o > t || n.has(c)) && (r.add(c), a.push([s, c], [c, i]));
  }
  return r;
}
function ur(e, t, { tolerance: n = 0.02, keepFrames: r = [] } = {}) {
  const a = [...e].sort((u, f) => u.frame - f.frame);
  if (a.length <= 2 || n <= 0) return { keys: a, removed: 0 };
  const s = Ue(a, t), i = /* @__PURE__ */ new Set(), o = new Set(r);
  a.forEach((u, f) => {
    o.has(u.frame) && i.add(f);
  });
  const c = bn(s, n, i);
  for (const u of i) c.add(u);
  const _ = a.filter((u, f) => c.has(f));
  return { keys: _, removed: a.length - _.length };
}
function _r(e, t, { target: n = 2, keepFrames: r = [] } = {}) {
  let a = [...e].sort((c, _) => c.frame - _.frame);
  const s = Math.max(2, Math.round(n));
  if (a.length <= s) return { keys: a, removed: 0 };
  const i = new Set(r), o = a.length;
  for (; a.length > s; ) {
    const c = Ue(a, t);
    let _ = -1, u = 1 / 0;
    for (let f = 1; f < a.length - 1; f += 1) {
      if (i.has(a[f].frame)) continue;
      const m = Le(c[f], c[f - 1], c[f + 1]);
      m < u && (u = m, _ = f);
    }
    if (_ < 0) break;
    a = a.filter((f, m) => m !== _);
  }
  return { keys: a, removed: o - a.length };
}
function hr(e, t, { mergeWithin: n = 1, epsilon: r = 1e-3, keepFrames: a = [] } = {}) {
  const s = [...e].sort((m, E) => m.frame - E.frame), i = s.length, o = new Set(a), c = [];
  for (const m of s) {
    const E = c[c.length - 1];
    E && m.frame - E.frame <= Math.max(0, n) && !o.has(m.frame) || c.push(m);
  }
  if (c.length <= 2) return { keys: c, removed: i - c.length };
  const _ = Ue(c, t), u = /* @__PURE__ */ new Set();
  for (let m = 1; m < c.length - 1; m += 1) {
    if (o.has(c[m].frame)) continue;
    const E = u.has(m - 1) ? null : m - 1;
    if (E === null) continue;
    Le(_[m], _[E], _[m + 1]) <= r && u.add(m);
  }
  const f = c.filter((m, E) => !u.has(E));
  return { keys: f, removed: i - f.length };
}
function Tn(e, t, { minKeys: n = 0 } = {}) {
  const r = new Set(t), a = e.filter((s) => !r.has(s.frame));
  if (a.length < n) {
    const s = e.filter((i) => r.has(i.frame)).sort((i, o) => i.frame - o.frame);
    for (; a.length < n && s.length; ) a.push(s.shift());
    a.sort((i, o) => i.frame - o.frame);
  }
  return { keys: a, removed: e.length - a.length };
}
function Er(e, t, n, { lastFrame: r = 1 / 0 } = {}) {
  const a = [...t].sort((u, f) => u - f);
  if (!n || !a.length)
    return { keys: [...e], moved: 0, frames: a };
  const s = new Set(a), i = new Set(e.filter((u) => !s.has(u.frame)).map((u) => u.frame)), o = a.map((u) => u + n);
  return o.some((u) => u < 0 || u > r || i.has(u)) || new Set(o).size !== o.length ? { keys: [...e], moved: 0, frames: a } : { keys: e.map((u) => s.has(u.frame) ? { ...u, frame: u.frame + n } : u).sort((u, f) => u.frame - f.frame), moved: a.length, frames: o.sort((u, f) => u - f) };
}
function Ar(e, t, n) {
  const r = new Set(t);
  return e.map((a) => r.has(a.frame) ? { ...a, interpolation: n } : a);
}
function gr(e, t, n, r = []) {
  const a = new Set(t);
  return e.map((s) => {
    if (!a.has(s.frame)) return s;
    const i = { mode: n, channels: { ...s.tangents?.channels || {} } };
    for (const c of r)
      i.channels[c] = { ...i.channels[c] || {}, mode: n };
    const o = n !== "auto" && s.interpolation !== "bezier" ? "bezier" : s.interpolation;
    return { ...s, interpolation: o, tangents: i };
  });
}
function G(e, t, n) {
  return [0, 1, 2].map((r) => e[r] + (t[r] - e[r]) * n);
}
function wn(e, t, n, r, a) {
  const s = G(e, t, a), i = G(t, n, a), o = G(n, r, a), c = G(s, i, a), _ = G(i, o, a), u = G(c, _, a);
  return { left: [e, s, c, u], right: [u, _, o, r], point: u };
}
function yn(e, t, n, r) {
  const a = new Set(e.map((o) => o.frame)), s = Math.min(n - 1, Math.max(t + 1, r));
  if (!a.has(s)) return s;
  const i = n - t;
  for (let o = 1; o < i; o += 1)
    for (const c of [s - o, s + o])
      if (!(c <= t || c >= n) && !a.has(c))
        return c;
  return -1;
}
function In(e, { leftFrame: t, rightFrame: n, t: r = 0.5 } = {}) {
  const a = [...e].sort((b, g) => b.frame - g.frame), s = a.findIndex((b) => b.frame === t), i = s >= 0 ? s + 1 : -1;
  if (s < 0 || i < 0 || i >= a.length || a[i].frame !== n)
    return { ok: !1, reason: "segment_not_found" };
  if (n - t < 2)
    return { ok: !1, reason: "no_free_frame" };
  const o = Math.min(0.999, Math.max(1e-3, Number.isFinite(r) ? r : 0.5)), c = Math.round(t + o * (n - t)), _ = yn(a, t, n, c);
  if (_ < 0) return { ok: !1, reason: "no_free_frame" };
  const u = (_ - t) / (n - t), f = a[s], m = a[i], E = s > 0 ? a[s - 1] : null, y = i + 1 < a.length ? a[i + 1] : null, p = f.interpolation === "bezier" || m.interpolation === "bezier", S = de({ keyframes: a }, _), k = { frame: _, interpolation: p ? "bezier" : f.interpolation, camera: S };
  if (p) {
    const b = [...f.camera.position], g = Re(f, E, m).out, w = Re(m, f, y).in, C = [...m.camera.position], v = wn(b, g, w, C, u);
    k.camera = { ...fe(S), position: [...v.point] };
    const U = ue(f);
    (U === "free" || U === "aligned") && ae(f, "out", v.left[1]);
    const Be = ue(m);
    (Be === "free" || Be === "aligned") && ae(m, "in", v.right[2]), ae(k, "in", v.left[2]), ae(k, "out", v.right[1]);
  }
  return { ok: !0, keys: [...a, k].sort((b, g) => b.frame - g.frame), frame: _ };
}
function Nn(e, t) {
  const { keys: n, removed: r } = Tn(e, t, { minKeys: 1 });
  return { ok: r > 0, keys: n, removed: r };
}
function Oe(e, t) {
  const n = t || e.active_camera_id, r = (e.cameras || []).find((a) => a.id === n);
  if (!r) throw new d("UNKNOWN_CAMERA", `${n} does not exist`);
  return r;
}
function Se(e, t) {
  const n = (e.objects || []).find((r) => r.id === t);
  if (!n) throw new d("UNKNOWN_OBJECT", `${t} does not exist`);
  return n;
}
function se(e, t) {
  const n = $(e, t);
  if (n.asset_kind !== "character")
    throw new d("NOT_A_CHARACTER", `${t} is not a character`);
  return n;
}
function M(e, t) {
  const n = Oe(e, t);
  if (n.locked)
    throw new d("ENTITY_LOCKED", `${n.id} is locked`);
  return n;
}
function $(e, t) {
  const n = Se(e, t);
  if (n.locked)
    throw new d("ENTITY_LOCKED", `${n.id} is locked`);
  return n;
}
function pe(e) {
  return (!e.camera || typeof e.camera != "object") && (e.camera = {}), e.camera;
}
function ie(e, t) {
  return (e.keyframes || []).find((n) => n.frame === t) || null;
}
function q(e, t, n) {
  t.keyframes = n, t.id === e.active_camera_id && (e.keyframes = n);
}
const Z = l.viewport | l.previews | l.timeline | l.inspector;
function Ze(e, t, n) {
  const r = new Set((e.keyframes || []).map((s) => s.frame)), a = t.find((s) => !r.has(s));
  if (a !== void 0)
    throw new d("UNKNOWN_KEYFRAME", `${n}: camera has no key at frame ${a}`);
}
const Rn = {
  [h.ASSET_INSTANTIATE](e, t) {
    const n = new Set((e.objects || []).map((a) => a.id));
    let r;
    try {
      r = En(t.asset, { point: t.point, idSeed: t.id, existingIds: n });
    } catch (a) {
      throw new d("BAD_ASSET", `asset.instantiate could not compile: ${a.message}`);
    }
    return (e.objects ||= []).push(r), {
      dirtyMask: l.viewport | l.previews | l.outliner | l.inspector,
      outcome: { objectId: r.id, assetId: r.asset_id || null }
    };
  },
  [h.CAMERA_SET_ACTIVE](e, t) {
    return Oe(e, t.cameraId), e.active_camera_id = t.cameraId, { dirtyMask: l.viewport | l.previews | l.inspector | l.outliner | l.timeline };
  },
  [h.CAMERA_SET_LOCKED](e, t) {
    return Oe(e, t.cameraId).locked = t.value, { dirtyMask: l.outliner | l.inspector | l.viewport };
  },
  [h.CAMERA_CREATE](e, t) {
    const n = Pt(e, t);
    return { dirtyMask: l.outliner | l.inspector | l.viewport | l.previews | l.timeline, outcome: n };
  },
  [h.CAMERA_DUPLICATE](e, t) {
    const n = Ft(e, t);
    return { dirtyMask: l.outliner | l.inspector | l.viewport | l.previews | l.timeline, outcome: n };
  },
  [h.CAMERA_DELETE](e, t) {
    const n = $t(e, t);
    return { dirtyMask: l.outliner | l.inspector | l.viewport | l.previews | l.timeline, outcome: n };
  },
  [h.CAMERA_RENAME](e, t) {
    M(e, t.cameraId);
    const n = zt(e, t);
    return { dirtyMask: l.outliner | l.inspector, outcome: n };
  },
  [h.CAMERA_SET_PLAYBLAST](e, t) {
    const n = Kt(e, t);
    return { dirtyMask: l.outliner | l.inspector | l.status, outcome: n };
  },
  [h.CAMERA_TRANSFORM](e, t) {
    const n = M(e, t.cameraId), r = pe(n);
    if (t.position && (r.position = [...t.position]), t.target && (r.target = [...t.target]), Number.isInteger(t.frame)) {
      const a = ie(n, t.frame);
      if (!a) throw new d("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
      a.camera = { ...a.camera }, t.position && (a.camera.position = [...t.position]), t.target && (a.camera.target = [...t.target]);
    }
    return { dirtyMask: l.viewport | l.previews | l.inspector | l.timeline };
  },
  [h.CAMERA_LOOK_AT](e, t) {
    const n = M(e, t.cameraId);
    if (t.objectId !== void 0 && (t.objectId === null || t.objectId === "" ? (n.target_object_id = null, n.id === e.active_camera_id && (e.target_object_id = null)) : (Se(e, t.objectId), n.target_object_id = t.objectId, n.id === e.active_camera_id && (e.target_object_id = t.objectId))), t.point) {
      const r = pe(n);
      r.target = [...t.point];
      for (const a of n.keyframes || [])
        a.camera = { ...a.camera, target: [...t.point] };
    }
    return { dirtyMask: l.viewport | l.previews | l.inspector | l.timeline };
  },
  [h.OBJECT_CREATE](e, t) {
    const n = Jt(e, t);
    return { dirtyMask: l.viewport | l.previews | l.outliner | l.inspector, outcome: n };
  },
  [h.OBJECT_DUPLICATE](e, t) {
    const n = Ht(e, t);
    return { dirtyMask: l.viewport | l.previews | l.outliner | l.inspector, outcome: n };
  },
  [h.OBJECT_DELETE](e, t) {
    const n = Gt(e, t);
    return { dirtyMask: l.viewport | l.previews | l.outliner | l.inspector, outcome: n };
  },
  [h.OBJECT_RENAME](e, t) {
    $(e, t.objectId);
    const n = Vt(e, t);
    return { dirtyMask: l.outliner | l.inspector, outcome: n };
  },
  [h.OBJECT_SET_PARENT](e, t) {
    $(e, t.objectId);
    const n = Wt(e, t);
    return { dirtyMask: l.viewport | l.outliner | l.inspector, outcome: n };
  },
  [h.OBJECT_TRANSFORM](e, t) {
    const n = $(e, t.objectId);
    return t.position && (n.position = [...t.position]), t.rotation && (n.rotation = [...t.rotation]), t.scale && (n.size = [...t.scale]), { dirtyMask: l.viewport | l.previews | l.inspector };
  },
  [h.OBJECT_SET_ENABLED](e, t) {
    return $(e, t.objectId).enabled = t.value, { dirtyMask: l.viewport | l.previews | l.outliner | l.inspector };
  },
  [h.OBJECT_SET_LOCKED](e, t) {
    return Se(e, t.objectId).locked = t.value, { dirtyMask: l.outliner | l.inspector };
  },
  [h.OBJECT_SET_TAGS](e, t) {
    const n = $(e, t.objectId), r = yt(t.tags), a = r.length !== t.tags.length ? "some tags were dropped or normalised" : void 0;
    return r.length ? n.tags = r : delete n.tags, { dirtyMask: l.outliner | l.inspector | l.viewport, warning: a };
  },
  [h.OBJECT_SET_ANNOTATION](e, t) {
    const n = $(e, t.objectId), r = t.annotation === null ? null : wt(t.annotation);
    if (t.annotation && !r)
      throw new d("BAD_ANNOTATION", "annotation failed validation (text, hex colour, anchor)");
    return r ? n.annotation = r : delete n.annotation, { dirtyMask: l.viewport | l.outliner | l.inspector };
  },
  [h.CHARACTER_SET_POSE](e, t) {
    const n = se(e, t.objectId);
    if (n.character?.motion)
      throw new d("POSE_MOTION_EXCLUSIVE", "clear the motion clip before editing the pose");
    return n.character = {
      ...n.character || {},
      pose: t.pose === null ? ze(null) : ze(t.pose)
    }, { dirtyMask: l.viewport | l.previews | l.inspector };
  },
  [h.CHARACTER_SET_JOINT_ROTATION](e, t) {
    const n = se(e, t.objectId);
    if (n.character?.motion)
      throw new d("POSE_MOTION_EXCLUSIVE", "clear the motion clip before editing the pose");
    if (!bt(t.rotation))
      throw new d("BAD_QUATERNION", "rotation is not a usable unit quaternion");
    return n.character = {
      ...n.character || {},
      pose: Tt(n.character?.pose, t.joint, t.rotation)
    }, { dirtyMask: l.viewport | l.previews | l.inspector };
  },
  [h.CHARACTER_SET_MOTION](e, t) {
    const n = se(e, t.objectId), r = pt(t.motion);
    if (!r) throw new d("BAD_MOTION", "motion failed validation (clip_id, speed, range)");
    const a = n.character?.pose || {};
    return n.character = {
      ...n.character || {},
      pose: { preset_id: a.preset_id || "neutral", root_offset: a.root_offset || [0, 0, 0], joints: {} },
      motion: r
    }, { dirtyMask: l.viewport | l.previews | l.timeline | l.inspector };
  },
  [h.CHARACTER_CLEAR_MOTION](e, t) {
    const n = se(e, t.objectId);
    return n.character ? (n.character = { ...n.character, motion: null }, { dirtyMask: l.viewport | l.previews | l.timeline | l.inspector }) : { dirtyMask: 0 };
  },
  [h.KEYFRAME_UPSERT](e, t) {
    const n = M(e, t.cameraId);
    if (t.frame >= (e.duration_frames || 0))
      throw new d("FRAME_OUT_OF_RANGE", `frame ${t.frame} is past the timeline`);
    n.keyframes ||= [];
    let r = ie(n, t.frame);
    const a = !r;
    if (!r) {
      const i = ie(n, 0)?.camera || n.camera || {};
      r = { frame: t.frame, camera: JSON.parse(JSON.stringify(i)), interpolation: "ease" }, n.keyframes.push(r), n.keyframes.sort((o, c) => o.frame - c.frame);
    }
    t.camera && (r.camera = { ...r.camera, ...JSON.parse(JSON.stringify(t.camera)) }), t.interpolation && (r.interpolation = t.interpolation);
    const s = a && !t.camera ? `keyframe at frame ${t.frame} was created from the existing pose (no "camera" given) -- it will not move the camera unless another keyframe with a different position/target exists` : void 0;
    return { dirtyMask: l.viewport | l.previews | l.timeline | l.inspector, warning: s };
  },
  [h.KEYFRAME_REMOVE](e, t) {
    const n = M(e, t.cameraId), r = (n.keyframes || []).length;
    if (n.keyframes = (n.keyframes || []).filter((s) => s.frame !== t.frame), n.keyframes.length === r)
      throw new d("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
    const a = n.keyframes.length === 0 ? "camera has no keyframes left" : void 0;
    return { dirtyMask: l.viewport | l.previews | l.timeline | l.inspector, warning: a };
  },
  [h.KEYFRAME_SET_INTERPOLATION](e, t) {
    const n = M(e, t.cameraId), r = ie(n, t.frame);
    if (!r) throw new d("UNKNOWN_KEYFRAME", `camera has no key at frame ${t.frame}`);
    if (!le.includes(t.interpolation))
      throw new d("BAD_INTERPOLATION", `Unsupported interpolation: ${t.interpolation}`);
    return r.interpolation = t.interpolation, { dirtyMask: l.timeline | l.viewport | l.previews };
  },
  [h.TIMELINE_SET_RANGE](e, t) {
    const n = Math.max(0, (e.duration_frames || 1) - 1);
    if (t.start > n || t.end > n)
      throw new d("FRAME_OUT_OF_RANGE", `range must stay within 0..${n}`);
    return e.playback_range = [t.start, t.end], { dirtyMask: l.timeline | l.status };
  },
  [h.TIMELINE_SET_DURATION](e, t) {
    if (e.duration_frames = t.frames, Array.isArray(e.playback_range)) {
      const n = t.frames - 1;
      e.playback_range = [
        Math.min(e.playback_range[0], n),
        Math.min(e.playback_range[1], n)
      ];
    }
    return { dirtyMask: l.timeline | l.viewport | l.previews | l.status };
  },
  [h.CUT_UPSERT](e, t) {
    const n = Yt(e, t);
    return { dirtyMask: l.timeline | l.viewport | l.previews | l.status, outcome: n };
  },
  [h.CUT_REMOVE](e, t) {
    const n = Qt(e, t);
    return { dirtyMask: l.timeline | l.viewport | l.previews | l.status, outcome: n };
  },
  [h.CUT_SET_CAMERA](e, t) {
    const n = Xt(e, t);
    return { dirtyMask: l.timeline | l.viewport | l.previews | l.status, outcome: n };
  },
  // Semantic Director API path operations (plan section 22): the same pure
  // maths the manual UI's TransformControls wiring / toolbar actions use
  // (viewport/transform-controls-wiring.js, director/methods/scene.js),
  // reached atomically and with the exact same lock/existence checks. No
  // raw Three.js object ever crosses this boundary -- every input/output
  // here is plain JSON (frames, vectors, strings).
  [h.CAMERA_PATH_TRANSFORM_KEYS](e, t) {
    const n = M(e, t.cameraId);
    Ze(n, t.frames, "camera.path.transform_keys");
    const r = (n.keyframes || []).filter((i) => t.frames.includes(i.frame)), a = Array.isArray(t.transform.origin) ? t.transform.origin : Et(r), s = At(n.keyframes || [], t.frames, {
      mode: t.transform.mode,
      origin: a,
      delta: t.transform.delta,
      factors: t.transform.factors,
      rotationDeg: t.transform.rotationDeg,
      lookAtActive: gt(n, e.objects)
    });
    return q(e, n, s), { dirtyMask: Z };
  },
  [h.CAMERA_PATH_INSERT_KEY](e, t) {
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
    return q(e, n, r.keys), { dirtyMask: Z, outcome: { frame: r.frame } };
  },
  [h.CAMERA_PATH_DELETE_KEYS](e, t) {
    const n = M(e, t.cameraId);
    Ze(n, t.frames, "camera.path.delete_keys");
    const r = Nn(n.keyframes || [], t.frames);
    if (!r.ok)
      throw new d("CANNOT_DELETE", "camera.path.delete_keys: a camera track needs at least one key");
    return q(e, n, r.keys), { dirtyMask: Z, outcome: { removed: r.removed } };
  },
  [h.CAMERA_PATH_REDISTRIBUTE_TIMING](e, t) {
    const n = M(e, t.cameraId), r = [...n.keyframes || []].sort((o, c) => o.frame - c.frame), a = Number.isInteger(t.startFrame) ? t.startFrame : r[0]?.frame, s = Number.isInteger(t.endFrame) ? t.endFrame : r[r.length - 1]?.frame, i = ht(r, { startFrame: a, endFrame: s });
    if (!i.ok) {
      const o = { not_enough_keys: "NOT_ENOUGH_KEYS", invalid_range: "BAD_RANGE", insufficient_frame_slots: "INSUFFICIENT_FRAME_SLOTS" };
      throw new d(o[i.reason] || "BAD_RANGE", `camera.path.redistribute_timing: ${i.reason}`);
    }
    return q(e, n, i.keys), { dirtyMask: Z };
  },
  [h.CAMERA_PATH_APPLY_PRESET](e, t) {
    const n = M(e, t.cameraId), r = pe(n), a = en({
      type: t.presetType,
      camera: r,
      target: t.target,
      startFrame: t.startFrame,
      endFrame: t.endFrame,
      params: t.params || {}
    });
    if (!a.ok) {
      const s = { unknown_preset: "UNKNOWN_PRESET", invalid_camera: "BAD_VALUE", invalid_range: "BAD_RANGE", insufficient_frame_slots: "INSUFFICIENT_FRAME_SLOTS" };
      throw new d(s[a.reason] || "BAD_VALUE", `camera.path.apply_preset: ${a.reason}`);
    }
    return q(e, n, a.keyframes), { dirtyMask: Z };
  }
};
function On({ state: e, operation: t }) {
  const n = Rn[t.type];
  if (!n) throw new d("UNKNOWN_OPERATION", `Unknown operation type: ${t.type}`);
  return n(e, t) || { dirtyMask: 0 };
}
const Sn = 100;
function Ce(e, t) {
  if (e === t) return !0;
  if (typeof e != typeof t) return !1;
  if (Array.isArray(e) || Array.isArray(t))
    return !Array.isArray(e) || !Array.isArray(t) || e.length !== t.length ? !1 : e.every((n, r) => Ce(n, t[r]));
  if (e && t && typeof e == "object") {
    const n = /* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(t)]);
    for (const r of n) if (!Ce(e[r], t[r])) return !1;
    return !0;
  }
  return !1;
}
function F(e) {
  return new Map((e || []).map((t) => [t.id, t]));
}
function Cn(e, t) {
  const n = [];
  let r = !1;
  const a = (s, i, o, c) => {
    if (!r && !Ce(o, c)) {
      if (n.length >= Sn) {
        r = !0;
        return;
      }
      n.push({ entity: s, field: i, before: o ?? null, after: c ?? null });
    }
  };
  return jn(e, t, a), Mn(e, t, a), Un(e, t, a), Dn(e, t, a), Ln(e, t, a), Bn(e, t, a), { changes: n, truncated: r };
}
const kn = ["fov", "roll", "zoom", "near", "far", "camera_type"];
function jn(e, t, n) {
  const r = F(e?.cameras), a = F(t?.cameras);
  for (const s of r.keys())
    a.has(s) || n(s, "camera", "present", null);
  for (const [s, i] of a) {
    const o = r.get(s);
    if (!o) {
      n(s, "camera", null, "present");
      continue;
    }
    n(s, "name", o.name, i.name), n(s, "locked", !!o.locked, !!i.locked), n(s, "muted", !!o.muted, !!i.muted), n(s, "solo", !!o.solo, !!i.solo), n(s, "target_object_id", o.target_object_id ?? null, i.target_object_id ?? null), n(s, "position", o.camera?.position, i.camera?.position), n(s, "target", o.camera?.target, i.camera?.target);
    for (const c of kn)
      n(s, c, o.camera?.[c], i.camera?.[c]);
  }
}
const vn = ["position", "target", "fov", "roll", "zoom", "near", "far", "camera_type"];
function Mn(e, t, n) {
  const r = F(e?.cameras), a = F(t?.cameras);
  for (const [s, i] of a) {
    const o = r.get(s), c = new Map((o?.keyframes || []).map((f) => [f.frame, f])), _ = new Map((i.keyframes || []).map((f) => [f.frame, f])), u = `${s}@keyframes`;
    for (const [f, m] of c)
      _.has(f) || n(u, `frame_${f}`, m.interpolation ?? "present", null);
    for (const [f, m] of _) {
      const E = c.get(f);
      if (!E) {
        n(u, `frame_${f}`, null, m.interpolation ?? "present");
        continue;
      }
      for (const y of vn)
        n(u, `frame_${f}_${y}`, E.camera?.[y], m.camera?.[y]);
      n(u, `frame_${f}_interpolation`, E.interpolation, m.interpolation);
    }
  }
}
function Dn(e, t, n) {
  const r = F(e?.objects), a = F(t?.objects);
  for (const [s, i] of a) {
    const c = r.get(s)?.character?.pose?.joints || {}, _ = i.character?.pose?.joints || {}, u = /* @__PURE__ */ new Set([...Object.keys(c), ...Object.keys(_)]);
    for (const f of u)
      n(`${s}#${f}`, "joint_rotation", c[f] ?? null, _[f] ?? null);
  }
}
function Un(e, t, n) {
  const r = F(e?.objects), a = F(t?.objects);
  for (const [s] of r)
    a.has(s) || n(s, "object", "present", null);
  for (const [s, i] of a) {
    const o = r.get(s);
    if (!o) {
      n(s, "object", null, "present");
      continue;
    }
    n(s, "position", o.position, i.position), n(s, "rotation", o.rotation, i.rotation), n(s, "size", o.size, i.size), n(s, "name", o.name, i.name), n(s, "enabled", o.enabled !== !1, i.enabled !== !1), n(s, "locked", !!o.locked, !!i.locked), n(s, "tags", o.tags || [], i.tags || []), n(s, "annotation", o.annotation ?? null, i.annotation ?? null);
    const c = o.character?.pose?.preset_id ?? null, _ = i.character?.pose?.preset_id ?? null;
    n(s, "pose_preset", c, _);
    const u = o.character?.motion?.clip_id ?? null, f = i.character?.motion?.clip_id ?? null;
    n(s, "motion_clip_id", u, f);
  }
}
function Ln(e, t, n) {
  n("timeline", "duration_frames", e?.duration_frames, t?.duration_frames), n("timeline", "playback_range", e?.playback_range ?? null, t?.playback_range ?? null);
}
function Bn(e, t, n) {
  const r = new Map((e?.sequence?.cuts || []).map((s) => [s.start, s])), a = new Map((t?.sequence?.cuts || []).map((s) => [s.start, s]));
  for (const [s, i] of r)
    a.has(s) || n(`cut_${s}`, "cut", i.camera_id, null);
  for (const [s, i] of a) {
    const o = r.get(s);
    o ? n(`cut_${s}`, "cut_camera_id", o.camera_id, i.camera_id) : n(`cut_${s}`, "cut", null, i.camera_id);
  }
}
function Pn(e) {
  return typeof structuredClone == "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e));
}
function ke(e) {
  return Number.isInteger(e.directorRevision) ? Math.max(0, e.directorRevision) : 0;
}
function be(e, t, n) {
  return {
    ok: !1,
    version: P,
    revision: ke(e),
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
function Fn(e) {
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
  const r = n.some((i) => i.resourceRefresh === !0), a = t.operations.filter((i) => i.type === h.OBJECT_DELETE).map((i) => i.objectId);
  for (const i of a)
    e.removeObjectResources?.(i);
  const s = t.operations.some((i) => i.type === h.ASSET_INSTANTIATE);
  (r || s) && await e.restoreAssets?.();
}
function Kn(e, t, n) {
  if (typeof e.requestUiUpdate == "function") {
    e.requestUiUpdate(t, n);
    return;
  }
  e.camera = e.sampleCamera?.(e.state, e.frame) ?? e.camera, e.refreshObjects?.(), e.refreshKeys?.(), e.refreshInspector?.(), e.render?.();
}
function Jn(e, t) {
  let n;
  try {
    n = ln(e, t);
  } catch (f) {
    if (f instanceof d) return be(e, t?.id, f);
    throw f;
  }
  const r = ke(e);
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
  const a = Pn(e.state);
  let s = 0;
  const i = [], o = [];
  for (let f = 0; f < n.operations.length; f += 1)
    try {
      const m = On({ ui: e, state: a, operation: n.operations[f] });
      s |= m?.dirtyMask || 0, m?.warning && i.push(m.warning), m?.outcome && o.push({ index: f, ...m.outcome });
    } catch (m) {
      if (m instanceof d)
        return (m.operationIndex === null || m.operationIndex === void 0) && (m.operationIndex = f), be(e, n.id, m);
      throw m;
    }
  if (n.validateOnly) {
    const { changes: f, truncated: m } = Cn(e.state, a);
    return {
      ok: !0,
      version: P,
      revision: r,
      id: n.id,
      applied: n.operations.length,
      warnings: i,
      outcomes: o,
      dirtyMask: s,
      validateOnly: !0,
      changes: f,
      ...m ? { truncated: !0 } : {}
    };
  }
  e.checkpoint?.(n.description), e.state = ce(a);
  const c = Fn(e);
  nn(e, n.id), e.serialize?.(), $n(e, c), Kn(e, s, `director-api:${n.id}`);
  const _ = {
    ok: !0,
    version: P,
    baseRevision: r,
    revision: ke(e),
    id: n.id,
    applied: n.operations.length,
    warnings: i,
    outcomes: o,
    dirtyMask: s
  }, u = zn(e, n, o).catch((f) => {
    console.warn("OmniCam: resource reconciliation failed", f), i.push({
      code: "VIEWPORT_RESOURCE_RECONCILE_FAILED",
      message: "The scene change was committed, but one or more viewport resources could not be refreshed."
    }), e.setStatus?.("The scene change was committed, but one or more viewport resources could not be refreshed.");
  });
  return Object.defineProperty(_, "_reconciliation", { value: u, enumerable: !1 }), _;
}
function Hn(e) {
  return {
    query: (t) => Lt(e, t),
    execute: (t) => Jn(e, t)
  };
}
function Gn(e) {
  return e.directorApi = Hn(e), e.directorApi;
}
const xe = "omnicam-agent/1", et = "majoor.omnicam.agent.request", Vn = 1, x = Object.freeze({
  register: "/majoor/omnicam/agent/v1/session/register",
  heartbeat: "/majoor/omnicam/agent/v1/session/heartbeat",
  reply: "/majoor/omnicam/agent/v1/reply",
  close: "/majoor/omnicam/agent/v1/session/close"
}), Wn = 1e4, Yn = 5e3, lt = "asset.instantiate_by_id", dt = "asset.catalog_search", tt = Object.freeze([
  ...rt.filter((e) => e !== h.ASSET_INSTANTIATE),
  lt
]);
function je(e) {
  return e?.kind === "character" && e?.source === "default";
}
async function Qn(e, t) {
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
async function Xn(e, t) {
  const n = e.assetBrowser?.store, r = [];
  for (const a of t || []) {
    if (a?.type !== lt) {
      r.push(a);
      continue;
    }
    if (!n)
      return { ok: !1, code: "ASSET_CATALOG_UNAVAILABLE", message: "The asset catalogue is not available in this Director session" };
    const s = await Qn(n, a.assetId);
    if (!s)
      return { ok: !1, code: "UNKNOWN_ASSET", message: `Unknown catalogue asset: ${a.assetId}` };
    r.push({ type: "asset.instantiate", asset: s, id: a.id, point: a.point });
  }
  return { ok: !0, operations: r };
}
async function qn(e, t) {
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
    version: P,
    type: dt,
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
  let a = null;
  try {
    a = await r.json();
  } catch {
    a = null;
  }
  if (r.ok === !1) {
    const s = a?.error?.code || `HTTP_${r.status || 0}`, i = a?.error?.message || `OmniCam Agent request failed (${r.status})`, o = new Error(i);
    throw o.code = s, o.status = r.status || 0, o;
  }
  return a ?? {};
}
function te(e, t, n) {
  return {
    ok: !1,
    version: P,
    revision: Number(e.directorRevision || 0),
    error: { code: t, message: n }
  };
}
function Zn(e, t, n) {
  let r = !1, a = null, s = null, i = null, o = null, c = null, _ = 0;
  function u() {
    return n.clientId || n.initialClientId || null;
  }
  function f() {
    a = null, s = null, i = null, o && (clearInterval(o), o = null);
  }
  async function m() {
    if (r) return;
    _ += 1;
    const b = _, g = u();
    if (!g) {
      E();
      return;
    }
    try {
      const w = await ee(n, x.register, {
        protocol: xe,
        client_id: g,
        node_id: String(t.id),
        label: `OmniCam Director ${t.id}`,
        director_api: P,
        revision: Number(e.directorRevision || 0),
        operations: [...tt],
        queries: [...vt]
      });
      if (r || b !== _) return;
      a = w.session_id, s = w.session_token, i = g, y();
    } catch {
      if (r || b !== _) return;
      E();
    }
  }
  function E() {
    r || (clearTimeout(c), c = setTimeout(() => {
      m();
    }, Yn));
  }
  function y() {
    clearInterval(o), o = setInterval(() => {
      p();
    }, Wn);
  }
  async function p() {
    if (!(r || !a))
      try {
        await ee(n, x.heartbeat, {
          session_id: a,
          session_token: s,
          revision: Number(e.directorRevision || 0)
        });
      } catch (b) {
        if (r) return;
        (b?.code === "UNKNOWN_SESSION" || b?.code === "BAD_SESSION_TOKEN") && (f(), m());
      }
  }
  async function S(b) {
    const g = b?.detail;
    if (r || !g || g.protocol !== xe || Number(g.schema_version) !== Vn || g.session_id !== a || String(g.node_id) !== String(t.id)) return;
    let w;
    try {
      if (g.kind === "query")
        w = g.payload?.type === dt ? await qn(e, g.payload) : e.directorApi.query(g.payload);
      else if (g.kind === "transaction") {
        const C = g.payload, v = (C?.operations || []).find(
          (U) => !tt.includes(U?.type)
        );
        if (!Number.isInteger(C?.baseRevision) || C.baseRevision < 0)
          w = te(
            e,
            "BASE_REVISION_REQUIRED",
            "External Agent transactions require baseRevision"
          );
        else if (v)
          w = te(
            e,
            "OPERATION_NOT_ADVERTISED",
            `External Agent transactions cannot use operation: ${v?.type}`
          );
        else {
          const U = await Xn(e, C.operations);
          U.ok ? (w = e.directorApi.execute({ ...C, operations: U.operations }), await w?._reconciliation) : w = te(e, U.code, U.message);
        }
      } else
        w = te(e, "UNKNOWN_AGENT_REQUEST", `Unsupported Agent request kind: ${g.kind}`);
    } catch (C) {
      w = te(e, C?.code || "INTERNAL", C?.message || "OmniCam Agent request failed");
    }
    try {
      await ee(n, x.reply, {
        session_id: a,
        session_token: s,
        request_id: g.request_id,
        result: w
      });
    } catch {
    }
  }
  async function k(b, g) {
    if (!(!b || !g))
      try {
        await ee(n, x.close, {
          session_id: b,
          session_token: g
        });
      } catch {
      }
  }
  function X() {
    if (r) return;
    const b = u();
    if (b && i && b !== i) {
      const g = a, w = s;
      f(), k(g, w).finally(() => m());
    }
  }
  return n.addEventListener?.(et, S), n.addEventListener?.("status", X), m(), {
    get sessionId() {
      return a;
    },
    dispose() {
      if (r) return;
      r = !0, clearInterval(o), clearTimeout(c), n.removeEventListener?.(et, S), n.removeEventListener?.("status", X);
      const b = a, g = s;
      a = null, s = null, b && g && ee(n, x.close, {
        session_id: b,
        session_token: g
      }).catch(() => {
      });
    }
  };
}
function xn(e) {
  for (const t of ["state_json", "recording_path", "card_asset"]) {
    const n = e.widgets?.find((r) => r.name === t);
    n && (n.computeSize = () => [0, -4], n.draw = () => {
    }, n.hidden = !0, n.options = { ...n.options || {}, hideInVueNodes: !0 });
  }
}
function oe(e) {
  const t = e.getSnapshot(), n = [];
  t.fps && n.push(`${t.fps} fps`), t.durationSeconds && n.push(`${t.durationSeconds.toFixed(1)} s`), t.width && t.height && n.push(`${t.width}x${t.height}`), e.shell?.setTitle(t.sceneName || W("OmniCam Director")), e.shell?.setMeta(n.join("  |  ")), e.shell?.setStatus(
    `${t.cameraCount} ${W("cameras")}  |  ${t.objectCount} ${W("objects")}`
  );
}
function nt(e) {
  return `director:${e.id}`;
}
async function er(e, t) {
  return Te.open({
    key: nt(e.node),
    opener: t,
    createSession: async () => {
      const n = ++e.workbenchGeneration, { openDirectorWorkbench: r, closeDirectorWorkbench: a } = await import("./chunk-CVmElXwP.js").then((c) => c.e);
      if (e.disposed || n !== e.workbenchGeneration) return null;
      const s = r(e);
      e.pendingUpstreamResync && (e.pendingUpstreamResync = !1, s.syncUpstreamInputs?.());
      const i = nt(e.node), o = new Ot({
        kind: "director",
        nodeId: e.node.id,
        title: e.getSnapshot().sceneName || W("OmniCam Director"),
        // No non-interruptible capture guard in this pass: closing always
        // succeeds. A future pass can refuse here while a realtime capture is
        // in its finalization window (plan section 15).
        onRequestClose: (c) => Te.close(i, c),
        onResize: () => s.scheduleResizeAndRender?.()
      });
      return o.mount(s.root), {
        key: i,
        nodeId: e.node.id,
        host: o,
        close: async () => (s.serialize?.(), a(s), o.dispose(), !0),
        dispose: () => {
          a(s), o.dispose();
        }
      };
    }
  });
}
function tr(e) {
  if (e.__majoorOmniCamDirectorRuntime) return e.__majoorOmniCamDirectorRuntime;
  const t = new kt(e, { app: ft, api: Pe });
  Gn(t);
  try {
    t.agentBridge = Zn(t, e, Pe);
  } catch (m) {
    console.warn("[OmniCam] Agent bridge unavailable", m);
  }
  xn(e);
  const n = Nt({
    kind: "director",
    title: W("OmniCam Director"),
    buttonLabel: W("OPEN DIRECTOR"),
    onOpen: (m) => {
      er(t, m.currentTarget);
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
  }, a = e.onConfigure;
  e.onConfigure = function(...m) {
    a?.apply(this, m), r();
  };
  const s = e.onAfterGraphConfigured;
  e.onAfterGraphConfigured = function(...m) {
    s?.apply(this, m), r();
  };
  const i = () => {
    clearTimeout(t.connectionTimer), t.connectionTimer = setTimeout(() => {
      t.disposed || (t.workbench ? t.workbench.syncUpstreamInputs() : t.pendingUpstreamResync = !0, e.setDirtyCanvas?.(!0, !0));
    }, 60);
  }, o = e.onConnectionsChange;
  e.onConnectionsChange = function(...m) {
    o?.apply(this, m), i();
  };
  const c = Rt(e, i), _ = e.onResize;
  e.onResize = function(...m) {
    _?.apply(this, m), t.workbench?.scheduleResizeAndRender?.();
  };
  const u = e.onExecuted;
  e.onExecuted = function(m) {
    u?.apply(this, arguments), t.workbench && (t.workbench.loadExecutionPreview(m), t.workbench.syncUpstreamInputs());
  };
  const f = e.onRemoved;
  return e.onRemoved = function(...m) {
    Te.disposeForNode(e.id), c(), cancelAnimationFrame(t.restoreFrame), clearTimeout(t.connectionTimer), t.agentBridge?.dispose?.(), n.dispose(), t.dispose(), f?.apply(this, m);
  }, t;
}
const pr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attachDirectorShell: tr
}, Symbol.toStringTag, { value: "Module" }));
export {
  or as C,
  st as S,
  l as U,
  _n as a,
  we as b,
  en as c,
  mr as d,
  gr as e,
  Ar as f,
  Er as g,
  lr as h,
  In as i,
  Tn as j,
  hr as k,
  ur as l,
  cr as m,
  Ct as n,
  Re as o,
  dr as p,
  pr as q,
  _r as r,
  ue as s,
  fr as w
};
