import type { CollectionItem } from "@ark-ui/react/collection";
import {
  Combobox as ArkCombobox,
  ComboboxContext,
  type UseComboboxProps,
  type UseComboboxReturn,
  useCombobox as useArkCombobox,
  useComboboxContext,
} from "@ark-ui/react/combobox";
import { ark } from "@ark-ui/react/factory";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import {
  type ComponentProps,
  type ElementType,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  createContext,
  useContext,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { Box, createSlotRecipeContext, splitCssProps } from "#styled-system/jsx";
import { type ComboboxVariantProps, combobox } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import {
  scrollIntoViewWithin,
  useHighlightIntoView,
  useHighlightSource,
} from "../../hooks/useHighlightIntoView";
import type { PortalledProps, WithRef } from "../../types";
import { lazyOverlayDefaults } from "../overlayDefaults";
import {
  bindSheetDismiss,
  type MobileLayoutProps,
  useOverlayMode,
  withMobileLayout,
  withMobileLayoutProvider,
} from "../overlayPresentation";
import { createPortalledContent } from "../portalledContent";
import type { StyledRootProps } from "../rootProps";
import { SheetOverlayContent } from "../sheetFrame";
import { clickHighlightedLinkOnEnter, moveCaretOnHomeEnd } from "./inputKeys";

const { withProvider, withContext } = createSlotRecipeContext(combobox);

type RootProps = StyledRootProps<ArkCombobox.RootBaseProps<CollectionItem>> & ComboboxVariantProps;

const StyledRoot = withProvider(ArkCombobox.Root, "root", {
  defaultProps: lazyOverlayDefaults,
}) as ArkCombobox.RootComponent<RootProps>;

type InputProps = ComponentProps<typeof Input>;

interface SheetInputHost {
  host: HTMLElement | null;
  setHost: (host: HTMLElement | null) => void;
}

const SheetInputHostContext = createContext<SheetInputHost | null>(null);

function SheetInputHostProvider({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);

  return (
    <SheetInputHostContext.Provider value={{ host, setHost }}>
      {children}
    </SheetInputHostContext.Provider>
  );
}

const SheetCapableRoot: ElementType = withMobileLayout<
  ArkCombobox.RootComponentProps<CollectionItem, RootProps> & MobileLayoutProps
>(StyledRoot);

export type ComboboxRootProps<T extends CollectionItem = CollectionItem> =
  ArkCombobox.RootComponentProps<T, RootProps> & MobileLayoutProps;

function Root<T extends CollectionItem>({ positioning, children, ...props }: ComboboxRootProps<T>) {
  return (
    <SheetCapableRoot
      positioning={{ sameWidth: false, ...positioning }}
      {...props}
    >
      <SheetInputHostProvider>{children}</SheetInputHostProvider>
    </SheetCapableRoot>
  );
}

/**
 * `useCombobox` for `Combobox.RootProvider`, sizing the content to its items like `Combobox.Root`;
 * its phone sheet applies the outside handlers given here.
 */
export function useCombobox<T extends CollectionItem>({
  positioning,
  ...props
}: UseComboboxProps<T>): UseComboboxReturn<T> {
  return bindSheetDismiss(
    useArkCombobox({ ...props, positioning: { sameWidth: false, ...positioning } }),
    props,
  );
}

export type { UseComboboxProps, UseComboboxReturn };

const StyledRootProvider = withProvider(ArkCombobox.RootProvider, "root", {
  defaultProps: lazyOverlayDefaults,
}) as ArkCombobox.RootProviderComponent<RootProps>;

type RootProviderProps<T extends CollectionItem> = ComponentProps<typeof StyledRootProvider<T>> &
  MobileLayoutProps;

const SheetCapableRootProvider: ElementType =
  withMobileLayoutProvider<RootProviderProps<CollectionItem>>(StyledRootProvider);

function RootProvider<T extends CollectionItem>({ children, ...props }: RootProviderProps<T>) {
  return (
    <SheetCapableRootProvider {...props}>
      <SheetInputHostProvider>{children}</SheetInputHostProvider>
    </SheetCapableRootProvider>
  );
}

const ClearTrigger = withContext(ArkCombobox.ClearTrigger, "clearTrigger", {
  defaultProps: { children: <XIcon />, "aria-label": "Clear selection" },
});
const StyledContent = withContext(ArkCombobox.Content, "content");
const Control = withContext(ArkCombobox.Control, "control");
const Empty = withContext(ArkCombobox.Empty, "empty");
const IndicatorGroup = withContext(ark.div, "indicatorGroup");
const Input = withContext(ArkCombobox.Input, "input");
const ProxyTrigger = withContext(ArkCombobox.Trigger, "input");
const Item = withContext(ArkCombobox.Item, "item");
const ItemGroup = withContext(ArkCombobox.ItemGroup, "itemGroup");
const ItemGroupLabel = withContext(ArkCombobox.ItemGroupLabel, "itemGroupLabel");
const ItemText = withContext(ArkCombobox.ItemText, "itemText");
const Label = withContext(ArkCombobox.Label, "label");
// zag names the list without giving it a role in composite mode, which ARIA forbids; null drops it.
const List = withContext(ArkCombobox.List, "list", {
  defaultProps: { "aria-labelledby": null } as Record<string, unknown>,
});
const Positioner = withContext(ArkCombobox.Positioner, "positioner");
const StyledTrigger = withContext(ArkCombobox.Trigger, "trigger", {
  defaultProps: { children: <ChevronsUpDownIcon /> },
});

// The field's proxy is the trigger in a phone sheet; a second trigger would duplicate its id.
function Trigger(props: ComponentProps<typeof StyledTrigger>) {
  if (useOverlayMode() === "sheet") return null;
  return <StyledTrigger {...props} />;
}

const isFieldAttribute = (key: string) => key.startsWith("aria-") || key.startsWith("data-");

function SheetInputProxy(props: InputProps) {
  const api = useComboboxContext();
  const proxyRef = useRef<HTMLButtonElement>(null);
  const keyboardHolderRef = useRef<HTMLInputElement>(null);
  const machineInput = api.getInputProps();
  const [styleProps, { className, ...inputProps }] = splitCssProps(props);
  const fieldAttributes = Object.fromEntries(
    Object.entries(inputProps).filter(([key]) => isFieldAttribute(key)),
  );
  const { placeholder } = props;
  const name = props.name ?? machineInput.name;
  const form = props.form ?? machineInput.form;
  const disabled = props.disabled ?? machineInput.disabled;
  const readOnly = props.readOnly ?? machineInput.readOnly;
  const required = props.required ?? machineInput.required;
  const { id: labelId } = api.getLabelProps();
  const { id: proxyId } = api.getTriggerProps();
  const valueId = `${proxyId}-value`;
  // A self-reference names the button by its own aria-label, followed by the value.
  const labelledBy = props["aria-labelledby"] ?? (props["aria-label"] == null ? labelId : proxyId);

  return (
    <>
      <ProxyTrigger
        ref={proxyRef}
        focusable
        disabled={disabled}
        textAlign="start"
        {...styleProps}
        className={className}
        {...fieldAttributes}
        aria-labelledby={`${labelledBy} ${valueId}`}
        color={api.inputValue ? styleProps.color : "fg.subtle"}
        onClick={() => {
          // iOS only raises the keyboard for focus inside a tap; it stays up for the sheet's input.
          if (!readOnly) keyboardHolderRef.current?.focus({ preventScroll: true });
        }}
      >
        <span id={valueId}>{api.inputValue || placeholder}</span>
      </ProxyTrigger>
      <input
        ref={keyboardHolderRef}
        aria-hidden
        tabIndex={-1}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 1,
          height: 0,
          opacity: 0,
          fontSize: 16,
        }}
      />
      {(name != null || required) && (
        // Submits and validates like the desktop input; a hidden-type input can't be required.
        <input
          aria-hidden
          tabIndex={-1}
          name={name}
          form={form}
          disabled={disabled}
          required={required && !readOnly}
          value={api.inputValue}
          onChange={() => {}}
          onFocus={() => proxyRef.current?.focus()}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );
}

function ComboboxInput({ ref, onKeyDown, ...props }: WithRef<InputProps, HTMLInputElement>) {
  const sheetInput = useContext(SheetInputHostContext);
  const [, inputProps] = splitCssProps(props);
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    clickHighlightedLinkOnEnter(event);
    moveCaretOnHomeEnd(event);
  };

  if (useOverlayMode() !== "sheet" || sheetInput == null) {
    return (
      <Input
        ref={ref}
        {...props}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <>
      <SheetInputProxy {...props} />
      {sheetInput.host != null &&
        createPortal(
          <Input
            ref={ref}
            {...inputProps}
            name={undefined}
            form={undefined}
            onKeyDown={handleKeyDown}
          />,
          sheetInput.host,
        )}
    </>
  );
}

const StyledItemIndicator = withContext(ArkCombobox.ItemIndicator, "itemIndicator");

function ItemIndicator({ ref, ...props }: WithRef<ComponentProps<typeof StyledItemIndicator>>) {
  return (
    <StyledItemIndicator
      ref={ref}
      hidden={false}
      {...props}
    >
      <CheckIcon />
    </StyledItemIndicator>
  );
}

const AnchoredContent = createPortalledContent(Positioner, StyledContent);

function SheetContent({
  ref,
  onPointerDownCapture,
  onPointerMoveCapture,
  ...rest
}: WithRef<ComponentProps<typeof StyledContent> & PortalledProps>) {
  const api = useComboboxContext();
  const sheetInput = useContext(SheetInputHostContext);
  const contentRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(contentRef, ref);
  const { pointerRef, handlers: highlightSource } = useHighlightSource();
  useHighlightIntoView(api.highlightedValue, pointerRef, () => {
    const content = contentRef.current;
    scrollIntoViewWithin(content, content?.querySelector('[data-part="item"][data-highlighted]'));
  });

  return (
    <SheetOverlayContent
      {...rest}
      api={api}
      Content={StyledContent}
      ref={composedRef}
      fullHeight
      header={
        <Box
          ref={sheetInput?.setHost}
          px="4"
          pb="2"
          onKeyDownCapture={highlightSource.onKeyDownCapture}
        />
      }
      onPointerDownCapture={(event: PointerEvent<HTMLDivElement>) => {
        highlightSource.onPointerDownCapture();
        onPointerDownCapture?.(event);
      }}
      onPointerMoveCapture={(event: PointerEvent<HTMLDivElement>) => {
        highlightSource.onPointerMoveCapture();
        onPointerMoveCapture?.(event);
      }}
    />
  );
}

function Content(props: WithRef<ComponentProps<typeof StyledContent> & PortalledProps>) {
  if (useOverlayMode() === "sheet") return <SheetContent {...props} />;
  return <AnchoredContent {...props} />;
}

export interface ComboboxContentProps
  extends ComponentProps<typeof StyledContent>, PortalledProps {}

export const Combobox = {
  Root,
  RootProvider,
  ClearTrigger,
  Content,
  Control,
  Empty,
  IndicatorGroup,
  Input: ComboboxInput,
  Item,
  ItemGroup,
  ItemGroupLabel,
  ItemIndicator,
  ItemText,
  Label,
  List,
  Positioner,
  Trigger,
  Context: ComboboxContext,
};
