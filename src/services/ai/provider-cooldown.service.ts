type CooldownEntry = {
  provider: string;
  retryAfter: number;
  timestamp: number;
};

class ProviderCooldownService {
  private cooldowns: CooldownEntry[] = [];
  private readonly defaultCooldownMs = 60_000;

  isCooledDown(provider: string): boolean {
    const now = Date.now();
    this.cooldowns = this.cooldowns.filter(c => c.timestamp + c.retryAfter > now);
    return !this.cooldowns.some(c => c.provider === provider);
  }

  setCooldown(provider: string, retryAfterMs?: number) {
    const existing = this.cooldowns.find(c => c.provider === provider);
    if (existing) {
      existing.retryAfter = Math.max(existing.retryAfter, retryAfterMs || this.defaultCooldownMs);
      existing.timestamp = Date.now();
    } else {
      this.cooldowns.push({
        provider,
        retryAfter: retryAfterMs || this.defaultCooldownMs,
        timestamp: Date.now(),
      });
    }
  }

  clearCooldown(provider: string) {
    this.cooldowns = this.cooldowns.filter(c => c.provider !== provider);
  }
}

export const providerCooldown = new ProviderCooldownService();
