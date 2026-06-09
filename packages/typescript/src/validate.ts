import type { ContextReceipt, ContextReceiptInput } from "./types.js";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function createContextReceipt(input: ContextReceiptInput): ContextReceipt {
  return {
    context_receipt: {
      ...input,
      schema_version: input.schema_version ?? "0.1",
      timestamp: input.timestamp ?? new Date().toISOString()
    }
  };
}

export function validateContextReceipt(receipt: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isRecord(receipt)) {
    return { valid: false, errors: ["Receipt must be an object."] };
  }

  const wrapper = receipt["context_receipt"];
  if (!isRecord(wrapper)) {
    return { valid: false, errors: ["Missing context_receipt object."] };
  }

  requireString(wrapper, "schema_version", errors);
  requireString(wrapper, "receipt_id", errors);
  requireString(wrapper, "timestamp", errors);
  requireString(wrapper, "purpose", errors);

  if (wrapper["schema_version"] !== "0.1") {
    errors.push("schema_version must be '0.1'.");
  }

  if (!isRecord(wrapper["source"])) {
    errors.push("source must be an object.");
  } else {
    requireString(wrapper["source"], "name", errors, "source.name");
    requireString(wrapper["source"], "type", errors, "source.type");
  }

  if (!Array.isArray(wrapper["included_context"])) {
    errors.push("included_context must be an array.");
  } else {
    wrapper["included_context"].forEach((entry, index) => {
      if (!isRecord(entry)) {
        errors.push(`included_context[${index}] must be an object.`);
        return;
      }
      requireString(entry, "category", errors, `included_context[${index}].category`);
    });
  }

  if (!isRecord(wrapper["completeness"])) {
    errors.push("completeness must be an object.");
  } else {
    requireString(wrapper["completeness"], "status", errors, "completeness.status");
  }

  return { valid: errors.length === 0, errors };
}

export function assertContextReceipt(receipt: unknown): asserts receipt is ContextReceipt {
  const result = validateContextReceipt(receipt);
  if (!result.valid) {
    throw new Error(`Invalid Context Receipt: ${result.errors.join("; ")}`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(
  record: Record<string, unknown>,
  key: string,
  errors: string[],
  label = key
): void {
  if (typeof record[key] !== "string" || record[key].length === 0) {
    errors.push(`${label} must be a non-empty string.`);
  }
}
