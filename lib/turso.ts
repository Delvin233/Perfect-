import { createClient } from "@libsql/client";

// Create client only if environment variables are available
export const turso =
  process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN
    ? createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      })
    : null;

// Initialize the leaderboard table
export async function initDatabase() {
  if (!turso) {
    console.warn(
      "Turso client not initialized - database operations will be skipped",
    );
    return;
  }

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      address TEXT PRIMARY KEY,
      score INTEGER NOT NULL,
      level INTEGER NOT NULL,
      timestamp INTEGER NOT NULL,
      total_attempts INTEGER DEFAULT 1,
      stages_completed INTEGER DEFAULT 0,
      perfect_hits INTEGER DEFAULT 0,
      total_hits INTEGER DEFAULT 0
    )
  `);

  // Create index for faster sorting by score
  await turso.execute(`
    CREATE INDEX IF NOT EXISTS idx_score ON leaderboard(score DESC)
  `);
}
