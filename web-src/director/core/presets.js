import { clamp } from "../core.js";
import { sampleCamera } from "./camera.js";

export function generateHarmonicNoise(t, seed = 0) {
  return Math.sin(t * 1.7 + seed * 3.1) * 0.5 + Math.sin(t * 3.3 + seed * 5.7) * 0.3 + Math.sin(t * 7.9 + seed * 11.3) * 0.2;
}

export function applyCameraShake(source, { type = "handheld_subtle", intensity = 1.0, duration_frames = null, subdivide = true } = {}) {
  const keyframes = Array.isArray(source) ? source : (source?.keyframes || []);
  if (!keyframes || keyframes.length === 0) return keyframes;
  const isTurbulence = type === "turbulence";
  const isHeavy = type === "handheld_heavy";
  const posScale = (isTurbulence ? 0.12 : isHeavy ? 0.18 : 0.06) * intensity;
  const rotScale = (isTurbulence ? 2.0 : isHeavy ? 2.8 : 0.9) * intensity;
  const freq = isTurbulence ? 0.45 : isHeavy ? 0.22 : 0.12;

  const lastKeyFrame = keyframes[keyframes.length - 1]?.frame ?? 119;
  const totalFrames = Math.max(lastKeyFrame + 1, Number(duration_frames || (source?.duration_frames ?? lastKeyFrame + 1)));
  const interval = isTurbulence ? 4 : isHeavy ? 6 : 8;

  const trackState = Array.isArray(source) ? { keyframes, duration_frames: totalFrames } : source;
  const framesToSample = new Set(keyframes.map((k) => k.frame));
  if (subdivide && totalFrames > interval) {
    for (let f = 0; f < totalFrames; f += interval) {
      framesToSample.add(f);
    }
    framesToSample.add(totalFrames - 1);
  }

  const sortedFrames = [...framesToSample].sort((a, b) => a - b);

  return sortedFrames.map((f) => {
    const baseCam = sampleCamera(trackState, f);
    const nx = generateHarmonicNoise(f * freq, 1) * posScale;
    const ny = generateHarmonicNoise(f * freq, 2) * posScale;
    const nz = generateHarmonicNoise(f * freq, 3) * posScale * 0.5;
    const nroll = generateHarmonicNoise(f * freq, 4) * rotScale;
    const nfov = generateHarmonicNoise(f * freq, 5) * (rotScale * 0.35);

    const pos = [...baseCam.position];
    const tgt = [...baseCam.target];
    pos[0] += nx; pos[1] += ny; pos[2] += nz;
    tgt[0] += nx * 0.35; tgt[1] += ny * 0.35;

    return {
      frame: f,
      camera: {
        ...baseCam,
        position: pos,
        target: tgt,
        roll: (baseCam.roll || 0) + nroll,
        fov: clamp((baseCam.fov || 35) + nfov, 10, 140),
      },
      interpolation: "smooth",
    };
  });
}

export function generateCameraPreset(presetName, { duration_frames = 120, target = [0, 1.5, 0], radius = 6.0, height = 3.5 } = {}) {
  const keys = [];
  const frames = Math.max(2, duration_frames);
  const [tx, ty, tz] = target;

  if (presetName === "orbit_360") {
    const steps = 5;
    for (let i = 0; i < steps; i++) {
      const f = Math.round((i / (steps - 1)) * (frames - 1));
      const angle = (i / (steps - 1)) * Math.PI * 2;
      keys.push({
        frame: f,
        camera: {
          position: [tx + Math.sin(angle) * radius, ty + height, tz + Math.cos(angle) * radius],
          target: [tx, ty, tz],
          fov: 35,
          roll: 0,
          camera_type: "perspective",
          zoom: 1,
          near: 0.01,
          far: 10000,
        },
        interpolation: "bezier",
      });
    }
  } else if (presetName === "push_in") {
    keys.push(
      {
        frame: 0,
        camera: { position: [tx, ty + height, tz + radius * 1.6], target: [tx, ty, tz], fov: 42, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 },
        interpolation: "ease",
      },
      {
        frame: frames - 1,
        camera: { position: [tx, ty + height * 0.5, tz + radius * 0.6], target: [tx, ty, tz], fov: 32, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 },
        interpolation: "ease",
      }
    );
  } else if (presetName === "pull_out") {
    keys.push(
      {
        frame: 0,
        camera: { position: [tx, ty + height * 0.4, tz + radius * 0.6], target: [tx, ty, tz], fov: 30, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 },
        interpolation: "ease",
      },
      {
        frame: frames - 1,
        camera: { position: [tx, ty + height * 1.2, tz + radius * 1.8], target: [tx, ty, tz], fov: 45, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 },
        interpolation: "ease",
      }
    );
  } else if (presetName === "dolly_zoom") {
    keys.push(
      {
        frame: 0,
        camera: { position: [tx, ty + height * 0.7, tz + radius * 1.8], target: [tx, ty, tz], fov: 24, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 },
        interpolation: "bezier",
      },
      {
        frame: frames - 1,
        camera: { position: [tx, ty + height * 0.5, tz + radius * 0.6], target: [tx, ty, tz], fov: 65, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 },
        interpolation: "bezier",
      }
    );
  }
  return keys;
}
