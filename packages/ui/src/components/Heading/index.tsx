import type { ComponentProps } from "react";

import { styled } from "#styled-system/jsx";
import { heading } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";

export type HeadingProps = ComponentProps<typeof Heading>;
export const Heading = styled(renderable.h2, heading);
