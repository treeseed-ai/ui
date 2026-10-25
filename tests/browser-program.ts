import { UiBrowserApplication, type UiHostAdapters } from '../src/browser.js';
import { type UiViewModel, type UiMount, type UiActionResult } from '../src/contracts.js';
class FixtureActions {
  async invoke(_id:string,input:Readonly<Record<string,string>>):Promise<UiActionResult>{return {success:true,message:'Saved '+(input.name??'')};}
}
export class UiBrowserProgram {
  private mount:UiMount|null=null;
  async show(view:UiViewModel):Promise<void>{await this.mount?.dispose();this.mount=await UiBrowserApplication.start({target:document.getElementById('app')!,view,host:{actions:new FixtureActions(),actionIds:['fixture.save'],assetGeneration:'a'.repeat(64)}});}
  async close():Promise<void>{await this.mount?.dispose();this.mount=null;}
  static async run():Promise<void>{window.ui=new UiBrowserProgram();await window.ui.show({id:'initial',componentId:'status',model:{title:'Status',state:'Ready'}});document.documentElement.dataset.ready='true';}
}
declare global {interface Window {ui:UiBrowserProgram;}}
await UiBrowserProgram.run();
