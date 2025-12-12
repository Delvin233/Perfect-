"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface BackButtonProps {
  label?: string;
  to?: string;
  onClick?: () => void;
  className?: string;
  enableEscKey?: boolean;
}

export default function BackButton({
  label = "BACK",
  to,
  onClick,
  className = "",
  enableEscKey = true,
}: BackButtonProps) {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);

  const handleBack = useCallback(() => {
    if (onClick) {
      onClick();
    } else if (to) {
      router.push(to);
    } else {
      router.back();
    }
  }, [onClick, to, router]);

  // ESC key support
  useEffect(() => {
    if (!enableEscKey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableEscKey, handleBack]);

  return (
    <button
      onClick={handleBack}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`
        group flex items-center gap-2 px-4 py-2 rounded-lg
        transition-all duration-200 font-semibold text-sm
        active:scale-95
        ${isPressed ? "scale-95" : ""}
        ${className}
      `}
      style={{
        background: "var(--color-card-bg)",
        border: "1px solid var(--color-card-border)",
        color: "var(--color-text-secondary)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      <span className="text-lg group-hover:translate-x-[-2px] transition-transform duration-200"></span>
      <span className="group-hover:text-[var(--color-primary)] transition-colors duration-200">
        {label}
      </span>
    </button>
  );
}
