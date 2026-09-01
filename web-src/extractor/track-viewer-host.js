/**
 * Lazily construct the Extractor's 3-D track viewer.
 *
 * `../viewer/track-viewer.js` pulls in three.js (~1.2 MB). Importing it here,
 * on demand, rather than at the Extractor's module scope keeps it off
 * ComfyUI's startup path: an Extractor node that is never switched out of the
 * "source" tab never downloads or parses a 3-D engine. `tests/frontend/
 * production-bundle.node.mjs` fails if a static import puts it back.
 *
 * Resolves to the viewer, or to null if the node was disposed while the chunk
 * was in flight or the import failed outright. The host keeps rendering
 * through its null-guarded `host.viewer` either way.
 */
export function loadTrackViewer(host) {
  return import("../viewer/track-viewer.js").then(({ TrackViewer }) => {
    host.viewerLoad = null;
    if (host.disposed || host.viewer) return host.viewer;
    host.viewer = new TrackViewer(host.$("track-canvas"));
    host.pushTracksToViewer();
    return host.viewer;
  }).catch((error) => {
    host.viewerLoad = null;
    console.warn("OmniCam track viewer unavailable", error);
    return null;
  });
}
