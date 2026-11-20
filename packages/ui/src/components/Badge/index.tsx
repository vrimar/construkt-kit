import type { ComponentProps } from "react";

import { styled } from "#styled-system/jsx";
import { badge } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";

export type BadgeProps = ComponentProps<typeof Badge>;
export const Badge = styled(renderable.div, badge);
