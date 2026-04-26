import type { ReactNode } from "react";

interface ChipProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  accentColor?: string;
}

const DEFAULT_ACCENT = "#2d4a3e"; // spruce — used when no category color is supplied

export function Chip({ selected, onClick, children, accentColor }: ChipProps) {
  const fill = selected ? (accentColor ?? DEFAULT_ACCENT) : "transparent";
  const textColor = selected ? "#fffdf8" : "#5a5246";
  const borderColor = selected ? fill : "#e8e1d2";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="shrink-0 px-3 h-9 rounded-full text-[0.8125rem] font-medium transition-all whitespace-nowrap"
      style={{
        backgroundColor: fill,
        border: `1.5px solid ${borderColor}`,
        color: textColor,
        boxShadow: selected
          ? `0 1px 6px ${accentColor ?? DEFAULT_ACCENT}40`
          : "none",
      }}
    >
      {children}
    </button>
  );
}
