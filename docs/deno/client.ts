// Docs runtime DB client compatibility layer.
//
// Some services import `DbClient` from `docs/client`.
// Repo re-org placed most schema/runtime under `docs/deno/*`.
// This file provides the minimal types/exports needed for TypeScript resolution.

import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// In this codebase, the actual runtime client is expected to be provided by the app layer.
// Tests typically inject a fake `db` object that matches the required shape.
export type DbClient = any;

// If the app ever needs an actual implementation from `docs/client`, it should be wired here.

