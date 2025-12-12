/**
 * Error Handling Utilities for Name Resolution
 *
 * Provides centralized error handling with user-friendly messages
 * and graceful degradation strategies.
 */

export enum ErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  API_ERROR = "API_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  CIRCUIT_BREAKER_OPEN = "CIRCUIT_BREAKER_OPEN",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface NameResolutionError {
  type: ErrorType;
  message: string;
  userMessage: string;
  recoverable: boolean;
  retryAfter?: number; // milliseconds
  fallbackStrategy: FallbackStrategy;
}

export enum FallbackStrategy {
  TRUNCATED_ADDRESS = "TRUNCATED_ADDRESS",
  CACHED_RESULT = "CACHED_RESULT",
  RETRY_LATER = "RETRY_LATER",
  SKIP_RESOLUTION = "SKIP_RESOLUTION",
}

/**
 * Error classification and handling
 */
export class ErrorHandler {
  /**
   * Classify an error and return structured error information
   */
  static classifyError(error: unknown): NameResolutionError {
    if (error instanceof Error) {
      // Network-related errors
      if (error.name === "AbortError" || error.message.includes("timeout")) {
        return {
          type: ErrorType.TIMEOUT_ERROR,
          message: error.message,
          userMessage: "Request timed out. Names may take longer to load.",
          recoverable: true,
          retryAfter: 5000,
          fallbackStrategy: FallbackStrategy.CACHED_RESULT,
        };
      }

      if (
        error.message.includes("fetch") ||
        error.message.includes("network")
      ) {
        return {
          type: ErrorType.NETWORK_ERROR,
          message: error.message,
          userMessage:
            "Network connection issue. Using cached names when available.",
          recoverable: true,
          retryAfter: 10000,
          fallbackStrategy: FallbackStrategy.CACHED_RESULT,
        };
      }

      // Circuit breaker errors
      if (error.message.includes("Circuit breaker is OPEN")) {
        return {
          type: ErrorType.CIRCUIT_BREAKER_OPEN,
          message: error.message,
          userMessage:
            "Name service temporarily unavailable. Showing simplified addresses.",
          recoverable: true,
          retryAfter: 30000,
          fallbackStrategy: FallbackStrategy.TRUNCATED_ADDRESS,
        };
      }

      // API errors
      if (error.message.includes("API returned")) {
        const statusMatch = error.message.match(/(\d{3})/);
        const status = statusMatch ? parseInt(statusMatch[1]) : 0;

        if (status === 429) {
          return {
            type: ErrorType.RATE_LIMIT_ERROR,
            message: error.message,
            userMessage:
              "Too many requests. Name resolution temporarily limited.",
            recoverable: true,
            retryAfter: 60000,
            fallbackStrategy: FallbackStrategy.CACHED_RESULT,
          };
        }

        if (status >= 500) {
          return {
            type: ErrorType.API_ERROR,
            message: error.message,
            userMessage:
              "Name service temporarily down. Using fallback display.",
            recoverable: true,
            retryAfter: 30000,
            fallbackStrategy: FallbackStrategy.TRUNCATED_ADDRESS,
          };
        }

        if (status >= 400) {
          return {
            type: ErrorType.VALIDATION_ERROR,
            message: error.message,
            userMessage: "Invalid request. Showing simplified address.",
            recoverable: false,
            fallbackStrategy: FallbackStrategy.TRUNCATED_ADDRESS,
          };
        }
      }
    }

    // Unknown error
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: String(error),
      userMessage:
        "Unexpected error occurred. Using simplified address display.",
      recoverable: false,
      fallbackStrategy: FallbackStrategy.TRUNCATED_ADDRESS,
    };
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: unknown): string {
    const classified = this.classifyError(error);
    return classified.userMessage;
  }

  /**
   * Determine if error is recoverable
   */
  static isRecoverable(error: unknown): boolean {
    const classified = this.classifyError(error);
    return classified.recoverable;
  }

  /**
   * Get recommended retry delay
   */
  static getRetryDelay(error: unknown): number | null {
    const classified = this.classifyError(error);
    return classified.retryAfter || null;
  }

  /**
   * Get fallback strategy for error
   */
  static getFallbackStrategy(error: unknown): FallbackStrategy {
    const classified = this.classifyError(error);
    return classified.fallbackStrategy;
  }
}

/**
 * Graceful degradation utility
 */
