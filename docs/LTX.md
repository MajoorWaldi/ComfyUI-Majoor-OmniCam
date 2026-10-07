# OmniCam with LTX-2.5

OmniCam drives LTX-2.5 through one Monitor profile, **`ltx25_motion_track`**:
the Director's motion layers, projected through its animated camera, become
the screen tracks that LTX-2.5's Motion Track IC-LoRA follows. The ready-made
graph is [`examples/workflows/09_ltx25_motion_track.json`](../examples/workflows/09_ltx25_motion_track.json),
built from Lightricks' own template with only the hand-edited track editor
replaced.

## Version matrix

| Component | Version / file | Source |
|---|---|---|
| ComfyUI | 0.39.0, frontend 1.53.10 | tested |
| ComfyUI-LTXVideo | `3bf3ca62595f1764c47d01c35c8e5dfe47e1a88f` (2026-10-01) | [repo](https://github.com/Lightricks/ComfyUI-LTXVideo) |
| Upstream template | `example_workflows/2.5/LTX-2.5_ICLoRA_Motion_Track_Distilled.json` | ComfyUI-LTXVideo |
| Transformer | `ltx-2.5-22b-distilled-transformer-bf16.safetensors` | [Lightricks/LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5) |
| Video VAE | `ltx-2.5-video-vae-bf16.safetensors` (or `-conv-` for less memory) | Lightricks/LTX-2.5 |
| Audio VAE | `ltx-2.5-audio-vae-bf16.safetensors` | Lightricks/LTX-2.5 |
| Text encoder | `gemma4-12b-with-proj-ltx-2.5-bf16.safetensors` | Lightricks/LTX-2.5 |
| Prompt enhancer | `gemma4_e2b_it_bf16.safetensors` | [Comfy-Org/gemma-4](https://huggingface.co/Comfy-Org/gemma-4) |
| IC-LoRA | `ltx-2.3-22b-ic-lora-motion-track-control-ref0.5.safetensors` | [Lightricks/LTX-2.3-22b-IC-LoRA-Motion-Track-Control](https://huggingface.co/Lightricks/LTX-2.3-22b-IC-LoRA-Motion-Track-Control) |

The Motion Track IC-LoRA was trained on LTX-2.3. Lightricks'
[Motion Control guide](https://docs.ltx.io/open-source-model/feature-guides/structural-control/motion-control)
documents it as reused unchanged in the LTX-2.5 workflow; OmniCam follows that
pairing and does not substitute any other adapter.

## What the profile guarantees

- **Length.** `1 + floor(fps × duration / 8) × 8`, the expression LTX-2.5's
  workflows use: 5.0 s at 24 fps is **121** frames. `Monitor.target_length`
  drives the latent length, so tracks and generation always agree.
- **Size.** Tracks are pixels of the image `LTXVDrawTracks` draws on. The
  example feeds `target_width/height` from that resized image (short side 544,
  multiple of 32); preflight warns when a size is off the 32-pixel grid.
- **Content.** At least one enabled motion layer is required. Use the Director's
  motion tools — *Project* follows a scene point through the camera; several
  points spread over the scene carry the parallax LTX reads.
- **Prompt.** `final_prompt` is your prompt plus scene-level camera wording; the
  tracks carry the literal trajectory.

## Limits

- Tracks are 2D screen trajectories of chosen points. They steer the motion
  strongly but are **not an exact 6-DoF camera reproduction**.
- Multi-shot scenes are refused by this profile.
- Validation status: the example is checked against the live node schemas and
  accepted by a ComfyUI 0.39.0 server up to model loading. A full generation
  needs the LTX-2.5 weights listed above and has to be run and recorded on the
  target machine (GPU, VRAM, versions, time, peak memory).

## Layout to Render

[`10_ltx25_layout_to_render.json`](../examples/workflows/10_ltx25_layout_to_render.json)
adapts Lightricks' `LTX-2.5_ICLoRA_Layout_To_Render_Two_Stage_Distilled.json`.
It uses `external_reference_video` in the Monitor, then the original downstream
Layout to Render nodes. This is a tested generic-video recipe; OmniCam does not
yet provide a dedicated Layout to Render profile or its model-specific preflight.

Layout to Render consumes the **rendered layout video**, not Motion Track's 2D
trajectories. No motion layer is required. The separate **Look Still** supplies
the finished appearance at `frame_idx = -1` in both stages. Generate that image
from the first layout frame; do not feed the raw proxy back as the appearance
reference. These are the [official model's instructions](https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Layout-To-Render).

To replay the starter:

1. Load workflow 10 in ComfyUI with OmniCam and ComfyUI-LTXVideo installed.
2. Upload `omnicam_layout_guide.webm` from
   [`examples/assets/ltx-layout/`](../examples/assets/ltx-layout/) into its
   fallback video loader, and `omnicam_layout_look.png` into Look Still.
3. Keep the Layout to Render LoRA
   `ltx-2.5-22b-ic-lora-layout-to-render-1.0.safetensors`, plus the LTX-2.5
   weights above and `ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors`.
4. Queue the two-stage workflow. The starter takes the first **25** guide frames,
   renders **640x320**, then upscales and resamples to **1280x640**, at **24 fps**.

For your own shot, author simple volumes in the Director and **Record Playblast**.
The recording takes priority over the connected fallback clip. Replace Look
Still with an art-directed image matching your first frame, and describe that
image in the prompt. Change the frame limit inside **Source Video** to use a
longer clip. Prefer 24 fps, use `8n+1` frames, and keep final dimensions divisible
by 64. The starter uses multiples of 64 at both stages. The generic Monitor does
not enforce these LTX requirements; the downstream graph owns sizing and timing.

The bundled guide is an actual OmniCam recording. Its saved authoring state was
not available, so the starter Director contains a new approximate monolith
blockout, not a recovered camera solve. Recording that scene creates a new guide.

Validation on **2026-10-06**, ComfyUI **0.39.0**, RTX **4090 24GB**: both sampling
stages and video saving completed, producing 25 frames at 1280x640/24 fps.
The initial cold test took about **89 seconds**; the art-direction test took
about **31 seconds** with models and upstream nodes cached. The portable starter
completed in about **59 seconds** with model loading cached. The metallic look
and visible guide motion were inspected in the result
([preview](../examples/assets/ltx-layout/result-preview.mp4)). This short test
does not establish exact camera fidelity, complex object-motion accuracy or
long-clip performance. The raw proxy used as Look Still copied the placeholder
appearance; the separate art-directed image corrected that result.

## Not supported

- A dedicated Layout to Render Monitor profile with LTX-specific preflight.
- The legacy LTX-2 **19B camera-control LoRAs** are not a path for the 22B
  LTX-2.5 model and are not offered by any profile.

## Licences

OmniCam's code is MIT. The LTX-2.5 and IC-LoRA weights are under the
[LTX-2 Community License](https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x)
(free below USD 10M annual revenue, a paid agreement above). Gemma weights have
their own terms. OmniCam does not redistribute any weights; download them from
the links above.
