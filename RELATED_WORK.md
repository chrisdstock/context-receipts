# Related work and positioning

Context Receipts propose a compact disclosure of how runtime model input was shaped.
They do not establish a new theory of provenance. The useful question is whether
this narrow contract is easier to emit and consume in an application.

| Work | Relationship and limits |
| --- | --- |
| [W3C PROV](https://www.w3.org/TR/prov-overview/) | Foundational entities, activities, agents and derivation. A packet can be modeled as an entity, assembly as an activity, and producer as an agent. This is a conceptual mapping, not an implemented PROV serialization. |
| [OpenTelemetry GenAI attributes](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/) | Existing conventions cover runtime AI telemetry. Receipts can be referenced from traces rather than duplicating content. This repository does not implement an OpenTelemetry exporter or claim compatibility with a particular convention version. |
| [JSON Schema 2020-12 validation](https://json-schema.org/draft/2020-12/json-schema-validation) | Structural substrate. Format checking must be enabled; validation does not establish the truth of a field. The Python helper explicitly checks RFC 3339 timestamps. |

RAG citations identify supporting sources. Receipts additionally describe search
scope, exclusions and transformations; they still need evidence links for audit.
Agent traces can carry the receipt and its delivery record, but may expose much
more data than a model or user should receive.

Model/system cards and dataset documentation describe standing assets; this proposal
focuses on an individual context delivery. Routing disclosures concern how a request
was executed and can complement that account. These conceptual distinctions are not
claims that adjacent systems lack equivalent features.

Signing and media-provenance analogies should not imply implemented cryptographic
assurance. The current draft uses opaque packet references and explicitly depends
on trusted host records for association. A comparative interoperability study and
additional verified prior art remain future work.
