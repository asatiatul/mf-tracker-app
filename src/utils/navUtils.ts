import { NAVEntry } from "../types";

export function parseDate(dateStr: string): Date {
  // Expects dd-mm-yyyy
  const [dd, mm, yyyy] = dateStr.split("-");
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
}
  // Assume your existing parseDate function

export function filterAndDownsample(
  data: NAVEntry[],
  frequency: 'daily' | 'weekly' | 'monthly',
  startDate: Date | null,
  endDate: Date | null
): NAVEntry[] {
  if (!startDate || !endDate) return [];

  // Filter data within input range
  const filtered = data.filter((entry) => {
    const d = parseDate(entry.date);
    return d >= startDate && d <= endDate;
  });

  if (frequency === 'daily') {
    return filtered.sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
  }

  if (frequency === 'weekly') {
    // For each week in range, pick Friday or closest prior weekday nav
    const weeklyData: NAVEntry[] = [];

    // Get Monday of the first week
    let weekStart = new Date(startDate);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7)); // Monday is day 1, Sunday 0

    while (weekStart <= endDate) {
      // Last day of the week is Friday
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 4); // Friday

      // Clip weekEnd to not exceed the total endDate
      if (weekEnd > endDate) {
        weekEnd.setTime(endDate.getTime());
      }

      // Find NAV for Friday or closest day before Friday in that week
      // Filter navs between weekStart and weekEnd
      const navsThisWeek = filtered.filter((entry) => {
        const d = parseDate(entry.date);
        return d >= weekStart && d <= weekEnd;
      });

      if (navsThisWeek.length > 0) {
        // Select NAV with max date <= weekEnd (closest before or on Friday)
        navsThisWeek.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
        weeklyData.push(navsThisWeek[0]);
      }

      weekStart.setDate(weekStart.getDate() + 7);  // next Monday
    }

    return weeklyData;
  }

  if (frequency === 'monthly') {
    // For each month in range, pick last available NAV on or before month's last day, but <= endDate
    const monthlyData: NAVEntry[] = [];

    let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (cursor <= endDate) {
      // Last day of the current month
      const monthLastDay = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      // Clip last day to not exceed endDate
      const clippedLastDay = monthLastDay <= endDate ? monthLastDay : new Date(endDate);

      // Get all NAVs in this month period up to clippedLastDay
      const navsThisMonth = filtered.filter((entry) => {
        const d = parseDate(entry.date);
        return d >= cursor && d <= clippedLastDay;
      });

      if (navsThisMonth.length > 0) {
        // Pick NAV with max date in this period (latest available NAV)
        navsThisMonth.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
        monthlyData.push(navsThisMonth[0]);
      }

      // Move cursor to next month
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
    return monthlyData;
  }

  return [];
}
