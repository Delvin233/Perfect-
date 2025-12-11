import { NextRequest, NextResponse } from "next/server";
import { resolveBasename } from "@/lib/nameResolver";
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
          error: validation.error,
        },
        { status: 400 },
      );
    }

    const address = validation.address!;
    const cache = getNameCache();

    // Check cache first (look for basename specifically)
    const cached = cache.get(address);
    if (cached && cached.source === "basename") {
      return NextResponse.json({
        name: cached.name,
        cached: true,
      });
    }

    // Resolve Base name specifically
    const basename = await resolveBasename(address, { timeout: 5000 });

    // Cache the result if found
    if (basename) {
      const resolution = {
        address,
        name: basename,
        source: "basename" as const,
        timestamp: Date.now(),
      };
      cache.set(resolution);
    }

    return NextResponse.json({
      name: basename,
      cached: false,
    });
  } catch (error) {
    console.error("[API] Base name resolution failed:", error);

    return NextResponse.json(
      {
        name: null,
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
