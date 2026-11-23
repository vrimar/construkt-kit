import dayjs from "dayjs";
// dayjs has no exports map, so Node ESM needs the file extension.
import calendar from "dayjs/plugin/calendar.js";

/** Treat an offset-less timestamp string as UTC; a date-only string stays a local calendar date. */
const asUtc = (date: string | Date) => {
  if (typeof date !== "string" || !/\d[T ]\d/.test(date) || /z$/i.test(date)) return date;
  if (/[+-]\d{2}:?\d{2}$/.test(date)) return date;
  if (/[+-]\d{2}$/.test(date)) return date + ":00";

  return date + "Z";
};

/**
 * A timestamp as a `Date`, read as the formatters here read it: an offset-less string is UTC, a
 * date-only string a local calendar date. An unreadable string gives an invalid date.
 */
export const parseDate = (date: string | Date): Date => dayjs(asUtc(date)).toDate();

const DAY_FORMAT = "MMM D, YYYY";
const DATE_TIME_FORMAT = `${DAY_FORMAT} h:mm A`;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export const formatDateDefault = (date: string | Date) =>
  dayjs(asUtc(date)).format(DATE_TIME_FORMAT);

/**
 * A date as {@link formatDateDefault} writes it, or only its day for a date-only string such as
 * `"2024-01-15"`; `undefined` when it isn't a valid date.
 */
export const formatDateValue = (date: string | Date): string | undefined => {
  const parsed = dayjs(asUtc(date));
  if (!parsed.isValid()) return undefined;
  return parsed.format(
    typeof date === "string" && DATE_ONLY.test(date) ? DAY_FORMAT : DATE_TIME_FORMAT,
  );
};

export const formatDateRelative = (date: string | Date) => {
  dayjs.extend(calendar);
  return dayjs(asUtc(date)).calendar(undefined, {
    sameDay: "[Today at] h:mm A",
    lastDay: "[Yesterday at] h:mm A",
    lastWeek: "MMM D [at] h:mm A",
    sameElse: DATE_TIME_FORMAT,
  });
};

/** Formats a calendar date as ISO `YYYY-MM-DD`. */
export function formatIsoDate({ year, month, day }: { year: number; month: number; day: number }) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Whether `value` is an ISO `YYYY-MM-DD` string naming a day that exists. */
export const isIsoDate = (value: string) => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

/**
 * The local calendar day a date falls on, as ISO `YYYY-MM-DD`, reading a string as {@link parseDate}
 * does; `undefined` when it isn't a valid date.
 */
export function toIsoDay(date: string | number | Date): string | undefined {
  if (typeof date === "string" && DATE_ONLY.test(date)) return date;
  const parsed = typeof date === "number" ? new Date(date) : parseDate(date);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return formatIsoDate({
    year: parsed.getFullYear(),
    month: parsed.getMonth() + 1,
    day: parsed.getDate(),
  });
}
