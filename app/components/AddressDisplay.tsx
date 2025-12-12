/**
 * AddressDisplay Component for Perfect?
 *
 * Provides consistent address display with name resolution across the app.
 * Supports different display modes and includes loading states.
 */

import { useAddressDisplay } from "@/hooks/useAddressDisplay";
import { getDisplayFormat, isPrivacyModeEnabled } from "@/lib/nameConfig";
import NameBadge from "./NameBadge";

interface AddressDisplayProps {
  address: string | null | undefined;
  mode?: "name-only" | "name-with-badge" | "name-and-address" | "address-only";
  className?: string;
  nameClassName?: string;
  addressClassName?: string;
  showTooltip?: boolean;
  copyable?: boolean;
  loading?: boolean;
}

export default function AddressDisplay({
  address,
  mode = "name-with-badge",
  className = "",
  nameClassName = "",
  addressClassName = "",
  showTooltip = true,
  copyable = false,
  loading = false,
}: AddressDisplayProps) {
  const { displayName, source, isLoading } = useAddressDisplay(address);

  // Apply user's preferred display format if no specific mode is provided
  const userPreferredFormat = getDisplayFormat();
  const effectiveMode = mode === "name-with-badge" ? userPreferredFormat : mode;

  // Check if privacy mode is enabled for this address
  const privacyMode = isPrivacyModeEnabled();

  // If privacy mode is enabled and this is a resolved name (not wallet), hide it
  const shouldHideName = privacyMode && source !== "wallet" && address;
  const finalDisplayName = shouldHideName
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : displayName;
  const finalSource = shouldHideName ? "wallet" : source;

  // Handle copy to clipboard
  const handleCopy = async () => {
    if (!address || !copyable) return;

    try {
      await navigator.clipboard.writeText(address);
      // Could add toast notification here
    } catch (error) {
      console.warn("Failed to copy address:", error);
    }
  };

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-pulse bg-gray-600 h-4 w-24 rounded"></div>
        {mode.includes("badge") && (
          <div className="animate-pulse bg-gray-600 h-4 w-8 rounded"></div>
        )}
      </div>
    );
  }

  // Handle null/undefined address
  if (!address) {
    return (
      <span className={`text-gray-500 ${className}`}>Unknown Address</span>
    );
  }

  const renderContent = () => {
    switch (effectiveMode) {
      case "name-only":
        return (
          <span
            className={`${nameClassName}`}
            title={showTooltip ? address : undefined}
            onClick={copyable ? handleCopy : undefined}
            style={{ cursor: copyable ? "pointer" : "default" }}
          >
            {finalDisplayName}
          </span>
        );

      case "name-with-badge":
        return (
          <div className="flex items-center gap-2">
            <span
              className={`${nameClassName}`}
              title={showTooltip ? address : undefined}
              onClick={copyable ? handleCopy : undefined}
              style={{ cursor: copyable ? "pointer" : "default" }}
            >
              {finalDisplayName}
            </span>
            <NameBadge source={finalSource} />
          </div>
        );

      case "name-and-address":
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${nameClassName}`}>
                {finalDisplayName}
              </span>
              <NameBadge source={finalSource} />
            </div>
            <div
              className={`text-xs font-mono text-gray-500 ${addressClassName}`}
              onClick={copyable ? handleCopy : undefined}
              style={{ cursor: copyable ? "pointer" : "default" }}
              title={copyable ? "Click to copy" : undefined}
            >
              {address}
            </div>
          </div>
        );

      case "address-only":
        return (
          <span
            className={`font-mono ${addressClassName}`}
            onClick={copyable ? handleCopy : undefined}
            style={{ cursor: copyable ? "pointer" : "default" }}
            title={copyable ? "Click to copy" : undefined}
          >
            {address}
          </span>
        );

      default:
        return finalDisplayName;
    }
  };

  return <div className={className}>{renderContent()}</div>;
}

/**
 * Simplified address display for common use cases
 */
interface SimpleAddressDisplayProps {
  address: string | null | undefined;
  showBadge?: boolean;
  className?: string;
  copyable?: boolean;
}

export function SimpleAddressDisplay({
  address,
  showBadge = true,
  className = "",
  copyable = false,
}: SimpleAddressDisplayProps) {
  return (
    <AddressDisplay
      address={address}
      mode={showBadge ? "name-with-badge" : "name-only"}
      className={className}
      copyable={copyable}
    />
  );
}

/**
 * Full address display with name and address
 */
export function FullAddressDisplay({
  address,
  className = "",
  copyable = true,
}: {
  address: string | null | undefined;
  className?: string;
  copyable?: boolean;
}) {
  return (
    <AddressDisplay
      address={address}
      mode="name-and-address"
      className={className}
      copyable={copyable}
    />
  );
}
