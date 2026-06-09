import { useEffect, useState } from 'react';
import { CheckboxField, SelectField, TextField } from '../../../../src/react';

type ReactFormControlHarnessProps = {
  componentId: 'checkbox-field' | 'select-field' | 'text-field';
  componentName: string;
  intendedSize: 'inline' | 'small' | 'medium' | 'large' | 'full-page';
};

const environmentOptions = [
  { label: 'Production', value: 'production' },
  { label: 'Staging', value: 'staging' },
  { label: 'Development', value: 'development' },
];

export default function ReactFormControlHarness({
  componentId,
  componentName,
  intendedSize,
}: ReactFormControlHarnessProps) {
  const [textValue, setTextValue] = useState('Monitoring Console');
  const [selectValue, setSelectValue] = useState('production');
  const [checked, setChecked] = useState(true);
  const [submitted, setSubmitted] = useState<unknown>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const state =
    componentId === 'text-field'
      ? { react_project: textValue }
      : componentId === 'select-field'
        ? { react_environment: selectValue }
        : { react_enabled: checked };

  return (
    <form
      className="catalog-form-harness"
      data-hydrated={hydrated ? 'true' : 'false'}
      data-testid="react-form-control"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setSubmitted({
          ...Object.fromEntries(formData.entries()),
          ...(componentId === 'checkbox-field' ? { react_enabled: formData.has('react_enabled') } : {}),
        });
      }}
    >
      <section className={`catalog-preview catalog-preview--${intendedSize}`} aria-label={`${componentName} preview`}>
        <span className="catalog-preview__label">Component frame</span>
        <div className="catalog-preview__stage">
          {componentId === 'text-field' ? (
            <>
              <TextField
                id="react-project"
                name="react_project"
                label="Project"
                value={textValue}
                onChange={setTextValue}
                placeholder="Project name"
              />
              <button className="ts-button" data-variant="primary" type="submit">Submit text field</button>
            </>
          ) : null}
          {componentId === 'select-field' ? (
            <>
              <SelectField
                id="react-environment"
                name="react_environment"
                label="Environment"
                value={selectValue}
                options={environmentOptions}
                onChange={setSelectValue}
              />
              <button className="ts-button" data-variant="primary" type="submit">Submit select field</button>
            </>
          ) : null}
          {componentId === 'checkbox-field' ? (
            <>
              <CheckboxField
                id="react-enabled"
                name="react_enabled"
                label="Enable realtime monitoring"
                checked={checked}
                onChange={setChecked}
              />
              <button className="ts-button" data-variant="primary" type="submit">Submit checkbox field</button>
            </>
          ) : null}
        </div>
      </section>
      <div className="catalog-info-grid">
        <section className="catalog-debug" aria-label="Current State">
          <h2>Current State</h2>
          <pre>{JSON.stringify(state, null, 2)}</pre>
        </section>
        <section className="catalog-debug" aria-label="Submission">
          <h2>Submission</h2>
          <pre>{JSON.stringify(submitted, null, 2)}</pre>
        </section>
      </div>
    </form>
  );
}
