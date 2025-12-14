"use client";

import { wagmiAdapter, projectId, networks } from "../config/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import React, { type ReactNode } from "react";
import { WagmiProvider, type Config } from "wagmi";
import { FarcasterProvider } from "./FarcasterProvider";

// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
  console.warn("Project ID is not defined");
}

// Set up metadata
const metadata = {
  name: "Perfect Timer",
  description: "Stop the timer at the perfect moment",
  url: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Create the modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: networks[0],
  metadata: metadata,
  features: {
    analytics: true,
    socials: ["google", "x", "discord", "farcaster", "github"],
    email: true,
    emailShowWallets: true,
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#ef4444",
    "--w3m-color-mix": "#ef4444",
    "--w3m-color-mix-strength": 20,
    "--w3m-border-radius-master": "8px",
  },
});

function ContextProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>
        <FarcasterProvider>{children}</FarcasterProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;
