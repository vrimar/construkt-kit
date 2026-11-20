import {
  type ComponentProps,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { toggleGroup } from "#styled-system/recipes";

import { isSafari } from "../../foundations/dom";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useControllableState } from "../../hooks/useControllableState";
import { type ChangeDetails, createChangeDetails } from "../../primitives/change";
import {
  CompositeList,
  elementList,
  getArrowStep,
  getFirstEnabledIndex,
  getLastEnabledIndex,
  getNextIndex,
  isItemDisabled,
  useCompositeListItem,
} from "../../primitives/composite";
import { useLocale } from "../../primitives/locale";
import { dataAttr, renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import { useToolbarContext } from "../Toolbar/toolbarContext";

const { withProvider, withContext } = createSlotRecipeContext(toggleGroup);

const StyledRoot = withProvider(renderable.div, "root");
const StyledItem = withContext(renderable.button, "item");

export type ToggleGroupValueChangeReason = "item-press";

/** Why `onValueChange` was called, and a way to keep the pressed items as they are. */
export type ToggleGroupValueChangeDetails = ChangeDetails<ToggleGroupValueChangeReason>;

export type ToggleGroupOrientation = "horizontal" | "vertical";

export interface ToggleGroupRootOptions {
  /** The pressed items' values. */
  value?: string[] | undefined;
  /** @default [] */
  defaultValue?: string[] | undefined;
  onValueChange?: ((value: string[], details: ToggleGroupValueChangeDetails) => void) | undefined;
  /** Whether more than one item can be pressed; otherwise the group is a radio group. @default false */
  multiple?: boolean | undefined;
  /** Whether pressing the only pressed item releases it. @default true */
  deselectable?: boolean | undefined;
  disabled?: boolean | undefined;
  /** @default "horizontal" */
  orientation?: ToggleGroupOrientation | undefined;
  /** Whether arrow keys wrap from the last item to the first and back. @default true */
  loopFocus?: boolean | undefined;
  /** Whether arrow keys move focus between the items, which then share one tab stop. @default true */
  rovingFocus?: boolean | undefined;
}

interface ToggleGroupContextValue {
  value: string[];
  toggle: (value: string, event: Event) => void;
  multiple: boolean;
  disabled: boolean;
  orientation: ToggleGroupOrientation;
  loopFocus: boolean;
  rovingFocus: boolean;
  rtl: boolean;
  items: CompositeList;
  rootRef: RefObject<HTMLDivElement | null>;
  syncTabStop: (value?: string | null) => void;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

function useToggleGroup(part: string): ToggleGroupContextValue {
  const context = useContext(ToggleGroupContext);
  if (!context) throw new Error(`ToggleGroup.${part} must be placed inside <ToggleGroup.Root>.`);
  return context;
}

type StyledRootProps = ComponentProps<typeof StyledRoot>;

export interface ToggleGroupRootProps
  extends Omit<StyledRootProps, keyof ToggleGroupRootOptions>, ToggleGroupRootOptions {}

const EMPTY: string[] = [];

/** Inside a `Toolbar`, its items join the toolbar's arrow keys and single tab stop. */
function Root({
  ref,
  value: valueProp,
  defaultValue = EMPTY,
  onValueChange,
  multiple = false,
  deselectable = true,
  disabled = false,
  orientation = "horizontal",
  loopFocus = true,
  rovingFocus = true,
  ...props
}: ToggleGroupRootProps) {
  const rtl = useLocale().dir === "rtl";
  const rootRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(rootRef, ref);
  const [items] = useState(() => new CompositeList());
  const focusedValue = useRef<string | null>(null);
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue });
  const toolbar = useToolbarContext();
  const roving = rovingFocus && toolbar === null;

  const syncTabStop = (next?: string | null) => {
    if (next !== undefined) focusedValue.current = next;
    if (!roving) return;
    const entries = items.items();
    const enabled = entries.filter((item) => !isItemDisabled(item.element));
    const stop = enabled.find((item) => item.value === focusedValue.current) ?? enabled[0];
    for (const item of entries) {
      item.element.setAttribute("tabindex", item === stop ? "0" : "-1");
    }
  };

  useLayoutEffect(syncTabStop);

  const context: ToggleGroupContextValue = {
    value,
    toggle(item, event) {
      const pressed = value.includes(item);
      let next: string[];
      if (multiple) next = pressed ? value.filter((entry) => entry !== item) : [...value, item];
      else if (pressed && value.length === 1) next = deselectable ? [] : value;
      else next = [item];
      if (next === value) return;
      const details = createChangeDetails("item-press" as const, event);
      onValueChange?.(next, details);
      if (!details.canceled) setValue(next);
    },
    multiple,
    disabled,
    orientation,
    loopFocus,
    rovingFocus,
    rtl,
    items,
    rootRef,
    syncTabStop,
  };

  return (
    <ToggleGroupContext.Provider value={context}>
      <StyledRoot
        role={multiple ? "group" : "radiogroup"}
        data-disabled={dataAttr(disabled)}
        data-orientation={orientation}
        {...props}
        ref={composedRef}
      />
    </ToggleGroupContext.Provider>
  );
}

