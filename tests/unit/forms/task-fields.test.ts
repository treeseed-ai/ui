import {afterEach, expect, it} from 'vitest';
import {syncTaskFields} from '../../../src/lib/forms/wizard/task-fields';
afterEach(() => document.body.replaceChildren());
it('requires task fields only when selected, excludes inactive values and preserves drafts', () => {
  document.body.innerHTML = '<form><input type="checkbox" name="capabilities" value="dns-management"><div data-required-capabilities="dns-management"><input name="config.zoneId" value="draft"></div></form>';
  const form = document.querySelector('form')!;
  const task = form.querySelector<HTMLInputElement>('[name="capabilities"]')!;
  const field = form.querySelector<HTMLInputElement>('[name="config.zoneId"]')!;
  syncTaskFields(form);
  expect(field.disabled).toBe(true); expect(field.required).toBe(false);
  expect(new FormData(form).has(field.name)).toBe(false);
  task.checked = true; syncTaskFields(form);
  expect(field.disabled).toBe(false); expect(field.required).toBe(true);
  expect(field.parentElement!.hidden).toBe(false);
  task.checked = false; syncTaskFields(form);
  expect(field.parentElement!.hidden).toBe(true);
  task.checked = true; syncTaskFields(form);
  expect(field.value).toBe('draft');
});
