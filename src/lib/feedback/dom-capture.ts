import {
	captureDocumentBounds,
	freezeCaptureLayout,
	materializeActiveOverlays,
	snapshotActiveOverlays,
} from './capture-overlays.ts';

export interface DomCaptureResult {
	dataUrl: string;
	mimeType: 'image/png';
	byteSize: number;
	width: number;
	height: number;
	digest: string;
	redactionVersion: 'treeseed.feedback-capture/v3';
	maskedRegionCount: number;
	redacted: true;
}

export { captureDocumentBounds } from './capture-overlays.ts';

const MAX_CAPTURE_DIMENSION = 10_000;
const MAX_CAPTURE_BYTES = 8 * 1024 * 1024;
const freeformControlTypes = new Set(['email', 'file', 'password', 'search', 'tel', 'text', 'url']);

function privacyMask() {
	const mask = document.createElement('span');
	mask.textContent = '[private content redacted]';
	mask.setAttribute('data-ts-feedback-redacted', 'true');
	mask.style.cssText = 'background:#1f2937;color:#fff;display:inline-block;min-height:1.2em;min-width:7rem;padding:.1em .35em';
	return mask;
}

function maskControlValue(node: Element) {
	if (node instanceof HTMLInputElement) {
		if (!freeformControlTypes.has(node.type) || !node.value) return false;
		if (node.type === 'file') node.value = '';
		else {
			node.value = '••••••••';
			node.setAttribute('value', '••••••••');
		}
		return true;
	}
	if (node instanceof HTMLTextAreaElement && node.value) {
		node.value = '••••••••';
		node.textContent = '••••••••';
		return true;
	}
	if (node instanceof HTMLElement && node.hasAttribute('contenteditable') && node.textContent?.trim()) {
		node.textContent = '[private content redacted]';
		return true;
	}
	return false;
}

export function maskSensitiveClone(root: ParentNode) {
	let count = 0;
	for (const boundary of root.querySelectorAll('[data-ts-feedback-redact]')) {
		if (!(boundary instanceof HTMLElement) || boundary.parentElement?.closest('[data-ts-feedback-redact]')) continue;
		boundary.replaceChildren(privacyMask());
		count += 1;
	}
	for (const node of root.querySelectorAll('input, textarea, [contenteditable]')) {
		if (node.closest('[data-ts-feedback-redact]')) continue;
		if (maskControlValue(node)) count += 1;
	}
	return count;
}

function unavailableContent(label: string) {
	const replacement = document.createElement('span');
	replacement.textContent = `[${label} unavailable in capture]`;
	replacement.setAttribute('data-ts-feedback-unavailable', 'true');
	replacement.style.cssText = 'background:#e5e7eb;color:#374151;display:inline-block;min-height:2rem;min-width:7rem;padding:.35em';
	return replacement;
}

function replaceUnsupportedContent(root: ParentNode) {
	for (const node of root.querySelectorAll('iframe, embed, object, video')) node.replaceWith(unavailableContent(node.localName));
}

function safeCssText() {
	const rules: string[] = [];
	for (const sheet of document.styleSheets) {
		try {
			for (const rule of sheet.cssRules) {
				if (rule.type !== CSSRule.FONT_FACE_RULE) rules.push(rule.cssText.replace(/url\([^)]*\)/giu, 'none'));
			}
		} catch { /* Cross-origin styles are excluded from private captures. */ }
	}
	return rules.join('\n');
}

async function imageDataUrl(source: string) {
	const response = await fetch(source, { credentials: 'same-origin' });
	if (!response.ok) throw new Error('Image unavailable.');
	const blob = await response.blob();
	return await new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Image could not be encoded.'));
		reader.onerror = () => reject(reader.error ?? new Error('Image could not be encoded.'));
		reader.readAsDataURL(blob);
	});
}

