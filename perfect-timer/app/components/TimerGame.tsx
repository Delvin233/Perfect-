"use client";

import { useState, useEffect, useRef } from "react";
import { getRankForLevel, getRankColor } from "@/lib/ranks";

interface TimerGameProps {
  onScoreUpdate: (
    score: number,
    level: number,
    perfectHits?: number,
    totalHits?: number,
  ) => void;
}

export default function TimerGame({ onScoreUpdate }: TimerGameProps) {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<"perfect" | "close" | "fail" | null>(
    null,
  );
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [targetTime, setTargetTime] = useState(5.0);
  const [showStageComplete, setShowStageComplete] = useState(false);
  const [perfectHits, setPerfectHits] = useState(0);
  const [totalHits, setTotalHits] = useState(0);

  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  // Stage system
  const stage = Math.ceil(level / 10);

  // Stage 2 target times (levels 11-20)
  const stage2Targets = [3.5, 4.2, 6.8, 2.9, 5.5, 7.3, 4.8, 3.2, 6.1, 8.0];

  // Stage 3 target times (levels 21-30) - EXTREME MODE
  const stage3Targets = [4.7, 2.3, 7.5, 3.8, 6.2, 5.1, 8.5, 2.7, 4.1, 9.0];

  // Calculate tolerance based on stage
  const getTolerance = () => {
    if (stage === 1) {
      // Stage 1: 50ms → 10ms
      return Math.max(0.05 - (level - 1) * 0.005, 0.01);
    } else if (stage === 2) {
      // Stage 2: Fixed 8ms
      return 0.008;
    } else {
      // Stage 3+: Fixed 5ms - EXTREME PRECISION
      return 0.005;
    }
  };

  const tolerance = getTolerance();

  useEffect(() => {
    if (isRunning) {
      const updateTimer = () => {
        const elapsed = (performance.now() - startTimeRef.current) / 1000;
        setTime(elapsed);
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      };
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning]);

  const startTimer = () => {
    setTime(0);
    setResult(null);
    setAccuracy(null);

    // Set target time based on stage
    if (stage === 1) {
      setTargetTime(5.0);
    } else if (stage === 2) {
      // Stage 2: Use varied target times
      const stage2Index = (level - 11) % 10;
      setTargetTime(stage2Targets[stage2Index]);
    } else {
      // Stage 3: Use different varied target times
      const stage3Index = (level - 21) % 10;
      setTargetTime(stage3Targets[stage3Index]);
    }

    startTimeRef.current = performance.now();
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
    const diff = Math.abs(time - targetTime);
    const accuracyPercent = Math.max(0, 100 - (diff / targetTime) * 100);
    setAccuracy(accuracyPercent);

    if (diff <= tolerance) {
      // Perfect or close enough
      const points = Math.round(1000 * level * (1 + accuracyPercent / 100));
      const newScore = score + points;
      setScore(newScore);
      const isPerfect = diff <= 0.01;
      setResult(isPerfect ? "perfect" : "close");

      // Track stats
      const newTotalHits = totalHits + 1;
      const newPerfectHits = isPerfect ? perfectHits + 1 : perfectHits;
      setTotalHits(newTotalHits);
      setPerfectHits(newPerfectHits);

      onScoreUpdate(newScore, level, newPerfectHits, newTotalHits);

      // Visual feedback - flash screen
      triggerFlash(isPerfect ? "perfect" : "success");
    } else {
      setResult("fail");
      // Visual feedback - flash screen red
      triggerFlash("fail");
    }
  };

  const triggerFlash = (type: "perfect" | "success" | "fail") => {
    const flash = document.createElement("div");
    flash.className = `fixed inset-0 pointer-events-none z-50 ${
      type === "perfect"
        ? "bg-green-500"
        : type === "success"
          ? "bg-cyan-500"
          : "bg-red-500"
    }`;
    flash.style.opacity = "0.3";
    flash.style.animation = "flash 0.3s ease-out";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
  };

  const nextLevel = () => {
    const newLevel = level + 1;

    // Check if completing a stage
    if (newLevel === 11 || newLevel === 21) {
      setShowStageComplete(true);
      setTimeout(() => {
        setShowStageComplete(false);
        setLevel(newLevel);
        setResult(null);
        setAccuracy(null);
        setTime(0);
      }, 3000);
    } else {
      setLevel(newLevel);
      setResult(null);
      setAccuracy(null);
      setTime(0);
    }
  };

  const gameOver = () => {
    // Arcade style: fail = start over from level 1
    setLevel(1);
    setScore(0);
    setPerfectHits(0);
    setTotalHits(0);
    setResult(null);
    setAccuracy(null);
    setTime(0);
    setIsRunning(false);
  };

  // Stage completion overlay
  if (showStageComplete) {
    const completedStage = Math.floor((level - 1) / 10);

    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">
            {completedStage === 1 ? "🎉" : "🔥"}
          </div>
          <h2
            className="text-4xl font-bold mb-4"
            style={{ color: completedStage === 1 ? "#a855f7" : "#ef4444" }}
          >
            STAGE {completedStage} COMPLETE!
          </h2>
          {completedStage === 1 && (
            <>
              <p className="text-xl text-[var(--color-text-secondary)] mb-2">
                You&apos;ve mastered the basics
              </p>
              <p className="text-lg text-purple-400">
                Entering Stage 2: Master Mode
              </p>
              <div className="mt-6 text-sm text-[var(--color-text-secondary)]">
                <p>New challenge: Random target times</p>
                <p>Tolerance: ±8ms</p>
              </div>
            </>
          )}
          {completedStage === 2 && (
            <>
              <p className="text-xl text-[var(--color-text-secondary)] mb-2">
                You are truly skilled
              </p>
              <p className="text-lg text-red-400">
                Entering Stage 3: Extreme Mode
              </p>
              <div className="mt-6 text-sm text-[var(--color-text-secondary)]">
                <p>Final challenge: New random times</p>
                <p className="text-red-400 font-bold">Tolerance: ±5ms</p>
                <p className="text-xs mt-2">Only the perfect survive</p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-sm text-[var(--color-text-secondary)] mb-1">
            Stage
          </p>
          <div className="flex items-center justify-center gap-2">
            <p
              className={`text-3xl font-bold ${
                stage === 1
                  ? "text-cyan-500"
                  : stage === 2
                    ? "text-purple-500"
                    : "text-red-500"
              }`}
            >
              {stage}
            </p>
            <span className="text-2xl">
              {stage === 1 ? "⚡" : stage === 2 ? "🔥" : "💀"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stage === 1 ? "Learning" : stage === 2 ? "Master" : "Extreme"}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-[var(--color-text-secondary)] mb-1">
            Rank
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">{getRankForLevel(level).emoji}</span>
            <p
              className={`text-xl font-bold ${getRankColor(getRankForLevel(level).tier)}`}
            >
              {getRankForLevel(level).name}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Level {level} • {((level - 1) % 10) + 1}/10 in stage
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-[var(--color-text-secondary)] mb-1">
            Score
          </p>
          <p className="text-3xl font-bold text-orange-500">
            {score.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">points</p>
        </div>
      </div>

      {/* Timer Display */}
      <div
        className={`card text-center py-12 transition-all ${
          isRunning && Math.abs(time - targetTime) <= tolerance
            ? "ring-4 ring-green-500 ring-opacity-50 animate-pulse"
            : ""
        }`}
      >
        <div className="mb-6">
          {stage === 2 && (
            <span className="inline-block px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-sm font-bold mb-3">
              🔥 STAGE 2: MASTER MODE
            </span>
          )}
          {stage === 3 && (
            <span className="inline-block px-4 py-2 bg-red-500/20 text-red-400 rounded-full text-sm font-bold mb-3">
              💀 STAGE 3: EXTREME MODE
            </span>
          )}
          <p className="text-lg text-[var(--color-text-secondary)] font-semibold">
            Target: {targetTime.toFixed(3)}s
          </p>
        </div>

        {/* Main Timer - BIGGER */}
        <div className="relative mb-6">
          <p
            className={`text-8xl md:text-9xl font-bold font-mono transition-all ${
              isRunning && Math.abs(time - targetTime) <= tolerance * 2
                ? "text-yellow-400"
                : isRunning && Math.abs(time - targetTime) <= tolerance
                  ? "text-green-400 scale-110"
                  : "text-white"
            }`}
          >
            {time.toFixed(3)}
          </p>
          <p className="text-2xl text-gray-500 mt-2">seconds</p>
        </div>

        {/* Progress Bar with Danger Zones */}
        <div className="relative w-full h-4 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
          {/* Tolerance zone indicator */}
          {targetTime > 0 && (
            <>
              <div
                className="absolute h-full bg-green-500/30"
                style={{
                  left: `${Math.max(0, ((targetTime - tolerance) / targetTime) * 100)}%`,
                  width: `${((tolerance * 2) / targetTime) * 100}%`,
                }}
              />
              <div
                className="absolute h-full bg-green-500/50 border-x-2 border-green-400"
                style={{
                  left: `${Math.max(0, ((targetTime - tolerance) / targetTime) * 100)}%`,
                  width: `${((tolerance * 2) / targetTime) * 100}%`,
                }}
              />
            </>
          )}
          {/* Current time indicator */}
          <div
            className={`h-full transition-all duration-100 ${
              Math.abs(time - targetTime) <= tolerance
                ? "bg-green-500"
                : Math.abs(time - targetTime) <= tolerance * 2
                  ? "bg-yellow-500"
                  : stage === 1
                    ? "bg-cyan-500"
                    : stage === 2
                      ? "bg-purple-500"
                      : "bg-red-500"
            }`}
            style={{ width: `${Math.min((time / targetTime) * 100, 100)}%` }}
          />
        </div>

        {/* Distance from target (when running) */}
        {isRunning && time > 0 && (
          <p className="text-sm text-gray-400 mt-3">
            {time < targetTime ? "↓ " : "↑ "}
            {Math.abs(time - targetTime).toFixed(3)}s from target
          </p>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="card text-center py-8">
          {result === "perfect" && (
            <>
              <p className="text-4xl font-bold text-[var(--color-success)] mb-2">
                🎯 PERFECT!
              </p>
              <p className="text-[var(--color-text-secondary)]">
                Accuracy: {accuracy?.toFixed(2)}%
              </p>
            </>
          )}
          {result === "close" && (
            <>
              <p className="text-4xl font-bold text-[var(--color-secondary)] mb-2">
                ✓ CLOSE!
              </p>
              <p className="text-[var(--color-text-secondary)]">
                Accuracy: {accuracy?.toFixed(2)}%
              </p>
            </>
          )}
          {result === "fail" && (
            <>
              <p className="text-4xl font-bold text-[var(--color-error)] mb-4">
                💀 GAME OVER
              </p>

              {/* Stage reached */}
              <div className="mb-4">
                <span
                  className={`inline-block px-4 py-2 rounded-lg font-bold ${
                    stage === 1
                      ? "bg-cyan-500/20 text-cyan-400"
                      : stage === 2
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {stage === 1
                    ? "⚡ Stage 1"
                    : stage === 2
                      ? "🔥 Stage 2"
                      : "💀 Stage 3"}
                  {" • "}
                  Level {level}
                </span>
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-4">
                <p className="text-lg text-[var(--color-text-secondary)]">
                  You were{" "}
                  <span className="text-red-400 font-bold">
                    {Math.abs(time - targetTime).toFixed(3)}s
                  </span>{" "}
                  off
                </p>
                <p className="text-sm text-gray-500">
                  Target: {targetTime.toFixed(3)}s • Your time:{" "}
                  {time.toFixed(3)}s
                </p>
                <p className="text-sm text-gray-500">
                  Tolerance: ±{(tolerance * 1000).toFixed(0)}ms
                </p>
              </div>

              {/* Final score */}
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Final Score</p>
                <p className="text-3xl font-bold text-orange-500">
                  {score.toLocaleString()}
                </p>
              </div>

              {/* Encouraging message */}
              <p className="text-xs text-gray-500 mt-4 italic">
                {level >= 21
                  ? "You're a legend! Stage 3 is brutal."
                  : level >= 11
                    ? "Impressive! You made it to Master Mode."
                    : level >= 5
                      ? "Good effort! Keep practicing."
                      : "Don't give up! You'll get better."}
              </p>
            </>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4">
        {!isRunning && !result && (
          <button
            onClick={startTimer}
            className="btn btn-primary flex-1 text-xl py-6"
          >
            START
          </button>
        )}

        {isRunning && (
          <button
            onClick={stopTimer}
            className="btn btn-primary flex-1 text-xl py-6 animate-pulse"
          >
            STOP
          </button>
        )}

        {result === "perfect" || result === "close" ? (
          <button
            onClick={nextLevel}
            className="btn btn-secondary flex-1 text-xl py-6"
          >
            NEXT LEVEL →
          </button>
        ) : result === "fail" ? (
          <button
            onClick={gameOver}
            className="btn btn-primary flex-1 text-xl py-6"
          >
            TRY AGAIN
          </button>
        ) : null}
      </div>

      {/* Info */}
      <div className="card text-center text-sm text-[var(--color-text-secondary)]">
        <p>Tolerance: ±{(tolerance * 1000).toFixed(0)}ms</p>
      </div>
    </div>
  );
}
