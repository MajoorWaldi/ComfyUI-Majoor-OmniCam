// The scene the read-only track viewer draws.
//
// It holds two trajectories at once -- the immutable raw solve and the derived
// refined one -- because the comparison is the point. Raw is neutral grey,
// refined is OmniCam violet, and COMPARE draws both plus the displacement
// between them so a smoothing setting can be judged rather than guessed at.
//
// There are no handles, no gizmos and no mutation methods. Editing a solved
// camera is the Director's job.

import { sampleCamera } from "../omnicam-core.js";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Scene,
  SphereGeometry,
} from "../three-runtime.js";
import { frustumFrames, frustumLines } from "./track-frustums.js";
import { buildTrackGrid, disposeObject, refreshTrackGrid } from "./track-grid.js";

export const RAW_COLOR = 0x8a8a9c;
export const REFINED_COLOR = 0x8b7bd8;
export const START_COLOR = 0x46a758;
export const END_COLOR = 0xe5484d;

//: Display decimation only. The canonical track is never touched.
export const MAX_PATH_POINTS = 2000;

export function trackFrames(track) {
  return (track?.keyframes || []).map((key) => Number(key.frame) || 0).sort((a, b) => a - b);
}

/** Sample a canonical track densely enough to look smooth, and no denser. */
export function samplePath(track, maxPoints = MAX_PATH_POINTS) {
  if (!track?.keyframes?.length) return [];
  const duration = Math.max(1, Number(track.duration_frames) || 1);
  const count = Math.max(2, Math.min(maxPoints, duration));
  const points = [];
  for (let index = 0; index < count; index += 1) {
    const frame = (index / (count - 1)) * (duration - 1);
    const camera = sampleCamera(track, frame);
    points.push(camera.position.map(Number));
  }
  return points;
}

export function pathBounds(points) {
  if (!points?.length) return { min: [0, 0, 0], max: [0, 0, 0], centre: [0, 0, 0], extent: 1 };
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const point of points) {
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], point[axis]);
      max[axis] = Math.max(max[axis], point[axis]);
    }
  }
  const centre = min.map((value, axis) => (value + max[axis]) / 2);
  const extent = Math.max(1e-3, Math.hypot(max[0] - min[0], max[1] - min[1], max[2] - min[2]));
  return { min, max, centre, extent };
}

function lineFromPoints(points, color, { opacity = 1 } = {}) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(points.flat(), 3));
  return new Line(geometry, new LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
}

function marker(color, radius) {
  return new Mesh(new SphereGeometry(radius, 12, 8), new MeshBasicMaterial({ color }));
}

export class TrackScene {
  constructor() {
    this.scene = new Scene();
    this.mode = "refined";
    this.frame = 0;
    this.tracks = { raw: null, refined: null };
    this.extent = 10;

    this.gridGroup = buildTrackGrid(this.extent);
    this.pathGroup = new Group();
    this.frustumGroup = new Group();
    this.markerGroup = new Group();
    this.scene.add(this.gridGroup, this.pathGroup, this.frustumGroup, this.markerGroup);

    this.currentFrustum = null;
    this.currentMarker = marker(REFINED_COLOR, 0.02);
    this.markerGroup.add(this.currentMarker);
  }

  setRawTrack(track) {
    this.tracks.raw = track || null;
    this.rebuild();
  }

  setRefinedTrack(track) {
    this.tracks.refined = track || null;
    this.rebuild();
  }

  setMode(mode) {
    this.mode = ["raw", "refined", "compare"].includes(mode) ? mode : "refined";
    this.rebuild();
  }

  activeTrack() {
    if (this.mode === "raw") return this.tracks.raw;
    return this.tracks.refined || this.tracks.raw;
  }

