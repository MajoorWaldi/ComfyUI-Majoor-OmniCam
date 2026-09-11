// Atomic transaction runner. Validate -> apply every operation to a cloned
// draft -> (unless validateOnly) checkpoint once, swap state, serialise and
// repaint the dirty domains. Any DirectorApiError aborts before the swap, so
// the live state is never left half-mutated.

import { cloneCamera, sampleCamera, sanitizeState } from "../director/core.js";
import { DIRECTOR_API_VERSION } from "./constants.js";
import { DirectorApiError } from "./errors.js";
import { validateDirectorTransaction } from "./validate.js";
import { applyDirectorOperation } from "./apply.js";

function clone(value) {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function currentRevision(ui) {
  return Number.isInteger(ui.directorRevision)
    ? Math.max(0, ui.directorRevision)
    : 0;
}

function failure(ui, id, error) {
  return {
    ok: false,
    version: DIRECTOR_API_VERSION,
    revision: currentRevision(ui),
    id: id ?? null,
    applied: 0,
    error: {
      code: error.code || "INTERNAL",
      operationIndex: error.operationIndex ?? null,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    },
  };
}

function prepareCommittedActiveCamera(ui) {
  const active = (ui.state.cameras || []).find(
    (item) => item.id === ui.state.active_camera_id,
  ) || ui.state.cameras?.[0] || null;

  if (!active) return null;

  // serializeEditorState() calls syncActiveCameraTrack(), which copies
  // ui.camera back into active.camera. Protect the semantic transaction's
  // freshly committed camera before that synchronization occurs.
  ui.state.keyframes = active.keyframes;
  ui.state.camera = cloneCamera(active.camera);
  ui.camera = cloneCamera(active.camera);

  return active;
}

function restoreViewportCamera(ui, active) {
  if (!active) return;
  ui.camera = sampleCamera(
    active,
    ui.frame ?? 0,
    ui.state.objects || [],
  );
}

function repaint(ui, dirtyMask, reason) {
  if (typeof ui.requestUiUpdate === "function") {
    ui.requestUiUpdate(dirtyMask, reason);
    return;
  }
  // Pre-scheduler fallback: repaint the whole editor once.
  ui.camera = ui.sampleCamera?.(ui.state, ui.frame) ?? ui.camera;
  ui.refreshObjects?.();
  ui.refreshKeys?.();
  ui.refreshInspector?.();
  ui.render?.();
}

export function executeDirectorTransaction(ui, input) {
  let tx;
  try {
    tx = validateDirectorTransaction(ui, input);
  } catch (error) {
    if (error instanceof DirectorApiError) return failure(ui, input?.id, error);
    throw error;
  }

  const beforeRevision = currentRevision(ui);

  if (
    tx.baseRevision !== undefined
    && tx.baseRevision !== beforeRevision
  ) {
    return failure(
      ui,
      tx.id,
      new DirectorApiError(
        "STALE_REVISION",
        "Scene changed since the caller read it",
        null,
        {
          expected: beforeRevision,
          received: tx.baseRevision,
        },
      ),
    );
  }

  const draft = clone(ui.state);
  let dirtyMask = 0;
  const warnings = [];
  const outcomes = [];

  for (let index = 0; index < tx.operations.length; index += 1) {
    try {
      const result = applyDirectorOperation({ ui, state: draft, operation: tx.operations[index] });
      dirtyMask |= result?.dirtyMask || 0;
      if (result?.warning) warnings.push(result.warning);
      if (result?.outcome) outcomes.push({ index, ...result.outcome });
    } catch (error) {
      if (error instanceof DirectorApiError) {
        if (error.operationIndex === null || error.operationIndex === undefined) {
          error.operationIndex = index;
        }
        return failure(ui, tx.id, error);
      }
      throw error;
    }
  }

  if (tx.validateOnly) {
    return {
      ok: true,
      version: DIRECTOR_API_VERSION,
      revision: beforeRevision,
      id: tx.id,
      applied: tx.operations.length,
      warnings,
      outcomes,
      dirtyMask,
      validateOnly: true,
    };
  }

  ui.checkpoint?.(tx.description);
  ui.state = sanitizeState(draft);

  const active = prepareCommittedActiveCamera(ui);

  (ui._directorApiTxIds ||= new Set()).add(tx.id);
  ui.serialize?.();

  restoreViewportCamera(ui, active);
  repaint(ui, dirtyMask, `director-api:${tx.id}`);

  return {
    ok: true,
    version: DIRECTOR_API_VERSION,
    baseRevision: beforeRevision,
    revision: currentRevision(ui),
    id: tx.id,
    applied: tx.operations.length,
    warnings,
    outcomes,
    dirtyMask,
  };
}
