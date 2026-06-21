// Compatibility re-export for code/tests that import `docs/schema`.
//
// Repo re-org moved the canonical Drizzle schema for docs runtime under `docs/deno/schema.ts`.
// Keep this thin barrel file so existing imports continue to work.

export * from './deno/schema';

