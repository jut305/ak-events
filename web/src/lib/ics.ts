import type { AppEvent } from "../types";

function formatGcalDate(date: Date, allDay: boolean): string {
  if (allDay) {
    return [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, "0"),
      String(date.getUTCDate()).padStart(2, "0"),
    ].join("");
  }
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
    "T",
    String(date.getUTCHours()).padStart(2, "0"),
    String(date.getUTCMinutes()).padStart(2, "0"),
    String(date.getUTCSeconds()).padStart(2, "0"),
    "Z",
  ].join("");
}

/**
 * Build a Google Calendar pre-fill URL. Works universally — iOS, Android,
 * desktop. Opens GCal with the event ready to save. iOS users on Apple
 * Calendar still benefit if their Google account syncs to Apple Calendar
 * (the standard setup).
 */
export function buildGoogleCalendarUrl(event: AppEvent): string {
  const start = formatGcalDate(event.startDate, event.allDay);
  const fallbackEnd = event.allDay
    ? new Date(event.startDate.getTime() + 24 * 60 * 60 * 1000)
    : new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000);
  const end = formatGcalDate(event.endDate ?? fallbackEnd, event.allDay);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: `${event.description}\n\nSource: ${event.sourceUrl}`,
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
