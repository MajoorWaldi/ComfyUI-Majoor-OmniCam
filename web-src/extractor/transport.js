// Director-style transport bindings for the read-only Extractor timeline.
//
// This module never owns a frame. It translates transport controls into the
// FrameCoordinator's single clock, so media, the track viewer and diagnostics
// continue to move together.

import { channelKeys } from "./track-timeline.js";

const ACTIONS = [
  "first-frame", "previous-key", "previous-frame", "play",
  "next-frame", "next-key", "last-frame", "toggle-loop",
];
const ACTION_SELECTORS = {
  "first-frame": '[data-act="first-frame"]',
  "previous-key": '[data-act="previous-key"]',
  "previous-frame": '[data-act="previous-frame"]',
  play: '[data-act="play"]',
  "next-frame": '[data-act="next-frame"]',
  "next-key": '[data-act="next-key"]',
  "last-frame": '[data-act="last-frame"]',
  "toggle-loop": '[data-act="toggle-loop"]',
};

function validFrames(items) {
  return [...new Set((items || [])
    .map((item) => Number(typeof item === "object" ? item?.frame : item))
    .filter(Number.isFinite)
    .map((frame) => Math.max(0, Math.round(frame))))]
    .sort((left, right) => left - right);
}

function keyFrames(state, track) {
  const anomalies = validFrames(state?.anomalies);
  // Navigate the same frames that the three visible lanes draw. Solvers may
  // emit redundant poses; a navigation stop with no diamond is misleading.
  const visible = validFrames(Object.values(channelKeys(track)).flat());
  const solved = visible.length ? visible : validFrames(track?.keyframes);
  return { anomalies, solved };
}

function adjacentFrame(current, direction, { anomalies, solved }) {
  const after = direction > 0
    ? (frame) => frame > current
    : (frame) => frame < current;
  const nearest = (frames) => {
    const candidates = frames.filter(after);
    return direction > 0 ? candidates[0] : candidates.at(-1);
  };
  return nearest(anomalies) ?? nearest(solved) ?? null;
}

function editableTarget(target) {
  const tag = String(target?.tagName || "").toLowerCase();
  if (target?.isContentEditable || tag === "textarea" || tag === "select") return true;
  return tag === "input" && ["text", "number"].includes(String(target.type || "text").toLowerCase());
}

function frameCount(state) {
  return Math.max(0, Math.round(Number(state?.frameCount) || 0));
}

/** Bind the Extractor's transport surface without duplicating frame state. */
export function bindExtractorTransport(root, {
  coordinator,
  getState = () => ({}),
  getTrack = () => null,
  listen = (target, name, handler) => target?.addEventListener?.(name, handler),
} = {}) {
  const button = (action) => root?.querySelector?.(ACTION_SELECTORS[action]) || null;
  const state = () => getState() || {};
  const keys = () => keyFrames(state(), getTrack());
  const seek = (frame) => {
    if (frameCount(state()) < 1) return false;
    coordinator?.seek?.(frame, "transport");
    return true;
  };
  const moveKey = (direction) => {
    const target = adjacentFrame(Number(state().frame) || 0, direction, keys());
    return target === null ? false : seek(target);
  };
  const actions = {
    "first-frame": () => seek(0),
    "previous-key": () => moveKey(-1),
    "previous-frame": () => seek((Number(state().frame) || 0) - 1),
    play: () => frameCount(state()) > 0 && Boolean(coordinator?.toggle?.()),
    "next-frame": () => seek((Number(state().frame) || 0) + 1),
    "next-key": () => moveKey(1),
    "last-frame": () => seek(frameCount(state()) - 1),
    "toggle-loop": () => {
      coordinator?.setLoop?.(!coordinator?.loop);
      render();
      return true;
    },
  };

  for (const action of ACTIONS) {
    const element = button(action);
    if (element) listen(element, "click", () => actions[action]());
  }

  listen(root, "keydown", (event) => {
    if (editableTarget(event.target)) return;
    const action = {
      " ": "play", Spacebar: "play", Space: "play",
      ArrowLeft: "previous-frame", ArrowRight: "next-frame",
      Home: "first-frame", End: "last-frame",
    }[event.key];
    if (!action || !actions[action]()) return;
    event.preventDefault();
    event.stopPropagation();
  });

  function render() {
    const current = Number(state().frame) || 0;
    const frames = keys();
    const previous = button("previous-key");
    if (previous) previous.disabled = adjacentFrame(current, -1, frames) === null;
    const next = button("next-key");
    if (next) next.disabled = adjacentFrame(current, 1, frames) === null;
    const loop = button("toggle-loop");
    if (loop) loop.setAttribute("aria-pressed", String(Boolean(coordinator?.loop)));
    const play = button("play");
    if (play) {
      play.classList?.toggle?.("playing", Boolean(coordinator?.playing));
      const icon = play.querySelector?.("i");
      if (icon) icon.className = coordinator?.playing ? "pi pi-pause" : "pi pi-play";
      play.setAttribute("aria-label", coordinator?.playing ? "Pause playback" : "Play playback");
    }
  }

  return { render };
}
