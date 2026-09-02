# OmniCam Technical Reference

## Architecture

OmniCam keeps camera authoring model-agnostic:

```text
Viewport / timeline -> MAJOOR_OMNICAM_TRACK -> adapters
```

Director, Extractor, and Monitor are the product nodes. Model-specific logic belongs behind Monitor adapters and must not enter the canonical track.

The frontend has a small extension bootstrap in `web/omnicam.js`; product surfaces load from code-split chunks. Three.js and media components load only when their respective UI needs them. Do not move these dependencies into startup imports.

## DPVO Runtime

DPVO is optional and runs in a fresh spawned process. Frames travel through a private NumPy memmap in ComfyUI's temporary directory, and the child process is reaped on success, stop, and failure so its CUDA context can be released.

Read-only memmap frames are copied into writable, C-contiguous NumPy arrays before `torch.from_numpy`. The worker reports `finalizing` after frame ingest and immediately before `slam.terminate()`. Interactive jobs display that period as `SOLVING`.

A 120-second watchdog applies only while DPVO global optimization is finalizing. It reports an actionable failure when `slam.terminate()` does not return; it recommends a shorter clip, a lower `max_dimension`, or `opencv_sift`.

The checkpoint location is fixed and managed:

```text
ComfyUI/models/omnicam/dpvo/dpvo.pth
```

OmniCam never installs packages, executes a shell command, or accepts a checkpoint path from a workflow or browser request.

## Installing DPVO

