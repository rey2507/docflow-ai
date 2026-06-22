export interface Env {
  ASSETS: Fetcher;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
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

const buildRuntimeConfigScript = (env: Env) => {
  const runtimeConfig = {
    SUPABASE_URL: env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '',
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  };

  return `<script>window.__DOCFLOW_RUNTIME_ENV__=${JSON.stringify(runtimeConfig)};</script>`;
};

const injectRuntimeConfig = async (response: Response, env: Env) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  const html = await response.text();
  const injected = html.includes('</head>')
    ? html.replace('</head>', `${buildRuntimeConfigScript(env)}</head>`)
    : `${buildRuntimeConfigScript(env)}${html}`;

  return new Response(injected, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const assetResponse = await env.ASSETS.fetch(request);

    if (assetResponse.status !== 404 || !shouldServeAppShell(request)) {
      return injectRuntimeConfig(assetResponse, env);
    }

    const fallbackUrl = new URL('/index.html', request.url);
    const fallbackResponse = await env.ASSETS.fetch(new Request(fallbackUrl.toString(), request));
    return injectRuntimeConfig(fallbackResponse, env);
  },
};