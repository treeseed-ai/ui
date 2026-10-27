import {createHash} from 'node:crypto';
import { cpSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test, expect } from 'bun:test';
import {UiServerRenderer} from '../../src/server.js';
import {UiTerminalRenderer} from '../../src/terminal.js';
import type {UiViewModel} from '../../src/contracts.js';
import {CompositeTests} from '../support/package-test-support.js';
class CompositeTestsIntegration extends CompositeTests {

 async server():Promise<void>{const renderer=await UiServerRenderer.create();try{const page=await renderer.render(CompositeTests.view());expect(page.html).toContain('ui-stack');expect(page.html).toContain('&lt;script&gt;escaped-child&lt;/script&gt;');expect(page.html.includes('<script>escaped-child')).toBe(false);expect(Reflect.get(page.contribution,'members')).toHaveLength(3);}finally{await renderer.dispose();}}

 async terminal():Promise<void>{const renderer=await UiTerminalRenderer.create();try{expect((await renderer.render(CompositeTests.view())).text).toBe('Installed platform\n\nInstallation: Ready\n\n<script>escaped-child</script>\n');}finally{await renderer.dispose();}}
}
const composite=new CompositeTestsIntegration();
test('integration: default server composes nested selected components and binds child identities',composite.server.bind(composite));
test('integration: default terminal shares reusable composed models',composite.terminal.bind(composite));
