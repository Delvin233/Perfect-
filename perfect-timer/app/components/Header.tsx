"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppKitAccount } from "@reown/appkit/react";
import ThemeSelector from "./ThemeSelector";

const menuLinks = [
  { label: "Home", href: "/" },
  { label: "Play", href: "/play" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Profile", href: "/profile" },
];

export default function Header() {
  const pathname = usePathname();
  const { address } = useAppKitAccount();

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-sm border-b"
      style={{
        backgroundColor: "var(--color-background-secondary)",
        borderColor: "var(--color-card-border)",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-2xl font-bold"
              style={{ color: "var(--color-primary)" }}
            >
              PERFECT?
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {menuLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-lg transition-all"
                  style={{
                    backgroundColor: isActive
                      ? "var(--color-primary)"
                      : "transparent",
                    color: isActive
                      ? "var(--color-background)"
                      : "var(--color-text-secondary)",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Theme Selector & Wallet Button */}
          <div className="flex items-center gap-4">
            <ThemeSelector />
            {address && <appkit-button />}
          </div>
        </div>
      </div>
    </header>
  );
}
