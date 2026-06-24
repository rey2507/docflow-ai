# Local Deployment Guide

This guide covers deploying the DocFlow AI application locally for testing purposes.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project
- OpenAI API key (optional, for AI features)

## Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd <project-directory>
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Provider (Optional)
AI_DEFAULT_PROVIDER=openai
AI_DEFAULT_MODEL=gpt-4o
OPENAI_API_KEY=your-openai-api-key

# Database
DATABASE_URL=your-postgres-url
```

### 3. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Enable the pgvector extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Set up Row Level Security (RLS) policies
4. Copy the project URL and anon key to your `.env` file

## Running Locally

### Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Testing

### Run Unit Tests

```bash
npm run test
```

### Run Tests with UI

```bash
npm run test:ui
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

## Deployment to Cloudflare Workers

### Prerequisites

- Wrangler CLI installed: `npm install -g wrangler`
- Cloudflare account

### Deploy Steps

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Cloudflare:
   ```bash
   npm run deploy:worker
   ```

### Dry Run (Test Deployment)

```bash
npm run deploy:worker:dry
```

## Project Structure

```
├── src/
│   ├── components/     # UI components
│   ├── pages/          # Page components
│   ├── services/       # Business logic services
│   ├── lib/            # Utility libraries
│   └── types/          # TypeScript definitions
├── docs/               # Documentation
├── public/             # Static assets
└── package.json
```

## Troubleshooting

### Common Issues

1. **Supabase Connection Errors**
   - Verify your Supabase URL and anon key
   - Check if the project is active

2. **AI Provider Errors**
   - Ensure OpenAI API key is valid
   - Check API rate limits

3. **Build Failures**
   - Run `npm install` to ensure all dependencies
   - Check TypeScript errors: `npx tsc --noEmit`

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)