import { test, expect } from 'bun:test';
import { firefox, type Browser, type Page } from 'playwright';
import { UiStyles } from '../src/styles.js';
import { type UiViewModel } from '../src/contracts.js';
import { mkdirSync, writeFileSync } from 'node:fs';
class BrowserAssertions {
    static async render(serialized: string): Promise<void> { await window.ui.show(JSON.parse(serialized) as UiViewModel); }
    static layout(): {
        overflow: boolean;
        smallTargets: number;
        fields: number;
        regions: number;
    } { let smallTargets = 0; for (const element of document.querySelectorAll('button,input,a')) {
        const box = element.getBoundingClientRect();
        if (box.width < 43.9 || box.height < 43.9)
            smallTargets++;
    } return { overflow: document.documentElement.scrollWidth > innerWidth + 1, smallTargets, fields: document.querySelectorAll('input').length, regions: document.querySelectorAll('[role=region][tabindex="0"]').length }; }
    static fontSize(): string { return getComputedStyle(document.documentElement).fontSize; }
    static zoom(value: string): void { document.documentElement.style.fontSize = value; }
    static async alternative(value: boolean): Promise<string> { await window.ui.select(value); return window.ui.generation(); }
    static async close(): Promise<void> { await window.ui.close(); }
}
class UiBrowserTests {
    private js = '';
    private stylePath = '';
    private handle(request: Request): Response { const url = new URL(request.url); if (url.pathname === '/program.js')
        return new Response(this.js, { headers: { 'content-type': 'text/javascript' } }); if (url.pathname === this.stylePath)
        return new Response(UiStyles.css, { headers: { 'content-type': 'text/css' } }); return new Response('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="app"></div><script type="module" src="/program.js"></script></body></html>', { headers: { 'content-type': 'text/html', 'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'" } }); }
    private views(): UiViewModel[] { const long = 'LongUnbrokenComponentContent'.repeat(12); return [{ id: 'text', componentId: 'text', model: { text: long } }, { id: 'status', componentId: 'status', model: { title: long, state: 'Ready', detail: '<script>script-output-canary</script>' } }, { id: 'table', componentId: 'table', model: { title: 'Records', columns: ['Name', 'State', 'Details', 'Owner', 'Resource'], rows: [[long, 'Ready', long, 'Owner', 'Resource']] } }, { id: 'form', componentId: 'form', model: { title: long, actionId: 'fixture.save', submitLabel: 'Save ' + long, fields: [{ id: 'name', label: long, required: true }, { id: 'email', label: 'Email', type: 'email' }] } }, { id: 'navigation', componentId: 'navigation', model: { label: 'Navigation', items: [{ label: long, href: '#destination' }, { label: 'Status', href: '/status' }] } }, { id: 'feedback', componentId: 'feedback', model: { title: long, message: long, tone: 'error' } }, {id:'composite',componentId:'stack',model:{title:long,children:[{id:'child-text',componentId:'text',model:{text:long}},{id:'child-status',componentId:'status',model:{title:long,state:'Ready'}}]}}]; }
    async responsive(): Promise<void> {
        const build = await Bun.build({ entrypoints: ['tests/browser-program.ts'], target: 'browser', format: 'esm' });
        if (!build.success)
            throw new Error(build.logs.join('\n'));
        this.js = await build.outputs[0]!.text();
        expect(this.js).not.toContain('node:fs');
        this.stylePath = (await UiStyles.asset()).path;
        const server = Bun.serve({ hostname: '127.0.0.1', port: 0, fetch: this.handle.bind(this) }), browser = await firefox.launch({ headless: true });
        try {
            const page = await browser.newPage({ reducedMotion: 'reduce' });
            await page.goto('http://127.0.0.1:' + server.port);
            await page.waitForSelector('html[data-ready=true]');
            for (const width of [320, 375, 768, 1024, 1440, 1920, 2560]) {
                await page.setViewportSize({ width, height: 1000 });
                for (const zoom of ['100%', '200%']) {
                    await page.evaluate(BrowserAssertions.zoom, zoom);
                    expect(await page.evaluate(BrowserAssertions.fontSize)).toBe(zoom === '200%' ? '32px' : '16px');
                    for (const view of this.views()) {
                        await page.evaluate(BrowserAssertions.render, JSON.stringify(view));
                        await page.waitForSelector('.trsd-ui');
                        const layout = await page.evaluate(BrowserAssertions.layout);
                        expect(layout.overflow).toBe(false);
                        expect(layout.smallTargets).toBe(0);
                        if (view.componentId === 'table')
                            expect(layout.regions).toBe(1);
                        if (view.componentId === 'form') {
                            expect(layout.fields).toBe(2);
                            await page.getByRole('button').focus();
                            await page.keyboard.press('Tab');
                        }
                    }
                }
            }
            await page.evaluate(BrowserAssertions.zoom, '100%');
            await page.evaluate(BrowserAssertions.render, JSON.stringify(this.views()[3]!));
            await page.getByRole('textbox').first().fill('fixture');
            await page.getByRole('button').click();
            await page.getByRole('status').filter({ hasText: 'Saved fixture' }).waitFor();
            mkdirSync('artifacts', { recursive: true });
            for (const width of [375, 1440]) {
                await page.setViewportSize({ width, height: 1000 });
                await page.screenshot({ path: 'artifacts/ui-' + width + '.png', fullPage: true });
            }
            const original = await page.evaluate(BrowserAssertions.alternative, false), replacement = await page.evaluate(BrowserAssertions.alternative, true);
            expect(replacement).not.toBe(original);
            await page.getByText('Qualified alternate', { exact: true }).waitFor();
            expect(await page.evaluate(BrowserAssertions.alternative, false)).toBe(original);
            expect(await page.getByText('Qualified alternate', { exact: true }).count()).toBe(0);
            expect(await page.locator('script').count()).toBe(1);
            await page.evaluate(BrowserAssertions.close);
            expect(await page.locator('.trsd-ui').count()).toBe(0);
        }
        finally {
            await browser.close();
            server.stop(true);
        }
    }
}
const suite = new UiBrowserTests();
test('smoke: every React component is mobile first through widescreen with real browser cleanup', suite.responsive.bind(suite), 120000);
