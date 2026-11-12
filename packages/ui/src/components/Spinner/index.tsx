import { ark } from "@ark-ui/react/factory";
import type { ComponentProps } from "react";

import { styled } from "#styled-system/jsx";
import { spinner } from "#styled-system/recipes";

type BaseSpinnerProps = ComponentProps<typeof BaseSpinner>;
const BaseSpinner = styled(ark.span, spinner);

export interface SpinnerProps extends Omit<BaseSpinnerProps, "variant"> {
  /**
   * `ring` spins; `dots` blinks three dots, for typing or drafting. Not responsive: it decides
   * the markup.
   * @default "ring"
   */
  variant?: "ring" | "dots" | undefined;
}

export const Spinner = ({ variant, children, ...props }: SpinnerProps) =>
  variant === "dots" ? (
    <BaseSpinner
      variant="dots"
      {...props}
    >
      <span />
      <span />
      <span />
    </BaseSpinner>
  ) : (
    <BaseSpinner
      variant={variant}
      {...props}
    >
      {children}
    </BaseSpinner>
  );
