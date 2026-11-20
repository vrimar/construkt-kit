import {
  type CSSProperties,
  type ComponentProps,
  type ElementType,
  type ReactElement,
  type ReactNode,
  type Ref,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

import { cx } from "#styled-system/css";

import { useDocumentScheme } from "../color-mode/useDocumentScheme";
import { useComposedRefs } from "../hooks/useComposedRefs";
import { type DismissReason, type Layer, LayerContext, useLayer } from "../primitives/layer";
import {
  type Align,
  type Anchor,
  type PlacementOption,
  type Position,
  type Side,
  usePosition,
} from "../primitives/position";
import { type TransitionStatus, usePresence } from "../primitives/presence";
import { openStateAttributes } from "../primitives/render";
import type { WithRef } from "../types";

interface FloatingContextValue {
  side: Side;
  align: Align;
  arrowStyle: CSSProperties;
  setArrow: (node: HTMLElement | null) => void;
}

export const FloatingContext = createContext<FloatingContextValue | null>(null);

/**
 * A positioner part that renders as a manual popover in the top layer. Its children mount once it
 * is showing, so their `autoFocus` and focus effects don't run inside a hidden popover. It follows
 * the document's colour mode, not a `.light` or `.dark` scope it is rendered in.
 */
export function createTopLayerPositioner<C extends ElementType>(Positioner: C) {
  const PositionerElement: ElementType = Positioner;

  return function TopLayerPositioner({
    ref,
    className,
    children,
    ...props
  }: WithRef<ComponentProps<C>> & { className?: string | undefined }): ReactElement {
    const [element, setElement] = useState<HTMLElement | null>(null);
    const scheme = useDocumentScheme(element);
    const showRef = useCallback((node: HTMLElement | null) => {
      if (!node) return;
      node.showPopover();
      setElement(node);
      return () => {
        if (node.isConnected) node.hidePopover();
        setElement(null);
      };
    }, []);
    const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, showRef);
    const shown = element !== null;
    return (
      <PositionerElement
        popover="manual"
        ref={composedRef}
        className={cx(scheme, className)}
        {...props}
      >
        {shown ? children : null}
      </PositionerElement>
    );
  };
}

export interface UseAnchoredPopupOptions {
  open: boolean;
  placement: PlacementOption;
  anchor: Anchor | null;
  gutter?: number | undefined;
  /** The trigger, which counts as part of the popup's layer, as does the anchor when an element. */
  trigger: HTMLElement | null;
  /** Whether `target` is part of the popup beyond its positioner, trigger and anchor. */
  contains?: ((target: Node) => boolean) | undefined;
  dismiss: (reason: DismissReason, event: Event) => boolean;
}

export interface AnchoredPopup {
  /** Whether the popup is in the DOM: while open, and while it animates out. */
  mounted: boolean;
  status: TransitionStatus;
  side: Side;
  align: Align;
  /** The popup element, whose exit animations it waits for. */
  setElement: (node: HTMLElement | null) => void;
  position: Position;
  layer: Layer | null;
  setPositioner: (node: HTMLElement | null) => void;
}

/** Places a popup against its anchor and keeps it on the layer stack while open. */
export function useAnchoredPopup({
  open,
  placement,
  anchor,
  gutter,
  trigger,
  contains,
  dismiss,
}: UseAnchoredPopupOptions): AnchoredPopup {
  const positionerRef = useRef<HTMLElement | null>(null);
  const position = usePosition({ open, placement, anchor, gutter });
  const presence = usePresence(open);
  const setPositioner = useComposedRefs(positionerRef, position.setFloating);

  const layer = useLayer(open, {
    contains: (target) =>
      (positionerRef.current?.contains(target) ?? false) ||
      (trigger?.contains(target) ?? false) ||
      (anchor instanceof Element && anchor.contains(target)) ||
      (contains?.(target) ?? false),
    dismiss,
    overlay: () => positionerRef.current,
  });

  return {
    mounted: presence.mounted,
    status: presence.status,
    side: position.side,
    align: position.align,
    setElement: presence.setElement,
    position,
    layer,
    setPositioner,
  };
}

/** The top-layer positioner of a `useAnchoredPopup` popup, which arrows inside it point from. */
export function createAnchoredPositioner<C extends ElementType>(Positioner: C) {
  const PositionerElement: ElementType = createTopLayerPositioner(Positioner);

  return function AnchoredPositioner({
    popup,
    children,
  }: {
    popup: AnchoredPopup;
    children: ReactNode;
  }): ReactElement {
    const { position } = popup;
    return (
      <FloatingContext
        value={{
          side: position.side,
          align: position.align,
          arrowStyle: position.arrowStyle,
          setArrow: position.setArrow,
        }}
      >
        <LayerContext value={popup.layer}>
          <PositionerElement
            ref={popup.setPositioner}
            style={position.floatingStyle}
            data-side={position.side}
            data-align={position.align}
          >
            {children}
          </PositionerElement>
        </LayerContext>
      </FloatingContext>
    );
  };
}

/** The ARIA and open-state attributes of the element that opens and closes a popup. */
export const getPopupTriggerProps = ({
  open,
  contentId,
  contentMounted,
  haspopup,
}: {
  open: boolean;
  contentId: string;
  contentMounted: boolean;
  haspopup: "dialog" | "menu" | undefined;
}) => ({
  "aria-haspopup": haspopup,
  "aria-expanded": open,
  "aria-controls": contentMounted ? contentId : undefined,
  ...openStateAttributes(open),
});

/** An arrow part that sits on the edge of the popup facing its anchor. */
export function createArrow<C extends ElementType, T extends ElementType>(Arrow: C, ArrowTip: T) {
  const ArrowElement: ElementType = Arrow;
  const ArrowTipElement: ElementType = ArrowTip;

  function FloatingArrowTip(props: ComponentProps<T>): ReactElement {
    return (
      <ArrowTipElement
        data-side={useContext(FloatingContext)?.side}
        {...props}
      />
    );
  }

  // A phone sheet has no anchor to point at, so it renders no arrow.
  function FloatingArrow({ ref, style, children, ...props }: WithRef<ComponentProps<C>>) {
    const context = useContext(FloatingContext);
    const composedRef = useComposedRefs(ref as Ref<HTMLElement> | undefined, context?.setArrow);
    if (!context) return null;
    const { side, arrowStyle } = context;
    return (
      <ArrowElement
        ref={composedRef}
        data-side={side}
        style={{ ...arrowStyle, ...style }}
        {...props}
      >
        {children ?? <ArrowTipElement data-side={side} />}
      </ArrowElement>
    );
  }

  return { Arrow: FloatingArrow, ArrowTip: FloatingArrowTip };
}
