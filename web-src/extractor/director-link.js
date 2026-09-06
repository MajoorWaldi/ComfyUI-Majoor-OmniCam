// The Extractor -> Director cable, seen from the Director's side.
//
// This runs on every upstream sync, which is often: a graph load, a connection
// change, an execution. So it has to be idempotent. The fingerprint is what
// makes it so -- notice a solve once, then stay out of the way no matter how
// many times the sync fires.
//
// A solved trajectory is never applied on sight. It only stages a preview
// (drawn as a ghost path in the viewport, see director/methods/render.js) and
// a banner; nothing about the scene changes -- no camera is created, no
// keyframe moves -- until the user explicitly imports it. That import creates
// a brand-new camera, exactly like pressing "+ Camera" would, seeded from the
// solve. It never touches whatever camera the user already has: replacing a
// camera you were looking at with an unrelated solve, silently, is the
// specific complaint this file used to cause.
//
// Disconnecting is a feature, not an error: a *committed* import stays
// exactly where it is (it is just a camera now) and simply stops being
// refreshed. An uncommitted preview has nothing to freeze, so it clears --
// there is no solve left to import.
//
// The fingerprint is recorded the moment a solve is first noticed, not only
// on commit. That is what keeps a queued render from silently swapping the
// motion_scene OUTPUT while the preview banner is still sitting there
// unconfirmed: resolve_director_camera_track() (omnicam/core/upstream_track.py)
// reads this same marker to decide whether to adopt the upstream for
// execution, and "seen" has to mean the same thing in the browser and headless.

import { UPSTREAM_METADATA_KEY } from "../canonical-track-import.js";
import { importExtractorTrackAsCamera } from "../cameras.js";
import { t } from "../i18n.js";
import { EXTRACTOR_NODE_CLASS, readCachedResult } from "./result-cache.js";
import { graphLink, linkedOrigin } from "../graph-links.js";

//: The Director input an Extractor connects to. Named for what it carries --
//: a solved camera -- rather than for the socket type, because the Director
//: imports only that camera and not the rest of the upstream scene.
export const SOLVED_SCENE_INPUT = "solved_scene";

function nodeClassOf(node) {
  return String(node?.comfyClass || node?.type || node?.constructor?.type || "");
}

/** The Extractor node feeding this Director's solved_scene input, if any. */
export function upstreamExtractorNode(ui) {
  const node = ui?.node;
  const graph = node?.graph;
  if (!graph) return null;
  for (const input of node.inputs || []) {
    if (String(input?.name || "").toLowerCase() !== SOLVED_SCENE_INPUT) continue;
    if (input.link == null) continue;
    const origin = linkedOrigin(graph, input.link);
    if (origin && nodeClassOf(origin) === EXTRACTOR_NODE_CLASS) return origin;
  }
  return null;
}

/** The extractor fingerprint this Director has already seen (staged or committed). */
export function importedFingerprint(ui) {
  return String(ui?.state?.metadata?.[UPSTREAM_METADATA_KEY]?.fingerprint || "");
}

function markFingerprintSeen(ui, fingerprint, origin) {
  ui.state.metadata = {
    ...ui.state.metadata,
    [UPSTREAM_METADATA_KEY]: {
      fingerprint,
      source: "omnicam_extractor",
      origin_node_id: String(origin.id),
    },
  };
}

/** Show or hide the "import as camera" banner for the current pending preview. */
export function refreshExtractorImportBanner(ui) {
  const banner = ui.root?.querySelector('[data-role="extractor-import-banner"]');
  if (!banner) return;
  const pending = ui.pendingExtractorImport;
  banner.hidden = !pending;
  if (!pending) return;
  const text = banner.querySelector('[data-role="extractor-import-text"]');
  if (text) {
    text.textContent = t("{count} camera keys ready from {name} — import as a new camera?")
      .replace("{count}", String(pending.keyCount))
      .replace("{name}", pending.label);
  }
}

