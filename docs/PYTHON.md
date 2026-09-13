# Python reference helper

This is an installable reference-helper package. Install it from a source checkout or
an artifact built from one; publication to PyPI remains out of scope. The canonical
schemas are bundled at `context_receipts/schemas/`; there is no handwritten second
validator.

```python
import json
from pathlib import Path
from context_receipts import create_context_receipt, get_schema, validate_context_receipt

receipt = json.loads(Path('examples/v0.2/minimal.json').read_text())
result = validate_context_receipt(receipt)
assert result.valid, result.errors

body = receipt['context_receipt'].copy()
del body['receipt_id']
del body['timestamp']
new_receipt = create_context_receipt(body)
```

Creation deep-copies input and supplies only a new ID, creation timestamp, and v0.2
version when absent. It requires all scope/disclosure decisions from the producer.
It does not generate an honest binding from thin air. `get_schema` supports v0.1 and
v0.2 and returns fresh data; validation dispatches using the explicit version.
`ValidationResult` is a frozen typed result with `valid` and `errors` fields. The
`ContextReceipt`, `ContextReceiptBody`, and `ContextReceiptInput` expose the top-level
v0.2 shape. Nested data remains JSON and is checked against the bundled canonical
schema at runtime; there is no handwritten second validator.

```sh
python -m pip install .
python -m context_receipts examples/*.yaml examples/v0.2/*.json
```

The API rejects non-JSON values and serialized receipts over one megabyte.
The CLI returns nonzero if any input fails, rejects duplicate keys and YAML-only
values, and reports error classes without copying potentially private content.
Schema validation alone does not prove privacy, permission, packet association,
summary fidelity, or completeness. Full parent-chain validation belongs in the host.
