import { type ComponentProps, useLayoutEffect, useRef } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { pinInput } from "#styled-system/recipes";

import { splitOptions } from "../../foundations/props";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useReportRendered } from "../../hooks/useRenderedParts";
import { useFieldControlId } from "../../primitives/field";
import { mergeProps, renderable } from "../../primitives/render";
import {
  PIN_INPUT_OPTION_KEYS,
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

function Root({ ref, ...rootProps }: PinInputRootProps) {
  const [options, props] = splitOptions(rootProps, PIN_INPUT_OPTION_KEYS);
  const api = usePinInput(options);
  const composedRef = useComposedRefs(api.rootProps.ref, ref);

  return (
    <PinInputProvider value={api}>
      <StyledRoot
        {...api.rootProps}
        {...props}
        ref={composedRef}
      />
    </PinInputProvider>
  );
}

type LabelProps = ComponentProps<typeof StyledLabel>;

function Label(props: LabelProps) {
  const { labelProps, reportRendered } = usePinInputContext("PinInput.Label");
  const id = useReportRendered(reportRendered, "label", props.id ?? labelProps.id);
  return <StyledLabel {...mergeProps<LabelProps>(labelProps, props, { id })} />;
}

type ControlProps = ComponentProps<typeof StyledControl>;

function Control(props: ControlProps) {
  const { controlProps } = usePinInputContext("PinInput.Control");
  return <StyledControl {...mergeProps<ControlProps>(controlProps, props)} />;
}

type HiddenInputProps = ComponentProps<typeof renderable.input>;

function HiddenInput({ ref, ...props }: HiddenInputProps) {
  const { hiddenInputProps, reportRendered } = usePinInputContext("PinInput.HiddenInput");
  const composedRef = useComposedRefs(hiddenInputProps.ref, ref);
  const id = useReportRendered(
    reportRendered,
    "hiddenInput",
    useFieldControlId(props.id) ?? hiddenInputProps.id,
  );
  return (
    <renderable.input
      {...mergeProps<HiddenInputProps>(hiddenInputProps, props, { id })}
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
