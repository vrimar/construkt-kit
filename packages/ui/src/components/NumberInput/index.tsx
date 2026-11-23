import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { type ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { numberInput } from "#styled-system/recipes";

import { splitOptions } from "../../foundations/props";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useReportRendered } from "../../hooks/useRenderedParts";
import { useFieldControlId } from "../../primitives/field";
import { dataAttr, mergeProps, renderable } from "../../primitives/render";
import { createPartContext } from "../partContext";
import {
  NUMBER_INPUT_OPTION_KEYS,
  type NumberInputApi,
  type NumberInputOptions,
  useNumberInput,
} from "./useNumberInput";
export type {
  NumberInputFocusDetails,
  NumberInputInvalidDetails,
  NumberInputTranslations,
  NumberInputValueChangeDetails,
  NumberInputValueChangeReason,
  NumberInputValueDetails,
} from "./useNumberInput";

const { withProvider, withContext } = createSlotRecipeContext(numberInput);

const [NumberInputContext, useNumberInputContext] =
  createPartContext<NumberInputApi>("<NumberInput.Root>");

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

function Root(rootProps: NumberInputRootProps) {
  const [options, props] = splitOptions(rootProps, NUMBER_INPUT_OPTION_KEYS);
  const api = useNumberInput(options);

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
  const api = useNumberInputContext("NumberInput.Label");
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
  const api = useNumberInputContext("NumberInput.Input");
  const { ref: inputRef, ...inputProps } = api.inputProps;
  const composedRef = useComposedRefs(inputRef, ref);
  const id = useReportRendered(
    api.reportRendered,
    "input",
    useFieldControlId(props.id) ?? inputProps.id,
  );
  return (
    <StyledInput
      data-invalid={dataAttr(api.state.invalid)}
      data-disabled={dataAttr(api.state.disabled)}
      data-scrubbing={dataAttr(api.state.scrubbing)}
      {...mergeProps<ComponentProps<typeof StyledInput>>(inputProps, props, { id })}
      ref={composedRef}
    />
  );
}

type TriggerProps = ComponentProps<typeof renderable.button>;

const createTrigger = (hint: "increment" | "decrement") =>
  function TriggerImpl({ ref, ...props }: TriggerProps) {
    const api = useNumberInputContext("NumberInput.Control");
    const { ref: triggerRef, ...triggerProps } =
      hint === "increment" ? api.incrementTriggerProps : api.decrementTriggerProps;
    const composedRef = useComposedRefs(triggerRef, ref);
    return (
      <renderable.button
        data-disabled={dataAttr(triggerProps.disabled)}
        data-scrubbing={dataAttr(api.state.scrubbing)}
        {...mergeProps<TriggerProps>(
          { ...triggerProps, type: props.render ? undefined : "button" },
          props,
        )}
        ref={composedRef}
      />
    );
  };

const DecrementTrigger = withContext(createTrigger("decrement"), "decrementTrigger", {
  defaultProps: { children: <ChevronDownIcon /> },
});
const IncrementTrigger = withContext(createTrigger("increment"), "incrementTrigger", {
  defaultProps: { children: <ChevronUpIcon /> },
});

function ControlImpl(props: ComponentProps<typeof renderable.div>) {
  const api = useNumberInputContext("NumberInput.Control");
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
  const api = useNumberInputContext("NumberInput.Scrubber");
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
