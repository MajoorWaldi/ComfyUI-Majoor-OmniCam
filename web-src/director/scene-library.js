// Director scene library: New / Open / Save / Reset.
//
// A "scene" is the whole editor state -- the same payload the `state_json`
// widget carries. The server-side store lives in omnicam/routes_scenes.py;
// this module drives it from the Scene toolbar menu.
//
// Adoption goes through restoreFromWidgets() rather than a second copy of the
// merge/cleanup logic: it already diffs object ids to release stale resources,
// resamples the camera, resyncs the number widgets and clears history. The one
// thing it does NOT do is read width/height/fps/duration from the incoming
// state (it reads them from the number widgets), so adoptSceneState pushes
// those first.

import { defaultState } from "./core.js";
import { confirmAction, omnicamListModal, promptText } from "./ui-services.js";
import { t } from "../i18n.js";

const SCENES_ROUTE = "/majoor/omnicam/scenes";

function currentSceneName(ui) {
  return ui.sceneName || ui.state?.metadata?.scene_name || "";
}

function fetchApi(ui, path, options) {
  const api = ui.api || (typeof window !== "undefined" ? window.app?.api : null);
  if (!api?.fetchApi) throw new Error("ComfyUI API is unavailable");
  return api.fetchApi(path, options);
}

/** Replace the node's state with `state` and rebuild the editor from it. */
export function adoptSceneState(ui, state, { name = "", status } = {}) {
  const source = state && typeof state === "object" ? state : defaultState();
  const next = { ...source, metadata: { ...(source.metadata || {}), scene_name: name || "" } };
  if (ui.stateWidget) ui.stateWidget.value = JSON.stringify(next);
  if (ui.widthWidget && next.width != null) ui.widthWidget.value = next.width;
  if (ui.heightWidget && next.height != null) ui.heightWidget.value = next.height;
  if (ui.fpsWidget && next.fps != null) ui.fpsWidget.value = next.fps;
  if (ui.durationWidget && next.fps && next.duration_frames != null) {
    ui.durationWidget.value = next.duration_frames / next.fps;
  }
  if (ui.modeWidget && next.render_mode != null) ui.modeWidget.value = next.render_mode;
  if (ui.cardWidget) ui.cardWidget.value = next.card_asset || "";

  ui.restoreFromWidgets();
  ui.sceneName = name || "";
  if (ui.state) ui.state.metadata = { ...ui.state.metadata, scene_name: ui.sceneName };
  ui.serialize?.();
  ui.sceneBaseline = ui.stateWidget?.value ?? JSON.stringify(next);
  ui.refreshCameraPreviews?.();
  ui.syncUpstreamInputs?.();
  ui.setStatus?.(status || t("Scene loaded"));
}

export async function newScene(ui) {
  const ok = await confirmAction(ui, t("New Scene"), t("Start a new scene? Unsaved changes will be lost."));
  if (!ok) return;
  adoptSceneState(ui, defaultState(), { name: "", status: t("New scene") });
}

export async function resetScene(ui) {
  if (!ui.sceneBaseline) {
    ui.setStatus?.(t("Nothing to revert to"));
    return;
  }
  const ok = await confirmAction(
    ui, t("Reset Scene"),
    t("Revert to the last saved or opened scene? Unsaved changes will be lost."),
  );
  if (!ok) return;
  let baseline;
  try {
    baseline = JSON.parse(ui.sceneBaseline);
  } catch {
    ui.setStatus?.(t("The saved scene could not be read"));
    return;
  }
  const name = baseline?.metadata?.scene_name || currentSceneName(ui);
  adoptSceneState(ui, baseline, { name, status: t("Scene reset to last save") });
}

export async function saveScene(ui) {
  const suggested = currentSceneName(ui) || t("Untitled");
  const answer = await promptText(ui, t("Save Scene"), t("Scene name"), suggested);
  if (answer == null) return;
  const name = String(answer).trim();
  if (!name) {
    ui.setStatus?.(t("The scene name cannot be empty"));
    return;
  }
  ui.serialize?.();
  let state;
  try {
    state = JSON.parse(ui.stateWidget?.value || "null") || ui.state;
  } catch {
    state = ui.state;
  }
  ui.setStatus?.(t("Saving scene…"));
  try {
    const response = await fetchApi(ui, SCENES_ROUTE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, state }),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    ui.sceneName = data.name || name;
    if (ui.state) ui.state.metadata = { ...ui.state.metadata, scene_name: ui.sceneName };
    ui.serialize?.();
    ui.sceneBaseline = ui.stateWidget?.value ?? JSON.stringify(state);
    ui.setStatus?.(t("Scene saved: {name}").replace("{name}", ui.sceneName));
  } catch (error) {
    console.error("[OmniCam] scene save failed", error);
    ui.setStatus?.(t("Scene save failed: {error}").replace("{error}", String(error?.message || error).slice(0, 120)));
  }
}

export async function openSceneDialog(ui) {
  let scenes;
  try {
    const response = await fetchApi(ui, SCENES_ROUTE);
    if (!response.ok) throw new Error(await response.text());
    scenes = (await response.json()).scenes || [];
  } catch (error) {
    console.error("[OmniCam] scene list failed", error);
    ui.setStatus?.(t("The scenes could not be listed: {error}").replace("{error}", String(error?.message || error).slice(0, 120)));
    return;
  }
  if (!scenes.length) {
    ui.setStatus?.(t("No saved scenes yet"));
    return;
  }
  const slug = await omnicamListModal({
    title: t("Open Scene"),
    owner: ui,
    items: scenes.map((scene) => ({
      id: scene.slug,
      label: scene.name || scene.slug,
      sublabel: formatWhen(scene.modified),
    })),
    onDelete: (id) => fetchApi(ui, `${SCENES_ROUTE}/${encodeURIComponent(id)}`, { method: "DELETE" })
      .catch((error) => console.warn("[OmniCam] scene delete failed", error)),
  });
  if (!slug) return;
  const ok = await confirmAction(ui, t("Open Scene"), t("Open this scene? Unsaved changes will be lost."));
  if (!ok) return;
  try {
    const response = await fetchApi(ui, `${SCENES_ROUTE}/${encodeURIComponent(slug)}`);
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    adoptSceneState(ui, data.state, {
      name: data.name || slug,
      status: t("Scene opened: {name}").replace("{name}", data.name || slug),
    });
  } catch (error) {
    console.error("[OmniCam] scene open failed", error);
    ui.setStatus?.(t("Scene open failed: {error}").replace("{error}", String(error?.message || error).slice(0, 120)));
  }
}

function formatWhen(seconds) {
  if (!Number.isFinite(seconds)) return "";
  try {
    return new Date(seconds * 1000).toLocaleString();
  } catch {
    return "";
  }
}
