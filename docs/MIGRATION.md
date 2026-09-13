# Migrating from v0.1

v0.1's schema is unchanged. New v0.2 receipts are intentionally a separate contract.
Do not relabel an old receipt or infer unknown permissions during conversion.

| v0.1 | v0.2 |
| --- | --- |
| Optional disclosure arrays | Required `{state, items?}` envelopes |
| Missing array | `unknown`, unless the producer can establish a stronger state |
| Empty known array | `none` |
| Undisclosable metadata | `withheld`, without revealing categories or counts |
| Completeness mixes coverage, transformations and age | Scoped coverage, ordered transformations, separate freshness |
| Low/medium/high confidence | Removed; no unsupported quality claim |
| Global challenge permission boolean | Per-action authorization and scope |
| Arbitrary additional fields | Dotted keys inside `extensions` |
| Receipt/trace IDs only | Explicit packet revision and delivery boundary |

Source and constraint text is untrusted data in both versions. A trusted migration
must supply audience and binding from actual host records; there is no safe general
migration that invents them. Historical timestamps remain historical, not current.

Legacy examples remain at their original paths, with privacy and consistency fixes.
New examples live in `examples/v0.2/`. The root `SPEC.md` describes v0.2; the original
proposal is preserved as `docs/SPEC-v0.1.md`. Validator dispatch uses the declared
version and never silently upgrades it.
