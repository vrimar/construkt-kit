import {
  type CSSProperties,
  type ComponentProps,
  type FormEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Box,
  type SlotRecipeConsumerComponent,
  type SlotRecipeContext,
  styled,
} from "#styled-system/jsx";
import type { dialog } from "#styled-system/recipes";

import { useDocumentScheme } from "../color-mode/useDocumentScheme";
import { useComposedRefs } from "../hooks/useComposedRefs";
import { useModalFocus } from "../primitives/focus";
import {
  type DismissReason,
  LayerContext,
  type OpenChangeReason,
  type OverlayRootProps,
  PortalContainer,
  allowsDismiss,
  isTopmostLayer,
  useLayer,
  useNestedModalCount,
  useOpenState,
  useOverlayExit,
} from "../primitives/layer";
import { type TransitionStatus, presenceAttributes, usePresence } from "../primitives/presence";
import { dataAttr, mergeProps, openStateAttributes, renderable } from "../primitives/render";
import { useScrollLock } from "../primitives/scroll-lock";
import { createCloseTrigger } from "./closeTrigger";
import { getPopupTriggerProps } from "./floating";
import { isRenderable } from "./itemSlots";
import { type OverlayLabels, createLabelParts, useOverlayLabels } from "./labelParts";
import { createPartContext } from "./partContext";

type Label = Exclude<ReactNode, null | undefined | boolean>;

/** A modal's accessible name: a `title` its content shows in a header, or an `aria-label`. */
export type DialogLabelProps =
  | { title: Label; description?: ReactNode; "aria-label"?: undefined }
  | { "aria-label": string; title?: undefined; description?: undefined };

export interface DialogRootBaseProps extends OverlayRootProps {
  /** Called once the dialog has animated out, left the page and handed focus back. */
  onExitComplete?: (() => void) | undefined;
  /** Closes on a press outside the dialog's content. @default true */
  closeOnInteractOutside?: boolean | undefined;
  /** Moves focus back to the trigger, or to what had focus before it opened, once it closes. @default true */
  restoreFocus?: boolean | undefined;
  /** `alertdialog` for one that interrupts with an urgent message. @default "dialog" */
  role?: "dialog" | "alertdialog" | undefined;
}

/** Root props a phone sheet's frame also takes, naming itself after the overlay it holds. */
export interface ModalRootProps extends Omit<DialogRootBaseProps, "initialFocusEl"> {
  title?: ReactNode;
  description?: ReactNode;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  "aria-describedby"?: string | undefined;
  /** The element to focus when it opens, over focus already inside; `false` leaves it to the content. */
  initialFocusEl?: ((dialog: HTMLElement) => HTMLElement | null | false) | undefined;
}

interface ModalContextValue {
  open: boolean;
  requestOpenChange: (open: boolean, reason: OpenChangeReason, event?: Event) => boolean;
  ids: { trigger: string; dialog: string };
  title: ReactNode;
  description: ReactNode;
  ariaLabel: string | undefined;
  ariaLabelledBy: string | undefined;
  ariaDescribedBy: string | undefined;
  role: "dialog" | "alertdialog";
  closeOnEscape: boolean;
  closeOnInteractOutside: boolean;
  initialFocusEl: ((dialog: HTMLElement) => HTMLElement | null | false) | undefined;
  restoreFocus: boolean;
  returnFocusTo: (() => HTMLElement | null) | undefined;
  onExitComplete: (() => void) | undefined;
  triggerEl: HTMLElement | null;
  setTriggerEl: (node: HTMLElement | null) => void;
  dialogMounted: boolean;
  setDialogMounted: (mounted: boolean) => void;
  labels: OverlayLabels;
}

export const [ModalContext, useModalContext] = createPartContext<ModalContextValue>(
  "their Root",
  "Dialog, Drawer and Sheet parts",
);

