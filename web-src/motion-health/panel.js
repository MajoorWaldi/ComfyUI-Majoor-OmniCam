// The Camera Health panel: grade the shot against a target model and repair it.
//
// Grading runs locally (see ../motion-health.js) so the verdict follows the
// playhead and every key drag without a server round trip. The limit numbers are
// not local: they are fetched once from /majoor/omnicam/motion_profiles, which
// serves the adapter tables. If that fetch fails the panel says so rather than
// inventing a threshold -- a made-up limit is worse than no limit.

import { t } from "../i18n.js";
import { motionHealthReport, problemZones } from "../motion-health.js";
import { timelinePercentForFrame } from "../timeline-interaction.js";
import { flaggedRanges, rangesForMetric, recenterKeysInRanges, retimeConstantSpeed, smoothKeysInRanges } from "./actions.js";

// Built per call rather than held in a module constant: t() resolves against the
// locale active at call time, and a constant would freeze whichever locale
// happened to be set when this module was first imported. It also keeps every
// key a literal, which is what scripts/check_locales.mjs scans for.
function metricLabel(metric) {
  return {
    speed: t("Travel speed"),
    angular_speed: t("Rotation speed"),
    acceleration: t("Acceleration"),
    jerk: t("Jerk"),
    framing_loss: t("Subject out of frame"),
    fov_drift: t("FOV change"),
  }[metric] || metric;
}

function gradeLabel(grade) {
  return {
    ok: t("Within limits"),
    warn: t("Near the limit"),
    over: t("Over the limit"),
  }[grade] || grade;
}

let profileCache = null;
let comfyApi = null;

export function configureMotionHealthApi(api) {
  comfyApi = api;
}

/** Fetch the adapter limit tables once per session. Null means "unavailable".
 *
 * The API is injected by the root entry so Node tests can import timeline
 * modules without resolving ComfyUI's browser-only runtime.
 */
export async function loadMotionProfiles() {
  if (profileCache) return profileCache;
  try {
    if (!comfyApi) return null;
    const response = await comfyApi.fetchApi("/majoor/omnicam/motion_profiles");
    if (!response.ok) return null;
    profileCache = await response.json();
    return profileCache;
  } catch {
    return null;
  }
}

function selectedProfileId(ui) {
  return ui.root.querySelector('[data-role="health-profile"]')?.value || ui.state?.health_profile || "generic";
}

function limitsFor(ui, profileId) {
  const entry = ui.motionProfiles?.profiles?.find((profile) => profile.id === profileId);
  return entry ? entry.limits : null;
}

/** The current report, or null when the limit tables could not be loaded. */
export function healthReport(ui) {
  const profileId = selectedProfileId(ui);
  const limits = limitsFor(ui, profileId);
  if (!limits) return null;
  return motionHealthReport(ui.state, limits, null, profileId);
}

function formatNumber(value) {
  return Number(value).toFixed(Math.abs(value) >= 100 ? 0 : 1);
}

function metricRow(metric, value, recommended, grade) {
  const limitText = recommended === undefined || recommended === null
    ? t("no limit")
    : `${formatNumber(value)} / ${formatNumber(recommended)}`;
  return `
    <div class="oc-health-metric" data-grade="${grade}">
      <span class="oc-health-dot"></span>
      <span class="oc-health-metric-name">${metricLabel(metric)}</span>
      <span class="oc-health-metric-value">${limitText}</span>
    </div>`;
}

function gradeOf(value, recommended, warnRatio) {
  if (recommended === undefined || recommended === null || recommended <= 0) return "ok";
  if (value > recommended) return "over";
  return value > recommended * warnRatio ? "warn" : "ok";
}

