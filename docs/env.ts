// Compatibility shim for code that imports `docs/env`.
// The real Deno/env implementation lives in `docs/deno/env.ts`.
export { getEnv } from './deno/env';