export function ModalRoot({
  children,
  open: openProp,
  defaultOpen,
  onOpenChange,
  onExitComplete,
  closeOnEscape = true,
  closeOnInteractOutside = true,
  initialFocusEl,
  restoreFocus = true,
  returnFocusTo,
  role = "dialog",
  title,
  description,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
}: ModalRootProps) {
  const { open, requestOpenChange } = useOpenState({
    open: openProp,
    defaultOpen,
    onOpenChange,
  });
  const id = useId();
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const [dialogMounted, setDialogMounted] = useState(false);
  const labels = useOverlayLabels("dialog");

  const value = useMemo<ModalContextValue>(
    () => ({
      open,
      requestOpenChange,
      ids: { trigger: `dialog:${id}:trigger`, dialog: `dialog:${id}` },
      title,
      description,
      ariaLabel,
      ariaLabelledBy,
      ariaDescribedBy,
      role,
      closeOnEscape,
      closeOnInteractOutside,
      initialFocusEl,
      restoreFocus,
      returnFocusTo,
      onExitComplete,
      triggerEl,
      setTriggerEl,
      dialogMounted,
      setDialogMounted,
      labels,
    }),
    [
      open,
      requestOpenChange,
      id,
      title,
      description,
      ariaLabel,
      ariaLabelledBy,
      ariaDescribedBy,
      role,
      closeOnEscape,
      closeOnInteractOutside,
      initialFocusEl,
      restoreFocus,
      returnFocusTo,
      onExitComplete,
      triggerEl,
      dialogMounted,
      labels,
    ],
  );

  return <ModalContext value={value}>{children}</ModalContext>;
}

/** What a modal's content looks like to the hook that adds behaviour to it, such as a swipe. */
export interface ModalSurface {
  open: boolean;
  status: TransitionStatus;
  dialog: HTMLElement | null;
  content: HTMLElement | null;
  requestOpenChange: (open: boolean, reason: OpenChangeReason, event?: Event) => boolean;
}

export interface ModalSurfaceProps {
  contentProps?: Record<string, unknown>;
  wrapChildren?: (children: ReactNode) => ReactNode;
}

export type DialogContentProps = ComponentProps<
  SlotRecipeConsumerComponent<typeof renderable.div>
> & {
  /** Dims the page behind the dialog. @default true */
  backdrop?: boolean;
  /** Shown before the root's `title`, such as an icon or a back button. */
  headerStart?: ReactNode;
  /** Shown after the root's `title`, such as actions; a `CloseTrigger` given here sits in line with them. */
  headerEnd?: ReactNode;
};

interface DialogPartsOptions {
  /** Adds behaviour to the mounted content, given the props its `Content` received. */
  useSurface?: (surface: ModalSurface, props: DialogContentProps) => ModalSurfaceProps;
}

const useNoSurface = (): ModalSurfaceProps => ({});

const StyledButton = styled(renderable.button);

const useModalLabels = () => useModalContext().labels;

function useCloseModal() {
  const { requestOpenChange } = useModalContext();
  return (event: MouseEvent<HTMLElement>) =>
    requestOpenChange(false, "close-press", event.nativeEvent);
}

