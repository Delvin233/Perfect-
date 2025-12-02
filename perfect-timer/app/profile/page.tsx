"use client";

import { useAppKitAccount } from "@reown/appkit/react";

export default function ProfilePage() {
  const { isConnected } = useAppKitAccount();

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1
            className="text-3xl font-bold mb-4"
            style={{ color: "var(--color-primary)" }}
          >
            Connect to View Profile
          </h1>
          <p className="mb-6" style={{ color: "var(--color-text-secondary)" }}>
            Connect your wallet to access settings
          </p>
          <appkit-button />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1
          className="text-4xl font-bold mb-2"
          style={{ color: "var(--color-primary)" }}
        >
          PROFILE
        </h1>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        <button
          className="w-full btn btn-secondary text-lg py-4"
          onClick={() => alert("Theme selector coming soon!")}
        >
          🎨 Change Theme
        </button>
      </div>
    </div>
  );
}
