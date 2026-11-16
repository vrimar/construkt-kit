import {
  type ElementType,
  type RefObject,
  createContext,
  useContext,
  useRef,
  useState,
} from "react";

import { useControllableState } from "../hooks/useControllableState";
import { useIsMobile } from "../hooks/useMediaQuery";
import type { DrawerRootProps } from "./Drawer";

export type MobileLayout = "sheet" | "popover";

export interface MobileLayoutProps {
  /** How the overlay opens below the `md` breakpoint. @default "sheet" */
  mobileLayout?: MobileLayout;
}

type SheetDismissProps = Pick<
  DrawerRootProps,
  | "closeOnEscape"
  | "closeOnInteractOutside"
  | "onEscapeKeyDown"
  | "onFocusOutside"
  | "onInteractOutside"
  | "onPointerDownOutside"
>;

interface OverlayPresentation {
  mode: MobileLayout;
  frameRef: RefObject<HTMLDivElement | null>;
  sheetExiting: boolean;
  onSheetExitComplete: () => void;
  dismissProps?: SheetDismissProps;
}

const OverlayPresentationContext = createContext<OverlayPresentation | null>(null);

export const useOverlayMode = (): MobileLayout =>
  useContext(OverlayPresentationContext)?.mode ?? "popover";

export const useSheetPresentation = () => useContext(OverlayPresentationContext);

function useOverlayPresentation(
  mobileLayout: MobileLayout = "sheet",
  open: boolean,
): OverlayPresentation {
  const isMobile = useIsMobile();
  const live: MobileLayout = mobileLayout === "sheet" && isMobile ? "sheet" : "popover";
  const [held, setHeld] = useState(live);
  const [prevOpen, setPrevOpen] = useState(open);
  const [sheetExiting, setSheetExiting] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const closingSheet = prevOpen && !open && held === "sheet";

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (closingSheet) setSheetExiting(true);
  }

  // Switching mode while open, or while the sheet animates out, would orphan its layers.
  const holding = open || sheetExiting || closingSheet;
  if (!holding && held !== live) setHeld(live);

  return {
    mode: holding ? held : live,
    frameRef,
    sheetExiting: sheetExiting || closingSheet,
    onSheetExitComplete: () => setSheetExiting(false),
  };
}

const pickDismissProps = ({
  closeOnEscape,
  closeOnInteractOutside,
  onEscapeKeyDown,
  onFocusOutside,
  onInteractOutside,
  onPointerDownOutside,
}: SheetDismissProps): SheetDismissProps => ({
  closeOnEscape,
  closeOnInteractOutside,
  onEscapeKeyDown,
  onFocusOutside,
  onInteractOutside,
  onPointerDownOutside,
});

const providerDismissProps = new WeakMap<object, SheetDismissProps>();

/** Has the phone sheet of the `RootProvider` given `api` apply the dismiss options its machine got. */
export function bindSheetDismiss<A extends object>(api: A, props: SheetDismissProps): A {
  providerDismissProps.set(api, pickDismissProps(props));
  return api;
}

interface PresentationRootProps extends MobileLayoutProps, SheetDismissProps {
  open?: boolean;
  defaultOpen?: boolean;
  autoFocus?: boolean;
  inline?: boolean;
  onOpenChange?: (details: never) => void;
}

export function withMobileLayout<P extends PresentationRootProps>(
  Root: ElementType,
  sheetProps?: Partial<P>,
) {
  return function MobileLayoutRoot({ mobileLayout, ...props }: P) {
    const [open, setTrackedOpen] = useControllableState<boolean>({
      value: props.open,
      defaultValue: props.defaultOpen ?? false,
    });
    // An overlay that won't take focus accompanies a focused field, and an inline one never floats.
    const anchored = props.autoFocus === false || props.inline === true;
    const presentation = useOverlayPresentation(anchored ? "popover" : mobileLayout, open);

    return (
      <OverlayPresentationContext.Provider
        value={{ ...presentation, dismissProps: pickDismissProps(props) }}
      >
        <Root
          {...props}
          {...(presentation.mode === "sheet" ? sheetProps : undefined)}
          onOpenChange={(details: { open: boolean }) => {
            setTrackedOpen(details.open);
            props.onOpenChange?.(details as never);
          }}
        />
      </OverlayPresentationContext.Provider>
    );
  };
}

export function withMobileLayoutProvider<
  P extends MobileLayoutProps & { value: { open: boolean; inline?: boolean } },
>(RootProvider: ElementType) {
  return function MobileLayoutRootProvider({ mobileLayout, ...props }: P) {
    const presentation = useOverlayPresentation(
      props.value.inline === true ? "popover" : mobileLayout,
      props.value.open,
    );

    return (
      <OverlayPresentationContext.Provider
        value={{ ...presentation, dismissProps: providerDismissProps.get(props.value) }}
      >
        <RootProvider {...props} />
      </OverlayPresentationContext.Provider>
    );
  };
}
