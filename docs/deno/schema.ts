// Restored compatibility module.
//
// Vitest (and other tooling) expects `docs/schema.ts` to re-export from
// `docs/deno/schema.ts`.
//
// The canonical schema for the docs runtime is defined in this repo under
// `docs/schema.ts` previously, but during the cleanup/re-org the directory
// `docs/deno/` was removed.
//
// This file reintroduces the missing module so imports resolve.

export * from '../schema';

