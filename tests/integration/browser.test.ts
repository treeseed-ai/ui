import { test, expect } from 'bun:test';
import { firefox, type Browser, type Page, type ConsoleMessage } from 'playwright';
import { UiStyles } from '../../src/styles.js';
import { type UiViewModel } from '../../src/contracts.js';
import { mkdirSync, writeFileSync } from 'node:fs';
import {BrowserAssertions,BrowserErrors,UiBrowserTests} from '../support/browser-test-support.js';
class DocumentTestsIntegration {

 async document():Promise<void>{const {UiServerRenderer}=await import('../../src/server.js'),renderer=await UiServerRenderer.create();try{const digest='d'.repeat(64),page=await renderer.document({title:'<script>title-canary</script>',view:{id:'page',componentId:'text',model:{text:'</script><script>bootstrap-canary</script>'}},script:{path:'/assets/'+digest+'.js',sha256:digest},assetGeneration:'a'.repeat(64),actionIds:[]});expect(page.html).toContain('width=device-width,initial-scale=1');expect(page.html).toContain('&lt;script&gt;title-canary&lt;/script&gt;');expect(page.html.includes('</script><script>bootstrap-canary')).toBe(false);expect(page.html).toContain('integrity="sha256-');expect(page.bootstrap.view.id).toBe('page');await expect(renderer.document({title:'Invalid script',view:{id:'text',componentId:'text',model:{text:'Safe'}},script:{path:'/assets/mutable.js',sha256:digest},assetGeneration:'a'.repeat(64),actionIds:[]})).rejects.toThrow();}finally{await renderer.dispose();}}
}
const documentTests=new DocumentTestsIntegration();
test('integration: default document owns mobile metadata inert bootstrap and immutable script identity',documentTests.document.bind(documentTests));
