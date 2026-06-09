# Related Work

Context Receipts build on provenance, lineage, observability, and AI transparency work, but focus specifically on the **context-shaping layer** between apps, tools, retrievers, memory systems, guardrails, workflows, and the model.

A Context Receipt is not intended to replace the artifacts below. It is intended to complement them by answering a narrower question:

> What context did the model receive, and how was that context selected, transformed, permissioned, constrained, or withheld?

## Summary

| Area | Primary object | How it relates to Context Receipts |
| --- | --- | --- |
| Route receipts | Runtime routing path | Complementary; route receipts describe how a request was routed, while context receipts describe how the model's context was shaped. |
| Agent traces | Agent execution trajectory | Broader; traces may include many steps, while receipts are compact disclosures about context packets. |
| Context engineering | Context assembly practice | Directly related; context receipts disclose how context engineering decisions affected a model call. |
| RAG provenance | Retrieved evidence and citations | Related; RAG provenance often explains which evidence supported an answer, while context receipts also disclose selection, exclusion, transformation, and completeness. |
| W3C PROV / data lineage | Provenance of data and artifacts | Foundational prior art; context receipts are an AI-native application of provenance principles. |
| Model cards / system cards / datasheets | Models, systems, datasets | Adjacent transparency artifacts; they usually describe standing assets, not per-interaction context shaping. |
| AI Bills of Materials | AI supply chain and lifecycle | Adjacent; AIBOMs focus on components and lifecycle assurance, not necessarily the specific context shown to a model. |
| C2PA / Content Credentials | Digital media provenance | Useful analogy; media provenance travels with content, while context receipts could travel with context packets. |

## Route receipts

Route receipts are the closest conceptual neighbor found so far.

A route receipt is a compact transparency artifact describing how an AI request was routed at runtime. It may include model aliases, service tiers, fallback paths, tool choices, regional endpoints, or safety handling.

Context Receipts are different but complementary.

- **Route receipt:** How was the request routed?
- **Context receipt:** What did the model see, and how was that context shaped?

A complete AI transparency system may eventually need both.

## Agent traces and execution provenance

Agent tracing work focuses on recording what happened across an agent run: prompts, tool calls, observations, intermediate reasoning artifacts, memory access, retrieved evidence, actions, errors, and final outputs.

This is broader than Context Receipts.

A Context Receipt may be one artifact within a larger trace. It should remain small enough to be attached to a tool response, retriever output, memory packet, or model call without requiring full trace infrastructure.

## Context engineering

Context engineering is the practice of designing, selecting, compressing, ordering, retrieving, transforming, and constraining the information supplied to a model.

Context Receipts are a disclosure layer for context engineering.

Context engineering says:

> Assemble the right context.

Context Receipts add:

> Say how the context was assembled.

## RAG provenance and evidence tracing

Retrieval-augmented generation systems already select, rank, chunk, trim, and provide context to models. Many systems also cite sources or trace generated claims back to retrieved evidence.

That is closely related, but not identical.

RAG citations and evidence traces often answer:

> Which sources supported this answer?

Context Receipts ask an upstream question:

> What was searched, selected, excluded, transformed, and delivered before the model answered?

A RAG system is likely one of the clearest early adoption paths for Context Receipts.

## W3C PROV and data lineage

Provenance and lineage standards are foundational prior art.

W3C PROV provides a general model for describing entities, activities, agents, and their relationships in the production of data or artifacts.

Data lineage systems track how data moves, changes, and is used across systems.

Context Receipts can be understood as an AI-native, interaction-level application of these ideas to model context packets.

## Model cards, system cards, and datasheets

Model cards, system cards, and dataset datasheets are structured transparency artifacts for AI systems and their components.

They usually describe standing assets:

- a model
- a dataset
- a deployed system
- intended uses
- limitations
- evaluation results
- risks

Context Receipts describe something more local and runtime-specific:

> the context made available to a model for a particular interaction or task.

## AI Bills of Materials

AI Bills of Materials extend the bill-of-materials concept to AI systems. They may describe models, datasets, dependencies, training lineage, licensing, evaluation, deployment, or lifecycle risk.

Context Receipts are narrower.

They do not attempt to describe the full AI supply chain. They describe how context was shaped before a model call or tool-mediated interaction.

## C2PA and Content Credentials

C2PA and Content Credentials provide provenance metadata for digital media, including origin, edits, and authenticity information.

They are not solving the same problem as Context Receipts, but they are useful precedent for the broader idea that provenance metadata can travel with an artifact.

A rough analogy:

> C2PA is to media artifacts what Context Receipts could be to AI context packets.

This analogy should be used carefully. Context Receipts may start as simple structured disclosures, not cryptographically signed media provenance.

## Positioning statement

A Context Receipt is not a model card, not a route receipt, not a full execution trace, not a RAG citation, not an AIBOM, and not C2PA.

It is a compact disclosure of how the model's input context was shaped.

The intended lane is narrow:

> If your system shapes what an AI sees, it should say so.
