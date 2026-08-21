/**
 * Timeline Canvas Renderer for OmniCam Sequencer.
 * Renders ruler, video tracks, audio tracks, clips, trim handles, playhead and speed curves.
 */

export class SequencerTimelineRenderer {
  constructor(canvas, state, mediaPreviews = new Map()) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.state = state;
    this.rulerHeight = 28;
    this.trackHeight = 56;
    this.audioTrackHeight = 36;
    this.pixelsPerFrame = 4.0;
    this.pixelRatio = 1;
    this.mediaPreviews = mediaPreviews;
  }

  frameToX(frame) {
    const scroll = this.state.timeline.scroll_x || 0;
    const zoom = this.state.timeline.zoom || 1.0;
    return (frame - scroll) * this.pixelsPerFrame * zoom;
  }

  xToFrame(x) {
    const scroll = this.state.timeline.scroll_x || 0;
    const zoom = this.state.timeline.zoom || 1.0;
    return Math.round(x / (this.pixelsPerFrame * zoom) + scroll);
  }

  render() {
    const ctx = this.ctx;
    const width = this.canvas.clientWidth || this.canvas.width;
    const height = this.canvas.clientHeight || this.canvas.height;

    ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#191920";
    ctx.fillRect(0, 0, width, height);

    // Render Ruler
    this.renderRuler(ctx, width);

    // Render Video Track V1
    let trackY = this.rulerHeight + 8;
    this.renderVideoTrack(ctx, width, trackY);

    // Render Audio Tracks A1..An
    trackY += this.trackHeight + 8;
    this.renderAudioTracks(ctx, width, trackY);

    // Render Playhead line
    const playheadX = this.frameToX(this.state.timeline.playhead_frame || 0);
    if (playheadX >= 0 && playheadX <= width) {
      ctx.strokeStyle = "#e53e3e";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();

      // Head triangle
      ctx.fillStyle = "#e53e3e";
      ctx.beginPath();
      ctx.moveTo(playheadX - 6, 0);
      ctx.lineTo(playheadX + 6, 0);
      ctx.lineTo(playheadX, 12);
      ctx.closePath();
      ctx.fill();

    }
  }

  renderRuler(ctx, width) {
    ctx.fillStyle = "#1e1e24";
    ctx.fillRect(0, 0, width, this.rulerHeight);
    ctx.strokeStyle = "#333340";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, this.rulerHeight);
    ctx.lineTo(width, this.rulerHeight);
    ctx.stroke();

    ctx.fillStyle = "#9494a8";
    ctx.font = "10px sans-serif";

    const fps = this.state.timeline.fps_num || 24;
    const zoom = this.state.timeline.zoom || 1.0;
    const step = zoom > 2.0 ? 12 : zoom < 0.5 ? 48 : 24;

    const startF = Math.max(0, this.xToFrame(0));
    const endF = this.xToFrame(width) + step;

    for (let f = startF - (startF % step); f <= endF; f += step) {
      const x = this.frameToX(f);
      if (x < 0 || x > width) continue;

      ctx.strokeStyle = "#444456";
      ctx.beginPath();
      ctx.moveTo(x, this.rulerHeight - 8);
      ctx.lineTo(x, this.rulerHeight);
      ctx.stroke();

      const sec = (f / fps).toFixed(1);
      ctx.fillText(`${f}f (${sec}s)`, x + 3, this.rulerHeight - 12);
    }
  }

  renderVideoTrack(ctx, width, trackY) {
    // Track background
    ctx.fillStyle = "#1e1e26";
    ctx.fillRect(0, trackY, width, this.trackHeight);

    // Label
    ctx.fillStyle = "#718096";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("V1", 8, trackY + 16);

    const shots = this.state.shots || {};
    const order = this.state.shot_order || [];

    for (const shotId of order) {
      const shot = shots[shotId];
      if (!shot || !shot.enabled || !shot.timeline) continue;

      const tl = shot.timeline;
      const x = this.frameToX(tl.start_frame);
      const w = Math.max(4, (tl.duration_frames * this.pixelsPerFrame * (this.state.timeline.zoom || 1.0)) - 1);

      const isSelected = this.state.selected_clip_id === shotId;

      // Clip box
      ctx.fillStyle = isSelected ? "#35506c" : "#283c52";
      ctx.beginPath();
      ctx.roundRect(x, trackY + 4, w, this.trackHeight - 8, 4);
      ctx.fill();

      const preview = this.mediaPreviews.get(shot.source_slot);
      const ready = preview && (preview.complete || preview.readyState >= 2);
      if (ready && w > 28) {
        const mediaWidth = preview.videoWidth || preview.naturalWidth || preview.width || 1;
        const mediaHeight = preview.videoHeight || preview.naturalHeight || preview.height || 1;
        const boxX = x + 3, boxY = trackY + 6, boxW = Math.max(1, w - 6), boxH = this.trackHeight - 12;
        const scale = Math.max(boxW / mediaWidth, boxH / mediaHeight);
        const sourceW = boxW / scale, sourceH = boxH / scale;
        const sourceX = Math.max(0, (mediaWidth - sourceW) * 0.5);
        const sourceY = Math.max(0, (mediaHeight - sourceH) * 0.5);
        ctx.save();
        ctx.globalAlpha = isSelected ? 0.72 : 0.52;
        ctx.beginPath(); ctx.roundRect(boxX, boxY, boxW, boxH, 3); ctx.clip();
        ctx.drawImage(preview, sourceX, sourceY, sourceW, sourceH, boxX, boxY, boxW, boxH);
        ctx.restore();
        ctx.fillStyle = "rgba(8,10,14,.48)";
        ctx.fillRect(x + 3, trackY + 5, Math.min(w - 6, 190), 22);
      }

      if (isSelected) {
        ctx.strokeStyle = "#6f9bca";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Clip name & info
      ctx.fillStyle = "#ffffff";
      ctx.font = "11px sans-serif";
      const label = `${shot.name || shotId} (${tl.duration_frames}f)`;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + 4, trackY + 4, w - 8, this.trackHeight - 8);
      ctx.clip();
      ctx.fillText(label, x + 6, trackY + 22);

      if (shot.retime && shot.retime.enabled) {
        ctx.fillStyle = "#f2d06b";
        ctx.font = "9px sans-serif";
        ctx.fillText("⚡ Retimed", x + 6, trackY + 38);
      }
      ctx.restore();

      // Trim handles
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(x, trackY + 4, 3, this.trackHeight - 8);
      ctx.fillRect(x + w - 3, trackY + 4, 3, this.trackHeight - 8);
    }
  }

  renderAudioTracks(ctx, width, startY) {
    const audioTracks = this.state.audio_tracks || {};
    let trackY = startY;
    let trackIdx = 1;

    for (const [aid, audio] of Object.entries(audioTracks)) {
      if (!audio || !audio.enabled) continue;

      ctx.fillStyle = "#18181e";
      ctx.fillRect(0, trackY, width, this.audioTrackHeight);

      ctx.fillStyle = "#718096";
      ctx.font = "10px sans-serif";
      ctx.fillText(`A${trackIdx}`, 8, trackY + 14);

      const startF = (audio.timeline && audio.timeline.start_frame) || 0;
      const x = this.frameToX(startF);
      const w = 120 * this.pixelsPerFrame * (this.state.timeline.zoom || 1.0);

      ctx.fillStyle = "#29462d";
      if (this.state.selected_audio_id === aid) ctx.fillStyle = "#38603c";
      ctx.beginPath();
      ctx.roundRect(x, trackY + 2, w, this.audioTrackHeight - 4, 3);
      ctx.fill();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "10px sans-serif";
      const flags = `${audio.mute ? " M" : ""}${audio.solo ? " S" : ""}`;
      ctx.fillText(`${audio.name || aid}${flags}`, x + 6, trackY + 16);

      trackY += this.audioTrackHeight + 4;
      trackIdx++;
    }
  }
}
