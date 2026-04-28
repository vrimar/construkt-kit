import { styled } from "@construkt-kit/styled-system/jsx";
import { type TextVariantProps, text } from "@construkt-kit/styled-system/recipes";
import type { StyledComponent } from "@construkt-kit/styled-system/types";
import type { ComponentProps } from "react";

type Props = TextVariantProps & { as?: React.ElementType };

export type TextProps = ComponentProps<typeof Text>;
export const Text = styled("p", text) as StyledComponent<"p", Props>;
