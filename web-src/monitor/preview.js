import { escapeHtml } from "./html.js";

export function previewBadge(preview) { return preview?.exact_output_representation ? "OUTPUT PREVIEW" : "DIAGNOSTIC"; }

export function renderPreview(container, preview = {}) {
  const badge = previewBadge(preview); const payload = preview.payload || {};
  if (preview.kind === "proxy_video") {
    container.innerHTML = `<div class="oc-preview-label"><span>${badge}</span> ${escapeHtml(preview.label)}</div><div class="oc-empty">Proxy Monitor above is the H3 Omni Reference output preview.</div>`;
  } else if (preview.kind === "trajectory_overlay") {
    const count = Array.isArray(payload.tracks) ? payload.tracks.length : 0;
    container.innerHTML = `<div class="oc-preview-label"><span>${badge}</span> ${escapeHtml(preview.label)}</div><canvas class="oc-trajectory-canvas" width="${Number(payload.width || 832)}" height="${Number(payload.height || 480)}" aria-label="Projected trajectory preview"></canvas><small>${count} trajectory samples</small>`;
    drawTrajectories(container.querySelector?.(".oc-trajectory-canvas"), payload.tracks || []);
  } else if (preview.kind === "camera_path") {
    container.innerHTML = `<div class="oc-preview-label"><span>${badge}</span> ${escapeHtml(preview.label)}</div><div class="oc-path-summary">${(payload.points || []).length} camera samples · ${payload.valid_4n_plus_1 ? "4n+1 valid" : "length requires 4n+1"}</div>`;
  } else if (preview.kind === "frame_sequence") {
    container.innerHTML = `<div class="oc-preview-label"><span>${badge}</span> ${escapeHtml(preview.label)}</div><div class="oc-frame-strip">${(payload.indices || []).slice(0, 24).map((index) => `<span>${index}</span>`).join("")}</div>`;
  } else container.innerHTML = '<div class="oc-empty">No adapter preview available.</div>';
}

function drawTrajectories(canvas, tracks) {
  const ctx = canvas?.getContext?.("2d"); if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.strokeStyle = "#8b7bd8"; ctx.lineWidth = 2;
  for (const track of tracks) {
    const points = Array.isArray(track) ? track : track?.points;
    if (!Array.isArray(points) || !points.length) continue;
    ctx.beginPath(); points.forEach((point, index) => { const x = Number(point[0] ?? point.x); const y = Number(point[1] ?? point.y); index ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
  }
}
