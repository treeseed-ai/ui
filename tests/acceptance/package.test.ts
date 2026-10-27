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
class CompositeTestsAcceptance extends CompositeTests {

 program():void{const code="import {UiTerminalRenderer} from '@treeseed-cordis/ui/terminal';class Program{static async run(){const renderer=await UiTerminalRenderer.create();try{process.stdout.write((await renderer.render({id:'page',componentId:'stack',model:{children:[{id:'status',componentId:'status',model:{title:'System',state:'Ready'}}]}})).text);}finally{await renderer.dispose();}}}await Program.run();";const result=spawnSync('node',['--input-type=module','-e',code],{encoding:'utf8'});expect(result.status).toBe(0);expect(result.stderr).toBe('');expect(result.stdout).toBe('System: Ready\n');}
}
const composite=new CompositeTestsAcceptance();
test("acceptance: built public terminal program renders a composite through default Cordis providers",composite.program.bind(composite));
