import { UiIslandHost, UiIsland } from '@treeseed-cordis/ui/island';
import { UiServerRenderer } from '@treeseed-cordis/ui/server';
import type { UiHydrationData, UiActionResult } from '@treeseed-cordis/ui/contracts';
export class FixtureHost {
  static readonly assetGeneration='b'.repeat(64);
  static readonly actionIds=['fixture.save'];
  static async bootstrap(principal:string):Promise<UiHydrationData>{const renderer=await UiServerRenderer.create();try{const page=await renderer.render({id:'profile',componentId:'form',model:{title:'Profile '+principal,actionId:'fixture.save',submitLabel:'Save',fields:[{id:'name',label:'Name',required:true}]}});return {view:{id:'profile',componentId:'form',model:{title:'Profile '+principal,actionId:'fixture.save',submitLabel:'Save',fields:[{id:'name',label:'Name',required:true}]}},presentationGeneration:page.generation,assetGeneration:this.assetGeneration,actionIds:this.actionIds};}finally{await renderer.dispose();}}
}
export class FixtureActions {async invoke(_action:string,input:Readonly<Record<string,string>>):Promise<UiActionResult>{return {success:true,message:'Saved '+input.name};}}
export {UiIslandHost,UiIsland};
