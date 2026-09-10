<p align="center">
  <img src="../web/assets/omnicam-icon.png" width="72" alt="Majoor OmniCam">
</p>

# OmniCam — rigged characters

A **Character** is a renderable model (`type: "glb"`) plus a semantic
`asset_kind = "character"`, a known rig profile, an optional FK pose and an
optional motion clip. It reuses the viewport's existing model loader and
`AnimationMixer` — OmniCam is a shot-layout / previs tool, not a Maya/Blender
replacement. No skin weighting, rig creation, mesh editing, NLA, mocap, full IK,
physics or facial rig.

A scene character stays `type: "glb"`; the character data is additive:

```json
{
  "id": "character_01", "type": "glb", "name": "John",
  "asset": "omnicam/library/characters/human_01.glb [input]",
  "asset_id": "omnicam.character.human_01",
  "asset_kind": "character",
  "tags": ["hero", "subject"],
  "annotation": { "text": "JOHN", "visible": true, "color": "#8d7ee8", "anchor": "top" },
  "character": {
    "rig_profile": "omnicam_humanoid_v1",
    "pose": { "preset_id": "neutral", "root_offset": [0, 0, 0], "joints": { "upper_arm_r": [0, 0, 0.26, 0.97] } },
    "motion": null
  }
}
```

Older OmniCam still renders the GLB and ignores the rest.

---

## `OMNICAM_HUMANOID_V1`

One humanoid contract. 22 required canonical joints:

```text
root pelvis spine chest neck head
clavicle_l upper_arm_l lower_arm_l hand_l
clavicle_r upper_arm_r lower_arm_r hand_r
upper_leg_l lower_leg_l foot_l toe_l
upper_leg_r lower_leg_r foot_r toe_r
```

Optional: `eye_l eye_r hand_tip_l hand_tip_r`. Finger chains are out of v1.

## Rig Mapper

The catalog owns the source-bone → canonical-joint mapping; scene state only
ever stores canonical joints.

1. Select a Character. The **Rig Mapper** panel lists all 22 joints with a
   `<select>` of the loaded model's bone names.
2. **Auto Map** recognises Mixamo (`mixamorig:…`), common generic GLTF names and
   OmniCam-native rigs via normalised aliases + left/right consistency. A
   rootless rig (Mixamo) shares its hips bone between `root` and `pelvis`.
3. **Validate** highlights the joints still unmapped.
4. **Save Mapping** writes the map to the *catalog row* (a `PATCH`, copy-on-write
   from a built-in).

An **incomplete** mapping leaves the asset a normal model — it is not an error,
and it never shows a `RIGGED` badge.

## FK Pose editor

FK first — no per-bone translation gizmo in v1. Pose rotations are normalised
local quaternions `[x, y, z, w]`.

* **Edit Pose** shows the canonical-joint overlay (mapped joints only — never
  raw twist / helper / finger bones). Click a dot to select a joint.
* The joint's **X / Y / Z** rotation writes through `character.set_joint_rotation`.
  A joint dragged back to identity clears the override.
* Evaluation order: `asset rest pose -> pose preset -> scene joint overrides`.
* **Presets** are source-rig-independent and target `omnicam_humanoid_v1`. Only
  `Standing Neutral` ships as real data; author the rest and **Save Pose…** them
  to `/library/poses`.
* One joint drag is one undo checkpoint. The selected joint
  (`subSelection = { type: "character_joint", ... }`) is transient and never
  serialised.

## Motion clips

```json
"motion": { "clip_id": "walk", "start_frame": 24, "end_frame": 120,
            "speed": 1.0, "loop": true, "offset_seconds": 0.0 }
```

* The clip is one of the model's embedded animations. Its mixer time is driven
  from the Director timeline: before `start_frame` it holds the first frame;
  inside the window it advances at `speed`; past `end_frame` it loops or holds.
* Speed is finite `[0.05, 8.0]`. `end_frame ≤ start_frame` means "play to the
  clip's natural end".
* Embedded root translation is ignored — world movement stays the Director
  object transform / path.
* **Pose editing and an active motion clip are mutually exclusive.** Setting a
  clip clears any FK joint overrides. **Bake current frame to pose** samples the
  live mixer pose, maps it to canonical joints, clears the motion and enters
  Pose mode.

## Semantic Director API

```text
op     character.set_pose             replace the whole pose (or null -> neutral)
op     character.set_joint_rotation   one canonical joint (refused under a clip)
op     character.set_motion           set / retime the clip
op     character.clear_motion
query  character.get_rig              asset_id, rig_profile, pose preset, has_motion
query  character.get_pose             preset_id, root_offset, joints, has_motion
```

`ui.characterRuntime` is a transient viewport bridge (`getRigInfo`,
`resolveJoint`, `getJointWorldTransform`, `applyPose`, `setMotion`,
`sampleCanonicalPose`) — never serialised, never handed to a future Agent.

## Reconstruction

A detected `person` becomes `asset_kind = "character"` **only** when the resolved
catalog asset has a complete rig. A static posed human stays a `prop`.

## Starter bootstrap characters

`scripts/bootstrap_asset_library.py` (see [ASSET_LIBRARY.md](ASSET_LIBRARY.md))
marks a downloaded model `character` only from **inspected** skeleton data: a
skin / bone hierarchy, and `auto_map_bones()` must resolve every required
`OMNICAM_HUMANOID_V1` joint with a plausible hierarchy and ≤ 75 k triangles.

- The **GLB** reader parses only the glТF JSON chunk (`skins[].joints`).
- The **FBX** reader (Kenney's *Animated Characters* packs) walks the binary
  node tree for `Model`/`LimbNode` records and their `OO` connections.
- Both then run through `deform_joint_names()`, which drops IK / control /
  `_end` helper bones so the mapper matches the real deform skeleton
  (`LeftToes`, not `LeftToeRoll`).

Kenney's *Blocky* / *Mini Characters* only carry a 7-bone stylised rig, so they
install as animated **proxy props** (`character-proxy`), never as rigged
characters. The illustrative rig maps in `catalog.default.json` are never
trusted for a downloaded file. Generated tags are factual only (`human`,
`character`, `proxy`, `kenney`, `animated`) — sex and gender are never
inferred. Animation clip ids come from real embedded clip names; unknown names
get no guessed semantic tags.

For a full-humanoid character with a large animation set, use
`--character-dir <folder>` on a pack you downloaded yourself (Quaternius
*Universal Animation Library*, etc. — QAL forbids automatic download). Each
`.glb` / `.fbx` is inspected by the same skeleton reader; only files that map
every `OMNICAM_HUMANOID_V1` joint install as `character`, with the real
inspected `bone_map`, the file's embedded clips, and `license.source` set from
`--license-note`. The import merges into the existing lockfile so Kenney and
local provenance coexist.

## Deferred

full IK · foot locking · animation retargeting · blending / NLA · mocap · facial
rig / blendshapes · finger posing · physics / ragdoll.

See also: [ASSET_LIBRARY.md](ASSET_LIBRARY.md) · [SHORTCUTS.md](SHORTCUTS.md) · [COMPATIBILITY.md](COMPATIBILITY.md)
