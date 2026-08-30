// The Track timeline card: canvas, limit picker, summary line and scrubbing.
//
// Split out of index.js so the panel's orchestration stays readable, and so the
// grading choice -- which track is graded, against whose limits -- lives in one
// place instead of being spread across three render methods.

import { loadMotionProfiles } from "../motion-health/panel.js";

import {
  DOPE_LAYOUT,
  drawTrackTimeline,
  frameAtTimelineX,
  healthSummary,
  timelineHeight,
  trackHealth,
} from "./track-timeline.js";

const NO_LIMITS = "Motion limits unavailable -- the adapter tables could not be loaded";

export class TimelinePanelHost {
  /**
   * @param root the panel root, queried for its own `data-role` elements
   * @param onSeek called with a frame when the user scrubs the strip
   */
  constructor(root, { onSeek = () => {} } = {}) {
    this.root = root;
    this.onSeek = onSeek;
    this.profiles = null;
    this.profileId = "";
    this.health = null;
    this.scrubbing = false;
  }

  $(role) {
    return this.root?.querySelector(`[data-role="${role}"]`) || null;
  }

  /**
   * Fill the limit picker from the adapter tables.
   *
   * Fetched rather than duplicated: the numbers a shot is graded against belong
   * to the adapters, and a second copy in the frontend is a second thing to
   * forget to update.
   */
  async loadProfiles() {
    const profiles = await loadMotionProfiles();
    if (!profiles?.profiles?.length) return null;
    this.profiles = profiles;
    const select = this.$("limits-profile");
    if (select) {
      select.replaceChildren();
      for (const profile of profiles.profiles) {
        const option = select.ownerDocument.createElement("option");
        option.value = profile.id;
        option.textContent = profile.label || profile.id;
        select.append(option);
      }
      select.value = this.profileId || profiles.profiles[0].id;
      this.profileId = select.value;
    }
    return profiles;
  }

  setProfile(id) {
    this.profileId = String(id || "");
    return this.profileId;
  }

  limits() {
    const id = this.$("limits-profile")?.value || this.profileId || "generic";
    const entry = this.profiles?.profiles?.find((profile) => profile.id === id);
    return { id, limits: entry ? entry.limits : null };
  }

  /**
   * Draw the strip for one track.
   *
   * The track passed in is whichever the viewer is showing, so switching
   * RAW/REFINED moves the MOTION band with it; grading the refined track while
   * the user looks at the raw one would be a quietly wrong answer.
   */
  render({ track = null, quality = [], frame = 0, frameCount = 0 } = {}) {
    const canvas = this.$("track-timeline");
    if (!canvas) return null;
    const { id, limits } = this.limits();
    this.health = trackHealth(track, limits, id);
    const summary = this.$("limits-summary");
    if (summary) summary.textContent = limits ? healthSummary(this.health) : NO_LIMITS;
    // The canvas is a lane stack inside the Director's dope sheet, so its
    // height is the rows it draws -- not a number in the markup that drifts
    // out of step with them the first time a lane is added.
    const height = timelineHeight(undefined, DOPE_LAYOUT);
    if (canvas.height !== height) canvas.height = height;
    return drawTrackTimeline(canvas, {
      track,
      health: this.health,
      quality,
      frame,
      layout: DOPE_LAYOUT,
      frameCount: Math.max(Number(frameCount) || 0, Number(track?.duration_frames) || 0),
    });
  }

  /** Which frame a pointer event over the strip refers to, or null. */
  frameAt(event, frameCount) {
    const canvas = this.$("track-timeline");
    if (!canvas?.getBoundingClientRect) return null;
    const rect = canvas.getBoundingClientRect();
    // The canvas is stretched by CSS, so a client x has to be scaled back into
    // the coordinate space the layout was actually drawn in.
    const x = ((event.clientX - rect.left) * canvas.width) / Math.max(1, rect.width);
    return frameAtTimelineX(x, canvas.width, frameCount, DOPE_LAYOUT.labelWidth);
  }

  /** Wire scrubbing. `listen` is the panel's own disposal-tracked binder. */
  bind(listen, frameCount) {
    const canvas = this.$("track-timeline");
    listen(canvas, "pointerdown", (event) => {
      canvas.setPointerCapture?.(event.pointerId);
      this.scrubbing = true;
      this.seek(event, frameCount());
    });
    listen(canvas, "pointermove", (event) => {
      if (this.scrubbing) this.seek(event, frameCount());
    });
    for (const name of ["pointerup", "pointercancel"]) {
      listen(canvas, name, () => { this.scrubbing = false; });
    }
  }

  seek(event, frameCount) {
    const frame = this.frameAt(event, frameCount);
    if (frame !== null) this.onSeek(frame);
    return frame;
  }
}
