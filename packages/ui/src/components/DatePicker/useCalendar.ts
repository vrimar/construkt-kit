import { sameItems } from "@construkt-kit/utils";
import {
  type DateDuration,
  endOfMonth,
  endOfYear,
  isEqualMonth,
  isEqualYear,
  isSameDay,
  isToday,
  isWeekend,
  startOfMonth,
  startOfYear,
  toCalendarDate,
  today,
} from "@internationalized/date";
import {
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { useAnnouncer } from "../../hooks/useAnnouncer";
import { emitChange } from "../../primitives/change";
import { mirrorArrowKey } from "../../primitives/composite";
import { dataAttr } from "../../primitives/render";
import { createPartContext } from "../partContext";
import {
  type DateRangePreset,
  type DateUnavailableFn,
  type DateValue,
  type DateView,
  adjustFocusedDate,
  adjustStartAndEndDate,
  alignStart,
  constrainValue,
  formatSelectedDate,
  getDateRangePreset,
  getDayFormatter,
  getDecadeRange,
  getEndDate,
  getMonthDays,
  getMonthNames,
  getNextView,
  getPage,
  getPreviousView,
  getSection,
  getViewRange,
  getVisibleRangeText,
  getWeekDays,
  getWeekEdges,
  getYearFormatter,
  isDateEqual,
  isDateOutsideRange,
  isDateUnavailable,
  isDateWithinRange,
  isNextRangeInvalid,
  isPreviousRangeInvalid,
  joinDates,
  overlapsRange,
  preserveTime,
  sortDates,
} from "./dateUtils";
import type { CalendarMode, DateValueChangeDetails, DateValueChangeReason } from "./types";

export interface CalendarOptions {
  selectionMode: CalendarMode;
  /** The controlled value; `undefined` leaves it to local state. */
  value: DateValue[] | undefined;
  defaultValue: DateValue[] | undefined;
  onValueChange: ((value: DateValue[], details: DateValueChangeDetails) => void) | undefined;
  numOfMonths: number;
  startOfWeek: number;
  locale: string;
  dir: "ltr" | "rtl";
  timeZone: string;
  fixedWeeks: boolean;
  min: DateValue | undefined;
  max: DateValue | undefined;
  isDateUnavailable: DateUnavailableFn | undefined;
  disabled: boolean;
  readOnly: boolean;
  defaultView: DateView;
  maxSelectedDates: number | undefined;
  open: boolean;
  closeOnSelect: boolean;
  /** Closes the popup after a pick. */
  requestClose: (event: Event) => void;
  /** The element the calendar's grids render in. */
  getContainer: () => HTMLElement | null;
}

interface CellState {
  value: DateValue;
  valueText: string;
  focused: boolean;
  selectable: boolean;
  selected: boolean;
  outsideRange: boolean;
  inRange: boolean;
  firstInRange: boolean;
  lastInRange: boolean;
  inHoveredRange: boolean;
  firstInHoveredRange: boolean;
  lastInHoveredRange: boolean;
}

export interface DayCellState extends CellState {
  invalid: boolean;
  unavailable: boolean;
  today: boolean;
  weekend: boolean;
}

export interface GridCell {
  label: string;
  value: number;
}

interface Navigation {
  focused: DateValue;
  start: DateValue;
}

const dayCellLabel = (state: DayCellState) => {
  if (state.unavailable) return `Not available. ${state.valueText}`;
  if (state.firstInRange) return `Starting range from ${state.valueText}`;
  if (state.lastInRange) return `Range ending at ${state.valueText}`;
  if (state.inRange) return `In range. ${state.valueText}`;
  if (state.selected) return `Selected date. ${state.valueText}`;
  return `Choose ${state.valueText}`;
};

const PREV_LABELS: Record<DateView, string> = {
  day: "Switch to previous month",
  month: "Switch to previous year",
  year: "Switch to previous decade",
};

const NEXT_LABELS: Record<DateView, string> = {
  day: "Switch to next month",
  month: "Switch to next year",
  year: "Switch to next decade",
};

const chunk = <T>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, row) =>
    items.slice(row * size, row * size + size),
  );

