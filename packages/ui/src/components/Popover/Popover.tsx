import { ark } from "@ark-ui/react/factory";
import { Popover as ArkPopover, PopoverContext, usePopoverContext } from "@ark-ui/react/popover";
import {
  type ComponentProps,
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { popover } from "#styled-system/recipes";

import type { PortalledProps, WithRef } from "../../types";
import { createCloseTrigger } from "../closeTrigger";
import { lazyOverlayDefaults } from "../overlayDefaults";
import { type MobileLayoutProps, withMobileLayout } from "../overlayPresentation";
import { createPlacementRoot } from "../placementRoot";
import { createSheetCapableContent } from "../sheetFrame";
import { type WithTooltipProps, withTriggerTooltip } from "../Tooltip/TriggerTooltip";

const { withRootProvider, withContext } = createSlotRecipeContext(popover);

type RootProps = ComponentProps<typeof Root>;
const Root = withRootProvider(ArkPopover.Root, { defaultProps: lazyOverlayDefaults });
const Anchor = withContext(ArkPopover.Anchor, "anchor");
const ArrowTip = withContext(ArkPopover.ArrowTip, "arrowTip");
const Arrow = withContext(ArkPopover.Arrow, "arrow", {
  defaultProps: { children: <ArrowTip /> },
});
const CloseTrigger = withContext(ArkPopover.CloseTrigger, "closeTrigger");
const Content = withContext(ArkPopover.Content, "content");
const StyledDescription = withContext(ArkPopover.Description, "description");
const Indicator = withContext(ArkPopover.Indicator, "indicator");
const Positioner = withContext(ArkPopover.Positioner, "positioner");
const StyledTitle = withContext(ArkPopover.Title, "title");
const StyledTrigger = withContext(ArkPopover.Trigger, "trigger");

const Body = withContext(ark.div, "body");
const Header = withContext(ark.div, "header");
const Footer = withContext(ark.div, "footer");

export interface PopoverRootProps extends RootProps, MobileLayoutProps {
  placement?: NonNullable<RootProps["positioning"]>["placement"];
}

const PopoverRoot = createPlacementRoot<PopoverRootProps>(
  withMobileLayout<PopoverRootProps>(Root, { portalled: false }),
);

type LabelPart = "title" | "description";
type RenderedLabels = Record<LabelPart, boolean>;

const RegisterLabelContext = createContext<((part: LabelPart, rendered: boolean) => void) | null>(
  null,
);

function useRegisterLabel(part: LabelPart) {
  const register = useContext(RegisterLabelContext);
  useLayoutEffect(() => {
    register?.(part, true);
    return () => register?.(part, false);
  }, [register, part]);
}

function Title(props: ComponentProps<typeof StyledTitle>) {
  useRegisterLabel("title");
  return <StyledTitle {...props} />;
}

function Description(props: ComponentProps<typeof StyledDescription>) {
  useRegisterLabel("description");
  return <StyledDescription {...props} />;
}

export interface PopoverContentProps extends ComponentProps<typeof Content>, PortalledProps {}

const SheetCapableContent = createSheetCapableContent(Positioner, Content, usePopoverContext);

// zag checks for a title and description once, before lazily mounted content renders them.
function PopoverContent(props: WithRef<PopoverContentProps>) {
  const api = usePopoverContext();
  const [rendered, setRendered] = useState<RenderedLabels>({ title: false, description: false });
  const register = useCallback((part: LabelPart, shown: boolean) => {
    setRendered((prev) => (prev[part] === shown ? prev : { ...prev, [part]: shown }));
  }, []);

  return (
    <RegisterLabelContext.Provider value={register}>
      <SheetCapableContent
        aria-labelledby={rendered.title ? api.getTitleProps().id : undefined}
        aria-describedby={rendered.description ? api.getDescriptionProps().id : undefined}
        {...props}
      />
    </RegisterLabelContext.Provider>
  );
}

export interface PopoverTriggerProps
  extends ComponentProps<typeof StyledTrigger>, WithTooltipProps {}

const PopoverTrigger = withTriggerTooltip(StyledTrigger, usePopoverContext);

export const Popover = {
  Root: PopoverRoot,
  Content: PopoverContent,
  Anchor,
  Arrow,
  CloseTrigger: createCloseTrigger(CloseTrigger),
  Indicator,
  Positioner,
  Title,
  Description,
  Footer,
  Header,
  Body,
  Trigger: PopoverTrigger,
  Context: PopoverContext,
};
