/**
 * VitalCore Date Utility
 * ==========================================
 * Provides consistent, local-timezone date handling for daily resets,
 * history tracking, and cross-platform synchronization between Web and Expo.
 */

/**
 * Returns YYYY-MM-DD in the user's local device/browser timezone or explicit timezone.
 */
export function getLocalDateString(dateInput?: Date | string | number, userTimezone?: string | null): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) {
    const fallback = new Date();
    const tz = userTimezone || (typeof window !== 'undefined' && window.Intl ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined);
    if (tz) {
      try {
        const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(fallback);
        const y = parts.find(p => p.type === 'year')?.value;
        const m = parts.find(p => p.type === 'month')?.value;
        const day = parts.find(p => p.type === 'day')?.value;
        if (y && m && day) return `${y}-${m}-${day}`;
      } catch (e) {
        // Fallback below
      }
    }
    return `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, '0')}-${String(fallback.getDate()).padStart(2, '0')}`;
  }

  const tz = userTimezone || (typeof window !== 'undefined' && window.Intl ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined);
  if (tz) {
    try {
      const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d);
      const y = parts.find(p => p.type === 'year')?.value;
      const m = parts.find(p => p.type === 'month')?.value;
      const day = parts.find(p => p.type === 'day')?.value;
      if (y && m && day) return `${y}-${m}-${day}`;
    } catch (e) {
      // Fallback to local getters
    }
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a YYYY-MM-DD string into a human-friendly label.
 * Returns "Today", "Yesterday", or e.g. "Thu, Aug 08, 2026".
 */
export function formatDisplayDate(dateStr?: string, userTimezone?: string | null): string {
  if (!dateStr) return "Today";
  const todayStr = getLocalDateString(undefined, userTimezone);
  if (dateStr === todayStr) return "Today";

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterdayDate, userTimezone);
  if (dateStr === yesterdayStr) return "Yesterday";

  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  }

  return dateStr;
}

/**
 * Shifts a YYYY-MM-DD date string by a given number of days.
 */
export function addDaysToDate(dateStr: string, days: number, userTimezone?: string | null): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return getLocalDateString(undefined, userTimezone);
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  d.setDate(d.getDate() + days);
  return getLocalDateString(d, userTimezone);
}

/**
 * Evaluates whether a database log matches a target YYYY-MM-DD date string in local time.
 */
export function isRecordOnDate(recordDateStr?: string, recordCreatedAt?: string, targetDateStr?: string, userTimezone?: string | null): boolean {
  const target = targetDateStr || getLocalDateString(undefined, userTimezone);
  if (recordDateStr && recordDateStr === target) return true;
  if (recordCreatedAt) {
    const localCreatedAt = getLocalDateString(recordCreatedAt, userTimezone);
    if (localCreatedAt === target) return true;
    if (recordCreatedAt.startsWith(target)) return true;
  }
  return false;
}

/**
 * Returns an array of YYYY-MM-DD date strings for a given range [startDateStr, endDateStr].
 */
export function getDatesInRange(startDateStr: string, endDateStr: string, userTimezone?: string | null): string[] {
  const dates: string[] = [];
  let current = startDateStr;
  while (current <= endDateStr) {
    dates.push(current);
    current = addDaysToDate(current, 1, userTimezone);
  }
  return dates;
}

/**
 * Returns an array of the last N YYYY-MM-DD date strings ending on endDateStr (default today).
 */
export function getLastNDaysDates(n: number, endDateStr?: string, userTimezone?: string | null): string[] {
  const end = endDateStr || getLocalDateString(undefined, userTimezone);
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    dates.push(addDaysToDate(end, -i, userTimezone));
  }
  return dates;
}
