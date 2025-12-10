import { useEffect, useState, useCallback } from "react";

interface UseKeyboardNavOptions {
  itemCount: number;
  onSelect: (index: number) => void;
  onBack?: () => void;
  enabled?: boolean;
}

export function useKeyboardNav({
  itemCount,
  onSelect,
  onBack,
  enabled = true,
}: UseKeyboardNavOptions) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : itemCount - 1));
          break;

        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev < itemCount - 1 ? prev + 1 : 0));
          break;

        case "Enter":
        case " ": // Space
          e.preventDefault();
          onSelect(selectedIndex);
          break;

        case "Escape":
          e.preventDefault();
          if (onBack) onBack();
          break;

        case "Home":
          e.preventDefault();
          setSelectedIndex(0);
          break;

        case "End":
          e.preventDefault();
          setSelectedIndex(itemCount - 1);
          break;

        case "Tab":
          e.preventDefault();
          if (e.shiftKey) {
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : itemCount - 1));
          } else {
            setSelectedIndex((prev) => (prev < itemCount - 1 ? prev + 1 : 0));
          }
          break;

        // Quick select with number keys (1-6)
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
          e.preventDefault();
          const index = parseInt(e.key) - 1;
          if (index < itemCount) {
            setSelectedIndex(index);
            onSelect(index);
          }
          break;
      }
    },
    [enabled, itemCount, onSelect, onBack, selectedIndex],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return {
    selectedIndex,
    setSelectedIndex,
  };
}
