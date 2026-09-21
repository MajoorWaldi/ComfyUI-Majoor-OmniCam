/**
 * Subject card placeholder design and aspect ratio utilities for OmniCam.
 * Generates a procedural studio proxy visual when no input image is connected,
 * and formats the subject card in the viewport to match connected image/video aspect ratio.
 */

let cachedPlaceholderCanvas = null;
let cachedPlaceholderTexture = null;

/**
 * Adjusts a card's size in-place to adopt the natural aspect ratio of the input media.
 * Keeps the vertical height stable (standing on ground) while scaling the width.
 * @param {object} object - The card scene object { id, type, size, ... }
 * @param {HTMLImageElement|HTMLVideoElement|object} media - The media element or image
 * @returns {boolean} Whether the size was updated
 */
export function applyMediaAspectToCard(object, media) {
  if (!object || !media) return false;
  const sw = Number(media.videoWidth || media.naturalWidth || media.width) || 0;
  const sh = Number(media.videoHeight || media.naturalHeight || media.height) || 0;
  if (!sw || !sh) return false;
  const aspect = sw / sh;
  const currentHeight = Number(object.size?.[1]) || 3;
  const newWidth = Math.round(currentHeight * aspect * 1000) / 1000;
  const currentWidth = Number(object.size?.[0]) || 2;
  if (Math.abs(currentWidth - newWidth) > 1e-3) {
    object.size = [newWidth, currentHeight, Number(object.size?.[2]) || 0.01];
    return true;
  }
  return false;
}

/**
 * Creates a high-resolution, procedural canvas graphic representing a designed
 * studio subject card proxy when no image is connected.
 * @param {number} width - Canvas width in pixels
 * @param {number} height - Canvas height in pixels
 * @returns {HTMLCanvasElement|null}
 */