export class GracefulDegradation {
  /**
   * Apply fallback strategy based on error type
   */
  static applyFallback(
    address: string,
    error: unknown,
    cachedResult?: { name: string; source: string } | null,
  ): {
    name: string;
    source: "ens" | "basename" | "wallet";
    fromFallback: true;
  } {
    const strategy = ErrorHandler.getFallbackStrategy(error);

    switch (strategy) {
      case FallbackStrategy.CACHED_RESULT:
        if (cachedResult) {
          return {
            name: cachedResult.name,
            source: cachedResult.source as "ens" | "basename" | "wallet",
            fromFallback: true,
          };
        }
      // Fall through to truncated address if no cache

      case FallbackStrategy.TRUNCATED_ADDRESS:
        return {
          name: `${address.slice(0, 6)}...${address.slice(-4)}`,
          source: "wallet",
          fromFallback: true,
        };

      case FallbackStrategy.SKIP_RESOLUTION:
        return {
          name: address,
          source: "wallet",
          fromFallback: true,
        };

      default:
        return {
          name: `${address.slice(0, 6)}...${address.slice(-4)}`,
          source: "wallet",
          fromFallback: true,
        };
    }
  }

  /**
   * Check if we should attempt resolution based on error history
   */
  static shouldAttemptResolution(
    address: string,
    errorHistory: Map<
      string,
      { count: number; lastError: number; type: ErrorType }
    >,
  ): boolean {
    const history = errorHistory.get(address);

    if (!history) return true;

    const now = Date.now();
    const timeSinceLastError = now - history.lastError;

    // Don't attempt if we've had too many recent errors
    if (history.count >= 3 && timeSinceLastError < 60000) {
      // 1 minute
      return false;
    }

    // Don't attempt if last error was validation error (permanent)
    if (history.type === ErrorType.VALIDATION_ERROR) {
      return false;
    }

    // Allow retry after sufficient time has passed
    const retryDelays = {
      [ErrorType.NETWORK_ERROR]: 30000, // 30 seconds
      [ErrorType.TIMEOUT_ERROR]: 15000, // 15 seconds
      [ErrorType.API_ERROR]: 60000, // 1 minute
      [ErrorType.RATE_LIMIT_ERROR]: 120000, // 2 minutes
      [ErrorType.CIRCUIT_BREAKER_OPEN]: 60000, // 1 minute
      [ErrorType.UNKNOWN_ERROR]: 30000, // 30 seconds
      [ErrorType.VALIDATION_ERROR]: Infinity, // Never retry
    };

    const requiredDelay = retryDelays[history.type] || 30000;
    return timeSinceLastError >= requiredDelay;
  }

  /**
   * Record error for future decision making
   */
  static recordError(
    address: string,
    error: unknown,
    errorHistory: Map<
      string,
      { count: number; lastError: number; type: ErrorType }
    >,
  ): void {
    const classified = ErrorHandler.classifyError(error);
    const existing = errorHistory.get(address);

    if (existing && existing.type === classified.type) {
      // Increment count for same error type
      existing.count++;
      existing.lastError = Date.now();
    } else {
      // New error type or first error
      errorHistory.set(address, {
        count: 1,
        lastError: Date.now(),
        type: classified.type,
      });
    }

    // Clean up old entries (older than 1 hour)
    const oneHourAgo = Date.now() - 3600000;
    for (const [addr, history] of errorHistory.entries()) {
      if (history.lastError < oneHourAgo) {
        errorHistory.delete(addr);
      }
    }
  }
}

/**
 * User notification utility for errors
 */
export interface ErrorNotification {
  id: string;
  message: string;
  type: "warning" | "error" | "info";
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

export class ErrorNotificationManager {
  private static notifications: Map<string, ErrorNotification> = new Map();
  private static listeners: Set<(notifications: ErrorNotification[]) => void> =
    new Set();

  /**
   * Add error notification
   */
  static notify(error: unknown): string {
    const classified = ErrorHandler.classifyError(error);
    const id = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const notification: ErrorNotification = {
      id,
      message: classified.userMessage,
      type: classified.recoverable ? "warning" : "error",
      duration: classified.recoverable ? 5000 : 8000,
    };

    // Add retry action for recoverable errors
    if (classified.recoverable && classified.retryAfter) {
      notification.action = {
        label: "Retry",
        handler: () => {
          this.dismiss(id);
          // Retry logic would be handled by the caller
        },
      };
    }

    this.notifications.set(id, notification);
    this.notifyListeners();

    // Auto-dismiss after duration
    if (notification.duration) {
      setTimeout(() => {
        this.dismiss(id);
      }, notification.duration);
    }

    return id;
  }

  /**
   * Dismiss notification
   */
  static dismiss(id: string): void {
    this.notifications.delete(id);
    this.notifyListeners();
  }

  /**
   * Get all active notifications
   */
  static getNotifications(): ErrorNotification[] {
    return Array.from(this.notifications.values());
  }

  /**
   * Add listener for notification changes
   */
  static addListener(
    listener: (notifications: ErrorNotification[]) => void,
  ): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private static notifyListeners(): void {
    const notifications = this.getNotifications();
    this.listeners.forEach((listener) => {
      try {
        listener(notifications);
      } catch (error) {
        console.warn("Error in notification listener:", error);
      }
    });
  }

  /**
   * Clear all notifications
   */
  static clear(): void {
    this.notifications.clear();
    this.notifyListeners();
  }
}
