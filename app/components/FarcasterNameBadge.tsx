"use client";

import { useState, useEffect } from "react";

interface FarcasterUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
}

interface FarcasterNameBadgeProps {
  address: string;
  fid?: number;
  className?: string;
}

export default function FarcasterNameBadge({
  address,
  fid,
  className = "",
}: FarcasterNameBadgeProps) {
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFarcasterUser = async () => {
      if (!fid && !address) return;

      setLoading(true);
      try {
        const endpoint = fid
          ? `/api/farcaster/user?fid=${fid}`
          : `/api/farcaster/user?address=${address}`;

        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setFarcasterUser(data.user);
          }
        }
      } catch (error) {
        console.error("Failed to fetch Farcaster user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarcasterUser();
  }, [address, fid]);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-4 h-4 bg-gray-600 rounded-full animate-pulse"></div>
        <div className="w-16 h-3 bg-gray-600 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!farcasterUser) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={farcasterUser.pfp_url}
        alt={farcasterUser.display_name}
        className="w-4 h-4 rounded-full"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <span className="text-purple-400 text-sm font-medium">
        {farcasterUser.display_name || `@${farcasterUser.username}`}
      </span>
      <span className="text-xs text-purple-300/60">FC</span>
    </div>
  );
}
