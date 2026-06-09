import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
	BlockTypeSelect,
	BoldItalicUnderlineToggles,
	ChangeCodeMirrorLanguage,
	codeBlockPlugin,
	codeMirrorPlugin,
	CodeToggle,
	ConditionalContents,
	CreateLink,
	diffSourcePlugin,
	DiffSourceToggleWrapper,
	GenericJsxEditor,
	headingsPlugin,
	imagePlugin,
	InsertCodeBlock,
	InsertImage,
	InsertTable,
	InsertThematicBreak,
	jsxPlugin,
	linkDialogPlugin,
	linkPlugin,
	listsPlugin,
	ListsToggle,
	markdownShortcutPlugin,
	MDXEditor,
	quotePlugin,
	Separator,
	tablePlugin,
	thematicBreakPlugin,
	toolbarPlugin,
	UndoRedo,
} from '@mdxeditor/editor';
import type { JsxComponentDescriptor } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

type RichMarkdownEditorRoot = HTMLElement & {
	dataset: DOMStringMap & {
		richMarkdownInitializing?: string;
		richMarkdownReady?: string;
	};
};

const codeBlockLanguages = {
	bash: 'Bash',
	css: 'CSS',
	html: 'HTML',
	js: 'JavaScript',
	json: 'JSON',
	jsx: 'JavaScript React',
	md: 'Markdown',
	mdx: 'MDX',
	ts: 'TypeScript',
	tsx: 'TypeScript React',
	yaml: 'YAML',
};

const jsxComponentDescriptors: JsxComponentDescriptor[] = [
	{ name: '*', kind: 'flow', props: [], hasChildren: true, Editor: GenericJsxEditor },
	{ name: '*', kind: 'text', props: [], hasChildren: true, Editor: GenericJsxEditor },
	{ name: null, kind: 'flow', props: [], hasChildren: true, Editor: GenericJsxEditor },
];

type MdxEditorSurfaceProps = {
	initialMarkdown: string;
	onChange: (markdown: string) => void;
	onReady?: () => void;
};

function MdxEditorSurface(props: MdxEditorSurfaceProps) {
	const { initialMarkdown, onChange, onReady } = props;
	useEffect(() => {
		onReady?.();
	}, [onReady]);
	return (
		<MDXEditor
			className="ts-rich-markdown-mdx"
			contentEditableClassName="ts-rich-markdown-mdx__content"
			markdown={initialMarkdown}
			onChange={onChange}
			plugins={[
				headingsPlugin(),
				listsPlugin(),
				quotePlugin(),
				thematicBreakPlugin(),
				tablePlugin(),
				linkPlugin(),
				linkDialogPlugin(),
				imagePlugin({
					allowSetImageDimensions: true,
					imageAutocompleteSuggestions: [
						'https://placehold.co/1200x630',
					],
				}),
				jsxPlugin({
					jsxComponentDescriptors: [...jsxComponentDescriptors],
					allowFragment: true,
				}),
				codeBlockPlugin({ defaultCodeBlockLanguage: 'mdx' }),
				codeMirrorPlugin({
					codeBlockLanguages,
					autoLoadLanguageSupport: true,
				}),
				diffSourcePlugin({
					diffMarkdown: initialMarkdown,
					viewMode: 'rich-text',
				}),
				markdownShortcutPlugin(),
				toolbarPlugin({
					toolbarClassName: 'ts-rich-markdown-mdx__toolbar',
					toolbarContents: () => (
						<DiffSourceToggleWrapper SourceToolbar={<UndoRedo />}>
							<ConditionalContents
								options={[
									{
										when: (editor) => editor?.editorType === 'codeblock',
										contents: () => (
											<>
												<UndoRedo />
												<Separator />
												<ChangeCodeMirrorLanguage />
												<Separator />
												<InsertCodeBlock />
											</>
										),
									},
									{
										fallback: () => (
											<>
												<UndoRedo />
												<Separator />
												<BlockTypeSelect />
												<BoldItalicUnderlineToggles />
												<CodeToggle />
												<ListsToggle />
												<Separator />
												<CreateLink />
												<InsertImage />
												<InsertTable />
												<InsertThematicBreak />
												<Separator />
												<InsertCodeBlock />
											</>
										),
									},
								]}
							/>
						</DiffSourceToggleWrapper>
					),
				}),
			]}
		/>
	);
}

export type RichMarkdownEditorProps = {
	label?: string;
	name?: string;
	initialMarkdown?: string;
	required?: boolean;
	errorLabel?: string;
	onChange?: (markdown: string) => void;
};

export default function RichMarkdownEditor({
	label = 'Rich markdown',
	name = 'richMarkdown',
	initialMarkdown = '',
	required = false,
	errorLabel = 'Rich markdown is required.',
	onChange,
}: RichMarkdownEditorProps) {
	const [markdown, setMarkdown] = useState(initialMarkdown);
	const [invalid, setInvalid] = useState(false);

	const handleChange = (nextMarkdown: string) => {
		setMarkdown(nextMarkdown);
		setInvalid(false);
		onChange?.(nextMarkdown);
	};

	return (
		<div className="ts-rich-markdown-field">
			<label className="ts-field__label" htmlFor={`${name}-input`}>
				<span>{label}</span>
				{required ? <span className="ts-field__required" aria-hidden="true">*</span> : null}
			</label>
			<div className="ts-rich-markdown-editor" data-invalid={invalid ? 'true' : undefined}>
				<textarea
					className="ts-rich-markdown-editor__textarea"
					id={`${name}-input`}
					name={name}
					onChange={(event) => handleChange(event.currentTarget.value)}
					required={required}
					value={markdown}
				/>
				<div className="ts-rich-markdown-editor__mount">
					<MdxEditorSurface
						initialMarkdown={initialMarkdown}
						onChange={handleChange}
					/>
				</div>
				{invalid ? <p className="ts-markdown-field__error">{errorLabel}</p> : null}
			</div>
		</div>
	);
}

function initializeRichMarkdownEditor(root: RichMarkdownEditorRoot) {
	if (root.dataset.richMarkdownReady === 'true' || root.dataset.richMarkdownInitializing === 'true') return;
	const textarea = root.querySelector<HTMLTextAreaElement>('[data-rich-markdown-input]');
	const mount = root.querySelector<HTMLElement>('[data-rich-markdown-mount]');
	const error = root.querySelector<HTMLElement>('[data-rich-markdown-error]');
	if (!textarea || !mount) return;
	root.dataset.richMarkdownInitializing = 'true';
	const reactRoot = createRoot(mount);
	reactRoot.render(
		<MdxEditorSurface
			initialMarkdown={textarea.value}
			onReady={() => {
				root.dataset.richMarkdownReady = 'true';
				delete root.dataset.richMarkdownInitializing;
			}}
			onChange={(markdown) => {
				textarea.value = markdown;
				root.dataset.invalid = 'false';
				if (error) error.hidden = true;
			}}
		/>,
	);
	textarea.form?.addEventListener('submit', (event) => {
		if (textarea.value.trim()) return;
		event.preventDefault();
		root.dataset.invalid = 'true';
		if (error) error.hidden = false;
		mount.querySelector<HTMLElement>('[contenteditable="true"]')?.focus();
	});
}

export function initializeRichMarkdownEditors() {
	document
		.querySelectorAll<RichMarkdownEditorRoot>('[data-rich-markdown-editor]')
		.forEach((root) => initializeRichMarkdownEditor(root));
}

if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initializeRichMarkdownEditors, { once: true });
	} else {
		initializeRichMarkdownEditors();
	}
	document.addEventListener('astro:page-load', initializeRichMarkdownEditors);
}
