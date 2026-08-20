async function c(e, t) {
  if (t)
    try {
      const r = URL.createObjectURL(t);
      e.state.viewport_bg_image = r;
      const a = new Image();
      a.src = r, await a.decode().catch(() => {
      }), e.viewportBgImage = a, e.serialize(), e.render(), e.setStatus(`Background image set: ${t.name}`);
    } catch (r) {
      e.setStatus(`Failed to load BG image: ${r.message || r}`);
    }
}
async function o(e, t) {
  if (!t || !t.length) return;
  t.sort((a, n) => a.name.localeCompare(n.name, void 0, { numeric: !0, sensitivity: "base" }));
  const r = t.map((a) => URL.createObjectURL(a));
  e.state.viewport_bg_sequence = r, e.state.viewport_bg_image = "", e.viewportBgImage = null, e.viewportBgSequenceImages = [];
  for (const a of r) {
    const n = new Image();
    n.src = a, n.decode().catch(() => {
    }), e.viewportBgSequenceImages.push(n);
  }
  e.serialize(), e.render(), e.setStatus(`Background sequence loaded: ${t.length} frames`);
}
function s(e) {
  e.state.viewport_bg_image = "", e.state.viewport_bg_sequence = [], e.viewportBgImage = null, e.viewportBgSequenceImages = [], e.serialize(), e.render(), e.setStatus("Background cleared");
}
export {
  s as clearViewportBgImage,
  c as loadViewportBgFile,
  o as loadViewportBgSequence
};
