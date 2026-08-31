# Branch protection

Configure the protected release branch to require these exact GitHub Actions
check contexts from `.github/workflows/test.yml`:

```text
python-core (3.10)
python-core (3.12)
python-core (3.13)
python-full
frontend
comfyui-integration (minimum)
comfyui-integration (v0.34.0)
comfyui-browser
```

`comfyui-integration (master)` is intentionally a non-blocking canary. It gives
early warning about upstream ComfyUI changes without silently moving OmniCam's
declared compatibility floor.

This file documents the repository policy only. Applying or changing branch
protection on the remote repository is an administrative action and must be
performed separately with explicit authorization.
