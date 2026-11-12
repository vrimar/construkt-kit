import { usePopoverContext } from "@ark-ui/react/popover";
import { type ReactNode, isValidElement, useRef } from "react";

import { styled } from "#styled-system/jsx";

import type { PortalledProps, WithRef } from "../../types";
import { Button } from "../Buttons";
import { Input } from "../Input";
import { Popover, type PopoverRootProps } from "./Popover";
import { type ActionPopover, useActionPopover } from "./useActionPopover";

export interface PromptPopoverProps
  extends Omit<PopoverRootProps, "children" | "lazyMount" | "unmountOnExit">, PortalledProps {
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
  titleId: string | undefined;
  defaultValue: string;
  placeholder: string | undefined;
  submitLabel: string;
  cancelLabel: string;
  onSubmit: (value: string) => unknown;
  action: ActionPopover;
}

function PromptForm({
  title,
  titleId,
  defaultValue,
  placeholder,
  submitLabel,
  cancelLabel,
  onSubmit,
  action,
}: PromptFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedRef = useRef(false);

  return (
    <styled.form
      display="contents"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        // Portalled: React still bubbles submit to any form that renders this popover.
        e.stopPropagation();
        const value = inputRef.current?.value.trim() ?? "";
        if (value) action.run(() => onSubmit(value));
        else action.cancel();
      }}
    >
      <Popover.Header>
        <Popover.Title>{title}</Popover.Title>
      </Popover.Header>
      <Popover.Body>
        <Input
          ref={inputRef}
          size="sm"
          defaultValue={defaultValue}
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
        <Button
          size="sm"
          variant="plain"
          disabled={action.busy}
          onClick={action.cancel}
        >
          {cancelLabel}
        </Button>
        <Button
          type="submit"
          size="sm"
          colorPalette="brand"
          loading={action.busy}
        >
          {submitLabel}
        </Button>
      </Popover.Footer>
    </styled.form>
  );
}

type PromptContentProps = Omit<PromptFormProps, "titleId"> & PortalledProps;

function PromptContent({ ref, portalled, portalRef, ...formProps }: WithRef<PromptContentProps>) {
  const titleId = usePopoverContext().getTitleProps().id;

  return (
    <Popover.Content
      ref={ref}
      portalled={portalled}
      portalRef={portalRef}
    >
      <PromptForm
        {...formProps}
        titleId={titleId}
      />
    </Popover.Content>
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
  open,
  defaultOpen,
  onOpenChange,
  portalled,
  portalRef,
  ...rest
}: WithRef<PromptPopoverProps>) => {
  const action = useActionPopover({ open, defaultOpen, onOpenChange }, loading);

  return (
    <Popover.Root
      {...rest}
      {...action.rootProps}
      lazyMount
      unmountOnExit
    >
      <Popover.Trigger asChild={isValidElement(children)}>{children}</Popover.Trigger>
      <PromptContent
        ref={ref}
        title={title}
        defaultValue={defaultValue}
        placeholder={placeholder}
        submitLabel={submitLabel}
        cancelLabel={cancelLabel}
        onSubmit={onSubmit}
        action={action}
        portalled={portalled}
        portalRef={portalRef}
      />
    </Popover.Root>
  );
};
