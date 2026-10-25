import { cpSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test, expect } from 'bun:test';
class PackageTests {
    metadata(): void { const value = JSON.parse(readFileSync('package.json', 'utf8')) as {
        peerDependencies: Record<string, string>;
        peerDependenciesMeta?: Record<string, {
            optional: boolean;
        }>;
        cordisCandidate: {
            sdk: {
                commit: string;
                sha256: string;
            };
        };
    }; expect(value.peerDependencies['@treeseed-cordis/sdk']).toBe('0.0.0-cordis.12'); expect(value.peerDependenciesMeta?.typescript?.optional).toBe(true); expect(value.cordisCandidate.sdk.commit).toBe('4a0b12ca45478f58d92a02de4a7c144ed94c7417'); expect(value.cordisCandidate.sdk.sha256).toBe('9652a1e1f830eb85c41b2d9ea207782ffdf291db2ef97331e338775dadf62fd4'); }
}
const suite = new PackageTests();
test('unit: UI runtime uses exact SDK archive and leaves the development compiler optional', suite.metadata.bind(suite));
class NativePackageTests {
    async metadata(): Promise<void> { const { PluginManagementSchemas } = await import('@treeseed-cordis/sdk/portable'), { UiStyles } = await import('../src/styles.js'), metadata = JSON.parse(readFileSync('package.json', 'utf8')) as {
        cordisPackage: unknown;
    }; const descriptor = PluginManagementSchemas.packageDescriptor.parse(metadata.cordisPackage); expect(descriptor.providers.length).toBe(12); const asset = await UiStyles.asset(); expect(descriptor.assets).toEqual([{ path: 'dist/assets/' + asset.digest + '.css', sha256: asset.digest, size: new TextEncoder().encode(asset.css).byteLength }]); expect(readFileSync(descriptor.assets[0]!.path, 'utf8')).toBe(asset.css); for (const provider of descriptor.providers) {
        expect(provider.replacement.kind).toBe('restart');
        expect(provider.replacement.qualificationDigest).toBeNull();
        expect(provider.classExport.length).toBeGreaterThan(0);
    } }
}
const nativePackage = new NativePackageTests();
test('unit: native package metadata binds all class exports and exact immutable stylesheet', nativePackage.metadata.bind(nativePackage));
class MetadataGuardTests {
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
const guard = new MetadataGuardTests();
test('integration: actual owner check rejects stale native metadata before build can rewrite it', guard.guard.bind(guard),65000);

import {UiServerRenderer} from '../src/server.js';
import {UiTerminalRenderer} from '../src/terminal.js';
import type {UiViewModel} from '../src/contracts.js';
class CompositeTests {
 static view():UiViewModel{return {id:'page',componentId:'stack',model:{title:'Installed platform',children:[{id:'installation',componentId:'status',model:{title:'Installation',state:'Ready'}},{id:'nested',componentId:'stack',model:{children:[{id:'detail',componentId:'text',model:{text:'<script>escaped-child</script>'}}]}}]}};}
 async server():Promise<void>{const renderer=await UiServerRenderer.create();try{const page=await renderer.render(CompositeTests.view());expect(page.html).toContain('ui-stack');expect(page.html).toContain('&lt;script&gt;escaped-child&lt;/script&gt;');expect(page.html.includes('<script>escaped-child')).toBe(false);expect(Reflect.get(page.contribution,'members')).toHaveLength(3);}finally{await renderer.dispose();}}
 async terminal():Promise<void>{const renderer=await UiTerminalRenderer.create();try{expect((await renderer.render(CompositeTests.view())).text).toBe('Installed platform\n\nInstallation: Ready\n\n<script>escaped-child</script>\n');}finally{await renderer.dispose();}}
 async invalid():Promise<void>{const renderer=await UiServerRenderer.create();try{for(const children of [[{id:'duplicate',componentId:'text',model:{text:'one'}},{id:'duplicate',componentId:'text',model:{text:'two'}}],[{id:'invalid',componentId:'navigation',model:{label:'Unsafe',items:[{label:'Go',href:'javascript:alert(1)'}]}}],[{id:'missing',componentId:'unknown',model:{}}]])await expect(renderer.render({id:'root',componentId:'stack',model:{children}})).rejects.toThrow();}finally{await renderer.dispose();}}
 program():void{const code="import {UiTerminalRenderer} from '@treeseed-cordis/ui/terminal';class Program{static async run(){const renderer=await UiTerminalRenderer.create();try{process.stdout.write((await renderer.render({id:'page',componentId:'stack',model:{children:[{id:'status',componentId:'status',model:{title:'System',state:'Ready'}}]}})).text);}finally{await renderer.dispose();}}}await Program.run();";const result=spawnSync('node',['--input-type=module','-e',code],{encoding:'utf8'});expect(result.status).toBe(0);expect(result.stderr).toBe('');expect(result.stdout).toBe('System: Ready\n');}
}
const composite=new CompositeTests();test('integration: default server composes nested selected components and binds child identities',composite.server.bind(composite));test('integration: default terminal shares reusable composed models',composite.terminal.bind(composite));test('unit: duplicate missing or unsafe child models fail before output',composite.invalid.bind(composite));test('smoke: built public terminal program renders a composite through default Cordis providers',composite.program.bind(composite));
