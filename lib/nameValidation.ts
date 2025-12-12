/**
 * Address Validation Utilities for Perfect?
 *
 * Provides validation, sanitization, and formatting functions
 * for Ethereum addresses used in name resolution.
 */

import { isAddress, getAddress } from "viem";

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  normalized?: string;
  error?: string;
}

// Address format options
export interface AddressFormatOptions {
  checksum?: boolean;
  lowercase?: boolean;
}

/**
 * Validate Ethereum address format
 */
export function validateEthereumAddress(address: unknown): ValidationResult {
  // Check if input exists and is string
  if (!address || typeof address !== "string") {
    return {
      isValid: false,
      error: "Address must be a non-empty string",
    };
  }

  // Remove whitespace
  const trimmed = address.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: "Address cannot be empty",
    };
  }

  // Check basic format (0x prefix and length)
  if (!trimmed.startsWith("0x")) {
    return {
      isValid: false,
      error: "Address must start with 0x",
    };
  }

  if (trimmed.length !== 42) {
    return {
      isValid: false,
      error: "Address must be 42 characters long (including 0x)",
    };
  }

  // Use viem's isAddress for comprehensive validation
  if (!isAddress(trimmed)) {
    return {
      isValid: false,
      error: "Invalid Ethereum address format",
    };
  }

  return {
    isValid: true,
    normalized: trimmed.toLowerCase(),
  };
}

/**
 * Sanitize and normalize address
 */
export function sanitizeAddress(
  address: string,
  options: AddressFormatOptions = {},
): string | null {
  const { checksum = false, lowercase = true } = options;

  const validation = validateEthereumAddress(address);

  if (!validation.isValid || !validation.normalized) {
    return null;
  }

  if (checksum) {
    try {
      return getAddress(validation.normalized);
    } catch {
      return null;
    }
  }

  return lowercase
    ? validation.normalized
    : validation.normalized.toUpperCase();
}

/**
 * Batch validate multiple addresses
 */
export function validateAddressBatch(
  addresses: unknown[],
): Map<string, ValidationResult> {
  const results = new Map<string, ValidationResult>();

  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];
    const key = typeof address === "string" ? address : `index_${i}`;
    results.set(key, validateEthereumAddress(address));
  }

  return results;
}

/**
 * Filter valid addresses from array
 */
export function filterValidAddresses(addresses: unknown[]): string[] {
  const validAddresses: string[] = [];

  for (const address of addresses) {
    const validation = validateEthereumAddress(address);
    if (validation.isValid && validation.normalized) {
      validAddresses.push(validation.normalized);
    }
  }

  return validAddresses;
}

/**
 * Check if address is zero address
 */
export function isZeroAddress(address: string): boolean {
  const validation = validateEthereumAddress(address);
  if (!validation.isValid || !validation.normalized) {
    return false;
  }

  return validation.normalized === "0x0000000000000000000000000000000000000000";
}

/**
 * Compare two addresses for equality (case-insensitive)
 */
export function addressesEqual(address1: string, address2: string): boolean {
  const addr1 = sanitizeAddress(address1);
  const addr2 = sanitizeAddress(address2);

  if (!addr1 || !addr2) {
    return false;
  }

  return addr1 === addr2;
}

/**
 * Truncate address for display
 */
export function truncateAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4,
): string {
  const validation = validateEthereumAddress(address);

  if (!validation.isValid || !validation.normalized) {
    return "Invalid Address";
  }

  const addr = validation.normalized;

  if (addr.length <= startChars + endChars) {
    return addr;
  }

  return `${addr.slice(0, startChars)}...${addr.slice(-endChars)}`;
}

/**
 * Format address for different display contexts
 */
export function formatAddressForDisplay(
  address: string,
  context: "full" | "truncated" | "short" | "checksum" = "truncated",
): string {
  const validation = validateEthereumAddress(address);

  if (!validation.isValid || !validation.normalized) {
    return "Invalid Address";
  }

  const addr = validation.normalized;

  switch (context) {
    case "full":
      return addr;

    case "checksum":
      try {
        return getAddress(addr);
      } catch {
        return addr;
      }

    case "short":
      return truncateAddress(addr, 4, 2);

    case "truncated":
    default:
      return truncateAddress(addr, 6, 4);
  }
}

/**
 * Validate API request parameters for address-based endpoints
 */
export function validateApiAddressParam(param: unknown): {
  isValid: boolean;
  address?: string;
  error?: string;
} {
  if (!param) {
    return {
      isValid: false,
      error: "Address parameter is required",
    };
  }

  const validation = validateEthereumAddress(param);

  if (!validation.isValid) {
    return {
      isValid: false,
      error: validation.error || "Invalid address format",
    };
  }

  return {
    isValid: true,
    address: validation.normalized,
  };
}

/**
 * Validate batch API request parameters
 */
export function validateApiBatchParams(params: {
  addresses?: unknown;
  maxBatchSize?: number;
}): {
  isValid: boolean;
  addresses?: string[];
  error?: string;
} {
  const { addresses, maxBatchSize = 50 } = params;

  if (!addresses) {
    return {
      isValid: false,
      error: "Addresses parameter is required",
    };
  }

  if (!Array.isArray(addresses)) {
    return {
      isValid: false,
      error: "Addresses must be an array",
    };
  }

  if (addresses.length === 0) {
    return {
      isValid: false,
      error: "At least one address is required",
    };
  }

  if (addresses.length > maxBatchSize) {
    return {
      isValid: false,
      error: `Maximum ${maxBatchSize} addresses allowed per request`,
    };
  }

  const validAddresses = filterValidAddresses(addresses);

  if (validAddresses.length === 0) {
    return {
      isValid: false,
      error: "No valid addresses found in request",
    };
  }

  return {
    isValid: true,
    addresses: validAddresses,
  };
}

/**
 * Create address validation middleware for API routes
 */
export function createAddressValidator(required: boolean = true) {
  return (address: unknown) => {
    if (!required && !address) {
      return { isValid: true };
    }

    return validateApiAddressParam(address);
  };
}

/**
 * Utility to extract address from various input formats
 */
export function extractAddress(input: unknown): string | null {
  // Direct string
  if (typeof input === "string") {
    const sanitized = sanitizeAddress(input);
    return sanitized;
  }

  // Object with address property
  if (input && typeof input === "object" && "address" in input) {
    const addr = (input as { address: unknown }).address;
    if (typeof addr === "string") {
      return sanitizeAddress(addr);
    }
  }

  return null;
}
