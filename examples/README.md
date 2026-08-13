# Examples

- `omnicam_track.example.json` is the canonical V1 camera-track format.
- `omnicam_sequence.example.json` composes two V1 tracks with handles, references and adapter settings.

```text
Majoor OmniCam Director
  ├─ proxy_video + camera_track → MiniMax H3 Omni Reference adapter
  ├─ camera_track → Wan Native Camera / WanVideoWrapper ATI
  ├─ proxy_video + camera_track → LTX Camera Guide
  ├─ camera_track → Blender / Unreal Export
  └─ camera_track(s) → Sequence Builder
```

These JSON files are documentation/debug artifacts. Normal workflows pass typed values directly between nodes.
