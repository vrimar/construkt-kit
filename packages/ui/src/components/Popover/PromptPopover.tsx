import { type ReactNode, type SyntheticEvent, useRef, useState } from "react";

import { styled } from "#styled-system/jsx";

import type { WithRef } from "../../types";
import { formSubmitProps, renderFormActions } from "../formActions";
import { Input } from "../Input";
import { type ActionPopover, ActionPopoverRoot } from "./ActionPopoverRoot";
import { Popover, type PopoverRootProps, usePopoverContext } from "./Popover";

export interface PromptPopoverProps extends Omit<PopoverRootProps, "children"> {
  /** The trigger: an element becomes the trigger itself, anything else is wrapped in a button. */
  children: ReactNode;
  /** Heads the popover and labels the input. */
  title: ReactNode;
  /** Fills the input, selected, each time the popover opens. */
  defaultValue?: string;
  placeholder?: string;
  /**
   * Receives the trimmed value, then the popover closes; an empty value closes it without a call.
   * Return a promise to keep it open, with the submit button spinning, until the promise
   * resolves; it stays open if the promise rejects.
   */
  onSubmit: (value: string) => unknown;
  submitLabel?: string;
  cancelLabel?: string;
  /**
   * Spins the submit button and keeps the popover open: Cancel, Esc and outside clicks do nothing.
   * It doesn't hold the popover open after a submit; return a promise from `onSubmit` for that.
   */
  loading?: boolean;
}

interface PromptFormProps {
  title: ReactNode;
  defaultValue: string;
  placeholder: string | undefined;
  submitLabel: string;
  cancelLabel: string;
  onSubmit: (value: string) => unknown;
  action: ActionPopover;
}

function PromptForm({
  title,
  defaultValue,
  placeholder,
  submitLabel,
  cancelLabel,
  onSubmit,
  action,
}: PromptFormProps) {
  const titleId = usePopoverContext().ids.title;
  const [value, setValue] = useState(defaultValue);
  const selectedRef = useRef(false);
  const submit = (event?: SyntheticEvent) => {
    const trimmed = value.trim();
    if (trimmed) action.run(() => onSubmit(trimmed), event);
    else action.cancel(event);
  };
  const { cancelButton, submitButton } = renderFormActions({
    size: "sm",
    onCancel: action.cancel,
    cancelLabel,
    submitLabel,
    loading: action.busy,
    submitButtonProps: {
      // Enter in the input clicks this too; its click, unlike the submit, tells a key from a pointer.
      onClick: (event) => {
        event.preventDefault();
        submit(event);
      },
    },
  });

  return (
    <styled.form
      display="contents"
      {...formSubmitProps(submit)}
    >
      <Popover.Header>
        <Popover.Title>{title}</Popover.Title>
      </Popover.Header>
      <Popover.Body>
        <Input
          size="sm"
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          placeholder={placeholder}
          aria-labelledby={titleId}
          data-autofocus
          onFocus={(e) => {
            if (selectedRef.current) return;
            selectedRef.current = true;
            e.currentTarget.select();
          }}
        />
      </Popover.Body>
      <Popover.Footer>
        {cancelButton}
        {submitButton}
      </Popover.Footer>
    </styled.form>
  );
}

export const PromptPopover = ({
  ref,
  children,
  title,
  defaultValue = "",
  placeholder,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  loading,
  ...rest
}: WithRef<PromptPopoverProps>) => (
  <ActionPopoverRoot
    {...rest}
    trigger={children}
    loading={loading}
  >
    {(action) => (
      <Popover.Content ref={ref}>
        <PromptForm
          title={title}
          defaultValue={defaultValue}
          placeholder={placeholder}
          submitLabel={submitLabel}
          cancelLabel={cancelLabel}
          onSubmit={onSubmit}
          action={action}
        />
      </Popover.Content>
    )}
  </ActionPopoverRoot>
);
