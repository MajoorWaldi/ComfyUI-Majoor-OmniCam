// Bone-aware aim constraint, in the spirit of Maya's aimConstraint.
//
// The existing look-at tracking (camera.target_object_id, resolved inside
// sampleCamera) follows an object's *node* transform. That is enough for a prop
// the Director moves around, and useless for an FBX whose motion lives in its
// skeleton: the node never moves, so the camera stares at the origin while the
// character walks away.
//
// Bones only exist in the WebGL viewport, and only the mixer knows where they
// are at a given time, so they cannot be resolved from state alone. Rather than
// make sampleCamera impure, this module leaves it untouched and overrides the
// target afterwards, at the three places a camera is actually consumed: the
// playhead camera, the preview tiles, and the playblast. Bake writes the
// resolved targets into real keyframes for everything else (path display,
// camera export).
//
// Nothing here runs unless a camera has both a tracked object and a bone, so
// every existing scene behaves exactly as before.

import { sampleCamera, sampleObjectTransform } from "./director/core.js";
import { t } from "./i18n.js";

/** The tracked object id for a camera track, falling back to the legacy state field. */
export function aimObjectId(ui, cameraTrack) {
  const track = cameraTrack || ui.activeCameraTrack?.();
  return track?.target_object_id || ui.state.target_object_id || null;
}

/** The bone a camera aims at, or null when it tracks the object as a whole. */
export function aimBone(ui, cameraTrack) {
  const track = cameraTrack || ui.activeCameraTrack?.();
  const bone = track?.aim_bone ?? (track?.id === ui.state.active_camera_id ? ui.state.aim_bone : null);
  return typeof bone === "string" && bone ? bone : null;
}

/** Bone names available on the tracked object; empty when it is not a rigged model. */
export function listAimBones(ui, objectId = aimObjectId(ui)) {
  if (!objectId) return [];
  const object = ui.state.objects.find((item) => item.id === objectId);
  if (!object || (object.type !== "model" && object.type !== "glb")) return [];
  return ui.webgl?.listObjectBones?.(objectId) || [];
}

/**
 * World point the camera should aim at, at `frame`.
 *
 * Returns null when there is nothing bone-specific to resolve, which is the
 * signal to leave sampleCamera's own result alone.
 */
export function resolveAimPoint(ui, cameraTrack, frame) {
  const objectId = aimObjectId(ui, cameraTrack);
  const bone = aimBone(ui, cameraTrack);
  if (!objectId || !bone) return null;
  const object = ui.state.objects.find((item) => item.id === objectId);
  if (!object || object.enabled === false) return null;
  const point = ui.webgl?.sampleModelPoint?.(objectId, bone, frame, ui.state.fps || 24);
  if (!point) return null;
  const track = cameraTrack || ui.activeCameraTrack?.();
  const offset = track?.target_offset || ui.state.target_offset || [0, 0, 0];
  return [point[0] + (offset[0] || 0), point[1] + (offset[1] || 0), point[2] + (offset[2] || 0)];
}

/**
 * Point the resolution falls back to when the bone cannot be probed — the same
 * one the pure look-at constraint already uses, so baking never regresses.
 */
function objectFallbackPoint(ui, object, frame) {
  const modelCenter = (object.type === "model" || object.type === "glb")
    ? ui.webgl?.sampleModelPoint?.(object.id, null, frame, ui.state.fps || 24)
    : null;
  if (modelCenter) return modelCenter;
  return object.keyframes?.length
    ? sampleObjectTransform(object, frame).position
    : (object.position || [0, 1.5, 0]);
}

/**
 * Override `cameraState.target` in place when a bone constraint applies.
 * Returns the same object either way, so call sites can wrap a sampleCamera().
 */
export function applyAimConstraint(ui, cameraTrack, cameraState, frame) {
  if (!cameraState) return cameraState;
  const point = resolveAimPoint(ui, cameraTrack, frame);
  if (point) cameraState.target = point;
  return cameraState;
}

