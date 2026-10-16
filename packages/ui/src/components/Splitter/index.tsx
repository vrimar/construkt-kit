import { ark } from "@ark-ui/react/factory";
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
import { splitter } from "#styled-system/recipes";

import { splitInlineSizes } from "../../foundations/cssSize";

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
  BoxProps;

function SplitterGroup({ style, ...props }: SplitterGroupProps) {
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

export type SplitterSeparatorProps = Pick<SeparatorProps, "disabled" | "elementRef" | "id"> &
  BoxProps;

function SplitterSeparator({ disabled, elementRef, id, ...boxProps }: SplitterSeparatorProps) {
  return (
    <StyledResizeTrigger
      asChild
      data-no-drag=""
      {...boxProps}
    >
      <Separator
        disabled={disabled}
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
