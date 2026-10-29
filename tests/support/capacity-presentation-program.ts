import assert from 'node:assert/strict';
import * as sdk from '@treeseed-cordis/sdk/portable';
import { UiServerRenderer } from '@treeseed-cordis/ui/server';
import { UiTerminalRenderer } from '@treeseed-cordis/ui/terminal';
import type { UiViewModel } from '@treeseed-cordis/ui/contracts';

class CapacityPresentationProgram {
  private readonly view: UiViewModel = {
    id: 'capacity-probe',
    componentId: 'status',
    model: { title: 'Capacity <probe>', state: 'Pending', detail: 'Awaiting qualification.' },
  };

  async run(): Promise<void> {
    this.contracts();
    const server = await UiServerRenderer.create();
    const terminal = await UiTerminalRenderer.create();
    try {
      const page = await server.render(this.view);
      const text = await terminal.render(this.view);
      assert.ok(page.html.includes('Capacity &lt;probe&gt;'));
      assert.ok(!page.html.includes('Capacity <probe>'));
      assert.ok(text.text.includes('Awaiting qualification.'));
      process.stdout.write('capacity-presentation-ok\n');
    } finally {
      await server.dispose();
      await terminal.dispose();
    }
  }
  private contracts(): void {
    assert.equal(
      typeof Reflect.get(sdk, 'CapacitySchemas'),
      'function',
      'capacity contracts required',
    );
    const channel = Reflect.get(sdk, 'CapacityChannelSchemas');
    assert.equal(typeof channel, 'function', 'manager channel contracts required');
    assert.equal(Reflect.get(channel, 'version'), '1.1.0-cordis.1');
  }
}

if (import.meta.main) await new CapacityPresentationProgram().run();
