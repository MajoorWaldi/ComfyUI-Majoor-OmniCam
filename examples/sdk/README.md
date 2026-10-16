# Run the LTX-2.5 Layout to Render workflow with the Comfy SDK

[`run_ltx_layout_to_render.py`](run_ltx_layout_to_render.py) runs
[`10_ltx25_layout_to_render.json`](../workflows/10_ltx25_layout_to_render.json)
from a script through the official [Comfy SDK](https://docs.comfy.org/development/api-development/sdks):
it loads the API-format export [`ltx25_layout_to_render.api.json`](ltx25_layout_to_render.api.json),
sets your layout video, look still, prompt and seed, submits the job, prints
its progress and downloads the render.

The **layout video** is an OmniCam playblast: it sets camera and composition.
The **look still** sets the appearance. Record the playblast in the OmniCam
Director (see [docs/LTX.md](../../docs/LTX.md#layout-to-render)) and run any
number of looks and seeds against it from the script.

## Setup

1. ComfyUI with **ComfyUI-Majoor-OmniCam** and
   **[ComfyUI-LTXVideo](https://github.com/Lightricks/ComfyUI-LTXVideo)** installed,
   and the LTX-2.5 weights from [docs/LTX.md](../../docs/LTX.md). Start it
   (default `http://127.0.0.1:8188`).
2. In a separate Python 3.10+ environment:

   ```bash
   pip3 install -r examples/sdk/requirements.txt
   comfy-api-proxy run
   ```

   During the Comfy API v2 beta, `comfy-api-proxy` serves the API the SDK talks
   to, in front of your ComfyUI, on `http://127.0.0.1:8189`
   ([API Proxy docs](https://docs.comfy.org/development/comfyui-server/api-proxy)).
   No API key is needed locally.

## Run

```bash
python examples/sdk/run_ltx_layout_to_render.py \
  --layout layout.mp4 \
  --look look.png \
  --prompt "A tall freestanding metallic monolith floating in deep space." \
  --out renders/
```

| Option | Meaning |
|---|---|
| `--layout` | Layout video: an OmniCam playblast that sets camera and composition. |
| `--look` | Look still: the appearance reference. |
| `--prompt` | Positive prompt. |
| `--seed` | Noise seed for both samplers. Default: the workflow's. |
| `--out` | Folder for the downloaded video. |
| `--base-url` | Comfy API v2 URL (default `COMFY_BASE_URL` or `http://127.0.0.1:8189`). |
| `--comfyui` | ComfyUI URL, used to check nodes and models before submitting. |

Before submitting, the script checks that ComfyUI is reachable, that every node
the run needs is installed, and that every model file it loads is present; each
failure names the fix (node pack to install, weight file and download page). A
failed job reports the node and ComfyUI's message.

## Updating the API export

`ltx25_layout_to_render.api.json` is ComfyUI's *Export (API)* of workflow 10.
Re-export it after editing that workflow; `tests/test_sdk_launcher.py` fails if
the two drift apart.
