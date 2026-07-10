import { Field } from "@ark-ui/react/field";
import { styled } from "@construkt-kit/styled-system/jsx";
import { textarea } from "@construkt-kit/styled-system/recipes";
import { type ComponentProps, type KeyboardEvent } from "react";

import type { WithRef } from "../../types";

type BaseTextareaProps = ComponentProps<typeof BaseTextarea>;
const BaseTextarea = styled(Field.Textarea, textarea);

export interface TextareaProps extends BaseTextareaProps {
  /** Fired on Enter (Shift+Enter still inserts a newline; ignored during IME composition). */
  onEnter?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  /** Block Enter from inserting newlines; also defaults CSS resize to "none". */
  preventNewline?: boolean;
}

export const Textarea = ({
  ref,
  onEnter,
  preventNewline,
  onKeyDown,
  style,
  ...props
}: WithRef<TextareaProps, HTMLTextAreaElement>) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || e.key !== "Enter" || e.nativeEvent.isComposing) return;
    if (onEnter && !e.shiftKey) {
      e.preventDefault();
      onEnter(e);
    } else if (preventNewline) {
      e.preventDefault();
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
