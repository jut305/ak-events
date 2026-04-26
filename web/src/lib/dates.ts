import {
  addDays,
  endOfDay,
  isWithinInterval,
  nextSaturday,
  startOfDay,
  isSaturday,
  isSunday,
  isFriday,
  format,
  isSameDay,
  differenceInCalendarDays,
} from "date-fns";
import type { TimeRange } from "../types";

/**
 * "This weekend" — Friday 5pm through Sunday end-of-day if today is Mon-Thu.
 * If today is already Fri/Sat/Sun, the current weekend is "this" weekend.
 */
export function weekendInterval(now: Date): { start: Date; end: Date } {
  if (isFriday(now) || isSaturday(now) || isSunday(now)) {
    // current weekend
    const friday = isFriday(now)
      ? now
      : isSaturday(now)
        ? addDays(now, -1)
        : addDays(now, -2);
    return {
      start: startOfDay(friday),
      end: endOfDay(addDays(friday, 2)),
    };
  }
  const sat = nextSaturday(now);
  return {
    start: startOfDay(addDays(sat, -1)), // Friday
    end: endOfDay(addDays(sat, 1)), // Sunday
  };
}

export function rangeInterval(
  range: TimeRange,
  now: Date
): { start: Date; end: Date } {
  switch (range) {
    case "weekend":
      return weekendInterval(now);
    case "7d":
      return { start: startOfDay(now), end: endOfDay(addDays(now, 7)) };
    case "30d":
      return { start: startOfDay(now), end: endOfDay(addDays(now, 30)) };
  }
}

export function isInRange(eventStart: Date, range: TimeRange, now: Date) {
  const { start, end } = rangeInterval(range, now);
  return isWithinInterval(eventStart, { start, end });
}

export function formatEventDateLine(start: Date, end: Date | null, allDay: boolean): string {
  const datePart = format(start, "EEE, MMM d");
  if (allDay) {
    if (end && !isSameDay(start, end)) {
      return `${format(start, "MMM d")} – ${format(end, "MMM d")}`;
    }
    return `${datePart} · all day`;
  }
  const timePart = format(start, "h:mm a");
  if (end && !isSameDay(start, end)) {
    return `${format(start, "MMM d")} – ${format(end, "MMM d")} · ${timePart}`;
  }
  return `${datePart} · ${timePart}`;
}

export function isWithinDays(date: Date, days: number, now: Date): boolean {
  const diff = differenceInCalendarDays(now, date);
  return diff >= 0 && diff <= days;
}
