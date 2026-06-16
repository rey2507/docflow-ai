import { supabase } from '../lib/supabase/client';
import { UsageService } from '../services/usage/usage.service';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

interface PlanLimits {
  maxMonthlyTokens: number;
}

const PLAN_LIMITS: Record<SubscriptionTier, PlanLimits> = {
  free: { maxMonthlyTokens: 50000 },
  pro: { maxMonthlyTokens: 1000000 },
  enterprise: { maxMonthlyTokens: Infinity },
};

/**
 * SubscriptionService
 *
 * Manages user subscription tiers and enforces plan-based limits.
 */
export const SubscriptionService = {
  /**
   * Retrieves the current subscription tier for a user from their profile.
   */
  async getUserTier(userId: string): Promise<SubscriptionTier> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      if (error || !data) return 'free';
      return (data.subscription_tier as SubscriptionTier) || 'free';
    } catch {
      return 'free';
    }
  },

  /**
   * Checks if a user is allowed to process a document based on their monthly token consumption.
   */
  async canProcessDocument(
    userId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    const tier = await this.getUserTier(userId);
    const { totalTokens, error } = await UsageService.getUserMonthlyTokenUsage(userId);

    if (error) {
      return { allowed: false, reason: 'System error: Unable to verify usage limits.' };
    }

    const limit = PLAN_LIMITS[tier].maxMonthlyTokens;
    if (totalTokens >= limit) {
      return {
        allowed: false,
        reason: `Plan limit reached: You have used ${totalTokens.toLocaleString()} tokens of your ${tier} plan's ${limit.toLocaleString()} monthly limit.`,
      };
    }

    return { allowed: true };
  },
};

