import { createHash } from 'node:crypto';
import { readFileSync, readlinkSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TREESEED_LOGO_ASSET } from '../../../src/site-brand';

const canonicalPath = 'src/assets/treeseed-logo.svg';
const canonicalDigest = '1480d7abbb4c7e330e0df41cc1ce5b4115a3cdcff4e7837a7869782739125a47';

describe('canonical TreeSeed brand assets', () => {
	it('owns the genuine TreeSeed logo and publishes one stable package path', () => {
		const logo = readFileSync(canonicalPath);
		expect(createHash('sha256').update(logo).digest('hex')).toBe(canonicalDigest);
		expect(logo.toString('utf8')).toContain('viewBox="0 0 1000 1000"');
		expect(TREESEED_LOGO_ASSET).toBe('@treeseed/ui/assets/treeseed-logo.svg');
	});

	it('makes the sandbox consume the canonical source rather than a copy', () => {
		expect(readlinkSync('sandbox/public/logo.svg')).toBe('../../src/assets/treeseed-logo.svg');
	});
});
