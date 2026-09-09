// Read side of the semantic Director API. Every result is a bounded, cloned
// JSON snapshot: no DOM nodes, no three.js instances, no media elements, no
// blob URLs, no API clients, no history internals.

import { normalizeSolveHealth } from "../scene/solve-health.js";
import { DIRECTOR_QUERIES } from "./constants.js";
import { DirectorApiError } from "./errors.js";

function clone(value) {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

export function executeDirectorQuery(ui, request) {
  const state = ui.state || {};
  switch (request?.type) {
    case DIRECTOR_QUERIES.SCENE_GET:
      return {
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
      };

    case DIRECTOR_QUERIES.CAMERA_GET: {
      const id = request.cameraId || state.active_camera_id;
      const camera = (state.cameras || []).find((item) => item.id === id);
      if (!camera) throw new DirectorApiError("UNKNOWN_CAMERA", `Unknown camera: ${id}`);
      return { version: 1, type: request.type, camera: clone(camera) };
    }

    case DIRECTOR_QUERIES.TIMELINE_GET:
      return {
        version: 1,
        type: request.type,
        timeline: clone({
          frame: ui.frame ?? 0,
          duration_frames: state.duration_frames,
          fps: state.fps,
          playback_range: Array.isArray(state.playback_range) ? state.playback_range : null,
        }),
      };

    case DIRECTOR_QUERIES.SELECTION_GET:
      return {
        version: 1,
        type: request.type,
        selection: {
          entity: ui.selectedEntity ?? null,
          objectId: ui.selectedObjectId ?? null,
          objectIds: [...(ui.selectedObjectIds || [])],
          keyFrame: ui.selectedKeyFrame ?? null,
        },
      };

    case DIRECTOR_QUERIES.HEALTH_GET:
      return {
        version: 1,
        type: request.type,
        frames: normalizeSolveHealth(state.metadata, state.duration_frames),
      };

    default:
      throw new DirectorApiError("UNKNOWN_QUERY", `Unsupported query: ${request?.type}`);
  }
}
