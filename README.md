# Context Receipts for AI Systems

## If your app shapes what an AI sees, it should say so.

Large language models do not see reality. They see context.

That context is increasingly selected, filtered, summarized, translated, redacted, ranked, permissioned, and routed by apps, APIs, tools, memory systems, retrieval systems, guardrails, and developer-defined workflows before it ever reaches the model.

This is necessary. LLMs cannot and should not receive everything. Context windows are limited. Costs matter. Privacy matters. Safety matters. Relevance matters. Sensitive information should not be exposed without permission. Irrelevant information should not crowd out what matters.

The problem is not filtration.

The problem is hidden filtration.

As AI systems become more capable, the layer that selects and shapes context becomes increasingly powerful. It determines what the model can know, what it cannot know, what reality it is asked to reason inside, what constraints it must obey, and what parts of the available situation have been omitted or transformed.

Today, this context-shaping work is mostly handled inside application logic. Developers decide what to retrieve, what to summarize, what to redact, what to exclude, what to compress, what to remember, what to forget, and what to send. These choices are often made for good reasons: cost, latency, safety, UX, privacy, compliance, or product clarity.

But reasonable local decisions can accumulate into an invisible lens.

And once the lens is invisible, neither the user nor the model can easily distinguish between:

- the full available context
- the selected context
- the summarized context
- the redacted context
- the app's preferred framing
- the context omitted for safety, cost, privacy, or convenience

A model can produce a coherent and helpful-looking answer while reasoning from a curated reality it does not know is curated.

That is the issue.

We need a basic accountability primitive for AI context exchange.

I propose the **Context Receipt**.

---

## Core principle

> **If you shape context, issue a receipt.**

Any app, API, tool, retrieval layer, memory system, guardrail, or workflow that materially shapes the context provided to an LLM should produce a machine-readable and human-inspectable receipt describing what it did.

A simple rule follows:

> **No receipt, no service.**

If a tool or app wants to provide context to an LLM, it should disclose how that context was shaped.

This is not meant to eliminate context selection. Context selection is essential. The goal is to make context selection legible, permissioned, challengeable, and auditable.

---

## What a Context Receipt is

A **Context Receipt** is a structured record describing how context was selected, transformed, permissioned, constrained, and delivered to an LLM.

It is not the context itself.

It is a receipt for the context.

A receipt can be:

- machine-readable
- human-inspectable
- visible to the model
- visible to the user
- available to developers
- available for audit
- stored with traces
- embedded in tool responses
- attached to model calls
- referenced by an audit ID

The receipt does not need to expose private content. It can describe categories, transformations, permissions, and completeness levels without revealing the underlying data.

---

## Minimum viable context receipt

A minimal context receipt should include these fields:

1. **Source** — Who provided the context?
2. **Purpose** — Why was this context provided?
3. **Included context** — What categories of context were included?
4. **Excluded context** — What categories of context were available but not included?
5. **Transformations** — What was changed before the context reached the model?
6. **Permission basis** — Why was the system allowed to use this context?
7. **Completeness** — How complete is the context?
8. **Constraints** — What rules or limits accompanied the context?
9. **Challenge path** — Can the model or user request more context?
10. **Audit trail** — Can the decision be reviewed later?

See [`SPEC.md`](./SPEC.md) for more detail and [`schemas/context-receipt-v0.1.schema.json`](./schemas/context-receipt-v0.1.schema.json) for a first JSON Schema.

---

## Examples

- [`examples/pause-parenting.yaml`](./examples/pause-parenting.yaml) — acute parenting support app
- [`examples/rag-retriever.yaml`](./examples/rag-retriever.yaml) — retrieval system receipt
- [`examples/memory-layer.yaml`](./examples/memory-layer.yaml) — personal memory layer receipt

---

## Related work

Context Receipts build on provenance, lineage, observability, and AI transparency work, but focus specifically on the **context-shaping layer** between apps, tools, retrievers, memory systems, guardrails, workflows, and the model.

See [`RELATED_WORK.md`](./RELATED_WORK.md) for how this proposal relates to route receipts, agent traces, context engineering, RAG provenance, W3C PROV, data lineage, model cards, system cards, AI Bills of Materials, and C2PA / Content Credentials.

---

## Design principles

### Filtering is necessary. Hidden filtering is the problem.

The proposal is not to send everything to the model. That would be unsafe, expensive, and often useless. The proposal is to make filtering legible.

### The receipt should not leak the private data it protects.

A receipt should not reveal sensitive content merely to prove it was withheld. It can say `legal_notes_withheld` without showing the legal notes.

### The receipt should be visible to the model.

The model should know whether it is reasoning from full, partial, summarized, or redacted context.

### The receipt should be inspectable by the user.

Users should be able to ask: **What did the AI see?**

### The lens must be challengeable.

A context receipt should provide a path for the model or user to request more context, subject to permission.

### Open protocol, private data.

The schema and protocol should be open. The user's private context should remain private.

### Context selection is power.

The system that selects context shapes the model's reality. That power must be accountable.

---

## What this is not

- It is not a demand that every model receive all available context.
- It is not a replacement for guardrails.
- It is not only an AI safety proposal.
- It is not a full standard yet.
- It is not anti-developer.

Developers are already doing this work. Context receipts give them a shared language and structure for doing it transparently.

---

## Adoption path

A practical adoption path could look like this:

1. **Proposal** — publish the concept and minimal schema.
2. **Examples** — create example receipts for retrieval systems, memory systems, tool calls, guardrails, and domain apps.
3. **Reference implementation** — build small TypeScript and Python packages that generate and validate receipts.
4. **Integrations** — add middleware for common LLM application frameworks and tool protocols.
5. **Developer use** — developers adopt receipts for debugging, auditability, user trust, and safer integrations.
6. **Platform preference** — LLM platforms and agent hosts begin preferring or requiring context-providing tools to emit receipts.
7. **Standardization** — if adoption grows, the schema can move toward a formal standards process through an appropriate body or community group.

The goal is not to impose a perfect standard from above.

The goal is to create a useful primitive that developers want to use.

---

## Call to builders

If you build apps, APIs, tools, retrieval systems, memory layers, guardrails, or agent workflows that provide context to LLMs, consider issuing a context receipt.

Start small.

Disclose what was included, excluded, transformed, permissioned, constrained, and whether more context can be requested.

Make the lens visible.

> **If your system shapes what an AI sees, it should say so.**

> **No receipt, no service.**
