# DocFlow AI

DocFlow AI is an intelligent document processing SaaS platform that automates data extraction and validation using AI.

## 🚀 Features

- **Robust Pipeline:** Automated Upload → AI Extraction → Rule-based Validation → Finalization.
- **AI Abstraction:** Provider-agnostic layer supporting OpenAI, Gemini, and Anthropic.
- **Real-time UI:** Reactive dashboard built with React 19 and Supabase Realtime.
- **Scalable Validation:** Factory-pattern based validation engine for type-specific business rules.
- **Resiliency:** Built-in retry mechanisms with exponential backoff for AI processing.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS.
- **Backend/BaaS:** Supabase (Auth, Database, Storage, Realtime).
- **AI Integration:** Custom Prompt Management & Provider Abstraction.

## 📋 Project Status

Currently in **Phase 7: Productization**.
Completed phases:
- [x] Core Foundation & Auth
- [x] Document Storage & Management
- [x] AI Layer Abstraction
- [x] Workflow Engine
- [x] Pipeline Orchestration
- [x] Real-time Dashboard (v1)

## 🚦 Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`
3. Configure environment variables in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Run the development server: `npm run dev`