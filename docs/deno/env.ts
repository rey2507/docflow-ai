// Restored compatibility module.
//
// `docs/env.ts` expects to re-export from `./deno/env`.
// During the cleanup/re-org, `docs/deno/` was removed; Vitest now fails
// to resolve this module.

// Minimal implementation to satisfy imports during tests.
// If your runtime needs richer env handling, extend this implementation.

declare const process: any;

export function getEnv(_key: string): string {
  const value = process?.env?.[_key];
  if (typeof value === 'string' && value.length > 0) return value;
  return '';
}


