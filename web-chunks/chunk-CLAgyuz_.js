import { a, T as Q, bu as W, bv as h } from "./chunk-DkMP0xSq.js";
const X = "/majoor/omnicam/agent/v1/plan", Z = "/majoor/omnicam/agent/v1/apply-plan";
async function G(e, t, i, { signal: s } = {}) {
  const o = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(i),
    signal: s
  });
  let f = null;
  try {
    f = await o.json();
  } catch {
    f = null;
  }
  if (o.ok === !1) {
    const b = f?.error?.code || `HTTP_${o.status || 0}`, w = f?.error?.message || `OmniCam Agent plan request failed (${o.status})`, c = new Error(w);
    throw c.code = b, c.status = o.status || 0, c;
  }
  return f ?? {};
}
async function ee(e, { sessionId: t, instruction: i, provider: s }, o) {
  return G(e, X, {
    session_id: t,
    instruction: i,
    provider: s
  }, o);
}
async function te(e, t, i) {
  return G(e, Z, { plan_id: t }, i);
}
function A(e, t) {
  return `/majoor/omnicam/agent/v1/providers/${encodeURIComponent(e)}${t}`;
}
async function S(e, t, i, s) {
  const o = await e.fetchApi(i, {
    method: t,
    headers: s === void 0 ? void 0 : { "Content-Type": "application/json" },
    body: s === void 0 ? void 0 : JSON.stringify(s)
  });
  let f = null;
  try {
    f = await o.json();
  } catch {
    f = null;
  }
  if (o.ok === !1) {
    const b = f?.error?.code || `HTTP_${o.status || 0}`, w = f?.error?.message || `OmniCam Agent provider request failed (${o.status})`, c = new Error(w);
    throw c.code = b, c.status = o.status || 0, c;
  }
  return f ?? {};
}
async function ne(e, t) {
  return S(e, "GET", A(t, "/status"));
}
async function re(e, t, i) {
  try {
    return await S(e, "PUT", A(t, "/credential"), { secret: i });
  } finally {
    i = null;
  }
}
async function ie(e, t) {
  return S(e, "DELETE", A(t, "/credential"));
}
async function ae(e, t, i) {
  return S(e, "POST", A(t, "/test"), i || {});
}
async function oe(e, t, i) {
  return (await S(e, "POST", A(t, "/models"), i || {})).models || [];
}
const se = {
  ollama: "Ollama",
  openai: "OpenAI",
  openai_compatible: "OpenAI-compatible",
  anthropic: "Anthropic"
};
function E(e) {
  return String(e ?? "").replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t]);
}
function le(e) {
  if (!e || !e.closest) return null;
  const t = e.closest("[data-agent-act]");
  return t ? { action: t.dataset.agentAct } : null;
}
function ce(e) {
  return !e || !e.length ? `<li class="oc-asset-empty">${a("No visible changes")}</li>` : e.map((t) => `<li>${E(t.entity)} · ${E(t.field)}</li>`).join("");
}
function D(e) {
  const t = String(e || "").trim();
  if (!t) return !0;
  let i;
  try {
    i = new URL(t).hostname;
  } catch {
    return !1;
  }
  return i === "127.0.0.1" || i === "localhost" || i === "::1" || i === "[::1]" || i === "0.0.0.0";
}
function ue(e) {
  const t = a(
    "Your instruction and the semantic scene information requested by the planner are sent to the configured model provider. Media files are not sent by Agent v1."
  );
  return e.provider === "ollama" ? D(e.baseUrl) ? a("Planning stays on the configured local Ollama endpoint.") : t : e.provider === "openai_compatible" && D(e.baseUrl) ? a("Planning stays on the configured local endpoint.") : t;
}
function R(e, t) {
  const i = Array.isArray(e) ? [...e] : [];
  return t && !i.includes(t) && i.unshift(t), i.length ? i.map((s) => `<option value="${E(s)}"${s === t ? " selected" : ""}>${E(s)}</option>`).join("") : `<option value="">${a("No models found")}</option>`;
}
function fe(e, t = {}) {
  const i = e.root, s = t.api || e.api || e.app?.api, o = (n) => i.querySelector(`[data-role="${n}"]`), f = o("agent-panel"), b = o("agent-hint"), w = o("agent-privacy-note"), c = o("agent-describe"), I = o("agent-plan"), g = o("agent-model-select"), k = o("agent-provider-label"), _ = o("agent-credential-status"), $ = o("agent-credential-form"), C = o("agent-credential-input"), U = i.querySelector('[data-agent-act="preview"]'), N = i.querySelector('[data-agent-act="apply"]'), j = i.querySelector('[data-agent-act="cancel"]');
  let p = "idle", l = null, T = null, u = !1;
  function d(n) {
    b && (b.textContent = n || "");
  }
  function O() {
    const n = h();
    if (k) {
      const y = se[n.provider] || n.provider;
      k.textContent = `${y} · ${n.model || a("(no model set)")}`;
    }
    w && (w.textContent = ue(n));
    const r = p === "planning" || p === "applying";
    U && (U.disabled = r), N && (N.disabled = !l || r || l.truncated || p === "stale"), j && (j.disabled = !l), c && (c.disabled = r), I && (I.innerHTML = l ? ce(l.changes) : ""), p === "planning" ? d(a("Planning...")) : p === "applying" ? d(a("Applying...")) : p === "stale" ? d(a("The Director changed after this preview. Generate a new preview.")) : p === "preview_ready" && d(l?.description || "");
  }
  function m(n) {
    p = n, O();
  }
  async function q() {
    if (u || !_) return;
    const n = h();
    try {
      const r = await ne(s, n.provider);
      if (u) return;
      r.configured ? _.textContent = r.source === "environment" ? a("Configured by server environment") : a("Configured") : _.textContent = a("Not configured");
    } catch {
      u || (_.textContent = a("Status unavailable"));
    }
  }
  async function L() {
    if (u || !g) return;
    const n = h();
    g.disabled = !0, g.innerHTML = `<option value="">${a("Loading models...")}</option>`;
    try {
      const r = await oe(s, n.provider, { base_url: n.baseUrl });
      if (u) return;
      g.innerHTML = R(r, n.model);
    } catch {
      if (u) return;
      g.innerHTML = R([], n.model);
    } finally {
      u || (g.disabled = !1);
    }
  }
  function H() {
    !g || !g.value || (Q(W, g.value), O());
  }
  async function J() {
    if (p === "planning" || p === "applying") return;
    const n = String(c?.value || "").trim();
    if (!n) return;
    const r = e.agentBridge?.sessionId;
    if (!r) {
      m("error"), d(a("Agent session is not ready yet."));
      return;
    }
    T?.abort?.();
    const y = typeof AbortController == "function" ? new AbortController() : null;
    T = y, l = null, m("planning");
    const P = h();
    try {
      const v = await ee(s, {
        sessionId: r,
        instruction: n,
        provider: {
          id: P.provider,
          model: P.model,
          base_url: P.baseUrl,
          max_output_tokens: P.maxOutputTokens,
          max_planner_steps: P.maxPlannerSteps,
          timeout_seconds: P.requestTimeoutSeconds
        }
      }, { signal: y?.signal });
      if (u || T !== y) return;
      if (v.finished) {
        l = null, m("idle"), d(v.message || a("The Agent finished without a change."));
        return;
      }
      l = {
        planId: v.plan_id,
        description: v.description,
        changes: v.changes || [],
        truncated: !!v.truncated
      }, m(l.truncated ? "error" : "preview_ready"), l.truncated && d(a("Preview was truncated; Apply is disabled for safety."));
    } catch (v) {
      if (u || v?.name === "AbortError") return;
      l = null, m("error"), d(v?.message || a("Preview failed"));
    }
  }
  async function F() {
    if (!l || p === "applying" || l.truncated) return;
    const n = l.planId;
    m("applying");
    try {
      if (await te(s, n), u) return;
      l = null, m("idle"), d(a("Applied."));
    } catch (r) {
      if (u) return;
      if (r?.code === "STALE_PLAN") {
        l = null, m("stale");
        return;
      }
      m("error"), d(r?.message || a("Apply failed"));
    }
  }
  function Y() {
    T?.abort?.(), l = null, m("idle"), d("");
  }
  function x(n) {
    $ && ($.hidden = !n), n ? C?.focus?.() : C && (C.value = "");
  }
  async function K() {
    const n = h(), r = C?.value || "";
    if (C && (C.value = ""), !r) {
      x(!1);
      return;
    }
    try {
      await re(s, n.provider, r);
    } catch (y) {
      u || d(y?.message || a("Could not save the credential"));
    } finally {
      x(!1), await q(), await L();
    }
  }
  async function V() {
    const n = h();
    try {
      await ie(s, n.provider);
    } catch (r) {
      u || d(r?.message || a("Could not remove the credential"));
    } finally {
      await q(), await L();
    }
  }
  async function z() {
    const n = h();
    d(a("Testing..."));
    try {
      const r = await ae(s, n.provider, {
        model: n.model,
        base_url: n.baseUrl,
        timeout_seconds: n.requestTimeoutSeconds
      });
      if (u) return;
      d(r.ok ? a("Connection OK") : r.error?.message || a("Connection failed"));
    } catch (r) {
      u || d(r?.message || a("Connection failed"));
    }
  }
  function B() {
    c && (c.style.height = "auto", c.style.height = `${c.scrollHeight}px`);
  }
  function M(n) {
    const r = le(n.target);
    if (r) {
      if (r.action === "preview") return void J();
      if (r.action === "apply") return void F();
      if (r.action === "cancel") return Y();
      if (r.action === "credential-replace") return x($?.hidden !== !1);
      if (r.action === "credential-remove") return void V();
      if (r.action === "credential-test") return void z();
      if (r.action === "credential-save") return void K();
      if (r.action === "model-refresh") return void L();
    }
  }
  return f?.addEventListener("click", M), g?.addEventListener("change", H), c?.addEventListener("input", B), O(), q(), L(), {
    get state() {
      return p;
    },
    dispose() {
      u = !0, T?.abort?.(), f?.removeEventListener("click", M), g?.removeEventListener("change", H), c?.removeEventListener("input", B);
    }
  };
}
export {
  fe as createDirectorAgentPanel,
  D as isLoopbackBaseUrl,
  R as modelSelectMarkup,
  ce as planChangesMarkup,
  ue as providerPrivacyText,
  le as resolveAgentIntent
};
