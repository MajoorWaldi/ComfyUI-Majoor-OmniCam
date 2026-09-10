# Blockout asset library ("bibliothèque 3D")

The semantic blockout pipeline fits a **closed box** per detected object. The
asset library lets it go one step further: swap each box for a real GLB prop
(a chair-shaped mesh instead of a cuboid labelled `chair`), or place the prop
*beside* the box as a visual reference.

This is **not** a reconstruction model. It is a folder of CC0 kit models plus a
`library.json` manifest that maps a semantic class to one of them. Nothing is
downloaded at pipeline time — you populate the folder once.

> **Shared downloader.** `scripts/fetch_blockout_library.py` keeps its legacy
> flags (`--list`, `--from-dir`, `--dest`, `--only`, `--download`, `--dry-run`)
> and its `library.json` / `SOURCES.md` output, but its Kenney page resolution,
> bounded download and ZIP-safety now come from
> `omnicam.assets.bootstrap` — there is one Kenney downloader in the project.
> For the Director's unified catalog use
> `scripts/bootstrap_asset_library.py` instead (see [ASSET_LIBRARY.md](ASSET_LIBRARY.md)).

> **Now one source of the unified catalog.** The Director's
> [unified asset library](ASSET_LIBRARY.md) mounts this blockout library
> **read-only** as its `legacy` source (`user > legacy > default`). Once the
> starter library is installed the two overlap (Chair vs Chair 01, …); drop
> the legacy rows with
> `python scripts/bootstrap_asset_library.py --disable-legacy-blockout`
> (reversible; it only renames `library.json`). The
> reconstruction resolver tries the unified catalog first and falls back to
> this library when nothing matches or the matched file is missing. Since the
> catalog is the single source of truth, this blockout `library.json` is now
> **fully optional**: with it disabled (or never installed) a `proxy` / `replace`
> run resolves assets straight from the catalog instead of erroring, as long as
> the catalog has at least one file-backed asset. Everything below still applies
> unchanged when the library *is* present. Placements now also carry factual
> tags (`reconstruction`, `<class>`, and `person` for a human), and a legacy
> human stays a static prop — it has no rig.

---

## Do I need it?

| You want… | Use |
|---|---|
| Fast, deterministic, editable layout | **Blockout** (boxes only — default, no library) |
| Real geometry + appearance of the whole scene | **Hybrid** (boxes + MoGe dense mesh) |
| Recognisable per-object meshes (furniture, people, street props) | **Blockout / Hybrid + asset library** |
| Watertight per-object 3D from the photo itself | SAM3D completion (Linux + ≥32 GB VRAM only) |

The library is the realistic way to get labelled real props on a Windows / 24 GB
machine.

---

## Install (one-time)

The default library is **23 CC0 props from [Kenney](https://kenney.nl)** (~0.5 MB
total): 16 interior, 6 exterior, 1 human. One command:

```
python scripts/fetch_blockout_library.py --download
```

`--download` scrapes the "Continue without donating" ZIP link from each Kenney
asset page (Furniture / Car / City Roads / Nature / Blocky Characters — all
CC0), extracts the members named in `library.default.json` into
`<ComfyUI>/input/majoor_omnicam/blockout_library/`, and writes `library.json` +
`SOURCES.md`.

Offline / manual: run `--list` for the kit pages, download each as its glTF/GLB
ZIP into one folder, then `--from-dir /path/to/kits`.

Flags: `--dry-run` (report only), `--only chair --only person` (restrict),
`--dest DIR` (override target). Missing members are never fatal — a partial
library still works, unresolved classes fall back to the plain box.

---

## Use

**Panel** (Extractor → *Scene Reconstruct* → Result = Blockout / Hybrid / Scan):
the **3D assets** dropdown on the *Labels* row —

- `Boxes only` — default, unchanged behaviour.
- `Add props` (`proxy`) — place the GLB inside each matched box; the box stays
  visible next to it.
- `Replace boxes` (`replace`) — place the GLB and hide the box it stands in for.

**Node graph**: advanced widgets `recon_blockout_assets` (`off` / `proxy` /
`replace`) and `recon_asset_library_path` (empty = the managed default folder,
otherwise an explicit library root).

**In Director**: retrieved props adopt with role `asset_proxy` — unlocked and
visible, parented under `Reconstructed Scene → Assets`. They are ordinary GLB
objects; move / rescale / delete them like any other.

### Errors instead of silent fallback

If `recon_blockout_assets` is `proxy`/`replace` and **neither** the unified
catalog nor this blockout library can supply an asset, the job fails with a
specific code rather than silently producing boxes only:

| Code | Cause |
|---|---|
| `RECON_ASSET_LIBRARY_INVALID` | an explicit `recon_asset_library_path` with no `library.json`, or a malformed one |
| `RECON_ASSET_LIBRARY_UNAVAILABLE` | a manifest is valid but its GLBs are not on disk, and the unified catalog is also empty |

A missing / disabled blockout `library.json` at the default managed location is
**not** an error on its own — the run falls through to the unified catalog.

---

## Manifest schema (`library.json`)

```jsonc
{
  "version": 1,
  "name": "my library",
  "assets": {
    "chair": {
      "category": "interior",          // interior | exterior | human
      "glb": "interior/chair.glb",     // path relative to the library root
      "fit": "stretch",                // stretch (default) | uniform | upright
      "base_size": [0.55, 0.95, 0.55], // model's authored bbox in metres
      "yaw_offset_degrees": 0.0,       // if the model's front is not -Z
      "unit_scale": 1.0                // extra uniform pre-scale (cm kits: 0.01)
    },
    "person": {
      "category": "human",
      "fit": "upright",
      "base_size": [0.55, 1.8, 0.4],
      "poses": {                       // human entries carry poses, not "glb"
        "standing": "human/standing.glb",
        "sitting":  "human/sitting.glb",
        "crouching":"human/crouching.glb",
        "lying":    "human/lying.glb"
      }
    }
  }
}
```

**Placement.** The fitted box `(w, h, d)` at `(position, yaw)` becomes the GLB's
transform:

- `stretch` — scale `= box / base_size` per axis (furniture).
- `uniform` — one factor `= min(box / base_size)`, proportions kept.
- `upright` — one factor `= box.h / base_size.h` (lamps, plants, humans: the
  height is trusted, the footprint is not).
- rotation `= (0, box_yaw + yaw_offset, 0)`; position `= box centre`.

**Human pose** is chosen from the box proportions: tall & narrow → `standing`,
low & deep → `sitting`, low & flat → `lying`, else `crouching` (falls back to
the first declared pose).

**Cache.** The manifest digest is part of the reconstruction cache key — swap
the library and the next run re-resolves instead of serving a stale scene.

---

## Bring your own library

Point `recon_asset_library_path` (node) at any folder containing a valid
`library.json` — e.g. a converted Kitbash3D / Megascans set you have licensed,
or Mixamo characters you exported yourself (Mixamo assets cannot be
redistributed, so they are never bundled). The GLBs must sit under that folder;
absolute paths outside it are refused.

The classes you map are matched against the SAM3 semantic labels
(`omnicam/reconstruction/segmentation/taxonomy.py` — `chair`, `sofa`, `table`,
`bed`, `person`, `car`, …). Unmapped detections keep their box.
