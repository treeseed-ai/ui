import { test, expect } from 'bun:test';
import { spawnSync } from 'node:child_process';
class UiContractTestsUnit {

    async schemas(): Promise<void> {
        const { UiSchemas } = await import('../../src/contracts.js');
        expect(UiSchemas.tableModel.safeParse({ title: 't', columns: ['a'], rows: [['a', 'b']] }).success).toBe(false);
        expect(UiSchemas.formModel.safeParse({ title: 't', actionId: 'save', submitLabel: 'Save', fields: [{ id: 'a', label: 'A' }, { id: 'a', label: 'A' }] }).success).toBe(false);
        expect(UiSchemas.formModel.safeParse({ title: 't', actionId: 'save', submitLabel: 'Save', fields: [{ id: 'a', label: 'Password', type: 'password', value: 'credential-output-canary' }] }).success).toBe(false);
        for (const href of ['javascript:alert(1)', '//foreign.invalid', '/\\foreign.invalid', 'https://user:secret@host.invalid'])
            expect(UiSchemas.navigationModel.safeParse({ label: 'n', items: [{ label: 'x', href }] }).success).toBe(false);
        expect(UiSchemas.hydration.safeParse({ view: { id: 'v', componentId: 'text', model: { text: 'safe' } }, contribution: { id: 'v', componentId: 'text', providerId: 'ui.text.default', modelSchemaDigest: 'a'.repeat(64), styleDigest: 'b'.repeat(64) }, presentationGeneration: 'a'.repeat(64), assetGeneration: 'b'.repeat(64), actionIds: [], token: 'credential-output-canary' }).success).toBe(false);
    }
}
const contracts=new UiContractTestsUnit();
test('unit: UI rejects malformed models unsafe navigation and credential defaults', contracts.schemas.bind(contracts));
