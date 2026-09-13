import { connectPilot, consume, requestMore, SCOPE } from './pilot.mjs';
const pilot = await connectPilot();
try {
  const tools = await pilot.client.listTools();
  const result = await pilot.client.callTool({ name: tools.tools[0].name, arguments: { budget: 2 } });
  const initial = consume(result);
  const denied = await requestMore(pilot, initial, new Set());
  const expanded = await requestMore(pilot, initial, new Set([SCOPE]));
  console.log(JSON.stringify({ kind: 'synthetic_mcp_no_model', protocolVersion: pilot.protocolVersion,
    initial, denied, expanded, toolCalls: pilot.calls }, null, 2));
} finally { await pilot.close(); }
