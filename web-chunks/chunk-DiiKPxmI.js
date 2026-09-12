import { a as i, bu as b } from "./chunk-BS4DKobr.js";
const F = "/majoor/omnicam/agent/v1/plan", G = "/majoor/omnicam/agent/v1/apply-plan";
async function B(e, r, s, { signal: c } = {}) {
  const a = await e.fetchApi(r, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(s),
    signal: c
  });
  let d = null;
  try {
    d = await a.json();
  } catch {
    d = null;
  }
  if (a.ok === !1) {
    const h = d?.error?.code || `HTTP_${a.status || 0}`, y = d?.error?.message || `OmniCam Agent plan request failed (${a.status})`, f = new Error(y);
    throw f.code = h, f.status = a.status || 0, f;
  }
  return d ?? {};
}
async function M(e, { sessionId: r, instruction: s, provider: c }, a) {
  return B(e, F, {
    session_id: r,
    instruction: s,
    provider: c
  }, a);
}
async function K(e, r, s) {
  return B(e, G, { plan_id: r }, s);
}
function S(e, r) {
  return `/majoor/omnicam/agent/v1/providers/${encodeURIComponent(e)}${r}`;
}
async function T(e, r, s, c) {
  const a = await e.fetchApi(s, {
    method: r,
    headers: c === void 0 ? void 0 : { "Content-Type": "application/json" },
    body: c === void 0 ? void 0 : JSON.stringify(c)
  });
  let d = null;
  try {
    d = await a.json();
  } catch {
    d = null;
  }
  if (a.ok === !1) {
    const h = d?.error?.code || `HTTP_${a.status || 0}`, y = d?.error?.message || `OmniCam Agent provider request failed (${a.status})`, f = new Error(y);
    throw f.code = h, f.status = a.status || 0, f;
  }
  return d ?? {};
}
async function V(e, r) {
  return T(e, "GET", S(r, "/status"));
}
async function Y(e, r, s) {
  try {
    return await T(e, "PUT", S(r, "/credential"), { secret: s });
  } finally {
    s = null;
  }
}
async function z(e, r) {
  return T(e, "DELETE", S(r, "/credential"));
}
async function Q(e, r, s) {
  return T(e, "POST", S(r, "/test"), s || {});
}
const W = {
  ollama: "Ollama",
  openai: "OpenAI",
  openai_compatible: "OpenAI-compatible",
  anthropic: "Anthropic"
};
function j(e) {
  return String(e ?? "").replace(/[&<>"']/g, (r) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[r]);
}
function X(e) {
  if (!e || !e.closest) return null;
  const r = e.closest("[data-agent-act]");
  return r ? { action: r.dataset.agentAct } : null;
}
function Z(e) {
  return !e || !e.length ? `<li class="oc-asset-empty">${i("No visible changes")}</li>` : e.map((r) => `<li>${j(r.entity)} · ${j(r.field)}</li>`).join("");
}
function te(e, r = {}) {
  const s = e.root, c = r.api || e.api || e.app?.api, a = (n) => s.querySelector(`[data-role="${n}"]`), d = a("agent-panel"), h = a("agent-hint"), y = a("agent-describe"), f = a("agent-plan"), $ = a("agent-provider-label"), A = a("agent-credential-status"), _ = a("agent-credential-form"), w = a("agent-credential-input"), q = s.querySelector('[data-agent-act="preview"]'), I = s.querySelector('[data-agent-act="apply"]'), L = s.querySelector('[data-agent-act="cancel"]');
  let u = "idle", o = null, P = null, p = !1;
  function l(n) {
    h && (h.textContent = n || "");
  }
  function x() {
    const n = b();
    if ($) {
      const v = W[n.provider] || n.provider;
      $.textContent = `${v} · ${n.model || i("(no model set)")}`;
    }
    const t = u === "planning" || u === "applying";
    q && (q.disabled = t), I && (I.disabled = !o || t || o.truncated || u === "stale"), L && (L.disabled = !o), y && (y.disabled = t), f && (f.innerHTML = o ? Z(o.changes) : ""), u === "planning" ? l(i("Planning...")) : u === "applying" ? l(i("Applying...")) : u === "stale" ? l(i("The Director changed after this preview. Generate a new preview.")) : u === "preview_ready" && l(o?.description || "");
  }
  function g(n) {
    u = n, x();
  }
  async function E() {
    if (p || !A) return;
    const n = b();
    try {
      const t = await V(c, n.provider);
      if (p) return;
      t.configured ? A.textContent = t.source === "environment" ? i("Configured by server environment") : i("Configured") : A.textContent = i("Not configured");
    } catch {
      p || (A.textContent = i("Status unavailable"));
    }
  }
  async function N() {
    if (u === "planning" || u === "applying") return;
    const n = String(y?.value || "").trim();
    if (!n) return;
    const t = e.agentBridge?.sessionId;
    if (!t) {
      g("error"), l(i("Agent session is not ready yet."));
      return;
    }
    P?.abort?.();
    const v = typeof AbortController == "function" ? new AbortController() : null;
    P = v, o = null, g("planning");
    const C = b();
    try {
      const m = await M(c, {
        sessionId: t,
        instruction: n,
        provider: {
          id: C.provider,
          model: C.model,
          base_url: C.baseUrl,
          max_output_tokens: C.maxOutputTokens,
          max_planner_steps: C.maxPlannerSteps,
          timeout_seconds: C.requestTimeoutSeconds
        }
      }, { signal: v?.signal });
      if (p || P !== v) return;
      if (m.finished) {
        o = null, g("idle"), l(m.message || i("The Agent finished without a change."));
        return;
      }
      o = {
        planId: m.plan_id,
        description: m.description,
        changes: m.changes || [],
        truncated: !!m.truncated
      }, g(o.truncated ? "error" : "preview_ready"), o.truncated && l(i("Preview was truncated; Apply is disabled for safety."));
    } catch (m) {
      if (p || m?.name === "AbortError") return;
      o = null, g("error"), l(m?.message || i("Preview failed"));
    }
  }
  async function U() {
    if (!o || u === "applying" || o.truncated) return;
    const n = o.planId;
    g("applying");
    try {
      if (await K(c, n), p) return;
      o = null, g("idle"), l(i("Applied."));
    } catch (t) {
      if (p) return;
      if (t?.code === "STALE_PLAN") {
        o = null, g("stale");
        return;
      }
      g("error"), l(t?.message || i("Apply failed"));
    }
  }
  function H() {
    P?.abort?.(), o = null, g("idle"), l("");
  }
  function O(n) {
    _ && (_.hidden = !n), n ? w?.focus?.() : w && (w.value = "");
  }
  async function R() {
    const n = b(), t = w?.value || "";
    if (w && (w.value = ""), !t) {
      O(!1);
      return;
    }
    try {
      await Y(c, n.provider, t);
    } catch (v) {
      p || l(v?.message || i("Could not save the credential"));
    } finally {
      O(!1), await E();
    }
  }
  async function D() {
    const n = b();
    try {
      await z(c, n.provider);
    } catch (t) {
      p || l(t?.message || i("Could not remove the credential"));
    } finally {
      await E();
    }
  }
  async function J() {
    const n = b();
    l(i("Testing..."));
    try {
      const t = await Q(c, n.provider, {
        model: n.model,
        base_url: n.baseUrl,
        timeout_seconds: n.requestTimeoutSeconds
      });
      if (p) return;
      l(t.ok ? i("Connection OK") : t.error?.message || i("Connection failed"));
    } catch (t) {
      p || l(t?.message || i("Connection failed"));
    }
  }
  function k(n) {
    const t = X(n.target);
    if (t) {
      if (t.action === "preview") return void N();
      if (t.action === "apply") return void U();
      if (t.action === "cancel") return H();
      if (t.action === "credential-replace") return O(_?.hidden !== !1);
      if (t.action === "credential-remove") return void D();
      if (t.action === "credential-test") return void J();
      if (t.action === "credential-save") return void R();
    }
  }
  return d?.addEventListener("click", k), x(), E(), {
    get state() {
      return u;
    },
    dispose() {
      p = !0, P?.abort?.(), d?.removeEventListener("click", k);
    }
  };
}
export {
  te as createDirectorAgentPanel,
  Z as planChangesMarkup,
  X as resolveAgentIntent
};
