import type { ComponentProps, ReactNode } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { switchRecipe } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import type { HiddenInputControlProps, WithRef } from "../../types";
import { type CheckableProps, type CheckedChangeDetails, useCheckable } from "../checkable";

export type { CheckedChangeDetails as SwitchCheckedChangeDetails };

const { withProvider, withContext } = createSlotRecipeContext(switchRecipe);

const Root = withProvider(renderable.label, "root");
const Label = withContext(renderable.span, "label");
const Thumb = withContext(renderable.span, "thumb");
const Control = withContext(renderable.span, "control");
const Indicator = withContext(renderable.span, "indicator");

type RootProps = ComponentProps<typeof Root>;

interface SwitchLabel {
  on: ReactNode;
  off: ReactNode;
}

export interface SwitchProps
  extends
    Omit<RootProps, "ref" | keyof CheckableProps>,
    CheckableProps<boolean>,
    HiddenInputControlProps {
  trackLabel?: SwitchLabel;
  thumbLabel?: SwitchLabel;
}

export const Switch = ({
  ref,
  inputProps,
  children,
  rootRef,
  trackLabel,
  thumbLabel,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  readOnly,
  invalid,
  required,
  name,
  value,
  form,
  id,
  ...rest
}: WithRef<SwitchProps, HTMLInputElement>) => {
  const {
    state,
    stateAttributes,
    rootProps,
    inputProps: checkableInputProps,
  } = useCheckable(
    {
      checked,
      defaultChecked,
      onCheckedChange:
        onCheckedChange && ((next, details) => onCheckedChange(next === true, details)),
      disabled,
      readOnly,
      invalid,
      required,
      name,
      value,
      form,
      id,
    },
    { focusOnPress: true },
  );
  const inputRef = useComposedRefs(checkableInputProps.ref, ref);
  const pick = (label: SwitchLabel) => (state.checked ? label.on : label.off);

  return (
    <Root
      ref={rootRef}
      {...stateAttributes}
      {...mergeProps<RootProps>(rootProps, rest)}
    >
      <renderable.input
        {...mergeProps<ComponentProps<typeof renderable.input>>(checkableInputProps, inputProps)}
        ref={inputRef}
      />
      <Control
        aria-hidden
        {...stateAttributes}
      >
        <Thumb
          aria-hidden
          {...stateAttributes}
        >
          {thumbLabel && pick(thumbLabel)}
        </Thumb>
        {trackLabel && <Indicator {...stateAttributes}>{pick(trackLabel)}</Indicator>}
      </Control>
      {children != null && <Label {...stateAttributes}>{children}</Label>}
    </Root>
  );
};
