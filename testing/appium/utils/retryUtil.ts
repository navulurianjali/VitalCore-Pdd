import { Logger } from './logger';

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  delayMs: number = 1000,
  testId?: string,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt <= maxRetries) {
        Logger.warn(`${testId || 'Test'} – Retry ${attempt}/${maxRetries} after error: ${err}`);
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
  }
  throw lastError;
}
