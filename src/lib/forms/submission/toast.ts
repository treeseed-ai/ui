import type { FormToastTone, ToastMessage } from './types.js';

type ToastRecord = Required<Omit<ToastMessage, 'duration'>> & {
	duration: number | null;
	remaining: number | null;
	startedAt: number | null;
	timer: number | null;
};

const visible = new Map<string, ToastRecord>();
const queued: ToastRecord[] = [];
const MAX_VISIBLE = 4;
let initialized = false;
let activeRegion: HTMLElement | null = null;

function region() {
	return typeof document === 'undefined'
		? null
		: document.querySelector<HTMLElement>('[data-ts-toast-region]');
}

function synchronizeRegion() {
	const nextRegion = region();
	if (nextRegion === activeRegion) return nextRegion;
	for (const toast of visible.values()) {
		if (toast.timer !== null) window.clearTimeout(toast.timer);
	}
	visible.clear();
	queued.splice(0);
	activeRegion = nextRegion;
	return nextRegion;
}

function durationFor(tone: FormToastTone) {
	if (tone === 'progress') return null;
	return tone === 'error' ? 10_000 : 5_000;
}

function removeElement(id: string) {
	region()?.querySelector(`[data-ts-toast-id="${CSS.escape(id)}"]`)?.remove();
}

function promoteQueue() {
	while (visible.size < MAX_VISIBLE && queued.length) {
		const next = queued.shift();
		if (next) mount(next);
	}
}

function finish(id: string) {
	const toast = visible.get(id);
	if (!toast) return;
	if (toast.timer !== null) window.clearTimeout(toast.timer);
	visible.delete(id);
	const element = region()?.querySelector<HTMLElement>(`[data-ts-toast-id="${CSS.escape(id)}"]`);
	if (element) {
		element.dataset.state = 'leaving';
		window.setTimeout(() => {
			removeElement(id);
			promoteQueue();
		}, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 160);
	} else {
		promoteQueue();
	}
}

function resume(toast: ToastRecord) {
	if (toast.remaining === null || toast.timer !== null || document.hidden) return;
	toast.startedAt = Date.now();
	toast.timer = window.setTimeout(() => finish(toast.id), toast.remaining);
}

function pause(toast: ToastRecord) {
	if (toast.timer === null || toast.remaining === null || toast.startedAt === null) return;
	window.clearTimeout(toast.timer);
	toast.timer = null;
	toast.remaining = Math.max(0, toast.remaining - (Date.now() - toast.startedAt));
	toast.startedAt = null;
}

function render(toast: ToastRecord) {
	const host = region();
	if (!host) return null;
	const element = document.createElement('article');
	element.className = 'ts-toast';
	element.dataset.tsToastId = toast.id;
	element.dataset.tone = toast.tone;
	element.dataset.state = 'entering';
	element.setAttribute('role', toast.tone === 'error' ? 'alert' : 'status');
	element.setAttribute('aria-live', toast.tone === 'error' ? 'assertive' : 'polite');
	element.innerHTML = `
		<span class="ts-toast__marker" aria-hidden="true"></span>
		<p class="ts-toast__message"></p>
		<button class="ts-toast__dismiss" type="button" aria-label="Dismiss notification">×</button>
	`;
	element.querySelector<HTMLElement>('.ts-toast__message')!.textContent = toast.message;
	element.querySelector('button')?.addEventListener('click', () => finish(toast.id));
	element.addEventListener('pointerenter', () => pause(toast));
	element.addEventListener('pointerleave', () => {
		if (!element.matches(':focus-within')) resume(toast);
	});
	element.addEventListener('focusin', () => pause(toast));
	element.addEventListener('focusout', () => {
		if (!element.matches(':hover')) resume(toast);
	});
	host.append(element);
	requestAnimationFrame(() => {
		element.dataset.state = 'visible';
	});
	return element;
}

function mount(toast: ToastRecord) {
	visible.set(toast.id, toast);
	render(toast);
	resume(toast);
}

export function showToast(input: ToastMessage) {
	if (typeof window === 'undefined') return input.id ?? '';
	synchronizeRegion();
	const id = input.id ?? globalThis.crypto?.randomUUID?.() ?? `toast-${Date.now()}-${Math.random()}`;
	const existing = visible.get(id);
	if (existing) {
		existing.message = input.message;
		existing.tone = input.tone;
		existing.duration = input.duration === undefined ? durationFor(input.tone) : input.duration;
		existing.remaining = existing.duration;
		pause(existing);
		const element = region()?.querySelector<HTMLElement>(`[data-ts-toast-id="${CSS.escape(id)}"]`);
		if (element) {
			element.dataset.tone = input.tone;
			element.setAttribute('role', input.tone === 'error' ? 'alert' : 'status');
			element.setAttribute('aria-live', input.tone === 'error' ? 'assertive' : 'polite');
			element.querySelector<HTMLElement>('.ts-toast__message')!.textContent = input.message;
		}
		resume(existing);
		return id;
	}
	const duration = input.duration === undefined ? durationFor(input.tone) : input.duration;
	const toast: ToastRecord = {
		id,
		tone: input.tone,
		message: input.message,
		duration,
		remaining: duration,
		startedAt: null,
		timer: null,
	};
	if (visible.size >= MAX_VISIBLE) queued.push(toast);
	else mount(toast);
	return id;
}

export function updateToast(id: string, update: Partial<Omit<ToastMessage, 'id'>>) {
	const current = visible.get(id) ?? queued.find((toast) => toast.id === id);
	if (!current) return false;
	const tone = update.tone ?? current.tone;
	const duration = update.duration === undefined ? durationFor(tone) : update.duration;
	if (visible.has(id)) {
		showToast({
			id,
			tone,
			message: update.message ?? current.message,
			duration,
		});
	} else {
		current.tone = tone;
		current.message = update.message ?? current.message;
		current.duration = duration;
		current.remaining = duration;
	}
	return true;
}

export function dismissToast(id: string) {
	const queuedIndex = queued.findIndex((toast) => toast.id === id);
	if (queuedIndex >= 0) queued.splice(queuedIndex, 1);
	finish(id);
}

export function initializeToasts() {
	if (typeof document === 'undefined') return;
	synchronizeRegion();
	const flash = new URL(window.location.href);
	const error = flash.searchParams.get('error') ?? flash.searchParams.get('tsToastError');
	const success = flash.searchParams.get('status') ?? flash.searchParams.get('tsToastSuccess');
	if (error) showToast({ tone: 'error', message: error });
	else if (success) showToast({ tone: 'success', message: success });
	for (const initial of document.querySelectorAll<HTMLElement>('[data-ts-initial-toast]')) {
		const tone = initial.dataset.tone === 'error' ? 'error' : 'success';
		const message = initial.dataset.message ?? initial.textContent ?? '';
		if (message && message !== error && message !== success) showToast({ tone, message });
		initial.remove();
	}
	for (const key of ['error', 'status', 'tsToastError', 'tsToastSuccess']) flash.searchParams.delete(key);
	if (flash.href !== window.location.href) history.replaceState(history.state, '', flash);
	if (!initialized) {
		initialized = true;
		document.addEventListener('visibilitychange', () => {
			for (const toast of visible.values()) {
				if (document.hidden) pause(toast);
				else resume(toast);
			}
		});
		window.addEventListener('treeseed:toast', ((event: CustomEvent<ToastMessage>) => {
			showToast(event.detail);
		}) as EventListener);
	}
}
