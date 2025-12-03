import { NextResponse } from "next/server";
import { turso, initDatabase } from "@/lib/turso";

// Initialize database on first request
let dbInitialized = false;

async function ensureDatabase() {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
}

export async function GET(request: Request) {
  await ensureDatabase();

  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  // If address is provided, return user-specific scores
  if (address) {
    const result = await turso.execute({
      sql: "SELECT * FROM leaderboard WHERE LOWER(address) = LOWER(?)",
      args: [address],
    });

    const scores = result.rows.map((row) => ({
      address: row.address as string,
      score: row.score as number,
      level: row.level as number,
      timestamp: row.timestamp as number,
      totalAttempts: (row.total_attempts as number) || 0,
      stagesCompleted: (row.stages_completed as number) || 0,
      perfectHits: (row.perfect_hits as number) || 0,
      totalHits: (row.total_hits as number) || 0,
    }));

    return NextResponse.json({ scores });
  }

  // Otherwise return top 10 scores
  const result = await turso.execute(
    "SELECT * FROM leaderboard ORDER BY score DESC LIMIT 10",
  );

  const scores = result.rows.map((row) => ({
    address: row.address as string,
    score: row.score as number,
    level: row.level as number,
    timestamp: row.timestamp as number,
    totalAttempts: (row.total_attempts as number) || 0,
    stagesCompleted: (row.stages_completed as number) || 0,
    perfectHits: (row.perfect_hits as number) || 0,
    totalHits: (row.total_hits as number) || 0,
  }));

  return NextResponse.json({ scores });
}

export async function POST(request: Request) {
  await ensureDatabase();

  const { address, score, level, perfectHits, totalHits } =
    await request.json();

  // Check if user already has a score
  const existing = await turso.execute({
    sql: "SELECT score, total_attempts FROM leaderboard WHERE address = ?",
    args: [address],
  });

  const timestamp = Date.now();
  const stagesCompleted = Math.floor(level / 10);

  if (existing.rows.length > 0) {
    const currentScore = existing.rows[0].score as number;
    const attempts = (existing.rows[0].total_attempts as number) || 0;

    // Always increment attempts
    const newAttempts = attempts + 1;

    // Only update if new score is higher
    if (score > currentScore) {
      await turso.execute({
        sql: `UPDATE leaderboard 
              SET score = ?, level = ?, timestamp = ?, total_attempts = ?, 
                  stages_completed = ?, perfect_hits = ?, total_hits = ? 
              WHERE address = ?`,
        args: [
          score,
          level,
          timestamp,
          newAttempts,
          stagesCompleted,
          perfectHits || 0,
          totalHits || 0,
          address,
        ],
      });
    } else {
      // Just update attempts count
      await turso.execute({
        sql: "UPDATE leaderboard SET total_attempts = ? WHERE address = ?",
        args: [newAttempts, address],
      });
    }
  } else {
    // Insert new score
    await turso.execute({
      sql: `INSERT INTO leaderboard 
            (address, score, level, timestamp, total_attempts, stages_completed, perfect_hits, total_hits) 
            VALUES (?, ?, ?, ?, 1, ?, ?, ?)`,
      args: [
        address,
        score,
        level,
        timestamp,
        stagesCompleted,
        perfectHits || 0,
        totalHits || 0,
      ],
    });
  }

  return NextResponse.json({ success: true });
}
