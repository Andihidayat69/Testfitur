import { parseRupiahInput } from "@/lib/money";
import { addDays, addMonths, monthOf } from "@/lib/dates";

export const PAYDAY_QUICK_PICKS = [1, 5, 10, 15, 25, 28];
export const POPUP_WINDOW_DAYS = 3; // payday and the 3 days after it
export const NOTIFY_HOUR = 9;
export const SCHEDULE_AHEAD = 3;

export type PaydayReminder = { day: number; saveAmount: number };

const pad = (n: number) => String(n).padStart(2, "0");

function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

/** The payday in a month ("YYYY-MM"): the chosen day, or the month's last day if shorter. */
export function paydayIn(month: string, day: number): string {
  return `${month}-${pad(Math.min(day, daysInMonth(month)))}`;
}

/** The most recent payday on or before `today`. */
export function latestPayday(today: string, day: number): string {
  const thisMonth = paydayIn(monthOf(today), day);
  return thisMonth <= today ? thisMonth : paydayIn(addMonths(monthOf(today), -1), day);
}

/** The pop-up shows on payday and the 3 days after, once per payday (until handled). */
export function paydayPopupFor(today: string, reminder: PaydayReminder | null, handledFor: string | null): string | null {
  if (!reminder) return null;
  const payday = latestPayday(today, reminder.day);
  if (today > addDays(payday, POPUP_WINDOW_DAYS)) return null;
  if (handledFor === payday) return null;
  return payday;
}

/** The next `count` payday notification times (09:00 local) after `now`. */
export function nextPaydayTimes(now: Date, day: number, count = SCHEDULE_AHEAD): Date[] {
  const times: Date[] = [];
  let month = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  while (times.length < count) {
    const [y, m, d] = paydayIn(month, day).split("-").map(Number);
    const at = new Date(y, m - 1, d, NOTIFY_HOUR, 0, 0, 0);
    if (at > now) times.push(at);
    month = addMonths(month, 1);
  }
  return times;
}

// --- Validation ---

export const PAYDAY_AMOUNT_MIN = 1_000;
export const PAYDAY_AMOUNT_MAX = 100_000_000;

export function validatePaydayAmount(input: string): { ok: true; value: number } | { ok: false; error: string } {
  const value = parseRupiahInput(input);
  if (value === null || value === 0) return { ok: false, error: "Isi nominalnya dulu, ya." };
  if (value < PAYDAY_AMOUNT_MIN) return { ok: false, error: "Minimal Rp1.000, ya." };
  if (value > PAYDAY_AMOUNT_MAX) return { ok: false, error: "Maksimal Rp100.000.000, ya." };
  return { ok: true, value };
}

export function isValidPaydayDay(day: number | null): day is number {
  return day !== null && Number.isInteger(day) && day >= 1 && day <= 31;
}
