import { ark } from "@ark-ui/react/factory";
import {
  Tooltip as ArkTooltip,
  TooltipContext,
  type UseTooltipReturn,
  useTooltip,
} from "@ark-ui/react/tooltip";
import {
  type ComponentProps,
  Fragment,
  type ReactElement,
  type ReactNode,
  type SyntheticEvent,
  createContext,
  isValidElement,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useReducer,
  useState,
  useSyncExternalStore,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { tooltip } from "#styled-system/recipes";

import type { PortalledProps, WithRef } from "../../types";
import { isRenderable } from "../itemSlots";
import { Kbd } from "../Kbd";
import { lazyOverlayDefaults } from "../overlayDefaults";
import { createPlacementRoot } from "../placementRoot";
import { createPortalledContent } from "../portalledContent";

const { withRootProvider, withContext } = createSlotRecipeContext(tooltip);

type RootProps = ComponentProps<typeof Root>;
const Root = withRootProvider(ArkTooltip.Root, { defaultProps: lazyOverlayDefaults });
const RootProvider = withRootProvider(ArkTooltip.RootProvider, {
  defaultProps: lazyOverlayDefaults,
});
const PlacedRoot = createPlacementRoot<RootProps & Pick<TooltipProps, "placement">>(Root, "top");
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
  extraKeys,
  children,
  ...props
}: ComponentProps<typeof ark.span> & { bare: boolean; extraKeys: readonly string[] }) {
  const own = isValidElement<Record<string, unknown>>(children) ? children.props : {};
  const target: Record<string, unknown> = { ...props };
  for (const key of bare ? TRIGGER_ATTRIBUTES : [...ALWAYS_STRIPPED, ...extraKeys]) {
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

interface TooltipBaseProps extends TooltipProps {
  stripTriggerAttributes?: readonly string[];
}

export function TooltipBase({
  ref,
  showArrow,
  children,
  portalled,
  label,
  portalRef,
  showWhenTruncated,
  shortcut,
  stripTriggerAttributes = [],
  ...rootProps
}: WithRef<TooltipBaseProps>) {
  const group = useContext(TooltipGroupContext);
  const bare = !isRenderable(label);
  const trigger =
    isValidElement(children) && children.type !== Fragment ? children : <span>{children}</span>;
  const target = showWhenTruncated ? <TruncationGate>{trigger}</TruncationGate> : trigger;

  const { disabled, placement, ...ownRootProps } = rootProps;
  const joinsGroup =
    group !== null &&
    ref === undefined &&
    portalRef === undefined &&
    portalled === undefined &&
    Object.keys(ownRootProps).length === 0;
  if (joinsGroup) {
    return (
      <GroupTrigger
        store={group}
        entry={bare ? null : { label, placement, shortcut, showArrow }}
        disabled={disabled ?? false}
        stripTriggerAttributes={stripTriggerAttributes}
      >
        {target}
      </GroupTrigger>
    );
  }

  return (
    <PlacedRoot
      openDelay={300}
      closeDelay={0}
      {...rootProps}
      disabled={bare || rootProps.disabled}
      open={bare ? false : rootProps.open}
    >
      <Trigger asChild>
        <TriggerTarget
          bare={bare}
          extraKeys={stripTriggerAttributes}
        >
          {target}
        </TriggerTarget>
      </Trigger>
      {!bare && (
        <TooltipContent
          ref={ref}
          portalled={portalled}
          portalRef={portalRef}
        >
          <TooltipBody
            label={label}
            showArrow={showArrow}
            shortcut={shortcut}
          />
        </TooltipContent>
      )}
    </PlacedRoot>
  );
}

const TooltipComponent: (props: WithRef<TooltipProps>) => ReactElement = TooltipBase;

function TooltipBody({
  label,
  showArrow,
  shortcut,
}: Pick<TooltipProps, "label" | "showArrow" | "shortcut">) {
  return (
    <>
      {showArrow && <Arrow />}
      {label}
      {isRenderable(shortcut) && (
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
    </>
  );
}

type Placement = TooltipProps["placement"];

interface GroupEntry extends Pick<TooltipProps, "label" | "showArrow" | "shortcut"> {
  placement: Placement;
}

const TRIGGER_EVENTS = [
  "onClick",
  "onFocus",
  "onBlur",
  "onPointerDown",
  "onPointerMove",
  "onPointerOver",
  "onPointerLeave",
  "onPointerCancel",
] as const;

class TooltipGroupStore {
  api: UseTooltipReturn | null = null;
  readonly entries = new Map<string, GroupEntry>();
  private onCurrentEntryChange = () => {};
  private readonly listeners = new Set<() => void>();

  connect(api: UseTooltipReturn, onCurrentEntryChange: () => void) {
    this.api = api;
    this.onCurrentEntryChange = onCurrentEntryChange;
    for (const listener of [...this.listeners]) listener();
  }

  readonly subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  stateOf(value: string): "unready" | "shown" | "hidden" {
    if (!this.api) return "unready";
    return this.api.open && this.api.triggerValue === value ? "shown" : "hidden";
  }

  register(value: string, entry: GroupEntry | null) {
    if (entry) this.entries.set(value, entry);
    else this.entries.delete(value);
    if (this.api?.triggerValue === value) this.onCurrentEntryChange();
    return () => {
      this.entries.delete(value);
    };
  }
}

const TooltipGroupContext = createContext<TooltipGroupStore | null>(null);

function GroupTrigger({
  store,
  entry,
  disabled,
  stripTriggerAttributes,
  children,
}: {
  store: TooltipGroupStore;
  entry: GroupEntry | null;
  disabled: boolean;
  stripTriggerAttributes: readonly string[];
  children: ReactNode;
}) {
  const value = useId();
  const shown =
    useSyncExternalStore(
      store.subscribe,
      () => store.stateOf(value),
      () => "unready",
    ) === "shown";
  const { label, placement, shortcut, showArrow } = entry ?? {};
  const active = entry !== null && !disabled;

  useLayoutEffect(
    () => store.register(value, active ? { label, placement, shortcut, showArrow } : null),
    [store, value, active, label, placement, shortcut, showArrow],
  );
  useLayoutEffect(() => {
    if (!active && shown) store.api?.setOpen(false);
  }, [store, active, shown]);

  // The shared machine's state moves on without re-rendering this trigger, so handlers read it when they run.
  const handlers = useMemo(
    () =>
      Object.fromEntries(
        TRIGGER_EVENTS.map((key) => [
          key,
          (event: unknown) =>
            (
              store.api?.getTriggerProps({ value })[key] as ((event: unknown) => void) | undefined
            )?.(event),
        ]),
      ),
    [store, value],
  );

  const attributes: Record<string, unknown> = { ...store.api?.getTriggerProps({ value }) };
  for (const key of TRIGGER_EVENTS) delete attributes[key];
  // zag describes every trigger while open, and only a trigger whose state changes re-renders.
  delete attributes["data-current"];
  if (!shown) delete attributes["aria-describedby"];

  return (
    <TriggerTarget
      bare={entry === null}
      extraKeys={stripTriggerAttributes}
      className={triggerClassName}
      data-slot="trigger"
      {...attributes}
      {...(active && handlers)}
    >
      {children}
    </TriggerTarget>
  );
}

const triggerClassName = tooltip().trigger;

export interface TooltipGroupProps extends PortalledProps {
  children: ReactNode;
  /** Where a tooltip in the group opens when it doesn't set `placement`. @default "top" */
  placement?: Placement;
}

/**
 * Runs one tooltip for every plain `Tooltip` inside it, so a long list doesn't mount a tooltip per
 * row. A `Tooltip` that sets root props (`open`, `positioning`, `onOpenChange`, …), `ref`,
 * `portalled` or `portalRef` keeps its own. A shared tooltip's label renders here, outside its row.
 */
export function TooltipGroup({
  children,
  placement = "top",
  portalled,
  portalRef,
}: TooltipGroupProps) {
  const [store] = useState(() => new TooltipGroupStore());
  const [triggerValue, setTriggerValue] = useState<string | null>(null);
  const [, refreshContent] = useReducer((count: number) => count + 1, 0);
  const entry = triggerValue === null ? undefined : store.entries.get(triggerValue);

  const api = useTooltip({
    openDelay: 300,
    closeDelay: 0,
    positioning: { placement: entry?.placement ?? placement },
    triggerValue,
    onTriggerValueChange: ({ value }) => setTriggerValue(value),
  });
  useLayoutEffect(() => store.connect(api, refreshContent), [store, api]);

  return (
    <TooltipGroupContext value={store}>
      {children}
      <RootProvider value={api}>
        {entry && (
          <TooltipContent
            portalled={portalled}
            portalRef={portalRef}
          >
            <TooltipBody
              label={entry.label}
              showArrow={entry.showArrow}
              shortcut={entry.shortcut}
            />
          </TooltipContent>
        )}
      </RootProvider>
    </TooltipGroupContext>
  );
}

export const Tooltip = Object.assign(TooltipComponent, {
  Root,
  Arrow,
  ArrowTip,
  Content: TooltipContent,
  Positioner,
  Trigger,
  Context: TooltipContext,
});
