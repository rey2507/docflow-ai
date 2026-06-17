declare module 'https://esm.sh/@supabase/supabase-js@2.108.2' {
  export interface PostgrestResponse<T> {
    data: T | null;
    error: any | null;
    status: number;
    statusText: string;
  }

  // Extend PromiseLike so 'await' unwraps the builder into a PostgrestResponse
  export interface PostgrestFilterBuilder<T, R, I> extends PromiseLike<PostgrestResponse<R>> {
    upsert(values: I | I[], options?: { onConflict?: string; ignoreDuplicates?: boolean }): PostgrestFilterBuilder<T, R, I>;
    update(values: Partial<I>): PostgrestFilterBuilder<T, R, I>;
    eq(column: keyof I, value: I[keyof I]): PostgrestFilterBuilder<T, R, I>;
    lt(column: string, value: any): PostgrestFilterBuilder<T, R, I>;
    select(columns?: string): PostgrestFilterBuilder<T, R, I>;
    single(): Promise<PostgrestResponse<T>>;
  }

  interface SupabaseClient {
    from<T = any, R = T[], I = T>(tableName: string): PostgrestFilterBuilder<T, R, I>;
  }

  export function createClient(supabaseUrl: string, supabaseKey: string): SupabaseClient;
}

declare module 'https://esm.sh/stripe@14.23.0?target=deno' {
  // Minimal type definitions for Stripe to satisfy index.edge.ts
  class Stripe {
    constructor(apiKey: string, options?: { apiVersion?: string; httpClient?: any });
    static createFetchHttpClient(): any;
    webhooks: {
      constructEvent(body: string | Uint8Array, signature: string, secret: string, tolerance?: number): Stripe.Event;
    };
  }

  namespace Stripe {
    interface Event {
      type: string;
      data: {
        object: any; // Can be Stripe.Subscription, etc.
      };
    }

    interface Subscription {
      id: string;
      customer: string | { id: string }; // Can be string or Customer object
      status: string;
      items: {
        data: Array<{
          price?: {
            id: string;
          };
        }>;
      };
      cancel_at_period_end: boolean;
      current_period_end: number;
    }
  }
  export default Stripe;
}