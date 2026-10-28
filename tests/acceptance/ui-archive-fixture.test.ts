import {test,expect} from 'bun:test';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,existsSync,readdirSync,readFileSync,writeFileSync,mkdirSync,rmSync,statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
interface UiFixtureReceipt {
    fixture: boolean;
    source: { baseCommit: string };
    archive: { path: string; sha256: string };
    sdkArchive: { path: string; sha256: string };
    version: string;
}
class UiArchiveFixtureTests {
    capacity(): void {
        const result = spawnSync('node', ['dist/tests/support/capacity-presentation-program.js'], { encoding: 'utf8', timeout: 10000 });
        expect(result.status).toBe(0);
        expect(result.stderr).toBe('');
        expect(result.stdout).toBe('capacity-presentation-ok\n');
    }
    private static protectedSource():string{const hash=createHash('sha256'),paths=['package.json','bun.lock','vendor/sdk.tgz','LICENSE'];for(const name of readdirSync('src').sort())paths.push('src/'+name);for(const path of paths)hash.update(path).update(readFileSync(path));return hash.digest('hex');}
    private static readonly source = "import {UiServerRenderer} from '@treeseed-cordis/ui/server';import {UiTerminalRenderer} from '@treeseed-cordis/ui/terminal';class Program{static async run(){const server=await UiServerRenderer.create(),terminal=await UiTerminalRenderer.create();try{const view={id:'qualified-status',componentId:'status',model:{title:'Status <script>fixture</script>',state:'Ready'}},page=await server.render(view),text=await terminal.render(view);if(!page.html.includes('Cordis UI qualification fixture')||!page.html.includes('&lt;script&gt;fixture&lt;/script&gt;')||page.html.includes('<script>fixture</script>')||!text.text.includes('Cordis UI qualification fixture'))throw new Error('Qualified UI contract mismatch');process.stdout.write('qualified-ui-contract-ok\\n');}finally{await server.dispose();await terminal.dispose();}}}await Program.run();";
    program(): void {
        const original = UiArchiveFixtureTests.protectedSource();
        const root = mkdtempSync(join(tmpdir(), 'cordis ui replacement '));
        try {
            const output = join(root, 'output');
            const receipt = this.produce(output);
            this.identity(receipt, output);
            const consumer = this.consumer(root, receipt);
            this.render(consumer);
            this.repeated(output, receipt);
            expect(UiArchiveFixtureTests.protectedSource()).toBe(original);
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
    }
    private produce(output: string): UiFixtureReceipt {
        const produced = spawnSync(process.execPath,
            ['dist/tests/support/ui-archive-fixture.js', '--output', output],
            { encoding: 'utf8', timeout: 120000 });
        if (produced.status !== 0 && existsSync(join(output, 'ui-fixture-error.json'))) {
            throw new Error(readFileSync(join(output, 'ui-fixture-error.json'), 'utf8'));
        }
        expect(produced.status).toBe(0);
        expect(produced.stderr).toBe('');
        return JSON.parse(produced.stdout) as UiFixtureReceipt;
    }
    private identity(receipt: UiFixtureReceipt, output: string): void {
        expect(receipt.fixture).toBe(true);
        const sdkHash = createHash('sha256').update(readFileSync(receipt.sdkArchive.path)).digest('hex');
        expect(sdkHash).toBe(receipt.sdkArchive.sha256);
        expect(receipt.source.baseCommit).toBe('4bc3511b661e832531c60ab37980fed6dcc8aba6');
        expect(receipt.version).toBe('0.0.0-cordis.16.fixture.1');
        const archiveHash = createHash('sha256').update(readFileSync(receipt.archive.path)).digest('hex');
        expect(archiveHash).toBe(receipt.archive.sha256);
        expect(statSync(output).mode & 0o777).toBe(0o700);
        expect(statSync(receipt.archive.path).mode & 0o777).toBe(0o600);
    }
    private consumer(root: string, receipt: UiFixtureReceipt): string {
        const consumer = join(root, 'consumer');
        mkdirSync(consumer, { mode: 0o700 });
        writeFileSync(join(consumer, 'package.json'), JSON.stringify(this.consumerPackage(receipt)));
        const installed = spawnSync(process.execPath, ['install', '--ignore-scripts'],
            { cwd: consumer, encoding: 'utf8', timeout: 120000 });
        expect(installed.status).toBe(0);
        return consumer;
    }
    private consumerPackage(receipt: UiFixtureReceipt): object {
        return { name: 'ui-qualified-consumer', private: true, type: 'module',
            dependencies: { '@treeseed-cordis/ui': 'file:' + receipt.archive.path,
                '@treeseed-cordis/sdk': 'file:' + receipt.sdkArchive.path,
                react: '19.3.1', 'react-dom': '19.3.1' } };
    }
    private render(consumer: string): void {
        const rendered = spawnSync('node', ['--input-type=module', '-e', UiArchiveFixtureTests.source],
            { cwd: consumer, encoding: 'utf8', timeout: 30000 });
        expect(rendered.status).toBe(0);
        expect(rendered.stderr).toBe('');
        expect(rendered.stdout).toBe('qualified-ui-contract-ok\n');
    }
    private repeated(output: string, receipt: UiFixtureReceipt): void {
        const repeated = spawnSync(process.execPath,
            ['dist/tests/support/ui-archive-fixture.js', '--output', output],
            { encoding: 'utf8', timeout: 30000 });
        expect(repeated.status).not.toBe(0);
        const archiveHash = createHash('sha256').update(readFileSync(receipt.archive.path)).digest('hex');
        expect(archiveHash).toBe(receipt.archive.sha256);
    }

}
const archiveFixture=new UiArchiveFixtureTests();
test('acceptance: built public capacity presentation uses the exact SDK with native server and terminal roots', archiveFixture.capacity.bind(archiveFixture));
test("acceptance: built owner fixture producer packages reusable React and terminal variation without changing frozen source",archiveFixture.program.bind(archiveFixture),300000);
