// Safe partial-queue compatibility adapter.
//
// OmniCam's TRACK and Reconstruction Start enqueue a *partial* ComfyUI
// execution that stops at MajoorOmniCamExtractor. The public entry point is
// `app.queuePrompt`, and its third argument changed shape across supported
// frontend releases:
//
//   ComfyUI_frontend v1.48.7 / v1.49.0
//       async queuePrompt(number, batchCount, queueNodeIds?: NodeExecutionId[])
//       -- the array is pushed straight onto the queue item; no Array.isArray.
//
//   ComfyUI_frontend v1.49.1 and later
//       async queuePrompt(number, batchCount, options?: QueuePromptOptions)
//       -- QueuePromptOptions | NodeExecutionId[], normalized internally with
//          `Array.isArray(...)`. `intent` is telemetry attribution only and
//          never changes what executes.
//
// Both signatures were verified against the official ComfyUI_frontend git tags
// (AGENTS.md "read official sources" rule). The cutover is v1.49.1, recorded
// below as QUEUE_OPTIONS_SIGNATURE_MIN.
//
// Critical safety rule: pick exactly one signature from the detected version
// and call it once. Never call one shape, catch, and retry the other -- an
// unsupported shape is *accepted*, interpreted as "no partial targets", and
// silently runs the entire workflow (real diffusion nodes included). If the
// version cannot be determined we refuse rather than guess.

/** The first frontend release whose `queuePrompt` accepts QueuePromptOptions. */
export const QUEUE_OPTIONS_SIGNATURE_MIN = "1.49.1";

/**
 * Read the ComfyUI frontend version string.
 *
 * ComfyUI's `App.vue` sets `window.__COMFYUI_FRONTEND_VERSION__` from the
 * bundled `comfyui-frontend-package` version at boot.
 *
 * @param {object} [globalObject]
 * @returns {string} the version string, or "" when unavailable.
 */
export function getFrontendVersion(globalObject = globalThis) {
  const raw = globalObject?.__COMFYUI_FRONTEND_VERSION__;
  return typeof raw === "string" ? raw : "";
}

/**
 * Parse the leading `major.minor.patch` triple of a version string.
 *
 * Tolerates release suffixes (`-nightly.3`, `+build`, ...). Returns `null` for
 * anything without a clean leading triple.
 *
 * @param {unknown} value
 * @returns {number[] | null}
 */
export function parseVersion(value) {
  const match = String(value ?? "").match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return match.slice(1, 4).map(Number);
}

/**
 * Compare two version strings.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number} -1 if a < b, 1 if a > b, 0 if equal.
 * @throws when either string has no parseable leading triple -- callers must
 *   not fall back to a default signature on an unknown version.
 */
export function compareVersion(a, b) {
  const left = parseVersion(a);
  const right = parseVersion(b);
  if (!left || !right) {
    throw new Error(`Unsupported ComfyUI frontend version: ${a || "(none)"}`);
  }
  for (let i = 0; i < 3; i += 1) {
    if (left[i] !== right[i]) return left[i] < right[i] ? -1 : 1;
  }
  return 0;
}

/**
 * Enqueue a partial ComfyUI execution targeting the given execution IDs.
 *
 * Selects a single `app.queuePrompt` signature from the detected frontend
 * version and invokes it once.
 *
 * @param {{ queuePrompt: Function }} app - the ComfyUI `app` singleton.
 * @param {string[]} executionIds - partial-execution target node IDs.
 * @param {{ frontendVersion?: string, intent?: object }} [options]
 * @returns {Promise<boolean>} whatever `app.queuePrompt` resolves to.
 */
export async function queuePartialPrompt(
  app,
  executionIds,
  { frontendVersion = getFrontendVersion(), intent } = {},
) {
  if (!Array.isArray(executionIds) || executionIds.length === 0) {
    throw new Error("OmniCam partial execution requires at least one target");
  }
  if (!frontendVersion) {
    throw new Error(
      "Cannot select a queuePrompt signature without a ComfyUI frontend version",
    );
  }

  if (compareVersion(frontendVersion, QUEUE_OPTIONS_SIGNATURE_MIN) >= 0) {
    return app.queuePrompt(0, 1, { queueNodeIds: executionIds, intent });
  }
  return app.queuePrompt(0, 1, executionIds);
}
