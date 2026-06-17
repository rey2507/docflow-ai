# DocFlow AI

DocFlow AI is an intelligent document processing SaaS platform that automates data extraction and validation using AI.

## 🚀 Features

- **Robust Pipeline:** Automated Upload → AI Extraction → Rule-based Validation → Finalization.
- **AI Abstraction:** Provider-agnostic layer supporting OpenAI, Gemini, and Anthropic.
- **Real-time UI:** Reactive dashboard built with React 19 and Supabase Realtime.
- **AI Insights:** Automated generation of document summaries and key highlight extraction.
- **Scalable Validation:** Factory-pattern based validation engine for type-specific business rules.
- **Resiliency:** Built-in retry mechanisms with exponential backoff for AI processing.
- **Automated Maintenance:** Stale process cleanup via Edge Functions to prevent "zombie" document states.

## 🛠️ Tech Stack
- **Frontend:** React 19, TypeScript, Tailwind CSS.
- **Frontend:** React 19, TypeScript, Tailwind CSS.
- **Backend/BaaS:** Supabase (Auth, Database, Storage, Realtime).
- **Database Layer:** Drizzle ORM (providing universal D1/Postgres compatibility).
- **AI Integration:** Custom Prompt Management & Provider Abstraction.

## 📋 Project Status

All core development phases are **completed**.
Completed phases:
- [x] Core Foundation & Auth
- [x] Document Storage & Management
- [x] AI Layer Abstraction
- [x] Workflow Engine
- [x] Pipeline Orchestration
- [x] Real-time Dashboard & Insights UI
- [x] AI Quality & Confidence Scoring
- [x] SaaS Readiness & Usage Tracking
- [x] Business Features (Summarization, Duplicate Detection)
- [x] Growth Features (Email Import, OCR, Semantic Search, AI Chat)

Recent engineering progress:
- [x] Vitest test runner + TS config stabilized (repo-local `tsconfig.json`, correct `setup.ts` usage).
- [x] Fixed Vitest/Vite plugin typing mismatch so tests run cleanly.
- [x] Cleaned up TypeScript diagnostics for Supabase Edge/Deno webhook code under `docs/` by isolating Deno code and adding lightweight Deno typings.
- [x] Implemented **Drizzle ORM** for type-safe, platform-agnostic database access.
- [x] Added automated document cleanup Edge Function for stale processing recovery.
- [x] Integrated AI-generated summaries and key highlights into the document pipeline.
- [x] Developed specialized validation rules for Contracts and General Forms.

## 🚦 Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`
3. Configure environment variables in `.env.local` (for local development) or your Cloudflare Pages/Worker environment:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `AI_DEFAULT_PROVIDER` (e.g., `openai`, `gemini`)
   - `AI_DEFAULT_MODEL` (e.g., `gpt-4o`, `gemini-1.5-pro`)
   - `CLOUDFLARE_ACCOUNT_ID` (for Drizzle migrations)
   - `CLOUDFLARE_DATABASE_ID` (for Drizzle migrations)
   - `CLOUDFLARE_D1_TOKEN` (for Drizzle migrations)
4. Run the development server (if applicable for your frontend framework): `npm run dev`
5. For Cloudflare Pages deployment, ensure your `wrangler.toml` is configured with D1 bindings and environment variables.

## 🚀 Deployment

This project is designed for deployment on **Cloudflare Pages** for the frontend and API functions, with optional **Cloudflare Workers** for specialized triggers like email ingestion.

1.  **Database Setup:**
    *   Ensure your Cloudflare D1 database is created.
    *   Run Drizzle migrations: `npx drizzle-kit generate` then `npx wrangler d1 migrations apply <YOUR_D1_BINDING_NAME> --remote`
2.  **Cloudflare Pages:**
    *   Connect your GitHub repository to Cloudflare Pages.
    *   Configure environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, AI_DEFAULT_PROVIDER, AI_DEFAULT_MODEL).
    *   Bind your D1 database to the `DB` variable in your Pages project settings.
3.  **Cloudflare Email Worker (Optional):**
    *   If using email import, deploy a standalone Cloudflare Worker (e.g., from `src/workers/email-inbound.ts`) and configure an email route.

## ✅ All Phases Completed!

The DocFlow AI project has successfully completed all planned development phases, including core foundation, AI integration, workflow engine, SaaS readiness, and all growth features. The architecture is now fully Drizzle/D1 compatible and optimized for Cloudflare deployment.