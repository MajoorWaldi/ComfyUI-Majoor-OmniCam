// Orchestrator for the scene reconstruction panel.

import { loadReconstructionCapabilities } from "./capabilities.js";
import { bindReconstructionControls } from "./controls.js";
import { ReconstructionClient } from "./client.js";
import {
  initialReconstructionState,
  reduceReconstructionState,
} from "./state.js";
import { hydratePanelFromWidgets, syncWidgetsFromPanel } from "./settings-sync.js";
import { updateReconstructionModeVisibility } from "./controls.js";
import { renderReconstructionView } from "./views.js";
import { annotatedAssetUrl } from "../../shared/managed-assets.js";
import { confirmAction } from "../../director/ui-services.js";
import { t } from "../../i18n.js";

export class ReconstructionPanelController {
  constructor({
    root,
    node,
    api,
    app = null,
    getSource = () => null,
    onAdopt = () => {},
    onQueue = () => {},
    onCancel = () => {},
    listen = (target, event, handler) => target?.addEventListener?.(event, handler),
  }) {
    this.root = root;
    this.node = node;
    this.api = api;
    this.app = app;
    this.getSource = getSource;
    this.onAdopt = onAdopt;
    // Start / Stop delegate to the parent's partial-queue path. The panel keeps
    // capabilities, source inspection, the 3D preview, discard and Director
    // adoption -- but no longer owns a heavy job manager.
    this.onQueue = onQueue;
    this.onCancel = onCancel;
    this.listen = listen;

    this.client = new ReconstructionClient(api);
    this.runGeneration = 0;
    this.state = initialReconstructionState();
    const initialSource = this.getSource();
    if (initialSource) {
      this.state.source = initialSource;
    }

    this.unbindControls = bindReconstructionControls(this.root, {
      onRun: () => this.run(),
      onStop: () => this.stop(),
      onOpenDirector: () => this.openDirector(),
      onSettingsChange: (settings) => {
        // The node widgets are the authority: every panel edit is mirrored
        // onto them so a queued graph run and a save/reload match the panel.
        syncWidgetsFromPanel(this.node, this.root);
        this.dispatch({ type: "SETTINGS", settings });
      },
      listen: this.listen,
    });

    // Hydrate the panel from whatever the saved workflow put on the widgets,
    // then push that same state straight back (fills in derived widgets like
    // recon_completion_provider) so the first queued run is consistent too.
    this.syncFromWidgets();
    syncWidgetsFromPanel(this.node, this.root);

    // Lazy read-only 3D preview of the reconstructed scene (three.js is only
    // pulled in when the user opens it).
    this.preview = null;
    this.previewLoad = null;
    this.previewOpen = false;
    const previewToggle = this.root?.querySelector?.('[data-role="reconstruction-preview-toggle"]');
    if (previewToggle) this.listen(previewToggle, "click", () => this.togglePreview());
    const previewFit = this.root?.querySelector?.('[data-role="reconstruction-preview-fit"]');
    if (previewFit) this.listen(previewFit, "click", () => this.preview?.fit());
    const discardBtn = this.root?.querySelector?.('[data-role="reconstruction-discard"]');
    if (discardBtn) {
      this.listen(discardBtn, "click", () => {
        discardBtn.disabled = true;
        Promise.resolve(this.discard()).finally(() => this.render());
      });
    }
    this.initCapabilities();
    this.render();
  }

  /** The reconstructed MotionScene currently in `state.result`, or null. */
  currentScene() {
    const r = this.state.result;
    return r ? (r.motion_scene || r) : null;
  }

  async ensurePreview() {
    if (this.preview || this.disposed) return this.preview;
    this.previewLoad ||= import("../../viewer/track-viewer.js")
      .then(({ TrackViewer }) => {
        if (this.disposed || this.preview) return this.preview;
        const canvas = this.root.querySelector('[data-role="reconstruction-3d"]');
        this.preview = canvas ? new TrackViewer(canvas) : null;
        return this.preview;
      })
      .catch((error) => {
        console.warn("OmniCam reconstruction 3D preview unavailable", error);
        return null;
      })
      .finally(() => { this.previewLoad = null; });
    return this.previewLoad;
  }

  pushSceneToPreview() {
    const scene = this.currentScene();
    if (!this.preview || !scene) return;
    this.preview.setReconstructedScene(scene, {
      resolveAssetUrl: (ref) => annotatedAssetUrl(this.api, ref),
    });
    this.preview.resize();
    this.preview.fit();
  }

  async togglePreview() {
    this.previewOpen = !this.previewOpen;
    const box = this.root.querySelector('[data-role="reconstruction-preview"]');
    if (box) box.hidden = !this.previewOpen;
    const btn = this.root.querySelector('[data-role="reconstruction-preview-toggle"]');
    if (btn) btn.setAttribute("aria-pressed", String(this.previewOpen));
    if (!this.previewOpen) return;
    await this.ensurePreview();
    if (this.disposed) return;
    this.pushSceneToPreview();
  }

