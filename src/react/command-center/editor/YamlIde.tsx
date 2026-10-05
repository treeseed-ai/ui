import { StreamLanguage } from '@codemirror/language';
import { EditorView,basicSetup } from 'codemirror';
import { useEffect,useRef } from 'react';

export interface YamlIdeDiagnostic { line?: number; column?: number; message: string; severity?: 'error' | 'warning' }

const yaml = StreamLanguage.define<{ block: number }>({
	startState: () => ({ block: 0 }),
	token(stream) {
		if (stream.sol()) stream.eatSpace();
		if (stream.peek() === '#') { stream.skipToEnd(); return 'comment'; }
		if (stream.match(/^---|^\.\.\./u)) return 'meta';
		if (stream.match(/^(?:true|false|null|yes|no)(?=\s|$)/u)) return 'bool';
		if (stream.match(/^-?(?:\d+\.?\d*|\.\d+)(?=\s|$)/u)) return 'number';
		if (stream.match(/^"(?:[^"\\]|\\.)*"|^'(?:[^']|'')*'/u)) return 'string';
		if (stream.match(/^[A-Za-z0-9_.-]+(?=\s*:)/u)) return 'propertyName';
		if (stream.match(/^[\[\]{},:&*!|>@`%-]/u)) return 'punctuation';
		stream.next(); return null;
	},
});

export function YamlIde({ value,onChange,label,diagnostics = [],readOnly = false }: { value: string; onChange: (value: string) => void; label: string; diagnostics?: YamlIdeDiagnostic[]; readOnly?: boolean }) {
	const host = useRef<HTMLDivElement>(null); const textarea = useRef<HTMLTextAreaElement>(null); const callback = useRef(onChange); const editor = useRef<EditorView | null>(null);
	callback.current = onChange;
	useEffect(() => {
		if (!host.current) return;
		try {
			editor.current = new EditorView({ parent: host.current, doc: value, extensions: [basicSetup,yaml,EditorView.lineWrapping,EditorView.editable.of(!readOnly),EditorView.contentAttributes.of({ 'aria-label': label }),EditorView.updateListener.of((update) => { if (update.docChanged) callback.current(update.state.doc.toString()); })] });
			return () => { editor.current?.destroy(); editor.current = null; };
		} catch { host.current.hidden = true; if (textarea.current) textarea.current.hidden = false; }
	}, [label,readOnly]);
	useEffect(() => { const view = editor.current; if (!view || view.state.doc.toString() === value) return; view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } }); }, [value]);
	return <div className="ts-yaml-ide" data-readonly={readOnly ? 'true' : 'false'}><div ref={host} className="ts-yaml-ide__editor" /><textarea ref={textarea} hidden spellCheck={false} aria-label={`${label} fallback`} value={value} readOnly={readOnly} onChange={(event) => onChange(event.target.value)} />{diagnostics.length ? <ol className="ts-yaml-ide__diagnostics" aria-label="Source diagnostics">{diagnostics.map((diagnostic,index) => <li key={`${diagnostic.line}:${diagnostic.column}:${index}`} data-severity={diagnostic.severity ?? 'error'}><span>{diagnostic.line ? `Line ${diagnostic.line}${diagnostic.column ? `:${diagnostic.column}` : ''}` : 'Definition'}</span>{diagnostic.message}</li>)}</ol> : null}</div>;
}
