export function getUTCDateOnly(base = new Date()): Date {
  return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
}

export function getUTCDateOffset(days: number): Date {
  const today = getUTCDateOnly();
  today.setUTCDate(today.getUTCDate() + days);
  return today;
}

export function getUTCDateLabel(base = new Date()): string {
  return getUTCDateOnly(base).toISOString().slice(0, 10);
}

export function getUTCWeekStart(base = new Date()): Date {
  const date = getUTCDateOnly(base);
  const day = date.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return date;
}

export function getUTCNextWeekStart(base = new Date()): Date {
  const weekStart = getUTCWeekStart(base);
  weekStart.setUTCDate(weekStart.getUTCDate() + 7);
  return weekStart;
}

export function getUTCWeekEnd(base = new Date()): Date {
  const weekEnd = getUTCWeekStart(base);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  return weekEnd;
}

export function getUTCMonthStart(base = new Date()): Date {
  return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1));
}

export function getUTCNextMonthStart(base = new Date()): Date {
  return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, 1));
}

export function formatMonthYearUTC(base: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(base);
}