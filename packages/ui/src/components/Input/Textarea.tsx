import { Field } from "@ark-ui/react/field";
import { type ComponentProps, type KeyboardEvent } from "react";

import { styled } from "#styled-system/jsx";
import { textarea } from "#styled-system/recipes";

type BaseTextareaProps = ComponentProps<typeof BaseTextarea>;
const BaseTextarea = styled(Field.Textarea, textarea);

export interface TextareaProps extends BaseTextareaProps {
  /** Fired on Enter (Shift+Enter still inserts a newline; ignored during IME composition). */
  onEnter?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  /**
   * Block Enter from inserting newlines; Enter submits the enclosing form like a single-line
   * input (skipped while its submit button is disabled). Also defaults CSS resize to "none".
   */
  preventNewline?: boolean;
}

function submitForm(field: HTMLTextAreaElement) {
  const form = field.form;
  const submitter = Array.from(form?.elements ?? []).find(
    (element): element is HTMLButtonElement | HTMLInputElement =>
      (element instanceof HTMLButtonElement || element instanceof HTMLInputElement) &&
      element.type === "submit",
  );
  if (form && submitter && !submitter.disabled) form.requestSubmit(submitter);
}

export const Textarea = ({
  ref,
  onEnter,
  preventNewline,
  onKeyDown,
  style,
  ...props
}: TextareaProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || e.key !== "Enter" || e.nativeEvent.isComposing) return;
    if (onEnter && !e.shiftKey) {
      e.preventDefault();
      onEnter(e);
    } else if (preventNewline) {
      e.preventDefault();
      submitForm(e.currentTarget);
    }
  };

  return (
    <BaseTextarea
      ref={ref}
      {...props}
      onKeyDown={handleKeyDown}
      style={preventNewline ? { resize: "none", ...style } : style}
    />
  );
};
