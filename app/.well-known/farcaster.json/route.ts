import { NextResponse } from "next/server";

export async function GET() {
  const ROOT_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  const manifest = {
    accountAssociation: {
      header: process.env.NEXT_PUBLIC_FARCASTER_HEADER || "",
      payload: process.env.NEXT_PUBLIC_FARCASTER_PAYLOAD || "",
      signature: process.env.NEXT_PUBLIC_FARCASTER_SIGNATURE || "",
    },
    baseBuilder: {
      ownerAddress: process.env.NEXT_PUBLIC_BASE_OWNER_ADDRESS || "",
    },
    miniapp: {
      version: "1",
      name: "Perfect?",
      subtitle: "Stop the timer at the perfect moment",
      description:
        "A precision timing game where you stop the timer at exact moments to progress through levels. Compete on the on-chain leaderboard!",
      screenshotUrls: [],
      iconUrl: `${ROOT_URL}/icon.png`,
      splashImageUrl: `${ROOT_URL}/splash.png`,
      splashBackgroundColor: "#0052ff",
      homeUrl: ROOT_URL,
      webhookUrl: `${ROOT_URL}/api/webhook`,
      primaryCategory: "game",
      tags: [
        "game",
        "timing",
        "leaderboard",
        "web3",
        "arcade",
        "precision",
        "farcaster",
      ],
      heroImageUrl: `${ROOT_URL}/hero.png`,
      tagline: "Can you stop time perfectly?",
      ogTitle: "Perfect? - Precision Timing Game",
      ogDescription:
        "Stop the timer at the perfect moment and climb the leaderboard",
      ogImageUrl: `${ROOT_URL}/hero.png`,
      noindex: process.env.NODE_ENV === "development",
    },
  };

  return NextResponse.json(manifest);
}
