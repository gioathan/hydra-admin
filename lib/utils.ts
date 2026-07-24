export function formatLocalDate(utcStr: string): string {
  return new Date(utcStr).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatLocalTime(utcStr: string): string {
  return new Date(utcStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatLocalDateTime(utcStr: string): string {
  return `${formatLocalDate(utcStr)} · ${formatLocalTime(utcStr)}`;
}

function formatHourLabel(hour: number, minute: number): string {
  const period = hour < 12 ? "AM" : "PM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const mm = minute === 0 ? "" : `:${String(minute).padStart(2, "0")}`;
  return `${h12}${mm}${period}`;
}

// Formats a venue's operating hours, correctly handling overnight ranges
// (e.g. a bar open 18:00-03:00) rather than assuming close is always after open.
export function formatHourRange(
  openHour: number | null,
  closeHour: number | null,
  openMinute?: number | null,
  closeMinute?: number | null
): string | null {
  if (openHour == null || closeHour == null) return null;
  const om = openMinute ?? 0;
  const cm = closeMinute ?? 0;
  const range = `${formatHourLabel(openHour, om)} – ${formatHourLabel(closeHour, cm)}`;
  return closeHour < openHour || (closeHour === openHour && cm <= om) ? `${range} (next day)` : range;
}

export function formatDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

export function getInitial(name: string): string {
  return name.trim()[0]?.toUpperCase() ?? "?";
}

export function validatePassword(password: string): string | null {
  if (password.length < 10) return "At least 10 characters required";
  if (!/[A-Z]/.test(password)) return "At least 1 uppercase letter required";
  if (!/\d/.test(password)) return "At least 1 digit required";
  if (!/[^A-Za-z0-9]/.test(password)) return "At least 1 special character required";
  return null;
}
