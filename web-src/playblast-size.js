// Drawing-buffer size for the recorded playblast. "viewport" keeps whatever the
// panel currently is; the other modes lock the output to the node's configured
// width x height so the proxy resolution is predictable regardless of layout.
// `inline` is a recording started from the node, whose viewport is a small
// preview rather than the working size "viewport" assumes: it records at the
// output size instead.
export function playblastDimensions(ui, { inline = false } = {}) {
  const current = { width: ui.canvas.width, height: ui.canvas.height };
  const configured = ui.state.playblast_resolution || "output";
  const mode = inline && configured === "viewport" ? "output" : configured;
  if (mode === "viewport") return current;
  const factor = mode === "half" ? 0.5 : mode === "double" ? 2 : 1;
  const outW = Math.max(16, Math.round(Number(ui.state.width) || current.width));
  const outH = Math.max(16, Math.round(Number(ui.state.height) || current.height));
  const cap = 3840;
  const scale = Math.min(factor, cap / Math.max(outW * factor, outH * factor));
  const even = (value) => Math.max(2, Math.round(value * scale / 2) * 2);
  return { width: even(outW), height: even(outH) };
}
