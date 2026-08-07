import { Logger } from './logger';

export class RetryUtil {
  public static async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 2,
    delayMs: number = 1000
  ): Promise<T> {
    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        return await fn();
      } catch (error) {
        attempt++;
        if (attempt > maxRetries) {
          throw error;
        }
        Logger.warn(`Retry attempt ${attempt}/${maxRetries} after error: ${(error as Error).message}`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw new Error('Execute with retry failed unexpectedly');
  }
}
