import { Users } from "lucide-react";
import type { AppEvent } from "../types";
import { CATEGORY_META } from "../lib/categories";
import { formatEventDateLine } from "../lib/dates";

interface EventCardProps {
  event: AppEvent;
  onClick: () => void;
  variant?: "default" | "compact";
}

export function EventCard({ event, onClick, variant = "default" }: EventCardProps) {
  const meta = CATEGORY_META[event.category];

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-surface border border-line rounded-card overflow-hidden transition-all hover:border-line-strong hover:-translate-y-px relative group"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: meta.color }}
      />
      <div className={"pl-5 pr-5 " + (variant === "compact" ? "py-3.5" : "py-4")}>
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="font-display-italic text-[0.8125rem] tracking-tight"
            style={{ color: meta.color }}
          >
            {meta.label}
          </span>
          <span className="text-ink-muted text-[0.75rem]">·</span>
          <span className="text-ink-soft text-[0.8125rem] tabular-nums">
            {formatEventDateLine(event.startDate, event.endDate, event.allDay)}
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5">
            {event.familyFriendly && (
              <span
                aria-label="Family-friendly"
                title="Family-friendly"
                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-spruce-soft text-spruce"
              >
                <Users size={11} strokeWidth={2.25} />
              </span>
            )}
            {event.isNew && (
              <span className="text-[0.625rem] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rust/10 text-rust">
                New
              </span>
            )}
          </span>
        </div>
        <h3 className="font-display text-[1.0625rem] sm:text-[1.125rem] font-semibold text-ink leading-[1.2] tracking-tight mb-1">
          {event.title}
        </h3>
        <p className="text-[0.8125rem] text-ink-muted leading-snug truncate">
          {event.location}
        </p>
      </div>
    </button>
  );
}
