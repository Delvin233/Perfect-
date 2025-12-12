"use client";

import { useChainId } from "wagmi";
import { getNetworkFromChainId } from "@/lib/contracts";

export default function NetworkIndicator() {
  const chainId = useChainId();
  const network = getNetworkFromChainId(chainId);

  const getNetworkInfo = () => {
    switch (network) {
      case "base":
        return { name: "Base", color: "text-blue-400", emoji: "🔵" };
      case "baseSepolia":
        return { name: "Base Sepolia", color: "text-blue-300", emoji: "🧪" };
      case "celo":
        return { name: "Celo", color: "text-green-400", emoji: "🟢" };
      default:
        return { name: "Unknown", color: "text-gray-400", emoji: "❓" };
    }
  };

  const networkInfo = getNetworkInfo();

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span>{networkInfo.emoji}</span>
      <span className={networkInfo.color}>{networkInfo.name}</span>
      <span>Network</span>
    </div>
  );
}
