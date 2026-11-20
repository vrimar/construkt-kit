import { type ComponentProps, useLayoutEffect, useRef } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { visuallyHidden } from "#styled-system/patterns";
import { pinInput } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import {
  type PinInputOptions,
  PinInputProvider,
  usePinInput,
  usePinInputContext,
} from "./usePinInput";

export type {
  PinInputTranslations,
  PinInputType,
  PinInputValueChangeDetails,
  PinInputValueChangeReason,
} from "./usePinInput";

const { withProvider, withContext } = createSlotRecipeContext(pinInput);

const StyledRoot = withProvider(renderable.div, "root");
const StyledControl = withContext(renderable.div, "control");
const StyledInput = withContext(renderable.input, "input");
const StyledLabel = withContext(renderable.label, "label");

type StyledRootProps = ComponentProps<typeof StyledRoot>;

export interface PinInputRootProps
  extends Omit<StyledRootProps, keyof PinInputOptions>, PinInputOptions {}

function Root({
  value,
  defaultValue,
  onValueChange,
  onValueComplete,
  onValueInvalid,
  count,
  type,
  pattern,
  placeholder,
  masked,
  otp,
  autoFocus,
  autoSubmit,
  blurOnComplete,
  selectOnFocus,
  sanitizeValue,
  translations,
  name,
  form,
  disabled,
  readOnly,
  invalid,
  required,
  id,
  ...props
}: PinInputRootProps) {
  const api = usePinInput({
    value,
    defaultValue,
    onValueChange,
    onValueComplete,
    onValueInvalid,
    count,
    type,
    pattern,
    placeholder,
    masked,
    otp,
    autoFocus,
    autoSubmit,
    blurOnComplete,
    selectOnFocus,
    sanitizeValue,
    translations,
    name,
    form,
    disabled,
    readOnly,
    invalid,
    required,
    id,
  });

  return (
    <PinInputProvider value={api}>
      <StyledRoot
        {...api.rootProps}
        {...props}
      />
    </PinInputProvider>
  );
}

type LabelProps = ComponentProps<typeof StyledLabel>;

function Label(props: LabelProps) {
  const { labelProps } = usePinInputContext("PinInput.Label");
  return <StyledLabel {...mergeProps<LabelProps>(labelProps, props)} />;
}

type ControlProps = ComponentProps<typeof StyledControl>;

function Control(props: ControlProps) {
  const { controlProps } = usePinInputContext("PinInput.Control");
  return <StyledControl {...mergeProps<ControlProps>(controlProps, props)} />;
}

type HiddenInputProps = ComponentProps<typeof renderable.input>;

const hiddenInputClass = visuallyHidden();

function HiddenInput({ ref, ...props }: HiddenInputProps) {
  const { hiddenInputProps } = usePinInputContext("PinInput.HiddenInput");
  const composedRef = useComposedRefs(hiddenInputProps.ref, ref);
  return (
    <renderable.input
      {...mergeProps<HiddenInputProps>({ className: hiddenInputClass, ...hiddenInputProps }, props)}
      ref={composedRef}
    />
  );
}

type StyledInputProps = ComponentProps<typeof StyledInput>;

export interface PinInputInputProps extends StyledInputProps {
  /** The slot's position, from 0. */
  index: number;
}

function Input({ ref, index, ...props }: PinInputInputProps) {
  const { getInputProps, registerInput } = usePinInputContext("PinInput.Input");
  const inputRef = useRef<HTMLInputElement>(null);
  const composedRef = useComposedRefs(inputRef, ref);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (input) return registerInput(index, input);
  }, [index, registerInput]);

  return (
    <StyledInput
      {...mergeProps<StyledInputProps>(getInputProps(index), props)}
      ref={composedRef}
    />
  );
}

export const PinInput = {
  Root,
  Control,
  HiddenInput,
  Input,
  Label,
};
