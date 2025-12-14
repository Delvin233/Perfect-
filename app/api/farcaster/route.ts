import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "leaderboard":
        // Get top 10 scores for Farcaster sharing
        const result = await turso.execute(`
          SELECT address, score, level, timestamp 
          FROM leaderboard 
          ORDER BY score DESC 
          LIMIT 10
        `);

        return NextResponse.json({
          success: true,
          leaderboard: result.rows.map((row) => ({
            address: row.address as string,
            score: row.score as number,
            level: row.level as number,
            timestamp: row.timestamp as number,
          })),
        });

      case "stats":
        // Get global stats for sharing
        const statsResult = await turso.execute(`
          SELECT 
            COUNT(*) as total_players,
            MAX(score) as highest_score,
            MAX(level) as highest_level,
            AVG(score) as average_score
          FROM leaderboard
        `);

        const stats = statsResult.rows[0];
        return NextResponse.json({
          success: true,
          stats: {
            totalPlayers: stats.total_players as number,
            highestScore: stats.highest_score as number,
            highestLevel: stats.highest_level as number,
            averageScore: Math.round(stats.average_score as number),
          },
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Farcaster API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, fid, score, level } = body;

    switch (action) {
      case "link_farcaster":
        // Link Farcaster FID to wallet address
        // This could be used for enhanced leaderboard features
        // For now, just return success
        return NextResponse.json({
          success: true,
          message: "Farcaster account linked",
        });

      case "share_score":
        // Log score sharing for analytics
        console.log(`User ${fid} shared score: ${score}, level: ${level}`);
        return NextResponse.json({
          success: true,
          message: "Score share logged",
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Farcaster API POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
