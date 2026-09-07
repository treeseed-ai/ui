const validityMessages: Array<[keyof ValidityState, string]> = [
	['valueMissing', 'This field is required.'],
	['typeMismatch', 'Enter a value in the requested format.'],
	['patternMismatch', 'Enter a value that matches the requested format.'],
	['tooShort', 'This value is too short.'],
	['tooLong', 'This value is too long.'],
	['rangeUnderflow', 'This value is below the allowed minimum.'],
	['rangeOverflow', 'This value is above the allowed maximum.'],
	['stepMismatch', 'Enter an allowed value.'],
	['badInput', 'Enter a valid value.'],
];

type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function controlFor(form: ParentNode, name: string) {
 const candidate = form instanceof HTMLFormElement ? form.elements.namedItem(name) : [...form.querySelectorAll('input,select,textarea')].find(control => control.getAttribute('name')===name);
	if (candidate instanceof RadioNodeList) return [...candidate].find((entry) => entry instanceof HTMLElement) as FormControl | undefined;
	return candidate instanceof HTMLInputElement || candidate instanceof HTMLSelectElement || candidate instanceof HTMLTextAreaElement
		? candidate
		: undefined;
}

function fieldRoot(control: FormControl) {
	const root = control.closest<HTMLElement>('[data-ts-field], .ts-field, label');
	if (root) return root;
	return control.parentElement instanceof HTMLFormElement ? null : control.parentElement;
}

function errorNode(control: FormControl) {
	const root = fieldRoot(control);
	let error = root?.querySelector<HTMLElement>('[data-ts-field-error]') ?? (control.nextElementSibling?.hasAttribute('data-ts-field-error') ? control.nextElementSibling as HTMLElement : null);
	if (!error) {
		error = document.createElement('p');
		error.className = 'ts-field__error';
		error.dataset.tsFieldError = '';
		error.hidden = true;
		const group=root?.querySelector('.ts-field__control');
		if (group) group.append(error); else control.insertAdjacentElement('afterend',error);
	}
	if (!error.id) error.id = `${control.id || control.name || 'field'}-dynamic-error`;
	return error;
}

export function clearFieldError(control: FormControl) {
	const error = errorNode(control);
	if (error) {
		error.textContent = '';
		error.hidden = true;
	}
	control.removeAttribute('aria-invalid');
	const describedBy = (control.getAttribute('aria-describedby') ?? '')
		.split(/\s+/u)
		.filter((id) => id && id !== error?.id);
	if (describedBy.length) control.setAttribute('aria-describedby', describedBy.join(' '));
	else control.removeAttribute('aria-describedby');
}

export function setFieldError(control: FormControl, message: string) {
	const error = errorNode(control);
	if (!error) return;
	error.textContent = message;
	error.hidden = false;
	control.setAttribute('aria-invalid', 'true');
	const describedBy = new Set((control.getAttribute('aria-describedby') ?? '').split(/\s+/u).filter(Boolean));
	describedBy.add(error.id);
	control.setAttribute('aria-describedby', [...describedBy].join(' '));
}

function nativeMessage(control: FormControl) {
	for (const [key, message] of validityMessages) {
		if (control.validity[key]) return message;
	}
	return control.validationMessage || 'Check this field.';
}

export function handleNativeInvalid(event: Event) {
  const control=event.target;
  if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement)) return;
  event.preventDefault(); setFieldError(control,nativeMessage(control));
  const first=control.form?.querySelector('[aria-invalid="true"]');
  if (!first || first===control) control.focus();
}

export function validateForm(form: ParentNode) {
	let firstInvalid: FormControl | null = null;
	for (const element of form.querySelectorAll('input,select,textarea')) {
		if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement)) continue;
		clearFieldError(element);
		if (!element.willValidate || element.validity.valid) continue;
		setFieldError(element, nativeMessage(element));
		firstInvalid ??= element;
	}
	if (firstInvalid) {
		firstInvalid.focus();
		return false;
	}
	return true;
}

export function applyFieldErrors(form: ParentNode, errors: Record<string, string> = {}) {
	let firstInvalid: FormControl | null = null;
	for (const [name, message] of Object.entries(errors)) {
		const control = controlFor(form, name);
		if (!control) continue;
		setFieldError(control, message);
		firstInvalid ??= control;
	}
	firstInvalid?.focus();
	return firstInvalid;
}

export function clearChangedField(event: Event) {
	const target = event.target;
	if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) {
		clearFieldError(target);
	}
}
