import test from "node:test";
import assert from "node:assert/strict";
import { DirectorSourceWatcher, readDirectorSource } from "../../web-src/monitor/source-sync.js";

function graphFixture() {
  const director = {
    id: 7, comfyClass: "MajoorOmniCamDirector",
    widgets: [
      { name: "state_json", value: JSON.stringify({ fps: 24, duration_frames: 12, width: 640, height: 360, keyframes: [{ frame: 0, camera: {} }] }) },
      { name: "recording_path", value: "omnicam/playblasts/shot.webm [input]" },
    ],
  };
  const monitor = { inputs: [{ name: "camera_track", link: 9 }], graph: { links: { 9: { origin_id: 7 } }, getNodeById: id => id === 7 ? director : null } };
  return { monitor, director };
}

test("connected Director state and managed proxy are read without executing the graph", () => {
  const { monitor } = graphFixture();
  const source = readDirectorSource(monitor);
  assert.equal(source.connected, true);
  assert.equal(source.track.duration_frames, 12);
  assert.equal(source.recordingPath, "omnicam/playblasts/shot.webm [input]");
});

test("foreign or disconnected upstream nodes remain offline", () => {
  const { monitor, director } = graphFixture();
  director.comfyClass = "ForeignNode";
  assert.equal(readDirectorSource(monitor).connected, false);
  monitor.inputs[0].link = null;
  assert.equal(readDirectorSource(monitor).connected, false);
});

test("unchanged Director widgets do not reparse or re-emit the full track", () => {
  const { monitor, director } = graphFixture();
  const seen = [];
  const watcher = new DirectorSourceWatcher(monitor, (source) => seen.push(source), 60_000);
  watcher.poll();
  watcher.poll();
  assert.equal(seen.length, 1);

  director.widgets.find((item) => item.name === "recording_path").value = "other.webm [temp]";
  watcher.poll();
  assert.equal(seen.length, 2);
  assert.equal(seen[1].recordingPath, "other.webm [temp]");
  watcher.dispose();
});
