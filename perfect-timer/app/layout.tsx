import type { Metadata } from "next";
import { minikitConfig } from "@/minikit.config";
import ContextProvider from "./context";
import dynamic from "next/dynamic";
import "./globals.css";

const Header = dynamic(() => import("@/app/components/Header"), { ssr: false });
const BottomNavigation = dynamic(
  () => import("@/app/components/BottomNavigation"),
  { ssr: false },
);

export async function generateMetadata(): Promise<Metadata> {
  return {
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
}

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
            <Header />
            <main className="flex-1 pb-20 lg:pb-4">
              <div className="container py-4">{children}</div>
            </main>
            <BottomNavigation />
          </div>
        </ContextProvider>
      </body>
    </html>
  );
}
