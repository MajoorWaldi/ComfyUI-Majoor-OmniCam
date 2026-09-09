// Atomic transaction runner. Validate -> apply every operation to a cloned
// draft -> (unless validateOnly) checkpoint once, swap state, serialise and
// repaint the dirty domains. Any DirectorApiError aborts before the swap, so
// the live state is never left half-mutated.

import { sanitizeState } from "../director/core.js";
import { DIRECTOR_API_VERSION } from "./constants.js";
import { DirectorApiError } from "./errors.js";
import { validateDirectorTransaction } from "./validate.js";
import { applyDirectorOperation } from "./apply.js";

function clone(value) {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function failure(id, error) {
  return {
    ok: false,
    version: DIRECTOR_API_VERSION,
    id: id ?? null,
    applied: 0,
    error: {
      code: error.code || "INTERNAL",
      operationIndex: error.operationIndex ?? null,
      message: error.message,
    },
  };
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
    if (error instanceof DirectorApiError) return failure(input?.id, error);
    throw error;
  }

  const draft = clone(ui.state);
  let dirtyMask = 0;
  const warnings = [];

  for (let index = 0; index < tx.operations.length; index += 1) {
    try {
      const result = applyDirectorOperation({ ui, state: draft, operation: tx.operations[index] });
      dirtyMask |= result?.dirtyMask || 0;
      if (result?.warning) warnings.push(result.warning);
    } catch (error) {
      if (error instanceof DirectorApiError) {
        if (error.operationIndex === null || error.operationIndex === undefined) {
          error.operationIndex = index;
        }
        return failure(tx.id, error);
      }
      throw error;
    }
  }

  if (tx.validateOnly) {
    return {
      ok: true,
      version: DIRECTOR_API_VERSION,
      id: tx.id,
      applied: tx.operations.length,
      warnings,
      dirtyMask,
      validateOnly: true,
    };
  }

  ui.checkpoint?.(tx.description);
  ui.state = sanitizeState(draft);
  (ui._directorApiTxIds ||= new Set()).add(tx.id);
  ui.serialize?.();
  repaint(ui, dirtyMask, `director-api:${tx.id}`);

  return {
    ok: true,
    version: DIRECTOR_API_VERSION,
    id: tx.id,
    applied: tx.operations.length,
    warnings,
    dirtyMask,
  };
}
