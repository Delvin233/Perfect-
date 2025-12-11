/**
 * NameBadge Component for Perfect?
 *
 * Displays visual indicators for different name sources (ENS, Base names)
 * with proper accessibility attributes and consistent styling.
 */

interface NameBadgeProps {
  source: "ens" | "basename" | "wallet";
  className?: string;
}

export default function NameBadge({ source, className = "" }: NameBadgeProps) {
  // Don't show badge for wallet addresses (truncated)
  if (source === "wallet") {
    return null;
  }

  const getBadgeConfig = () => {
    switch (source) {
      case "ens":
        return {
          label: "ENS",
          bgColor: "bg-blue-500/20",
          textColor: "text-blue-400",
          ariaLabel: "Ethereum Name Service",
          title: "This address has an ENS name",
        };
      case "basename":
        return {
          label: "BASE",
          bgColor: "bg-purple-500/20",
          textColor: "text-purple-400",
          ariaLabel: "Base Name",
          title: "This address has a Base name",
        };
      default:
        return null;
    }
  };

  const config = getBadgeConfig();
  if (!config) return null;

  return (
    <span
      className={`text-[10px] px-1 py-0.5 rounded flex-shrink-0 ${config.bgColor} ${config.textColor} ${className}`}
      aria-label={config.ariaLabel}
      title={config.title}
      role="img"
    >
      {config.label}
    </span>
  );
}

/**
 * Helper component for displaying name with badge
 */
interface NameWithBadgeProps {
  displayName: string;
  source: "ens" | "basename" | "wallet";
  fullAddress?: string;
  className?: string;
  nameClassName?: string;
  badgeClassName?: string;
}

export function NameWithBadge({
  displayName,
  source,
  fullAddress,
  className = "",
  nameClassName = "",
  badgeClassName = "",
}: NameWithBadgeProps) {
  return (
    <div className={`flex items-center gap-1 sm:gap-2 ${className}`}>
      <span
        className={`font-bold truncate ${nameClassName}`}
        title={fullAddress || displayName}
      >
        {displayName}
      </span>
      <NameBadge source={source} className={badgeClassName} />
    </div>
  );
}
