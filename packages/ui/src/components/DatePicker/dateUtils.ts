import {
  type CalendarDate,
  type CalendarDateTime,
  DateFormatter,
  type DateDuration,
  type ZonedDateTime,
  endOfMonth,
  endOfWeek,
  endOfYear,
  getLocalTimeZone,
  getWeeksInMonth,
  isSameDay,
  maxDate,
  minDate,
  now,
  startOfMonth,
  startOfWeek,
  startOfYear,
  toCalendarDate,
  toCalendarDateTime,
  toZoned,
  today,
} from "@internationalized/date";

export type DateValue = CalendarDate | CalendarDateTime | ZonedDateTime;

export type DateView = "day" | "month" | "year";

export type DateRangePreset =
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "lastQuarter"
  | "thisYear"
  | "lastYear"
  | "last3Days"
  | "last7Days"
  | "last14Days"
  | "last30Days"
  | "last90Days";

export type DateUnavailableFn = (date: DateValue, locale: string) => boolean;

export interface DateRange {
  start: DateValue;
  end: DateValue;
}

export function isDateEqual(a: DateValue | null | undefined, b: DateValue | null | undefined) {
  if (a == null || b == null) return a === b;
  if (!("hour" in a) && !("hour" in b)) return isSameDay(a, b);
  return toCalendarDateTime(a).compare(toCalendarDateTime(b)) === 0;
}

export function isDateOutsideRange(date: DateValue, start?: DateValue, end?: DateValue) {
  const day = toCalendarDate(date);
  return (start != null && day.compare(start) < 0) || (end != null && day.compare(end) > 0);
}

export function overlapsRange(first: DateValue, last: DateValue, min?: DateValue, max?: DateValue) {
  return !isDateOutsideRange(last, min) && !isDateOutsideRange(first, undefined, max);
}

export function isDateUnavailable(
  date: DateValue,
  isUnavailable: DateUnavailableFn | undefined,
  locale: string,
  min?: DateValue,
  max?: DateValue,
) {
  if (isUnavailable?.(date, locale)) return true;
  return isDateOutsideRange(date, min, max);
}

export function isPreviousRangeInvalid(start: DateValue, min?: DateValue, max?: DateValue) {
  const previous = start.subtract({ days: 1 });
  return isSameDay(previous, start) || isDateOutsideRange(previous, min, max);
}

export function isNextRangeInvalid(end: DateValue, min?: DateValue, max?: DateValue) {
  const next = end.add({ days: 1 });
  return isSameDay(next, end) || isDateOutsideRange(next, min, max);
}

export function alignStart(
  date: DateValue,
  duration: DateDuration,
  locale: string,
  min?: DateValue,
  max?: DateValue,
): DateValue {
  let aligned = date;
  if (duration.years) aligned = startOfYear(date);
  else if (duration.months) aligned = startOfMonth(date);
  else if (duration.weeks) aligned = startOfWeek(date, locale);
  return constrainStart(date, aligned, duration, locale, min, max);
}

export function alignEnd(
  date: DateValue,
  duration: DateDuration,
  locale: string,
  min?: DateValue,
  max?: DateValue,
): DateValue {
  const shift = { ...duration };
  if (shift.days) shift.days--;
  else if (shift.weeks) shift.weeks--;
  else if (shift.months) shift.months--;
  else if (shift.years) shift.years--;
  const aligned = alignStart(date, duration, locale).subtract(shift);
  return constrainStart(date, aligned, duration, locale, min, max);
}

function constrainStart(
  date: DateValue,
  aligned: DateValue,
  duration: DateDuration,
  locale: string,
  min?: DateValue,
  max?: DateValue,
): DateValue {
  let start = aligned;
  if (min && date.compare(min) >= 0) {
    start = maxDate(start, alignStart(toCalendarDate(min), duration, locale)) ?? start;
  }
  if (max && date.compare(max) <= 0) {
    start = minDate(start, alignEnd(toCalendarDate(max), duration, locale)) ?? start;
  }
  return start;
}

