import rawEventsJson from "../../../events.json";
import type { AppEvent, ArtsSub, Category, RawEvent } from "../types";
import { classifyArts, classifyFitness } from "../lib/categories";
import { isWithinDays } from "../lib/dates";
import { isFamilyFriendlyHeuristic } from "../lib/family";

const NEW_THRESHOLD_DAYS = 7;

/**
 * Migrate legacy `category: "photography"` to `category: "arts"` with
 * `artsSub: "photography"`. The data file may still carry the old shape
 * until the next refresh.
 */
function normalizeCategory(raw: RawEvent): {
  category: Category;
  artsSubHint: ArtsSub | null;
} {
  if ((raw.category as string) === "photography") {
    return { category: "arts", artsSubHint: "photography" };
  }
  return {
    category: raw.category as Category,
    artsSubHint: raw.artsSub ?? null,
  };
}

export function loadEvents(now: Date): AppEvent[] {
  const raw = rawEventsJson as RawEvent[];
  return raw
    .map((e): AppEvent => {
      const startDate = new Date(e.start);
      const endDate = e.end ? new Date(e.end) : null;
      const firstSeen = new Date(e.firstSeen);
      const familyFriendly =
        typeof e.familyFriendly === "boolean"
          ? e.familyFriendly
          : isFamilyFriendlyHeuristic(e.title, e.description ?? "");

      const { category, artsSubHint } = normalizeCategory(e);

      const fitnessSub =
        category === "fitness"
          ? classifyFitness(e.title, e.description ?? "")
          : null;

      const artsSub =
        category === "arts"
          ? (artsSubHint ?? classifyArts(e.title, e.description ?? ""))
          : null;

      return {
        ...e,
        category,
        startDate,
        endDate,
        fitnessSub,
        artsSub,
        isNew: isWithinDays(firstSeen, NEW_THRESHOLD_DAYS, now),
        familyFriendly,
      };
    })
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}
