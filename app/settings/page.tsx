"use client";

import { useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import BackButton from "../components/BackButton";
import ThemeSelector from "../components/ThemeSelector";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ToastContainer";

export default function SettingsPage() {
  const { isConnected } = useAppKitAccount();
  const { toasts, removeToast, success, info } = useToast();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(75);

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex flex-col">
        <div className="mb-4">
          <BackButton to="/" />
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1
              className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4"
              style={{ color: "var(--color-primary)" }}
            >
              Connect to Access Settings
            </h1>
            <p
              className="mb-6 sm:mb-8 text-sm sm:text-base"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Connect your wallet to customize your experience
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="mb-4">
        <BackButton to="/" />
      </div>

      <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
        <div className="text-center mb-6 sm:mb-8">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-2"
            style={{ color: "var(--color-primary)" }}
          >
            ⚙️ SETTINGS
          </h1>
          <p
            className="text-sm sm:text-base"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Customize your Perfect? experience
          </p>
        </div>

        {/* Theme Settings */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            🎨 Theme
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Choose your preferred visual theme
          </p>
          <ThemeSelector />
        </div>

        {/* Audio Settings */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            🔊 Audio
          </h2>
          <div className="space-y-4">
            {/* Sound Effects */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sound Effects</p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Menu clicks, game feedback
                </p>
              </div>
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  info(
                    soundEnabled
                      ? "Sound effects disabled"
                      : "Sound effects enabled",
                  );
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  soundEnabled ? "bg-green-500" : "bg-gray-600"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    soundEnabled ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Background Music */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Background Music</p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Coming soon with music director
                </p>
              </div>
              <button
                onClick={() => info("Background music coming soon!")}
                className="relative w-12 h-6 rounded-full bg-gray-600 opacity-50 cursor-not-allowed"
              >
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full" />
              </button>
            </div>

            {/* Volume */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Master Volume</p>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {volume}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => {
                  setVolume(parseInt(e.target.value));
                  if (parseInt(e.target.value) % 25 === 0) {
                    success(`Volume set to ${e.target.value}%`);
                  }
                }}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${volume}%, #4b5563 ${volume}%, #4b5563 100%)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Gameplay Settings */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            🎮 Gameplay
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Screen Shake Effects</p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Visual feedback on actions
                </p>
              </div>
              <button
                onClick={() =>
                  info(
                    "Screen shake effects are always enabled for the best arcade experience!",
                  )
                }
                className="relative w-12 h-6 rounded-full bg-green-500"
              >
                <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Particle Effects</p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Background animations
                </p>
              </div>
              <button
                onClick={() =>
                  info(
                    "Particle effects are optimized automatically for your device!",
                  )
                }
                className="relative w-12 h-6 rounded-full bg-green-500"
              >
                <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full" />
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            ⌨️ Keyboard Shortcuts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">
                Navigate Menu
              </span>
              <span className="font-mono bg-gray-700 px-2 py-1 rounded">
                ↑ ↓
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Select</span>
              <span className="font-mono bg-gray-700 px-2 py-1 rounded">
                Enter
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">
                Go Back
              </span>
              <span className="font-mono bg-gray-700 px-2 py-1 rounded">
                Esc
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">
                Quick Select
              </span>
              <span className="font-mono bg-gray-700 px-2 py-1 rounded">
                1-6
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">
                Start/Stop Timer
              </span>
              <span className="font-mono bg-gray-700 px-2 py-1 rounded">
                Space
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">
                Cycle Items
              </span>
              <span className="font-mono bg-gray-700 px-2 py-1 rounded">
                Tab
              </span>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            ℹ️ About
          </h2>
          <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
            <p>
              <strong>Perfect?</strong> - Precision timing game
            </p>
            <p>Built for Base and WalletConnect hackathons</p>
            <p>One mistake = Game Over. No continues.</p>
            <p className="text-xs mt-4 opacity-70">
              Phase 2 Complete: Enhanced animations and arcade navigation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
