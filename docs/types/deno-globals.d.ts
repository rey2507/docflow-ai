declare namespace DenoNamespace {
  interface Env {
    get(key: string): string | undefined;
    toObject(): { [key: string]: string };
  }

  interface ServeOptions {
    port?: number;
    hostname?: string;
    onListen?: (params: { port: number; hostname: string }) => void;
  }
}

/**
 * Declare Deno as a global variable so it is recognized by the compiler
 * in docs/index.edge.ts.
 */
declare var Deno: {
  readonly env: DenoNamespace.Env;
  serve(
    handler: (request: Request, connInfo: any) => Response | Promise<Response>,
    options?: DenoNamespace.ServeOptions
  ): { finished: Promise<void> };
};