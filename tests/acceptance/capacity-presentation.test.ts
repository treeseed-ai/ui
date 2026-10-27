import { test, expect } from 'bun:test';
import { spawnSync } from 'node:child_process';

class CapacityPresentationAcceptance {
  run(): void {
    const result = spawnSync('node', ['dist/tests/support/capacity-presentation-program.js'], {
      encoding: 'utf8', timeout: 10000,
    });
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toBe('capacity-presentation-ok\n');
  }
}

const suite = new CapacityPresentationAcceptance();
test('acceptance: default reusable presentation consumes exact capacity contracts', suite.run.bind(suite));
