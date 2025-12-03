"use client";

import { usePathname, useRouter } from "next/navigation";
import { HiHome } from "react-icons/hi2";
import { IoGameController } from "react-icons/io5";
import { FaRankingStar } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";

const navItems = [
  { path: "/", label: "Home", Icon: HiHome },
  { path: "/play", label: "Play", Icon: IoGameController },
  { path: "/leaderboard", label: "Board", Icon: FaRankingStar },
  { path: "/profile", label: "Profile", Icon: FaUser },
];

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden backdrop-blur-sm border-t safe-area-inset-bottom"
      style={{
        backgroundColor: "var(--color-background-secondary)",
        borderColor: "var(--color-card-border)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.Icon;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center justify-center p-2 min-w-[60px] transition-all"
              style={{
                color: active
                  ? "var(--color-primary)"
                  : "var(--color-text-secondary)",
              }}
            >
              <Icon className="text-2xl mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
