// This is a mock for the Supabase client for local Deno testing.
// It intercepts calls to `createClient` and provides simplified mock implementations
// of the `from`, `select`, `eq`, `lt`, `single`, `update`, and `upsert` methods.

import type { PostgrestResponse, PostgrestFilterBuilder, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.108.2';

// A very basic mock for PostgrestFilterBuilder methods used in Edge Functions
class MockPostgrestFilterBuilder<T, R, I> implements Partial<PostgrestFilterBuilder<T, R, I>> {
  constructor(private tableName: string, private queryChain: string[] = []) {}

  select(columns?: string): MockPostgrestFilterBuilder<T, R, I> {
    this.queryChain.push(`select(${columns})`);
    return this;
  }

  eq(column: keyof I, value: I[keyof I]): MockPostgrestFilterBuilder<T, R, I> {
    this.queryChain.push(`eq(${String(column)}, ${JSON.stringify(value)})`);
    return this;
  }

  lt(column: string, value: any): MockPostgrestFilterBuilder<T, R, I> {
    this.queryChain.push(`lt(${column}, ${JSON.stringify(value)})`);
    return this;
  }

  single(): Promise<PostgrestResponse<T>> {
    console.log(`MOCKED Supabase: ${this.tableName}.${this.queryChain.join('.')}.single()`);
    // --- Add specific mock responses here based on your test cases ---
    if (this.tableName === 'profiles' && this.queryChain.includes('eq(stripe_customer_id, "cus_mock_id")')) {
      return Promise.resolve({ data: { id: 'mock-user-id' } as T, error: null, status: 200, statusText: 'OK' });
    }
    if (this.tableName === 'documents' && this.queryChain.includes('eq(id, "doc-123")')) {
      return Promise.resolve({ data: { id: 'doc-123', userId: 'mock-user-id', status: 'pending', metadata: {} } as T, error: null, status: 200, statusText: 'OK' });
    }
    if (this.tableName === 'documents' && this.queryChain.includes('eq(status, "processing")') && this.queryChain.some(q => q.startsWith('lt(updated_at,'))) {
      // Mock for cleanup.edge.ts
      return Promise.resolve({ data: [{ id: 'stale-doc-1', metadata: {} }] as T, error: null, status: 200, statusText: 'OK' });
    }
    // Default for single() if no specific mock matches
    return Promise.resolve({ data: null, error: null, status: 404, statusText: 'Not Found' });
  }

  upsert(values: I | I[], options?: { onConflict?: string; ignoreDuplicates?: boolean }): MockPostgrestFilterBuilder<T, R, I> {
    console.log(`MOCKED Supabase: ${this.tableName}.upsert() with`, values);
    return this; // Return itself to allow chaining
  }

  update(values: Partial<I>): MockPostgrestFilterBuilder<T, R, I> {
    console.log(`MOCKED Supabase: ${this.tableName}.update() with`, values);
    return this; // Return itself to allow chaining
  }

  // Implement PromiseLike for await
  then(onfulfilled?: any, onrejected?: any): any {
    return Promise.resolve({ data: null, error: null, status: 200, statusText: 'OK' } as any)
      .then(onfulfilled, onrejected);
  }
}

export function createClient(supabaseUrl: string, supabaseKey: string): SupabaseClient {
  console.log(`MOCKED Supabase Client created for URL: ${supabaseUrl}`);
  return {
    from: <T = any, R = T[], I = T>(tableName: string) => new MockPostgrestFilterBuilder<T, R, I>(tableName) as any,
  } as SupabaseClient;
}