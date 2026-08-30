// F-Curves spline graph editor and tangent handles controller for OmniCam Director.

import { clamp, cloneCamera, cloneTransform, resolveChannelHandles, sampleCamera, sampleObjectTransform } from "./director/core.js";
import { t } from "./i18n.js";
import { drawTimeAxis, drawValueAxis } from "./curve-editor/axes.js";

export function curveChannels(ui) {
  const group = ui.root.querySelector('[data-role="curve-group"]')?.value || "camera";
  let allChannels = [];
  if (ui.timelineObject()) {
    const field = group === "target" ? "rotation" : group === "lens" ? "size" : "position";
    const prefix = group === "target" ? "rot" : group === "lens" ? "scale" : "pos";
    const title = field === "size" ? "Scale" : field[0].toUpperCase() + field.slice(1);
    allChannels = [0, 1, 2].map((index) => ({
      id: `${prefix}_${"xyz"[index]}`,
      name: `${title} ${"XYZ"[index]}`,
      color: ["#ef5350", "#53d86a", "#4aa3ef"][index],
      get: (transform) => (transform[field] || [0, 0, 0])[index],
      set: (transform, value) => {
        if (!transform[field]) transform[field] = [0, 0, 0];
        transform[field][index] = field === "size" ? Math.max(0.01, value) : value;
      },
    }));
  } else if (group === "target") {
    allChannels = [0, 1, 2].map((index) => ({
      id: `target_${"xyz"[index]}`,
      name: `Target ${"XYZ"[index]}`,
      color: ["#ef5350", "#53d86a", "#4aa3ef"][index],
      get: (camera) => (camera.target || [0, 0, 0])[index],
      set: (camera, value) => {
        if (!camera.target) camera.target = [0, 0, 0];
        camera.target[index] = value;
      },
    }));
  } else if (group === "camera") {
    // The default view: the five channels an animator actually watches while
    // blocking a shot, drawn together rather than split across three groups.
    allChannels = [
      ...[0, 1, 2].map((index) => ({
        id: `pos_${"xyz"[index]}`,
        name: `Position ${"XYZ"[index]}`,
        color: ["#ef5350", "#53d86a", "#4aa3ef"][index],
        get: (camera) => (camera.position || [0, 0, 0])[index],
        set: (camera, value) => {
          if (!camera.position) camera.position = [0, 0, 0];
          camera.position[index] = value;
        },
      })),
      { id: "fov", name: "Focal Length", color: "#43c7db", get: (camera) => camera.fov ?? 35, set: (camera, value) => { camera.fov = clamp(value, 5, 150); } },
      { id: "roll", name: "Roll", color: "#ec4899", get: (camera) => camera.roll || 0, set: (camera, value) => { camera.roll = clamp(value, -180, 180); } },
    ];
  } else if (group === "lens") {
    allChannels = [
      { id: "fov", name: "FOV", color: "#ef8b3e", get: (camera) => camera.fov ?? 35, set: (camera, value) => { camera.fov = clamp(value, 5, 150); } },
      { id: "roll", name: "Roll", color: "#43c7db", get: (camera) => camera.roll || 0, set: (camera, value) => { camera.roll = clamp(value, -180, 180); } },
      { id: "zoom", name: "Zoom", color: "#66d17a", get: (camera) => camera.zoom || 1, set: (camera, value) => { camera.zoom = Math.max(0.01, value); } },
    ];
  } else {
    allChannels = [0, 1, 2].map((index) => ({
      id: `pos_${"xyz"[index]}`,
      name: `Position ${"XYZ"[index]}`,
      color: ["#ef5350", "#53d86a", "#4aa3ef"][index],
      get: (camera) => (camera.position || [0, 0, 0])[index],
      set: (camera, value) => {
        if (!camera.position) camera.position = [0, 0, 0];
        camera.position[index] = value;
      },
    }));
  }

  const filter = ui.curveChannelFilter;
  if (filter && filter !== "all") {
    const idx = parseInt(filter, 10);
    if (!isNaN(idx) && allChannels[idx]) {
      return [allChannels[idx]];
    }
  }
  return allChannels;
}