/** `date` moved into `min`–`max` by its day, keeping any time it has. */
export function constrainValue(date: DateValue, min?: DateValue, max?: DateValue): DateValue {
  const day = toCalendarDate(date);
  let constrained: CalendarDate = day;
  if (min) constrained = maxDate(constrained, toCalendarDate(min)) ?? constrained;
  if (max) constrained = minDate(constrained, toCalendarDate(max)) ?? constrained;
  if (constrained.compare(day) === 0) return date;
  if ("hour" in date) {
    return date.set({
      year: constrained.year,
      month: constrained.month,
      day: constrained.day,
    });
  }
  return constrained;
}

const WEEK_DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

const firstDayOf = (startOfWeekIndex: number | undefined) =>
  startOfWeekIndex == null ? undefined : WEEK_DAYS[startOfWeekIndex];

function getDaysInWeek(
  weekIndex: number,
  from: DateValue,
  locale: string,
  startOfWeekIndex?: number,
): DateValue[] {
  const days: DateValue[] = [];
  let date = startOfWeek(from.add({ weeks: weekIndex }), locale, firstDayOf(startOfWeekIndex));
  while (days.length < 7) {
    days.push(date);
    const next = date.add({ days: 1 });
    if (isSameDay(date, next)) break;
    date = next;
  }
  return days;
}

/** The weeks of `from`'s month, each a row of days from the locale's or the given first weekday. */
export function getMonthDays(
  from: DateValue,
  locale: string,
  numOfWeeks: number | undefined,
  startOfWeekIndex?: number,
): DateValue[][] {
  const count = numOfWeeks ?? getWeeksInMonth(from, locale, firstDayOf(startOfWeekIndex));
  return Array.from({ length: count }, (_, week) =>
    getDaysInWeek(week, from, locale, startOfWeekIndex),
  );
}

export function getWeekEdges(
  date: DateValue,
  locale: string,
  startOfWeekIndex?: number,
): [DateValue, DateValue] {
  const firstDay = firstDayOf(startOfWeekIndex);
  return [startOfWeek(date, locale, firstDay), endOfWeek(date, locale, firstDay)];
}

export function getWeekDays(
  date: DateValue,
  startOfWeekIndex: number | undefined,
  timeZone: string,
  locale: string,
): { value: DateValue; short: string; long: string }[] {
  const first = startOfWeek(date, locale, firstDayOf(startOfWeekIndex));
  const short = new DateFormatter(locale, { weekday: "short", timeZone });
  const long = new DateFormatter(locale, { weekday: "long", timeZone });
  return Array.from({ length: 7 }, (_, index) => {
    const value = first.add({ days: index });
    const day = value.toDate(timeZone);
    return { value, short: short.format(day), long: long.format(day) };
  });
}

export function getMonthNames(
  locale: string,
  format: "long" | "short",
  reference: DateValue,
): string[] {
  const id = reference.calendar.identifier;
  if (id === "gregory" || id === "iso8601") {
    const date = new Date(2021, 0, 1);
    return Array.from({ length: 12 }, (_, month) => {
      date.setMonth(month);
      return date.toLocaleString(locale, { month: format });
    });
  }
  const formatter = new DateFormatter(locale, { month: format, calendar: id, timeZone: "UTC" });
  return Array.from({ length: reference.calendar.getMonthsInYear(reference) }, (_, index) =>
    formatter.format(reference.set({ month: index + 1 }).toDate("UTC")),
  );
}

export function getDecadeRange(year: number): number[] {
  const start = year - (year % 10);
  return Array.from({ length: 10 }, (_, index) => start + index);
}

export function getEndDate(start: DateValue, duration: DateDuration): DateValue {
  const shift = { ...duration };
  if (shift.days) shift.days--;
  else shift.days = -1;
  return start.add(shift);
}

export function getUnitDuration(duration: DateDuration): DateDuration {
  const unit: DateDuration = {};
  for (const key in duration) unit[key as keyof DateDuration] = 1;
  return unit;
}

function getEraFormat(date: DateValue): "short" | undefined {
  const id = date.calendar.identifier;
  if (id === "gregory" || id === "iso8601") return date.era === "BC" ? "short" : undefined;
  return "short";
}

export function getDayFormatter(locale: string, timeZone: string, reference?: DateValue) {
  const date = reference ?? toCalendarDateTime(today(timeZone));
  return new DateFormatter(locale, {
    weekday: "long",
    month: "long",
    year: "numeric",
    day: "numeric",
    era: getEraFormat(date),
    calendar: date.calendar.identifier,
    timeZone,
  });
}

