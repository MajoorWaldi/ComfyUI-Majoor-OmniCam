const l = ["video/mp4;codecs=avc1.42E01E", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
async function m({ canvas: a, fps: e, frameCount: n, renderFrame: i, mediaRecorder: r = globalThis.MediaRecorder, signal: p }) {
  if (!r || !a.captureStream) throw new Error("MediaRecorder unsupported in this browser");
  const d = a.captureStream(e);
  let t;
  try {
    for (const o of l)
      if (!(r.isTypeSupported && !r.isTypeSupported(o)))
        try {
          t = new r(d, { mimeType: o, videoBitsPerSecond: 6e6 });
          break;
        } catch {
        }
    if (!t) throw new Error("Cannot create MediaRecorder");
    const s = [];
    t.ondataavailable = (o) => {
      o.data.size && s.push(o.data);
    };
    const w = new Promise((o, c) => {
      t.addEventListener("stop", o, { once: !0 }), t.addEventListener("error", () => c(t.error || new Error("MediaRecorder failed")), { once: !0 });
    });
    t.start(100);
    for (let o = 0; o < n; o++) {
      if (p?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await i(o), await new Promise((c) => setTimeout(c, 1e3 / e));
    }
    return t.stop(), await w, new Blob(s, { type: t.mimeType || "video/webm" });
  } finally {
    t?.state === "recording" && t.stop(), d.getTracks().forEach((s) => s.stop());
  }
}
async function u(a, e) {
  const n = e.type.startsWith("video/mp4") ? "mp4" : "webm", i = new FormData();
  i.append("video", e, `omnicam_playblast.${n}`);
  const r = await a.fetchApi("/majoor/omnicam/upload_playblast", { method: "POST", body: i });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function f(a) {
  await Promise.all([...a].filter((e) => e instanceof HTMLVideoElement && e.seeking).map((e) => new Promise((n) => {
    e.addEventListener("seeked", n, { once: !0 }), e.addEventListener("error", n, { once: !0 });
  })));
}
export {
  m as captureRealtimePlayblast,
  u as uploadPlayblast,
  f as waitForSeekingMedia
};
