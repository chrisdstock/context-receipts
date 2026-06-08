# Context Receipt v0.1 Proposal

This document proposes a minimal, interoperable **Context Receipt** for AI systems.

A Context Receipt is a structured record describing how context was selected, transformed, permissioned, constrained, and delivered to a large language model.

It is not the context itself. It is a receipt for the context.

## Motivation

LLMs do not see reality. They see context.

Apps, APIs, retrieval systems, memory systems, guardrails, tools, and workflows increasingly shape that context before it reaches the model. This shaping is necessary, but it should not be invisible.

A model should know whether it is reasoning from full, partial, summarized, redacted, stale, app-selected, or permission-limited context.

A user should be able to ask what the AI saw.

A developer should be able to debug whether a failure came from the model, the prompt, the retrieval layer, the memory system, the redaction layer, the guardrail, the tool output, or missing context.

## Core principle

> If you shape context, issue a receipt.

A stricter operational norm follows:

> No receipt, no service.

## Minimal fields

### 1. Source

Who provided the context?

Examples: app, API, tool, retriever, memory layer, guardrail, human reviewer.

### 2. Purpose

Why was the context provided?

Examples: answer a user question, generate a reply, retrieve documents, summarize history, interpret a current incident, produce a draft.

### 3. Included context

What categories of context were included?

Examples: current user prompt, current incident summary, prior conversation summary, retrieved documents, account metadata, uploaded file, selected memory, tool output.

### 4. Excluded context

What categories of context were available but not included?

Examples: exact prior logs, full message history, private notes, legal records, location, names, financial details, health details, older memories, low-ranked retrieval results.

### 5. Transformations

What changed before the context reached the model?

Examples: summarized, redacted, translated, ranked, compressed, chunked, normalized, anonymized, paraphrased, classified, filtered.

### 6. Permission basis

Why was the system allowed to use this context?

Examples: user provided current prompt, user granted one-time permission, user opted into memory, public source, enterprise policy, aggregate/anonymized use only.

### 7. Completeness

How complete is the context?

Examples: full, partial, sampled, summarized, stale, redacted, low-confidence, high-confidence, top-k retrieval only, user-selected only, app-selected only.

### 8. Constraints

What rules or limits accompanied the context?

Examples: do not diagnose, do not provide legal advice, do not save by default, provide a short response, ask before using prior logs, escalate if safety risk appears.

### 9. Challenge path

Can the model or user request more context?

Examples: model may request full context with user permission, model may request exact source document, user can inspect context packet, user can approve prior memory review, no bypass available.

### 10. Audit trail

Can the decision be reviewed later?

Examples: receipt ID, trace ID, policy version, schema version, timestamp, tool version, model version, retrieval query ID, transformation log ID.

## Design principles

### Filtering is necessary

This proposal does not require sending all available context to the model. That would often be unsafe, expensive, and unhelpful.

### Hidden filtering is the problem

Context selection should be legible. The model and user should be able to know that filtering occurred, even if the protected content itself remains private.

### Receipts should not leak protected data

A receipt can say `legal_notes_withheld` without revealing the legal notes.

### Receipts should be model-readable

The model should know whether it is reasoning from complete, partial, summarized, redacted, or stale context.

### Receipts should be user-inspectable

Users should be able to ask: **What did the AI see?**

### Receipts should support challenge

A receipt should provide a path for the model or user to request more context, subject to permission.

### Open protocol, private data

The receipt format should be open. The user’s private context should remain private.

### Context selection is power

The system that selects context shapes the model’s reality. That power must be accountable.

## Proposed JSON shape

See [`schemas/context-receipt-v0.1.schema.json`](./schemas/context-receipt-v0.1.schema.json).

## Example receipts

See:

- [`examples/pause-parenting.yaml`](./examples/pause-parenting.yaml)
- [`examples/rag-retriever.yaml`](./examples/rag-retriever.yaml)
- [`examples/memory-layer.yaml`](./examples/memory-layer.yaml)

## Status

This is an initial proposal, not a standard.

The goal is to create a useful primitive that can be criticized, simplified, implemented, and improved.
