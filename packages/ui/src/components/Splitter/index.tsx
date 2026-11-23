import { useEffect, useRef } from "react";
import {
  Group,
  type GroupProps,
  Panel,
  type PanelProps,
  Separator,
  type SeparatorProps,
} from "react-resizable-panels";

import { css, cx } from "#styled-system/css";
import { type HTMLStyledProps, createSlotRecipeContext, splitCssProps } from "#styled-system/jsx";
import { type SplitterVariantProps, splitter } from "#styled-system/recipes";

import { splitInlineSizes } from "../../foundations/cssSize";
import { splitOptions } from "../../foundations/props";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { noDragProps } from "../../primitives/drag";
import { renderable } from "../../primitives/render";

export type { PanelImperativeHandle as SplitterPanelHandle } from "react-resizable-panels";

const { withRootProvider, withContext } = createSlotRecipeContext(splitter);

const RootProvider = withRootProvider(Group);
const StyledPanel = withContext(renderable.div, "panel");
const StyledResizeTrigger = withContext(renderable.div, "resizeTrigger");
type BoxProps = HTMLStyledProps<"div">;

export type SplitterGroupProps = Pick<
  GroupProps,
  | "defaultLayout"
  | "disableCursor"
  | "disabled"
  | "elementRef"
  | "groupRef"
  | "onLayoutChange"
  | "onLayoutChanged"
  | "orientation"
  | "resizeTargetMinimumSize"
> &
  SplitterVariantProps &
  BoxProps;

// react-resizable-panels resets on double-click through its imperative API, which reports a programmatic change.
function useDoubleClickResetIsUserInteraction(
  groupElement: { current: HTMLDivElement | null },
  onLayoutChanged: GroupProps["onLayoutChanged"],
): GroupProps["onLayoutChanged"] {
  const resetting = useRef(false);

  useEffect(() => {
    if (!onLayoutChanged) return;
    const onDoubleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Node) || !groupElement.current?.contains(event.target)) return;
      resetting.current = true;
      setTimeout(() => {
        resetting.current = false;
      });
    };
    window.addEventListener("dblclick", onDoubleClick, true);
    return () => window.removeEventListener("dblclick", onDoubleClick, true);
  }, [groupElement, onLayoutChanged]);

  return (
    onLayoutChanged &&
    ((layout, details) =>
      onLayoutChanged(
        layout,
        resetting.current ? { ...details, isUserInteraction: true } : details,
      ))
  );
}

function SplitterGroup({ ref, style, elementRef, onLayoutChanged, ...props }: SplitterGroupProps) {
  const groupElement = useRef<HTMLDivElement | null>(null);
  const callerElementRef = useComposedRefs(elementRef, ref);
  const composedElementRef = useComposedRefs(callerElementRef, groupElement);
  const reportLayoutChanged = useDoubleClickResetIsUserInteraction(groupElement, onLayoutChanged);

  const [sizeStyle, sizedProps] = splitInlineSizes(props, [
    "height",
    "maxHeight",
    "maxWidth",
    "minHeight",
    "minWidth",
    "width",
  ]);
  const groupStyle = { ...sizeStyle, ...style };

  const [cssProps, localProps] = splitCssProps(sizedProps);
  const { className, ...groupProps } = localProps;

  return (
    <RootProvider
      className={cx(splitter().root, css(cssProps), className)}
      style={groupStyle}
      elementRef={composedElementRef}
      onLayoutChanged={reportLayoutChanged}
      {...groupProps}
    />
  );
}

const PANEL_KEYS = {
  collapsedSize: true,
  collapsible: true,
  defaultSize: true,
  disabled: true,
  elementRef: true,
  groupResizeBehavior: true,
  id: true,
  maxSize: true,
  minSize: true,
  onResize: true,
  panelRef: true,
} as const satisfies Partial<Record<keyof PanelProps, true>>;

export type SplitterPanelProps = Pick<PanelProps, keyof typeof PANEL_KEYS> & BoxProps;

function SplitterPanel({ ref, children, ...props }: SplitterPanelProps) {
  const [{ elementRef, ...panelProps }, boxProps] = splitOptions(props, PANEL_KEYS);
  const composedElementRef = useComposedRefs(elementRef, ref);

  return (
    <StyledPanel
      render={
        <Panel
          {...panelProps}
          elementRef={composedElementRef}
          // Unset the library's inline overflow so the recipe and style props own it.
          style={{ overflow: undefined }}
        />
      }
      {...boxProps}
    >
      {children}
    </StyledPanel>
  );
}

const SEPARATOR_KEYS = {
  disabled: true,
  disableDoubleClick: true,
  elementRef: true,
  id: true,
} as const satisfies Partial<Record<keyof SeparatorProps, true>>;

export type SplitterSeparatorProps = Pick<SeparatorProps, keyof typeof SEPARATOR_KEYS> & BoxProps;

function SplitterSeparator({ ref, ...props }: SplitterSeparatorProps) {
  const [{ elementRef, ...separatorProps }, boxProps] = splitOptions(props, SEPARATOR_KEYS);
  const composedElementRef = useComposedRefs(elementRef, ref);

  return (
    <StyledResizeTrigger
      render={
        <Separator
          {...separatorProps}
          elementRef={composedElementRef}
        />
      }
      {...noDragProps}
      {...boxProps}
    />
  );
}

export const Splitter = {
  Group: SplitterGroup,
  Panel: SplitterPanel,
  Separator: SplitterSeparator,
};
