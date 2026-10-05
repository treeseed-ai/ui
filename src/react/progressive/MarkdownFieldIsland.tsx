import { useEffect } from 'react';
import { initializeMarkdownFields } from '../../lib/app/markdown-field.ts';

export interface MarkdownFieldIslandProps { rootId: string; }

export function MarkdownFieldIsland({ rootId }: MarkdownFieldIslandProps) {
	useEffect(() => {
		const root = document.getElementById(rootId);
		if (root) initializeMarkdownFields(root);
	}, [rootId]);
	return null;
}
