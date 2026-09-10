// Deterministic asset -> scene-object compiler.
//
// The Asset Browser (and, later, the Semantic Director API `asset.instantiate`
// op) resolves a catalog row to a bounded scene object with no HTTP and no
// three.js -- exactly the payload shape from design spec section 11. A scene
// character stays `type: "glb"` with additive `asset_kind` / `asset_id` /
// `character` fields so older OmniCam still renders the mesh (section 10).

const UNIFIED_PREFIX = "omnicam/library";
const LEGACY_PREFIX = "majoor_omnicam/blockout_library";

const HELPER_PRIMITIVE = Object.freeze({
  "omnicam.helper.human_lowpoly": "human",
  "omnicam.helper.null": "null",
});

function finiteTriplet(value, fallback) {
  if (!Array.isArray(value) || value.length < 3) return [...fallback];
  const out = value.slice(0, 3).map((n) => Number(n));
  return out.every((n) => Number.isFinite(n)) ? out : [...fallback];
}

/** The annotated ComfyUI input reference the Director's loader understands. */
export function assetReference(definition) {
  if (!definition.file) return "";
  const prefix = definition.source === "legacy" ? LEGACY_PREFIX : UNIFIED_PREFIX;
  return `${prefix}/${definition.file} [input]`;
}

function uniqueId(base, existingIds, seed) {
  const stem = base || "asset";
  let candidate = `${stem}_${seed}`;
  let n = 2;
  while (existingIds && existingIds.has(candidate)) candidate = `${stem}_${seed}_${n++}`;
  return candidate;
}

function characterBlock(definition) {
  const hasRig = Boolean(definition.rig && Object.keys(definition.rig.bone_map || {}).length);
  return {
    rig_profile: hasRig ? definition.rig.profile || "omnicam_humanoid_v1" : null,
    pose: { preset_id: "neutral", root_offset: [0, 0, 0], joints: {} },
    motion: null,
  };
}

/**
 * @param definition  an AssetDefinition.to_dict() payload
 * @param options.point       [x,y,z] placement (defaults to origin)
 * @param options.idSeed      deterministic id suffix (defaults to a base36 time)
 * @param options.existingIds Set<string> of ids already in the scene
 * @returns a scene object ready to push onto `ui.state.objects`
 */
export function compileInstance(definition, options = {}) {
  if (!definition || typeof definition !== "object" || !definition.id) {
    throw new Error("compileInstance: an AssetDefinition is required");
  }
  const point = finiteTriplet(options.point, [0, 0, 0]);
  const seed = String(options.idSeed || Date.now().toString(36));
  const kind = String(definition.kind || "prop");
  const isCharacter = kind === "character";
  const primitive = HELPER_PRIMITIVE[definition.id];

  if (kind === "helper" && !definition.file && primitive && primitive !== "null") {
    return {
      id: uniqueId(primitive, options.existingIds, seed),
      type: primitive,
      name: definition.name || primitive,
      position: point,
      rotation: [0, 0, 0],
      size: [...(definition.base_size || [1, 1, 1])],
      keyframes: [],
      enabled: true,
      asset_id: definition.id,
      asset_kind: kind,
      tags: [...(definition.tags || [])],
    };
  }

  const object = {
    id: uniqueId(kind === "character" ? "character" : kind, options.existingIds, seed),
    type: "glb",
    // `type` stays "glb" for legacy render compatibility; `format` drives which
    // three.js loader the viewport picks (a catalog FBX character needs
    // FBXLoader, not GLTFLoader).
    format: String(definition.format || "glb").toLowerCase() === "fbx" ? "fbx" : "glb",
    name: definition.name || definition.id,
    position: point,
    rotation: [0, 0, 0],
    size: [1, 1, 1],
    keyframes: [],
    enabled: true,
    asset: assetReference(definition),
    asset_id: definition.id,
    asset_kind: kind,
    tags: [...(definition.tags || [])],
  };
  if (isCharacter) object.character = characterBlock(definition);
  return object;
}

/**
 * Placement priority (design spec section 16): a caller-supplied ground hit,
 * else the orbit target projected to the ground plane, else world origin.
 */
export function placementPoint({ groundHit, orbitTarget } = {}) {
  if (Array.isArray(groundHit) && groundHit.length >= 3 && groundHit.every((n) => Number.isFinite(n))) {
    return groundHit.slice(0, 3).map(Number);
  }
  if (Array.isArray(orbitTarget) && orbitTarget.length >= 3 && orbitTarget.every((n) => Number.isFinite(n))) {
    return [Number(orbitTarget[0]), 0, Number(orbitTarget[2])];
  }
  return [0, 0, 0];
}
