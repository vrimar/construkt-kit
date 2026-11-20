import type { ComponentProps } from "react";

import { styled } from "#styled-system/jsx";
import { group } from "#styled-system/recipes";

import { renderable } from "../../primitives/render";

export type GroupProps = ComponentProps<typeof Group>;
export const Group = styled(renderable.div, group);
