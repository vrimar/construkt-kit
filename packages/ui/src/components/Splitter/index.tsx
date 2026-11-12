import { ark } from "@ark-ui/react/factory";
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
import { useComposedRefs } from "../../hooks/useComposedRefs";

export type { PanelImperativeHandle as SplitterPanelHandle } from "react-resizable-panels";

const { withRootProvider, withContext } = createSlotRecipeContext(splitter);

const RootProvider = withRootProvider(Group);
const StyledPanel = withContext(ark.div, "panel");
const StyledResizeTrigger = withContext(ark.div, "resizeTrigger");
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

function SplitterGroup({ style, elementRef, onLayoutChanged, ...props }: SplitterGroupProps) {
  const groupElement = useRef<HTMLDivElement | null>(null);
  const composedElementRef = useComposedRefs(elementRef, groupElement);
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

export type SplitterPanelProps = Pick<
  PanelProps,
  | "collapsedSize"
  | "collapsible"
  | "defaultSize"
  | "disabled"
  | "elementRef"
  | "groupResizeBehavior"
  | "id"
  | "maxSize"
  | "minSize"
  | "onResize"
  | "panelRef"
> &
  BoxProps;

function SplitterPanel({
  children,
  collapsedSize,
  collapsible,
  defaultSize,
  disabled,
  elementRef,
  groupResizeBehavior,
  id,
  maxSize,
  minSize,
  onResize,
  panelRef,
  ...boxProps
}: SplitterPanelProps) {
  return (
    <StyledPanel
      asChild
      {...boxProps}
    >
      <Panel
        collapsedSize={collapsedSize}
        collapsible={collapsible}
        defaultSize={defaultSize}
        disabled={disabled}
        elementRef={elementRef}
        groupResizeBehavior={groupResizeBehavior}
        id={id}
        maxSize={maxSize}
        minSize={minSize}
        onResize={onResize}
        panelRef={panelRef}
      >
        {children}
      </Panel>
    </StyledPanel>
  );
}

export type SplitterSeparatorProps = Pick<
  SeparatorProps,
  "disabled" | "disableDoubleClick" | "elementRef" | "id"
> &
  BoxProps;

function SplitterSeparator({
  disabled,
  disableDoubleClick,
  elementRef,
  id,
  ...boxProps
}: SplitterSeparatorProps) {
  return (
    <StyledResizeTrigger
      asChild
      data-no-drag=""
      {...boxProps}
    >
      <Separator
        disabled={disabled}
        disableDoubleClick={disableDoubleClick}
        elementRef={elementRef}
        id={id}
      />
    </StyledResizeTrigger>
  );
}

export const Splitter = {
  Group: SplitterGroup,
  Panel: SplitterPanel,
  Separator: SplitterSeparator,
};
