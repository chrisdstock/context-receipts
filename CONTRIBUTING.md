# Contributing to Context Receipts

Thank you for taking the time to review or contribute to this proposal.

Context Receipts is currently a **v0.1 proposal**, not a finished standard. The goal is to create a useful accountability primitive for AI systems that shape context before it reaches a model.

Contributions are welcome, especially critique.

## What kind of feedback is useful?

Useful feedback includes:

- This concept already exists elsewhere.
- The name is confusing or overloaded.
- The schema is too heavy.
- The schema is too light.
- A required field should be optional.
- An optional field should be required.
- A field creates privacy or safety risk.
- The proposal misunderstands how developers actually build LLM apps.
- The examples are unrealistic.
- A better example would make the concept clearer.
- A related standard or protocol should be referenced.
- A real integration path is missing.

The most useful question to answer is:

> Where is this wrong, missing, too broad, too narrow, or already solved?

## Good first contributions

Good first contributions include:

- Add an example receipt for a specific domain.
- Suggest a clearer field name.
- Propose a smaller minimum viable receipt.
- Point to related work.
- Identify privacy risks created by receipts themselves.
- Add validation tests.
- Add a TypeScript or Python helper.
- Add an integration sketch for RAG, MCP, agents, memory, guardrails, or observability.

## Design posture

This project should remain:

- small before it becomes large
- useful before it becomes formal
- inspectable before it becomes automated
- privacy-preserving before it becomes detailed
- implementation-friendly before it becomes standards-heavy

## What this project is not trying to do

Context Receipts is not trying to force all context into every model call.

It is not trying to replace guardrails, memory systems, observability platforms, or agent frameworks.

It is not trying to expose private data.

It is trying to make context-shaping legible.

## Pull request guidance

For pull requests:

1. Keep changes focused.
2. Explain the problem being solved.
3. Prefer examples over abstractions when possible.
4. Avoid expanding the schema unless the need is clear.
5. Preserve the distinction between the receipt and the underlying context.

## License note

The proposal and specification materials are dedicated to the public domain under CC0 1.0 Universal where possible.

Code packages or reference implementations may include their own package-level license declarations.
