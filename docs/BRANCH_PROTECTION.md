# Branch protection

Configure the protected release branch to require these exact GitHub Actions
check contexts from `.github/workflows/test.yml`:

```text
python-core (3.10)
python-core (3.12)
python-core (3.13)
python-reconstruction
frontend
comfyui-integration (minimum)
comfyui-integration (previous)
comfyui-integration (stable)
comfyui-browser
comfyui-browser-minimum-frontend
comfyui-browser-pinned-frontend
```

`comfyui-browser-minimum-frontend` proves the declared compatibility floor with
ComfyUI `v0.31.0` and `Comfy-Org/ComfyUI_frontend@1.48.7`.

`comfyui-browser-pinned-frontend` re-runs the live suites against current stable
Core plus an explicitly pinned newer frontend (`1.55.2` at the 2026-09-11
baseline). The pin is deterministic; the separate dynamically-latest lane
remains a non-blocking canary.

`comfyui-integration (master)` and `comfyui-browser-latest-frontend` are
intentionally non-blocking canaries. They give early warning about upstream
ComfyUI or frontend changes without silently moving OmniCam's declared
compatibility floor.

`adapter-contract-canary`, defined in
`.github/workflows/adapter-contract-canary.yml`, runs weekly against the current
LTX-Video and WanVideoWrapper `master` branches. It is intentionally
non-blocking and must not be added to the required checks: a failure reports an
upstream node-class or socket-contract change for review, but never changes the
versions OmniCam declares as supported.

This file documents the repository policy only. Applying or changing branch
protection on the remote repository is an administrative action and must be
performed separately with explicit authorization.

## Repository ruleset payload

The canonical repository-ruleset payload is tracked at
`.github/rulesets/main-required-checks.json`. It targets only
`refs/heads/main`, enables strict required status checks, and intentionally
excludes these canaries from the required set:

```text
comfyui-integration (master)
comfyui-browser-latest-frontend
adapter-contract-canary
Vite module graph canary
```

Apply it with a GitHub token that has repository `Administration` write
permission:

```powershell
gh api `
  --method POST `
  -H "Accept: application/vnd.github+json" `
  -H "X-GitHub-Api-Version: 2026-03-10" `
  /repos/MajoorWaldi/ComfyUI-Majoor-OmniCam/rulesets `
  --input .github/rulesets/main-required-checks.json
```

Then verify both endpoints:

```powershell
gh api /repos/MajoorWaldi/ComfyUI-Majoor-OmniCam/rulesets
gh api /repos/MajoorWaldi/ComfyUI-Majoor-OmniCam/rules/branches/main
```

**Remote state checked on 2026-09-08:** repository ruleset `Protect main`
(`22587947`) is active for `refs/heads/main`. It blocks branch deletion,
blocks non-fast-forward updates, and required the status-check set tracked at
that time — `comfyui-integration (v0.34.0)` and no `comfyui-browser-minimum-frontend`
context. The tracked payload above already reflects the `previous` / `stable`
relabeling and the new minimum-frontend gate; applying it to the remote
ruleset is a separate, explicitly authorized administrative action, and the
remote has not been re-verified against it yet.
