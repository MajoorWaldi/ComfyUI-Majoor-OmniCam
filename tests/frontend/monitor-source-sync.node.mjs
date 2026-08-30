import test from "node:test";
import assert from "node:assert/strict";
import { TrackSourceWatcher, readTrackSource } from "../../web-src/monitor/source-sync.js";

function graphFixture() {
  const director = {
    id: 7, comfyClass: "MajoorOmniCamDirector",
    widgets: [
      { name: "state_json", value: JSON.stringify({ fps: 24, duration_frames: 12, width: 640, height: 360, keyframes: [{ frame: 0, camera: {} }] }) },
      { name: "recording_path", value: "omnicam/playblasts/shot.webm [input]" },
    ],
  };
  const proxy = { id: 8, comfyClass: "LoadVideo", widgets: [], imgs: [] };
  const monitor = {
    inputs: [{ name: "camera_track", link: 9 }, { name: "proxy_video", link: null }],
    graph: {
      links: { 9: { origin_id: 7 }, 11: { origin_id: 8 } },
      getNodeById: (id) => (id === 7 ? director : id === 8 ? proxy : null),
    },
  };
  return { monitor, director, proxy };
}

test("connected Director state and managed proxy are read without executing the graph", () => {
  const { monitor } = graphFixture();
  const source = readTrackSource(monitor);
  assert.equal(source.connected, true);
  assert.equal(source.resolved, true);
  assert.equal(source.track.duration_frames, 12);
  assert.equal(source.recordingPath, "omnicam/playblasts/shot.webm [input]");
});

test("any producer on camera_track is connected, not offline", () => {
  // The backend accepts any MAJOOR_OMNICAM_TRACK. A frontend that only
  // recognised MajoorOmniCamDirector showed OFFLINE on graphs -- Extractor to
  // Monitor, for one -- that execute perfectly well.
  const { monitor, director } = graphFixture();
  director.comfyClass = "MajoorOmniCamExtractor";
  director.widgets = [];
  const source = readTrackSource(monitor);
  assert.equal(source.connected, true);
  assert.equal(source.resolved, false, "no authored track to preview before execution");
  assert.equal(source.nodeClass, "MajoorOmniCamExtractor");
});

test("an empty camera_track socket is the only offline state", () => {
  const { monitor } = graphFixture();
  monitor.inputs[0].link = null;
  assert.equal(readTrackSource(monitor).connected, false);
});

test("proxy availability follows the proxy_video socket, not recording_path", () => {
  // recording_path is the Director's playblast. A VIDEO node wired straight
  // into proxy_video is a valid proxy and used to report "no proxy".
  const { monitor, director } = graphFixture();
  director.widgets.find((item) => item.name === "recording_path").value = "";
  assert.equal(readTrackSource(monitor).proxy.available, false);
  monitor.inputs[1].link = 11;
  const source = readTrackSource(monitor);
  assert.equal(source.proxy.available, true);
  assert.equal(source.proxy.source, "LoadVideo");
});

test("unchanged Director widgets do not reparse or re-emit the full track", () => {
  const { monitor, director } = graphFixture();
  const seen = [];
  const watcher = new TrackSourceWatcher(monitor, (source) => seen.push(source), 60_000);
  watcher.poll();
  watcher.poll();
  assert.equal(seen.length, 1);

  director.widgets.find((item) => item.name === "recording_path").value = "other.webm [temp]";
  watcher.poll();
  assert.equal(seen.length, 2);
  assert.equal(seen[1].recordingPath, "other.webm [temp]");
  watcher.dispose();
});
