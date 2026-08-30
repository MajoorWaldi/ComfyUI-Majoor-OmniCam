// Shared read-only track timeline used by Extractor and Monitor.

import {
  drawTrackTimeline,
  frameAtTimelineX,
  timelineHeight,
} from "../extractor/track-timeline.js";

export function trackTimelineModel(options = {}) {
  return drawTrackTimeline(null, {
    ...options,
    frameCount: Math.max(
      Number(options.frameCount) || 0,
      Number(options.track?.duration_frames) || 0,
      1,
    ),
  });
}

export function drawReadOnlyTrackTimeline(canvas, options = {}) {
  return drawTrackTimeline(canvas, options);
}

export class ReadOnlyTrackTimelineHost {
  constructor(canvas, { onSeek = () => {} } = {}) {
    this.canvas = canvas;
    this.onSeek = onSeek;
    this.options = {};
    this.listener = (event) => {
      const rect = this.canvas?.getBoundingClientRect?.();
      if (!rect) return;
      const x = ((event.clientX - rect.left) * this.canvas.width) / Math.max(1, rect.width);
      const frame = frameAtTimelineX(x, this.canvas.width, this.options.frameCount);
      this.onSeek(frame);
    };
    this.canvas?.addEventListener?.("pointerdown", this.listener);
  }

  render(options = {}) {
    this.options = {
      ...options,
      frameCount: Math.max(
        Number(options.frameCount) || 0,
        Number(options.track?.duration_frames) || 0,
        1,
      ),
    };
    return drawReadOnlyTrackTimeline(this.canvas, this.options);
  }

  dispose() {
    this.canvas?.removeEventListener?.("pointerdown", this.listener);
    this.canvas = null;
  }
}

export { timelineHeight };

