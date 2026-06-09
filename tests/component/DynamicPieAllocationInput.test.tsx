import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DynamicPieAllocationInput, { type PieAllocationSlice } from '../../src/react/pie-allocation/DynamicPieAllocationInput.tsx';

const sample: PieAllocationSlice[] = [
  { id: 'planning', name: 'Planning', percentage: 30 },
  { id: 'acting', name: 'Acting', percentage: 60 },
  { id: 'optimization', name: 'Optimization', percentage: 10 },
];

function renderInput(props = {}) {
  return render(<DynamicPieAllocationInput initialValue={sample} name="capacity_allocation" {...props} />);
}

describe('DynamicPieAllocationInput', () => {
  it('renders initial slices and hidden input', () => {
    renderInput();
    expect(screen.getByText('Planning')).toBeInTheDocument();
    expect(JSON.parse((screen.getByTestId('allocation-hidden-input') as HTMLInputElement).value)).toEqual(sample);
  });

  it('numeric edit updates hidden input JSON', async () => {
    const user = userEvent.setup();
    renderInput();
    await user.clear(screen.getByTestId('slice-input-planning'));
    await user.type(screen.getByTestId('slice-input-planning'), '40');
    const parsed = JSON.parse((screen.getByTestId('allocation-hidden-input') as HTMLInputElement).value) as PieAllocationSlice[];
    expect(parsed[0].percentage).toBe(40);
  });

  it('supports disabled and change callback states', async () => {
    const onChange = vi.fn();
    renderInput({ disabled: true, onChange });
    expect(screen.getByTestId('slice-input-planning')).toBeDisabled();
    expect(onChange).toHaveBeenCalled();
  });
});
