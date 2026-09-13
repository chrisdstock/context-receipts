import type { ContextReceiptV02 } from '../dist';
const coverage: ContextReceiptV02['context_receipt']['coverage'] = { status: 'partial', scope: 'fixture' };
// @ts-expect-error A full coverage claim requires its scope.
const noScope: ContextReceiptV02['context_receipt']['coverage'] = { status: 'full' };
// @ts-expect-error An arbitrary state is not a coverage enum.
const invalid: ContextReceiptV02['context_receipt']['coverage'] = { status: 'imagined' };
// @ts-expect-error None has no items payload.
const none: ContextReceiptV02['context_receipt']['audit'] = { state: 'none', items: [] };
void coverage;
void noScope;
void invalid;
void none;
