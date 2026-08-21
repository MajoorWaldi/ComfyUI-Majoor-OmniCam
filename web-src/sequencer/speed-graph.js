import { sampleSpeedAt } from "./state.js";

export class SpeedGraphRenderer {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ui = ui;
    this.ctx = canvas.getContext("2d");
    this.pixelRatio = 1;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    this.canvas.width = Math.max(1, Math.round(rect.width * ratio));
    this.canvas.height = Math.max(1, Math.round(rect.height * ratio));
    this.pixelRatio = ratio;
  }

  render() {
    const ctx = this.ctx;
    const width = this.canvas.clientWidth || 1;
    const height = this.canvas.clientHeight || 1;
    ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#191920";
    ctx.fillRect(0, 0, width, height);
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#9494a8";

    const top = 26;
    const bottom = height - 18;
    const yForSpeed = (speed) => bottom - Math.min(1, Math.max(0, speed / 4)) * (bottom - top);
    for (const speed of [0.5, 1, 2, 4]) {
      const y = yForSpeed(speed);
      ctx.strokeStyle = speed === 1 ? "#6f9bca" : "#2e2e38";
      ctx.lineWidth = speed === 1 ? 1.5 : 1;
      ctx.beginPath(); ctx.moveTo(42, y); ctx.lineTo(width, y); ctx.stroke();
      ctx.fillStyle = speed === 1 ? "#9cc5ee" : "#77778a";
      ctx.fillText(`${speed.toFixed(1)}x`, 7, y + 4);
    }

    const shot = this.ui.state.shots?.[this.ui.state.selected_clip_id];
    this.lastRenderedShotId = shot ? this.ui.state.selected_clip_id : null;
    if (!shot) {
      ctx.fillStyle = "#77778a";
      ctx.fillText("Select a video clip to edit its speed curve", 52, Math.round(height / 2));
      return;
    }
    ctx.fillStyle = "#e8edf5";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(`${shot.name || shot.id || "Clip"} · Speed`, 52, 17);
    const duration = Math.max(1, shot.timeline?.duration_frames || 1);
    const curve = shot.retime?.curve || { keys: [{ frame: 0, value: 1 }] };
    const xForFrame = (frame) => 42 + Math.min(1, Math.max(0, frame / duration)) * (width - 50);
    ctx.strokeStyle = "#f2d06b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 42; x < width; x += 2) {
      const frame = ((x - 42) / Math.max(1, width - 50)) * duration;
      const y = yForSpeed(sampleSpeedAt(curve, frame));
      if (x === 42) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    for (const key of curve.keys || []) {
      ctx.fillStyle = "#ffe08a";
      ctx.beginPath(); ctx.arc(xForFrame(key.frame), yForSpeed(key.value), 4, 0, Math.PI * 2); ctx.fill();
    }
  }
}
