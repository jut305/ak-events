import type {
  AppEvent,
  ArtsSub,
  Category,
  FitnessSub,
  TimeRange,
} from "../types";
import { isInRange } from "./dates";

export interface FilterState {
  range: TimeRange;
  categories: Category[]; // empty = all
  fitnessSubs: FitnessSub[]; // empty = all (only relevant when fitness is included)
  artsSubs: ArtsSub[]; // empty = all (only relevant when arts is included)
  family: boolean;
  query: string;
}

export const DEFAULT_FILTERS: FilterState = {
  range: "weekend",
  categories: [],
  fitnessSubs: [],
  artsSubs: [],
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

    // Subcategory only narrows events of the matching parent category.
    if (
      e.category === "fitness" &&
      filters.fitnessSubs.length > 0 &&
      !(e.fitnessSub && filters.fitnessSubs.includes(e.fitnessSub))
    ) {
      return false;
    }

    if (
      e.category === "arts" &&
      filters.artsSubs.length > 0 &&
      !(e.artsSub && filters.artsSubs.includes(e.artsSub))
    ) {
      return false;
    }

    if (filters.family && !e.familyFriendly) return false;

    if (!matchesQuery(e, q)) return false;

    return true;
  });
}

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
