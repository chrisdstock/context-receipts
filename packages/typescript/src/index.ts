import { randomUUID } from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import type { FromSchema } from 'json-schema-to-ts';
import { schemaV01, schemaV02 } from './generated-schemas';

export type ContextReceiptV01 = FromSchema<typeof schemaV01>;
export type ContextReceiptV02 = FromSchema<typeof schemaV02>;
export type ContextReceipt = ContextReceiptV01 | ContextReceiptV02;
export type ContextReceiptInput = Omit<ContextReceiptV02['context_receipt'], 'schema_version' | 'receipt_id' | 'timestamp'> & {
  schema_version?: '0.2';
  receipt_id?: string;
  timestamp?: string;
};
export interface ValidationResult { valid: boolean; errors: string[] }

const schemas = { '0.1': schemaV01, '0.2': schemaV02 };
const ajv = new Ajv2020({ strict: false, allErrors: true, coerceTypes: false, useDefaults: false, removeAdditional: false });
addFormats(ajv);
// Match the Python RFC3339 validator's calendar and time rules, including its
// rejection of leap-second literals. This is a format adapter, not a schema copy.
ajv.addFormat('date-time', (value: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|([+-])(\d{2}):(\d{2}))$/i.exec(value);
  if (!m) return false;
  const [year, month, day, hour, minute, second] = m.slice(1, 7).map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]
    && hour <= 23 && minute <= 59 && second <= 59
    && (m[8] === undefined || (Number(m[8]) <= 23 && Number(m[9]) <= 59));
});
const validators = { '0.1': ajv.compile(schemaV01), '0.2': ajv.compile(schemaV02) };

export function getSchema(version: '0.1' | '0.2' = '0.2'): object {
  if (version !== '0.1' && version !== '0.2') throw new Error('Unsupported receipt version');
  return structuredClone(schemas[version]);
}

function isJSON(value: unknown, ancestors = new Set<object>()): boolean {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'object' || ancestors.has(value)) return false;
  if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) return false;
  ancestors.add(value);
  // Reject getters, symbols and non-enumerable object data instead of invoking or dropping them.
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const keys = Reflect.ownKeys(descriptors);
  if (Array.isArray(value) && Object.keys(value).length !== value.length) return false;
  for (const key of keys) {
    if (Array.isArray(value) && key === 'length') continue;
    if (typeof key !== 'string') return false;
    if (Array.isArray(value) && (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length)) return false;
    const descriptor = descriptors[key];
    if (!descriptor.enumerable || !('value' in descriptor) || !isJSON(descriptor.value, ancestors)) return false;
  }
  ancestors.delete(value);
  return true;
}

export function validateContextReceipt(receipt: unknown): ValidationResult {
  try {
    if (!isJSON(receipt) || Buffer.byteLength(JSON.stringify(receipt), 'utf8') > 1_000_000) {
      return { valid: false, errors: ['Receipt must be bounded JSON data'] };
    }
  } catch {
    return { valid: false, errors: ['Receipt must be bounded JSON data'] };
  }
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
    return { valid: false, errors: ['Missing receipt object'] };
  }
  const body = (receipt as Record<string, unknown>).context_receipt;
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { valid: false, errors: ['Missing receipt object'] };
  const version = (body as Record<string, unknown>).schema_version;
  if (version !== '0.1' && version !== '0.2') return { valid: false, errors: ['Unsupported receipt version'] };
  const validate = validators[version];
  if (!validate(receipt)) return { valid: false, errors: (validate.errors ?? []).map(error => `Schema rule failed: ${error.keyword}`) };
  const errors: string[] = [];
  if (version === '0.2') {
    const data = (receipt as ContextReceiptV02).context_receipt;
    if (data.binding.parent_receipt_ids.includes(data.receipt_id)) errors.push('Receipt cannot be its own parent');
    if (data.challenge_path.state === 'disclosed') {
      const ids = data.challenge_path.items.map(action => action.id);
      if (new Set(ids).size !== ids.length) errors.push('Challenge action IDs must be unique');
    }
  }
  return { valid: errors.length === 0, errors };
}

export function assertContextReceipt(receipt: unknown): asserts receipt is ContextReceipt {
  const result = validateContextReceipt(receipt);
  if (!result.valid) throw new Error(result.errors.join('; '));
}

export function createContextReceipt(input: ContextReceiptInput): ContextReceiptV02 {
  // Validate JSON-compatibility before cloning or reading caller properties.
  if (!input || typeof input !== 'object' || Array.isArray(input) || !isJSON(input)) throw new Error('Input must be a JSON object');
  const body = structuredClone(input);
  const receipt = { context_receipt: {
    ...body,
    schema_version: Object.hasOwn(body, 'schema_version') ? body.schema_version : '0.2',
    receipt_id: Object.hasOwn(body, 'receipt_id') ? body.receipt_id : randomUUID(),
    timestamp: Object.hasOwn(body, 'timestamp') ? body.timestamp : new Date().toISOString()
  } };
  if (receipt.context_receipt.schema_version !== '0.2') throw new Error('Creation supports v0.2 only');
  assertContextReceipt(receipt);
  return receipt as ContextReceiptV02;
}
