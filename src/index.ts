export interface Env {
  ASSETS: Fetcher;
}

const acceptsHtml = (request: Request) => {
  const acceptHeader = request.headers.get('accept') || '';
  return acceptHeader.includes('text/html');
};

const shouldServeAppShell = (request: Request) => {
  if (request.method !== 'GET') return false;

  const url = new URL(request.url);
  if (url.pathname === '/' || url.pathname.endsWith('/')) return true;
  if (url.pathname.includes('.')) return false;

  return acceptsHtml(request);
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const assetResponse = await env.ASSETS.fetch(request);

    if (assetResponse.status !== 404 || !shouldServeAppShell(request)) {
      return assetResponse;
    }

    const fallbackUrl = new URL('/index.html', request.url);
    return env.ASSETS.fetch(new Request(fallbackUrl.toString(), request));
  },
};