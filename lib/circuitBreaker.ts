/**
 * Circuit Breaker Pattern for Name Resolution
 *
 * Implements circuit breaker pattern to handle failing API providers
 * and prevent cascading failures in the name resolution system.
 */

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening circuit
  resetTimeout: number; // Time to wait before trying again (ms)
  monitoringWindow: number; // Time window for failure counting (ms)
}

export enum CircuitState {
  CLOSED = "CLOSED", // Normal operation
  OPEN = "OPEN", // Circuit is open, requests fail fast
  HALF_OPEN = "HALF_OPEN", // Testing if service is back
}

interface CircuitBreakerStats {
  failures: number;
  successes: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  state: CircuitState;
}

export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private stats: CircuitBreakerStats;
  private failureTimestamps: number[] = [];

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringWindow: 300000, // 5 minutes
      ...config,
    };

    this.stats = {
      failures: 0,
      successes: 0,
      lastFailureTime: 0,
      lastSuccessTime: 0,
      state: CircuitState.CLOSED,
    };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.stats.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.stats.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error("Circuit breaker is OPEN - service unavailable");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Record a successful operation
   */
  private onSuccess(): void {
    this.stats.successes++;
    this.stats.lastSuccessTime = Date.now();

    if (this.stats.state === CircuitState.HALF_OPEN) {
      // Reset circuit breaker on successful half-open attempt
      this.reset();
    }
  }

  /**
   * Record a failed operation
   */
  private onFailure(): void {
    const now = Date.now();
    this.stats.failures++;
    this.stats.lastFailureTime = now;
    this.failureTimestamps.push(now);

    // Clean old failure timestamps outside monitoring window
    this.cleanOldFailures();

    // Check if we should open the circuit
    if (this.failureTimestamps.length >= this.config.failureThreshold) {
      this.stats.state = CircuitState.OPEN;
    }
  }

  /**
   * Check if we should attempt to reset the circuit breaker
   */
  private shouldAttemptReset(): boolean {
    const now = Date.now();
    return now - this.stats.lastFailureTime >= this.config.resetTimeout;
  }

  /**
   * Reset the circuit breaker to closed state
   */
  private reset(): void {
    this.stats.state = CircuitState.CLOSED;
    this.stats.failures = 0;
    this.failureTimestamps = [];
  }

  /**
   * Remove failure timestamps outside the monitoring window
   */
  private cleanOldFailures(): void {
    const now = Date.now();
    const cutoff = now - this.config.monitoringWindow;
    this.failureTimestamps = this.failureTimestamps.filter(
      (timestamp) => timestamp > cutoff,
    );
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats & { config: CircuitBreakerConfig } {
    return {
      ...this.stats,
      config: this.config,
    };
  }

  /**
   * Check if the circuit is available for requests
   */
  isAvailable(): boolean {
    return this.stats.state !== CircuitState.OPEN;
  }
}

/**
 * Exponential backoff utility for retries
 */
export class ExponentialBackoff {
  private attempt: number = 0;
  private readonly baseDelay: number;
  private readonly maxDelay: number;
  private readonly maxAttempts: number;

  constructor(
    baseDelay: number = 1000,
    maxDelay: number = 30000,
    maxAttempts: number = 3,
  ) {
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
    this.maxAttempts = maxAttempts;
  }

  /**
   * Execute function with exponential backoff retry
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (this.attempt = 0; this.attempt < this.maxAttempts; this.attempt++) {
      try {
        const result = await fn();
        this.reset();
        return result;
      } catch (error) {
        lastError = error as Error;

        if (this.attempt < this.maxAttempts - 1) {
          await this.delay();
        }
      }
    }

    throw lastError!;
  }

  /**
   * Calculate delay for current attempt
   */
  private calculateDelay(): number {
    const delay = this.baseDelay * Math.pow(2, this.attempt);
    return Math.min(delay, this.maxDelay);
  }

  /**
   * Wait for the calculated delay
   */
  private delay(): Promise<void> {
    const delayMs = this.calculateDelay();
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  /**
   * Reset the backoff state
   */
  private reset(): void {
    this.attempt = 0;
  }

  /**
   * Get current attempt number
   */
  getCurrentAttempt(): number {
    return this.attempt;
  }
}

/**
 * Global circuit breakers for different services
 */
export const circuitBreakers = {
  ens: new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 30000, // 30 seconds
    monitoringWindow: 120000, // 2 minutes
  }),

  basename: new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minute
    monitoringWindow: 300000, // 5 minutes
  }),

  batch: new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 45000, // 45 seconds
    monitoringWindow: 180000, // 3 minutes
  }),
};

/**
 * Health check utility
 */
export class HealthChecker {
  private static instance: HealthChecker;
  private healthStatus: Map<string, boolean> = new Map();
  private lastChecked: Map<string, number> = new Map();
  private readonly checkInterval = 60000; // 1 minute

  static getInstance(): HealthChecker {
    if (!HealthChecker.instance) {
      HealthChecker.instance = new HealthChecker();
    }
    return HealthChecker.instance;
  }

  /**
   * Check health of a service
   */
  async checkHealth(
    serviceName: string,
    healthCheckFn: () => Promise<boolean>,
  ): Promise<boolean> {
    const now = Date.now();
    const lastCheck = this.lastChecked.get(serviceName) || 0;

    // Use cached result if checked recently
    if (now - lastCheck < this.checkInterval) {
      return this.healthStatus.get(serviceName) || false;
    }

    try {
      const isHealthy = await healthCheckFn();
      this.healthStatus.set(serviceName, isHealthy);
      this.lastChecked.set(serviceName, now);
      return isHealthy;
    } catch (error) {
      console.warn(`Health check failed for ${serviceName}:`, error);
      this.healthStatus.set(serviceName, false);
      this.lastChecked.set(serviceName, now);
      return false;
    }
  }

  /**
   * Get health status for all services
   */
  getAllHealthStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    for (const [service, healthy] of this.healthStatus) {
      status[service] = healthy;
    }
    return status;
  }

  /**
   * Reset health status for a service
   */
  resetHealth(serviceName: string): void {
    this.healthStatus.delete(serviceName);
    this.lastChecked.delete(serviceName);
  }
}
