export interface DomCaptureResult {
	dataUrl: string;
	type: 'image/png';
	size: number;
	redacted: boolean;
}

function maskRedactedClone(root: ParentNode) {
	for (const node of root.querySelectorAll('[data-ts-feedback-redact], input, textarea, select')) {
		if (!(node instanceof HTMLElement)) continue;
		const mask = document.createElement('span');
		mask.textContent = '[redacted]';
		mask.setAttribute('data-ts-feedback-redacted', 'true');
		mask.style.background = '#1f2937';
		mask.style.borderRadius = '4px';
		mask.style.color = '#ffffff';
		mask.style.display = 'inline-block';
		mask.style.minHeight = '1.2em';
		mask.style.minWidth = '5.5em';
		mask.style.padding = '0.1em 0.35em';
		node.replaceWith(mask);
	}
}

export async function captureRedactedDomScreenshot(): Promise<DomCaptureResult> {
	const width = Math.max(320, Math.min(window.innerWidth, 1440));
	const height = Math.max(240, Math.min(window.innerHeight, 1200));
	const clone = document.documentElement.cloneNode(true) as HTMLElement;
	maskRedactedClone(clone);
	for (const dialog of clone.querySelectorAll('[data-ts-feedback-dialog]')) dialog.remove();
	const html = new XMLSerializer().serializeToString(clone);
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${html}</foreignObject></svg>`;
	const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	try {
		const image = new Image();
		image.decoding = 'async';
		const loaded = new Promise<void>((resolve, reject) => {
			image.onload = () => resolve();
			image.onerror = () => reject(new Error('Screenshot capture failed.'));
		});
		image.src = url;
		await loaded;
		const canvas = document.createElement('canvas');
		const ratio = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.round(width * ratio);
		canvas.height = Math.round(height * ratio);
		const context = canvas.getContext('2d');
		if (!context) throw new Error('Canvas capture is unavailable.');
		context.scale(ratio, ratio);
		context.fillStyle = getComputedStyle(document.body).backgroundColor || '#ffffff';
		context.fillRect(0, 0, width, height);
		context.drawImage(image, 0, 0, width, height);
		const dataUrl = canvas.toDataURL('image/png');
		const payloadSize = Math.ceil((dataUrl.length - 'data:image/png;base64,'.length) * 0.75);
		return { dataUrl, type: 'image/png', size: payloadSize, redacted: true };
	} finally {
		URL.revokeObjectURL(url);
	}
}
