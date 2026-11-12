import {
  Editable as ArkEditable,
  EditableContext,
  useEditableContext,
} from "@ark-ui/react/editable";
import { type ComponentProps, useLayoutEffect, useRef } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { editable } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import type { WithRef } from "../../types";

const { withProvider, withContext } = createSlotRecipeContext(editable);

const Root = withProvider(ArkEditable.Root, "root");
const RootProvider = withProvider(ArkEditable.RootProvider, "root");
const Area = withContext(ArkEditable.Area, "area");
const CancelTrigger = withContext(ArkEditable.CancelTrigger, "cancelTrigger");
const Control = withContext(ArkEditable.Control, "control");
const EditTrigger = withContext(ArkEditable.EditTrigger, "editTrigger");
const Input = withContext(ArkEditable.Input, "input");
const Label = withContext(ArkEditable.Label, "label");
const StyledPreview = withContext(ArkEditable.Preview, "preview");
const SubmitTrigger = withContext(ArkEditable.SubmitTrigger, "submitTrigger");

export type EditableRootProps = ComponentProps<typeof Root>;

/**
 * Takes focus back after a submit or cancel that left it nowhere, and opens on Enter or F2. With
 * `activationMode="focus"`, focus coming back doesn't reopen the editor.
 */
function Preview({
  ref,
  onFocusCapture,
  onKeyDown,
  ...props
}: WithRef<ComponentProps<typeof StyledPreview>, HTMLSpanElement>) {
  const api = useEditableContext();
  const previewRef = useRef<HTMLSpanElement>(null);
  const composedRef = useComposedRefs(ref, previewRef);
  const returningFocus = useRef(false);
  const wasEditing = useRef(api.editing);

  useLayoutEffect(() => {
    const ended = wasEditing.current && !api.editing;
    wasEditing.current = api.editing;
    if (!ended) return;
    // zag focuses `finalFocusEl` or the EditTrigger a frame after editing ends; this frame runs later.
    const frame = requestAnimationFrame(() => {
      const preview = previewRef.current;
      const active = preview?.ownerDocument.activeElement;
      if (!preview || (active && active !== preview.ownerDocument.body)) return;
      returningFocus.current = true;
      preview.focus({ preventScroll: true });
      returningFocus.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [api.editing]);

  return (
    <StyledPreview
      ref={composedRef}
      {...props}
      onFocusCapture={(event) => {
        onFocusCapture?.(event);
        if (returningFocus.current) event.stopPropagation();
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || api.editing) return;
        if (event.key !== "Enter" && event.key !== "F2") return;
        event.preventDefault();
        api.edit();
      }}
    />
  );
}

export const Editable = {
  Root,
  RootProvider,
  Area,
  CancelTrigger,
  Control,
  EditTrigger,
  Input,
  Label,
  Preview,
  SubmitTrigger,
  Context: EditableContext,
};
