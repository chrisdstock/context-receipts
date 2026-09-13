"""Language-neutral cases also executed by the TypeScript package."""
from copy import deepcopy
import json
from pathlib import Path
import unittest
from context_receipts import validate_context_receipt


class SharedConformanceTests(unittest.TestCase):
    def test_shared_cases(self):
        suite = json.loads((Path(__file__).parent / 'fixtures/conformance.json').read_text())
        for case in suite['cases']:
            with self.subTest(name=case['name']):
                receipt = deepcopy(suite['bases'][case['base']])
                for operation in case['operations']:
                    parent = receipt
                    for key in operation['path'][:-1]:
                        parent = parent[int(key)] if isinstance(parent, list) else parent[key]
                    key = operation['path'][-1]
                    if isinstance(parent, list):
                        key = int(key)
                    if operation['op'] == 'remove':
                        del parent[key]
                    else:
                        parent[key] = deepcopy(operation['value'])
                self.assertEqual(validate_context_receipt(receipt).valid, case['valid'])
