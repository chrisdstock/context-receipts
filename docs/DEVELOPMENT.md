# Development ledger — 2026-09-13

## Scope and acceptance

Update the proposal into a locally testable v0.2 draft addressing schema semantics,
privacy, authority, composition, examples and consumer behavior. Preserve the v0.1
schema. Acceptance: valid examples pass, identified negative cases fail, documentation
matches implemented checks, and a synthetic host demo shows an authorized follow-up.

Excluded: publication, merge, package release, license adoption, live/private model
evaluation, signatures, production authorization engines and automatic view projection.
These are separate decisions or integrations, not hidden claims of readiness.

## Identity

Base: `chrisdstock/context-receipts`, `main`,
`1de303005078c0bc970efd2b30f1677879a201ad`, tree
`74d6f42621da933e79d1fcb24ddd422a067d4246`.
Local branch: `codex/context-receipts-v0.2`. No repository AGENTS files at the bound
base. Isolated checkout, no inherited modifications. The initial implementation checkpoint was local-only; publication follows explicit owner authorization.

## Decisions

- Preserve v0.1's schema exactly; introduce breaking semantics under v0.2.
- Require explicit disclosure states, scoped coverage, separate freshness, and per-action
  authorization. No implicit upgrade from missing data to full context or permission.
- Keep the schema canonical; add a small Python helper instead of duplicating it in
  a handwritten TypeScript validator. Module is repository-local, not a released package.
- Use separate audience receipts, without claiming labels enforce privacy.
- Bind to packet revisions through host records, without premature signing or raw hashes.
- Keep the demonstration deterministic and synthetic; plan model evaluation separately.
- Update contributor guidance without adopting new license terms.

## Open work reconciliation

Reviewed all nine open issues (#5–#13) and diffs for all three open PRs (#4, #14, #16).
No issue was closed and no PR was changed or merged.

| Existing work | Relationship to this update |
| --- | --- |
| #5 naming | Keep Context Receipt; clarify that it is a disclosure, not attestation. |
| #6 minimal shape | v0.2's explicit unknown states provide a minimum; adoption feedback still needed. |
| #7 privacy / #12 audience | Privacy guidance and distinct audience labels implemented; enforcement remains host-owned. |
| #8 RAG / PR #16 | Detailed example adapted from Kushagra963-lab's PR head `7a115b9c7022af954179b6be420f8d44caa0b196`; corrected thresholds, budget reasons, corpus permission scope and challenge authorization. Preserve contributor credit when publishing. |
| #9 tools | Transport-neutral integration sketch and downstream receipt example; no MCP extension claimed. |
| #10 validation | Schema-backed tests, CLI and CI workflow added. |
| #11 prior art | Added primary-source references and restrained interoperability claims. |
| #13 Python | Repository-local create/validate/schema helpers; distribution packaging remains separate. |
| PR #4 TypeScript | Reviewed, not imported: handwritten validator omits many schema checks. Port shared schema conformance cases before adoption; avoid divergent implementations. |
| PR #14 community files | Contributor and issue guidance supplied; license proposal remains pending owner choice. |

## Validation limits

The initial environment omitted optional RFC 3339 support; an invalid-date test exposed
silent format acceptance. The helper now requires and explicitly registers that check.
Positive v0.1 validation is intentionally still permissive. v0.2 is not an automated
privacy scanner, proof of completeness, or a full graph validator. Hosted CI is configured for the publication review. Local results alone do not establish
that the hosted matrix has passed; use the checks on the current PR head.
