// The Extractor's single frame clock.
//
// Every visible consumer advances through this class so a source frame, the
// solved track, diagnostics, and serializable panel state cannot drift apart.

function boundedFrame(frame, frameCount) {
  const last = Math.max(0, Math.floor(Number(frameCount) || 0) - 1);
  return Math.max(0, Math.min(last, Math.round(Number(frame) || 0)));
}

function manualReason(reason) {
  return ["manual", "transport", "timeline", "quality", "input"].includes(reason);
}

export class FrameCoordinator {
  constructor({
    media = null,
    getViewer = () => null,
    showDiagnostics = () => {},
    dispatch = () => {},
    setFollow = () => {},
    frameCount = 0,
    fps = 24,
    loop = false,
    requestAnimationFrame = globalThis.requestAnimationFrame?.bind(globalThis),
    cancelAnimationFrame = globalThis.cancelAnimationFrame?.bind(globalThis),
  } = {}) {
    this.media = media;
    this.getViewer = getViewer;
    this.showDiagnostics = showDiagnostics;
    this.dispatch = dispatch;
    this.setFollow = setFollow;
    this.frameCount = Math.max(0, Math.floor(Number(frameCount) || 0));
    this.fps = Math.max(1, Number(fps) || 24);
    this.loop = Boolean(loop);
    this.frame = 0;
    this.playing = false;
    this.disposed = false;
    this.animationFrame = null;
    this.playbackStartFrame = 0;
    this.playbackStartTime = null;
    this.requestAnimationFrame = requestAnimationFrame || (() => null);
    this.cancelAnimationFrame = cancelAnimationFrame || (() => {});
  }

  setFrameCount(frameCount) {
    const next = Math.max(0, Math.floor(Number(frameCount) || 0));
    if (next === this.frameCount) return this.frameCount;
    this.frameCount = next;
    this.media?.setFrameCount?.(this.frameCount);
    this.dispatch({ type: "FRAME_COUNT", frameCount: this.frameCount });
    if (!this.frameCount) this.pause();
    return this.frameCount;
  }

  reconcileFrameCount(payload) {
    const reported = Number(payload?.frame_count);
    return this.setFrameCount(Number.isFinite(reported) ? reported : this.frameCount);
  }

  setRate(fps) {
    this.fps = Math.max(1, Number(fps) || 24);
    this.media?.setRate?.(this.fps);
    return this.fps;
  }

  setLoop(enabled) {
    this.loop = Boolean(enabled);
    this.media?.setLoop?.(this.loop);
    return this.loop;
  }

  seek(frame, reason = "manual") {
    if (this.disposed) return this.frame;
    const next = boundedFrame(frame, this.frameCount);
    if (manualReason(reason)) this.setFollow(false);
    if (reason !== "media") this.media?.seekFrame?.(next);
    this.getViewer?.()?.setFrame?.(next);
    this.showDiagnostics(next);
    this.frame = next;
    this.dispatch({ type: "FRAME", frame: next });
    if (reason !== "playback") {
      this.playbackStartFrame = next;
      this.playbackStartTime = null;
    }
    return next;
  }

  play() {
    if (this.disposed || this.playing || this.frameCount < 1) return false;
    this.playing = true;
    this.playbackStartFrame = this.frame;
    this.playbackStartTime = null;
    this.schedule();
    return true;
  }

  pause() {
    if (!this.playing) return false;
    this.playing = false;
    this.playbackStartTime = null;
    if (this.animationFrame !== null) this.cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
    this.media?.pause?.();
    return true;
  }

  toggle() {
    return this.playing ? this.pause() : this.play();
  }

  schedule() {
    if (!this.playing || this.disposed || this.animationFrame !== null) return;
    this.animationFrame = this.requestAnimationFrame((timestamp) => this.tick(timestamp));
  }

  tick(timestamp) {
    this.animationFrame = null;
    if (!this.playing || this.disposed) return;
    const now = Number(timestamp) || 0;
    if (this.playbackStartTime === null) this.playbackStartTime = now;
    const elapsed = Math.max(0, now - this.playbackStartTime);
    const advance = Math.floor((elapsed * this.fps) / 1000);
    const total = this.frameCount;
    if (total < 1) {
      this.pause();
      return;
    }
    const last = Math.max(0, total - 1);
    let next = this.playbackStartFrame + advance;
    if (next > last) {
      if (this.loop && total > 0) next %= total;
      else {
        if (last !== this.frame) this.seek(last, "playback");
        this.pause();
        return;
      }
    }
    if (next !== this.frame) this.seek(next, "playback");
    this.schedule();
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.pause();
    this.media = null;
    this.getViewer = null;
    this.showDiagnostics = null;
    this.dispatch = null;
    this.setFollow = null;
  }
}
