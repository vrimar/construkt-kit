import type { ComponentProps } from "react";
import { styled } from "@b3/styled-system/jsx";
import { type HeadingVariantProps, heading } from "@b3/styled-system/recipes";
import type { StyledComponent } from "@b3/styled-system/types";

type Props = HeadingVariantProps & { as?: React.ElementType };

export type HeadingProps = ComponentProps<typeof Heading>;
export const Heading = styled("h2", heading) as StyledComponent<"h2", Props>;
