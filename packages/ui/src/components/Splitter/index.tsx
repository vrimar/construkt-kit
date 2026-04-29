import { ark } from "@ark-ui/react/factory";
import { css, cx } from "@construkt-kit/styled-system/css";
import { type HTMLStyledProps, createStyleContext, splitCssProps } from "@construkt-kit/styled-system/jsx";
import { splitter } from "@construkt-kit/styled-system/recipes";
import {
  Group,
  type GroupProps,
  Panel,
  type PanelProps,
  Separator,
  type SeparatorProps,
} from "react-resizable-panels";

const { withRootProvider, withContext } = createStyleContext(splitter);

const RootProvider = withRootProvider(Group);
const StyledPanel = withContext(ark.div, "panel");
const StyledResizeTrigger = withContext(ark.div, "resizeTrigger");
type BoxProps = HTMLStyledProps<"div">;

function toInlineStyleValue(value: unknown) {
  return typeof value === "number" || typeof value === "string" ? value : undefined;
}

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

function SplitterGroup({
  children,
  defaultLayout,
  disableCursor,
  disabled,
  elementRef,
  groupRef,
  height,
  maxHeight,
  maxWidth,
  minHeight,
  minWidth,
  onLayoutChange,
  onLayoutChanged,
  orientation,
  resizeTargetMinimumSize,
  style,
  width,
  ...boxProps
}: SplitterGroupProps) {
  const groupStyle = {
    height: toInlineStyleValue(height),
    maxHeight: toInlineStyleValue(maxHeight),
    maxWidth: toInlineStyleValue(maxWidth),
    minHeight: toInlineStyleValue(minHeight),
    minWidth: toInlineStyleValue(minWidth),
    width: toInlineStyleValue(width),
    ...style,
  };

  const [cssProps, localProps] = splitCssProps(boxProps);
  const { className, ...groupProps } = localProps;

  return (
    <RootProvider
      className={cx(splitter().root, css(cssProps), className)}
      defaultLayout={defaultLayout}
      disableCursor={disableCursor}
      disabled={disabled}
      elementRef={elementRef}
      groupRef={groupRef}
      onLayoutChange={onLayoutChange}
      onLayoutChanged={onLayoutChanged}
      orientation={orientation}
      resizeTargetMinimumSize={resizeTargetMinimumSize}
      style={groupStyle}
      {...groupProps}
    >
      {children}
    </RootProvider>
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
