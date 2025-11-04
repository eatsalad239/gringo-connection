/**
 * Retry utility with exponential backoff
 * Improves reliability for API calls
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: number[]; // HTTP status codes to retry
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableErrors: [429, 500, 502, 503, 504], // Rate limit, server errors
};

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | unknown;
  let delay = opts.initialDelay;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;

      // Check if error is retryable
      const isRetryable = isRetryableError(error, opts.retryableErrors);

      if (attempt === opts.maxAttempts || !isRetryable) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);

      console.warn(`Retry attempt ${attempt}/${opts.maxAttempts} after ${delay}ms`);
    }
  }

  throw lastError;
}

function isRetryableError(error: unknown, retryableStatuses: number[]): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    return retryableStatuses.includes(error.status as number);
  }

  // Network errors are always retryable
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  return false;
}

/**
 * Wrapper for fetch with retry logic
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions?: RetryOptions
): Promise<Response> {
  return retry(
    async () => {
      const response = await fetch(url, options);
      if (!response.ok && retryOptions?.retryableErrors?.includes(response.status)) {
        throw { status: response.status, message: response.statusText };
      }
      return response;
    },
    retryOptions
  );
}

