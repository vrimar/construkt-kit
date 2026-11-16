import { useLatestRef } from "@construkt-kit/ui";
import {
  type ReactNode,
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  GRID_CHANNELS,
  GRID_OPTION_KEYS,
  GridCore,
  type GridOptions,
  type VisibleRange,
} from "../core/grid";

export type AnyGridCore = GridCore<any, ReactNode>;

type GridOptionKey = keyof typeof GRID_OPTION_KEYS;

const RENDER_CHANNELS = [
  GRID_CHANNELS.window,
  GRID_CHANNELS.rows,
  GRID_CHANNELS.cells,
  GRID_CHANNELS.geometry,
  GRID_CHANNELS.active,
  GRID_CHANNELS.selection,
  GRID_CHANNELS.editing,
  GRID_CHANNELS.drag,
];

export function splitGridOptions<P extends object>(
  props: P,
): [Pick<P, Extract<keyof P, GridOptionKey>>, Omit<P, GridOptionKey>] {
  const options: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    (Object.hasOwn(GRID_OPTION_KEYS, key) ? options : rest)[key] = value;
  }
  return [options as Pick<P, Extract<keyof P, GridOptionKey>>, rest as Omit<P, GridOptionKey>];
}

export function useChannels(core: AnyGridCore, channels: readonly string[]): void {
  const subscribe = useCallback(
    (listener: () => void) => {
      const stops = channels.map((channel) => core.channels.subscribe(channel, listener));
      return () => {
        for (const stop of stops) stop();
      };
    },
    [core, channels],
  );
  const version = () => channels.reduce((sum, channel) => sum + core.channels.version(channel), 0);
  useSyncExternalStore(subscribe, version, version);
}

export function useGridCore<TRow>(
  options: GridOptions<TRow, ReactNode>,
): GridCore<TRow, ReactNode> {
  const [core] = useState(() => new GridCore<TRow, ReactNode>(options));
  const [deferred] = useState<(() => void)[]>(() => []);
  // setOptions can collapse ranges mid-render; the app must hear of that only after the commit.
  let rendering = true;
  const { onCellSelectionChange } = options;
  core.channels.silently(() =>
    core.setOptions({
      ...options,
      onCellSelectionChange:
        onCellSelectionChange &&
        ((ranges) => {
          if (rendering) deferred.push(() => onCellSelectionChange(ranges));
          else onCellSelectionChange(ranges);
        }),
    }),
  );
  rendering = false;
  useLayoutEffect(() => {
    for (const call of deferred.splice(0)) call();
  });
  useChannels(core, RENDER_CHANNELS);
  return core;
}

export function useGridScroll(
  core: AnyGridCore,
  scroller: HTMLElement | null,
  bandRef: RefObject<HTMLElement | null>,
  onVisibleRangeChange: ((range: VisibleRange) => void) | undefined,
): void {
  const applyScroll = useCallback(() => {
    if (!scroller) return;
    const request = core.takePendingScroll();
    if (request) scroller.scrollTo({ ...request, behavior: "instant" });
  }, [core, scroller]);
  useLayoutEffect(applyScroll);
  useLayoutEffect(
    () => core.channels.subscribe(GRID_CHANNELS.scroll, applyScroll),
    [core, applyScroll],
  );
  useLayoutEffect(
    () =>
      core.channels.subscribe(GRID_CHANNELS.origin, () => {
        if (bandRef.current) bandRef.current.style.top = `${core.bandTop}px`;
      }),
    [core, bandRef],
  );

  const latestRangeChange = useLatestRef(onVisibleRangeChange);
  const reportedRange = useRef<VisibleRange | null>(null);
  const reportRange = useCallback(() => {
    const range = core.visibleRange;
    if (!range || range === reportedRange.current) return;
    reportedRange.current = range;
    latestRangeChange.current?.(range);
  }, [core, latestRangeChange]);
  useLayoutEffect(reportRange);
  useLayoutEffect(
    () => core.channels.subscribe(GRID_CHANNELS.range, reportRange),
    [core, reportRange],
  );
}

const measuredHeight = (element: HTMLElement) => element.getBoundingClientRect().height;

let missingStylesReported = false;

const reportMissingStyles = () => {
  if (missingStylesReported) return;
  missingStylesReported = true;
  // oxlint-disable-next-line no-console
  console.error(
    'DataGrid: its styles are missing. Import `dataGridPreset` from "@construkt-kit/data-grid/preset" and add it to the app\'s Panda `presets`.',
  );
};

export function useGridMeasurements(
  core: AnyGridCore,
  scroller: HTMLElement | null,
  rowProbe: HTMLElement | null,
  headerProbe: HTMLElement | null,
  gutterProbe: HTMLElement | null,
): void {
  useLayoutEffect(() => {
    if (!scroller || !rowProbe || !headerProbe) return;
    const measure = () => {
      const rowHeight = measuredHeight(rowProbe);
      if (rowHeight === 0) {
        if (rowProbe.getClientRects().length > 0) reportMissingStyles();
        return;
      }
      core.channels.batch(() => {
        core.setDefaultRowHeight(rowHeight);
        core.setHeaderHeight(measuredHeight(headerProbe));
        core.setGutterWidth(gutterProbe ? gutterProbe.getBoundingClientRect().width : 0);
        core.setViewport(scroller.clientWidth, scroller.clientHeight);
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    observer.observe(rowProbe);
    observer.observe(headerProbe);
    if (gutterProbe) observer.observe(gutterProbe);
    return () => observer.disconnect();
  }, [core, scroller, rowProbe, headerProbe, gutterProbe]);
}
