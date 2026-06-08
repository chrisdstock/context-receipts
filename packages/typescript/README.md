# context-receipts

Experimental reference package for **Context Receipt v0.1**.

This package exists to make the proposal importable and testable. It is intentionally small. It is not a complete framework, policy engine, observability system, or official standard.

## Install

This package is not yet published to npm. Once published:

```bash
npm install context-receipts
```

## Usage

```ts
import {
  createContextReceipt,
  validateContextReceipt,
  type ContextReceipt
} from "context-receipts";

const receipt: ContextReceipt = createContextReceipt({
  receipt_id: "cr_example_001",
  source: {
    name: "example_retriever",
    type: "retriever",
    version: "0.1"
  },
  purpose: "answer_user_question",
  included_context: [
    {
      category: "top_3_retrieved_chunks",
      provenance: "retrieved"
    }
  ],
  completeness: {
    status: "partial",
    confidence: "medium",
    notes: "Top-k retrieval only."
  }
});

const result = validateContextReceipt(receipt);

if (!result.valid) {
  console.error(result.errors);
}
```

## Exports

```ts
createContextReceipt(input)
validateContextReceipt(receipt)
assertContextReceipt(receipt)
contextReceiptSchemaV01
ContextReceipt
ContextReceiptInput
```

## Design goal

The goal is to provide a small lattice point for builders:

- types
- schema
- minimal validation
- factory helper

Future packages may add integrations for retrieval systems, agent frameworks, MCP tools, memory layers, and observability platforms.

## Stability

This package is experimental. Expect breaking changes while the proposal evolves.
