import type { ComponentProps } from "react";

import { styled } from "#styled-system/jsx";
import { text } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";

export type TextProps = ComponentProps<typeof Text>;
export const Text = styled(renderable.p, text);
