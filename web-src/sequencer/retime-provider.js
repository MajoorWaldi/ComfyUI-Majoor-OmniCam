/**
 * Speed curve provider and presets for the OmniCam Sequencer F-Curve editor.
 */

export const SPEED_PRESETS = [
  { id: "constant_1x", name: "1.0x Normal", keys: [{ frame: 0, value: 1.0, interpolation: "constant" }] },
  { id: "half_speed", name: "0.5x SlowMo", keys: [{ frame: 0, value: 0.5, interpolation: "constant" }] },
  { id: "double_speed", name: "2.0x Fast", keys: [{ frame: 0, value: 2.0, interpolation: "constant" }] },
  {
    id: "slow_in",
    name: "Slow In",
    keys: [
      { frame: 0, value: 0.25, interpolation: "bezier" },
      { frame: 48, value: 1.0, interpolation: "bezier" },
    ],
  },
  {
    id: "slow_out",
    name: "Slow Out",
    keys: [
      { frame: 0, value: 1.0, interpolation: "bezier" },
      { frame: 48, value: 0.25, interpolation: "bezier" },
    ],
  },
  {
    id: "ramp_up",
    name: "Ramp Up (0.5x → 2.0x)",
    keys: [
      { frame: 0, value: 0.5, interpolation: "bezier" },
      { frame: 48, value: 2.0, interpolation: "bezier" },
    ],
  },
  { id: "fit_duration", name: "Fit Duration", keys: [{ frame: 0, value: 1.0, interpolation: "constant" }] },
  {
    id: "ramp_down",
    name: "Ramp Down (2.0x → 0.5x)",
    keys: [
      { frame: 0, value: 2.0, interpolation: "bezier" },
      { frame: 48, value: 0.5, interpolation: "bezier" },
    ],
  },
];

export function applySpeedPreset(shot, presetId) {
  const preset = SPEED_PRESETS.find((p) => p.id === presetId);
  if (!preset || !shot) return;

  const duration = (shot.timeline && shot.timeline.duration_frames) || 48;
  const scaledKeys = preset.keys.map((k, idx) => ({
    frame: idx === 0 ? 0 : duration,
    value: k.value,
    interpolation: k.interpolation || "bezier",
  }));

  if (!shot.retime) {
    shot.retime = { enabled: true, mode: "absolute_speed", interpolation: "blend" };
  }
  shot.retime.enabled = true;
  shot.retime.mode = presetId === "fit_duration" ? "fit_duration" : "absolute_speed";
  shot.retime.curve = { keys: scaledKeys };
}