function zoneList(report) {
  const zones = problemZones(report);
  if (!zones.length) return `<div class="oc-health-empty">${t("No problem zone on this shot.")}</div>`;
  return zones.slice(0, 6).map((zone) => {
    const reasons = zone.metrics.map((metric) => metricLabel(metric)).join(", ");
    const label = zone.start === zone.end
      ? t("Frame {frame}").replace("{frame}", String(zone.start))
      : t("Frames {start}-{end}").replace("{start}", String(zone.start)).replace("{end}", String(zone.end));
    return `
      <button type="button" class="oc-health-zone" data-grade="${zone.grade}" data-zone-start="${zone.start}"
              title="${t("Jump the playhead to this zone")}">
        <span class="oc-health-dot"></span><span class="oc-health-zone-range">${label}</span>
        <span class="oc-health-zone-reason">${reasons}</span>
      </button>`;
  }).join("");
}

export function renderHealthPanel(ui) {
  const body = ui.root.querySelector('[data-role="health-body"]');
  const badge = ui.root.querySelector('[data-role="health-badge"]');
  if (!body || !badge) return;

  if (!ui.motionProfiles) {
    badge.className = "oc-health-badge";
    badge.textContent = t("Unavailable");
    body.innerHTML = `<div class="oc-health-empty">${t("Could not load the recommended limits from the OmniCam server. The panel will not guess a threshold.")}</div>`;
    return;
  }

  const report = healthReport(ui);
  if (!report) return;
  ui.healthReport = report;
  const { warn_ratio: warnRatio } = report;

  badge.className = `oc-health-badge ${report.grade}`;
  badge.textContent = gradeLabel(report.grade);

  const metrics = [
    metricRow("speed", report.max_speed, report.limits.max_speed,
      gradeOf(report.max_speed, report.limits.max_speed, warnRatio)),
    metricRow("angular_speed", report.max_angular_speed, report.limits.max_angular_speed,
      gradeOf(report.max_angular_speed, report.limits.max_angular_speed, warnRatio)),
    metricRow("acceleration", report.max_acceleration, report.limits.max_acceleration,
      gradeOf(report.max_acceleration, report.limits.max_acceleration, warnRatio)),
    metricRow("jerk", report.max_jerk, report.limits.max_jerk,
      gradeOf(report.max_jerk, report.limits.max_jerk, warnRatio)),
    metricRow("fov_drift", report.max_fov_change, report.limits.max_fov_change, report.track_grades.fov_drift),
  ].join("");

  const framing = report.framing_loss_frames
    ? `<div class="oc-health-metric" data-grade="over"><span class="oc-health-dot"></span>
         <span class="oc-health-metric-name">${metricLabel("framing_loss")}</span>
         <span class="oc-health-metric-value">${t("{count} frames").replace("{count}", String(report.framing_loss_frames))}</span>
       </div>`
    : "";

  body.innerHTML = `
    <div class="oc-health-metrics">${metrics}${framing}</div>
    <div class="oc-section">${t("Problem zones")}</div>
    <div class="oc-health-zones" data-role="health-zones">${zoneList(report)}</div>
    <div class="oc-card-actions oc-health-actions">
      <button data-act="health-slow" title="${t("Respace the keys so the shot travels at a constant speed")}"><i class="pi pi-clock"></i> ${t("Slow to limits")}</button>
      <button data-act="health-smooth" title="${t("Blend the keys inside the flagged zones only")}"><i class="pi pi-chart-line"></i> ${t("Smooth flagged")}</button>
      <button data-act="health-recenter" title="${t("Aim the keys of the flagged zones back at the subject")}"><i class="pi pi-crosshairs"></i> ${t("Recenter subject")}</button>
    </div>
    <p class="oc-health-note">${t("A valid trajectory stays inside the limits recommended for this model. It is not a guarantee about the generated video.")}</p>`;
}

/** Paint the flagged ranges under the keyframe lane.
 *
 * Called from refreshKeys(), which runs after every edit, so the report is
 * recomputed here rather than read from a cache that a key drag would stale.
 */
