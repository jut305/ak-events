import type { AppEvent } from "../types";

function formatIcsDate(date: Date, allDay: boolean): string {
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

function escapeIcsText(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildIcs(event: AppEvent): string {
  const dtstamp = formatIcsDate(new Date(), false);
  const dtstart = formatIcsDate(event.startDate, event.allDay);
  const fallbackEnd = event.allDay
    ? new Date(event.startDate.getTime() + 24 * 60 * 60 * 1000)
    : new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000);
  const dtend = formatIcsDate(event.endDate ?? fallbackEnd, event.allDay);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ak-events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@ak-events`,
    `DTSTAMP:${dtstamp}`,
    event.allDay
      ? `DTSTART;VALUE=DATE:${dtstart}`
      : `DTSTART:${dtstart}`,
    event.allDay
      ? `DTEND;VALUE=DATE:${dtend}`
      : `DTEND:${dtend}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}\\n\\nSource: ${escapeIcsText(event.sourceUrl)}`,
    `URL:${event.sourceUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export function downloadIcs(event: AppEvent) {
  const ics = buildIcs(event);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
