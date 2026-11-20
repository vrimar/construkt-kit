import {
  type ComponentProps,
  type ElementType,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  createContext,
  useCallback,
  useContext,
  useId,
  useState,
} from "react";

import { isSafari } from "../foundations/dom";
import { useComposedRefs } from "../hooks/useComposedRefs";
import { closeFocusIntent, dismissFocusIntent } from "../primitives/focus";
import {
  type DismissReason,
  type OpenChangeDetails,
  type OpenChangeReason,
  useOpenState,
  useOverlayExit,
} from "../primitives/layer";
import type { PlacementOption } from "../primitives/position";
import { type TransitionStatus, presenceAttributes } from "../primitives/presence";
import { openStateAttributes } from "../primitives/render";
import type { WithRef } from "../types";
import { createAnchoredPositioner, getPopupTriggerProps, useAnchoredPopup } from "./floating";
import {
  type MobileLayoutProps,
  type OverlayPresentation,
  OverlayPresentationContext,
  useOverlayMode,
  useOverlayPresentation,
  usePresentedOverlayFocus,
} from "./overlayPresentation";
import {
  type SheetCloseReason,
  type SheetLabel,
  SheetOverlayContent,
  splitSheetLabel,
} from "./sheetFrame";

/** The popup props a picker's root takes. */
export interface PickerPopupProps extends MobileLayoutProps {
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
  /** Where the popup opens against the trigger. @default "bottom" */
  placement?: PlacementOption | undefined;
}

export interface PickerPopupOptions extends PickerPopupProps {
  /** Shows the content in place, always open, with no trigger or popup. */
  inline?: boolean | undefined;
  /** The element to focus as the popup opens, in place of its first focusable one. */
  initialFocus?: ((content: HTMLElement) => HTMLElement | null) | undefined;
}

export interface PickerPopup {
  open: boolean;
  inline: boolean;
  placement: PlacementOption;
  presentation: OverlayPresentation;
  ids: { trigger: string; content: string };
  triggerEl: HTMLElement | null;
  setTriggerEl: (node: HTMLElement | null) => void;
  contentEl: HTMLElement | null;
  setContentEl: (node: HTMLElement | null) => void;
  requestOpenChange: (open: boolean, reason: OpenChangeReason, event?: Event) => boolean;
  /** Closes for Escape, a press outside or focus leaving, and returns focus as that implies. */
  dismiss: (reason: DismissReason | SheetCloseReason, event?: Event) => boolean;
}

const PickerPopupContext = createContext<PickerPopup | null>(null);

export function usePickerPopupContext(): PickerPopup {
  const popup = useContext(PickerPopupContext);
  if (!popup) throw new Error("A picker part must be rendered inside its picker's root.");
  return popup;
}

/** Provides a picker's popup and its presentation to the picker's parts. */
export function PickerPopupProvider({
  popup,
  children,
}: {
  popup: PickerPopup;
  children: ReactNode;
}) {
  return (
    <OverlayPresentationContext value={popup.presentation}>
      <PickerPopupContext value={popup}>{children}</PickerPopupContext>
    </OverlayPresentationContext>
  );
}

/** The open state, ids, elements and focus handling a picker's trigger and popup share. */
export function usePickerPopup({
  open: openProp,
  defaultOpen,
  onOpenChange,
  mobileLayout,
  inline = false,
  placement = "bottom",
  initialFocus,
}: PickerPopupOptions): PickerPopup {
  const state = useOpenState({ open: openProp, defaultOpen, onOpenChange });
  const open = inline || state.open;
  const presentation = useOverlayPresentation({ mobileLayout, anchored: inline, open });
  const id = useId();
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const [contentEl, setContentEl] = useState<HTMLElement | null>(null);

  const { setReturnFocus, returningFocus } = usePresentedOverlayFocus(presentation, {
    open,
    popup: contentEl,
    autoFocus: !inline,
    initialFocus,
    restoreFocus: !inline,
    returnFocusTo: () => triggerEl,
  });
  useOverlayExit(open, contentEl === null && !returningFocus);

  const stateRequest = state.requestOpenChange;
  const requestOpenChange = useCallback(
    (next: boolean, reason: OpenChangeReason, event?: Event) => {
      if (inline || !stateRequest(next, reason, event)) return false;
      if (!next) setReturnFocus(closeFocusIntent(event));
      return true;
    },
    [inline, stateRequest, setReturnFocus],
  );

  const dismiss = (reason: DismissReason | SheetCloseReason, event?: Event) => {
    if (!requestOpenChange(false, reason, event)) return false;
    setReturnFocus(dismissFocusIntent(reason, event?.target ?? null));
    return true;
  };

  return {
    open,
    inline,
    placement,
    presentation,
    ids: { trigger: `picker:${id}:trigger`, content: `picker:${id}:content` },
    triggerEl,
    setTriggerEl,
    contentEl,
    setContentEl,
    requestOpenChange,
    dismiss,
  };
}

