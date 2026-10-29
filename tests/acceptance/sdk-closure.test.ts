import assert from 'node:assert/strict';
import { test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
class UiSdkClosureAcceptance {
  private static readonly expected = {
    version: '0.0.0-cordis.42',
    commit: 'afdfac7bdd3c9c1f783362cd1d50324181e1d725',
    sha256: '0ecfe599916fe8ef364fc4b73203c810981f163109fbe71a0dd4c01a9dfb7bbc',
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
