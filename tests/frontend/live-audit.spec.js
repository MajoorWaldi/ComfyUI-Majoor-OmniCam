import { test } from "@playwright/test";
import { writeFile } from "node:fs/promises";

// Audits the Director inside a REAL running ComfyUI.
//
//   OMNICAM_LIVE_URL=http://127.0.0.1:8188 OMNICAM_LIVE_MATCH=live-audit.spec.js \
//   npx playwright test --config playwright.live.config.mjs
//
// Never fires destructive actions (no cache clear, no playblast, no H3 setup).
// It opens every panel so nothing is audited while collapsed, then reports:
//   - controls with no real event listener (CDP, not guesswork)
//   - controls that are invisible, zero-sized or too small to hit
//   - controls overflowing their scroll container or overlapping each other

const SELECTOR = [
  "[data-act]", "[data-role]", "[data-select-mode]", "[data-transform-mode]",
  "[data-preset]", "[data-shake]", "[data-lens]", "[data-object-type]",
  "[data-blocking-scene]", "[data-tab]", "[data-channel-filter]",
  "[data-curve-mode]", "[data-tangent-mode]", "[data-interp]", "[data-dope-channel]",
].join(",");

const CONTROLS = new Set(["button", "select", "input", "summary", "textarea"]);
const MIN_HIT = 20;

test("audit the live director", async ({ page }) => {
  const consoleErrors = [];
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text().slice(0, 240)));
  page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`.slice(0, 240)));

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.app?.graph && window.LiteGraph, null, { timeout: 90000 });

  await page.evaluate(() => {
    const node = window.LiteGraph.createNode("MajoorOmniCamDirector");
    node.pos = [40, 40];
    window.app.graph.add(node);
    node.setSize([1180, 1360]);
    window.app.canvas?.setDirty?.(true, true);
  });
  await page.waitForSelector(".majoor-omnicam .oc-header", { timeout: 40000 });
  await page.waitForTimeout(2500);

  // Open every collapsible so nothing is measured while folded away, and walk
  // the three side tabs so their panels are laid out at least once.
  const passes = [];
  for (const tab of ["scene", "camera", "display"]) {
    await page.evaluate((name) => {
      const root = [...document.querySelectorAll(".majoor-omnicam")].find((el) => !el.classList.contains("context-menu"));
      root.querySelector(`[data-tab="${name}"]`)?.click();
      for (const details of root.querySelectorAll("details")) details.open = true;
    }, tab);
    await page.waitForTimeout(700);

    const rows = await page.evaluate((selector) => {
      const root = [...document.querySelectorAll(".majoor-omnicam")].find((el) => !el.classList.contains("context-menu"));
      const rootBox = root.getBoundingClientRect();
      return [...root.querySelectorAll(selector)].map((node, index) => {
        const box = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        let reason = null;
        for (let el = node; el && el !== root; el = el.parentElement) {
          const s = getComputedStyle(el);
          if (el.hidden) { reason = "hidden attribute"; break; }
          if (s.display === "none") { reason = "display:none"; break; }
          if (s.visibility === "hidden") { reason = "visibility:hidden"; break; }
          if (s.opacity === "0") { reason = "opacity:0"; break; }
        }
        // Clipped by an ancestor that scrolls or hides its overflow?
        let clipped = null;
        for (let el = node.parentElement; el && el !== root; el = el.parentElement) {
          const s = getComputedStyle(el);
          if (s.overflow === "visible" && s.overflowX === "visible" && s.overflowY === "visible") continue;
          const parent = el.getBoundingClientRect();
          if (box.right > parent.right + 1 || box.left < parent.left - 1
              || box.bottom > parent.bottom + 1 || box.top < parent.top - 1) {
            clipped = el.className || el.tagName;
            break;
          }
        }
        const d = node.dataset;
        return {
          index,
          tag: node.tagName.toLowerCase(),
          kind: node.getAttribute("type") || "",
          act: d.act || "", role: d.role || "",
          extra: ["selectMode", "transformMode", "preset", "shake", "lens", "objectType", "blockingScene",
            "tab", "channelFilter", "curveMode", "tangentMode", "interp", "dopeChannel"]
            .filter((k) => d[k] !== undefined).map((k) => `${k}=${d[k]}`).join(" "),
          label: (node.getAttribute("title") || node.getAttribute("aria-label") || node.textContent || "")
            .replace(/\s+/g, " ").trim().slice(0, 54),
          w: Math.round(box.width), h: Math.round(box.height),
          x: Math.round(box.x - rootBox.x), y: Math.round(box.y - rootBox.y),
          hiddenReason: reason,
          clipped,
          pointerEvents: style.pointerEvents,
          overflowsText: node.scrollWidth > node.clientWidth + 2 && CSS.supports("overflow", "hidden"),
        };
      });
    }, SELECTOR);
    passes.push({ tab, rows });
  }

  // Real event listeners, measured once with every panel open.
  const cdp = await page.context().newCDPSession(page);
  const count = await page.evaluate((selector) => {
    const root = [...document.querySelectorAll(".majoor-omnicam")].find((el) => !el.classList.contains("context-menu"));
    window.__audit = [...root.querySelectorAll(selector)];
    return window.__audit.length;
  }, SELECTOR);

  const listeners = [];
  for (let index = 0; index < count; index++) {
    const remote = await cdp.send("Runtime.evaluate", { expression: `window.__audit[${index}]` });
    let types = [];
    if (remote.result?.objectId) {
      const own = await cdp.send("DOMDebugger.getEventListeners", { objectId: remote.result.objectId, depth: 0 });
      types = (own.listeners || []).map((l) => l.type);
      await cdp.send("Runtime.releaseObject", { objectId: remote.result.objectId });
    }
    listeners.push(types);
  }
  await page.evaluate(() => { delete window.__audit; });

  const report = { consoleErrors: [...new Set(consoleErrors)], passes, listeners, CONTROLS: [...CONTROLS], MIN_HIT };
  await writeFile("test-results/live-audit.json", JSON.stringify(report, null, 1), "utf8");
  await page.locator(".majoor-omnicam").first().screenshot({ path: "test-results/live-director.png" });
  console.log(`AUDIT elements=${count} passes=${passes.length} consoleErrors=${report.consoleErrors.length}`);
});
