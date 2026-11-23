import { type ComponentProps, useId } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { collapsible } from "#styled-system/recipes";

import { useControllableState } from "../../hooks/useControllableState";
import { emitChange } from "../../primitives/change";
import { PresenceActivity } from "../../primitives/presence";
import { mergeProps, renderable } from "../../primitives/render";
import {
  type CollapsibleChangeDetails,
  CollapsibleProvider,
  collapsibleIndicatorProps,
  collapsibleStateAttributes,
  useCollapsible,
  useCollapsibleContent,
  useCollapsibleTriggerProps,
  useCollapsibleContext,
} from "../collapsiblePanel";

export type { CollapsibleChangeDetails as CollapsibleOpenChangeDetails };

const { withProvider, withContext } = createSlotRecipeContext(collapsible);

const StyledRoot = withProvider(renderable.div, "root");
const StyledTrigger = withContext(renderable.button, "trigger");
const StyledContent = withContext(renderable.div, "content");
const StyledIndicator = withContext(renderable.div, "indicator");

type StyledRootProps = ComponentProps<typeof StyledRoot>;

export interface CollapsibleRootProps extends StyledRootProps {
  open?: boolean | undefined;
  /** @default false */
  defaultOpen?: boolean | undefined;
  /** Called when the trigger asks to open or close; `details.cancel()` keeps it as it is. */
  onOpenChange?: ((open: boolean, details: CollapsibleChangeDetails) => void) | undefined;
  disabled?: boolean | undefined;
}

function Root({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  ...props
}: CollapsibleRootProps) {
  const id = useId();
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen });
  const state = useCollapsible({
    open,
    disabled,
    contentId: `collapsible:${id}:content`,
    triggerId: `collapsible:${id}:trigger`,
    onToggle(event) {
      if (emitChange(onOpenChange, !open, "trigger-press", event)) setOpen(!open);
    },
  });

  return (
    <CollapsibleProvider value={state}>
      <StyledRoot
        {...mergeProps<StyledRootProps>(collapsibleStateAttributes(open, disabled), props)}
      />
    </CollapsibleProvider>
  );
}

type TriggerProps = ComponentProps<typeof StyledTrigger>;

function Trigger(props: TriggerProps) {
  const state = useCollapsibleContext("Collapsible.Trigger");

  return (
    <StyledTrigger {...mergeProps<TriggerProps>(useCollapsibleTriggerProps(state, props), props)} />
  );
}

export interface CollapsibleContentProps extends ComponentProps<typeof StyledContent> {
  /** Keeps the content in the DOM, hidden, while closed, along with its state. */
  keepMounted?: boolean | undefined;
}

function Content({ ref, keepMounted = false, ...props }: CollapsibleContentProps) {
  const state = useCollapsibleContext("Collapsible.Content");
  const content = useCollapsibleContent(state, ref, props.id);

  return (
    <PresenceActivity
      mounted={state.visible}
      keepMounted={keepMounted}
    >
      <StyledContent {...mergeProps<ComponentProps<typeof StyledContent>>(content, props)} />
    </PresenceActivity>
  );
}

function Indicator(props: ComponentProps<typeof StyledIndicator>) {
  const state = useCollapsibleContext("Collapsible.Indicator");
  return (
    <StyledIndicator
      {...mergeProps<ComponentProps<typeof StyledIndicator>>(
        collapsibleIndicatorProps(state),
        props,
      )}
    />
  );
}

/** Shows and hides its content from a trigger, animating its height. */
export const Collapsible = {
  Root,
  Content,
  Indicator,
  Trigger,
};
