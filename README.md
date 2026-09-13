# Context Receipts for AI Systems

**If your app shapes what an AI sees, it should say so.**

Models bring learned knowledge, but applications select the current evidence:
retrieved documents, memory summaries, tool results, redactions, and instructions.
A Context Receipt makes those selection decisions inspectable without copying the
underlying private content.

**Status: v0.2 draft, with Python and TypeScript reference helpers.** No package
release or production integration is claimed. The original v0.1 schema is retained.

A receipt reports what was included, excluded, transformed, and permissioned; where
coverage is limited; and what authorized follow-up is available. It is a producer's
claim, not proof of truth, permission, or completeness. Missing receipts must not
silently receive the same trust as documented context.

## Try it

Python 3.10 or newer, from this repository:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt
.venv/bin/python -m context_receipts examples/v0.2/*.json
.venv/bin/python -m unittest discover -s tests -v
.venv/bin/python scripts/rag_demo.py
```

The offline synthetic demo starts with partial support evidence. A host recognizes
that limitation, checks permission, retrieves the remaining fixture, and changes
its decision. Missing, invalid, and unsupported assurance claims remain distinct.
This demonstrates integration behavior; it does not measure model improvement.

## Read or build

- [Specification](SPEC.md) and [v0.2 schema](schemas/context-receipt-v0.2.schema.json)
- [Minimal receipt](examples/v0.2/minimal.json): explicit unknowns, no fabricated detail
- [RAG](examples/v0.2/rag-retriever.json), [memory](examples/v0.2/memory-layer.json),
  [parenting](examples/v0.2/pause-parenting.json), and
  [downstream assembly](examples/v0.2/assembled-input.json) examples
- [Detailed reproducible RAG fixture](examples/rag-detailed/README.md): corpus, stage accounting and packet
- [Python helper](docs/PYTHON.md), [TypeScript package](packages/typescript/README.md), [tool integration](docs/INTEGRATION.md), and
  [evaluation plan](docs/EVALUATION.md)
- [Runnable synthetic MCP pilot](pilots/mcp/README.md): tool calls, model input and host permission checks
- [Privacy and threat model](docs/PRIVACY.md), [migration](docs/MIGRATION.md), and
  [related work](RELATED_WORK.md)
- [Development decisions and open PR reconciliation](docs/DEVELOPMENT.md)

All examples are synthetic. The detailed [legacy RAG example](examples/rag-retriever.yaml)
illustrates retrieval stages using optional v0.1 extensions; those extensions are not
validated by the v0.1 schema. Use v0.2 for the new disclosure contract.

## What validation guarantees

| Check | What it establishes |
| --- | --- |
| JSON Schema plus date-time checks | Shape, enums, required disclosure states |
| Reference semantic checks | Unique action IDs and no self-parenting |
| Host delivery records | Packet association and observed boundary, if independently verified |
| Evaluation | Whether context disclosures improve decisions in tested conditions |

The first two cannot substitute for the latter two. A receipt cannot authorize a
tool call or turn an untrusted instruction into a trusted one.

## Contributing

Start with a concrete failure and a small example showing how disclosure changes
the next decision. See [CONTRIBUTING.md](CONTRIBUTING.md). Specification materials use CC0-1.0 and reference code uses MIT, with the explicit
legacy-contribution exception in [LICENSES.md](LICENSES.md).
