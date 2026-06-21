// Compatibility re-export for code/tests that import `docs/client`.
//
// Repo re-org moved the canonical docs runtime DB client under `docs/deno/client.ts`.
// Keep this barrel file so existing imports continue to work.

export * from './deno/client';

