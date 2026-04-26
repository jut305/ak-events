import { useState } from "react";
import type { AppEvent } from "../types";
import { CATEGORY_ORDER } from "../lib/categories";
import { CategoryAccordion } from "./CategoryAccordion";

interface BrowseSectionProps {
  events: AppEvent[];
  onSelectEvent: (e: AppEvent) => void;
}

export function BrowseSection({ events, onSelectEvent }: BrowseSectionProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    events: events.filter((e) => e.category === cat),
  }));

  return (
    <section className="bg-surface/40">
      <div className="px-5 pt-8 pb-3">
        <div className="rule mb-6" />
        <h2 className="font-display text-[1.5rem] font-semibold text-ink leading-tight tracking-tight">
          Browse all
        </h2>
        <p className="font-display-italic text-[0.9375rem] text-ink-soft mt-0.5">
          The next 30 days, by category.
        </p>
      </div>

      <div>
        {grouped.map(({ cat, events: catEvents }) => (
          <CategoryAccordion
            key={cat}
            category={cat}
            events={catEvents}
            open={openCategory === cat}
            onToggle={() =>
              setOpenCategory((prev) => (prev === cat ? null : cat))
            }
            onSelectEvent={onSelectEvent}
          />
        ))}
      </div>
    </section>
  );
}
