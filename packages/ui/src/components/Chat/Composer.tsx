import { ark } from "@ark-ui/react/factory";
import { ArrowUpIcon, MicIcon } from "lucide-react";
import { type ComponentProps, type ReactNode, type Ref, useState } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { chat } from "#styled-system/recipes";

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
  /** Shows the mic button pressed and blinking. */
  listening?: boolean | undefined;
  /** @default "Dictate" */
  micLabel?: string | undefined;
  /** @default "Send" */
  sendLabel?: string | undefined;
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
  micLabel = "Dictate",
  sendLabel = "Send",
  disabled = false,
  ...props
}: ChatComposerProps) {
  const [ownValue, setOwnValue] = useState(defaultValue);
  const text = value ?? ownValue;
  const canSend = !disabled && text.trim() !== "";

  const change = (next: string) => {
    if (value === undefined) setOwnValue(next);
    onValueChange?.(next);
  };

  const send = () => {
    if (!canSend) return;
    onSend(text);
    change("");
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
          onChange={(e) => change(e.currentTarget.value)}
          onEnter={send}
        />
        {onListeningChange ? (
          <MicButton
            variant="plain"
            size="sm"
            colorPalette={listening ? "red" : undefined}
            aria-label={micLabel}
            aria-pressed={listening}
            disabled={disabled}
            icon={<MicIcon />}
            onClick={() => onListeningChange(!listening)}
          />
        ) : null}
        <IconButton
          type="submit"
          size="sm"
          colorPalette="brand"
          aria-label={sendLabel}
          disabled={!canSend}
          focusableWhenDisabled
          icon={<ArrowUpIcon />}
          onMouseDown={(event) => event.preventDefault()}
        />
      </Box>
    </Root>
  );
}
