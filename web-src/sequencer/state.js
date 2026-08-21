/**
 * OmniCam Sequencer state management and editorial operations (trim, split, ripple, reorder).
 */

export function createDefaultState(fps = 24) {
  return {
    schema_version: 2,
    timeline: {
      fps_num: fps,
      fps_den: 1,
      playhead_frame: 0,
      zoom: 1.0,
      scroll_x: 0,
      ripple: true,
    },
    selected_clip_id: null,
    shot_order: [],
    shots: {},
    audio_tracks: {},
  };
}

export function generateStableId(prefix = "shot") {
  return `${prefix}_${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 11)}`;
}

export function sampleSpeedAt(curve, frame) {
  const keys = (curve && curve.keys) || [{ frame: 0, value: 1.0 }];
  if (keys.length === 0) return 1.0;
  if (keys.length === 1) return Math.max(0.01, keys[0].value);
  if (frame <= keys[0].frame) return Math.max(0.01, keys[0].value);
  if (frame >= keys[keys.length - 1].frame) return Math.max(0.01, keys[keys.length - 1].value);

  for (let i = 0; i < keys.length - 1; i++) {
    const k0 = keys[i];
    const k1 = keys[i + 1];
    if (frame >= k0.frame && frame <= k1.frame) {
      const span = k1.frame - k0.frame;
      if (span <= 1e-6) return k1.value;
      const alpha = (frame - k0.frame) / span;
      if (k0.interpolation === "constant") return k0.value;
      if (k0.interpolation === "linear") return k0.value + alpha * (k1.value - k0.value);
      // Cubic Bézier approximation
      const y0 = k0.value;
      const y3 = k1.value;
      const y1 = y0 + (y3 - y0) / 3.0;
      const y2 = y3 - (y3 - y0) / 3.0;
      const u = 1.0 - alpha;
      return u * u * u * y0 + 3.0 * u * u * alpha * y1 + 3.0 * u * alpha * alpha * y2 + alpha * alpha * alpha * y3;
    }
  }
  return Math.max(0.01, keys[keys.length - 1].value);
}

function integrateSpeed(curve, start, end, subdivisions = 4) {
  const steps = Math.max(1, Math.round((end - start) * subdivisions));
  const dt = (end - start) / steps;
  let total = 0;
  for (let index = 0; index < steps; index++) {
    const left = start + index * dt;
    total += 0.5 * (sampleSpeedAt(curve, left) + sampleSpeedAt(curve, left + dt)) * dt;
  }
  return total;
}

export function recalculateTimeline(state) {
  let cursor = 0;
  const fps = state.timeline.fps_num / (state.timeline.fps_den || 1);

  for (const shotId of state.shot_order) {
    const shot = state.shots[shotId];
    if (!shot || !shot.enabled) continue;

    const inF = shot.trim ? shot.trim.in_frame : 0;
    const outF = shot.trim ? shot.trim.out_frame : (shot.source.duration_frames - 1);
    const trimmedDur = Math.max(1, outF - inF + 1);

    let durFrames = trimmedDur;
    if (shot.retime && shot.retime.enabled) {
      if (shot.retime.mode === "fit_duration") {
        durFrames = Math.max(1, Number(shot.timeline?.duration_frames) || trimmedDur);
      } else {
        const sourceFps = (shot.source?.fps_num || state.timeline.fps_num || 24) / (shot.source?.fps_den || 1);
        const speedScale = sourceFps / fps;
        let integral = 0;
        let outFCount = 0;
        while (integral < trimmedDur && outFCount < Math.max(10000, trimmedDur * 50)) {
          integral += Math.max(1e-4, integrateSpeed(shot.retime.curve, outFCount, outFCount + 1) * speedScale);
          outFCount++;
        }
        durFrames = Math.max(1, outFCount);
      }
    } else {
      const sourceFps = (shot.source?.fps_num || state.timeline.fps_num || 24) / (shot.source?.fps_den || 1);
      durFrames = Math.max(1, Math.round(trimmedDur * fps / sourceFps));
    }

    const startFrame = state.timeline.ripple === false
      ? Math.max(0, Number(shot.timeline?.start_frame) || 0)
      : cursor;
    shot.timeline = {
      start_frame: startFrame,
      duration_frames: durFrames,
      end_frame: startFrame + durFrames - 1,
      start_seconds: startFrame / fps,
      duration_seconds: durFrames / fps,
      end_seconds: (startFrame + durFrames) / fps,
    };
    cursor = Math.max(cursor, startFrame + durFrames);
  }
  return cursor;
}

