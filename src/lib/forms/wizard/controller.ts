export interface WizardStep {
  id: string;
  label: string;
  panel: HTMLElement;
  nextLabel?: string;
  /** Separate management action; entering it must not save preceding drafts. */
  independent?: boolean;
  hideNext?: boolean;
  validate?: () => string | false | void;
  /** Return true only after the save boundary has completed successfully. */
  save?: () => Promise<boolean> | boolean;
}

/** Shared DOM controller. Draft fields stay mounted; persistence belongs to the caller. */
export function mountWizard(root: HTMLElement, steps: WizardStep[], initialStep = 0) {
  if (!steps.length || steps.some(step => !step.id.trim() || !step.label.trim()) || new Set(steps.map(step => step.id)).size !== steps.length)
    throw new Error('Wizard requires unique named steps.');
  if (!Number.isInteger(initialStep) || initialStep < 0 || initialStep >= steps.length)
    throw new Error('Invalid initial wizard step.');
  const abort = new AbortController();
  const signal = abort.signal;
  let current = initialStep;
  let busy = false;
  let navigating = false;
  const back = root.querySelector<HTMLButtonElement>('[data-wizard-back]');
  const next = root.querySelector<HTMLButtonElement>('[data-wizard-next]');
  const error = root.querySelector<HTMLElement>('[data-wizard-error]');
  const status = root.querySelector<HTMLElement>('[data-wizard-status]');
  const report = (message: string) => {
    if (error) { error.textContent = message; error.hidden = !message; }
  };
  const setBusy = (value: boolean) => {
    busy = value;
    root.setAttribute('aria-busy', String(value));
    root.querySelectorAll<HTMLButtonElement>('[data-step-target], [data-wizard-next], [data-wizard-back]')
      .forEach(button => { button.disabled = value; });
  };
  const show = (focus = true) => {
    steps.forEach((step, index) => { step.panel.hidden = index !== current; });
    root.querySelectorAll<HTMLElement>('[data-step-target]').forEach(button => {
      if (Number(button.dataset.stepTarget) === current) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    if (back) back.hidden = current === 0;
    if (next) { next.hidden = current === steps.length - 1 || Boolean(steps[current].hideNext); next.textContent = steps[current].nextLabel ?? 'Continue'; }
    if (status) status.textContent = `Step ${current + 1} of ${steps.length}: ${steps[current].label}`;
    report('');
    if (focus) {
      const heading = steps[current].panel.querySelector<HTMLElement>('h2, h3, [data-wizard-heading]');
      if (heading) { heading.tabIndex = -1; heading.focus(); }
    }
    root.dispatchEvent(new CustomEvent('treeseed:wizard-change', {bubbles: true, detail: {index: current, id: steps[current].id}}));
  };
  const go = async (target: number) => {
    if (signal.aborted || busy || navigating || !Number.isInteger(target) || target < 0 || target >= steps.length) return;
    navigating = true;
    try {
      if (target <= current || steps[target].independent) { current = target; show(); return; }
      while (current < target) {
        const step = steps[current];
        const validation = step.validate?.();
        if (validation === false || typeof validation === 'string') { report(validation || ''); return; }
        const invalid = [...step.panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea')]
          .find(field => !field.disabled && !field.checkValidity());
        if (invalid) { invalid.reportValidity(); return; }
        if (step.save) {
          setBusy(true);
          let saved = false;
          try { saved = await step.save(); } finally { setBusy(false); }
          if (!saved || signal.aborted) return;
        }
        current++; show();
      }
    } catch {
      // Exceptions may contain credentials or request payloads; never render raw errors.
      report('Could not complete this step. Please try again.');
    } finally { navigating = false; }
  };
  back?.addEventListener('click', () => { void go(current - 1); }, {signal});
  next?.addEventListener('click', () => { void go(current + 1); }, {signal});
  root.addEventListener('treeseed:step-request', event => { void go((event as CustomEvent).detail?.index); }, {signal});
  root.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.isComposing && event.target instanceof HTMLInputElement &&
      !['checkbox', 'radio', 'submit', 'button'].includes(event.target.type) && current < steps.length - 1) {
      event.preventDefault(); void go(current + 1);
    }
  }, {signal});
  show(false);
  return {go, setBusy, report, get current() { return current; }, destroy() { abort.abort(); }};
}
