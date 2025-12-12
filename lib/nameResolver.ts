/**
 * Name Resolution Library for Perfect?
 *
 * Resolves display names for Ethereum addresses using:
 * 1. ENS names (Ethereum mainnet)
 * 2. Base names (Base network)
 * 3. Truncated address (fallback)
 *
 * Based on proven patterns from rps-onchain project.
 */

import { createPublicClient, http, isAddress } from "viem";
import { mainnet } from "viem/chains";

// Types
export interface NameResolution {
  address: string;
  name: string | null;
  source: "ens" | "basename" | "wallet";
  timestamp: number;
}

export interface ResolveOptions {
  timeout?: number;
  skipCache?: boolean;
  enableEns?: boolean;
  enableBasenames?: boolean;
}

// Constants
const DEFAULT_TIMEOUT = 5000; // 5 seconds
const BASENAME_CONTRACT = "0x03c4738ee98ae44591e1a4a4f3cab6641d95dd9a";

// Create public client for ENS resolution
const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

/**
 * Validate and normalize Ethereum address
 */
export function validateAddress(address: string): string | null {
  if (!address || typeof address !== "string") {
    return null;
  }

  // Remove whitespace and ensure proper format
  const cleanAddress = address.trim();

  if (!isAddress(cleanAddress)) {
    return null;
  }

  // Return lowercase for consistency
  return cleanAddress.toLowerCase();
}

/**
 * Truncate address for display fallback
 */
export function truncateAddress(address: string): string {
  const validated = validateAddress(address);
  if (!validated) {
    return "Invalid Address";
  }

  return `${validated.slice(0, 6)}...${validated.slice(-4)}`;
}

/**
 * Resolve ENS name for an address with timeout
 */
export async function resolveENS(
  address: string,
  options: ResolveOptions = {},
): Promise<string | null> {
  const { timeout = DEFAULT_TIMEOUT } = options;

  const validatedAddress = validateAddress(address);
  if (!validatedAddress) {
    return null;
  }

  try {
    // Create timeout promise
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error("ENS resolution timeout")), timeout);
    });

    // Race between ENS resolution and timeout
    const ensName = await Promise.race([
      mainnetClient.getEnsName({
        address: validatedAddress as `0x${string}`,
      }),
      timeoutPromise,
    ]);

    return ensName;
  } catch (error) {
    console.warn("[NameResolver] ENS resolution failed:", error);
    return null;
  }
}

/**
 * Resolve Base name using Alchemy API with timeout
 */
export async function resolveBasename(
  address: string,
  options: ResolveOptions = {},
): Promise<string | null> {
  const { timeout = DEFAULT_TIMEOUT } = options;

  const validatedAddress = validateAddress(address);
  if (!validatedAddress) {
    return null;
  }

  // Check if we have Alchemy API key
  const alchemyKey =
    process.env.ALCHEMY_API_KEY || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  if (!alchemyKey) {
    console.warn(
      "[NameResolver] ALCHEMY_API_KEY not configured, skipping Base name resolution",
    );
    return null;
  }

  try {
    // Create timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const url = `https://base-mainnet.g.alchemy.com/nft/v2/${alchemyKey}/getNFTs?owner=${validatedAddress}&contractAddresses[]=${BASENAME_CONTRACT}`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[NameResolver] Alchemy API returned ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.ownedNfts && data.ownedNfts.length > 0) {
      const basename = data.ownedNfts[0]?.name || data.ownedNfts[0]?.title;
      return basename || null;
    }

    return null;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("[NameResolver] Base name resolution timeout");
    } else {
      console.warn("[NameResolver] Base name resolution failed:", error);
    }
    return null;
  }
}

/**
 * Resolve display name with priority order: ENS > Base name > truncated address
 */
export async function resolveDisplayName(
  address: string,
  options: ResolveOptions = {},
): Promise<NameResolution> {
  const { enableEns = true, enableBasenames = true } = options;
  const validatedAddress = validateAddress(address);
  const timestamp = Date.now();

  if (!validatedAddress) {
    return {
      address: address,
      name: "Invalid Address",
      source: "wallet",
      timestamp,
    };
  }

  try {
    // Try ENS first (highest priority) - only if enabled
    if (enableEns) {
      const ensName = await resolveENS(validatedAddress, options);
      if (ensName) {
        return {
          address: validatedAddress,
          name: ensName,
          source: "ens",
          timestamp,
        };
      }
    }

    // Try Base name second - only if enabled
    if (enableBasenames) {
      const basename = await resolveBasename(validatedAddress, options);
      if (basename) {
        return {
          address: validatedAddress,
          name: basename,
          source: "basename",
          timestamp,
        };
      }
    }

    // Fallback to truncated address
    const truncated = truncateAddress(validatedAddress);
    return {
      address: validatedAddress,
      name: truncated,
      source: "wallet",
      timestamp,
    };
  } catch (error) {
    console.error("[NameResolver] Resolution failed:", error);

    // Always fallback to truncated address
    const truncated = truncateAddress(validatedAddress);
    return {
      address: validatedAddress,
      name: truncated,
      source: "wallet",
      timestamp,
    };
  }
}

/**
 * Batch resolve display names for multiple addresses
 */
export async function batchResolveDisplayNames(
  addresses: string[],
  options: ResolveOptions = {},
): Promise<Map<string, NameResolution>> {
  const results = new Map<string, NameResolution>();

  if (addresses.length === 0) {
    return results;
  }

  // Process in parallel with reasonable batch size
  const batchSize = 10;
  const batches: string[][] = [];

  for (let i = 0; i < addresses.length; i += batchSize) {
    batches.push(addresses.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const promises = batch.map((address) =>
      resolveDisplayName(address, options),
    );
    const batchResults = await Promise.all(promises);

    batchResults.forEach((result) => {
      results.set(result.address, result);
    });
  }

  return results;
}

/**
 * Check if a name resolution is still valid (for caching)
 */
export function isResolutionValid(
  resolution: NameResolution,
  ttlMs: number = 3600000,
): boolean {
  const now = Date.now();
  return now - resolution.timestamp < ttlMs;
}
