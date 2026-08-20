// Playback transport, requestAnimationFrame clock, and WebAudio timeline synchronization for OmniCam Director.

export function togglePlay(ui) {
  if (ui.playing) return stopPlay(ui);
  ui.playing = true;
  for (const btn of ui.root.querySelectorAll('[data-act="play"]')) {
    btn.classList.add("playing");
    const icon = btn.querySelector("i");
    if (icon) icon.className = "pi pi-pause";
  }
  const totalDuration = ui.state.duration_frames / Math.max(1, ui.state.fps);
  const range = ui.state.playback_range;
  const rangeStart = range ? range[0] : 0;
  const rangeEnd = range ? range[1] : ui.state.duration_frames - 1;
  let target = ui.frame >= rangeEnd || ui.frame < rangeStart ? rangeStart : ui.frame;
  let rendered = null;

  if (ui.audioBuffer && (window.AudioContext || window.webkitAudioContext)) {
    try {
      ui.audioContext = ui.audioContext || new (window.AudioContext || window.webkitAudioContext)();
      if (ui.audioContext.state === "suspended") ui.audioContext.resume();
      if (ui.audioSource) {
        try { ui.audioSource.stop(); } catch (_) {}
      }
      const source = ui.audioContext.createBufferSource();
      source.buffer = ui.audioBuffer;
      source.connect(ui.audioContext.destination);
      const startOffset = Math.max(0, target / Math.max(1, ui.state.fps));
      const playDuration = Math.max(0, Math.min(totalDuration - startOffset, (rangeEnd - target) / Math.max(1, ui.state.fps)));
      if (startOffset < totalDuration && startOffset < ui.audioBuffer.duration && playDuration > 0) {
        source.start(0, startOffset, playDuration);
        ui.audioSource = source;
      }
    } catch (_) {}
  }

  const stepMs = 1000 / ui.state.fps;
  let lastTime = performance.now();
  let accumulated = 0;

  const tick = (now) => {
    if (!ui.playing) return;
    accumulated += now - lastTime;
    lastTime = now;
    while (accumulated >= stepMs) {
      accumulated -= stepMs;
      target += 1;
      if (target > rangeEnd) {
        if (!ui.state.loop_playback) return void stopPlay(ui);
        target = rangeStart;
        if (ui.audioBuffer && ui.audioContext) {
          try {
            if (ui.audioSource) {
              try { ui.audioSource.stop(); } catch (_) {}
            }
            const source = ui.audioContext.createBufferSource();
            source.buffer = ui.audioBuffer;
            source.connect(ui.audioContext.destination);
            const loopStart = rangeStart / Math.max(1, ui.state.fps);
            const loopDuration = Math.max(0, Math.min(totalDuration - loopStart, (rangeEnd - rangeStart) / Math.max(1, ui.state.fps)));
            if (loopStart < totalDuration && loopStart < ui.audioBuffer.duration && loopDuration > 0) {
              source.start(0, loopStart, loopDuration);
              ui.audioSource = source;
            }
          } catch (_) {}
        }
      }
    }
    if (target !== rendered) {
      rendered = target;
      ui.setFrame(target, true);
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
  if (ui.audioSource) {
    try { ui.audioSource.stop(); } catch (_) {}
    ui.audioSource = null;
  }
}

export function computeAudioPeaks(ui) {
  if (!ui.audioBuffer) {
    ui.audioWaveformPeaks = null;
    return;
  }
  const raw = ui.audioBuffer.getChannelData(0);
  const sampleRate = ui.audioBuffer.sampleRate;
  const durationSec = ui.state.duration_frames / Math.max(1, ui.state.fps);
  const totalSamples = Math.min(raw.length, Math.floor(durationSec * sampleRate));
  const numBuckets = Math.min(600, Math.max(100, ui.state.duration_frames * 4));
  const bucketSize = Math.max(1, Math.floor(totalSamples / numBuckets));
  const peaks = [];
  for (let b = 0; b < numBuckets; b++) {
    let max = 0;
    const start = b * bucketSize;
    const end = Math.min(totalSamples, start + bucketSize);
    for (let s = start; s < end; s++) {
      const v = Math.abs(raw[s] || 0);
      if (v > max) max = v;
    }
    peaks.push(max);
  }
  ui.audioWaveformPeaks = peaks;
  ui.refreshKeys();
}

export async function loadAudioFile(ui, file) {
  if (!file) return;
  try {
    ui.audioContext = ui.audioContext || new (window.AudioContext || window.webkitAudioContext)();
    if (ui.audioContext.state === "suspended") await ui.audioContext.resume();
    const arrayBuffer = await file.arrayBuffer();
    const decoded = await ui.audioContext.decodeAudioData(arrayBuffer);
    ui.audioBuffer = decoded;
    computeAudioPeaks(ui);
    ui.setStatus(`Audio loaded: ${file.name || "track"}`);
  } catch (err) {
    ui.setStatus(`Failed to load audio: ${err.message || err}`);
  }
}
