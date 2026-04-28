import { ark } from "@ark-ui/react/factory";
import { styled } from "@construkt-kit/styled-system/jsx";
import { icon } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

export type IconProps = ComponentProps<typeof Icon>;
export const Icon = styled(ark.svg, icon, {
  defaultProps: { asChild: true },
});
