import { test, expect } from 'bun:test';
import { firefox, type Browser, type Page } from 'playwright';
import { UiStyles } from '../src/styles.js';
import { type UiViewModel } from '../src/contracts.js';
import { mkdirSync, writeFileSync } from 'node:fs';
class BrowserAssertions {
    static async render(serialized: string): Promise<void> { await window.ui.show(JSON.parse(serialized) as UiViewModel); }
    static async update(serialized:string):Promise<void>{await window.ui.update(JSON.parse(serialized) as UiViewModel);}
    static currentTitle():unknown{return (window.ui.view().model as {title?:string}).title;}
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
    private ssr='';private scriptPath='';
    private js = '';
    private stylePath = '';
    private handle(request:Request):Response{const url=new URL(request.url);if(url.pathname==='/program.js'||url.pathname===this.scriptPath)return new Response(this.js,{headers:{'content-type':'text/javascript'}});if(url.pathname===this.stylePath)return new Response(UiStyles.css,{headers:{'content-type':'text/css'}});if(url.pathname==='/hydrate'){const html=url.searchParams.has('tamper')?this.ssr.replace('"providerId":"ui.form.default"','"providerId":"ui.foreign"'):this.ssr;return new Response(html,{headers:{'content-type':'text/html','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'"}});}return new Response('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="app"></div><script type="module" src="/program.js"></script></body></html>',{headers:{'content-type':'text/html','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'"}});}
    private views(): UiViewModel[] { const long = 'LongUnbrokenComponentContent'.repeat(12); return [{ id: 'text', componentId: 'text', model: { text: long } }, { id: 'status', componentId: 'status', model: { title: long, state: 'Ready', detail: '<script>script-output-canary</script>' } }, { id: 'table', componentId: 'table', model: { title: 'Records', columns: ['Name', 'State', 'Details', 'Owner', 'Resource'], rows: [[long, 'Ready', long, 'Owner', 'Resource']] } }, { id: 'form', componentId: 'form', model: { title: long, actionId: 'fixture.save', submitLabel: 'Save ' + long, fields: [{ id: 'name', label: long, required: true }, { id: 'email', label: 'Email', type: 'email' }] } }, { id: 'navigation', componentId: 'navigation', model: { label: 'Navigation', items: [{ label: long, href: '#destination' }, { label: 'Status', href: '/status' }] } }, { id: 'feedback', componentId: 'feedback', model: { title: long, message: long, tone: 'error' } }, {id:'composite',componentId:'stack',model:{title:long,children:[{id:'child-text',componentId:'text',model:{text:long}},{id:'child-status',componentId:'status',model:{title:long,state:'Ready'}}]}}]; }
    async responsive(): Promise<void> {
        const build = await Bun.build({ entrypoints: ['tests/browser-program.ts'], target: 'browser', format: 'esm' });
        if (!build.success)
            throw new Error(build.logs.join('\n'));
        this.js = await build.outputs[0]!.text();
        expect(this.js).not.toContain('node:fs');
        this.stylePath = (await UiStyles.asset()).path;
        const digest=new Bun.CryptoHasher('sha256').update(this.js).digest('hex');this.scriptPath='/assets/'+digest+'.js';
        const {UiServerRenderer}=await import('@treeseed-cordis/ui/server'),renderer=await UiServerRenderer.create(),view:UiViewModel={id:'page',componentId:'stack',model:{title:'Hydrated page',children:[{id:'form',componentId:'form',model:{title:'Profile',actionId:'fixture.save',submitLabel:'Save',actionData:{csrf:'public-nonce'},fields:[{id:'name',label:'Name'}]}}]}};try{this.ssr=(await renderer.document({title:'Reusable document',view,script:{path:this.scriptPath,sha256:digest},assetGeneration:'a'.repeat(64),actionIds:['fixture.save']})).html;}finally{await renderer.dispose();}
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
            await page.getByRole('textbox').first().fill('draft');await page.getByRole('textbox').first().focus();const focused=await page.getByRole('textbox').first().getAttribute('id');const updated=this.views()[3]!;const model=updated.model as {title:string};model.title='Updated profile';await page.evaluate(BrowserAssertions.update,JSON.stringify(updated));expect(await page.getByRole('textbox').first().inputValue()).toBe('draft');expect(await page.locator(':focus').getAttribute('id')).toBe(focused);expect(await page.evaluate(BrowserAssertions.currentTitle)).toBe('Updated profile');
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
            await page.goto('http://127.0.0.1:'+server.port+'/hydrate');await page.waitForSelector('html[data-ready=true]');await page.getByRole('textbox').fill('Hydrated');await page.getByRole('button').click();await page.getByRole('status').filter({hasText:'Saved Hydrated public-nonce'}).waitFor();await page.evaluate(BrowserAssertions.close);expect(await page.locator('.trsd-ui').count()).toBe(0);
            await page.goto('http://127.0.0.1:'+server.port+'/hydrate?tamper=1');await page.waitForSelector('html[data-refused=true]');expect(await page.getByRole('button').isDisabled()).toBe(true);
        }
        finally {
            await browser.close();
            server.stop(true);
        }
    }
}
const suite = new UiBrowserTests();
test('smoke: every React component is mobile first through widescreen with real browser cleanup', suite.responsive.bind(suite), 120000);

class DocumentTests {
 async document():Promise<void>{const {UiServerRenderer}=await import('../src/server.js'),renderer=await UiServerRenderer.create();try{const digest='d'.repeat(64),page=await renderer.document({title:'<script>title-canary</script>',view:{id:'page',componentId:'text',model:{text:'</script><script>bootstrap-canary</script>'}},script:{path:'/assets/'+digest+'.js',sha256:digest},assetGeneration:'a'.repeat(64),actionIds:[]});expect(page.html).toContain('width=device-width,initial-scale=1');expect(page.html).toContain('&lt;script&gt;title-canary&lt;/script&gt;');expect(page.html.includes('</script><script>bootstrap-canary')).toBe(false);expect(page.html).toContain('integrity="sha256-');expect(page.bootstrap.view.id).toBe('page');await expect(renderer.document({title:'Invalid script',view:{id:'text',componentId:'text',model:{text:'Safe'}},script:{path:'/assets/mutable.js',sha256:digest},assetGeneration:'a'.repeat(64),actionIds:[]})).rejects.toThrow();}finally{await renderer.dispose();}}
 async context():Promise<void>{const {UiSchemas}=await import('../src/contracts.js');expect(UiSchemas.formModel.safeParse({title:'Action',actionId:'fixture.save',submitLabel:'Save',actionData:{csrf:'public-nonce'},fields:[]}).success).toBe(true);expect(UiSchemas.formModel.safeParse({title:'Action',actionId:'fixture.save',submitLabel:'Save',actionData:{csrf:'public-nonce'},fields:[{id:'csrf',label:'Override'}]}).success).toBe(false);expect(UiSchemas.formModel.safeParse({title:'Action',actionId:'fixture.save',submitLabel:'Save',actionData:{token:'credential-canary'},fields:[]}).success).toBe(false);}
}
const documentTests=new DocumentTests();test('integration: default document owns mobile metadata inert bootstrap and immutable script identity',documentTests.document.bind(documentTests));test('unit: public action context cannot be overridden by fields or carry credential slots',documentTests.context.bind(documentTests));
