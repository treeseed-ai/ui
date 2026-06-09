import type { APIRoute } from 'astro';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

export const prerender = false;

const markdownPreviewProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({})) as { markdown?: unknown };
  const markdown = typeof body.markdown === 'string' ? body.markdown : '';
  const file = await markdownPreviewProcessor.process(markdown);

  return Response.json({
    ok: true,
    payload: {
      html: String(file),
    },
  });
};
