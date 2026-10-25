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
    }; expect(value.peerDependencies['@treeseed-cordis/sdk']).toBe('0.0.0-cordis.9'); expect(value.peerDependenciesMeta?.typescript?.optional).toBe(true); expect(value.cordisCandidate.sdk.commit).toBe('85a7b6036c9a390a5c56b9db419fc5b6f8f8cd77'); expect(value.cordisCandidate.sdk.sha256).toBe('80337c6ad9cb4f493fa06ed9a22e3863ae41610cc1027817bd54c1eece3954d3'); }
}
const suite = new PackageTests();
test('unit: UI runtime uses exact SDK archive and leaves the development compiler optional', suite.metadata.bind(suite));
class NativePackageTests {
    async metadata(): Promise<void> { const { PluginManagementSchemas } = await import('@treeseed-cordis/sdk/portable'), { UiStyles } = await import('../src/styles.js'), metadata = JSON.parse(readFileSync('package.json', 'utf8')) as {
        cordisPackage: unknown;
    }; const descriptor = PluginManagementSchemas.packageDescriptor.parse(metadata.cordisPackage); expect(descriptor.providers.length).toBe(11); const asset = await UiStyles.asset(); expect(descriptor.assets).toEqual([{ path: 'dist/assets/' + asset.digest + '.css', sha256: asset.digest, size: new TextEncoder().encode(asset.css).byteLength }]); expect(readFileSync(descriptor.assets[0]!.path, 'utf8')).toBe(asset.css); for (const provider of descriptor.providers) {
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
            cordisPackage: {
                providers: Array<{
                    classExport: string;
                }>;
            };
        };
        metadata.cordisPackage.providers[0]!.classExport = 'WrongClass';
        writeFileSync(file, JSON.stringify(metadata));
        const result = spawnSync('bun', ['scripts/tooling.ts', 'check'], { cwd: root, encoding: 'utf8', timeout: 30000 });
        expect(result.status).toBe(1);
        expect(result.stderr.includes('UI_PACKAGE_METADATA_DRIFT')).toBe(true);
    }
    finally {
        rmSync(root, { recursive: true, force: true });
    } }
}
const guard = new MetadataGuardTests();
test('integration: actual owner check rejects stale native metadata before build can rewrite it', guard.guard.bind(guard));
