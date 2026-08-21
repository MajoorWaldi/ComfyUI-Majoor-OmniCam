// Shared OmniCam node branding using the bundled SVG and extension hooks.

const OMNICAM_NODE_PREFIX = "MajoorOmniCam";
const ICON_URL = new URL("../web/assets/omnicam-icon.svg", import.meta.url).href;
let iconImage = null;

function getIconImage() {
  if (iconImage || typeof Image === "undefined") return iconImage;
  iconImage = new Image();
  iconImage.src = ICON_URL;
  return iconImage;
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
        const size = 20;
        const x = Math.max(4, Number(this.size?.[0] || 160) - size - 6);
        ctx.save();
        ctx.globalAlpha = 0.96;
        ctx.drawImage(icon, x, -26, size, size);
        ctx.restore();
      };
    },
  });
}
