import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

/**
 * Database Client Provider
 * In Cloudflare Workers, 'env.DB' is the D1 binding.
 * In local development, wrangler provides a local SQLite version.
 */
export const getDb = (d1Binding: any) => {
  return drizzle(d1Binding, { schema });
};

// Export types for use in services
export type DbClient = ReturnType<typeof getDb>;