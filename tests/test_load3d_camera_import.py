from omnicam.core.importers import import_load3d_camera
from omnicam.core.upstream_track import should_adopt_upstream


def test_load3d_camera_preserves_explicit_camera_contract():
    track = import_load3d_camera(
        {"position": [1, 2, 3], "target": [0, 1, 0], "fov": 42, "cameraType": "orthographic", "zoom": 2, "near": 0.2, "far": 200, "aspect": 1.5, "quaternion": [0, 0, 0, 1]},
        width=640,
        height=480,
        fps=30,
        duration_frames=12,
    )
    camera = track.sample(0)
    assert camera.position == [1.0, 2.0, 3.0]
    assert camera.target == [0.0, 1.0, 0.0]
    assert camera.camera_type == "orthographic"
    assert camera.zoom == 2.0
    assert camera.fov == 42.0
    assert track.metadata["source"] == "load3d_camera"


def test_load3d_camera_reads_the_real_load3d_xyz_object_shape():
    # LOAD3D_CAMERA carries position/target as {"x", "y", "z"} objects (see
    # omnicam.core.track.camera_to_load3d), not [x, y, z] arrays. Importing the
    # real shape must not silently fall back to CameraState.from_dict's defaults.
    track = import_load3d_camera(
        {"position": {"x": 1.0, "y": 2.0, "z": 3.0}, "target": {"x": 0.0, "y": 1.0, "z": 0.0}, "fov": 42},
        width=640,
        height=480,
    )
    camera = track.sample(0)
    assert camera.position == [1.0, 2.0, 3.0]
    assert camera.target == [0.0, 1.0, 0.0]


def test_load3d_camera_carries_an_adoptable_fingerprint():
    # Without an extractor_fingerprint, upstream_track.should_adopt_upstream()
    # always rejects the track, making the camera_info input a permanent no-op.
    track = import_load3d_camera({"position": [1, 2, 3], "target": [0, 1, 0]}, width=640, height=480).to_dict()
    assert should_adopt_upstream({}, track) is True

    same_pose_again = import_load3d_camera({"position": [1, 2, 3], "target": [0, 1, 0]}, width=640, height=480).to_dict()
    # Once imported, the identical upstream pose must not keep re-adopting on
    # every rerun and clobbering local Director edits.
    imported_local = {"metadata": {"upstream_camera_track": {"fingerprint": track["metadata"]["extractor_fingerprint"]}}}
    assert should_adopt_upstream(imported_local, same_pose_again) is False

    moved = import_load3d_camera({"position": [9, 9, 9], "target": [0, 1, 0]}, width=640, height=480).to_dict()
    assert should_adopt_upstream(imported_local, moved) is True
