"""Default character rows are *population targets*, not shipped rigs.

Plan section 37 / task 10: the illustrative rig maps in ``catalog.default.json``
must never let the UI present a missing model as a verified real rig. These
tests pin two facts:

* a default character's managed GLB does not exist until something installs it;
* a bootstrap-installed character carries the *actually inspected* bone map,
  not a hard-coded one.
"""

from __future__ import annotations

import zipfile

from omnicam.assets.bootstrap.archive import list_glb_members
from omnicam.assets.bootstrap.curation import SelectedAsset
from omnicam.assets.bootstrap.glb_inspect import build_rig_evidence, inspect_glb_member
from omnicam.assets.bootstrap.installer import install_selected_asset
from omnicam.assets.catalog import load_catalog
from omnicam.assets.storage import asset_file_path

from .glb_fixture import build_humanoid_glb

_DEFAULT_CHARACTERS = (
    "omnicam.character.human_neutral_01",
    "omnicam.character.human_male_01",
    "omnicam.character.human_female_01",
)


def test_default_characters_have_no_vendored_model_file(tmp_path):
    catalog = load_catalog(tmp_path)
    for asset_id in _DEFAULT_CHARACTERS:
        row = catalog.get(asset_id)
        assert row.source == "default"
        path = asset_file_path(row.file, tmp_path)
        assert not path.is_file(), f"{asset_id} unexpectedly ships a GLB"


def test_default_rig_metadata_is_not_evidence_of_a_real_file(tmp_path):
    """`has_rig` reflects mapping completeness only; it is not a claim that a
    matching model exists on disk. The Asset Browser gates the RIGGED badge on
    the runtime-loaded skeleton, so an illustrative-but-fileless row is inert."""
    row = load_catalog(tmp_path).get("omnicam.character.human_neutral_01")
    assert row.has_rig is True  # complete illustrative map
    assert not asset_file_path(row.file, tmp_path).is_file()


def test_bootstrap_install_records_the_real_inspected_bone_map(tmp_path):
    data = build_humanoid_glb(animation_names=("Walk",))
    archive = tmp_path / "chars.zip"
    with zipfile.ZipFile(archive, "w") as zf:
        zf.writestr("Models/GLB format/char_0.glb", data)
    (member,) = list_glb_members(archive)
    info = inspect_glb_member(member)
    selected = SelectedAsset(
        source_id="kenney.blocky_characters", member=member,
        asset_id="omnicam.character.kenney_blocky_01", name="Kenney Blocky Character 01",
        kind="character", category="characters", output="characters/kenney_blocky_01.glb",
        base_size=(0.6, 1.75, 0.4), fit="upright", tags=("human", "character"),
        glb=info, rig=build_rig_evidence(info),
    )
    result = install_selected_asset(
        tmp_path, selected, update=False,
        source_page_url="https://kenney.nl/assets/blocky-characters",
    )
    assert result.rig_status == "rigged"
    row = load_catalog(tmp_path).get("omnicam.character.kenney_blocky_01")
    assert row.source == "user"
    # the runtime bone names are the fixture's real joints, not a canned map
    assert set(row.rig.bone_map.values()) <= set(info.joint_names)
    assert asset_file_path(row.file, tmp_path).is_file()