/** The day, month or year cell the grid's keys move from. */
export const focusedCell = (content: HTMLElement) =>
  content.querySelector<HTMLElement>('[role="grid"] [tabindex="0"]');

/**
 * The state and behaviour of a calendar's day, month and year grids: selection in one of three
 * modes, keyboard navigation, the visible range and its announcements.
 */
export function useCalendar(options: CalendarOptions) {
  const {
    selectionMode,
    onValueChange,
    numOfMonths,
    startOfWeek,
    locale,
    dir,
    timeZone,
    fixedWeeks,
    min,
    max,
    disabled,
    readOnly,
    defaultView,
    maxSelectedDates,
    open,
    closeOnSelect,
    requestClose,
    getContainer,
  } = options;
  const range = selectionMode === "range";
  const multiple = selectionMode === "multiple";
  const interactive = !disabled && !readOnly;

  const normalize = (dates: readonly DateValue[]) =>
    sortDates(dates).map((date) => constrainValue(date, min, max));

  const controlled = options.value !== undefined;
  const [localValue, setLocalValue] = useState(() => normalize(options.defaultValue ?? []));
  const value = controlled ? normalize(options.value ?? []) : localValue;

  const [nav, setNav] = useState<Navigation>(() => {
    const focused = toCalendarDate(constrainValue(value[0] ?? today(timeZone), min, max));
    return { focused, start: alignStart(focused, numOfMonths) };
  });
  const [view, setView] = useState<DateView>(defaultView);
  const [activeIndex, setActiveIndex] = useState<0 | 1>(() =>
    open && range && value.length === 1 ? 1 : 0,
  );
  const [hovered, setHovered] = useState<DateValue | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const [focusRequest, setFocusRequest] = useState(0);
  const handledFocusRequestRef = useRef(focusRequest);
  const { liveRegion, announce } = useAnnouncer({ politeness: "assertive" });

  const realign = ({ focused, start }: Navigation): Navigation => {
    const outside = isDateOutsideRange(focused, start, getEndDate(start, numOfMonths));
    return outside ? { focused, start: alignStart(focused, numOfMonths) } : { focused, start };
  };

  const navigateTo = (from: Navigation, target: DateValue): Navigation => {
    const date = toCalendarDate(target);
    if (isDateEqual(from.focused, date)) return from;
    const adjusted = adjustFocusedDate(
      { startDate: from.start, focusedDate: date },
      numOfMonths,
      min,
      max,
    );
    return realign({ focused: adjusted.focusedDate, start: adjusted.startDate });
  };

  if (open !== wasOpen) {
    setWasOpen(open);
    setHovered(null);
    if (open) {
      setView(defaultView);
      if (value[0]) setNav(navigateTo(nav, value[0]));
      setActiveIndex(range && value.length === 1 ? 1 : 0);
    } else {
      setActiveIndex(0);
    }
  }

  const focused = nav.focused;
  const start = nav.start;
  const rangeTextFor = (at: Navigation) =>
    getVisibleRangeText(view, getViewRange(view, at, numOfMonths), locale, timeZone, range);
  const visibleRangeText = rangeTextFor(nav);
  const hoveredRange = hovered && value[0] ? adjustStartAndEndDate([value[0], hovered]) : [];
  const isMaxSelected = multiple && maxSelectedDates != null && value.length >= maxSelectedDates;

  const [first, second] = value;
  const valueText = range
    ? formatSelectedDate(first, second ?? null, locale, timeZone)
    : joinDates(value.map((date) => formatSelectedDate(date, null, locale, timeZone)));
  const [mountedText] = useState(valueText);
  const announcedRef = useRef(false);
  useEffect(() => {
    if (valueText === mountedText && !announcedRef.current) return;
    announcedRef.current = true;
    announce(valueText, 3000);
  }, [valueText, mountedText, announce]);

  useLayoutEffect(() => {
    if (handledFocusRequestRef.current === focusRequest) return;
    handledFocusRequestRef.current = focusRequest;
    const container = getContainer();
    if (container) focusedCell(container)?.focus({ preventScroll: true });
  });

  const requestCellFocus = () => setFocusRequest((count) => count + 1);

  const moveFocus = (next: Navigation, { focus }: { focus: boolean }) => {
    if (next === nav) return;
    if (focus) requestCellFocus();
    setNav(next);
  };

  const focusDate = (date: DateValue, focus = false) => moveFocus(navigateTo(nav, date), { focus });

  const focusPage = (next: { startDate: DateValue; focusedDate: DateValue }, focus: boolean) => {
    const moved = !isDateEqual(nav.focused, next.focusedDate);
    const target = moved
      ? realign({ start: next.startDate, focused: next.focusedDate })
      : { start: next.startDate, focused: nav.focused };
    if (!moved && isDateEqual(target.start, nav.start)) return;
    if (focus && moved) requestCellFocus();
    setNav(target);
  };

  const commit = (next: DateValue[], reason: DateValueChangeReason, event?: Event): boolean => {
    if (sameItems(next, value, isDateEqual)) return true;
    if (!emitChange(onValueChange, next, reason, event)) return false;
    if (!controlled) setLocalValue(next);
    return true;
  };

  const canSelect = (date: DateValue) => {
    if (maxSelectedDates == null) return true;
    if (value.some((selected) => isSameDay(selected, date))) return true;
    return value.length < maxSelectedDates;
  };

  const toggle = (date: DateValue, event: Event) => {
    const index = value.findIndex((selected) => isSameDay(selected, date));
    const next =
      index === -1 ? [...value, preserveTime(value[0], date)] : value.filter((_, i) => i !== index);
    commit(sortDates(next), "item-press", event);
  };

  const setAt = (index: 0 | 1, date: DateValue) => {
    const next = [...value];
    next[index] = preserveTime(next[index] ?? next[0], date);
    return adjustStartAndEndDate(next);
  };

  const showHoverAt = (date: DateValue, nextActiveIndex: 0 | 1) => {
    if (range && nextActiveIndex === 1) setHovered(date);
  };

  const pickDay = (date: DateValue, event: Event, keyboard: boolean) => {
    const advance = () => {
      if (!keyboard) return;
      const next = navigateTo(nav, nav.focused.add({ days: 1 }));
      moveFocus(next, { focus: true });
      showHoverAt(next.focused, 1);
    };

    if (!keyboard) focusDate(date);
    if (range && value.length === 2) {
      if (commit([preserveTime(value[0], date)], "item-press", event)) {
        setActiveIndex(1);
        advance();
      }
      return;
    }
    if (range && activeIndex === 1 && value[0]) {
      if (!commit(setAt(1, date), "item-press", event)) return;
      setActiveIndex(0);
      setHovered(null);
      if (closeOnSelect) requestClose(event);
      return;
    }
    if (range) {
      if (!commit(setAt(0, date), "item-press", event)) return;
      setActiveIndex(1);
      advance();
      return;
    }
    if (multiple) {
      if (canSelect(date)) toggle(date, event);
      return;
    }
    if (!commit(setAt(0, date), "item-press", event)) return;
    if (closeOnSelect) requestClose(event);
  };

  const openView = (date: DateValue) => {
    requestCellFocus();
    setNav(navigateTo(nav, date));
    setView(getPreviousView(view));
  };

  const goTo = (direction: 1 | -1) => {
    if (view === "day") {
      focusPage(getPage(direction, nav.focused, nav.start, numOfMonths, min, max), false);
      return;
    }
    const years = view === "year" ? 10 : 1;
    const next = navigateTo(nav, nav.focused.add({ years: direction * years }));
    moveFocus(next, { focus: false });
    announce(rangeTextFor(next).formatted);
  };

  const dayFormatter = getDayFormatter(locale, timeZone, focused);
  const yearFormatter = getYearFormatter(locale, timeZone, focused);
  let monthLabels: string[] | undefined;
  const getMonthLabels = () => (monthLabels ??= getMonthNames(locale, "short", focused));

  function rangeState(date: DateValue, same: (a: DateValue, b: DateValue) => boolean) {
    const inHoveredRange =
      range && hoveredRange.length > 0 && isDateWithinRange(date, hoveredRange);
    return {
      inRange: range && (isDateWithinRange(date, value) || inHoveredRange),
      firstInRange: range && value[0] != null && same(date, value[0]),
      lastInRange: range && value[1] != null && same(date, value[1]),
      inHoveredRange,
      firstInHoveredRange: inHoveredRange && hoveredRange[0] != null && same(date, hoveredRange[0]),
      lastInHoveredRange: inHoveredRange && hoveredRange[1] != null && same(date, hoveredRange[1]),
    };
  }

  function getDayCell(date: DateValue, visibleStart: DateValue): DayCellState {
    const monthEnd = visibleStart.add({ months: 1 }).subtract({ days: 1 });
    const outsideRange = isDateOutsideRange(date, visibleStart, monthEnd);
    const invalid = isDateOutsideRange(date, min, max);
    const selected = value.some((selectedDate) => isSameDay(date, selectedDate));
    const cellDisabled = outsideRange || invalid || (isMaxSelected && !selected);
    const unavailable = isDateUnavailable(date, options.isDateUnavailable, locale, min, max);
    return {
      value: date,
      valueText: dayFormatter.format(date.toDate(timeZone)),
      focused: isSameDay(date, focused) && !outsideRange,
      selectable: !cellDisabled && !unavailable,
      selected,
      outsideRange,
      invalid,
      unavailable,
      today: isToday(date, timeZone),
      weekend: isWeekend(date, locale),
      ...rangeState(date, isSameDay),
    };
  }

  function getGridCell(gridView: "month" | "year", cellValue: number): CellState {
    const date = focused.set({ [gridView]: cellValue });
    const selectable =
      gridView === "month"
        ? overlapsRange(startOfMonth(date), endOfMonth(date), min, max)
        : overlapsRange(startOfYear(date), endOfYear(date), min, max);
    return {
      value: date,
      valueText:
        gridView === "month"
          ? `${getMonthLabels()[cellValue - 1]} ${yearFormatter.format(date.toDate(timeZone))}`
          : String(cellValue),
      focused: (gridView === "month" ? focused.month : focused.year) === cellValue,
      selectable,
      selected:
        gridView === "month"
          ? value.some((d) => d.month === cellValue && d.year === focused.year)
          : value.some((d) => d.year === cellValue),
      outsideRange: gridView === "year" && !getDecadeRange(focused.year).includes(cellValue),
      ...rangeState(date, gridView === "month" ? isEqualMonth : isEqualYear),
    };
  }

  const isFocusedSelectable = (tableView: DateView) => {
    if (tableView === "day") {
      return !isDateUnavailable(focused, options.isDateUnavailable, locale, min, max);
    }
    return getGridCell(tableView, tableView === "month" ? focused.month : focused.year).selectable;
  };

  const onTableKeyDown = (tableView: DateView, columns: number, event: KeyboardEvent) => {
    if (event.defaultPrevented || disabled) return;
    const key = mirrorArrowKey(event.key, dir === "rtl");

    const step = (by: DateDuration, sign: 1 | -1) => {
      const next = navigateTo(nav, sign === 1 ? nav.focused.add(by) : nav.focused.subtract(by));
      moveFocus(next, { focus: true });
      showHoverAt(next.focused, activeIndex);
    };
    const toDate = (date: DateValue) => {
      const next = navigateTo(nav, date);
      moveFocus(next, { focus: true });
      showHoverAt(next.focused, activeIndex);
    };
    const unit: Record<DateView, keyof DateDuration> = {
      day: "days",
      month: "months",
      year: "years",
    };
    const rowStep: DateDuration =
      tableView === "day" ? { weeks: 1 } : { [unit[tableView]]: columns };

    switch (key) {
      case "Enter":
      case " ": {
        if (!interactive || !isFocusedSelectable(tableView)) break;
        if (tableView !== "day") openView(nav.focused);
        else pickDay(nav.focused.copy(), event.nativeEvent, true);
        break;
      }
      case "ArrowLeft":
        step({ [unit[tableView]]: 1 }, -1);
        break;
      case "ArrowRight":
        step({ [unit[tableView]]: 1 }, 1);
        break;
      case "ArrowUp":
        step(rowStep, -1);
        break;
      case "ArrowDown":
        step(rowStep, 1);
        break;
      case "PageUp":
      case "PageDown": {
        const sign = key === "PageUp" ? -1 : 1;
        const page = getSection(
          sign,
          event.shiftKey,
          nav.focused,
          nav.start,
          numOfMonths,
          min,
          max,
        );
        focusPage(page, true);
        showHoverAt(page.focusedDate, activeIndex);
        break;
      }
      case "Home":
        if (tableView === "day") toDate(getWeekEdges(nav.focused, locale, startOfWeek)[0]);
        else if (tableView === "month") toDate(nav.focused.set({ month: 1 }));
        else toDate(nav.focused.set({ year: getDecadeRange(nav.focused.year)[0] }));
        break;
      case "End":
        if (tableView === "day") toDate(getWeekEdges(nav.focused, locale, startOfWeek)[1]);
        else if (tableView === "month") {
          toDate(nav.focused.set({ month: nav.focused.calendar.getMonthsInYear(nav.focused) }));
        } else toDate(nav.focused.set({ year: getDecadeRange(nav.focused.year)[9] }));
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
  };

  const onCellClick = (state: CellState, cellView: DateView, event: MouseEvent) => {
    if (event.defaultPrevented || !interactive || !state.selectable) return;
    if (cellView !== "day") openView(state.value);
    else pickDay(state.value, event.nativeEvent, false);
  };

  const onCellPointerMove = (state: CellState, cellView: DateView, event: PointerEvent) => {
    if (event.pointerType === "touch" || !state.selectable) return;
    if (cellView === "year" && state.outsideRange) return;
    if (!range || activeIndex !== 1) return;
    if (hovered && isDateEqual(state.value, hovered)) return;
    setHovered(state.value);
    if (cellView === "day" && state.outsideRange) return;
    const focus = event.currentTarget !== event.currentTarget.ownerDocument.activeElement;
    focusDate(state.value, focus);
  };

  const getTableProps = (tableView: DateView, columns: number) => ({
    role: "grid",
    tabIndex: -1,
    "aria-label": visibleRangeText.formatted,
    "aria-readonly": readOnly || undefined,
    "aria-disabled": disabled || undefined,
    "aria-multiselectable": selectionMode !== "single" || undefined,
    "data-view": tableView,
    onKeyDown: (event: KeyboardEvent) => onTableKeyDown(tableView, columns, event),
    onPointerLeave: () => {
      if (range) setHovered(null);
    },
  });

  const getRowProps = () => ({
    "aria-disabled": disabled || undefined,
    "data-disabled": dataAttr(disabled),
  });

  const rangeAttributes = (state: CellState) => ({
    "data-selected": dataAttr(state.selected),
    "data-disabled": dataAttr(!state.selectable),
    "data-outside-range": dataAttr(state.outsideRange),
    "data-in-range": dataAttr(state.inRange),
    "data-range-start": dataAttr(state.firstInRange),
    "data-range-end": dataAttr(state.lastInRange),
    "data-in-hover-range": dataAttr(state.inHoveredRange),
    "data-hover-range-start": dataAttr(state.firstInHoveredRange),
    "data-hover-range-end": dataAttr(state.lastInHoveredRange),
  });

  const triggerProps = (state: CellState, cellView: DateView, label: string) => ({
    type: "button" as const,
    tabIndex: !disabled && state.focused ? 0 : -1,
    "aria-label": label,
    "aria-disabled": !state.selectable || undefined,
    "data-value": cellView === "day" ? state.value.toString() : undefined,
    ...rangeAttributes(state),
    onClick: (event: MouseEvent) => onCellClick(state, cellView, event),
    onPointerMove: range
      ? (event: PointerEvent) => onCellPointerMove(state, cellView, event)
      : undefined,
  });

  const getGridCellProps = (state: CellState) => ({
    role: "gridcell",
    "aria-disabled": !state.selectable || undefined,
    "aria-selected": state.selected || state.inRange,
  });

  const getDayCellProps = (state: DayCellState) => ({
    ...getGridCellProps(state),
    "aria-invalid": state.invalid || undefined,
    "aria-current": state.today ? ("date" as const) : undefined,
  });

  const getDayTriggerProps = (state: DayCellState) => ({
    ...triggerProps(state, "day", dayCellLabel(state)),
    "aria-invalid": state.invalid || undefined,
    "data-today": dataAttr(state.today),
    "data-unavailable": dataAttr(state.unavailable),
    "data-weekend": dataAttr(state.weekend),
  });

  const getGridTriggerProps = (state: CellState, cellView: "month" | "year") =>
    triggerProps(state, cellView, state.valueText);

  const getStepTriggerProps = (direction: 1 | -1, triggerView: DateView) => {
    const shown = getViewRange(triggerView, nav, numOfMonths);
    const invalid =
      direction === 1
        ? isNextRangeInvalid(shown.end, min, max)
        : isPreviousRangeInvalid(shown.start, min, max);
    return {
      type: "button" as const,
      "aria-label": (direction === 1 ? NEXT_LABELS : PREV_LABELS)[triggerView],
      disabled: disabled || invalid,
      onClick: (event: MouseEvent) => {
        if (!event.defaultPrevented) goTo(direction);
      },
    };
  };

  const getMonths = (offset: number) => {
    const from = start.add({ months: offset });
    return getMonthDays(from, locale, fixedWeeks ? 6 : undefined, startOfWeek).map((week) =>
      week.map((date) => getDayCell(date, from)),
    );
  };

  const monthsGrid = (): GridCell[][] =>
    chunk(
      getMonthLabels().map((label, index) => ({ label, value: index + 1 })),
      4,
    );

  const yearsGrid = (): GridCell[][] =>
    chunk(
      getDecadeRange(focused.year).map((year) => ({ label: String(year), value: year })),
      4,
    );

  const clear = (event: Event | undefined, { focusCell }: { focusCell: boolean }) => {
    if (!commit([], "clear-press", event)) return;
    if (focusCell) requestCellFocus();
    setNav(navigateTo(nav, today(timeZone)));
    setActiveIndex(0);
    setHovered(null);
  };

  const selectPreset = (preset: DateRangePreset | DateValue[], event: Event) => {
    if (!interactive) return;
    const dates = Array.isArray(preset)
      ? preset
      : getDateRangePreset(preset, locale, timeZone, startOfWeek);
    if (
      !commit(
        dates.map((date) => constrainValue(date, min, max)),
        "preset-press",
        event,
      )
    )
      return;
    if (dates[0]) focusDate(dates[0]);
    requestClose(event);
  };

  return {
    selectionMode,
    value,
    view,
    numOfMonths,
    disabled,
    readOnly,
    interactive,
    visibleRangeText,
    weekDays: getWeekDays(start, startOfWeek, timeZone, locale),
    liveRegion,
    getMonths,
    monthsGrid,
    yearsGrid,
    getGridCell,
    getTableProps,
    getRowProps,
    getDayCellProps,
    getDayTriggerProps,
    getGridCellProps,
    getGridTriggerProps,
    getStepTriggerProps,
    getViewTriggerProps: (triggerView: DateView) => ({
      type: "button" as const,
      disabled: disabled || getNextView(triggerView) === triggerView,
      onClick: (event: MouseEvent) => {
        if (event.defaultPrevented || !interactive) return;
        requestCellFocus();
        setView(getNextView(view));
      },
    }),
    clear,
    selectPreset,
  };
}

export type Calendar = ReturnType<typeof useCalendar>;

export const [CalendarContext, useCalendarContext] = createPartContext<Calendar>(
  "a Calendar or DatePicker",
  "Calendar parts",
);
