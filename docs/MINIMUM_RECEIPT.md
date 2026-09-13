# Minimum useful receipt decision — September 13, 2026

**Decision: retain the v0.2 draft core. Do not introduce a lite schema or remove
required disclosure fields on the present evidence.** This resolves Issue #6's
current design decision; it does not establish that every field is necessary or
that the current core is optimal. Revisit the decision with field-level and adopter
evidence rather than treating it as permanent.

## Evidence considered

- #8 supplied an independently authored, reproducible detailed RAG fixture with
  internally consistent stages, source revisions and selected evidence.
- #9 demonstrated actual synthetic MCP tool calls, explicit model-input assembly,
  audience routing, downstream receipts and host authorization checks.
- #19 recorded 180 Astra-in-Codex trials. Readiness accuracy was already perfect in
  the no-receipt baseline. Follow-up changes were inconclusive and also appeared
  with misleading receipts. No accuracy improvement was demonstrated.

The [evaluation report](../evals/behavioral/runs/2026-09-13-astra/REPORT.md) documents
these limits. Neither a null accuracy result nor successful host tests establish
which individual receipt fields can be deleted: the study varied whole receipts,
not one field at a time. There are no independent adopter measurements yet.

## Measured cost

The [measurement snapshot](receipt-costs-2026-09-13.json) is reproducible with:

```sh
python scripts/measure_receipt_cost.py
```

Measurements use example/integration files from base commit `b005eda`; source
hashes and archived report provenance are included in the snapshot. Future source
changes can legitimately change the output.

Byte counts are UTF-8 JSON with sorted keys, no whitespace and no ASCII escaping;
the outer `context_receipt` wrapper is included. These are serialization choices,
not a canonical-signature format. Formatted file sizes are recorded separately.

| Receipt example | Compact bytes | Formatted file bytes |
| --- | ---: | ---: |
| Minimal | 642 | 915 |
| Downstream assembly | 983 | 1,463 |
| Memory layer | 1,079 | 1,612 |
| Parenting | 1,187 | 1,777 |
| RAG overview | 1,951 | 2,934 |
| Detailed RAG | 2,192 | 3,171 |

In the frozen experiment, adding the receipt property increased serialized model
data by **1,836–2,283 bytes**, depending on the variant. This measures the receipt
property's byte contribution in-place, not all differences between experimental
conditions. Observed paired input-token overhead against no receipt ranged from
**498.7 to 539.2 tokens per trial** across receipt/capture conditions. Model:
`gpt-6-astra`, Codex CLI 0.154.0, low reasoning. The provider tokenizer and immutable
server model snapshot were unavailable; these are CLI-reported input-token
differences, not local tokenizer counts. Do not extrapolate a token count for the
642-byte minimal example from these measurements.

The CLI contributes substantial baseline context. Neither bytes nor these token
counts establish subscriber allowance cost, latency savings or API charges. See
the archived report for paired intervals and account-wide usage observations.

## What fields currently support

| Field group | Evidence and decision |
| --- | --- |
| Packet binding, receipt identity and parent links | The MCP pilot checks packet association and emits a downstream receipt for assembly/truncation. Preserve the contract; the model study did not isolate these fields. |
| Audience and withheld/unknown/none/disclosed states | Pilot tests distinguish non-model routes and reject payload smuggling under withheld states. Preserve explicit distinctions; labels alone do not enforce access control. |
| Coverage and scope | The study distinguished scoped full from misleading full, but found no readiness-accuracy gain. Retain the ability to describe bounded coverage; do not claim completeness as assurance. |
| Challenge path and permission basis | Follow-up behavior changed in some whole-receipt comparisons. Current host scope controls actual dispatch. Individual field contribution and the need for each field remain unmeasured. |
| Assurance | Producer claims remained separate from scripted host verification signals. Preserve that distinction; neither the label nor this experiment proves truth. |
| Included/excluded context, transformations and freshness | The fixture explains omitted evidence and stale/summarized scenarios. Their individual effect on model decisions remains unknown. Keep them pending ablation evidence. |
| Source, purpose, timestamp, audit metadata | Useful for identifying and interpreting the record by design; no isolated behavioral or independent adoption benefit was measured here. Do not claim proven necessity. |

The host tests establish behavior of the demonstration implementation, not universal
causal benefits from each field. Its exact-fixture comparison deliberately rejects
changed claims; it is not a verifier for arbitrary retrieval systems. No field is
classified as proven useless by these results.

## Integration effort observed

The prototype required work beyond validating JSON:

1. Capture selection stages and associate selected chunks with source revisions.
2. Validate and carry a receipt alongside an actual MCP tool result.
3. Decide which audience sees which content; explicitly construct model input.
4. Create downstream provenance after host assembly or truncation.
5. Check current host permissions before executing a requested follow-up.
6. Preserve raw synthetic results, scoring provenance and failure checkpoints.

The current detailed RAG reproducer is 91 lines; the MCP pilot host/server module
is 112 lines, its tests 116, and its demo 11. Counts include comments and blank
lines, exclude dependencies/reference helpers, and describe this snapshot only.
They are not person-hours, a minimum integration size or evidence of low adoption
cost. No independent team onboarding time, maintenance cost or production deployment
was measured. Schema-backed helpers reduce duplicated validation code; they do not
supply the host's policy or capture mechanisms.

## Practical guidance within the existing schema

Start from the [minimal example](../examples/v0.2/minimal.json), then replace its
unknown states with truthful disclosures as observations become available. Unknown
is appropriate for unavailable knowledge, not as a space-saving substitute for
known omissions. Use none only when absence is established and withheld only under
the host's disclosure policy. Omit optional descriptions when unnecessary and use
compact JSON for transport; preserve required distinctions and source association.

This is authoring guidance, not a new conformance profile. It does not prescribe a
generic privacy projection or authorize a host to silently strip receipt fields.
If a host transforms the evidence packet, its downstream receipt must describe the
actual delivered input. Do not equate a small valid receipt with useful evidence.

## Compatibility and revisit criteria

There is no schema, required-field, enum, helper-API or version change. Existing
v0.1 validation and v0.2 examples remain compatible. No migration is required.

Before proposing a smaller core or optional profile:

- Run a separately frozen ablation study that changes one field/group at a time,
  includes harder baseline decisions and distinguishes procedural gaps from missing
  real-world observations. Retain null and negative results.
- Obtain independent adopter feedback and measured implementation/maintenance effort.
- Measure token cost for the actual candidate representation with a named tokenizer
  or provider-reported usage; preserve host/audience/permission boundary tests.
- Define task-specific quality and safety acceptance criteria before examining the
  new results. Use independent review of gold outcomes where possible.
- Demonstrate compatibility or provide an explicit versioned migration strategy.

These are prerequisites for a future proposal, not additional work silently included
in this decision. The current evidence justifies retaining a stable draft while
acknowledging its overhead; it does not justify claiming an optimal minimum.
