import { ProjectTooling } from '@treeseed-cordis/sdk/source-policy';
import { ReactServerRendererPlugin } from '../src/server.js';
import { ReactBrowserRendererPlugin } from '../src/browser.js';
import { PlainTerminalRendererPlugin } from '../src/terminal.js';
import { ReactIslandRendererPlugin } from '../src/island.js';
import { UiScope } from '../src/providers.js';
import { readFileSync,writeFileSync } from 'node:fs';
class UiTooling {
  static run():void {ProjectTooling.run();if(process.argv[2]==='build'){const metadata=JSON.parse(readFileSync('package.json','utf8')) as {cordisProviders?:unknown};metadata.cordisProviders=[...UiScope.defaults().map(UiTooling.declaration),ReactServerRendererPlugin.declaration,ReactBrowserRendererPlugin.declaration,PlainTerminalRendererPlugin.declaration,ReactIslandRendererPlugin.declaration];writeFileSync('package.json',JSON.stringify(metadata,null,2)+'\n');}}
  private static declaration(registration:{declaration:unknown}):unknown{return registration.declaration;}
}
UiTooling.run();
