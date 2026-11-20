import type { ComponentProps } from "react";

import { styled } from "#styled-system/jsx";
import { link } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";

export type LinkProps = ComponentProps<typeof Link>;
export const Link = styled(renderable.a, link);
