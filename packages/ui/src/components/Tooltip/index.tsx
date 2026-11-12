import { ark } from "@ark-ui/react/factory";
import { Tooltip as ArkTooltip, TooltipContext } from "@ark-ui/react/tooltip";
import {
  type ComponentProps,
  Fragment,
  type ReactNode,
  type SyntheticEvent,
  isValidElement,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { tooltip } from "#styled-system/recipes";

import type { PortalledProps, WithRef } from "../../types";
import { Kbd } from "../Kbd";
import { lazyOverlayDefaults } from "../overlayDefaults";
import { createPortalledContent } from "../portalledContent";

const { withRootProvider, withContext } = createSlotRecipeContext(tooltip);

type RootProps = ComponentProps<typeof Root>;
const Root = withRootProvider(ArkTooltip.Root, { defaultProps: lazyOverlayDefaults });
const ArrowTip = withContext(ArkTooltip.ArrowTip, "arrowTip");
const Arrow = withContext(ArkTooltip.Arrow, "arrow", {
  defaultProps: { children: <ArrowTip /> },
});
const Content = withContext(ArkTooltip.Content, "content");
const Positioner = withContext(ArkTooltip.Positioner, "positioner");
const Trigger = withContext(ArkTooltip.Trigger, "trigger");

export interface TooltipContentProps extends ComponentProps<typeof Content>, PortalledProps {}

const TooltipContent = createPortalledContent(Positioner, Content);

export interface TooltipProps extends RootProps, PortalledProps {
  showArrow?: boolean;
  children: React.ReactNode | undefined;
  label: React.ReactNode;
  placement?: NonNullable<RootProps["positioning"]>["placement"];
  /** Opens only while the trigger's text is cut off, measured when the pointer or focus arrives. */
  showWhenTruncated?: boolean;
  /** Keyboard shortcut shown after the label. */
  shortcut?: ReactNode;
}

const isBlank = (node: ReactNode) => node == null || node === false || node === "";

// zag's default `dir="ltr"` would override the direction the trigger inherits from the page.
const ALWAYS_STRIPPED = ["data-state", "data-expanded", "dir"];
const TRIGGER_ATTRIBUTES = [
  ...ALWAYS_STRIPPED,
  "data-scope",
  "data-part",
  "data-ownedby",
  "data-value",
  "data-current",
  "id",
  "aria-describedby",
];

function TriggerTarget({
  bare,
  children,
  ...props
}: ComponentProps<typeof ark.span> & { bare: boolean }) {
  const own = isValidElement<Record<string, unknown>>(children) ? children.props : {};
  const target: Record<string, unknown> = { ...props };
  for (const key of bare ? TRIGGER_ATTRIBUTES : ALWAYS_STRIPPED) {
    if (!(key in own)) delete target[key];
  }

  return (
    <ark.span
      asChild
      {...target}
    >
      {children}
    </ark.span>
  );
}

// Scroll and client sizes round separately, so a 1px difference is not a cut.
const isClipped = (el: Element) =>
  (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) &&
  getComputedStyle(el).overflow !== "visible";

const isTextCut = (el: Element) =>
  isClipped(el) || Array.from(el.querySelectorAll("*")).some(isClipped);

const whenTextCut =
  <E extends SyntheticEvent<HTMLElement>>(handler: ((event: E) => void) | undefined) =>
  (event: E) => {
    if (isTextCut(event.currentTarget)) handler?.(event);
  };

function TruncationGate({
  onPointerMove,
  onPointerOver,
  onFocus,
  ...props
}: ComponentProps<typeof ark.span>) {
  return (
    <ark.span
      asChild
      {...props}
      onPointerMove={whenTextCut(onPointerMove)}
      onPointerOver={whenTextCut(onPointerOver)}
      onFocus={whenTextCut(onFocus)}
    />
  );
}

const TooltipComponent = ({
  ref,
  showArrow,
  children,
  portalled,
  label,
  portalRef,
  placement,
  positioning,
  showWhenTruncated,
  shortcut,
  ...rootProps
}: WithRef<TooltipProps>) => {
  const bare = isBlank(label);
  const trigger =
    isValidElement(children) && children.type !== Fragment ? children : <span>{children}</span>;

  return (
    <Root
      openDelay={300}
      closeDelay={0}
      positioning={{ ...positioning, placement: placement ?? positioning?.placement ?? "top" }}
      {...rootProps}
      disabled={bare || rootProps.disabled}
      open={bare ? false : rootProps.open}
    >
      <Trigger asChild>
        <TriggerTarget bare={bare}>
          {showWhenTruncated ? <TruncationGate>{trigger}</TruncationGate> : trigger}
        </TriggerTarget>
      </Trigger>
      {!bare && (
        <TooltipContent
          ref={ref}
          portalled={portalled}
          portalRef={portalRef}
        >
          {showArrow && <Arrow />}
          {label}
          {!isBlank(shortcut) && (
            <Kbd
              size="sm"
              variant="outline"
              color="inherit"
              borderColor="current/35"
              ms="1.5"
            >
              {shortcut}
            </Kbd>
          )}
        </TooltipContent>
      )}
    </Root>
  );
};

export const Tooltip = Object.assign(TooltipComponent, {
  Root,
  Arrow,
  ArrowTip,
  Content: TooltipContent,
  Positioner,
  Trigger,
  Context: TooltipContext,
});
