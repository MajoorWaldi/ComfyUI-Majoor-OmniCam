// Playback transport and timeline audio for OmniCam Director.
//
// Audio is an <audio> element, not a WebAudio graph. The Director needs two
// things from a soundtrack -- play it, and draw its waveform -- and neither
// needs an AudioContext:
//
//   playback   HTMLAudioElement            play / pause / seek by currentTime
//   waveform   mediabunny AudioSampleSink  decode PCM once, keep the peaks
//
// That also makes the element the master clock while it plays. A rAF counter
// advancing its own frame accumulator drifts against the sound card; reading
// the frame back off audio.currentTime cannot, because the audio hardware is
// the thing being followed rather than the thing being chased.

import { fileSizeError } from "./shared/upload-limits.js";

/** Frame the soundtrack is currently at, or null when it is not driving. */
function audioFrame(ui) {
  const audio = ui.audioElement;
  if (!audio || audio.paused || !Number.isFinite(audio.currentTime)) return null;
  return Math.round(audio.currentTime * Math.max(1, ui.state.fps));
}

function seekAudio(ui, frame) {
  const audio = ui.audioElement;
  if (!audio) return;
  const seconds = Math.max(0, frame / Math.max(1, ui.state.fps));
  if (seconds >= (ui.audioDuration || 0)) return;
  try { audio.currentTime = seconds; } catch (_) { /* not seekable yet */ }
}

export function togglePlay(ui) {
  if (ui.playing) return stopPlay(ui);
  ui.playing = true;
  for (const btn of ui.root.querySelectorAll('[data-act="play"]')) {
    btn.classList.add("playing");
    const icon = btn.querySelector("i");
    if (icon) icon.className = "pi pi-pause";
  }
  const range = ui.state.playback_range;
  const rangeStart = range ? range[0] : 0;
  const rangeEnd = range ? range[1] : ui.state.duration_frames - 1;
  let target = ui.frame >= rangeEnd || ui.frame < rangeStart ? rangeStart : ui.frame;
  let rendered = null;

  if (ui.audioElement) {
    seekAudio(ui, target);
    // Play is a user gesture, so autoplay policy allows this; a rejection is
    // still not worth failing playback over.
    Promise.resolve(ui.audioElement.play()).catch(() => {});
  }

  const stepMs = 1000 / ui.state.fps;
  let lastTime = performance.now();
  let accumulated = 0;

  const tick = (now) => {
    if (!ui.playing) return;
    // While the soundtrack plays it *is* the clock: the frame is read off it
    // rather than accumulated alongside it, so picture cannot drift from sound.
    const fromAudio = audioFrame(ui);
    if (fromAudio === null) {
      accumulated += now - lastTime;
      lastTime = now;
      while (accumulated >= stepMs) {
        accumulated -= stepMs;
        target += 1;
        if (target > rangeEnd) {
          if (!ui.state.loop_playback) return void stopPlay(ui);
          target = rangeStart;
        }
      }
    } else {
      lastTime = now;
      accumulated = 0;
      target = fromAudio;
      if (target > rangeEnd) {
        if (!ui.state.loop_playback) return void stopPlay(ui);
        target = rangeStart;
        seekAudio(ui, rangeStart);
      } else if (target < rangeStart) {
        target = rangeStart;
        seekAudio(ui, rangeStart);
      }
    }
    if (target !== rendered) {
      rendered = target;
      // Light frame tick: playhead, timecode, viewport, motion heads only.
      // The keyframe lane, the audio waveform canvas and the O(duration)
      // Camera Health pass are rebuilt only when the timeline structure
      // actually changes, not on every frame of playback.
      ui.setFrame(target, true, false);
    }
    ui.playTimer = requestAnimationFrame(tick);
  };
  ui.playTimer = requestAnimationFrame(tick);
}

export function stopPlay(ui) {
  ui.playing = false;
  if (ui.playTimer) cancelAnimationFrame(ui.playTimer);
  ui.playTimer = null;
  for (const btn of ui.root.querySelectorAll('[data-act="play"]')) {
    btn.classList.remove("playing");
    const icon = btn.querySelector("i");
    if (icon) icon.className = "pi pi-play";
  }
  try { ui.audioElement?.pause(); } catch (_) {}
}