/** Props for the button that opens and closes a picker's popup; spread consumer props after them. */
export function getPickerTriggerProps(
  popup: PickerPopup,
  { interactive }: { interactive: boolean },
) {
  return {
    type: "button" as const,
    id: popup.ids.trigger,
    ref: popup.setTriggerEl,
    ...getPopupTriggerProps({
      open: popup.open,
      contentId: popup.ids.content,
      contentMounted: popup.contentEl !== null,
      haspopup: popup.inline ? undefined : "dialog",
    }),
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (event.button === 0 && isSafari()) event.currentTarget.focus();
    },
    onClick: (event: MouseEvent<HTMLElement>) => {
      if (event.defaultPrevented || !interactive) return;
      popup.requestOpenChange(!popup.open, "trigger-press", event.nativeEvent);
    },
  };
}

type ContentProps<C extends ElementType> = WithRef<ComponentProps<C>>;

/**
 * A picker's content part: shown in place while `inline`, as a phone sheet in sheet mode, and
 * otherwise in the top layer through `Positioner`, placed against the trigger.
 */
export function createPickerContent<C extends ElementType>(
  Positioner: ElementType,
  Content: C,
): (props: ContentProps<C>) => ReactElement | null {
  const AnchoredPositioner = createAnchoredPositioner(Positioner);
  const ContentPart: ElementType = Content;

  function ContentElement({
    ref,
    status,
    ...props
  }: ContentProps<C> & { status?: TransitionStatus }) {
    const popup = usePickerPopupContext();
    const sheet = useOverlayMode() === "sheet";
    const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, popup.setContentEl);
    return (
      <ContentPart
        id={popup.ids.content}
        role={popup.inline || sheet ? undefined : "dialog"}
        tabIndex={-1}
        animation="none"
        {...presenceAttributes(status)}
        {...openStateAttributes(popup.open)}
        {...props}
        ref={composedRef}
      />
    );
  }

  function AnchoredContent({ ref, ...props }: ContentProps<C>) {
    const popup = usePickerPopupContext();
    const anchored = useAnchoredPopup({
      open: popup.open,
      placement: popup.placement,
      anchor: popup.triggerEl,
      trigger: popup.triggerEl,
      dismiss: popup.dismiss,
    });
    const elementRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, anchored.setElement);

    if (!anchored.mounted) return null;

    return (
      <AnchoredPositioner popup={anchored}>
        <ContentElement
          data-side={anchored.side}
          data-align={anchored.align}
          status={anchored.status}
          {...(props as ContentProps<C>)}
          ref={elementRef}
        />
      </AnchoredPositioner>
    );
  }

  function SheetContent(props: ContentProps<C>) {
    const popup = usePickerPopupContext();
    const [label, rest] = splitSheetLabel(props as SheetLabel & Record<string, unknown>);
    const api = {
      open: popup.open,
      dismiss: popup.dismiss,
      restoreFocus: true,
      returnFocusTo: () => popup.triggerEl,
      label,
    };
    return (
      <SheetOverlayContent
        {...rest}
        api={api}
        Content={ContentElement}
      />
    );
  }

  return function PickerContent(props: ContentProps<C>) {
    const popup = usePickerPopupContext();
    const sheet = useOverlayMode() === "sheet";
    if (popup.inline) return <ContentElement {...props} />;
    return sheet ? <SheetContent {...props} /> : <AnchoredContent {...props} />;
  };
}
