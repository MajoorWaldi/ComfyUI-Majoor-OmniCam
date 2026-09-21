import { v as a, ak as x, bU as te, bV as J, bW as w } from "./chunk-Cg3_Iw1A.js";
const re = "/majoor/omnicam/agent/v1/plan", ie = "/majoor/omnicam/agent/v1/apply-plan";
async function K(e, n, i, { signal: o } = {}) {
  const s = await e.fetchApi(n, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(i),
    signal: o
  });
  let f = null;
  try {
    f = await s.json();
  } catch {
    f = null;
  }
  if (s.ok === !1) {
    const P = f?.error?.code || `HTTP_${s.status || 0}`, C = f?.error?.message || `OmniCam Agent plan request failed (${s.status})`, d = new Error(C);
    throw d.code = P, d.status = s.status || 0, d;
  }
  return f ?? {};
}
async function ae(e, { sessionId: n, instruction: i, provider: o }, s) {
  return K(e, re, {
    session_id: n,
    instruction: i,
    provider: o
  }, s);
}
async function oe(e, n, i) {
  return K(e, ie, { plan_id: n }, i);
}
function $(e, n) {
  return `/majoor/omnicam/agent/v1/providers/${encodeURIComponent(e)}${n}`;
}
async function S(e, n, i, o) {
  const s = await e.fetchApi(i, {
    method: n,
    headers: o === void 0 ? void 0 : { "Content-Type": "application/json" },
    body: o === void 0 ? void 0 : JSON.stringify(o)
  });
  let f = null;
  try {
    f = await s.json();
  } catch {
    f = null;
  }
  if (s.ok === !1) {
    const P = f?.error?.code || `HTTP_${s.status || 0}`, C = f?.error?.message || `OmniCam Agent provider request failed (${s.status})`, d = new Error(C);
    throw d.code = P, d.status = s.status || 0, d;
  }
  return f ?? {};
}
async function se(e) {
  return (await S(e, "GET", "/majoor/omnicam/agent/v1/providers")).providers || [];
}
async function le(e, n) {
  return S(e, "GET", $(n, "/status"));
}
async function ce(e, n, i) {
  try {
    return await S(e, "PUT", $(n, "/credential"), { secret: i });
  } finally {
    i = null;
  }
}
async function de(e, n) {
  return S(e, "DELETE", $(n, "/credential"));
}
async function ue(e, n, i) {
  return S(e, "POST", $(n, "/test"), i || {});
}
async function pe(e, n, i) {
  return (await S(e, "POST", $(n, "/models"), i || {})).models || [];
}
const fe = {
  ollama: "Ollama",
  openai: "OpenAI",
  openai_compatible: "OpenAI-compatible",
  anthropic: "Anthropic"
};
function A(e) {
  return String(e ?? "").replace(/[&<>"']/g, (n) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[n]);
}
function ge(e) {
  if (!e || !e.closest) return null;
  const n = e.closest("[data-agent-act]");
  return n ? { action: n.dataset.agentAct } : null;
}
function ve(e) {
  return !e || !e.length ? `<li class="oc-asset-empty">${a("No visible changes")}</li>` : e.map((n) => `<li>${A(n.entity)} · ${A(n.field)}</li>`).join("");
}
function F(e) {
  const n = String(e || "").trim();
  if (!n) return !0;
  let i;
  try {
    i = new URL(n).hostname;
  } catch {
    return !1;
  }
  return i === "127.0.0.1" || i === "localhost" || i === "::1" || i === "[::1]";
}
function me(e) {
  const n = a(
    "Your instruction and the semantic scene information requested by the planner are sent to the configured model provider. Media files are not sent by Agent v1."
  );
  return e.provider === "ollama" ? F(e.baseUrl) ? a("Planning stays on the configured local Ollama endpoint.") : n : e.provider === "openai_compatible" && F(e.baseUrl) ? a("Planning stays on the configured local endpoint.") : n;
}
function V(e, n) {
  const i = Array.isArray(e) ? e : [];
  return i.length ? i.map((o) => `<option value="${A(o.id)}"${o.id === n ? " selected" : ""}>${A(o.label)}</option>`).join("") : `<option value="">${a("No providers found")}</option>`;
}
function Y(e, n) {
  const i = Array.isArray(e) ? [...e] : [];
  return n && !i.includes(n) && i.unshift(n), i.length ? i.map((o) => `<option value="${A(o)}"${o === n ? " selected" : ""}>${A(o)}</option>`).join("") : `<option value="">${a("No models found")}</option>`;
}
function he(e, n = {}) {
  const i = e.root, o = n.api || e.api || e.app?.api, s = (t) => i.querySelector(`[data-role="${t}"]`), f = s("agent-panel"), P = s("agent-hint"), C = s("agent-privacy-note"), d = s("agent-describe"), j = s("agent-plan"), y = s("agent-provider-select"), m = s("agent-model-select"), U = s("agent-provider-label"), O = s("agent-credential-status"), k = s("agent-credential-form"), T = s("agent-credential-input"), H = i.querySelector('[data-agent-act="preview"]'), M = i.querySelector('[data-agent-act="apply"]'), N = i.querySelector('[data-agent-act="cancel"]');
  let g = "idle", c = null, L = null, l = !1;
  function u(t) {
    P && (P.textContent = t || "");
  }
  function E() {
    const t = w();
    if (U) {
      const p = fe[t.provider] || t.provider;
      U.textContent = `${p} · ${t.model || a("(no model set)")}`;
    }
    C && (C.textContent = me(t));
    const r = g === "planning" || g === "applying";
    if (H && (H.disabled = r), M && (M.disabled = !c || r || c.truncated || g === "stale"), N && (N.disabled = !c), d && (d.disabled = r), j && (j.innerHTML = c ? ve(c.changes) : ""), g === "planning") u(a("Planning..."));
    else if (g === "applying") u(a("Applying..."));
    else if (g === "stale") u(a("The Director changed after this preview. Generate a new preview."));
    else if (g === "preview_ready") {
      const p = c?.description || "", b = c?.warnings || [];
      u(b.length ? [p, ...b.map((v) => `⚠ ${v}`)].join(" ") : p);
    }
  }
  function h(t) {
    g = t, E();
  }
  async function I() {
    if (l || !O) return;
    const t = w();
    try {
      const r = await le(o, t.provider);
      if (l) return;
      r.configured ? O.textContent = r.source === "environment" ? a("Configured by server environment") : a("Configured") : O.textContent = a("Not configured");
    } catch {
      l || (O.textContent = a("Status unavailable"));
    }
  }
  async function W() {
    if (l || !y) return;
    const t = w();
    y.disabled = !0;
    try {
      const r = await se(o);
      if (l) return;
      y.innerHTML = V(r, t.provider);
    } catch {
      if (l) return;
      y.innerHTML = V([], t.provider);
    } finally {
      l || (y.disabled = !1);
    }
  }
  async function _() {
    if (l || !m) return;
    const t = w();
    m.disabled = !0, m.innerHTML = `<option value="">${a("Loading models...")}</option>`;
    try {
      const r = await pe(o, t.provider, { base_url: t.baseUrl });
      if (l) return;
      let p = t.model;
      !p && r.length && (p = r[0], x(J(t.provider), p)), m.innerHTML = Y(r, p), E();
    } catch {
      if (l) return;
      m.innerHTML = Y([], t.model);
    } finally {
      l || (m.disabled = !1);
    }
  }
  function B() {
    !m || !m.value || (x(J(w().provider), m.value), E());
  }
  function R() {
    !y || !y.value || (x(te, y.value), E(), I(), _());
  }
  async function z() {
    if (g === "planning" || g === "applying") return;
    const t = String(d?.value || "").trim();
    if (!t) return;
    const r = e.agentBridge?.sessionId;
    if (!r) {
      h("error"), u(a("Agent session is not ready yet."));
      return;
    }
    L?.abort?.();
    const p = typeof AbortController == "function" ? new AbortController() : null;
    L = p, c = null, h("planning");
    const b = w();
    try {
      const v = await ae(o, {
        sessionId: r,
        instruction: t,
        provider: {
          id: b.provider,
          model: b.model,
          base_url: b.baseUrl,
          max_output_tokens: b.maxOutputTokens,
          max_planner_steps: b.maxPlannerSteps,
          timeout_seconds: b.requestTimeoutSeconds
        }
      }, { signal: p?.signal });
      if (l || L !== p) return;
      if (v.finished) {
        c = null, h("idle"), u(v.message || a("The Agent finished without a change."));
        return;
      }
      c = {
        planId: v.plan_id,
        description: v.description,
        changes: v.changes || [],
        warnings: v.warnings || [],
        truncated: !!v.truncated
      }, h(c.truncated ? "error" : "preview_ready"), c.truncated && u(a("Preview was truncated; Apply is disabled for safety."));
    } catch (v) {
      if (l || v?.name === "AbortError") return;
      c = null, h("error"), u(v?.message || a("Preview failed"));
    }
  }
  async function Q() {
    if (!c || g === "applying" || c.truncated) return;
    const t = c.planId;
    h("applying");
    try {
      if (await oe(o, t), l) return;
      c = null, h("idle"), u(a("Applied."));
    } catch (r) {
      if (l) return;
      if (r?.code === "STALE_PLAN") {
        c = null, h("stale");
        return;
      }
      h("error"), u(r?.message || a("Apply failed"));
    }
  }
  function X() {
    L?.abort?.(), c = null, h("idle"), u("");
  }
  function q(t) {
    k && (k.hidden = !t), t ? T?.focus?.() : T && (T.value = "");
  }
  async function Z() {
    const t = w(), r = T?.value || "";
    if (T && (T.value = ""), !r) {
      q(!1);
      return;
    }
    try {
      await ce(o, t.provider, r);
    } catch (p) {
      l || u(p?.message || a("Could not save the credential"));
    } finally {
      q(!1), await I(), await _();
    }
  }
  async function ee() {
    const t = w();
    try {
      await de(o, t.provider);
    } catch (r) {
      l || u(r?.message || a("Could not remove the credential"));
    } finally {
      await I(), await _();
    }
  }
  async function ne() {
    const t = w();
    u(a("Testing..."));
    try {
      const r = await ue(o, t.provider, {
        model: t.model,
        base_url: t.baseUrl,
        timeout_seconds: t.requestTimeoutSeconds
      });
      if (l) return;
      u(r.ok ? a("Connection OK") : r.error?.message || a("Connection failed"));
    } catch (r) {
      l || u(r?.message || a("Connection failed"));
    }
  }
  function D() {
    d && (d.style.height = "auto", d.style.height = `${d.scrollHeight}px`);
  }
  function G(t) {
    const r = ge(t.target);
    if (r) {
      if (r.action === "preview") return void z();
      if (r.action === "apply") return void Q();
      if (r.action === "cancel") return X();
      if (r.action === "credential-replace") return q(k?.hidden !== !1);
      if (r.action === "credential-remove") return void ee();
      if (r.action === "credential-test") return void ne();
      if (r.action === "credential-save") return void Z();
      if (r.action === "model-refresh") return void _();
    }
  }
  return f?.addEventListener("click", G), y?.addEventListener("change", R), m?.addEventListener("change", B), d?.addEventListener("input", D), E(), W(), I(), _(), {
    get state() {
      return g;
    },
    dispose() {
      l = !0, L?.abort?.(), f?.removeEventListener("click", G), y?.removeEventListener("change", R), m?.removeEventListener("change", B), d?.removeEventListener("input", D);
    }
  };
}
export {
  he as createDirectorAgentPanel,
  F as isLoopbackBaseUrl,
  Y as modelSelectMarkup,
  ve as planChangesMarkup,
  me as providerPrivacyText,
  V as providerSelectMarkup,
  ge as resolveAgentIntent
};
