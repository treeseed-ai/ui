import { UiIslandHost, UiIsland } from '@treeseed-cordis/ui/island';
import type { UiActionResult } from '@treeseed-cordis/ui/contracts';
export class FixtureHost {
    static readonly assetGeneration = 'b'.repeat(64);
    static readonly actionIds = ['fixture.save'];

}
export class FixtureActions {
    async invoke(_action: string, input: Readonly<Record<string, string>>): Promise<UiActionResult> { return { success: true, message: 'Saved ' + input.name }; }
}
export { UiIslandHost, UiIsland };
