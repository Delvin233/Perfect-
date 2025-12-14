"use client";

import { useEffect, useState } from "react";
import { useFarcaster } from "../context/FarcasterProvider";

interface FarcasterSplashScreenProps {
  onReady: () => void;
}

export default function FarcasterSplashScreen({
  onReady,
}: FarcasterSplashScreenProps) {
  const { isInMiniApp, isReady, context } = useFarcaster();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    if (!isInMiniApp) {
      // Not in Mini App, skip splash
      onReady();
      return;
    }

    const initSequence = async () => {
      // Simulate initialization steps
      setStatus("Connecting to Farcaster...");
      setProgress(25);

      await new Promise((resolve) => setTimeout(resolve, 500));

      setStatus("Loading game data...");
      setProgress(50);

      await new Promise((resolve) => setTimeout(resolve, 500));

      setStatus("Preparing interface...");
      setProgress(75);

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (isReady) {
        setStatus("Ready!");
        setProgress(100);

        await new Promise((resolve) => setTimeout(resolve, 300));
        onReady();
      } else {
        // Wait for Farcaster to be ready
        setStatus("Waiting for Farcaster...");
      }
    };

    initSequence();
  }, [isInMiniApp, isReady, onReady]);

  // Auto-complete when Farcaster is ready
  useEffect(() => {
    if (isReady && progress < 100) {
      setStatus("Ready!");
      setProgress(100);
      setTimeout(onReady, 300);
    }
  }, [isReady, progress, onReady]);

  if (!isInMiniApp) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800">
      <div className="text-center px-6">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-2">PERFECT?</h1>
          <p className="text-xl text-blue-200">Precision Timing Game</p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto mb-6">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-purple-400 h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Status */}
        <p className="text-blue-200 mb-8">{status}</p>

        {/* Farcaster Context Info */}
        {context && (
          <div className="text-xs text-blue-300/70 space-y-1">
            {context.user && (
              <p>
                Welcome,{" "}
                {context.user.displayName ||
                  context.user.username ||
                  `User ${context.user.fid}`}
              </p>
            )}
            {context.location && <p>Launched from: {context.location.type}</p>}
          </div>
        )}

        {/* Loading Animation */}
        <div className="flex justify-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
        </div>
      </div>
    </div>
  );
}