/** Drop the loaded soundtrack and its waveform, revoking the blob URL. */
export function releaseAudio(ui) {
  const audio = ui.audioElement;
  if (audio) {
    try { audio.pause(); } catch (_) {}
    try { audio.removeAttribute("src"); audio.load(); } catch (_) {}
  }
  if (ui.audioObjectUrl) {
    try { URL.revokeObjectURL(ui.audioObjectUrl); } catch (_) {}
    ui.audioObjectUrl = null;
  }
  ui.audioElement = null;
  ui.audioDuration = 0;
  ui.audioSamples = null;
  ui.audioWaveformPeaks = null;
}

export function computeAudioPeaks(ui) {
  const samples = ui.audioSamples;
  if (!samples || !samples.data?.length) {
    ui.audioWaveformPeaks = null;
    return;
  }
  const { data, sampleRate } = samples;
  const durationSec = ui.state.duration_frames / Math.max(1, ui.state.fps);
  const totalSamples = Math.min(data.length, Math.floor(durationSec * sampleRate));
  const numBuckets = Math.min(600, Math.max(100, ui.state.duration_frames * 4));
  const bucketSize = Math.max(1, Math.floor(totalSamples / numBuckets));
  const peaks = [];
  for (let b = 0; b < numBuckets; b++) {
    let max = 0;
    const start = b * bucketSize;
    const end = Math.min(totalSamples, start + bucketSize);
    for (let s = start; s < end; s++) {
      const v = Math.abs(data[s] || 0);
      if (v > max) max = v;
    }
    peaks.push(max);
  }
  ui.audioWaveformPeaks = peaks;
  ui.refreshKeys();
}

/** Decode channel 0 to a flat Float32Array via mediabunny -- no AudioContext.
 *
 * mediabunny's demuxer registry is not tree-shakeable, so naming individual
 * formats costs exactly what ALL_FORMATS costs; take the robust one. A
 * container it cannot read simply yields no waveform -- the track still plays,
 * because playback is the <audio> element's job, not this function's.
 */
export async function decodeAudioPeakSamples(file, { load = () => import("mediabunny") } = {}) {
  const { ALL_FORMATS, AudioSampleSink, BlobSource, Input } = await load();
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
  const track = await input.getPrimaryAudioTrack();
  if (!track) return null;
  const chunks = [];
  let total = 0;
  let sampleRate = 0;
  for await (const sample of new AudioSampleSink(track).samples()) {
    try {
      sampleRate = sampleRate || sample.sampleRate;
      const options = { planeIndex: 0, format: "f32-planar" };
      const chunk = new Float32Array(sample.allocationSize(options) / Float32Array.BYTES_PER_ELEMENT);
      sample.copyTo(chunk, options);
      chunks.push(chunk);
      total += chunk.length;
    } finally {
      // AudioSamples hold decoder resources; an unclosed one leaks per packet.
      sample.close();
    }
  }
  if (!total || !sampleRate) return null;
  const data = new Float32Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    data.set(chunk, offset);
    offset += chunk.length;
  }
  return { data, sampleRate };
}

/** Wait for the element to know its duration, so seeks are bounded correctly. */
function whenAudioReady(audio) {
  if (Number.isFinite(audio.duration) && audio.duration > 0) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      audio.removeEventListener("loadedmetadata", done);
      audio.removeEventListener("error", done);
      resolve();
    };
    audio.addEventListener("loadedmetadata", done);
    audio.addEventListener("error", done);
  });
}

export async function loadAudioFile(ui, file, { decode = decodeAudioPeakSamples } = {}) {
  if (!file) return;
  const tooBig = fileSizeError(file, "audio");
  if (tooBig) {
    ui.setStatus(tooBig);
    return;
  }
  releaseAudio(ui);
  try {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = url;
    ui.audioObjectUrl = url;
    ui.audioElement = audio;
    await whenAudioReady(audio);
    ui.audioDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
    // The waveform is a nicety; a soundtrack that plays but cannot be drawn is
    // still a usable soundtrack, so a decode failure must not lose it.
    try {
      ui.audioSamples = await decode(file);
    } catch (_) {
      ui.audioSamples = null;
    }
    computeAudioPeaks(ui);
    ui.setStatus(`Audio loaded: ${file.name || "track"}`);
  } catch (err) {
    releaseAudio(ui);
    ui.setStatus(`Failed to load audio: ${err.message || err}`);
  }
}
