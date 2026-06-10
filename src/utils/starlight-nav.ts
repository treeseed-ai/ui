export const TREESEED_LINKS = {
  home: '/',
};

export function getBookForPath(pathname: string) {
  return pathname.includes('/books/') ? { title: 'TreeSeed Knowledge', downloadHref: '/books/treeseed-knowledge.md' } : null;
}

export function getDocsDownloadForPath(pathname: string) {
  const book = getBookForPath(pathname);
  if (!book) return null;
  return {
    downloadHref: book.downloadHref,
    downloadFileName: book.downloadHref.split('/').pop() ?? 'treeseed-book.md',
    downloadTitle: `Download ${book.title}`,
  };
}
