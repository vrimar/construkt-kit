import type { ComponentProps } from "react";

import { styled } from "#styled-system/jsx";
import { spinner } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";

type BaseSpinnerProps = ComponentProps<typeof BaseSpinner>;
const BaseSpinner = styled(renderable.span, spinner);

export interface SpinnerProps extends Omit<BaseSpinnerProps, "variant"> {
  /**
   * `ring` spins; `dots` blinks three dots, for typing or drafting. Not responsive: it decides
   * the markup.
   * @default "ring"
   */
  variant?: "ring" | "dots" | undefined;
}

export const Spinner = ({ variant, children, ...props }: SpinnerProps) => (
  <BaseSpinner
    variant={variant}
    {...props}
  >
    {variant === "dots" ? (
      <>
        <span />
        <span />
        <span />
      </>
    ) : (
      children
    )}
  </BaseSpinner>
);