  rebuild() {
    this._clear(this.pathGroup);
    this._clear(this.frustumGroup);

    const rawPoints = this.mode !== "refined" ? samplePath(this.tracks.raw) : [];
    const refinedPoints = this.mode !== "raw" ? samplePath(this.tracks.refined) : [];
    if (rawPoints.length > 1) {
      this.pathGroup.add(lineFromPoints(rawPoints, RAW_COLOR, { opacity: this.mode === "compare" ? 0.75 : 1 }));
    }
    if (refinedPoints.length > 1) this.pathGroup.add(lineFromPoints(refinedPoints, REFINED_COLOR));
    if (this.mode === "compare" && rawPoints.length > 1 && refinedPoints.length > 1) {
      this.pathGroup.add(this._displacement(rawPoints, refinedPoints));
    }

    const points = refinedPoints.length ? refinedPoints : rawPoints;
    this.extent = pathBounds(points).extent;
    refreshTrackGrid(this.gridGroup, this.extent);
    this._rebuildMarkers(points);
    this._rebuildFrustums();
    this.setFrame(this.frame);
  }

  /** Sampled raw-to-refined offsets: what the cleanup actually changed. */
  _displacement(rawPoints, refinedPoints) {
    const count = Math.min(rawPoints.length, refinedPoints.length);
    const step = Math.max(1, Math.floor(count / 40));
    const vertices = [];
    for (let index = 0; index < count; index += step) {
      vertices.push(...rawPoints[index], ...refinedPoints[index]);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    return new LineSegments(geometry, new LineBasicMaterial({
      color: RAW_COLOR, transparent: true, opacity: 0.45,
    }));
  }

  _rebuildMarkers(points) {
    for (const child of [...this.markerGroup.children]) {
      if (child === this.currentMarker) continue;
      this.markerGroup.remove(child);
      disposeObject(child);
    }
    if (points.length < 2) return;
    const radius = Math.max(0.008, this.extent * 0.012);
    const start = marker(START_COLOR, radius);
    start.position.set(...points[0]);
    const end = marker(END_COLOR, radius);
    end.position.set(...points[points.length - 1]);
    this.markerGroup.add(start, end);
    this.currentMarker.scale.setScalar(Math.max(0.5, radius / 0.02));
  }

  _rebuildFrustums() {
    const track = this.activeTrack();
    if (!track) return;
    const scale = Math.max(0.05, this.extent * 0.08);
    const aspect = Math.max(0.05, (Number(track.width) || 16) / Math.max(1, Number(track.height) || 9));
    for (const frame of frustumFrames(trackFrames(track))) {
      const lines = frustumLines(sampleCamera(track, frame), {
        color: this.mode === "raw" ? RAW_COLOR : REFINED_COLOR, opacity: 0.35, scale, aspect,
      });
      this.frustumGroup.add(lines);
    }
  }

  /** Move the current-frame marker and frustum. Never edits the track. */
  setFrame(frame) {
    this.frame = Math.max(0, Number(frame) || 0);
    const track = this.activeTrack();
    if (!track) return null;
    const camera = sampleCamera(track, this.frame);
    this.currentMarker.position.set(...camera.position.map(Number));

    if (this.currentFrustum) {
      this.scene.remove(this.currentFrustum);
      disposeObject(this.currentFrustum);
    }
    const aspect = Math.max(0.05, (Number(track.width) || 16) / Math.max(1, Number(track.height) || 9));
    this.currentFrustum = frustumLines(camera, {
      color: REFINED_COLOR, scale: Math.max(0.06, this.extent * 0.12), aspect,
    });
    this.scene.add(this.currentFrustum);
    return camera;
  }

  bounds() {
    const points = samplePath(this.activeTrack());
    return pathBounds(points);
  }

  _clear(group) {
    for (const child of [...group.children]) {
      group.remove(child);
      disposeObject(child);
    }
  }

  dispose() {
    if (this.currentFrustum) {
      this.scene.remove(this.currentFrustum);
      disposeObject(this.currentFrustum);
      this.currentFrustum = null;
    }
    for (const group of [this.pathGroup, this.frustumGroup, this.markerGroup, this.gridGroup]) {
      this._clear(group);
      this.scene.remove(group);
    }
    disposeObject(this.currentMarker);
    this.tracks = { raw: null, refined: null };
  }
}
