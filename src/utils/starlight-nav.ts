export const LINKS = { home: '/books/' };

export function getBookForPath(pathname: string) {
	const normalized = pathname.replace(/\/+$/u, '');
	return /^\/t\/[^/]+\/books\/[^/]+(?:\/.*)?$/u.test(normalized)
		? { canonicalLibraryPath: LINKS.home }
		: null;
}
