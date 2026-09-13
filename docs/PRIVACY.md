# Privacy and threat model

A receipt can leak a query, the existence of a record, a stable identity, an internal
policy, or a source's location. Metadata is not automatically public. A receipt can
also lie, contain prompt injection, or be attached to the wrong context packet.

| Threat | Required integration response |
| --- | --- |
| Private content copied into descriptions | Emit category-only disclosures; review before routing or logging |
| Sensitive record existence exposed | Uniform `withheld` state independent of whether records exist |
| Tool-supplied instructions or permission claims | Treat as data; enforce authority and access in the host |
| Replayed receipt or later packet truncation | Check packet revision; create a downstream receipt |
| False `boundary_observed` claim | Verify trusted capture independently; schema cannot authenticate it |
| Malicious reference or extension | Never auto-fetch references or execute actions from receipt text |
| Missing or cyclic parent records | Bounded authorized resolution; report unresolved lineage |
| Receipt retained longer than original data | Independently enforce retention for both, including logs and traces |

Model view: compact limitations and authorized challenge choices. User view:
understandable scope and explanations that the user may access. Developer view:
operational metadata only where authorized. Audit view: restricted references and
capture evidence. None is automatically entitled to more content based on its label.

Separate views use separate receipt IDs and the same packet association where
appropriate. Changing the audience label does not sanitize a receipt. Do not build
an allow-all projection followed by redaction; construct each view from permitted
fields. A generic converter is intentionally absent.

The Python CLI does not print raw validation errors, input values, or property paths.
It rejects duplicate mapping keys and limits file size. It is a local development
helper, not a hardened network ingestion service. Services need request budgets,
authorized logging, depth/resource limits, and a trusted delivery integration.

No signatures, credentials, access-control engine, or raw private fixtures are part
of this draft. Hashes and signatures require a separate threat model before adoption.
