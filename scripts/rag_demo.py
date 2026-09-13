"""Offline synthetic host demo. No LLM, network, or production action is invoked."""
from copy import deepcopy
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from context_receipts import create_context_receipt, validate_context_receipt

# Synthetic facts; deliberately no credentials or real incident records.
CORPUS = (
    {'id': 'overlap', 'fact': 'The service supports overlapping keys.'},
    {'id': 'deployment', 'fact': 'Deploy the replacement before revocation.'},
    {'id': 'client_check', 'fact': 'Verify all clients have switched before revocation.'},
)


def retrieve(limit):
    """Capture a receipt at this fixture's output boundary, not from model guesses."""
    packet = {'id': 'synthetic-support', 'revision': str(limit),
              'chunks': deepcopy(list(CORPUS[:limit]))}
    body = json.loads((Path(__file__).resolve().parents[1] /
                       'examples/v0.2/rag-retriever.json').read_text())['context_receipt']
    body['binding'] = {'packet_id': packet['id'], 'revision': packet['revision'],
                       'boundary': 'tool_output', 'parent_receipt_ids': []}
    body['assurance'] = 'boundary_observed'
    body['included_context'] = {'state': 'disclosed', 'items': [
        {'category': 'support_chunk', 'source_ref': chunk['id'], 'provenance': 'retrieved'}
        for chunk in packet['chunks']]}
    body['coverage'] = {'status': 'full' if limit >= len(CORPUS) else 'partial',
                        'scope': 'The three-document synthetic support fixture'}
    body['transformations'] = {'state': 'none'}
    body['excluded_context'] = ({'state': 'none'} if limit >= len(CORPUS) else
                               {'state': 'disclosed', 'items': [
                                   {'category': 'remaining_fixture_documents',
                                    'stage': 'delivery_omission', 'reason': 'cost'}]})
    body.pop('receipt_id')
    body.pop('timestamp')
    receipt = create_context_receipt(body)
    # This separate record represents trusted host capture, not data supplied by a tool.
    capture = {'packet': deepcopy(packet), 'receipt': deepcopy(receipt)}
    return packet, receipt, capture


def decide(packet, receipt, trusted_capture, authorized_scopes):
    """Toy host policy; does not claim to predict model behavior or authorize revocation."""
    if receipt is None:
        return 'provenance_missing'
    if not validate_context_receipt(receipt).valid:
        return 'provenance_invalid'
    if trusted_capture != {'packet': packet, 'receipt': receipt}:
        return 'capture_unverified'
    body = receipt['context_receipt']
    if body['coverage']['status'] != 'full':
        path = body['challenge_path']
        actions = path.get('items', []) if path['state'] == 'disclosed' else []
        if any(action['type'] == 'request_more_context' and
               action['authorization'] == 'existing_scope' and
               action['scope'] in authorized_scopes for action in actions):
            return 'request_more_context'
        return 'explain_insufficient_evidence'
    # A full fixture still does not establish the real deployment state.
    return 'explain_required_client_verification'


def main():
    packet, receipt, capture = retrieve(2)
    allowed = {'Same authorized production support corpora'}
    outputs = {
        'same_packet_without_receipt': decide(packet, None, capture, allowed),
        'partial_with_authorized_challenge': decide(packet, receipt, capture, allowed),
        'partial_without_host_permission': decide(packet, receipt, capture, set()),
    }
    spoofed = deepcopy(receipt)
    spoofed['context_receipt']['coverage']['status'] = 'full'
    outputs['misleading_full_receipt'] = decide(packet, spoofed, capture, allowed)
    packet2, receipt2, capture2 = retrieve(3)
    outputs['after_authorized_retrieval'] = decide(packet2, receipt2, capture2, allowed)
    print(json.dumps({'kind': 'deterministic_host_demo_not_model_evaluation',
                      'decisions': outputs}, indent=2))


if __name__ == '__main__':
    main()
