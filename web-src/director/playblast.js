const MIME_TYPES = ["video/mp4;codecs=avc1.42E01E", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];

export async function captureRealtimePlayblast({ canvas, fps, frameCount, renderFrame, mediaRecorder = globalThis.MediaRecorder, signal }) {
  if (!mediaRecorder || !canvas.captureStream) throw new Error("MediaRecorder unsupported in this browser");
  const stream = canvas.captureStream(fps); let recorder;
  try {
    for (const mimeType of MIME_TYPES) { if (mediaRecorder.isTypeSupported && !mediaRecorder.isTypeSupported(mimeType)) continue; try { recorder = new mediaRecorder(stream, { mimeType, videoBitsPerSecond: 6_000_000 }); break; } catch (_) {} }
    if (!recorder) throw new Error("Cannot create MediaRecorder");
    const chunks = []; recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    const finished = new Promise((resolve, reject) => { recorder.addEventListener("stop", resolve, { once: true }); recorder.addEventListener("error", () => reject(recorder.error || new Error("MediaRecorder failed")), { once: true }); });
    recorder.start(100);
    for (let frame = 0; frame < frameCount; frame++) { if (signal?.aborted) throw new DOMException("Playblast cancelled", "AbortError"); await renderFrame(frame); await new Promise((resolve) => setTimeout(resolve, 1000 / fps)); }
    recorder.stop(); await finished; return new Blob(chunks, { type: recorder.mimeType || "video/webm" });
  } finally { if (recorder?.state === "recording") recorder.stop(); stream.getTracks().forEach((track) => track.stop()); }
}

export async function uploadPlayblast(api, blob) {
  const extension = blob.type.startsWith("video/mp4") ? "mp4" : "webm"; const body = new FormData(); body.append("video", blob, `omnicam_playblast.${extension}`);
  const response = await api.fetchApi("/majoor/omnicam/upload_playblast", { method: "POST", body }); if (!response.ok) throw new Error(await response.text()); return response.json();
}

export async function waitForSeekingMedia(mediaItems) {
  await Promise.all([...mediaItems].filter((media) => media instanceof HTMLVideoElement && media.seeking).map((media) => new Promise((resolve) => { media.addEventListener("seeked", resolve, { once: true }); media.addEventListener("error", resolve, { once: true }); })));
}
