import { useEffect } from "react";
import { CalendarPlus, ExternalLink, MapPin, X } from "lucide-react";
import type { AppEvent } from "../types";
import { CATEGORY_META } from "../lib/categories";
import { formatEventDateLine } from "../lib/dates";
import { buildGoogleCalendarUrl } from "../lib/ics";

interface EventDialogProps {
  event: AppEvent | null;
  onClose: () => void;
}

export function EventDialog({ event, onClose }: EventDialogProps) {
  // Lock page scroll while the sheet is open so iOS can't toggle the URL
  // bar (which would otherwise resize the viewport mid-interaction).
  useEffect(() => {
    if (!event) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [event]);

  // Escape closes
  useEffect(() => {
    if (!event) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [event, onClose]);

  if (!event) return null;

  const meta = CATEGORY_META[event.category];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(31, 27, 22, 0.4)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
        }}
      />
      <div
        className="relative mt-auto sm:m-auto w-full sm:max-w-lg mx-auto"
        style={{
          maxHeight: "90svh",
          display: "grid",
          gridTemplateRows: "auto minmax(0, 1fr) auto",
          backgroundColor: "var(--color-surface)",
          color: "var(--color-ink)",
          boxShadow: "var(--shadow-pop)",
          borderRadius: "1.25rem 1.25rem 0 0",
          overflow: "hidden",
          overscrollBehavior: "contain",
          animation: "sheet-up 220ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 pb-3 gap-3 border-b border-line">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[0.6875rem] font-medium uppercase tracking-wider"
                style={{ color: meta.color }}
              >
                {meta.label}
              </span>
              {event.isNew && (
                <span className="text-[0.625rem] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-spruce/10 text-spruce">
                  New
                </span>
              )}
            </div>
            <h2 className="text-[1.125rem] font-semibold leading-tight text-ink">
              {event.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 p-2 rounded-md hover:bg-line/60 text-ink-muted shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="p-5 pt-4 overflow-y-auto space-y-4"
          style={{ overscrollBehavior: "contain" }}
        >
          <div className="text-[0.875rem] text-ink-soft tabular-nums">
            {formatEventDateLine(event.startDate, event.endDate, event.allDay)}
          </div>

          <div className="flex items-start gap-2 text-[0.875rem] text-ink-soft">
            <MapPin size={15} className="text-ink-muted shrink-0 mt-0.5" />
            <span>{event.location}</span>
          </div>

          {event.description && (
            <p className="text-[0.9375rem] text-ink leading-relaxed">
              {event.description}
            </p>
          )}

          <div className="text-[0.75rem] text-ink-muted">
            Source: {event.sourceName}
          </div>
        </div>

        <div
          className="p-4 pt-3 border-t border-line flex flex-col gap-2 sm:flex-row sm:gap-2"
          style={{ backgroundColor: "rgba(248, 244, 236, 0.6)" }}
        >
          <a
            href={buildGoogleCalendarUrl(event)}
            target="_blank"
            rel="noreferrer noopener"
            className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-lg font-medium text-[0.9375rem] transition-all"
            style={{
              backgroundColor: "#2d4a3e",
              color: "#fffdf8",
              boxShadow: "0 1px 6px rgba(45, 74, 62, 0.25)",
            }}
          >
            <CalendarPlus size={16} />
            Add to calendar
          </a>
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-lg font-medium text-[0.9375rem] transition-colors"
            style={{
              backgroundColor: "#fffdf8",
              color: "#1f1b16",
              border: "1.5px solid #e8e1d2",
            }}
          >
            <ExternalLink size={15} />
            Open source
          </a>
        </div>
      </div>
    </div>
  );
}
