function d(h, t, e = Number.POSITIVE_INFINITY) {
  const i = Math.max(0, Number(e || 1) - 1);
  return Math.max(0, Math.min(i, Math.round(Number(h || 0) * Math.max(1, Number(t || 24)))));
}
class m {
  constructor(t, {
    fps: e = 24,
    durationFrames: i = 1,
    onFrame: o = () => {
    },
    onMetadata: s = () => {
    },
    onError: r = () => {
    },
    errorMessage: a = () => "The video could not be played.",
    loop: u = !0,
    muted: n = !0
  } = {}) {
    this.video = t, this.fps = Number(e) || 24, this.durationFrames = Math.max(1, Number(i) || 1), this.frameCount = this.durationFrames, this.onFrame = o, this.onMetadata = s, this.onError = r, this.errorMessage = a, this.loop = !!u, this.muted = !!n, this.url = "", this.error = "", this.primed = !1, this.disposers = [], this._bind();
  }
  _bind() {
    if (!this.video) return;
    const t = (e, i) => {
      this.video.addEventListener(e, i), this.disposers.push(() => this.video?.removeEventListener(e, i));
    };
    t("timeupdate", () => this.onFrame(this.currentFrame())), t("loadedmetadata", () => {
      const e = Math.round((Number(this.video.duration) || 0) * this.fps);
      this.frameCount = Math.max(this.frameCount, e), this.durationFrames = this.frameCount, this.onMetadata({ frameCount: this.frameCount, fps: this.fps, duration: this.video.duration }), this.onFrame(this.currentFrame()), this.primeFirstFrame();
    }), t("loadeddata", () => {
      this.error = "", this.primeFirstFrame(), this.onFrame(this.currentFrame());
    }), t("error", () => {
      this.error = String(this.errorMessage(this.video?.error, this.url)), this.onError(this.error);
    });
  }
  setSource(t, { fps: e, frameCount: i, durationFrames: o } = {}) {
    Number(e) > 0 && (this.fps = Number(e));
    const s = Number(i ?? o);
    if (Number.isFinite(s) && s > 0 && (this.frameCount = s, this.durationFrames = s), !this.video) return !1;
    const r = String(t || "");
    return r === this.url && (!r || !this.error) ? !1 : (this.url = r, this.error = "", this.primed = !1, this.video.pause?.(), r ? this.video.src = r : this.video.removeAttribute?.("src"), this.video.loop = this.loop, this.video.muted = this.muted, this.video.load?.(), !0);
  }
  primeFirstFrame() {
    return !this.video || this.primed || Number(this.video.readyState || 0) < 2 ? !1 : !this.video.paused || Number(this.video.currentTime || 0) > 0 ? (this.primed = !0, !1) : (this.primed = !0, this.video.currentTime = 0.25 / Math.max(1, this.fps), !0);
  }
  currentFrame() {
    const t = Math.max(this.durationFrames, Number(this.frameCount) || 1);
    return this.video ? d(this.video.currentTime, this.fps, t) : 0;
  }
  seekFrame(t) {
    if (!this.video) return !1;
    const e = Math.max(this.durationFrames, Number(this.frameCount) || 1), i = Math.max(0, Math.min(e - 1, Number(t) || 0));
    return this.video.currentTime = i / Math.max(1, this.fps), !0;
  }
  scrub(t) {
    this.seekFrame(t);
    const e = Math.max(this.durationFrames, Number(this.frameCount) || 1);
    this.onFrame(Math.max(0, Math.min(e - 1, Number(t) || 0)));
  }
  setLoop(t) {
    this.loop = !!t, this.video && (this.video.loop = this.loop);
  }
  setMuted(t) {
    this.muted = !!t, this.video && (this.video.muted = this.muted);
  }
  toggle() {
    return this.video ? this.video.paused ? (this.video.play?.()?.catch?.(() => {
    }), !0) : (this.video.pause?.(), !1) : !1;
  }
  dispose() {
    this.url = "";
    for (const t of this.disposers.splice(0)) t();
    this.video && (this.video.pause?.(), this.video.removeAttribute?.("src"), this.video.load?.());
  }
}
export {
  m as M
};
