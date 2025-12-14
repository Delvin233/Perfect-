"use client";

import { useState, useEffect, useCallback } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useFarcaster } from "../context/FarcasterProvider";

interface FarcasterAuthState {
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export function useFarcasterAuth() {
  const { isInMiniApp, isReady } = useFarcaster();
  const [authState, setAuthState] = useState<FarcasterAuthState>({
    isAuthenticated: false,
    token: null,
    loading: false,
    error: null,
  });

  const authenticate = useCallback(async () => {
    if (!isInMiniApp || !isReady) {
      setAuthState((prev) => ({
        ...prev,
        error: "Not in Mini App environment",
      }));
      return;
    }

    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Use Quick Auth to get a token
      const { token } = await sdk.quickAuth.getToken();

      setAuthState({
        isAuthenticated: true,
        token,
        loading: false,
        error: null,
      });

      return token;
    } catch (error) {
      console.error("Farcaster authentication failed:", error);
      setAuthState({
        isAuthenticated: false,
        token: null,
        loading: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      });
    }
  }, [isInMiniApp, isReady]);

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      token: null,
      loading: false,
      error: null,
    });
  };

  // Auto-authenticate when in Mini App
  useEffect(() => {
    if (
      isInMiniApp &&
      isReady &&
      !authState.isAuthenticated &&
      !authState.loading
    ) {
      authenticate();
    }
  }, [
    isInMiniApp,
    isReady,
    authState.isAuthenticated,
    authState.loading,
    authenticate,
  ]);

  return {
    ...authState,
    authenticate,
    logout,
  };
}
