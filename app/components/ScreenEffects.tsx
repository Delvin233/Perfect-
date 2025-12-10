"use client";

import { useEffect } from "react";

interface ScreenEffectsProps {
  effect: "shake" | "flash" | "confetti" | null;
  onComplete?: () => void;
}

export default function ScreenEffects({
  effect,
  onComplete,
}: ScreenEffectsProps) {
  useEffect(() => {
    if (!effect) return;

    const body = document.body;

    switch (effect) {
      case "shake":
        body.classList.add("screen-shake");
        setTimeout(() => {
          body.classList.remove("screen-shake");
          onComplete?.();
        }, 500);
        break;

      case "flash":
        const flash = document.createElement("div");
        flash.className = "screen-flash";
        flash.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          pointer-events: none;
          z-index: 9999;
          animation: flash 0.3s ease-out;
        `;
        body.appendChild(flash);

        setTimeout(() => {
          flash.remove();
          onComplete?.();
        }, 300);
        break;

      case "confetti":
        createConfetti();
        setTimeout(() => {
          onComplete?.();
        }, 3000);
        break;
    }
  }, [effect, onComplete]);

  return null;
}

function createConfetti() {
  const colors = ["#FFD700", "#FF6B35", "#FF006E", "#00BFFF", "#98FF98"];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti-piece";
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      top: -10px;
      left: ${Math.random() * 100}vw;
      z-index: 9999;
      pointer-events: none;
      animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
      transform: rotate(${Math.random() * 360}deg);
    `;

    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.remove();
    }, 5000);
  }
}
