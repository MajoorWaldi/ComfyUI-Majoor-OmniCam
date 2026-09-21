// Compact, always-mounted DOMWidget shell shown on a closed Director node:
// title, one status line, one meta line, an optional progress bar, an Open
// button, and an optional preview. Director is the only product still using
// this -- Extractor and Monitor mount their full panel inline instead (see
// web-src/extractor/index.js's attachExtractor / web-src/monitor/index.js's
// attachMonitor), with no compact shell and no modal workbench.
// Deliberately inert for the no-preview-yet state -- no RAF loop, no
// ResizeObserver, and the still-image preview is a plain <img> whose `src`
// is pushed in from outside (setPreview()) rather than anything drawn here.
// A live-looping <video> preview (setPreviewVideo()) is also supported, kept
// generic (kind-gated) in case a future product shell wants it.
// Shell state is written by the caller's runtime; it is never a second
// source of truth (migration plan section 8).

import { t } from "../i18n.js";
import { injectWorkbenchStyles } from "./styles.js";
import { OMNICAM_VERSION } from "../shared/version.js";

// Which shell kinds get a live-looping playblast preview instead of a still
// image. Director is the only kind that exists today.
const VIDEO_PREVIEW_KINDS = new Set(["director"]);

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

  // Dirty dot: shown before the title once the scene has unsaved changes
  // (spec section 05, top bar "nom scène + dirty state"). A dot rather than
  // an asterisk in the text so a locale swap can never desync it from the
  // title string. Lives in its own span, sibling to the title text span, so
  // setTitle()'s textContent write never wipes it back out.
  const dirtyDotEl = document.createElement("span");
  dirtyDotEl.className = "oc-node-shell-dirty-dot";
  dirtyDotEl.hidden = true;
  dirtyDotEl.setAttribute("aria-hidden", "true");
  const titleTextEl = document.createElement("span");
  titleTextEl.className = "oc-node-shell-title-text";
  titleTextEl.textContent = title ?? "";
  titleEl.append(dirtyDotEl, titleTextEl);

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

  const versionEl = document.createElement("span");
  versionEl.className = "oc-node-shell-version";
  versionEl.textContent = `v${OMNICAM_VERSION}`;

  if (videoEl) root.append(previewEl, videoEl, versionEl, titleEl, metaEl, statusEl, progressEl, openButton);
  else root.append(previewEl, versionEl, titleEl, metaEl, statusEl, progressEl, openButton);

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
      titleTextEl.textContent = value ?? "";
    },
    setDirty(value) {
      dirtyDotEl.hidden = !value;
      dirtyDotEl.title = value ? t("Unsaved changes") : "";
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