async function inlineSafeResources(clone: HTMLElement) {
	for (const node of clone.querySelectorAll('script, noscript, link[rel~="stylesheet"], link[rel="preload"], link[rel="modulepreload"]')) node.remove();
	for (const node of clone.querySelectorAll<HTMLElement>('[style*="url("]')) node.style.cssText = node.style.cssText.replace(/url\([^)]*\)/giu, 'none');
	const style = document.createElement('style');
	style.textContent = safeCssText();
	clone.querySelector('head')?.append(style);
	for (const image of clone.querySelectorAll<HTMLImageElement>('img')) {
		image.removeAttribute('srcset');
		const source = image.getAttribute('src') ?? '';
		if (!source || source.startsWith('data:')) continue;
		try {
			const resolved = new URL(source, location.href);
			if (resolved.origin !== location.origin) throw new Error('Cross-origin image.');
			image.src = await imageDataUrl(resolved.href);
		} catch {
			image.replaceWith(unavailableContent('external image'));
		}
	}
}

function encodedBytes(dataUrl: string) {
	return Math.ceil((dataUrl.length - 'data:image/png;base64,'.length) * 0.75);
}

function renderPng(image: HTMLImageElement, cssWidth: number, cssHeight: number, initialScale: number) {
	let scale = initialScale;
	for (let attempt = 0; attempt < 4; attempt += 1) {
		const canvas = document.createElement('canvas');
		canvas.width = Math.max(1, Math.floor(cssWidth * scale));
		canvas.height = Math.max(1, Math.floor(cssHeight * scale));
		const context = canvas.getContext('2d');
		if (!context) throw new Error('Canvas capture is unavailable.');
		context.fillStyle = getComputedStyle(document.body).backgroundColor || '#ffffff';
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.drawImage(image, 0, 0, canvas.width, canvas.height);
		const dataUrl = canvas.toDataURL('image/png');
		const byteSize = encodedBytes(dataUrl);
		if (byteSize <= MAX_CAPTURE_BYTES || attempt === 3) return { canvas, dataUrl, byteSize };
		scale *= Math.max(0.35, Math.sqrt(MAX_CAPTURE_BYTES / byteSize) * 0.9);
	}
	throw new Error('Screenshot could not be encoded.');
}

export async function captureRedactedDomScreenshot(): Promise<DomCaptureResult> {
	const bounds = captureDocumentBounds();
	const docked = Boolean(document.querySelector('[data-ts-feedback-panel][data-ts-feedback-presentation="docked"]:not([hidden])'));
	const activeOverlays = snapshotActiveOverlays();
	let clone: HTMLElement;
	try {
		clone = document.documentElement.cloneNode(true) as HTMLElement;
	} finally {
		activeOverlays.clear();
	}
	for (const panel of clone.querySelectorAll('[data-ts-feedback-panel]')) panel.remove();
	freezeCaptureLayout(clone, bounds, docked);
	materializeActiveOverlays(clone, activeOverlays.snapshots, bounds);
	const maskedRegionCount = maskSensitiveClone(clone);
	replaceUnsupportedContent(clone);
	clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
	clone.style.width = `${bounds.width}px`;
	clone.style.minHeight = `${bounds.height}px`;
	await inlineSafeResources(clone);
	const html = new XMLSerializer().serializeToString(clone);
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}"><foreignObject width="100%" height="100%">${html}</foreignObject></svg>`;
	const image = new Image();
	image.decoding = 'async';
	const loaded = new Promise<void>((resolve, reject) => {
		image.onload = () => resolve();
		image.onerror = () => reject(new Error('Screenshot capture failed.'));
	});
	image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
	await loaded;
	const scale = Math.min(window.devicePixelRatio || 1, 2, MAX_CAPTURE_DIMENSION / bounds.width, MAX_CAPTURE_DIMENSION / bounds.height);
	const { canvas, dataUrl, byteSize } = renderPng(image, bounds.width, bounds.height, scale);
	const bytes = Uint8Array.from(atob(dataUrl.split(',')[1] ?? ''), (character) => character.charCodeAt(0));
	const digestBytes = await crypto.subtle.digest('SHA-256', bytes);
	const digest = [...new Uint8Array(digestBytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
	return { dataUrl, mimeType: 'image/png', byteSize, width: canvas.width, height: canvas.height, digest, redactionVersion: 'treeseed.feedback-capture/v3', maskedRegionCount, redacted: true };
}
