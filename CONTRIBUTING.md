# Contributing

Context Receipts is an experimental proposal. Begin with a concrete failure:
what context was selected, what was missing, and which decision should change?
Use synthetic examples and do not include credentials or private incident data.

For schema or consumer changes:

1. Explain the semantics, including missing, unknown, and withheld information.
2. Keep v0.1 compatible; version breaking contract changes explicitly.
3. Add a negative test for the failure, not only a valid example.
4. Run the commands in the README and describe what they do not establish.
5. Keep authorization in the host. A receipt must never grant privileges.

Prefer one canonical JSON Schema over separately maintained handwritten validators.
Additional language helpers should share positive and negative conformance cases.
Keep the core small; use documented extensions for domain-specific experiments.

Do not claim benchmark improvement from schema validation or the deterministic demo.
Use the applicable terms in [LICENSES.md](LICENSES.md) for new contributions and
confirm that you have the rights to submit them. Third-party material must retain
its notices and any separate terms; do not assume this policy relicenses older contributions.
