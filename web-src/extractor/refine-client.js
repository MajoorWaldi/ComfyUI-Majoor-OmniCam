// Post-solve refinement, decoupled from execution.
//
// POST /majoor/omnicam/extractor/refine takes the immutable raw solve the
// queued Extractor emitted plus the current cleanup-desk settings and returns
// a freshly refined track. No queue, no job -- the slider drag updates the
// track without re-running TRACK.

/**
 * @param {{ fetchApi: Function }} api
 * @param {object} rawSolve - the serialized RawSolve from the result envelope.
 * @param {object} settings - RefineController.settings.
 * @returns {Promise<{ refined_track: object, fingerprint: string, key_count: number, resolved_alignment: number[]|null }>}
 */
export async function postRefine(api, rawSolve, settings) {
  const response = await api.fetchApi("/majoor/omnicam/extractor/refine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raw_solve: rawSolve, settings }),
  });
  if (!response.ok) {
    let detail = `refine failed (${response.status})`;
    try {
      detail = (await response.text()) || detail;
    } catch {
      // keep the status-code message
    }
    throw new Error(detail);
  }
  return response.json();
}
