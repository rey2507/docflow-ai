/**
 * Environment Validation Utility
 * 
 * Validates that all required environment variables are set at runtime.
 * This helps catch configuration errors early during startup.
 */

export interface EnvironmentConfig {
  database: {
    url: string;
  };
  supabase: {
    url: string;
    anonKey: string;
  };
  ai: {
    defaultProvider: 'openai' | 'gemini' | 'anthropic';
    defaultModel: string;
    openaiApiKey?: string;
    geminiApiKey?: string;
    anthropicApiKey?: string;
  };
}

/**
 * Validates required environment variables and returns configuration object.
 * Throws if any critical variable is missing.
 */
export function validateEnvironment(): EnvironmentConfig {
  const errors: string[] = [];

  // Database Configuration (Required)
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    errors.push('DATABASE_URL environment variable is not set. Required for PostgreSQL connection.');
  }

  // Supabase Configuration (Required)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL environment variable is not set.');
  }
  if (!supabaseAnonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY environment variable is not set.');
  }

  // AI Provider Configuration (At least one provider key required)
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!openaiKey && !geminiKey && !anthropicKey) {
    errors.push('At least one AI provider API key must be set: OPENAI_API_KEY, GEMINI_API_KEY, or ANTHROPIC_API_KEY.');
  }

  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach((err) => console.error(`  - ${err}`));
    throw new Error(`Environment validation failed with ${errors.length} errors. See logs above.`);
  }

  const defaultProvider = (process.env.AI_DEFAULT_PROVIDER || 'openai') as 'openai' | 'gemini' | 'anthropic';
  
  // Warn if default provider key is not set
  if (defaultProvider === 'openai' && !openaiKey) {
    console.warn('⚠️  AI_DEFAULT_PROVIDER is openai but OPENAI_API_KEY is not set. Failover will be used.');
  }
  if (defaultProvider === 'gemini' && !geminiKey) {
    console.warn('⚠️  AI_DEFAULT_PROVIDER is gemini but GEMINI_API_KEY is not set. Failover will be used.');
  }

  return {
    database: {
      url: databaseUrl!,
    },
    supabase: {
      url: supabaseUrl!,
      anonKey: supabaseAnonKey!,
    },
    ai: {
      defaultProvider,
      defaultModel: process.env.AI_DEFAULT_MODEL || 'gpt-4o',
      openaiApiKey: openaiKey,
      geminiApiKey: geminiKey,
      anthropicApiKey: anthropicKey,
    },
  };
}

/**
 * Logs the current environment configuration (with sensitive values masked).
 */
export function logEnvironmentInfo(): void {
  const config = {
    database: {
      url: `${process.env.DATABASE_URL?.substring(0, 30)}...` || 'NOT SET',
    },
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'NOT SET',
      anonKeySet: !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
    },
    ai: {
      defaultProvider: process.env.AI_DEFAULT_PROVIDER || 'openai',
      defaultModel: process.env.AI_DEFAULT_MODEL || 'gpt-4o',
      openaiKeySet: !!process.env.OPENAI_API_KEY,
      geminiKeySet: !!process.env.GEMINI_API_KEY,
      anthropicKeySet: !!process.env.ANTHROPIC_API_KEY,
    },
  };

  console.log('🔧 Environment Configuration:');
  console.log(JSON.stringify(config, null, 2));
}
