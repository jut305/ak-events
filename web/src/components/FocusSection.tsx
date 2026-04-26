import type {
  AppEvent,
  Category,
  FitnessSub,
  TimeRange,
} from "../types";
import {
  CATEGORY_META,
  FITNESS_SUB_LABEL,
} from "../lib/categories";
import { EventCard } from "./EventCard";

interface FocusSectionProps {
  events: AppEvent[];
  range: TimeRange;
  categories: Category[];
  subs: FitnessSub[];
  family: boolean;
  onSelectEvent: (e: AppEvent) => void;
}

const RANGE_LABEL: Record<TimeRange, string> = {
  weekend: "This Weekend",
  "7d": "Next 7 Days",
  "30d": "Next 30 Days",
};

function formatList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} + ${items[1]}`;
  return `${items[0]} + ${items[1]} + ${items.length - 2} more`;
}

function focusTitle(
  range: TimeRange,
  categories: Category[],
  subs: FitnessSub[],
  family: boolean
): string {
  const parts: string[] = [RANGE_LABEL[range]];

  if (categories.length > 0) {
    const labels = categories.map((c) => CATEGORY_META[c].label);
    parts.push(formatList(labels));
  }

  if (categories.includes("fitness") && subs.length > 0) {
    const subLabels = subs.map((s) => FITNESS_SUB_LABEL[s]);
    parts.push(formatList(subLabels));
  }

  if (family) parts.push("Family");

  return parts.join(" · ");
}

export function FocusSection({
  events,
  range,
  categories,
  subs,
  family,
  onSelectEvent,
}: FocusSectionProps) {
  const title = focusTitle(range, categories, subs, family);

  return (
    <section className="px-5 pb-8">
      <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-line">
        <h2 className="font-display text-[1.5rem] sm:text-[1.625rem] font-semibold text-ink leading-tight tracking-tight">
          {title}
        </h2>
        <span className="text-[0.8125rem] text-ink-muted tabular-nums shrink-0 ml-3">
          {events.length}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="border border-dashed border-line-strong rounded-card px-4 py-8 text-center text-[0.875rem] text-ink-muted bg-surface/40">
          Nothing matching this filter. Try widening the time range or
          relaxing categories.
        </div>
      ) : (
        <div className="space-y-2.5">
          {events.map((e) => (
            <EventCard key={e.id} event={e} onClick={() => onSelectEvent(e)} />
          ))}
        </div>
      )}
    </section>
  );
}
