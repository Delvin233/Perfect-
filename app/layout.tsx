import type { Metadata, Viewport } from "next";
import { minikitConfig } from "@/minikit.config";
import ContextProvider from "./context";
import dynamic from "next/dynamic";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const ConditionalHeader = dynamic(
  () => import("@/app/components/ConditionalHeader"),
  { ssr: false },
);
const BottomNavigation = dynamic(
  () => import("@/app/components/BottomNavigation"),
  { ssr: false },
);

export const metadata: Metadata = {
  title: minikitConfig.miniapp.name,
  description: minikitConfig.miniapp.description,
  other: {
    "fc:miniapp": JSON.stringify({
      version: minikitConfig.miniapp.version,
      imageUrl: minikitConfig.miniapp.heroImageUrl,
      button: {
        title: `Launch ${minikitConfig.miniapp.name}`,
        action: {
          name: `Launch ${minikitConfig.miniapp.name}`,
          type: "launch_miniapp",
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
            <main className="flex-1 pb-20 lg:pb-4">
              <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
                {children}
              </div>
            </main>
            <BottomNavigation />
          </div>
        </ContextProvider>
        <Analytics />
      </body>
    </html>
  );
}
