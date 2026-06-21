# TODO - repo cleanup & re-org

## Step 1 — Inventory
- [x] Inspect current root files and understand likely generated vs source.

## Step 2 — Move files (no deletions yet)
- [x] Create `config/`, `scripts/`, and `generated/` directories.
- [x] Move build/config files from root into `config/`.
- [x] Move one-off scripts from root into `scripts/`.
- [x] Move generated Drizzle artifacts from `drizzle/` into `generated/`.


## Step 3 — Update references
- [x] Update paths in `drizzle.config.ts` (schema/out) and any other tooling configs that depend on root-relative locations.
- [x] Update TS configs include/exclude if needed.

## Step 4 — Safety checks
- [x] Run `npx tsc -p tsconfig.json --noEmit`.
- [x] Run `npx vitest run`.
- [x] Run `npx drizzle-kit generate` (if intended) or validate config via a dry run.

## Step 5 — Deletions (later, after confirming no usage)
- [x] Remove or ignore files determined to be unnecessary/unused.
- [x] Update `.gitignore` to avoid committing generated artifacts.


