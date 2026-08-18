import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";

dayjs.extend(calendar);

/** Treat an offset-less timestamp string as UTC rather than local time. */
const asUtc = (date: string | Date) =>
  typeof date === "string" && !date.endsWith("Z") && !/[+-]\d{2}:?\d{2}$/.test(date)
    ? date + "Z"
    : date;

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
