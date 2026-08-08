/**
 * VitalCore Date Utility
 * ==========================================
 * Provides consistent, local-timezone date handling for daily resets,
 * history tracking, and cross-platform synchronization between Web and Expo.
 */

/**
 * Returns YYYY-MM-DD in the user's local device/browser timezone.
 */
export function getLocalDateString(dateInput?: Date | string | number): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) {
    const fallback = new Date();
    return `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, '0')}-${String(fallback.getDate()).padStart(2, '0')}`;
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a YYYY-MM-DD string into a human-friendly label.
 * Returns "Today", "Yesterday", or e.g. "Thu, 08 Aug 2026".
 */
export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return "Today";
  const todayStr = getLocalDateString();
  if (dateStr === todayStr) return "Today";

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterdayDate);
  if (dateStr === yesterdayStr) return "Yesterday";

  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return d.toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  }

  return dateStr;
}

/**
 * Shifts a YYYY-MM-DD date string by a given number of days.
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return getLocalDateString();
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  d.setDate(d.getDate() + days);
  return getLocalDateString(d);
}

/**
 * Evaluates whether a database log matches a target YYYY-MM-DD date string in local time.
 */
export function isRecordOnDate(recordDateStr?: string, recordCreatedAt?: string, targetDateStr?: string): boolean {
  const target = targetDateStr || getLocalDateString();
  if (recordDateStr && recordDateStr === target) return true;
  if (recordCreatedAt) {
    const localCreatedAt = getLocalDateString(recordCreatedAt);
    if (localCreatedAt === target) return true;
    if (recordCreatedAt.startsWith(target)) return true;
  }
  return false;
}
