/** Apply catalog-owned task requirements without discarding a user's draft. */
export function syncTaskFields(root: ParentNode) {
  const selected = new Set(Array.from(root.querySelectorAll<HTMLInputElement>('input[name="capabilities"]:checked'), input => input.value));
  root.querySelectorAll<HTMLElement>('[data-required-capabilities]').forEach(section => {
    const enabled = (section.dataset.requiredCapabilities ?? '').split(' ').some(task => selected.has(task));
    section.hidden = !enabled;
    section.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input,select,textarea').forEach(input => {
      input.disabled = !enabled;
      input.required = enabled;
    });
  });
}
