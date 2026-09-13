// Generated inputs always come from the repository's canonical versioned schemas.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../..');
const output = ['// SPDX-License-Identifier: CC0-1.0', '// Generated from canonical schemas. Do not edit.'];
for (const [version, name] of [['0.1', 'schemaV01'], ['0.2', 'schemaV02']]) {
  const schema = JSON.parse(fs.readFileSync(path.join(root, 'context_receipts', 'schemas', `context-receipt-v${version}.schema.json`), 'utf8'));
  output.push(`export const ${name} = ${JSON.stringify(schema, null, 2)} as const;`);
}
fs.writeFileSync(path.resolve(__dirname, '../src/generated-schemas.ts'), output.join('\n') + '\n');
