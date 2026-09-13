import { readFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import receipts from '../../packages/typescript/dist/index.js';

const fixture = JSON.parse(readFileSync(new URL('../../examples/rag-detailed/fixture.json', import.meta.url)));
const baseline = JSON.parse(readFileSync(new URL('../../examples/v0.2/rag-detailed.json', import.meta.url)));
export const SCOPE = 'Published maintenance guides only';
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

// Local synthetic oracle. This is not a verifier for arbitrary external producers.
export function expectedResult(budget = 2) {
  if (![2, 3].includes(budget)) throw new Error('Unsupported budget');
  const selected = fixture.chunks.filter(c => fixture.searched_corpora.includes(c.corpus) &&
    c.status === 'active' && c.score >= fixture.threshold)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, budget);
  const packet = { id: 'mcp-maintenance', revision: '', chunks: selected.map(c => ({
    source_ref: `${c.id}@${c.revision}`, text: c.text.trim()
  })) };
  packet.revision = digest(packet.chunks);
  const receipt = structuredClone(baseline);
  const body = receipt.context_receipt;
  body.receipt_id = `cr_mcp_${packet.revision}`;
  body.binding = { packet_id: packet.id, revision: packet.revision,
    boundary: 'tool_output', parent_receipt_ids: [] };
  body.included_context.items = packet.chunks.map(c => ({ category: 'maintenance_guide_chunk',
    source_ref: c.source_ref, provenance: 'retrieved' }));
  if (budget === 3) body.excluded_context.items = body.excluded_context.items.filter(i => i.stage !== 'delivery_omission');
  // Coverage stays partial: filtered and threshold-rejected sources remain omitted.
  return { packet, receipt };
}

export async function connectPilot(mutate = value => value) {
  const server = new Server({ name: 'synthetic-rag', version: '1.0.0' }, { capabilities: { tools: {} } });
  let calls = 0;
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [{ name: 'retrieve_guides',
    description: 'Read the synthetic published-guide fixture.', inputSchema: { type: 'object',
      properties: { budget: { type: 'integer', enum: [2, 3] } }, required: ['budget'], additionalProperties: false } }] }));
  server.setRequestHandler(CallToolRequestSchema, async request => {
    if (request.params.name !== 'retrieve_guides' ||
        !request.params.arguments || Object.keys(request.params.arguments).length !== 1 ||
        ![2, 3].includes(request.params.arguments.budget)) throw new Error('Invalid synthetic tool request');
    calls++;
    return { content: [], structuredContent: mutate(expectedResult(request.params.arguments.budget)) };
  });
  const client = new Client({ name: 'synthetic-host', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  let protocolVersion;
  // Observe the actual initialize request/response rather than claiming a version from a constant.
  const send = serverTransport.send.bind(serverTransport);
  serverTransport.send = async message => {
    if (message.result?.protocolVersion) protocolVersion = message.result.protocolVersion;
    return send(message);
  };
  try {
    await server.connect(serverTransport);
    await client.connect(clientTransport);
  } catch (error) {
    await client.close(); await server.close(); throw error;
  }
  return { client, get calls() { return calls; }, get protocolVersion() { return protocolVersion; },
    close: async () => { await client.close(); await server.close(); } };
}

export function consume(result, { budget = 2, limit = 2 } = {}) {
  if (!Number.isInteger(limit) || limit < 1) throw new Error('Invalid model chunk limit');
  const expected = expectedResult(budget);
  const envelope = result.structuredContent;
  const failure = status => ({ status, modelInput: null, surfaces: {}, followup: null });
  if (result.isError || !envelope || !isDeepStrictEqual(envelope.packet, expected.packet)) return failure('packet_unverified');
  if (!envelope.receipt) return failure('receipt_missing');
  if (!receipts.validateContextReceipt(envelope.receipt).valid ||
      envelope.receipt.context_receipt.schema_version !== '0.2') return failure('receipt_invalid');
  const upstream = envelope.receipt.context_receipt;
  // This host never falls back to raw text, metadata, or an unauthorized audience.
  if (upstream.audience !== 'model') return { ...failure('audience_not_model'),
    surfaces: { [upstream.audience]: structuredClone(envelope.receipt) } };
  if (!isDeepStrictEqual(envelope.receipt, expected.receipt)) return failure('receipt_unverified');
  const packet = structuredClone(envelope.packet);
  packet.chunks = packet.chunks.slice(0, limit);
  const truncated = packet.chunks.length !== envelope.packet.chunks.length;
  packet.id = 'model-maintenance';
  packet.revision = digest(packet.chunks);
  const downstream = structuredClone(envelope.receipt);
  const body = downstream.context_receipt;
  body.receipt_id = `cr_host_${randomUUID()}`;
  body.source = { name: 'synthetic-host', type: 'app', version: '1.0.0' };
  body.timestamp = new Date().toISOString();
  body.assurance = 'boundary_observed';
  body.binding = { packet_id: packet.id, revision: packet.revision, boundary: 'model_input',
    parent_receipt_ids: [upstream.receipt_id] };
  body.included_context.items = body.included_context.items.slice(0, packet.chunks.length);
  if (truncated) body.excluded_context.items.push({ category: 'host_budget_omission', stage: 'delivery_omission', reason: 'cost' });
  body.transformations.items.push({ type: 'other', description: truncated ?
    'Host selected a prefix of chunks for the model input budget.' : 'Host assembled unchanged chunks into model input.' });
  if (!receipts.validateContextReceipt(downstream).valid) throw new Error('Invalid downstream receipt');
  // Explicit JSON data at the model boundary, never system/developer instructions.
  const modelInput = { role: 'tool', content: JSON.stringify({ packet, receipt: downstream }) };
  return { status: 'verified_synthetic_fixture', modelInput, surfaces: {},
    followup: { id: 'more_guides', scope: SCOPE } };
}

export async function requestMore(pilot, consumed, allowedScopes) {
  if (consumed.status !== 'verified_synthetic_fixture' || consumed.followup?.id !== 'more_guides' ||
      consumed.followup.scope !== SCOPE || !allowedScopes.has(SCOPE)) return { status: 'host_denied' };
  const result = await pilot.client.callTool({ name: 'retrieve_guides', arguments: { budget: 3 } });
  return consume(result, { budget: 3, limit: 3 });
}
