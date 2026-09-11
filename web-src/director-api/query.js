// Read side of the semantic Director API. Every result is a bounded, cloned
// JSON snapshot: no DOM nodes, no three.js instances, no media elements, no
// blob URLs, no API clients, no history internals.

import { normalizeSolveHealth } from "../scene/solve-health.js";
import { DIRECTOR_QUERIES } from "./constants.js";
import { DirectorApiError } from "./errors.js";
import { cameraSummary, objectSummary, queryWindow } from "./query-helpers.js";

function clone(value) {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function revision(ui) {
  return Number.isInteger(ui.directorRevision)
    ? Math.max(0, ui.directorRevision)
    : 0;
}

function result(ui, payload) {
  return {
    ...payload,
    revision: revision(ui),
  };
}

export function executeDirectorQuery(ui, request) {
  const state = ui.state || {};
  switch (request?.type) {
    case DIRECTOR_QUERIES.SCENE_GET:
      return result(ui, {
        version: 1,
        type: request.type,
        scene: clone({
          duration_frames: state.duration_frames,
          fps: state.fps,
          width: state.width,
          height: state.height,
          cameras: state.cameras || [],
          active_camera_id: state.active_camera_id,
          objects: state.objects || [],
          cuts: state.sequence?.cuts || state.cuts || [],
          motion_layers: state.motion_layers || [],
          metadata: state.metadata || {},
        }),
      });

    case DIRECTOR_QUERIES.SCENE_SUMMARY: {
      const objects = state.objects || [];
      const cuts = state.sequence?.cuts || state.cuts || [];
      return result(ui, {
        version: 1,
        type: request.type,
        summary: {
          duration_frames: state.duration_frames,
          fps: state.fps,
          width: state.width,
          height: state.height,
          camera_count: (state.cameras || []).length,
          object_count: objects.length,
          character_count: objects.filter((item) => item.asset_kind === "character").length,
          shot_count: cuts.length,
          motion_layer_count: (state.motion_layers || []).length,
          active_camera_id: state.active_camera_id || null,
          playblast_camera_id: state.playblast_camera_id || null,
        },
      });
    }

    case DIRECTOR_QUERIES.CAMERA_GET: {
      const id = request.cameraId || state.active_camera_id;
      const camera = (state.cameras || []).find((item) => item.id === id);
      if (!camera) throw new DirectorApiError("UNKNOWN_CAMERA", `Unknown camera: ${id}`);
      return result(ui, { version: 1, type: request.type, camera: clone(camera) });
    }

    case DIRECTOR_QUERIES.CAMERA_LIST: {
      const cameras = state.cameras || [];
      const { offset, limit, end } = queryWindow(request, cameras.length);
      return result(ui, {
        version: 1,
        type: request.type,
        items: cameras.slice(offset, end).map(cameraSummary),
        total: cameras.length,
        offset,
        limit,
      });
    }

    case DIRECTOR_QUERIES.TIMELINE_GET:
      return result(ui, {
        version: 1,
        type: request.type,
        timeline: clone({
          frame: ui.frame ?? 0,
          duration_frames: state.duration_frames,
          fps: state.fps,
          playback_range: Array.isArray(state.playback_range) ? state.playback_range : null,
        }),
      });

    case DIRECTOR_QUERIES.SELECTION_GET:
      return result(ui, {
        version: 1,
        type: request.type,
        selection: {
          entity: ui.selectedEntity ?? null,
          objectId: ui.selectedObjectId ?? null,
          objectIds: [...(ui.selectedObjectIds || [])],
          keyFrame: ui.selectedKeyFrame ?? null,
        },
      });

    case DIRECTOR_QUERIES.HEALTH_GET:
      return result(ui, {
        version: 1,
        type: request.type,
        frames: normalizeSolveHealth(state.metadata, state.duration_frames),
      });

    case DIRECTOR_QUERIES.ASSET_LIST: {
      // Every catalog-linked object currently in the scene. Pure state -- the
      // *catalog* itself is fetched over HTTP, never from here (design spec
      // section 28).
      const kindFilter = request.kind ? String(request.kind) : null;
      const items = (state.objects || [])
        .filter((object) => object.asset_id && (!kindFilter || object.asset_kind === kindFilter))
        .map((object) => ({
          objectId: object.id,
          name: object.name || object.id,
          asset_id: object.asset_id,
          asset_kind: object.asset_kind || null,
          tags: Array.isArray(object.tags) ? [...object.tags] : [],
          position: Array.isArray(object.position) ? [...object.position] : [0, 0, 0],
          is_character: object.asset_kind === "character",
          has_motion: Boolean(object.character?.motion),
        }));
      return result(ui, { version: 1, type: request.type, items: clone(items), total: items.length });
    }

    case DIRECTOR_QUERIES.ASSET_GET: {
      const object = (state.objects || []).find((item) => item.id === request.objectId);
      if (!object) throw new DirectorApiError("UNKNOWN_OBJECT", `Unknown object: ${request.objectId}`);
      return result(ui, {
        version: 1,
        type: request.type,
        asset: clone({
          objectId: object.id,
          name: object.name || object.id,
          type: object.type,
          asset: object.asset || null,
          asset_id: object.asset_id || null,
          asset_kind: object.asset_kind || null,
          tags: Array.isArray(object.tags) ? object.tags : [],
          annotation: object.annotation || null,
          character: object.character || null,
          position: object.position || [0, 0, 0],
          rotation: object.rotation || [0, 0, 0],
          size: object.size || [1, 1, 1],
        }),
      });
    }

    case DIRECTOR_QUERIES.CHARACTER_GET_RIG: {
      const object = (state.objects || []).find((item) => item.id === request.objectId);
      if (!object) throw new DirectorApiError("UNKNOWN_OBJECT", `Unknown object: ${request.objectId}`);
      const character = object.character || null;
      return result(ui, {
        version: 1,
        type: request.type,
        rig: clone({
          objectId: object.id,
          asset_id: object.asset_id || null,
          asset_kind: object.asset_kind || null,
          is_character: object.asset_kind === "character",
          rig_profile: character?.rig_profile || null,
          pose_preset: character?.pose?.preset_id || null,
          has_motion: Boolean(character?.motion),
        }),
      });
    }

    case DIRECTOR_QUERIES.CHARACTER_GET_POSE: {
      const object = (state.objects || []).find((item) => item.id === request.objectId);
      if (!object) throw new DirectorApiError("UNKNOWN_OBJECT", `Unknown object: ${request.objectId}`);
      const pose = object.character?.pose || {};
      return result(ui, {
        version: 1,
        type: request.type,
        pose: clone({
          objectId: object.id,
          preset_id: pose.preset_id || "neutral",
          root_offset: Array.isArray(pose.root_offset) ? pose.root_offset : [0, 0, 0],
          joints: pose.joints || {},
          has_motion: Boolean(object.character?.motion),
        }),
      });
    }

    case DIRECTOR_QUERIES.OBJECT_LIST: {
      const objects = state.objects || [];
      const { offset, limit, end } = queryWindow(request, objects.length);
      return result(ui, {
        version: 1,
        type: request.type,
        items: objects.slice(offset, end).map(objectSummary),
        total: objects.length,
        offset,
        limit,
      });
    }

    case DIRECTOR_QUERIES.OBJECT_GET: {
      const object = (state.objects || []).find((item) => item.id === request.objectId);
      if (!object) throw new DirectorApiError("UNKNOWN_OBJECT", `Unknown object: ${request.objectId}`);
      return result(ui, {
        version: 1,
        type: request.type,
        object: clone({
          id: object.id,
          name: object.name || object.id,
          type: object.type,
          asset: object.asset || null,
          asset_id: object.asset_id || null,
          asset_kind: object.asset_kind || null,
          tags: Array.isArray(object.tags) ? object.tags : [],
          enabled: object.enabled !== false,
          locked: Boolean(object.locked),
          parent_id: object.parent_id || null,
          annotation: object.annotation || null,
          character: object.character || null,
          position: object.position || [0, 0, 0],
          rotation: object.rotation || [0, 0, 0],
          size: object.size || [1, 1, 1],
        }),
      });
    }

    case DIRECTOR_QUERIES.OBJECT_SEARCH: {
      const text = String(request.text || "").trim().toLowerCase();
      const tags = Array.isArray(request.tags) ? request.tags.map((tag) => String(tag).toLowerCase()) : [];
      const kindFilter = request.asset_kind !== undefined ? request.asset_kind : null;
      const typeFilter = request.type_ !== undefined ? request.type_ : (request.objectType !== undefined ? request.objectType : null);
      const enabledFilter = typeof request.enabled === "boolean" ? request.enabled : null;

      const matches = (object) => {
        if (text) {
          const haystacks = [object.id, object.name || "", ...(Array.isArray(object.tags) ? object.tags : [])]
            .map((value) => String(value).toLowerCase());
          if (!haystacks.some((value) => value.includes(text))) return false;
        }
        if (tags.length) {
          const objectTags = (Array.isArray(object.tags) ? object.tags : []).map((tag) => String(tag).toLowerCase());
          if (!tags.every((tag) => objectTags.includes(tag))) return false;
        }
        if (kindFilter !== null && object.asset_kind !== kindFilter) return false;
        if (typeFilter !== null && object.type !== typeFilter) return false;
        if (enabledFilter !== null && (object.enabled !== false) !== enabledFilter) return false;
        return true;
      };

      const filtered = (state.objects || []).filter(matches);
      const { offset, limit, end } = queryWindow(request, filtered.length);
      return result(ui, {
        version: 1,
        type: request.type,
        items: filtered.slice(offset, end).map(objectSummary),
        total: filtered.length,
        offset,
        limit,
      });
    }

    case DIRECTOR_QUERIES.CHARACTER_LIST: {
      const characters = (state.objects || []).filter((item) => item.asset_kind === "character");
      const { offset, limit, end } = queryWindow(request, characters.length);
      return result(ui, {
        version: 1,
        type: request.type,
        items: characters.slice(offset, end).map((object) => ({
          ...objectSummary(object),
          has_motion: Boolean(object.character?.motion),
          pose_preset: object.character?.pose?.preset_id || null,
        })),
        total: characters.length,
        offset,
        limit,
      });
    }

    case DIRECTOR_QUERIES.SHOT_LIST: {
      const cuts = state.sequence?.cuts || state.cuts || [];
      const lastFrame = Math.max(0, (state.duration_frames || 1) - 1);
      const shots = cuts.map((cut, index) => ({
        index,
        start: cut.start,
        end: index + 1 < cuts.length ? cuts[index + 1].start - 1 : lastFrame,
        camera_id: cut.camera_id,
      }));
      const { offset, limit, end } = queryWindow(request, shots.length);
      return result(ui, {
        version: 1,
        type: request.type,
        items: shots.slice(offset, end),
        total: shots.length,
        offset,
        limit,
      });
    }

    case DIRECTOR_QUERIES.KEYFRAME_LIST: {
      const id = request.cameraId || state.active_camera_id;
      const camera = (state.cameras || []).find((item) => item.id === id);
      if (!camera) throw new DirectorApiError("UNKNOWN_CAMERA", `Unknown camera: ${id}`);
      const keyframes = camera.keyframes || [];
      const { offset, limit, end } = queryWindow(request, keyframes.length);
      return result(ui, {
        version: 1,
        type: request.type,
        cameraId: camera.id,
        items: keyframes.slice(offset, end).map((key) => ({
          frame: key.frame,
          interpolation: key.interpolation,
          position: Array.isArray(key.camera?.position) ? [...key.camera.position] : [0, 0, 0],
        })),
        total: keyframes.length,
        offset,
        limit,
      });
    }

    default:
      throw new DirectorApiError("UNKNOWN_QUERY", `Unsupported query: ${request?.type}`);
  }
}
