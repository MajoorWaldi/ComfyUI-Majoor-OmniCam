// The one Extractor HTTP call that is not execution.
//
// Measuring a source (frame count, rate, dimensions) so the panel's scrubber
// has a real range *before* anything is solved. This has nothing to do with
// the queue; it survived the retirement of the out-of-queue solve scheduler.

import { api } from "../comfy-runtime.js";

/**
 * Ask the server to describe an Extractor source.
 *
 * @param {{ kind: string, value: string }} source
 * @returns {Promise<{ info?: object }>}
 */
export async function describeExtractorSourceInfo(source) {
  const response = await api.fetchApi("/majoor/omnicam/extractor/source", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source }),
  });
  if (!response.ok) {
    throw new Error(`OmniCam: could not describe the source (${response.status})`);
  }
  return response.json();
}
