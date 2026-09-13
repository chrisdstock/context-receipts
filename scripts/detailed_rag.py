"""Reproduce the independently authored synthetic RAG fixture; no network or model."""
import json
from hashlib import sha256
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from context_receipts import validate_context_receipt

FIXTURE = ROOT / 'examples/rag-detailed/fixture.json'
RECEIPT = ROOT / 'examples/v0.2/rag-detailed.json'


def build(fixture):
    """Apply this fixture's explicit policy, fixed scores and chunk-count budget."""
    if type(fixture['chunk_budget']) is not int or fixture['chunk_budget'] < 1:
        raise ValueError('Chunk budget must be a positive integer')
    revision = sha256(json.dumps(fixture, sort_keys=True).encode()).hexdigest()
    chunks = fixture['chunks']
    ids = [c['id'] for c in chunks]
    if len(ids) != len(set(ids)):
        raise ValueError('Duplicate chunk IDs')
    searched = fixture['searched_corpora']
    unsearched = fixture['unsearched_corpora']
    if set(searched) & set(unsearched):
        raise ValueError('Searched and unsearched corpora overlap')
    if any(c['corpus'] not in searched + unsearched for c in chunks):
        raise ValueError('Unknown corpus')
    candidates = [c for c in chunks if c['corpus'] in searched]
    eligible = [c for c in candidates if c['status'] == 'active']
    ranked = sorted(eligible, key=lambda c: (-c['score'], c['id']))
    qualifying = [c for c in ranked if c['score'] >= fixture['threshold']]
    selected = qualifying[:fixture['chunk_budget']]
    stages = {
        'not_searched': [c['id'] for c in chunks if c['corpus'] in unsearched],
        'filtered': [c['id'] for c in candidates if c not in eligible],
        'ranked_not_selected': [c['id'] for c in ranked if c not in qualifying],
        'delivery_omission': [c['id'] for c in qualifying if c not in selected],
        'included': [c['id'] for c in selected],
    }
    packet = {'id': 'maintenance-packet', 'revision': revision, 'chunks': [
        {'source_ref': c['id'] + '@' + c['revision'],
         'text': c['text'].strip()} for c in selected]}
    def disclosed(items):
        return {'state': 'disclosed', 'items': items} if items else {'state': 'none'}
    receipt = {'context_receipt': {
        'schema_version': '0.2', 'receipt_id': 'cr_maintenance_' + revision,
        'timestamp': fixture['snapshot'],
        'source': {'name': 'synthetic-maintenance-retriever', 'type': 'retriever', 'version': '1'},
        'purpose': fixture['query'], 'audience': 'model', 'assurance': 'self_reported',
        'binding': {'packet_id': packet['id'], 'revision': packet['revision'],
                    'boundary': 'tool_output', 'parent_receipt_ids': []},
        'included_context': disclosed([
            {'category': 'maintenance_guide_chunk', 'source_ref': c['source_ref'],
             'provenance': 'retrieved'} for c in packet['chunks']]),
        'excluded_context': disclosed([
            {'category': category, 'stage': stage, 'reason': reason}
            for stage, category, reason in [
                ('not_searched', 'lab_manuals', 'permission'),
                ('filtered', 'retired_guides', 'policy'),
                ('ranked_not_selected', 'below_threshold_chunks', 'relevance'),
                ('delivery_omission', 'qualifying_chunks_over_budget', 'cost')]
            if stages[stage]]),
        'transformations': disclosed([
            {'type': 'filtered', 'description': 'Only active guides are eligible.'},
            {'type': 'ranked', 'description': 'Fixed synthetic relevance scores descending; chunk ID breaks ties. Scores are not confidence.'},
            {'type': 'normalized', 'description': 'Trim leading and trailing whitespace; preserve each selected chunk otherwise.'}]),
        'permission_basis': disclosed([{'basis': 'user_setting', 'scope': 'Published maintenance guides only; synthetic host policy.'}]),
        'coverage': {'status': 'partial', 'scope': 'Published maintenance guides at ' + fixture['snapshot'] + '; lab manuals were not searched.'},
        'freshness': 'unknown',
        'constraints': disclosed([{'type': 'domain', 'description': 'Static synthetic snapshot; no observation of equipment state or later guide revisions.'}]),
        'challenge_path': disclosed([{'id': 'more_guides', 'type': 'request_more_context',
            'scope': 'Published maintenance guides only', 'authorization': 'existing_scope'}]),
        'audit': {'state': 'withheld'},
    }}
    return {'packet': packet, 'stages': stages, 'receipt': receipt}


def main():
    result = build(json.loads(FIXTURE.read_text()))
    stored = json.loads(RECEIPT.read_text())
    if stored != result['receipt']:
        raise SystemExit('Stored receipt differs from fixture output')
    if not validate_context_receipt(stored).valid:
        raise SystemExit('Receipt validation failed')
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
