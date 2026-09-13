"""Fixture accounting tests, beyond the receipt schema's structural checks."""
from copy import deepcopy
import json
import unittest

from context_receipts import validate_context_receipt
from scripts.detailed_rag import build, FIXTURE, RECEIPT


class DetailedRagTests(unittest.TestCase):
    def setUp(self):
        self.fixture = json.loads(FIXTURE.read_text())
        self.result = build(self.fixture)

    def test_snapshot_and_schema(self):
        self.assertEqual(self.result['receipt'], json.loads(RECEIPT.read_text()))
        self.assertTrue(validate_context_receipt(self.result['receipt']).valid)

    def test_partition_and_order(self):
        stages = self.result['stages']
        self.assertEqual(stages, {
            'not_searched': ['lab-prototype'], 'filtered': ['old-start'],
            'ranked_not_selected': ['paint'], 'delivery_omission': ['clearance'],
            'included': ['isolation', 'inspection']})
        flattened = [x for group in stages.values() for x in group]
        self.assertEqual(len(flattened), len(set(flattened)))
        self.assertCountEqual(flattened, [c['id'] for c in self.fixture['chunks']])
        # Five searched = one filtered + four eligible; four eligible = one
        # threshold rejection + three qualifying; three = two sent + one omitted.
        self.assertEqual(sum(len(stages[k]) for k in stages if k != 'not_searched'), 5)

    def test_packet_provenance_and_normalization(self):
        packet = self.result['packet']
        receipt = self.result['receipt']['context_receipt']
        self.assertEqual(receipt['binding']['packet_id'], packet['id'])
        self.assertEqual(receipt['binding']['revision'], packet['revision'])
        self.assertEqual([i['source_ref'] for i in receipt['included_context']['items']],
                         ['isolation@3', 'inspection@2'])
        for chunk, source in zip(packet['chunks'], self.fixture['chunks']):
            self.assertEqual(chunk['text'], source['text'].strip())
        self.assertEqual(receipt['freshness'], 'unknown')
        self.assertEqual(receipt['coverage']['status'], 'partial')

    def test_budget_followup_never_crosses_scope_or_filter(self):
        self.fixture['chunk_budget'] = 3
        expanded = build(self.fixture)
        self.assertNotEqual(expanded['packet']['revision'], self.result['packet']['revision'])
        self.assertEqual(expanded['stages']['included'], ['isolation', 'inspection', 'clearance'])
        self.assertEqual(expanded['stages']['delivery_omission'], [])
        self.assertEqual(expanded['stages']['filtered'], ['old-start'])
        self.assertEqual(expanded['stages']['not_searched'], ['lab-prototype'])

    def test_threshold_is_inclusive_and_ties_are_stable(self):
        self.fixture['threshold'] = 0.85
        self.fixture['chunks'][0]['score'] = 0.85
        self.assertEqual(build(self.fixture)['stages']['included'], ['inspection', 'isolation'])

    def test_ambiguous_inventory_rejected(self):
        duplicate = deepcopy(self.fixture)
        duplicate['chunks'].append(duplicate['chunks'][0])
        with self.assertRaises(ValueError):
            build(duplicate)
        self.fixture['unsearched_corpora'].append('published-guides')
        with self.assertRaises(ValueError):
            build(self.fixture)
