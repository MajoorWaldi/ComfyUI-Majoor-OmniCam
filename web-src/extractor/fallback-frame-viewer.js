// Browser-safe source preview frames for footage native HTML video cannot decode.
//
// Construction is deliberately state-only. A panel can create this viewer while
// it still has no connected source; requests begin only through `load`.

const FRAME_ROUTE = "/majoor/omnicam/extractor/frame";

function boundedFrame(value) {
  return Math.max(0, Math.round(Number(value) || 0));
}

function headerNumber(headers, name, fallback = 0) {
  const value = Number(headers?.get?.(name));
  return Number.isFinite(value) && value > 0 ? Math.round(value) : fallback;
}

async function errorMessage(response) {
  try {
    const text = await response?.text?.();
    return text || `Preview frame request failed (${response?.status || "unknown"})`;
  } catch {
    return `Preview frame request failed (${response?.status || "unknown"})`;
  }
}

function isAbort(error) {
  return error?.name === "AbortError";
}

/** Paint an image inside the canvas without stretching or leaving stale pixels. */
export function paintContainedFrame(canvas, image, width = image?.width, height = image?.height) {
  const context = canvas?.getContext?.("2d");
  const sourceWidth = Math.max(1, Number(image?.width) || 1);
  const sourceHeight = Math.max(1, Number(image?.height) || 1);
  const targetWidth = Math.max(1, Math.round(Number(width) || sourceWidth));
  const targetHeight = Math.max(1, Math.round(Number(height) || sourceHeight));
  if (!context) return false;
  if (canvas.width !== targetWidth) canvas.width = targetWidth;
  if (canvas.height !== targetHeight) canvas.height = targetHeight;
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const drawWidth = Math.round(sourceWidth * scale);
  const drawHeight = Math.round(sourceHeight * scale);
  context.clearRect(0, 0, targetWidth, targetHeight);
  context.drawImage(image, Math.round((targetWidth - drawWidth) / 2), Math.round((targetHeight - drawHeight) / 2), drawWidth, drawHeight);
  return true;
}

export class FallbackFrameViewer {
  constructor(canvas, { api, decodeImage = (blob) => globalThis.createImageBitmap(blob) } = {}) {
    this.canvas = canvas;
    this.api = api;
    this.decodeImage = decodeImage;
    this.abortController = null;
    this.generation = 0;
    this.frame = 0;
    this.frameCount = 0;
    this.error = "";
  }

  abort() {
    this.abortController?.abort();
    this.abortController = null;
  }

  /** Fetch, decode, and paint a single managed video frame. */
  async load(source, frame, { maxDimension = 960 } = {}) {
    this.abort();
    const generation = ++this.generation;
    const controller = new AbortController();
    this.abortController = controller;
    const requestedFrame = boundedFrame(frame);
    try {
      const response = await this.api?.fetchApi?.(FRAME_ROUTE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, frame: requestedFrame, max_dimension: maxDimension }),
        signal: controller.signal,
      });
      if (!response?.ok) throw new Error(await errorMessage(response));
      const blob = await response.blob();
      const image = await this.decodeImage(blob);
      if (generation !== this.generation || controller.signal.aborted) {
        image?.close?.();
        return false;
      }
      const width = headerNumber(response.headers, "X-OmniCam-Width", image?.width);
      const height = headerNumber(response.headers, "X-OmniCam-Height", image?.height);
      let painted = false;
      try {
        painted = paintContainedFrame(this.canvas, image, width, height);
      } finally {
        image?.close?.();
      }
      if (!painted) throw new Error("The fallback preview canvas is unavailable.");
      this.frame = headerNumber(response.headers, "X-OmniCam-Frame", requestedFrame);
      this.frameCount = headerNumber(response.headers, "X-OmniCam-Frame-Count", this.frameCount);
      this.error = "";
      return true;
    } catch (error) {
      if (generation !== this.generation || controller.signal.aborted || isAbort(error)) return false;
      this.error = String(error?.message || error);
      throw error;
    } finally {
      if (generation === this.generation) this.abortController = null;
    }
  }

  clear() {
    this.abort();
    this.generation += 1;
    this.error = "";
    const canvas = this.canvas;
    const context = canvas?.getContext?.("2d");
    context?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
  }

  dispose() {
    this.clear();
    this.canvas = null;
    this.api = null;
  }
}
