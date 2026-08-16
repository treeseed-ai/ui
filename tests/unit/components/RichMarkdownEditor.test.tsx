import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RichMarkdownEditor, { initializeRichMarkdownEditors } from '../../../src/react/editors/RichMarkdownEditor.tsx';

vi.mock('@mdxeditor/editor', async () => {
  const React = await import('react');
  const MockButton = ({ children }: { children?: React.ReactNode }) => <button type="button">{children}</button>;

  return {
    BlockTypeSelect: () => <select aria-label="Block type"><option>Paragraph</option></select>,
    BoldItalicUnderlineToggles: () => <MockButton>BIU</MockButton>,
    ChangeCodeMirrorLanguage: () => <select aria-label="Code language"><option>MDX</option></select>,
    CodeToggle: () => <MockButton>Code</MockButton>,
    ConditionalContents: ({ options }: { options: Array<{ fallback?: () => React.ReactNode; contents?: () => React.ReactNode }> }) => (
      <>{options.at(-1)?.fallback?.() ?? options[0]?.contents?.()}</>
    ),
    CreateLink: () => <MockButton>Link</MockButton>,
    DiffSourceToggleWrapper: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    GenericJsxEditor: () => null,
    InsertCodeBlock: () => <MockButton>Code block</MockButton>,
    InsertImage: () => <MockButton>Image</MockButton>,
    InsertTable: () => <MockButton>Table</MockButton>,
    InsertThematicBreak: () => <MockButton>Break</MockButton>,
    ListsToggle: () => <MockButton>List</MockButton>,
    MDXEditor: ({
      className,
      contentEditableClassName,
      markdown,
      onChange,
    }: {
      className?: string;
      contentEditableClassName?: string;
      markdown: string;
      onChange: (markdown: string) => void;
    }) => (
      <div className={className}>
        <textarea
          aria-label="MDX editor mock"
          className={contentEditableClassName}
          defaultValue={markdown}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      </div>
    ),
    Separator: () => <span aria-hidden="true">|</span>,
    UndoRedo: () => <MockButton>Undo redo</MockButton>,
    codeBlockPlugin: () => ({}),
    codeMirrorPlugin: () => ({}),
    diffSourcePlugin: () => ({}),
    headingsPlugin: () => ({}),
    imagePlugin: () => ({}),
    jsxPlugin: () => ({}),
    linkDialogPlugin: () => ({}),
    linkPlugin: () => ({}),
    listsPlugin: () => ({}),
    markdownShortcutPlugin: () => ({}),
    quotePlugin: () => ({}),
    tablePlugin: () => ({}),
    thematicBreakPlugin: () => ({}),
    toolbarPlugin: () => ({}),
  };
});

describe('RichMarkdownEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    history.replaceState({}, '', '/app/work');
  });

  it('renders a hidden form field and visible MDX editing surface', () => {
    const { container } = render(<RichMarkdownEditor label="Objective" name="objective" initialMarkdown="# Plan" required />);
    const backingField = container.querySelector<HTMLTextAreaElement>('textarea[name="objective"]');

    expect(screen.getByText('Objective')).toBeInTheDocument();
    expect(backingField).toHaveValue('# Plan');
    expect(backingField).toHaveAttribute('required');
    expect(screen.getByLabelText('MDX editor mock')).toHaveValue('# Plan');
  });

  it('updates the backing form field when the MDX surface changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<RichMarkdownEditor label="Objective" name="objective" initialMarkdown="# Plan" onChange={onChange} />);
    const backingField = container.querySelector<HTMLTextAreaElement>('textarea[name="objective"]');

    await user.clear(screen.getByLabelText('MDX editor mock'));
    await user.type(screen.getByLabelText('MDX editor mock'), 'Updated objective');

    expect(backingField).toHaveValue('Updated objective');
    expect(onChange).toHaveBeenLastCalledWith('Updated objective');
  });

  it('preserves the mounted draft when browser history leaves focused mode', async () => {
    const user = userEvent.setup();
    render(<main data-ts-workspace-content><RichMarkdownEditor label="Objective" name="objective" initialMarkdown="# Plan" /></main>);
    const editor = screen.getByLabelText('MDX editor mock');
    await user.clear(editor);
    await user.type(editor, 'Uncommitted objective');
    await user.click(screen.getByRole('button', { name: 'Expand Objective editor' }));
    expect(location.search).toContain('focus=rich-editor%3Aobjective');

    history.replaceState({}, '', '/app/work');
    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(screen.getByLabelText('MDX editor mock')).toBe(editor);
    expect(editor).toHaveValue('Uncommitted objective');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Expand Objective editor' })).toBeVisible());
  });

  it('exports an initializer for server-rendered editor shells', () => {
    expect(initializeRichMarkdownEditors).toBeTypeOf('function');
  });
});
