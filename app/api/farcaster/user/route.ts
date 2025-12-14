import { NextRequest, NextResponse } from "next/server";
import { getFarcasterUserByFid, getFarcasterUserByAddress } from "@/lib/neynar";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get("fid");
  const address = searchParams.get("address");

  if (!fid && !address) {
    return NextResponse.json(
      { success: false, error: "Either fid or address is required" },
      { status: 400 },
    );
  }

  try {
    let user = null;

    if (fid) {
      user = await getFarcasterUserByFid(parseInt(fid));
    } else if (address) {
      user = await getFarcasterUserByAddress(address);
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Farcaster user API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user data" },
      { status: 500 },
    );
  }
}
