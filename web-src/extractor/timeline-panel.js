// The Track timeline card: canonical camera channels and scrubbing.
//
// Split out of index.js so the panel's orchestration stays readable, and so the
// grading choice -- which track is graded, against whose limits -- lives in one
// place instead of being spread across three render methods.

import {
  DOPE_LAYOUT,
  drawTrackTimeline,
  frameAtTimelineX,
  timelineHeight,
} from "./track-timeline.js";

export class TimelinePanelHost {
  /**
   * @param root the panel root, queried for its own `data-role` elements
   * @param onSeek called with a frame when the user scrubs the strip
   */
  constructor(root, { onSeek = () => {} } = {}) {
    this.root = root;
    this.onSeek = onSeek;
    this.scrubbing = false;
  }

  $(role) {
    return this.root?.querySelector(`[data-role="${role}"]`) || null;
  }

  /**
   * Draw the strip for one track.
   *
   * The track passed in is whichever the viewer is showing, so switching
   * RAW/REFINED therefore moves the displayed keys with it.
   */
  render({ track = null, health = null, quality = [], anomalies = [], frame = 0, frameCount = 0 } = {}) {
    const canvas = this.$("track-timeline");
    if (!canvas) return null;
    // The canvas is a lane stack inside the Director's dope sheet, so its
    // height is the rows it draws -- not a number in the markup that drifts
    // out of step with them the first time a lane is added.
    const height = timelineHeight(undefined, DOPE_LAYOUT);
    if (canvas.height !== height) canvas.height = height;
    return drawTrackTimeline(canvas, {
      track,
      health,
      quality,
      anomalies,
      frame,
      layout: DOPE_LAYOUT,
      frameCount: Math.max(Number(frameCount) || 0, Number(track?.duration_frames) || 0),
    });
  }

  /** Which frame a pointer event over the strip refers to, or null. */
  frameAt(event, frameCount) {
    const tracks = this.$("extractor-dope-tracks");
    if (!tracks?.getBoundingClientRect) return null;
    // This is already the grid's track column: the label gutter is its sibling,
    // so client X is measured against the real usable track area, not a canvas
    // with an invented internal gutter.
    const rect = tracks.getBoundingClientRect();
    return frameAtTimelineX(event.clientX - rect.left, rect.width, frameCount, 0);
  }

  /** Wire scrubbing. `listen` is the panel's own disposal-tracked binder. */
  bind(listen, frameCount) {
    const tracks = this.$("extractor-dope-tracks");
    listen(tracks, "pointerdown", (event) => {
      tracks.setPointerCapture?.(event.pointerId);
      this.scrubbing = true;
      this.pointerId = event.pointerId;
      this.seek(event, frameCount());
    });
    listen(tracks, "pointermove", (event) => {
      if (this.scrubbing && event.pointerId === this.pointerId) this.seek(event, frameCount());
    });
    for (const name of ["pointerup", "pointercancel"]) {
      listen(tracks, name, (event) => {
        if (event.pointerId !== this.pointerId) return;
        tracks.releasePointerCapture?.(event.pointerId);
        this.scrubbing = false;
        this.pointerId = null;
      });
    }
  }

  seek(event, frameCount) {
    const frame = this.frameAt(event, frameCount);
    if (frame !== null) this.onSeek(frame);
    return frame;
  }
}
