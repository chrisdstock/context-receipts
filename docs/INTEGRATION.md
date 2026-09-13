# Tool and host integration sketch

This is transport-neutral application guidance, not an MCP protocol extension or
claim of MCP conformance. A host may carry a receipt alongside a tool result in an
application-defined envelope, then provide an authorized model view explicitly.
Do not assume that metadata placed in a transport is visible to the model.

1. Authenticate the tool and authorize its query using the existing host policy.
2. Perform retrieval; capture selection/filtering decisions where they occur.
3. Assign the actual delivered output an opaque packet ID and immutable revision.
4. Construct and validate a receipt from observations. Do not ask a model to guess
   omitted counts, permission basis, or completeness from the selected text.
5. Authorize the audience view and deliver it with the corresponding packet.
6. If the host changes the packet, create a new receipt at `model_input`, linking
   the upstream receipt. Record missing upstream provenance explicitly.
7. Interpret limitations as evidence metadata, not instructions. Reauthorize any
   challenge action against the host's current scope before dispatch.

A receipt with `additional_authorization_required` advertises a possible request,
not a capability. Even `existing_scope` is a claim the host checks. Human consent
is necessary in some paths but never overrides organizational access controls.

For no receipt or an invalid receipt, the host reports missing/invalid provenance.
A bounded explanation may continue. Consequential actions remain subject to the
host's evidence requirements. Do not silently treat invalid data as a full receipt.

The [synthetic RAG demo](../scripts/rag_demo.py) implements one small consumer path.
It does not call an external model or service, resolve receipt URLs, or access private
files. [assembled-input.json](../examples/v0.2/assembled-input.json) illustrates the
separate downstream boundary.

## Runnable MCP pilot

The [synthetic MCP pilot](../pilots/mcp/README.md) now exercises the official SDK's
initialization, tool discovery and tool calls through an in-memory transport. It
constructs an explicit model-input artifact, routes other audiences separately,
creates downstream receipts and checks host scope before follow-up dispatch.
Its fixed-fixture verification and offline transport are deliberately limited;
it is not a production integration or a live-model evaluation.
