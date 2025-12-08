"use client";

import { useAppKit, useAppKitAccount } from "@reown/appkit/react";

export default function ProfilePage() {
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1
            className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4"
            style={{ color: "var(--color-primary)" }}
          >
            Connect to View Profile
          </h1>
          <p className="mb-6 sm:mb-8 text-sm sm:text-base" style={{ color: "var(--color-text-secondary)" }}>
            Connect your wallet to access settings
          </p>
          <button onClick={() => open()} className="btn btn-primary text-lg sm:text-xl active:scale-95">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-6 sm:mb-8">
        <h1
          className="text-3xl sm:text-4xl font-bold mb-2"
          style={{ color: "var(--color-primary)" }}
        >
          PROFILE
        </h1>
      </div>

      <div className="card p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Settings</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          Use the theme selector (🎨) in the header to customize your experience
        </p>
        <div className="text-center py-8 text-[var(--color-text-secondary)]">
          <p className="text-sm">More settings coming soon!</p>
        </div>
      </div>
    </div>
  );
}
