import type { Metadata, Viewport } from "next";
import ContextProvider from "./context";
import dynamic from "next/dynamic";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const ConditionalHeader = dynamic(
  () => import("@/app/components/ConditionalHeader"),
  { ssr: false },
);

const FloatingAppKitButton = dynamic(
  () => import("@/app/components/FloatingAppKitButton"),
  { ssr: false },
);

const NameResolutionMonitor = dynamic(
  () => import("@/app/components/NameResolutionMonitor"),
  { ssr: false },
);
const NameResolutionDebugPanel = dynamic(
  () =>
    import("@/app/components/NameResolutionMonitor").then((mod) => ({
      default: mod.NameResolutionDebugPanel,
    })),
  { ssr: false },
);
const WebSocketTestPanel = dynamic(
  () => import("@/app/components/WebSocketTestPanel"),
  {
    ssr: false,
  },
);
const FarcasterDebugPanel = dynamic(
  () => import("@/app/components/FarcasterDebugPanel"),
  { ssr: false },
);

export const metadata: Metadata = {
  title: "Perfect? - Precision Timing Game",
  description:
    "Stop the timer at the perfect moment and climb the leaderboard. A precision timing game built for Farcaster.",
  openGraph: {
    title: "Perfect? - Precision Timing Game",
    description:
      "Stop the timer at the perfect moment and climb the leaderboard",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/hero.png`,
        width: 1200,
        height: 800,
        alt: "Perfect? - Precision Timing Game",
      },
    ],
  },
  other: {
    "base:app_id": "693f3291d19763ca26ddc2e2",
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/hero.png`,
      button: {
        title: "Launch Perfect?",
        action: {
          type: "launch_miniapp",
          name: "Perfect?",
          url: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
          splashImageUrl: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/splash.png`,
          splashBackgroundColor: "#0052ff",
        },
      },
    }),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Using JetBrains Mono from Google Fonts
import { JetBrains_Mono } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={jetbrainsMono.variable}>
        <ContextProvider>
          <div className="min-h-screen flex flex-col">
            <ConditionalHeader />
            <FloatingAppKitButton />
            <main className="flex-1">
              <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
                {children}
              </div>
            </main>

            {/* Development/Debug Components */}
            <NameResolutionMonitor />
            <NameResolutionDebugPanel />
            <WebSocketTestPanel />
            <FarcasterDebugPanel />
          </div>
        </ContextProvider>
        <Analytics />
      </body>
    </html>
  );
}
