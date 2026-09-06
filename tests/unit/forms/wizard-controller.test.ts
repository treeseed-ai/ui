import {afterEach, describe, expect, it, vi} from 'vitest';
import {mountWizard, type WizardStep} from '../../../src/lib/forms/wizard/controller';

afterEach(() => { document.body.replaceChildren(); });
function setup() {
  document.body.innerHTML = `<main><button data-step-target="0"></button><button data-step-target="1"></button><button data-step-target="2"></button>
    <section><h2>One</h2><input value="draft"></section><section><h2>Two</h2></section><section><h2>Three</h2></section>
    <p data-wizard-error hidden></p><p data-wizard-status></p><button data-wizard-back></button><button data-wizard-next></button></main>`;
  const root = document.querySelector('main')!;
  const steps: WizardStep[] = [...root.querySelectorAll('section')].map((panel, i) => ({id: String(i), label: `Step ${i}`, panel}));
  return {root, steps};
}
describe('shared wizard controller', () => {
  it('renders required and custom errors next to fields, focusing and clearing on edit',async()=>{
    const {root,steps}=setup();
    steps[0].panel.innerHTML='<h2>Details</h2><div data-ts-field><input name="address" required></div>';
    const input=steps[0].panel.querySelector('input')!;
    steps[0].validate=()=>({fieldErrors:{address:'HTTPS required.'}});
    const wizard=mountWizard(root,steps);await wizard.go(1);
    expect(input).toHaveAttribute('aria-invalid','true');expect(document.activeElement).toBe(input);
    expect(steps[0].panel.querySelector('[data-ts-field-error]')).toHaveTextContent('This field is required.');
    input.value='http://example.com';input.dispatchEvent(new Event('input',{bubbles:true}));
    expect(input).not.toHaveAttribute('aria-invalid');await wizard.go(1);
    expect(steps[0].panel.querySelector('[data-ts-field-error]')).toHaveTextContent('HTTPS required.');
    expect(root.querySelector('[data-wizard-error]')).not.toHaveTextContent('HTTPS required.');
  });
  it('ignores required controls inside a disabled conditional fieldset', async () => {
    const {root,steps}=setup();
    steps[0].panel.innerHTML='<h2>Storage</h2><fieldset disabled><input required></fieldset>';
    const wizard=mountWizard(root,steps); await wizard.go(1);
    expect(wizard.current).toBe(1);
  });
  it('opens independent management steps without saving or validating other drafts', async () => {
    const {root, steps} = setup();
    steps[0].validate = vi.fn(() => 'Not ready'); steps[0].save = vi.fn(() => true);
    steps[2].independent = true;
    const wizard = mountWizard(root, steps); await wizard.go(2);
    expect(wizard.current).toBe(2);
    expect(steps[0].validate).not.toHaveBeenCalled(); expect(steps[0].save).not.toHaveBeenCalled();
    expect(root.querySelector('input')).toHaveValue('draft');
  });
  it('validates skipped steps, preserves drafts, focuses and announces the active step', async () => {
    const {root, steps} = setup(); steps[1].validate = () => 'Not ready';
    const wizard = mountWizard(root, steps);
    await wizard.go(2);
    expect(wizard.current).toBe(1);
    expect(root.querySelector('[data-wizard-error]')).toHaveTextContent('Not ready');
    expect(document.activeElement).toBe(steps[1].panel.querySelector('h2'));
    expect(root.querySelector('[data-wizard-status]')).toHaveTextContent('Step 2 of 3');
    await wizard.go(0);
    expect(root.querySelector('input')).toHaveValue('draft');
    expect(steps.filter(step => !step.panel.hidden)).toHaveLength(1);
  });
  it('prevents duplicate saves and navigation while waiting for a save boundary', async () => {
    const {root, steps} = setup();
    let resolve!: (value: boolean) => void;
    steps[0].save = vi.fn(() => new Promise<boolean>(done => { resolve = done; }));
    const wizard = mountWizard(root, steps);
    const pending = wizard.go(2);
    await wizard.go(1);
    expect(steps[0].save).toHaveBeenCalledTimes(1);
    expect(root.querySelector('[data-wizard-next]')).toBeDisabled();
    resolve(true); await pending;
    expect(wizard.current).toBe(2);
    expect(root).toHaveAttribute('aria-busy', 'false');
  });
  it('stays on failed saves without exposing exception content', async () => {
    const {root, steps} = setup();
    steps[0].save = () => { throw new Error('sensitive upstream payload'); };
    const wizard = mountWizard(root, steps); await wizard.go(1);
    expect(wizard.current).toBe(0);
    expect(root.textContent).not.toContain('sensitive upstream payload');
    expect(root.querySelector('[data-wizard-next]')).toBeEnabled();
  });
  it('rejects invalid targets and cannot advance after destruction during save', async () => {
    const {steps, root} = setup();
    let resolve!: (value: boolean) => void;
    steps[0].save = () => new Promise<boolean>(done => { resolve = done; });
    const wizard = mountWizard(root, steps);
    await wizard.go(-1); await wizard.go(3); expect(wizard.current).toBe(0);
    const pending = wizard.go(1); wizard.destroy(); resolve(true); await pending;
    expect(wizard.current).toBe(0);
  });
});
