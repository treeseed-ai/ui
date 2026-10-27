import { test, expect } from 'bun:test';
import { firefox, type Browser, type Page, type ConsoleMessage } from 'playwright';
import { UiStyles } from '../../src/styles.js';
import { type UiViewModel } from '../../src/contracts.js';
import { mkdirSync, writeFileSync } from 'node:fs';
import {BrowserAssertions,BrowserErrors,UiBrowserTests} from '../support/browser-test-support.js';
class DocumentTestsUnit {

 async context():Promise<void>{const {UiSchemas}=await import('../../src/contracts.js');expect(UiSchemas.formModel.safeParse({title:'Action',actionId:'fixture.save',submitLabel:'Save',actionData:{csrf:'public-nonce'},fields:[]}).success).toBe(true);expect(UiSchemas.formModel.safeParse({title:'Action',actionId:'fixture.save',submitLabel:'Save',actionData:{csrf:'public-nonce'},fields:[{id:'csrf',label:'Override'}]}).success).toBe(false);expect(UiSchemas.formModel.safeParse({title:'Action',actionId:'fixture.save',submitLabel:'Save',actionData:{token:'credential-canary'},fields:[]}).success).toBe(false);}
}
const documentTests=new DocumentTestsUnit();
test('unit: public action context cannot be overridden by fields or carry credential slots',documentTests.context.bind(documentTests));
