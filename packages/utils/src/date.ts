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

export const formatDateDefault = (date: string | Date) =>
  dayjs(asUtc(date)).format("MMM D, YYYY h:mm A");

export const formatDateRelative = (date: string | Date) => {
  return dayjs(asUtc(date)).calendar(undefined, {
    sameDay: "[Today at] h:mm A",
    lastDay: "[Yesterday at] h:mm A",
    lastWeek: "MMM D [at] h:mm A",
    sameElse: "MMM D, YYYY h:mm A",
  });
};