/**
 * Notice a newly solved trajectory and stage it for review.
 *
 * Never mutates a camera. A new, unseen fingerprint becomes the pending
 * preview the banner and the viewport ghost path read; a fingerprint already
 * seen (staged earlier, or already imported) changes nothing; a cable that no
 * longer resolves to a cached solve drops whatever was pending, since there is
 * nothing left to import.
 *
 * @returns {boolean} true when the pending preview changed.
 */
export function syncExtractorCameraTrack(ui) {
  const origin = upstreamExtractorNode(ui);
  const cached = origin ? readCachedResult(origin) : null;
  let changed = false;

  if (!cached) {
    if (ui.pendingExtractorImport) {
      ui.pendingExtractorImport = null;
      changed = true;
    }
  } else if (cached.fingerprint !== importedFingerprint(ui) && ui.pendingExtractorImport?.fingerprint !== cached.fingerprint) {
    ui.pendingExtractorImport = {
      track: cached.track,
      fingerprint: cached.fingerprint,
      originNodeId: origin.id,
      label: String(origin.title || t("OmniCam Extractor")),
      keyCount: cached.track.keyframes?.length || 0,
    };
    markFingerprintSeen(ui, cached.fingerprint, origin);
    changed = true;
  }

  refreshExtractorImportBanner(ui);
  return changed;
}

/** Turn the staged preview into a real camera, like any other in the Director. */
export function commitPendingExtractorImport(ui) {
  const pending = ui.pendingExtractorImport;
  if (!pending) return false;
  ui.checkpoint("Import extracted camera");
  importExtractorTrackAsCamera(ui, pending.track, { label: pending.label });
  ui.pendingExtractorImport = null;
  refreshExtractorImportBanner(ui);
  ui.setStatus?.(t("Imported {count} camera keys from {name}")
    .replace("{count}", String(pending.keyCount))
    .replace("{name}", pending.label));
  ui.scheduleSerialize();
  ui.render();
  return true;
}

/** Discard the staged preview without creating a camera. */
export function dismissPendingExtractorImport(ui) {
  if (!ui.pendingExtractorImport) return false;
  ui.pendingExtractorImport = null;
  refreshExtractorImportBanner(ui);
  ui.render();
  ui.setStatus?.(t("Extracted camera preview dismissed"));
  return true;
}

/** Push a fresh Extractor result into every Director it feeds. */
export function notifyDownstreamDirectors(extractorNode) {
  const graph = extractorNode?.graph;
  if (!graph) return 0;
  const outputs = extractorNode.outputs || [];
  const seen = new Set();
  let notified = 0;
  for (const output of outputs) {
    for (const linkId of output?.links || []) {
      const link = graphLink(graph, linkId);
      const targetId = link?.target_id ?? link?.targetId;
      if (!link || targetId == null || seen.has(targetId)) continue;
      seen.add(targetId);
      const target = graph.getNodeById?.(targetId);
      const ui = target?.__majoorOmniCam;
      // Never re-queue the graph: the Director just re-reads the cache.
      if (ui?.syncUpstreamInputs) {
        ui.syncUpstreamInputs();
        notified += 1;
      }
    }
  }
  return notified;
}

import { adoptReconstructedScene } from "./reconstruction/director-adopt.js";
export { adoptReconstructedScene };

export function adoptReconstructionIntoDownstreamDirectors(extractorNode, result) {
  const graph = extractorNode?.graph;
  if (!graph) return 0;
  const outputs = extractorNode.outputs || [];
  const seen = new Set();
  let adopted = 0;
  for (const output of outputs) {
    for (const linkId of output?.links || []) {
      const link = graphLink(graph, linkId);
      const targetId = link?.target_id ?? link?.targetId;
      if (!link || targetId == null || seen.has(targetId)) continue;
      seen.add(targetId);
      const target = graph.getNodeById?.(targetId);
      const ui = target?.__majoorOmniCam;
      if (ui) {
        adoptReconstructedScene(ui, result);
        adopted += 1;
      }
    }
  }
  return adopted;
}

