"use client";

import { useState, useEffect, useRef } from "react";

interface TimerGameProps {
  onScoreUpdate: (score: number, level: number) => void;
}

export default function TimerGame({ onScoreUpdate }: TimerGameProps) {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<"perfect" | "close" | "fail" | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  const targetTime = 5.0; // Target: 5.000 seconds
  const tolerance = Math.max(0.05 - (level - 1) * 0.005, 0.01); // Gets tighter each level

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
      setResult(diff <= 0.01 ? "perfect" : "close");
      onScoreUpdate(newScore, level);
    } else {
      setResult("fail");
    }
  };

  const nextLevel = () => {
    setLevel(level + 1);
    setResult(null);
    setAccuracy(null);
    setTime(0);
  };

  const retry = () => {
    setResult(null);
    setAccuracy(null);
    setTime(0);
  };

  const reset = () => {
    setLevel(1);
    setScore(0);
    setResult(null);
    setAccuracy(null);
    setTime(0);
    setIsRunning(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <p className="text-sm text-[var(--color-text-secondary)] mb-1">Level</p>
          <p className="text-3xl font-bold text-[var(--color-primary)]">{level}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-[var(--color-text-secondary)] mb-1">Score</p>
          <p className="text-3xl font-bold text-[var(--color-secondary)]">{score}</p>
        </div>
      </div>

      {/* Timer Display */}
      <div className="card text-center py-12">
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          Target: {targetTime.toFixed(3)}s
        </p>
        <p className="text-6xl font-bold font-mono mb-4">
          {time.toFixed(3)}s
        </p>
        <div className="w-full bg-[var(--color-bg-tertiary)] h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] transition-all duration-100"
            style={{ width: `${Math.min((time / targetTime) * 100, 100)}%` }}
          />
        </div>
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
              <p className="text-4xl font-bold text-[var(--color-error)] mb-2">
                ✗ MISSED
              </p>
              <p className="text-[var(--color-text-secondary)]">
                Off by: {Math.abs(time - targetTime).toFixed(3)}s
              </p>
            </>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4">
        {!isRunning && !result && (
          <button onClick={startTimer} className="btn btn-primary flex-1 text-xl py-6">
            START
          </button>
        )}

        {isRunning && (
          <button onClick={stopTimer} className="btn btn-primary flex-1 text-xl py-6 animate-pulse">
            STOP
          </button>
        )}

        {result === "perfect" || result === "close" ? (
          <button onClick={nextLevel} className="btn btn-secondary flex-1 text-xl py-6">
            NEXT LEVEL →
          </button>
        ) : result === "fail" ? (
          <>
            <button onClick={retry} className="btn btn-secondary flex-1">
              RETRY
            </button>
            <button onClick={reset} className="btn flex-1">
              RESET
            </button>
          </>
        ) : null}
      </div>

      {/* Info */}
      <div className="card text-center text-sm text-[var(--color-text-secondary)]">
        <p>Tolerance: ±{(tolerance * 1000).toFixed(0)}ms</p>
      </div>
    </div>
  );
}
