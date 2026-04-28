import { styled } from "@construkt-kit/styled-system/jsx";
import { type HeadingVariantProps, heading } from "@construkt-kit/styled-system/recipes";
import type { StyledComponent } from "@construkt-kit/styled-system/types";
import type { ComponentProps } from "react";

type Props = HeadingVariantProps & { as?: React.ElementType };

export type HeadingProps = ComponentProps<typeof Heading>;
export const Heading = styled("h2", heading) as StyledComponent<"h2", Props>;
