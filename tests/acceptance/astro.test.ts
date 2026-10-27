import { test, expect } from 'bun:test';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync, rmSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { firefox } from 'playwright';
import { UiStyles } from '../../src/styles.js';
class AstroAssertions {
    static capture(): void { class Capture {
        static error(event: ErrorEvent): void { Reflect.set(window, 'fixtureFailure', JSON.stringify({ message: event.error?.message, issues: event.error?.issues, stack: event.error?.stack })); }
        static accept(event: PromiseRejectionEvent): void { Reflect.set(window, 'fixtureFailure', JSON.stringify({ message: event.reason?.message, issues: event.reason?.issues, stack: event.reason?.stack })); }
    } window.addEventListener('unhandledrejection', Capture.accept); window.addEventListener('error', Capture.error); }
    static async standalone():Promise<void>{const ui=Reflect.get(window,'ui') as {select(value:boolean):Promise<void>};await ui.select(true);}
    static async closeStandalone():Promise<void>{await Reflect.get(window,'ui').close();}
    static failure(): unknown { return Reflect.get(window, 'fixtureFailure'); }
    static async close(): Promise<void> { await Reflect.get(window, 'fixtureClose')(); }
}
class AstroErrors {
    readonly values: string[] = [];
    accept(error: Error): void { this.values.push(String(error) + ' ' + error.stack); }
    console(message: {
        type(): string;
        text(): string;
    }): void { if (message.type() === 'error')
        this.values.push(message.text()); }
}
class AstroTests {
    private directory = '';
    private execute(command: string, args: string[], cwd: string): void { const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 90000, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } }); if (result.status !== 0)
        throw new Error(command + ' ' + args.join(' ') + '\n' + result.stdout + '\n' + result.stderr); }
    private serve(request: Request): Response { const pathname = decodeURIComponent(new URL(request.url).pathname), path = join(this.directory, 'dist', pathname === '/' ? 'index.html' : pathname); if (!path.startsWith(join(this.directory, 'dist') + '/'))
        return new Response(null, { status: 404 }); try {
        const bytes = readFileSync(path);
        return new Response(bytes, { headers: { 'content-type': path.endsWith('.js') ? 'text/javascript' : path.endsWith('.css') ? 'text/css' : 'text/html' } });
    }
    catch {
        return new Response(null, { status: 404 });
    } }
    async hydration(): Promise<void> {
        this.directory = mkdtempSync(join(tmpdir(), 'cordis-ui-astro-'));
        const d = this.directory;
        try {
            this.execute('bun', ['pm', 'pack', '--destination', d], process.cwd());
            const version=(JSON.parse(readFileSync('package.json','utf8')) as {version:string}).version,archive = join(d, 'treeseed-cordis-ui-'+version+'.tgz');
            cpSync('vendor/sdk.tgz', join(d, 'sdk.tgz'));
            writeFileSync(join(d, 'package.json'), JSON.stringify({ type: 'module', dependencies: { '@treeseed-cordis/ui': 'file:' + archive, '@treeseed-cordis/sdk': 'file:./sdk.tgz', astro: '7.4.2', '@astrojs/react': '7.1.1', react: '19.3.1', 'react-dom': '19.3.1', 'oxc-transform-react': '0.145.0' } }));
            mkdirSync(join(d, 'src/pages'), { recursive: true });
            cpSync('tests/support/astro-fixture', join(d, 'src/host'), { recursive: true });
            writeFileSync(join(d, 'astro.config.ts'), "import react from '@astrojs/react';import {fileURLToPath} from 'node:url';class Integration{static setup({addRenderer}){addRenderer({name:'cordis-ui',serverEntrypoint:fileURLToPath(new URL('./src/host/server.ts',import.meta.url)),clientEntrypoint:fileURLToPath(new URL('./src/host/client.ts',import.meta.url))});}}export default {integrations:[{name:'cordis-ui',hooks:{'astro:config:setup':Integration.setup}},react()],vite:{build:{target:'es2022'}}};");
            const style = await UiStyles.asset();
            mkdirSync(join(d, 'public', style.path.slice(0, style.path.lastIndexOf('/'))), { recursive: true });
            writeFileSync(join(d, 'public', style.path), style.css);
            writeFileSync(join(d, 'src/pages/index.astro'), "---\nimport {UiIsland} from '@treeseed-cordis/ui/island';import {FixtureBootstrap} from '../host/bootstrap.js';const bootstrap=await FixtureBootstrap.bootstrap('Alice');\n---\n<html lang=\"en\"><head><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/><link rel=\"stylesheet\" href=\"" + style.path + "\"/></head><body><UiIsland client:load {...bootstrap}/></body></html>");
            this.execute('bun', ['install', '--ignore-scripts'], d);
            this.execute('node', ['node_modules/astro/bin/astro.mjs', 'build'], d);
            cpSync('tests/support/browser-program.ts',join(d,'src/standalone.ts'));this.execute('bun',['build','src/standalone.ts','--target','browser','--format','esm','--outfile','dist/standalone.js'],d);writeFileSync(join(d,'dist/standalone.html'),'<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="app"></div><script type="module" src="/standalone.js"></script></body></html>');
            for(const file of readdirSync(join(d,'dist/_astro')))if(file.endsWith('.js'))expect(readFileSync(join(d,'dist/_astro',file),'utf8').includes('INVALID_UI_SERVER_RENDERER')).toBe(false);
            const html = readFileSync(join(d, 'dist/index.html'), 'utf8');
            expect(html).toContain('Profile Alice');
            expect(html).toContain('astro-island');
            expect(html).not.toContain('credential-output-canary');
            const server = Bun.serve({ hostname: '127.0.0.1', port: 0, fetch: this.serve.bind(this) }), browser = await firefox.launch({ headless: true });
            try {
                const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
                const errors = new AstroErrors();
                page.on('pageerror', errors.accept.bind(errors));
                page.on('console', errors.console.bind(errors));
                await page.addInitScript(AstroAssertions.capture);
                await page.goto('http://127.0.0.1:' + server.port);
                try {
                    await page.locator('button:enabled').waitFor({ timeout: 10000 });
                }
                catch (error) {
                    throw new Error(String(error) + ' ' + JSON.stringify(errors.values) + ' ' + await page.evaluate(AstroAssertions.failure));
                }
                await page.getByRole('textbox').fill('Astro');
                await page.getByRole('button').click();
                await page.getByRole('status').filter({ hasText: 'Saved Astro' }).waitFor();
                expect(errors.values).toEqual([]);
                await page.evaluate(AstroAssertions.close);
                expect(await page.locator('.trsd-ui').count()).toBe(0);
                await page.goto('http://127.0.0.1:'+server.port+'/standalone.html');await page.waitForSelector('html[data-ready=true]');await page.evaluate(AstroAssertions.standalone);await page.getByText('Qualified alternate',{exact:true}).waitFor();await page.evaluate(AstroAssertions.closeStandalone);expect(await page.locator('.trsd-ui').count()).toBe(0);expect(errors.values).toEqual([]);
            }
            finally {
                await browser.close();
                server.stop(true);
            }
        }
        finally {
            if (process.env.UI_KEEP_FIXTURE !== '1')
                rmSync(d, { recursive: true, force: true });
        }
    }
}
const suite = new AstroTests();
test("acceptance: packed UI archive renders and hydrates through real Astro React integration", suite.hydration.bind(suite), 180000);
