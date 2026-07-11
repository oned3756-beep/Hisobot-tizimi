const TASHKENT_TZ = "Asia/Tashkent";

export function todayInTashkent(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TASHKENT_TZ }).format(new Date());
}

export function isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function daysAgoInTashkent(days: number): string {
  const now = new Date();
  now.setUTCDate(now.getUTCDate() - days);
  return new Intl.DateTimeFormat("en-CA", { timeZone: TASHKENT_TZ }).format(now);
}
