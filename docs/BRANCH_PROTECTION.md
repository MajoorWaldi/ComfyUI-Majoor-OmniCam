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
comfyui-browser-current-frontend
```

`comfyui-browser-current-frontend` re-runs the `live-ci` and `live-vue-ci`
suites against an explicitly pinned newer frontend
(`Comfy-Org/ComfyUI_frontend@1.54.1`). The pin is never `@latest`, so this lane
is deterministic and belongs in the required set — it catches a frontend-only
regression before a user hits it.

`comfyui-integration (master)` is intentionally a non-blocking canary. It gives
early warning about upstream ComfyUI changes without silently moving OmniCam's
declared compatibility floor.

`adapter-contract-canary`, defined in
`.github/workflows/adapter-contract-canary.yml`, runs weekly against the current
LTX-Video and WanVideoWrapper `master` branches. It is intentionally
non-blocking and must not be added to the required checks: a failure reports an
upstream node-class or socket-contract change for review, but never changes the
versions OmniCam declares as supported.

This file documents the repository policy only. Applying or changing branch
protection on the remote repository is an administrative action and must be
performed separately with explicit authorization.

**Remote state: unverified.** The GitHub branch-protection API is not readable
with the tokens available to CI or to review tooling (`403 Resource not
accessible by integration`), so the live required-check set on the protected
branch cannot be confirmed against this list from outside. Treat any claim that
these contexts are enforced as unverified until a repository admin checks the
branch settings directly. In particular, `comfyui-browser-current-frontend` was
added to this policy after the initial protection was configured and must be
added to the remote required-check set by hand.
