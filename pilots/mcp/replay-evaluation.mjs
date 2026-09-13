// Replay recorded requests through the synthetic host; never invokes a model.
import { readFileSync, writeFileSync } from 'node:fs';
import { connectPilot, consume, requestMore, SCOPE } from './pilot.mjs';
const [planPath, resultsPath, outputPath] = process.argv.slice(2);
if (!planPath || !resultsPath || !outputPath) throw new Error('Usage: node replay-evaluation.mjs PLAN RESULTS OUTPUT');
const plan = JSON.parse(readFileSync(planPath, 'utf8'));
const rows = readFileSync(resultsPath, 'utf8').trim().split('\n').map(JSON.parse);
const cases = new Map(plan.cases.map(c => [c.id, c]));
const seen = new Set();
const pilot = await connectPilot();
const replay = [];
try {
  const initial = consume(await pilot.client.callTool({ name: 'retrieve_guides', arguments: { budget: 2 } }));
  for (const row of rows) {
    const key = `${row.case_id}/${row.repeat}`;
    const c = cases.get(row.case_id);
    if (!c || row.plan_sha256 !== plan.plan_sha256 || seen.has(key) ||
        !Number.isInteger(row.repeat) || row.repeat < 0 || row.repeat >= plan.repetitions) throw new Error('Invalid replay provenance');
    seen.add(key);
    const before = pilot.calls;
    const requested = row.response.action;
    let status = 'not_requested';
    if (requested === 'more_guides') {
      const result = await requestMore(pilot, initial, new Set(c.allowed_actions.includes('more_guides') ? [SCOPE] : []));
      status = result.status;
    } else if (requested !== 'none') {
      status = 'host_denied';
    }
    const executed = pilot.calls - before;
    const expected = requested === 'more_guides' && c.allowed_actions.includes('more_guides') ? 1 : 0;
    if (executed !== expected || (executed && status !== 'verified_synthetic_fixture')) throw new Error('Dispatch mismatch');
    replay.push({ case_id: row.case_id, repeat: row.repeat, requested, actual_tool_calls: executed, status });
  }
  if (seen.size !== plan.cases.length * plan.repetitions) throw new Error('Incomplete replay');
  writeFileSync(outputPath, JSON.stringify({ kind: 'post_run_synthetic_mcp_replay', plan_sha256: plan.plan_sha256,
    protocolVersion: pilot.protocolVersion, initialization_tool_calls: 1,
    requested_followups: replay.filter(r => r.requested !== 'none').length,
    executed_followups: replay.reduce((n, r) => n + r.actual_tool_calls, 0),
    denied_followups: replay.filter(r => r.status === 'host_denied').length, trials: replay }, null, 2) + '\n', { flag: 'wx' });
} finally { await pilot.close(); }
