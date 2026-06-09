import { useState } from 'react';
import DynamicPieAllocationInput, {
  type PieAllocationSlice,
  type PieAllocationValidity,
} from '../../../../src/react/pie-allocation/DynamicPieAllocationInput';

const initialAllocation: PieAllocationSlice[] = [
  { id: 'planning', name: 'Planning', percentage: 30 },
  { id: 'acting', name: 'Acting', percentage: 60 },
  { id: 'optimization', name: 'Optimization', percentage: 10 },
];

export default function DynamicPieAllocationHarness() {
  const [allocation, setAllocation] = useState(initialAllocation);
  const [validity, setValidity] = useState<PieAllocationValidity>({
    valid: true,
    total: 100,
    errors: [],
  });
  const [submitted, setSubmitted] = useState<unknown>(null);

  return (
    <form
      className="catalog-form-harness"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setSubmitted({
          capacity_allocation: formData.get('capacity_allocation'),
          parsed: allocation,
          validity,
        });
      }}
    >
      <section className="catalog-preview catalog-preview--large" aria-label="DynamicPieAllocationInput preview">
        <span className="catalog-preview__label">Component frame</span>
        <div className="catalog-preview__stage">
          <DynamicPieAllocationInput
            name="capacity_allocation"
            initialValue={initialAllocation}
            onChange={(next, nextValidity) => {
              setAllocation(next);
              setValidity(nextValidity);
            }}
          />
          <button className="ts-button" data-variant="primary" type="submit">Submit allocation</button>
        </div>
      </section>
      <div className="catalog-info-grid">
        <section className="catalog-debug" aria-label="Current State">
          <h2>Current State</h2>
          <pre>{JSON.stringify({ allocation, validity }, null, 2)}</pre>
        </section>
        <section className="catalog-debug" aria-label="Submission">
          <h2>Submission</h2>
          <pre>{JSON.stringify(submitted, null, 2)}</pre>
        </section>
      </div>
    </form>
  );
}
