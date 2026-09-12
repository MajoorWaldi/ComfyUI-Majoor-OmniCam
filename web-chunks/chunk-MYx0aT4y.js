import { a as o, T as V, bu as Y, bv as w } from "./chunk-33SHLJAx.js";
const z = "/majoor/omnicam/agent/v1/plan", Q = "/majoor/omnicam/agent/v1/apply-plan";
async function U(e, n, i, { signal: s } = {}) {
  const a = await e.fetchApi(n, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(i),
    signal: s
  });
  let u = null;
  try {
    u = await a.json();
  } catch {
    u = null;
  }
  if (a.ok === !1) {
    const b = u?.error?.code || `HTTP_${a.status || 0}`, y = u?.error?.message || `OmniCam Agent plan request failed (${a.status})`, g = new Error(y);
    throw g.code = b, g.status = a.status || 0, g;
  }
  return u ?? {};
}
async function W(e, { sessionId: n, instruction: i, provider: s }, a) {
  return U(e, z, {
    session_id: n,
    instruction: i,
    provider: s
  }, a);
}
async function X(e, n, i) {
  return U(e, Q, { plan_id: n }, i);
}
function A(e, n) {
  return `/majoor/omnicam/agent/v1/providers/${encodeURIComponent(e)}${n}`;
}
async function S(e, n, i, s) {
  const a = await e.fetchApi(i, {
    method: n,
    headers: s === void 0 ? void 0 : { "Content-Type": "application/json" },
    body: s === void 0 ? void 0 : JSON.stringify(s)
  });
  let u = null;
  try {
    u = await a.json();
  } catch {
    u = null;
  }
  if (a.ok === !1) {
    const b = u?.error?.code || `HTTP_${a.status || 0}`, y = u?.error?.message || `OmniCam Agent provider request failed (${a.status})`, g = new Error(y);
    throw g.code = b, g.status = a.status || 0, g;
  }
  return u ?? {};
}
async function Z(e, n) {
  return S(e, "GET", A(n, "/status"));
}
async function ee(e, n, i) {
  try {
    return await S(e, "PUT", A(n, "/credential"), { secret: i });
  } finally {
    i = null;
  }
}
async function te(e, n) {
  return S(e, "DELETE", A(n, "/credential"));
}
async function ne(e, n, i) {
  return S(e, "POST", A(n, "/test"), i || {});
}
async function re(e, n, i) {
  return (await S(e, "POST", A(n, "/models"), i || {})).models || [];
}
const ie = {
  ollama: "Ollama",
  openai: "OpenAI",
  openai_compatible: "OpenAI-compatible",
  anthropic: "Anthropic"
};
function L(e) {
  return String(e ?? "").replace(/[&<>"']/g, (n) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[n]);
}
function ae(e) {
  if (!e || !e.closest) return null;
  const n = e.closest("[data-agent-act]");
  return n ? { action: n.dataset.agentAct } : null;
}
function oe(e) {
  return !e || !e.length ? `<li class="oc-asset-empty">${o("No visible changes")}</li>` : e.map((n) => `<li>${L(n.entity)} · ${L(n.field)}</li>`).join("");
}
function M(e, n) {
  const i = Array.isArray(e) ? [...e] : [];
  return n && !i.includes(n) && i.unshift(n), i.length ? i.map((s) => `<option value="${L(s)}"${s === n ? " selected" : ""}>${L(s)}</option>`).join("") : `<option value="">${o("No models found")}</option>`;
}
function le(e, n = {}) {
  const i = e.root, s = n.api || e.api || e.app?.api, a = (t) => i.querySelector(`[data-role="${t}"]`), u = a("agent-panel"), b = a("agent-hint"), y = a("agent-describe"), g = a("agent-plan"), p = a("agent-model-select"), k = a("agent-provider-label"), _ = a("agent-credential-status"), $ = a("agent-credential-form"), C = a("agent-credential-input"), x = i.querySelector('[data-agent-act="preview"]'), j = i.querySelector('[data-agent-act="apply"]'), N = i.querySelector('[data-agent-act="cancel"]');
  let f = "idle", l = null, P = null, c = !1;
  function d(t) {
    b && (b.textContent = t || "");
  }
  function O() {
    const t = w();
    if (k) {
      const h = ie[t.provider] || t.provider;
      k.textContent = `${h} · ${t.model || o("(no model set)")}`;
    }
    const r = f === "planning" || f === "applying";
    x && (x.disabled = r), j && (j.disabled = !l || r || l.truncated || f === "stale"), N && (N.disabled = !l), y && (y.disabled = r), g && (g.innerHTML = l ? oe(l.changes) : ""), f === "planning" ? d(o("Planning...")) : f === "applying" ? d(o("Applying...")) : f === "stale" ? d(o("The Director changed after this preview. Generate a new preview.")) : f === "preview_ready" && d(l?.description || "");
  }
  function m(t) {
    f = t, O();
  }
  async function I() {
    if (c || !_) return;
    const t = w();
    try {
      const r = await Z(s, t.provider);
      if (c) return;
      r.configured ? _.textContent = r.source === "environment" ? o("Configured by server environment") : o("Configured") : _.textContent = o("Not configured");
    } catch {
      c || (_.textContent = o("Status unavailable"));
    }
  }
  async function E() {
    if (c || !p) return;
    const t = w();
    p.disabled = !0, p.innerHTML = `<option value="">${o("Loading models...")}</option>`;
    try {
      const r = await re(s, t.provider, { base_url: t.baseUrl });
      if (c) return;
      p.innerHTML = M(r, t.model);
    } catch {
      if (c) return;
      p.innerHTML = M([], t.model);
    } finally {
      c || (p.disabled = !1);
    }
  }
  function H() {
    !p || !p.value || (V(Y, p.value), O());
  }
  async function D() {
    if (f === "planning" || f === "applying") return;
    const t = String(y?.value || "").trim();
    if (!t) return;
    const r = e.agentBridge?.sessionId;
    if (!r) {
      m("error"), d(o("Agent session is not ready yet."));
      return;
    }
    P?.abort?.();
    const h = typeof AbortController == "function" ? new AbortController() : null;
    P = h, l = null, m("planning");
    const T = w();
    try {
      const v = await W(s, {
        sessionId: r,
        instruction: t,
        provider: {
          id: T.provider,
          model: T.model,
          base_url: T.baseUrl,
          max_output_tokens: T.maxOutputTokens,
          max_planner_steps: T.maxPlannerSteps,
          timeout_seconds: T.requestTimeoutSeconds
        }
      }, { signal: h?.signal });
      if (c || P !== h) return;
      if (v.finished) {
        l = null, m("idle"), d(v.message || o("The Agent finished without a change."));
        return;
      }
      l = {
        planId: v.plan_id,
        description: v.description,
        changes: v.changes || [],
        truncated: !!v.truncated
      }, m(l.truncated ? "error" : "preview_ready"), l.truncated && d(o("Preview was truncated; Apply is disabled for safety."));
    } catch (v) {
      if (c || v?.name === "AbortError") return;
      l = null, m("error"), d(v?.message || o("Preview failed"));
    }
  }
  async function R() {
    if (!l || f === "applying" || l.truncated) return;
    const t = l.planId;
    m("applying");
    try {
      if (await X(s, t), c) return;
      l = null, m("idle"), d(o("Applied."));
    } catch (r) {
      if (c) return;
      if (r?.code === "STALE_PLAN") {
        l = null, m("stale");
        return;
      }
      m("error"), d(r?.message || o("Apply failed"));
    }
  }
  function G() {
    P?.abort?.(), l = null, m("idle"), d("");
  }
  function q(t) {
    $ && ($.hidden = !t), t ? C?.focus?.() : C && (C.value = "");
  }
  async function J() {
    const t = w(), r = C?.value || "";
    if (C && (C.value = ""), !r) {
      q(!1);
      return;
    }
    try {
      await ee(s, t.provider, r);
    } catch (h) {
      c || d(h?.message || o("Could not save the credential"));
    } finally {
      q(!1), await I(), await E();
    }
  }
  async function F() {
    const t = w();
    try {
      await te(s, t.provider);
    } catch (r) {
      c || d(r?.message || o("Could not remove the credential"));
    } finally {
      await I(), await E();
    }
  }
  async function K() {
    const t = w();
    d(o("Testing..."));
    try {
      const r = await ne(s, t.provider, {
        model: t.model,
        base_url: t.baseUrl,
        timeout_seconds: t.requestTimeoutSeconds
      });
      if (c) return;
      d(r.ok ? o("Connection OK") : r.error?.message || o("Connection failed"));
    } catch (r) {
      c || d(r?.message || o("Connection failed"));
    }
  }
  function B(t) {
    const r = ae(t.target);
    if (r) {
      if (r.action === "preview") return void D();
      if (r.action === "apply") return void R();
      if (r.action === "cancel") return G();
      if (r.action === "credential-replace") return q($?.hidden !== !1);
      if (r.action === "credential-remove") return void F();
      if (r.action === "credential-test") return void K();
      if (r.action === "credential-save") return void J();
      if (r.action === "model-refresh") return void E();
    }
  }
  return u?.addEventListener("click", B), p?.addEventListener("change", H), O(), I(), E(), {
    get state() {
      return f;
    },
    dispose() {
      c = !0, P?.abort?.(), u?.removeEventListener("click", B), p?.removeEventListener("change", H);
    }
  };
}
export {
  le as createDirectorAgentPanel,
  M as modelSelectMarkup,
  oe as planChangesMarkup,
  ae as resolveAgentIntent
};
