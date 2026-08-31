// Paints the axis gizmo SVG from the camera basis. See axis-gizmo.js for why
// this is DOM rather than a second WebGL pass.

import { axisOpacity, axisScreenDirections, sortedByDepth } from "./axis-gizmo.js";
import { t } from "./i18n.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const CENTER = 26; // half of the 52x52 viewBox
const ARM = 17;    // axis length in viewBox units
const TIP = 5.4;   // radius of the labelled tip

function element(name, attributes) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  return node;
}

export function drawAxisGizmo(ui) {
  const svg = ui.root?.querySelector('[data-role="viewport-axis"]');
  if (!svg) return;
  const camera = ui.viewportCamera ? ui.viewportCamera() : ui.camera;
  if (!camera) return;

  svg.replaceChildren();

  const centerCircle = element("circle", {
    "data-axis-center": "",
    cx: CENTER, cy: CENTER, r: 4,
    fill: "#A78BFA",
    tabindex: "0",
    role: "button",
    "pointer-events": "auto",
    "aria-label": t("Frame selection"),
  });
  const centerTitle = element("title", {});
  centerTitle.textContent = t("Frame selection");
  centerCircle.appendChild(centerTitle);
  svg.appendChild(centerCircle);

  for (const axis of sortedByDepth(axisScreenDirections(camera))) {
    const endX = CENTER + axis.x * ARM;
    const endY = CENTER + axis.y * ARM;
    const opacity = axisOpacity(axis.depth);

    svg.appendChild(element("line", {
      x1: CENTER, y1: CENTER, x2: endX, y2: endY,
      stroke: axis.color, "stroke-width": 1.8, "stroke-linecap": "round", opacity,
    }));
    
    const isActive = axis.depth >= 0;
    const circle = element("circle", {
      cx: endX, cy: endY, r: TIP,
      fill: isActive ? axis.color : "transparent",
      stroke: axis.color, "stroke-width": 1.4, opacity,
      "data-axis": axis.label.toLowerCase(),
      tabindex: "0",
      role: "button",
      "aria-label": t("View: {axis} axis").replace("{axis}", axis.label),
      "pointer-events": "auto",
    });
    const title = element("title", {});
    title.textContent = t("View: {axis} axis").replace("{axis}", axis.label);
    circle.appendChild(title);
    svg.appendChild(circle);

    // The label only fits on the tip facing the viewer; the far one stays a dot.
    if (isActive) {
      const label = element("text", {
        x: endX, y: endY, "text-anchor": "middle", "dominant-baseline": "central",
        "font-size": 7, "font-weight": 700, fill: "#101014",
      });
      label.textContent = axis.label;
      svg.appendChild(label);
    }
  }
}