export function createDialogParts(
  withContext: SlotRecipeContext<typeof dialog>["withContext"],
  { useSurface = useNoSurface }: DialogPartsOptions = {},
) {
  const StyledPositioner = withContext(renderable.dialog, "positioner");
  const StyledContent = withContext(renderable.div, "content");
  const StyledTitle = withContext(renderable.h2, "title");
  const StyledDescription = withContext(renderable.div, "description");
  const StyledTrigger = withContext(renderable.button, "trigger");
  const StyledCloseTrigger = withContext(renderable.button, "closeTrigger");
  const Header = withContext(renderable.div, "header");
  const Body = withContext(renderable.div, "body");
  const Footer = withContext(renderable.div, "footer");

  const { Title, Description } = createLabelParts(StyledTitle, StyledDescription, useModalLabels);

  function DefaultHeader({
    headerStart,
    headerEnd,
  }: {
    headerStart: ReactNode;
    headerEnd: ReactNode;
  }) {
    const { title, description } = useModalContext();
    if (title == null) return null;
    const text = (
      <>
        <Title>{title}</Title>
        {description != null && <Description>{description}</Description>}
      </>
    );
    if (!isRenderable(headerStart) && !isRenderable(headerEnd)) return <Header>{text}</Header>;
    return (
      <Header
        flexDirection="row"
        alignItems="center"
        gap="2"
      >
        {headerStart}
        <Box
          display="flex"
          flexDirection="column"
          gap="0.5"
          flex="1"
          minWidth="0"
        >
          {text}
        </Box>
        {headerEnd}
      </Header>
    );
  }

  function Trigger({ ref, onClick, ...props }: ComponentProps<typeof StyledTrigger>) {
    const context = useModalContext();
    const composedRef = useComposedRefs(ref, context.setTriggerEl);
    return (
      <StyledTrigger
        type={props.render ? undefined : "button"}
        id={context.ids.trigger}
        {...getPopupTriggerProps({
          open: context.open,
          contentId: context.dialogMounted ? context.ids.dialog : undefined,
          haspopup: "dialog",
        })}
        {...props}
        ref={composedRef}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          context.requestOpenChange(!context.open, "trigger-press", event.nativeEvent);
        }}
      />
    );
  }

  function ActionTrigger({ ref, onClick, ...props }: ComponentProps<typeof StyledButton>) {
    const context = useModalContext();
    return (
      <StyledButton
        type={props.render ? undefined : "button"}
        ref={ref}
        {...props}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            context.requestOpenChange(false, "close-press", event.nativeEvent);
          }
        }}
      />
    );
  }

  interface MountedContentProps {
    status: TransitionStatus;
    setPresenceElement: (node: HTMLElement | null) => void;
    contentProps: DialogContentProps;
    header: ReactNode;
  }

  function MountedContent({
    status,
    setPresenceElement,
    contentProps,
    header,
  }: MountedContentProps) {
    const context = useModalContext();
    const { open, requestOpenChange, setDialogMounted } = context;
    const { ref, backdrop = true, children, ...rest } = contentProps;
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const [dialogEl, setDialogEl] = useState<HTMLDialogElement | null>(null);
    const [contentEl, setContentEl] = useState<HTMLElement | null>(null);
    const contentRef = useComposedRefs(ref, setContentEl);
    const elementRef = useComposedRefs(contentRef, setPresenceElement);

    const dismiss = (reason: DismissReason, event: Event) =>
      reason !== "focus-out" &&
      allowsDismiss(reason, context) &&
      requestOpenChange(false, reason, event);

    const layer = useLayer(open, {
      contains: (target) => {
        const node = dialogRef.current;
        return node !== null && target !== node && node.contains(target);
      },
      dismiss,
      modal: () => dialogRef.current,
      overlay: () => dialogRef.current,
    });
    const nestedModals = useNestedModalCount(layer);
    const scheme = useDocumentScheme(dialogEl);
    useScrollLock(open);

    const focus = useModalFocus({
      open,
      dialog: dialogEl,
      content: contentEl,
      initialFocus: context.initialFocusEl,
      restoreFocus: context.restoreFocus,
      returnFocusTo: () => context.returnFocusTo?.() ?? context.triggerEl,
    });
    const { captureReturnFocus, returnFocus } = focus;
    // Suspense hiding the dialog closes it here; that `close` event dispatches later, often after it reopens.
    const ownCloses = useRef(0);
    // Kept as the event, since a listener after this one may still cancel the submit or command.
    const explicitClose = useRef<Event | null>(null);

    const showRef = useCallback(
      (node: HTMLDialogElement | null) => {
        if (!node) return;
        dialogRef.current = node;
        captureReturnFocus();
        if (!node.open) node.showModal();
        setDialogEl(node);
        setDialogMounted(true);
        const onCommand = (event: Event) => {
          if ("command" in event && event.command === "close") explicitClose.current = event;
        };
        node.addEventListener("command", onCommand);
        return () => {
          node.removeEventListener("command", onCommand);
          if (node.open) {
            ownCloses.current += 1;
            node.close();
          }
          setDialogMounted(false);
          returnFocus();
        };
      },
      [captureReturnFocus, returnFocus, setDialogMounted],
    );

    // Counted so a native close the owner of `open` ignores still commits, and the dialog shows again.
    const [nativeCloses, setNativeCloses] = useState(0);
    useLayoutEffect(() => {
      const node = dialogRef.current;
      if (nativeCloses > 0 && open && node?.isConnected && !node.open) node.showModal();
    }, [nativeCloses, open]);

    const surfaceProps = useSurface(
      { open, status, dialog: dialogEl, content: contentEl, requestOpenChange },
      contentProps,
    );

    // React also runs these for `cancel` and `close` from a <dialog> nested in the React tree.
    const onCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
      if (event.target !== event.currentTarget) return;
      event.preventDefault();
      if (open && layer && isTopmostLayer(layer)) dismiss("escape-key", event.nativeEvent);
    };

    const onSubmit = (event: FormEvent<HTMLDialogElement>) => {
      const form = event.target as HTMLFormElement;
      if (form.closest("dialog") !== event.currentTarget) return;
      const submitter = (event.nativeEvent as SubmitEvent).submitter;
      const method = submitter?.getAttribute("formmethod") ?? form.getAttribute("method");
      if (method?.toLowerCase() === "dialog") explicitClose.current = event.nativeEvent;
    };

    // A repeated close request with no user activation between closes the <dialog> without `cancel`.
    const onClose = (event: SyntheticEvent<HTMLDialogElement>) => {
      if (event.target !== event.currentTarget) return;
      const explicit = explicitClose.current;
      explicitClose.current = null;
      if (ownCloses.current > 0) {
        ownCloses.current -= 1;
        return;
      }
      if (!open || !event.currentTarget.isConnected) return;
      if (explicit && !explicit.defaultPrevented) requestOpenChange(false, "close-press", explicit);
      else dismiss("escape-key", event.nativeEvent);
      setNativeCloses((count) => count + 1);
    };

    const content = (
      <StyledContent
        {...presenceAttributes(status)}
        data-nested-dialog-open={dataAttr(nestedModals > 0)}
        {...openStateAttributes(open)}
        {...mergeProps<Record<string, unknown>>(rest, surfaceProps.contentProps)}
        style={{ "--nested-dialogs": nestedModals, ...rest.style } as CSSProperties}
        ref={elementRef}
      >
        {header}
        {children}
      </StyledContent>
    );

    return (
      <StyledPositioner
        ref={showRef}
        className={scheme}
        id={context.ids.dialog}
        role={context.role === "alertdialog" ? "alertdialog" : undefined}
        aria-label={context.ariaLabel}
        aria-labelledby={context.labels.labelledBy ?? context.ariaLabelledBy}
        aria-describedby={context.labels.describedBy ?? context.ariaDescribedBy}
        tabIndex={-1}
        inert={!open}
        data-no-backdrop={dataAttr(!backdrop)}
        {...openStateAttributes(open)}
        onKeyDown={focus.onKeyDown}
        onCancel={onCancel}
        onClose={onClose}
        onSubmit={onSubmit}
      >
        {dialogEl && (
          <PortalContainer target={dialogRef}>
            <LayerContext value={layer}>
              {surfaceProps.wrapChildren ? surfaceProps.wrapChildren(content) : content}
            </LayerContext>
          </PortalContainer>
        )}
      </StyledPositioner>
    );
  }

  /** Content with a header other than the root's title, or none: the sheet's comes after its grabber. */
  function ModalContent({
    header,
    headerStart,
    headerEnd,
    ...props
  }: DialogContentProps & { header?: ReactNode }): ReactElement | null {
    const { open, onExitComplete } = useModalContext();
    const presence = usePresence(open);
    useOverlayExit(open, !presence.mounted, onExitComplete);

    if (!presence.mounted) return null;
    return (
      <MountedContent
        status={presence.status}
        setPresenceElement={presence.setElement}
        contentProps={props}
        header={
          header === undefined ? (
            <DefaultHeader
              headerStart={headerStart}
              headerEnd={headerEnd}
            />
          ) : (
            header
          )
        }
      />
    );
  }

  function Content(props: DialogContentProps): ReactElement | null {
    return <ModalContent {...props} />;
  }

  return {
    Trigger,
    Content,
    ModalContent,
    Header,
    Title,
    Description,
    Body,
    Footer,
    CloseTrigger: createCloseTrigger(StyledCloseTrigger, useCloseModal),
    ActionTrigger,
  };
}
