const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const api = require('../dist');
const root = path.resolve(__dirname, '../../..');
const suite = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/conformance.json'), 'utf8'));
for (const item of suite.cases) {
  test(item.name, () => {
    const receipt = structuredClone(suite.bases[item.base]);
    for (const operation of item.operations) {
      let parent = receipt;
      for (const key of operation.path.slice(0, -1)) parent = parent[key];
      const key = operation.path.at(-1);
      if (operation.op === 'remove') delete parent[key];
      else parent[key] = structuredClone(operation.value);
    }
    assert.equal(api.validateContextReceipt(receipt).valid, item.valid);
  });
}

test('bundled schemas match canonical schemas', () => {
  for (const version of ['0.1', '0.2']) {
    const canonical = JSON.parse(fs.readFileSync(path.join(root, `context_receipts/schemas/context-receipt-v${version}.schema.json`), 'utf8'));
    assert.deepEqual(api.getSchema(version), canonical);
  }
});
test('all v0.2 examples validate', () => {
  for (const name of fs.readdirSync(path.join(root, 'examples/v0.2'))) {
    const receipt = JSON.parse(fs.readFileSync(path.join(root, 'examples/v0.2', name), 'utf8'));
    assert.equal(api.validateContextReceipt(receipt).valid, true, name);
  }
});
test('factory clones inputs and requires explicit disclosure', () => {
  const input = structuredClone(suite.bases.v02.context_receipt);
  delete input.receipt_id;
  delete input.timestamp;
  const made = api.createContextReceipt(input);
  assert.equal(api.validateContextReceipt(made).valid, true);
  assert.equal(input.receipt_id, undefined);
  made.context_receipt.source.name = 'changed';
  assert.notEqual(input.source.name, 'changed');
  delete input.permission_basis;
  assert.throws(() => api.createContextReceipt(input));
});
test('schema export cannot alter compiled validation', () => {
  const exported = api.getSchema();
  exported.properties = {};
  assert.equal(api.validateContextReceipt(suite.bases.v02).valid, true);
  assert.notDeepEqual(exported, api.getSchema());
});
test('reject non-JSON input without invoking getters', () => {
  for (const value of [NaN, Infinity, undefined, () => 1, new Date(), 1n]) {
    const receipt = structuredClone(suite.bases.v02);
    receipt.context_receipt.extensions = { 'org.example.data': { value } };
    assert.equal(api.validateContextReceipt(receipt).valid, false);
  }
  let invoked = false;
  const receipt = { get context_receipt() { invoked = true; return {}; } };
  assert.equal(api.validateContextReceipt(receipt).valid, false);
  assert.equal(invoked, false);
});
test('cyclic input fails safely', () => {
  const receipt = {};
  receipt.self = receipt;
  assert.equal(api.validateContextReceipt(receipt).valid, false);
});
test('diagnostics do not echo private data', () => {
  const receipt = structuredClone(suite.bases.v02);
  receipt.context_receipt.PRIVATE_SENTINEL = 'PRIVATE_SENTINEL';
  assert.equal(JSON.stringify(api.validateContextReceipt(receipt)).includes('PRIVATE_SENTINEL'), false);
  assert.throws(() => api.assertContextReceipt(receipt), error => !error.message.includes('PRIVATE_SENTINEL'));
});
test('large receipt fails', () => {
  const receipt = structuredClone(suite.bases.v02);
  receipt.context_receipt.purpose = 'x'.repeat(1_000_001);
  assert.equal(api.validateContextReceipt(receipt).valid, false);
});
test('factory does not replace explicit null values with defaults', () => {
  for (const field of ['schema_version', 'receipt_id', 'timestamp']) {
    const input = structuredClone(suite.bases.v02.context_receipt);
    input[field] = null;
    assert.throws(() => api.createContextReceipt(input));
  }
});
test('sparse or decorated arrays are not silently normalized', () => {
  for (const value of [new Array(1), Object.assign([], { extra: 1 }), Object.assign(new Array(1), { extra: 1 })]) {
    const receipt = structuredClone(suite.bases.v02);
    receipt.context_receipt.extensions = { 'org.example.data': { value } };
    assert.equal(api.validateContextReceipt(receipt).valid, false);
  }
});
