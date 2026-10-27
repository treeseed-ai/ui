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
export class CompositeTests {
 static view():UiViewModel{return {id:'page',componentId:'stack',model:{title:'Installed platform',children:[{id:'installation',componentId:'status',model:{title:'Installation',state:'Ready'}},{id:'nested',componentId:'stack',model:{children:[{id:'detail',componentId:'text',model:{text:'<script>escaped-child</script>'}}]}}]}};}
}
