import { test, expect } from 'bun:test';
import { firefox, type Browser, type Page, type ConsoleMessage } from 'playwright';
import { UiStyles } from '../../src/styles.js';
import { type UiViewModel } from '../../src/contracts.js';
import { mkdirSync, writeFileSync } from 'node:fs';
import {BrowserAssertions,BrowserErrors,UiBrowserTests} from '../support/browser-test-support.js';
class UiBrowserTestsAcceptance extends UiBrowserTests {

    async responsive(): Promise<void> {
        const build = await Bun.build({ entrypoints: ['tests/support/browser-program.ts'], target: 'browser', format: 'esm' });
        if (!build.success)
            throw new Error(build.logs.join('\n'));
        this.js = await build.outputs[0]!.text();
        expect(this.js).not.toContain('node:fs');
        this.stylePath = (await UiStyles.asset()).path;
        const digest=new Bun.CryptoHasher('sha256').update(this.js).digest('hex');this.scriptPath='/assets/'+digest+'.js';
        const {UiServerRenderer}=await import('@treeseed-cordis/ui/server'),renderer=await UiServerRenderer.create(),view:UiViewModel={id:'page',componentId:'stack',model:{title:'Hydrated page',children:[{id:'form',componentId:'form',model:{title:'Profile',actionId:'fixture.save',submitLabel:'Save',actionData:{csrf:'public-nonce'},fields:[{id:'name',label:'Name'}]}}]}};try{this.ssr=(await renderer.document({title:'Reusable document',view,script:{path:this.scriptPath,sha256:digest},assetGeneration:'a'.repeat(64),actionIds:['fixture.save']})).html;}finally{await renderer.dispose();}
        const errors=new BrowserErrors(),server = Bun.serve({ hostname: '127.0.0.1', port: 0, fetch: this.handle.bind(this) }), browser = await firefox.launch({ headless: true });
        try {
            const page = await browser.newPage({ reducedMotion: 'reduce' });page.on('pageerror',errors.error.bind(errors));page.on('console',errors.console.bind(errors));
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
            await page.getByRole('textbox').first().fill('draft');await page.getByRole('textbox').first().focus();const focused=await page.getByRole('textbox').first().getAttribute('id');const updated=this.views()[3]!;const model=updated.model as {title:string};model.title='Updated profile';await page.evaluate(BrowserAssertions.update,JSON.stringify(updated));expect(await page.getByRole('textbox').first().inputValue()).toBe('draft');expect(await page.locator(':focus').getAttribute('id')).toBe(focused);expect(await page.evaluate(BrowserAssertions.currentTitle)).toBe('Updated profile');expect(await page.evaluate(BrowserAssertions.invalid)).toBe(true);expect(await page.getByRole('textbox').first().inputValue()).toBe('draft');expect(await page.evaluate(BrowserAssertions.concurrent,JSON.stringify(updated))).toBe(true);expect(await page.evaluate(BrowserAssertions.currentTitle)).toBe('Updated profile');for(let iteration=0;iteration<20;iteration++)await page.evaluate(BrowserAssertions.update,JSON.stringify(updated));
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
            const draining:UiViewModel={id:'draining',componentId:'stack',model:{children:[{id:'first',componentId:'form',model:{title:'First',actionId:'fixture.save',submitLabel:'Hold action',fields:[]}},{id:'second',componentId:'form',model:{title:'Second',actionId:'fixture.save',submitLabel:'Try action',fields:[]}}]}};await page.evaluate(BrowserAssertions.render,JSON.stringify(draining));await page.evaluate(BrowserAssertions.hold);await page.getByRole('button',{name:'Hold action'}).click();await page.waitForFunction(BrowserAssertions.calls);await page.evaluate(BrowserAssertions.beginClose);await page.getByRole('button',{name:'Try action'}).click();await page.getByRole('status').filter({hasText:'Action unavailable'}).waitFor();expect(await page.evaluate(BrowserAssertions.calls)).toBe(1);expect(await page.locator('.trsd-ui').count()).toBe(1);await page.evaluate(BrowserAssertions.finishClose);expect(await page.locator('.trsd-ui').count()).toBe(0);
            await page.goto('http://127.0.0.1:'+server.port+'/hydrate');await page.waitForSelector('html[data-ready=true]');await page.getByRole('textbox').fill('Hydrated');await page.getByRole('button').click();await page.getByRole('status').filter({hasText:'Saved Hydrated public-nonce'}).waitFor();await page.evaluate(BrowserAssertions.close);expect(await page.locator('.trsd-ui').count()).toBe(0);
            await page.goto('http://127.0.0.1:'+server.port+'/hydrate?tamper=1');await page.waitForSelector('html[data-refused=true]');expect(await page.getByRole('button').isDisabled()).toBe(true);expect(errors.unexpected()).toEqual([]);
        }
        catch(error){throw new Error(String(error)+' '+JSON.stringify(errors.values));}
        finally {
            await browser.close();
            server.stop(true);
        }
    }
}
const suite=new UiBrowserTestsAcceptance();
test("acceptance: every React component is mobile first through widescreen with real browser cleanup", suite.responsive.bind(suite), 120000);
