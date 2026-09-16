// Enforces the "one heavy OmniCam workbench at a time" policy (migration
// plan section 7). Knows nothing about Director/Extractor specifics: callers
// hand it a `createSession()` factory and get back whatever it produces.
//
// Session contract expected from createSession():
//   { key, nodeId, host, close(reason): Promise<boolean>, dispose(): void }

export class WorkbenchSessionManager {
  constructor() {
    this._active = null; // { key, nodeId, host, close, dispose, opener }
  }

  get activeKey() {
    return this._active?.key ?? null;
  }

  get activeSession() {
    return this._active;
  }

  async open({ key, opener, createSession }) {
    if (this._active?.key === key) {
      this._active.host?.focus?.();
      return this._active;
    }

    if (this._active) {
      const closed = await this._closeSession(this._active, "switch");
      if (!closed) return null;
    }

    const session = await createSession();
    if (!session) return null;

    session.opener = opener ?? null;
    this._active = session;
    return session;
  }

  async close(key, reason = "programmatic") {
    if (!this._active || this._active.key !== key) return true;
    return this._closeSession(this._active, reason);
  }

  async closeActive(reason = "switch") {
    if (!this._active) return true;
    return this._closeSession(this._active, reason);
  }

  disposeForNode(nodeId) {
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
