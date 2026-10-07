# Run the LTX-2.5 workflow with the Comfy SDK

[`run_ltx_motion_track.py`](run_ltx_motion_track.py) runs
[`09_ltx25_motion_track.json`](../workflows/09_ltx25_motion_track.json) from a
script through the official [Comfy SDK](https://docs.comfy.org/development/api-development/sdks):
it loads the API-format export [`ltx25_motion_track.api.json`](ltx25_motion_track.api.json),
sets your image, prompt, seed and (optionally) a saved Director scene, submits
the job, prints its progress and downloads the videos. No Director UI is needed
to replay a saved scene.

## Setup

1. ComfyUI with **ComfyUI-Majoor-OmniCam** and
   **[ComfyUI-LTXVideo](https://github.com/Lightricks/ComfyUI-LTXVideo)** installed,
   and the LTX-2.5 weights from [docs/LTX.md](../../docs/LTX.md). Start it
   (default `http://127.0.0.1:8188`).
2. In a separate Python 3.10+ environment:

   ```bash
   pip install -r examples/sdk/requirements.txt
   comfy-api-proxy run
   ```

   During the Comfy API v2 beta, `comfy-api-proxy` serves the API the SDK talks
   to, in front of your ComfyUI, on `http://127.0.0.1:8189`
   ([API Proxy docs](https://docs.comfy.org/development/comfyui-server/api-proxy)).
   No API key is needed locally.

## Run

```bash
python examples/sdk/run_ltx_motion_track.py \
  --image start.png \
  --prompt "A lighthouse keeper walks along the jetty at dusk." \
  --out renders/
```

| Option | Meaning |
|---|---|
| `--image` | Start image: the video's first frame and the Director's card. |
| `--prompt` | Positive prompt; OmniCam appends the camera wording. |
| `--scene` | A saved workflow `.json` containing an OmniCam Director, or a Director `state_json` file. Default: the example's scene. |
| `--seed` | Noise seed. |
| `--out` | Folder for the downloaded videos (`output_*.mp4`, `tracks_*.mp4`). |
| `--tracks-only` | Render only the motion-track guide — no LTX weights needed. |
| `--base-url` | Comfy API v2 URL (default `COMFY_BASE_URL` or `http://127.0.0.1:8189`). |
| `--comfyui` | ComfyUI URL, used to check nodes and models before submitting. |

Before submitting, the script checks that ComfyUI is reachable, that every node
the run needs is installed, and that every model file it loads is present; each
failure names the fix (node pack to install, weight file and download page). A
failed job reports the node and ComfyUI's message.

`--tracks-only` is the quick install check: Director → Monitor →
`LTXVDrawTracks` → video, on CPU in seconds. It uses a resize multiple of 32
because the IC-LoRA's own downscale factor is only known once its weights load;
the full run uses the factor the LoRA declares.

## Updating the API export

`ltx25_motion_track.api.json` is ComfyUI's *Export (API)* of workflow 9. Re-export
it after editing that workflow; `tests/test_sdk_launcher.py` fails if the two
drift apart.
