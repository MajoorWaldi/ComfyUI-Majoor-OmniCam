// Wire constants shared between the Director's Agent bridge and the backend
// broker (omnicam/agent/protocol.py). Keep the two in sync by hand -- there is
// no code generation between Python and JS in this repository.

export const AGENT_PROTOCOL = "omnicam-agent/1";
export const AGENT_EVENT = "majoor.omnicam.agent.request";
export const AGENT_SCHEMA_VERSION = 1;

export const AGENT_ROUTES = Object.freeze({
  register: "/majoor/omnicam/agent/v1/session/register",
  heartbeat: "/majoor/omnicam/agent/v1/session/heartbeat",
  reply: "/majoor/omnicam/agent/v1/reply",
  close: "/majoor/omnicam/agent/v1/session/close",
});

export const AGENT_HEARTBEAT_INTERVAL_MS = 10_000;
