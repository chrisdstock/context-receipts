export type ContextReceiptSourceType =
  | "app"
  | "api"
  | "tool"
  | "retriever"
  | "memory"
  | "guardrail"
  | "human"
  | "other";

export type ContextReceiptProvenance =
  | "user_provided"
  | "retrieved"
  | "inferred"
  | "generated"
  | "memory"
  | "tool_output"
  | "public_source"
  | "private_source"
  | "other";

export type ContextReceiptExclusionReason =
  | "privacy"
  | "permission"
  | "relevance"
  | "safety"
  | "cost"
  | "unavailable"
  | "policy"
  | "user_choice"
  | "other";

export type ContextReceiptTransformationType =
  | "summarized"
  | "redacted"
  | "translated"
  | "ranked"
  | "compressed"
  | "anonymized"
  | "paraphrased"
  | "filtered"
  | "normalized"
  | "other";

export type ContextReceiptPermissionBasis =
  | "user_prompt"
  | "explicit_user_permission"
  | "user_setting"
  | "enterprise_policy"
  | "public_data"
  | "legitimate_processing"
  | "other";

export type ContextReceiptCompletenessStatus =
  | "full"
  | "partial"
  | "summarized"
  | "sampled"
  | "redacted"
  | "stale"
  | "unknown";

export type ContextReceiptConfidence = "low" | "medium" | "high";

export type ContextReceiptConstraintType =
  | "instruction"
  | "safety"
  | "privacy"
  | "domain"
  | "legal"
  | "output_format"
  | "other";

export type ContextReceiptChallengeAction =
  | "request_more_context"
  | "request_raw_source"
  | "request_user_clarification"
  | "escalate_to_human"
  | "none";

export interface ContextReceipt {
  context_receipt: {
    schema_version: "0.1";
    receipt_id: string;
    timestamp: string;
    source: {
      name: string;
      type: ContextReceiptSourceType;
      version?: string;
      [key: string]: unknown;
    };
    purpose: string;
    included_context: Array<{
      category: string;
      description?: string;
      provenance?: ContextReceiptProvenance;
      [key: string]: unknown;
    }>;
    excluded_context?: Array<{
      category: string;
      reason?: ContextReceiptExclusionReason;
      description?: string;
      [key: string]: unknown;
    }>;
    transformations?: Array<{
      type: ContextReceiptTransformationType;
      description?: string;
      [key: string]: unknown;
    }>;
    permission_basis?: Array<{
      basis: ContextReceiptPermissionBasis;
      description?: string;
      [key: string]: unknown;
    }>;
    completeness: {
      status: ContextReceiptCompletenessStatus;
      confidence?: ContextReceiptConfidence;
      notes?: string;
      [key: string]: unknown;
    };
    constraints?: Array<{
      type: ContextReceiptConstraintType;
      description: string;
      [key: string]: unknown;
    }>;
    challenge_path?: {
      model_may_request_more_context?: boolean;
      user_permission_required?: boolean;
      available_actions?: ContextReceiptChallengeAction[];
      [key: string]: unknown;
    };
    audit?: {
      trace_id?: string;
      policy_version?: string;
      retention_policy?: string;
      tool_version?: string;
      model_version?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

export type ContextReceiptInput = Omit<ContextReceipt["context_receipt"], "schema_version" | "timestamp"> & {
  schema_version?: "0.1";
  timestamp?: string;
};
