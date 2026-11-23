import type {
  ComponentProps,
  ElementType,
  MouseEvent,
  PointerEvent,
  ReactElement,
  ReactNode,
} from "react";

import { isSafari } from "../foundations/platform";
import { useComposedRefs } from "../hooks/useComposedRefs";
import type { UseOpenStateOptions } from "../primitives/layer";
import {
  type MobileLayoutProps,
  OverlayPresentationContext,
  type Popup,
  useOverlayMode,
} from "../primitives/popup";
import type { PlacementOption } from "../primitives/position";
import { type TransitionStatus, presenceAttributes } from "../primitives/presence";
import { type RenderProp, openStateAttributes } from "../primitives/render";
import type { WithRef } from "../types";
import { createAnchoredPositioner, getPopupTriggerProps, useAnchoredPopup } from "./floating";
import { createPartContext } from "./partContext";
import { type SheetLabel, SheetOverlayContent, splitSheetLabel } from "./Sheet/sheetFrame";

export function createPopupContext(owner: string, parts: string) {
  const [Context, usePopupContext] = createPartContext<Popup>(owner, parts);

  function PopupProvider({ popup, children }: { popup: Popup; children: ReactNode }) {
    return (
      <OverlayPresentationContext value={popup.presentation}>
        <Context value={popup}>{children}</Context>
      </OverlayPresentationContext>
    );
  }

  return [PopupProvider, usePopupContext] as const;
}

/** The popup props a picker's root takes. */
export interface PickerPopupProps extends MobileLayoutProps, UseOpenStateOptions {
  /** Where the popup opens against the trigger. @default "bottom" */
  placement?: PlacementOption | undefined;
}

export const [PickerPopupProvider, usePickerPopupContext] = createPopupContext(
  "its picker's root",
  "A picker part",
);

interface PopupToggleOptions {
  interactive?: boolean | undefined;
  /** The trigger's `render`, which then decides its own `type`. */
  render?: RenderProp | undefined;
}

/** Props for the button that opens and closes a popup; spread consumer props after them. */
export function getPopupToggleProps(
  popup: Popup,
  { interactive = true, render }: PopupToggleOptions = {},
) {
  return {
    type: render ? undefined : ("button" as const),
    id: popup.ids.trigger,
    ref: popup.setTriggerEl,
    ...(!popup.disabled &&
      getPopupTriggerProps({
        open: popup.open,
        contentId: popup.contentEl?.id || undefined,
        haspopup: popup.inline ? undefined : "dialog",
      })),
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
 * A popup's content part: shown in place while `inline`, as a phone sheet in sheet mode, and
 * otherwise in the top layer through `Positioner`, placed against its anchor or trigger.
 */
export function createPopupContent<C extends ElementType>(
  Positioner: ElementType,
  Content: C,
  usePopupContext: () => Popup,
): (props: ContentProps<C>) => ReactElement | null {
  const AnchoredPositioner = createAnchoredPositioner(Positioner);
  const ContentPart: ElementType = Content;

  function ContentElement({
    ref,
    status,
    ...props
  }: ContentProps<C> & { status?: TransitionStatus }) {
    const popup = usePopupContext();
    const sheet = useOverlayMode() === "sheet";
    const composedRef = useComposedRefs(ref, popup.setContentEl);
    return (
      <ContentPart
        id={popup.ids.content}
        role={popup.inline || sheet ? undefined : "dialog"}
        tabIndex={-1}
        {...presenceAttributes(status)}
        {...openStateAttributes(popup.open)}
        {...props}
        ref={composedRef}
      />
    );
  }

  function AnchoredContent({ ref, ...props }: ContentProps<C>) {
    const popup = usePopupContext();
    const anchored = useAnchoredPopup({
      open: popup.open,
      placement: popup.placement,
      anchor: popup.anchor ?? popup.anchorEl ?? popup.triggerEl,
      gutter: popup.gutter,
      trigger: popup.triggerEl,
      contains: (target) => popup.anchorEl?.contains(target) ?? false,
      dismiss: popup.dismiss,
    });
    const elementRef = useComposedRefs(ref, anchored.setElement);

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
    const popup = usePopupContext();
    const [label, rest] = splitSheetLabel(props as SheetLabel & Record<string, unknown>);
    const api = {
      open: popup.open,
      dismiss: popup.dismiss,
      restoreFocus: popup.restoreFocus,
      returnFocusTo: popup.returnFocusTo,
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

  return function PopupContent(props: ContentProps<C>) {
    const popup = usePopupContext();
    const sheet = useOverlayMode() === "sheet";
    if (popup.inline) return <ContentElement {...props} />;
    return sheet ? <SheetContent {...props} /> : <AnchoredContent {...props} />;
  };
}
