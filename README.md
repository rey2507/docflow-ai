# DocFlow AI

DocFlow AI is an intelligent document processing SaaS platform that automates data extraction and validation using AI.

## 🚀 Features

- **Robust Pipeline:** Automated Upload → AI Extraction → Rule-based Validation → Finalization.
- **AI Abstraction:** Provider-agnostic layer supporting OpenAI, Gemini, and Anthropic.
- **Provider Failover:** Built-in failover chain (OpenAI -> Gemini -> Anthropic) for maximum uptime.
- **Real-time UI:** Reactive dashboard built with React 19 and Supabase Realtime.
- **AI Insights:** Automated generation of document summaries and key highlight extraction.
- **Scalable Validation:** Factory-pattern based validation engine for type-specific business rules.
- **Resiliency:** Built-in retry mechanisms with exponential backoff for AI processing.
- **Automated Maintenance:** Stale process cleanup via Edge Functions to prevent "zombie" document states.

## 🛠️ Tech Stack
- **Frontend:** React 19, TypeScript, Tailwind CSS.
- **Frontend:** React 19, TypeScript, Tailwind CSS.
- **Backend/BaaS:** Supabase (Auth, Database, Storage, Realtime).
- **Database Layer:** Drizzle ORM with PostgreSQL on Supabase and pgvector for embeddings.
- **AI Integration:** Custom Prompt Management & Provider Abstraction.

## 📋 Project Status

DocFlow AI is currently **Production Ready**.

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

Recent Major Updates:
- **Production Hardening:** Completed Phase 12 including Rate Limiting, Structured Logging, and Credit Enforcement.
- **AI Provider Failover:** Implemented automatic fallback loop (`OpenAI` -> `Gemini` -> `Anthropic`).
- **Subscription Guarding:** Linked billing cycles to real-time AI usage and processing blocks.
- **Vision Support:** Full base64 OCR/Vision support integrated for image documents.
- **Database:** PostgreSQL on Supabase with `pgvector` for embeddings, workspace-centric RLS, and Drizzle ORM.
- **Developer Experience:** Standardized TypeScript environment and Drizzle-kit migration workflow.

## 🚦 Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`
3. Configure environment variables in `.env.local` (for local development) or your Cloudflare Worker build/deploy environment:
    - `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL` for Worker build-time injection)
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `SUPABASE_ANON_KEY` for Worker build-time injection)
   - `AI_DEFAULT_PROVIDER` (e.g., `openai`, `gemini`)
   - `AI_DEFAULT_MODEL` (e.g., `gpt-4o`, `gemini-1.5-pro`)
   - `DATABASE_URL` (Supabase PostgreSQL connection string)
    - Copy/paste example for local development:

      ```dotenv
      DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
      NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
      AI_DEFAULT_PROVIDER=openai
      AI_DEFAULT_MODEL=gpt-4o
      ```
4. Run the development server: `npm run dev`

## 🚀 Deployment

This project is designed for deployment on **Cloudflare Workers** for the frontend, with Supabase handling the database/auth layer.

1.  **Database Setup:**
    *   Ensure your Supabase project is created and `pgvector` is enabled.
    *   Run this SQL command in the Supabase SQL Editor: `CREATE EXTENSION IF NOT EXISTS vector;`
    *   Generate migrations: `npx drizzle-kit generate`
    *   Push migrations to Supabase: `npx drizzle-kit push`
2.  **Cloudflare Workers:**
    *   Connect your GitHub repository to Cloudflare Workers.
    *   Use the root [wrangler.jsonc](wrangler.jsonc) file as the Worker config.
    *   Build locally or in CI with `npm run build`, then deploy with `npm run deploy:worker`.
    *   Configure environment variables (`SUPABASE_URL` and `SUPABASE_ANON_KEY`, or the `NEXT_PUBLIC_` equivalents, plus `AI_DEFAULT_PROVIDER` and `AI_DEFAULT_MODEL`).
    *   Configure your Supabase PostgreSQL connection string in `DATABASE_URL`.
    *   Copy/paste example for Worker environment variables:

        ```dotenv
        SUPABASE_URL=https://your-project.supabase.co
        SUPABASE_ANON_KEY=your-anon-key
        AI_DEFAULT_PROVIDER=openai
        AI_DEFAULT_MODEL=gpt-4o
        DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
        ```
3.  **Cloudflare Email Worker (Optional):**
    *   If using email import, deploy a standalone Cloudflare Worker (e.g., from `src/workers/email-inbound.ts`) and configure an email route.

---
*Updated on June 19, 2026*
## 🚀 Progress Made

- ✅ Completed remaining typecheck blockers + production readiness schema alignment.
- ✅ Updated docs/todo.md checklist accordingly.

## ✅ All Phases Completed!

The DocFlow AI project has successfully completed core phases 1-13.1, including foundation, AI integration, workflow engine, SaaS readiness, and growth features. The architecture is fully Supabase PostgreSQL-based with pgvector embeddings, workspace-level RLS, and Cloudflare Pages deployment.