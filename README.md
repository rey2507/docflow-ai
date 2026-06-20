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
- **Database Layer:** Drizzle ORM (providing universal D1/Postgres compatibility).
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
- **Database Migration:** Successfully transitioned from SQLite/D1 to **PostgreSQL on Supabase** with `pgvector` support and a Workspace-centric architecture.
- **Developer Experience:** Standardized TypeScript environment and Drizzle-kit migration workflow.

## 🚦 Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`
3. Configure environment variables in `.env.local` (for local development) or your Cloudflare Pages/Worker environment:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `AI_DEFAULT_PROVIDER` (e.g., `openai`, `gemini`)
   - `AI_DEFAULT_MODEL` (e.g., `gpt-4o`, `gemini-1.5-pro`)
   - `DATABASE_URL` (Supabase PostgreSQL connection string)
4. Run the development server (if applicable for your frontend framework): `npm run dev`

## 🚀 Deployment

This project is designed for deployment on **Cloudflare Pages** for the frontend and API functions, with optional **Cloudflare Workers** for specialized triggers like email ingestion.

1.  **Database Setup:**
    *   Ensure your Supabase project is created and `pgvector` is enabled.
    *   Run this SQL command in the Supabase SQL Editor: `CREATE EXTENSION IF NOT EXISTS vector;`
    *   Generate migrations: `npx drizzle-kit generate`
    *   Push migrations to Supabase: `npx drizzle-kit push`
2.  **Cloudflare Pages:**
    *   Connect your GitHub repository to Cloudflare Pages.
    *   Configure environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, AI_DEFAULT_PROVIDER, AI_DEFAULT_MODEL).
    *   Bind your D1 database to the `DB` variable in your Pages project settings.
3.  **Cloudflare Email Worker (Optional):**
    *   If using email import, deploy a standalone Cloudflare Worker (e.g., from `src/workers/email-inbound.ts`) and configure an email route.

---
*Updated on June 19, 2026*
## 🚀 Progress Made

- ✅ Completed remaining typecheck blockers + production readiness schema alignment.
- ✅ Updated docs/todo.md checklist accordingly.

## ✅ All Phases Completed!

The DocFlow AI project has successfully completed all planned development phases, including core foundation, AI integration, workflow engine, SaaS readiness, and all growth features. The architecture is now fully Drizzle/D1 compatible and optimized for Cloudflare deployment.