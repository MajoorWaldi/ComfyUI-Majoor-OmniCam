import test from "node:test";
import assert from "node:assert/strict";
import { MonitorSourceWatcher, readMonitorSource } from "../../web-src/monitor/source-sync.js";

function graphFixture() {
  const director = { id: 7, comfyClass: "MajoorOmniCamDirector", widgets: [] };
  const video = { id: 8, comfyClass: "LoadVideo", widgets: [], imgs: [] };
  const monitor = {
    inputs: [
      { name: "motion_scene", link: 9 },
      { name: "playblast_video", link: null },
    ],
    graph: {
      links: { 9: { origin_id: 7 }, 11: { origin_id: 8 } },
      getNodeById: (id) => (id === 7 ? director : id === 8 ? video : null),
    },
  };
  return { monitor, director, video };
}

test("Monitor source follows the MotionScene socket", () => {
  const { monitor } = graphFixture();
  const source = readMonitorSource(monitor);
  assert.equal(source.sceneConnected, true);
  assert.equal(source.sceneNodeClass, "MajoorOmniCamDirector");
  assert.equal(source.playblastConnected, false);
});

test("Monitor playblast availability follows playblast_video", () => {
  const { monitor } = graphFixture();
  monitor.inputs[1].link = 11;
  const source = readMonitorSource(monitor);
  assert.equal(source.playblastConnected, true);
  assert.equal(source.playblastNodeClass, "LoadVideo");
});

test("Monitor source resolution supports the current LiteGraph Map and node list", () => {
  const director = { id: 7, comfyClass: "MajoorOmniCamDirector" };
  const monitor = {
    inputs: [{ name: "motion_scene", link: 9 }, { name: "playblast_video", link: 11 }],
    graph: {
      links: new Map([
        [9, { origin_id: 7 }],
        [11, { origin_id: 7 }],
      ]),
      nodes: [director],
    },
  };
  const source = readMonitorSource(monitor);
  assert.equal(source.sceneOrigin, director);
  assert.equal(source.playblastOrigin, director);
});

test("an empty MotionScene socket is the only disconnected scene state", () => {
  const { monitor } = graphFixture();
  monitor.inputs[0].link = null;
  assert.equal(readMonitorSource(monitor).sceneConnected, false);
});

test("unchanged links do not re-emit Monitor source state", () => {
  const { monitor } = graphFixture();
  const seen = [];
  const watcher = new MonitorSourceWatcher(monitor, (source) => seen.push(source), 60_000);
  watcher.poll();
  watcher.poll();
  assert.equal(seen.length, 1);

  monitor.inputs[1].link = 11;
  watcher.poll();
  assert.equal(seen.length, 2);
  assert.equal(seen[1].playblastConnected, true);
  watcher.dispose();
});
