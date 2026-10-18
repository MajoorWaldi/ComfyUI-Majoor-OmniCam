import { n as x } from "./chunk-BhPt9Fl5.js";
import { v as s, am as N, bW as ie, bX as J, bY as P } from "./chunk-Czpt4cKc.js";
function Y(e, { text: n = "", tone: i = "info", busy: a = !1 } = {}) {
  const o = e.querySelector('[data-role="agent-hint"]'), l = e.querySelector('[data-role="agent-progress"]');
  o && (o.textContent = n, o.dataset.tone = i), l && (l.hidden = !a && i !== "success", l.dataset.busy = String(a), l.dataset.tone = i, l.setAttribute("aria-label", n), a ? l.removeAttribute("aria-valuenow") : l.setAttribute("aria-valuenow", "100"));
}
const ae = "/majoor/omnicam/agent/v1/plan", oe = "/majoor/omnicam/agent/v1/apply-plan";
async function X(e, n, i, { signal: a } = {}) {
  const o = await e.fetchApi(n, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(i),
    signal: a
  });
  let l = null;
  try {
    l = await o.json();
  } catch {
    l = null;
  }
  if (o.ok === !1) {
    const S = l?.error?.code || `HTTP_${o.status || 0}`, f = l?.error?.message || `OmniCam Agent plan request failed (${o.status})`, m = new Error(f);
    throw m.code = S, m.status = o.status || 0, m;
  }
  return l ?? {};
}
async function se(e, { sessionId: n, instruction: i, provider: a }, o) {
  return X(e, ae, {
    session_id: n,
    instruction: i,
    provider: a
  }, o);
}
async function le(e, n, i) {
  return X(e, oe, { plan_id: n }, i);
}
function O(e, n) {
  return `/majoor/omnicam/agent/v1/providers/${encodeURIComponent(e)}${n}`;
}
async function L(e, n, i, a) {
  const o = await e.fetchApi(i, {
    method: n,
    headers: a === void 0 ? void 0 : { "Content-Type": "application/json" },
    body: a === void 0 ? void 0 : JSON.stringify(a)
  });
  let l = null;
  try {
    l = await o.json();
  } catch {
    l = null;
  }
  if (o.ok === !1) {
    const S = l?.error?.code || `HTTP_${o.status || 0}`, f = l?.error?.message || `OmniCam Agent provider request failed (${o.status})`, m = new Error(f);
    throw m.code = S, m.status = o.status || 0, m;
  }
  return l ?? {};
}
async function ce(e) {
  return (await L(e, "GET", "/majoor/omnicam/agent/v1/providers")).providers || [];
}
async function de(e, n) {
  return L(e, "GET", O(n, "/status"));
}
async function ue(e, n, i) {
  try {
    return await L(e, "PUT", O(n, "/credential"), { secret: i });
  } finally {
    i = null;
  }
}
async function pe(e, n) {
  return L(e, "DELETE", O(n, "/credential"));
}
async function fe(e, n, i) {
  return L(e, "POST", O(n, "/test"), i || {});
}
async function ge(e, n, i) {
  return (await L(e, "POST", O(n, "/models"), i || {})).models || [];
}
const ve = {
  ollama: "Ollama",
  openai: "OpenAI",
  openai_compatible: "OpenAI-compatible",
  anthropic: "Anthropic"
};
function C(e) {
  return String(e ?? "").replace(/[&<>"']/g, (n) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[n]);
}
function me(e) {
  if (!e || !e.closest) return null;
  const n = e.closest("[data-agent-act]");
  return n ? { action: n.dataset.agentAct } : null;
}
function ye(e) {
  return !e || !e.length ? `<li class="oc-asset-empty">${s("No visible changes")}</li>` : e.map((n) => `<li>${C(n.entity)} · ${C(n.field)}</li>`).join("");
}
function V(e) {
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
function he(e) {
  const n = s(
    "Your instruction and the semantic scene information requested by the planner are sent to the configured model provider. Media files are not sent by Agent v1."
  );
  return e.provider === "ollama" ? V(e.baseUrl) ? s("Planning stays on the configured local Ollama endpoint.") : n : e.provider === "openai_compatible" && V(e.baseUrl) ? s("Planning stays on the configured local endpoint.") : n;
}
function K(e, n) {
  const i = Array.isArray(e) ? e : [];
  return i.length ? i.map((a) => `<option value="${C(a.id)}"${a.id === n ? " selected" : ""}>${C(a.label)}</option>`).join("") : `<option value="">${s("No providers found")}</option>`;
}
function W(e, n) {
  const i = Array.isArray(e) ? [...e] : [];
  return n && !i.includes(n) && i.unshift(n), i.length ? i.map((a) => `<option value="${C(a)}"${a === n ? " selected" : ""}>${C(a)}</option>`).join("") : `<option value="">${s("No models found")}</option>`;
}
function Pe(e, n = {}) {
  const i = e.root, a = n.api || e.api || e.app?.api, o = (t) => i.querySelector(`[data-role="${t}"]`), l = o("agent-panel"), S = o("agent-privacy-note"), f = o("agent-describe"), m = o("agent-plan"), y = o("agent-provider-select"), v = o("agent-model-select"), H = o("agent-provider-label"), q = o("agent-credential-status"), k = o("agent-credential-form"), T = o("agent-credential-input"), M = i.querySelector('[data-agent-act="preview"]'), U = i.querySelector('[data-agent-act="apply"]'), B = i.querySelector('[data-agent-act="cancel"]');
  let u = "idle", c = null, E = null, d = !1;
  function A(t, r = u === "error" ? "error" : u === "stale" ? "warning" : "info") {
    Y(i, {
      text: t || "",
      tone: r,
      busy: u === "planning" || u === "applying"
    });
  }
  function h(t, r) {
    A(t, r), x(e, t, r);
  }
  function _() {
    const t = P();
    if (H) {
      const p = ve[t.provider] || t.provider;
      H.textContent = `${p} · ${t.model || s("(no model set)")}`;
    }
    S && (S.textContent = he(t));
    const r = u === "planning" || u === "applying";
    if (M && (M.disabled = r), U && (U.disabled = !c || r || c.truncated || u === "stale"), B && (B.disabled = !c), f && (f.disabled = r), m && (m.innerHTML = c ? ye(c.changes) : ""), u === "planning") A(s("Planning..."));
    else if (u === "applying") A(s("Applying..."));
    else if (u === "stale") A(s("The Director changed after this preview. Generate a new preview."));
    else if (u === "preview_ready") {
      const p = c?.description || "", b = c?.warnings || [];
      A(b.length ? [p, ...b.map((g) => `⚠ ${g}`)].join(" ") : p, b.length ? "warning" : "success");
    }
  }
  function w(t) {
    u = t, _();
  }
  async function I() {
    if (d || !q) return;
    const t = P();
    try {
      const r = await de(a, t.provider);
      if (d) return;
      r.configured ? q.textContent = s("Configured") : q.textContent = s("Not configured");
    } catch {
      d || (q.textContent = s("Status unavailable"));
    }
  }
  async function z() {
    if (d || !y) return;
    const t = P();
    y.disabled = !0;
    try {
      const r = await ce(a);
      if (d) return;
      y.innerHTML = K(r, t.provider);
    } catch {
      if (d) return;
      y.innerHTML = K([], t.provider);
    } finally {
      d || (y.disabled = !1);
    }
  }
  async function $() {
    if (d || !v) return;
    const t = P();
    v.disabled = !0, v.innerHTML = `<option value="">${s("Loading models...")}</option>`;
    try {
      const r = await ge(a, t.provider, { base_url: t.baseUrl });
      if (d) return;
      let p = t.model;
      !p && r.length && (p = r[0], N(J(t.provider), p)), v.innerHTML = W(r, p), _();
    } catch {
      if (d) return;
      v.innerHTML = W([], t.model);
    } finally {
      d || (v.disabled = !1);
    }
  }
  function R() {
    !v || !v.value || (N(J(P().provider), v.value), _());
  }
  function D() {
    !y || !y.value || (N(ie, y.value), _(), I(), $());
  }
  async function Q() {
    if (u === "planning" || u === "applying") return;
    const t = String(f?.value || "").trim();
    if (!t) return;
    const r = e.agentBridge?.sessionId;
    if (!r) {
      w("error"), h(s("Agent session is not ready yet."), "error");
      return;
    }
    E?.abort?.();
    const p = typeof AbortController == "function" ? new AbortController() : null;
    E = p, c = null, w("planning");
    const b = P();
    try {
      const g = await se(a, {
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
      if (d || E !== p) return;
      if (g.finished) {
        c = null, w("idle"), h(g.message || s("The Agent finished without a change."), "success");
        return;
      }
      c = {
        planId: g.plan_id,
        description: g.description,
        changes: g.changes || [],
        warnings: g.warnings || [],
        truncated: !!g.truncated
      }, w(c.truncated ? "error" : "preview_ready"), c.truncated ? h(s("Preview was truncated; Apply is disabled for safety."), "error") : x(
        e,
        [c.description || s("No visible changes"), ...c.warnings].join(" "),
        c.warnings.length ? "warning" : "success"
      );
    } catch (g) {
      if (d || g?.name === "AbortError") return;
      c = null, w("error"), h(g?.message || s("Preview failed"), "error");
    }
  }
  async function Z() {
    if (!c || u === "applying" || c.truncated) return;
    const t = c.planId;
    w("applying");
    try {
      if (await le(a, t), d) return;
      c = null, w("idle"), h(s("Applied."), "success");
    } catch (r) {
      if (d) return;
      if (r?.code === "STALE_PLAN") {
        c = null, w("stale"), x(e, s("The Director changed after this preview. Generate a new preview."), "warning");
        return;
      }
      w("error"), h(r?.message || s("Apply failed"), "error");
    }
  }
  function ee() {
    E?.abort?.(), c = null, w("idle"), A("");
  }
  function j(t) {
    k && (k.hidden = !t), t ? T?.focus?.() : T && (T.value = "");
  }
  async function ne() {
    const t = P(), r = T?.value || "";
    if (T && (T.value = ""), !r) {
      j(!1);
      return;
    }
    try {
      await ue(a, t.provider, r);
    } catch (p) {
      d || h(p?.message || s("Could not save the credential"), "error");
    } finally {
      j(!1), await I(), await $();
    }
  }
  async function te() {
    const t = P();
    try {
      await pe(a, t.provider);
    } catch (r) {
      d || h(r?.message || s("Could not remove the credential"), "error");
    } finally {
      await I(), await $();
    }
  }
  async function re() {
    const t = P();
    A(s("Testing..."));
    try {
      const r = await fe(a, t.provider, {
        model: t.model,
        base_url: t.baseUrl,
        timeout_seconds: t.requestTimeoutSeconds
      });
      if (d) return;
      h(r.ok ? s("Connection OK") : r.error?.message || s("Connection failed"), r.ok ? "success" : "error");
    } catch (r) {
      d || h(r?.message || s("Connection failed"), "error");
    }
  }
  function G() {
    f && (f.style.height = "auto", f.style.height = `${f.scrollHeight}px`);
  }
  function F(t) {
    const r = me(t.target);
    if (r) {
      if (r.action === "preview") return void Q();
      if (r.action === "apply") return void Z();
      if (r.action === "cancel") return ee();
      if (r.action === "credential-replace") return j(k?.hidden !== !1);
      if (r.action === "credential-remove") return void te();
      if (r.action === "credential-test") return void re();
      if (r.action === "credential-save") return void ne();
      if (r.action === "model-refresh") return void $();
    }
  }
  return l?.addEventListener("click", F), y?.addEventListener("change", D), v?.addEventListener("change", R), f?.addEventListener("input", G), _(), z(), I(), $(), {
    get state() {
      return u;
    },
    dispose() {
      d = !0, Y(i), E?.abort?.(), l?.removeEventListener("click", F), y?.removeEventListener("change", D), v?.removeEventListener("change", R), f?.removeEventListener("input", G);
    }
  };
}
export {
  Pe as createDirectorAgentPanel,
  V as isLoopbackBaseUrl,
  W as modelSelectMarkup,
  ye as planChangesMarkup,
  he as providerPrivacyText,
  K as providerSelectMarkup,
  me as resolveAgentIntent
};
