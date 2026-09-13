# Evaluation: one failure, one receipt, one changed decision

Run `python scripts/rag_demo.py`. The synthetic question is whether a key can be
revoked after deployment. The initial two-document packet omits the requirement to
verify that all clients have switched. The receipt identifies partial coverage and
an authorized retrieval path. The toy host requests the remaining fixture, then
explains the verification requirement. It never claims the real clients are ready.

The same packet without a receipt produces `provenance_missing`; a falsified full
receipt fails comparison with the host capture record. A denied retrieval scope
produces a bounded explanation. These are deterministic policy checks, not evidence
that an LLM reasons better with receipts or detects dishonest issuers unaided.
A compromised capture system can still lie; equality with a trusted record is only
as trustworthy as that capture boundary.

## Initial experimental proposal (subsequently implemented)

Hold task and supplied evidence constant; vary only an authorized receipt view:
no receipt, accurate partial receipt, accurate full-scoped receipt, misleading
receipt, and a receipt containing attempted instruction injection. Separately vary
whether the host has authenticated capture evidence. Include summarized, stale,
privacy-withheld, and conflicting evidence cases.

Pre-register labels and scoring before calling a model. Measure unsupported-answer
rate, useful follow-up rate, scope-violating requests, false assurance acceptance,
latency and receipt token overhead. Score a model's request separately from whether
the host permits execution. Use fixed model/version and sampling settings, paired
cases, repeated trials and uncertainty intervals. Retain only synthetic material.

An effectiveness claim would require improvement against the no-receipt baseline
without raising privacy disclosure or authority-confusion rates. Schema pass counts are not
substitutes for these behavioral outcomes. A completed exploratory study may report null or negative results.

## Recorded exploratory study

The [September 13 Astra-in-Codex report](../evals/behavioral/runs/2026-09-13-astra/REPORT.md)
contains 180 subscription-backed model trials, a frozen plan, raw synthetic responses
and reproducible scoring. Readiness accuracy was already perfect without receipts;
no accuracy gain was demonstrated. Follow-up changes were inconclusive, including
the same increase for misleading receipts. Mean receipt overhead was about 500 input
tokens. See the report for uncertainty, usage, environment and privacy limitations.

The [evaluation harness](../evals/behavioral/README.md) documents batch checkpoints
and safe resumption. CI validates the harness offline; it never launches model calls.
