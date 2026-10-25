import { test, expect } from 'bun:test';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { firefox } from 'playwright';
import { UiStyles } from '../src/styles.js';
class AstroAssertions {
    static capture(): void { class Capture {
        static error(event: ErrorEvent): void { Reflect.set(window, 'fixtureFailure', JSON.stringify({ message: event.error?.message, issues: event.error?.issues, stack: event.error?.stack })); }
        static accept(event: PromiseRejectionEvent): void { Reflect.set(window, 'fixtureFailure', JSON.stringify({ message: event.reason?.message, issues: event.reason?.issues, stack: event.reason?.stack })); }
    } window.addEventListener('unhandledrejection', Capture.accept); window.addEventListener('error', Capture.error); }
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
            const archive = join(d, 'treeseed-cordis-ui-0.0.0-cordis.3.tgz');
            cpSync('vendor/sdk.tgz', join(d, 'sdk.tgz'));
            writeFileSync(join(d, 'package.json'), JSON.stringify({ type: 'module', dependencies: { '@treeseed-cordis/ui': 'file:' + archive, '@treeseed-cordis/sdk': 'file:./sdk.tgz', astro: '7.4.2', '@astrojs/react': '7.1.1', react: '19.3.1', 'react-dom': '19.3.1', 'oxc-transform-react': '0.145.0' } }));
            mkdirSync(join(d, 'src/pages'), { recursive: true });
            cpSync('tests/astro-fixture', join(d, 'src/host'), { recursive: true });
            writeFileSync(join(d, 'astro.config.ts'), "import react from '@astrojs/react';import {fileURLToPath} from 'node:url';class Integration{static setup({addRenderer}){addRenderer({name:'cordis-ui',serverEntrypoint:fileURLToPath(new URL('./src/host/server.ts',import.meta.url)),clientEntrypoint:fileURLToPath(new URL('./src/host/client.ts',import.meta.url))});}}export default {integrations:[{name:'cordis-ui',hooks:{'astro:config:setup':Integration.setup}},react()],vite:{build:{target:'es2022'}}};");
            const style = await UiStyles.asset();
            mkdirSync(join(d, 'public', style.path.slice(0, style.path.lastIndexOf('/'))), { recursive: true });
            writeFileSync(join(d, 'public', style.path), style.css);
            writeFileSync(join(d, 'src/pages/index.astro'), "---\nimport {UiIsland} from '@treeseed-cordis/ui/island';import {FixtureHost} from '../host/host.js';const bootstrap=await FixtureHost.bootstrap('Alice');\n---\n<html lang=\"en\"><head><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/><link rel=\"stylesheet\" href=\"" + style.path + "\"/></head><body><UiIsland client:load {...bootstrap}/></body></html>");
            this.execute('bun', ['install', '--ignore-scripts'], d);
            this.execute('node', ['node_modules/astro/bin/astro.mjs', 'build'], d);
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
test('smoke: packed UI archive renders and hydrates through real Astro React integration', suite.hydration.bind(suite), 180000);
