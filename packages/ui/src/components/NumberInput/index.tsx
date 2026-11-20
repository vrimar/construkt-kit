import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { type ComponentProps, createContext, useContext } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { numberInput } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { dataAttr, renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import { type NumberInputApi, type NumberInputOptions, useNumberInput } from "./useNumberInput";

export type {
  NumberInputFocusDetails,
  NumberInputInvalidDetails,
  NumberInputTranslations,
  NumberInputValueChangeDetails,
  NumberInputValueChangeReason,
  NumberInputValueDetails,
} from "./useNumberInput";

const { withProvider, withContext } = createSlotRecipeContext(numberInput);

const NumberInputContext = createContext<NumberInputApi | null>(null);

function useNumberInputContext(part: string): NumberInputApi {
  const context = useContext(NumberInputContext);
  if (!context) throw new Error(`NumberInput.${part} must be placed inside <NumberInput.Root>.`);
  return context;
}

const stateAttributes = ({ state }: NumberInputApi) => ({
  "data-disabled": dataAttr(state.disabled),
  "data-focus": dataAttr(state.focused),
  "data-invalid": dataAttr(state.invalid),
  "data-scrubbing": dataAttr(state.scrubbing),
});

const StyledRoot = withProvider(renderable.div, "root");

type StyledRootProps = ComponentProps<typeof StyledRoot>;

export interface NumberInputRootProps
  extends Omit<StyledRootProps, keyof NumberInputOptions>, NumberInputOptions {}

function Root({
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  onValueInvalid,
  onFocusChange,
  min,
  max,
  step,
  largeStep,
  smallStep,
  allowOverflow,
  clampValueOnBlur,
  allowMouseWheel,
  focusInputOnChange,
  spinOnPress,
  formatOptions,
  locale,
  inputMode,
  pattern,
  translations,
  disabled,
  readOnly,
  invalid,
  required,
  name,
  form,
  id,
  ...props
}: NumberInputRootProps) {
  const api = useNumberInput({
    value,
    defaultValue,
    onValueChange,
    onValueCommit,
    onValueInvalid,
    onFocusChange,
    min,
    max,
    step,
    largeStep,
    smallStep,
    allowOverflow,
    clampValueOnBlur,
    allowMouseWheel,
    focusInputOnChange,
    spinOnPress,
    formatOptions,
    locale,
    inputMode,
    pattern,
    translations,
    disabled,
    readOnly,
    invalid,
    required,
    name,
    form,
    id,
  });

  return (
    <NumberInputContext value={api}>
      <StyledRoot
        {...stateAttributes(api)}
        {...mergeProps<StyledRootProps>(api.rootProps, props)}
      />
    </NumberInputContext>
  );
}

const StyledLabel = withContext(renderable.label, "label");

function LabelPart(props: ComponentProps<typeof StyledLabel>) {
  const api = useNumberInputContext("Label");
  return (
    <StyledLabel
      {...stateAttributes(api)}
      data-required={dataAttr(api.state.required)}
      {...mergeProps<ComponentProps<typeof StyledLabel>>(api.labelProps, props)}
    />
  );
}

const StyledInput = withContext(renderable.input, "input");

function InputPart({ ref, ...props }: ComponentProps<typeof StyledInput>) {
  const api = useNumberInputContext("Input");
  const { ref: inputRef, ...inputProps } = api.inputProps;
  const composedRef = useComposedRefs(inputRef, ref);
  return (
    <StyledInput
      data-invalid={dataAttr(api.state.invalid)}
      data-disabled={dataAttr(api.state.disabled)}
      data-scrubbing={dataAttr(api.state.scrubbing)}
      {...mergeProps<ComponentProps<typeof StyledInput>>(inputProps, props)}
      ref={composedRef}
    />
  );
}

type TriggerProps = ComponentProps<typeof renderable.button>;

function IncrementTriggerImpl({ ref, ...props }: TriggerProps) {
  const { ref: triggerRef, ...triggerProps } =
    useNumberInputContext("Control").incrementTriggerProps;
  const composedRef = useComposedRefs(triggerRef, ref);
  return (
    <renderable.button
      {...mergeProps<TriggerProps>(triggerProps, props)}
      ref={composedRef}
    />
  );
}

function DecrementTriggerImpl({ ref, ...props }: TriggerProps) {
  const { ref: triggerRef, ...triggerProps } =
    useNumberInputContext("Control").decrementTriggerProps;
  const composedRef = useComposedRefs(triggerRef, ref);
  return (
    <renderable.button
      {...mergeProps<TriggerProps>(triggerProps, props)}
      ref={composedRef}
    />
  );
}

const DecrementTrigger = withContext(DecrementTriggerImpl, "decrementTrigger", {
  defaultProps: { children: <ChevronDownIcon /> },
});
const IncrementTrigger = withContext(IncrementTriggerImpl, "incrementTrigger", {
  defaultProps: { children: <ChevronUpIcon /> },
});

function ControlImpl(props: ComponentProps<typeof renderable.div>) {
  const api = useNumberInputContext("Control");
  return (
    <renderable.div
      {...stateAttributes(api)}
      {...mergeProps<ComponentProps<typeof renderable.div>>(api.controlProps, props)}
    />
  );
}

const Control = withContext(ControlImpl, "control", {
  defaultProps: {
    children: (
      <>
        <IncrementTrigger />
        <DecrementTrigger />
      </>
    ),
  },
});

function ScrubberImpl(props: ComponentProps<typeof renderable.div>) {
  const api = useNumberInputContext("Scrubber");
  return (
    <renderable.div
      data-disabled={dataAttr(api.state.disabled)}
      data-scrubbing={dataAttr(api.state.scrubbing)}
      {...mergeProps<ComponentProps<typeof renderable.div>>(api.scrubberProps, props)}
    />
  );
}

const Scrubber = withContext(ScrubberImpl, "scrubber");

export const NumberInput = {
  Root,
  Control,
  Input: InputPart,
  Label: LabelPart,
  Scrubber,
};
