import { NextRequest, NextResponse } from "next/server";
import { batchResolveDisplayNames } from "@/lib/nameResolver";
import { validateApiBatchParams } from "@/lib/nameValidation";
import { getNameCache } from "@/lib/nameCache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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

    // Check cache for existing resolutions
    const cachedResults = cache.getBatch(addresses);
    const uncachedAddresses = addresses.filter(
      (addr) => !cachedResults.has(addr.toLowerCase()),
    );

    // Resolve uncached addresses
    let newResolutions = new Map();
    if (uncachedAddresses.length > 0) {
      newResolutions = await batchResolveDisplayNames(uncachedAddresses, {
        timeout: 5000,
      });

      // Cache new resolutions
      cache.setBatch(Array.from(newResolutions.values()));
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

    // Add cached results
    for (const [address, resolution] of cachedResults) {
      allResults[address] = {
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
