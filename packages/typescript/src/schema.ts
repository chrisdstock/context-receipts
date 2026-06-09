export const contextReceiptSchemaV01 = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://raw.githubusercontent.com/chrisdstock/context-receipts/main/schemas/context-receipt-v0.1.schema.json",
  title: "Context Receipt v0.1",
  description: "A minimal receipt describing how context was selected, transformed, permissioned, constrained, and delivered to an LLM.",
  type: "object",
  required: ["context_receipt"],
  properties: {
    context_receipt: {
      type: "object",
      required: [
        "schema_version",
        "receipt_id",
        "timestamp",
        "source",
        "purpose",
        "included_context",
        "completeness"
      ],
      properties: {
        schema_version: { type: "string", const: "0.1" },
        receipt_id: { type: "string" },
        timestamp: { type: "string", format: "date-time" },
        source: {
          type: "object",
          required: ["name", "type"],
          properties: {
            name: { type: "string" },
            type: {
              type: "string",
              enum: ["app", "api", "tool", "retriever", "memory", "guardrail", "human", "other"]
            },
            version: { type: "string" }
          },
          additionalProperties: true
        },
        purpose: { type: "string" },
        included_context: {
          type: "array",
          items: {
            type: "object",
            required: ["category"],
            properties: {
              category: { type: "string" },
              description: { type: "string" },
              provenance: {
                type: "string",
                enum: [
                  "user_provided",
                  "retrieved",
                  "inferred",
                  "generated",
                  "memory",
                  "tool_output",
                  "public_source",
                  "private_source",
                  "other"
                ]
              }
            },
            additionalProperties: true
          }
        },
        excluded_context: {
          type: "array",
          items: {
            type: "object",
            required: ["category"],
            properties: {
              category: { type: "string" },
              reason: {
                type: "string",
                enum: ["privacy", "permission", "relevance", "safety", "cost", "unavailable", "policy", "user_choice", "other"]
              },
              description: { type: "string" }
            },
            additionalProperties: true
          }
        },
        transformations: {
          type: "array",
          items: {
            type: "object",
            required: ["type"],
            properties: {
              type: {
                type: "string",
                enum: [
                  "summarized",
                  "redacted",
                  "translated",
                  "ranked",
                  "compressed",
                  "anonymized",
                  "paraphrased",
                  "filtered",
                  "normalized",
                  "other"
                ]
              },
              description: { type: "string" }
            },
            additionalProperties: true
          }
        },
        permission_basis: {
          type: "array",
          items: {
            type: "object",
            required: ["basis"],
            properties: {
              basis: {
                type: "string",
                enum: [
                  "user_prompt",
                  "explicit_user_permission",
                  "user_setting",
                  "enterprise_policy",
                  "public_data",
                  "legitimate_processing",
                  "other"
                ]
              },
              description: { type: "string" }
            },
            additionalProperties: true
          }
        },
        completeness: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["full", "partial", "summarized", "sampled", "redacted", "stale", "unknown"]
            },
            confidence: { type: "string", enum: ["low", "medium", "high"] },
            notes: { type: "string" }
          },
          additionalProperties: true
        },
        constraints: {
          type: "array",
          items: {
            type: "object",
            required: ["type", "description"],
            properties: {
              type: {
                type: "string",
                enum: ["instruction", "safety", "privacy", "domain", "legal", "output_format", "other"]
              },
              description: { type: "string" }
            },
            additionalProperties: true
          }
        },
        challenge_path: {
          type: "object",
          properties: {
            model_may_request_more_context: { type: "boolean" },
            user_permission_required: { type: "boolean" },
            available_actions: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "request_more_context",
                  "request_raw_source",
                  "request_user_clarification",
                  "escalate_to_human",
                  "none"
                ]
              }
            }
          },
          additionalProperties: true
        },
        audit: {
          type: "object",
          properties: {
            trace_id: { type: "string" },
            policy_version: { type: "string" },
            retention_policy: { type: "string" },
            tool_version: { type: "string" },
            model_version: { type: "string" }
          },
          additionalProperties: true
        }
      },
      additionalProperties: true
    }
  },
  additionalProperties: false
} as const;