export function getYearFormatter(locale: string, timeZone: string, reference?: DateValue) {
  const date = reference ?? today(timeZone);
  return new DateFormatter(locale, {
    year: "numeric",
    era: getEraFormat(date),
    calendar: date.calendar.identifier,
    timeZone,
  });
}

function formatRange(start: DateValue, end: DateValue, formatter: DateFormatter, timeZone: string) {
  const parts = formatter.formatRangeToParts(start.toDate(timeZone), end.toDate(timeZone));
  let separator = -1;
  for (const [index, part] of parts.entries()) {
    if (part.source === "shared" && part.type === "literal") separator = index;
    else if (part.source === "endRange") break;
  }
  let startText = "";
  let endText = "";
  for (const [index, part] of parts.entries()) {
    if (index < separator) startText += part.value;
    else if (index > separator) endText += part.value;
  }
  return `${startText} – ${endText}`;
}

export function formatSelectedDate(
  start: DateValue | undefined,
  end: DateValue | null,
  locale: string,
  timeZone: string,
): string {
  if (!start) return "";
  const last = end ?? start;
  const formatter = getDayFormatter(locale, timeZone);
  if (isSameDay(start, last)) return formatter.format(start.toDate(timeZone));
  return formatRange(start, last, formatter, timeZone);
}

export function getTodayDate(timeZone: string | undefined): CalendarDate {
  return today(timeZone ?? getLocalTimeZone());
}

interface AdjustedDates {
  startDate: DateValue;
  focusedDate: DateValue;
}

/** Keeps `focusedDate` within `min`–`max` and moves `startDate` so the visible range shows it. */
export function adjustFocusedDate(
  { startDate, focusedDate }: AdjustedDates,
  duration: DateDuration,
  locale: string,
  min?: DateValue,
  max?: DateValue,
): AdjustedDates {
  const focused = constrainValue(focusedDate, min, max);
  if (isDateOutsideRange(focusedDate, min, max)) return { startDate, focusedDate: focused };
  if (focusedDate.compare(startDate) < 0) {
    return { startDate: alignEnd(focusedDate, duration, locale, min, max), focusedDate: focused };
  }
  if (focusedDate.compare(getEndDate(startDate, duration)) > 0) {
    return { startDate: alignStart(focusedDate, duration, locale, min, max), focusedDate: focused };
  }
  return { startDate, focusedDate: focused };
}

function getPage(
  direction: 1 | -1,
  focusedDate: DateValue,
  startDate: DateValue,
  duration: DateDuration,
  locale: string,
  min?: DateValue,
  max?: DateValue,
): AdjustedDates {
  const move = (date: DateValue) =>
    direction === 1 ? date.add(duration) : date.subtract(duration);
  return adjustFocusedDate(
    {
      focusedDate: move(focusedDate),
      startDate: alignStart(
        constrainStart(focusedDate, move(startDate), duration, locale, min, max),
        duration,
        locale,
      ),
    },
    duration,
    locale,
    min,
    max,
  );
}

export const getNextPage = getPage.bind(null, 1);
export const getPreviousPage = getPage.bind(null, -1);

/** Page Up and Down: a month at a time in the day view, a year with Shift. */
export function getSection(
  direction: 1 | -1,
  larger: boolean,
  focusedDate: DateValue,
  startDate: DateValue,
  duration: DateDuration,
  locale: string,
  min?: DateValue,
  max?: DateValue,
): AdjustedDates {
  const move = (date: DateValue, by: DateDuration) =>
    direction === 1 ? date.add(by) : date.subtract(by);
  if (!larger && !duration.days) {
    return adjustFocusedDate(
      { focusedDate: move(focusedDate, getUnitDuration(duration)), startDate },
      duration,
      locale,
      min,
      max,
    );
  }
  if (duration.days) {
    return getPage(direction, focusedDate, startDate, duration, locale, min, max);
  }
  const by = duration.weeks ? { months: 1 } : { years: 1 };
  return adjustFocusedDate(
    { focusedDate: move(focusedDate, by), startDate },
    duration,
    locale,
    min,
    max,
  );
}