type StyledItemProps = ComponentProps<typeof StyledItem>;

export interface ToggleGroupItemProps extends Omit<StyledItemProps, "value"> {
  /** The value the item adds to the group's `value` while it is pressed. */
  value: string;
  disabled?: boolean | undefined;
}

function Item({ ref, value, disabled: disabledProp, ...props }: ToggleGroupItemProps) {
  const group = useToggleGroup("Item");
  const toolbar = useToolbarContext();
  const pressed = group.value.includes(value);
  const disabled = !!disabledProp || group.disabled;
  const roving = group.rovingFocus && toolbar === null;
  const register = useCompositeListItem(group.items, value);
  const composedRef = useComposedRefs<HTMLButtonElement>(register, ref);
  const { syncTabStop } = group;

  useLayoutEffect(() => syncTabStop(), [disabled, syncTabStop]);

  return (
    <StyledItem
      {...mergeProps<StyledItemProps>(
        {
          type: "button",
          disabled,
          tabIndex: toolbar ? 0 : undefined,
          role: group.multiple ? undefined : "radio",
          "aria-checked": group.multiple ? undefined : pressed,
          "aria-pressed": group.multiple ? pressed : undefined,
          "data-pressed": dataAttr(pressed),
          "data-disabled": dataAttr(disabled),
          "data-orientation": group.orientation,
          onFocus() {
            if (!disabled) syncTabStop(value);
          },
          onBlur(event: FocusEvent<HTMLButtonElement>) {
            if (!group.rootRef.current?.contains(event.relatedTarget)) {
              syncTabStop(null);
            }
          },
          onClick(event: MouseEvent<HTMLButtonElement>) {
            if (disabled) return;
            group.toggle(value, event.nativeEvent);
            if (isSafari()) event.currentTarget.focus({ preventScroll: true });
          },
          onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
            if (event.defaultPrevented || !roving || disabled) return;
            const items = group.items.items();
            const current = items.findIndex((item) => item.element === event.currentTarget);
            const list = elementList(items.map((item) => item.element));
            const step = getArrowStep(event.key, group.orientation, group.rtl);
            let next: number;
            if (step !== 0) {
              next = getNextIndex(list, current, { decrement: step < 0, loop: group.loopFocus });
            } else if (event.key === "Home") {
              next = getFirstEnabledIndex(list);
            } else if (event.key === "End") {
              next = getLastEnabledIndex(list);
            } else {
              return;
            }
            event.preventDefault();
            items[next]?.element.focus({ preventScroll: true });
          },
        } as StyledItemProps,
        props,
      )}
      ref={composedRef}
    />
  );
}

/**
 * Buttons that each turn something on or off, such as formatting or filters. To pick exactly one value, use
 * `SegmentGroup`.
 */
export const ToggleGroup = {
  Root,
  Item,
};
