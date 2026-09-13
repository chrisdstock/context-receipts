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

## Proposed model experiment (not run)

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

A successful result must show an improvement against the no-receipt baseline without
raising privacy disclosure or authority-confusion rates. Schema pass counts are not
substitutes for these behavioral outcomes. No benchmark result is claimed here.
