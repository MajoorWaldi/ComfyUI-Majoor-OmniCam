// Multi-select batch tools and the Simplify / Reduce / Clean key operations.
// The maths lives in ../key-ops.js; this binds it to the Director instance.

import { clamp, sampleCamera } from "../core.js";
import {
  cleanKeyframes,
  deleteKeyframesByFrame,
  reduceKeyframes,
  setKeyframeInterpolation,
  setKeyframeTangentMode,
  shiftKeyframes,
  simplifyKeyframes,
} from "../key-ops.js";
import { activeCameraTrack, syncActiveCameraTrack } from "../../state-sync.js";
import { timelineKeyframes, timelineObject } from "../../scene.js";
import { curveChannels } from "../../curve-editor.js";
import { t } from "../../i18n.js";

// Slider position (0..100) -> RDP tolerance in normalised units. 30% already
// removes obvious redundancy; the far end is aggressive but still shape-aware.
const MAX_SIMPLIFY_TOLERANCE = 0.12;

export function createKeyframeBatchMethods() {
  return {
    /** Selected key frames that still exist on the active track, sorted. */
    resolveSelectedFrames() {
      const present = new Set(timelineKeyframes(this).map((key) => key.frame));
      const raw = this.selectedKeyFrames?.size
        ? [...this.selectedKeyFrames]
        : (this.selectedKeyFrame != null ? [this.selectedKeyFrame] : []);
      return raw.filter((frame) => present.has(frame)).sort((a, b) => a - b);
    },

    _activeTrack() {
      const object = timelineObject(this);
      if (object) return { kind: "object", write: (keys) => { object.keyframes = keys; } };
      const camera = activeCameraTrack(this);
      return {
        kind: "camera",
        write: (keys) => {
          camera.keyframes = keys;
          this.state.keyframes = keys;
          syncActiveCameraTrack(this);
        },
      };
    },

    deleteSelectedKeyframes() {
      let frames = this.resolveSelectedFrames();
      if (!frames.length) {
        const atPlayhead = timelineKeyframes(this).find((key) => key.frame === this.frame);
        if (atPlayhead) frames = [atPlayhead.frame];
      }
      if (!frames.length) return this.setStatus(t("Select a keyframe to delete"));
      const track = this._activeTrack();
      const source = timelineKeyframes(this);
      const minKeys = track.kind === "camera" ? 1 : 0;
      const { keys, removed } = deleteKeyframesByFrame(source, frames, { minKeys });
      if (!removed) return this.setStatus(t("Keep at least one camera keyframe"));
      this.checkpoint(removed > 1 ? t("Delete {n} keyframes").replace("{n}", removed) : "Delete keyframe");
      track.write(keys);
      const remaining = timelineKeyframes(this);
      const anchor = frames[0];
      this.selectedKeyFrame = remaining.length
        ? remaining.reduce((near, item) => (Math.abs(item.frame - anchor) < Math.abs(near.frame - anchor) ? item : near)).frame
        : null;
      this.selectedKeyFrames = this.selectedKeyFrame != null ? new Set([this.selectedKeyFrame]) : new Set();
      if (frames.includes(this.editingKeyFrame)) this.editingKeyFrame = null;
      this.camera = sampleCamera(this.state, this.frame);
      this.applyObjectAnimationFrame();
      this.serialize();
      this.refreshKeys();
      this.render();
      this.setStatus(removed > 1
        ? t("{n} keyframes deleted").replace("{n}", removed)
        : t("Keyframe deleted"));
    },

    /** Move every selected key by `delta` frames. Returns false when nothing is selected. */
    nudgeSelectedKeyframes(delta) {
      const frames = this.resolveSelectedFrames();
      if (!frames.length || !delta) return false;
      const track = this._activeTrack();
      const lastFrame = Math.max(0, this.state.duration_frames - 1);
      const result = shiftKeyframes(timelineKeyframes(this), frames, delta, { lastFrame });
      if (!result.moved) {
        this.setStatus(t("Selected keys cannot move further"));
        return true;
      }
      this.checkpoint(t("Nudge {n} keyframes").replace("{n}", frames.length));
      track.write(result.keys);
      this.selectedKeyFrames = new Set(result.frames);
      this.selectedKeyFrame = result.frames.at(-1) ?? null;
      this.editingKeyFrame = null;
      this.serialize();
      this.refreshKeys();
      this.setFrame(this.selectedKeyFrame ?? this.frame, false, false);
      this.render();
      return true;
    },

    setSelectedKeysInterpolation(mode) {
      const frames = this.resolveSelectedFrames();
      if (frames.length < 2) return this.setCurveInterpolation(mode);
      const track = this._activeTrack();
      this.checkpoint(t("Interpolation on {n} keys").replace("{n}", frames.length));
      track.write(setKeyframeInterpolation(timelineKeyframes(this), frames, mode));
      this.serialize();
      this.refreshKeys();
      this.refreshKeyEditor();
      this.render();
      this.drawCurveEditor();
      this.setStatus(t("{mode} interpolation on {n} keys")
        .replace("{mode}", mode.replace(/_/g, " ")).replace("{n}", frames.length));
    },

    setSelectedKeysTangentMode(mode) {
      const frames = this.resolveSelectedFrames();
      if (frames.length < 2) return this.setTangentMode(mode);
      const track = this._activeTrack();
      const channelIds = curveChannels(this).map((channel) => channel.id);
      this.checkpoint(t("Tangents on {n} keys").replace("{n}", frames.length));
      track.write(setKeyframeTangentMode(timelineKeyframes(this), frames, mode, channelIds));
      this.serialize();
      this.refreshKeys();
      this.render();
      this.drawCurveEditor();
      this.setStatus(t("{mode} tangents on {n} keys")
        .replace("{mode}", mode).replace("{n}", frames.length));
    },

    /**
     * mode: "simplify" (tolerance 0..1) | "reduce" (target key count) | "clean".
     * scope: "camera" | "all_cameras" | "object". When >= 2 keys are selected on
     * a single-track scope the op is confined to that frame range.
     */
    simplifyActiveKeys({ mode = "simplify", tolerance = 0, target = 0, scope = "camera", fromKeys = null, silent = false } = {}) {
      const kind = scope === "object" ? "object" : "camera";
      let tracks;
      if (scope === "object") {
        const object = timelineObject(this);
        if (!object) return this.setStatus(t("Select an animated object first"));
        tracks = [{ get: () => object.keyframes || [], set: (keys) => { object.keyframes = keys; }, primary: true }];
      } else if (scope === "all_cameras") {
        tracks = this.state.cameras.map((camera) => ({
          get: () => camera.keyframes || [],
          set: (keys) => {
            camera.keyframes = keys;
            if (camera.id === this.state.active_camera_id) this.state.keyframes = keys;
          },
          primary: camera.id === this.state.active_camera_id,
        }));
      } else {
        const camera = activeCameraTrack(this);
        tracks = [{
          get: () => camera.keyframes || [],
          set: (keys) => { camera.keyframes = keys; this.state.keyframes = keys; },
          primary: true,
        }];
      }

      if (mode === "simplify" && tolerance <= 0 && !fromKeys) return 0; // 0% is a no-op

      const selFrames = this.resolveSelectedFrames();
      const range = (scope !== "all_cameras" && selFrames.length >= 2)
        ? [selFrames[0], selFrames.at(-1)]
        : null;
      const keepFrames = range ? [] : selFrames;

      const runOne = (all) => {
        const sorted = [...all].sort((a, b) => a.frame - b.frame);
        const lo = range ? range[0] : -Infinity;
        const hi = range ? range[1] : Infinity;
        const before = sorted.filter((key) => key.frame < lo);
        const mid = sorted.filter((key) => key.frame >= lo && key.frame <= hi);
        const after = sorted.filter((key) => key.frame > hi);
        let out = mid;
        let removed = 0;
        if (mid.length > 2) {
          const op = mode === "reduce"
            ? reduceKeyframes(mid, kind, { target: target || Math.ceil(mid.length / 2), keepFrames })
            : mode === "clean"
              ? cleanKeyframes(mid, kind, { keepFrames })
              : simplifyKeyframes(mid, kind, { tolerance: tolerance * MAX_SIMPLIFY_TOLERANCE, keepFrames });
          out = op.keys;
          removed = op.removed;
        }
        return { keys: [...before, ...out, ...after].sort((a, b) => a.frame - b.frame), removed };
      };

      let totalRemoved = 0;
      const results = tracks.map((track) => {
        const src = (fromKeys && track.primary) ? fromKeys : track.get();
        const { keys, removed } = runOne(src);
        totalRemoved += removed;
        return { track, keys };
      });

      if (!silent) this.checkpoint(t("Simplify keyframes"));
      for (const { track, keys } of results) track.set(keys);
      syncActiveCameraTrack(this);
      this.selectedKeyFrame = null;
      this.selectedKeyFrames = new Set();
      this.camera = sampleCamera(this.state, this.frame);
      this.applyObjectAnimationFrame();
      this.serialize();
      this.refreshKeys();
      this.setFrame(this.frame, false, false);
      this.render();
      if (!silent) {
        this.setStatus(totalRemoved
          ? t("Removed {n} keyframes").replace("{n}", totalRemoved)
          : t("No keyframes to remove"));
      }
      return totalRemoved;
    },

    keySimplifyToleranceFor(percent) {
      return clamp(Number(percent) || 0, 0, 100) / 100;
    },
  };
}
