import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {chmodSync,lstatSync,mkdirSync,mkdtempSync,readFileSync,readdirSync,realpathSync,rmSync,symlinkSync,writeFileSync} from 'node:fs';
import {dirname,isAbsolute,join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {CanonicalJson} from '@treeseed-cordis/sdk/portable';
interface FixtureReceipt {formatVersion:1;fixture:true;version:string;source:{repository:string;baseCommit:string;treeDigest:string};recipeDigest:string;archive:{path:string;sha256:string;size:number};sdkArchive:{path:string;sha256:string};}
interface FixtureMetadata {
    name: string;
    version: string;
    packageManager: string;
    peerDependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    scripts: Record<string, string>;
    cordisFixture?: unknown;
}
/** Owner-only development fixture producer; never imported by the shipped UI. */
export class UiArchiveFixtureBuild {
    static readonly baseCommit='4bc3511b661e832531c60ab37980fed6dcc8aba6';
    static readonly version='0.0.0-cordis.16.fixture.1';
    static readonly marker='Cordis UI qualification fixture';
    private readonly root=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
    private diagnostics:string|undefined;
    private static require(value:unknown):asserts value{if(!value)throw new Error('UI_FIXTURE_VALIDATION');}
    private static sha(value:Uint8Array|string):string{return createHash('sha256').update(value).digest('hex');}
    private command(command:string,args:string[],cwd=this.root):Buffer{const result=spawnSync(command,args,{cwd,timeout:120000,maxBuffer:16*1024*1024});if(result.status!==0){if(this.diagnostics)writeFileSync(this.diagnostics,JSON.stringify({stage:args[0],stdout:result.stdout?.toString(),stderr:result.stderr?.toString()},null,2),{mode:0o600,flag:'wx'});throw new Error('UI_FIXTURE_COMMAND');}return result.stdout;}
    private source():Map<string,Buffer>{const remote=new URL(this.command('git',['remote','get-url','origin']).toString().trim());UiArchiveFixtureBuild.require(remote.protocol==='https:'&&!remote.username&&!remote.password&&remote.hostname==='github.com'&&remote.pathname.replace(/\.git$/,'')==='/treeseed-ai/ui');const records=this.command('git',['ls-tree','-r','-z',UiArchiveFixtureBuild.baseCommit,'--','src','scripts','tsconfig.json','package.json','bun.lock','README.md','LICENSE','vendor/sdk.tgz']).toString().split('\0'),files=new Map<string,Buffer>();for(const record of records){if(!record)continue;const match=/^(100644|100755) blob ([a-f0-9]{40})\t([a-zA-Z0-9._/-]+)$/.exec(record);UiArchiveFixtureBuild.require(match&&!match[3]!.split('/').includes('..'));files.set(match[3]!,this.command('git',['cat-file','blob',match[2]!]));}for(const required of ['src/providers.ts','scripts/tooling.ts','package.json','bun.lock','LICENSE','vendor/sdk.tgz'])UiArchiveFixtureBuild.require(files.has(required));return files;}
    private static replace(source:string,from:string,to:string):string{UiArchiveFixtureBuild.require(source.split(from).length===2);return source.replace(from,to);}
    private sourceDigest(files: Map<string, Buffer>): string {
        const identities: Record<string, string> = {};
        for (const [path, bytes] of files) identities[path] = UiArchiveFixtureBuild.sha(bytes);
        return UiArchiveFixtureBuild.sha(CanonicalJson.stringify(identities));
    }
    private metadata(files: Map<string, Buffer>): FixtureMetadata {
        const metadata = JSON.parse(files.get('package.json')!.toString()) as FixtureMetadata;
        UiArchiveFixtureBuild.require(metadata.name === '@treeseed-cordis/ui'
            && metadata.version === '0.0.0-cordis.16' && metadata.packageManager === 'bun@' + Bun.version);
        for (const lifecycle of UiArchiveFixtureBuild.lifecycle) {
            UiArchiveFixtureBuild.require(metadata.scripts[lifecycle] === undefined);
        }
        return metadata;
    }
    private static readonly lifecycle = [
        'prepare', 'prebuild', 'postbuild', 'prepack', 'postpack', 'preinstall', 'install', 'postinstall',
    ];
    private providerVariant(files: Map<string, Buffer>): string {
        let providers = "import {createElement,type ReactNode} from 'react';\n" + files.get('src/providers.ts')!.toString();
        providers = UiArchiveFixtureBuild.replace(providers,
            "export class UiPackageIdentity {static readonly artifact='@treeseed-cordis/ui@0.0.0-cordis.16';}",
            "export class UiPackageIdentity {static readonly artifact='@treeseed-cordis/ui@" + UiArchiveFixtureBuild.version + "';}");
        providers = this.statusVariant(providers);
        providers = this.terminalVariant(providers);
        files.set('src/providers.ts', Buffer.from(providers));
        return providers;
    }
    private statusVariant(providers: string): string {
        const component = "class QualifiedUiStatus extends UiStatus {override render():ReactNode{return createElement('section',{className:'cordis-qualified-status'},super.render(),createElement('span',{'data-cordis-fixture':'ui-replacement'},"+JSON.stringify(UiArchiveFixtureBuild.marker)+"));}}\n";
        providers = UiArchiveFixtureBuild.replace(providers,
            'export class StatusComponentPlugin extends ComponentProvider {',
            component + 'export class StatusComponentPlugin extends ComponentProvider {');
        return UiArchiveFixtureBuild.replace(providers,
            'readonly component = UiStatus;', 'readonly component = QualifiedUiStatus;');
    }
    private terminalVariant(providers: string): string {
        return UiArchiveFixtureBuild.replace(providers,"model.title + ': ' + model.state + (model.detail ? '\\n' + model.detail : '')","model.title + ': ' + model.state + (model.detail ? '\\n' + model.detail : '') + '\\n"+UiArchiveFixtureBuild.marker+"'");
    }
    private variant(files: Map<string, Buffer>): { sourceDigest: string; recipeDigest: string } {
        const sourceDigest = this.sourceDigest(files);
        const metadata = this.metadata(files);
        const providers = this.providerVariant(files);
        metadata.version = UiArchiveFixtureBuild.version;
        const recipeDigest = this.recipe(sourceDigest, providers, files);
        metadata.cordisFixture = { formatVersion: 1, purpose: 'assembled-ui-only-replacement',
            sourceBaseCommit: UiArchiveFixtureBuild.baseCommit, recipeDigest };
        files.set('package.json', Buffer.from(JSON.stringify(metadata, null, 2) + '\n'));
        return { sourceDigest, recipeDigest };
    }
    private recipe(sourceDigest: string, providers: string, files: Map<string, Buffer>): string {
        return UiArchiveFixtureBuild.sha(CanonicalJson.stringify({ id: 'ui-status-qualification.1',
            sourceDigest, version: UiArchiveFixtureBuild.version,
            providerSource: UiArchiveFixtureBuild.sha(providers),
            sdkArchive: UiArchiveFixtureBuild.sha(files.get('vendor/sdk.tgz')!) }));
    }
    produce(output: string): FixtureReceipt {
        this.output(output);
        const files = this.source();
        const identity = this.variant(files);
        const build = mkdtempSync(join(tmpdir(), 'cordis ui qualified source '));
        try {
            this.materialize(files, build);
            this.package(build, output);
            const receipt = this.receipt(output, files, identity);
            writeFileSync(join(output, 'ui-fixture.json'), JSON.stringify(receipt, null, 2) + '\n',
                { mode: 0o600, flag: 'wx' });
            UiArchiveFixtureBuild.require(UiArchiveFixtureBuild.sha(readFileSync(receipt.archive.path)) === receipt.archive.sha256);
            return receipt;
        } finally {
            rmSync(build, { recursive: true, force: true });
        }
    }
    private output(output: string): void {
        UiArchiveFixtureBuild.require(isAbsolute(output) && resolve(output) === output
            && realpathSync(dirname(output)) === dirname(output));
        mkdirSync(output, { mode: 0o700 });
        const stat = lstatSync(output);
        UiArchiveFixtureBuild.require(stat.isDirectory() && !stat.isSymbolicLink()
            && stat.uid === process.getuid!() && (stat.mode & 0o777) === 0o700
            && readdirSync(output).length === 0);
        this.diagnostics = join(output, 'ui-fixture-error.json');
    }
    private materialize(files: Map<string, Buffer>, build: string): void {
        for (const [path, bytes] of files) {
            const target = join(build, path);
            mkdirSync(dirname(target), { recursive: true, mode: 0o700 });
            writeFileSync(target, bytes, { mode: 0o600, flag: 'wx' });
        }
    }
    private package(build: string, output: string): void {
        this.command(process.execPath, ['install', '--frozen-lockfile', '--ignore-scripts'], build);
        this.command(process.execPath, ['run', 'build'], build);
        this.command(process.execPath, ['pm', 'pack', '--ignore-scripts', '--destination', output, '--quiet'], build);
    }
    private archive(output: string): FixtureReceipt['archive'] {
        const path = join(output, 'treeseed-cordis-ui-' + UiArchiveFixtureBuild.version + '.tgz');
        chmodSync(path, 0o600);
        const bytes = readFileSync(path);
        return { path, sha256: UiArchiveFixtureBuild.sha(bytes), size: bytes.length };
    }
    private sdk(output: string, files: Map<string, Buffer>): FixtureReceipt['sdkArchive'] {
        const path = join(output, 'fixture-sdk.tgz');
        const bytes = files.get('vendor/sdk.tgz')!;
        writeFileSync(path, bytes, { mode: 0o600, flag: 'wx' });
        return { path, sha256: UiArchiveFixtureBuild.sha(bytes) };
    }
    private receipt(output: string, files: Map<string, Buffer>, identity: { sourceDigest: string; recipeDigest: string }): FixtureReceipt {
        return { formatVersion: 1, fixture: true, version: UiArchiveFixtureBuild.version,
            source: { repository: 'https://github.com/treeseed-ai/ui.git',
                baseCommit: UiArchiveFixtureBuild.baseCommit, treeDigest: identity.sourceDigest },
            recipeDigest: identity.recipeDigest, archive: this.archive(output), sdkArchive: this.sdk(output, files) };
    }

}
class UiFixtureCommand {
    static run():void{if(process.argv.length!==4||process.argv[2]!=='--output'){process.stderr.write('Usage: bun ui-archive-fixture.js --output ABSOLUTE_DIR\n');process.exitCode=2;return;}try{process.stdout.write(JSON.stringify(new UiArchiveFixtureBuild().produce(process.argv[3]!))+'\n');}catch{process.stderr.write('UI replacement fixture generation failed.\n');process.exitCode=1;}}
}
if(import.meta.main)UiFixtureCommand.run();
