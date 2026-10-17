# OmniCam Agent integration

## Comfy Agent preparation status

The official **Comfy Agent** side panel and OmniCam's built-in AGENT tab are
separate products. OmniCam does not register tools with that official panel
or import its internal stores. The integration seam is ready for a future
version-specific adapter; a real conversation with the official panel remains
an acceptance gate, not a claimed capability.

Read `GET /majoor/omnicam/agent/v1/contract` (loopback plus
`X-OmniCam-Agent: 1`) for the versioned envelope schema, operation/query
vocabulary, route map, limits, and explicit integration status. The envelope
schema is structural: `validateOnly` on the live Director is authoritative for
operation parameters, locks, assets and entity existence. Camera-path operations
are available to external integrations but intentionally excluded from the
built-in planner's smaller vocabulary. A parity test checks Python/JS discovery.

### Target selection and document lifetime

New browser sessions advertise a `target` containing `document_id`, `graph_id`,
`node_locator`, and `instance_id`. Use the complete target from `/sessions` to
select exactly one `session_id`. Numeric node IDs alone are ambiguous. Graph IDs
come from the node's owning graph/root, never the currently visible tab; older
hosts without graph IDs receive ephemeral identities, including unsaved graphs.
The locator is OmniCam's `graph_id:node_id`, not an official Comfy execution ID.
Shared subgraph definitions target their authored definition, not a particular
execution instance of that subgraph.

Reconfiguration immediately invalidates revisions, closes the old bridge and
rotates its instance identity. Rediscover after configure, reload, reconnect or
server restart; never rebind an old plan to a newly discovered session. Legacy
registrations without `target` remain accepted but must not be auto-selected by
a future native adapter.

### Timeouts and idempotency

Every transaction needs a stable `id`. Keep the same content, id and
`baseRevision` on a retry. Preview and commit use separate journal keys
(`validateOnly=true/false`), so a reviewed preview can keep its id for Apply.
Changing content under a retained id returns `TRANSACTION_ID_CONFLICT`.

The browser checks the broker's `deadline_ms` immediately before committing,
including after asynchronous catalogue lookup. Expired requests return
`REQUEST_EXPIRED`. A timeout can still mean that commit already happened while
resources were loading: it does **not** mean rollback. Query
`POST /majoor/omnicam/agent/v1/transaction/status` with
`{"session_id":"...","transaction_id":"..."}` before retrying.
Status is `pending`, `unknown` (timed out, outcome not yet received), or
`completed` with the original result. A retry does not resend an unresolved or
completed intent. The in-memory journal retains up to 128 intents for 120 seconds,
rejects new work when full and accepts late replies. Session close/restart drops
its outcomes. After retention expiry/`UNKNOWN_TRANSACTION`, read the scene and
reconcile the intent; never automatically issue a new ID. Browser and server
wall clocks must agree for deadline checks (normally automatic on local installs).

The planner preserves the revision of its first scene observation. A subsequent
observation or preview at another revision yields `STALE_PLAN`, requiring a new
preview rather than silently rebasing an old model response.

`examples/agent/live_client.py` demonstrates exact target selection,
query/preview, explicit reviewed Apply, and outcome recovery without an SDK,
new server or provider credential. It is an example client, not a plugin for
the official panel. It does not queue workflows or record playblasts.

### Future adapter acceptance checklist

- Record exact Core, Frontend, Desktop (if used) and Comfy Agent versions.
- Verify the official extension/tool mechanism on that version before wiring it.
- Discover actual node schemas and this contract; preserve the three public nodes.
- Test two documents with reused node IDs, unsaved workflows, subgraphs,
  tab switches, closed Director, reconnect and node removal.
- Exercise Preview/Apply with concurrent manual edits and document reconfigure.
- Recover a timeout after commit without repeating the edit.
- Save/reload the workflow and compare authored cameras, objects and timing.
- Run Monitor preflight independently; use the host's execution approval for
  queued generation. Agent edits themselves never require diffusion execution.
- Run classic/Vue live tests and a real official-panel conversation before
  advertising native compatibility.

`npm run test:live` includes the fixture-free classic and agent broker tests.
Set `OMNICAM_LIVE_MATCH=live-vue-ci.spec.js` for the Vue lane. Live tests run
serially because renderer settings and the queue belong to the shared server.

OmniCam is controllable by an AI agent through three complementary, separate
surfaces. None replaces another, and none adds an LLM SDK, a fourth public
node, or any Agent metadata to the MotionScene contract:

```text
A. Official Comfy MCP
   headless workflow/node/job control

B. OmniCam Agent Contract v1
   live browser Director query/transaction transport (an external Agent
   process reaching a specific, already-open Director)

C. Built-in OmniCam Agent
   provider -> bounded planner -> Agent Contract -> validateOnly -> Preview -> Apply
   (the Director's own AGENT tab, describing a shot in the browser)
```

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

## Built-in: the OmniCam Agent panel

```text
User instruction (Director AGENT tab)
    -> provider (Ollama / OpenAI / OpenAI-compatible / Anthropic)
    -> bounded planner loop (query/transaction/finish JSON actions)
    -> the same Agent Contract v1 broker surface as an external Agent uses
    -> ui.directorApi with validateOnly=true
    -> Preview (semantic diff shown to the user)
    -> explicit Apply -> validateOnly=false
```

The built-in Agent is a **browser/ComfyUI surface**, not a remote-Agent
authentication API: its two HTTP routes
(`/majoor/omnicam/agent/v1/plan`, `/majoor/omnicam/agent/v1/apply-plan`) are
browser callbacks the Director's own panel calls for the session it already
registered, the same trust model as the provider config routes in
`docs/SECURITY.md`. They are not loopback-restricted the way the *external*
Agent Contract v1 routes (`/capabilities`, `/sessions`, `/query`,
`/transaction`) are -- those remain loopback-only regardless of anything
described here.

- **Providers:** `ollama` (local, no credential), `openai_compatible` (local
  or remote self-hosted server, no credential), `openai`, `anthropic`
  (cloud, credential required). See `omnicam/agent/providers/`.
- **Local vs cloud data boundary:** only the user's instruction and the
  semantic Director query observations the planner requested are ever sent
  to the configured provider -- never playblast video, source video, image
  pixels, 3D binary files, or secret values. The Agent panel discloses this
  per provider before Preview (a loopback Ollama/OpenAI-compatible endpoint
  gets a local-only notice; anything else gets an outbound notice).
- **`baseRevision`:** every proposed transaction carries the Director's
  current revision at plan time; Apply is rejected with `STALE_PLAN` if the
  scene changed since the Preview was generated, exactly like an external
  Agent's `STALE_REVISION`.
- **Plan TTL:** a previewed-but-not-yet-applied plan is held server-side
  (`omnicam/agent/plan_store.py`) for `PLAN_TTL_SECONDS` (120s) before it
  expires and Apply reports `UNKNOWN_PLAN`.
- **Preview -> Apply is mandatory**, not a setting the planner can bypass --
  there is no way to make a built-in Agent transaction commit immediately.
- The bounded planner loop, provider network policy, and error redaction are
  documented in full in `docs/SECURITY.md`'s "Built-in OmniCam Agent" section.

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
