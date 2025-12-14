"use client";

import { useState } from "react";
import { useFarcaster } from "../context/FarcasterProvider";
import { useFarcasterAuth } from "../hooks/useFarcasterAuth";

export default function FarcasterDebugPanel() {
  const { isInMiniApp, isReady, context, user } = useFarcaster();
  const { isAuthenticated, token, authenticate, logout } = useFarcasterAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-mono"
      >
        FC Debug {isInMiniApp ? "✅" : "❌"}
      </button>

      {isExpanded && (
        <div className="absolute bottom-12 right-0 bg-black/90 text-white p-4 rounded-lg w-80 max-h-96 overflow-y-auto text-xs font-mono">
          <h3 className="font-bold mb-2">Farcaster Debug Panel</h3>

          <div className="space-y-2">
            <div>
              <strong>Environment:</strong>
              <div className="ml-2">
                <div>In Mini App: {isInMiniApp ? "✅" : "❌"}</div>
                <div>SDK Ready: {isReady ? "✅" : "❌"}</div>
                <div>Authenticated: {isAuthenticated ? "✅" : "❌"}</div>
              </div>
            </div>

            {user && (
              <div>
                <strong>User:</strong>
                <div className="ml-2">
                  <div>FID: {user.fid}</div>
                  <div>Username: {user.username || "N/A"}</div>
                  <div>Display Name: {user.displayName || "N/A"}</div>
                  <div>Has PFP: {user.pfpUrl ? "✅" : "❌"}</div>
                </div>
              </div>
            )}

            {context?.location && (
              <div>
                <strong>Location:</strong>
                <div className="ml-2">
                  <div>Type: {context.location.type}</div>
                  {context.location.type === "cast_embed" && (
                    <div>
                      Cast Hash: {context.location.cast?.hash?.slice(0, 10)}...
                    </div>
                  )}
                  {context.location.type === "open_miniapp" && (
                    <div>Referrer: {context.location.referrerDomain}</div>
                  )}
                </div>
              </div>
            )}

            {context?.client && (
              <div>
                <strong>Client:</strong>
                <div className="ml-2">
                  <div>Platform: {context.client.platformType || "N/A"}</div>
                  <div>Client FID: {context.client.clientFid}</div>
                  <div>Added: {context.client.added ? "✅" : "❌"}</div>
                  {context.client.safeAreaInsets && (
                    <div>
                      Safe Area: {JSON.stringify(context.client.safeAreaInsets)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {token && (
              <div>
                <strong>Auth Token:</strong>
                <div className="ml-2 break-all">{token.slice(0, 20)}...</div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              {!isAuthenticated ? (
                <button
                  onClick={authenticate}
                  className="bg-green-600 px-2 py-1 rounded text-xs"
                >
                  Auth
                </button>
              ) : (
                <button
                  onClick={logout}
                  className="bg-red-600 px-2 py-1 rounded text-xs"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
