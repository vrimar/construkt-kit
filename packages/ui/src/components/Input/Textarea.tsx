import { type ComponentProps, type KeyboardEvent, useEffect, useRef } from "react";

import { styled } from "#styled-system/jsx";
import { textarea } from "#styled-system/recipes";

import { isComposingEvent, submitImplicitly } from "../../foundations/dom";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useFieldInputProps } from "../../primitives/field";
import { renderable } from "../../primitives/render";
import { autoresizeTextarea } from "./autoresize";

interface FieldTextareaProps extends ComponentProps<typeof renderable.textarea> {
  /** Grows the textarea with its content, up to its `max-height`. */
  autoresize?: boolean | undefined;
}

function FieldTextarea({ ref, autoresize, style, ...props }: FieldTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composedRef = useComposedRefs(ref, textareaRef);

  useEffect(() => {
    const element = textareaRef.current;
    if (!autoresize || !element) return;
    return autoresizeTextarea(element);
  }, [autoresize]);

  return (
    <renderable.textarea
      {...useFieldInputProps(props)}
      ref={composedRef}
      style={autoresize ? { resize: "none", ...style } : style}
    />
  );
}

type BaseTextareaProps = ComponentProps<typeof BaseTextarea>;
const BaseTextarea = styled(FieldTextarea, textarea);

export interface TextareaProps extends BaseTextareaProps {
  /**
   * Fired on Enter (Shift+Enter inserts a newline unless `preventNewline`; ignored during IME
   * composition).
   */
  onEnter?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  /**
   * Block Enter from inserting newlines; without `onEnter`, Enter submits the enclosing form like
   * a single-line input (skipped while its submit button is disabled). Also defaults CSS resize
   * to "none".
   */
  preventNewline?: boolean;
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
    if (e.defaultPrevented || e.key !== "Enter" || isComposingEvent(e)) return;
    if (onEnter && !e.shiftKey) {
      e.preventDefault();
      onEnter(e);
    } else if (preventNewline) {
      e.preventDefault();
      if (!onEnter) submitImplicitly(e.currentTarget.form);
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
