"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import Header from "./Header";

export default function ConditionalHeader() {
  const { isConnected } = useAppKitAccount();

  // Show header only when wallet is connected (for network switching)
  if (isConnected) {
    return <Header />;
  }

  // Hide header when not connected for full arcade experience
  return null;
}
