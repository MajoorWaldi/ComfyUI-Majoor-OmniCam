// Enforces the "one heavy OmniCam workbench at a time" policy (migration
// plan section 7). Knows nothing about Director/Extractor specifics: callers
// hand it a `createSession()` factory and get back whatever it produces.
//
// Session contract expected from createSession():
//   { key, nodeId, host, close(reason): Promise<boolean>, dispose(): void }

export class WorkbenchSessionManager {
  constructor() {
    this._active = null; // { key, nodeId, host, close, dispose, opener }
    this._tail = Promise.resolve();
    this._pending = new Set();
  }

  get activeKey() {
    return this._active?.key ?? null;
  }

  get activeSession() {
    return this._active;
  }

  _enqueue(operation) {
    const result = this._tail.then(operation);
    this._tail = result.catch(() => {});
    return result;
  }

  open({ key, nodeId = key, opener, createSession }) {
    const request = { nodeId: String(nodeId), cancelled: false };
    this._pending.add(request);
    return this._enqueue(() => this._open(request, { key, opener, createSession }))
      .finally(() => this._pending.delete(request));
  }

  async _open(request, { key, opener, createSession }) {
    if (request.cancelled) return null;
    if (this._active?.key === key) {
      this._active.host?.focus?.();
      return this._active;
    }

    if (this._active) {
      const closed = await this._closeSession(this._active, "switch");
      if (!closed) return null;
    }

    if (request.cancelled) return null;
    const session = await createSession();
    if (!session) return null;
    if (request.cancelled) {
      session.dispose?.();
      return null;
    }

    session.opener = opener ?? null;
    this._active = session;
    return session;
  }

  close(key, reason = "programmatic") {
    return this._enqueue(() => {
      if (!this._active || this._active.key !== key) return true;
      return this._closeSession(this._active, reason);
    });
  }

  closeActive(reason = "switch") {
    return this._enqueue(() => {
      if (!this._active) return true;
      return this._closeSession(this._active, reason);
    });
  }

  disposeForNode(nodeId) {
    for (const request of this._pending) {
      if (request.nodeId === String(nodeId)) request.cancelled = true;
    }
    if (this._active && String(this._active.nodeId) === String(nodeId)) {
      this._active.dispose?.();
      this._active = null;
    }
  }

  async _closeSession(session, reason) {
    const allowed = await session.close?.(reason);
    if (allowed === false) return false;
    if (this._active === session) this._active = null;
    session.opener?.focus?.();
    return true;
  }
}

export const workbenchSessions = new WorkbenchSessionManager();
