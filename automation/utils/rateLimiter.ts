/**
 * Rate limiter utility for API calls
 * Prevents hitting API rate limits
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests = new Map<string, number[]>();

  constructor(private config: RateLimitConfig) {}

  /**
   * Check if request is allowed
   * @param key Unique identifier (e.g., API endpoint, user ID)
   * @returns true if allowed, false if rate limited
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const recentRequests = requests.filter((time) => now - time < this.config.windowMs);

    if (recentRequests.length >= this.config.maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);

    return true;
  }

  /**
   * Get time until next request is allowed (in ms)
   */
  getTimeUntilAllowed(key: string): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const recentRequests = requests.filter((time) => now - time < this.config.windowMs);

    if (recentRequests.length < this.config.maxRequests) {
      return 0;
    }

    const oldestRequest = recentRequests[0];
    return this.config.windowMs - (now - oldestRequest);
  }

  /**
   * Wait until request is allowed
   */
  async waitUntilAllowed(key: string): Promise<void> {
    const waitTime = this.getTimeUntilAllowed(key);
    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  /**
   * Clear rate limit data for a key
   */
  clear(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limit data
   */
  clearAll(): void {
    this.requests.clear();
  }
}

// Pre-configured rate limiters for common APIs
export const rateLimiters = {
  // LLM APIs: 60 requests per minute
  llm: new RateLimiter({ maxRequests: 60, windowMs: 60 * 1000 }),
  
  // Media APIs: 30 requests per minute
  media: new RateLimiter({ maxRequests: 30, windowMs: 60 * 1000 }),
  
  // Social APIs: 100 requests per minute
  social: new RateLimiter({ maxRequests: 100, windowMs: 60 * 1000 }),
  
  // Generic: 50 requests per minute
  default: new RateLimiter({ maxRequests: 50, windowMs: 60 * 1000 }),
};

export { RateLimiter };