export function splitShotAt(state, shotId, timelineSplitFrame) {
  const shot = state.shots[shotId];
  if (!shot) return null;

  const tl = shot.timeline;
  if (timelineSplitFrame <= tl.start_frame || timelineSplitFrame >= tl.end_frame) {
    return null;
  }

  const offsetTimeline = timelineSplitFrame - tl.start_frame;
  const inF = shot.trim.in_frame;
  const outF = shot.trim.out_frame;
  const trimmedDur = Math.max(1, outF - inF + 1);

  // Compute source split frame
  let sourceSplitOffset = 0;
  if (shot.retime && shot.retime.enabled) {
    let integral = 0;
    for (let f = 0; f < offsetTimeline; f++) {
      integral += Math.max(1e-4, sampleSpeedAt(shot.retime.curve, f));
    }
    sourceSplitOffset = Math.min(trimmedDur - 1, Math.round(integral));
  } else {
    sourceSplitOffset = offsetTimeline;
  }

  const sourceSplitAbs = inF + sourceSplitOffset;

  // Shot A (left)
  let idA = `${shotId}_a`;
  let idB = `${shotId}_b`;
  if (state.shots[idA] || state.shots[idB]) {
    idA = generateStableId("shot");
    idB = generateStableId("shot");
  }

  const shotA = JSON.parse(JSON.stringify(shot));
  shotA.id = idA;
  shotA.name = `${shot.name} A`;
  shotA.trim.out_frame = Math.max(inF, sourceSplitAbs - 1);

  // Shot B (right)
  const shotB = JSON.parse(JSON.stringify(shot));
  shotB.id = idB;
  shotB.name = `${shot.name} B`;
  shotB.trim.in_frame = sourceSplitAbs;

  // Split curve if retimed
  if (shot.retime && shot.retime.enabled && shot.retime.curve) {
    const keys = shot.retime.curve.keys || [];
    const keysA = [];
    const keysB = [];
    const splitSpd = sampleSpeedAt(shot.retime.curve, offsetTimeline);

    for (const k of keys) {
      if (k.frame < offsetTimeline) {
        keysA.push(JSON.parse(JSON.stringify(k)));
      } else if (k.frame > offsetTimeline) {
        const kb = JSON.parse(JSON.stringify(k));
        kb.frame -= offsetTimeline;
        keysB.push(kb);
      }
    }
    keysA.push({ frame: offsetTimeline, value: splitSpd, interpolation: "bezier" });
    keysB.unshift({ frame: 0, value: splitSpd, interpolation: "bezier" });

    shotA.retime.curve = { keys: keysA };
    shotB.retime.curve = { keys: keysB };
  }

  // Replace shot in state
  delete state.shots[shotId];
  state.shots[idA] = shotA;
  state.shots[idB] = shotB;

  for (const [audioId, audio] of Object.entries(state.audio_tracks || {})) {
    if (audio.linked_shot_id !== shotId || audio.split_linked_audio === false) continue;
    const audioA = JSON.parse(JSON.stringify(audio));
    const audioB = JSON.parse(JSON.stringify(audio));
    const idAudioA = generateStableId("audio");
    const idAudioB = generateStableId("audio");
    const splitSeconds = offsetTimeline * (state.timeline.fps_den || 1) / (state.timeline.fps_num || 24);
    const trimIn = Number(audio.trim?.in_seconds) || 0;
    audioA.id = idAudioA;
    audioA.name = `${audio.name} A`;
    audioA.linked_shot_id = idA;
    audioA.trim.out_seconds = trimIn + splitSeconds;
    audioB.id = idAudioB;
    audioB.name = `${audio.name} B`;
    audioB.linked_shot_id = idB;
    audioB.trim.in_seconds = trimIn + splitSeconds;
    audioB.timeline = { start_frame: timelineSplitFrame };
    delete state.audio_tracks[audioId];
    state.audio_tracks[idAudioA] = audioA;
    state.audio_tracks[idAudioB] = audioB;
  }

  const idx = state.shot_order.indexOf(shotId);
  if (idx >= 0) {
    state.shot_order.splice(idx, 1, idA, idB);
  } else {
    state.shot_order.push(idA, idB);
  }

  recalculateTimeline(state);
  state.selected_clip_id = idB;
  return { idA, idB };
}
