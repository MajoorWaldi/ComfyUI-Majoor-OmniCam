# OmniCam Agent integration

OmniCam is controllable by an AI agent through two complementary, separate
layers. Neither replaces the other, and neither adds an LLM SDK, a fourth
public node, or any Agent metadata to the MotionScene contract.

## Headless: official Comfy MCP

```text
Agent -> official comfy-mcp -> ComfyUI workflow -> OmniCam nodes (queued)
```

An Agent that already speaks the official Comfy MCP contract discovers
`MajoorOmniCamExtractor`, `MajoorOmniCamDirector` and `MajoorOmniCamMonitor`
through the normal `/object_info` schema and drives them like any other
ComfyUI node: it submits or edits a workflow and queues it. Heavy work
(Extractor solves, Monitor compiles) stays on ComfyUI's own queue exactly as
it does for an interactive user -- this path adds nothing new to how OmniCam
executes.

OmniCam does not depend on `comfy-mcp` at runtime and does not vendor it.

## Live Director: the OmniCam Agent Contract v1

```text
Agent -> OmniCam Agent Contract v1 -> browser Director API (ui.directorApi)
```

The browser-resident Semantic Director API (`web-src/director-api/`) is the
single, versioned, bounded mutation/query surface an interactive edit already
goes through. The OmniCam Agent Contract is a thin transport that lets an
external Agent process reach that same surface on a *specific, already-open*
Director instance, without a graph submission or a queue round-trip:

- a live Director registers itself with a small in-process broker over
  ComfyUI's existing PromptServer/WebSocket connection (no second server, no
  new port);
- an external Agent process calls a handful of loopback-only HTTP routes
  (`/majoor/omnicam/agent/v1/*`) to list live sessions, and to send a bounded
  `query` or `transaction` at a chosen session;
- the broker forwards the request to the exact browser client id over the
  existing WebSocket, the Director answers with `ui.directorApi.query(...)`
  or `ui.directorApi.execute(...)` -- the same calls a button click makes --
  and the reply is relayed back to the Agent.

Every Agent edit is therefore a normal Semantic Director API transaction: it
is bounded (at most 50 operations, entity locks respected), it is one undo
step, and it goes through the same validation an interactive edit does.

### Optimistic concurrency

Every transaction and query response carries a `revision` -- a counter bumped
each time the Director serializes its state. An external Agent transaction
must always include the `baseRevision` it last observed; a mismatch is
rejected atomically with `STALE_REVISION` before any operation runs, so an
Agent can never silently commit over a scene the user (or another Agent) has
since changed. The browser's own interactive UI does not need to supply
`baseRevision` -- it is always working against the live state directly.

### Why these are separate

Generic workflow discovery/execution is deliberately left to the official
Comfy MCP; OmniCam does not reimplement it. The live Director bridge exists
because MCP's workflow model has no concept of "the Director the user
currently has open in their browser" -- that is a live editor session, not a
queued graph, and reaching into it needs its own bounded, authenticated
transport.

## Security summary

See `docs/SECURITY.md` for the full contract. In short: the routes an
external Agent process calls directly are loopback-only and require an
explicit `X-OmniCam-Agent: 1` header; the browser's own callback routes are
authenticated by an ephemeral, in-memory session token instead. Nothing here
is a claim of remote-Agent authentication -- do not expose the ComfyUI server
to an untrusted network.

## Compatibility note

`docs/AGENT_INTEGRATION.md` (this file) documents an additive transport layer
only. It does not change `OMNICAM_MOTION_SCENE`, the camera track schema, or
any of the three public node contracts -- see `docs/COMPATIBILITY.md`.
