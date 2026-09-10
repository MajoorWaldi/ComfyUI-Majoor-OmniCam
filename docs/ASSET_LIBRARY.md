<p align="center">
  <img src="../web/assets/omnicam-icon.png" width="72" alt="Majoor OmniCam">
</p>

# OmniCam — unified asset library

The Director's **ASSETS** tab is one semantic catalog of 3D assets — characters,
props, environments, vehicles — shared by Director and Reconstruction. It is
metadata only: an asset is a stable id, a licence, a managed model file and
(for characters) a rig and animation clips. Model bytes never enter the scene;
the Director loads them from `<ComfyUI input>/omnicam/library/` the same way it
already loads an imported GLB.

This is a layer *on top of* the [blockout asset library](BLOCKOUT_ASSET_LIBRARY.md),
not a replacement — the Kenney blockout kit is mounted read-only as one of the
catalog's sources.

---

## Where things live

```text
<ComfyUI input>/omnicam/library/
├── catalog.json          writable user catalog (your imports and overrides)
├── characters/  props/  environments/  vehicles/
├── poses/                custom FK pose presets (*.json)
├── animations/
└── thumbnails/           generated / uploaded WebP previews
```

Nothing is moved or deleted automatically. No absolute path is ever written into
a catalog row — every `file` is a forward-slash path inside this folder.

## Catalog sources and precedence

| Source | Where | Writable |
|---|---|---|
| user catalog | `<input>/omnicam/library/catalog.json` | yes |
| legacy blockout library | `<input>/majoor_omnicam/blockout_library/` | no (read-only) |
| shipped defaults | `omnicam/assets/catalog.default.json` | no |

Precedence is **user > legacy > default** — a user row with the same id wins.
A duplicate id *within one source* is a hard error.

## AssetDefinition v2

```json
{
  "version": 2,
  "id": "omnicam.character.human_01",
  "name": "Human 01",
  "kind": "character",              // character | prop | environment | vehicle | helper
  "file": "characters/human_01.glb",
  "format": "glb",                   // glb | fbx
  "base_size": [0.62, 1.81, 0.42],
  "fit": "upright",                  // stretch | uniform | upright
  "tags": ["human", "adult"],
  "thumbnail": "thumbnails/human_01.webp",
  "rig": { "profile": "omnicam_humanoid_v1", "bone_map": { "pelvis": "Hips", "...": "..." } },
  "animations": [{ "id": "walk", "name": "Walk", "clip": "Walk", "tags": ["locomotion"] }],
  "license": { "spdx": "CC0-1.0", "source": "..." }
}
```

## HTTP routes

Registered alongside the existing managed-file routes. `GET /majoor/omnicam/assets`
(the managed **file** index) is unchanged — this is a parallel **semantic**
surface.

```text
GET    /majoor/omnicam/library                filtered, paginated list (100 / 500 max)
GET    /majoor/omnicam/library/{asset_id}     one row
POST   /majoor/omnicam/library/import         multipart model + ?kind&name&tags -> row
POST   /majoor/omnicam/library/import-local   {folder,license_note?,dry_run?} -> rig-verified characters
POST   /majoor/omnicam/library/register       JSON AssetDefinition -> row
PATCH  /majoor/omnicam/library/{asset_id}     merge fields into a user row (copy-on-write)
DELETE /majoor/omnicam/library/{asset_id}     drop a user row (a built-in cannot be deleted)
POST   /majoor/omnicam/library/thumbnail/{id} bounded WebP / PNG / JPEG
GET    /majoor/omnicam/library/poses          built-in + custom FK pose presets
POST   /majoor/omnicam/library/poses          JSON pose -> stored pose
DELETE /majoor/omnicam/library/poses/{pose_id}
```

Every route stays inside `<input>/omnicam/library/`; none accepts an absolute
path. Import reuses the existing upload quota, signature and complexity guards.

## Using the Asset Browser

* **Search / kind chips** narrow the grid. A rigged character shows a `RIGGED`
  badge — only when its rig maps *every* required `OMNICAM_HUMANOID_V1` joint.
* **Double-click** or **Add to scene** instantiates the row. This goes through
  the Semantic Director API (`asset.instantiate`) — the same path a future
  Director Agent uses — so the result is deterministic and a single undo step.
* **Import…** uploads a `.glb` / `.fbx` into the library and registers a row.
* A missing model file degrades to a placeholder with a warning; it never fails
  the Director.

## Semantic Director API

Read/mutate the catalog-linked scene through `ui.directorApi`:

```text
op     asset.instantiate            resolved AssetDefinition + point -> new object
query  asset.list                   every catalog-linked object in the scene
query  asset.get                    one object's asset / label / character linkage
```

`asset.instantiate` never performs an HTTP lookup inside a transaction — the
caller resolves the row first and passes it in.

## Starter library bootstrap

A fresh install ships **no** heavy models. The starter library is an explicit,
opt-in download — never a background fetch at ComfyUI or Director start-up.

