// Compact, always-mounted DOMWidget shell shown on a closed Director/
// Extractor/Monitor node: title, one status line, one meta line, an optional
// progress bar, an Open button, and an optional preview.
// Deliberately inert for Extractor and for the no-preview-yet state -- no RAF
// loop, no ResizeObserver, and the preview is a plain <img> whose `src` is
// pushed in from outside (setPreview()) rather than anything drawn here.
// By design, Director and Monitor shells (kind: "director" | "monitor") also
// mount a live-looping <video> (setPreviewVideo()) so the closed box can show
// the actual recorded playblast playing, muted and looped, instead of a
// single still frame -- an intentional exception to that inertness for those
// two kinds only; Extractor keeps the passive still image (or nothing).
// Shell state is written by the caller's runtime; it is never a second
// source of truth (migration plan section 8).

import { injectWorkbenchStyles } from "./styles.js";

// Only Director/Monitor closed shells offer a playing playblast preview;
// Extractor stays image-or-nothing (out of scope for that feature).
const VIDEO_PREVIEW_KINDS = new Set(["director", "monitor"]);

export function createNodeShell({ kind, title, buttonLabel, onOpen }) {
  injectWorkbenchStyles(document);

  const root = document.createElement("div");
  root.className = "oc-node-shell";
  root.dataset.shellKind = kind;

  // Static still-frame preview (last captured at workbench-close time by the
  // caller). Plain <img>, never redrawn here -- no canvas, no RAF.
  const previewEl = document.createElement("img");
  previewEl.className = "oc-node-shell-preview";
  previewEl.alt = "";
  previewEl.draggable = false;

  // Live-looping playblast preview, Director/Monitor only (see header
  // comment). `src` is pushed in from outside via setPreviewVideo(); nothing
  // here polls or redraws it -- the browser's own media pipeline drives the
  // autoplay/loop.
  let videoEl = null;
  if (VIDEO_PREVIEW_KINDS.has(kind)) {
    videoEl = document.createElement("video");
    videoEl.className = "oc-node-shell-preview";
    videoEl.muted = true;
    videoEl.loop = true;
    videoEl.playsInline = true;
    videoEl.disablePictureInPicture = true;
    videoEl.disableRemotePlayback = true;
    videoEl.style.display = "none";
  }

  const titleEl = document.createElement("div");
  titleEl.className = "oc-node-shell-title";
  titleEl.textContent = title ?? "";

  const metaEl = document.createElement("div");
  metaEl.className = "oc-node-shell-meta";

  const statusEl = document.createElement("div");
  statusEl.className = "oc-node-shell-status";

  const progressEl = document.createElement("div");
  progressEl.className = "oc-node-shell-progress";
  const progressFill = document.createElement("span");
  progressEl.append(progressFill);

  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.className = "oc-node-shell-open";
  openButton.textContent = buttonLabel ?? "Open";

  if (videoEl) root.append(previewEl, videoEl, titleEl, metaEl, statusEl, progressEl, openButton);
  else root.append(previewEl, titleEl, metaEl, statusEl, progressEl, openButton);

  const abort = new AbortController();
  openButton.addEventListener("click", (event) => onOpen?.(event), { signal: abort.signal });

  function stopVideo() {
    if (!videoEl) return;
    videoEl.pause();
    videoEl.removeAttribute("src");
    videoEl.load();
    videoEl.style.display = "none";
  }

  return {
    root,
    openButton,
    setTitle(value) {
      titleEl.textContent = value ?? "";
    },
    setMeta(value) {
      metaEl.textContent = value ?? "";
    },
    setStatus(value) {
      statusEl.textContent = value ?? "";
    },
    // Still-frame path. Composes with setPreviewVideo(): setting one with a
    // value hides+stops the other, and clearing one only drops
    // data-has-preview when the other has nothing showing either.
    setPreview(dataUrl) {
      if (dataUrl) {
        previewEl.src = dataUrl;
        previewEl.style.display = "block";
        stopVideo();
        root.dataset.hasPreview = "true";
      } else {
        previewEl.removeAttribute("src");
        previewEl.style.display = "none";
        if (!videoEl?.getAttribute("src")) delete root.dataset.hasPreview;
      }
    },
    // Live-looping playblast preview, Director/Monitor shells only -- a
    // no-op on an Extractor shell (no <video> was mounted). See setPreview()
    // for the composition rule between the two.
    setPreviewVideo(url) {
      if (!videoEl) return;
      if (url) {
        previewEl.style.display = "none";
        videoEl.autoplay = true;
        videoEl.src = url;
        videoEl.style.display = "block";
        root.dataset.hasPreview = "true";
        // Autoplay can be rejected (policy, backgrounded tab, etc.) -- this
        // is an ambient preview, not something the user is blocked without.
        videoEl.play().catch(() => {});
      } else {
        stopVideo();
        if (!previewEl.getAttribute("src")) delete root.dataset.hasPreview;
      }
    },
    setProgress(value) {
      if (value === null || value === undefined) {
        progressEl.dataset.active = "false";
        return;
      }
      progressEl.dataset.active = "true";
      const clamped = Math.max(0, Math.min(1, value));
      progressFill.style.width = `${(clamped * 100).toFixed(1)}%`;
    },
    dispose() {
      abort.abort();
      stopVideo();
    },
  };
}