export function createSubjectPlaceholderCanvas(width = 512, height = 768) {
  if (typeof document === "undefined" || !document.createElement) {
    return null;
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Helper for rounded rect compatibility
  const drawRoundRect = (x, y, w, h, r) => {
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }
  };

  // 1. Background gradient (deep cinematic dark studio)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#0b0f17");
  bgGrad.addColorStop(0.5, "#141b27");
  bgGrad.addColorStop(1, "#0a0e16");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Center studio spotlight / radial glow behind the subject
  const cx = width / 2;
  const cy = height * 0.42;
  const radialGlow = ctx.createRadialGradient(cx, cy, 20, cx, cy, width * 0.65);
  radialGlow.addColorStop(0, "rgba(56, 189, 248, 0.16)");
  radialGlow.addColorStop(0.45, "rgba(30, 41, 59, 0.35)");
  radialGlow.addColorStop(1, "rgba(10, 14, 22, 0)");
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // 3. Coordinate grid
  ctx.save();
  ctx.strokeStyle = "rgba(148, 163, 184, 0.07)";
  ctx.lineWidth = 1;
  const step = 32;
  for (let x = step; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = step; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Rule-of-thirds dashed lines
  if (typeof ctx.setLineDash === "function") ctx.setLineDash([4, 6]);
  ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
  ctx.beginPath();
  ctx.moveTo(width / 3, 0); ctx.lineTo(width / 3, height);
  ctx.moveTo((width * 2) / 3, 0); ctx.lineTo((width * 2) / 3, height);
  ctx.moveTo(0, height / 3); ctx.lineTo(width, height / 3);
  ctx.moveTo(0, (height * 2) / 3); ctx.lineTo(width, (height * 2) / 3);
  ctx.stroke();
  if (typeof ctx.setLineDash === "function") ctx.setLineDash([]);
  ctx.restore();

  // 4. Viewfinder / Camera Framing Brackets (4 corners)
  ctx.save();
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2.5;
  const pad = 24;
  const bracketLen = 28;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(pad, pad + bracketLen);
  ctx.lineTo(pad, pad);
  ctx.lineTo(pad + bracketLen, pad);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(width - pad - bracketLen, pad);
  ctx.lineTo(width - pad, pad);
  ctx.lineTo(width - pad, pad + bracketLen);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(pad, height - pad - bracketLen);
  ctx.lineTo(pad, height - pad);
  ctx.lineTo(pad + bracketLen, height - pad);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(width - pad - bracketLen, height - pad);
  ctx.lineTo(width - pad, height - pad);
  ctx.lineTo(width - pad, height - pad - bracketLen);
  ctx.stroke();
  ctx.restore();

  // 5. Center Reticle / Target ring at subject chest height
  const reticleY = height * 0.44;
  ctx.save();
  ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, reticleY, 56, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(56, 189, 248, 0.18)";
  ctx.beginPath();
  ctx.arc(cx, reticleY, 82, 0, Math.PI * 2);
  ctx.stroke();
  // Crosshair ticks
  ctx.strokeStyle = "rgba(56, 189, 248, 0.55)";
  ctx.beginPath();
  ctx.moveTo(cx - 16, reticleY); ctx.lineTo(cx + 16, reticleY);
  ctx.moveTo(cx, reticleY - 16); ctx.lineTo(cx, reticleY + 16);
  ctx.stroke();
  ctx.restore();

  // 6. Stylized Subject Silhouette (Actor / Humanoid figure)
  ctx.save();
  const headY = height * 0.31;
  const headR = 34;

  // Head
  ctx.fillStyle = "#182234";
  ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, headY, headR * 0.82, headR, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Head eye-line orient marker
  ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx - 14, headY - 2);
  ctx.lineTo(cx + 14, headY - 2);
  ctx.stroke();

  // Neck & Torso / Shoulders
  const neckY = headY + headR;
  const shoulderY = neckY + 22;
  const torsoBottom = height * 0.63;

  ctx.fillStyle = "#182234";
  ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 11, neckY);
  ctx.bezierCurveTo(cx - 18, shoulderY - 8, cx - 60, shoulderY, cx - 88, shoulderY + 24);
  ctx.bezierCurveTo(cx - 96, shoulderY + 50, cx - 82, torsoBottom - 20, cx - 66, torsoBottom);
  ctx.lineTo(cx + 66, torsoBottom);
  ctx.bezierCurveTo(cx + 82, torsoBottom - 20, cx + 96, shoulderY + 50, cx + 88, shoulderY + 24);
  ctx.bezierCurveTo(cx + 60, shoulderY, cx + 18, shoulderY - 8, cx + 11, neckY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Holographic contour cues
  ctx.strokeStyle = "rgba(56, 189, 248, 0.28)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx, neckY + 12);
  ctx.lineTo(cx, torsoBottom - 10);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(cx, shoulderY + 36, 44, 18, 0, 0, Math.PI);
  ctx.stroke();
  ctx.restore();

  // 7. Height scale markings along the right edge
  ctx.save();
  ctx.fillStyle = "rgba(148, 163, 184, 0.55)";
  ctx.font = "10px monospace";
  ctx.textAlign = "right";
  const rulerX = width - pad - 6;
  const heights = [
    { label: "1.8m", y: headY - headR },
    { label: "1.5m", y: reticleY },
    { label: "1.0m", y: torsoBottom },
    { label: "0.5m", y: height * 0.82 },
  ];
  for (const hItem of heights) {
    ctx.fillText(hItem.label, rulerX - 12, hItem.y + 3);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rulerX - 8, hItem.y);
    ctx.lineTo(rulerX, hItem.y);
    ctx.stroke();
  }
  ctx.restore();

  // 8. Top Pill Badge: "● SUBJECT PROXY"
  ctx.save();
  const badgeW = 180;
  const badgeH = 28;
  const badgeX = cx - badgeW / 2;
  const badgeY = pad + 10;
  drawRoundRect(badgeX, badgeY, badgeW, badgeH, 14);
  ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
  ctx.fill();
  ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Indicator dot
  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.arc(badgeX + 18, badgeY + badgeH / 2, 4, 0, Math.PI * 2);
  ctx.fill();

  // Badge text
  ctx.fillStyle = "#f1f5f9";
  ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("SUBJECT PROXY", badgeX + 30, badgeY + 18);
  ctx.restore();

  // 9. Lower Typography: Title, Subtitle, Help prompt
  ctx.save();
  ctx.textAlign = "center";

  // Main title
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
  ctx.fillText("SUBJECT CARD", cx, height * 0.73);

  // Subtitle
  ctx.fillStyle = "#94a3b8";
  ctx.font = "italic 13px system-ui, -apple-system, sans-serif";
  ctx.fillText("No input image connected", cx, height * 0.775);

  // Help button prompt
  const helpY = height * 0.85;
  const helpW = 250;
  const helpH = 32;
  drawRoundRect(cx - helpW / 2, helpY - helpH / 2, helpW, helpH, 6);
  ctx.fillStyle = "rgba(30, 41, 59, 0.75)";
  ctx.fill();
  ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#38bdf8";
  ctx.font = "12px system-ui, -apple-system, sans-serif";
  ctx.fillText("Connect IMAGE node or load file", cx, helpY + 4);

  // Subtle outer border highlight
  ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(1, 1, width - 2, height - 2);
  ctx.restore();

  return canvas;
}

/**
 * Returns a cached singleton canvas element for the subject placeholder.
 * @param {number} [width=512]
 * @param {number} [height=768]
 * @returns {HTMLCanvasElement|null}
 */
export function getSubjectPlaceholderCanvas(width = 512, height = 768) {
  if (!cachedPlaceholderCanvas) {
    cachedPlaceholderCanvas = createSubjectPlaceholderCanvas(width, height);
  }
  return cachedPlaceholderCanvas;
}

/**
 * Returns a cached Three.js CanvasTexture for the subject placeholder.
 * @param {object} THREE - The Three.js runtime
 * @returns {THREE.CanvasTexture|null}
 */
export function getSubjectPlaceholderTexture(THREE) {
  if (!THREE) return null;
  if (cachedPlaceholderTexture) return cachedPlaceholderTexture;
  const canvas = getSubjectPlaceholderCanvas();
  if (!canvas) return null;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  // Shared across every OmniCam viewport instance on the page: disposeObject()
  // must skip it rather than tearing down GPU state other instances still use.
  texture.userData.omnicamSharedResource = true;
  cachedPlaceholderTexture = texture;
  return texture;
}
