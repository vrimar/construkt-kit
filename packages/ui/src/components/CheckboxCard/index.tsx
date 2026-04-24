import { ark } from "@ark-ui/react/factory";
import * as React from "react";
import { createStyleContext } from "@b3/styled-system/jsx";
import { checkboxCard } from "@b3/styled-system/recipes";

import type { WithRef } from "../../types";
import * as ArkCheckbox from "../Checkbox";

const { withProvider, withContext } = createStyleContext(checkboxCard);

const CardRoot = withProvider(ark.label, "root");
const CardControl = withContext(ark.div, "control");
const CardContent = withContext(ark.div, "content");
const CardLabel = withContext(ark.span, "label");
const CardDescription = withContext(ark.span, "description");
const CardAddon = withContext(ark.div, "addon");

type CardRootProps = React.ComponentProps<typeof CardRoot>;

export interface CheckboxCardProps extends Omit<CardRootProps, "onChange" | "defaultChecked"> {
  icon?: React.ReactElement;
  label?: React.ReactNode;
  description?: React.ReactNode;
  addon?: React.ReactNode;
  indicator?: React.ReactNode | null;
  indicatorPlacement?: "start" | "end" | "inside";
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  checked?: ArkCheckbox.RootProps["checked"];
  defaultChecked?: ArkCheckbox.RootProps["defaultChecked"];
  onCheckedChange?: ArkCheckbox.RootProps["onCheckedChange"];
  value?: string;
  name?: string;
  disabled?: boolean;
}

export const CheckboxCard = ({
  ref,
  inputProps,
  label,
  description,
  icon,
  addon,
  indicator = <ArkCheckbox.Indicator />,
  indicatorPlacement = "end",
  checked,
  defaultChecked,
  onCheckedChange,
  value,
  name,
  disabled,
  ...rest
}: WithRef<CheckboxCardProps, HTMLInputElement>) => {
  const hasContent = label || description || icon;

  return (
    <ArkCheckbox.Root
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange}
      value={value}
      name={name}
      disabled={disabled}
      asChild
    >
      <CardRoot {...rest}>
        <ArkCheckbox.HiddenInput
          ref={ref}
          {...inputProps}
        />
        <CardControl>
          {indicatorPlacement === "start" && indicator && (
            <ArkCheckbox.Control>{indicator}</ArkCheckbox.Control>
          )}
          {hasContent && (
            <CardContent>
              {icon}
              {label && <CardLabel>{label}</CardLabel>}
              {description && <CardDescription>{description}</CardDescription>}
              {indicatorPlacement === "inside" && indicator && (
                <ArkCheckbox.Control>{indicator}</ArkCheckbox.Control>
              )}
            </CardContent>
          )}
          {indicatorPlacement === "end" && indicator && (
            <ArkCheckbox.Control>{indicator}</ArkCheckbox.Control>
          )}
        </CardControl>
        {addon && <CardAddon>{addon}</CardAddon>}
      </CardRoot>
    </ArkCheckbox.Root>
  );
};

export const CheckboxCardIndicator = ArkCheckbox.Indicator;
