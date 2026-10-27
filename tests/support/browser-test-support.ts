import { test, expect } from 'bun:test';
import { firefox, type Browser, type Page, type ConsoleMessage } from 'playwright';
import { UiStyles } from '../../src/styles.js';
import { type UiViewModel } from '../../src/contracts.js';
import { mkdirSync, writeFileSync } from 'node:fs';
export class BrowserAssertions {
    static async render(serialized: string): Promise<void> { await window.ui.show(JSON.parse(serialized) as UiViewModel); }
    static async update(serialized:string):Promise<void>{await window.ui.update(JSON.parse(serialized) as UiViewModel);}
    static invalid():Promise<boolean>{return window.ui.invalid();}static concurrent(serialized:string):Promise<boolean>{return window.ui.concurrent(JSON.parse(serialized) as UiViewModel);}static hold():void{window.ui.hold();}static calls():number{return window.ui.calls();}static beginClose():void{window.ui.beginClose();}static finishClose():Promise<void>{return window.ui.finishClose();}
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
export class BrowserErrors{readonly values:string[]=[];unexpected():string[]{const errors:string[]=[];for(const value of this.values)if(!(value.includes('Content-Security-Policy:')&&value.includes('JavaScript eval')&&value.includes("Missing 'unsafe-eval'")))errors.push(value);return errors;}error(error:Error):void{this.values.push((error.stack??error.message).slice(0,5000));}console(message:ConsoleMessage):void{if(message.type()==='error')this.values.push(message.text().slice(0,2000));}}
export class UiBrowserTests {
    protected ssr='';protected scriptPath='';
    protected js = '';
    protected stylePath = '';
    protected handle(request:Request):Response{const url=new URL(request.url);if(url.pathname==='/program.js'||url.pathname===this.scriptPath)return new Response(this.js,{headers:{'content-type':'text/javascript'}});if(url.pathname===this.stylePath)return new Response(UiStyles.css,{headers:{'content-type':'text/css'}});if(url.pathname==='/hydrate'){const html=url.searchParams.has('tamper')?this.ssr.replace('"providerId":"ui.form.default"','"providerId":"ui.foreign"'):this.ssr;return new Response(html,{headers:{'content-type':'text/html','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'"}});}return new Response('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="app"></div><script type="module" src="/program.js"></script></body></html>',{headers:{'content-type':'text/html','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'"}});}
    protected views(): UiViewModel[] { const long = 'LongUnbrokenComponentContent'.repeat(12); return [{ id: 'text', componentId: 'text', model: { text: long } }, { id: 'status', componentId: 'status', model: { title: long, state: 'Ready', detail: '<script>script-output-canary</script>' } }, { id: 'table', componentId: 'table', model: { title: 'Records', columns: ['Name', 'State', 'Details', 'Owner', 'Resource'], rows: [[long, 'Ready', long, 'Owner', 'Resource']] } }, { id: 'form', componentId: 'form', model: { title: long, actionId: 'fixture.save', submitLabel: 'Save ' + long, fields: [{ id: 'name', label: long, required: true }, { id: 'email', label: 'Email', type: 'email' }] } }, { id: 'navigation', componentId: 'navigation', model: { label: 'Navigation', items: [{ label: long, href: '#destination' }, { label: 'Status', href: '/status' }] } }, { id: 'feedback', componentId: 'feedback', model: { title: long, message: long, tone: 'error' } }, {id:'composite',componentId:'stack',model:{title:long,children:[{id:'child-text',componentId:'text',model:{text:long}},{id:'child-status',componentId:'status',model:{title:long,state:'Ready'}}]}}]; }
}
