import { Checkbox as ArkCheckbox } from "@ark-ui/react/checkbox";
import { ark } from "@ark-ui/react/factory";
import { createStyleContext } from "@construkt-kit/styled-system/jsx";
import { checkboxCard } from "@construkt-kit/styled-system/recipes";
import * as React from "react";

import type { WithRef } from "../../types";
import { Checkbox } from "../Checkbox";

const { withProvider, withContext } = createStyleContext(checkboxCard);

const CardRoot = withProvider(ArkCheckbox.Root, "root");
const CardControl = withContext(ark.div, "control");
const CardCheckbox = withContext(ArkCheckbox.Control, "checkbox");
const CardContent = withContext(ark.div, "content");
const CardLabel = withContext(ark.span, "label");
const CardDescription = withContext(ark.span, "description");
const CardAddon = withContext(ark.div, "addon");

type CardRootProps = React.ComponentProps<typeof CardRoot>;

export interface CheckboxCardProps extends Omit<CardRootProps, "ref"> {
  icon?: React.ReactElement;
  label?: React.ReactNode;
  description?: React.ReactNode;
  addon?: React.ReactNode;
  indicator?: React.ReactNode | null;
  indicatorPlacement?: "start" | "end" | "inside";
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export const CheckboxCard = ({
  ref,
  inputProps,
  label,
  description,
  icon,
  addon,
  indicator = <Checkbox.Indicator />,
  indicatorPlacement = "end",
  ...rest
}: WithRef<CheckboxCardProps, HTMLInputElement>) => {
  const hasContent = label || description || icon;

  return (
    <CardRoot {...rest}>
      <ArkCheckbox.HiddenInput
        ref={ref}
        {...inputProps}
      />
      <CardControl>
        {indicatorPlacement === "start" && indicator && <CardCheckbox>{indicator}</CardCheckbox>}
        {hasContent && (
          <CardContent>
            {icon}
            {label && <CardLabel>{label}</CardLabel>}
            {description && <CardDescription>{description}</CardDescription>}
            {indicatorPlacement === "inside" && indicator && (
              <CardCheckbox>{indicator}</CardCheckbox>
            )}
          </CardContent>
        )}
        {indicatorPlacement === "end" && indicator && <CardCheckbox>{indicator}</CardCheckbox>}
      </CardControl>
      {addon && <CardAddon>{addon}</CardAddon>}
    </CardRoot>
  );
};

export const CheckboxCardIndicator = Checkbox.Indicator;
