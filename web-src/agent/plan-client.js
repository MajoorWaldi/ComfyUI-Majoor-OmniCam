// Thin fetch client for the built-in Agent's Preview/Apply endpoints (design
// spec sections 30-31). Never sends a credential -- the server resolves it
// from the SecretStore/environment using the same session the Agent bridge
// already registered.

const PLAN_ROUTE = "/majoor/omnicam/agent/v1/plan";
const APPLY_ROUTE = "/majoor/omnicam/agent/v1/apply-plan";

async function requestJson(api, path, body, { signal } = {}) {
  const response = await api.fetchApi(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  let parsed = null;
  try {
    parsed = await response.json();
  } catch {
    parsed = null;
  }

  if (response.ok === false) {
    const code = parsed?.error?.code || `HTTP_${response.status || 0}`;
    const message = parsed?.error?.message || `OmniCam Agent plan request failed (${response.status})`;
    const error = new Error(message);
    error.code = code;
    error.status = response.status || 0;
    throw error;
  }

  return parsed ?? {};
}

/**
 * @param {{sessionId: string, instruction: string, provider: object}} params
 */
export async function requestPlan(api, { sessionId, instruction, provider }, options) {
  return requestJson(api, PLAN_ROUTE, {
    session_id: sessionId,
    instruction,
    provider,
  }, options);
}

export async function applyPlan(api, planId, options) {
  return requestJson(api, APPLY_ROUTE, { plan_id: planId }, options);
}
