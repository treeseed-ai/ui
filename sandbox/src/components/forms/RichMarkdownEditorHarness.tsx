import { useState } from 'react';
import RichMarkdownEditor from '../../../../src/react/editors/RichMarkdownEditor';

const initialMarkdown = `# Build a resilient launch loop

Define an objective that includes:

- capacity checks
- deployment guardrails
- knowledge capture

Use **MDX** when richer structure is needed.`;

export default function RichMarkdownEditorHarness() {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [submitted, setSubmitted] = useState<unknown>(null);

  return (
    <form
      className="catalog-form-harness"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setSubmitted({
          rich_markdown: formData.get('rich_markdown'),
        });
      }}
    >
      <section className="catalog-preview catalog-preview--large" aria-label="RichMarkdownEditor preview">
        <span className="catalog-preview__label">Component frame</span>
        <div className="catalog-preview__stage">
          <RichMarkdownEditor
            label="Rich markdown"
            name="rich_markdown"
            required
            initialMarkdown={initialMarkdown}
            onChange={setMarkdown}
          />
          <button className="ts-button" data-variant="primary" type="submit">Submit markdown</button>
        </div>
      </section>
      <div className="catalog-info-grid">
        <section className="catalog-debug" aria-label="Current State">
          <h2>Current State</h2>
          <pre>{JSON.stringify({ markdown }, null, 2)}</pre>
        </section>
        <section className="catalog-debug" aria-label="Submission">
          <h2>Submission</h2>
          <pre>{JSON.stringify(submitted, null, 2)}</pre>
        </section>
      </div>
    </form>
  );
}
