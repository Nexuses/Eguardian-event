/**
 * Event times are entered in admin as local (India) and stored in UTC.
 * Use this timezone for consistent display in admin and on public site.
 */
export const EVENT_TIMEZONE = "Asia/Kolkata";

/**
 * Parse a datetime-local value ("YYYY-MM-DDTHH:mm") as event time (India).
 * Ensures the same input produces the same UTC moment regardless of server timezone.
 */
export function parseEventDateTime(value: string): Date {
  if (!value || typeof value !== "string") return new Date(NaN);
  const s = value.trim();
  if (!s) return new Date(NaN);
  // If it already has timezone info, parse as-is
  if (/[+-]\d{2}:?\d{2}$|Z$/i.test(s)) return new Date(s);
  // Otherwise treat as India time (IST = +05:30)
  const withTz = s.length <= 16 ? `${s.slice(0, 16)}:00+05:30` : `${s}+05:30`;
  return new Date(withTz);
}

/**
 * Format a date for display (event date/time in India).
 */
export function formatEventDate(d: Date | string): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: EVENT_TIMEZONE,
    });
  } catch {
    return "—";
  }
}

export function formatEventTime(d: Date | string): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: EVENT_TIMEZONE,
    });
  } catch {
    return "—";
  }
}

export function formatEventDateTime(d: Date | string): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: EVENT_TIMEZONE,
    });
  } catch {
    return "—";
  }
}

/** For datetime-local input: format a Date to "YYYY-MM-DDTHH:mm" in event timezone. */
export function toDatetimeLocal(d: Date | string): string {
  if (!d) return "";
  try {
    const date = new Date(d);
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: EVENT_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((p) => p.type === type)?.value ?? "";
    const y = get("year");
    const m = get("month");
    const day = get("day");
    const hour = get("hour");
    const minute = get("minute");
    if (!y || !m || !day || hour === undefined || minute === undefined) return "";
    return `${y}-${m}-${day}T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  } catch {
    return "";
  }
}
