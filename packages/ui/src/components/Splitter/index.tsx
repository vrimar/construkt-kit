import { ark } from "@ark-ui/react/factory";
import {
  Group,
  type GroupProps,
  Panel,
  type PanelProps,
  Separator,
  type SeparatorProps,
} from "react-resizable-panels";
import { type HTMLStyledProps, createStyleContext } from "@b3/styled-system/jsx";
import { splitter } from "@b3/styled-system/recipes";

const { withProvider, withContext } = createStyleContext(splitter);

const StyledRoot = withProvider(ark.div, "root");
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

function SplitterGroup({
  children,
  defaultLayout,
  disableCursor,
  disabled,
  elementRef,
  groupRef,
  onLayoutChange,
  onLayoutChanged,
  orientation,
  resizeTargetMinimumSize,
  ...boxProps
}: SplitterGroupProps) {
  return (
    <StyledRoot
      asChild
      {...boxProps}
    >
      <Group
        defaultLayout={defaultLayout}
        disableCursor={disableCursor}
        disabled={disabled}
        elementRef={elementRef}
        groupRef={groupRef}
        onLayoutChange={onLayoutChange}
        onLayoutChanged={onLayoutChanged}
        orientation={orientation}
        resizeTargetMinimumSize={resizeTargetMinimumSize}
      >
        {children}
      </Group>
    </StyledRoot>
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
