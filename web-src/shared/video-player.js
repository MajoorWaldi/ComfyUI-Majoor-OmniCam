// Product-neutral lifecycle for a managed HTML video element.

export function frameAtMediaTime(time, fps, durationFrames = Number.POSITIVE_INFINITY) {
  const last = Math.max(0, Number(durationFrames || 1) - 1);
  return Math.max(0, Math.min(last, Math.round(Number(time || 0) * Math.max(1, Number(fps || 24)))));
}

export class ManagedVideoPlayer {
  constructor(video, {
    fps = 24, durationFrames = 1, onFrame = () => {}, onMetadata = () => {},
    onError = () => {}, errorMessage = () => "The video could not be played.",
    loop = true, muted = true,
  } = {}) {
    this.video = video;
    this.fps = Number(fps) || 24;
    this.durationFrames = Math.max(1, Number(durationFrames) || 1);
    this.frameCount = this.durationFrames;
    this.onFrame = onFrame;
    this.onMetadata = onMetadata;
    this.onError = onError;
    this.errorMessage = errorMessage;
    this.loop = Boolean(loop);
    this.muted = Boolean(muted);
    this.url = "";
    this.error = "";
    this.primed = false;
    this.disposers = [];
    this._bind();
  }

  _bind() {
    if (!this.video) return;
    const listen = (name, listener) => {
      this.video.addEventListener(name, listener);
      this.disposers.push(() => this.video?.removeEventListener(name, listener));
    };
    listen("timeupdate", () => this.onFrame(this.currentFrame()));
    listen("loadedmetadata", () => {
      const fromDuration = Math.round((Number(this.video.duration) || 0) * this.fps);
      this.frameCount = Math.max(this.frameCount, fromDuration);
      this.durationFrames = this.frameCount;
      this.onMetadata({ frameCount: this.frameCount, fps: this.fps, duration: this.video.duration });
      this.onFrame(this.currentFrame());
      this.primeFirstFrame();
    });
    listen("loadeddata", () => {
      this.error = "";
      this.primeFirstFrame();
      this.onFrame(this.currentFrame());
    });
    listen("error", () => {
      this.error = String(this.errorMessage(this.video?.error, this.url));
      this.onError(this.error);
    });
  }

  setSource(url, { fps, frameCount, durationFrames } = {}) {
    if (Number(fps) > 0) this.fps = Number(fps);
    const count = Number(frameCount ?? durationFrames);
    if (Number.isFinite(count) && count > 0) {
      this.frameCount = count;
      this.durationFrames = count;
    }
    if (!this.video) return false;
    const next = String(url || "");
    if (next === this.url && (!next || !this.error)) return false;
    this.url = next;
    this.error = "";
    this.primed = false;
    this.video.pause?.();
    if (!next) this.video.removeAttribute?.("src");
    else this.video.src = next;
    this.video.loop = this.loop;
    this.video.muted = this.muted;
    this.video.load?.();
    return true;
  }

  primeFirstFrame() {
    if (!this.video || this.primed || Number(this.video.readyState || 0) < 2) return false;
    if (!this.video.paused || Number(this.video.currentTime || 0) > 0) {
      this.primed = true;
      return false;
    }
    this.primed = true;
    this.video.currentTime = 0.25 / Math.max(1, this.fps);
    return true;
  }

  currentFrame() {
    const count = Math.max(this.durationFrames, Number(this.frameCount) || 1);
    return this.video ? frameAtMediaTime(this.video.currentTime, this.fps, count) : 0;
  }

  seekFrame(frame) {
    if (!this.video) return false;
    const count = Math.max(this.durationFrames, Number(this.frameCount) || 1);
    const bounded = Math.max(0, Math.min(count - 1, Number(frame) || 0));
    this.video.currentTime = bounded / Math.max(1, this.fps);
    return true;
  }

  scrub(frame) {
    this.seekFrame(frame);
    const count = Math.max(this.durationFrames, Number(this.frameCount) || 1);
    this.onFrame(Math.max(0, Math.min(count - 1, Number(frame) || 0)));
  }

  setLoop(enabled) {
    this.loop = Boolean(enabled);
    if (this.video) this.video.loop = this.loop;
  }

  setMuted(enabled) {
    this.muted = Boolean(enabled);
    if (this.video) this.video.muted = this.muted;
  }

  toggle() {
    if (!this.video) return false;
    if (this.video.paused) {
      const result = this.video.play?.();
      result?.catch?.(() => {});
      return true;
    }
    this.video.pause?.();
    return false;
  }

  dispose() {
    this.url = "";
    for (const dispose of this.disposers.splice(0)) dispose();
    if (this.video) {
      this.video.pause?.();
      this.video.removeAttribute?.("src");
      this.video.load?.();
    }
  }
}