/** Choose the bone to aim at ("" clears it back to whole-object tracking). */
export function setAimBone(ui, boneName) {
  const bone = boneName || null;
  ui.checkpoint("Change aim bone");
  const track = ui.activeCameraTrack();
  track.aim_bone = bone;
  if (track.id === ui.state.active_camera_id) ui.state.aim_bone = bone;
  ui.setFrame(ui.frame);
  ui.serialize();
  ui.refreshInspector();
  ui.render();
  ui.setStatus(bone
    ? t("Aiming at bone {bone}").replace("{bone}", bone)
    : t("Aiming at the whole object"));
}

/**
 * Write the resolved aim into real keyframes.
 *
 * `perFrame` adds one camera key per frame across the animation range, which is
 * what makes an exported track match what the viewport shows: between two keys
 * the target is interpolated, and a bone rarely moves in a straight line.
 */
export function bakeAimConstraint(ui, { perFrame = false } = {}) {
  const track = ui.activeCameraTrack();
  const objectId = aimObjectId(ui, track);
  const bone = aimBone(ui, track);
  // Without a bone this is the plain object aim the Director already bakes.
  if (!objectId || !bone) return ui.bakeAimToKeyframes();
  const object = ui.state.objects.find((item) => item.id === objectId);
  if (!object || !track.keyframes?.length) return;

  ui.checkpoint(perFrame ? "Bake aim per frame" : "Bake aim to keyframes");
  const targetAt = (frame) => resolveAimPoint(ui, track, frame) || objectFallbackPoint(ui, object, frame);

  if (perFrame) {
    const first = track.keyframes[0].frame;
    const last = track.keyframes[track.keyframes.length - 1].frame;
    const byFrame = new Map(track.keyframes.map((key) => [key.frame, key]));
    for (let frame = first; frame <= last; frame++) {
      const existing = byFrame.get(frame);
      // A frame with no key gets one sampled off the current curve, so only the
      // aim changes and the move the user animated is preserved.
      const key = existing || { frame, camera: sampleCamera(track, frame, ui.state.objects), interpolation: "linear" };
      key.camera.target = [...targetAt(frame)];
      byFrame.set(frame, key);
    }
    track.keyframes = [...byFrame.values()].sort((a, b) => a.frame - b.frame);
  } else {
    for (const key of track.keyframes) key.camera.target = [...targetAt(key.frame)];
  }

  if (track.id === ui.state.active_camera_id) ui.state.keyframes = track.keyframes;
  ui.setFrame(ui.frame);
  ui.serialize();
  ui.refreshKeys();
  ui.refreshInspector();
  ui.render();
  ui.setStatus(t("Aim baked on bone {bone} ({count} keys)")
    .replace("{bone}", bone)
    .replace("{count}", String(track.keyframes.length)));
}

/** Repopulate the bone picker; hides it when the tracked object has no rig. */
export function refreshAimBoneOptions(ui) {
  const row = ui.root?.querySelector('[data-role="camera-aim-bone-row"]');
  const select = ui.root?.querySelector('[data-role="camera-aim-bone"]');
  if (!select) return;
  const bones = listAimBones(ui);
  if (row) row.hidden = bones.length === 0;
  const current = aimBone(ui) || "";
  select.innerHTML = "";
  const whole = document.createElement("option");
  whole.value = "";
  whole.textContent = t("Whole object");
  select.appendChild(whole);
  for (const bone of bones) {
    const option = document.createElement("option");
    option.value = bone;
    option.textContent = bone;
    select.appendChild(option);
  }
  // A bone saved against a model that has since changed rig must not silently
  // read as "whole object" while the constraint still names it.
  if (current && !bones.includes(current)) {
    const missing = document.createElement("option");
    missing.value = current;
    missing.textContent = `${current} — ${t("missing")}`;
    select.appendChild(missing);
  }
  select.value = current;
}
