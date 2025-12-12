"use client";

import { useAppKitAccount } from "@reown/appkit/react";

export default function FloatingAppKitButton() {
  const { isConnected } = useAppKitAccount();

  // Only show when wallet is connected
  if (!isConnected) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <appkit-button />
    </div>
  );
}
