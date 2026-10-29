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
interface UiCandidateMetadata {
    peerDependencies: Record<string, string>;
    peerDependenciesMeta?: Record<string, { optional: boolean }>;
    cordisCandidate: { sdk: { commit: string; sha256: string } };
}
class PackageTestsUnit {
    metadata(): void {
        const value = JSON.parse(readFileSync('package.json', 'utf8')) as UiCandidateMetadata;
        expect(value.peerDependencies['@treeseed-cordis/sdk']).toBe('0.0.0-cordis.44');
        expect(value.peerDependenciesMeta?.typescript?.optional).toBe(true);
        expect(value.cordisCandidate.sdk.commit).toBe('00be028b92998f8d7039a3906e784c6b8598e730');
        expect(value.cordisCandidate.sdk.sha256).toBe('d95c54cf6081c7634498dfb4f3235d42d65b8664a5d62cc87c4dd4e85381f0f3');
        const hash = createHash('sha256').update(readFileSync('vendor/sdk.tgz')).digest('hex');
        expect(hash).toBe(value.cordisCandidate.sdk.sha256);
        const installed = JSON.parse(readFileSync('node_modules/@treeseed-cordis/sdk/package.json', 'utf8'));
        expect(installed.version).toBe(value.peerDependencies['@treeseed-cordis/sdk']);
    }
}
class NativePackageTestsUnit {

    async metadata(): Promise<void> { const { PluginManagementSchemas } = await import('@treeseed-cordis/sdk/portable'), { UiStyles } = await import('../../src/styles.js'), metadata = JSON.parse(readFileSync('package.json', 'utf8')) as {
        cordisPackage: unknown;
    }; const descriptor = PluginManagementSchemas.packageDescriptor.parse(metadata.cordisPackage); expect(descriptor.providers.length).toBe(12); const asset = await UiStyles.asset(); expect(descriptor.assets).toEqual([{ path: 'dist/assets/' + asset.digest + '.css', sha256: asset.digest, size: new TextEncoder().encode(asset.css).byteLength }]); expect(readFileSync(descriptor.assets[0]!.path, 'utf8')).toBe(asset.css); for (const provider of descriptor.providers) {
        expect(provider.replacement.kind).toBe('restart');
        expect(provider.replacement.qualificationDigest).toBeNull();
        expect(provider.classExport.length).toBeGreaterThan(0);
    } }
}
class CompositeTestsUnit extends CompositeTests {

 async invalid():Promise<void>{const renderer=await UiServerRenderer.create();try{for(const children of [[{id:'duplicate',componentId:'text',model:{text:'one'}},{id:'duplicate',componentId:'text',model:{text:'two'}}],[{id:'invalid',componentId:'navigation',model:{label:'Unsafe',items:[{label:'Go',href:'javascript:alert(1)'}]}}],[{id:'missing',componentId:'unknown',model:{}}]])await expect(renderer.render({id:'root',componentId:'stack',model:{children}})).rejects.toThrow();}finally{await renderer.dispose();}}
}
const suite=new PackageTestsUnit();
const nativePackage=new NativePackageTestsUnit();
const composite=new CompositeTestsUnit();
test('unit: UI runtime uses exact SDK archive and leaves the development compiler optional', suite.metadata.bind(suite));
test('unit: native package metadata binds all class exports and exact immutable stylesheet', nativePackage.metadata.bind(nativePackage));
test('unit: duplicate missing or unsafe child models fail before output',composite.invalid.bind(composite));
