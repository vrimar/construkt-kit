import dayjs from "dayjs";
// dayjs has no exports map, so Node ESM needs the file extension.
import calendar from "dayjs/plugin/calendar.js";

dayjs.extend(calendar);

/** Treat an offset-less timestamp string as UTC; a date-only string stays a local calendar date. */
const asUtc = (date: string | Date) => {
  if (typeof date !== "string" || !/\d[T ]\d/.test(date) || /z$/i.test(date)) return date;
  if (/[+-]\d{2}:?\d{2}$/.test(date)) return date;
  if (/[+-]\d{2}$/.test(date)) return date + ":00";

  return date + "Z";
};

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
  return dayjs(asUtc(date)).calendar(undefined, {
    sameDay: "[Today at] h:mm A",
    lastDay: "[Yesterday at] h:mm A",
    lastWeek: "MMM D [at] h:mm A",
    sameElse: "MMM D, YYYY h:mm A",
  });
};