  /** Re-read the node widgets into the panel DOM (mount + workflow reload). */
  syncFromWidgets() {
    hydratePanelFromWidgets(this.node, this.root);
    updateReconstructionModeVisibility(this.root);
    this.render();
  }

  async initCapabilities() {
    try {
      const select = this.root.querySelector('[data-role="reconstruction-provider"]');
      const status = this.root.querySelector('[data-role="reconstruction-stage"]');
      const checkpointSelect = this.root.querySelector('[data-role="reconstruction-checkpoint"]');
      await loadReconstructionCapabilities(this.client, {
        selectElement: select,
        statusElement: status,
        checkpointSelectElement: checkpointSelect,
      });
      if (this.disposed) return;
      // The provider / checkpoint <select> options only exist once capabilities
      // load; re-apply the saved widget values so the panel shows the saved
      // provider, not the first available one.
      hydratePanelFromWidgets(this.node, this.root);
      updateReconstructionModeVisibility(this.root);
      this.render();
    } catch {
      // Degrades gracefully
    }
  }

  setSource(source) {
    this.dispatch({ type: "SOURCE", source });
  }

  dispatch(action) {
    if (this.disposed) return;
    const previousResult = this.state.result;
    this.state = reduceReconstructionState(this.state, action);
    this.render();
    // A fresh result while the 3D preview is open -> redraw it.
    if (this.previewOpen && this.preview && this.state.result && this.state.result !== previousResult) {
      this.pushSceneToPreview();
    }
  }

  render() {
    renderReconstructionView(this.root, this.state);
  }

  async run() {
    const source = this.state.source || this.getSource();
    if (!source || this.disposed) return;
    this.runGeneration += 1;
    // Last-write wins: flush the panel onto the widgets so this run -- and a
    // save immediately after it -- agree. The parent's queueExtractor() also
    // does this, but the panel's own Start must not depend on that ordering.
    syncWidgetsFromPanel(this.node, this.root);
    this.dispatch({ type: "STATE", jobState: "PREPARING" });
    // Enqueue a partial ComfyUI execution in scene_reconstruct mode. The
    // solved scene returns through the Extractor's executed() envelope and is
    // routed back here by mode.
    await this.onQueue();
  }

  /**
   * Adopt a scene_reconstruct result that arrived through the Extractor's
   * queued executed() envelope (parseExtractorMessage). The
   * reconstruction-specific detail rides in `reconstruction`.
   */
  acceptQueuedResult(parsed) {
    if (this.disposed) return;
    this.runGeneration += 1;
    const recon = parsed.reconstruction || {};
    this.dispatch({
      type: "DONE",
      jobId: "",
      result: parsed.motionScene,
      // The panel renders triangle_count / camera_fov_x etc. off the pipeline
      // summary; fall back to the flatter reconstruction block if absent.
      summary: recon.summary || recon,
      warnings: recon.warnings || [],
      fingerprint: parsed.fingerprint,
    });
  }

  async stop() {
    this.runGeneration += 1;
    this.dispatch({ type: "STATE", jobState: "STOPPING" });
    // Cancel the actual ComfyUI job. The move to a terminal state comes from
    // the execution_interrupted event the parent listens for.
    await this.onCancel();
  }

  openDirector() {
    if (!this.disposed && this.state.result) {
      const scene = this.state.result.motion_scene || this.state.result;
      this.onAdopt(scene);
    }
  }

  /**
   * Throw away the current reconstruction the user is unhappy with: delete its
   * cache folder on disk (so the next identical run recomputes instead of
   * serving this one back), close the 3D preview, and return the panel to
   * IDLE. The camera track and every other cached reconstruction are left
   * alone -- this is the narrow counterpart to the header's "Clear Cache".
   */
  async discard() {
    if (!this.state.result) return false;
    const proceed = await confirmAction(
      this,
      t("Discard reconstruction"),
      t("Removes this reconstruction and its cached files so the next run recomputes it. The camera track and other reconstructions are left untouched."),
    );
    if (!proceed || this.disposed) return false;

    const fp = String(this.state.fingerprint || "");
    if (fp) {
      try {
        await this.client.deleteCacheEntry(fp);
        if (this.disposed) return false;
      } catch (err) {
        this.dispatch({ type: "ERROR", error: { message: err.message } });
        return false;
      }
    }
    if (this.previewOpen) await this.togglePreview();
    this.dispatch({ type: "RESET" });
    return true;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.runGeneration += 1;
    this.unbindControls?.();
    this.unbindControls = null;
    this.preview?.dispose();
    this.preview = null;
  }
}
