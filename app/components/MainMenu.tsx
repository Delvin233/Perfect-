"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useKeyboardNav } from "@/app/hooks/useKeyboardNav";
import { useNamePreloader } from "@/hooks/useNamePreloader";
import StatsPanel from "./StatsPanel";
import MenuBackground from "./MenuBackground";
import { SimpleAddressDisplay } from "./AddressDisplay";

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

interface MainMenuProps {
  userStats: UserStats | null;
  onDisconnect: () => void;
}

export default function MainMenu({ userStats, onDisconnect }: MainMenuProps) {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  // Preload leaderboard names for better performance
  const { smartPreload } = useNamePreloader();

  useEffect(() => {
    // Preload leaderboard addresses when main menu loads
    smartPreload("/");
  }, [smartPreload]);

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
      action: () => handleNavigate("/profile"),
    },
    {
      id: "settings",
      label: "SETTINGS",
      description: "Customize theme, sound, and preferences",
      icon: "",
      action: () => alert("Settings coming soon!"),
    },
    {
      id: "marketplace",
      label: "MARKETPLACE",
      description: "Trade Perfection NFTs. Stats transfer to buyer.",
      icon: "",
      badge: "COMING SOON",
      action: () => alert("Marketplace coming soon!"),
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
    setTimeout(() => {
      router.push(path);
    }, 300);
  };

  const handleDisconnect = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onDisconnect();
    }, 300);
  };

  const { selectedIndex, setSelectedIndex } = useKeyboardNav({
    itemCount: menuItems.length,
    onSelect: (index) => menuItems[index].action(),
    onBack: () => setShowDisconnectConfirm(false),
    enabled: !isTransitioning && !showDisconnectConfirm,
  });

  // Disconnect confirmation modal
  if (showDisconnectConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="card max-w-md mx-4 p-6 space-y-4 animate-fade-in">
          <h2
            className="text-2xl font-bold text-center"
            style={{ color: "var(--color-primary)" }}
          >
            Disconnect Wallet?
          </h2>
          <p
            className="text-center"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Are you sure? Any unsaved progress will be lost.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDisconnectConfirm(false)}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleDisconnect}
              className="btn btn-primary flex-1"
            >
              Disconnect
            </button>
          </div>
          <p className="text-xs text-center text-gray-500">
            Press ESC to cancel
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-opacity duration-300 ${
        isTransitioning ? "opacity-0" : "opacity-100"
      }`}
    >
      <MenuBackground particleCount={50} enableParallax={true} />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <h1
            className="text-3xl sm:text-4xl font-bold"
            style={{ color: "var(--color-primary)" }}
          >
            PERFECT?
          </h1>
          {userStats && (
            <SimpleAddressDisplay
              address={userStats.address}
              className="text-sm justify-center"
              showBadge={true}
              copyable={false}
            />
          )}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu items - Left side */}
          <div className="lg:col-span-2 space-y-4">
            <h2
              className="text-xl font-bold mb-4 animate-fade-in"
              style={{
                color: "var(--color-text-secondary)",
                animationDelay: "0.1s",
              }}
            >
              MAIN MENU
            </h2>

            <div className="space-y-3">
              {menuItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-200 animate-fade-in ${
                    selectedIndex === index
                      ? "translate-x-2 scale-[1.02]"
                      : "hover:translate-x-1"
                  }`}
                  style={{
                    background:
                      selectedIndex === index
                        ? "var(--color-card-bg)"
                        : "rgba(255, 255, 255, 0.03)",
                    borderLeft:
                      selectedIndex === index
                        ? `4px solid var(--color-primary)`
                        : "4px solid transparent",
                    animationDelay: `${0.1 + index * 0.05}s`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    {selectedIndex === index && (
                      <span
                        className="text-xl animate-pulse"
                        style={{ color: "var(--color-primary)" }}
                      >
                        ▶
                      </span>
                    )}
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-lg ${
                            selectedIndex === index
                              ? "text-[var(--color-primary)]"
                              : "text-[var(--color-text)]"
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {selectedIndex === index && (
                        <p
                          className="text-sm mt-1 animate-fade-in"
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

            {/* Description for selected item */}
            <div
              className="card p-4 animate-fade-in"
              style={{ animationDelay: "0.8s" }}
            >
              <p
                className="text-sm text-center"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {menuItems[selectedIndex].description}
              </p>
            </div>

            {/* Keyboard controls hint */}
            <div
              className="text-center text-xs space-x-4 animate-fade-in"
              style={{
                color: "var(--color-text-secondary)",
                animationDelay: "1s",
              }}
            >
              <span>[ENTER] Select</span>
              <span>[↑↓] Navigate</span>
              <span>[1-6] Quick Select</span>
              <span>[ESC] Back</span>
            </div>
          </div>

          {/* Stats panel - Right side */}
          <div className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <StatsPanel stats={userStats} />
          </div>
        </div>
      </div>
    </div>
  );
}
