# Conformance results

One JSON file per `(profile, case, seed)` actually run against a real model,
named `<profile>__<case>[__seed<N>].result.json` and matching
`majoor.omnicam.conformance.result.v1` (see [../../../docs/CONFORMANCE.md](../../../docs/CONFORMANCE.md)).

**Status: empty.** No Monitor profile has real-model conformance evidence yet.
Every profile is `PENDING` in [docs/COMPATIBILITY.md](../../../docs/COMPATIBILITY.md)
until result files land here and `docs/CONFORMANCE.md` records the pass.

A result file is only valid with real data. `omnicam_commit` must be a real
tested commit SHA and `model` a real model name and revision — never a
placeholder, never a value an agent invented.
