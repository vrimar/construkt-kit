import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";

dayjs.extend(calendar);

export const formatDateDefault = (date: string | Date) => {
  const d =
    typeof date === "string" && !date.endsWith("Z") && !/[+-]\d{2}:?\d{2}$/.test(date)
      ? date + "Z"
      : date;
  return dayjs(d).format("MMM D, YYYY h:mm A");
};

export const formatDateRelative = (date: string | Date) => {
  const d =
    typeof date === "string" && !date.endsWith("Z") && !/[+-]\d{2}:?\d{2}$/.test(date)
      ? date + "Z"
      : date;
  return dayjs(d).calendar(undefined, {
    sameDay: "[Today at] h:mm A",
    lastDay: "[Yesterday at] h:mm A",
    lastWeek: "MMM D [at] h:mm A",
    sameElse: "MMM D, YYYY h:mm A",
  });
};
