"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppKitAccount } from "@reown/appkit/react";

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
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-red-500">
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
                  className={`px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-red-500 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Wallet Button - Only show if connected */}
          {address && (
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-sm text-gray-400">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <appkit-button />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
