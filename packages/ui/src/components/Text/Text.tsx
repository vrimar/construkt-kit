import { styled } from "@construct-kit/styled-system/jsx";
import { type TextVariantProps, text } from "@construct-kit/styled-system/recipes";
import type { StyledComponent } from "@construct-kit/styled-system/types";
import type { ComponentProps } from "react";

type Props = TextVariantProps & { as?: React.ElementType };

export type TextProps = ComponentProps<typeof Text>;
export const Text = styled("p", text) as StyledComponent<"p", Props>;
