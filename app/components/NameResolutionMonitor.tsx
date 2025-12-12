/**
 * Name Resolution Performance Monitor for Perfect?
 *
 * Displays real-time performance metrics for name resolution system.
 * Only visible in development mode or when debug mode is enabled.
 */

"use client";

import { useState, useEffect } from "react";
import { FEATURE_FLAGS, getRuntimeConfig } from "@/lib/nameConfig";
import { useNameResolutionPerformance } from "@/hooks/useMobileOptimization";

interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  memoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
}

export default function NameResolutionMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
  });

  const { metrics: performanceMetrics } = useNameResolutionPerformance();

  // Only show in development or when debug logging is enabled
  useEffect(() => {
    setIsVisible(FEATURE_FLAGS.DEV_MODE || FEATURE_FLAGS.DEBUG_LOGGING);
  }, []);

  // Update metrics from performance hook
  useEffect(() => {
    setMetrics((prev) => ({
      ...prev,
      ...performanceMetrics,
      successfulRequests:
        performanceMetrics.totalRequests - performanceMetrics.failedRequests,
    }));
  }, [performanceMetrics]);

  // Check memory usage if available
  useEffect(() => {
    const updateMemoryInfo = () => {
      const memory = (
        performance as Performance & {
          memory?: { usedJSHeapSize: number; totalJSHeapSize: number };
        }
      ).memory;
      if (memory) {
        const used = memory.usedJSHeapSize;
        const total = memory.totalJSHeapSize;
        const percentage = (used / total) * 100;

        setMetrics((prev) => ({
          ...prev,
          memoryUsage: {
            used: Math.round(used / 1024 / 1024), // MB
            total: Math.round(total / 1024 / 1024), // MB
            percentage: Math.round(percentage),
          },
        }));
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return null;
  }

  const successRate =
    metrics.totalRequests > 0
      ? Math.round((metrics.successfulRequests / metrics.totalRequests) * 100)
      : 0;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black/80 backdrop-blur-sm border border-gray-600 rounded-lg p-3 text-xs font-mono text-white max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-green-400">Name Resolution Monitor</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Total Requests:</span>
            <span className="text-blue-400">{metrics.totalRequests}</span>
          </div>

          <div className="flex justify-between">
            <span>Success Rate:</span>
            <span
              className={
                successRate >= 95
                  ? "text-green-400"
                  : successRate >= 90
                    ? "text-yellow-400"
                    : "text-red-400"
              }
            >
              {successRate}%
            </span>
          </div>

          <div className="flex justify-between">
            <span>Avg Response:</span>
            <span
              className={
                metrics.averageResponseTime <= 2000
                  ? "text-green-400"
                  : metrics.averageResponseTime <= 5000
                    ? "text-yellow-400"
                    : "text-red-400"
              }
            >
              {metrics.averageResponseTime}ms
            </span>
          </div>

          <div className="flex justify-between">
            <span>Cache Hit Rate:</span>
            <span
              className={
                metrics.cacheHitRate >= 80
                  ? "text-green-400"
                  : metrics.cacheHitRate >= 60
                    ? "text-yellow-400"
                    : "text-red-400"
              }
            >
              {metrics.cacheHitRate}%
            </span>
          </div>

          {metrics.memoryUsage && (
            <div className="flex justify-between">
              <span>Memory:</span>
              <span
                className={
                  metrics.memoryUsage.percentage <= 70
                    ? "text-green-400"
                    : metrics.memoryUsage.percentage <= 85
                      ? "text-yellow-400"
                      : "text-red-400"
                }
              >
                {metrics.memoryUsage.used}MB ({metrics.memoryUsage.percentage}%)
              </span>
            </div>
          )}
        </div>

        <div className="mt-2 pt-2 border-t border-gray-600">
          <button
            onClick={() => {
              console.log("Name Resolution Config:", getRuntimeConfig());
            }}
            className="text-xs text-gray-400 hover:text-white"
          >
            Log Config to Console
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Debug panel for name resolution configuration
 */
export function NameResolutionDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const config = getRuntimeConfig();

  if (!FEATURE_FLAGS.DEV_MODE && !FEATURE_FLAGS.DEBUG_LOGGING) {
    return null;
  }

  return (
    <>
      {/* Debug toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-50 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-xs font-mono"
      >
        Debug Config
      </button>

      {/* Debug panel */}
      {isOpen && (
        <div className="fixed bottom-16 left-4 z-50 bg-black/90 backdrop-blur-sm border border-purple-600 rounded-lg p-4 text-xs font-mono text-white max-w-md max-h-96 overflow-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-purple-400">Name Resolution Debug</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-blue-400 mb-1">
                Feature Flags
              </h4>
              <div className="space-y-1 text-xs">
                {Object.entries(config.featureFlags).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-300">{key}:</span>
                    <span
                      className={
                        typeof value === "boolean"
                          ? value
                            ? "text-green-400"
                            : "text-red-400"
                          : "text-yellow-400"
                      }
                    >
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-green-400 mb-1">User Config</h4>
              <div className="space-y-1 text-xs">
                {Object.entries(config.userConfig).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-300">{key}:</span>
                    <span
                      className={
                        typeof value === "boolean"
                          ? value
                            ? "text-green-400"
                            : "text-red-400"
                          : "text-yellow-400"
                      }
                    >
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-orange-400 mb-1">
                Computed Values
              </h4>
              <div className="space-y-1 text-xs">
                {Object.entries(config.computed).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-300">{key}:</span>
                    <span
                      className={
                        typeof value === "boolean"
                          ? value
                            ? "text-green-400"
                            : "text-red-400"
                          : "text-yellow-400"
                      }
                    >
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
