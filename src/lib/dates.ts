// Local calendar dates as "YYYY-MM-DD" strings and months as "YYYY-MM".
// Entries keep the day the user picked even if the phone's time zone changes.

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const pad = (n: number) => String(n).padStart(2, "0");

/** The local calendar date of a moment: 2026-11-13. */
export function toLocalDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** A local date string as a Date at local midnight. */
export function fromLocalDate(localDate: string): Date {
  const [y, m, d] = localDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(localDate: string, days: number): string {
  const date = fromLocalDate(localDate);
  date.setDate(date.getDate() + days);
  return toLocalDate(date);
}

/** "2026-11-13" → "2026-11". */
export function monthOf(localDate: string): string {
  return localDate.slice(0, 7);
}

export function addMonths(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

/** "2026-11" → "November 2026". */
export function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** "Hari ini", "Kemarin", "12 Nov", or "12 Nov 2025" outside the current year. */
export function dayLabel(localDate: string, today: string): string {
  if (localDate === today) return "Hari ini";
  if (localDate === addDays(today, -1)) return "Kemarin";
  const [y, m, d] = localDate.split("-").map(Number);
  const short = `${d} ${MONTHS_SHORT[m - 1]}`;
  return y === Number(today.slice(0, 4)) ? short : `${short} ${y}`;
}
