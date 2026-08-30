import { ManagedVideoPlayer, frameAtMediaTime } from "../shared/video-player.js";

export const frameAtTime = frameAtMediaTime;

export class MonitorPlayer extends ManagedVideoPlayer {
  constructor(video, { fps = 24, durationFrames = 1, onFrame = () => {} } = {}) {
    super(video, { fps, durationFrames, onFrame, loop: true, muted: true });
  }
}
