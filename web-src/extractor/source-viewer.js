// The source-footage viewer.
import { ManagedVideoPlayer } from "../shared/video-player.js";
//
// It plays the same managed file the solver is reading, so what the user
// inspects is the footage the solve saw -- not a re-encode, not a proxy.
//
// "Follow Solve" seeks the video to the frame the backend is working on. A
// manual scrub turns it off, because the one thing more annoying than a video
// that will not follow is a video that yanks itself away while you scrub.

/**
 * What a browser MediaError actually means, in words a user can act on.
 *
 * The server opens the footage with PyAV, the panel with a `<video>` element,
 * and those two do not decode the same set of files. A solve can therefore run
 * perfectly on a source the browser refuses to show, and the panel has to say
 * so instead of leaving a black rectangle that reads as "the panel is broken".
 */
export function mediaErrorMessage(error, url = "") {
  const code = Number(error?.code) || 0;
  const suffix = url ? "" : " (no source URL was set)";
  switch (code) {
    case 1: return `Loading the footage was aborted${suffix}.`;
    case 2: return "The footage could not be fetched from ComfyUI. Is the file still in the input folder?";
    case 3: return "The browser could not decode this file. The solve can still read it -- "
      + "this only affects the preview. Re-encode to H.264 MP4 to preview it here.";
    case 4: return "The browser cannot play this container or codec (H.265, ProRes and most AVI "
      + "variants are common causes). The solve can still read it; only the preview is affected.";
    default: return `The footage could not be played${suffix}.`;
  }
}

export class SourceViewer extends ManagedVideoPlayer {
  constructor(video, {
    fps = 24, onFrame = () => {}, onMetadata = () => {}, onError = () => {},
  } = {}) {
    super(video, {
      fps, durationFrames: 1, onFrame, onMetadata, onError,
      errorMessage: mediaErrorMessage, loop: true, muted: true,
    });
    this.frameCount = 0;
    this.follow = true;
  }

  /** A user gesture: seek, and stop following the solver until re-enabled. */
  scrubTo(frame) {
    this.setFollow(false);
    this.seekFrame(frame);
    this.onFrame(Math.max(0, Number(frame) || 0));
  }

  /** The solver moved: follow it only if the user has not taken over. */
  followSolveFrame(frame) {
    if (!this.follow) return false;
    this.seekFrame(frame);
    return true;
  }

  setFollow(enabled) {
    this.follow = Boolean(enabled);
    return this.follow;
  }

  setLoop(enabled) {
    super.setLoop(enabled);
  }
}

/** Frame number to a timecode, using the source rate rather than wall time. */
export function timecode(frame, fps) {
  const rate = Math.max(1, Number(fps) || 24);
  const total = Math.max(0, Number(frame) || 0);
  const seconds = Math.floor(total / rate);
  const pad = (value, width = 2) => String(value).padStart(width, "0");
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}:${pad(total % rate)}`;
}
