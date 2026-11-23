import { CheckIcon, CopyIcon } from "lucide-react";
import {
  type ClipboardEvent,
  type ComponentProps,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useId,
  useState,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { clipboard } from "#styled-system/recipes";

import { useLatestRef } from "../../hooks/useLatestRef";
import {
  type ReportRendered,
  useRenderedParts,
  useReportRendered,
} from "../../hooks/useRenderedParts";
import { type ChangeDetails, emitChange } from "../../primitives/change";
import { dataAttr, mergeProps, renderable } from "../../primitives/render";
import { createPartContext } from "../partContext";
import { copyText } from "./copyText";

const { withProvider, withContext } = createSlotRecipeContext(clipboard);

const StyledRoot = withProvider(renderable.div, "root");
const StyledControl = withContext(renderable.div, "control");
const StyledInput = withContext(renderable.input, "input");
const StyledLabel = withContext(renderable.label, "label");
const StyledTrigger = withContext(renderable.button, "trigger");
const StyledIndicator = withContext(renderable.div, "indicator");

type CopyRequest = "trigger-press" | "input-copy";

/** What asked for the copy, or `"copy-error"` when the copy failed. */
export type ClipboardCopyReason = CopyRequest | "copy-error";

/** Why `onStatusChange` was called, and a way to keep the value off the clipboard. */
export type ClipboardStatusChangeDetails = ChangeDetails<ClipboardCopyReason>;

export interface ClipboardTranslations {
  /** The trigger's `aria-label`. */
  triggerLabel?: ((copied: boolean) => string) | undefined;
}

const MAX_TIMEOUT = 2 ** 31 - 1;

const defaultTriggerLabel = (copied: boolean) =>
  copied ? "Copied to clipboard" : "Copy to clipboard";

interface ClipboardContextValue {
  value: string;
  copied: boolean;
  ids: { input: string; label: string };
  /** The rendered input's id. */
  inputId: string | undefined;
  reportRendered: ReportRendered<"input">;
  translations: ClipboardTranslations | undefined;
  copy: (reason: CopyRequest, event: Event, trigger?: HTMLElement) => boolean;
}

const [ClipboardContext, useClipboardContext] =
  createPartContext<ClipboardContextValue>("<Clipboard.Root>");

type StyledRootProps = ComponentProps<typeof StyledRoot>;

export interface ClipboardRootProps extends StyledRootProps {
  /** The text the trigger copies. */
  value?: string | undefined;
  /** How long the copied state lasts, in ms; `Infinity` keeps it. @default 3000 */
  timeout?: number | undefined;
  /**
   * Called with `true` as the value is copied, where `details.cancel()` keeps it off the
   * clipboard, and with `false` and reason `"copy-error"` if the browser refuses the copy.
   */
  onStatusChange?: ((copied: boolean, details: ClipboardStatusChangeDetails) => void) | undefined;
  translations?: ClipboardTranslations | undefined;
}

function Root({
  value = "",
  timeout = 3000,
  onStatusChange,
  translations,
  ...props
}: ClipboardRootProps) {
  const uid = useId();
  const [copies, setCopies] = useState(0);
  const [rendered, reportRendered] = useRenderedParts<"input">();
  const onStatusChangeRef = useLatestRef(onStatusChange);

  useEffect(() => {
    if (copies === 0 || !Number.isFinite(timeout)) return;
    const timer = setTimeout(() => setCopies(0), Math.min(timeout, MAX_TIMEOUT));
    return () => clearTimeout(timer);
  }, [copies, timeout]);

  const copied = copies > 0;
  const context: ClipboardContextValue = {
    value,
    copied,
    ids: { input: `clip:${uid}:input`, label: `clip:${uid}:label` },
    inputId: rendered.input,
    reportRendered,
    translations,
    copy(reason, event, trigger) {
      if (!emitChange(onStatusChange, true, reason, event)) return false;
      const markCopied = () => setCopies((count) => count + 1);
      if (!trigger) {
        markCopied();
        return true;
      }
      // Beside the trigger, not in <body>: an open modal makes everything outside it inert.
      copyText(trigger.parentElement ?? trigger, value).then(markCopied, () => {
        setCopies(0);
        emitChange(onStatusChangeRef.current, false, "copy-error", event);
      });
      return true;
    },
  };

  return (
    <ClipboardContext value={context}>
      <StyledRoot
        data-copied={dataAttr(copied)}
        {...props}
      />
    </ClipboardContext>
  );
}

type LabelProps = ComponentProps<typeof StyledLabel>;

function Label(props: LabelProps) {
  const context = useClipboardContext("Clipboard.Label");
  return (
    <StyledLabel
      id={context.ids.label}
      htmlFor={context.inputId}
      data-copied={dataAttr(context.copied)}
      {...props}
    />
  );
}

function Control(props: ComponentProps<typeof StyledControl>) {
  const context = useClipboardContext("Clipboard.Control");
  return (
    <StyledControl
      data-copied={dataAttr(context.copied)}
      {...props}
    />
  );
}

type InputProps = ComponentProps<typeof StyledInput>;

/** Shows the value read-only, selected as it gets focus; copying from it counts as a copy. */
function Input(props: InputProps) {
  const context = useClipboardContext("Clipboard.Input");
  const id = useReportRendered(context.reportRendered, "input", props.id ?? context.ids.input);
  return (
    <StyledInput
      {...mergeProps<InputProps>(
        {
          id,
          value: context.value,
          readOnly: true,
          "data-read-only": "",
          "data-copied": dataAttr(context.copied),
          onFocus(event: FocusEvent<HTMLInputElement>) {
            event.currentTarget.select();
          },
          onCopy(event: ClipboardEvent<HTMLInputElement>) {
            if (!context.copy("input-copy", event.nativeEvent)) event.preventDefault();
          },
        } as InputProps,
        props,
      )}
    />
  );
}

type TriggerProps = ComponentProps<typeof StyledTrigger>;

function Trigger(props: TriggerProps) {
  const context = useClipboardContext("Clipboard.Trigger");
  const label = context.translations?.triggerLabel ?? defaultTriggerLabel;
  return (
    <StyledTrigger
      {...mergeProps<TriggerProps>(
        {
          type: props.render ? undefined : "button",
          "aria-label": label(context.copied),
          "data-copied": dataAttr(context.copied),
          onClick(event: MouseEvent<HTMLButtonElement>) {
            context.copy("trigger-press", event.nativeEvent, event.currentTarget);
          },
        } as TriggerProps,
        props,
      )}
    />
  );
}

export interface ClipboardIndicatorProps extends ComponentProps<typeof StyledIndicator> {
  /** Shown in place of the children while the value is copied. */
  copied?: ReactNode;
}

function createIndicator(defaults: { children: ReactNode; copied: ReactNode }) {
  return function ClipboardIndicator({
    children = defaults.children,
    copied = defaults.copied,
    ...props
  }: ClipboardIndicatorProps) {
    const context = useClipboardContext("Clipboard.Indicator");
    return <StyledIndicator {...props}>{context.copied ? copied : children}</StyledIndicator>;
  };
}

/** The copy icon, or a check while the value is copied. */
const Indicator = createIndicator({ children: <CopyIcon />, copied: <CheckIcon /> });

/** "Copy", or "Copied" while the value is copied. */
const CopyText = createIndicator({ children: "Copy", copied: "Copied" });

export const Clipboard = {
  Root,
  Control,
  Input,
  Label,
  Trigger,
  Indicator,
  CopyText,
};
