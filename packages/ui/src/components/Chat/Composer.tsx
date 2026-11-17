import { ark } from "@ark-ui/react/factory";
import { ArrowUpIcon, MicIcon, SquareIcon } from "lucide-react";
import type { ComponentProps, ReactNode, Ref } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { chat } from "#styled-system/recipes";

import { useControllableState } from "../../hooks/useControllableState";
import { IconButton } from "../Buttons";
import { Textarea } from "../Input";

const { withProvider, withContext } = createSlotRecipeContext(chat);

const Root = withProvider(ark.form, "composer");
const Context = withContext(ark.div, "composerContext");
const Box = withContext(ark.div, "composerBox");
const MicButton = withContext(IconButton, "composerMic");

export interface ChatComposerProps extends Omit<
  ComponentProps<typeof Root>,
  "onSubmit" | "defaultValue"
> {
  /** Called with the text on Enter or the send button. Blank text is never sent. */
  onSend: (value: string) => void;
  value?: string | undefined;
  defaultValue?: string | undefined;
  /** Called as the user types, and with `""` once the text is sent. */
  onValueChange?: ((value: string) => void) | undefined;
  placeholder?: string | undefined;
  /**
   * Accessible name of the text field.
   * @default placeholder, else "Message"
   */
  inputLabel?: string | undefined;
  inputRef?: Ref<HTMLTextAreaElement> | undefined;
  /** A line above the field, such as "Reading <b>Table 3</b>"; bold text in it truncates. */
  context?: ReactNode;
  /** Shows the mic button, and is called with the toggled state when it is pressed. */
  onListeningChange?: ((listening: boolean) => void) | undefined;
  /** Shows the mic button pressed and blinking. Enter then stops listening instead of sending. */
  listening?: boolean | undefined;
  /** Spins the mic button and disables it, such as while the last words are transcribed. */
  micLoading?: boolean | undefined;
  /** @default "Dictate" */
  micLabel?: string | undefined;
  /** @default "Send" */
  sendLabel?: string | undefined;
  /**
   * A reply is being written: nothing is sent, and with `onStop` the send button becomes a stop
   * button.
   */
  busy?: boolean | undefined;
  /** Called by the stop button shown while `busy`. */
  onStop?: (() => void) | undefined;
  /** @default "Stop" */
  stopLabel?: string | undefined;
  /** Locks the text, such as while dictation writes it; the mic button stays usable. */
  readOnly?: boolean | undefined;
  disabled?: boolean | undefined;
}

export function Composer({
  onSend,
  value,
  defaultValue = "",
  onValueChange,
  placeholder,
  inputLabel,
  inputRef,
  context,
  onListeningChange,
  listening = false,
  micLoading = false,
  micLabel = "Dictate",
  sendLabel = "Send",
  busy = false,
  onStop,
  stopLabel = "Stop",
  readOnly = false,
  disabled = false,
  ...props
}: ChatComposerProps) {
  const [text, change] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const canSend = !disabled && !busy && !readOnly && text.trim() !== "";
  const stoppable = busy && onStop !== undefined;

  const send = () => {
    if (!canSend) return;
    onSend(text);
    change("");
  };

  const enter = () => {
    if (listening && onListeningChange) onListeningChange(false);
    else send();
  };

  return (
    <Root
      {...props}
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      {context ? <Context>{context}</Context> : null}
      <Box data-disabled={disabled ? "" : undefined}>
        <Textarea
          ref={inputRef}
          autoresize
          rows={1}
          variant="plain"
          size="sm"
          flex="1"
          px="0"
          py="1.5"
          maxH="32"
          value={text}
          placeholder={placeholder}
          aria-label={inputLabel ?? placeholder ?? "Message"}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(e) => change(e.currentTarget.value)}
          onEnter={enter}
        />
        {onListeningChange ? (
          <MicButton
            variant="plain"
            size="sm"
            colorPalette={listening ? "red" : undefined}
            aria-label={micLabel}
            aria-pressed={listening}
            disabled={disabled}
            loading={micLoading}
            icon={<MicIcon />}
            onClick={() => onListeningChange(!listening)}
          />
        ) : null}
        <IconButton
          type={stoppable ? "button" : "submit"}
          size="sm"
          colorPalette="brand"
          aria-label={stoppable ? stopLabel : sendLabel}
          disabled={stoppable ? disabled : !canSend}
          focusableWhenDisabled
          icon={stoppable ? <SquareIcon /> : <ArrowUpIcon />}
          onMouseDown={(event) => event.preventDefault()}
          onClick={stoppable ? onStop : undefined}
        />
      </Box>
    </Root>
  );
}
