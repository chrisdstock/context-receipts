// Verify the tarball in an isolated consumer, not via the source tree's module paths.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'context-receipts-pack-'));
const pkg = path.resolve(__dirname, '..');
const run = (command, args, cwd = pkg) => execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
try {
  const packed = JSON.parse(run('npm', ['pack', '--json', '--pack-destination', temp]));
  const names = packed[0].files.map(file => file.path);
  for (const required of ['dist/index.js', 'dist/index.d.ts', 'LICENSE', 'SCHEMA-LICENSE', 'README.md']) {
    if (!names.includes(required)) throw new Error('Packed file missing: ' + required);
  }
  if (names.some(name => name.startsWith('node_modules/') || name.includes('rag-retriever.yaml'))) throw new Error('Unexpected packed content');
  const tarball = path.join(temp, packed[0].filename);
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--prefix', temp, tarball], temp);
  run(process.execPath, ['-e', `
    const assert = require('node:assert/strict');
    const api = require('context-receipts');
    assert.equal(api.validateContextReceipt({}).valid, false);
    assert.equal(api.getSchema()['$schema'], 'https://json-schema.org/draft/2020-12/schema');
  `], temp);
  console.log('Packed consumer smoke: PASS');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
