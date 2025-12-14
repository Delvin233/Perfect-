"use client";

import { useFarcaster } from "../context/FarcasterProvider";
import { useFarcasterAuth } from "../hooks/useFarcasterAuth";

export default function FarcasterProfile() {
  const { isInMiniApp, user, context } = useFarcaster();
  const { isAuthenticated } = useFarcasterAuth();

  if (!isInMiniApp || !user) {
    return null;
  }

  return (
    <div className="card p-4 mb-4">
      <div className="flex items-center gap-3">
        {user.pfpUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.pfpUrl}
            alt={user.displayName || user.username || "User"}
            className="w-12 h-12 rounded-full"
          />
        )}
        <div className="flex-1">
          <h3 className="font-bold text-lg">
            {user.displayName || user.username || `User ${user.fid}`}
          </h3>
          {user.username && (
            <p className="text-sm text-gray-400">@{user.username}</p>
          )}
          <p className="text-xs text-gray-500">FID: {user.fid}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isAuthenticated ? "bg-green-500" : "bg-gray-500"}`}
            ></div>
            <span className="text-xs text-gray-400">
              {isAuthenticated ? "Authenticated" : "Not authenticated"}
            </span>
          </div>
          {context?.location && (
            <p className="text-xs text-gray-500 mt-1">
              From: {context.location.type}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
