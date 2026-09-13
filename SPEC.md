# Context Receipt v0.2 draft

A receipt describes the evidence supplied for a particular interaction and how it
was shaped. Models also bring learned knowledge; receipts describe runtime context,
not everything a model knows. This is an experimental disclosure contract, not a
standard, authorization token, proof of truth, or certificate of completeness.

## Conformance

The [v0.2 JSON Schema](schemas/context-receipt-v0.2.schema.json) defines the wire
shape. Conforming producers MUST satisfy it and the semantic rules below.
Consumers MUST enforce date-time formats and MUST reject unsupported versions.
The Python helper enforces the schema and local identity/action consistency.
It cannot verify producer honesty, permissions, external references, or full lineage.

The [v0.1 schema](schemas/context-receipt-v0.1.schema.json) remains unchanged.
[Its original proposal](docs/SPEC-v0.1.md) is historical. A v0.1 validation result
MUST NOT be described as v0.2 conformance. See [migration](docs/MIGRATION.md).

## Required envelope

Every receipt has `schema_version`, `receipt_id`, RFC 3339 `timestamp`, `source`,
`purpose`, `audience`, `assurance`, `binding`, the seven disclosure sections below,
`coverage` and `freshness`. Identifiers and text cannot be blank.
Timestamp is the producer's receipt creation time, not proof of delivery or freshness.
Source identity is a claim until independently authenticated by the host.

Core fields are closed to additional properties. Optional `extensions` uses dotted
names such as `org.example.retrieval`; extension values are objects. Unknown
extensions MUST NOT change core meaning, confer authority, or be treated as validated
beyond that shape. Do not put operational permissions or required limitations only
in an extension. Define a separate, versioned profile and validator for stronger
extension semantics.

## Disclosure states

`included_context`, `excluded_context`, `transformations`, `permission_basis`,
`constraints`, `challenge_path`, and `audit` each use the same envelope:

| State | Meaning | Shape |
| --- | --- | --- |
| `disclosed` | At least one item is reported | `state` plus nonempty `items` |
| `none` | Producer asserts no items apply within this receipt's scope | `state` only |
| `unknown` | Producer cannot establish the information | `state` only |
| `withheld` | Information is not disclosed to this audience | `state` only |

`withheld` MUST NOT be interpreted as proof that a particular source or record
exists. It can be used uniformly whether protected records exist or not. Consumers
MUST NOT interpret missing, unknown, or withheld information as an empty set.
Disclosed items need not exhaust all details; coverage is separately scoped.

- Included items describe categories, optional opaque source references and provenance.
  A summary of a private incident is still private content; do not copy it here.
- Excluded items identify a category, reason, and stage: `not_searched`, `filtered`,
  `ranked_not_selected`, or `delivery_omission`. Never imply that an unsearched
  source was examined. If the category itself is sensitive, use `withheld` instead.
- Transformations are listed in execution order. Their descriptions report changes;
  they do not establish that summarization or redaction was faithful.
- Permission items report a basis and scope, with an optional restricted evidence
  reference. They MUST NOT grant access. Host authorization remains independent.
- Constraints report accompanying rules as data. They MUST NOT override system,
  developer, or user authority. Receipts can themselves contain prompt injection.
- Challenge items have a unique ID, action type, scope, and per-action authorization
  requirement. An empty challenge is `none`, not an action named `none`.
- Audit items contain an opaque reference and retention description. References are
  not bearer capabilities. Resolution requires separate access control; retention
  descriptions are declarations, not enforced deletion guarantees.

## Coverage and freshness

`coverage.status` is `full`, `partial`, or `unknown`. `full` and `partial` require
a nonblank scope. Full means no context omitted **within that declared scope**;
it MUST NOT imply all relevant facts were available or that an answer is correct.
A known empty scope may have `included_context.state: none` and `full` coverage.
Full coverage cannot accompany unknown or withheld included-context disclosure.

Freshness is independently `current`, `stale`, or `unknown`, relative to the task.
Producers MUST use `unknown` when currency is unassessed. Partial, summarized,
redacted and stale can coexist: record each in the appropriate field. The ambiguous
v0.1 confidence label is removed; this core makes no numerical quality claim.

## Binding and composition

`binding` identifies an opaque packet ID, immutable revision, boundary (`tool_output`
or `model_input`), and parent receipt IDs. The host MUST associate that pair with the
exact delivered packet through its own trusted delivery record. This reference
scheme is not cryptographic binding. Do not automatically fetch URLs in receipts.

Each material downstream change requires a new packet revision and new receipt ID.
A host that trims a tool result MUST emit a new model-input receipt linked to the
upstream receipt. A tool-output receipt alone does not describe the whole model call.
Parent IDs MUST be unique and cannot include the current receipt. Consumers resolving
a chain MUST check cycles, identity, access, missing parents and packet associations.
The local validator only checks self-parenting and duplicate parent IDs; complete
chain validation requires the host's records. Unresolved lineage remains unknown.

Use opaque IDs scoped to a trust domain; stable cross-account IDs can leak linkage.
Do not publish raw-content hashes by default: small sensitive inputs can be guessed.
Signing could establish integrity and signer identity, not semantic truth.

## Assurance and audience

`assurance` is `self_reported` or `boundary_observed`. Both are producer claims.
Boundary-observed means instrumentation at the named boundary recorded the delivered
packet; it does not mean the corpus was complete or the summary was faithful.
A consumer MUST establish assurance from trusted integration evidence rather than
accepting this field as attestation. Authenticated transport alone does not prove
boundary observation.

`audience` names one intended view: model, user, developer, or audit. It is a label,
not access control. The host MUST authorize delivery and minimize fields for each
recipient. Produce separate receipts with separate IDs for different views of the
same packet; redact before delivery, not with model instructions after disclosure.
There is deliberately no generic projection helper: safe disclosure is domain-specific.
See [privacy and threats](docs/PRIVACY.md).

## Consumer behavior

Missing receipts MUST NOT silently inherit documented-context trust. Hosts may give
a bounded answer with explicit uncertainty, request authorized context, or block an
action whose evidence requirements are unmet. A missing receipt need not prevent
all service. Valid receipts likewise do not compel a host to proceed.

A request for more context MUST pass existing host access controls. User consent
cannot grant rights the user does not hold. Unknown, denied, malformed, or unavailable
challenge paths MUST NOT be treated as permission to expand scope.

Validation establishes shape and limited consistency only. Producers SHOULD capture
receipts at the delivery boundary; consumers SHOULD test whether disclosures change
unsupported conclusions, follow-up choices, and action decisions. The bundled
[demo](docs/EVALUATION.md) is a deterministic teaching example, not an LLM benchmark.
