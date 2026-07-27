export type FormToastTone = 'success' | 'error' | 'info' | 'progress';

export interface FormSubmissionResponse<T = unknown> {
	ok: boolean;
	code: string;
	message: string;
	fieldErrors?: Record<string, string>;
	redirect?: string;
	payload?: T;
	reset?: boolean;
	refreshTargets?: string[];
}

export interface FormSubmissionContext {
	form: HTMLFormElement;
	submitter: HTMLElement | null;
	formData: FormData;
}

export interface FormRequest {
	url: string;
	init: RequestInit;
}

export interface FormSubmissionAdapter {
	buildRequest?: (context: FormSubmissionContext) => FormRequest | Promise<FormRequest>;
	parseResponse?: (
		response: Response,
		context: FormSubmissionContext,
	) => FormSubmissionResponse | Promise<FormSubmissionResponse>;
	afterSuccess?: (
		result: FormSubmissionResponse,
		context: FormSubmissionContext,
	) => void | Promise<void>;
}

export interface ToastMessage {
	id?: string;
	tone: FormToastTone;
	message: string;
	duration?: number | null;
}

function enhanced(request: Request) {
	return request.headers.get('x-treeseed-form') === 'enhanced'
		|| (request.headers.get('accept') ?? '').includes('application/json');
}

function safeRedirect(request: Request, candidate: string | undefined, fallback: string) {
	const origin = new URL(request.url).origin;
	const fallbackTarget = new URL(fallback, request.url);
	const safeFallback = fallbackTarget.origin === origin
		? `${fallbackTarget.pathname}${fallbackTarget.search}${fallbackTarget.hash}`
		: '/';
	const target = new URL(candidate || safeFallback, request.url);
	return target.origin === origin ? `${target.pathname}${target.search}${target.hash}` : safeFallback;
}

export function formSubmissionResponse(
	request: Request,
	result: FormSubmissionResponse,
	options: { fallbackRedirect: string; headers?: HeadersInit; successStatus?: number },
) {
	const headers = new Headers(options.headers);
	headers.set('cache-control', 'no-store');
	if (enhanced(request)) {
		headers.set('content-type', 'application/json; charset=utf-8');
		const status = result.ok ? (options.successStatus ?? 200) : Object.keys(result.fieldErrors ?? {}).length ? 422 : 400;
		return new Response(JSON.stringify(result), { status, headers });
	}
	const redirect = safeRedirect(request, result.redirect, options.fallbackRedirect);
	const target = new URL(redirect, request.url);
	target.searchParams.set(result.ok ? 'tsToastSuccess' : 'tsToastError', result.message);
	headers.set('location', `${target.pathname}${target.search}${target.hash}`);
	return new Response(null, { status: 303, headers });
}
