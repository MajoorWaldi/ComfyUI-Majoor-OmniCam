function w(t) {
  if (t.playing) return x(t);
  t.playing = !0;
  for (const n of t.root.querySelectorAll('[data-act="play"]')) {
    n.classList.add("playing");
    const a = n.querySelector("i");
    a && (a.className = "pi pi-pause");
  }
  const e = t.state.duration_frames / Math.max(1, t.state.fps), o = t.state.playback_range, c = o ? o[0] : 0, d = o ? o[1] : t.state.duration_frames - 1;
  let r = t.frame >= d || t.frame < c ? c : t.frame, l = null;
  if (t.audioBuffer && (window.AudioContext || window.webkitAudioContext))
    try {
      if (t.audioContext = t.audioContext || new (window.AudioContext || window.webkitAudioContext)(), t.audioContext.state === "suspended" && t.audioContext.resume(), t.audioSource)
        try {
          t.audioSource.stop();
        } catch {
        }
      const n = t.audioContext.createBufferSource();
      n.buffer = t.audioBuffer, n.connect(t.audioContext.destination);
      const a = Math.max(0, r / Math.max(1, t.state.fps)), s = Math.max(0, Math.min(e - a, (d - r) / Math.max(1, t.state.fps)));
      a < e && a < t.audioBuffer.duration && s > 0 && (n.start(0, a, s), t.audioSource = n);
    } catch {
    }
  const u = 1e3 / t.state.fps;
  let i = performance.now(), f = 0;
  const m = (n) => {
    if (t.playing) {
      for (f += n - i, i = n; f >= u; )
        if (f -= u, r += 1, r > d) {
          if (!t.state.loop_playback) return void x(t);
          if (r = c, t.audioBuffer && t.audioContext)
            try {
              if (t.audioSource)
                try {
                  t.audioSource.stop();
                } catch {
                }
              const a = t.audioContext.createBufferSource();
              a.buffer = t.audioBuffer, a.connect(t.audioContext.destination);
              const s = c / Math.max(1, t.state.fps), p = Math.max(0, Math.min(e - s, (d - c) / Math.max(1, t.state.fps)));
              s < e && s < t.audioBuffer.duration && p > 0 && (a.start(0, s, p), t.audioSource = a);
            } catch {
            }
        }
      r !== l && (l = r, t.setFrame(r, !0)), t.playTimer = requestAnimationFrame(m);
    }
  };
  t.playTimer = requestAnimationFrame(m);
}
function x(t) {
  t.playing = !1, t.playTimer && cancelAnimationFrame(t.playTimer), t.playTimer = null;
  for (const e of t.root.querySelectorAll('[data-act="play"]')) {
    e.classList.remove("playing");
    const o = e.querySelector("i");
    o && (o.className = "pi pi-play");
  }
  if (t.audioSource) {
    try {
      t.audioSource.stop();
    } catch {
    }
    t.audioSource = null;
  }
}
function y(t) {
  if (!t.audioBuffer) {
    t.audioWaveformPeaks = null;
    return;
  }
  const e = t.audioBuffer.getChannelData(0), o = t.audioBuffer.sampleRate, c = t.state.duration_frames / Math.max(1, t.state.fps), d = Math.min(e.length, Math.floor(c * o)), r = Math.min(600, Math.max(100, t.state.duration_frames * 4)), l = Math.max(1, Math.floor(d / r)), u = [];
  for (let i = 0; i < r; i++) {
    let f = 0;
    const m = i * l, n = Math.min(d, m + l);
    for (let a = m; a < n; a++) {
      const s = Math.abs(e[a] || 0);
      s > f && (f = s);
    }
    u.push(f);
  }
  t.audioWaveformPeaks = u, t.refreshKeys();
}
async function S(t, e) {
  if (e)
    try {
      t.audioContext = t.audioContext || new (window.AudioContext || window.webkitAudioContext)(), t.audioContext.state === "suspended" && await t.audioContext.resume();
      const o = await e.arrayBuffer(), c = await t.audioContext.decodeAudioData(o);
      t.audioBuffer = c, y(t), t.setStatus(`Audio loaded: ${e.name || "track"}`);
    } catch (o) {
      t.setStatus(`Failed to load audio: ${o.message || o}`);
    }
}
export {
  y as computeAudioPeaks,
  S as loadAudioFile,
  x as stopPlay,
  w as togglePlay
};
