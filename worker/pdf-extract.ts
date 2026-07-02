import { processDocumentServer } from '../src/server/extract-core';

addEventListener('fetch', (event: any) => {
  event.respondWith(handle(event.request));
});

async function handle(request: Request) {
  try {
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    const secret = request.headers.get('x-extract-secret');
    if (!secret || secret !== (process.env.EXTRACT_SECRET || 'dev-secret')) {
      return new Response('Unauthorized', { status: 401 });
    }
    const body = await request.json();
    const { documentId, userId, provider } = body;
    if (!documentId || !userId) return new Response('Bad request', { status: 400 });

    // call server core
    // @ts-ignore
    const res = await (processDocumentServer as any)(documentId, userId, provider);
    return new Response(JSON.stringify(res), { status: res.success ? 200 : 500, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: String(err?.message || err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
