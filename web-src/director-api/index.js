// Public entry point for the semantic Director API v1.
//
//   ui.directorApi.query(request)      -> bounded, cloned JSON result
//   ui.directorApi.execute(transaction) -> { ok, applied, warnings, dirtyMask } | { ok:false, error }
//
// First consumer: deterministic UI actions (Plan 01). Later: an Agent, with
// this staying the only mutation surface it is given (Plan 02).

export { DIRECTOR_API_VERSION, DIRECTOR_OPS, DIRECTOR_QUERIES } from "./constants.js";
export { DirectorApiError } from "./errors.js";
export { executeDirectorQuery } from "./query.js";
export { executeDirectorTransaction } from "./transaction.js";

import { executeDirectorQuery } from "./query.js";
import { executeDirectorTransaction } from "./transaction.js";

export function createDirectorApi(ui) {
  return {
    query: (request) => executeDirectorQuery(ui, request),
    execute: (transaction) => executeDirectorTransaction(ui, transaction),
  };
}

export function attachDirectorApi(ui) {
  ui.directorApi = createDirectorApi(ui);
  return ui.directorApi;
}
