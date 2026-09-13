"""Run a bounded resumable batch using existing ChatGPT-authenticated Codex CLI."""
import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time

from evaluate import canonical, requests, verify

SCHEMA = {'type': 'object', 'properties': {
    'decision': {'type': 'string', 'enum': ['ready', 'defer']},
    'action': {'type': 'string', 'enum': ['none', 'more_guides', 'private_records']},
    'assurance': {'type': 'string', 'enum': ['verified', 'unverified', 'mismatch']},
    'explanation': {'type': 'string'}},
    'required': ['decision', 'action', 'assurance', 'explanation'], 'additionalProperties': False}
CONFIG = ['model_reasoning_effort="low"', 'features.shell_tool=false',
          'web_search="disabled"', 'project_doc_max_bytes=0']


def parse_events(stdout):
    events = [json.loads(line) for line in stdout.splitlines() if line.strip()]
    sessions = [e['thread_id'] for e in events if e.get('type') == 'thread.started']
    completed = [e for e in events if e.get('type') == 'turn.completed']
    answers = [e['item']['text'] for e in events if e.get('type') == 'item.completed'
               and e.get('item', {}).get('type') == 'agent_message']
    tools = [e for e in events if e.get('item', {}).get('type') in
             ('command_execution', 'mcp_tool_call', 'web_search', 'file_change')]
    if tools or len(sessions) != 1 or len(completed) != 1 or len(answers) != 1:
        raise ValueError('Unexpected tool activity or incomplete/ambiguous trial')
    usage = completed[0]['usage']
    return sessions[0], json.loads(answers[0]), usage


def run_trial(request, directory):
    # A started record is durable before dispatch. An uncertain attempt is never retried silently.
    started = directory / 'started.json'
    with started.open('x') as stream:
        json.dump({'case_id': request['case_id'], 'repeat': request['repeat'],
                   'plan_sha256': request['plan_sha256'],
                   'started_at': datetime.now(timezone.utc).isoformat()}, stream)
    with tempfile.TemporaryDirectory(prefix='receipt-trial-') as cwd:
        schema = Path(cwd) / 'response.schema.json'
        schema.write_text(canonical(SCHEMA))
        cmd = ['codex', 'exec', '--ignore-user-config', '--strict-config', '--ephemeral',
               '--skip-git-repo-check', '--sandbox', 'read-only', '--json',
               '--model', request['model'], '--output-schema', str(schema)]
        for value in CONFIG:
            cmd.extend(['-c', value])
        cmd.append('-')
        # Avoid accidental API-key billing. Credentials remain inside the CLI's normal auth path.
        env = dict(os.environ)
        env.pop('OPENAI_API_KEY', None)
        env.pop('CODEX_API_KEY', None)
        prompt = request['messages'][0]['content'] + '\n\nEXPERIMENT DATA:\n' + request['messages'][1]['content']
        before = time.monotonic()
        try:
            process = subprocess.run(cmd, input=prompt, text=True, capture_output=True,
                                     cwd=cwd, env=env, timeout=180)
        except subprocess.TimeoutExpired:
            (directory / 'failure.json').write_text(canonical({'status': 'timeout_uncertain'}))
            raise RuntimeError('Trial timed out; inspect checkpoint before resuming') from None
        latency = (time.monotonic() - before) * 1000
        if process.returncode:
            # Do not echo arbitrary stderr or provider diagnostics into public artifacts.
            (directory / 'failure.json').write_text(canonical({'status': 'cli_failure', 'exit_code': process.returncode}))
            raise RuntimeError('Codex trial failed; no automatic retry')
        try:
            response_id, response, usage = parse_events(process.stdout)
        except (ValueError, KeyError):
            (directory / 'failure.json').write_text(canonical({'status': 'unparseable_or_tool_activity'}))
            raise RuntimeError('Unparseable trial; no automatic retry') from None
    row = {k: request[k] for k in ('case_id', 'repeat', 'plan_sha256', 'model', 'parameters')}
    row.update({'kind': 'live_model', 'response_id': response_id, 'response': response,
                'input_tokens': usage['input_tokens'], 'output_tokens': usage['output_tokens'],
                'cached_input_tokens': usage.get('cached_input_tokens'),
                'reasoning_output_tokens': usage.get('reasoning_output_tokens'),
                'latency_ms': latency, 'completed_at': datetime.now(timezone.utc).isoformat(),
                'model_identity_evidence': 'CLI explicit model argument; server snapshot unavailable',
                'billing': 'chatgpt_subscription', 'usage': usage})
    (directory / 'result.tmp').write_text(canonical(row) + '\n')
    (directory / 'result.tmp').replace(directory / 'result.json')
    return row


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('plan', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--batch-size', type=int, default=5)
    parser.add_argument('--calibration', action='store_true')
    args = parser.parse_args()
    if not 1 <= args.batch_size <= 10:
        raise SystemExit('Batch size must be 1–10')
    plan = json.loads(args.plan.read_text()); verify(plan)
    env = dict(os.environ); env.pop('OPENAI_API_KEY', None); env.pop('CODEX_API_KEY', None)
    auth = subprocess.run(['codex', 'login', 'status'], text=True, capture_output=True, env=env)
    if auth.returncode or 'Logged in using ChatGPT' not in auth.stdout + auth.stderr:
        raise SystemExit('ChatGPT authentication required; no API fallback')
    args.output.mkdir(parents=True, exist_ok=True)
    metadata = {'plan_sha256': plan['plan_sha256'], 'calibration': args.calibration,
                'cli_version': subprocess.check_output(['codex', '--version'], text=True).strip(),
                'config': CONFIG}
    manifest = args.output / 'manifest.json'
    if manifest.exists() and json.loads(manifest.read_text()) != metadata:
        raise SystemExit('Run environment/plan differs from saved manifest')
    manifest.write_text(canonical(metadata))
    schedule = requests(plan)
    if args.calibration:
        schedule = [next(r for r in schedule if r['case_id'] == f'missing/{c}/unavailable' and r['repeat'] == 0)
                    for c in ('none', 'partial', 'scoped_full', 'misleading', 'injected')]
    done = 0
    for request in schedule:
        trial = args.output / (request['case_id'].replace('/', '__') + f"__{request['repeat']}")
        if (trial / 'result.json').exists():
            row = json.loads((trial / 'result.json').read_text())
            if any(row[k] != request[k] for k in ('case_id', 'repeat', 'plan_sha256', 'model')):
                raise SystemExit('Saved trial provenance mismatch')
            continue
        if trial.exists():
            raise SystemExit('Unfinished attempt exists; reconcile it before resuming')
        trial.mkdir()
        row = run_trial(request, trial)
        done += 1
        print(canonical({'completed': request['case_id'], 'repeat': request['repeat'], 'usage': row['usage']}), flush=True)
        if done >= args.batch_size:
            break
    all_rows = [json.loads(p.read_text()) for p in sorted(args.output.glob('*/result.json'))]
    ledger = {'completed_trials': len(all_rows), 'scheduled_trials': len(schedule),
              'input_tokens': sum(r['input_tokens'] for r in all_rows),
              'output_tokens': sum(r['output_tokens'] for r in all_rows),
              'calibration': args.calibration, 'plan_sha256': plan['plan_sha256']}
    (args.output / 'checkpoint.json').write_text(canonical(ledger))
    print(canonical(ledger), flush=True)


if __name__ == '__main__':
    main()
