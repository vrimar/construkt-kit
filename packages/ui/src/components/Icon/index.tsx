import type { ComponentProps, ReactElement } from "react";

import { styled } from "#styled-system/jsx";
import { icon } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";

const StyledIcon = styled(renderable.svg, icon);

export type IconProps = Omit<ComponentProps<typeof StyledIcon>, "render" | "children"> & {
  children?: ReactElement;
};

export function Icon({ children, ...props }: IconProps) {
  return (
    <StyledIcon
      {...props}
      render={children}
    />
  );
}