DPVO ([princeton-vl/DPVO](https://github.com/princeton-vl/DPVO), MIT) is a
compiled CUDA extension. OmniCam does not bundle it, does not `pip install` it,
and does not fetch its checkpoint at runtime — installing it is a one-time,
manual step you take outside ComfyUI. Skip it entirely and `method=opencv_sift`
(or `auto`, which falls back to it) still works with no CUDA build at all.

**Why the community forks do not just work.** A compiled CUDA extension is
linked against the exact ABI of the PyTorch build it was compiled against.
Portage guides that build DPVO in a dedicated conda environment give it *their
own* PyTorch — the result imports fine there and not at all in ComfyUI's
`python_embedded`, because that is a different PyTorch build with a different
ABI. DPVO has to be compiled **against ComfyUI's own embedded PyTorch**, in
that same interpreter, or `MajoorOmniCamExtractor` will never see it.

**Prerequisites**

- An NVIDIA GPU. Match `TORCH_CUDA_ARCH_LIST` to your generation (`8.9` for
  RTX 40-series; see [NVIDIA's compute capability table](https://developer.nvidia.com/cuda-gpus)
  for others).
- Visual Studio 2022 (Community is fine) with the "Desktop development with
  C++" workload — this is what provides `cl.exe` and `vcvars64.bat`.
- A CUDA toolkit whose major version matches the embedded PyTorch's
  (`python_embeded\python.exe -c "import torch; print(torch.version.cuda)"`).
  `torch.utils.cpp_extension` refuses to compile against a mismatched `nvcc`.
  If the system does not already have a matching toolkit installed and you
  would rather not install one system-wide (admin rights, several GB), NVIDIA
  publishes the toolkit's individual components as redistributable archives
  that can be unpacked into a private, portable `CUDA_HOME` — no installer, no
  admin rights, no changes outside your own working directory.
- No conda, no WSL2: this all happens inside ComfyUI's own `python_embeded`.

**Sequence**

1. Get the DPVO source: `git clone https://github.com/princeton-vl/DPVO` (and,
   since `dpvo/net.py` depends on it, `git clone https://github.com/rusty1s/pytorch_scatter`
   too).
2. Patch the upstream sources for a recent PyTorch + MSVC. As of PyTorch 2.9,
   four fixes are needed, none of which change DPVO's behavior:
   - `AT_DISPATCH_*` macros need `.scalar_type()` — PyTorch 2.x dropped the
     implicit `DeprecatedTypeProperties -> ScalarType` conversion the macros
     used to rely on.
   - Device translation units must not include `torch/extension.h`: it drags
     in `torch/csrc/dynamo/compiled_autograd.h`, which nvcc's MSVC host pass
     cannot parse (`C2872: 'std': ambiguous symbol`). Swap it for
     `torch/types.h` + the specific ATen headers actually used; keep
     `torch/extension.h` only in the few `.cpp` files that declare
     `PYBIND11_MODULE`.
   - DPVO spells its 64-bit tensor index type `long`, which MSVC treats as
     32-bit, so `accessor<long, N>` resolves to a template PyTorch never
     instantiates and the link fails. Rewrite it to `int64_t` wherever it is
     used as a tensor index.
   - `ba_cuda.cu` assigns a GNU compound literal (`(float[6]){...}`) to a
     `float*`, which MSVC rejects, and calls `torch::pickle_save`, now under
     `torch::jit`. Both need small rewrites to compile even though the
     function is dead code upstream.

   These are mechanical and easy to get subtly wrong; scripting them against
   the exact upstream source is safer than hand-editing.
3. Set the build environment and compile, in that order — `vcvars64.bat` has
   to run before anything invokes `cl.exe`:
   ```bat
   set "CUDA_HOME=<your CUDA 13 toolkit>"
   set "PATH=%CUDA_HOME%\bin;%PATH%"
   set "DISTUTILS_USE_SDK=1"
   set "TORCH_CUDA_ARCH_LIST=8.9"
   call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat"
   python_embeded\python.exe -m pip install --no-build-isolation .\pytorch_scatter
   python_embeded\python.exe -m pip install --no-build-isolation .\DPVO
   ```
4. Fetch the checkpoint from the archive linked in [DPVO's README](https://github.com/princeton-vl/DPVO#pretrained-models)
   (upstream hosts it on Google Drive) and place it at the one path OmniCam
   reads — not configurable, never accepted from a workflow:
   ```text
   ComfyUI/models/omnicam/dpvo/dpvo.pth
   ```
5. Verify, in the same embedded interpreter — torch has to import first, since
   it puts its own CUDA DLLs on the search path the extension needs:
   ```bat
   python_embeded\python.exe -c "import torch, cuda_ba, cuda_corr, lietorch_backends; from dpvo.dpvo import DPVO; print('DPVO OK')"
   ```
   `MajoorOmniCamExtractor` then accepts `method=dpvo`, and `method=auto`
   prefers it over `opencv_sift` automatically.

A portable CUDA toolkit unpacked purely for the build (step 3) is only needed
at compile time: at runtime the compiled `.pyd` files find their CUDA DLLs in
`torch/lib`, loaded the moment `import torch` runs. It can be deleted after a
successful build, at the cost of re-fetching it to rebuild later.

## Adapter Contracts

Adapter capability detection checks actual node classes and input contracts. Pinned support and compatibility details are maintained in [NODES.md](NODES.md) and [COMPATIBILITY.md](COMPATIBILITY.md).

The weekly `adapter-contract-canary` GitHub Action checks current LTX-Video and WanVideoWrapper source contracts. It is advisory only and never changes declared compatibility automatically.

## Validation and Development

Run the maintained checks from the repository root:

```text
python -m pytest tests/ -q
python scripts/verify_package.py
python -m ruff check .
npm run check
npm run test:unit
npm run test:browser
```

The live ComfyUI gate additionally needs a ComfyUI checkout:

```text
OMNICAM_LIVE_AUTOSTART=1
OMNICAM_COMFYUI_ROOT=/path/to/ComfyUI
OMNICAM_LIVE_MATCH=live-ci.spec.js
npm run test:live
```

Validation coverage and branch-check policy are recorded in [VALIDATION_REPORT.md](VALIDATION_REPORT.md) and [BRANCH_PROTECTION.md](BRANCH_PROTECTION.md). Internal module boundaries and schema rules are documented in [INTERNALS.md](INTERNALS.md).

## Security

Managed assets, upload validation, source resolution, request limits, and environment configuration are specified in [SECURITY.md](SECURITY.md).
