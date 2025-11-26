import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'lib', 'db.json');

export async function GET() {
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const topScores = data.scores
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 10);
  return NextResponse.json(topScores);
}

export async function POST(request: Request) {
  const { address, score, level } = await request.json();
  
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  
  // Check if user already has a score
  const existingIndex = data.scores.findIndex((s: any) => s.address === address);
  
  if (existingIndex >= 0) {
    // Update if new score is higher
    if (score > data.scores[existingIndex].score) {
      data.scores[existingIndex] = { address, score, level, timestamp: Date.now() };
    }
  } else {
    // Add new score
    data.scores.push({ address, score, level, timestamp: Date.now() });
  }
  
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  
  return NextResponse.json({ success: true });
}
