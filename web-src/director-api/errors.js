// Typed failure for the semantic Director API. `code` is a stable, machine
// readable token; `operationIndex` points at the offending operation in a
// transaction (null for whole-transaction or query failures).

export class DirectorApiError extends Error {
  constructor(code, message, operationIndex = null) {
    super(message);
    this.name = "DirectorApiError";
    this.code = code;
    this.operationIndex = operationIndex;
  }
}
