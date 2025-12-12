"use client";

import { useState, useEffect } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import BackButton from "../components/BackButton";
import { THEMES, applyTheme, getTheme } from "@/lib/themes";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ToastContainer";

export default function SettingsPage() {
  const { isConnected } = useAppKitAccount();
  const { toasts, removeToast, success, info } = useToast();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(75);

  // Gameplay Settings
  const [screenShakeEnabled, setScreenShakeEnabled] = useState(true);
  const [particleEffectsEnabled, setParticleEffectsEnabled] = useState(true);

  // Theme Settings
  const [currentTheme, setCurrentTheme] = useState("delvin233");

  // Name Resolution Settings
  const [nameResolutionEnabled, setNameResolutionEnabled] = useState(true);
  const [ensEnabled, setEnsEnabled] = useState(true);
  const [baseNamesEnabled, setBaseNamesEnabled] = useState(true);
  const [nameDisplayFormat, setNameDisplayFormat] = useState<
    "name-only" | "name-with-badge" | "name-and-address"
  >("name-with-badge");
  const [privacyMode, setPrivacyMode] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("perfect-name-settings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setNameResolutionEnabled(settings.nameResolutionEnabled ?? true);
        setEnsEnabled(settings.ensEnabled ?? true);
        setBaseNamesEnabled(settings.baseNamesEnabled ?? true);
        setNameDisplayFormat(settings.nameDisplayFormat ?? "name-with-badge");
        setPrivacyMode(settings.privacyMode ?? false);
      } catch (error) {
        console.warn("Failed to load name resolution settings:", error);
      }
    }

    // Load gameplay settings
    const savedGameplaySettings = localStorage.getItem(
      "perfect-gameplay-settings",
    );
    if (savedGameplaySettings) {
      try {
        const settings = JSON.parse(savedGameplaySettings);
        setScreenShakeEnabled(settings.screenShakeEnabled ?? true);
        setParticleEffectsEnabled(settings.particleEffectsEnabled ?? true);
      } catch (error) {
        console.warn("Failed to load gameplay settings:", error);
      }
    }

    // Load theme settings
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyTheme(getTheme(savedTheme));
    }
  }, []);

  // Save settings to localStorage when they change
  const saveNameSettings = (
    newSettings: Partial<{
      nameResolutionEnabled: boolean;
      ensEnabled: boolean;
      baseNamesEnabled: boolean;
      nameDisplayFormat: "name-only" | "name-with-badge" | "name-and-address";
      privacyMode: boolean;
    }>,
  ) => {
    const settings = {
      nameResolutionEnabled,
      ensEnabled,
      baseNamesEnabled,
      nameDisplayFormat,
      privacyMode,
      ...newSettings,
    };
    localStorage.setItem("perfect-name-settings", JSON.stringify(settings));
  };

  const saveGameplaySettings = (
    newSettings: Partial<{
      screenShakeEnabled: boolean;
      particleEffectsEnabled: boolean;
    }>,
  ) => {
    const settings = {
      screenShakeEnabled,
      particleEffectsEnabled,
      ...newSettings,
    };
    localStorage.setItem("perfect-gameplay-settings", JSON.stringify(settings));
  };

  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="mb-4">
        <BackButton to="/" />
      </div>

      {!isConnected ? (
        <div className="min-h-[60vh] flex flex-col">
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
      ) : (
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
            <select
              value={currentTheme}
              onChange={(e) => {
                const newTheme = e.target.value;
                setCurrentTheme(newTheme);
                applyTheme(getTheme(newTheme));
                localStorage.setItem("theme", newTheme);
                success(`Theme changed to ${getTheme(newTheme).name}`);
              }}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-[var(--color-primary)] focus:outline-none"
            >
              {THEMES.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name} - {theme.description}
                </option>
              ))}
            </select>
          </div>

          {/* Name Resolution Settings */}
          <div className="card p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
              🏷️ Name Resolution
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Configure how wallet addresses are displayed
            </p>
            <div className="space-y-4">
              {/* Enable Name Resolution */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Name Resolution</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Show ENS and Base names instead of addresses
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newValue = !nameResolutionEnabled;
                    setNameResolutionEnabled(newValue);
                    saveNameSettings({ nameResolutionEnabled: newValue });
                    success(
                      newValue
                        ? "Name resolution enabled"
                        : "Name resolution disabled",
                    );
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    nameResolutionEnabled ? "bg-green-500" : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      nameResolutionEnabled
                        ? "translate-x-6"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* ENS Names */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">ENS Names</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Resolve Ethereum Name Service names
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newValue = !ensEnabled;
                    setEnsEnabled(newValue);
                    saveNameSettings({ ensEnabled: newValue });
                    info(
                      newValue
                        ? "ENS resolution enabled"
                        : "ENS resolution disabled",
                    );
                  }}
                  disabled={!nameResolutionEnabled}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    ensEnabled && nameResolutionEnabled
                      ? "bg-blue-500"
                      : "bg-gray-600"
                  } ${!nameResolutionEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      ensEnabled && nameResolutionEnabled
                        ? "translate-x-6"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Base Names */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Base Names</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Resolve Base network names
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newValue = !baseNamesEnabled;
                    setBaseNamesEnabled(newValue);
                    saveNameSettings({ baseNamesEnabled: newValue });
                    info(
                      newValue ? "Base names enabled" : "Base names disabled",
                    );
                  }}
                  disabled={!nameResolutionEnabled}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    baseNamesEnabled && nameResolutionEnabled
                      ? "bg-purple-500"
                      : "bg-gray-600"
                  } ${!nameResolutionEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      baseNamesEnabled && nameResolutionEnabled
                        ? "translate-x-6"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Display Format */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Display Format</p>
                </div>
                <select
                  value={nameDisplayFormat}
                  onChange={(e) => {
                    const newValue = e.target.value as
                      | "name-only"
                      | "name-with-badge"
                      | "name-and-address";
                    setNameDisplayFormat(newValue);
                    saveNameSettings({ nameDisplayFormat: newValue });
                    success(`Display format: ${newValue.replace("-", " ")}`);
                  }}
                  disabled={!nameResolutionEnabled}
                  className={`w-full p-2 rounded bg-gray-700 border border-gray-600 text-white ${
                    !nameResolutionEnabled
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <option value="name-only">Name Only</option>
                  <option value="name-with-badge">
                    Name with Badge (Recommended)
                  </option>
                  <option value="name-and-address">Name and Address</option>
                </select>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  How names are displayed in leaderboards and profiles
                </p>
              </div>

              {/* Privacy Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Privacy Mode</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Hide your resolved name from other players
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newValue = !privacyMode;
                    setPrivacyMode(newValue);
                    saveNameSettings({ privacyMode: newValue });
                    info(
                      newValue
                        ? "Privacy mode enabled - your name is hidden"
                        : "Privacy mode disabled - your name is visible",
                    );
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    privacyMode ? "bg-orange-500" : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      privacyMode ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
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
                  onClick={() => {
                    const newValue = !screenShakeEnabled;
                    setScreenShakeEnabled(newValue);
                    saveGameplaySettings({ screenShakeEnabled: newValue });
                    success(
                      newValue
                        ? "Screen shake effects enabled"
                        : "Screen shake effects disabled",
                    );
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    screenShakeEnabled ? "bg-green-500" : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      screenShakeEnabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
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
                  onClick={() => {
                    const newValue = !particleEffectsEnabled;
                    setParticleEffectsEnabled(newValue);
                    saveGameplaySettings({ particleEffectsEnabled: newValue });
                    success(
                      newValue
                        ? "Particle effects enabled"
                        : "Particle effects disabled",
                    );
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    particleEffectsEnabled ? "bg-green-500" : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      particleEffectsEnabled
                        ? "translate-x-6"
                        : "translate-x-0.5"
                    }`}
                  />
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
                <span className="text-[var(--color-text-secondary)]">
                  Select
                </span>
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
                <strong>Perfect?</strong> - A Precision timing game
              </p>
              <p>One mistake = Game Over. No continues.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
