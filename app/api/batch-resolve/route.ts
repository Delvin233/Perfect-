import { NextRequest, NextResponse } from "next/server";
import { batchResolveDisplayNames } from "@/lib/nameResolver";
import { validateApiBatchParams } from "@/lib/nameValidation";
import { getNameCache } from "@/lib/nameCache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get configuration parameters from request body
    const ensEnabled = body.ensEnabled !== false;
    const baseNamesEnabled = body.baseNamesEnabled !== false;

    // Validate batch parameters
    const validation = validateApiBatchParams({
      addresses: body.addresses,
      maxBatchSize: 50,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        {
          results: {},
          error: validation.error,
        },
        { status: 400 },
      );
    }

    const addresses = validation.addresses!;
    const cache = getNameCache();

    // Create configuration-aware cache keys
    const configSuffix = `-${ensEnabled}-${baseNamesEnabled}`;
    const configAwareAddresses = addresses.map(
      (addr) => `${addr}${configSuffix}`,
    );

    // Check cache for existing resolutions using config-aware keys
    const cachedResults = cache.getBatch(configAwareAddresses);
    const uncachedConfigKeys = configAwareAddresses.filter(
      (configKey) => !cachedResults.has(configKey.toLowerCase()),
    );

    // Extract original addresses from uncached config keys
    const uncachedAddresses = uncachedConfigKeys.map((configKey) =>
      configKey.replace(configSuffix, ""),
    );

    // Resolve uncached addresses
    let newResolutions = new Map();
    if (uncachedAddresses.length > 0) {
      newResolutions = await batchResolveDisplayNames(uncachedAddresses, {
        timeout: 5000,
        enableEns: ensEnabled,
        enableBasenames: baseNamesEnabled,
      });

      // Cache new resolutions with config-aware keys
      const configAwareResolutions = Array.from(newResolutions.values()).map(
        (resolution) => ({
          ...resolution,
          address: `${resolution.address}${configSuffix}`, // Use config-aware key for caching
        }),
      );
      cache.setBatch(configAwareResolutions);
    }

    // Combine cached and new results
    const allResults: Record<
      string,
      {
        name: string | null;
        source: "ens" | "basename" | "wallet";
        cached: boolean;
      }
    > = {};

    // Add cached results (convert config-aware keys back to original addresses)
    for (const [configKey, resolution] of cachedResults) {
      const originalAddress = configKey.replace(configSuffix, "");
      allResults[originalAddress] = {
        name: resolution.name,
        source: resolution.source,
        cached: true,
      };
    }

    // Add new results
    for (const [address, resolution] of newResolutions) {
      allResults[address] = {
        name: resolution.name,
        source: resolution.source,
        cached: false,
      };
    }

    return NextResponse.json({
      results: allResults,
      totalRequested: addresses.length,
      cached: cachedResults.size,
      resolved: newResolutions.size,
    });
  } catch (error) {
    console.error("[API] Batch name resolution failed:", error);

    return NextResponse.json(
      {
        results: {},
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