export function drawCurveEditor(ui) {
  const canvas = ui.root.querySelector('[data-role="curve-canvas"]');
  if (!canvas) return;
  const width = canvas.clientWidth;
  const height = 180;
  if (!width) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const object = ui.timelineObject();
  const keys = ui.timelineKeyframes();
  const channels = curveChannels(ui);
  const left = 44, right = 14, top = 16, bottom = 22;
  const graphWidth = Math.max(1, width - left - right);
  const graphHeight = Math.max(1, height - top - bottom);
  const totalDuration = Math.max(1, ui.state.duration_frames - 1);

  // Horizontal (time/frame) zoom and pan
  const zoomX = clamp(Number(ui.curveZoomX) || 1.0, 0.1, 50.0);
  const panX = Number(ui.curvePanX) || 0;
  const timeSpan = totalDuration / zoomX;
  const timeMin = panX;
  const timeMax = panX + timeSpan;

  // Sample values for range computation
  const sampled = [];
  const sampleStep = Math.max(1, Math.ceil(timeSpan / Math.max(80, graphWidth)));
  const sampleValue = (frame) => (object ? sampleObjectTransform(object, frame) : sampleCamera(ui.state, frame));
  for (let frame = 0; frame <= totalDuration; frame += sampleStep) sampled.push({ frame, value: sampleValue(frame) });
  if (sampled[sampled.length - 1]?.frame !== totalDuration) sampled.push({ frame: totalDuration, value: sampleValue(totalDuration) });
  const values = sampled.flatMap((sample) => channels.map((channel) => channel.get(sample.value)));
  let minimum = Math.min(...values);
  let maximum = Math.max(...values);
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) {
    minimum = -1;
    maximum = 1;
  }
  if (Math.abs(maximum - minimum) < 1e-6) {
    minimum -= 1;
    maximum += 1;
  }
  const padding = (maximum - minimum) * 0.1;
  minimum -= padding;
  maximum += padding;

  // Vertical (value) zoom and pan
  const zoomY = clamp(Number(ui.curveZoom) || 1.0, 0.1, 50.0);
  const midVal = (maximum + minimum) / 2 + (Number(ui.curvePanY) || 0);
  const spanVal = (maximum - minimum) / zoomY;
  minimum = midVal - spanVal / 2;
  maximum = midVal + spanVal / 2;

  const xFor = (frame) => left + ((frame - timeMin) / Math.max(1e-6, timeMax - timeMin)) * graphWidth;
  const yFor = (value) => top + (graphHeight * (maximum - value)) / Math.max(1e-6, maximum - minimum);

  // Background
  ctx.fillStyle = "#111114";
  ctx.fillRect(0, 0, width, height);

  // Frame Time Grid (X axis)
  ctx.strokeStyle = "#222228";
  ctx.lineWidth = 1;
  ctx.font = "9px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#6e727a";
  drawTimeAxis(ctx, {
    left, right, top, width, graphWidth, graphHeight, height,
    timeMin, timeMax, totalDuration, xFor, frame: ui.frame,
  });

  // Value Grid (Y axis)
  drawValueAxis(ctx, { left, right, top, width, graphHeight, minimum, maximum, yFor });

  // Zero axis line if visible
  if (minimum <= 0 && maximum >= 0) {
    const zeroY = yFor(0);
    ctx.strokeStyle = "#383842";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(left, zeroY);
    ctx.lineTo(width - right, zeroY);
    ctx.stroke();
  }

  ui.curveHitPoints = [];

  // Draw Spline Curves
  for (const channel of channels) {
    ctx.strokeStyle = channel.color;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    let started = false;
    sampled.forEach((sample) => {
      const x = xFor(sample.frame);
      const y = yFor(channel.get(sample.value));
      if (x >= left - 50 && x <= width - right + 50) {
        if (started) ctx.lineTo(x, y);
        else {
          ctx.moveTo(x, y);
          started = true;
        }
      }
    });
    ctx.stroke();

    // Draw Keyframe Points
    for (const key of keys) {
      const value = object ? key.transform : key.camera;
      const x = xFor(key.frame);
      const y = yFor(channel.get(value));
      const isSelected = key.frame === ui.selectedKeyFrame || ui.selectedKeyFrames?.has(key.frame);

      // Outer Selection Glow
      if (isSelected) {
        ctx.fillStyle = "rgba(242, 208, 107, 0.35)";
        ctx.beginPath();
        ctx.arc(x, y, 8.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = isSelected ? "#ffd75e" : channel.color;
      ctx.strokeStyle = "#0d0d10";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 5.2 : 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ui.curveHitPoints.push({
        x,
        y,
        key,
        channel,
        minimum,
        maximum,
        timeMin,
        timeMax,
        graphHeight,
        graphWidth,
        lastFrame: totalDuration,
        left,
        top,
        object,
      });
    }

    // Draw Tangent Handles for Bezier Keyframes
    if (ui.showCurveHandles) {
      for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
        const key = keys[keyIndex];
        const isSelected = key.frame === ui.selectedKeyFrame || ui.selectedKeyFrames?.has(key.frame);
        const shouldShow = isSelected || ui.curveChannelFilter !== "all" || keys.length <= 4;
        if (!shouldShow || key.interpolation !== "bezier") continue;

        const value = object ? (key.transform || object) : (key.camera || key);
        const x = xFor(key.frame);
        const y = yFor(channel.get(value));
        const previous = keys[keyIndex - 1];
        const next = keys[keyIndex + 1];
        const prevSpan = Math.max(1, key.frame - (previous?.frame ?? key.frame - 1));
        const nextSpan = Math.max(1, (next?.frame ?? key.frame + 1) - key.frame);
        const handles = resolveChannelHandles(
          key,
          channel.id,
          previous,
          next,
          (k) => channel.get(object ? (k.transform || object) : (k.camera || key))
        );
        const valuePerPixel = (maximum - minimum) / Math.max(1, graphHeight);
        const pixelPerSegmentOut = ((graphWidth * nextSpan) / Math.max(1, timeSpan));
        const pixelPerSegmentIn = ((graphWidth * prevSpan) / Math.max(1, timeSpan));
        const points = [];
        if (previous || keyIndex > 0) {
          points.push({ side: "in", x: x + handles.in_x * pixelPerSegmentIn, y: y - handles.in_y / valuePerPixel });
        }
        if (next || keyIndex < keys.length - 1 || keys.length === 1) {
          points.push({ side: "out", x: x + handles.out_x * pixelPerSegmentOut, y: y - handles.out_y / valuePerPixel });
        }
        for (const point of points) {
          ctx.strokeStyle = channel.color;
          ctx.lineWidth = isSelected ? 1.5 : 1.0;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();

          ctx.fillStyle = isSelected ? "#2a2233" : "#171720";
          ctx.strokeStyle = isSelected ? "#ffd75e" : channel.color;
          ctx.lineWidth = isSelected ? 2.0 : 1.2;
          ctx.beginPath();
          if (point.side === "in") {
            ctx.arc(point.x, point.y, isSelected ? 5.0 : 3.8, 0, Math.PI * 2);
          } else {
            const s = isSelected ? 4.5 : 3.2;
            ctx.rect(point.x - s, point.y - s, s * 2, s * 2);
          }
          ctx.fill();
          ctx.stroke();

          ui.curveHitPoints.push({
            x: point.x,
            y: point.y,
            key,
            keyX: x,
            keyY: y,
            channel,
            minimum,
            maximum,
            timeMin,
            timeMax,
            top,
            left,
            graphHeight,
            graphWidth,
            lastFrame: totalDuration,
            object,
            handle: point.side,
            pixelPerSegment: point.side === "in" ? pixelPerSegmentIn : pixelPerSegmentOut,
            valuePerPixel,
            startHandles: { ...handles },
          });
        }
      }
    }
  }

  // Draw Marquee Selection Box
  if (ui.curveBoxSelect) {
    const bx = Math.min(ui.curveBoxSelect.startX, ui.curveBoxSelect.currentX);
    const by = Math.min(ui.curveBoxSelect.startY, ui.curveBoxSelect.currentY);
    const bw = Math.abs(ui.curveBoxSelect.currentX - ui.curveBoxSelect.startX);
    const bh = Math.abs(ui.curveBoxSelect.currentY - ui.curveBoxSelect.startY);
    ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(bx, by, bw, bh);
    ctx.setLineDash([]);
  }

  // Playhead Line
  const playheadX = xFor(ui.frame);
  if (playheadX >= left && playheadX <= width - right) {
    // Same accent as the dope-sheet playhead above: one playhead, one colour.
    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(playheadX, top);
    ctx.lineTo(playheadX, top + graphHeight);
    ctx.stroke();

    // Playhead Header Tag
    ctx.fillStyle = "#a78bfa";
    ctx.beginPath();
    ctx.moveTo(playheadX - 4, top);
    ctx.lineTo(playheadX + 4, top);
    ctx.lineTo(playheadX, top + 6);
    ctx.closePath();
    ctx.fill();
  }

  // Update tangent mode button states
  for (const button of ui.root.querySelectorAll("[data-tangent-mode]")) {
    const selectedKey = ui.selectedKeyframe();
    const mode = selectedKey?.tangents?.channels?.[channels[0]?.id]?.mode || selectedKey?.tangents?.mode || "auto";
    button.classList.toggle("active", button.dataset.tangentMode === mode);
  }
  for (const button of ui.root.querySelectorAll("[data-channel-filter]")) {
    button.classList.toggle("active", button.dataset.channelFilter === (ui.curveChannelFilter || "all"));
  }
  for (const button of ui.root.querySelectorAll("[data-curve-mode]")) {
    button.classList.toggle("active", button.dataset.curveMode === ui.selectedKeyframe()?.interpolation);
  }
}


export * from "./curve-editor/interactions.js";
