import { ChevronDown } from "lucide-react";
import type { AppEvent, Category } from "../types";
import { CATEGORY_META } from "../lib/categories";
import { EventCard } from "./EventCard";

interface CategoryAccordionProps {
  category: Category;
  events: AppEvent[];
  open: boolean;
  onToggle: () => void;
  onSelectEvent: (e: AppEvent) => void;
}

export function CategoryAccordion({
  category,
  events,
  open,
  onToggle,
  onSelectEvent,
}: CategoryAccordionProps) {
  const meta = CATEGORY_META[category];
  const id = `accordion-${category}`;

  return (
    <div className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className="w-full flex items-baseline gap-3 py-4 px-5 text-left hover:bg-line/30 transition-colors"
      >
        <span
          aria-hidden
          className="w-1.5 h-1.5 rounded-full shrink-0 self-center"
          style={{ background: meta.color }}
        />
        <span className="font-display text-[1.125rem] font-semibold text-ink tracking-tight">
          {meta.label}
        </span>
        <span className="font-display-italic text-[0.875rem] text-ink-muted ml-1 tabular-nums">
          {events.length}
        </span>
        <ChevronDown
          size={18}
          className={
            "ml-auto text-ink-muted transition-transform self-center " +
            (open ? "rotate-180" : "")
          }
        />
      </button>

      {open && (
        <div id={id} className="px-5 pb-4 pt-1 space-y-2 bg-paper/40">
          {events.length === 0 ? (
            <div className="text-[0.8125rem] text-ink-muted py-2">
              No upcoming events in the next 30 days.
            </div>
          ) : (
            events.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                onClick={() => onSelectEvent(e)}
                variant="compact"
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
