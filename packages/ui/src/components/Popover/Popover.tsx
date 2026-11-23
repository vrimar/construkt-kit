import type { ComponentProps, MouseEvent, ReactNode } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { popover } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import type { OverlayRootProps } from "../../primitives/layer";
import { type MobileLayoutProps, usePopup } from "../../primitives/popup";
import type { Anchor, PlacementOption } from "../../primitives/position";
import { dataAttr, mergeProps, openStateAttributes, renderable } from "../../primitives/render";
import { createCloseTrigger } from "../closeTrigger";
import { createArrow } from "../floating";
import { type OverlayLabels, createLabelParts, useOverlayLabels } from "../labelParts";
import { createPartContext } from "../partContext";
import { createPopupContent, createPopupContext, getPopupToggleProps } from "../popup";
import { type WithTooltipProps, withTriggerTooltip } from "../Tooltip/TriggerTooltip";

const { withRootProvider, withContext } = createSlotRecipeContext(popover);

const StyledAnchor = withContext(renderable.div, "anchor");
const StyledArrow = withContext(renderable.div, "arrow");
const StyledArrowTip = withContext(renderable.div, "arrowTip");
const StyledCloseTrigger = withContext(renderable.button, "closeTrigger");
const StyledContent = withContext(renderable.div, "content");
const StyledDescription = withContext(renderable.div, "description");
const StyledIndicator = withContext(renderable.div, "indicator");
const StyledPositioner = withContext(renderable.div, "positioner");
const StyledTitle = withContext(renderable.h2, "title");
const StyledTrigger = withContext(renderable.button, "trigger");

const Body = withContext(renderable.div, "body");
const Header = withContext(renderable.div, "header");
const StyledFooter = withContext(renderable.div, "footer");

const floatingArrow = createArrow(StyledArrow, StyledArrowTip);
const Arrow: (props: ComponentProps<typeof StyledArrow>) => ReactNode = floatingArrow.Arrow;
const ArrowTip: (props: ComponentProps<typeof StyledArrowTip>) => ReactNode =
  floatingArrow.ArrowTip;

const [PopoverProvider, usePopoverContext] = createPopupContext("<Popover.Root>", "Popover parts");

const [PopoverLabelsContext, usePopoverLabels] = createPartContext<OverlayLabels>(
  "<Popover.Root>",
  "Popover titles",
);

export { usePopoverContext, usePopoverLabels };

export interface PopoverRootProps extends MobileLayoutProps, OverlayRootProps {
  /** Called once the popover has closed, left the page and handed focus back. */
  onExitComplete?: (() => void) | undefined;
  /** Where the popover opens against its trigger or `Popover.Anchor`. @default "bottom" */
  placement?: PlacementOption | undefined;
  /**
   * What the popover opens against in place of its trigger or `Popover.Anchor`: an element, or
   * `{ getBoundingClientRect }` for a point or a measured box.
   */
  anchor?: Anchor | null | undefined;
  /** Moves focus into the popover when it opens. @default true */
  autoFocus?: boolean | undefined;
  /** Moves focus back to the trigger when it closes. @default true */
  restoreFocus?: boolean | undefined;
  /** Closes on a press or focus outside the popover and its trigger. @default true */
  closeOnInteractOutside?: boolean | undefined;
  /** Keeps the popover closed, and its trigger a plain button with no popup state. @default false */
  disabled?: boolean | undefined;
}

interface PopoverRootBaseProps extends PopoverRootProps {
  gutter?: number | undefined;
}

function PopoverRootBase({ children, initialFocusEl, ...options }: PopoverRootBaseProps) {
  const popup = usePopup({ idPrefix: "popover", initialFocus: initialFocusEl, ...options });
  const labels = useOverlayLabels("popover");
  return (
    <PopoverProvider popup={popup}>
      <PopoverLabelsContext value={labels}>{children}</PopoverLabelsContext>
    </PopoverProvider>
  );
}

const StyledRoot = withRootProvider(PopoverRootBase);

export const PopoverRoot: (props: PopoverRootProps) => ReactNode = StyledRoot;

/** Popover.Root with an internal gutter, for overlays that sit closer to their trigger. */
export const PopoverRootWithGutter: (props: PopoverRootBaseProps) => ReactNode = StyledRoot;

export interface PopoverTriggerProps
  extends ComponentProps<typeof StyledTrigger>, WithTooltipProps {}

function TriggerPart({ ref, ...props }: ComponentProps<typeof StyledTrigger>) {
  const popup = usePopoverContext();
  const composedRef = useComposedRefs(ref, popup.setTriggerEl);
  return (
    <StyledTrigger
      {...mergeProps<ComponentProps<typeof StyledTrigger>>(
        getPopupToggleProps(popup, { render: props.render }),
        props,
      )}
      ref={composedRef}
    />
  );
}

const PopoverTrigger = withTriggerTooltip(TriggerPart);

function Anchor({ ref, ...props }: ComponentProps<typeof StyledAnchor>) {
  const { setAnchorEl } = usePopoverContext();
  const composedRef = useComposedRefs(ref, setAnchorEl);
  return (
    <StyledAnchor
      {...props}
      ref={composedRef}
    />
  );
}

function Indicator(props: ComponentProps<typeof StyledIndicator>) {
  const { open } = usePopoverContext();
  return (
    <StyledIndicator
      {...openStateAttributes(open)}
      {...props}
    />
  );
}

const { Title, Description } = createLabelParts(StyledTitle, StyledDescription, usePopoverLabels);

function useClosePopover() {
  const { requestOpenChange } = usePopoverContext();
  return (event: MouseEvent<HTMLElement>) =>
    requestOpenChange(false, "close-press", event.nativeEvent);
}

export interface PopoverFooterProps extends ComponentProps<typeof StyledFooter> {
  /** Actions share the footer's width, start-aligned, edge to edge with a list body's rows. */
  stretch?: boolean;
}

function Footer({ stretch, ...props }: PopoverFooterProps) {
  return (
    <StyledFooter
      data-stretch={dataAttr(stretch)}
      {...props}
    />
  );
}

export type PopoverContentProps = ComponentProps<typeof StyledContent>;

const PopupContent = createPopupContent(StyledPositioner, StyledContent, usePopoverContext);

function PopoverContent(props: PopoverContentProps) {
  const labels = usePopoverLabels();
  return (
    <PopupContent
      aria-labelledby={labels.labelledBy}
      aria-describedby={labels.describedBy}
      {...props}
    />
  );
}

export const Popover = {
  Root: PopoverRoot,
  Content: PopoverContent,
  Anchor,
  Arrow,
  ArrowTip,
  CloseTrigger: createCloseTrigger(StyledCloseTrigger, useClosePopover),
  Indicator,
  Title,
  Description,
  Footer,
  Header,
  Body,
  Trigger: PopoverTrigger,
};
