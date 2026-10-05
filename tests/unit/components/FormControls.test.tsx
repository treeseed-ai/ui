import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CheckboxField, SelectField, TextField } from '../../../src/react.ts';

describe('React form controls', () => {
  it('renders and updates TextField input values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextField id="project" name="project" label="Project" onChange={onChange} placeholder="Project name" />);

    await user.type(screen.getByLabelText('Project'), 'Launch');

    expect(onChange).toHaveBeenLastCalledWith('Launch');
    expect(screen.getByPlaceholderText('Project name')).toBeInTheDocument();
    expect(screen.getByLabelText('Project')).toHaveAttribute('name', 'project');
  });

  it('renders TextField textarea mode and error text', () => {
    const { container } = render(<TextField id="notes" label="Notes" multiline error="Notes are required." />);
    const notes = container.querySelector<HTMLTextAreaElement>('#notes');

    expect(notes?.tagName).toBe('TEXTAREA');
    expect(screen.getByText('Notes are required.')).toBeInTheDocument();
    expect(notes).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders and updates SelectField values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SelectField
        id="environment"
        name="environment"
        label="Environment"
        defaultValue="production"
        onChange={onChange}
        options={[
          { label: 'Production', value: 'production' },
          { label: 'Staging', value: 'staging' },
        ]}
      />,
    );

    await user.selectOptions(screen.getByLabelText('Environment'), 'staging');

    expect(onChange).toHaveBeenCalledWith('staging');
    expect(screen.getByLabelText('Environment')).toHaveAttribute('name', 'environment');
  });

  it('renders and updates CheckboxField checked state', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CheckboxField id="enabled" name="enabled" label="Enabled" onChange={onChange} />);

    await user.click(screen.getByLabelText('Enabled'));

    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByLabelText('Enabled')).toHaveAttribute('name', 'enabled');
  });
});
