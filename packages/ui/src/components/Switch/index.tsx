import type { ComponentProps, ReactNode } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { switchRecipe } from "#styled-system/recipes";

import { mergeProps, renderable } from "../../primitives/render";
import type { HiddenInputControlProps, WithRef } from "../../types";
import {
  type CheckableProps,
  type CheckedChangeDetails,
  CheckableContext,
  CheckableHiddenInput,
  splitCheckableProps,
  useCheckable,
} from "../checkable";

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
  ...props
}: WithRef<SwitchProps, HTMLInputElement>) => {
  const [{ onCheckedChange, ...checkableProps }, rest] = splitCheckableProps(props);
  const checkable = useCheckable({
    ...checkableProps,
    onCheckedChange:
      onCheckedChange && ((next, details) => onCheckedChange(next === true, details)),
  });
  const { state, stateAttributes, rootProps } = checkable;
  const pick = (label: SwitchLabel) => (state.checked ? label.on : label.off);

  return (
    <CheckableContext value={checkable}>
      <Root
        ref={rootRef}
        {...stateAttributes}
        {...mergeProps<RootProps>(rootProps, rest)}
      >
        <CheckableHiddenInput
          ref={ref}
          {...inputProps}
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
    </CheckableContext>
  );
};
