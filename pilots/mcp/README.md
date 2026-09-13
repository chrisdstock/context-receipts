# Synthetic MCP tool-to-host pilot

This private, MIT-licensed development package uses the official
[`@modelcontextprotocol/sdk` v1.30.0](https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.30.0).
The test observes initialization negotiating **2025-11-25**, then exercises
`tools/list` and `tools/call` through the SDK's linked in-memory JSON-RPC transport.
This deliberately uses the v1 SDK and that protocol revision; it does not claim
support for newer protocol revisions, remote transports or general MCP conformance.
See the [versioned MCP tools specification](https://modelcontextprotocol.io/specification/2025-11-25/server/tools).

## Run

Node 22 or 24, from the repository root:

```sh
npm ci --ignore-scripts --prefix packages/typescript
npm run build --prefix packages/typescript
npm ci --ignore-scripts --prefix pilots/mcp
npm test --prefix pilots/mcp
npm run demo --prefix pilots/mcp
```

No Python runtime is needed for this pilot. The SDK talks between a real MCP client
and server in the same process. No network service, model API, credentials or
production action is used. Installing dependencies requires registry access.
The demo prints actual assembled model input, host denial, an authorized expanded
packet, the negotiated version and a count of dispatched tool calls (two).

## Data and boundaries

The server reads the independently authored [#8 fixture](../../examples/rag-detailed/README.md),
selects active published-guide chunks above its fixed threshold, and returns an
application envelope `{packet, receipt}` in `structuredContent`. It uses no MCP
extension fields and returns empty `content`; this is a purpose-built client, not
an assertion that arbitrary clients display structured output automatically.

The host validates with the existing TypeScript receipt helper. For this synthetic
pilot only, it independently computes the expected packet and receipt from its
local copy of the known fixture. Exact comparison rejects misleading coverage,
altered evidence, wrong binding and injected instructions, even when schema-valid.
This common fixture oracle is **not independent verification of retrieval truth**:
a shared implementation error can escape it. External tools need a different trust
and capture mechanism. `self_reported` never establishes verification by itself.

The host explicitly serializes `{packet, receipt}` into a tool-role `modelInput`
data record. This is the inspected boundary artifact that an adapter could submit
to a model, not an actual model invocation or a complete vendor request format.
Neither `content` nor `_meta` is forwarded or used as a fallback. Nothing becomes a
system or developer instruction. Injection resistance here is narrow exact-fixture
rejection, not evidence of model resistance to adversarial instructions.

For each accepted assembly, the host creates a fresh receipt ID at `model_input`,
links the upstream receipt, and binds the actual selected chunks to a content-derived
revision. Truncation updates included sources and discloses a host delivery omission.
Coverage stays partial and freshness unknown. Digests are reproducibility identifiers,
not signatures. `boundary_observed` describes this host's assembly observation only.

## Audiences, failures and permissions

This toy host is configured to retain the three non-model audience views in separate
`surfaces.user`, `surfaces.developer` and `surfaces.audit` containers. They are
**unverified data**, never displayed or executed, and produce no model input or
follow-up capability. These containers demonstrate routing, not an access-control UI.
A real host must authorize viewers independently of the producer's audience label.

Missing, invalid or unverified model receipts yield a status and no model input.
Schema-invalid payloads hidden under `withheld` fail closed; valid withheld audit
state remains just that state, without an inferred record or copied audit metadata.
Synthetic sentinel tests ensure private audience content and alternate transport
channels do not reach the model input artifact.

`requestMore` is an internal host orchestration helper, not a callable model tool
or security API. It accepts only a successful host result and checks the host's
current allowed scope before dispatching the fixed three-chunk retrieval. The
empty scope set denies the request without an MCP call. The permitted call adds
`clearance@4` while still excluding retired and unsearched material. No receipt
can change the allowed scope set or request an arbitrary tool/budget.

## Verification and remaining work

Sixteen tests cover handshake/discovery, explicit model delivery, schema validation,
misleading and missing receipts, altered evidence, binding, injection, withheld
metadata, audience routing, truncation, receipt identity, denied/permitted dispatch
and invalid server arguments. CI runs these and the demo on Node 22 and 24.

This closes the synthetic integration milestone (#9). Behavioral evaluation (#19)
remains separate: no model response quality, real-user privacy, remote authentication,
transport isolation or production readiness is established by this pilot.
