# Headless Agent example

`omnicam-agent-headless.json` is the simplest runnable pair: **OmniCam
Director -> OmniCam Monitor** (`wan_camera_native` profile), with a short
two-camera-key scene already authored in the Director's `state_json`.

This demonstrates the **headless** Agent path from
[`docs/AGENT_INTEGRATION.md`](../../docs/AGENT_INTEGRATION.md):

```text
Agent -> official comfy-mcp -> this workflow -> OmniCam nodes (queued)
```

An Agent that speaks the official Comfy MCP contract discovers
`MajoorOmniCamDirector` and `MajoorOmniCamMonitor` through the normal
`/object_info` schema like any other ComfyUI node, edits their widgets (most
importantly the Director's `state_json`) or submits a modified API-format
prompt, and queues it. Heavy work (Monitor's compile, and any downstream
generation) runs on ComfyUI's own queue -- nothing about this path is
Agent-specific at the graph level.

## What this is *not*

This is **not** the live Agent path. A Director instance already open in a
browser (mid-edit, with undo history, with a user watching) is reached
instead through the **OmniCam Agent Contract v1** -- a loopback-only broker
that forwards a bounded `query`/`transaction` to that exact browser session
over the existing PromptServer WebSocket connection and answers with the
same `ui.directorApi` an interactive edit uses. See
[`docs/AGENT_INTEGRATION.md`](../../docs/AGENT_INTEGRATION.md) for that
transport; it has no node and no graph representation, so there is nothing
to add here for it.

## Extending this example

A second, Extractor-first example (`Extractor -> Director -> Monitor`,
recovering a camera from a reference clip before compiling) is a natural
follow-up but is not shipped here yet -- build one the same way any other
`examples/workflows/*.json` is built, dropping it under `examples/agent/`
instead if it is meant to illustrate the headless Agent path specifically.

## Verifying this workflow

This file was hand-built to match the exact node/widget shape ComfyUI itself
serializes (see `examples/workflows/*.json` for real shipped references) but,
unlike the workflows directory, is not covered by an automated load test.
Before relying on it, drop it into a current ComfyUI and confirm it loads
without a missing-node error and queues successfully.
