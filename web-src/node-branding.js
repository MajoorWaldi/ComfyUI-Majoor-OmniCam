// Shared OmniCam node branding: the bundled mark drawn on every OmniCam node,
// with a discreet halo pulse while the node is active (selected on the canvas).

const OMNICAM_NODE_PREFIX = "MajoorOmniCam";
const ICON_URL = new URL("../web/assets/omnicam-icon.svg", import.meta.url).href;
const ICON_SIZE = 20;
let iconImage = null;

function getIconImage() {
  if (iconImage || typeof Image === "undefined") return iconImage;
  iconImage = new Image();
  iconImage.src = ICON_URL;
  return iconImage;
}

// A slow breath, so the "active" cue reads as alive without ever demanding
// attention. Wall-clock based, so every node pulses in sync.
function haloAlpha() {
  const period = 2600;
  const phase = (Date.now() % period) / period;
  return 0.12 + 0.10 * (0.5 - 0.5 * Math.cos(phase * Math.PI * 2));
}

export function registerOmniCamNodeBranding(app) {
  app.registerExtension({
    name: "MajoorOmniCam.NodeBranding",
    beforeRegisterNodeDef(nodeType, nodeData) {
      const nodeId = String(nodeData?.name || nodeData?.node_id || nodeType?.comfyClass || nodeType?.type || "");
      if (!nodeId.startsWith(OMNICAM_NODE_PREFIX)) return;
      const originalDrawForeground = nodeType.prototype.onDrawForeground;
      nodeType.prototype.onDrawForeground = function(ctx) {
        originalDrawForeground?.apply(this, arguments);
        if (this.flags?.collapsed) return;
        const icon = getIconImage();
        if (!icon?.complete || !icon.naturalWidth) return;

        const x = Math.max(4, Number(this.size?.[0] || 160) - ICON_SIZE - 6);
        const y = -26;
        const cx = x + ICON_SIZE / 2;
        const cy = y + ICON_SIZE / 2;

        ctx.save();
        // The halo only shows while the node is active, and only if the engine
        // keeps redrawing the canvas -- LiteGraph does so while a node is
        // selected, which is exactly when we want the pulse.
        if (this.selected) {
          const alpha = haloAlpha();
          const gradient = ctx.createRadialGradient(cx, cy, ICON_SIZE * 0.35, cx, cy, ICON_SIZE * 1.15);
          gradient.addColorStop(0, `rgba(136, 115, 253, ${alpha})`);
          gradient.addColorStop(1, "rgba(136, 115, 253, 0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(cx, cy, ICON_SIZE * 1.15, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 0.96;
        ctx.drawImage(icon, x, y, ICON_SIZE, ICON_SIZE);
        ctx.restore();
      };
    },
  });
}