export function renderHealthZones(ui, box) {
  if (!box || !ui.motionProfiles) return;
  const report = healthReport(ui);
  if (!report) return;
  ui.healthReport = report;
  for (const segment of report.segments) {
    if (segment.grade === "ok") continue;
    const startPct = timelinePercentForFrame(ui, segment.start);
    const endPct = timelinePercentForFrame(ui, segment.end + 1);
    if (endPct < -5 || startPct > 105) continue;
    const zone = document.createElement("div");
    zone.className = "oc-health-band";
    zone.dataset.grade = segment.grade;
    zone.style.left = `${startPct}%`;
    zone.style.width = `${Math.max(0.4, endPct - startPct)}%`;
    zone.title = segment.metrics.map((metric) => metricLabel(metric)).join(", ");
    box.appendChild(zone);
  }
}

function applyKeys(ui, keys, label, status) {
  const camera = ui.activeCameraTrack();
  if (!camera) return;
  ui.checkpoint(label);
  // state.keyframes aliases the active camera's array and syncActiveCameraTrack()
  // copies it back, so both sides must be replaced or the sync undoes the edit.
  camera.keyframes = keys;
  ui.state.keyframes = keys;
  ui.syncActiveCameraTrack();
  ui.refreshKeys();
  ui.setFrame(ui.frame, false, false);
  ui.setStatus(status);
  renderHealthPanel(ui);
}

export function slowToLimits(ui) {
  // Recomputed, never read from ui.healthReport: a repair must act on the
  // shot as it is now, not on whatever the last render happened to cache.
  const report = healthReport(ui);
  if (!report) return;
  const target = report.limits.max_speed;
  if (!target) {
    ui.setStatus(t("This profile sets no speed limit."));
    return;
  }
  const lastFrame = Math.max(1, ui.state.duration_frames - 1);
  const retimed = retimeConstantSpeed(ui.state.keyframes, lastFrame);
  const after = motionHealthReport({ ...ui.state, keyframes: retimed }, report.limits, null, report.profile);

  if (after.max_speed <= target) {
    applyKeys(ui, retimed, "Slow to limits", t("Speed flattened; the shot keeps its length."));
    return;
  }
  // Path and duration are both fixed, so the average speed is fixed too: no
  // re-time can go below it. Say what the shot would actually need instead of
  // silently lengthening it behind the animator's back.
  const requiredSeconds = (after.max_speed / target) * (ui.state.duration_frames / Math.max(1, ui.state.fps));
  applyKeys(ui, retimed, "Slow to limits", t("Speed flattened, still over: this path needs about {seconds}s to fit the limit.")
    .replace("{seconds}", requiredSeconds.toFixed(1)));
}

export function smoothFlaggedZones(ui) {
  // Recomputed, never read from ui.healthReport: a repair must act on the
  // shot as it is now, not on whatever the last render happened to cache.
  const report = healthReport(ui);
  if (!report) return;
  const ranges = flaggedRanges(report);
  if (!ranges.length) {
    ui.setStatus(t("Nothing is flagged on this shot."));
    return;
  }
  const smoothed = smoothKeysInRanges(ui.state.keyframes, ranges, 0.6);
  applyKeys(ui, smoothed, "Smooth flagged zones",
    t("Smoothed {count} flagged zone(s).").replace("{count}", String(ranges.length)));
}

export function recenterSubject(ui) {
  // Recomputed, never read from ui.healthReport: a repair must act on the
  // shot as it is now, not on whatever the last render happened to cache.
  const report = healthReport(ui);
  if (!report) return;
  const ranges = rangesForMetric(report, "framing_loss");
  if (!ranges.length) {
    ui.setStatus(t("The subject stays in frame on this shot."));
    return;
  }
  const recentred = recenterKeysInRanges(ui.state.keyframes, ranges, report.subject);
  applyKeys(ui, recentred, "Recenter subject",
    t("Recentred {count} zone(s) on the subject.").replace("{count}", String(ranges.length)));
}
