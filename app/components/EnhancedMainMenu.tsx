"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useKeyboardNav } from "@/app/hooks/useKeyboardNav";
import StatsPanel from "./StatsPanel";
import EnhancedMenuBackground from "./EnhancedMenuBackground";
import ScreenEffects from "./ScreenEffects";
import { useToast } from "../hooks/useToast";
import ToastContainer from "./ToastContainer";

interface UserStats {
  address: string;
  highScore: number;
  highestLevel: number;
  rank: string;
  totalGames: number;
  perfectHits: number;
  totalHits: number;
}

interface MenuItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  badge?: string;
  action: () => void;
}

interface EnhancedMainMenuProps {
  userStats: UserStats | null;
  onDisconnect: () => void;
}

export default function EnhancedMainMenu({
  userStats,
  onDisconnect,
}: EnhancedMainMenuProps) {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [screenEffect, setScreenEffect] = useState<
    "shake" | "flash" | "confetti" | null
  >(null);
  const { toasts, removeToast } = useToast();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Enhanced entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const menuItems: MenuItem[] = [
    {
      id: "play",
      label: "PROVE PERFECTION",
      description: "Test your precision. One mistake = Game Over.",
      icon: "",
      action: () => handleNavigate("/play"),
    },
    {
      id: "leaderboard",
      label: "LEADERBOARD",
      description: "View top players worldwide. Ranks explained.",
      icon: "",
      action: () => handleNavigate("/leaderboard"),
    },
    {
      id: "profile",
      label: "PROFILE",
      description: "Your stats, achievements, and NFT collection",
      icon: "",
      badge: "COMING SOON",
      action: () => handleProfileClick(),
    },
    {
      id: "settings",
      label: "SETTINGS",
      description: "Customize theme, sound, and preferences",
      icon: "",
      action: () => handleNavigate("/settings"),
    },
    {
      id: "marketplace",
      label: "MARKETPLACE",
      description: "Trade Perfection NFTs. Stats transfer to buyer.",
      icon: "",
      badge: "COMING SOON",
      action: () => handleMarketplaceClick(),
    },
    {
      id: "disconnect",
      label: "DISCONNECT",
      description: "Sign out of your wallet",
      icon: "",
      action: () => setShowDisconnectConfirm(true),
    },
  ];

  const handleNavigate = (path: string) => {
    setIsTransitioning(true);
    router.push(path);
  };

  const handleMarketplaceClick = () => {
    // Do nothing - "COMING SOON" badge is already visible
  };

  const handleProfileClick = () => {
    // Do nothing - "COMING SOON" badge is already visible
  };

  const handleDisconnect = () => {
    setIsTransitioning(true);
    onDisconnect();
  };

  const { selectedIndex, setSelectedIndex } = useKeyboardNav({
    itemCount: menuItems.length,
    onSelect: (index) => {
      menuItems[index].action();
    },
    onBack: () => setShowDisconnectConfirm(false),
    enabled: !isTransitioning && !showDisconnectConfirm,
  });

  // ESC key handler for disconnect modal
  useEffect(() => {
    if (!showDisconnectConfirm) return;

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowDisconnectConfirm(false);
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [showDisconnectConfirm]);

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ScreenEffects
        effect={screenEffect}
        onComplete={() => setScreenEffect(null)}
      />

      <div
        className={`fixed inset-0 transition-all duration-500 ${
          isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        <EnhancedMenuBackground
          particleCount={60}
          enableParallax={true}
          intensity="medium"
        />

        <div className="absolute inset-0 z-10 flex flex-col lg:justify-center pt-8 pb-8 overflow-y-auto min-h-screen">
          {/* Enhanced header with glow effect */}
          <div
            className={`flex items-center justify-between mb-4 px-6 lg:px-12 ${isLoaded ? "enhanced-fade-in" : "opacity-0"}`}
          >
            <h1
              className="text-3xl sm:text-4xl font-bold relative"
              style={{
                color: "var(--color-primary)",
                textShadow: "0 0 20px rgba(245, 245, 240, 0.3)",
              }}
            >
              PERFECT?
              {/* Animated underline */}
              <div
                className="absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent animate-pulse"
                style={{ width: "100%" }}
              />
            </h1>
            {userStats && <appkit-button />}
          </div>

          {/* Main content with enhanced layout - MUCH more spacing */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-1 items-center px-6 lg:px-12">
            {/* Enhanced menu items - left side */}
            <div className="lg:col-span-4 space-y-2">
              <h2
                className={`text-lg font-bold mb-3 ${isLoaded ? "enhanced-fade-in stagger-1" : "opacity-0"}`}
                style={{ color: "var(--color-text-secondary)" }}
              >
                MAIN MENU
              </h2>

              <div className="space-y-2">
                {menuItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => {
                      setSelectedIndex(index);
                      setHoveredIndex(index);
                    }}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`w-full text-left p-3 rounded-lg menu-item-enhanced transition-all duration-300 ${
                      isLoaded ? "enhanced-fade-in" : "opacity-0"
                    } ${
                      selectedIndex === index
                        ? "translate-x-3 scale-[1.02] menu-item-selected"
                        : hoveredIndex === index
                          ? "translate-x-1 scale-[1.01]"
                          : ""
                    }`}
                    style={{
                      background: "transparent",
                      borderLeft:
                        selectedIndex === index
                          ? `4px solid var(--color-primary)`
                          : "4px solid transparent",
                      animationDelay: `${0.1 + index * 0.05}s`,
                      boxShadow:
                        selectedIndex === index
                          ? "0 0 8px var(--color-primary)"
                          : "none",
                    }}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      {selectedIndex === index && (
                        <span
                          className="text-xl animate-pulse"
                          style={{ color: "var(--color-primary)" }}
                        >
                          ▶
                        </span>
                      )}
                      <span className="text-xl transform transition-transform duration-200 hover:scale-110">
                        {item.icon}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-base transition-colors duration-200 ${
                              selectedIndex === index
                                ? "text-[var(--color-primary)]"
                                : "text-[var(--color-text)]"
                            }`}
                          >
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full font-semibold animate-pulse">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {selectedIndex === index && (
                          <p
                            className="text-sm mt-1 enhanced-fade-in"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Enhanced keyboard controls - more compact */}
              <div
                className={`text-center text-xs space-x-2 mt-3 ${isLoaded ? "enhanced-fade-in stagger-6" : "opacity-0"}`}
                style={{ color: "var(--color-text-secondary)" }}
              >
                <span className="px-1.5 py-0.5 bg-white/5 rounded text-xs">
                  [ENTER] Select
                </span>
                <span className="px-1.5 py-0.5 bg-white/5 rounded text-xs">
                  [↑↓] Navigate
                </span>
                <span className="px-1.5 py-0.5 bg-white/5 rounded text-xs">
                  [1-6] Quick
                </span>
                <span className="px-1.5 py-0.5 bg-white/5 rounded text-xs">
                  [ESC] Back
                </span>
              </div>
            </div>

            {/* Enhanced stats panel - smaller width to match menu */}
            <div
              className={`lg:col-span-3 lg:col-start-10 ${isLoaded ? "enhanced-fade-in stagger-3" : "opacity-0"}`}
            >
              <StatsPanel stats={userStats} />
            </div>
          </div>
        </div>
      </div>

      {/* Disconnect confirmation modal overlay */}
      {showDisconnectConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{ backdropFilter: "blur(50px)" }}
        >
          <div className="pointer-events-auto">
            <div className="card max-w-md mx-4 p-6 space-y-4 enhanced-fade-in relative overflow-hidden shadow-2xl">
              {/* Animated border */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 animate-pulse" />

              <div className="relative z-10">
                <h2
                  className="text-2xl font-bold text-center mb-4"
                  style={{ color: "var(--color-primary)" }}
                >
                  Disconnect Wallet?
                </h2>
                <p
                  className="text-center mb-6"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Are you sure? Any unsaved progress will be lost.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDisconnectConfirm(false)}
                    className="btn btn-secondary flex-1 menu-item-enhanced"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="btn btn-primary flex-1 menu-item-enhanced"
                  >
                    Disconnect
                  </button>
                </div>
                <p className="text-xs text-center text-gray-500 mt-4">
                  Press ESC to cancel
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