export function getDateRangePreset(
  preset: DateRangePreset,
  locale: string,
  timeZone: string,
  startOfWeekIndex?: number,
): [DateValue, DateValue] {
  const day = toCalendarDate(now(timeZone));
  switch (preset) {
    case "thisWeek":
      return getWeekEdges(day, locale, startOfWeekIndex);
    case "thisMonth":
      return [startOfMonth(day), day];
    case "thisQuarter":
      return [startOfMonth(day).add({ months: -((day.month - 1) % 3) }), day];
    case "thisYear":
      return [startOfYear(day), day];
    case "last3Days":
      return [day.add({ days: -2 }), day];
    case "last7Days":
      return [day.add({ days: -6 }), day];
    case "last14Days":
      return [day.add({ days: -13 }), day];
    case "last30Days":
      return [day.add({ days: -29 }), day];
    case "last90Days":
      return [day.add({ days: -89 }), day];
    case "lastMonth":
      return [startOfMonth(day.add({ months: -1 })), endOfMonth(day.add({ months: -1 }))];
    case "lastQuarter":
      return [
        startOfMonth(day.add({ months: -((day.month - 1) % 3) - 3 })),
        endOfMonth(day.add({ months: -((day.month - 1) % 3) - 1 })),
      ];
    case "lastWeek":
      return getWeekEdges(day.add({ weeks: -1 }), locale, startOfWeekIndex);
    case "lastYear":
      return [startOfYear(day.add({ years: -1 })), endOfYear(day.add({ years: -1 }))];
  }
}

export function sortDates(values: readonly (DateValue | null | undefined)[]): DateValue[] {
  return values.filter((date): date is DateValue => date != null).sort((a, b) => a.compare(b));
}

export function adjustStartAndEndDate(value: DateValue[]): DateValue[] {
  const [start, end] = value;
  if (!start || !end) return value;
  return start.compare(end) <= 0 ? value : [end, start];
}

export function isDateWithinRange(date: DateValue, value: readonly DateValue[]) {
  const [start, end] = value;
  if (!start || !end) return false;
  return !isDateOutsideRange(date, start, end);
}

/** `next` with the time of day `existing` had, where `existing` has one. */
export function preserveTime(existing: DateValue | undefined, next: DateValue): DateValue {
  if (!existing || !("hour" in existing)) return next;
  let withTime: CalendarDateTime | ZonedDateTime;
  if ("hour" in next) withTime = next;
  else if ("timeZone" in existing) withTime = toZoned(toCalendarDateTime(next), existing.timeZone);
  else withTime = toCalendarDateTime(next);
  return withTime.set({
    hour: existing.hour,
    minute: existing.minute,
    second: existing.second,
    millisecond: existing.millisecond,
  });
}

const VIEWS: readonly DateView[] = ["day", "month", "year"];

export const getNextView = (view: DateView): DateView =>
  VIEWS[Math.min(VIEWS.indexOf(view) + 1, VIEWS.length - 1)] ?? view;

export const getPreviousView = (view: DateView): DateView =>
  VIEWS[Math.max(VIEWS.indexOf(view) - 1, 0)] ?? view;

export interface VisibleRangeText {
  start: string;
  end: string;
  formatted: string;
}

export function getViewRange(
  view: DateView,
  { focused, start }: { focused: DateValue; start: DateValue },
  duration: DateDuration,
): DateRange {
  if (view === "day") return { start, end: getEndDate(start, duration) };
  const years = view === "year" ? getDecadeRange(focused.year) : [focused.year];
  return {
    start: startOfYear(focused.set({ year: years[0] })),
    end: endOfYear(focused.set({ year: years[years.length - 1] })),
  };
}

export function getVisibleRangeText(
  view: DateView,
  { start, end }: DateRange,
  locale: string,
  timeZone: string,
  range: boolean,
): VisibleRangeText {
  if (view === "year") {
    const years = getDecadeRange(start.year);
    const first = String(years[0]);
    const last = String(years[years.length - 1]);
    return { start: first, end: last, formatted: `${first} - ${last}` };
  }
  const formatter = new DateFormatter(locale, {
    ...(view === "day" ? { month: "long" } : {}),
    year: "numeric",
    timeZone,
    calendar: start.calendar.identifier,
  });
  const startText = formatter.format(start.toDate(timeZone));
  const endText = formatter.format(end.toDate(timeZone));
  return {
    start: startText,
    end: endText,
    formatted: range && view === "day" ? `${startText} - ${endText}` : startText,
  };
}
