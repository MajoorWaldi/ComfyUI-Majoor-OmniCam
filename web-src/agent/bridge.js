// Live Director side of OmniCam Agent v1: registers this Director instance
// with the backend broker, then answers targeted query/transaction requests
// with the exact same ui.directorApi an interactive edit uses.
//
// No DOM assumptions beyond `node`/`api`; safe to unit-test under node with a
// fake api (tests/frontend/agent-bridge.node.mjs).

import {
  DIRECTOR_API_VERSION,
  DIRECTOR_OP_VALUES,
  DIRECTOR_OPS,
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

// asset.instantiate takes a fully resolved AssetDefinition (file/source/rig/
// animations) that only the trusted catalogue may produce -- an external
// Agent must never be able to fabricate one, so it is never advertised and
// any transaction that slips one in is rejected before it reaches
// ui.directorApi.execute (design spec section 21).
//
// asset.instantiate_by_id is the safe alternative design spec section 21
// itself calls out for later: the Agent supplies only a catalogue id, this
// module resolves it against the *already-loaded, trusted* Asset Browser
// catalogue (ui.assetBrowser.store -- the same store the Asset Browser panel
// itself reads), and rewrites the operation into a real asset.instantiate
// carrying that trusted AssetDefinition before the transaction ever reaches
// ui.directorApi.execute. The Agent never sees or constructs a file path,
// rig, or animation list itself.
const ASSET_INSTANTIATE_BY_ID = "asset.instantiate_by_id";
const ASSET_CATALOG_SEARCH = "asset.catalog_search";

export const EXTERNAL_AGENT_OPERATIONS = Object.freeze([
  ...DIRECTOR_OP_VALUES.filter((operation) => operation !== DIRECTOR_OPS.ASSET_INSTANTIATE),
  ASSET_INSTANTIATE_BY_ID,
]);

/** The three "Human Neutral/Male/Female 01" rows shipped in
 * catalog.default.json (and any future row like them) exist only to
 * illustrate a fully-mapped rig row's shape -- they carry no real file
 * (docs/CHARACTERS.md: "The illustrative rig maps in catalog.default.json
 * are never trusted for a downloaded file"). A real character always comes
 * from bootstrap/import and therefore has source "user". Picking one of
 * these for the Agent would silently degrade to a placeholder box instead
 * of a real character, so both catalog_search and instantiate_by_id must
 * treat them as if they were not in the catalogue at all. */
function isUntrustedIllustrativeCharacter(definition) {
  return definition?.kind === "character" && definition?.source === "default";
}

/** The catalogue row for `assetId`, loading/searching for it first if the
 * Asset Browser has not already fetched it. Null if it truly does not exist
 * or is an untrusted illustrative row (see isUntrustedIllustrativeCharacter). */
async function resolveCatalogAsset(store, assetId) {
  if (!store || !assetId || typeof assetId !== "string") return null;
  const found = store.get(assetId);
  if (found) return isUntrustedIllustrativeCharacter(found) ? null : found;
  try {
    await store.setFilter({ kind: "all", search: assetId });
  } catch {
    // A failed catalogue fetch just means resolution fails below too.
  }
  const resolved = store.get(assetId);
  return isUntrustedIllustrativeCharacter(resolved) ? null : resolved;
}

/** Rewrites every asset.instantiate_by_id in `operations` into a real
 * asset.instantiate carrying the resolved, trusted AssetDefinition. Any
 * other operation passes through untouched. */
async function resolveTrustedAssetOperations(ui, operations) {
  const store = ui.assetBrowser?.store;
  const resolved = [];
  for (const operation of operations || []) {
    if (operation?.type !== ASSET_INSTANTIATE_BY_ID) {
      resolved.push(operation);
      continue;
    }
    if (!store) {
      return { ok: false, code: "ASSET_CATALOG_UNAVAILABLE", message: "The asset catalogue is not available in this Director session" };
    }
    const definition = await resolveCatalogAsset(store, operation.assetId);
    if (!definition) {
      return { ok: false, code: "UNKNOWN_ASSET", message: `Unknown catalogue asset: ${operation.assetId}` };
    }
    resolved.push({ type: "asset.instantiate", asset: definition, id: operation.id, point: operation.point });
  }
  return { ok: true, operations: resolved };
}

/** A safe, credential/file-path-free summary of matching catalogue rows, for
 * the planner to pick an assetId (and, for a character, an animation clip)
 * from -- never the raw AssetDefinition. */
async function resolveCatalogSearchQuery(ui, query) {
  const store = ui.assetBrowser?.store;
  if (!store) {
    const error = new Error("The asset catalogue is not available in this Director session");
    error.code = "ASSET_CATALOG_UNAVAILABLE";
    throw error;
  }
  await store.setFilter({ kind: query?.kind || "all", search: String(query?.search || "") });
  const items = (store.state?.items || [])
    .filter((item) => !isUntrustedIllustrativeCharacter(item))
    .slice(0, 20)
    .map((item) => ({
      id: item.id,
      name: item.name,
      kind: item.kind,
      tags: [...(item.tags || [])],
      animations: (item.animations || []).map((clip) => ({ id: clip.id, name: clip.name, clip: clip.clip })),
    }));
  return {
    version: DIRECTOR_API_VERSION,
    type: ASSET_CATALOG_SEARCH,
    items,
    revision: Number(ui.directorRevision || 0),
  };
}

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
        operations: [...EXTERNAL_AGENT_OPERATIONS],
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
        result = detail.payload?.type === ASSET_CATALOG_SEARCH
          ? await resolveCatalogSearchQuery(ui, detail.payload)
          : ui.directorApi.query(detail.payload);
      } else if (detail.kind === "transaction") {
        const tx = detail.payload;
        const disallowed = (tx?.operations || []).find(
          (operation) => !EXTERNAL_AGENT_OPERATIONS.includes(operation?.type),
        );
        if (!Number.isInteger(tx?.baseRevision) || tx.baseRevision < 0) {
          result = failureResult(
            ui,
            "BASE_REVISION_REQUIRED",
            "External Agent transactions require baseRevision",
          );
        } else if (disallowed) {
          result = failureResult(
            ui,
            "OPERATION_NOT_ADVERTISED",
            `External Agent transactions cannot use operation: ${disallowed?.type}`,
          );
        } else {
          // Resolved *after* the disallow-list check above (which still runs
          // against the original asset.instantiate_by_id markers, not the
          // asset.instantiate they become -- that real op stays off the
          // advertised list on purpose).
          const resolved = await resolveTrustedAssetOperations(ui, tx.operations);
          result = resolved.ok
            ? ui.directorApi.execute({ ...tx, operations: resolved.operations })
            : failureResult(ui, resolved.code, resolved.message);
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

  async function closeSessionBestEffort(id, token) {
    if (!id || !token) return;
    try {
      await postJson(api, AGENT_ROUTES.close, {
        session_id: id,
        session_token: token,
      });
    } catch {
      // Reconnection must continue even if the old session could not be
      // closed cleanly server-side; it will still expire via its own TTL.
    }
  }

  function handleStatus() {
    if (disposed) return;
    const clientId = currentClientId();
    if (clientId && registeredClientId && clientId !== registeredClientId) {
      // ComfyUI does not guarantee the WebSocket client id is stable across
      // reconnects, so a change means the old session's routing is dead.
      const oldId = sessionId;
      const oldToken = sessionToken;
      clearSession();
      void closeSessionBestEffort(oldId, oldToken).finally(() => register());
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
