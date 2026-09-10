// The Director's soundtrack is an <audio> element and a mediabunny decode, not
// a WebAudio graph. Two things follow and are asserted here:
//
//   * while the element plays it is the master clock -- the frame is READ off
//     audio.currentTime instead of being accumulated next to it, so picture
//     cannot drift away from sound;
//   * nothing in the transport constructs an AudioContext or calls .connect(),
//     which is what put OmniCam in front of a Registry networking heuristic.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  computeAudioPeaks,
  decodeAudioPeakSamples,
  loadAudioFile,
  releaseAudio,
  stopPlay,
  togglePlay,
} from "../../web-src/playback-transport.js";

function withFakeRaf(run) {
  const realPerf = globalThis.performance;
  const realRaf = globalThis.requestAnimationFrame;
  const realCaf = globalThis.cancelAnimationFrame;
  let nowValue = 0;
  let pending = null;
  globalThis.performance = { now: () => nowValue };
  globalThis.requestAnimationFrame = (cb) => { pending = cb; return 1; };
  globalThis.cancelAnimationFrame = () => { pending = null; };
  try {
    run({
      setNow: (value) => { nowValue = value; },
      pump: () => { const cb = pending; pending = null; cb?.(nowValue); },
    });
  } finally {
    globalThis.performance = realPerf;
    globalThis.requestAnimationFrame = realRaf;
    globalThis.cancelAnimationFrame = realCaf;
  }
}

function fakeAudio({ duration = 10 } = {}) {
  return {
    paused: true,
    currentTime: 0,
    duration,
    preload: "",
    src: "",
    play() { this.paused = false; return Promise.resolve(); },
    pause() { this.paused = true; },
    load() {},
    removeAttribute() {},
    addEventListener() {},
    removeEventListener() {},
  };
}

function fixture({ audio = null, fps = 24 } = {}) {
  const calls = [];
  return {
    ui: {
      playing: false,
      frame: 0,
      audioElement: audio,
      audioDuration: audio ? audio.duration : 0,
      state: { fps, duration_frames: 300, playback_range: null, loop_playback: false },
      root: { querySelectorAll: () => [] },
      setFrame(frame, fromPlayback, refreshTimeline) {
        this.frame = frame;
        calls.push({ frame, fromPlayback, refreshTimeline });
      },
      refreshKeys() {},
      setStatus() {},
    },
    calls,
  };
}

test("while the soundtrack plays, the frame is read off audio.currentTime", () => {
  withFakeRaf(({ setNow, pump }) => {
    const audio = fakeAudio();
    const { ui, calls } = fixture({ audio });

    togglePlay(ui);
    assert.equal(audio.paused, false, "play must start the element");

    // The sound card is 2.5s in. The rAF clock disagrees on purpose -- only
    // 100ms of wall time has passed -- and the audio must win.
    audio.currentTime = 2.5;
    setNow(100);
    pump();

    assert.equal(calls.at(-1).frame, 60, "2.5s at 24fps is frame 60, not the rAF count");
    assert.equal(calls.at(-1).refreshTimeline, false);

    // And it keeps following, rather than free-running from where it started.
    audio.currentTime = 5.0;
    setNow(120);
    pump();
    assert.equal(calls.at(-1).frame, 120);

    stopPlay(ui);
    assert.equal(audio.paused, true, "stop must pause the element");
  });
});

test("with no soundtrack the rAF accumulator still drives playback", () => {
  withFakeRaf(({ setNow, pump }) => {
    const { ui, calls } = fixture();
    togglePlay(ui);
    setNow(1000);
    pump();
    assert.ok(calls.length > 0, "playback without audio must still advance");
    assert.equal(calls.at(-1).fromPlayback, true);
    stopPlay(ui);
  });
});

test("a paused element does not freeze the transport at frame 0", () => {
  withFakeRaf(({ setNow, pump }) => {
    // An element that never actually starts (autoplay refused, decode error)
    // must fall back to the rAF clock rather than pinning currentTime 0.
    const audio = fakeAudio();
    audio.play = () => { audio.paused = true; return Promise.resolve(); };
    const { ui, calls } = fixture({ audio });
    togglePlay(ui);
    setNow(1000);
    pump();
    assert.ok(calls.at(-1).frame > 0, "a refused play must not stall playback");
    stopPlay(ui);
  });
});

test("looping seeks the soundtrack back to the range start", () => {
  withFakeRaf(({ setNow, pump }) => {
    const audio = fakeAudio();
    const { ui } = fixture({ audio });
    ui.state.loop_playback = true;
    ui.state.playback_range = [10, 20];

    togglePlay(ui);
    audio.currentTime = 3.0; // frame 72, past the range end
    setNow(50);
    pump();

    assert.equal(ui.frame, 10, "the playhead wraps to the range start");
    assert.ok(Math.abs(audio.currentTime - 10 / 24) < 1e-9, "and so does the audio");
    stopPlay(ui);
  });
});

