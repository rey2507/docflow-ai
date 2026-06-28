import { eq } from 'drizzle-orm';
import { DbClient } from 'docs/client';
import { rateLimits } from 'docs/schema';
import { LogService } from '@/services/logging/log.service';

export const RATE_LIMIT_CONFIG = {
  UPLOAD: { limit: 10, windowSeconds: 60 },
  AI_EXTRACT: { limit: 5, windowSeconds: 60 },
  AI_CHAT: { limit: 20, windowSeconds: 60 },
};

export const RateLimitService = {
  /**
   * Checks if the user has exceeded the rate limit for a specific endpoint.
   */
  async checkRateLimit(
    db: DbClient,
    userId: string,
    endpoint: keyof typeof RATE_LIMIT_CONFIG
  ): Promise<{ allowed: boolean; reason?: string }> {
    const config = RATE_LIMIT_CONFIG[endpoint];
    const key = `${userId}:${endpoint}`;
    const now = Date.now();

    try {
      const record = await db.query.rateLimits.findFirst({
        where: eq(rateLimits.key, key),
      });

      // If no record exists or the window has expired, reset the counter
      if (!record || record.resetAt < now) {
        const resetAt = now + config.windowSeconds * 1000;
        await db
          .insert(rateLimits)
          .values({
            key,
            count: 1,
            resetAt,
          })
          .onConflictDoUpdate({
            // Avoid dialect-specific conflict-target typing issues by relying on the PK.
            // Drizzle needs a `target` for some dialects, but your current type-checking
            // is treating this as SQLite. Casting keeps runtime behavior unchanged.
            target: rateLimits.key as any,
            set: { count: 1, resetAt },
          });

        return { allowed: true };
      }

      if (record.count >= config.limit) {
        return {
          allowed: false,
          reason: `Rate limit exceeded for ${endpoint
            .toLowerCase()
            .replace('_', ' ')}. Please try again after ${new Date(record.resetAt).toLocaleTimeString()}.`,
        };
      }

      // Increment the counter
      await db
        .update(rateLimits)
        .set({ count: record.count + 1 })
        .where(eq(rateLimits.key, key));

      return { allowed: true };
    } catch (error: any) {
      LogService.error('Rate limit check failed', error, { userId, endpoint });
      return { 
        allowed: false, 
        reason: 'Unable to verify rate limit. Please try again later.' 
      };
    }
  },
};
