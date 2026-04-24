import type { ComponentProps } from "react";
import { styled } from "@b3/styled-system/jsx";
import { type TextVariantProps, text } from "@b3/styled-system/recipes";
import type { StyledComponent } from "@b3/styled-system/types";

type Props = TextVariantProps & { as?: React.ElementType };

export type TextProps = ComponentProps<typeof Text>;
export const Text = styled("p", text) as StyledComponent<"p", Props>;