test("releaseAudio pauses, revokes the blob URL and drops the waveform", () => {
  const revoked = [];
  const realUrl = globalThis.URL;
  globalThis.URL = { ...realUrl, revokeObjectURL: (u) => revoked.push(u) };
  try {
    const audio = fakeAudio();
    const ui = {
      audioElement: audio,
      audioObjectUrl: "blob:omnicam/1",
      audioSamples: { data: new Float32Array(4), sampleRate: 48000 },
      audioWaveformPeaks: [1, 2, 3],
    };
    releaseAudio(ui);

    assert.equal(audio.paused, true);
    assert.deepEqual(revoked, ["blob:omnicam/1"]);
    assert.equal(ui.audioElement, null);
    assert.equal(ui.audioObjectUrl, null);
    assert.equal(ui.audioWaveformPeaks, null);
  } finally {
    globalThis.URL = realUrl;
  }
});

test("peaks come from decoded PCM samples, never from an AudioBuffer", () => {
  const sampleRate = 100;
  const data = new Float32Array(200);
  for (let i = 0; i < 100; i++) data[i] = 0.25;
  for (let i = 100; i < 200; i++) data[i] = -0.75; // magnitude wins over sign

  const peaks = [];
  const ui = {
    state: { fps: 25, duration_frames: 50 }, // 2s at 100Hz == the whole buffer
    audioSamples: { data, sampleRate },
    refreshKeys() {},
  };
  computeAudioPeaks(ui);
  peaks.push(...ui.audioWaveformPeaks);

  assert.ok(peaks.length > 0);
  assert.ok(peaks.every((p) => p >= 0), "peaks are magnitudes");
  assert.ok(Math.max(...peaks) > 0.7, "the loud half must reach ~0.75");
});

test("computeAudioPeaks clears the waveform when there are no samples", () => {
  const ui = { state: { fps: 24, duration_frames: 10 }, audioSamples: null, refreshKeys() {} };
  computeAudioPeaks(ui);
  assert.equal(ui.audioWaveformPeaks, null);
});

test("decodeAudioPeakSamples reads channel 0 through an AudioSampleSink", async () => {
  const closed = [];
  const chunk = Float32Array.from([0.1, -0.4, 0.9]);

  class FakeSample {
    constructor(values) { this.values = values; this.sampleRate = 44100; }
    allocationSize() { return this.values.length * Float32Array.BYTES_PER_ELEMENT; }
    copyTo(destination, options) {
      assert.equal(options.planeIndex, 0, "channel 0 only");
      assert.equal(options.format, "f32-planar");
      destination.set(this.values);
    }
    close() { closed.push(true); }
  }

  const media = {
    ALL_FORMATS: ["all"],
    BlobSource: class { constructor(file) { this.file = file; } },
    Input: class {
      constructor(options) { this.options = options; }
      async getPrimaryAudioTrack() { return { id: "audio" }; }
    },
    AudioSampleSink: class {
      constructor(track) { this.track = track; }
      async *samples() { yield new FakeSample(chunk); yield new FakeSample(chunk); }
    },
  };

  const result = await decodeAudioPeakSamples({ name: "t.mp3" }, { load: async () => media });

  assert.equal(result.sampleRate, 44100);
  assert.equal(result.data.length, 6, "both packets are concatenated");
  assert.equal(closed.length, 2, "every sample is closed or the decoder leaks");
});

test("a file with no audio track decodes to null rather than throwing", async () => {
  const media = {
    ALL_FORMATS: [],
    BlobSource: class {},
    Input: class { async getPrimaryAudioTrack() { return null; } },
    AudioSampleSink: class {},
  };
  assert.equal(await decodeAudioPeakSamples({}, { load: async () => media }), null);
});

test("a soundtrack whose waveform fails to decode still loads and plays", async () => {
  const realUrl = globalThis.URL;
  const realAudio = globalThis.Audio;
  globalThis.URL = { ...realUrl, createObjectURL: () => "blob:omnicam/x", revokeObjectURL() {} };
  globalThis.Audio = function () { return fakeAudio({ duration: 12 }); };
  try {
    const statuses = [];
    const ui = {
      state: { fps: 24, duration_frames: 100 },
      refreshKeys() {},
      setStatus: (s) => statuses.push(s),
    };
    await loadAudioFile(ui, { name: "song.mp3", size: 1024 }, {
      decode: async () => { throw new Error("unsupported container"); },
    });

    assert.ok(ui.audioElement, "the element survives a waveform failure");
    assert.equal(ui.audioDuration, 12);
    assert.equal(ui.audioWaveformPeaks, null);
    assert.match(statuses.at(-1), /Audio loaded/);
  } finally {
    globalThis.URL = realUrl;
    globalThis.Audio = realAudio;
  }
});

test("the transport source contains no WebAudio API surface at all", () => {
  const source = readFileSync(
    new URL("../../web-src/playback-transport.js", import.meta.url), "utf8",
  );
  // Comments explain the absence, so only look at what actually runs.
  const code = source.replace(/^\s*(\/\/|\*|\/\*).*$/gm, "");
  for (const banned of ["new AudioContext", "webkitAudioContext", "createBufferSource",
                        "decodeAudioData", ".connect("]) {
    assert.ok(!code.includes(banned), `${banned} must not come back`);
  }
});
