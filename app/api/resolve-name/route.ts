import { NextRequest, NextResponse } from "next/server";
import { resolveDisplayName } from "@/lib/nameResolver";
import { validateApiAddressParam } from "@/lib/nameValidation";
import { getNameCache } from "@/lib/nameCache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const addressParam = searchParams.get("address");

    // Get configuration parameters from query
    const ensEnabled = searchParams.get("ensEnabled") !== "false";
    const baseNamesEnabled = searchParams.get("baseNamesEnabled") !== "false";

    // Validate address parameter
    const validation = validateApiAddressParam(addressParam);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          name: null,
          source: null,
          error: validation.error,
        },
        { status: 400 },
      );
    }

    const address = validation.address!;
    const cache = getNameCache();

    // Create cache key that includes configuration
    const cacheKey = `${address}-${ensEnabled}-${baseNamesEnabled}`;

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        name: cached.name,
        source: cached.source,
        cached: true,
      });
    }

    // Resolve name with configuration options
    const resolution = await resolveDisplayName(address, {
      timeout: 5000,
      enableEns: ensEnabled,
      enableBasenames: baseNamesEnabled,
    });

    // Cache the result with the configuration-specific key
    cache.set({
      ...resolution,
      address: cacheKey, // Use the config-specific key for caching
    });

    return NextResponse.json({
      name: resolution.name,
      source: resolution.source,
      cached: false,
    });
  } catch (error) {
    console.error("[API] Name resolution failed:", error);

    return NextResponse.json(
      {
        name: null,
        source: null,
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
