import {CanonicalJson} from '@treeseed-cordis/sdk/portable';
import {UiSchemas,type UiContribution,type UiViewModel,type UiComponent} from './contracts.js';
import type {UiPresentation} from './providers.js';
export class UiContributionIdentity {
 static async create(view:UiViewModel,presentation:UiPresentation,component:UiComponent,styleDigest:string):Promise<UiContribution>{const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(CanonicalJson.stringify(component.modelSchema()))));let digest='';for(const byte of bytes)digest+=byte.toString(16).padStart(2,'0');return UiSchemas.contribution.parse({id:view.id,componentId:view.componentId,providerId:presentation.identity(view.componentId),modelSchemaDigest:digest,styleDigest});}
 static assert(expected:UiContribution,actual:UiContribution):void{if(CanonicalJson.stringify(UiSchemas.contribution.parse(expected))!==CanonicalJson.stringify(actual))throw new Error('UI_CONTRIBUTION_MISMATCH');}
}