```bash
# inspect what would happen (resolves + inventories, writes nothing)
python scripts/bootstrap_asset_library.py --preset starter --download --dry-run

# install the starter library (~30–45 curated GLBs)
python scripts/bootstrap_asset_library.py --preset starter --download

# re-check an installed library later, offline
python scripts/bootstrap_asset_library.py --verify

# drop user-catalog rows whose model file is missing + their orphan thumbnails
python scripts/bootstrap_asset_library.py --prune

# stop mounting the old reconstruction blockout library as a catalog source
# (its ~23 rows -- Chair, Table, Sofa... -- duplicate the starter props)
python scripts/bootstrap_asset_library.py --disable-legacy-blockout   # --enable-... to undo

# optional themed character packs
python scripts/bootstrap_asset_library.py --preset characters-extra --download

# import full-humanoid characters from a pack YOU downloaded (offline, no
# redistribution) -- e.g. Quaternius' Universal Animation Library
python scripts/bootstrap_asset_library.py --character-dir "C:/Downloads/UAL2/FBX" \
    --license-note "Quaternius QAL v1.0"
```

Presets: `starter` (seven kits + three FBX character packs), `characters`,
`characters-extra`, `props`, `vehicles`, `environment`, `environments-extra`.
`--from-dir DIR` uses
ZIPs you already downloaded instead of the network; `--source ID` narrows a
preset; `--dest` points at a specific ComfyUI input root; `--update` permits
replacing a previously installed file after its upstream pack changed;
`--json` emits the machine report.

What it does and does not do:

- **Source:** Kenney only, and only packs whose page still declares
  *Creative Commons CC0* at download time; the resolved ZIP must stay on
  `https://kenney.nl/media/pages/assets/…`. It fails closed otherwise.
- **No vendoring:** downloaded packs, installed GLBs and the generated
  `SOURCES.md` / `.bootstrap/library.lock.json` / `.bootstrap/last-report.json`
  live under `<input>/omnicam/library/`, never in Git.
- **Cache:** the downloaded ZIPs sit in `.bootstrap/cache/` during a run and are
  deleted on success unless you pass `--keep-cache`.
- **Characters:** the three *Animated Characters* packs ship a full biped as
  **FBX** (`characterMedium.fbx`). The bootstrap reads the FBX skeleton
  directly, strips the IK/control bones, and installs the model only when
  every required `OMNICAM_HUMANOID_V1` joint maps with a plausible hierarchy.
  Kenney's *Blocky* / *Mini Characters* carry only a 7-bone stylised rig, so
  they install as **animated proxy props** (`character-proxy` tag, no RIGGED
  badge), keeping their embedded clips. Sex/gender is never inferred; clip
  names come from the real file, never invented.
- **Thumbnails:** not rendered here — the Asset Browser's existing lazy
  `ThumbnailRenderer` generates them on first view.
- **Auto-download is Kenney only.** Quaternius (QAL v1.0 forbids repackaging /
  automatic download / hosting), Mixamo and Poly Haven are **not** network
  sources. For a full-humanoid character with a real animation set, download a
  pack yourself (e.g. Quaternius *Universal Animation Library*, FBX or GLB
  flavour) and run `--character-dir <folder>`: every `.glb` / `.fbx` there is
  rig-inspected the same way, and only files that map every
  `OMNICAM_HUMANOID_V1` joint install as a `character`. Nothing is fetched or
  redistributed — the files are used within your project. `.gltf` (multi-file)
  is not supported; export FBX or GLB. `--license-note` fills the row's
  `license.source`; the import merges into the same lockfile / `SOURCES.md`.
- **From the UI:** the Director → ASSETS panel has a folder button
  (`local-toggle`) that runs the same import — paste the folder path, *Scan*
  to preview, *Install characters* to apply. `POST /majoor/omnicam/library/
  import-local` drives it. No ComfyUI restart is needed afterwards (the catalog
  is re-read on the next list); the panel refreshes itself. Adding this route
  the first time does need one restart to load the new backend code.

`fetch_blockout_library.py` is the legacy blockout entry point and now shares
this same Kenney download / archive core.

## Reconstruction

`semantic class -> unified catalog resolver -> AssetDefinition -> placement
adapter -> AssetPlacement`. This catalog is the **single source of truth** for
blockout / hybrid / scan retrieval; the legacy blockout `library.json` is only a
fallback when the catalog has no match or the matched file is missing, and is
fully optional — a run with the blockout library disabled or absent resolves
straight from the catalog instead of erroring. Reconstructed assets carry
only **factual** tags (`reconstruction`, `chair`, `person`) — never an editorial
role — and a detected `person` becomes a Character only when the resolved
catalog asset has a valid rig.

## Limits

| | |
|---|---|
| catalog entries | 5000 |
| catalog JSON | 8 MiB |
| tags / object | 32 (lowercase `a-z 0-9 _ -`, ≤ 64 chars) |
| clips / asset | 256 |
| bone mappings / asset | 128 |
| list page | 100 default, 500 hard max |

See also: [CHARACTERS.md](CHARACTERS.md) · [BLOCKOUT_ASSET_LIBRARY.md](BLOCKOUT_ASSET_LIBRARY.md) · [SECURITY.md](SECURITY.md)
