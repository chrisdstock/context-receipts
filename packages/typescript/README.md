# Context Receipts — TypeScript reference package

Experimental v0.2 helper with explicit v0.1 validation support. This package is
**not published to npm** and has `private: true` to prevent accidental publication.
Node 22 or newer is required. Runtime and handwritten source use MIT; generated
schema data is CC0-1.0 (see `SCHEMA-LICENSE`). No legacy third-party example is bundled.

From this directory:

```sh
npm ci --ignore-scripts
npm test
npm run test:pack
```

The build reads the canonical repository schemas, generates schema literals, and
infers TypeScript types using `json-schema-to-ts`. Ajv's 2020-12 engine validates
the actual schemas, with format checks and the same local semantic checks as Python.
There is no independently handwritten structural validator.

```ts
import { validateContextReceipt, assertContextReceipt, getSchema } from 'context-receipts';

const result = validateContextReceipt(receiptFromYourHost);
if (result.valid) {
  assertContextReceipt(receiptFromYourHost);
  // The host must still verify permission and delivery provenance independently.
}
const schema = getSchema('0.2');
```

Available exports:

- `validateContextReceipt(unknown)` returns `{ valid, errors }` without private values.
- `assertContextReceipt(unknown)` throws on failure and narrows the validated type.
- `createContextReceipt(input)` creates v0.2, validates, and deep-copies input.
  Only absent ID, creation timestamp and schema version receive defaults; null is invalid.
- `getSchema('0.1' | '0.2')` returns a defensive copy of the bundled canonical schema.
- `ContextReceiptV01`, `ContextReceiptV02`, `ContextReceipt`, `ContextReceiptInput`,
  and `ValidationResult` types are exported.

Static types cannot enforce nonblank strings, valid dates, unique IDs, or all runtime
schema conditions. Always validate untrusted inputs. The timestamp adapter matches
the Python helper's calendar rules, including rejection of leap-second literals.
Both implementations run shared positive and negative cases; this is tested parity,
not a proof that every possible input is identical across runtimes.

The local API rejects non-JSON objects, getters, cycles and non-finite numbers, and
limits serialized receipts to one megabyte. It is not a hardened network service.
It does not fetch receipt references, execute constraints, infer permissions, or
verify full parent chains. Unknown extensions do not gain authority through validation.

`npm run test:pack` installs a generated tarball into a temporary consumer and verifies
its runtime without the repository's source layout. The tarball is suitable for local
experiments, but publication and framework integrations are outside this change.
