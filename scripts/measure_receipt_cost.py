"""Report reproducible byte costs and archived model overhead; no model calls."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / 'evals/behavioral/runs/2026-09-13-astra'


def compact_bytes(value):
    return len(json.dumps(value, ensure_ascii=False, sort_keys=True,
                          separators=(',', ':')).encode('utf-8'))


def measure():
    plan = json.loads((ARCHIVE / 'plan.json').read_text())
    report = json.loads((ARCHIVE / 'report.json').read_text())
    examples = []
    for path in sorted((ROOT / 'examples/v0.2').glob('*.json')):
        examples.append({'path': str(path.relative_to(ROOT)),
                         'file_bytes': len(path.read_bytes()),
                         'source_sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                         'compact_utf8_bytes': compact_bytes(json.loads(path.read_text()))})
    prompt_costs = []
    for case in plan['cases']:
        data = json.loads(case['messages'][1]['content'])
        receipt = data.pop('receipt', None)
        if receipt is not None:
            with_receipt = {**data, 'receipt': receipt}
            prompt_costs.append({'case_id': case['id'],
                'receipt_compact_utf8_bytes': compact_bytes(receipt),
                'added_model_data_bytes': compact_bytes(with_receipt) - compact_bytes(data)})
    return {'method': 'UTF-8 JSON, sorted keys, no whitespace, ensure_ascii=False; file bytes separately include formatting.',
            'archived_plan_sha256': plan['plan_sha256'],
            'archived_report_sha256': hashlib.sha256((ARCHIVE / 'report.json').read_bytes()).hexdigest(),
            'examples': examples, 'archived_prompt_costs': prompt_costs,
            'observed_model_overhead': [{'condition': c['condition'], 'capture': c['capture'],
                'input_tokens': c['paired_differences']['input_tokens']}
                for c in report['comparisons']],
            'model': plan['model'], 'tokenizer': 'Provider tokenizer unavailable; token differences are CLI-reported input usage, not local token estimates.',
            'integration_surface': [{'path': name, 'source_sha256': hashlib.sha256((ROOT / name).read_bytes()).hexdigest(), 'lines': len((ROOT / name).read_text().splitlines())}
                for name in ('scripts/detailed_rag.py', 'pilots/mcp/pilot.mjs', 'pilots/mcp/pilot.test.mjs', 'pilots/mcp/demo.mjs')],
            'effort_limitation': 'Line counts describe this repository snapshot, not engineering hours, independent adoption cost, or minimum implementation size.'}


if __name__ == '__main__':
    print(json.dumps(measure(), indent=2))
