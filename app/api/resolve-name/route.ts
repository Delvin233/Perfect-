import { NextRequest, NextResponse } from "next/server";
import { resolveDisplayName } from "@/lib/nameResolver";
import { validateApiAddressParam } from "@/lib/nameValidation";
import { getNameCache } from "@/lib/nameCache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const addressParam = searchParams.get("address");

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

    // Check cache first
    const cached = cache.get(address);
    if (cached) {
      return NextResponse.json({
        name: cached.name,
        source: cached.source,
        cached: true,
      });
    }

    // Resolve name with timeout
    const resolution = await resolveDisplayName(address, { timeout: 5000 });

    // Cache the result
    cache.set(resolution);

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
