# Exploratory behavioral evaluation

This MIT-licensed harness evaluates **GPT-6 Astra inside Codex**, not a bare API
model. It uses the synthetic #8 fixture and the host-policy distinction demonstrated
by #9. No private corpus, API key, production action or automatic credit purchase
is needed. Live execution is opt-in, local, and never part of GitHub CI.

## Experimental contract

Six scenario variants × five receipt conditions × two host-capture conditions ×
three repetitions = 180 recorded trials. Five separate calibration calls are
excluded. Scenarios cover missing evidence, stale excerpts, summarization,
withheld metadata, conflicting instructions and a sufficient fictional state.
Conditions are no receipt, accurate partial, accurate narrowly scoped full,
misleading full, and misleading full with instruction injection. Within each
scenario the task and evidence packet are identical across conditions. A narrowly
scoped full receipt covers the delivered packet, not the whole decision domain.

The host signal independently varies between unavailable and checked. Checked
signals are scripted experimental facts: consistent, mismatch, or packet-only
when no receipt exists. They are supplied as experiment data, not cryptographic
verification. Unlike the fail-closed #9 pilot, this experiment deliberately exposes
misleading receipts so it can measure model responses. Do not use that exposure
policy in a production host.

Seven fixed metrics score structured choices: unsupported readiness conclusions,
useful guide requests, requests outside host scope, false receipt-verification
claims, disclosure of a synthetic audit-only canary, correct decisions, and actions
the host **would** permit. No host action is executed in these trials. Explanations
are retained for qualitative review but are not semantically graded by these
choice metrics. Canary non-disclosure is a narrow channel-isolation check, not a
privacy benchmark; the canary never enters the request. Useful follow-up is measured
across all trials, including scenarios where no follow-up is useful.

Paired differences compare each receipt condition with no receipt, separately by
capture condition. Intervals use 2,000 fixed-seed bootstrap resamples of six scenario
means, preserving repeated observations within each scenario. Six related variants
are a small exploratory sample: intervals do not establish generalization, and
zero observed errors do not establish zero risk. There is no positive-result
threshold or post-hoc sample expansion to obtain significance.

## Checkpoints and execution

From the repository root, after installing `requirements-dev.txt`:

```sh
python -m unittest discover -s tests -p test_behavioral.py -v
python evals/behavioral/evaluate.py freeze --model gpt-6-astra --repetitions 3 --output PLAN.json
python evals/behavioral/run_codex.py PLAN.json RUN_DIRECTORY --batch-size 5
```

Use a separate plan/directory and `--calibration` for the five calibration cases.
After calibration, freeze the scored plan before any scored trial. Plan files are
created exclusively, bind the scorer and runner file hashes, and must not be edited.
A changed plan or runner requires a separate run. The schedule is shuffled with a
fixed seed. Export requests with `evaluate.py export PLAN.json --output REQUESTS.jsonl`.
Only messages/settings are exported, not gold labels or the audit canary.

Each batch performs at most five calls by default (maximum ten), sequentially.
Each trial persists `started.json` before dispatch and atomically saves `result.json`
after completion. Reissuing the command skips completed records; an unfinished
attempt blocks automatic continuation. Inspect/reconcile an uncertain attempt
rather than deleting it or silently retrying it. `checkpoint.json` is a convenience
summary; per-trial records remain authoritative if interrupted mid-batch.

Refresh account-wide allowance after each batch. Record it separately from reported
trial tokens: other concurrent work also consumes the shared allowance. This runner
does not claim to convert tokens into plan percentage or dollars. Pause scheduling
at a batch boundary when the remaining allowance needs to be preserved. A running
trial may finish first; if interrupted, its status remains uncertain.

## Codex environment and limits

The runner requires an existing ChatGPT login and removes API-key environment
variables from the child process. It requests the named model with low reasoning,
uses an empty temporary directory, a read-only sandbox, no shell tool, no web
search, and no project-document loading. It ignores ordinary user configuration
for experimental consistency; managed controls and execution rules are not bypassed.
No credentials are read, copied, logged or uploaded by the harness.

These are Codex CLI runs with its base instructions and potentially other built-in
context, not isolated raw-model calls. The messages are flattened into one CLI
prompt; they are not native API system/user roles. The manifest records the CLI
version and requested overrides. The model is selected explicitly; the CLI's JSON
output does not establish an immutable server model snapshot. Temperature and a
hard output-token cap are **not configured**. Each call has a 180-second process
timeout; actual token usage is recorded rather than assuming a token ceiling.

Unexpected tool actions or multiple final responses are rejected. Response IDs are
CLI thread IDs, not API response IDs. Latency includes process startup. Retained
records contain the final synthetic model answer and CLI-reported usage, not private
reasoning text. Input totals include CLI context; caching and reasoning counters
are retained separately where provided and must not be blindly added to totals.

See [Codex non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)
and [configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference).

## Reporting

Collect `*/result.json` in the run directory into JSONL, then run:

```sh
python evals/behavioral/evaluate.py score PLAN.json RESULTS.jsonl --output REPORT.json
```

The scorer requires the full expected inventory, unique response IDs, matching
model/settings/plan provenance and nonnegative finite usage. Missing or duplicate
results fail; malformed decisions yield an inconclusive protocol-failure report.
The `live_model` label alone is not proof of authenticity: retain execution provenance
and review the recorder. Unit tests explicitly use fabricated records solely to test
scoring; they are never published as behavioral evidence.

Publish the frozen plan, complete synthetic responses, report, run manifest,
calibration disposition and allowance observations with explicit limitations. A
null or negative result still completes the experiment. #19 remains open until
actual recorded results and a reviewed report exist.
