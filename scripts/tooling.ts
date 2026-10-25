import { ProjectTooling } from '@treeseed-cordis/sdk/source-policy';
import { PackageDefinition, CanonicalJson, type PluginExportDescriptor } from '@treeseed-cordis/sdk/portable';
import { ReactServerRendererPlugin } from '../src/server.js';
import { ReactBrowserRendererPlugin } from '../src/browser.js';
import { PlainTerminalRendererPlugin } from '../src/terminal.js';
import { ReactIslandRendererPlugin } from '../src/island.js';
import { UiPackageIdentity, TextComponentPlugin, StatusComponentPlugin, TableComponentPlugin, FormComponentPlugin, NavigationComponentPlugin, FeedbackComponentPlugin, DefaultThemePlugin } from '../src/providers.js';
import { UiStyles } from '../src/styles.js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
class UiTooling {
    static async run(): Promise<void> { ProjectTooling.run(); const mode = process.argv[2]; if (mode !== 'build' && mode !== 'check')
        return; const metadata = JSON.parse(readFileSync('package.json', 'utf8')) as {
        name: string;
        version: string;
        cordisProviders?: unknown;
        cordisPackage?: unknown;
    }, providers: PluginExportDescriptor[] = []; if(UiPackageIdentity.artifact!==metadata.name+'@'+metadata.version) throw new Error('UI_PACKAGE_IDENTITY_DRIFT'); for (const plugin of [TextComponentPlugin, StatusComponentPlugin, TableComponentPlugin, FormComponentPlugin, NavigationComponentPlugin, FeedbackComponentPlugin, DefaultThemePlugin])
        providers.push(PackageDefinition.export(plugin, 'dist/src/providers.js', plugin.name)); providers.push(PackageDefinition.export(ReactServerRendererPlugin, 'dist/src/server.js', 'ReactServerRendererPlugin'), PackageDefinition.export(ReactBrowserRendererPlugin, 'dist/src/browser.js', 'ReactBrowserRendererPlugin'), PackageDefinition.export(PlainTerminalRendererPlugin, 'dist/src/terminal.js', 'PlainTerminalRendererPlugin'), PackageDefinition.export(ReactIslandRendererPlugin, 'dist/src/island.js', 'ReactIslandRendererPlugin')); const asset = await UiStyles.asset(), path = 'dist/assets/' + asset.digest + '.css', descriptor = PackageDefinition.define(metadata.name, metadata.version, 'ui', providers, [{ path, sha256: asset.digest, size: new TextEncoder().encode(asset.css).byteLength }]), declarations = []; for (const provider of providers)
        declarations.push(provider.declaration); if (mode === 'check') {
        if (CanonicalJson.stringify(metadata.cordisPackage) !== CanonicalJson.stringify(descriptor) || CanonicalJson.stringify(metadata.cordisProviders) !== CanonicalJson.stringify(declarations))
            throw new Error('UI_PACKAGE_METADATA_DRIFT');
        return;
    } mkdirSync('dist/assets', { recursive: true }); writeFileSync(path, asset.css); metadata.cordisPackage = descriptor; metadata.cordisProviders = declarations; writeFileSync('package.json', JSON.stringify(metadata, null, 2) + '\n'); }
}
await UiTooling.run();
