// Reconstruction state reducer and action queries.

export const RECONSTRUCTION_STATES = [
  "IDLE",
  "PREPARING",
  "ESTIMATING_DEPTH",
  "EXTRACTING_GEOMETRY",
  "ANALYZING_PLANES",
  "BUILDING_SCENE",
  "DONE",
  "FAILED",
  "STOPPING",
  "STOPPED",
];

export const ACTIVE_STATES = new Set([
  "PREPARING",
  "ESTIMATING_DEPTH",
  "EXTRACTING_GEOMETRY",
  "ANALYZING_PLANES",
  "BUILDING_SCENE",
]);

export function initialReconstructionSettings() {
  return {
    provider: "comfy_moge",
    mode: "geometry",
    quality: "balanced",
    triangle_budget: 100000,
    edge_threshold: 1.0,
    scene_scale: 1.0,
    detect_ground: true,
    detect_walls: false,
    source_texture: true,
    recover_fov: true,
  };
}

export function initialReconstructionState() {
  return {
    jobState: "IDLE",
    jobId: "",
    progress: 0,
    stage: "",
    stageProgress: 0,
    error: null,
    warnings: [],
    result: null,
    summary: null,
    previewUrl: "",
    source: null,
    settings: initialReconstructionSettings(),
  };
}

export function reconstructionActions(state) {
  const jobState = state?.jobState || "IDLE";
  const active = ACTIVE_STATES.has(jobState);
  const src = state?.source;
  const hasValidSource = Boolean(
    src && (
      typeof src === "string" ||
      src.available ||
      src.value ||
      src.ref ||
      src.info ||
      src.kind
    )
  );

  const canStart = !active && jobState !== "STOPPING" && hasValidSource;
  const canStop = active;
  const hasResult = Boolean(
    state?.result && (state.result.motion_scene || state.result.objects || state.result.version)
  );
  const canOpenDirector = jobState === "DONE" && hasResult;

  return {
    canStart,
    canStop,
    canOpenDirector,
  };
}

export function reduceReconstructionState(state, action) {
  switch (action.type) {
    case "SOURCE":
      return { ...state, source: action.source };

    case "SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      };

    case "STATE":
      return {
        ...state,
        jobState: action.jobState,
        jobId: action.jobId ?? state.jobId,
        progress: action.progress ?? state.progress,
        stage: action.stage ?? state.stage,
        stageProgress: action.stageProgress ?? state.stageProgress,
        error: action.jobState === "PREPARING" ? null : state.error,
      };

    case "PROGRESS":
      return {
        ...state,
        progress: action.progress ?? state.progress,
        stage: action.stage ?? state.stage,
        stageProgress: action.stageProgress ?? state.stageProgress,
      };

    case "PREVIEW":
      return {
        ...state,
        previewUrl: action.previewUrl ?? "",
      };

    case "DONE":
      return {
        ...state,
        jobState: "DONE",
        progress: 100,
        result: action.result,
        summary: action.summary ?? action.result?.summary ?? null,
        warnings: action.warnings ?? action.result?.warnings ?? [],
      };

    case "ERROR":
      return {
        ...state,
        jobState: "FAILED",
        error: action.error,
      };

    case "RESET":
      return {
        ...initialReconstructionState(),
        source: state.source,
        settings: state.settings,
      };

    default:
      return state;
  }
}
