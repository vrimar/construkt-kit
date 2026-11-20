import { StarIcon } from "lucide-react";
import {
  type ComponentProps,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type RefObject,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cx } from "#styled-system/css";
import { type HTMLStyledProps, createSlotRecipeContext } from "#styled-system/jsx";
import { ratingGroup } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useControllableState } from "../../hooks/useControllableState";
import { useLatestRef } from "../../hooks/useLatestRef";
import { type ChangeDetails, createChangeDetails } from "../../primitives/change";
import {
  dispatchInputValueEvent,
  useFieldControlState,
  useFormControl,
} from "../../primitives/field";
import { useLocale } from "../../primitives/locale";
import { dataAttr, renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import type { WithRef } from "../../types";

export type RatingGroupChangeReason =
  | "item-press"
  | "keyboard"
  | "pointer-move"
  | "pointer-leave"
  | "blur"
  | "form-reset"
  | "none";

/** Why a callback was called, and a way to keep the rating as it is. */
export type RatingGroupChangeDetails = ChangeDetails<RatingGroupChangeReason>;

export interface RatingGroupTranslations {
  /** An item's `aria-label`. @default (index) => `${index} stars` */
  ratingValueText: (index: number) => string;
}

export interface RatingGroupOwnProps {
  /** The rating; `-1` for none. */
  value?: number | undefined;
  /** @default -1 */
  defaultValue?: number | undefined;
  onValueChange?: ((value: number, details: RatingGroupChangeDetails) => void) | undefined;
  /** Called with the rating under the pointer, or `-1` once it leaves. */
  onHoverChange?: ((hoveredValue: number, details: RatingGroupChangeDetails) => void) | undefined;
  /** @default 5 */
  count?: number | undefined;
  /** Lets the pointer and arrow keys pick half ratings. */
  allowHalf?: boolean | undefined;
  /** Focuses the checked item, or the first, as the group mounts. */
  autoFocus?: boolean | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
  /** @default "rating" */
  name?: string | undefined;
  form?: string | undefined;
  translations?: Partial<RatingGroupTranslations> | undefined;
}

type Mode = "idle" | "hover" | "focus";

interface ItemState {
  highlighted: boolean;
  half: boolean;
  checked: boolean;
}

interface RatingGroupContextValue {
  value: number;
  hoveredValue: number;
  count: number;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  interactive: boolean;
  name: string;
  form: string | undefined;
  ids: { label: string; control: string; hiddenInput: string; item: (index: number) => string };
  labelledBy: string | undefined;
  describedBy: string | undefined;
  translations: RatingGroupTranslations;
  controlRef: RefObject<HTMLDivElement | null>;
  hiddenInputRef: RefObject<HTMLInputElement | null>;
  setLabelRendered: (rendered: boolean) => void;
  getItemState: (index: number) => ItemState;
  focusItem: (value: number) => void;
  onControlPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onControlPointerLeave: (event: PointerEvent<HTMLElement>) => void;
  onItemPointerMove: (index: number, event: PointerEvent<HTMLElement>) => void;
  onItemFocus: () => void;
  onItemBlur: (event: FocusEvent<HTMLElement>) => void;
  onItemClick: (index: number, event: MouseEvent<HTMLElement>) => void;
  onItemKeyDown: (index: number, event: KeyboardEvent<HTMLElement>) => void;
}

const RatingGroupContext = createContext<RatingGroupContextValue | null>(null);

function useRatingGroup(part: string): RatingGroupContextValue {
  const context = useContext(RatingGroupContext);
  if (!context) throw new Error(`RatingGroup.${part} must be placed inside <RatingGroup.Root>.`);
  return context;
}

const ItemStateContext = createContext<ItemState | null>(null);

const radioSelector = (value: number) => `[role=radio][aria-posinset='${Math.ceil(value)}']`;

type RootImplProps = Omit<ComponentProps<typeof renderable.div>, keyof RatingGroupOwnProps> &
  RatingGroupOwnProps;

function RootImpl({
  ref,
  id: idProp,
  value: valueProp,
  defaultValue = -1,
  onValueChange,
  onHoverChange,
  count = 5,
  allowHalf = false,
  autoFocus = false,
  disabled: disabledProp,
  readOnly: readOnlyProp,
  required: requiredProp,
  name = "rating",
  form,
  translations,
  ...props
}: RootImplProps) {
  const uid = useId();
  const id = idProp ?? uid;
  const field = useFieldControlState({
    disabled: disabledProp,
    readOnly: readOnlyProp,
    required: requiredProp,
  });
  const rtl = useLocale().dir === "rtl";
  const rootRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(rootRef, ref);
  const controlRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const focusFrame = useRef(0);
  const [initialValue] = useState(valueProp ?? defaultValue);
  const [value, setValueState] = useControllableState({ value: valueProp, defaultValue });
  const [hoveredValue, setHoveredState] = useState(-1);
  const [mode, setMode] = useState<Mode>("idle");
  const [labelRendered, setLabelRendered] = useState(false);

  const setValue = (next: number, reason: RatingGroupChangeReason, event?: Event) => {
    if (next === value) return;
    const details = createChangeDetails(reason, event);
    onValueChange?.(next, details);
    if (!details.canceled) setValueState(next);
  };

  const setHovered = (next: number, reason: RatingGroupChangeReason, event?: Event) => {
    if (next === hoveredValue) return;
    const details = createChangeDetails(reason, event);
    onHoverChange?.(next, details);
    if (!details.canceled) setHoveredState(next);
  };

  const { fieldsetDisabled } = useFormControl(
    rootRef,
    () => setValue(initialValue, "form-reset"),
    () => hiddenInputRef.current,
  );
  const disabled = field.disabled || fieldsetDisabled;
  const readOnly = field.readOnly;
  const interactive = !(disabled || readOnly);

  const focusItem = (target: number) => {
    cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(() =>
      controlRef.current?.querySelector<HTMLElement>(radioSelector(target))?.focus(),
    );
  };

  useEffect(() => () => cancelAnimationFrame(focusFrame.current), []);

  const latest = useLatestRef({ value, allowHalf, setValue });
  const previousAllowHalf = useRef(allowHalf);
  useEffect(() => {
    if (previousAllowHalf.current === allowHalf) return;
    previousAllowHalf.current = allowHalf;
    if (!allowHalf) latest.current.setValue(Math.round(latest.current.value), "none");
  }, [allowHalf, latest]);

  const syncedValue = useRef(value);
  useEffect(() => {
    if (syncedValue.current === value) return;
    syncedValue.current = value;
    dispatchInputValueEvent(hiddenInputRef.current, String(value));
  }, [value]);

  const [focusOnMount] = useState(autoFocus);
  useLayoutEffect(() => {
    if (!focusOnMount) return;
    const control = controlRef.current;
    const item =
      control?.querySelector<HTMLElement>("[role=radio][tabindex='0']") ??
      control?.querySelector<HTMLElement>("[role=radio]");
    item?.focus();
  }, [focusOnMount]);

  const pick = (index: number, reason: RatingGroupChangeReason, event: Event) => {
    const next = hoveredValue === -1 ? index : hoveredValue;
    setValue(next, reason, event);
    focusItem(next);
  };

  const step = (next: number, event: Event) => {
    setValue(next, "keyboard", event);
    focusItem(next);
  };

  const context: RatingGroupContextValue = {
    value,
    hoveredValue,
    count,
    disabled,
    readOnly,
    required: field.required,
    interactive,
    name,
    form,
    ids: {
      label: `rating:${id}:label`,
      control: `rating:${id}:control`,
      hiddenInput: field.id ?? `rating:${id}:input`,
      item: (index) => `rating:${id}:item:${index}`,
    },
    labelledBy: field.labelId ?? (labelRendered ? `rating:${id}:label` : undefined),
    describedBy: field.describedBy,
    translations: { ratingValueText: (index) => `${index} stars`, ...translations },
    controlRef,
    hiddenInputRef,
    setLabelRendered,
    getItemState(index) {
      const current = hoveredValue > -1 ? hoveredValue : value;
      const equal = Math.ceil(current) === index;
      return {
        highlighted: index <= current || equal,
        half: equal && Math.abs(current - index) === 0.5,
        checked: equal || (value <= 0 && index === 1),
      };
    },
    focusItem,
    onControlPointerMove(event) {
      if (!interactive || event.pointerType === "touch") return;
      setMode((current) => (current === "idle" ? "hover" : current));
    },
    onControlPointerLeave(event) {
      if (!interactive || event.pointerType === "touch") return;
      const focused = controlRef.current?.contains(document.activeElement) ?? false;
      setMode((current) => (current === "hover" ? (focused ? "focus" : "idle") : current));
      setHovered(-1, "pointer-leave", event.nativeEvent);
    },
    onItemPointerMove(index, event) {
      if (!interactive || mode === "idle") return;
      const rect = event.currentTarget.getBoundingClientRect();
      const x = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
      const midway = (rtl ? 1 - x : x) < 0.5;
      setHovered(index - (allowHalf && midway ? 0.5 : 0), "pointer-move", event.nativeEvent);
    },
    onItemFocus() {
      if (interactive) setMode((current) => (current === "idle" ? "focus" : current));
    },
    onItemBlur(event) {
      if (!interactive || mode === "hover") return;
      setMode((current) => (current === "focus" ? "idle" : current));
      setHovered(-1, "blur", event.nativeEvent);
    },
    onItemClick(index, event) {
      if (interactive) pick(index, "item-press", event.nativeEvent);
    },
    onItemKeyDown(index, event) {
      if (event.defaultPrevented || !interactive) return;
      const factor = allowHalf ? 0.5 : 1;
      const key =
        rtl && event.key === "ArrowLeft"
          ? "ArrowRight"
          : rtl && event.key === "ArrowRight"
            ? "ArrowLeft"
            : event.key;
      const native = event.nativeEvent;
      if (key === "ArrowLeft" || key === "ArrowUp") step(Math.max(0, value - factor), native);
      else if (key === "ArrowRight" || key === "ArrowDown")
        step(Math.min(count, (value === -1 ? 0 : value) + factor), native);
      else if (key === "Home") step(1, native);
      else if (key === "End") step(count, native);
      else if (key === " ") {
        if (value <= 0) setValue(hoveredValue === -1 ? index : hoveredValue, "keyboard", native);
      } else return;
      event.preventDefault();
    },
  };

  return (
    <RatingGroupContext value={context}>
      <renderable.div
        id={`rating:${id}`}
        {...props}
        ref={composedRef}
      />
    </RatingGroupContext>
  );
}

const { withProvider, withContext } = createSlotRecipeContext(ratingGroup);

const Root = withProvider(RootImpl, "root");
const StyledControl = withContext(renderable.div, "control");
const StyledItem = withContext(renderable.span, "item");
const StyledLabel = withContext(renderable.label, "label");
const StyledItemIndicator = withContext(renderable.span, "itemIndicator");

export type RatingGroupRootProps = ComponentProps<typeof Root>;

type LabelProps = ComponentProps<typeof StyledLabel>;

function Label(props: LabelProps) {
  const context = useRatingGroup("Label");
  const { setLabelRendered } = context;

  useLayoutEffect(() => {
    setLabelRendered(true);
    return () => setLabelRendered(false);
  }, [setLabelRendered]);

  return (
    <StyledLabel
      {...mergeProps<LabelProps>(
        {
          id: context.ids.label,
          htmlFor: context.ids.hiddenInput,
          "data-disabled": dataAttr(context.disabled),
          "data-required": dataAttr(context.required),
          onClick(event: MouseEvent<HTMLLabelElement>) {
            if (event.defaultPrevented || !context.interactive) return;
            event.preventDefault();
            context.controlRef.current
              ?.querySelector<HTMLElement>(radioSelector(Math.max(1, context.value)))
              ?.focus({ preventScroll: true });
          },
        } as LabelProps,
        props,
      )}
    />
  );
}

type ItemProps = ComponentProps<typeof StyledItem> & {
  /** The item's rating, from 1. */
  index: number;
};

function Item({ index, ...props }: ItemProps) {
  const context = useRatingGroup("Item");
  const state = context.getItemState(index);
  const checked = Math.ceil(context.value) === index;
  const { readOnly, disabled, interactive } = context;
  const tabIndex = readOnly
    ? state.checked
      ? 0
      : undefined
    : disabled
      ? undefined
      : state.checked
        ? 0
        : -1;

  return (
    <ItemStateContext value={state}>
      <StyledItem
        {...mergeProps<ComponentProps<typeof StyledItem>>(
          {
            id: context.ids.item(index),
            role: "radio",
            tabIndex,
            "aria-roledescription": "rating",
            "aria-label": context.translations.ratingValueText(checked ? context.value : index),
            "aria-disabled": disabled || undefined,
            "aria-setsize": context.count,
            "aria-checked": checked,
            "aria-posinset": index,
            "aria-describedby": context.describedBy,
            "data-disabled": dataAttr(disabled),
            "data-read-only": dataAttr(readOnly),
            "data-checked": dataAttr(state.checked),
            "data-highlighted": dataAttr(state.highlighted),
            "data-half": dataAttr(state.half),
            onPointerDown(event: PointerEvent<HTMLElement>) {
              if (interactive && event.button === 0) event.preventDefault();
            },
            onPointerMove(event: PointerEvent<HTMLElement>) {
              context.onItemPointerMove(index, event);
            },
            onKeyDown(event: KeyboardEvent<HTMLElement>) {
              context.onItemKeyDown(index, event);
            },
            onClick(event: MouseEvent<HTMLElement>) {
              context.onItemClick(index, event);
            },
            onFocus: context.onItemFocus,
            onBlur: context.onItemBlur,
          } as ComponentProps<typeof StyledItem>,
          props,
        )}
      />
    </ItemStateContext>
  );
}

function IndicatorIcon({ icon, className, ...props }: { icon: ReactElement; className?: string }) {
  const own = icon.props as { className?: string };
  return cloneElement(icon, {
    ...props,
    className: cx(own.className, className),
    "aria-hidden": true,
    fill: "currentColor",
  } as object);
}

const ItemIndicatorBg = withContext(IndicatorIcon, "itemIndicatorBg");
const ItemIndicatorFg = withContext(IndicatorIcon, "itemIndicatorFg");

interface ItemIndicatorProps extends HTMLStyledProps<"span"> {
  icon?: ReactElement | undefined;
}

/** The item's icon twice: a background copy, and a copy filled up to the rating. */
function ItemIndicator({
  ref,
  icon = <StarIcon />,
  ...rest
}: WithRef<ItemIndicatorProps, HTMLSpanElement>) {
  const item = useContext(ItemStateContext);
  if (!item) throw new Error("RatingGroup.ItemIndicator must be placed inside RatingGroup.Item.");
  const attributes = {
    "data-highlighted": dataAttr(item.highlighted),
    "data-checked": dataAttr(item.checked),
    "data-half": dataAttr(item.half),
  };

  return (
    <StyledItemIndicator
      ref={ref}
      {...rest}
      {...attributes}
    >
      {isValidElement(icon) && (
        <>
          <ItemIndicatorBg icon={icon} />
          <ItemIndicatorFg
            icon={icon}
            {...attributes}
          />
        </>
      )}
    </StyledItemIndicator>
  );
}

interface ItemsProps extends Omit<ItemProps, "index"> {
  icon?: ReactElement | undefined;
}

function Items({ icon, ...rest }: ItemsProps) {
  const { count } = useRatingGroup("Items");

  return Array.from({ length: count }, (_, offset) => offset + 1).map((index) => (
    <Item
      key={index}
      index={index}
      {...rest}
    >
      <ItemIndicator icon={icon} />
    </Item>
  ));
}

type ControlProps = ComponentProps<typeof StyledControl>;

function Control({ ref, children = <Items />, ...props }: ControlProps) {
  const context = useRatingGroup("Control");
  const composedRef = useComposedRefs(context.controlRef, ref);

  return (
    <StyledControl
      {...mergeProps<ControlProps>(
        {
          id: context.ids.control,
          role: "radiogroup",
          "aria-orientation": "horizontal",
          "aria-labelledby": context.labelledBy,
          "aria-readonly": context.readOnly || undefined,
          "aria-describedby": context.describedBy,
          "data-read-only": dataAttr(context.readOnly),
          "data-disabled": dataAttr(context.disabled),
          onPointerMove: context.onControlPointerMove,
          onPointerLeave: context.onControlPointerLeave,
        } as ControlProps,
        props,
      )}
      ref={composedRef}
    >
      {children}
    </StyledControl>
  );
}

type HiddenInputProps = ComponentProps<typeof renderable.input>;

function HiddenInput({ ref, ...props }: HiddenInputProps) {
  const context = useRatingGroup("HiddenInput");
  const composedRef = useComposedRefs(context.hiddenInputRef, ref);

  return (
    <renderable.input
      {...mergeProps<HiddenInputProps>(
        {
          id: context.ids.hiddenInput,
          type: "text",
          hidden: true,
          name: context.name,
          form: context.form,
          disabled: context.disabled,
          readOnly: context.readOnly,
          required: context.required,
          defaultValue: context.value,
          "aria-describedby": context.describedBy,
        },
        props,
      )}
      ref={composedRef}
    />
  );
}

export const RatingGroup = {
  Root,
  Control,
  Item,
  ItemIndicator,
  Items,
  Label,
  HiddenInput,
};
