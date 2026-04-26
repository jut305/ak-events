import rawEventsJson from "../../../events.json";
import type { AppEvent, RawEvent } from "../types";
import { classifyFitness } from "../lib/categories";
import { isWithinDays } from "../lib/dates";
import { isFamilyFriendlyHeuristic } from "../lib/family";

const NEW_THRESHOLD_DAYS = 7;

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
      return {
        ...e,
        startDate,
        endDate,
        fitnessSub:
          e.category === "fitness"
            ? classifyFitness(e.title, e.description ?? "")
            : null,
        isNew: isWithinDays(firstSeen, NEW_THRESHOLD_DAYS, now),
        familyFriendly,
      };
    })
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}
