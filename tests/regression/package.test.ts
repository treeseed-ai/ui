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
class MetadataGuardTestsRegression {

    guard(): void { const root = mkdtempSync(join(tmpdir(), 'cordis-ui-metadata-')); try {
        for (const path of ['src', 'scripts', 'package.json', 'bun.lock', 'vendor'])
            cpSync(resolve(path), join(root, path), { recursive: true });
        symlinkSync(resolve('node_modules'), join(root, 'node_modules'), 'dir');
        const file = join(root, 'package.json'), metadata = JSON.parse(readFileSync(file, 'utf8')) as {
            version:string;
            cordisPackage: {
                providers: Array<{
                    classExport: string;
                }>;
            };
        };
        const original=metadata.cordisPackage.providers[0]!.classExport;
        metadata.cordisPackage.providers[0]!.classExport = 'WrongClass';
        writeFileSync(file, JSON.stringify(metadata));
        const result = spawnSync('bun', ['scripts/tooling.ts', 'check'], { cwd: root, encoding: 'utf8', timeout: 30000 });
        expect(result.status).toBe(1);
        expect(result.stderr.includes('UI_PACKAGE_METADATA_DRIFT')).toBe(true);
        metadata.cordisPackage.providers[0]!.classExport=original;metadata.version='0.0.0-cordis.999';writeFileSync(file,JSON.stringify(metadata));const identity=spawnSync('bun',['scripts/tooling.ts','check'],{cwd:root,encoding:'utf8',timeout:30000});expect(identity.status).toBe(1);expect(identity.stderr.includes('UI_PACKAGE_IDENTITY_DRIFT')).toBe(true);
    }
    finally {
        rmSync(root, { recursive: true, force: true });
    } }
}
const guard=new MetadataGuardTestsRegression();
test("regression: actual owner check rejects stale native metadata before build can rewrite it", guard.guard.bind(guard),65000);
