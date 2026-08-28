// Multi-channel dope sheet rows.
//
// OmniCam keyframes are whole-camera: one key carries position, target, fov and
// roll together. So a per-channel row cannot show "keys that exist for this
// channel" -- they all exist on every key. What it can honestly show is where a
// channel actually *changes*, which is the question an animator is asking when
// they scan a dope sheet: "when does the roll move?"
//
// A channel row therefore marks a key when that channel's value differs from
// the previous key (and always marks the first key, which establishes it).

const EPSILON = 1e-4;

function vectorChanged(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return a !== b;
  return a.some((value, index) => Math.abs(Number(value) - Number(b[index])) > EPSILON);
}

function numberChanged(a, b) {
  return Math.abs(Number(a) - Number(b)) > EPSILON;
}

export const DOPE_CHANNELS = [
  {
    id: "camera",
    label: "Camera",
    color: "#a78bfa",
    // The camera row is the master track: every key belongs to it.
    changed: () => true,
    read: (camera) => camera?.position,
  },
  {
    id: "look_at",
    label: "Look At",
    color: "#f0a742",
    changed: (previous, current) => vectorChanged(previous?.target, current?.target),
    read: (camera) => camera?.target,
  },
  {
    id: "focal_length",
    label: "Focal Length",
    color: "#4aa3ef",
    changed: (previous, current) => numberChanged(previous?.fov, current?.fov),
    read: (camera) => camera?.fov,
  },
  {
    id: "roll",
    label: "Roll",
    color: "#ec4899",
    changed: (previous, current) => numberChanged(previous?.roll, current?.roll),
    read: (camera) => camera?.roll,
  },
];

/**
 * For one channel, the frames that should carry a diamond.
 *
 * @param {Array<{frame:number, camera?:object}>} keys sorted camera keyframes
 * @param {object} channel one of DOPE_CHANNELS
 * @returns {number[]} frames, ascending
 */
export function channelFrames(keys, channel) {
  const sorted = [...(keys || [])].sort((a, b) => a.frame - b.frame);
  const frames = [];
  let previous = null;
  for (const key of sorted) {
    const camera = key.camera || key.transform || {};
    if (previous === null || channel.changed(previous, camera)) frames.push(key.frame);
    previous = camera;
  }
  return frames;
}

/**
 * Every channel with its frames, honouring the row visibility filter.
 *
 * @param {Array} keys sorted camera keyframes
 * @param {Set<string>|null} enabled channel ids to include; null means all
 */
export function dopeSheetRows(keys, enabled = null) {
  return DOPE_CHANNELS.filter((channel) => !enabled || enabled.has(channel.id)).map((channel) => ({
    id: channel.id,
    label: channel.label,
    color: channel.color,
    frames: channelFrames(keys, channel),
  }));
}
