/**
 * Name Resolution Configuration for Perfect?
 *
 * Provides centralized configuration management for name resolution features
 * including feature flags and user preferences.
 */

export interface NameResolutionConfig {
  nameResolutionEnabled: boolean;
  ensEnabled: boolean;
  baseNamesEnabled: boolean;
  nameDisplayFormat: "name-only" | "name-with-badge" | "name-and-address";
  privacyMode: boolean;
}

export const DEFAULT_NAME_CONFIG: NameResolutionConfig = {
  nameResolutionEnabled: true,
  ensEnabled: true,
  baseNamesEnabled: true,
  nameDisplayFormat: "name-with-badge",
  privacyMode: false,
};

/**
 * Environment-based feature flags
 */
export const FEATURE_FLAGS = {
  // Enable/disable entire name resolution system
  NAME_RESOLUTION_ENABLED:
    process.env.NEXT_PUBLIC_NAME_RESOLUTION_ENABLED !== "false",

  // Enable/disable specific name services
  ENS_ENABLED: process.env.NEXT_PUBLIC_ENS_ENABLED !== "false",
  BASE_NAMES_ENABLED: process.env.NEXT_PUBLIC_BASE_NAMES_ENABLED !== "false",

  // Performance settings
  BATCH_SIZE_LIMIT: parseInt(process.env.NEXT_PUBLIC_BATCH_SIZE_LIMIT || "50"),
  CACHE_TTL_SUCCESS: parseInt(
    process.env.NEXT_PUBLIC_CACHE_TTL_SUCCESS || "3600000",
  ), // 1 hour
  CACHE_TTL_FAILURE: parseInt(
    process.env.NEXT_PUBLIC_CACHE_TTL_FAILURE || "300000",
  ), // 5 minutes

  // Development mode overrides
  DEV_MODE: process.env.NODE_ENV === "development",
  DEBUG_LOGGING: process.env.NEXT_PUBLIC_DEBUG_NAME_RESOLUTION === "true",
};

/**
 * Get user's name resolution configuration from localStorage
 */
export function getNameConfig(): NameResolutionConfig {
  if (typeof window === "undefined") {
    return DEFAULT_NAME_CONFIG;
  }

  try {
    const saved = localStorage.getItem("perfect-name-settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_NAME_CONFIG,
        ...parsed,
      };
    }
  } catch (error) {
    console.warn("Failed to load name resolution config:", error);
  }

  return DEFAULT_NAME_CONFIG;
}

/**
 * Save user's name resolution configuration to localStorage
 */
export function saveNameConfig(config: Partial<NameResolutionConfig>): void {
  if (typeof window === "undefined") return;

  try {
    const current = getNameConfig();
    const updated = { ...current, ...config };
    localStorage.setItem("perfect-name-settings", JSON.stringify(updated));
  } catch (error) {
    console.warn("Failed to save name resolution config:", error);
  }
}

/**
 * Check if name resolution is enabled (combines feature flags and user preferences)
 */
export function isNameResolutionEnabled(): boolean {
  if (!FEATURE_FLAGS.NAME_RESOLUTION_ENABLED) {
    return false;
  }

  const config = getNameConfig();
  return config.nameResolutionEnabled;
}

/**
 * Check if ENS resolution is enabled
 */
export function isEnsEnabled(): boolean {
  if (!FEATURE_FLAGS.ENS_ENABLED || !isNameResolutionEnabled()) {
    return false;
  }

  const config = getNameConfig();
  return config.ensEnabled;
}

/**
 * Check if Base names resolution is enabled
 */
export function isBaseNamesEnabled(): boolean {
  if (!FEATURE_FLAGS.BASE_NAMES_ENABLED || !isNameResolutionEnabled()) {
    return false;
  }

  const config = getNameConfig();
  return config.baseNamesEnabled;
}

/**
 * Get the user's preferred display format
 */
export function getDisplayFormat():
  | "name-only"
  | "name-with-badge"
  | "name-and-address" {
  const config = getNameConfig();
  return config.nameDisplayFormat;
}

/**
 * Check if privacy mode is enabled
 */
export function isPrivacyModeEnabled(): boolean {
  const config = getNameConfig();
  return config.privacyMode;
}

/**
 * Get runtime configuration for debugging
 */
export function getRuntimeConfig() {
  return {
    featureFlags: FEATURE_FLAGS,
    userConfig: getNameConfig(),
    computed: {
      nameResolutionEnabled: isNameResolutionEnabled(),
      ensEnabled: isEnsEnabled(),
      baseNamesEnabled: isBaseNamesEnabled(),
      displayFormat: getDisplayFormat(),
      privacyMode: isPrivacyModeEnabled(),
    },
  };
}

/**
 * Development helper to log configuration
 */
export function debugConfig() {
  if (FEATURE_FLAGS.DEBUG_LOGGING) {
    console.log("Name Resolution Config:", getRuntimeConfig());
  }
}
