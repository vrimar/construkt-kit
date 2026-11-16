import type { ReactNode } from "react";

import { cx } from "#styled-system/css";
import { splitButton } from "#styled-system/recipes";

import { isAriaExpanded } from "../../foundations/dom";
import type { WithRef } from "../../types";
import { wrapAsChildContent } from "../asChildContent";
import { Button, ButtonGroup, type ButtonGroupProps, type ButtonProps } from "./Button";
import { useButtonPropsContext } from "./buttonPropsContext";
import { TruncatedLabel } from "./TruncatedLabel";

export type SplitButtonRootProps = Omit<ButtonGroupProps, "attached" | "orientation" | "grow">;

function SplitButtonRoot({ className, ...props }: WithRef<SplitButtonRootProps>) {
  const inherited = useButtonPropsContext();
  const variant = props.variant ?? inherited?.variant;
  return (
    <ButtonGroup
      attached
      className={cx(splitButton({ variant }), className)}
      {...props}
    />
  );
}

export type SplitButtonActionProps = ButtonProps;

function SplitButtonAction({
  ref,
  children,
  ...props
}: WithRef<SplitButtonActionProps, HTMLButtonElement>) {
  const expanded = isAriaExpanded(props["aria-expanded"]);
  const label = (content: ReactNode) => (
    <TruncatedLabel expanded={expanded}>{content}</TruncatedLabel>
  );

  return (
    <Button
      ref={ref}
      flex="1 1 auto"
      minW="0"
      {...props}
    >
      {props.asChild ? wrapAsChildContent(children, label) : label(children)}
    </Button>
  );
}

/**
 * A main action joined to parts that share its variant, size and colorPalette, such as a
 * `Menu.Trigger asChild` around an `IconButton`. The action's label shows in full on hover when cut off.
 */
export const SplitButton = {
  Root: SplitButtonRoot,
  Action: SplitButtonAction,
};
