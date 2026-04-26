import type { AppEvent, Category, FitnessSub, TimeRange } from "../types";
import { isInRange } from "./dates";

export interface FilterState {
  range: TimeRange;
  categories: Category[]; // empty = all
  subs: FitnessSub[]; // empty = all (only relevant when fitness is included)
  family: boolean;
  query: string;
}

export const DEFAULT_FILTERS: FilterState = {
  range: "weekend",
  categories: [],
  subs: [],
  family: false,
  query: "",
};

function matchesQuery(e: AppEvent, q: string): boolean {
  if (!q) return true;
  const hay = `${e.title} ${e.location} ${e.description}`.toLowerCase();
  return hay.includes(q);
}

export function applyFilters(
  events: AppEvent[],
  filters: FilterState,
  now: Date
): AppEvent[] {
  const q = filters.query.trim().toLowerCase();

  return events.filter((e) => {
    if (!isInRange(e.startDate, filters.range, now)) return false;

    if (filters.categories.length > 0 && !filters.categories.includes(e.category))
      return false;

    // Subcategory only narrows fitness events; non-fitness pass through.
    if (
      e.category === "fitness" &&
      filters.subs.length > 0 &&
      !(e.fitnessSub && filters.subs.includes(e.fitnessSub))
    ) {
      return false;
    }

    if (filters.family && !e.familyFriendly) return false;

    if (!matchesQuery(e, q)) return false;

    return true;
  });
}

/**
 * For the bottom "browse" section: always 30-day window, organized by
 * category. Search and family toggle apply, but time/category/sub do not.
 */
export function browseEvents(
  events: AppEvent[],
  filters: FilterState,
  now: Date
): AppEvent[] {
  const q = filters.query.trim().toLowerCase();
  return events.filter((e) => {
    if (!isInRange(e.startDate, "30d", now)) return false;
    if (filters.family && !e.familyFriendly) return false;
    if (!matchesQuery(e, q)) return false;
    return true;
  });
}
