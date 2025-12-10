"use client";

import { useState, useCallback } from "react";

interface ToastData {
  id: number;
  message: string;
  type: "info" | "success" | "warning" | "error";
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback(
    (
      message: string,
      type: "info" | "success" | "warning" | "error" = "info",
      duration = 3000,
    ) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    [],
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
    success: (message: string, duration?: number) =>
      showToast(message, "success", duration),
    error: (message: string, duration?: number) =>
      showToast(message, "error", duration),
    warning: (message: string, duration?: number) =>
      showToast(message, "warning", duration),
    info: (message: string, duration?: number) =>
      showToast(message, "info", duration),
  };
}
