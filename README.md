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
- **Backend/BaaS:** Supabase (Auth, Database, Storage, Realtime).
- **Database Layer:** Drizzle ORM (providing universal D1/Postgres compatibility).
- **AI Integration:** Custom Prompt Management & Provider Abstraction.

## 📋 Project Status

Currently in **Phase 11: Growth Features**.
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
3. Configure environment variables in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Run the development server: `npm run dev`