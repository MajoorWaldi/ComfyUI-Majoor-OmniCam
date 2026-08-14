import { api as n } from "../../scripts/api.js";
import { supportsDeterministicEncoding as c, encodeDeterministicPlayblast as l } from "./omnicam-webgl.js";
import { captureRealtimePlayblast as i, uploadPlayblast as d, waitForSeekingMedia as m } from "./omnicam-playblast.js";
import { t as r } from "./omnicam-i18n.js";
async function f(a) {
  await m(a.cardMediaById.values());
}
async function p(a) {
  return i({
    canvas: a.canvas,
    fps: a.state.fps,
    frameCount: a.state.duration_frames,
    renderFrame: (t) => a.setFrame(t, !0)
  });
}
async function y(a, t) {
  const e = await d(n, t);
  a.recordingWidget && (a.recordingWidget.value = e.path), a.serialize(), a.setStatus(r(`Playblast ready: ${e.name}`));
}
async function P(a) {
  if (a.recording) return;
  a.stopPlay(), a.recording = !0, a.root.classList.add("recording"), a.setStatus(r("Encoding deterministic proxy…"));
  const t = a.frame;
  try {
    let e = null;
    a.root.querySelector('[data-role="encoder"]').value !== "realtime" && await c(a.canvas.width, a.canvas.height) && (e = await l(a.canvas, a.state.duration_frames, a.state.fps, async (s) => {
      a.setFrame(s, !0), a.setStatus(r(`Encoding frame ${s + 1}/${a.state.duration_frames}…`)), await f(a), await new Promise((o) => requestAnimationFrame(o));
    })), e || (a.setStatus(r("WebCodecs unavailable; recording realtime fallback…")), e = await p(a)), a.setFrame(t), await y(a, e);
  } catch (e) {
    console.error(e), a.setStatus(r(`Playblast failed: ${e.message || e}`));
  } finally {
    a.recording = !1, a.root.classList.remove("recording"), a.setFrame(t);
  }
}
export {
  p as captureRealtime,
  P as makePlayblast,
  y as uploadDirectorPlayblast,
  f as waitForMediaFrame
};
