export function EvidenceDiffViewer({ base, current, baseLabel = 'Committed', currentLabel = 'Working copy' }: {
	base: string;
	current: string;
	baseLabel?: string;
	currentLabel?: string;
}) {
	return <div className="ts-evidence-diff-viewer" data-changed={base === current ? 'false' : 'true'}>
		<section><header>{baseLabel}</header><pre>{base}</pre></section>
		<section><header>{currentLabel}</header><pre>{current}</pre></section>
	</div>;
}
