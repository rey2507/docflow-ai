# TODO - repo cleanup & re-org

## Step 1 — Inventory
- [x] Inspect current root files and understand likely generated vs source.

## Step 2 — Move files (no deletions yet)
- [ ] Create `config/`, `scripts/`, and `generated/` directories.
- [ ] Move build/config files from root into `config/`.
- [ ] Move one-off scripts from root into `scripts/`.
- [ ] Move generated Drizzle artifacts from `drizzle/` into `generated/`.

## Step 3 — Update references
- [ ] Update paths in `drizzle.config.ts` (schema/out) and any other tooling configs that depend on root-relative locations.
- [ ] Update TS configs include/exclude if needed.

## Step 4 — Safety checks
- [ ] Run `npx tsc -p tsconfig.json --noEmit`.
- [ ] Run `npx vitest run`.
- [ ] Run `npx drizzle-kit generate` (if intended) or validate config via a dry run.

## Step 5 — Deletions (later, after confirming no usage)
- [ ] Remove or ignore files determined to be unnecessary/unused.
- [ ] Update `.gitignore` to avoid committing generated artifacts.

