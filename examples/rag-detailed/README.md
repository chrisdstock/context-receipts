# Detailed synthetic RAG fixture

Independently authored for Issue #8; this example does not derive from the legacy
RAG YAML contribution. This directory and the generated
[v0.2 receipt](../v0.2/rag-detailed.json) use the repository's CC0 terms. The
[reproducer](../../scripts/detailed_rag.py) and tests use MIT.

## Reproduce

From the repository root, after installing `requirements-dev.txt`:

```sh
python scripts/detailed_rag.py
python -m unittest discover -s tests -p 'test_detailed_rag.py' -v
```

The command prints the evidence packet, stage ledger and receipt, verifies the
committed receipt against the generated result and validates its canonical schema.
The corpus, query, revisions and scores are in [fixture.json](fixture.json).
No network, embedding service or model is called. Scores are deliberately fixed
synthetic ranking inputs, not confidence or measured retrieval quality. Each
record is already one chunk, with its own source ID and revision.

## Selection accounting

| Stage | Chunks | Count |
| --- | --- | --- |
| Unsearched lab corpus | lab-prototype | 1 |
| Searched published corpus | isolation, inspection, clearance, paint, old-start | 5 |
| Filtered before ranking (retired) | old-start | 1 |
| Eligible active chunks | isolation, inspection, clearance, paint | 4 |
| Below inclusive 0.6 relevance threshold | paint | 1 |
| Qualifying | isolation, inspection, clearance | 3 |
| Delivered under two-chunk budget | isolation, inspection | 2 |
| Budget omission after threshold | clearance | 1 |

Thus 5 searched = 1 filtered + 4 eligible; 4 eligible = 1 rejected + 3
qualifying; 3 qualifying = 2 delivered + 1 omitted. Ranking is descending score,
then ascending chunk ID for ties. Delivery preserves source text except outer
whitespace trimming. No summarization, compression or token-budget measurement
is claimed. The budget is explicitly a chunk count.

The high-scoring retired guide never reaches ranking; the still higher-scoring
lab item never enters the searched scope. The developer fixture ledger includes
all synthetic IDs to make this testable. It is not a recommended model-visible
inventory of private records. The receipt uses only exclusion categories.

## Interpreting the receipt

Coverage is partial within the named published-guide snapshot. Freshness is
unknown relative to the world after that snapshot. Even delivering every
qualifying chunk would not establish complete evidence for restarting equipment.
The omitted clearance chunk supplies a deliberately consequential missing fact.
The question is synthetic and the packet is not real maintenance advice.

Source references include revisions. The packet revision and receipt ID change
with a SHA-256 digest of the serialized fixture inputs (Python sorted-key JSON).
This is a reproducibility identifier, not a signature, transport binding standard
or independent proof. The receipt remains `self_reported`. A consuming host must
check actual delivery; truncation or transformation needs a downstream receipt.

The follow-up action requests more published guides in the existing scope. A
synthetic host could permit a three-chunk budget to include clearance, while still
excluding retired guides and lab manuals. The reproducer tests this selection
only; it does not implement a host authorization service or execute a tool call.
The host must independently check scope and budget before honoring the request.

The corpus and stage ledger are companion fixture data, not receipt extension
fields. No core schema changes or unvalidated normative extensions are introduced.
Schema validation checks receipt shape; the dedicated tests check this fixture's
partition, ranking, source references, normalization and budget boundaries.

This supplies inputs for the MCP pilot (#9) and behavioral evaluation (#19).
Neither integration nor improved model behavior is established here.
