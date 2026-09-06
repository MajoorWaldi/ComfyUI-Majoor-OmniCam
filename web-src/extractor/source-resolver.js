// Deciding whether an interactive solve is even possible for this graph.
//
// A ComfyUI VIDEO -- or an IMAGE batch, which this socket also takes --
// only becomes a real object while the graph executes. A
// `Load Video` node is different: it is file-backed, and its filename widget
// names something already sitting in ComfyUI's input folder, which the server
// can open without running anything.
//
// So the answer is either a reference the backend can resolve, or an honest
// "not without pressing Run" -- never a guess at a third-party node's widget
// names, and never a silent fallback to queueing the graph.

import { upstreamPreviewMedia } from "../shared/upstream-preview.js";
import { linkedOrigin } from "../graph-links.js";

export const MANAGED_SUBFOLDER = "omnicam/extractor_sources";

/** Node types known to be file-backed, with the widget that names the file. */
const FILE_BACKED_NODES = {
  LoadVideo: ["file", "video"],
  VHS_LoadVideo: ["video"],
  VHS_LoadVideoPath: ["video"],
  LoadVideoFFmpeg: ["file", "video"],
};

/**
 * Still-image loaders Scene Reconstruct can read directly. The media socket
 * accepts IMAGE as well as VIDEO (see media.py), so a plain Load Image node is
 * the natural, expected thing to connect for a single reference photo.
 */
const FILE_BACKED_IMAGE_NODES = {
  LoadImage: ["image"],
};

const VIDEO_EXTENSIONS = /\.(mp4|mov|webm|mkv|m4v|avi)(\s|$)/i;
// Mirrors ALLOWED_IMAGE_EXTENSIONS in omnicam/reconstruction/source.py.
const IMAGE_EXTENSIONS = /\.(png|jpe?g|webp)(\s|$)/i;

function unavailableFor(isReconstruct) {
  return {
    available: false,
    ref: null,
    label: "",
    reason: isReconstruct
      ? "Scene Reconstruct requires a file-backed still image. Connect Load Image " +
        "or choose an Extractor source file. This source exists only during workflow execution."
      : "Interactive Track requires a file-backed video source. Connect Load Video " +
        "or choose an Extractor source file. This source exists only during workflow execution.",
  };
}

function nodeClassOf(node) {
  return String(node?.comfyClass || node?.type || node?.constructor?.type || "");
}

function widgetValue(node, names) {
  for (const name of names) {
    const widget = node?.widgets?.find((item) => String(item.name).toLowerCase() === name);
    if (widget && widget.value) return String(widget.value);
  }
  return "";
}

function upstreamVideoNode(node, graph) {
  const input = (node?.inputs || []).find((item) => String(item?.name).toLowerCase() === "video");
  if (!input || input.link == null || !graph) return null;
  return linkedOrigin(graph, input.link);
}

/** The Extractor's own picked file, stored on a frontend-only widget. */
export function managedSourceOf(node) {
  const value = String(
    node?.widgets?.find((item) => item.name === "omnicam_extractor_source")?.value || "",
  );
  if (!value) return null;
  const annotated = /\s\[(input|output|temp)\]$/.test(value);
  return { kind: annotated ? "annotated_input" : "managed", value };
}

/**
 * Resolve the footage an interactive solve or reconstruction should read.
 *
 * A connected file-backed loader wins over the picked file, because that is
 * what the graph will actually execute with; the picker exists for when there
 * is no such node. `mode` decides what "file-backed" means: camera_track wants
 * a video loader, scene_reconstruct wants a still-image loader -- the media
 * socket accepts both (see media.py), so which one is expected depends on
 * which mode the Extractor is in right now.
 */
export function resolveInteractiveExtractorSource(node, graph = node?.graph, mode = "camera_track") {
  const isReconstruct = mode === "scene_reconstruct";
  const nodeMap = isReconstruct ? FILE_BACKED_IMAGE_NODES : FILE_BACKED_NODES;
  const extPattern = isReconstruct ? IMAGE_EXTENSIONS : VIDEO_EXTENSIONS;
  const loaderHint = isReconstruct ? "Load Image" : "Load Video";
  const mediaWord = isReconstruct ? "an image" : "a video";
  const verb = isReconstruct ? "reconstruct" : "track";
  const unavailable = unavailableFor(isReconstruct);

  const origin = upstreamVideoNode(node, graph);
  if (origin) {
    const names = nodeMap[nodeClassOf(origin)];
    if (!names) {
      const executed = managedSourceOf(node);
      if (executed) {
        return {
          available: true,
          reason: "",
          label: executed.value.replace(/\s\[(input|output|temp)\]$/, "").split("/").pop(),
          ref: executed,
          originNodeId: origin.id ?? null,
          runtimeMaterialized: true,
        };
      }
      return {
        ...unavailable,
        reason:
          `${nodeClassOf(origin) || "This node"} produces its footage only while the workflow runs. ` +
          `Connect ${loaderHint}, or choose an Extractor source file, to ${verb} without running.`,
        // Cannot be solved without a real file, but the origin may already
        // have rendered something (a previous run, an upload thumbnail) --
        // showing it at least confirms what is actually connected.
        previewMedia: upstreamPreviewMedia(origin),
      };
    }
    const filename = widgetValue(origin, names);
    if (!filename) {
      return { ...unavailable, reason: `The connected ${loaderHint} node has no file selected yet.` };
    }
    if (!extPattern.test(filename)) {
      return { ...unavailable, reason: `${filename} does not look like ${mediaWord} file.` };
    }
    return {
      available: true,
      reason: "",
      label: filename,
      ref: { kind: "annotated_input", value: filename },
      originNodeId: origin.id ?? null,
    };
  }

  const managed = managedSourceOf(node);
  if (managed) {
    return {
      available: true,
      reason: "",
      label: managed.value.split("/").pop(),
      ref: managed,
      originNodeId: null,
    };
  }
  return { ...unavailable, reason: `Connect ${loaderHint}, or choose a source file, to ${verb}.` };
}

/** One line describing the resolved source for the SOURCE strip. */
export function describeSource(source) {
  if (!source?.available) return source?.reason || "No source";
  const info = source.info;
  if (!info) return source.label;
  const parts = [source.label];
  if (info.width && info.height) parts.push(`${info.width}x${info.height}`);
  if (info.fps) parts.push(`${Number(info.fps).toFixed(2).replace(/\.?0+$/, "")}fps`);
  if (info.frame_count) parts.push(`${info.frame_count} frames`);
  return parts.join(" · ");
}
