import assert from 'node:assert/strict';
import { test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
class UiSdkClosureAcceptance {
  private static readonly expected = {
    version: '0.0.0-cordis.44',
    commit: '00be028b92998f8d7039a3906e784c6b8598e730',
    sha256: 'd95c54cf6081c7634498dfb4f3235d42d65b8664a5d62cc87c4dd4e85381f0f3',
  };
  run(): void {
    const metadata = JSON.parse(readFileSync('package.json', 'utf8'));
    const installed = JSON.parse(
      readFileSync('node_modules/@treeseed-cordis/sdk/package.json', 'utf8'),
    );
    const digest = createHash('sha256').update(readFileSync('vendor/sdk.tgz')).digest('hex');
    const expected = UiSdkClosureAcceptance.expected;
    assert.equal(metadata.peerDependencies['@treeseed-cordis/sdk'], expected.version);
    assert.equal(installed.version, expected.version);
    assert.equal(metadata.cordisCandidate.sdk.commit, expected.commit);
    assert.equal(metadata.cordisCandidate.sdk.sha256, expected.sha256);
    assert.equal(digest, expected.sha256);
  }
}
const suite = new UiSdkClosureAcceptance();
test(
  'acceptance: UI declared installed and archived SDK identities agree with the manager closure',
  suite.run.bind(suite),
);
