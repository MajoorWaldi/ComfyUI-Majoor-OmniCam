// Live Director side of OmniCam Agent v1: registers this Director instance
// with the backend broker, then answers targeted query/transaction requests
// with the exact same ui.directorApi an interactive edit uses.
//
// No DOM assumptions beyond `node`/`api`; safe to unit-test under node with a
// fake api (tests/frontend/agent-bridge.node.mjs).

import {
  DIRECTOR_API_VERSION,
  DIRECTOR_OP_VALUES,
  DIRECTOR_QUERY_VALUES,
} from "../director-api/constants.js";
import {
  AGENT_EVENT,
  AGENT_HEARTBEAT_INTERVAL_MS,
  AGENT_PROTOCOL,
  AGENT_ROUTES,
  AGENT_SCHEMA_VERSION,
} from "./protocol.js";

const REGISTER_RETRY_MS = 5_000;

async function postJson(api, path, payload) {
  const response = await api.fetchApi(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (response.ok === false) {
    const code = body?.error?.code || `HTTP_${response.status || 0}`;
    const message = body?.error?.message || `OmniCam Agent request failed (${response.status})`;
    const error = new Error(message);
    error.code = code;
    error.status = response.status || 0;
    throw error;
  }

  return body ?? {};
}

function failureResult(ui, code, message) {
  return {
    ok: false,
    version: DIRECTOR_API_VERSION,
    revision: Number(ui.directorRevision || 0),
    error: { code, message },
  };
}

export function createDirectorAgentBridge(ui, node, api) {
  let disposed = false;
  let sessionId = null;
  let sessionToken = null;
  let registeredClientId = null;
  let heartbeatTimer = null;
  let retryTimer = null;
  let registrationGeneration = 0;

  function currentClientId() {
    return api.clientId || api.initialClientId || null;
  }

  function clearSession() {
    sessionId = null;
    sessionToken = null;
    registeredClientId = null;
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  async function register() {
    if (disposed) return;
    registrationGeneration += 1;
    const generation = registrationGeneration;
    const clientId = currentClientId();

    if (!clientId) {
      scheduleRetry();
      return;
    }

    try {
      const result = await postJson(api, AGENT_ROUTES.register, {
        protocol: AGENT_PROTOCOL,
        client_id: clientId,
        node_id: String(node.id),
        label: `OmniCam Director ${node.id}`,
        director_api: DIRECTOR_API_VERSION,
        revision: Number(ui.directorRevision || 0),
        operations: [...DIRECTOR_OP_VALUES],
        queries: [...DIRECTOR_QUERY_VALUES],
      });

      if (disposed || generation !== registrationGeneration) return;

      sessionId = result.session_id;
      sessionToken = result.session_token;
      registeredClientId = clientId;
      startHeartbeat();
    } catch {
      if (disposed || generation !== registrationGeneration) return;
      scheduleRetry();
    }
  }

  function scheduleRetry() {
    if (disposed) return;
    clearTimeout(retryTimer);
    retryTimer = setTimeout(() => {
      void register();
    }, REGISTER_RETRY_MS);
  }

  function startHeartbeat() {
    clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(() => {
      void sendHeartbeat();
    }, AGENT_HEARTBEAT_INTERVAL_MS);
  }

  async function sendHeartbeat() {
    if (disposed || !sessionId) return;
    try {
      await postJson(api, AGENT_ROUTES.heartbeat, {
        session_id: sessionId,
        session_token: sessionToken,
        revision: Number(ui.directorRevision || 0),
      });
    } catch (error) {
      if (disposed) return;
      // The session vanished server-side (TTL, restart): drop it and
      // register a fresh one rather than heartbeating into the void.
      if (error?.code === "UNKNOWN_SESSION" || error?.code === "BAD_SESSION_TOKEN") {
        clearSession();
        void register();
      }
    }
  }

  async function handleAgentEvent(event) {
    const detail = event?.detail;
    if (disposed || !detail) return;
    if (detail.protocol !== AGENT_PROTOCOL) return;
    if (Number(detail.schema_version) !== AGENT_SCHEMA_VERSION) return;
    if (detail.session_id !== sessionId) return;
    if (String(detail.node_id) !== String(node.id)) return;

    let result;
    try {
      if (detail.kind === "query") {
        result = ui.directorApi.query(detail.payload);
      } else if (detail.kind === "transaction") {
        const tx = detail.payload;
        if (!Number.isInteger(tx?.baseRevision) || tx.baseRevision < 0) {
          result = failureResult(
            ui,
            "BASE_REVISION_REQUIRED",
            "External Agent transactions require baseRevision",
          );
        } else {
          result = ui.directorApi.execute(tx);
        }
      } else {
        result = failureResult(ui, "UNKNOWN_AGENT_REQUEST", `Unsupported Agent request kind: ${detail.kind}`);
      }
    } catch (error) {
      result = failureResult(ui, error?.code || "INTERNAL", error?.message || "OmniCam Agent request failed");
    }

    try {
      await postJson(api, AGENT_ROUTES.reply, {
        session_id: sessionId,
        session_token: sessionToken,
        request_id: detail.request_id,
        result,
      });
    } catch {
      // The broker already timed the request out on its side; nothing more
      // to do here than let it go.
    }
  }

  function handleStatus() {
    if (disposed) return;
    const clientId = currentClientId();
    if (clientId && registeredClientId && clientId !== registeredClientId) {
      // ComfyUI does not guarantee the WebSocket client id is stable across
      // reconnects, so a change means the old session's routing is dead.
      clearSession();
      void register();
    }
  }

  api.addEventListener?.(AGENT_EVENT, handleAgentEvent);
  api.addEventListener?.("status", handleStatus);
  void register();

  return {
    get sessionId() {
      return sessionId;
    },

    dispose() {
      if (disposed) return;
      disposed = true;

      clearInterval(heartbeatTimer);
      clearTimeout(retryTimer);

      api.removeEventListener?.(AGENT_EVENT, handleAgentEvent);
      api.removeEventListener?.("status", handleStatus);

      const closeId = sessionId;
      const closeToken = sessionToken;
      sessionId = null;
      sessionToken = null;

      if (closeId && closeToken) {
        void postJson(api, AGENT_ROUTES.close, {
          session_id: closeId,
          session_token: closeToken,
        }).catch(() => {});
      }
    },
  };
}
